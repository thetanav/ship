import { htmlResponse, jsonResponse } from "@/lib/http";
import { getStoredPage } from "@/lib/site";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const page = await getStoredPage(id);

  if (!page) {
    return jsonResponse({ success: false, error: "Page not found." }, { status: 404 });
  }

  return htmlResponse(page.html);
}
