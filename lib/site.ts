import { put } from "@vercel/blob";
import type { PageMeta } from "@/lib/types";
import { pageKey } from "@/lib/id";
import { redis } from "./redis";
import { log } from "./log";

function pageBlobPath(id: string): string {
  return `pages/${id}.html`;
}

export async function pageExists(id: string): Promise<boolean> {
  return Boolean(await redis?.get(pageKey(id)));
}

export async function storePage({
  id,
  html,
}: {
  id: string;
  html: string;
}): Promise<{ url: string } | null> {
  if (!redis) throw new Error("Redis is required");

  let blob;
  try {
    blob = await put(pageBlobPath(id), html, {
      access: "public",
      contentType: "text/html; charset=utf-8",
    });
  } catch (err) {
    return null;
  }

  if (!blob) return null;

  const meta: PageMeta = {
    url: blob.url,
    createdAt: new Date().toISOString(),
    size: html.length,
    kind: "html",
  };

  try {
    await redis.set(pageKey(id), meta);
  } catch (err) {}

  log("store_page", { id, size: html.length, storage: "blob+redis" });
  return { url: blob.url };
}

/**
 * Returns lightweight metadata for a page without fetching the full HTML from blob storage.
 * Preferred over getStoredPage when only kind/size are needed (e.g. the meta API endpoint).
 */
export async function getPageMeta(
  id: string,
): Promise<{ id: string; kind: "html"; size: number; url: string } | null> {
  const meta = await redis.get<PageMeta>(pageKey(id));
  if (!meta?.url) return null;
  return { id, kind: "html", size: meta.size, url: meta.url };
}

export async function getStoredPage(
  id: string,
): Promise<{ id: string; html: string; kind: "html" } | null> {
  const meta = await redis.get<PageMeta>(pageKey(id));
  if (!meta?.url) return null;

  const response = await fetch(meta.url, { cache: "no-store" });
  if (!response.ok) {
    return null;
  }

  return { id, html: await response.text(), kind: "html" };
}
