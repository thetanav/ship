import { z } from "zod";
import { createPageId } from "@/lib/id";
import { jsonResponse } from "@/lib/http";
import { rateLimitFiles } from "@/lib/rate-limit";
import { buildMultiFileHtml } from "@/lib/site-builder";
import { pageExists, storePage } from "@/lib/site";
import type { PublishResponse } from "@/lib/types";
import { siteUrl } from "@/lib/config";

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

  const limit = await rateLimitFiles(`files:${ip}`);
  if (!limit.allowed) {
    return jsonResponse(
      { success: false, error: "Rate limit exceeded." },
      { status: 429, headers: { "retry-after": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return jsonResponse({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  let html: string;
  try {
    html = buildMultiFileHtml(parsed.data.files);
  } catch (error) {
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Invalid files." },
      { status: 400 },
    );
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const id = createPageId(6);
    if (await pageExists(id)) {
      continue;
    }

    try {
      await storePage({ id, html });

      const response: PublishResponse = {
        success: true,
        id,
        url: `${siteUrl}/${id}`,
      };

      return jsonResponse(response, { status: 201 });
    } catch {
      // Retry on collisions or transient storage errors.
    }
  }

  return jsonResponse(
    { success: false, error: "Unable to publish files. Please retry." },
    { status: 500 },
  );
}
