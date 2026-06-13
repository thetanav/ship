import { makeRateLimiter } from "@/lib/redis";

export type LimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const publishLimiter = makeRateLimiter(20, "60 s");
const filesLimiter = makeRateLimiter(10, "60 s");
const reportLimiter = makeRateLimiter(20, "60 s");
const globalLimiter = makeRateLimiter(200, "60 s");

export async function rateLimitPublish(key: string): Promise<LimitResult> {
  return rateLimitWithFallback(publishLimiter, key, 20, 60_000);
}

export async function rateLimitFiles(key: string): Promise<LimitResult> {
  return rateLimitWithFallback(filesLimiter, key, 10, 60_000);
}

export async function rateLimitReport(key: string): Promise<LimitResult> {
  return rateLimitWithFallback(reportLimiter, key, 20, 60_000);
}

export async function rateLimitGlobal(key: string): Promise<LimitResult> {
  return rateLimitWithFallback(globalLimiter, key, 200, 60_000);
}

export async function rateLimitCheck(key: string, limit: number, windowMs: number): Promise<LimitResult> {
  const limiter = makeRateLimiter(limit, `${Math.floor(windowMs / 1000)} s`);
  return rateLimitWithFallback(limiter, key, limit, windowMs);
}

async function rateLimitWithFallback(
  limiter: ReturnType<typeof makeRateLimiter> | null,
  key: string,
  limit: number,
  windowMs: number,
) {
  if (limiter) {
    const result = await limiter.limit(key);
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  }

  const now = Date.now();
  const bucket = fallbackBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    fallbackBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

function cleanupExpiredBuckets() {
  const now = Date.now();
  for (const [key, bucket] of fallbackBuckets) {
    if (bucket.resetAt <= now) {
      fallbackBuckets.delete(key);
    }
  }
}

type Bucket = {
  count: number;
  resetAt: number;
};

const fallbackBuckets = new Map<string, Bucket>();

setInterval(cleanupExpiredBuckets, 60_000);
