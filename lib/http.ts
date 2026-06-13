export function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init?.headers,
    },
  });
}

export function errorResponse(error: string, status: number, meta?: Record<string, unknown>) {
  return jsonResponse(
    { success: false, error, ...meta },
    { status },
  );
}

export function htmlResponse(html: string, init?: ResponseInit) {
  return new Response(html, {
    ...init,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "x-robots-tag": "noindex, nofollow",
      "content-security-policy":
        "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; img-src * data: blob:; frame-ancestors 'none'; base-uri 'none'",
      ...init?.headers,
    },
  });
}
