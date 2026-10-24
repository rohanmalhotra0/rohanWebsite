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

/**
 * Consecutive roles at one company share a heading (IBM had two). A role
 * only repeats the location when it differs from the company's.
 */
export const experienceGroups = workExperience.reduce((groups, job) => {
  const last = groups[groups.length - 1];
  const place = placeOf(job);
  const role = { role: job.role, date: dateOf(job), highlights: job.highlights };

  if (last && last.company === job.company) {
    last.roles.push({ ...role, place: place === last.place ? null : place });
  } else {
    groups.push({ company: job.company, place, roles: [{ ...role, place: null }] });
  }
  return groups;
}, []);

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

export const contactLinks = [
  { href: `mailto:${profile.email}`, label: profile.email },
  { href: profile.website, label: displayUrl(profile.website) },
  { href: profile.github, label: displayUrl(profile.github) },
  { href: profile.linkedin, label: displayUrl(profile.linkedin) },
];
