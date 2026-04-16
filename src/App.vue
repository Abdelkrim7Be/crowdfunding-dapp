<template>
  <div class="min-h-screen bg-black text-white font-sans">
    <NavBar
      :account="account"
      :role="role"
      :connecting="connecting"
      :current-view="currentView"
      @connect="handleConnect"
      @navigate="handleNavigate"
    />

    <main class="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">

      <!-- ── No MetaMask ───────────────────────────────────────────────────── -->
      <div
        v-if="!hasMetaMask"
        class="max-w-md mx-auto mt-16 bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4"
      >
        <svg class="w-8 h-8 mx-auto text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p class="text-white font-medium">MetaMask Required</p>
        <p class="text-zinc-500 text-sm">Please install MetaMask to interact with this DApp.</p>
        <a href="https://metamask.io" target="_blank" rel="noopener noreferrer"
          class="inline-block border border-white/20 text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-white/10 transition-all duration-200">
          Install MetaMask →
        </a>
      </div>

      <template v-else>

        <!-- ── Campaigns list view ─────────────────────────────────────────── -->
        <template v-if="currentView === 'campaigns'">
          <OwnerDashboard
            v-if="isOwner"
            :campaigns="campaigns"
            @select="handleCampaignSelect"
            @add="showAddModal = true"
          />
          <CampaignList
            v-else
            :campaigns="campaigns"
            :is-owner="false"
            @select="handleCampaignSelect"
          />
        </template>

        <!-- ── Single campaign view (home) ────────────────────────────────── -->
        <template v-else>

          <!-- Breadcrumb — shown when multiple campaigns exist -->
          <div v-if="campaigns.length > 1" class="mb-6">
            <button
              @click="handleNavigate('campaigns')"
              class="flex items-center gap-1.5 text-zinc-500 hover:text-white text-sm transition-colors duration-150 group"
            >
              <svg class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-150" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Campaigns
            </button>
            <p class="text-zinc-600 text-xs mt-1.5 pl-5">
              Campaign {{ activeCampaignIndex }} of {{ campaigns.length }}
            </p>
          </div>

          <!-- Full-width hero -->
          <div class="mb-10">
            <CampaignCard section="hero" :campaign="campaign" :loading="loadingCampaign" />
          </div>

          <!-- 60/40 grid — stats left, actions right -->
          <div class="flex flex-col lg:flex-row lg:items-start gap-6">

            <!-- Left ~60% — stats card -->
            <div class="flex-1 min-w-0">
              <CampaignCard section="stats" :campaign="campaign" :loading="loadingCampaign" />
            </div>

            <!-- Right ~40% — actions -->
            <div class="w-full lg:w-[340px] shrink-0 space-y-4">

              <!-- Not connected -->
              <div
                v-if="!account && !loadingCampaign"
                class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-4 animate-fade-up"
                style="animation-delay: 200ms"
              >
                <p class="text-zinc-400 text-sm leading-relaxed">Connect your wallet to donate or manage your contributions.</p>
                <button
                  @click="handleConnect"
                  :disabled="connecting"
                  class="w-full border border-white/20 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-white/10 transition-all duration-200 disabled:opacity-40"
                >
                  {{ connecting ? "Connecting..." : "Connect Wallet" }}
                </button>
              </div>

              <!-- Donor actions — hidden from owner -->
              <DonateSection
                v-if="account && !isOwner && (!isEnded || !campaign.goalReached)"
                :account="account"
                :is-ended="isEnded"
                :goal-reached="campaign.goalReached"
                :user-donation="userDonation"
                :pending="txPending === 'donate'"
                @donate="handleDonate"
              />

              <!-- Owner actions -->
              <OwnerSection
                v-if="isOwner"
                :is-ended="isEnded"
                :goal-reached="campaign.goalReached"
                :funds-withdrawn="fundsWithdrawn"
                :pending="txPending === 'withdraw'"
                @withdraw="handleWithdraw"
              />

              <!-- Refund section -->
              <RefundSection
                v-if="account && !isOwner && showRefund"
                :account="account"
                :user-donation="userDonation"
                :pending="txPending === 'refund'"
                @refund="handleRefund"
              />

            </div>
          </div>
        </template>
      </template>
    </main>

    <ToastNotification ref="toast" />
    <DemoGuide />

    <!-- Add campaign modal -->
    <AddCampaignModal
      :open="showAddModal"
      ref="addModal"
      @close="showAddModal = false"
      @submit="handleAddCampaign"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide } from "vue";
