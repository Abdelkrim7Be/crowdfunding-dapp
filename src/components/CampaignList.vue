<template>
  <div class="space-y-6">
    <!-- Header row -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <h2 class="text-white font-bold text-xl tracking-tight">
        {{ isOwner ? 'My Campaigns' : 'Active Campaigns' }}
      </h2>

      <!-- Owner: add new button -->
      <button
        v-if="isOwner"
        @click="$emit('add')"
        class="flex items-center gap-1.5 bg-white text-black text-sm font-semibold rounded-full px-4 py-2 hover:bg-zinc-100 active:scale-95 transition-all duration-150"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Campaign
      </button>
    </div>

    <!-- Filter tabs — donor view -->
    <div v-if="!isOwner" class="flex items-center gap-2 flex-wrap">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeFilter = tab.value"
        :class="activeFilter === tab.value
          ? 'bg-white text-black font-semibold'
          : 'border border-white/20 text-zinc-400 hover:text-white hover:border-white/40'"
        class="text-xs px-3 py-1.5 rounded-full transition-all duration-150"
      >
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="ml-1 opacity-60">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Campaign grid -->
    <div v-if="filtered.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <CampaignCardPreview
        v-for="c in filtered"
        :key="c.id"
        :campaign="c"
        @select="$emit('select', c)"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="py-16 text-center space-y-3">
      <div class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
        <svg class="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <p class="text-zinc-400 text-sm font-medium">
        {{ isOwner ? 'No campaigns yet' : 'No campaigns found' }}
      </p>
      <p class="text-zinc-600 text-xs">
        {{ isOwner ? 'Click "New Campaign" to add your first one.' : 'Check back later.' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CampaignCardPreview from './CampaignCardPreview.vue'

const props = defineProps({
  campaigns: {
    type: Array,
    default: () => [],
  },
  isOwner: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['select', 'add'])

const activeFilter = ref('all')

const tabs = computed(() => [
  { label: 'All',       value: 'all',       count: props.campaigns.length },
  { label: 'Active',    value: 'active',    count: props.campaigns.filter(c => c.status === 'active').length },
  { label: 'Funded',    value: 'completed', count: props.campaigns.filter(c => c.status === 'completed').length },
  { label: 'Ended',     value: 'failed',    count: props.campaigns.filter(c => c.status === 'failed').length },
])

const filtered = computed(() => {
  if (props.isOwner || activeFilter.value === 'all') return props.campaigns
  return props.campaigns.filter(c => c.status === activeFilter.value)
})
</script>
