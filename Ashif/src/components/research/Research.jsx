import { useId } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Reveal from '@/components/primitives/Reveal';
import { research } from '@/data/portfolioData';
import { cn } from '@/lib/utils';
import { dropSrcSetOnError, THUMBNAIL_SIZES, thumbnailSrcSet } from './thumbnail';

/** Every paper, newest first. */
export default function Research({ className }) {
  return (
    <ul className={cn('border-t border-line', className)}>
      {research.map((paper, index) => (
        <Paper key={paper.title} paper={paper} index={index} />
      ))}
    </ul>
  );
}

function Paper({ paper, index }) {
  const titleId = useId();

  return (
    <Reveal as="li" delay={index * 0.05} className="border-b border-line last:border-b-0">
      <article
        aria-labelledby={titleId}
        className="grid gap-6 py-10 sm:py-12 md:grid-cols-12 md:gap-8"
      >
        <div className="md:col-span-7">
          <h2
            id={titleId}
            className="type-heading text-balance text-[1.625rem] leading-[1.15] text-fg"
          >
            {paper.title}
            {paper.subtitle ? (
              <span className="mt-1.5 block font-sans text-base font-normal leading-6 tracking-normal text-muted [font-stretch:100%]">
                {paper.subtitle}
              </span>
            ) : null}
          </h2>
          <p className="mt-3 text-sm leading-6 text-subtle">
            {[paper.authors, paper.year, paper.venue].filter(Boolean).join(' · ')}
          </p>
          <p className="mt-4 max-w-[62ch] text-pretty text-[15px] leading-7 text-muted sm:text-base">
            {paper.description}
          </p>
          {paper.liveUrl || paper.externalUrl ? (
            // 44px tap targets; the negative margin keeps the visual rhythm.
            <div className="-mb-3 mt-3 flex flex-wrap gap-x-6">
              {paper.liveUrl ? (
                <PaperLink href={paper.liveUrl} title={paper.title}>
                  Read paper (PDF)
                </PaperLink>
              ) : null}
              {paper.externalUrl ? (
                <PaperLink href={paper.externalUrl} title={paper.title}>
                  VTechWorks
                </PaperLink>
              ) : null}
            </div>
          ) : null}
        </div>

        {paper.imageUrl ? (
          <div className="order-first md:order-none md:col-span-5 md:mt-1.5 lg:col-span-4 lg:col-start-9">
            <Thumbnail paper={paper} />
          </div>
        ) : null}
      </article>
    </Reveal>
  );
}

/** The title goes into the accessible name so a list of links still says which paper. */
function PaperLink({ href, title, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="link inline-flex min-h-11 items-center gap-1 text-[15px] font-medium text-fg"
    >
      {children}
      <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-subtle" />
      <span className="sr-only">
        : {title} (opens in a new tab)
      </span>
    </a>
  );
}

const FRAME = 'block overflow-hidden rounded-lg border border-line bg-surface';
// Both ratios are narrower than the wider page scans, so cover trims their side
// margins (one has a capture border on its right edge). White paper is dimmed
// a touch in dark mode so it doesn't glare.
const PAGE =
  'aspect-[16/10] w-full object-cover object-top md:aspect-[3/2] dark:brightness-[0.85]';

/** The first page of the paper. A mouse shortcut to the PDF; the text link is the accessible one. */
function Thumbnail({ paper }) {
  const srcSet = thumbnailSrcSet(paper.imageUrl);
  const imageProps = {
    src: paper.imageUrl,
    ...(srcSet ? { srcSet, sizes: THUMBNAIL_SIZES, onError: dropSrcSetOnError } : null),
    alt: paper.imageAlt ?? '',
    width: 600,
    height: 400,
    loading: 'lazy',
    decoding: 'async',
  };

  if (!paper.liveUrl) {
    return (
      <div className={FRAME}>
        <img {...imageProps} className={PAGE} />
      </div>
    );
  }

  return (
    <a
      href={paper.liveUrl}
      target="_blank"
      rel="noreferrer"
      tabIndex={-1}
      aria-hidden="true"
      className={`group/thumb ${FRAME} transition-colors duration-200 hover:border-line-strong`}
    >
      <img
        {...imageProps}
        className={`${PAGE} transition-[filter] duration-200 dark:group-hover/thumb:brightness-100`}
      />
    </a>
  );
}
