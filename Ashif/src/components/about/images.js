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

// PORTRAIT_SIZES mirrors the layout in About.jsx; update them together.
// Container: 78rem wide with 40px padding from 1000px up.

/** Portrait: 5 of 12 columns from md up (468px at most), full width below. */
export const PORTRAIT_SIZES = [
  '(min-width: 1248px) 468px',
  '(min-width: 1024px) calc(41.67vw - 52px)',
  '(min-width: 768px) calc(38.33vw - 14px)',
  'calc(100vw - 2rem)',
].join(', ');
