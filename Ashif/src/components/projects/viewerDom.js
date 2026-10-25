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

/** Scrolls `element` fully into view (centered when it has to move), instantly. */
function bringIntoView(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const viewport = window.innerHeight;
  if (rect.top < TOP_INSET || rect.bottom > viewport) {
    const offset = Math.max(TOP_INSET, (viewport - rect.height) / 2);
    window.scrollTo({ top: window.scrollY + rect.top - offset, behavior: 'instant' });
  }
  return true;
}

/**
 * Brings the place a project lives on the page into view: its featured image,
 * or its archive row when that is rendered. Used while the viewer covers the
 * page, so closing lands there (and the image can fly back to a visible card).
 */
export const revealProject = (project) =>
  bringIntoView(
    project.featured
      ? document.querySelector(`[data-project-card="${project.slug}"] [data-project-media]`)
      : findTrigger('row', project.slug)?.closest('[role="row"]')
  );

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
