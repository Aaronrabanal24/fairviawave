const WINDOW_MS = 60_000

type Entry = {
  windowStart: number
  count: number
}

const store = new Map<string, Entry>()

/**
 * Returns true if request is allowed, false if rate limited.
 */
export function rateLimit(key: string, maxPerMinute: number, nowMs = Date.now()): boolean {
  const entry = store.get(key)

  if (!entry || nowMs - entry.windowStart >= WINDOW_MS) {
    store.set(key, { windowStart: nowMs, count: 1 })
    return true
  }

  if (entry.count >= maxPerMinute) {
    return false
  }

  entry.count += 1
  return true
}

export function resetRateLimitForTesting() {
  store.clear()
}
