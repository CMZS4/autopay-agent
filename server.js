require("dotenv").config();
const http = require("http");
const fs = require("fs");
const OpenAI = require("openai");
const { ethers } = require("ethers");

const RPC_URL = "https://rpc.moderato.tempo.xyz";
const ALPHA_USD_ADDRESS = "0x20c0000000000000000000000000000000000001";
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const token = new ethers.Contract(ALPHA_USD_ADDRESS, ERC20_ABI, wallet);

async function parseCommand(userInput) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: `Extract payment details from this command and respond ONLY with JSON, nothing else.
Command: "${userInput}"
Respond with this exact format:
{
  "action": "send" or "balance" or "schedule",
  "to": "wallet address or null",
  "amount": "number as string or null",
  "interval": "daily" or "hourly" or null,
  "times": "number of times as string or null"
}`
    }]
  });
  return JSON.parse(response.choices[0].message.content.trim());
}

async function executeCommand(userInput) {
  const parsed = await parseCommand(userInput);

  if (parsed.action === "balance") {
    const balance = await token.balanceOf(wallet.address);
    const decimals = await token.decimals();
    const formatted = ethers.formatUnits(balance, decimals);
    return { message: `💰 Balance: ${formatted} AlphaUSD` };
  }
  else if (parsed.action === "send" && parsed.to && parsed.amount) {
    const decimals = await token.decimals();
    const tx = await token.transfer(parsed.to, ethers.parseUnits(parsed.amount, decimals));
    await tx.wait();
    return { message: `✅ Sent ${parsed.amount} AlphaUSD!<br>🔗 Hash: ${tx.hash.slice(0,20)}...` };
  }
  else if (parsed.action === "schedule" && parsed.to && parsed.amount) {
    const times = parseInt(parsed.times) || 3;
    const intervalMs = 10000; // demo için 10 saniye
    let count = 0;

    const interval = setInterval(async () => {
      if (count >= times) {
        clearInterval(interval);
        return;
      }
      count++;
      const decimals = await token.decimals();
      const tx = await token.transfer(parsed.to, ethers.parseUnits(parsed.amount, decimals));
      await tx.wait();
      console.log(`✅ Scheduled payment ${count}/${times} - Hash: ${tx.hash}`);
    }, intervalMs);

    return { message: `⏰ Scheduled! ${parsed.amount} AlphaUSD × ${times} times<br>📤 Sending to ${parsed.to.slice(0,10)}...<br>⏱ Every 10 seconds` };
  }
  else {
    return { error: "Could not understand command" };
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(fs.readFileSync("index.html"));
  }
  else if (req.method === "POST" && req.url === "/command") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const { command } = JSON.parse(body);
        const result = await executeCommand(command);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch(e) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  }
});

server.listen(3000, () => {
  console.log("🚀 AutoPay Agent running on http://localhost:3000");
});