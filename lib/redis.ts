import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export function makeRateLimiter(requests: number, period: Duration) {
  if (!redis) {
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(requests, period),
    prefix: "@ship/ratelimit",
  });
}
