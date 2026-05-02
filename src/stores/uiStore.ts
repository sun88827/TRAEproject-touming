import { defineStore } from "pinia"

import type { UiEvent, UiState } from "./storeTypes"
import { clone, deepFreeze, setByDotPath, stripPrefix } from "./path"

const DEFAULT_UI_STATE: UiState = {
  isTransitioning: false,
  eventQueue: [],
}

deepFreeze(DEFAULT_UI_STATE)

const isAllowedUiPath = (path: string) => path === "isTransitioning" || path === "eventQueue"

export const useUiStore = defineStore("uiStore", {
  state: (): UiState => clone(DEFAULT_UI_STATE),
  actions: {
    updateStat(statPath: string, value: unknown) {
      const p = stripPrefix(stripPrefix(statPath, "uiStore."), "ui.")
      if (!isAllowedUiPath(p)) throw new Error("statPath not allowed")
      setByDotPath(this.$state, p, value)
    },
    pushEvent(event: UiEvent) {
      this.eventQueue.push(event)
    },
    push(type: string, payload?: unknown) {
      this.eventQueue.push({ type, payload, createdAt: Date.now() })
    },
    popEvent() {
      return this.eventQueue.shift()
    },
    clearEvents() {
      this.eventQueue.length = 0
    },
    setTransitioning(value: boolean) {
      this.isTransitioning = value
    },
  },
})
