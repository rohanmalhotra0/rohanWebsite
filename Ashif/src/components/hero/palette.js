const FALLBACK = {
  light: { bg: '#f3f2ee', fg: '#141414', line: '#dcdbd5', accent: '#ff5b14' },
  dark: { bg: '#0e0e0d', fg: '#ecebe6', line: '#262624', accent: '#ff6a2b' },
};

/** Theme colours for the WebGL stage, read from the CSS custom properties. */
export function readPalette() {
  const root = document.documentElement;
  const theme = root.dataset.theme === 'dark' ? 'dark' : 'light';
  const style = getComputedStyle(root);
  const read = (name) => style.getPropertyValue(`--${name}`).trim() || FALLBACK[theme][name];
  return { theme, bg: read('bg'), fg: read('fg'), line: read('line'), accent: read('accent') };
}
