import { StrictMode, startTransition } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource-variable/mona-sans/wght.css';
import './index.css';
import App from './App.jsx';
import { findRoute, loadRoute, notFoundRoute } from './routes';

// After a redeploy, an open tab still points at the old hashed chunks, which
// are gone. Reload once to pick up the new build; the timestamp stops a reload
// loop when the network itself is down.
window.addEventListener('vite:preloadError', (event) => {
  try {
    const last = Number(sessionStorage.getItem('rm-chunk-reload') || 0);
    if (Date.now() - last < 10_000) return;
    sessionStorage.setItem('rm-chunk-reload', String(Date.now()));
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});

const container = document.getElementById('root');
const path = window.location.pathname;
const route = findRoute(path) ?? notFoundRoute;
const app = (
  <StrictMode>
    <App initialPath={path} />
  </StrictMode>
);

// Production builds prerender every page into its own HTML file
// (scripts/prerender.mjs), so it paints before any JavaScript runs. The
// page's code loads first, then React hydrates the markup inside a
// transition, which splits the work into small slices instead of one long
// task. A host that served another page's file (some SPA fallbacks do) gets
// a fresh render instead of a mismatched hydration.
const prerendered = container.dataset.prerendered !== undefined && container.dataset.route === route.id;

loadRoute(route).then(
  () => {
    if (prerendered) {
      startTransition(() => {
        hydrateRoot(container, app);
      });
      return;
    }
    delete container.dataset.prerendered;
    container.replaceChildren();
    createRoot(container).render(app);
  },
  () => {
    // The page's code didn't load (offline?). Prerendered markup stays up as
    // a static page; its links still work as ordinary links.
    if (!prerendered) createRoot(container).render(app);
  }
);
