<template>
  <div class="space-y-2">
    <!-- Role label -->
    <p class="text-zinc-600 text-xs font-medium uppercase tracking-widest px-1">Donor Actions</p>

    <div class="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5">
    <div class="space-y-1">
      <h2 class="text-white font-semibold text-lg tracking-tight">Support this campaign</h2>
      <p class="text-zinc-500 text-sm">Every contribution brings this project closer to its goal.</p>
    </div>

    <!-- ETH Input -->
    <div class="space-y-1">
      <label class="text-xs text-zinc-500 font-medium uppercase tracking-wider">Amount</label>
      <div class="flex items-center gap-3 border-b border-white/20 pb-3 focus-within:border-white/40 transition-colors">
        <input
          v-model="amount"
          type="number"
          min="0"
          step="0.001"
          placeholder="0.0"
          :disabled="pending || !canDonate"
          class="flex-1 bg-transparent text-white text-2xl font-semibold outline-none placeholder-white/20 disabled:opacity-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span class="text-zinc-400 font-medium text-sm shrink-0">ETH</span>
      </div>
    </div>

    <!-- Your current donation -->
    <p v-if="userDonation > 0" class="text-zinc-500 text-xs">
      Your donation: <span class="text-white font-medium">{{ userDonation.toFixed(4) }} ETH</span>
    </p>

    <!-- Donate Button -->
    <button
      @click="handleDonate"
      :disabled="!canSubmit"
      class="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-full px-6 py-3 text-sm hover:bg-zinc-200 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg v-if="pending" class="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <span>{{ buttonLabel }}</span>
    </button>

    <!-- Reason not able to donate -->
    <p v-if="disabledReason" class="text-zinc-600 text-xs text-center">{{ disabledReason }}</p>
  </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  account: {
    type: String,
    default: null,
  },
  isEnded: {
    type: Boolean,
    default: false,
  },
  goalReached: {
    type: Boolean,
    default: false,
  },
  userDonation: {
    type: Number,
    default: 0,
  },
  pending: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['donate'])

const amount = ref('')

const canDonate = computed(() => {
  return props.account && !props.isEnded
})

const canSubmit = computed(() => {
  return canDonate.value && !props.pending && parseFloat(amount.value) > 0
})

const buttonLabel = computed(() => {
  if (!props.account) return 'Connect wallet to donate'
  if (props.pending) return 'Processing...'
  if (props.isEnded) return 'Campaign ended'
  return 'Donate ETH'
})

const disabledReason = computed(() => {
  if (!props.account) return 'Connect your MetaMask wallet to donate.'
  if (props.isEnded) return 'This campaign has ended and is no longer accepting donations.'
  return null
})

function handleDonate() {
  const val = parseFloat(amount.value)
  if (!val || val <= 0) return
  emit('donate', String(val))
  amount.value = ''
}
</script>
