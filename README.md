# FundChain — Decentralized Crowdfunding DApp

> A trustless crowdfunding application built on Ethereum.  
> Smart contracts enforce all rules — no middleman needed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity ^0.8.17 |
| Local Blockchain | Ganache |
| Frontend | Vue.js 3 (Composition API) |
| Styling | Tailwind CSS v3 |
| Blockchain Interaction | Web3.js |
| Wallet | MetaMask |

---

## Features

- Donate ETH to a live campaign
- Real-time progress bar and stats (raised, goal, donors, time left)
- Auto fund release when goal is reached
- Auto refund when campaign deadline passes without reaching goal
- MetaMask wallet integration with account detection
- Owner-only withdraw panel
- Toast notification system (pending / success / error)
- Fully responsive mobile-first design

---

## Project Structure

```
src/
├── App.vue                    # Root component, all Web3 logic
├── components/
│   ├── NavBar.vue             # Logo + wallet connect button
│   ├── CampaignCard.vue       # Hero, progress bar, stats grid
│   ├── DonateSection.vue      # ETH input + donate button
│   ├── OwnerSection.vue       # Withdraw panel (owner only)
│   ├── RefundSection.vue      # Refund panel (ended + goal not reached)
│   └── ToastNotification.vue  # Slide-in toast queue
├── web3.js                    # Web3 helpers, ABI, contract address
├── main.js
└── style.css
contracts/
└── Crowdfunding.sol           # Solidity smart contract
```

---

## Run Locally

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- [Ganache](https://trufflesuite.com/ganache/) (GUI or CLI)
- [MetaMask](https://metamask.io) browser extension
- [Remix IDE](https://remix.ethereum.org) (for contract deployment)

### 1. Clone and install

```bash
git clone https://github.com/Abdelkrim7Be/crowdfunding-dapp.git
cd crowdfunding-dapp
npm install
```

### 2. Start Ganache

Open Ganache GUI and create a new workspace. Note the RPC endpoint (default: `http://127.0.0.1:7545`).

### 3. Deploy the contract via Remix

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create a new file, paste `contracts/Crowdfunding.sol`
3. Compile with Solidity `^0.8.17`
4. In **Deploy & Run Transactions**, select **Injected Provider - MetaMask**
5. Connect MetaMask to your Ganache network (add custom RPC)
6. Deploy with constructor args: title, description, goal (in ETH), duration (in days)
7. Copy the deployed **contract address**
8. Copy the **ABI** from the Remix compilation output

### 4. Configure the frontend

Open `src/web3.js` and replace the placeholders:

```js
export const CONTRACT_ADDRESS = '0xYourDeployedContractAddress'

export const CONTRACT_ABI = [
  // paste the full ABI array from Remix here
]
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), connect MetaMask, and interact with the DApp.

---

## MetaMask Setup for Ganache

1. Open MetaMask → **Add Network → Add a network manually**
2. Network Name: `Ganache`
3. RPC URL: `http://127.0.0.1:7545`
4. Chain ID: `1337`
5. Currency Symbol: `ETH`
6. Import a Ganache account using its private key

---

## Smart Contract Overview

| Function | Access | Description |
|---|---|---|
| `donate()` | Anyone | Send ETH while campaign is active |
| `withdraw()` | Owner only | Withdraw funds after goal reached + deadline passed |
| `refund()` | Donors | Claim refund if goal not reached after deadline |
| `getCampaignInfo()` | Public | Returns title, description, goal, raised, timeLeft, goalReached |
| `getDonorsCount()` | Public | Returns total number of unique donors |

---

## Git Branch Strategy

```
main          ← stable releases only
develop       ← integration branch
feature/*     ← one branch per feature
```

---

## License

MIT
