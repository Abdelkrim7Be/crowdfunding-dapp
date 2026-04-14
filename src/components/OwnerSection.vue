<template>
  <div class="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5">
    <div class="flex items-start gap-3">
      <div class="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a5 5 0 1 0 5 5A5 5 0 0 0 12 2zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1"/>
        </svg>
      </div>
      <div class="space-y-0.5">
        <h2 class="text-white font-semibold text-base tracking-tight">Owner Panel</h2>
        <p class="text-zinc-500 text-sm">You are the campaign owner.</p>
      </div>
    </div>

    <!-- Status info -->
    <div class="space-y-2 border-t border-white/10 pt-4">
      <div class="flex items-center justify-between text-sm">
        <span class="text-zinc-500">Goal status</span>
        <span :class="goalReached ? 'text-white' : 'text-zinc-500'" class="font-medium">
          {{ goalReached ? 'Reached' : 'Not reached' }}
        </span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-zinc-500">Campaign</span>
        <span :class="isEnded ? 'text-zinc-500' : 'text-white'" class="font-medium">
          {{ isEnded ? 'Ended' : 'Active' }}
        </span>
      </div>
      <div v-if="fundsWithdrawn" class="flex items-center justify-between text-sm">
        <span class="text-zinc-500">Withdrawal</span>
        <span class="text-zinc-500 font-medium">Already withdrawn</span>
      </div>
    </div>

    <!-- Withdraw Button -->
    <button
      @click="$emit('withdraw')"
      :disabled="!canWithdraw || pending"
      class="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-full px-6 py-3 text-sm hover:bg-zinc-200 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg v-if="pending" class="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <span>{{ buttonLabel }}</span>
    </button>

    <p v-if="!canWithdraw && !pending" class="text-zinc-600 text-xs text-center">
      {{ withdrawBlockReason }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isEnded: {
    type: Boolean,
    default: false,
  },
  goalReached: {
    type: Boolean,
    default: false,
  },
  fundsWithdrawn: {
    type: Boolean,
    default: false,
  },
  pending: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['withdraw'])

const canWithdraw = computed(() => {
  return props.goalReached && props.isEnded && !props.fundsWithdrawn
})

const buttonLabel = computed(() => {
  if (props.pending) return 'Processing...'
  if (props.fundsWithdrawn) return 'Funds Withdrawn'
  return 'Withdraw Funds'
})

const withdrawBlockReason = computed(() => {
  if (props.fundsWithdrawn) return 'Funds have already been withdrawn.'
  if (!props.goalReached) return 'Withdrawal requires the fundraising goal to be met.'
  if (!props.isEnded) return 'Withdrawal is available once the campaign deadline passes.'
  return null
})
</script>
