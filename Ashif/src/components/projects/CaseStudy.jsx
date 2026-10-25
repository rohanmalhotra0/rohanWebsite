import { ArrowLeft } from 'lucide-react';
import LiteYouTube from '@/components/primitives/LiteYouTube';
import Reveal from '@/components/primitives/Reveal';
import { PageHeader } from '@/components/primitives/Section';
import { TechList } from '@/components/primitives/Tag';
import { findProject } from './projectData';

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

/**
 * A project's own page (/projects/<slug>/): the video, the numbers, how it
 * worked step by step, and how it ended. Content is the project's `caseStudy`;
 * the header is its route's color block (see routes.js).
 */
export default function CaseStudy({ route }) {
  const project = findProject(route.project);
  const study = project.caseStudy;

  return (
    <>
      <div className="container-page pt-[4.5rem] sm:pt-20 lg:pt-[5.5rem]">
        <a
          href="/projects/"
          className="-ml-0.5 inline-flex min-h-11 items-center gap-1.5 text-sm text-muted transition-colors duration-150 hover:text-fg"
        >
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.75} />
          All projects
        </a>
      </div>

      <PageHeader
        route={route}
        title={project.title}
        description={[project.description, project.longDescription].filter(Boolean).join(' ')}
        className="pt-2 sm:pt-3 lg:pt-3"
      />

      <div className="container-page pb-20 sm:pb-28">
        <LiteYouTube {...study.video} className="mt-12 max-w-4xl sm:mt-16" />

        {/* Label before value in the DOM, number on top on screen (and packed to
            the top, so numbers line up when a label wraps). */}
        <dl className="mt-10 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
          {study.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse justify-end gap-1.5 bg-bg p-5 sm:p-6">
              <dt className="text-sm leading-5 text-subtle">{stat.label}</dt>
              <dd className="type-heading text-3xl text-fg sm:text-4xl">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-20 space-y-16 sm:mt-28 sm:space-y-20">
          <Part id="case-how" title="How it works">
            <ol className="border-t border-line">
              {study.steps.map((step, index) => (
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
          </Part>

          <Part id="case-safety" title="Safety">
            <p className="max-w-[38rem] text-pretty text-base leading-7 text-muted">{study.safety}</p>
          </Part>

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
    </>
  );
}
