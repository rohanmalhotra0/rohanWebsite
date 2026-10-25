import { profile, projects, research, workExperience } from '@/data/portfolioData';

/*
 * The résumé is one US Letter page, and the PDF behind "Download PDF" is
 * printed from it (scripts/resume-pdf.mjs). What goes on that page is chosen
 * here, from the site's own data, so the screen and the PDF can't drift.
 */

/** Printable link text: "https://www.github.com/x/" -> "github.com/x". */
export function displayUrl(url) {
  return String(url || '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

/** Roles on the page (company|title) and which highlights to keep, by index. */
const ROLE_BULLETS = {
  'IBM|Applications Developer Intern': [2, 3, 0],
  'IBM|Robotics Engineer Intern': [0, 1, 2],
  'Kalshi|Quantitative Developer': [0, 2, 3],
  'Aress Software|Machine Learning Intern': [0, 1],
  'Virginia Tech Hume Center|Aerospace Researcher': [1, 0],
};

/** Selected roles in the data's (reverse-chronological) order. */
export const resumeRoles = workExperience
  .filter((job) => ROLE_BULLETS[`${job.company}|${job.role}`])
  .map((job) => ({
    company: job.company,
    role: job.role,
    place: job.location,
    date: job.date,
    highlights: ROLE_BULLETS[`${job.company}|${job.role}`]
      .map((index) => job.highlights?.[index])
      .filter(Boolean),
  }));

/** Projects on the page, in order. Spot Vision is left off: it restates the IBM robotics role. */
const PROJECT_SLUGS = ['epm-wizard', 'casen', 'nightshift', 'refrax'];

/** One résumé-voice line per project, rewritten from the site copy without adding facts. */
const RESUME_LINES = {
  'epm-wizard':
    'Built a tool that generates Oracle EPM forms and rules from plain English, with preview and approval before deployment.',
  casen:
    'Built a case-interview prep platform that keeps cases, drills, voice practice, and job tracking in one place.',
  nightshift:
    'Automated the repetitive parts of applying to jobs: finding roles, filling forms, checking confirmation emails, and keeping an application log.',
  refrax:
    'Built one workspace to pull live market data, run models, and inspect the results in 2D and 3D.',
};

/**
 * Each project gets one link: the live site when there is one, otherwise the
 * repository. A bare GitHub profile link says nothing about the project (the
 * header already has it), so it is dropped.
 */
export const resumeProjects = PROJECT_SLUGS.map((slug) =>
  projects.find((project) => project.slug === slug)
)
  .filter(Boolean)
  .map((project) => ({
    slug: project.slug,
    title: project.title,
    year: project.year,
    tags: project.tags ?? [],
    line: RESUME_LINES[project.slug] ?? project.description,
    link: [project.liveUrl, project.repoUrl].find(
      (url) => url && displayUrl(url) !== displayUrl(profile.github)
    ),
  }));

/**
 * Published papers as citations: title and year, then authors, venue and
 * record link. The unpublished Kalshi paper is covered by that role's bullet.
 */
export const resumePapers = research
  .filter((paper) => paper.venue)
  .map((paper) => ({
  title: paper.title,
  year: paper.year,
  href: paper.liveUrl,
  authors: paper.authors ? paper.authors.split(/,\s*/) : [],
  venue: paper.venue,
  record: paper.externalUrl,
}));

/** The site's education line is first person; on paper it's a phrase. */
export const educationNote = 'Accelerated three-year degree.';

/** Contact details in two lines; they sit beside the name and the headline. */
export const contactLines = [
  [
    { label: profile.location },
    { href: `mailto:${profile.email}`, label: profile.email },
    { href: profile.website, label: displayUrl(profile.website) },
  ],
  [
    { href: profile.github, label: displayUrl(profile.github) },
    { href: profile.linkedin, label: displayUrl(profile.linkedin) },
  ],
];
