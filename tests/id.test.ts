import { describe, it, expect } from "vitest";
import { createPageId } from "@/lib/id";

describe("createPageId", () => {
  it("returns a string of the requested length", () => {
    expect(createPageId(6)).toHaveLength(6);
    expect(createPageId(8)).toHaveLength(8);
  });

  it("only contains lowercase alphanumeric characters", () => {
    const id = createPageId(100);
    expect(id).toMatch(/^[a-z0-9]+$/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => createPageId(6)));
    expect(ids.size).toBe(100);
  });
});
