import { defineStore } from 'pinia'

const createInitialState = () => ({
  currentSceneId: null,
  currentDay: 1,
  currentPeriod: 'morning',

  player: {
    name: 'Player',
    baseStats: {
      mood: 0,
      energy: 0,
      knowledge: 0,
    },
    flags: {},
  },

  npcs: {
    lin_xiaoyu: {
      relationship: 0,
      attention: 0,
      flags: {},
    },
  },

  triggeredGlobalEvents: [],
  pendingEvents: [],

  inventory: {
    items: [],
    money: 0,
  },
})

const resolveDotPath = (root, dotPath) => {
  if (typeof dotPath !== 'string' || dotPath.trim() === '') return null
  const parts = dotPath.split('.').filter(Boolean)
  if (parts.length === 0) return null

  let parent = root
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (parent == null || typeof parent !== 'object') return null
    parent = parent[parts[i]]
  }

  if (parent == null || typeof parent !== 'object') return null
  return { parent, key: parts[parts.length - 1] }
}

export const useGameStore = defineStore('game', {
  state: () => createInitialState(),

  actions: {
    reset() {
      Object.assign(this, createInitialState())
    },

    setCurrentSceneId(sceneId) {
      this.currentSceneId = sceneId
    },

    setCurrentDay(day) {
      this.currentDay = day
    },

    setCurrentPeriod(period) {
      this.currentPeriod = period
    },

    pushPendingEvent(event) {
      this.pendingEvents.push(event)
    },

    popPendingEvent() {
      return this.pendingEvents.shift() ?? null
    },

    markTriggeredGlobalEvent(triggerId) {
      if (!this.triggeredGlobalEvents.includes(triggerId)) {
        this.triggeredGlobalEvents.push(triggerId)
      }
    },

    applyStatDelta(target, value) {
      const resolved = resolveDotPath(this, target)
      if (!resolved) {
        console.error('[gameStore] invalid target path:', target)
        return
      }

      const current = resolved.parent[resolved.key]
      if (typeof current !== 'number' || typeof value !== 'number') {
        console.error('[gameStore] stat delta requires numbers:', { target, current, value })
        return
      }

      resolved.parent[resolved.key] = current + value
    },

    hydrate(payload) {
      const next = createInitialState()

      if (payload && typeof payload === 'object') {
        next.currentSceneId = payload.currentSceneId ?? next.currentSceneId
        next.currentDay = payload.currentDay ?? next.currentDay
        next.currentPeriod = payload.currentPeriod ?? next.currentPeriod

        next.player = payload.player && typeof payload.player === 'object' ? payload.player : next.player
        next.npcs = payload.npcs && typeof payload.npcs === 'object' ? payload.npcs : next.npcs

        next.triggeredGlobalEvents = Array.isArray(payload.triggeredGlobalEvents)
          ? payload.triggeredGlobalEvents
          : next.triggeredGlobalEvents

        next.pendingEvents = Array.isArray(payload.pendingEvents) ? payload.pendingEvents : next.pendingEvents
        next.inventory = payload.inventory && typeof payload.inventory === 'object' ? payload.inventory : next.inventory
      }

      Object.assign(this, next)
    },
  },
})