import NavBar          from "./components/NavBar.vue";
import CampaignCard    from "./components/CampaignCard.vue";
import DonateSection   from "./components/DonateSection.vue";
import OwnerSection    from "./components/OwnerSection.vue";
import RefundSection   from "./components/RefundSection.vue";
import ToastNotification from "./components/ToastNotification.vue";
import DemoGuide       from "./components/DemoGuide.vue";
import OwnerDashboard  from "./components/OwnerDashboard.vue";
import CampaignList    from "./components/CampaignList.vue";
import AddCampaignModal from "./components/AddCampaignModal.vue";
import { useCampaigns } from "./composables/useCampaigns.js";
import {
  connectWallet,
  getWeb3Instance,
  getContractInstance,
  CONTRACT_ABI,
  fromWei,
  toWei,
  detectRole,
  registerEthereumListeners,
  CONTRACT_ADDRESS,
} from "./web3.js";

// ── Campaigns registry ────────────────────────────────────────────────────────

const {
  campaigns,
  activeCampaign,
  activeCampaignId,
  addCampaign,
  updateCampaign,
  setActive,
  generateId,
  detectStatus,
} = useCampaigns();

// ── View state ────────────────────────────────────────────────────────────────

const currentView  = ref("home");   // 'home' | 'campaigns'
const showAddModal = ref(false);
const addModal     = ref(null);

// ── Core state ────────────────────────────────────────────────────────────────

const toast        = ref(null);
const account      = ref(null);
const connecting   = ref(false);
const loadingCampaign = ref(true);
const txPending    = ref(null); // 'donate' | 'withdraw' | 'refund' | null

const hasMetaMask = ref(typeof window !== "undefined" && !!window.ethereum);

const campaign = ref({
  title: "",
  description: "",
  goal: 0,
  raised: 0,
  timeLeft: 0,
  goalReached: false,
  donorsCount: 0,
});

const ownerAddress    = ref(null);
const userDonation    = ref(0);
const fundsWithdrawn  = ref(false);

let web3     = null;
let contract = null;

// ── Computed ──────────────────────────────────────────────────────────────────

const isEnded = computed(() => Number(campaign.value.timeLeft) <= 0);

const isOwner = computed(() => {
  if (!account.value || !ownerAddress.value) return false;
  return account.value.toLowerCase() === ownerAddress.value.toLowerCase();
});

const role = computed(() => {
  if (!account.value) return null;
  return isOwner.value ? "owner" : "donor";
});

const showRefund = computed(() => isEnded.value && !campaign.value.goalReached);

const activeCampaignIndex = computed(() => {
  const idx = campaigns.value.findIndex(c => c.id === activeCampaignId.value);
  return idx === -1 ? 1 : idx + 1;
});

// ── Provide/Inject ────────────────────────────────────────────────────────────

provide("web3State", { account, campaign, isEnded, isOwner, role });

// ── Helpers ───────────────────────────────────────────────────────────────────

function showToast(type, title, message = "") {
  return toast.value?.add({ type, title, message });
}

