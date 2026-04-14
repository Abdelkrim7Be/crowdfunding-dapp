import Web3 from "web3";

// Suppress web3.js unhandled provider detection rejections on page load
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    if (event?.reason?.message?.includes("Failed to connect to MetaMask")) {
      event.preventDefault();
    }
  });
}

export const CONTRACT_ADDRESS = "0x20F7CA39d9aBa4eB0B53Bd7FF8E1951A0831dFD9";

export const CONTRACT_ABI = [
  {
    inputs: [],
    name: "donate",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_title",
        type: "string",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_goalAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_durationDays",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "donor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "DonationReceived",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "FundsWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "totalRaised",
        type: "uint256",
      },
    ],
    name: "GoalReached",
    type: "event",
  },
  {
    inputs: [],
    name: "refund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "donor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RefundIssued",
    type: "event",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "campaignDescription",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "campaignTitle",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deadline",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "donations",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "donors",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "fundsWithdrawn",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCampaignInfo",
    outputs: [
      {
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "goal",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "raised",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timeLeft",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "reached",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getDonorsCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "goalAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "goalReached",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalRaised",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

let _connectingInProgress = false;

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed. Please install MetaMask to use this app.",
    );
  }
  if (_connectingInProgress) {
    const err = new Error(
      "MetaMask popup is already open. Please check MetaMask.",
    );
    err.code = -32002;
    throw err;
  }
  _connectingInProgress = true;
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  } finally {
    _connectingInProgress = false;
  }
}

export function getWeb3Instance() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }
  return new Web3(window.ethereum);
}

export function getContractInstance(web3) {
  return new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
}

export function formatAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function fromWei(web3, value) {
  return parseFloat(web3.utils.fromWei(String(value), "ether"));
}

export function toWei(web3, value) {
  return web3.utils.toWei(String(value), "ether");
}

export function formatTimeLeft(seconds) {
  const s = Number(seconds);
  if (s <= 0) return "Ended";
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Detect the role of a connected address relative to the contract owner.
 * Returns 'owner' | 'donor' | null.
 */
export function detectRole(account, ownerAddress) {
  if (!account || !ownerAddress) return null;
  return account.toLowerCase() === ownerAddress.toLowerCase()
    ? "owner"
    : "donor";
}

/**
 * Register MetaMask account change and chain change listeners.
 * Calls onAccountChange(newAccount) and onChainChange() respectively.
 */
export function registerEthereumListeners(onAccountChange, onChainChange) {
  if (!window.ethereum) return;
  window.ethereum.on("accountsChanged", (accounts) => {
    onAccountChange(accounts[0] || null);
  });
  window.ethereum.on("chainChanged", () => {
    onChainChange();
  });
}
