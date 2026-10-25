const FALLBACK = {
  light: { bg: '#f6f2e4', fg: '#17181b', line: '#ddd5bd', mark: '#b07d00', accent: '#ffc700', robot: '#ffc400' },
  dark: { bg: '#111214', fg: '#f3efe3', line: '#2a2c31', mark: '#ffc700', accent: '#ffc700', robot: '#ffc400' },
};

/** Relative luminance of a #rrggbb color, or null for anything else. */
function luminance(color) {
  const hex = /^#([0-9a-f]{6})$/i.exec(color)?.[1];
  if (!hex) return null;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const s = parseInt(hex.slice(i, i + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Colours for the WebGL stage, read from the CSS custom properties where the
 * scene sits (`el`, its host), so the floor, tape, toy and the robot's paint
 * follow the palette and theme, and the hero's lab panel where there is one
 * (palettes.css).
 */
export function readPalette(el = document.documentElement) {
  const pageTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const style = getComputedStyle(el);
  const read = (name) => style.getPropertyValue(`--${name}`).trim() || FALLBACK[pageTheme][name];
  const bg = read('bg');
  const shade = luminance(bg);
  return {
    // Lighting for what the robot stands on: the page, or a dark lab panel.
    theme: shade === null ? pageTheme : shade < 0.18 ? 'dark' : 'light',
    bg,
    fg: read('fg'),
    line: read('line'),
    // The accent at 3:1 on this ground (in a lab panel, the block's ink).
    accent: read('mark'),
    robot: read('robot'),
    // Only set where the accent wouldn't show on the floor.
    toy: style.getPropertyValue('--robot-toy').trim() || read('accent'),
  };
}
