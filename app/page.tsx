import Link from "next/link";
import { siteUrl } from "@/lib/config";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <p className="text-text">
        <Link href="/" className="underline underline-offset-2">ship</Link>
        {" — "}pastebin for ai-generated apps.
        {" "}<Link href="/llm" className="underline underline-offset-2">api</Link>
      </p>

      <pre className="mt-12 text-sm leading-7 text-text whitespace-pre-wrap">
{`To publish HTML:

POST ${siteUrl}/api/publish
Content-Type: application/json

{"html":"<your-html>"}

Response: {"id":"abc123","url":"${siteUrl}/abc123"}

curl -X POST ${siteUrl}/api/publish \\
  -H "Content-Type: application/json" \\
  -d '{"html":"<!DOCTYPE html><html><body>Hello</body></html>"}'`}
      </pre>
    </main>
  );
}
