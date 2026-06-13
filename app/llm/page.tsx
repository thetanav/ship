import { siteUrl } from "@/lib/config";

const text = `ship API Specification

Base URL:
${siteUrl}

Publish HTML
POST /api/publish

Request body:
{
  "html": "<!DOCTYPE html><html>...</html>"
}

Rules:
- max size: 1 MB
- HTML required
- basic sanitization applied
- per-IP rate limiting

Response 201:
{
  "success": true,
  "id": "abc123",
  "url": "${siteUrl}/abc123"
}

Publish multiple files
POST /api/files

Request body:
{
  "files": {
    "index.html": "<!DOCTYPE html>...",
    "style.css": "body { font-family: system-ui; }",
    "script.js": "console.log('ship')"
  }
}

Fetch stored HTML
GET /api/page/[id]

Public page
GET /[id]

Report a page
POST /api/report/[id]

Request body:
{
  "reason": "Spam or abuse"
}

Errors:
400 invalid request body
404 page not found
429 rate limit exceeded

Curl examples
curl -X POST ${siteUrl}/api/publish \\
  -H "Content-Type: application/json" \\
  -d '{"html":"<!DOCTYPE html><html><body>Hello</body></html>"}'

curl ${siteUrl}/api/page/abc123
`;

export default function LlmDocsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10 md:px-10">
      <div className="border-b border-border pb-6">
        <p className="text-sm tracking-[0.2em] text-muted uppercase">machine readable</p>
        <h1 className="mt-3 text-4xl font-semibold text-text">Instructions for AI Models</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          This page is intentionally plain text so agents can copy the API contract without
          parsing a marketing page.
        </p>
      </div>
      <pre className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card p-6 text-sm leading-7 text-text whitespace-pre-wrap">
        {text}
      </pre>
    </main>
  );
}
