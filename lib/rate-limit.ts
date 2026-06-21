import "server-only"

/**
 * Rate limiter with Upstash Redis when env vars are present,
 * falling back to a simple in-memory store for local dev.
 *
 * Usage:
 *   const { success } = await licenseUploadLimiter.limit(ip)
 *   if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 */

interface LimitResult {
  success: boolean
}

interface Limiter {
  limit(key: string): Promise<LimitResult>
}

// ── In-memory fallback (dev only) ─────────────────────────────────────────────

type WindowEntry = { count: number; resetAt: number }

function createInMemoryLimiter(maxRequests: number, windowMs: number): Limiter {
  const store = new Map<string, WindowEntry>()

  return {
    async limit(key: string): Promise<LimitResult> {
      const now = Date.now()
      const entry = store.get(key)

      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs })
        return { success: true }
      }

      if (entry.count >= maxRequests) {
        return { success: false }
      }

      entry.count++
      return { success: true }
    },
  }
}

// ── Upstash limiter (production) ───────────────────────────────────────────────

async function createUpstashLimiter(
  maxRequests: number,
  windowSeconds: number,
): Promise<Limiter> {
  const { Redis } = await import("@upstash/redis")
  const { Ratelimit } = await import("@upstash/ratelimit")

  const redis = Redis.fromEnv()
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
  })

  return {
    async limit(key: string): Promise<LimitResult> {
      const result = await ratelimit.limit(key)
      return { success: result.success }
    },
  }
}

// ── Factory ────────────────────────────────────────────────────────────────────

function buildLimiter(maxRequests: number, windowSeconds: number): Limiter {
  const hasUpstash =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

  if (hasUpstash) {
    let cached: Limiter | null = null
    return {
      async limit(key: string): Promise<LimitResult> {
        if (!cached)
          cached = await createUpstashLimiter(maxRequests, windowSeconds)
        return cached.limit(key)
      },
    }
  }

  return createInMemoryLimiter(maxRequests, windowSeconds * 1000)
}

// ── Exported limiters ──────────────────────────────────────────────────────────

/** 3 license uploads per hour per IP. */
export const licenseUploadLimiter = buildLimiter(3, 3600)

/** 3 payment attempts per minute per IP. */
export const paymentLimiter = buildLimiter(3, 60)

/** 5 shipping-rate requests per minute per IP. */
export const shippingRatesLimiter = buildLimiter(5, 60)
