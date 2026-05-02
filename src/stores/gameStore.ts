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
  npcs: {
    lin_xiaoyu: { relationship: 0 },
  },
}

deepFreeze(DEFAULT_GAME_STATE)

const isAllowedGamePath = (path: string) => {
  if (path === "currentSceneId") return true
  if (path === "player.baseStats.mood") return true
  if (path === "player.baseStats.energy") return true

  const parts = path.split(".").filter(Boolean)
  if (parts.length === 3 && parts[0] === "npcs" && parts[2] === "relationship" && parts[1]) return true
  return false
}

export const useGameStore = defineStore("gameStore", {
  state: (): GameState => clone(DEFAULT_GAME_STATE),
  actions: {
    updateStat(statPath: string, value: unknown) {
      const p = stripPrefix(stripPrefix(statPath, "gameStore."), "game.")
      if (!isAllowedGamePath(p)) throw new Error("statPath not allowed")
      setByDotPath(this.$state, p, value)
    },
    ensureNpc(id: string) {
      if (!this.npcs[id]) this.npcs[id] = { relationship: 0 }
      if (typeof this.npcs[id].relationship !== "number") this.npcs[id].relationship = 0
    },
  },
})
