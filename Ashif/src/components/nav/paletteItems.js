// Everything the ⌘K palette can find, plus the search that ranks it.
// Items are plain data: `action` describes what Enter does, `verb` is the
// footer label for it, and the palette component carries it out.
// `keywords` are facts worth showing when they are why a row matched (a
// company, a tag, an author); `aliases` are synonyms that are only searched.

import {
  Copy,
  Download,
  FileText,
  FileUser,
  Folder,
  Github,
  Linkedin,
  Mail,
  MessageSquare,
  Moon,
  Sun,
} from 'lucide-react';
import { caseStudyPath } from '@/components/projects/projectData';
import { education, profile, projects, research, workExperience } from '@/data/portfolioData';
import { navRoutes, routeById } from '@/routes';
import { scoreItem } from './fuzzy';

// With an empty query: a short, ordered start page of `suggested` items.
const START_GROUPS = [
  { id: 'projects', label: 'Featured projects' },
  { id: 'actions', label: 'Actions' },
  { id: 'research', label: 'Research' },
  { id: 'goto', label: 'Go to' },
];

// With a query: everything, groups sorted by their best match.
const SEARCH_GROUPS = [
  { id: 'projects', label: 'Projects' },
  { id: 'actions', label: 'Actions' },
  { id: 'research', label: 'Research' },
  { id: 'goto', label: 'Go to' },
];

const unique = (list) => [...new Set(list.filter(Boolean))];
const bareUrl = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
// github.com/<user> is a profile, not a repository.
const isGitHubProfile = (url) => /^https?:\/\/(www\.)?github\.com\/[^/]+\/?$/i.test(url);

const PAGE_SEARCH = {
  home: { aliases: ['start', 'top', 'index'] },
  experience: {
    // Education and skills live on the Experience page.
    keywords: [...workExperience.map((job) => job.company), education.school, education.college],
    aliases: ['work', 'jobs', 'internships', 'education', 'school', 'university', 'courses', 'gpa', 'skills'],
  },
  projects: { aliases: ['portfolio', 'code', 'apps'] },
  research: { aliases: ['papers', 'publications'] },
  about: { aliases: ['bio', 'me', 'photos', 'pictures'] },
  chat: { aliases: ['ask', 'ai', 'assistant', 'rohangpt'] },
  contact: { aliases: ['email', 'message', 'get in touch'] },
};

// Pages have no icon: the "Go to" heading says what they are.
const goToItems = [{ ...routeById('home'), label: 'Home' }, ...navRoutes].map((page) => ({
  id: `goto-${page.id}`,
  group: 'goto',
  title: page.label,
  keywords: unique(PAGE_SEARCH[page.id]?.keywords ?? []),
  aliases: PAGE_SEARCH[page.id]?.aliases ?? [],
  // Home is findable but not on the start page; the wordmark already goes there.
  suggested: page.id !== 'home',
  verb: 'Go',
  action: { type: 'route', href: page.path },
}));

const projectItems = projects.map((project) => {
  const repoUrl = project.repoUrl && !isGitHubProfile(project.repoUrl) ? project.repoUrl : null;
  // A case study is the best place to send someone; then the live site or source.
  const study = caseStudyPath(project);
  const href = study ? null : project.liveUrl || repoUrl;
  return {
    id: `project-${project.slug}`,
    group: 'projects',
    title: project.title,
    meta: [project.category, project.year].filter(Boolean).join(' · '),
    keywords: unique([project.category, ...(project.tags ?? [])]),
    aliases: [],
    icon: Folder,
    suggested: Boolean(project.featured),
    external: Boolean(href),
    verb: study ? 'Read case study' : project.liveUrl ? 'Open site' : repoUrl ? 'View source' : 'View project',
    // Without a link of its own, a project opens in the Projects page's viewer.
    action: href
      ? { type: 'url', href }
      : { type: 'route', href: study ?? `${routeById('projects').path}#project/${project.slug}` },
  };
});

const researchItems = research
  .filter((paper) => paper.liveUrl)
  .map((paper) => ({
    id: `research-${paper.title}`,
    group: 'research',
    title: paper.title,
    meta: [paper.venue, paper.year].filter(Boolean).join(' · '),
    keywords: unique([
      ...(paper.authors ?? '').split(',').map((name) => name.trim()),
      paper.venue,
      ...(paper.keywords ?? []),
      ...(paper.tags ?? []),
    ]),
    aliases: ['paper', 'pdf'],
    icon: FileText,
    suggested: true,
    external: true,
    verb: 'Open PDF',
    action: { type: 'url', href: paper.liveUrl },
  }));

