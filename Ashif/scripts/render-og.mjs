// Renders the link-preview cards into public/og (<card>.jpg, 1200×630): one
// per page that has its own (ogCard in src/routes.js), drawn by scripts/og
// from the site's own blocks and fonts. scripts/prerender.mjs points each
// page's og:image at its card. Run after changing a page's name, tagline or
// block, the hero, or the Spot palette:
//
//   npm run og
//
// Needs Playwright with a Chromium (npx playwright install chromium).
import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public', 'og');

// A local install, or a global one on NODE_PATH (which only require() reads).
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  try {
    ({ chromium } = createRequire(import.meta.url)('playwright'));
  } catch {
    console.error('render-og: needs Playwright (npm i -D playwright && npx playwright install chromium)');
    process.exit(1);
  }
}

const server = await createServer({ root, logLevel: 'error', server: { port: 5198, strictPort: true } });
await server.listen();
const browser = await chromium.launch();

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:5198/scripts/og/index.html');
  await page.waitForFunction(() => window.cardsReady === true);
  for (const id of await page.evaluate(() => window.cardIds())) {
    await page.evaluate((card) => window.renderCard(card), id);
    const image = await page.screenshot({ type: 'jpeg', quality: 88, clip: { x: 0, y: 0, width: 1200, height: 630 } });
    await writeFile(path.join(out, `${id}.jpg`), image);
    console.log(`render-og: ${id}.jpg (${(image.length / 1024).toFixed(0)} kB)`);
  }
} finally {
  await browser.close();
  await server.close();
}
