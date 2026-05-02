const forbiddenPathSegments = new Set(["__proto__", "prototype", "constructor"])

const isIndex = (segment: string) => /^\d+$/.test(segment)

export const stripPrefix = (path: string, prefix: string) =>
  path.startsWith(prefix) ? path.slice(prefix.length) : path

export const clone = <T>(value: T): T => {
  const sc = globalThis.structuredClone
  if (typeof sc === "function") return sc(value)
  return JSON.parse(JSON.stringify(value)) as T
}

export const deepFreeze = <T>(value: T): T => {
  if (value == null) return value
  if (typeof value !== "object") return value

  const obj = value as Record<string, unknown>
  for (const k of Object.keys(obj)) deepFreeze(obj[k])
  return Object.freeze(value)
}

export const setByDotPath = (root: unknown, path: string, value: unknown) => {
  if (root == null || typeof root !== "object") throw new Error("root must be an object")
  if (!path) throw new Error("statPath is empty")

  const parts = path.split(".").filter(Boolean)
  if (!parts.length) throw new Error("statPath is empty")

  let cur: any = root
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i]
    if (forbiddenPathSegments.has(seg)) throw new Error("invalid statPath")

    const key: string | number = isIndex(seg) ? Number(seg) : seg
    const isLast = i === parts.length - 1

    if (isLast) {
      if (Array.isArray(cur) && typeof key === "number" && cur.length <= key) cur.length = key + 1
      cur[key as any] = value
      return
    }

    if (Array.isArray(cur) && typeof key === "number" && cur.length <= key) cur.length = key + 1

    const nextSeg = parts[i + 1]
    const nextWantsArray = isIndex(nextSeg)

    const existing = cur[key as any]
    if (existing == null || typeof existing !== "object") cur[key as any] = nextWantsArray ? [] : {}
    cur = cur[key as any]
  }
}
