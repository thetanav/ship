import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { hasUpstashRedis } from "@/lib/env";

let redisInstance: Redis | null = null;

export function getRedis() {
  if (!hasUpstashRedis()) {
    return null;
  }

  if (!redisInstance) {
    redisInstance = Redis.fromEnv();
  }

  return redisInstance;
}

export function makeRateLimiter(requests: number, period: Duration) {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(requests, period),
    analytics: true,
    prefix: "@ship/ratelimit",
  });
}
