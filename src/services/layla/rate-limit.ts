import { LAYLA_LIMITS } from "@/config/layla";

const hits = new Map<string, number[]>();

/** Sliding-window throttle per client IP. In-memory, so on serverless it limits
 * per warm instance only — a cost brake against loops and casual abuse, not a
 * security boundary. Use a shared store (KV/Redis) if stronger limits are needed. */
export function checkRateLimit(key: string): boolean {
  const { windowMs, max } = LAYLA_LIMITS.rateLimit;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [ip, times] of hits) if (times.every((at) => now - at >= windowMs)) hits.delete(ip);
  }
  return true;
}
