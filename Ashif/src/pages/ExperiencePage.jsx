import Education from '@/components/education/Education';
import Experience from '@/components/experience/Experience';
import ExperienceTimeline from '@/components/experience/ExperienceTimeline';
import { Container, PageHeader } from '@/components/primitives/Section';
import { routeById } from '@/routes';

const route = routeById('experience');

export default function ExperiencePage() {
  return (
    <>
      <PageHeader route={route} />
      <Container className="pt-14 sm:pt-20">
        <section aria-labelledby="timeline-title" className="rounded-[1.5rem] border border-line bg-surface px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 id="timeline-title" className="type-heading text-2xl text-fg sm:text-[1.75rem]">
              Timeline
            </h2>
            <p className="text-sm text-muted">Every role and my degree, on one axis.</p>
          </div>
          <ExperienceTimeline className="mt-6 sm:mt-8" />
        </section>
      </Container>
      <Container className="pb-20 sm:pb-28">
        <h2 className="sr-only">Roles</h2>
        <Experience className="mt-14 sm:mt-20" />
      </Container>
      <Education />
    </>
  );
}
