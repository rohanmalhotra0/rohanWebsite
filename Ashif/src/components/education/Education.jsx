import Reveal from '@/components/primitives/Reveal';
import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import { education, skillGroups } from '@/data/portfolioData';
import { cn } from '@/lib/utils';

// Labels and list items share one line height so baselines line up across columns.
const LABEL = 'text-[15px] leading-7 text-subtle';
const LIST = 'text-[15px] leading-7 text-fg';

export default function Education() {
  const {
    school,
    college,
    degree,
    minor,
    gpa,
    gpaScale,
    dates,
    location,
    logoUrl,
    accelerated,
    graduateCourse,
    coursework,
  } = education;

  return (
    <Section id="education">
      <Container>
        <SectionHeader title="Education" />

        <div className="mt-12 border-t border-line sm:mt-16">
          <Row
            label={
              <div className="flex items-center gap-4 lg:flex-col lg:items-start">
                {/* Same paper tile as the Experience logos; NYU's mark is full-bleed, so it fills it. */}
                <span className="relative isolate block size-10 shrink-0 overflow-hidden rounded-md bg-surface dark:bg-fg">
                  <img
                    src={logoUrl}
                    alt=""
                    width="100"
                    height="100"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="size-full object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-fg/10 ring-inset"
                  />
                </span>
                <div>
                  <h3 className="text-[15px] font-medium leading-6 text-fg">{school}</h3>
                  <p className="text-balance text-[15px] leading-6 text-muted">{college}</p>
                </div>
              </div>
            }
          >
            <p className="type-heading text-[1.75rem] leading-[1.1] text-fg sm:text-[2.25rem]">
              {degree}
            </p>
            <p className="type-heading text-[1.75rem] leading-[1.1] text-muted sm:text-[2.25rem]">
              {minor}
            </p>
            <MetaLine
              className="mt-5"
              items={[
                dates,
                location,
                gpa ? `GPA ${gpa}${gpaScale ? ` / ${gpaScale}` : ''}` : null,
              ].filter(Boolean)}
            />
          </Row>

          {accelerated ? (
            <Row delay={0.05} label={<h4 className={LABEL}>Accelerated path</h4>}>
              <p className="max-w-xl text-pretty text-base leading-7 text-fg">{accelerated}</p>
            </Row>
          ) : null}

          {graduateCourse ? (
            <Row delay={0.1} label={<h4 className={LABEL}>Graduate course</h4>}>
              <p className="text-base font-medium leading-7 text-fg">{graduateCourse.title}</p>
              <p className="mt-1 max-w-xl text-pretty text-[15px] leading-6 text-muted">
                {graduateCourse.description}
              </p>
            </Row>
          ) : null}

          {coursework?.length ? (
            <Row delay={0.15} label={<h4 className={LABEL}>Coursework</h4>}>
              {/* Two columns from sm up: they fall on the page grid and split CS from math. */}
              <ul className={`gap-x-8 sm:columns-2 ${LIST}`}>
                {coursework.map((course) => (
                  <li key={course} className="break-inside-avoid">
                    {course}
                  </li>
                ))}
              </ul>
            </Row>
          ) : null}

          {skillGroups?.length ? (
            <Row delay={0.2} label={<h3 className={LABEL}>Tools</h3>}>
              <div className="grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4">
                {skillGroups.map((group) => (
                  <div key={group.label}>
                    <h4 className={LABEL}>{group.label}</h4>
                    <ul className={`mt-2 ${LIST}`}>
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Row>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

/**
 * One line of the sheet: label on the left (4 of 12 columns), content on the
 * right (8 of 12), so every sub-column below lands on the page grid.
 */
function Row({ label, delay = 0, children }) {
  return (
    <Reveal
      delay={delay}
      className="grid gap-4 border-b border-line py-8 lg:grid-cols-12 lg:gap-8 lg:py-10"
    >
      <div className="lg:col-span-4">{label}</div>
      <div className="min-w-0 lg:col-span-8">{children}</div>
    </Reveal>
  );
}

/**
 * "A · B · C" that wraps cleanly: items never break inside, and each item's
 * leading dot hangs into a clipped gutter, so no line starts with a dot.
 */
function MetaLine({ items, className }) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <ul className="-ml-5 flex flex-wrap text-[15px] leading-6 text-muted">
        {items.map((item) => (
          <li key={item} className="whitespace-nowrap">
            <span aria-hidden="true" className="inline-block w-5 text-center text-line-strong">
              ·
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
