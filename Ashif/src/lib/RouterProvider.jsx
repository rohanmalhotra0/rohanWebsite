import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { whenIdle } from '@/lib/idle';
import { findRoute, loadedPage, loadRoute, navRoutes, normalizePath, notFoundRoute, routeById } from '@/routes';
import {
  ensureEntryKey,
  entryKey,
  isPlainClick,
  linkFrom,
  newKey,
  positions,
  prefersReducedMotion,
  prefetch,
  readPositions,
  RouterContext,
  routeForHref,
  scrollToHash,
  setNavigator,
  withTransition,
  writePositions,
} from './router';

/** Owns the current page and every page change; see router.js. */
export default function RouterProvider({ initialPath, children }) {
  const [state, setState] = useState(() => {
    const path = normalizePath(initialPath);
    return { path, route: findRoute(path) ?? notFoundRoute, hash: '', restore: null, count: 0 };
  });
  const [pending, setPending] = useState(false);
  const stateRef = useRef(state);
  const keyRef = useRef(null);
  const tokenRef = useRef(0);

  /** Load the route's page, then show it. `nav.url` is pushed (or replaced) into history first. */
  const start = useCallback((route, path, nav) => {
    const token = (tokenRef.current += 1);

    const show = () => {
      if (token !== tokenRef.current) return;
      if (nav.url) {
        const entry = { key: newKey(), from: stateRef.current.path };
        if (nav.replace) window.history.replaceState(entry, '', nav.url);
        else window.history.pushState(entry, '', nav.url);
      }
      keyRef.current = ensureEntryKey();
      const next = {
        path,
        route,
        hash: nav.hash ?? '',
        restore: nav.restore ?? null,
        count: stateRef.current.count + 1,
      };
      stateRef.current = next;
      withTransition(
        () =>
          flushSync(() => {
            setState(next);
            setPending(false);
          }),
        nav.animate !== false
      );
    };

    if (loadedPage(route)) {
      show();
      return;
    }
    setPending(true);
    loadRoute(route).then(show, () => {
      if (token !== tokenRef.current) return;
      // The page's code wouldn't load (offline, or a redeploy replaced the
      // chunk): let the browser load the page itself.
      window.location.assign(nav.url ?? window.location.href);
    });
  }, []);

  const go = useCallback(
    (href, { replace = false } = {}) => {
      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      const route = url.origin === window.location.origin ? findRoute(url.pathname) : null;
      if (!route) {
        window.location.assign(url.href);
        return;
      }

      // Already here: a #fragment scrolls to it, anything else back to the top.
      if (route.path === stateRef.current.path) {
        const smooth = prefersReducedMotion() ? 'instant' : 'smooth';
        if (url.hash && url.hash !== window.location.hash) window.location.hash = url.hash;
        else if (!scrollToHash(url.hash, smooth)) window.scrollTo({ top: 0, behavior: smooth });
        return;
      }

      if (keyRef.current) positions.set(keyRef.current, window.scrollY);
      start(route, route.path, { url: route.path + url.search + url.hash, replace, hash: url.hash });
    },
    [start]
  );

  // Client-only setup: own scroll restoration, register navigate().
  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual';
    // A host that answered with another page's file (an SPA fallback) left its title.
    document.title = stateRef.current.route.title;
    readPositions();
    keyRef.current = ensureEntryKey();
    // A reload, or coming back from another site: return to where this entry was.
    const saved = positions.get(keyRef.current);
    if (saved != null) window.scrollTo({ top: saved, behavior: 'instant' });

    setNavigator(go);
    const onPageHide = () => {
      if (keyRef.current) positions.set(keyRef.current, window.scrollY);
      writePositions();
    };
    window.addEventListener('pagehide', onPageHide);
    return () => {
      setNavigator(null);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [go]);

  // Back and Forward.
  useEffect(() => {
    const onPopState = (event) => {
      const path = normalizePath(window.location.pathname);
      // Same page: a #fragment, or the project viewer's own entry. Not ours.
      if (path === stateRef.current.path) {
        keyRef.current = ensureEntryKey();
        return;
      }
      if (keyRef.current) positions.set(keyRef.current, window.scrollY);
      const route = findRoute(path) ?? notFoundRoute;
      start(route, path, {
        hash: window.location.hash,
        restore: positions.get(entryKey()) ?? null,
        // Skip the crossfade when the browser already animated (a swipe back).
        animate: !event.hasUAVisualTransition,
      });
    };
    // In-page #links make history entries without our key; give them one.
    const onHashChange = () => {
      keyRef.current = ensureEntryKey();
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [start]);

  // Links: route clicks on the site's own pages, and load a page's code on hover or focus.
  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented || !isPlainClick(event)) return;
      const link = linkFrom(event);
      if (!link || !routeForHref(link.href)) return;
      const url = new URL(link.href);
      // A #fragment on this page: the browser scrolls there by itself.
      if (normalizePath(url.pathname) === stateRef.current.path && url.hash) return;
      event.preventDefault();
      go(url.href);
    };
    const onIntent = (event) => {
      const link = linkFrom(event);
      if (link) prefetch(link.href);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('pointerover', onIntent, { passive: true });
    document.addEventListener('focusin', onIntent);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('pointerover', onIntent);
      document.removeEventListener('focusin', onIntent);
    };
  }, [go]);

  // Once the page has loaded and the browser is idle, fetch the other pages
  // ahead of time so every page change is instant. One page at a time, each
  // in an idle moment of its own, so their code never runs in one long task
  // while the visitor might tap. Not with Save-Data on.
  useEffect(() => {
    if (navigator.connection?.saveData) return undefined;
    const queue = [...navRoutes, routeById('resume')];
    let stopped = false;
    let cancel = () => {};
    const next = () => {
      const route = queue.shift();
      if (!route || stopped) return;
      loadRoute(route)
        .catch(() => {})
        .then(() => {
          if (!stopped) cancel = whenIdle(next, { timeout: 5000 });
        });
    };
    const start = () => {
      cancel = whenIdle(next, { timeout: 5000, fallback: 2000 });
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      stopped = true;
      window.removeEventListener('load', start);
      cancel();
    };
  }, []);

  // After a page change: scroll, title, focus. Runs before paint (and inside
  // the view transition), so the new page never shows at the old offset.
  useLayoutEffect(() => {
    if (state.count === 0) return;
    let atFragment = false;
    if (state.restore != null) window.scrollTo({ top: state.restore, behavior: 'instant' });
    else atFragment = scrollToHash(state.hash);
    if (state.restore == null && !atFragment) window.scrollTo({ top: 0, behavior: 'instant' });

    document.title = state.route.title;
    // The new page's heading, so the next Tab starts there and screen readers
    // announce the page. Skipped when we jumped to a #fragment further down.
    if (!atFragment) {
      const heading = document.querySelector('[data-page-focus]');
      heading?.focus({ preventScroll: true });
    }
  }, [state]);

  const value = useMemo(
    () => ({ path: state.path, route: state.route, pending }),
    [state.path, state.route, pending]
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}
