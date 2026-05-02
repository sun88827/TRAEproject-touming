import { defineStore } from "pinia"

import type { GameState } from "./storeTypes"
import { clone, deepFreeze, setByDotPath, stripPrefix } from "./path"

const DEFAULT_GAME_STATE: GameState = {
  currentSceneId: null,
  player: {
    baseStats: {
      mood: 0,
      energy: 0,
    },
  },
  npcs: {},
}

deepFreeze(DEFAULT_GAME_STATE)

export const useGameStore = defineStore("gameStore", {
  state: (): GameState => clone(DEFAULT_GAME_STATE),
  actions: {
    updateStat(statPath: string, value: unknown) {
      const p = stripPrefix(stripPrefix(statPath, "gameStore."), "game.")
      setByDotPath(this.$state, p, value)
    },
    ensureNpc(id: string) {
      if (!this.npcs[id]) this.npcs[id] = { relationship: 0 }
      if (typeof this.npcs[id].relationship !== "number") this.npcs[id].relationship = 0
    },
  },
})
