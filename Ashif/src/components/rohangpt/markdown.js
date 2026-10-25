/*
 * A deliberately small markdown parser for chat replies. It returns a plain
 * node tree that <Markdown> renders as React elements, so nothing is ever
 * injected as HTML. Supported: paragraphs, line breaks, bullet and numbered
 * lists (tight or loose), fenced code, headings (rendered bold), **bold**,
 * *italic*, `code`, [links](url), and bare https:// URLs.
 *
 * Block:  {type: 'p', lines: Inline[][]} | {type: 'ul'|'ol', start?, items: Inline[][]}
 *         | {type: 'h', children: Inline[]} | {type: 'pre', text}
 * Inline: {type: 'text'|'code', text} | {type: 'strong'|'em', children}
 *         | {type: 'link', href, children}
 */

const INLINE_PATTERN = new RegExp(
  [
    '`(?<code>[^`\\n]+)`',
    // Allows one level of parentheses inside the URL.
    '\\[(?<label>[^\\]\\n]+)\\]\\((?<href>(?:[^()\\s]|\\([^()\\s]*\\))+)\\)',
    '\\*\\*(?<strong>[^\\n]+?)\\*\\*',
    // *italic* must hug its text, so "2 * 3 * 4" stays literal.
    '\\*(?<em>[^*\\s](?:[^*\\n]*[^*\\s])?)\\*',
    '(?<url>https?:\\/\\/[^\\s<>]+)',
  ].join('|'),
  'g'
);

const FENCE = /^\s*```/;
const LIST_ITEM = /^\s*(?:([-*•+])|(\d{1,9})[.)])\s+(.*)$/;
const HEADING = /^\s*#{1,6}\s+(.*)$/;

/** Web, mail, and same-site links only; anything else renders as text. */
export function safeHref(href) {
  const value = String(href || '').trim();
  if (/^(https?:|mailto:)/i.test(value)) return value;
  if (/^(#|\.{0,2}\/(?!\/))/.test(value)) return value;
  return null;
}

/** Trailing punctuation usually ends the sentence, not the URL. */
function trimUrl(url) {
  let end = url.length;
  while (end > 0 && /[.,;:!?'")\]]/.test(url[end - 1])) {
    const head = url.slice(0, end);
    // Keep a closing paren that balances one inside the URL.
    if (head.endsWith(')') && (head.match(/\(/g) || []).length >= (head.match(/\)/g) || []).length) {
      break;
    }
    end -= 1;
  }
  return url.slice(0, end);
}

export function parseInline(text) {
  const nodes = [];
  const pushText = (value) => {
    if (!value) return;
    const last = nodes[nodes.length - 1];
    if (last?.type === 'text') last.text += value;
    else nodes.push({ type: 'text', text: value });
  };

  // Nested parses reuse the regex, so collect every match before recursing.
  const matches = [...text.matchAll(INLINE_PATTERN)];
  let cursor = 0;

  for (const match of matches) {
    if (match.index < cursor) continue;
    const { code, label, href, strong, em, url } = match.groups;
    pushText(text.slice(cursor, match.index));
    let consumed = match[0].length;

    if (code !== undefined) {
      nodes.push({ type: 'code', text: code });
    } else if (label !== undefined) {
      const safe = safeHref(href);
      const children = parseInline(label);
      if (safe) nodes.push({ type: 'link', href: safe, children });
      else children.forEach((child) => (child.type === 'text' ? pushText(child.text) : nodes.push(child)));
    } else if (strong !== undefined) {
      nodes.push({ type: 'strong', children: parseInline(strong) });
    } else if (em !== undefined) {
      nodes.push({ type: 'em', children: parseInline(em) });
    } else if (url !== undefined) {
      const trimmed = trimUrl(url);
      consumed = trimmed.length;
      nodes.push({ type: 'link', href: trimmed, children: [{ type: 'text', text: trimmed }] });
    }
    cursor = match.index + consumed;
  }
  pushText(text.slice(cursor));
  return nodes;
}

export function parseMarkdown(source) {
  const blocks = [];
  let paragraph = null;
  let list = null;
  let fence = null;

  for (const rawLine of String(source || '').replace(/\r\n?/g, '\n').split('\n')) {
    if (fence) {
      if (FENCE.test(rawLine)) fence = null;
      else fence.lines.push(rawLine);
      continue;
    }
    if (FENCE.test(rawLine)) {
      fence = { type: 'pre', lines: [] };
      blocks.push(fence);
      paragraph = null;
      list = null;
      continue;
    }

    const line = rawLine.trimEnd();
    if (!line.trim()) {
      // A blank line ends a paragraph but not a list: models often put blank
      // lines between items, and "1. 1. 1." numbering would follow.
      paragraph = null;
      continue;
    }

    const item = LIST_ITEM.exec(line);
    if (item) {
      const type = item[1] ? 'ul' : 'ol';
      if (list?.type !== type) {
        list = { type, items: [], start: type === 'ol' ? Number(item[2]) : undefined };
        blocks.push(list);
      }
      list.items.push(parseInline(item[3]));
      paragraph = null;
      continue;
    }

    // An indented line after a list item continues that item.
    if (list && /^\s{2,}/.test(rawLine)) {
      list.items[list.items.length - 1].push({ type: 'text', text: ' ' }, ...parseInline(line.trim()));
      continue;
    }

    list = null;
    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({ type: 'h', children: parseInline(heading[1]) });
      paragraph = null;
      continue;
    }

    if (!paragraph) {
      paragraph = { type: 'p', lines: [] };
      blocks.push(paragraph);
    }
    paragraph.lines.push(parseInline(line.trim()));
  }

  return blocks.map((block) =>
    block.type === 'pre' ? { type: 'pre', text: block.lines.join('\n') } : block
  );
}
