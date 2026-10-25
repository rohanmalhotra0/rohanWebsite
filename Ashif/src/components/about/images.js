// Each photo has smaller copies next to it, <name>-<width>.webp, made from
// source-images/me at the same framing. The original file is the largest size.
export const VARIANT_WIDTHS = [400, 600, 900];

/** srcset with every generated width below the original, then the original. */
export function srcSetFor(photo) {
  return [
    ...VARIANT_WIDTHS.filter((width) => width < photo.width).map(
      (width) => `${photo.src.replace(/\.webp$/, `-${width}.webp`)} ${width}w`
    ),
    `${photo.src} ${photo.width}w`,
  ].join(', ');
}

// The `sizes` below mirror the layout in About.jsx and Gallery.jsx; update them
// together. Container: 78rem wide with 40px padding from 1000px up.

/**
 * Gallery thumbnail. Phones and tablets: a strip of fixed height (h-64, sm:h-72),
 * so width = height × aspect. Desktop: one row sharing min(100vw, 1248px) minus
 * padding and four 20px gaps in proportion to each photo's aspect.
 */
export function thumbnailSizes(photo, totalAspect) {
  const aspect = photo.width / photo.height;
  const share = aspect / totalAspect;
  return [
    `(min-width: 1248px) ${Math.round(1088 * share)}px`,
    `(min-width: 1024px) calc((100vw - 160px) * ${share.toFixed(4)})`,
    `(min-width: 640px) ${Math.round(288 * aspect)}px`,
    `${Math.round(256 * aspect)}px`,
  ].join(', ');
}

/** Portrait: 5 of 12 columns from md up (468px at most), full width below. */
export const PORTRAIT_SIZES = [
  '(min-width: 1248px) 468px',
  '(min-width: 1024px) calc(41.67vw - 52px)',
  '(min-width: 768px) calc(38.33vw - 14px)',
  'calc(100vw - 2rem)',
].join(', ');
