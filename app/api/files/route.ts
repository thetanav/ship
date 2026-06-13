import { z } from "zod";
import { createPageId } from "@/lib/id";
import { jsonResponse, errorResponse } from "@/lib/http";
import { rateLimitFiles, rateLimitGlobal } from "@/lib/rate-limit";
import { buildMultiFileHtml } from "@/lib/site-builder";
import { pageExists, storePage } from "@/lib/site";
import type { PublishResponse } from "@/lib/types";
import { siteUrl } from "@/lib/config";
import { log, logError } from "@/lib/log";

const payloadSchema = z.object({
  files: z.record(z.string().min(1).max(1_000_000)).refine((files) => Object.keys(files).length > 0, {
    message: "At least one file is required.",
  }),
});

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const global = await rateLimitGlobal(`global:${ip}`);
  if (!global.allowed) {
    log("rate_limit_global", { ip, route: "files" });
    return errorResponse("Rate limit exceeded.", 429, {
      code: "GLOBAL_RATE_LIMIT",
      retryAfter: Math.ceil((global.resetAt - Date.now()) / 1000),
    });
  }

  const limit = await rateLimitFiles(`files:${ip}`);
  if (!limit.allowed) {
    log("rate_limit_files", { ip });
    return errorResponse("Rate limit exceeded.", 429, {
      code: "FILES_RATE_LIMIT",
      retryAfter: Math.ceil((limit.resetAt - Date.now()) / 1000),
    });
  }

  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return errorResponse("Invalid request body.", 400, { code: "INVALID_BODY" });
  }

  let html: string;
  try {
    html = buildMultiFileHtml(parsed.data.files);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Invalid files.",
      400,
      { code: "INVALID_FILES" },
    );
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const id = createPageId(6);
    if (await pageExists(id)) {
      continue;
    }

    try {
      await storePage({ id, html });

      log("files_success", { id, fileCount: Object.keys(parsed.data.files).length, ip });

      const response: PublishResponse = {
        success: true,
        id,
        url: `${siteUrl}/${id}`,
      };

      return jsonResponse(response, { status: 201 });
    } catch (err) {
      logError("files_retry", err, { attempt });
    }
  }

  return errorResponse("Unable to publish files. Please retry.", 500, {
    code: "FILES_PUBLISH_FAILED",
  });
}
