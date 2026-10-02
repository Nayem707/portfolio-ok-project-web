/**
 * Product description formatting. The allowlist must stay in sync with
 * server/src/utils/richText.ts, which sanitizes descriptions before storing.
 */
const TAG_MAP = {
  h1: "h2",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h4",
  h6: "h4",
  p: "p",
  div: "p",
  br: "br",
  strong: "strong",
  b: "strong",
  em: "em",
  i: "em",
  u: "u",
  ul: "ul",
  ol: "ol",
  li: "li",
};

const DROP_WITH_CONTENT =
  /<(script|style|iframe|object|embed|noscript|template|textarea|select|svg|math)\b[\s\S]*?<\/\1\s*>/gi;
const ANY_TAG = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
const BULLET_LINE = /^\s*[-*•]\s+/;
const NUMBERED_LINE = /^\s*\d+[.)]\s+/;
const HEADING_LINE = /^\s*(#{1,3})\s+(.+)$/;

export const looksLikeHtml = (value) =>
  /<\/?[a-z][a-z0-9]*\b[^>]*>/i.test(value || "");

const BLOCK_TAGS = new Set(["p", "h2", "h3", "h4", "ul", "ol"]);
const HEADING_TAGS = ["h2", "h3", "h4"];
const EMPTY_ELEMENT = /<(p|h2|h3|h4|li|ul|ol|strong|em|u)>\s*<\/\1>/g;

const escapeText = (text) => text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Keeps allowlisted tags (without attributes) and repairs nesting, e.g. the
 * `<p><ul>…</ul></p>` that contentEditable list commands produce.
 */
export function sanitizeRichText(html) {
  const source = String(html || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(DROP_WITH_CONTENT, "");
  const out = [];
  const stack = [];
  const closeUntil = (name) => {
    while (stack.length) {
      const top = stack.pop();
      out.push(`</${top}>`);
      if (top === name) return;
    }
  };

  let cursor = 0;
  for (const match of source.matchAll(ANY_TAG)) {
    out.push(escapeText(source.slice(cursor, match.index)));
    cursor = match.index + match[0].length;

    const name = TAG_MAP[match[1].toLowerCase()];
    if (!name) continue;
    const closing = match[0].startsWith("</");

    if (name === "br") {
      if (!closing) out.push("<br>");
      continue;
    }
    if (closing) {
      if (stack.includes(name)) closeUntil(name);
      continue;
    }

    const liIndex = stack.lastIndexOf("li");
    if (BLOCK_TAGS.has(name)) {
      const openBlock = ["p", ...HEADING_TAGS]
        .map((tag) => ({ tag, index: stack.lastIndexOf(tag) }))
        .filter(({ index }) => index > liIndex)
        .sort((a, b) => a.index - b.index)[0];
      if (openBlock) closeUntil(openBlock.tag);
    }
    if (name === "li") {
      const listIndex = Math.max(
        stack.lastIndexOf("ul"),
        stack.lastIndexOf("ol"),
      );
      if (liIndex > listIndex) closeUntil("li");
    }

    out.push(`<${name}>`);
    stack.push(name);
  }
  out.push(escapeText(source.slice(cursor)));
  while (stack.length) out.push(`</${stack.pop()}>`);

  let result = out.join("");
  let previous;
  do {
    previous = result;
    result = result.replace(EMPTY_ELEMENT, "");
  } while (result !== previous);
  return result.trim();
}

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const inlineMarkdown = (text) =>
  text
    .replace(/\*\*(\S(?:.*?\S)?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(\S(?:.*?\S)?)\*(?!\*)/g, "$1<em>$2</em>");

/** Converts legacy plain-text descriptions, keeping line breaks and simple lists. */
export function plainTextToHtml(text) {
  const blocks = String(text || "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n\s*\n/);

  return blocks
    .map((block) => {
      const groups = [];
      block.split("\n").forEach((rawLine) => {
        const line = inlineMarkdown(escapeHtml(rawLine.trim()));
        if (!line) return;
        const heading = rawLine.match(HEADING_LINE);
        const type = heading
          ? `h${heading[1].length + 1}`
          : BULLET_LINE.test(rawLine)
            ? "ul"
            : NUMBERED_LINE.test(rawLine)
              ? "ol"
              : "p";
        const content = heading
          ? inlineMarkdown(escapeHtml(heading[2].trim()))
          : type === "ul"
            ? line.replace(BULLET_LINE, "")
            : type === "ol"
              ? line.replace(NUMBERED_LINE, "")
              : line;
        const last = groups[groups.length - 1];
        if (last && last.type === type && !type.startsWith("h")) {
          last.lines.push(content);
        } else {
          groups.push({ type, lines: [content] });
        }
      });

      return groups
        .map(({ type, lines }) => {
          if (type === "ul" || type === "ol") {
            return `<${type}>${lines.map((l) => `<li>${l}</li>`).join("")}</${type}>`;
          }
          if (type === "p") return `<p>${lines.join("<br>")}</p>`;
          return `<${type}>${lines[0]}</${type}>`;
        })
        .join("");
    })
    .join("");
}

/** Safe HTML for any stored description, whether HTML or legacy plain text. */
export const toRichTextHtml = (value) =>
  looksLikeHtml(value) ? sanitizeRichText(value) : plainTextToHtml(value);

export const isRichTextEmpty = (html) =>
  !String(html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|\u00a0/g, "")
    .trim();
