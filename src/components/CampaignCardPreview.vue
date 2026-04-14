<template>
  <div
    @click="$emit('select')"
    class="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-all duration-200 cursor-pointer space-y-4"
  >
    <!-- Header: title + status badge -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0 space-y-1">
        <h3 class="text-white font-semibold text-sm leading-snug truncate">
          {{ campaign.title || 'Untitled Campaign' }}
        </h3>
        <p class="text-zinc-500 text-xs leading-relaxed line-clamp-2">
          {{ campaign.description || '' }}
        </p>
      </div>

      <!-- Status badge -->
      <div class="shrink-0">
        <span v-if="campaign.status === 'completed'"
          class="inline-flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-2.5 py-0.5 rounded-full">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Funded
        </span>
        <span v-else-if="campaign.status === 'active'"
          class="inline-flex items-center gap-1.5 border border-white/20 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Active
        </span>
        <span v-else
          class="inline-flex items-center gap-1.5 border border-white/10 text-zinc-500 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Ended
        </span>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="space-y-1.5">
      <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          class="h-full bg-white rounded-full transition-all duration-700"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span class="text-zinc-400 tabular-nums font-medium">
          {{ (campaign.raised || 0).toFixed(3) }} ETH
        </span>
        <span class="text-zinc-600">of {{ (campaign.goal || 0).toFixed(1) }} ETH · {{ progressPercent }}%</span>
      </div>
    </div>

    <!-- Footer: donors + time + arrow -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-xs text-zinc-500">
        <span>{{ campaign.donorsCount || 0 }} {{ campaign.donorsCount === 1 ? 'donor' : 'donors' }}</span>
        <span class="text-zinc-700">·</span>
        <span>{{ formatTimeLeft(campaign.timeLeft) }}</span>
      </div>
      <svg
        class="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      >
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  campaign: {
    type: Object,
    required: true,
  },
})

defineEmits(['select'])

const progressPercent = computed(() => {
  if (!props.campaign.goal || props.campaign.goal === 0) return 0
  return Math.min(Math.round((props.campaign.raised / props.campaign.goal) * 100), 100)
})

function formatTimeLeft(seconds) {
  const s = Number(seconds)
  if (s <= 0) return 'Ended'
  const days  = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const mins  = Math.floor((s % 3600) / 60)
  if (days > 0)  return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${mins}m left`
  return `${mins}m left`
}
</script>
