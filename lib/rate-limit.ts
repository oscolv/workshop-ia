type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export type RateLimitOptions = { limit: number; windowSec: number }

// In-memory por simplicidad; Vercel Fluid Compute reusa instancias, así que
// el estado sobrevive entre requests de la misma región (no es exacto
// cross-región, pero para 10 msg/hora es suficiente).
export async function rateLimit(key: string, { limit, windowSec }: RateLimitOptions): Promise<boolean> {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSec * 1000 })
    return true
  }
  if (bucket.count >= limit) return false
  bucket.count += 1
  return true
}

/** Solo para tests. */
export function _resetForTest() {
  buckets.clear()
}
