import { createContext, useContext } from 'react';

export const THEME_STORAGE_KEY = 'rm-theme';

export const THEME_COLORS = { dark: '#08090a', light: '#f7f7f5' };

export const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  // Pass the click event (or {x, y}) to grow the new theme from that point.
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
