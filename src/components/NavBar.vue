<template>
  <nav class="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-sm">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

      <!-- Logo -->
      <div class="flex items-center gap-2 shrink-0">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
          <path d="M7 0L9.5 4.5H14L10.5 7.5L12 12.5L7 9.5L2 12.5L3.5 7.5L0 4.5H4.5Z"/>
        </svg>
        <span class="font-bold text-white tracking-tight text-base">FundChain</span>
      </div>

      <!-- Nav links (center) -->
      <div v-if="account" class="hidden sm:flex items-center gap-1 flex-1">
        <button
          @click="$emit('navigate', 'home')"
          :class="currentView === 'home' ? 'text-white' : 'text-zinc-500 hover:text-white'"
          class="text-sm px-3 py-1.5 rounded-full transition-colors duration-150"
        >
          Campaign
        </button>
        <button
          @click="$emit('navigate', 'campaigns')"
          :class="currentView === 'campaigns' ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-white'"
          class="text-sm px-3 py-1.5 rounded-full transition-colors duration-150"
        >
          {{ role === 'owner' ? 'My Campaigns' : 'Campaigns' }}
        </button>
      </div>

      <!-- Wallet area -->
      <div class="flex items-center gap-2 shrink-0">

        <!-- Not connected -->
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

        <!-- Connected -->
        <template v-else>
          <div class="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span class="font-mono text-xs text-white tracking-wide hidden sm:inline">{{ formattedAddress }}</span>
          </div>
          <span v-if="role === 'owner'"
            class="bg-white text-black text-xs font-semibold px-3 py-1 rounded-full leading-5 tracking-tight">
            Owner
          </span>
          <span v-else-if="role === 'donor'"
            class="border border-white/20 text-white text-xs font-medium px-3 py-1 rounded-full leading-5 hidden sm:inline">
            Donor
          </span>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { formatAddress } from '../web3.js'

const props = defineProps({
  account:     { type: String,  default: null },
  role:        { type: String,  default: null },
  connecting:  { type: Boolean, default: false },
  currentView: { type: String,  default: 'home' },
})

defineEmits(['connect', 'navigate'])

const formattedAddress = computed(() => formatAddress(props.account))
</script>
