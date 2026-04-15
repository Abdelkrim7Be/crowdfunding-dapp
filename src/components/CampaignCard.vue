<template>
  <!-- HERO SECTION — full width -->
  <section
    v-if="section === 'hero' || section === 'full'"
    class="w-full animate-fade-up"
  >
    <p
      class="text-xs text-zinc-500 uppercase tracking-[0.2em] mb-4 font-medium"
    >
      Live Campaign
    </p>

    <div
      class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3"
    >
      <h1
        class="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight"
      >
        {{ campaign.title || "Loading..." }}
      </h1>
      <!-- Status Badge -->
      <div v-if="campaign.title" class="self-start shrink-0 mt-1">
        <!-- Active -->
        <span
          v-if="!isEnded && !campaign.goalReached"
          class="inline-flex items-center gap-1.5 border border-white/20 text-white text-xs font-medium px-3 py-1 rounded-full"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
          ></span>
          Active
        </span>
        <!-- Goal Reached -->
        <span
          v-else-if="campaign.goalReached"
          class="inline-flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-3 py-1 rounded-full"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Goal Reached
        </span>
        <!-- Ended -->
        <span
          v-else
          class="inline-flex items-center gap-1.5 border border-white/10 text-zinc-500 text-xs font-medium px-3 py-1 rounded-full"
        >
          Ended
        </span>
      </div>
    </div>

    <p class="text-lg text-zinc-400 leading-relaxed max-w-xl">
      {{ campaign.description || "" }}
    </p>
    <div class="w-12 h-px bg-white/20 mt-5"></div>
  </section>

  <!-- STATS CARD — goes in left column -->
  <div
    v-if="section === 'stats' || section === 'full'"
    class="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-6 animate-fade-up"
    style="animation-delay: 150ms"
  >
    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div class="h-3 bg-white/10 rounded-full animate-pulse w-full"></div>
      <div class="h-3 bg-white/10 rounded-full animate-pulse w-2/3"></div>
      <div class="grid grid-cols-2 gap-3 mt-6">
        <div
          v-for="i in 4"
          :key="i"
          class="h-20 bg-white/5 rounded-xl animate-pulse"
        ></div>
      </div>
    </div>

    <template v-else>
      <!-- Progress Bar -->
      <div class="space-y-3">
        <div class="flex items-center justify-between text-sm">
          <span class="text-zinc-400 font-medium">Progress</span>
          <span class="text-white font-bold tabular-nums text-base"
            >{{ progressPercent }}%</span
          >
        </div>

        <!-- Track with milestone markers -->
        <div class="relative">
          <div class="h-3 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full progress-bar-fill"
              :style="{ width: `${Math.min(progressPercent, 100)}%` }"
            ></div>
          </div>
          <!-- Milestone dots at 25%, 50%, 75% -->
          <div
            v-for="m in [25, 50, 75]"
            :key="m"
            class="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full transition-colors duration-500"
            :class="progressPercent >= m ? 'bg-black' : 'bg-white/30'"
            :style="{ left: `calc(${m}% - 2px)` }"
          ></div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="group bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 hover:bg-white/8 transition-colors duration-200 cursor-default"
        >
          <div class="flex items-center gap-1.5">
            <span class="text-zinc-500 shrink-0" v-html="stat.icon"></span>
            <p
              class="text-zinc-500 text-xs font-medium uppercase tracking-widest leading-none"
            >
              {{ stat.label }}
            </p>
          </div>
          <div class="h-px bg-white/5"></div>
          <p class="text-white text-2xl font-bold tabular-nums leading-tight">
            {{ stat.displayValue }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  campaign: {
    type: Object,
    default: () => ({
      title: "",
      description: "",
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
  section: {
    type: String,
    default: "full",
    validator: (v) => ["hero", "stats", "full"].includes(v),
  },
});

// ── Animated counters ─────────────────────────────────────────────────────────

const displayRaised = ref(0);
const displayDonors = ref(0);

function animateCounter(refVal, target, duration = 900) {
  const start = refVal.value;
  const diff = target - start;
  if (diff === 0) return;
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    refVal.value = start + diff * ease;
    if (progress < 1) requestAnimationFrame(step);
    else refVal.value = target;
  }
  requestAnimationFrame(step);
}

watch(
  () => props.campaign.raised,
  (val) => animateCounter(displayRaised, val),
);
watch(
  () => props.campaign.donorsCount,
  (val) => animateCounter(displayDonors, val),
);

// ── Live countdown timer ───────────────────────────────────────────────────────

const localTimeLeft = ref(0);
let countdownInterval = null;

function startCountdown(seconds) {
  localTimeLeft.value = Math.max(0, Number(seconds));
  if (countdownInterval) clearInterval(countdownInterval);
  if (localTimeLeft.value <= 0) return;
  countdownInterval = setInterval(() => {
    if (localTimeLeft.value <= 0) {
      clearInterval(countdownInterval);
      return;
    }
    localTimeLeft.value -= 1;
  }, 1000);
}

// Sync whenever contract data refreshes (after transactions, on page load)
watch(
  () => props.campaign.timeLeft,
  (val) => startCountdown(val),
);

onMounted(() => {
  if (props.campaign.raised)
    animateCounter(displayRaised, props.campaign.raised);
  if (props.campaign.donorsCount)
    animateCounter(displayDonors, props.campaign.donorsCount);
  startCountdown(props.campaign.timeLeft);
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});

// ── Computed ──────────────────────────────────────────────────────────────────

const progressPercent = computed(() => {
  if (!props.campaign.goal || props.campaign.goal === 0) return 0;
  return Math.min(
    Math.round((props.campaign.raised / props.campaign.goal) * 100),
    100,
  );
});

const isEnded = computed(() => localTimeLeft.value <= 0);

const iconRaised = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L8 8H2l5 4-2 7 7-4 7 4-2-7 5-4h-6z"/></svg>`;
const iconGoal = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`;
const iconDonors = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
const iconTime = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

const stats = computed(() => [
  {
    label: "Total Raised",
    icon: iconRaised,
    displayValue: `${displayRaised.value.toFixed(3)} ETH`,
  },
  {
    label: "Goal",
    icon: iconGoal,
    displayValue: `${props.campaign.goal.toFixed(2)} ETH`,
  },
  {
    label: "Donors",
    icon: iconDonors,
    displayValue: Math.round(displayDonors.value),
  },
  {
    label: "Time Left",
    icon: iconTime,
    displayValue: formatTimeLeft(localTimeLeft.value),
  },
]);

function formatTimeLeft(seconds) {
  const s = Number(seconds);
  if (s <= 0) return "Ended";
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}
</script>

<style scoped>
.progress-bar-fill {
  background: white;
  transition: width 1s ease-in-out;
  position: relative;
  overflow: hidden;
}

.progress-bar-fill::after {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 2.5s infinite;
}

@keyframes shimmer {
  0% {
    left: -60%;
  }
  100% {
    left: 160%;
  }
}

.animate-fade-up {
  animation: fadeUp 0.5s ease-out both;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
