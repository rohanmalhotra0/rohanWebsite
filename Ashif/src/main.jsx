import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/mona-sans/wght.css';
import '@fontsource-variable/hubot-sans/wdth.css';
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
