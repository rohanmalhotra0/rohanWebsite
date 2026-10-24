import { createContext, useContext } from 'react';

export const THEME_STORAGE_KEY = 'rm-theme';

export const THEME_COLORS = { light: '#f3f2ee', dark: '#0e0e0d' };

export const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  // Pass the click event (or {x, y}) to grow the new theme from that point.
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
