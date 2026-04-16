# FundChain — Decentralized Crowdfunding DApp

> A trustless, permissionless crowdfunding platform built on Ethereum.  
> Smart contracts handle all financial logic — no backend, no middleman, no intermediaries.

This project is a **Proof of Concept (POC)** for learning and demonstrating how decentralized applications (DApps) work end-to-end: from writing a Solidity smart contract, deploying it to a local blockchain (Ganache), all the way to connecting a Vue 3 frontend with MetaMask and Web3.js.

---

## Table of Contents

- [What This POC Demonstrates](#what-this-poc-demonstrates)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Smart Contract Design](#smart-contract-design)
- [Frontend Features](#frontend-features)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Run Locally](#run-locally)
- [MetaMask Setup for Ganache](#metamask-setup-for-ganache)
- [Deployment (Static Frontend)](#deployment-static-frontend)
- [Smart Contract Reference](#smart-contract-reference)
- [Git Branch Strategy](#git-branch-strategy)
- [What I Would Add in Production](#what-i-would-add-in-production)
- [License](#license)

---

## What This POC Demonstrates

This project was built to explore the full DApp development lifecycle:

1. **Writing a Solidity smart contract** — enforcing crowdfunding logic (deadlines, goal tracking, refunds) purely on-chain
2. **Local blockchain development** — deploying and testing contracts with Ganache + Remix IDE without spending real ETH
3. **Web3.js integration** — connecting a browser frontend to Ethereum via MetaMask's injected provider
4. **Role-based UX** — the app detects whether the connected wallet is the campaign owner or a donor and renders the appropriate UI
5. **Multi-campaign registry** — managing multiple deployed contracts from one frontend using `localStorage` as a lightweight registry
6. **On-chain transaction lifecycle** — handling the full flow: pending → confirmed → error, with real MetaMask popups

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Smart Contract | Solidity `^0.8.17` | On-chain business logic |
| Local Blockchain | Ganache | Local Ethereum testnet |
| Contract Deployment | Remix IDE | Compile, deploy, and inspect the contract |
| Frontend Framework | Vue 3 (Composition API) | Reactive UI |
| Styling | Tailwind CSS v3 | Utility-first dark-theme UI |
| Blockchain Client | Web3.js v4 | ABI calls, transaction sending, event reading |
| Wallet | MetaMask | Key management + transaction signing |
| Build Tool | Vite | Fast dev server + production bundler |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│                                                                  │
│   ┌──────────────────────────┐   ┌────────────────────────────┐  │
│   │   Vue 3 Frontend         │   │       MetaMask             │  │
│   │  (Vite + Tailwind CSS)   │◄──┤  (Injected Provider)       │  │
│   │                          │   │  Signs transactions        │  │
│   │  - Campaign view         │   │  Manages private keys      │  │
│   │  - Owner dashboard       │   └────────────┬───────────────┘  │
│   │  - Donor/Refund panels   │                │                  │
│   │  - Toast notifications   │                │ window.ethereum  │
│   └──────────┬───────────────┘                │                  │
│              │ Web3.js ABI calls               │                  │
└──────────────┼─────────────────────────────────┼──────────────────┘
               │                                 │
               ▼                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Ganache (Local Ethereum Node)                  │
│                    RPC: http://127.0.0.1:7545                     │
│                    Chain ID: 1337                                 │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │               Crowdfunding.sol (Deployed)                │   │
│   │                                                          │   │
│   │  - donate()      → payable, enforces deadline            │   │
│   │  - withdraw()    → owner-only, enforces goal + deadline  │   │
│   │  - refund()      → donor claim if goal not reached       │   │
│   │  - getCampaignInfo() → read-only state snapshot          │   │
│   └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

There is **no backend server**. The smart contract is the backend. The frontend reads and writes state directly to the Ethereum node via MetaMask and Web3.js.

---

## Smart Contract Design

The `Crowdfunding.sol` contract implements a single-campaign crowdfunding lifecycle:

### State Machine

```
Deployed → Active (accepting donations) → Ended
                                             ├── Goal reached → Owner can withdraw
                                             └── Goal not reached → Donors can refund
```

### Key Design Decisions

- **Goal in ETH, not USD** — avoids price oracle complexity for a POC
- **Deadline is block timestamp-based** — `block.timestamp + (_durationDays * 1 days)` set at deploy time
- **Refund pull pattern** — donors call `refund()` themselves; the contract does not push ETH automatically. This prevents reentrancy and gas griefing
- **`fundsWithdrawn` flag** — prevents double-withdrawal even if the owner calls `withdraw()` multiple times
- **Donor deduplication** — the `donations` mapping tracks cumulative donations per address; the `donors` array only adds each address once

### Events Emitted

| Event | When |
|---|---|
| `DonationReceived(donor, amount)` | Every successful `donate()` call |
| `GoalReached(totalRaised)` | First time `totalRaised >= goalAmount` |
| `FundsWithdrawn(owner, amount)` | On successful `withdraw()` |
| `RefundIssued(donor, amount)` | On successful `refund()` |

---

## Frontend Features

### Donor Flow
- Connect MetaMask wallet with one click
- View campaign title, description, goal, total raised, number of donors, and countdown timer
- Input any ETH amount and submit a `donate()` transaction
- See real-time progress bar update after confirmation
- If campaign ended without reaching goal: claim a refund via `refund()`

### Owner Flow
- Automatically detected when the connected wallet matches the contract's `owner` address
- Dedicated **Owner Dashboard** showing aggregate stats across all managed campaigns
- **+ New Campaign** button — paste any deployed contract address to add it to the registry
- Withdraw funds button appears only when: campaign is ended AND goal was reached AND funds haven't been withdrawn yet

### Multi-Campaign Registry
- All campaign contract addresses are stored in `localStorage` (`fundchain_campaigns`)
- Campaigns are listed with live status badges: `Active`, `Funded`, `Ended`
- Switching between campaigns re-instantiates the Web3 contract instance without a page reload

### UX Details
- **Role badge** in the navbar: `Owner` or `Donor` depending on connected wallet
- **Toast notification queue**: pending (spinner) → success / error — toasts are updated in-place when a transaction confirms
- **MetaMask guard**: detects if MetaMask is not installed and shows an install prompt
- **Chain change listener**: reloads the page automatically on network switch to prevent stale contract state
- **Account change listener**: re-fetches campaign data and updates role badge when the active MetaMask account changes
- **Duplicate connection guard**: prevents multiple MetaMask popups being triggered at once

---

## Screenshots

### Campaign View — Donor Mode
![Campaign view - donor](Assets/Screenshot%20from%202026-04-15%2002-29-02.png)

### All Campaigns — Donor List View
![Campaigns list - donor](Assets/Screenshot%20from%202026-04-15%2002-29-12.png)

### Owner Dashboard
![Owner dashboard](Assets/Screenshot%20from%202026-04-15%2002-29-38.png)

### Add New Campaign Modal
![Add campaign modal](Assets/Screenshot%20from%202026-04-15%2002-29-52.png)

### MetaMask Transaction Confirmation (Donate)
![MetaMask donate popup](Assets/Screenshot%20from%202026-04-15%2002-30-30.png)

### Donation Successful Toast
![Donation success toast](Assets/Screenshot%20from%202026-04-15%2002-30-38.png)

---

## Project Structure

```
crowdfunding-dapp/
├── contracts/
│   └── Crowdfunding.sol            # Solidity smart contract
│
├── src/
│   ├── App.vue                     # Root component — Web3 init, transaction handlers, routing
│   ├── main.js                     # Vue app bootstrap
│   ├── style.css                   # Global styles + Tailwind base
│   ├── web3.js                     # Web3 helpers, ABI, contract address, utility functions
│   │
│   ├── components/
│   │   ├── NavBar.vue              # Logo, nav links, wallet connect button, role badge
│   │   ├── CampaignCard.vue        # Hero section + stats grid (goal, raised, donors, time)
│   │   ├── CampaignCardPreview.vue # Compact card used in the campaigns list
│   │   ├── CampaignList.vue        # Filterable campaign grid (donor view)
│   │   ├── OwnerDashboard.vue      # Owner stats + managed campaigns grid
│   │   ├── DonateSection.vue       # ETH amount input + Donate button
│   │   ├── OwnerSection.vue        # Withdraw panel (owner only)
│   │   ├── RefundSection.vue       # Refund panel (expired + goal not met)
│   │   ├── AddCampaignModal.vue    # Modal to register a new contract address
│   │   ├── DemoGuide.vue           # Floating help button with usage instructions
│   │   └── ToastNotification.vue  # Slide-in toast queue with update-in-place support
│   │
│   └── composables/
│       └── useCampaigns.js         # Campaign registry CRUD + localStorage persistence
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── Assets/                         # App screenshots
├── dist/                           # Production build output (generated by `npm run build`)
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Run Locally

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- [Ganache](https://trufflesuite.com/ganache/) (GUI or CLI)
- [MetaMask](https://metamask.io) browser extension
- [Remix IDE](https://remix.ethereum.org) (browser-based, no install needed)

### 1. Clone and install

```bash
git clone https://github.com/Abdelkrim7Be/crowdfunding-dapp.git
cd crowdfunding-dapp
npm install
```

### 2. Start Ganache

Open Ganache and create a **New Workspace** (Ethereum). The default RPC server runs at `http://127.0.0.1:7545` with Chain ID `1337`. Keep it running.

### 3. Deploy the contract via Remix IDE

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create a new file under `contracts/` and paste the contents of `contracts/Crowdfunding.sol`
3. Go to the **Solidity Compiler** tab → select `0.8.17` → click **Compile**
4. Go to the **Deploy & Run Transactions** tab
5. Change **Environment** to `Injected Provider - MetaMask`
6. Make sure MetaMask is connected to Ganache (see MetaMask setup below)
7. Fill in the constructor arguments:
   - `_title`: e.g. `"My First Campaign"`
   - `_description`: e.g. `"Raising ETH for my project"`
   - `_goalAmount`: e.g. `5` (in whole ETH)
   - `_durationDays`: e.g. `7`
8. Click **Deploy** and confirm in MetaMask
9. Copy the deployed **contract address** from the Deployed Contracts panel

### 4. Configure the frontend

Open `src/web3.js` and update the contract address:

```js
export const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
```

The ABI in `web3.js` is already pre-populated from the current contract. If you modify `Crowdfunding.sol`, re-compile in Remix and paste the updated ABI.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser, connect MetaMask, and start interacting with the DApp.

---

## MetaMask Setup for Ganache

1. Open MetaMask → click the network selector → **Add a network manually**
2. Fill in the following:

| Field | Value |
|---|---|
| Network Name | `Ganache` |
| RPC URL | `http://127.0.0.1:7545` |
| Chain ID | `1337` |
| Currency Symbol | `ETH` |

3. **Import a Ganache account**: In Ganache, click the key icon next to any account → copy the private key → in MetaMask: click the account avatar → **Import Account** → paste the private key.

> The first account in Ganache is the deployer, which becomes the **owner** of the contract. Import at least two accounts to test both the owner and donor flows.

---

## Deployment (Static Frontend)

> No Docker needed. This is a pure static frontend — no server, no backend, no container.

Build the production bundle:

```bash
npm run build
# Output: dist/
```

The `dist/` folder is a self-contained static site. Deploy it to any static host:

- **Vercel**: `vercel --prod` or connect the repo via the Vercel dashboard
- **Netlify**: drag and drop `dist/` or connect via Git
- **GitHub Pages**: push `dist/` to the `gh-pages` branch

> Note: The DApp still requires users to have MetaMask installed and to be connected to the correct network where the contract is deployed. For a public deployment, redeploy the contract to a public testnet (e.g. Sepolia) and update `CONTRACT_ADDRESS` in `src/web3.js` accordingly.

---

## Smart Contract Reference

```solidity
constructor(string _title, string _description, uint256 _goalAmount, uint256 _durationDays)
```

| Function | Access | Description |
|---|---|---|
| `donate()` | Anyone | Send ETH to the campaign while it is active |
| `withdraw()` | Owner only | Transfer balance to owner after goal reached and deadline passed |
| `refund()` | Donors | Claim back donation if deadline passed and goal was not reached |
| `getCampaignInfo()` | Public view | Returns `(title, description, goal, raised, timeLeft, goalReached)` |
| `getDonorsCount()` | Public view | Returns the number of unique donors |

| State Variable | Type | Description |
|---|---|---|
| `owner` | `address` | Deployer address; has exclusive withdraw rights |
| `goalAmount` | `uint256` | Target in wei (converted from ETH in constructor) |
| `deadline` | `uint256` | Unix timestamp when the campaign ends |
| `totalRaised` | `uint256` | Cumulative donations in wei |
| `goalReached` | `bool` | Set to `true` when `totalRaised >= goalAmount` |
| `fundsWithdrawn` | `bool` | Prevents double-withdrawal |
| `donations` | `mapping(address => uint256)` | Per-donor contribution tracking |

---

## Git Branch Strategy

```
main        ← stable, production-ready snapshots
develop     ← integration branch, features merged here first
feature/*   ← one short-lived branch per feature or fix
```

---

## What I Would Add in Production

This is a POC — the following would be needed to make it production-grade:

- **Hardhat or Foundry** instead of Remix for proper contract testing, scripting, and CI/CD
- **Contract unit tests** (100% coverage on all state transitions and edge cases)
- **Testnet deployment** (Sepolia) so anyone can interact without running Ganache locally
- **IPFS storage** for campaign images and long-form descriptions (instead of storing in contract state, which is expensive)
- **The Graph** for indexing contract events — avoids polling and enables fast historical queries
- **Multi-campaign contract factory** — a single factory contract that deploys new `Crowdfunding` instances on-chain, instead of tracking addresses in `localStorage`
- **WalletConnect** support for mobile wallets alongside MetaMask
- **OpenZeppelin** contracts for battle-tested `Ownable`, `ReentrancyGuard`, and safe ETH transfer patterns
- **Contract verification** on Etherscan for transparency

---

## License

MIT
