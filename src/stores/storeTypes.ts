export type SceneId = string | null

export type StatValue = number | string | boolean | null

export interface PlayerBaseStats {
  mood: number
  energy: number
  [key: string]: StatValue
}

export interface PlayerState {
  baseStats: PlayerBaseStats
}

export interface NpcState {
  relationship: number
  [key: string]: StatValue
}

export interface GameState {
  currentSceneId: SceneId
  player: PlayerState
  npcs: Record<string, NpcState>
}

export interface UiEvent<T = unknown> {
  type: string
  payload?: T
  createdAt: number
}

export interface UiState {
  isTransitioning: boolean
  eventQueue: UiEvent[]
}
