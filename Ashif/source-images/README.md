# Source images

Full-resolution originals for the photos and project covers on the site.
They are not deployed. The site serves optimized WebP copies from
`public/img/` (photos max 1200px, covers max 1400px, quality ~80).

To add or replace an image, put the original here and export a WebP into
`public/img/`, then reference it with `assetUrl('img/…')` in
`src/data/portfolioData.js`.
