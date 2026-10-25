const FALLBACK = {
  light: { bg: '#f6f2e4', fg: '#17181b', line: '#ddd5bd', accent: '#ffc700', robot: '#ffc400' },
  dark: { bg: '#111214', fg: '#f3efe3', line: '#2a2c31', accent: '#ffc700', robot: '#ffc400' },
};

/**
 * Colours for the WebGL stage, read from the CSS custom properties, so the
 * floor, tape, toy and the robot's paint follow the palette and theme.
 */
export function readPalette() {
  const root = document.documentElement;
  const theme = root.dataset.theme === 'dark' ? 'dark' : 'light';
  const style = getComputedStyle(root);
  const read = (name) => style.getPropertyValue(`--${name}`).trim() || FALLBACK[theme][name];
  return {
    theme,
    bg: read('bg'),
    fg: read('fg'),
    line: read('line'),
    accent: read('accent'),
    robot: read('robot'),
    // Only set where the accent wouldn't show on the floor.
    toy: style.getPropertyValue('--robot-toy').trim() || read('accent'),
  };
}
