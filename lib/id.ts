import { randomBytes } from "crypto";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function createPageId(length = 6) {
  const bytes = randomBytes(length);
  let id = "";

  for (let i = 0; i < length; i += 1) {
    id += ALPHABET[bytes[i] % ALPHABET.length];
  }

  return id;
}
