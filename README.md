# AutoPay Agent 🤖

An AI-powered payment agent that understands natural language and executes stablecoin transfers autonomously on Tempo blockchain.

## Demo

| Command | Result |
|---------|--------|
| `What is my balance?` | Shows AlphaUSD balance |
| `Send 10 AlphaUSD to 0x...` | Instant transfer |
| `Schedule 3 payments of 5 AlphaUSD to 0x...` | Automated recurring payments |

## How it works

1. User types a natural language command
2. GPT-4o-mini parses the intent and extracts payment details
3. Agent executes the transaction on Tempo testnet
4. Transaction hash returned as confirmation

## Tech Stack
- **Tempo Blockchain** — payments-optimized L1 (Chain ID: 42431)
- **ethers.js** — blockchain interaction
- **OpenAI GPT-4o-mini** — natural language understanding
- **Node.js** — backend server

## Setup
1. Clone the repo
2. `npm install`
3. Create `.env` with `PRIVATE_KEY`, `WALLET_ADDRESS`, `OPENAI_API_KEY`
4. `node server.js`
5. Open `http://localhost:3000`

## Built at
Tempo x Stripe Hackathon — March 19, 2026
