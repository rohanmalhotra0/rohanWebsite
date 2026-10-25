import { StrictMode, startTransition } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource-variable/mona-sans/wght.css';
import './index.css';
import App from './App.jsx';

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
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production builds prerender the portfolio into #root (scripts/prerender.mjs),
// so it paints before any JavaScript runs. Hydrating inside a transition lets
// React split that work into small slices instead of one long task. The résumé
// route starts from an empty root instead.
if (container.hasAttribute('data-prerendered') && window.location.hash !== '#/resume') {
  startTransition(() => {
    hydrateRoot(container, app);
  });
} else {
  container.removeAttribute('data-prerendered');
  container.replaceChildren();
  createRoot(container).render(app);
}
