// Writes the server-rendered portfolio into dist/index.html, so the page paints
// before any JavaScript runs and React hydrates it instead of building it.
// Runs after `vite build` and `vite build --ssr src/entry-server.jsx --outDir
// dist-ssr` (see the build script). If rendering fails, the site still works:
// dist/index.html is left as the plain client-rendered page.
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(root, 'dist', 'index.html');
const serverEntry = path.join(root, 'dist-ssr', 'entry-server.js');

// React hoists these to the front of the markup; the page already loads the
// poster from the <head> and React re-adds the chat's <style> on the client.
function stripHoisted(html) {
  let rest = html;
  for (;;) {
    const link = rest.match(/^<link\b[^>]*\/?>/);
    if (link) {
      rest = rest.slice(link[0].length);
      continue;
    }
    const style = rest.match(/^<style\b[^>]*>[\s\S]*?<\/style>/);
    if (style) {
      rest = rest.slice(style[0].length);
      continue;
    }
    return rest;
  }
}

// The hero poster depends on the theme, which is only known in the browser.
// Its srcset and src are set by an inline script right after #root (before
// first paint), so the preload scanner never fetches the wrong theme's image.
const POSTER = /<img\b([^>]*?)\ssrc="(\.\/img\/hero\/robot-)light(\.webp)"([^>]*?)\ssrcSet="([^"]*)"/;
const POSTER_SCRIPT = `<script>(function(){var i=document.querySelector('#root img[data-hero-poster]');if(!i)return;var t=document.documentElement.dataset.theme==='dark'?'dark':'light';i.srcset=i.getAttribute('data-srcset-'+t);i.src=i.getAttribute('data-src-'+t);})();</script>`;

try {
  const { render } = await import(pathToFileURL(serverEntry).href);
  let app = stripHoisted(render());

  if (!POSTER.test(app)) throw new Error('hero poster <img> not found in the rendered markup');
  app = app.replace(
    POSTER,
    (_, before, base, ext, between, srcset) =>
      `<img${before} data-hero-poster="" data-src-light="${base}light${ext}" data-src-dark="${base}dark${ext}"${between}` +
      ` data-srcset-light="${srcset}" data-srcset-dark="${srcset.replaceAll('robot-light', 'robot-dark')}"`
  );

  let index = await readFile(indexPath, 'utf8');
  if (!index.includes('<div id="root"></div>')) throw new Error('empty #root not found in dist/index.html');

  // With the markup already in the page, the stylesheet is the last request
  // standing between the HTML and first paint, so inline it. Its relative
  // url()s pointed into assets/; rebase them on the page.
  const stylesheet = index.match(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/);
  if (stylesheet) {
    const css = (await readFile(path.join(root, 'dist', stylesheet[1]), 'utf8')).replace(
      /url\(\.\//g,
      'url(./assets/'
    );
    index = index.replace(stylesheet[0], () => `<style>${css}</style>`);
  }
  index = index
    .replace('<div id="root"></div>', `<div id="root" data-prerendered="">${app}</div>${POSTER_SCRIPT}`)
    // The prerendered page replaces the plain no-JavaScript fallback.
    .replace(/\s*<noscript>\s*<main[\s\S]*?<\/main>\s*<\/noscript>/, '');
  await writeFile(indexPath, index);
  console.log(`prerender: wrote ${(app.length / 1024).toFixed(1)} kB of markup into dist/index.html`);
} catch (error) {
  console.warn(`prerender: skipped, the page will render on the client (${error.message})`);
} finally {
  await rm(path.join(root, 'dist-ssr'), { recursive: true, force: true });
}
