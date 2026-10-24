// Non-component helpers for the Projects section (kept out of the .jsx files
// so React Fast Refresh keeps working).

export const EASE = [0.16, 1, 0.3, 1];

export const META_TEXT = 'font-mono text-[11px] uppercase tracking-[0.18em] text-subtle';

/** Archive rows shown before "Show all". */
export const ARCHIVE_LIMIT = 8;

// Natural pixel sizes of the covers in public/img/projects (keyed by file name).
// Lets every <img> reserve its box before it loads, and keeps tiny covers small.
const IMAGE_SIZES = {
  'ai-quiz-maker': [1200, 600],
  'algorithms-practice': [1200, 600],
  'american-options-pricing': [277, 182],
  'autism-research': [1400, 1057],
  casen: [1265, 712],
  'democracies-survive': [1200, 600],
  'epm-interactive-guide': [1400, 875],
  'epm-wizard': [1400, 736],
  gavindle: [1400, 1119],
  'german-study-lab': [1200, 600],
  greensticker: [1400, 1258],
  'ibm-internship-tracker': [1200, 600],
  'income-risk-hedging': [277, 182],
  'indytrack-api': [1200, 600],
  'kalshi-live-kelly': [1200, 600],
  'linear-generator': [539, 463],
  'love-island-roi': [1200, 600],
  nightshift: [1265, 712],
  'oscillating-stock-model': [329, 153],
  'physics-calculator': [1200, 600],
  pivot: [464, 426],
  'refrax-3d': [1400, 611],
  refrax: [858, 732],
  'rohan-lab': [1200, 600],
  'rsi-predictor': [283, 178],
  'spot-vision': [1200, 800],
  'spy-gradient-boosting': [1200, 600],
};

/** `{ width, height, small }` for a project's cover. `small` covers must not be upscaled. */
export function getImageSize(project) {
  const file = String(project.imageUrl || '')
    .split('/')
    .pop()
    .replace(/\.\w+$/, '');
  const [width, height] = IMAGE_SIZES[file] ?? [1200, 675];
  return { width, height, small: width < 600 };
}

// Where to anchor each featured cover when the bento cell crops it.
const FOCAL_POINTS = {
  'epm-wizard': '12% 50%',
  'epm-interactive-guide': '50% 0%',
  casen: '0% 35%',
  nightshift: '50% 45%',
  refrax: '50% 55%',
  'spot-vision': '50% 62%',
};

export const focalPoint = (project) => FOCAL_POINTS[project.slug] ?? '50% 0%';

/**
 * Bento placement by position in the featured list: one large tile, then a
 * mix of widths. On md (2 columns) the first tile and a trailing odd tile span
 * the full row so nothing is orphaned.
 */
export function bentoLayout(index, count) {
  const LG = [
    'lg:col-span-7 lg:row-span-2',
    'lg:col-span-5',
    'lg:col-span-5',
    'lg:col-span-4',
    'lg:col-span-4',
    'lg:col-span-4',
  ];
  const spanMd = index === 0 || (index === count - 1 && (count - 1) % 2 === 1);
  return {
    size: index === 0 ? 'lg' : 'sm',
    className: [spanMd ? 'md:col-span-2' : '', LG[index] ?? 'lg:col-span-4'].join(' '),
  };
}

const normalize = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** True when every word of `query` appears in the title, tags, or description. */
export function matchesQuery(project, query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = normalize(
    [project.title, project.description, ...(project.tags || [])].join(' ')
  );
  return terms.every((term) => haystack.includes(term));
}

/**
 * Category chips: order is fixed by overall size (largest first, ties by first
 * appearance) so chips don't jump around; counts reflect the current search.
 */
export function categoryChips(all, matching) {
  const order = [];
  const totals = new Map();
  for (const p of all) {
    if (!totals.has(p.category)) order.push(p.category);
    totals.set(p.category, (totals.get(p.category) || 0) + 1);
  }
  order.sort((a, b) => totals.get(b) - totals.get(a));

  const counts = new Map();
  for (const p of matching) counts.set(p.category, (counts.get(p.category) || 0) + 1);

  return [
    { name: 'All', count: matching.length },
    ...order.map((name) => ({ name, count: counts.get(name) || 0 })),
  ];
}

// A repoUrl that points at a GitHub profile rather than a repository.
const isProfileUrl = (url) => /^https?:\/\/github\.com\/[^/]+\/?$/.test(url || '');

/** Labels for a project's outbound links (only the ones that exist). */
export function projectLinks(project) {
  const links = [];
  if (project.liveUrl) {
    links.push({ kind: 'live', href: project.liveUrl, short: 'Live', long: 'Visit live site' });
  }
  if (project.repoUrl) {
    const profile = isProfileUrl(project.repoUrl);
    links.push({
      kind: 'repo',
      href: project.repoUrl,
      short: profile ? 'GitHub' : 'Source',
      long: profile ? 'GitHub profile' : 'Source code',
    });
  }
  return links;
}

export const pad2 = (n) => String(n).padStart(2, '0');
