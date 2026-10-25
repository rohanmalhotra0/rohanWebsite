// Small DOM helpers for the project viewer.

/** True on devices with a real hover pointer (mouse or trackpad). */
export const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Locks page scroll while the viewer is open and returns the unlock function.
 * The scrollbar's gutter is kept so nothing on the page shifts sideways.
 */
export function lockScroll() {
  const html = document.documentElement;
  const previous = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter };
  if (window.innerWidth > html.clientWidth) html.style.scrollbarGutter = 'stable';
  html.style.overflow = 'hidden';
  return () => {
    html.style.overflow = previous.overflow;
    html.style.scrollbarGutter = previous.gutter;
  };
}

/** The button that opens a project: `kind` is 'card' (featured) or 'row' (archive). */
export const findTrigger = (kind, slug) =>
  document.querySelector(`[data-project-trigger="${kind}:${slug}"]`);

// Leaves room for the fixed navbar when deciding what counts as visible.
const TOP_INSET = 80;

/**
 * Scrolls a featured card's image fully into view, instantly. Used while the
 * viewer covers the page, so the image can fly back to a card the reader can see.
 */
export function revealCard(slug) {
  const media = document.querySelector(`[data-project-card="${slug}"] [data-project-media]`);
  if (!media) return;
  const rect = media.getBoundingClientRect();
  const viewport = window.innerHeight;
  if (rect.top >= TOP_INSET && rect.bottom <= viewport) return;
  const offset = Math.max(TOP_INSET, (viewport - rect.height) / 2);
  window.scrollTo({ top: window.scrollY + rect.top - offset, behavior: 'instant' });
}

/** Scrolls an element's top just below the navbar, instantly. */
export function revealElement(element) {
  if (!element) return;
  const top = window.scrollY + element.getBoundingClientRect().top - TOP_INSET;
  window.scrollTo({ top, behavior: 'instant' });
}

const preloaded = new Set();

/** Starts loading an image so it is decoded by the time it is shown. */
export function preloadImage(src) {
  if (!src || preloaded.has(src)) return;
  preloaded.add(src);
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
}
