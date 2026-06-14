import { z } from "zod";
import { createUniquePageId } from "@/lib/id";
import { jsonResponse, errorResponse } from "@/lib/http";
import { rateLimitPublish, rateLimitGlobal } from "@/lib/rate-limit";
import { storePage } from "@/lib/site";
import { sanitizeHtml } from "@/lib/sanitize";
import type { PublishResponse } from "@/lib/types";
import { log, logError } from "@/lib/log";
import { siteUrl } from "@/lib/config";

const payloadSchema = z.object({
  html: z.string().min(1).max(1_000_000),
});

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: Request): Promise<Response> {
  const ip = getClientIp(request);

  const global = await rateLimitGlobal(`global:${ip}`);
  if (!global.allowed) {
    log("rate_limit_global", { ip, route: "publish" });
    return errorResponse("Rate limit exceeded.", 429, {
      code: "GLOBAL_RATE_LIMIT",
      retryAfter: Math.ceil((global.resetAt - Date.now()) / 1000),
    });
  }

  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return errorResponse(
      parsed.error.errors[0]?.message ?? "Invalid request body.",
      400,
      { code: "INVALID_BODY" },
    );
  }

  const limit = await rateLimitPublish(`publish:${ip}`);
  if (!limit.allowed) {
    log("rate_limit_publish", { ip });
    return errorResponse("Rate limit exceeded.", 429, {
      code: "PUBLISH_RATE_LIMIT",
      retryAfter: Math.ceil((limit.resetAt - Date.now()) / 1000),
    });
  }

  const html = sanitizeHtml(parsed.data.html);
  const id = await createUniquePageId(6);

  try {
    await storePage({ id, html });

    log("publish_success", { id, size: html.length, ip });

    const response: PublishResponse = {
      success: true,
      id,
      url: `${siteUrl}/${id}`,
    };

    return jsonResponse(response, { status: 201 });
  } catch (err) {
    logError("publish_failed", err, { id, ip });
    return errorResponse("Unable to publish page. Please retry.", 500, {
      code: "PUBLISH_FAILED",
    });
  }
}
