import { promises as fs } from "fs";
import path from "path";
import { S3Client, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import type { StoredPage } from "@/lib/types";

const bucket = process.env.R2_BUCKET_NAME;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

const localRoot = path.join(process.cwd(), ".data");

function hasR2() {
  return Boolean(bucket && accountId && accessKeyId && secretAccessKey);
}

function getClient() {
  if (!hasR2()) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });
}

function pageKey(id: string) {
  return `pages/${id}.html`;
}

function reportKey(id: string) {
  return `reports/${id}/${Date.now()}.json`;
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
  if (hasR2()) {
    const client = getClient()!;
    try {
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: pageKey(id) }));
      return true;
    } catch {
      return false;
    }
  }

  return localExists(pageKey(id));
}

export async function storePage(page: StoredPage) {
  if (hasR2()) {
    const client = getClient()!;
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: pageKey(page.id),
        Body: page.html,
        ContentType: "text/html; charset=utf-8",
      }),
    );
    return;
  }

  await localWrite(pageKey(page.id), page.html);
}

export async function getStoredPage(id: string) {
  if (hasR2()) {
    const client = getClient()!;
    const result = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: pageKey(id) }),
    );
    const text = await result.Body?.transformToString();
    return text ? ({ id, html: text, kind: "html" } satisfies StoredPage) : null;
  }

  try {
    const text = await localRead(pageKey(id));
    return { id, html: text, kind: "html" } satisfies StoredPage;
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

  if (hasR2()) {
    const client = getClient()!;
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: reportKey(id),
        Body: payload,
        ContentType: "application/json; charset=utf-8",
      }),
    );
    return;
  }

  await localWrite(reportKey(id), payload);
}

export async function storeRawFile(key: string, body: string, contentType = "text/html; charset=utf-8") {
  if (hasR2()) {
    const client = getClient()!;
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return;
  }

  await localWrite(key, body);
}
