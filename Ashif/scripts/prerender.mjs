// Writes one HTML file per page (dist/index.html, dist/projects/index.html,
// …, and dist/404.html for GitHub Pages), each with its page already rendered
// inside, so it paints before any JavaScript runs and React hydrates it
// instead of building it. Each file gets its page's title, description, and
// URL in the <head>, and preloads that page's own code. Also writes the
// sitemap. Runs after `vite build` and `vite build --ssr src/entry-server.jsx
// --outDir dist-ssr` (see the build script).
//
// A page that fails to render is still written, as the plain client-rendered
// template with its own <head>, so every URL keeps working. If the step can't
// run at all, the build fails: without these files every page but the home
// page would 404, so the deploy stops and the live site stays as it was.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SITE = 'https://rohanm.org';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const serverEntry = path.join(root, 'dist-ssr', 'entry-server.js');
const manifestPath = path.join(dist, '.vite', 'manifest.json');

const escapeAttr = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * React hoists <link> and <style> tags to the front of the markup. Image
 * preloads move into the <head> (where they help), except on the home page,
 * whose poster depends on the theme and is preloaded by index.html's script.
 * Styles are dropped; React adds them again on the client (the chat's).
 */
function splitHoisted(html) {
  const links = [];
  let rest = html;
  for (;;) {
    const link = rest.match(/^<link\b[^>]*\/?>/);
    if (link) {
      if (/\brel="preload"/.test(link[0]) && /\bas="image"/.test(link[0])) links.push(link[0]);
      rest = rest.slice(link[0].length);
      continue;
    }
    const style = rest.match(/^<style\b[^>]*>[\s\S]*?<\/style>/);
    if (style) {
      rest = rest.slice(style[0].length);
      continue;
    }
    return { links, markup: rest };
  }
}

// The hero poster depends on the theme, which is only known in the browser.
// Its srcset and src are set by an inline script right after #root (before
// first paint), so the preload scanner never fetches the wrong theme's image.
const POSTER = /<img\b([^>]*?)\ssrc="(\/img\/hero\/robot-)light(\.webp)"([^>]*?)\ssrcSet="([^"]*)"/;
const POSTER_SCRIPT = `<script>(function(){var i=document.querySelector('#root img[data-hero-poster]');if(!i)return;var t=document.documentElement.dataset.theme==='dark'?'dark':'light';i.srcset=i.getAttribute('data-srcset-'+t);i.src=i.getAttribute('data-src-'+t);})();</script>`;

function themePoster(markup) {
  if (!POSTER.test(markup)) throw new Error('hero poster <img> not found in the rendered markup');
  return (
    markup.replace(
      POSTER,
      (_, before, base, ext, between, srcset) =>
        `<img${before} data-hero-poster="" data-src-light="${base}light${ext}" data-src-dark="${base}dark${ext}"${between}` +
        ` data-srcset-light="${srcset}" data-srcset-dark="${srcset.replaceAll('robot-light', 'robot-dark')}"`
    ) + POSTER_SCRIPT
  );
}

/** Replace a <meta> tag (any whitespace, as formatted in index.html) with one carrying `content`. */
function setMeta(html, attribute, key, content) {
  const tag = new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="[^"]*"\\s*/>`);
  if (!tag.test(html)) throw new Error(`<meta ${attribute}="${key}"> not found in index.html`);
  return html.replace(tag, () => `<meta ${attribute}="${key}" content="${escapeAttr(content)}" />`);
}

/** The page's own <head>: title, description, canonical URL, and social cards. */
function headFor(template, route) {
  const notFound = !route.path;
  const url = `${SITE}${route.path ?? '/'}`;
  let html = template.replace(/<title>[^<]*<\/title>/, () => `<title>${escapeAttr(route.title)}</title>`);
  html = setMeta(html, 'name', 'description', route.description);
  if (notFound) {
    html = html
      .replace(/\s*<link rel="canonical"[^>]*>/, '')
      .replace('</title>', '</title>\n    <meta name="robots" content="noindex" />');
    return html;
  }
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/, () => `<link rel="canonical" href="${url}" />`);
  html = setMeta(html, 'property', 'og:url', url);
  // The home page keeps the social copy written for it in index.html.
  if (route.path !== '/') {
    html = setMeta(html, 'property', 'og:title', route.title);
    html = setMeta(html, 'property', 'og:description', route.description);
    html = setMeta(html, 'name', 'twitter:title', route.title);
    html = setMeta(html, 'name', 'twitter:description', route.description);
  }
  return html;
}

