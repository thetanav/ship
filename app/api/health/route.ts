import { jsonResponse } from "@/lib/http";
import { hasBlobStorage, hasUpstashRedis } from "@/lib/env";
import { siteUrl } from "@/lib/config";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const blob = hasBlobStorage();
  const redis = hasUpstashRedis();

  return jsonResponse({
    status: "ok",
    storage: blob && redis ? "blob+redis" : "local",
    hasBlobStorage: blob,
    hasRedis: redis,
    siteUrl,
    timestamp: new Date().toISOString(),
  });
}
