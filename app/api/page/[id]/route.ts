import { htmlResponse, errorResponse } from "@/lib/http";
import { getStoredPage } from "@/lib/site";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  if (!/^[a-z0-9]{6}$/.test(id)) {
    return errorResponse("Invalid page ID.", 400, { code: "INVALID_ID" });
  }

  const page = await getStoredPage(id);

  if (!page) {
    return errorResponse("Page not found.", 404, { code: "PAGE_NOT_FOUND" });
  }

  return htmlResponse(page.html);
}
