<template>
  <div class="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
    <!-- Expanded panel -->
    <Transition name="guide">
      <div
        v-if="open"
        class="bg-zinc-900 border border-white/10 rounded-2xl p-5 w-72 shadow-2xl space-y-4"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <span class="text-white text-sm font-semibold tracking-tight">Demo Guide</span>
          <button
            @click="open = false"
            class="text-zinc-600 hover:text-zinc-300 transition-colors"
            aria-label="Close demo guide"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Owner role -->
        <div class="space-y-1.5">
          <div class="flex items-center gap-2">
            <span class="bg-white text-black text-xs font-semibold px-2 py-0.5 rounded-full">Owner</span>
          </div>
          <ul class="space-y-1 pl-1">
            <li class="text-zinc-500 text-xs leading-relaxed">The wallet that deployed the contract</li>
            <li class="text-zinc-500 text-xs leading-relaxed">Can withdraw funds after deadline + goal reached</li>
          </ul>
        </div>

        <div class="border-t border-white/10"></div>

        <!-- Donor role -->
        <div class="space-y-1.5">
          <div class="flex items-center gap-2">
            <span class="border border-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">Donor</span>
          </div>
          <ul class="space-y-1 pl-1">
            <li class="text-zinc-500 text-xs leading-relaxed">Any other Ganache wallet</li>
            <li class="text-zinc-500 text-xs leading-relaxed">Can donate ETH to the campaign</li>
            <li class="text-zinc-500 text-xs leading-relaxed">Can claim a refund if goal not reached</li>
          </ul>
        </div>

        <div class="border-t border-white/10"></div>

        <!-- How to switch -->
        <div class="space-y-1.5">
          <p class="text-zinc-400 text-xs font-medium">How to switch roles</p>
          <ul class="space-y-1 pl-1">
            <li class="text-zinc-500 text-xs leading-relaxed">Open MetaMask</li>
            <li class="text-zinc-500 text-xs leading-relaxed">Switch to a different account</li>
            <li class="text-zinc-500 text-xs leading-relaxed">Role is detected automatically</li>
          </ul>
        </div>
      </div>
    </Transition>

    <!-- Toggle button -->
    <button
      @click="open = !open"
      :class="open ? 'bg-white text-black' : 'bg-black border border-white/20 text-zinc-400 hover:text-white hover:border-white/40'"
      class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200"
      aria-label="Toggle demo guide"
    >
      <span v-if="!open">?</span>
      <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<style scoped>
.guide-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.guide-leave-active {
  transition: all 0.15s ease-in;
}
.guide-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.97);
}
.guide-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}
</style>
