import { randomBytes } from "crypto";
import { redis } from "./redis";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const ALPHABET_LENGTH = ALPHABET.length;

// Smallest power of 2 >= ALPHABET_LENGTH (36) is 64.
// This gives a uniform distribution with zero modulo bias.
const BYTES_NEEDED = 64;

const MAX_ID_ATTEMPTS = 100;

export function createPageId(length = 6): string {
  const bytes = randomBytes(length);
  let id = "";

  for (let i = 0; i < length; i++) {
    // Rejection sampling: skip bytes >= (256 - (256 % 36)) = 252 to eliminate bias.
    // For 6-char IDs, expected attempts per character is ~1.02 — negligible overhead.
    let byte = bytes[i];
    while (byte >= BYTES_NEEDED * (ALPHABET_LENGTH / BYTES_NEEDED)) {
      byte = randomBytes(1)[0];
    }
    id += ALPHABET[byte % ALPHABET_LENGTH];
  }

  return id;
}

export async function createUniquePageId(length = 6): Promise<string> {
  for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt++) {
    const id = createPageId(length);
    const reserved = await redis.set(pageKey(id), "1", { nx: true, ex: 3600 });
    if (reserved) {
      return id;
    }
  }

  throw new Error("Failed to generate unique page ID after maximum attempts");
}

export function pageKey(id: string): string {
  return `page:${id}`;
}
