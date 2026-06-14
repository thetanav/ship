import { describe, it, expect } from "vitest";
import { createPageId, pageKey } from "@/lib/id";

describe("createPageId", () => {
  it("returns a string of the specified length", () => {
    expect(createPageId(6)).toHaveLength(6);
    expect(createPageId(8)).toHaveLength(8);
    expect(createPageId(4)).toHaveLength(4);
  });

  it("defaults to 6 characters", () => {
    expect(createPageId()).toHaveLength(6);
  });

  it("only contains lowercase alphanumeric characters", () => {
    const id = createPageId(100);
    expect(id).toMatch(/^[a-z0-9]+$/);
  });

  it("generates unique IDs across multiple calls", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(createPageId(6));
    }
    // With 36^6 = ~2.1 billion possible IDs, 1000 should all be unique
    expect(ids.size).toBe(1000);
  });
});

describe("pageKey", () => {
  it("returns 'page:{id}' format", () => {
    expect(pageKey("abc123")).toBe("page:abc123");
  });
});
