export function parseSort(sort, allowedKeys, fallbackKey) {
  if (!sort) return { key: fallbackKey, dir: "asc" }
  const [k, d] = String(sort).split(":")
  const key = allowedKeys.includes(k) ? k : fallbackKey
  const dir = d === "desc" ? "desc" : "asc"
  return { key, dir }
}

export function like(val) {
  return `%${String(val).trim()}%`
}
