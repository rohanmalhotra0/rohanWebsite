// Data helpers and constants for the Projects section. Kept out of the .jsx
// files so React Fast Refresh keeps working.
import { projects } from '@/data/portfolioData';

export const EASE = [0.16, 1, 0.3, 1];

/** Layout transition for the image flying between a featured card and the viewer. */
export const FLIGHT = { layout: { type: 'spring', visualDuration: 0.45, bounce: 0 } };

/** Layout changes that happen behind the viewer's scrim must not animate. */
export const INSTANT = { layout: { type: false, delay: 0 } };

export const featuredProjects = projects.filter((project) => project.featured);

/** Archive rows shown before "Show all". Only collapse when it hides 3 or more. */
export const ARCHIVE_ROWS = 10;
export const archiveCollapses = (count) => count > ARCHIVE_ROWS + 2;

// Natural pixel sizes of the covers in public/img/projects, keyed by file name.
// They reserve each image's box before it loads and keep tiny covers small.
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
  refrax: [858, 732],
  'rohan-lab': [1200, 600],
  'rsi-predictor': [283, 178],
  'spot-vision': [1200, 800],
  'spy-gradient-boosting': [1200, 600],
};

/** `{ width, height, small }`; small covers are shown at their natural size. */
export function imageSize(project) {
  const file = String(project.imageUrl || '')
    .split('/')
    .pop()
    .replace(/\.\w+$/, '');
  const [width, height] = IMAGE_SIZES[file] ?? [1200, 750];
  return { width, height, small: width < 600 };
}

// Where to anchor each featured cover inside its 16:10 crop.
const FOCAL_POINTS = {
  'epm-wizard': '0% 50%',
  nightshift: '30% 50%',
  'spot-vision': '50% 60%',
};

export const focalPoint = (project) => FOCAL_POINTS[project.slug] ?? '50% 50%';

/** Shared layoutId for a featured cover and the viewer image it flies into. */
export const mediaLayoutId = (slug) => `project-media-${slug}`;

/** "AI & Systems" → "AI & systems". Keeps acronyms and the first word as written. */
export function sentenceCase(label = '') {
  return label
    .split(' ')
    .map((word, i) => (i === 0 || /^[A-Z0-9]{2,}$/.test(word) ? word : word.toLowerCase()))
    .join(' ');
}

/** "AI & systems · 2026", or just the category when the year is unknown. */
export const projectMeta = (project) =>
  [sentenceCase(project.category), project.year].filter(Boolean).join(' · ');

// A repoUrl that points at a GitHub profile rather than a repository is not a
// project's source, so it is not shown as one.
const isProfileUrl = (url) => /^https?:\/\/github\.com\/[^/]+\/?$/i.test(url || '');

/** The project's outbound links that actually exist. */
export function projectLinks(project) {
  const links = [];
  if (project.liveUrl) links.push({ kind: 'live', href: project.liveUrl, label: 'Open site' });
  if (project.repoUrl && !isProfileUrl(project.repoUrl)) {
    links.push({ kind: 'repo', href: project.repoUrl, label: 'Source' });
  }
  return links;
}

const normalize = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const searchText = new Map(
  projects.map((p) => [p.slug, normalize([p.title, p.description, ...(p.tags || [])].join(' '))])
);

/** True when every word of `query` appears in the title, tags, or description. */
export function matchesQuery(project, query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = searchText.get(project.slug) ?? '';
  return terms.every((term) => haystack.includes(term));
}

/**
 * Filter options: "All", then categories ordered by size (ties by first
 * appearance) so they never reorder. Counts follow the current search.
 */
export function categoryOptions(all, matching) {
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
    { value: 'all', label: 'All', count: matching.length },
    ...order.map((name) => ({ value: name, label: sentenceCase(name), count: counts.get(name) || 0 })),
  ];
}

// Deep links: #project/<slug>. App owns #/resume; plain #section anchors are
// left alone.
const HASH = /^#project\/([a-z0-9-]+)$/i;

export const projectHash = (slug) => `#project/${slug}`;

export const findProject = (slug) => projects.find((p) => p.slug === slug) ?? null;

/** The slug in a `#project/<slug>` hash, if it names a real project. */
export function slugFromHash(hash) {
  const match = HASH.exec(hash || '');
  return match && findProject(match[1]) ? match[1] : null;
}
