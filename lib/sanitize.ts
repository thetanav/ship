const DANGEROUS_ATTR = /\son[a-z-]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;
const JAVASCRIPT_URL =
  /\b(href|src|xlink:href|formaction)\s*=\s*(["'])\s*javascript:[^"']*\2/gi;
const META_REFRESH =
  /<meta[^>]+http-equiv\s*=\s*(["'])refresh\1[^>]*>/gi;

export function ensureHtmlDocument(input: string) {
  const normalized = input.trim();

  if (!/<(html|!doctype|head|body|div|section|main|article|script|style|svg|template)[\s>]/i.test(normalized)) {
    throw new Error("HTML content is required.");
  }

  return normalized;
}

export function sanitizeHtml(input: string) {
  return input
    .replace(DANGEROUS_ATTR, "")
    .replace(JAVASCRIPT_URL, (_, attr: string, quote: string) => {
      return ` ${attr}=${quote}#${quote}`;
    })
    .replace(META_REFRESH, "");
}
