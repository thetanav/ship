import { describe, it, expect } from "vitest";
import { ensureHtmlDocument, sanitizeHtml } from "@/lib/sanitize";

describe("ensureHtmlDocument", () => {
  it("accepts a basic HTML document", () => {
    const html = "<!DOCTYPE html><html><body>hello</body></html>";
    expect(ensureHtmlDocument(html)).toBe(html);
  });

  it("accepts a div", () => {
    const html = "<div>hello</div>";
    expect(ensureHtmlDocument(html)).toBe(html);
  });

  it("accepts a script tag", () => {
    const html = "<script>alert(1)</script>";
    expect(ensureHtmlDocument(html)).toBe(html);
  });

  it("throws for non-HTML content", () => {
    expect(() => ensureHtmlDocument("hello world")).toThrow("HTML content is required");
  });

  it("trims whitespace before checking", () => {
    const html = "  \n  <div>hello</div>  \n  ";
    expect(ensureHtmlDocument(html)).toBe("<div>hello</div>");
  });
});

describe("sanitizeHtml", () => {
  it("passes through safe HTML", () => {
    const html = "<div><p>Hello world</p></div>";
    expect(sanitizeHtml(html)).toBe(html);
  });

  it("removes on* event handlers", () => {
    const html = '<img src="x" onerror="alert(1)">';
    const result = sanitizeHtml(html);
    expect(result).not.toContain("onerror");
  });

  it("neutralizes javascript: URLs", () => {
    const html = '<a href="javascript:alert(1)">click</a>';
    const result = sanitizeHtml(html);
    expect(result).not.toContain("javascript:");
  });

  it("removes meta refresh tags", () => {
    const html = '<meta http-equiv="refresh" content="0;url=evil.com">';
    const result = sanitizeHtml(html);
    expect(result).not.toContain("refresh");
  });

  it("preserves allowed tags like img, video, audio", () => {
    const html = '<img src="test.png" alt="test"><video src="test.mp4"></video>';
    const result = sanitizeHtml(html);
    expect(result).toContain("<img");
    expect(result).toContain("<video");
  });

  it("preserves inline styles", () => {
    const html = '<div style="color: red;">hello</div>';
    const result = sanitizeHtml(html);
    expect(result).toContain("style=");
  });

  it("preserves data-* attributes", () => {
    const html = '<div data-testid="123">hello</div>';
    const result = sanitizeHtml(html);
    expect(result).toContain("data-testid");
  });
});
