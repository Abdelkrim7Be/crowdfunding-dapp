<template>
  <div class="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5">
    <div class="flex items-start gap-3">
      <div class="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 1 0 .49-3.45"/>
        </svg>
      </div>
      <div class="space-y-0.5">
        <h2 class="text-white font-semibold text-base tracking-tight">Claim Your Refund</h2>
        <p class="text-zinc-500 text-sm">Campaign ended without reaching goal.</p>
      </div>
    </div>

    <div v-if="userDonation > 0" class="border border-white/10 rounded-xl p-4 bg-white/[0.03]">
      <p class="text-zinc-400 text-xs mb-1">Refundable amount</p>
      <p class="text-white font-bold text-xl tabular-nums">{{ userDonation.toFixed(4) }} ETH</p>
    </div>

    <p v-else class="text-zinc-600 text-sm">You have no donation to refund on this campaign.</p>

    <button
      @click="$emit('refund')"
      :disabled="!canRefund || pending"
      class="w-full flex items-center justify-center gap-2 border border-white/20 text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg v-if="pending" class="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <span>{{ pending ? 'Processing...' : 'Claim Refund' }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  account: {
    type: String,
    default: null,
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

defineEmits(['refund'])

const canRefund = computed(() => {
  return props.account && props.userDonation > 0
})
</script>
