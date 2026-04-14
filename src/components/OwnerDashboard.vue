<template>
  <div class="space-y-8">
    <!-- Page heading -->
    <div class="space-y-1">
      <p class="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium">Owner Dashboard</p>
      <h1 class="text-3xl font-bold tracking-tight text-white">My Campaigns</h1>
    </div>

    <!-- Stats summary bar -->
    <div class="grid grid-cols-3 gap-3">
      <div
        v-for="stat in summaryStats"
        :key="stat.label"
        class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2"
      >
        <p class="text-zinc-500 text-xs font-medium uppercase tracking-widest">{{ stat.label }}</p>
        <div class="h-px bg-white/5"></div>
        <p class="text-white text-2xl font-bold tabular-nums">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Campaign list -->
    <CampaignList
      :campaigns="campaigns"
      :is-owner="true"
      @select="$emit('select', $event)"
      @add="$emit('add')"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CampaignList from './CampaignList.vue'

const props = defineProps({
  campaigns: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['select', 'add'])

const summaryStats = computed(() => [
  {
    label: 'Total Campaigns',
    value: props.campaigns.length,
  },
  {
    label: 'Active Now',
    value: props.campaigns.filter(c => c.status === 'active').length,
  },
  {
    label: 'Total Raised',
    value: `${props.campaigns.reduce((sum, c) => sum + (c.raised || 0), 0).toFixed(3)} ETH`,
  },
])
</script>
