import { describe, it, expect } from "vitest";
import { siteUrl } from "@/lib/config";

describe("config", () => {
  it("has a default siteUrl", () => {
    expect(siteUrl).toBeTruthy();
    expect(typeof siteUrl).toBe("string");
  });

  it("defaults to https://ship.tanav.me when no env var is set", () => {
    // In test env, no env vars are set, so it falls back to the default
    expect(siteUrl).toBe("https://ship.tanav.me");
  });
});
