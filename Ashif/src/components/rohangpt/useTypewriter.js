import { useLayoutEffect } from 'react';

/*
 * A typewriter that never touches the DOM it reveals.
 *
 * The finished reply is rendered in full from the first frame, so its height
 * is final, nothing reflows, and screen readers get the whole text at once.
 * The characters ahead of the cursor sit in a CSS Custom Highlight that paints
 * them transparent; each frame only moves the start of that Range. Elements
 * with paint of their own (code boxes, link underlines, list bullets) wait
 * for the cursor through a data attribute.
 */

const HIGHLIGHT = 'rohangpt-unrevealed';
const MS_PER_CHAR = 4;
const MIN_MS = 240;
// Long replies type faster, so none takes longer than this.
const MAX_MS = 800;

export const TYPEWRITER_CSS = `
::highlight(${HIGHLIGHT}) { color: transparent; }
[data-typing] :is(a, code, pre):not([data-shown]) {
  text-decoration-color: transparent;
  background-color: transparent;
  border-color: transparent;
}
[data-typing] li:not([data-shown])::marker { color: transparent; }
`;

const supportsHighlights = () =>
  typeof CSS !== 'undefined' && 'highlights' in CSS && typeof window.Highlight === 'function';

/** Types out the text inside `ref` once, unless `enabled` is false. */
export default function useTypewriter(ref, enabled) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!enabled || !root || !supportsHighlights()) return undefined;

    // Character offset of every text node, in reading order.
    const texts = [];
    const offsets = new Map();
    let total = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.data) continue;
      offsets.set(node, total);
      texts.push({ node, start: total });
      total += node.data.length;
    }
    if (!total) return undefined;

    const painted = Array.from(root.querySelectorAll('a, code, pre, li'), (element) => {
      const first = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
      return { element, at: offsets.get(first) ?? 0 };
    }).sort((a, b) => a.at - b.at);

    const last = texts[texts.length - 1].node;
    const range = new Range();
    range.setStart(texts[0].node, 0);
    range.setEnd(last, last.data.length);

    const highlight = CSS.highlights.get(HIGHLIGHT) ?? new window.Highlight();
    CSS.highlights.set(HIGHLIGHT, highlight);
    highlight.add(range);
    root.dataset.typing = '';

    const duration = Math.min(MAX_MS, Math.max(MIN_MS, total * MS_PER_CHAR));
    let textIndex = 0;
    let paintIndex = 0;
    let startTime = 0;
    let frame = 0;

    const finish = () => {
      cancelAnimationFrame(frame);
      highlight.delete(range);
      delete root.dataset.typing;
      painted.forEach(({ element }) => delete element.dataset.shown);
    };

    const tick = (now) => {
      if (!startTime) startTime = now;
      const shown = Math.ceil(((now - startTime) / duration) * total);
      if (shown >= total) {
        finish();
        return;
      }
      while (textIndex < texts.length - 1 && texts[textIndex + 1].start <= shown) textIndex += 1;
      range.setStart(texts[textIndex].node, shown - texts[textIndex].start);
      while (paintIndex < painted.length && painted[paintIndex].at <= shown) {
        painted[paintIndex].element.dataset.shown = '';
        paintIndex += 1;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return finish;
  }, [ref, enabled]);
}
