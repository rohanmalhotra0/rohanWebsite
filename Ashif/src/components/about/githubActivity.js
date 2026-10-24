import { profile } from '@/data/portfolioData';
import { MINUTE } from './clock';

export const GITHUB_LOGIN = profile.github.split('/').filter(Boolean).pop();

const ENDPOINT = `https://api.github.com/users/${GITHUB_LOGIN}/events/public?per_page=30`;
const CACHE_KEY = 'rm:github-activity';
const CACHE_TTL = 10 * MINUTE;
const MAX_OTHERS = 3;
const REPO_NAME = /^[\w.-]+\/[\w.-]+$/;

// Events that say nothing about work in the repo itself.
const IGNORED_EVENTS = new Set(['WatchEvent', 'ForkEvent', 'MemberEvent', 'SponsorshipEvent']);

/**
 * Reduce the public events feed to the latest push plus a few other recently
 * active repos: { repo, pushedAt, others: [repo] }, or null if there was no push.
 */
export function summarize(events) {
  if (!Array.isArray(events)) return null;

  const activity = events
    .map((event) => ({
      type: event?.type,
      repo: event?.repo?.name,
      time: Date.parse(event?.created_at),
    }))
    .filter(
      ({ type, repo, time }) =>
        typeof repo === 'string' &&
        REPO_NAME.test(repo) &&
        Number.isFinite(time) &&
        !IGNORED_EVENTS.has(type)
    )
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

const isSummary = (value) =>
  value === null ||
  (typeof value?.repo === 'string' &&
    REPO_NAME.test(value.repo) &&
    Number.isFinite(value.pushedAt) &&
    Array.isArray(value.others) &&
    value.others.every((repo) => typeof repo === 'string' && REPO_NAME.test(repo)));

/** Fresh cached summary, null if the last answer was "nothing to show", undefined on a miss. */
export function readCache() {
  try {
    const saved = sessionStorage.getItem(CACHE_KEY);
    if (!saved) return undefined;
    const { savedAt, value } = JSON.parse(saved);
    const age = Date.now() - savedAt;
    return age >= 0 && age < CACHE_TTL && isSummary(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function writeCache(value) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), value }));
  } catch {
    // Storage blocked or full: the next visit just asks again.
  }
}

async function request() {
  if (navigator.onLine === false) return null;
  try {
    const response = await fetch(ENDPOINT, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    // Remember failures too (403/429 mean rate limited) so reloads don't keep asking.
    const value = response.ok ? summarize(await response.json()) : null;
    writeCache(value);
    return value;
  } catch {
    // Offline or blocked: show nothing and try again on the next visit.
    return null;
  }
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
  const [unit, size] = UNITS.find(([, length]) => elapsed >= length);
  return relativeTime.format(-Math.floor(elapsed / size), unit);
}

export const repoUrl = (repo) => `https://github.com/${repo}`;

/** Drop the owner from repos on Rohan's own account. */
export const shortRepoName = (repo) =>
  repo.toLowerCase().startsWith(`${GITHUB_LOGIN.toLowerCase()}/`)
    ? repo.slice(GITHUB_LOGIN.length + 1)
    : repo;
