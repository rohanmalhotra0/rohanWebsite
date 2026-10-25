// Everything the ⌘K palette can find, plus the search that ranks it.
// Items are plain data: `action` describes what Enter does, `verb` is the
// footer label for it, and the palette component carries it out.

import {
  ArrowUp,
  Copy,
  Download,
  FileText,
  FileUser,
  Folder,
  Github,
  Hash,
  Linkedin,
  Mail,
  MessageSquare,
  Moon,
  Sun,
} from 'lucide-react';
import {
  education,
  profile,
  projects,
  research,
  sections,
  workExperience,
} from '@/data/portfolioData';
import { scoreItem } from './fuzzy';

/** Group order when the query is empty. With a query, groups sort by best match. */
const GROUPS = [
  { id: 'goto', label: 'Go to' },
  { id: 'projects', label: 'Projects' },
  { id: 'research', label: 'Research' },
  { id: 'actions', label: 'Actions' },
];

const unique = (list) => [...new Set(list.filter(Boolean))];
const bareUrl = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

// Extra words people might type for each section.
const SECTION_KEYWORDS = {
  experience: ['work', 'jobs', 'internships', ...workExperience.map((job) => job.company)],
  projects: ['portfolio', 'code', 'apps'],
  research: ['papers', 'publications'],
  about: ['bio', 'me', 'photos'],
  education: ['school', 'university', 'courses', 'gpa', education.school, education.college],
  rohangpt: ['chat', 'ai', 'ask', 'assistant', 'RohanGPT'],
  contact: ['email', 'message', 'get in touch'],
};

const goToItems = [
  {
    id: 'goto-top',
    group: 'goto',
    title: 'Top',
    keywords: ['home', 'start', 'hero', 'intro'],
    icon: ArrowUp,
    verb: 'Go',
    action: { type: 'section', id: 'top' },
  },
  ...sections.map((section) => ({
    id: `goto-${section.id}`,
    group: 'goto',
    title: section.label,
    keywords: SECTION_KEYWORDS[section.id] ?? [],
    icon: Hash,
    verb: 'Go',
    action: { type: 'section', id: section.id },
  })),
];

const projectItems = projects.map((project) => {
  const href = project.liveUrl || project.repoUrl;
  return {
    id: `project-${project.slug ?? project.title}`,
    group: 'projects',
    title: project.title,
    meta: [project.category, project.year].filter(Boolean).join(' · '),
    keywords: unique([project.category, ...(project.tags ?? [])]),
    icon: Folder,
    external: Boolean(href),
    verb: project.liveUrl ? 'Open site' : project.repoUrl ? 'View source' : 'Go to projects',
    action: href ? { type: 'url', href } : { type: 'section', id: 'projects' },
  };
});

const researchItems = research
  .filter((paper) => paper.liveUrl)
  .map((paper) => ({
    id: `research-${paper.title}`,
    group: 'research',
    title: paper.title,
    meta: 'PDF',
    keywords: unique([paper.eyebrow, 'paper', 'pdf', ...(paper.tags ?? [])]),
    icon: FileText,
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
    keywords: ['theme', 'dark mode', 'light mode', 'appearance', 'color scheme'],
    icon: next === 'dark' ? Moon : Sun,
    verb: 'Switch',
    action: { type: 'theme' },
  };
};

const actionItems = (theme) => [
  {
    id: 'action-copy-email',
    group: 'actions',
    title: 'Copy email',
    keywords: ['clipboard', 'mail', 'address', 'contact'],
    icon: Copy,
    verb: 'Copy',
    action: { type: 'copy', text: profile.email },
  },
  themeItem(theme),
  {
    id: 'action-resume',
    group: 'actions',
    title: 'View résumé',
    keywords: ['cv', 'resume'],
    icon: FileUser,
    verb: 'Open',
    action: { type: 'hash', hash: '#/resume' },
  },
  {
    id: 'action-resume-pdf',
    group: 'actions',
    title: 'Download résumé PDF',
    keywords: ['cv', 'resume', 'pdf', 'save'],
    icon: Download,
    verb: 'Download',
    action: { type: 'download', href: profile.resumeUrl },
  },
  {
    id: 'action-github',
    group: 'actions',
    title: 'GitHub',
    meta: bareUrl(profile.github),
    keywords: ['code', 'repos', 'source'],
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
    keywords: ['profile', 'connect'],
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
    keywords: ['mail', 'contact', 'message', 'send'],
    icon: Mail,
    verb: 'Write',
    action: { type: 'mailto', href: `mailto:${profile.email}` },
  },
];

/** All palette items for the current theme (one title depends on it). */
export const getPaletteItems = (theme) => [
  ...goToItems,
  ...projectItems,
  ...researchItems,
  ...actionItems(theme),
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
 * Filter and rank `items` for `query`.
 * Returns `groups` ([{ id, label, results: [{ item, indices, index }] }]), the
 * same results as a `flat` list in display order (`index` is the position in
 * it), and `count`, the number of real matches. A non-empty query always ends
 * with the "Ask about my work" item, in a group without a visible label.
 */
export function searchPalette(query, items) {
  const q = query.trim();
  let groups;

  if (!q) {
    groups = GROUPS.map((group) => ({
      ...group,
      results: items
        .filter((item) => item.group === group.id)
        .map((item) => ({ item, indices: [] })),
    }));
  } else {
    groups = GROUPS.map((group) => {
      const results = [];
      items.forEach((item, order) => {
        if (item.group !== group.id) return;
        const match = scoreItem(q, item.title, item.keywords);
        if (match) results.push({ item, ...match, order });
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
      results: group.results.map((result) => {
        const entry = { item: result.item, indices: result.indices, index: flat.length };
        flat.push(entry);
        return entry;
      }),
    }));

  return { groups, flat, count };
}
