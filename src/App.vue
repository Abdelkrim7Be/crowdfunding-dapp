<template>
  <div class="min-h-screen bg-black text-white font-sans">
    <NavBar
      :account="account"
      :role="role"
      :connecting="connecting"
      @connect="handleConnect"
    />

    <!-- Main content -->
    <main class="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20 space-y-6">
      <!-- No MetaMask warning -->
      <div v-if="!hasMetaMask" class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-3">
        <svg class="w-8 h-8 mx-auto text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p class="text-white font-medium">MetaMask Required</p>
        <p class="text-zinc-500 text-sm">Please install MetaMask browser extension to interact with this DApp.</p>
        <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" class="inline-block border border-white/20 text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-white/10 transition-all duration-200">
          Install MetaMask →
        </a>
      </div>

      <template v-else>
        <!-- Campaign card -->
        <CampaignCard
          :campaign="campaign"
          :loading="loadingCampaign"
        />

        <!-- Donate section (always shown when campaign is active) -->
        <DonateSection
          v-if="!isEnded || !campaign.goalReached"
          :account="account"
          :is-ended="isEnded"
          :goal-reached="campaign.goalReached"
          :user-donation="userDonation"
          :pending="txPending === 'donate'"
          @donate="handleDonate"
        />

        <!-- Owner section -->
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
          v-if="showRefund"
          :account="account"
          :user-donation="userDonation"
          :pending="txPending === 'refund'"
          @refund="handleRefund"
        />

        <!-- Connect prompt at bottom if not connected -->
        <div v-if="!account && !loadingCampaign" class="text-center pt-4">
          <p class="text-zinc-600 text-sm mb-3">Connect your wallet to donate or manage your contributions.</p>
          <button
            @click="handleConnect"
            :disabled="connecting"
            class="border border-white/20 text-white rounded-full px-6 py-2 text-sm font-medium hover:bg-white/10 transition-all duration-200 disabled:opacity-40"
          >
            {{ connecting ? 'Connecting...' : 'Connect Wallet' }}
          </button>
        </div>
      </template>
    </main>

    <!-- Toast notifications -->
    <ToastNotification ref="toast" />

    <!-- Demo guide panel -->
    <DemoGuide />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue'
import NavBar from './components/NavBar.vue'
import CampaignCard from './components/CampaignCard.vue'
import DonateSection from './components/DonateSection.vue'
import OwnerSection from './components/OwnerSection.vue'
import RefundSection from './components/RefundSection.vue'
import ToastNotification from './components/ToastNotification.vue'
import DemoGuide from './components/DemoGuide.vue'
import {
  connectWallet,
  getWeb3Instance,
  getContractInstance,
  fromWei,
  toWei,
  detectRole,
  registerEthereumListeners,
  CONTRACT_ADDRESS,
} from './web3.js'

// ── State ────────────────────────────────────────────────────────────────────

const toast = ref(null)
const account = ref(null)
const connecting = ref(false)
const loadingCampaign = ref(true)
const txPending = ref(null) // 'donate' | 'withdraw' | 'refund' | null

const hasMetaMask = ref(typeof window !== 'undefined' && !!window.ethereum)

const campaign = ref({
  title: '',
  description: '',
  goal: 0,
  raised: 0,
  timeLeft: 0,
  goalReached: false,
  donorsCount: 0,
})

const ownerAddress = ref(null)
const userDonation = ref(0)
const fundsWithdrawn = ref(false)

let web3 = null
let contract = null

// ── Computed ─────────────────────────────────────────────────────────────────

const isEnded = computed(() => Number(campaign.value.timeLeft) <= 0)

const isOwner = computed(() => {
  if (!account.value || !ownerAddress.value) return false
  return account.value.toLowerCase() === ownerAddress.value.toLowerCase()
})

const role = computed(() => {
  if (!account.value) return null
  return isOwner.value ? 'owner' : 'donor'
})

const showRefund = computed(() => {
  return isEnded.value && !campaign.value.goalReached
})

// ── Provide/Inject ────────────────────────────────────────────────────────────

