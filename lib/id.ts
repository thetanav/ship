import { randomBytes } from "crypto";
import { redis } from "./redis";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function createPageId(length = 6) {
  const bytes = randomBytes(length);
  let id = "";

  for (let i = 0; i < length; i += 1) {
    id += ALPHABET[bytes[i] % ALPHABET.length];
  }

  return id;
}

export async function createUniquePageId(length = 6) {
  for (;;) {
    const id = createPageId(length);
    const reserved = await redis.set(pageKey(id), "1", { nx: true });
    if (reserved) {
      return id;
    }
  }
}

export function pageKey(id: string) {
  return `page:${id}`;
}
