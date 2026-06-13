import { jsonResponse } from "@/lib/http";
import { pageExists, getStoredPage } from "@/lib/site";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const exists = await pageExists(id);
  if (!exists) {
    return jsonResponse({ success: false, error: "Page not found." }, { status: 404 });
  }

  const page = await getStoredPage(id);
  if (!page) {
    return jsonResponse({ success: false, error: "Page not found." }, { status: 404 });
  }

  return jsonResponse({
    success: true,
    id,
    kind: page.kind,
    size: page.html.length,
  });
}
