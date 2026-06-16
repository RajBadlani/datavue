import { redis } from '@/lib/redis'

// ─── Sliding-Window Rate Limiter ────────────────────────────────────────────
// Backed by a Redis sorted set per key: members are individual request
// timestamps, scored by time. On each check we drop entries older than the
// window, count what remains, and admit the request only if we are under the
// limit. This gives a true sliding window (no fixed-boundary burst) and is
// cheap enough for a per-user chat endpoint.

const ONE_HOUR_MS = 60 * 60 * 1000
const DEFAULT_LIMIT = 60

export type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  /** Seconds until the caller may retry (0 when allowed). */
  retryAfterSeconds: number
}

function resolveLimit(explicit?: number): number {
  if (typeof explicit === 'number' && Number.isFinite(explicit) && explicit > 0) {
    return Math.floor(explicit)
  }

  const fromEnv = Number(process.env.CHAT_RATE_LIMIT_PER_HOUR)
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    return Math.floor(fromEnv)
  }

  return DEFAULT_LIMIT
}

/**
 * Check (and record) a request against a sliding-window limit.
 *
 * Fail-open: this is a non-critical abuse/cost guard, not an auth gate. If Redis
 * is unreachable or slow, we allow the request rather than take the endpoint
 * offline. The shared ioredis client uses maxRetriesPerRequest: null (for
 * BullMQ), so a down Redis would otherwise queue commands and hang the request;
 * the timeout below bounds that.
 *
 * @param key       a stable identifier for the subject being limited (e.g. `chat:<userId>`)
 * @param limit     max requests allowed per window (defaults to CHAT_RATE_LIMIT_PER_HOUR env or 60)
 * @param windowMs  window length in milliseconds (defaults to 1 hour)
 */
export async function checkRateLimit(
  key: string,
  limit?: number,
  windowMs: number = ONE_HOUR_MS,
): Promise<RateLimitResult> {
  const maxRequests = resolveLimit(limit)

  try {
    return await withTimeout(enforceRateLimit(key, maxRequests, windowMs), REDIS_TIMEOUT_MS)
  } catch (error) {
    // Fail open — allow the request but log so the outage is visible.
    console.error(`[rate-limit] Redis unavailable for "${key}", allowing request:`, error)
    return { allowed: true, limit: maxRequests, remaining: maxRequests, retryAfterSeconds: 0 }
  }
}

const REDIS_TIMEOUT_MS = 1000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('rate-limit redis timeout')), ms),
    ),
  ])
}

async function enforceRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const redisKey = `ratelimit:${key}`
  const now = Date.now()
  const windowStart = now - windowMs

  // Drop expired entries and count what remains in one trip.
  const pipeline = redis.pipeline()
  pipeline.zremrangebyscore(redisKey, 0, windowStart)
  pipeline.zcard(redisKey)
  const results = await pipeline.exec()

  // results[1] is the zcard reply: [error, count]
  const currentCount = Number(results?.[1]?.[1] ?? 0)

  if (currentCount >= maxRequests) {
    // Over the limit — find the oldest in-window entry to compute Retry-After.
    const oldest = await redis.zrange(redisKey, 0, 0, 'WITHSCORES')
    const oldestScore = oldest.length >= 2 ? Number(oldest[1]) : now
    const retryAfterMs = Math.max(0, oldestScore + windowMs - now)

    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }

  // Admit the request: record this timestamp and (re)set the key TTL together.
  // pexpire must run AFTER zadd — it only sets a TTL on a key that exists, so
  // doing it before zadd would leave brand-new keys with no expiry (leak).
  // A unique suffix keeps concurrent requests in the same millisecond from
  // colliding on the same member. Note: count-then-add is best-effort under
  // heavy concurrency (two requests can both admit at the boundary); that is an
  // acceptable tradeoff for a cost/abuse guard.
  const member = `${now}-${Math.random().toString(36).slice(2)}`
  const admitPipeline = redis.pipeline()
  admitPipeline.zadd(redisKey, now, member)
  admitPipeline.pexpire(redisKey, windowMs)
  await admitPipeline.exec()

  return {
    allowed: true,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - currentCount - 1),
    retryAfterSeconds: 0,
  }
}
