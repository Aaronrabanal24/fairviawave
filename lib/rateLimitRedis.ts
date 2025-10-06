// Redis-based rate limiting with graceful fallback
// Supports both Redis and in-memory implementations

interface RateLimitResult {
  success: boolean
  count: number
  retryAfter?: number
}

// In-memory fallback store
const memoryStore = new Map<string, { count: number; resetTime: number }>()

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetTime) {
      memoryStore.delete(key)
    }
  }
}, 60000) // Cleanup every minute

/**
 * Enhanced rate limiting with Redis support and memory fallback
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const now = Date.now()
  
  // Try Redis first if available
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      return await redisRateLimit(key, limit, windowMs, now)
    } catch (error) {
      console.warn('Redis rate limit failed, using memory fallback:', error)
      // Fall through to memory implementation
    }
  }
  
  // Memory-based rate limiting fallback
  return memoryRateLimit(key, limit, windowMs, now)
}

/**
 * Redis-based sliding window rate limiting
 */
async function redisRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number
): Promise<RateLimitResult> {
  const windowKey = `rate_limit:${key}`
  const windowStart = now - windowMs
  
  // Use fetch API to call Upstash REST API
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL!
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN!
  
  // Remove expired entries and count current
  const pipeline = [
    ['ZREMRANGEBYSCORE', windowKey, 0, windowStart],
    ['ZCARD', windowKey],
    ['ZADD', windowKey, now, `${now}-${Math.random()}`],
    ['EXPIRE', windowKey, Math.ceil(windowMs / 1000)]
  ]
  
  const response = await fetch(`${upstashUrl}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${upstashToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pipeline),
  })
  
  if (!response.ok) {
    throw new Error(`Redis request failed: ${response.status}`)
  }
  
  const results = await response.json()
  const count = results[1].result || 0
  
  if (count >= limit) {
    // Remove the entry we just added
    await fetch(`${upstashUrl}/zpopmax/${windowKey}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${upstashToken}` },
    })
    
    const retryAfter = Math.ceil(windowMs / 1000)
    return { success: false, count, retryAfter }
  }
  
  return { success: true, count: count + 1 }
}

/**
 * Memory-based rate limiting fallback
 */
function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number
): RateLimitResult {
  const entry = memoryStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + windowMs })
    return { success: true, count: 1 }
  }
  
  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return { success: false, count: entry.count, retryAfter }
  }
  
  entry.count++
  return { success: true, count: entry.count }
}

/**
 * Original rate limiting function for backward compatibility
 */
export function rateLimitSync(key: string, maxPerMinute: number): boolean {
  const windowMs = 60000 // 1 minute
  const now = Date.now()
  
  const entry = memoryStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (entry.count >= maxPerMinute) {
    return false
  }
  
  entry.count++
  return true
}

/**
 * Rate limiting configurations for different endpoints
 */
export const RATE_LIMITS = {
  SIGNAL_API: { limit: 100, window: 3600000 }, // 100/hour per IP
  PUBLIC_TIMELINE: { limit: 60, window: 3600000 }, // 60/hour per IP
  AUTH_LOGIN: { limit: 5, window: 900000 }, // 5/15min per IP
} as const