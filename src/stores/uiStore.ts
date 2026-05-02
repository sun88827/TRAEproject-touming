import { defineStore } from "pinia"

import type { UiEvent, UiState } from "./storeTypes"
import { clone, deepFreeze, setByDotPath, stripPrefix } from "./path"

const DEFAULT_UI_STATE: UiState = {
  eventQueue: [],
}

deepFreeze(DEFAULT_UI_STATE)

export const useUiStore = defineStore("uiStore", {
  state: (): UiState => clone(DEFAULT_UI_STATE),
  actions: {
    updateStat(statPath: string, value: unknown) {
      const p = stripPrefix(stripPrefix(statPath, "uiStore."), "ui.")
      setByDotPath(this.$state, p, value)
    },
    enqueueEvent(event: UiEvent) {
      this.eventQueue.push(event)
    },
    enqueue(type: string, payload?: unknown) {
      this.eventQueue.push({ type, payload, createdAt: Date.now() })
    },
    dequeueEvent() {
      return this.eventQueue.shift()
    },
    clearEvents() {
      this.eventQueue.length = 0
    },
  },
})
