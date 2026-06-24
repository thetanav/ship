/**
 * The app stores and serves raw HTML as-is.
 * This module keeps the historical helper surface area for tests and callers,
 * but does not mutate the HTML content.
 */

export function ensureHtmlDocument(html: string): string {
  if (!html.trim()) {
    throw new Error("HTML content is required");
  }

  return html;
}

export function sanitizeHtml(html: string): string {
  return html;
}
