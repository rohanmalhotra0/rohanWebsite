import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import {
  DEFAULT_PALETTE,
  isPalette,
  PALETTE_STORAGE_KEY,
  THEME_COLORS,
  THEME_STORAGE_KEY,
  ThemeContext,
} from '@/lib/theme';

// Theme and palette live on <html data-theme data-palette> (set before first
// paint, see index.html). Components read them through a tiny store: the
// prerendered HTML and hydration use the defaults, then React re-renders
// with the real values.
const listeners = new Set();
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const notify = () => listeners.forEach((listener) => listener());
const root = () => document.documentElement;
const readTheme = () => (root().dataset.theme === 'dark' ? 'dark' : 'light');
const readPalette = () => (isPalette(root().dataset.palette) ? root().dataset.palette : DEFAULT_PALETTE);

function save(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the choice just won't persist.
  }
}

function paintChrome() {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLORS[readPalette()][readTheme()]);
}

/**
 * Run `update` (a synchronous DOM change) as a circle growing from `origin`
 * (a click event or {x, y}) over the old page. Instant under reduced motion
 * or without view transitions. `kind` scopes the CSS in index.css.
 */
function reveal(update, origin, kind) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduceMotion) {
    update();
    return;
  }

  const x = origin?.clientX ?? origin?.x ?? window.innerWidth / 2;
  const y = origin?.clientY ?? origin?.y ?? 0;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const html = root();
  html.dataset.vt = kind;
  const transition = document.startViewTransition(() => {
    flushSync(update);
  });
  transition.finished.finally(() => {
    if (html.dataset.vt === kind) delete html.dataset.vt;
  });
  transition.ready
    .then(() => {
      html.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 600,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    })
    .catch(() => {});
}

export default function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'light');
  const palette = useSyncExternalStore(subscribe, readPalette, () => DEFAULT_PALETTE);

  const setTheme = useCallback((next) => {
    root().dataset.theme = next;
    paintChrome();
    save(THEME_STORAGE_KEY, next);
    // Synchronous, so flushSync inside the view transition sees the change.
    notify();
  }, []);

  const toggleTheme = useCallback(
    (origin) => {
      const next = readTheme() === 'dark' ? 'light' : 'dark';
      reveal(() => setTheme(next), origin, 'theme');
    },
    [setTheme]
  );

  const setPalette = useCallback((next, origin) => {
    if (!isPalette(next) || next === readPalette()) return;
    const apply = () => {
      root().dataset.palette = next;
      paintChrome();
      save(PALETTE_STORAGE_KEY, next);
      notify();
    };
    // Without an origin (arrow keys stepping through the list) it just switches.
    if (origin) reveal(apply, origin, 'theme');
    else apply();
  }, []);

  const value = useMemo(
    () => ({ theme, palette, setTheme, toggleTheme, setPalette }),
    [theme, palette, setTheme, toggleTheme, setPalette]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
