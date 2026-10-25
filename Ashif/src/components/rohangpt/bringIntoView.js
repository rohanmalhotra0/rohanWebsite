// Room for the fixed navbar; matches the page's scroll-padding-top.
const NAV_CLEARANCE = 80;
const EDGE = 24;
// Safari has no scrollend event yet; long smooth scrolls just get retargeted.
const SETTLE_FALLBACK_MS = 1200;

let pending = null;

/** How far to scroll so the panel is fully visible (and its heading, if it fits). */
function offsetFor(panel) {
  const rect = panel.getBoundingClientRect();
  const viewport = window.innerHeight;
  if (rect.top >= NAV_CLEARANCE && rect.bottom <= viewport) return 0;

  const heading = panel.closest('section')?.querySelector('h2');
  const headingTop = heading ? heading.getBoundingClientRect().top : rect.top;
  const fits = rect.bottom - headingTop + 2 * EDGE <= viewport - NAV_CLEARANCE;
  return Math.round(fits ? headingTop - NAV_CLEARANCE - EDGE : rect.bottom + EDGE - viewport);
}

/**
 * Scroll the page to the chat panel. Content above can still change height
 * while a smooth scroll is under way (images that load late), so measure
 * again when it ends, unless the reader has taken over the scrolling.
 */
export default function bringIntoView(panel, smooth) {
  pending?.abort();
  if (!panel) return;
  const offset = offsetFor(panel);
  if (!offset) return;
  window.scrollTo({ top: window.scrollY + offset, behavior: smooth ? 'smooth' : 'auto' });
  if (!smooth) return;

  const controller = new AbortController();
  const { signal } = controller;
  pending = controller;

  const settle = () => {
    controller.abort();
    const correction = offsetFor(panel);
    if (correction) window.scrollTo({ top: window.scrollY + correction, behavior: 'smooth' });
  };
  const timer = window.setTimeout(settle, SETTLE_FALLBACK_MS);
  signal.addEventListener('abort', () => window.clearTimeout(timer));
  window.addEventListener('scrollend', settle, { signal });
  for (const type of ['wheel', 'touchstart', 'pointerdown']) {
    window.addEventListener(type, () => controller.abort(), { signal, passive: true });
  }
}