/**
 * <link>s for a page's own chunk, the chunks it imports, and their CSS, so
 * the browser fetches them with the HTML instead of after main.js asks.
 * Skips anything the template already loads.
 */
function pageAssets(manifest, route, template) {
  const source = `src/pages/${route.page}.jsx`;
  // Usually keyed by its source path; a chunk Rollup built around more than
  // the page itself is keyed by file name, but still named after the page.
  const entry =
    Object.keys(manifest).find((key) => key === source || manifest[key].src === source) ??
    Object.keys(manifest).find((key) => manifest[key].isDynamicEntry && manifest[key].name === route.page);
  if (!entry) throw new Error(`${source} not found in the build manifest`);
  const scripts = new Set();
  const styles = new Set();
  const visit = (key) => {
    const chunk = manifest[key];
    // The entry (main.jsx and its CSS) is already in the template.
    if (!chunk || chunk.isEntry || scripts.has(chunk.file)) return;
    scripts.add(chunk.file);
    for (const css of chunk.css ?? []) styles.add(css);
    for (const child of chunk.imports ?? []) visit(child);
  };
  visit(entry);
  const tags = [
    ...[...styles].map((file) => `<link rel="stylesheet" crossorigin href="/${file}">`),
    ...[...scripts].map((file) => `<link rel="modulepreload" crossorigin href="/${file}">`),
  ];
  return tags.filter((tag) => !template.includes(tag.match(/href="([^"]+)"/)[1]));
}

const outputFile = (route) =>
  route.path ? path.join(dist, route.path, 'index.html') : path.join(dist, '404.html');

async function writePage(route, html) {
  const file = outputFile(route);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
}

try {
  let template = await readFile(path.join(dist, 'index.html'), 'utf8');
  if (!template.includes('<div id="root"></div>')) throw new Error('empty #root not found in dist/index.html');

  // With the markup already in the page, the stylesheet is the last request
  // standing between the HTML and first paint, so inline it. Its url()s are
  // root-relative (/assets/…), so they work from any page.
  const stylesheet = template.match(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/);
  if (stylesheet) {
    const css = await readFile(path.join(dist, stylesheet[1]), 'utf8');
    template = template.replace(stylesheet[0], () => `<style>${css}</style>`);
  }

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const { render, routes, notFoundRoute } = await import(pathToFileURL(serverEntry).href);
  const pages = [...routes, notFoundRoute];
  let written = 0;

  for (const route of pages) {
    const head = headFor(template, route);
    try {
      const { links, markup } = splitHoisted(await render(route.path ?? '/404/'));
      const app = route.id === 'home' ? themePoster(markup) : markup;
      const preloads = [...(route.id === 'home' ? [] : links), ...pageAssets(manifest, route, template)];
      const html = head
        .replace('</head>', () => `${preloads.map((tag) => `    ${tag}\n`).join('')}  </head>`)
        .replace(
          '<div id="root"></div>',
          () => `<div id="root" data-prerendered="" data-route="${route.id}">${app}</div>`
        )
        // The prerendered page replaces the plain no-JavaScript fallback.
        .replace(/\s*<noscript>\s*<main[\s\S]*?<\/main>\s*<\/noscript>/, '');
      await writePage(route, html);
      written += 1;
      console.log(`prerender: ${route.path ?? '404.html'} (${(app.length / 1024).toFixed(1)} kB)`);
    } catch (error) {
      await writePage(route, head);
      console.warn(`prerender: ${route.path ?? '404.html'} renders on the client (${error.message})`);
    }
  }

  const urls = routes.map(
    (route) => `  <url>\n    <loc>${SITE}${route.path}</loc>\n    <priority>${route.path === '/' ? '1.0' : '0.8'}</priority>\n  </url>`
  );
  await writeFile(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
  );
  console.log(`prerender: wrote ${written} of ${pages.length} pages and the sitemap`);
} catch (error) {
  console.error(`prerender: failed (${error.message})`);
  process.exitCode = 1;
} finally {
  await rm(path.join(root, 'dist-ssr'), { recursive: true, force: true });
  await rm(path.join(dist, '.vite'), { recursive: true, force: true });
}
