import { z } from "zod";
import { createPageId } from "@/lib/id";
import { jsonResponse } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { buildSinglePageHtml } from "@/lib/site-builder";
import { pageExists, storePage } from "@/lib/site";
import type { PublishResponse } from "@/lib/types";
import { siteUrl } from "@/lib/config";

const payloadSchema = z.object({
  html: z.string().min(1).max(1_000_000),
});

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const limit = rateLimit(`publish:${ip}`, 20, 60_000);
  if (!limit.allowed) {
    return jsonResponse(
      { success: false, error: "Rate limit exceeded." },
      { status: 429, headers: { "retry-after": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return jsonResponse(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  let html: string;
  try {
    html = buildSinglePageHtml(parsed.data.html);
  } catch (error) {
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Invalid HTML." },
      { status: 400 },
    );
  }

  let id = createPageId(6);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (!(await pageExists(id))) {
      break;
    }
    id = createPageId(6);
  }

  await storePage({ id, html, kind: "html" });

  const response: PublishResponse = {
    success: true,
    id,
    url: `${siteUrl}/${id}`,
  };

  return jsonResponse(response, { status: 201 });
}
