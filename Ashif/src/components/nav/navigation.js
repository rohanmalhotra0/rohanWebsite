// Small DOM helpers shared by the navbar, mobile menu, and command palette.

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Scroll to a section by id ('top' means the very top of the page) and put
 * the hash in the URL the same way a plain anchor click would.
 */
export function scrollToSection(id) {
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior });
  } else {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior, block: 'start' });
  }
  if (window.location.hash !== `#${id}`) {
    window.history.pushState(null, '', `#${id}`);
  }
}

/** Open a URL in a new tab without giving it a handle on this window. */
export function openExternal(href) {
  window.open(href, '_blank', 'noopener,noreferrer');
}

/** Trigger a download of a same-origin file. */
export function downloadFile(href) {
  const link = document.createElement('a');
  link.href = href;
  link.download = '';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
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