provide('web3State', {
  account,
  campaign,
  isEnded,
  isOwner,
  role,
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function showToast(type, title, message = '') {
  return toast.value?.add({ type, title, message })
}

async function refreshCampaignInfo() {
  if (!contract || !web3) return
  try {
    const info = await contract.methods.getCampaignInfo().call()
    const donorsCount = await contract.methods.getDonorsCount().call()
    const withdrawn = await contract.methods.fundsWithdrawn().call()
    const owner = await contract.methods.owner().call()

    campaign.value = {
      title: info.title,
      description: info.description,
      goal: fromWei(web3, info.goal),
      raised: fromWei(web3, info.raised),
      timeLeft: Number(info.timeLeft),
      goalReached: info.reached,
      donorsCount: Number(donorsCount),
    }

    fundsWithdrawn.value = withdrawn
    ownerAddress.value = owner

    if (account.value) {
      const donation = await contract.methods.donations(account.value).call()
      userDonation.value = fromWei(web3, donation)
    }
  } catch (err) {
    console.error('Failed to fetch campaign info:', err)
  }
}

async function initWeb3() {
  if (!window.ethereum) return
  try {
    web3 = getWeb3Instance()
    if (CONTRACT_ADDRESS === 'YOUR_CONTRACT_ADDRESS_HERE') {
      showToast('error', 'Contract not configured', 'Paste your deployed contract address into src/web3.js')
      loadingCampaign.value = false
      return
    }
    contract = getContractInstance(web3)
    await refreshCampaignInfo()
  } catch (err) {
    showToast('error', 'Failed to load contract', err.message)
  } finally {
    loadingCampaign.value = false
  }
}

// ── Event Handlers ────────────────────────────────────────────────────────────

async function handleConnect() {
  if (connecting.value) return
  connecting.value = true
  try {
    const addr = await connectWallet()
    account.value = addr
    if (!web3) await initWeb3()
    else await refreshCampaignInfo()
    showToast('success', 'Wallet connected', formatShort(addr))
  } catch (err) {
    showToast('error', 'Connection failed', err.message)
  } finally {
    connecting.value = false
  }
}

async function handleDonate(ethAmount) {
  if (!account.value || !contract || !web3) return
  const toastId = showToast('pending', 'Transaction pending', `Donating ${ethAmount} ETH…`)
  txPending.value = 'donate'
  try {
    const weiValue = toWei(web3, ethAmount)
    await contract.methods.donate().send({
      from: account.value,
      value: weiValue,
    })
    toast.value?.updateById(toastId, {
      type: 'success',
      title: 'Donation successful',
      message: `You donated ${ethAmount} ETH`,
    })
    await refreshCampaignInfo()
  } catch (err) {
    toast.value?.updateById(toastId, {
      type: 'error',
      title: 'Donation failed',
      message: extractError(err),
    })
  } finally {
    txPending.value = null
  }
}

async function handleWithdraw() {
  if (!account.value || !contract) return
  const toastId = showToast('pending', 'Transaction pending', 'Withdrawing funds…')
  txPending.value = 'withdraw'
  try {
    await contract.methods.withdraw().send({ from: account.value })
    toast.value?.updateById(toastId, {
      type: 'success',
      title: 'Withdrawal successful',
      message: 'Funds transferred to owner wallet',
    })
    await refreshCampaignInfo()
  } catch (err) {
    toast.value?.updateById(toastId, {
      type: 'error',
      title: 'Withdrawal failed',
      message: extractError(err),
    })
  } finally {
    txPending.value = null
  }
}

async function handleRefund() {
  if (!account.value || !contract) return
  const toastId = showToast('pending', 'Transaction pending', 'Processing refund…')
  txPending.value = 'refund'
  try {
    await contract.methods.refund().send({ from: account.value })
    toast.value?.updateById(toastId, {
      type: 'success',
      title: 'Refund successful',
      message: 'ETH returned to your wallet',
    })
    await refreshCampaignInfo()
  } catch (err) {
    toast.value?.updateById(toastId, {
      type: 'error',
      title: 'Refund failed',
      message: extractError(err),
    })
  } finally {
    txPending.value = null
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function formatShort(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function extractError(err) {
  if (err?.message?.includes('User denied')) return 'Transaction rejected in MetaMask.'
  if (err?.message?.includes('revert')) {
    const match = err.message.match(/revert (.+?)(?:"|$)/)
    return match ? match[1] : 'Transaction reverted by contract.'
  }
  return err?.message?.slice(0, 120) || 'An unexpected error occurred.'
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(async () => {
  if (!hasMetaMask.value) {
    loadingCampaign.value = false
    return
  }

  await initWeb3()

  // Auto-detect already-connected accounts
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    if (accounts.length > 0) {
      account.value = accounts[0]
      await refreshCampaignInfo()
    }
  } catch {
    // no-op
  }

  // Listen for account and chain changes via shared helper
  registerEthereumListeners(
    async (newAccount) => {
      account.value = newAccount
      if (newAccount) {
        await refreshCampaignInfo()
        const detectedRole = detectRole(newAccount, ownerAddress.value)
        const label = detectedRole === 'owner' ? 'Owner mode' : 'Donor mode'
        showToast('success', `Switched to ${label}`, formatShort(newAccount))
      } else {
        userDonation.value = 0
      }
    },
    () => window.location.reload()
  )
})
</script>
