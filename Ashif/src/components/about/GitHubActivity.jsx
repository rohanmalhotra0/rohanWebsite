import { useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { profile } from '@/data/portfolioData';
import { useMinute } from './clock';
import { GITHUB_LOGIN, repoUrl, shortRepoName, timeAgo } from './githubActivity';
import useGitHubActivity from './useGitHubActivity';

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;
// Built on first use, when the activity shows, not while the router preloads
// this module on another page (see clock.js).
let lists = null;
let exact = null;
const listFormat = () => (lists ??= new Intl.ListFormat('en', { type: 'conjunction' }));
const exactTime = () => (exact ??= new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }));

/**
 * Latest public GitHub activity in a sentence. The box is sized by the caller
 * so nothing shifts: it stays empty while loading, and if the request fails
 * (rate limit, offline, no pushes) it falls back to a plain profile link.
 */
export default function GitHubActivity({ className }) {
  const ref = useRef(null);
  const { activity, fromCache, settled } = useGitHubActivity(ref);

  let content = null;
  if (activity) content = <Activity activity={activity} fadeIn={!fromCache} />;
  else if (settled) content = <ProfileLink fadeIn={!fromCache} />;

  return (
    <div ref={ref} className={className}>
      {content}
    </div>
  );
}

function FadeIn({ fadeIn, children }) {
  const reduceMotion = useReducedMotion();
  return (
    <MotionDiv
      initial={fadeIn && !reduceMotion ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="text-[15px] leading-6"
    >
      {children}
    </MotionDiv>
  );
}

function ProfileLink({ fadeIn }) {
  return (
    <FadeIn fadeIn={fadeIn}>
      <p className="text-[13px] leading-5 text-subtle">On GitHub</p>
      <p className="mt-1 text-pretty break-words text-muted">
        My public code is at{' '}
        <a href={profile.github} target="_blank" rel="noreferrer" className="link py-3 text-fg">
          github.com/{GITHUB_LOGIN}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        .
      </p>
    </FadeIn>
  );
}

function Activity({ activity, fadeIn }) {
  const now = useMinute();
  const { repo, pushedAt, others } = activity;

  // "a, b, and c" with each repo name as a link.
  let next = 0;
  const otherLinks = listFormat()
    .formatToParts(others.map(shortRepoName))
    .map((part, index) =>
      part.type === 'element' ? (
        <RepoLink key={index} repo={others[next++]}>
          {part.value}
        </RepoLink>
      ) : (
        part.value
      )
    );

  return (
    <FadeIn fadeIn={fadeIn}>
      <p className="text-[13px] leading-5 text-subtle">On GitHub</p>
      <p className="mt-1 text-pretty break-words text-muted">
        Last pushed to <RepoLink repo={repo}>{repo}</RepoLink>{' '}
        <time
          dateTime={new Date(pushedAt).toISOString()}
          title={exactTime().format(pushedAt)}
          className="whitespace-nowrap"
        >
          {timeAgo(pushedAt, now ?? Date.now())}
        </time>
        .{others.length ? <> Also active in {otherLinks}.</> : null}
      </p>
    </FadeIn>
  );
}

function RepoLink({ repo, children }) {
  return (
    // Vertical padding on an inline link grows the tap target without moving the text.
    <a href={repoUrl(repo)} target="_blank" rel="noreferrer" className="link py-3 text-fg">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
