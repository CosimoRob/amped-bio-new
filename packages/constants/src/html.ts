/**
 * One HTML allowlist for creator authored rich text (profile bio and text blocks).
 *
 * It is applied twice:
 *  - on save, on the server, so stored HTML is already clean
 *  - on render, in every place that uses dangerouslySetInnerHTML, so rows saved
 *    before this sanitizer existed are also safe
 *
 * How it works: escape by default, rebuild what is allowed. The input is split into
 * text and tags. Text is always escaped. A tag is emitted only if its name is on the
 * allowlist, and it is rebuilt from scratch: only allowlisted attributes, with values
 * validated and re-escaped. No original tag or attribute text ever reaches the output,
 * so malformed or obfuscated markup cannot survive. Pure TypeScript (no DOM, no
 * dependency), so it runs the same in Node, Next.js SSR and the browser.
 *
 * The allowlist matches what the Slate editor produces (SlateEditor slateToHtml)
 * plus a few plain formatting tags.
 */

const ALLOWED_TAGS: Record<string, readonly string[]> = {
  p: ["style"],
  span: ["style"],
  br: [],
  strong: [],
  b: [],
  em: [],
  i: [],
  u: [],
  s: [],
  code: [],
  blockquote: ["style"],
  h1: ["style"],
  h2: ["style"],
  h3: ["style"],
  ul: [],
  ol: [],
  li: ["style"],
  a: ["href", "title"],
};

const VOID_TAGS = new Set(["br"]);

// Removed together with everything inside them
const DROP_WITH_CONTENT =
  /<(script|style|iframe|object|embed|noscript|template|textarea|title|xmp|noembed|noframes|plaintext|svg|math)\b[\s\S]*?(?:<\/\1\s*>|$)/gi;

// Comments, CDATA, doctype and processing instructions
const DROP_SPECIAL = /<!--[\s\S]*?(?:-->|$)|<!\[CDATA\[[\s\S]*?(?:\]\]>|$)|<![^>]*>?|<\?[^>]*>?/g;

// A well formed start or end tag. Anything that does not match is treated as text.
const TAG =
  /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g;

const ATTR = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

const SAFE_LINK = /^(?:https?:\/\/|mailto:)/i;
const TEXT_ALIGN = /^(?:left|right|center|justify)$/i;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: String.fromCharCode(160),
  colon: ":",
  tab: "\t",
  newline: "\n",
  sol: "/",
  lpar: "(",
  rpar: ")",
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);?/gi, (match, body: string) => {
    const lower = body.toLowerCase();
    if (lower.startsWith("#x")) {
      const code = parseInt(lower.slice(2), 16);
      return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    }
    if (lower.startsWith("#")) {
      const code = parseInt(lower.slice(1), 10);
      return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    }
    return NAMED_ENTITIES[lower] ?? match;
  });
}

function escapeText(text: string): string {
  // Keep well formed entities (they decode to text, never to markup); escape the rest
  return text
    .replace(/&(?!(?:#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]*);)/gi, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cleanHref(raw: string): string | null {
  // Browsers ignore control characters and whitespace inside URL schemes
  // ("java\tscript:"), so strip them before checking the allowlist.
  const value = decodeEntities(raw).replace(/[\s\p{Cc}]+/gu, "");
  return SAFE_LINK.test(value) ? value : null;
}

function cleanStyle(raw: string): string | null {
  const kept: string[] = [];
  for (const declaration of decodeEntities(raw).split(";")) {
    const [prop, ...rest] = declaration.split(":");
    const value = rest.join(":").trim();
    if (prop?.trim().toLowerCase() === "text-align" && TEXT_ALIGN.test(value)) {
      kept.push(`text-align: ${value.toLowerCase()}`);
    }
  }
  return kept.length ? kept.join("; ") : null;
}

function buildTag(closing: boolean, name: string, rawAttrs: string): string {
  if (closing) return VOID_TAGS.has(name) ? "" : `</${name}>`;

  const allowed = ALLOWED_TAGS[name] ?? [];
  const attrs: string[] = [];
  const seen = new Set<string>();

  for (const match of rawAttrs.matchAll(ATTR)) {
    const attrName = (match[1] ?? "").toLowerCase();
    if (!allowed.includes(attrName) || seen.has(attrName)) continue;
    const rawValue = match[2] ?? match[3] ?? match[4] ?? "";
    let value: string | null;
    if (attrName === "href") value = cleanHref(rawValue);
    else if (attrName === "style") value = cleanStyle(rawValue);
    else value = decodeEntities(rawValue);
    if (value === null) continue;
    seen.add(attrName);
    attrs.push(`${attrName}="${escapeAttr(value)}"`);
  }

  if (name === "a") {
    attrs.push('target="_blank"', 'rel="noopener noreferrer nofollow"');
  }

  return `<${name}${attrs.length ? " " + attrs.join(" ") : ""}>`;
}

function stripDangerous(html: string): string {
  let current = html;
  // Repeat until stable so nested or split constructs cannot reassemble
  for (let i = 0; i < 5; i++) {
    const next = current.replace(DROP_WITH_CONTENT, "").replace(DROP_SPECIAL, "");
    if (next === current) break;
    current = next;
  }
  return current;
}

/**
 * Sanitizes creator rich text HTML against the shared allowlist.
 * Links keep only absolute http, https or mailto hrefs and always open in a new
 * tab with rel="noopener noreferrer nofollow". Disallowed tags are removed and
 * their text is kept.
 */
export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html) return "";
  const input = stripDangerous(String(html));
  let out = "";
  let last = 0;
  for (const match of input.matchAll(TAG)) {
    const index = match.index ?? 0;
    out += escapeText(input.slice(last, index));
    last = index + match[0].length;
    const name = (match[2] ?? "").toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(ALLOWED_TAGS, name)) continue;
    out += buildTag(match[1] === "/", name, match[3] ?? "");
  }
  out += escapeText(input.slice(last));
  return out;
}

/**
 * Converts creator HTML to plain text for places where no markup should render
 * (cards, meta tags, previews). The result is text, to be rendered as text.
 */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return "";
  const input = stripDangerous(String(html));
  return decodeEntities(input.replace(TAG, " ")).replace(/\s+/g, " ").trim();
}
