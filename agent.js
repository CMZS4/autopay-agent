require("dotenv").config();
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
  "action": "send" or "balance",
  "to": "wallet address or null",
  "amount": "number as string or null"
}`
    }]
  });

  const text = response.choices[0].message.content.trim();
  return JSON.parse(text);
}

async function executeCommand(userInput) {
  console.log("\n🤖 Komut:", userInput);
  
  const parsed = await parseCommand(userInput);
  console.log("📋 Anlaşıldı:", parsed);

  if (parsed.action === "balance") {
    const balance = await token.balanceOf(wallet.address);
    const decimals = await token.decimals();
    console.log("💰 Bakiye:", ethers.formatUnits(balance, decimals), "AlphaUSD");
  } 
  else if (parsed.action === "send" && parsed.to && parsed.amount) {
    const decimals = await token.decimals();
    console.log(`📤 Gönderiliyor: ${parsed.amount} AlphaUSD → ${parsed.to}`);
    const tx = await token.transfer(parsed.to, ethers.parseUnits(parsed.amount, decimals));
    console.log("🔗 Hash:", tx.hash);
    await tx.wait();
    console.log("✅ Transfer tamamlandı!");
  }
  else {
    console.log("❓ Komut anlaşılamadı");
  }
}

async function main() {
  await executeCommand("What is my balance?");
  await executeCommand("Send 5 AlphaUSD to 0x5939a7810298a18F58a517151FB265E239DE63cA");
}

main();