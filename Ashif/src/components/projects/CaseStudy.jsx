import { ArrowLeft } from 'lucide-react';
import LiteYouTube from '@/components/primitives/LiteYouTube';
import Reveal from '@/components/primitives/Reveal';
import { TechList } from '@/components/primitives/Tag';
import SpotPoster from './spot/SpotPoster';
import SpotStory from './spot/SpotStory';
import StatTiles from './StatTiles';
import { findProject } from './projectData';

// Projects whose "How it works" is told as an illustrated, scroll-driven
// story, with a poster for the video drawn to match.
const STORIES = { 'spot-vision': { Story: SpotStory, Poster: SpotPoster } };

/** A titled block: the heading in the left third from md up, the content beside it. */
function Part({ id, title, children }) {
  return (
    <Reveal as="section" aria-labelledby={id} className="grid gap-4 md:grid-cols-12 md:gap-8">
      <h2 id={id} className="type-heading text-2xl text-fg sm:text-3xl md:col-span-4">
        {title}
      </h2>
      <div className="md:col-span-8">{children}</div>
    </Reveal>
  );
}

/** The steps as a numbered list, for a project without its own story. */
function Steps({ steps }) {
  return (
    <ol className="border-t border-line">
      {steps.map((step, index) => (
        <li key={step.title} className="grid grid-cols-[2.75rem_minmax(0,1fr)] border-b border-line py-5">
          <span aria-hidden="true" className="pt-1 font-mono text-[13px] text-subtle">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <h3 className="type-heading text-lg text-fg sm:text-xl">{step.title}</h3>
            <p className="mt-1.5 max-w-[38rem] text-pretty text-[15px] leading-6 text-muted">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * A project's own page (/projects/<slug>/): the video, the numbers, how it
 * worked step by step, and how it ended. Content is the project's `caseStudy`.
 */
export default function CaseStudy({ slug }) {
  const project = findProject(slug);
  const study = project.caseStudy;
  const { Story, Poster } = STORIES[slug] ?? {};

  return (
    <div className="container-page pb-20 pt-24 sm:pb-28 sm:pt-32 lg:pt-36">
      <a
        href="/projects/"
        className="-ml-0.5 inline-flex min-h-11 items-center gap-1.5 text-sm text-muted transition-colors duration-150 hover:text-fg"
      >
        <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.75} />
        All projects
      </a>

      <header className="mt-6 max-w-3xl">
        <p className="text-sm text-subtle">{study.context}</p>
        <h1
          tabIndex={-1}
          data-page-focus=""
          className="type-display mt-3 text-balance text-[clamp(2.75rem,8.5vw,6rem)] text-fg outline-none"
        >
          {project.title}
        </h1>
        <p className="mt-6 text-pretty text-lg leading-8 text-muted">
          {project.description} {project.longDescription}
        </p>
      </header>

      <LiteYouTube {...study.video} poster={Poster ? <Poster /> : null} className="mt-12 max-w-4xl sm:mt-16" />

      <StatTiles stats={study.stats} className="mt-4 sm:mt-6" />

      <div className="mt-20 sm:mt-28">
        {Story ? (
          <Story steps={study.steps} safety={study.safety} />
        ) : (
          <Part id="case-how" title="How it works">
            <Steps steps={study.steps} />
          </Part>
        )}
      </div>

      <div className="mt-16 space-y-16 sm:mt-24 sm:space-y-20">
        {Story ? null : (
          <Part id="case-safety" title="Safety">
            <p className="max-w-[38rem] text-pretty text-base leading-7 text-muted">{study.safety}</p>
          </Part>
        )}

        <Part id="case-outcome" title="How it ended">
          <p className="max-w-[38rem] text-pretty text-base leading-7 text-muted">{study.outcome}</p>
        </Part>

        <Part id="case-stack" title="Built with">
          <TechList items={study.stack} />
        </Part>
      </div>

      <p className="mt-20 max-w-[38rem] text-pretty text-[15px] leading-6 text-muted sm:mt-28">
        The robot on the{' '}
        <a href="/" className="link font-medium text-fg">
          home page
        </a>{' '}
        plays the same game: drag its toy and it fetches it, then dances.
      </p>
    </div>
  );
}
