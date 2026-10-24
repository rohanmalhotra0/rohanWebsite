/*
 * A deliberately small markdown parser for chat replies. It produces a plain
 * node tree that <Markdown> renders as React elements, so nothing is ever
 * injected as HTML. Supported: paragraphs, line breaks, bullet and numbered
 * lists, headings (rendered bold), **bold**, *italic*, `code`, [links](url),
 * and bare https:// URLs.
 *
 * Block:  {type: 'p', lines: Inline[][]} | {type: 'ul'|'ol', items: Inline[][]}
 *         | {type: 'h', children: Inline[]}
 * Inline: {type: 'text'|'code', text} | {type: 'strong'|'em', children}
 *         | {type: 'link', href, children}
 */

const INLINE_PATTERN = new RegExp(
  [
    '`(?<code>[^`\\n]+)`',
    // Allows one level of parentheses inside the URL.
    '\\[(?<label>[^\\]\\n]+)\\]\\((?<href>(?:[^()\\s]|\\([^()\\s]*\\))+)\\)',
    '\\*\\*(?<strong>[^\\n]+?)\\*\\*',
    '__(?<strong2>[^\\n]+?)__',
    // *italic* must hug its text, so "2 * 3 * 4" stays literal.
    '\\*(?<em>[^*\\s](?:[^*\\n]*[^*\\s])?)\\*',
    '(?<url>https?:\\/\\/[^\\s<>]+)',
  ].join('|'),
  'g'
);

/** Allow web, mail, and same-site links only; anything else renders as text. */
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
    // Keep a closing paren that balances one inside the URL.
    if (url[end - 1] === ')' && (url.slice(0, end).match(/\(/g) || []).length >=
      (url.slice(0, end).match(/\)/g) || []).length) break;
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

  INLINE_PATTERN.lastIndex = 0;
  let cursor = 0;
  let match;
  // Each nested parse reuses the regex, so collect matches before recursing.
  const matches = [];
  while ((match = INLINE_PATTERN.exec(text))) {
    matches.push({ index: match.index, raw: match[0], groups: { ...match.groups } });
  }

  for (const { index, raw, groups } of matches) {
    if (index < cursor) continue;
    pushText(text.slice(cursor, index));
    let consumed = raw.length;

    if (groups.code !== undefined) {
      nodes.push({ type: 'code', text: groups.code });
    } else if (groups.label !== undefined) {
      const href = safeHref(groups.href);
      const children = parseInline(groups.label);
      if (href) nodes.push({ type: 'link', href, children });
      else children.forEach((child) => (child.type === 'text' ? pushText(child.text) : nodes.push(child)));
    } else if (groups.strong !== undefined || groups.strong2 !== undefined) {
      nodes.push({ type: 'strong', children: parseInline(groups.strong ?? groups.strong2) });
    } else if (groups.em !== undefined) {
      nodes.push({ type: 'em', children: parseInline(groups.em) });
    } else if (groups.url !== undefined) {
      const url = trimUrl(groups.url);
      consumed = url.length;
      nodes.push({ type: 'link', href: url, children: [{ type: 'text', text: url }] });
    }
    cursor = index + consumed;
  }
  pushText(text.slice(cursor));
  return nodes;
}

export function parseMarkdown(source) {
  const blocks = [];
  let paragraph = null;
  let list = null;

  for (const rawLine of String(source || '').replace(/\r\n?/g, '\n').split('\n')) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      paragraph = null;
      list = null;
      continue;
    }

    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      const type = bullet ? 'ul' : 'ol';
      if (list?.type !== type) {
        list = { type, items: [] };
        blocks.push(list);
      }
      paragraph = null;
      list.items.push(parseInline((bullet || numbered)[1]));
      continue;
    }

    const heading = /^\s*#{1,6}\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({ type: 'h', children: parseInline(heading[1]) });
      paragraph = null;
      list = null;
      continue;
    }

    // An indented line right after a list item continues that item.
    if (list && /^\s{2,}/.test(rawLine)) {
      const item = list.items[list.items.length - 1];
      item.push({ type: 'text', text: ' ' }, ...parseInline(line.trim()));
      continue;
    }

    if (!paragraph) {
      paragraph = { type: 'p', lines: [] };
      blocks.push(paragraph);
      list = null;
    }
    paragraph.lines.push(parseInline(line.trim()));
  }
  return blocks;
}

function inlineText(nodes) {
  return nodes
    .map((node) => (node.children ? inlineText(node.children) : node.text))
    .join('');
}

/** Plain-text version, for screen readers while the visual reply types out. */
export function toPlainText(blocks) {
  return blocks
    .map((block) => {
      if (block.type === 'p') return block.lines.map(inlineText).join('\n');
      if (block.type === 'h') return inlineText(block.children);
      return block.items.map((item) => inlineText(item)).join('\n');
    })
    .join('\n\n');
}

/** Number of visible characters, which is what the typewriter counts. */
export function countChars(blocks) {
  return toPlainText(blocks).replace(/\n/g, '').length;
}
