/*
 * How each logo sits in its 40px tile. `width` is the mark's share of the tile
 * and `size` the source image's pixel size. `crop` ([x, y, w, h] in source
 * pixels) trims taglines and dead space so the mark stays legible this small.
 * Kalshi's logo is a full-bleed square, so it fills the tile.
 */
const FRAMES = {
  IBM: { width: 80, size: [500, 200] },
  Kalshi: { cover: true, size: [200, 200] },
  // The VT mark; the lockup's small type turns to noise at 40px.
  'Hume Center': { width: 72, crop: [55, 3, 84, 41], size: [196, 104] },
  'Aress Software': { width: 86, crop: [0, 0, 163, 46], size: [163, 59] },
  'Y-Axis': { width: 84, crop: [30, 2, 200, 53], size: [260, 80] },
};

export const logoFrame = (company) => FRAMES[company] ?? { width: 76 };
