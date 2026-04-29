import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    phase: 'idle',
    sceneKey: null,
    eventQueue: [],
    variables: {},
    ui: {
      isMenuOpen: false,
    },
  }),

  getters: {
    isRunning: (state) => state.phase === 'running',
  },

  actions: {
    reset() {
      this.phase = 'idle'
      this.sceneKey = null
      this.eventQueue = []
      this.variables = {}
      this.ui = { isMenuOpen: false }
    },

    setPhase(phase) {
      this.phase = phase
    },

    setScene(sceneKey) {
      this.sceneKey = sceneKey
    },

    enqueueEvent(event) {
      this.eventQueue.push(event)
    },

    dequeueEvent() {
      return this.eventQueue.shift() ?? null
    },

    setVariable(key, value) {
      this.variables[key] = value
    },

    hydrate(payload) {
      this.phase = payload?.phase ?? 'idle'
      this.sceneKey = payload?.sceneKey ?? null
      this.eventQueue = Array.isArray(payload?.eventQueue) ? payload.eventQueue : []
      this.variables = payload?.variables && typeof payload.variables === 'object' ? payload.variables : {}
      this.ui = payload?.ui && typeof payload.ui === 'object' ? payload.ui : { isMenuOpen: false }
    },
  },
})
