<template>
  <section class="w-full">
    <!-- Hero -->
    <div class="mb-10">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
          {{ campaign.title || 'Loading campaign...' }}
        </h1>
        <!-- Status Badge -->
        <span
          v-if="campaign.title"
          :class="statusBadgeClass"
          class="self-start shrink-0 text-xs font-semibold px-3 py-1 rounded-full border"
        >
          {{ statusLabel }}
        </span>
      </div>
      <p class="text-zinc-400 text-base leading-relaxed max-w-2xl">
        {{ campaign.description || '' }}
      </p>
    </div>

    <!-- Campaign Card -->
    <div class="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-4">
        <div class="h-4 bg-white/10 rounded-full animate-pulse w-full"></div>
        <div class="h-4 bg-white/10 rounded-full animate-pulse w-2/3"></div>
        <div class="grid grid-cols-2 gap-3 mt-6">
          <div v-for="i in 4" :key="i" class="h-16 bg-white/5 rounded-xl animate-pulse"></div>
        </div>
      </div>

      <template v-else>
        <!-- Progress Bar -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-zinc-400 font-medium">Progress</span>
            <span class="text-white font-semibold tabular-nums">{{ progressPercent }}%</span>
          </div>
          <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full bg-white rounded-full transition-all duration-700 ease-out"
              :style="{ width: `${Math.min(progressPercent, 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1"
          >
            <p class="text-zinc-500 text-xs font-medium uppercase tracking-wider">{{ stat.label }}</p>
            <p class="text-white text-lg font-bold tabular-nums leading-tight">{{ stat.value }}</p>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  campaign: {
    type: Object,
    default: () => ({
      title: '',
      description: '',
      goal: 0,
      raised: 0,
      timeLeft: 0,
      goalReached: false,
      donorsCount: 0,
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const progressPercent = computed(() => {
  if (!props.campaign.goal || props.campaign.goal === 0) return 0
  return Math.min(Math.round((props.campaign.raised / props.campaign.goal) * 100), 100)
})

const isEnded = computed(() => Number(props.campaign.timeLeft) <= 0)

const statusLabel = computed(() => {
  if (props.campaign.goalReached) return 'Goal Reached'
  if (isEnded.value) return 'Ended'
  return 'Active'
})

const statusBadgeClass = computed(() => {
  if (props.campaign.goalReached) return 'bg-white text-black border-white'
  if (isEnded.value) return 'text-zinc-500 border-white/20'
  return 'text-white border-white/20'
})

const stats = computed(() => [
  {
    label: 'Total Raised',
    value: `${props.campaign.raised.toFixed(4)} ETH`,
  },
  {
    label: 'Goal',
    value: `${props.campaign.goal.toFixed(2)} ETH`,
  },
  {
    label: 'Donors',
    value: props.campaign.donorsCount,
  },
  {
    label: 'Time Left',
    value: formatTimeLeft(props.campaign.timeLeft),
  },
])

function formatTimeLeft(seconds) {
  const s = Number(seconds)
  if (s <= 0) return 'Ended'
  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
</script>
