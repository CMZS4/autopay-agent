const { ethers } = require("ethers");

const RPC_URL = "https://rpc.moderato.tempo.xyz";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  const address = "0x5939a7810298a18F58a517151FB265E239DE63cA";
  
  const balance = await provider.getBalance(address);
  console.log("Bakiye:", ethers.formatEther(balance), "ETH");
  
  const network = await provider.getNetwork();
  console.log("Network:", network.name, "| Chain ID:", network.chainId.toString());
}

main();