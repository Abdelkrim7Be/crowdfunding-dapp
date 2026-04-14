<template>
  <Teleport to="body">
    <div class="fixed z-[100] flex flex-col gap-2.5 pointer-events-none bottom-0 right-0 sm:bottom-6 sm:right-6">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto relative overflow-hidden bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-[calc(100vw-2rem)] sm:w-auto sm:min-w-72 sm:max-w-80"
        >
          <div class="flex items-start gap-3 px-4 pt-4 pb-3.5">
            <!-- Icon -->
            <div class="shrink-0 mt-0.5">
              <svg v-if="t.type === 'pending'" class="animate-spin w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <svg v-else-if="t.type === 'success'" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <svg v-else-if="t.type === 'error'" class="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>

            <!-- Text -->
            <div class="flex-1 min-w-0 space-y-0.5">
              <p class="text-white text-sm font-medium leading-snug">{{ t.title }}</p>
              <p v-if="t.message" class="text-zinc-500 text-xs leading-snug break-words">{{ t.message }}</p>
            </div>

            <!-- Close -->
            <button @click="remove(t.id)" class="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Dismiss countdown bar (only for non-pending) -->
          <div v-if="t.type !== 'pending'" class="h-px bg-white/5 mx-4">
            <div
              class="h-full bg-white/30 rounded-full"
              :class="`toast-progress-${t.id}`"
              :style="{ animation: `toastProgress ${t.duration ?? 4000}ms linear forwards` }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

function add({ type = 'success', title, message = '', duration = 4000 }) {
  const id = ++nextId
  toasts.value.push({ id, type, title, message, duration })
  if (type !== 'pending' && duration > 0) {
    setTimeout(() => remove(id), duration)
  }
  return id
}

function remove(id) {
  const idx = toasts.value.findIndex(t => t.id === id)
  if (idx !== -1) toasts.value.splice(idx, 1)
}

function updateById(id, updates) {
  const toast = toasts.value.find(t => t.id === id)
  if (toast) Object.assign(toast, updates)
  if (updates.type && updates.type !== 'pending') {
    setTimeout(() => remove(id), updates.duration ?? 4000)
  }
}

defineExpose({ add, remove, updateById })
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(calc(100% + 1.5rem));
}
.toast-move {
  transition: transform 0.2s ease;
}

@keyframes toastProgress {
  from { width: 100%; }
  to   { width: 0%; }
}
</style>
