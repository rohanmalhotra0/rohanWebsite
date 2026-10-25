// Fits each résumé HTML onto exactly one Letter page and prints it to PDF.
// Usage: node print.mjs build/jobs.json   (called by build.py)
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');

const MIN_FS = 9.5;   // pt; below 10 we warn
const MAX_FS = 10.5;
const MAX_GAP = 1.6;

const jobsPath = process.argv[2];
const jobs = JSON.parse(readFileSync(jobsPath, 'utf8'));
const browser = await chromium.launch();
const page = await browser.newPage();
const report = [];

const slack = () =>
  page.evaluate(() => {
    const p = document.querySelector('.page');
    const bottom = p.getBoundingClientRect().bottom - parseFloat(getComputedStyle(p).paddingBottom);
    return bottom - document.querySelector('.content').getBoundingClientRect().bottom;
  });

const apply = (fs, gap) =>
  page.evaluate(([fs, gap]) => {
    document.documentElement.style.setProperty('--fs', `${fs}pt`);
    document.documentElement.style.setProperty('--gap', gap);
  }, [fs, gap]);

for (const job of jobs) {
  await page.goto(pathToFileURL(job.html).href);
  await page.evaluate(() => document.fonts.ready);
  const warnings = [];

  // Largest font that fits, then spread the leftover space between sections.
  let lo = MIN_FS, hi = MAX_FS;
  await apply(lo, 1);
  if ((await slack()) < 0) warnings.push('OVERFLOWS at minimum size: cut content');
  await apply(hi, 1);
  if ((await slack()) >= 0) lo = hi;
  while (hi - lo > 0.02) {
    const mid = (lo + hi) / 2;
    await apply(mid, 1);
    if ((await slack()) >= 0) lo = mid; else hi = mid;
  }
  const fs = Math.floor(lo * 20) / 20;
  let gap = 1;
  while (gap + 0.05 <= MAX_GAP) {
    await apply(fs, gap + 0.05);
    if ((await slack()) < 0) break;
    gap += 0.05;
  }
  await apply(fs, gap);
  const left = await slack();
  if (fs < 10) warnings.push(`dense (${fs}pt)`);
  if (left > 40) warnings.push(`sparse: ${(left / 96).toFixed(2)}in empty`);

  // Flag bullets whose last line holds only a word or two.
  const orphans = await page.evaluate(() =>
    [...document.querySelectorAll('li, .summary, .lines p')].flatMap((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = [...range.getClientRects()];
      const tops = [...new Set(rects.map((r) => Math.round(r.top)))];
      if (tops.length < 2) return [];
      const lastTop = Math.max(...tops);
      const lastRight = Math.max(...rects.filter((r) => Math.round(r.top) === lastTop).map((r) => r.right));
      const box = el.getBoundingClientRect();
      const frac = (lastRight - box.left) / box.width;
      return frac < 0.22 ? [`orphan(${Math.round(frac * 100)}%): ${el.textContent.slice(0, 50)}`] : [];
    })
  );
  warnings.push(...orphans);

  await page.pdf({ path: job.pdf, width: '8.5in', height: '11in', printBackground: true });
  const info = execFileSync('pdfinfo', [job.pdf], { encoding: 'utf8' });
  const pages = Number(/Pages:\s+(\d+)/.exec(info)[1]);
  if (pages !== 1) warnings.push(`PDF has ${pages} pages`);
  report.push({ name: job.name, fs, gap: Math.round(gap * 100) / 100, pages, warnings });
}

await browser.close();
writeFileSync(join(dirname(jobsPath), 'report.json'), JSON.stringify(report, null, 2));
