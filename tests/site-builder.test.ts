import { describe, it, expect } from "vitest";
import { buildSinglePageHtml, buildMultiFileHtml } from "@/lib/site-builder";

describe("buildSinglePageHtml", () => {
  it("sanitizes and returns HTML", () => {
    const result = buildSinglePageHtml("<html><body><h1>Hello</h1></body></html>");
    expect(result).toContain("<h1>Hello</h1>");
  });

  it("throws on non-HTML input", () => {
    expect(() => buildSinglePageHtml("just text")).toThrow("HTML content is required.");
  });
});

describe("buildMultiFileHtml", () => {
  it("builds from index.html", () => {
    const result = buildMultiFileHtml({
      "index.html": "<html><body><h1>Multi</h1></body></html>",
    });
    expect(result).toContain("<h1>Multi</h1>");
  });

  it("inlines style.css", () => {
    const result = buildMultiFileHtml({
      "index.html": "<html><head><link href=\"style.css\" rel=\"stylesheet\"></head><body><h1>Styled</h1></body></html>",
      "style.css": "body { color: red; }",
    });
    expect(result).toContain("color: red");
    expect(result).toContain("<style>");
  });

  it("inlines script.js", () => {
    const result = buildMultiFileHtml({
      "index.html": "<html><head></head><body><script src=\"script.js\"></script></body></html>",
      "script.js": "console.log('hello');",
    });
    expect(result).toContain("console.log");
  });

  it("throws when index.html is missing", () => {
    expect(() => buildMultiFileHtml({ "other.html": "nope" })).toThrow("index.html is required.");
  });
});
