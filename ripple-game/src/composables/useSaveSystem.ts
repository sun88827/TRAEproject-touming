import { isRef, toRaw, unref } from 'vue'

type AnyRecord = Record<string, any>

export type RippleSaveData = {
  version: number
  savedAt: number
  currentSceneId?: string | number | null
  player?: AnyRecord
  npcs?: AnyRecord[] | AnyRecord
}

type UseSaveSystemOptions = {
  keyPrefix?: string
  getSaveData?: () => Omit<RippleSaveData, 'version' | 'savedAt'>
  applySaveData?: (data: RippleSaveData) => void
}

const DEFAULT_KEY_PREFIX = 'ripple_save_'
const DROP_KEYS = new Set([
  'uiStore',
  'isTransitioning',
  'eventQueue',
  'transitionQueue',
  'toastQueue',
  'modal',
  'dialogs',
  'loading',
  'pending',
  'selected',
  'hovered',
  'dragging',
  'debug',
])

function normalizeForSerialize(value: any): any {
  if (isRef(value)) return unref(value)
  if (value && typeof value === 'object') return toRaw(value)
  return value
}

function shouldDropKey(key: string): boolean {
  if (!key) return false
  if (DROP_KEYS.has(key)) return true
  if (key.startsWith('__')) return true
  return false
}

function safeStringify(value: any): string {
  const seen = new WeakSet<object>()

  return JSON.stringify(normalizeForSerialize(value), (key, rawValue) => {
    if (shouldDropKey(key)) return undefined

    const val = normalizeForSerialize(rawValue)

    if (val && typeof val === 'object') {
      if (seen.has(val)) return undefined
      seen.add(val)
    }

    return val
  })
}

export function useSaveSystem(options: UseSaveSystemOptions = {}) {
  const keyPrefix = options.keyPrefix ?? DEFAULT_KEY_PREFIX

  function makeKey(slot: number) {
    return `${keyPrefix}${slot}`
  }

  function hasSave(slot = 1) {
    try {
      return localStorage.getItem(makeKey(slot)) != null
    } catch {
      return false
    }
  }

  function saveGame(slot = 1) {
    if (!options.getSaveData) return false

    const payload: RippleSaveData = {
      version: 1,
      savedAt: Date.now(),
      ...options.getSaveData(),
    }

    try {
      localStorage.setItem(makeKey(slot), safeStringify(payload))
      return true
    } catch {
      return false
    }
  }

  function loadGame(slot = 1) {
    let raw: string | null = null
    try {
      raw = localStorage.getItem(makeKey(slot))
    } catch {
      raw = null
    }

    if (!raw) return null

    try {
      const data = JSON.parse(raw) as RippleSaveData
      options.applySaveData?.(data)
      return data
    } catch {
      return null
    }
  }

  return { saveGame, loadGame, hasSave }
}
