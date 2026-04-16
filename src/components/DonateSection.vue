<template>
  <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5 animate-fade-up" style="animation-delay: 250ms">
    <div class="space-y-0.5">
      <h2 class="text-white font-semibold text-base tracking-tight">Support this campaign</h2>
      <p class="text-zinc-500 text-sm">Every contribution brings this project closer to its goal.</p>
    </div>

    <!-- ETH Input -->
    <div class="space-y-1.5">
      <label class="text-xs text-zinc-500 font-medium uppercase tracking-widest">Amount</label>
      <div
        class="flex items-center gap-3 border-b pb-3 transition-colors duration-200"
        :class="inputBorderClass"
      >
        <input
          v-model="amount"
          type="number"
          min="0"
          step="0.001"
          placeholder="0.0"
          :disabled="pending || !canDonate"
          @blur="touched = true"
          @input="touched = false"
          :class="[shaking ? 'animate-shake' : '']"
          class="flex-1 bg-transparent text-white text-2xl font-light outline-none placeholder-zinc-600 disabled:opacity-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span class="text-zinc-500 font-medium text-sm shrink-0">ETH</span>
      </div>

      <!-- Validation message -->
      <p v-if="showError" class="text-red-400 text-xs mt-1">
        Please enter an amount greater than 0
      </p>
    </div>

    <!-- Your current donation -->
    <p v-if="userDonation > 0" class="text-zinc-400 text-sm flex items-center gap-1.5">
      Your contribution:
      <span class="text-white font-medium">{{ userDonation.toFixed(4) }} ETH</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </p>

    <!-- Donate Button -->
    <button
      @click="handleDonate"
      :disabled="!canDonate || pending"
      class="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-full px-6 py-4 text-sm hover:bg-zinc-100 active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
      :class="canDonate && !pending ? 'donate-pulse' : ''"
    >
      <svg v-if="pending" class="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <span>{{ buttonLabel }}</span>
    </button>

    <!-- Disabled reason -->
    <p v-if="disabledReason" class="text-zinc-600 text-xs text-center">{{ disabledReason }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  account: { type: String, default: null },
  isEnded:  { type: Boolean, default: false },
  goalReached: { type: Boolean, default: false },
  userDonation: { type: Number, default: 0 },
  pending: { type: Boolean, default: false },
})

const emit = defineEmits(['donate'])

const amount  = ref('')
const touched = ref(false)
const shaking = ref(false)

const canDonate = computed(() => props.account && !props.isEnded)

const isInvalid = computed(() => {
  const val = parseFloat(amount.value)
  return touched.value && (!val || val <= 0)
})

const showError = computed(() => isInvalid.value)

const inputBorderClass = computed(() => {
  if (isInvalid.value) return 'border-red-500'
  const val = parseFloat(amount.value)
  if (val > 0) return 'border-white/60'
  return 'border-white/20'
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
  touched.value = true
  const val = parseFloat(amount.value)
  if (!val || val <= 0) {
    triggerShake()
    return
  }
  emit('donate', String(val))
  amount.value = ''
  touched.value = false
}

function triggerShake() {
  shaking.value = true
  setTimeout(() => { shaking.value = false }, 500)
}
</script>

<style scoped>
.animate-fade-up {
  animation: fadeUp 0.5s ease-out both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-5px); }
  40%       { transform: translateX(5px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.45s ease-in-out;
}

@keyframes donatePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
  50%       { box-shadow: 0 0 0 6px rgba(255,255,255,0.08); }
}
.donate-pulse {
  animation: donatePulse 2.5s ease-in-out infinite;
}
</style>
