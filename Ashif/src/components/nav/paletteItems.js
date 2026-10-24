// Everything the ⌘K palette can find, plus the search that ranks it.
// Items are plain data: `action` describes what Enter does and the palette
// component carries it out.

import {
  ArrowUpToLine,
  Briefcase,
  Copy,
  Download,
  FileText,
  FileUser,
  FlaskConical,
  FolderGit2,
  Github,
  GraduationCap,
  Hash,
  Layers,
  Linkedin,
  Mail,
  Send,
  Sparkles,
  SunMoon,
  UserRound,
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
export const GROUPS = [
  { id: 'navigate', label: 'Navigate' },
  { id: 'actions', label: 'Actions' },
  { id: 'projects', label: 'Projects' },
  { id: 'research', label: 'Research' },
];

const unique = (list) => [...new Set(list.filter(Boolean))];
const bareUrl = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

const SECTION_EXTRAS = {
  experience: {
    icon: Briefcase,
    keywords: ['work', 'jobs', 'internships', ...workExperience.map((job) => job.company)],
  },
  projects: { icon: Layers, keywords: ['portfolio', 'things built', 'code'] },
  research: { icon: FlaskConical, keywords: ['papers', 'publications'] },
  about: { icon: UserRound, keywords: ['bio', 'me', 'photos'] },
  education: {
    icon: GraduationCap,
    keywords: ['school', 'university', 'courses', education.school, education.college],
  },
  rohangpt: { icon: Sparkles, keywords: ['chat', 'ai', 'ask', 'assistant'] },
  contact: { icon: Send, keywords: ['email', 'message', 'get in touch', 'reach out'] },
};

const navigateItems = [
  {
    id: 'nav-top',
    group: 'navigate',
    title: 'Top',
    subtitle: 'Back to the start',
    keywords: ['home', 'hero', 'start', 'intro'],
    icon: ArrowUpToLine,
    action: { type: 'section', id: 'top' },
  },
  ...sections.map((section) => ({
    id: `nav-${section.id}`,
    group: 'navigate',
    title: section.label,
    meta: section.index,
    keywords: SECTION_EXTRAS[section.id]?.keywords ?? [],
    icon: SECTION_EXTRAS[section.id]?.icon ?? Hash,
    action: { type: 'section', id: section.id },
  })),
];

const projectItems = projects.map((project) => {
  const href = project.liveUrl || project.repoUrl;
  return {
    id: `project-${project.slug ?? project.title}`,
    group: 'projects',
    title: project.title,
    subtitle: project.category,
    meta: project.year,
    keywords: unique([project.category, ...(project.tags ?? [])]),
    icon: FolderGit2,
    external: Boolean(href),
    action: href ? { type: 'url', href } : { type: 'section', id: 'projects' },
  };
});

const researchItems = research
  .filter((paper) => paper.liveUrl)
  .map((paper, i) => ({
    id: `research-${i}`,
    group: 'research',
    title: paper.title,
    subtitle: paper.eyebrow,
    meta: 'PDF',
    keywords: unique([paper.eyebrow, 'paper', ...(paper.tags ?? [])]),
    icon: FileText,
    external: true,
    action: { type: 'url', href: paper.liveUrl },
  }));

const actionItems = [
  {
    id: 'action-copy-email',
    group: 'actions',
    title: 'Copy email',
    subtitle: profile.email,
    keywords: ['clipboard', 'mail', 'address', 'contact'],
    icon: Copy,
    action: { type: 'copy', text: profile.email },
  },
  {
    id: 'action-theme',
    group: 'actions',
    title: 'Toggle theme',
    // Filled in at render time from the current theme.
    subtitle: ({ theme }) => (theme === 'dark' ? 'Switch to light' : 'Switch to dark'),
    keywords: ['dark mode', 'light mode', 'appearance', 'color scheme'],
    icon: SunMoon,
    action: { type: 'theme' },
  },
  {
    id: 'action-resume',
    group: 'actions',
    title: 'View résumé',
    subtitle: 'On this site',
    keywords: ['cv', 'experience'],
    icon: FileUser,
    action: { type: 'hash', hash: '#/resume' },
  },
  {
    id: 'action-resume-pdf',
    group: 'actions',
    title: 'Download résumé PDF',
    keywords: ['cv', 'pdf', 'save'],
    icon: Download,
    action: { type: 'download', href: profile.resumeUrl },
  },
  {
    id: 'action-github',
    group: 'actions',
    title: 'Open GitHub',
    subtitle: bareUrl(profile.github),
    keywords: ['code', 'repos', 'source'],
    icon: Github,
    external: true,
    action: { type: 'url', href: profile.github },
  },
  {
    id: 'action-linkedin',
    group: 'actions',
    title: 'Open LinkedIn',
    subtitle: bareUrl(profile.linkedin),
    keywords: ['profile', 'connect', 'network'],
    icon: Linkedin,
    external: true,
    action: { type: 'url', href: profile.linkedin },
  },
  {
    id: 'action-email',
    group: 'actions',
    title: 'Email me',
    subtitle: 'Opens your mail app',
    keywords: ['mail', 'contact', 'message', 'send'],
    icon: Mail,
    action: { type: 'mailto', href: `mailto:${profile.email}` },
  },
];

export const PALETTE_ITEMS = [
  ...navigateItems,
  ...actionItems,
  ...projectItems,
  ...researchItems,
];

const askItem = (query) => ({
  id: 'ask-rohangpt',
  group: 'ask',
  title: `Ask RohanGPT: “${query}”`,
  icon: Sparkles,
  action: { type: 'ask', prompt: query },
});

/**
 * Filter and rank items for `query`.
 * Returns groups ([{ id, label, results: [{ item, indices, index }] }]) and a
 * flat list in display order; `index` is each result's position in that list.
 */
export function searchPalette(query, items = PALETTE_ITEMS) {
  const q = query.trim();
  let groups;

  if (!q) {
    groups = GROUPS.map((group) => ({
      ...group,
      results: items
        .filter((item) => item.group === group.id)
        .map((item) => ({ item, indices: [], score: 0 })),
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

    groups.push({
      id: 'ask',
      label: 'RohanGPT',
      results: [{ item: askItem(q), indices: [], score: 0 }],
    });
  }

  const flat = [];
  groups = groups
    .filter((group) => group.results.length)
    .map((group) => ({
      ...group,
      results: group.results.map((result) => {
        const entry = { ...result, index: flat.length };
        flat.push(entry);
        return entry;
      }),
    }));

  return { groups, flat };
}
