import { profile, projects, workExperience } from '@/data/portfolioData';

/** Printable link text: "https://www.github.com/x/" -> "github.com/x". */
export function displayUrl(url) {
  return String(url || '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

// Older roles carry labels such as "Earlier experience" in place of a date
// or a location. The date column on paper only holds real dates.
const dateOf = (job) => (/\d/.test(job.date || '') ? job.date : null);
const placeOf = (job) =>
  job.location && job.location !== job.date ? job.location : null;

/** One line per role: company, title and place on the left, dates on the right. */
export const resumeRoles = workExperience.map((job) => ({
  company: job.company,
  role: job.role,
  place: placeOf(job),
  date: dateOf(job),
  highlights: job.highlights,
}));

/**
 * Featured projects with one link each: the live site when there is one,
 * otherwise the repository. A bare GitHub profile link says nothing about
 * the project (the header already has it), so it is dropped.
 */
export const resumeProjects = projects
  .filter((project) => project.featured)
  .map((project) => ({
    ...project,
    link: [project.liveUrl, project.repoUrl].find(
      (url) => url && displayUrl(url) !== displayUrl(profile.github)
    ),
  }));

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
