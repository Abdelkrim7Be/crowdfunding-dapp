<template>
  <nav class="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2L3 7V18H8V13H12V18H17V7L10 2Z" fill="white" />
        </svg>
        <span class="font-bold text-white tracking-tight text-base">FundChain</span>
      </div>

      <!-- Wallet Button -->
      <div>
        <button
          v-if="!account"
          @click="$emit('connect')"
          :disabled="connecting"
          class="flex items-center gap-2 border border-white/20 text-white rounded-full px-5 py-1.5 text-sm font-medium hover:bg-white/10 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span v-if="connecting" class="flex items-center gap-2">
            <svg class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="white" stroke-width="3"/>
              <path class="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Connecting...
          </span>
          <span v-else>Connect Wallet</span>
        </button>

        <div
          v-else
          class="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-white font-medium"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
          <span class="font-mono text-xs tracking-wide">{{ formattedAddress }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { formatAddress } from '../web3.js'

const props = defineProps({
  account: {
    type: String,
    default: null,
  },
  connecting: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['connect'])

const formattedAddress = computed(() => formatAddress(props.account))
</script>
