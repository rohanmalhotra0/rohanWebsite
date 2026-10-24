import { useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useMinute } from './clock';
import { repoUrl, shortRepoName, timeAgo } from './githubActivity';
import useGitHubActivity from './useGitHubActivity';

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;
const listFormat = new Intl.ListFormat('en', { type: 'conjunction' });
const exactTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

/**
 * Latest public GitHub activity in a sentence. Renders an empty box until there
 * is something to say, and stays empty on errors, rate limits, or no pushes.
 */
export default function GitHubActivity({ className }) {
  const ref = useRef(null);
  const { activity, fromCache } = useGitHubActivity(ref);

  return (
    <div ref={ref} className={className}>
      {activity ? <Activity activity={activity} fadeIn={!fromCache} /> : null}
    </div>
  );
}

function Activity({ activity, fadeIn }) {
  const now = useMinute();
  const reduceMotion = useReducedMotion();
  const { repo, pushedAt, others } = activity;

  // "a, b, and c" with each repo name as a link.
  let next = 0;
  const otherLinks = listFormat
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
    <MotionDiv
      initial={fadeIn && !reduceMotion ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="pt-10 text-[15px] leading-6"
    >
      <p className="text-[13px] leading-5 text-subtle">On GitHub</p>
      <p className="mt-1 text-pretty break-words text-muted">
        Last pushed to <RepoLink repo={repo}>{repo}</RepoLink>{' '}
        <time dateTime={new Date(pushedAt).toISOString()} title={exactTime.format(pushedAt)}>
          {timeAgo(pushedAt, now)}
        </time>
        .{others.length ? <> Also active in {otherLinks}.</> : null}
      </p>
    </MotionDiv>
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
