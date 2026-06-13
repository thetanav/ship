import { z } from "zod";
import { jsonResponse } from "@/lib/http";
import { rateLimitReport } from "@/lib/rate-limit";
import { storeReport } from "@/lib/site";

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

  const limit = await rateLimitReport(`report:${ip}`);
  if (!limit.allowed) {
    return jsonResponse(
      { success: false, error: "Rate limit exceeded." },
      { status: 429, headers: { "retry-after": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return jsonResponse({ success: false, error: "Invalid report payload." }, { status: 400 });
  }

  await storeReport(id, parsed.data);

  return jsonResponse({ success: true });
}
