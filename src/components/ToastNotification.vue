<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 bg-black border border-white/20 rounded-2xl px-4 py-3.5 shadow-2xl min-w-[280px] max-w-[360px]"
        >
          <!-- Icon -->
          <div class="shrink-0 mt-0.5">
            <svg v-if="toast.type === 'pending'" class="animate-spin w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <svg v-else-if="toast.type === 'success'" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg v-else-if="toast.type === 'error'" class="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>

          <!-- Message -->
          <div class="flex-1 min-w-0 space-y-0.5">
            <p class="text-white text-sm font-medium leading-snug">{{ toast.title }}</p>
            <p v-if="toast.message" class="text-zinc-500 text-xs leading-snug break-words">{{ toast.message }}</p>
          </div>

          <!-- Close -->
          <button
            @click="remove(toast.id)"
            class="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors mt-0.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
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
  toasts.value.push({ id, type, title, message })
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
  transform: translateY(12px) scale(0.96);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.toast-move {
  transition: transform 0.2s ease;
}
</style>
