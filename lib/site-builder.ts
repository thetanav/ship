import { ensureHtmlDocument, sanitizeHtml } from "@/lib/sanitize";

export function buildSinglePageHtml(html: string) {
  const cleaned = sanitizeHtml(ensureHtmlDocument(html));
  return cleaned;
}

export function buildMultiFileHtml(files: Record<string, string>) {
  const indexHtml = files["index.html"];

  if (!indexHtml) {
    throw new Error("index.html is required.");
  }

  let html = ensureHtmlDocument(indexHtml);

  if (files["style.css"]) {
    const css = sanitizeCss(files["style.css"]);
    html = html.replace(
      /<link[^>]+href=["']style\.css["'][^>]*>/i,
      `<style>${css}</style>`,
    );

    if (!/<link[^>]+href=["']style\.css["'][^>]*>/i.test(html) && !/<style>/.test(html)) {
      html = html.replace("</head>", `<style>${css}</style></head>`);
    }
  }

  if (files["script.js"]) {
    const script = sanitizeJs(files["script.js"]);
    html = html.replace(
      /<script[^>]+src=["']script\.js["'][^>]*><\/script>/i,
      `<script>${script}</script>`,
    );

    if (!/<script[^>]+src=["']script\.js["'][^>]*><\/script>/i.test(html) && !/<script>/.test(html)) {
      html = html.replace("</body>", `<script>${script}</script></body>`);
    }
  }

  return sanitizeHtml(html);
}

function sanitizeCss(css: string) {
  return css.replace(/<\/style>/gi, "<\\/style>");
}

function sanitizeJs(js: string) {
  return js.replace(/<\/script>/gi, "<\\/script>");
}
