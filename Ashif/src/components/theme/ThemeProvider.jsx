import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { THEME_COLORS, THEME_STORAGE_KEY, ThemeContext } from '@/lib/theme';

// The theme lives on <html data-theme> (set before first paint, see
// index.html). Components read it through a tiny store: the prerendered HTML
// and hydration use 'light', then React re-renders with the real value.
const listeners = new Set();
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const readTheme = () =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
const serverTheme = () => 'light';

export default function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);

  const setTheme = useCallback((next) => {
    document.documentElement.dataset.theme = next;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLORS[next]);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage: the choice just won't persist.
    }
    // Synchronous, so flushSync inside the view transition sees the change.
    listeners.forEach((listener) => listener());
  }, []);

  const toggleTheme = useCallback(
    (origin) => {
      const next = readTheme() === 'dark' ? 'light' : 'dark';
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (!document.startViewTransition || reduceMotion) {
        setTheme(next);
        return;
      }

      const x = origin?.clientX ?? origin?.x ?? window.innerWidth / 2;
      const y = origin?.clientY ?? origin?.y ?? 0;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      // Scopes the circular reveal in index.css (page changes have their own).
      const root = document.documentElement;
      root.dataset.vt = 'theme';
      const transition = document.startViewTransition(() => {
        flushSync(() => setTheme(next));
      });
      transition.finished.finally(() => {
        if (root.dataset.vt === 'theme') delete root.dataset.vt;
      });

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 600,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        })
        .catch(() => {});
    },
    [setTheme]
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
