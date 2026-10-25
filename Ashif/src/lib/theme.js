import { createContext, useContext } from 'react';

export const THEME_STORAGE_KEY = 'rm-theme';
export const PALETTE_STORAGE_KEY = 'rm-palette';

/**
 * The named palettes (styles/palettes.css), in picker order. `swatch` is the
 * pair of colors the picker shows for each, whatever palette is active.
 * Keep the ids in step with the list in index.html's head script.
 */
export const PALETTES = [
  { id: 'spot', name: 'Spot', blurb: 'Safety yellow and graphite', swatch: ['#ffc700', '#1d1e22'] },
  { id: 'terminal', name: 'Terminal', blurb: 'Phosphor green on navy', swatch: ['#3dff8f', '#0d1a33'] },
  { id: 'courant', name: 'Courant', blurb: 'NYU violet and gold', swatch: ['#57068c', '#e3a92f'] },
  { id: 'market', name: 'Market', blurb: 'Teal and coral', swatch: ['#0c625b', '#ff6b57'] },
  { id: 'paper', name: 'Paper', blurb: 'Ink and safety orange', swatch: ['#141414', '#ff5b14'] },
];

export const DEFAULT_PALETTE = 'spot';

export const isPalette = (id) => PALETTES.some((palette) => palette.id === id);

/** The browser chrome color (<meta name="theme-color">): each palette's page background. */
export const THEME_COLORS = {
  spot: { light: '#f6f2e4', dark: '#111214' },
  terminal: { light: '#edf5f0', dark: '#060b17' },
  courant: { light: '#f5f1fa', dark: '#110a1b' },
  market: { light: '#eef6f4', dark: '#061514' },
  paper: { light: '#f3f2ee', dark: '#0e0e0d' },
};

export const ThemeContext = createContext({
  theme: 'light',
  palette: DEFAULT_PALETTE,
  setTheme: () => {},
  // Pass the click event (or {x, y}) to grow the new theme from that point.
  toggleTheme: () => {},
  // (id, origin?): switch palette, growing it from `origin` like the theme.
  setPalette: () => {},
});

export const useTheme = () => useContext(ThemeContext);
