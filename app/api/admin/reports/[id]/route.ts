import { jsonResponse, errorResponse } from "@/lib/http";
import { removePage } from "@/lib/site";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await removePage(id);
    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Failed to remove page.", 500);
  }
}
