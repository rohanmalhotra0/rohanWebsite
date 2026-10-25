// Small DOM helpers shared by the navbar, mobile menu, and command palette.

/** Click a throwaway <a>, so the browser does exactly what a real link would. */
function followLink(href, attributes = {}) {
  const link = document.createElement('a');
  link.href = href;
  Object.assign(link, attributes);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Go to a section by id ('top' is the hero). Uses real fragment navigation
 * rather than scrollIntoView, so the browser applies scroll-padding, smooth
 * scrolling (or none, for reduced motion), history, and moves the
 * sequential focus starting point: the next Tab lands inside the section.
 */
export function goToSection(id) {
  followLink(`#${id}`);
}

/** Open a URL in a new tab without giving it a handle on this window. */
export function openExternal(href) {
  window.open(href, '_blank', 'noopener,noreferrer');
}

/** Trigger a download of a same-origin file. */
export function downloadFile(href) {
  followLink(href, { download: '', rel: 'noopener' });
}

/** Copy text to the clipboard. Resolves to true on success. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API unavailable or blocked: fall back to a hidden textarea.
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    document.body.appendChild(field);
    const previous = document.activeElement;
    field.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    field.remove();
    previous?.focus?.({ preventScroll: true });
    return ok;
  }
}

/** Center of an element's box, for growing the theme reveal from it. */
export function centerOf(element) {
  if (!element) return undefined;
  const rect = element.getBoundingClientRect();
  if (!rect.width && !rect.height) return undefined;
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** A left click without modifiers, i.e. one the page should handle itself. */
export const isPlainClick = (event) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
