import { z } from "zod";
import { jsonResponse, errorResponse } from "@/lib/http";
import { rateLimitReport, rateLimitGlobal } from "@/lib/rate-limit";
import { storeReport } from "@/lib/site";
import { log } from "@/lib/log";

const schema = z.object({
  reason: z.string().min(3).max(2000),
  url: z.string().url().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const global = await rateLimitGlobal(`global:${ip}`);
  if (!global.allowed) {
    log("rate_limit_global", { ip, route: "report" });
    return errorResponse("Rate limit exceeded.", 429, {
      code: "GLOBAL_RATE_LIMIT",
      retryAfter: Math.ceil((global.resetAt - Date.now()) / 1000),
    });
  }

  const limit = await rateLimitReport(`report:${ip}`);
  if (!limit.allowed) {
    log("rate_limit_report", { ip });
    return errorResponse("Rate limit exceeded.", 429, {
      code: "REPORT_RATE_LIMIT",
      retryAfter: Math.ceil((limit.resetAt - Date.now()) / 1000),
    });
  }

  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return errorResponse("Invalid report payload.", 400, { code: "INVALID_REPORT" });
  }

  await storeReport(id, parsed.data);

  log("report_created", { id, ip });

  return jsonResponse({ success: true });
}
