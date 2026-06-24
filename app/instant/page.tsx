"use client";

import { useState } from "react";
import { siteUrl } from "@/lib/config";
import { CopyButton } from "@/components/copy-button";

export default function InstantPage() {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; url: string } | null>(
    null,
  );

  async function handlePublish() {
    if (!html.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${siteUrl}/api/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setResult({ id: data.id, url: data.url });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setHtml("");
    setError(null);
    setResult(null);
  }

  return (
    <main>
      <h1 className="text-xl text-text mt-10 mb-2">instant</h1>
      <p className="text-sm text-muted mb-6">
        paste your html below and deploy it to the internet.
      </p>

      {!result ? (
        <>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="<!DOCTYPE html>..."
            spellCheck={false}
            className="w-full h-72 rounded-md border border-zinc-700 bg-zinc-900 text-text p-4 text-sm font-mono resize-y focus:outline-none focus:border-zinc-500 placeholder:text-zinc-600"
          />

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <button
            onClick={handlePublish}
            disabled={loading || !html.trim()}
            className="mt-4 px-4 py-2 text-sm rounded-md bg-text text-background font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "deploying..." : "deploy"}
          </button>
        </>
      ) : (
        <div className="rounded-md border border-zinc-700 bg-zinc-900 p-4">
          <p className="text-sm text-muted mb-2">your app is live at:</p>
          <div className="flex items-center gap-3">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text underline underline-offset-2 hover:opacity-80 break-all"
            >
              {result.url}
            </a>
            <CopyButton text={result.url} />
          </div>
          <button
            onClick={handleReset}
            className="mt-4 text-sm text-muted underline underline-offset-2 hover:text-text"
          >
            deploy another
          </button>
        </div>
      )}
    </main>
  );
}
