import { describe, it, expect } from "vitest";
import { sanitizeHtml, ensureHtmlDocument } from "@/lib/sanitize";

describe("ensureHtmlDocument", () => {
  it("accepts valid HTML", () => {
    expect(ensureHtmlDocument("<html><body>hi</body></html>")).toBeTruthy();
  });

  it("accepts doctype", () => {
    expect(ensureHtmlDocument("<!DOCTYPE html><html><body>hi</body></html>")).toBeTruthy();
  });

  it("rejects plain text without HTML tags", () => {
    expect(() => ensureHtmlDocument("just some text")).toThrow("HTML content is required.");
  });
});

describe("sanitizeHtml", () => {
  it("strips event handler attributes", () => {
    const result = sanitizeHtml('<button onclick="alert(1)">click</button>');
    expect(result).not.toContain("onclick");
    expect(result).toContain("click");
  });

  it("neutralizes javascript: URLs", () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">link</a>');
    expect(result).not.toContain("javascript:");
  });

  it("removes meta refresh", () => {
    const result = sanitizeHtml('<meta http-equiv="refresh" content="0;url=http://evil.com">');
    expect(result).not.toContain("refresh");
  });

  it("preserves safe HTML", () => {
    const html = "<html><body><h1>Hello</h1><p>World</p></body></html>";
    const result = sanitizeHtml(html);
    expect(result).toContain("<h1>");
    expect(result).toContain("<p>");
  });

  it("allows script tags (needed for LLM apps)", () => {
    const result = sanitizeHtml('<script>console.log("hello")</script>');
    expect(result).toContain("console.log");
  });

  it("removes iframe srcdoc attribute", () => {
    const result = sanitizeHtml('<iframe srcdoc="<script>alert(1)</script>"></iframe>');
    expect(result).not.toContain("srcdoc");
  });
});
