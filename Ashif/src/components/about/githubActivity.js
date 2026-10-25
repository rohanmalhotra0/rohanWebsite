import { profile, projects } from '@/data/portfolioData';
import { MINUTE } from './clock';

export const GITHUB_LOGIN = profile.github.split('/').filter(Boolean).pop();

const ENDPOINT = `https://api.github.com/users/${GITHUB_LOGIN}/events/public?per_page=30`;
const CACHE_KEY = 'rm:github-activity';
const CACHE_TTL = 10 * MINUTE;
const MAX_OTHERS = 2;

/** "owner/name" from a github.com repo URL; null for anything else, including a bare profile URL. */
export function repoFromUrl(url) {
  try {
    const { hostname, pathname } = new URL(url);
    const [owner, name] = pathname.split('/').filter(Boolean);
    if (hostname.replace(/^www\./, '') !== 'github.com' || !owner || !name) return null;
    return `${owner}/${name.replace(/\.git$/, '')}`;
  } catch {
    return null;
  }
}

// Only repos the site itself links to (a project's repoUrl) are ever named, so
// coursework, practice and scratch repos never show up. Case-insensitive, like GitHub.
const LINKED_REPOS = new Set(
  projects.map(({ repoUrl }) => repoFromUrl(repoUrl)?.toLowerCase()).filter(Boolean)
);
const isLinked = (repo) => typeof repo === 'string' && LINKED_REPOS.has(repo.toLowerCase());

// Events that say nothing about work in the repo itself.
const IGNORED_EVENTS = new Set(['WatchEvent', 'ForkEvent', 'MemberEvent', 'SponsorshipEvent']);

/**
 * Reduce the public events feed to the latest push to a linked repo plus a few
 * other recently active linked repos: { repo, pushedAt, others: [repo] }, or
 * null if no linked repo was pushed to.
 */
export function summarize(events) {
  if (!Array.isArray(events)) return null;

  const activity = events
    .map((event) => ({
      type: event?.type,
      repo: event?.repo?.name,
      time: Date.parse(event?.created_at),
    }))
    .filter(({ type, repo, time }) => isLinked(repo) && Number.isFinite(time) && !IGNORED_EVENTS.has(type))
    // The feed is only roughly chronological.
    .sort((a, b) => b.time - a.time);

  const push = activity.find(({ type }) => type === 'PushEvent');
  if (!push) return null;

  const others = [];
  for (const { repo } of activity) {
    if (others.length === MAX_OTHERS) break;
    if (repo !== push.repo && !others.includes(repo)) others.push(repo);
  }
  return { repo: push.repo, pushedAt: push.time, others };
}

// Also re-checks cached summaries against the linked repos.
const isSummary = (value) =>
  value === null ||
  (isLinked(value?.repo) &&
    Number.isFinite(value.pushedAt) &&
    Array.isArray(value.others) &&
    value.others.every(isLinked));

// Same record kept in memory, for when sessionStorage is blocked.
let remembered = null;

/** Fresh cached summary, null if the last answer was "nothing to show", undefined on a miss. */
export function readCache() {
  let saved = remembered;
  try {
    const stored = sessionStorage.getItem(CACHE_KEY);
    if (stored) saved = JSON.parse(stored);
  } catch {
    // Storage blocked or unreadable: fall back to memory.
  }
  const age = Date.now() - saved?.savedAt;
  return age >= 0 && age < CACHE_TTL && isSummary(saved.value) ? saved.value : undefined;
}

function writeCache(value) {
  remembered = { savedAt: Date.now(), value };
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(remembered));
  } catch {
    // Storage blocked or full: memory still covers this page load.
  }
}

async function request() {
  if (navigator.onLine === false) return null;
  let value = null;
  try {
    const response = await fetch(ENDPOINT, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (response.ok) value = summarize(await response.json());
  } catch {
    // Network error, blocked request or bad JSON: nothing to show.
  }
  // Every outcome is remembered for the session's 10 minutes, failures included
  // (a 403 means rate limited), so reloads never ask again.
  writeCache(value);
  return value;
}

let pending = null;

/** The activity summary, from the session cache or one shared request. */
export function loadActivity() {
  const cached = readCache();
  if (cached !== undefined) return Promise.resolve(cached);
  pending ??= request().finally(() => {
    pending = null;
  });
  return pending;
}

const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS = [
  ['year', 365 * 24 * 60 * MINUTE],
  ['month', 30 * 24 * 60 * MINUTE],
  ['week', 7 * 24 * 60 * MINUTE],
  ['day', 24 * 60 * MINUTE],
  ['hour', 60 * MINUTE],
  ['minute', MINUTE],
];

/** "3 hours ago", "yesterday", "last week". Never less than a minute or in the future. */
export function timeAgo(time, now) {
  const elapsed = Math.max(now - time, MINUTE);
  const index = UNITS.findIndex(([, size]) => elapsed >= size);
  const [unit, size] = UNITS[index];
  const value = Math.round(elapsed / size);
  // Rounding up into the next unit: 23.6 hours reads as "yesterday", not "24 hours ago".
  if (index > 0 && value * size >= UNITS[index - 1][1]) {
    return relativeTime.format(-1, UNITS[index - 1][0]);
  }
  return relativeTime.format(-value, unit);
}

export const repoUrl = (repo) => `https://github.com/${repo}`;

/** Drop the owner from repos on Rohan's own account. */
export const shortRepoName = (repo) =>
  repo.toLowerCase().startsWith(`${GITHUB_LOGIN.toLowerCase()}/`)
    ? repo.slice(GITHUB_LOGIN.length + 1)
    : repo;
