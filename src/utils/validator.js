export const V2_WRITABLE_PATHS = Object.freeze([
  "player.mood",
  "player.energy",
]);

export function isWritablePath(path) {
  return typeof path === "string" && V2_WRITABLE_PATHS.includes(path);
}

export function getByPath(obj, path) {
  if (!obj || typeof obj !== "object" || typeof path !== "string") return undefined;
  const keys = path.split(".").filter(Boolean);
  let cur = obj;
  for (const key of keys) {
    if (!cur || typeof cur !== "object" || !(key in cur)) return undefined;
    cur = cur[key];
  }
  return cur;
}

export function setByPath(obj, path, value) {
  if (!obj || typeof obj !== "object" || typeof path !== "string") return false;
  const keys = path.split(".").filter(Boolean);
  if (!keys.length) return false;

  let cur = obj;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    if (!cur[key] || typeof cur[key] !== "object") cur[key] = {};
    cur = cur[key];
  }
  cur[keys[keys.length - 1]] = value;
  return true;
}

