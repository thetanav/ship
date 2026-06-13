import { z } from "zod";
import { jsonResponse } from "@/lib/http";
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
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return jsonResponse({ success: false, error: "Invalid report payload." }, { status: 400 });
  }

  await storeReport(id, parsed.data);

  return jsonResponse({ success: true });
}
