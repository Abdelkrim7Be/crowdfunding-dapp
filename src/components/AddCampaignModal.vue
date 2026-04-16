<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

        <!-- Panel -->
        <div class="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">

          <!-- Header -->
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <h2 class="text-white font-semibold text-base tracking-tight">Add New Campaign</h2>
              <p class="text-zinc-500 text-sm">Deploy your contract in Remix IDE first, then paste the address here.</p>
            </div>
            <button @click="$emit('close')" class="text-zinc-600 hover:text-zinc-300 transition-colors mt-0.5 shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Reminder steps -->
          <div class="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <p class="text-zinc-400 text-xs font-medium uppercase tracking-widest">Before you paste</p>
            <ol class="space-y-1.5 list-decimal list-inside">
              <li class="text-zinc-500 text-xs">Open <span class="text-zinc-300">Remix IDE</span> and deploy <span class="text-zinc-300">Crowdfunding.sol</span></li>
              <li class="text-zinc-500 text-xs">Make sure MetaMask is on the <span class="text-zinc-300">Ganache</span> network</li>
              <li class="text-zinc-500 text-xs">Copy the deployed contract address below</li>
            </ol>
          </div>

          <!-- Address input -->
          <div class="space-y-1.5">
            <label class="text-xs text-zinc-500 font-medium uppercase tracking-widest">Contract Address</label>
            <input
              v-model="address"
              type="text"
              placeholder="0x..."
              :disabled="loading"
              @input="error = ''"
              class="w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-zinc-600 outline-none transition-colors duration-200 disabled:opacity-40"
              :class="error ? 'border-red-500/60' : 'border-white/10 focus:border-white/30'"
            />
            <p v-if="error" class="text-red-400 text-xs">{{ error }}</p>
          </div>

          <!-- Action button -->
          <button
            @click="handleAdd"
            :disabled="!address.trim() || loading"
            class="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-full px-6 py-3 text-sm hover:bg-zinc-100 active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <svg v-if="loading" class="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span>{{ loading ? 'Fetching contract data...' : 'Add Campaign' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'submit'])

const address = ref('')
const error   = ref('')
const loading = ref(false)

// Reset when opened
watch(() => props.open, (val) => {
  if (val) {
    address.value = ''
    error.value   = ''
    loading.value = false
  }
})

function isValidAddress(addr) {
  return /^0x[0-9a-fA-F]{40}$/.test(addr.trim())
}

async function handleAdd() {
  error.value = ''
  const addr = address.value.trim()

  if (!isValidAddress(addr)) {
    error.value = 'Invalid Ethereum address. Must start with 0x and be 42 characters.'
    return
  }

  loading.value = true
  try {
    emit('submit', addr)
  } finally {
    loading.value = false
  }
}

// Allow parent to set loading state from outside
defineExpose({ setLoading: (v) => { loading.value = v }, setError: (msg) => { error.value = msg } })
</script>

<style scoped>
.modal-enter-active { transition: all 0.2s ease-out; }
.modal-leave-active { transition: all 0.15s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .relative { transform: scale(0.97) translateY(8px); }
</style>
