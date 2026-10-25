// Checks every palette in src/styles/palettes.css against WCAG 2.1 contrast:
// 4.5:1 for text, 3:1 for form borders, focus rings, thin marks, and the
// category colors, plus the Spot story's labels, which use colors set per
// theme for every palette. `npm run contrast`; exits 1 if any pair falls short.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = await readFile(path.join(root, 'src/styles/palettes.css'), 'utf8');

// [text token, background token, minimum ratio]
const PAIRS = [
  ['fg', 'bg', 4.5],
  ['fg', 'surface', 4.5],
  ['fg', 'surface-2', 4.5],
  ['muted', 'bg', 4.5],
  ['muted', 'surface', 4.5],
  ['subtle', 'bg', 4.5],
  ['subtle', 'surface', 4.5],
  ['accent-strong', 'bg', 4.5],
  ['accent-strong', 'surface', 4.5],
  ['accent-ink', 'accent', 4.5],
  ['accent-2-ink', 'accent-2', 4.5],
  ['on-block-a', 'block-a', 4.5],
  ['on-block-b', 'block-b', 4.5],
  ['on-block-c', 'block-c', 4.5],
  // Secondary text on a block is 80% ink mixed into the block (index.css).
  ['on-block-a~80', 'block-a', 4.5],
  ['on-block-b~80', 'block-b', 4.5],
  ['on-block-c~80', 'block-c', 4.5],
  ['input', 'bg', 3],
  ['input', 'surface', 3],
  ['mark', 'bg', 3],
  ['mark', 'surface', 3],
  ['c1', 'bg', 3],
  ['c2', 'bg', 3],
  ['c3', 'bg', 3],
  ['c4', 'bg', 3],
  ['c5', 'bg', 3],
  // The Spot story (components/projects/spot): ink on the pink toy and the
  // yellow robot tiles, the E-STOP label, and the kill-switch's edge.
  ['on-bright', 'toy', 4.5],
  ['on-bright', 'spot', 4.5],
  ['white', 'stop', 4.5],
  ['stop', 'surface', 3],
];

const hex = (value) => {
  const h = value.trim().replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

const luminance = ([r, g, b]) => {
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// color-mix(in srgb, a p%, b) on sRGB channels, as the browser does.
const mix = (a, b, p) => a.map((v, i) => Math.round(v * p + b[i] * (1 - p)));

const parsed = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]*?)\{([^{}]*)\}/g)].map(
  ([, selector, body]) => ({
    selector: selector.trim(),
    tokens: Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})/g)].map((m) => [m[1], m[2]])),
  })
);
// Colors set per theme for every palette (the Spot story's objects).
const themeTokens = (theme) =>
  Object.assign(
    {},
    ...parsed.filter(({ selector }) => selector.split(/,\s*/).includes(`[data-theme="${theme}"]`)).map((block) => block.tokens)
  );
// One entry per palette and theme, merging every rule that targets it.
const byName = new Map();
for (const { selector, tokens } of parsed) {
  const [, palette, theme] =
    selector
      .split(/,\s*/)
      .map((part) => part.match(/^\[data-palette="(\w+)"\]\[data-theme="(\w+)"\]$/))
      .find(Boolean) || [];
  if (!palette) continue;
  const name = `${palette}/${theme}`;
  byName.set(name, { ...(byName.get(name) ?? themeTokens(theme)), ...tokens });
}
const blocks = [...byName].map(([name, tokens]) => ({ name, tokens }));

let failures = 0;
for (const { name, tokens } of blocks) {
  const color = (token) => {
    const [base, weight] = token.split('~');
    if (weight) {
      const block = base.replace('on-', '');
      return mix(hex(tokens[base]), hex(tokens[block]), Number(weight) / 100);
    }
    const value = token === 'white' ? '#ffffff' : (tokens[token] ?? (token === 'mark' ? tokens.accent : undefined));
    if (!value) throw new Error(`${name}: --${token} is missing`);
    return hex(value);
  };
  const lines = [];
  for (const [text, background, min] of PAIRS) {
    const r = ratio(color(text), color(background));
    if (r < min) {
      failures += 1;
      lines.push(`  ✗ ${text} on ${background}: ${r.toFixed(2)} (needs ${min})`);
    }
  }
  console.log(`${lines.length ? '✗' : '✓'} ${name}${lines.length ? `\n${lines.join('\n')}` : ''}`);
}

if (!blocks.length) throw new Error('no palettes found in palettes.css');
if (failures) {
  console.error(`\n${failures} pair${failures === 1 ? '' : 's'} below WCAG AA`);
  process.exitCode = 1;
} else {
  console.log(`\nAll ${blocks.length} palette themes pass.`);
}
