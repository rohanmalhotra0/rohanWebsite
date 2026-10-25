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
// They reserve each image's box before it loads and keep small covers small.
const IMAGE_SIZES = {
  'autism-research': [1400, 1057],
  casen: [1265, 712],
  'epm-interactive-guide': [1400, 875],
  'epm-wizard': [1400, 736],
  gavindle: [1400, 1119],
  greensticker: [1400, 1258],
  'linear-generator': [539, 463],
  nightshift: [1265, 712],
  refrax: [858, 732],
  'spot-vision': [1320, 825],
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
};

export const focalPoint = (project) => FOCAL_POINTS[project.slug] ?? '50% 50%';

/** Shared layoutId for a featured cover and the viewer image it flies into. */
export const mediaLayoutId = (slug) => `project-media-${slug}`;

// Each category takes one of the palette's five category colors (c1–c5),
// grouped by kind of work: the two AI categories share one, as do the two
// numbers-heavy ones.
const CATEGORY_COLOR = {
  'AI & systems': 'c1',
  'AI & robotics': 'c1',
  Quant: 'c2',
  Data: 'c2',
  Education: 'c3',
  Web: 'c4',
  Systems: 'c5',
};

/** The CSS color for a project category, from the active palette. */
export const categoryColor = (category) => `var(--${CATEGORY_COLOR[category] ?? 'c5'})`;

/** "AI & systems · 2026", or just the category when the year is unknown. */
export const projectMeta = (project) => [project.category, project.year].filter(Boolean).join(' · ');

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
    ...order.map((name) => ({ value: name, label: name, count: counts.get(name) || 0 })),
  ];
}

// Deep links on the Projects page: /projects/#project/<slug>. Plain
// #anchors are left alone.
const HASH = /^#project\/([a-z0-9-]+)$/i;

export const projectHash = (slug) => `#project/${slug}`;

/** The project's own page, if it has a case study (see routes.js). */
export const caseStudyPath = (project) => (project.caseStudy ? `/projects/${project.slug}/` : null);

export const findProject = (slug) => projects.find((p) => p.slug === slug) ?? null;

/** The slug in a `#project/<slug>` hash, if it names a real project. */
export function slugFromHash(hash) {
  const match = HASH.exec(hash || '');
  return match && findProject(match[1]) ? match[1] : null;
}
