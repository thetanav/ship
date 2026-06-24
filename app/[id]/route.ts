import { htmlResponse } from "@/lib/http";
import { getStoredPage } from "@/lib/site";

const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>not found · ship</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; color: #111;
    }
    p { font-size: 14px; color: #666; }
    a { color: #111; text-decoration: underline; text-underline-offset: 2px; }
  </style>
</head>
<body>
  <p>page not found · <a href="/">ship</a></p>
</body>
</html>`;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  if (!/^[a-z0-9]{6}$/.test(id)) {
    return htmlResponse(NOT_FOUND_HTML, { status: 404 });
  }

  const page = await getStoredPage(id);

  if (!page) {
    return htmlResponse(NOT_FOUND_HTML, { status: 404 });
  }

  return htmlResponse(page.html);
}
