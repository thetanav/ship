import sanitizeHtmlLib from "sanitize-html";

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
  let result = input
    .replace(DANGEROUS_ATTR, "")
    .replace(JAVASCRIPT_URL, (_, attr: string, quote: string) => {
      return ` ${attr}=${quote}#${quote}`;
    })
    .replace(META_REFRESH, "");

  result = sanitizeHtmlLib(result, {
    allowedTags: sanitizeHtmlLib.defaults.allowedTags.concat([
      "img", "video", "audio", "source", "track",
      "svg", "path", "circle", "rect", "line", "polyline", "polygon", "text", "g", "defs", "use",
      "style", "script",
      "template",
      "details", "summary",
      "dialog",
    ]),
    allowedAttributes: {
      "*": ["id", "class", "style", "lang", "dir", "data-*"],
      "a": ["href", "target", "rel", "title"],
      "img": ["src", "alt", "width", "height", "loading", "decoding"],
      "video": ["src", "controls", "autoplay", "loop", "muted", "poster", "width", "height"],
      "audio": ["src", "controls", "autoplay", "loop"],
      "source": ["src", "type"],
      "input": ["type", "name", "value", "placeholder", "checked", "disabled", "readonly", "required"],
      "textarea": ["name", "rows", "cols", "placeholder", "disabled", "readonly", "required"],
      "select": ["name", "disabled", "required"],
      "option": ["value", "disabled", "selected"],
      "button": ["type", "disabled", "name", "value"],
      "form": ["action", "method", "enctype", "target"],
      "meta": ["name", "content", "charset", "http-equiv"],
      "link": ["href", "rel", "type", "media"],
      "td": ["colspan", "rowspan", "headers"],
      "th": ["colspan", "rowspan", "headers", "scope"],
      "iframe": ["src", "srcdoc", "width", "height", "sandbox", "loading", "allow", "referrerpolicy"],
      "svg": ["viewBox", "xmlns", "width", "height", "fill", "stroke", "stroke-width"],
      "path": ["d", "fill", "stroke", "stroke-width"],
      "circle": ["cx", "cy", "r", "fill", "stroke"],
      "rect": ["x", "y", "width", "height", "rx", "ry", "fill", "stroke"],
      "line": ["x1", "y1", "x2", "y2", "stroke", "stroke-width"],
      "text": ["x", "y", "fill", "font-size", "text-anchor"],
      "g": ["fill", "stroke", "transform"],
      "use": ["href", "xlink:href"],
      "script": ["src", "type", "async", "defer"],
      "track": ["src", "kind", "srclang", "label", "default"],
    },
    allowedSchemes: ["http", "https", "data", "blob", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data", "blob"],
      video: ["http", "https", "blob"],
      audio: ["http", "https", "blob"],
      source: ["http", "https", "data", "blob"],
      iframe: ["http", "https"],
    },
    allowProtocolRelative: false,
    allowVulnerableTags: true,
    disallowedTagsMode: "discard",
    enforceHtmlBoundary: true,
    exclusiveFilter: (frame) => {
      return frame.tag === "meta" && frame.attribs["http-equiv"]?.toLowerCase() === "refresh";
    },
  });

  return result;
}
