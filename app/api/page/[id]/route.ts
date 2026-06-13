import { htmlResponse, errorResponse } from "@/lib/http";
import { getStoredPage } from "@/lib/site";
import { log } from "@/lib/log";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const page = await getStoredPage(id);

  if (!page) {
    return errorResponse("Page not found.", 404, { code: "PAGE_NOT_FOUND" });
  }

  log("page_fetch", { id, size: page.html.length });

  return htmlResponse(page.html);
}
