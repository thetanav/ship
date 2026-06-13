import { promises as fs } from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { hasBlobStorage } from "@/lib/env";
import { getRedis } from "@/lib/redis";

const localRoot = path.join(process.cwd(), ".data");

function pageBlobPath(id: string) {
  return `pages/${id}.html`;
}

function pageMetaKey(id: string) {
  return `page:${id}`;
}

function reportKey(id: string) {
  return `reports:${id}:${Date.now()}`;
}

async function localEnsureDir(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function localWrite(key: string, body: string) {
  const filePath = path.join(localRoot, key);
  await localEnsureDir(filePath);
  await fs.writeFile(filePath, body, "utf8");
}

async function localRead(key: string) {
  const filePath = path.join(localRoot, key);
  return fs.readFile(filePath, "utf8");
}

async function localExists(key: string) {
  const filePath = path.join(localRoot, key);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function pageExists(id: string) {
  const redis = getRedis();
  if (redis && hasBlobStorage()) {
    return Boolean(await redis.get(pageMetaKey(id)));
  }

  return localExists(pageBlobPath(id));
}

export async function storePage(page: { id: string; html: string }) {
  const redis = getRedis();
  if (hasBlobStorage() && redis) {
    const blob = await put(pageBlobPath(page.id), page.html, {
      access: "public",
      addRandomSuffix: false,
      contentType: "text/html; charset=utf-8",
    });

    await redis.set(pageMetaKey(page.id), JSON.stringify({ url: blob.url }));

    return { url: blob.url };
  }

  await localWrite(pageBlobPath(page.id), page.html);
  return { url: null };
}

export async function getStoredPage(id: string) {
  const redis = getRedis();
  if (redis && hasBlobStorage()) {
    const raw = await redis.get(pageMetaKey(id));
    if (typeof raw !== "string" || raw.length === 0) {
      return null;
    }

    const meta = JSON.parse(raw) as { url: string };
    if (!meta.url) {
      return null;
    }

    const response = await fetch(meta.url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    return {
      id,
      html: await response.text(),
      kind: "html" as const,
    };
  }

  try {
    const text = await localRead(pageBlobPath(id));
    return { id, html: text, kind: "html" as const };
  } catch {
    return null;
  }
}

export async function storeReport(id: string, body: unknown) {
  const payload = JSON.stringify({
    id,
    body,
    createdAt: new Date().toISOString(),
  });

  const redis = getRedis();
  if (redis) {
    await redis.set(reportKey(id), payload);
    return;
  }

  await localWrite(reportKey(id), payload);
}