const themeItem = (theme) => {
  const next = theme === 'dark' ? 'light' : 'dark';
  return {
    id: 'action-theme',
    group: 'actions',
    title: `Switch to ${next} theme`,
    keywords: [],
    aliases: ['theme', 'dark mode', 'light mode', 'appearance', 'color scheme'],
    icon: next === 'dark' ? Moon : Sun,
    suggested: true,
    verb: 'Switch',
    action: { type: 'theme' },
  };
};

const actionItems = (theme) => [
  {
    id: 'action-copy-email',
    group: 'actions',
    title: 'Copy email',
    keywords: [],
    aliases: ['clipboard', 'mail', 'address', 'contact'],
    icon: Copy,
    suggested: true,
    verb: 'Copy',
    action: { type: 'copy', text: profile.email },
  },
  {
    id: 'action-resume-pdf',
    group: 'actions',
    title: 'Download résumé PDF',
    keywords: [],
    aliases: ['cv', 'resume', 'pdf', 'save'],
    icon: Download,
    suggested: true,
    verb: 'Download',
    action: { type: 'download', href: profile.resumeUrl },
  },
  themeItem(theme),
  {
    id: 'action-resume',
    group: 'actions',
    title: 'View résumé',
    keywords: [],
    aliases: ['cv', 'resume'],
    icon: FileUser,
    verb: 'Open',
    action: { type: 'route', href: routeById('resume').path },
  },
  {
    id: 'action-github',
    group: 'actions',
    title: 'GitHub',
    meta: bareUrl(profile.github),
    keywords: [],
    aliases: ['code', 'repos', 'source'],
    icon: Github,
    external: true,
    verb: 'Open',
    action: { type: 'url', href: profile.github },
  },
  {
    id: 'action-linkedin',
    group: 'actions',
    title: 'LinkedIn',
    meta: bareUrl(profile.linkedin),
    keywords: [],
    aliases: ['profile', 'connect'],
    icon: Linkedin,
    external: true,
    verb: 'Open',
    action: { type: 'url', href: profile.linkedin },
  },
  {
    id: 'action-email',
    group: 'actions',
    title: 'Email',
    meta: profile.email,
    keywords: [],
    aliases: ['mail', 'contact', 'message', 'send'],
    icon: Mail,
    verb: 'Write',
    action: { type: 'mailto', href: `mailto:${profile.email}` },
  },
];

/** All palette items for the current theme (one title depends on it). */
export const getPaletteItems = (theme) => [
  ...projectItems,
  ...actionItems(theme),
  ...researchItems,
  ...goToItems,
];

const askItem = (query) => ({
  id: 'ask',
  group: 'ask',
  title: 'Ask about my work',
  quote: query,
  icon: MessageSquare,
  verb: 'Ask',
  action: { type: 'ask', prompt: query },
});

/**
 * The meta shown for a match: the keyword it came through, when that keyword
 * is a fact the row doesn't already show ("Experience · Aress Software"),
 * otherwise the item's own meta.
 */
function metaFor(item, keyword) {
  if (!keyword || item.meta?.toLowerCase().includes(keyword.toLowerCase())) return item.meta;
  return keyword;
}

/**
 * Filter and rank `items` for `query`.
 * Returns `groups` ([{ id, label, results: [{ item, indices, meta, index }] }]),
 * the same results as a `flat` list in display order (`index` is the position
 * in it), and `count`, the number of real matches. A non-empty query always
 * ends with the "Ask about my work" item, in a group without a visible label.
 */
export function searchPalette(query, items) {
  const q = query.trim();
  let groups;

  if (!q) {
    groups = START_GROUPS.map((group) => ({
      ...group,
      results: items
        .filter((item) => item.group === group.id && item.suggested)
        .map((item) => ({ item, indices: [], meta: item.meta })),
    }));
  } else {
    groups = SEARCH_GROUPS.map((group) => {
      const results = [];
      items.forEach((item, order) => {
        if (item.group !== group.id) return;
        const match = scoreItem(q, item.title, item.keywords, item.aliases);
        if (!match) return;
        results.push({
          item,
          indices: match.indices,
          meta: metaFor(item, match.keyword),
          score: match.score,
          order,
        });
      });
      results.sort((a, b) => b.score - a.score || a.order - b.order);
      return { ...group, results, best: results[0]?.score ?? -Infinity };
    }).sort((a, b) => b.best - a.best);
  }

  const count = groups.reduce((sum, group) => sum + group.results.length, 0);
  if (q) {
    groups.push({
      id: 'ask',
      label: 'Ask about my work',
      hideLabel: true,
      results: [{ item: askItem(q), indices: [] }],
    });
  }

  const flat = [];
  groups = groups
    .filter((group) => group.results.length)
    .map((group) => ({
      ...group,
      results: group.results.map(({ item, indices, meta }) => {
        const entry = { item, indices, meta, index: flat.length };
        flat.push(entry);
        return entry;
      }),
    }));

  return { groups, flat, count };
}
