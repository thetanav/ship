import Link from "next/link";
import { siteUrl } from "@/lib/config";
import { CopyButton } from "@/components/copy-button";
import Image from "next/image";

const apiSpec = `Base URL: ${siteUrl}

Publish HTML
POST /api/publish
{"html":"<!DOCTYPE html><html>...</html>"}

Response 201: {"success":true,"id":"abc123","url":"${siteUrl}/abc123"}

Publish multiple files
POST /api/publish
{"files":{"index.html":"...","style.css":"...","script.js":"..."}}

Fetch stored HTML
GET /api/page/[id]

Public page
GET /[id]

Report a page
Email hey@tanav.me with the page ID and subject "REPORT"

Page metadata
GET /api/meta/[id]

Health check
GET /api/health

Errors: 400, 404, 429 (includes "code" field)`;

export default function DocsPage() {
  return (
    <main>
      <div className="flex w-full items-center justify-center my-5">
        <Image
          src="/logo.png"
          className="rounded-lg select-none"
          width={200}
          height={200}
          draggable={false}
          alt={"ship.tanav.me logo"}
        />
      </div>

      <div className="flex items-start justify-between mt-6">
        <p className="text-text">pastebin for ai-generated apps.</p>
        <CopyButton text={apiSpec} />
      </div>

      <p className="mt-1 text-sm text-muted">API Specifications</p>

      <pre className="mt-8 text-sm leading-7 text-text whitespace-pre-wrap">
        {apiSpec}
      </pre>
    </main>
  );
}
