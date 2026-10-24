import { ArrowRight, FastForward } from 'lucide-react';
import Reveal from '@/components/primitives/Reveal';
import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import { Tag } from '@/components/primitives/Tag';
import { education, skillGroups } from '@/data/portfolioData';
import DegreeProgress from './DegreeProgress';

const META = 'font-mono text-[11px] uppercase tracking-[0.2em] text-subtle';

export default function Education() {
  return (
    <Section id="education">
      <Container>
        <SectionHeader
          index="05"
          label="Education"
          title={
            <>
              Education &amp; <em>toolkit</em>
            </>
          }
          description="I’m finishing a CS degree at NYU Courant in three years. Here’s what I’ve studied and the tools I use most."
        />

        <div className="mt-12 grid gap-4 sm:mt-16 lg:grid-cols-12 lg:gap-5">
          <Reveal className="lg:col-span-7">
            <SchoolCard />
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5">
            <Toolkit />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function SchoolCard() {
  const {
    school,
    college,
    degree,
    minor,
    gpa,
    gpaScale,
    start,
    end,
    dates,
    location,
    logoUrl,
    accelerated,
    graduateCourse,
    coursework,
  } = education;

  return (
    <article
      aria-labelledby="education-school"
      className="card relative h-full overflow-hidden p-5 sm:p-8"
    >
      {/* Faint grid in the top-right corner for depth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid opacity-70 [mask-image:radial-gradient(ellipse_45%_40%_at_100%_0%,black,transparent)]"
      />

      <div className="relative">
        <header className="flex items-start gap-4">
          <div className="size-12 shrink-0 overflow-hidden rounded-xl ring-1 ring-line sm:size-14">
            <img
              src={logoUrl}
              alt=""
              width="56"
              height="56"
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              id="education-school"
              className="text-lg font-semibold tracking-[-0.02em] text-fg sm:text-xl"
            >
              {school}
            </h3>
            <p className="mt-0.5 text-sm leading-6 text-muted">{college}</p>
          </div>
          <dl className="hidden shrink-0 space-y-1.5 text-right font-mono text-[11px] uppercase tracking-[0.16em] text-subtle sm:block">
            <div>
              <dt className="sr-only">Dates</dt>
              <dd>{dates}</dd>
            </div>
            <div>
              <dt className="sr-only">Location</dt>
              <dd>{location}</dd>
            </div>
          </dl>
        </header>

        {/* Mobile: dates and location drop under the header. */}
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle sm:hidden">
          <span>{dates}</span>
          <span>{location}</span>
        </p>

        <dl className="mt-6 flex items-start justify-between gap-6 border-t border-line pt-6 sm:mt-8">
          <div className="min-w-0">
            <dt className={META}>Degree</dt>
            <dd className="mt-2.5 text-2xl font-semibold leading-tight tracking-[-0.03em] text-fg sm:text-[1.75rem]">
              {degree}
            </dd>
            <dd className="mt-1 text-[15px] text-muted">{minor}</dd>
          </div>
          <div className="shrink-0 text-right">
            <dt className={META}>GPA</dt>
            <dd className="mt-2 flex items-baseline justify-end gap-1.5 tabular-nums">
              <span className="text-5xl font-semibold leading-none tracking-[-0.05em] text-fg sm:text-6xl">
                {gpa}
              </span>
              <span className="font-mono text-sm text-subtle">
                <span className="sr-only">out of</span>
                <span aria-hidden="true">/</span> {gpaScale}
              </span>
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-line pt-6">
          <DegreeProgress start={start} end={end} />
          {accelerated ? (
            <p className="mt-5 flex gap-3 rounded-xl border border-line bg-fg/[0.025] px-4 py-3 text-sm leading-6 text-muted">
              <FastForward aria-hidden="true" className="mt-1 size-4 shrink-0 text-fg" />
              <span>
                <span className="font-medium text-fg">Accelerated path.</span> {accelerated}
              </span>
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-6 border-t border-line pt-6">
          {graduateCourse ? (
            <div>
              <h4 className={META}>Graduate course</h4>
              <p className="mt-2.5 font-medium text-fg">{graduateCourse.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{graduateCourse.description}</p>
            </div>
          ) : null}

          {coursework?.length ? (
            <div>
              <h4 className={META}>
                Coursework <span className="text-line-strong">/</span>{' '}
                <span className="tabular-nums">{coursework.length}</span>
              </h4>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {coursework.map((course) => (
                  <li key={course}>
                    <Tag className="py-1.5">{course}</Tag>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Toolkit() {
  const total = skillGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <section
      aria-labelledby="education-toolkit"
      className="card flex h-full flex-col p-5 sm:p-8"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3
          id="education-toolkit"
          className="text-lg font-semibold tracking-[-0.02em] text-fg sm:text-xl"
        >
          Toolkit
        </h3>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
          <span className="tabular-nums">{total}</span> tools
        </p>
      </div>

      <div className="mt-6 flex flex-1 flex-col divide-y divide-line border-t border-line">
        {skillGroups.map((group, index) => (
          <div key={group.label} className="group/skills flex-1 py-5 sm:py-6">
            <h4 className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle transition-colors duration-200 group-hover/skills:text-muted">
              <span className="tabular-nums text-fg/35">{String(index + 1).padStart(2, '0')}</span>
              {group.label}
            </h4>
            <ul className="mt-3.5 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <li key={item}>
                  <span className="inline-flex items-center rounded-full border border-line px-3 py-1.5 text-[13px] leading-none text-fg/80 transition-colors duration-200 hover:border-line-strong hover:bg-fg/5 hover:text-fg">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <a
        href="#/resume"
        className="group/resume mt-2 inline-flex min-h-11 items-center justify-between gap-3 border-t border-line pt-5 text-sm text-muted transition-colors hover:text-fg sm:pt-6"
      >
        <span>Everything on one page</span>
        <span className="inline-flex items-center gap-1.5 font-medium text-fg">
          View résumé
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover/resume:translate-x-0.5"
          />
        </span>
      </a>
    </section>
  );
}
