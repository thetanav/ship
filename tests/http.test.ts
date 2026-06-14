import { describe, it, expect } from "vitest";
import { jsonResponse, errorResponse, htmlResponse } from "@/lib/http";

describe("jsonResponse", () => {
  it("returns a Response with JSON content type", async () => {
    const res = jsonResponse({ ok: true });
    expect(res).toBeInstanceOf(Response);
    expect(res.headers.get("content-type")).toBe("application/json; charset=utf-8");
  });

  it("stringifies the body", async () => {
    const res = jsonResponse({ hello: "world" });
    const body = await res.json();
    expect(body).toEqual({ hello: "world" });
  });

  it("respects custom status code", () => {
    const res = jsonResponse({ ok: true }, { status: 201 });
    expect(res.status).toBe(201);
  });

  it("includes security headers", () => {
    const res = jsonResponse({});
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("referrer-policy")).toBe("no-referrer");
    expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(res.headers.get("content-security-policy")).toBeTruthy();
  });
});

describe("errorResponse", () => {
  it("returns success: false with the error message", async () => {
    const res = errorResponse("Not found", 404);
    const body = await res.json();
    expect(body).toEqual({ success: false, error: "Not found" });
    expect(res.status).toBe(404);
  });

  it("includes meta fields", async () => {
    const res = errorResponse("Rate limited", 429, { code: "RATE_LIMIT" });
    const body = await res.json();
    expect(body).toEqual({
      success: false,
      error: "Rate limited",
      code: "RATE_LIMIT",
    });
  });
});

describe("htmlResponse", () => {
  it("returns HTML content type with security headers", () => {
    const res = htmlResponse("<h1>Hello</h1>");
    expect(res.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("returns the HTML as the body", async () => {
    const res = htmlResponse("<p>test</p>");
    const body = await res.text();
    expect(body).toBe("<p>test</p>");
  });

  it("respects custom status code", () => {
    const res = htmlResponse("not found", { status: 404 });
    expect(res.status).toBe(404);
  });
});
