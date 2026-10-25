// Renders the hero posters for every palette and theme into public/img/hero
// (robot-<palette>-<theme>.webp at 1600 px and -800.webp), so the still that
// paints before the 3D scene matches its colors. Run after changing a
// palette's --bg, --fg, --accent or --robot:
//
//   node scripts/render-posters.mjs
//
// Needs Playwright with a Chromium (npx playwright install chromium). Uses
// software WebGL, so it takes a minute or two.
import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public', 'img', 'hero');
const PALETTES = ['spot', 'terminal', 'courant', 'market', 'paper'];
const THEMES = ['light', 'dark'];

// A local install, or a global one on NODE_PATH (which only require() reads).
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  try {
    ({ chromium } = createRequire(import.meta.url)('playwright'));
  } catch {
    console.error('render-posters: needs Playwright (npm i -D playwright && npx playwright install chromium)');
    process.exit(1);
  }
}

const server = await createServer({ root, logLevel: 'error', server: { port: 5199, strictPort: true } });
await server.listen();
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });

try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1600 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:5199/scripts/posters/index.html');
  await page.waitForFunction(() => window.postersReady === true);
  for (const palette of PALETTES) {
    for (const theme of THEMES) {
      const { full, small } = await page.evaluate(([p, t]) => window.renderPoster(p, t), [palette, theme]);
      const base = path.join(out, `robot-${palette}-${theme}`);
      await writeFile(`${base}.webp`, Buffer.from(full.split(',')[1], 'base64'));
      await writeFile(`${base}-800.webp`, Buffer.from(small.split(',')[1], 'base64'));
      console.log(`render-posters: robot-${palette}-${theme}`);
    }
  }
} finally {
  await browser.close();
  await server.close();
}
