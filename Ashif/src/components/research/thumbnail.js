/**
 * Research thumbnails ship as `name.webp` (1200px wide) with `name-600.webp`
 * and `name-900.webp` beside it in public/img/research/.
 */
const VARIANT_WIDTHS = [600, 900];
const FULL_WIDTH = 1200;

export const thumbnailSrcSet = (url) => {
  if (!/\.webp$/.test(url ?? '')) return undefined;
  return [
    ...VARIANT_WIDTHS.map((width) => `${url.replace(/\.webp$/, `-${width}.webp`)} ${width}w`),
    `${url} ${FULL_WIDTH}w`,
  ].join(', ');
};

/**
 * The slot's rendered width, mirroring the grid in Research.jsx. A column is
 * (content width − 11 gaps × 32px) / 12. From lg the slot is 4 columns: 368px
 * once the 78rem container is full, 100vw − 80px gutters below that. At md it
 * is 5 columns of a 92vw content box; below md it is the full content box.
 */
export const THUMBNAIL_SIZES = [
  '(min-width: 1248px) 368px',
  '(min-width: 1024px) calc(33.3vw - 48px)',
  '(min-width: 768px) calc(38.3vw - 19px)',
  '92vw',
].join(', ');

/** If a size variant is missing, drop srcset so the browser falls back to `src`. */
export const dropSrcSetOnError = (event) => {
  const image = event.currentTarget;
  if (image.hasAttribute('srcset')) image.removeAttribute('srcset');
};
