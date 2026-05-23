import "server-only";

type Bucket = {
  // Timestamps (ms) of recent requests, oldest first.
  hits: number[];
};

const buckets = new Map<string, Bucket>();

const MINUTE_LIMIT = 8;
const HOUR_LIMIT = 40;
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

export type RateLimitResult =
  | { ok: true; retryAfterSec?: undefined }
  | { ok: false; retryAfterSec: number };

/**
 * Best-effort in-memory IP rate limiter. On Vercel serverless this is
 * per-instance; a determined attacker on a fresh lambda can bypass it.
 * Good enough for free-tier chat — swap for Upstash Redis when scaling.
 */
export function checkRate(ip: string): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(ip) ?? { hits: [] };

  // Drop hits older than 1 hour.
  bucket.hits = bucket.hits.filter((t) => now - t < HOUR_MS);

  const inLastMinute = bucket.hits.filter((t) => now - t < MINUTE_MS).length;
  if (inLastMinute >= MINUTE_LIMIT) {
    const oldestInMinute = bucket.hits.find((t) => now - t < MINUTE_MS)!;
    return {
      ok: false,
      retryAfterSec: Math.ceil((MINUTE_MS - (now - oldestInMinute)) / 1000),
    };
  }
  if (bucket.hits.length >= HOUR_LIMIT) {
    const oldest = bucket.hits[0]!;
    return {
      ok: false,
      retryAfterSec: Math.ceil((HOUR_MS - (now - oldest)) / 1000),
    };
  }

  bucket.hits.push(now);
  buckets.set(ip, bucket);
  return { ok: true };
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
