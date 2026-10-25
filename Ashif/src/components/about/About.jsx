import { ArrowUpRight } from 'lucide-react';
import { photos, profile } from '@/data/portfolioData';
import { cn } from '@/lib/utils';
import { useNewYorkTime } from './clock';
import GitHubActivity from './GitHubActivity';
import { PORTRAIT_SIZES, srcSetFor } from './images';

const [portrait] = photos;

const bodyText = 'max-w-[62ch] text-pretty text-base leading-7 text-muted sm:text-[17px] sm:leading-[1.7]';

// Keep one-letter words ("I", "a") from dangling at the end of a line.
const tie = (text) => text.replace(/\b([aI]) /g, '$1\u00a0');

/**
 * The top of the About page: its title, a lede, the portrait, a few lines of
 * bio, and live details (New York time, latest GitHub push). Nothing here
 * animates in; it is the first screen of the page.
 */
export default function About() {
  return (
    <div className="container-page pt-28 sm:pt-36 lg:pt-40">
      {/* Phones: one column. md: lede across, then text beside the portrait.
          lg: a spread, the portrait running from the title down beside the text. */}
      <div className="grid gap-y-10 md:grid-cols-12 md:gap-x-6 lg:grid-rows-[auto_auto_1fr] lg:gap-x-8">
        <h1
          tabIndex={-1}
          data-page-focus=""
          className="type-display text-[clamp(2.75rem,8.5vw,6rem)] text-fg outline-none md:col-span-12 lg:col-span-7 lg:row-start-1"
        >
          About
        </h1>

        <p className="max-w-[28em] text-pretty text-[1.375rem] font-[450] leading-[1.42] tracking-[-0.012em] text-fg sm:text-2xl md:col-span-11 md:row-start-2 lg:col-span-6 xl:text-[1.75rem] xl:leading-[1.38]">
          {tie(
            'I learn by building. If I get curious about prediction markets, I make a hedging model. If I want to understand computer vision, I train a robot to find a toy. This site is basically the trail of whatever I was trying to figure out next.'
          )}
        </p>

        <div className="flex flex-col md:col-span-5 md:col-start-8 md:row-start-3 lg:row-span-3 lg:row-start-1">
          {/* At least 2:3 on desktop; grows taller (cropping the sides) if the text
              column ever outgrows it, so the bottom lines still meet. */}
          <div className="relative aspect-[4/5] rounded-lg bg-surface-2 lg:aspect-[2/3] lg:grow">
            <img
              src={portrait.src}
              srcSet={srcSetFor(portrait)}
              sizes={PORTRAIT_SIZES}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              decoding="async"
              fetchPriority="high"
              className="absolute inset-0 size-full rounded-lg object-cover object-[50%_20%] outline -outline-offset-1 outline-fg/10"
            />
          </div>
          <MetaLine className="mt-4" />
        </div>

        <div className="flex flex-col md:col-span-7 md:col-start-1 md:row-start-3 lg:col-span-6">
          <p className={bodyText}>
            {tie(
              'I’m studying Computer Science and Mathematics at NYU Courant and finishing the degree in three years. Most of my work sits somewhere between finance, robotics, and software that people can actually use.'
            )}
          </p>
          <p className={cn(bodyText, 'mt-4')}>
            {tie(
              'Right now I’m finishing my last year at NYU and trying not to turn every random idea into another side project.'
            )}
          </p>
          {/* A fixed slot (label + three lines), the same size whether the fetch
              succeeds, fails or never runs, so nothing around it ever moves. Desktop:
              pinned to the bottom of the column, level with the line under the portrait;
              a longer sentence grows upward into the free space instead of down. */}
          <GitHubActivity className="box-content h-24 pt-8 max-[359px]:h-30 sm:pt-10 lg:mt-auto lg:flex lg:flex-col lg:justify-end" />
        </div>
      </div>
    </div>
  );
}

function MetaLine({ className }) {
  const time = useNewYorkTime();

  return (
    <div
      className={cn(
        'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-[15px] leading-6',
        className
      )}
    >
      <p className="text-muted">
        {profile.location}
        {time ? (
          <>
            {' '}· It’s{' '}
            <time dateTime={time.iso} className="tabular-nums">
              {time.label}
            </time>{' '}
            here
          </>
        ) : null}
      </p>
      <p className="flex gap-x-5">
        <ExternalLink href={profile.linkedin}>LinkedIn</ExternalLink>
        <ExternalLink href={profile.github}>GitHub</ExternalLink>
      </p>
    </div>
  );
}

function ExternalLink({ href, children }) {
  return (
    // Padding cancelled by negative margin: a 44px tap target on a 24px line.
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="link -my-2.5 inline-flex items-center gap-1 py-2.5 font-medium text-fg"
    >
      {children}
      <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-subtle" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