function formatShort(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function extractError(err) {
  if (err?.message?.includes("User denied")) return "Transaction rejected in MetaMask.";
  if (err?.message?.includes("revert")) {
    const match = err.message.match(/revert (.+?)(?:"|$)/);
    return match ? match[1] : "Transaction reverted by contract.";
  }
  return err?.message?.slice(0, 120) || "An unexpected error occurred.";
}

// ── Contract helpers ──────────────────────────────────────────────────────────

/**
 * Verify the contract is reachable on the current network.
 * Returns true if getCampaignInfo() resolves successfully.
 */
async function isContractReachable(contractInstance) {
  try {
    await contractInstance.methods.getCampaignInfo().call();
    return true;
  } catch {
    return false;
  }
}

// ── Campaign data refresh ─────────────────────────────────────────────────────

async function refreshCampaignInfo() {
  if (!contract || !web3) return;
  try {
    const calls = [
      contract.methods.getCampaignInfo().call(),
      contract.methods.getDonorsCount().call(),
      contract.methods.fundsWithdrawn().call(),
      contract.methods.owner().call(),
    ];
    if (account.value) {
      calls.push(contract.methods.donations(account.value).call());
    }

    const [info, donorsCount, withdrawn, owner, donation] = await Promise.all(calls);

    campaign.value = {
      title:       info.title,
      description: info.description,
      goal:        fromWei(web3, info.goal),
      raised:      fromWei(web3, info.raised),
      timeLeft:    Number(info.timeLeft),
      goalReached: info.reached,
      donorsCount: Number(donorsCount),
    };

    fundsWithdrawn.value = withdrawn;
    ownerAddress.value   = owner;

    if (account.value && donation !== undefined) {
      userDonation.value = fromWei(web3, donation);
    }

    // Sync cached data back to localStorage registry
    if (activeCampaign.value) {
      updateCampaign(activeCampaign.value.id, {
        title:       campaign.value.title,
        description: campaign.value.description,
        goal:        campaign.value.goal,
        raised:      campaign.value.raised,
        timeLeft:    campaign.value.timeLeft,
        goalReached: campaign.value.goalReached,
        donorsCount: campaign.value.donorsCount,
        status:      detectStatus(campaign.value),
      });
    }
  } catch (err) {
    console.error("Failed to fetch campaign info:", err);
    if (err?.message?.includes("call revert exception") || err?.code === "CALL_EXCEPTION") {
      showToast("error", "Contract not found on current network", "Please redeploy or switch to the correct network.");
    }
  }
}

// ── Initialise Web3 ───────────────────────────────────────────────────────────

async function initWeb3(contractAddress) {
  if (!window.ethereum) return;
  const addr = contractAddress || activeCampaign.value?.contractAddress || CONTRACT_ADDRESS;
  try {
    web3 = getWeb3Instance();
    if (addr === "YOUR_CONTRACT_ADDRESS_HERE") {
      showToast("error", "Contract not configured", "Paste your deployed contract address into src/web3.js");
      loadingCampaign.value = false;
      return;
    }
    contract = getContractInstance(web3, addr);

    const reachable = await isContractReachable(contract);
    if (!reachable) {
      showToast("error", "Contract not found on current network", "Please redeploy or switch network.");
      loadingCampaign.value = false;
      return;
    }

    await refreshCampaignInfo();

    // Auto-register CONTRACT_ADDRESS on first launch (no campaigns in registry yet)
    if (campaigns.value.length === 0 && addr !== "YOUR_CONTRACT_ADDRESS_HERE") {
      addCampaign({
        id:              generateId(),
        contractAddress: addr,
        chainId:         "1337",
        status:          detectStatus(campaign.value),
        createdAt:       Date.now(),
        lastUpdated:     Date.now(),
        title:           campaign.value.title,
        description:     campaign.value.description,
        goal:            campaign.value.goal,
        raised:          campaign.value.raised,
        timeLeft:        campaign.value.timeLeft,
        goalReached:     campaign.value.goalReached,
        donorsCount:     campaign.value.donorsCount,
      });
    }
  } catch (err) {
    showToast("error", "Failed to load contract", err.message);
  } finally {
    loadingCampaign.value = false;
  }
}

// ── Campaign switching ────────────────────────────────────────────────────────

async function handleCampaignSelect(selectedCampaign) {
  if (selectedCampaign.id === activeCampaignId.value) {
    currentView.value = "home";
    return;
  }
  loadingCampaign.value = true;
  setActive(selectedCampaign.id);
  currentView.value = "home";
  try {
    web3 = web3 || getWeb3Instance();
    contract = getContractInstance(web3, selectedCampaign.contractAddress);

    const reachable = await isContractReachable(contract);
    if (!reachable) {
      showToast("error", "Contract not found on current network", "Please redeploy or switch network.");
      loadingCampaign.value = false;
      return;
    }

    await refreshCampaignInfo();
    showToast("success", "Campaign switched", selectedCampaign.title || selectedCampaign.contractAddress);
  } catch (err) {
    showToast("error", "Failed to switch campaign", err.message);
  } finally {
    loadingCampaign.value = false;
  }
}

// ── Add new campaign ──────────────────────────────────────────────────────────

async function handleAddCampaign(address) {
  if (!web3) web3 = getWeb3Instance();
  addModal.value?.setLoading(true);
  addModal.value?.setError("");

  try {
    const tempContract = getContractInstance(web3, address);
    const reachable = await isContractReachable(tempContract);
    if (!reachable) {
      addModal.value?.setError("Contract not found on current network. Deploy first, then paste the address.");
      return;
    }

    // Fetch campaign data
    const [info, donorsCount] = await Promise.all([
      tempContract.methods.getCampaignInfo().call(),
      tempContract.methods.getDonorsCount().call(),
    ]);

    const newCampaign = {
      id:              generateId(),
      contractAddress: address,
      chainId:         "1337",
      status:          "active",
      createdAt:       Date.now(),
      lastUpdated:     Date.now(),
      title:           info.title,
      description:     info.description,
      goal:            fromWei(web3, info.goal),
      raised:          fromWei(web3, info.raised),
      timeLeft:        Number(info.timeLeft),
      goalReached:     info.reached,
      donorsCount:     Number(donorsCount),
    };
    newCampaign.status = detectStatus(newCampaign);

    addCampaign(newCampaign);

    // Switch active contract
    contract = tempContract;
    await refreshCampaignInfo();

    showAddModal.value = false;
    currentView.value  = "home";
    showToast("success", "Campaign added", info.title || address);
  } catch (err) {
    addModal.value?.setError("Could not read contract: " + err.message.slice(0, 80));
  } finally {
    addModal.value?.setLoading(false);
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────

function handleNavigate(view) {
  currentView.value = view;
}

// ── Wallet & transactions ─────────────────────────────────────────────────────

async function handleConnect() {
  if (connecting.value) return;
  connecting.value = true;
  try {
    const addr = await connectWallet();
    account.value = addr;
    if (!web3) await initWeb3();
    else        await refreshCampaignInfo();
    showToast("success", "Wallet connected", formatShort(addr));
  } catch (err) {
    if (err?.code === -32002 || err?.message?.includes("already pending")) {
      showToast("pending", "MetaMask popup is already open", "Check your MetaMask extension and approve the connection.");
    } else if (err?.code === 4001 || err?.message?.includes("User rejected")) {
      showToast("error", "Connection rejected", "You declined the MetaMask request.");
    } else {
      showToast("error", "Connection failed", err.message);
    }
  } finally {
    connecting.value = false;
  }
}

async function handleDonate(ethAmount) {
  if (!account.value || !contract || !web3) return;
  const toastId = showToast("pending", "Transaction pending", `Donating ${ethAmount} ETH…`);
  txPending.value = "donate";
  try {
    await contract.methods.donate().send({ from: account.value, value: toWei(web3, ethAmount) });
    toast.value?.updateById(toastId, { type: "success", title: "Donation successful", message: `You donated ${ethAmount} ETH` });
    await refreshCampaignInfo();
  } catch (err) {
    toast.value?.updateById(toastId, { type: "error", title: "Donation failed", message: extractError(err) });
  } finally {
    txPending.value = null;
  }
}

async function handleWithdraw() {
  if (!account.value || !contract) return;
  const toastId = showToast("pending", "Transaction pending", "Withdrawing funds…");
  txPending.value = "withdraw";
  try {
    await contract.methods.withdraw().send({ from: account.value });
    toast.value?.updateById(toastId, { type: "success", title: "Withdrawal successful", message: "Funds transferred to owner wallet" });
    await refreshCampaignInfo();
  } catch (err) {
    toast.value?.updateById(toastId, { type: "error", title: "Withdrawal failed", message: extractError(err) });
  } finally {
    txPending.value = null;
  }
}

async function handleRefund() {
  if (!account.value || !contract) return;
  const toastId = showToast("pending", "Transaction pending", "Processing refund…");
  txPending.value = "refund";
  try {
    await contract.methods.refund().send({ from: account.value });
    toast.value?.updateById(toastId, { type: "success", title: "Refund successful", message: "ETH returned to your wallet" });
    await refreshCampaignInfo();
  } catch (err) {
    toast.value?.updateById(toastId, { type: "error", title: "Refund failed", message: extractError(err) });
  } finally {
    txPending.value = null;
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(async () => {
  if (!hasMetaMask.value) {
    loadingCampaign.value = false;
    return;
  }

  await initWeb3();

  // Auto-detect already-connected accounts
  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
      account.value = accounts[0];
      await refreshCampaignInfo();
    }
  } catch {
    // no-op
  }

  registerEthereumListeners(
    async (newAccount) => {
      account.value = newAccount;
      if (newAccount) {
        await refreshCampaignInfo();
        const detectedRole = detectRole(newAccount, ownerAddress.value);
        const label = detectedRole === "owner" ? "Owner mode" : "Donor mode";
        showToast("success", `Switched to ${label}`, formatShort(newAccount));
      } else {
        userDonation.value = 0;
      }
    },
    () => window.location.reload(),
  );
});
</script>
