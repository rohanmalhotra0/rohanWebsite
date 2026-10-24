import { useCallback, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { THEME_COLORS, THEME_STORAGE_KEY, ThemeContext } from '@/lib/theme';

function readTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readTheme);

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
    setThemeState(next);
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

      const transition = document.startViewTransition(() => {
        flushSync(() => setTheme(next));
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
