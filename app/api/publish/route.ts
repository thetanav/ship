import { z } from "zod";
import { createPageId } from "@/lib/id";
import { jsonResponse, errorResponse } from "@/lib/http";
import { rateLimitPublish, rateLimitFiles, rateLimitGlobal } from "@/lib/rate-limit";
import { buildSinglePageHtml, buildMultiFileHtml } from "@/lib/site-builder";
import { pageExists, storePage } from "@/lib/site";
import type { PublishResponse } from "@/lib/types";
import { siteUrl } from "@/lib/config";
import { log, logError } from "@/lib/log";

const payloadSchema = z.object({
  html: z.string().min(1).max(1_000_000).optional(),
  files: z.record(z.string().min(1).max(1_000_000)).optional(),
}).refine((data) => data.html !== undefined || data.files !== undefined, {
  message: "Either 'html' or 'files' is required.",
}).refine((data) => !(data.html !== undefined && data.files !== undefined), {
  message: "Provide either 'html' or 'files', not both.",
}).refine((data) => {
  if (data.files) {
    return Object.keys(data.files).length > 0;
  }
  return true;
}, {
  message: "At least one file is required.",
});

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

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

  const isMultiFile = parsed.data.files !== undefined;

  const limit = isMultiFile
    ? await rateLimitFiles(`files:${ip}`)
    : await rateLimitPublish(`publish:${ip}`);

  if (!limit.allowed) {
    log(isMultiFile ? "rate_limit_files" : "rate_limit_publish", { ip });
    return errorResponse("Rate limit exceeded.", 429, {
      code: isMultiFile ? "FILES_RATE_LIMIT" : "PUBLISH_RATE_LIMIT",
      retryAfter: Math.ceil((limit.resetAt - Date.now()) / 1000),
    });
  }

  let html: string;
  try {
    html = isMultiFile
      ? buildMultiFileHtml(parsed.data.files!)
      : buildSinglePageHtml(parsed.data.html!);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : isMultiFile ? "Invalid files." : "Invalid HTML.",
      400,
      { code: isMultiFile ? "INVALID_FILES" : "INVALID_HTML" },
    );
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const id = createPageId(6);
    if (await pageExists(id)) {
      continue;
    }

    try {
      await storePage({ id, html });

      log(isMultiFile ? "publish_files_success" : "publish_success", {
        id,
        size: html.length,
        ip,
        ...(isMultiFile && { fileCount: Object.keys(parsed.data.files!).length }),
      });

      const response: PublishResponse = {
        success: true,
        id,
        url: `${siteUrl}/${id}`,
      };

      return jsonResponse(response, { status: 201 });
    } catch (err) {
      logError(isMultiFile ? "publish_files_retry" : "publish_retry", err, { attempt });
    }
  }

  return errorResponse("Unable to publish page. Please retry.", 500, {
    code: "PUBLISH_FAILED",
  });
}
