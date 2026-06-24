export function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function hasUpstashRedis(): boolean {
  return Boolean(process.env.REDIS_URL);
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function getEnvName(): string {
  return process.env.NODE_ENV || "development";
}
