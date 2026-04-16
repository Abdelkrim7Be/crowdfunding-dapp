import { ref, computed } from 'vue'

const STORAGE_KEY = 'fundchain_campaigns'
const ACTIVE_KEY  = 'fundchain_active_campaign'

export function useCampaigns() {
  const campaigns        = ref(load())
  const activeCampaignId = ref(localStorage.getItem(ACTIVE_KEY) || null)

  // ── Persistence ─────────────────────────────────────────────────────────────

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns.value))
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  function addCampaign(data) {
    campaigns.value.unshift(data)   // newest first
    persist()
    setActive(data.id)
  }

  function updateCampaign(id, updates) {
    const idx = campaigns.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      Object.assign(campaigns.value[idx], updates, { lastUpdated: Date.now() })
      persist()
    }
  }

  function removeCampaign(id) {
    campaigns.value = campaigns.value.filter(c => c.id !== id)
    persist()
    if (activeCampaignId.value === id) {
      setActive(campaigns.value[0]?.id || null)
    }
  }

  function setActive(id) {
    activeCampaignId.value = id
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else     localStorage.removeItem(ACTIVE_KEY)
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const activeCampaign = computed(() =>
    campaigns.value.find(c => c.id === activeCampaignId.value) || null
  )

  const totalRaisedAllTime = computed(() =>
    campaigns.value.reduce((sum, c) => sum + (c.raised || 0), 0)
  )

  const activeCount = computed(() =>
    campaigns.value.filter(c => c.status === 'active').length
  )

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function generateId() {
    return `campaign_${Date.now()}`
  }

  /**
   * Derive campaign status from cached contract data.
   * goalReached → completed | timeLeft 0 & not reached → failed | else active
   */
  function detectStatus(data) {
    if (data.goalReached) return 'completed'
    if (Number(data.timeLeft) <= 0) return 'failed'
    return 'active'
  }

  return {
    campaigns,
    activeCampaignId,
    activeCampaign,
    totalRaisedAllTime,
    activeCount,
    addCampaign,
    updateCampaign,
    removeCampaign,
    setActive,
    generateId,
    detectStatus,
  }
}
