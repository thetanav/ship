import { jsonResponse } from "@/lib/http";
import { getRedis } from "@/lib/redis";
import { promises as fs } from "fs";
import path from "path";

const localRoot = path.join(process.cwd(), ".data");

export async function GET() {
  const redis = getRedis();
  const reports: Array<{ id: string; body: unknown; createdAt: string }> = [];

  if (redis) {
    const keys = await redis.keys("reports:*");
    for (const key of keys) {
      const raw = await redis.get(key);
      if (typeof raw === "string") {
        try {
          reports.push(JSON.parse(raw));
        } catch {
          // skip malformed entries
        }
      }
    }
    reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return jsonResponse({ success: true, reports });
  }

  try {
    const dir = path.join(localRoot, "reports");
    const files = await fs.readdir(dir).catch(() => [] as string[]);
    for (const file of files) {
      const content = await fs.readFile(path.join(dir, file), "utf8");
      try {
        reports.push(JSON.parse(content));
      } catch {
        // skip malformed entries
      }
    }
    reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    // no reports directory yet
  }

  return jsonResponse({ success: true, reports });
}
