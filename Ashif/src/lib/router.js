import { createContext, useContext } from 'react';
import { findRoute, loadRoute, routeById } from '@/routes';

/*
 * A small history router for the site's handful of pages.
 *
 * - Plain <a href="/projects/"> links work everywhere: one click listener on
 *   the document turns clicks on links to the site's own pages into
 *   client-side page changes. Everything else (other sites, files, modified
 *   clicks, target="_blank", download) is left to the browser.
 * - A page's code loads before the page changes, so the old page stays up
 *   until the new one can render. Hovering or focusing a link starts that
 *   load early, and when the browser is idle every page is fetched ahead.
 * - Page changes crossfade with a view transition where supported.
 * - Scroll positions are remembered per history entry (Back returns to where
 *   you were), new pages start at the top or at their #fragment, and focus
 *   moves to the new page's heading so screen readers announce it.
 */

export const RouterContext = createContext({ path: '/', route: routeById('home'), pending: false });

/** `{ path, route, pending }` for the page on screen. */
export const useRoute = () => useContext(RouterContext);

// The mounted provider's navigate function; null before hydration and on the server.
let activeGo = null;

/** RouterProvider registers its navigate function here while it is mounted. */
export function setNavigator(go) {
  activeGo = go;
}

/**
 * Go to `href`. A page of this site changes in place; anything else is a
 * normal navigation. Safe to call from anywhere, including outside React.
 */
export function navigate(href, options) {
  if (activeGo) activeGo(href, options);
  else window.location.assign(href);
}

/**
 * True when the previous history entry is another page of this site (we
 * got here by a page change), so Back stays on the site.
 */
export const canGoBack = () => Boolean(window.history.state?.from);

/** Start loading the code for the page at `href`, if it is one of the site's pages. */
export function prefetch(href) {
  const route = routeForHref(href);
  if (route) loadRoute(route).catch(() => {});
}

export function routeForHref(href) {
  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin ? findRoute(url.pathname) : null;
  } catch {
    return null;
  }
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll positions by history entry. Entries carry a random key in their state;
// positions survive a reload through sessionStorage.
const STORAGE_KEY = 'rm-scroll';
export const positions = new Map();
export const entryKey = () => window.history.state?.key ?? null;
export const newKey = () => Math.random().toString(36).slice(2, 10);

export function ensureEntryKey() {
  if (!entryKey()) window.history.replaceState({ ...window.history.state, key: newKey() }, '');
  return entryKey();
}

export function readPositions() {
  try {
    for (const [key, top] of JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')) {
      positions.set(key, top);
    }
  } catch {
    // Storage blocked or garbled: positions just won't survive reloads.
  }
}

export function writePositions() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...positions].slice(-50)));
  } catch {
    // As above.
  }
}

/** Scroll the element named by `hash` to the top (under the navbar). False if there is none. */
export function scrollToHash(hash, behavior = 'instant') {
  if (!hash || hash === '#') return false;
  let element = null;
  try {
    element = document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return false;
  }
  if (!element) return false;
  element.scrollIntoView({ block: 'start', behavior });
  return true;
}

/** Run a DOM update as a crossfade, where view transitions are supported. */
export function withTransition(update, animate) {
  if (!animate || !document.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }
  const root = document.documentElement;
  // Scopes the page-change animation in index.css (the theme switch has its own).
  root.dataset.vt = 'page';
  const transition = document.startViewTransition(update);
  transition.ready.catch(() => {});
  transition.finished.finally(() => {
    if (root.dataset.vt === 'page') delete root.dataset.vt;
  });
}

/** A left click without modifiers, i.e. one the page should handle itself. */
export const isPlainClick = (event) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/** The link a click or hover landed on, if it's an ordinary same-tab link. */
export function linkFrom(event) {
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!(link instanceof HTMLAnchorElement)) return null;
  if (link.hasAttribute('download') || (link.target && link.target !== '_self')) return null;
  return link;
}
