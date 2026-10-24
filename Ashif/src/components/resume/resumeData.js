import { projects, workExperience } from '@/data/portfolioData';

/** Printable link text: "https://www.github.com/x/" -> "github.com/x". */
export function displayUrl(url) {
  return String(url || '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

// Some older roles reuse the date label ("Earlier experience") as the
// location; only show a location when it is an actual place.
const placeOf = (job) =>
  job.location && job.location !== job.date ? job.location : null;

/** Consecutive roles at the same company share one heading (IBM had two). */
export const experienceGroups = workExperience.reduce((groups, job) => {
  const last = groups[groups.length - 1];
  if (last && last.company === job.company) {
    last.roles.push(job);
  } else {
    groups.push({ company: job.company, place: placeOf(job), roles: [job] });
  }
  return groups;
}, []);

export const resumeProjects = projects.filter((project) => project.featured);
