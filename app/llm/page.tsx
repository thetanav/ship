import { siteUrl } from "@/lib/config";
import { CopyButton } from "@/components/copy-button";

const text = `ship API Specification

Base URL: ${siteUrl}

Publish HTML
POST /api/publish
{"html":"<!DOCTYPE html><html>...</html>"}

Response 201: {"success":true,"id":"abc123","url":"${siteUrl}/abc123"}

Publish multiple files
POST /api/files
{"files":{"index.html":"...","style.css":"...","script.js":"..."}}

Fetch stored HTML
GET /api/page/[id]

Public page
GET /[id]

Report a page
POST /api/report/[id]
{"reason":"Spam or abuse"}

Page metadata
GET /api/meta/[id]

Health check
GET /api/health

Errors: 400, 404, 429 (includes "code" field)

curl -X POST ${siteUrl}/api/publish \\
  -H "Content-Type: application/json" \\
  -d '{"html":"<!DOCTYPE html><html><body>Hello</body></html>"}'
`;

export default function LlmDocsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <div className="flex items-start justify-between">
        <p className="text-text">
          ship <span className="text-muted">api</span>
        </p>
        <CopyButton text={text} />
      </div>
      <pre className="mt-8 text-sm leading-7 text-text whitespace-pre-wrap">
        {text}
      </pre>
    </main>
  );
}
