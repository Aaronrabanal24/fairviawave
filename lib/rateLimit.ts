const WINDOW_MS = 60_000
const MAX_KEYS = 5_000
const CLEANUP_INTERVAL_MS = 30_000

type Entry = {
  windowStart: number
  count: number
}

// Use global to persist across hot reloads in dev
const globalForRateLimit = globalThis as unknown as {
  rateLimitStore: Map<string, Entry>
  rateLimitCleanup?: NodeJS.Timeout
}

const store = globalForRateLimit.rateLimitStore ?? new Map<string, Entry>()
globalForRateLimit.rateLimitStore = store

// Periodic cleanup to prevent memory leak
function purgeExpired() {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart >= WINDOW_MS * 2) {
      store.delete(key)
    }
  }

  // Hard cap to prevent unbounded growth
  if (store.size > MAX_KEYS) {
    const toDelete = store.size - MAX_KEYS
    const it = store.keys()
    for (let i = 0; i < toDelete; i++) {
      const k = it.next().value
      if (k) store.delete(k)
    }
  }
}

// Set up cleanup interval (only once)
if (!globalForRateLimit.rateLimitCleanup) {
  globalForRateLimit.rateLimitCleanup = setInterval(purgeExpired, CLEANUP_INTERVAL_MS)
  // Allow process to exit even if interval is running
  if (globalForRateLimit.rateLimitCleanup.unref) {
    globalForRateLimit.rateLimitCleanup.unref()
  }
}

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
