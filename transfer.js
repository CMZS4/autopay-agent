require("dotenv").config();
const { ethers } = require("ethers");

const RPC_URL = "https://rpc.moderato.tempo.xyz";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// AlphaUSD contract adresi
const ALPHA_USD_ADDRESS = "0x20c0000000000000000000000000000000000001";

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function sendPayment(toAddress, amount) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const token = new ethers.Contract(ALPHA_USD_ADDRESS, ERC20_ABI, wallet);

  const decimals = await token.decimals();
  const balance = await token.balanceOf(wallet.address);
  
  console.log("Gönderen:", wallet.address);
  console.log("Bakiye:", ethers.formatUnits(balance, decimals), "AlphaUSD");
  console.log("Gönderiliyor:", amount, "AlphaUSD →", toAddress);

  const tx = await token.transfer(toAddress, ethers.parseUnits(amount, decimals));
  console.log("Transaction hash:", tx.hash);
  await tx.wait();
  console.log("✅ Transfer tamamlandı!");
}

// Test: kendine 1 AlphaUSD gönder
sendPayment(process.env.WALLET_ADDRESS, "1");