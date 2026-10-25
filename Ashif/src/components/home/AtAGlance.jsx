import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/primitives/Reveal';
import { projects, research, workExperience } from '@/data/portfolioData';
import { roleAnchor } from '@/components/experience/timeline';

const robotics = workExperience.find((role) => /robotics/i.test(role.role));
const epm = workExperience.find((role) => /applications developer/i.test(role.role));
// "36.7% → 95.0%": the big number is where it ended up. Its ".0" goes: the
// display face draws zero with a slash, and "95%" reads faster anyway.
const [epmBefore, epmAfter] = (epm?.metric?.value ?? '')
  .split('→')
  .map((part) => part.trim().replace(/\.0(?=%)/, ''));

/** The numbers worth knowing first, each linking to where it comes from. */
const STATS = [
  robotics?.metric && {
    value: robotics.metric.value,
    label: 'mAP@50 for the YOLO11 model I trained so a Boston Dynamics Spot could find toys at IBM.',
    href: `/experience/#${roleAnchor(robotics.company)}`,
    cta: 'The robotics work',
  },
  epmAfter && {
    value: epmAfter,
    label: `accuracy building Oracle EPM forms, rules, and reports after I fine-tuned Qwen-Coder-32B, up from ${epmBefore}.`,
    href: `/experience/#${roleAnchor(epm.company)}`,
    cta: 'The EPM work',
  },
  {
    value: String(projects.length),
    label: 'projects, from internship tools to small things I built for myself.',
    href: '/projects/',
    cta: 'See projects',
  },
  {
    value: String(research.length),
    label: 'research papers on prediction markets, market sentiment, and capital allocation.',
    href: '/research/',
    cta: 'Read the papers',
  },
].filter(Boolean);

export default function AtAGlance() {
  return (
    <section aria-labelledby="at-a-glance" className="container-page pb-20 pt-6 sm:pb-28 lg:pt-2">
      <Reveal>
        <h2 id="at-a-glance" className="text-sm text-subtle">
          At a glance
        </h2>
      </Reveal>
      {/* Hairlines between cells come from the 1px gaps over the line color,
          so they follow the grid at two columns or four. */}
      <ul className="mt-4 grid grid-cols-1 gap-px border-y border-line bg-line min-[480px]:grid-cols-2 lg:grid-cols-4">
        {/* The cell keeps its paper background while its content fades in. Cells
            in the first column start on the page's left edge. */}
        {STATS.map((stat, index) => (
          <li
            key={stat.cta}
            className="bg-bg min-[480px]:px-5 min-[480px]:max-lg:odd:pl-0 lg:px-6 lg:first:pl-0"
          >
            <Reveal
              as="a"
              delay={index * 0.05}
              href={stat.href}
              className="group flex h-full flex-col py-6 outline-offset-2 sm:py-8"
            >
              <span className="type-display text-[clamp(2.5rem,5.5vw,3.75rem)] text-fg">
                {stat.value}
              </span>
              <span className="mt-3 max-w-[30ch] text-pretty text-[15px] leading-6 text-muted">{stat.label}</span>
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-fg">
                <span className="underline decoration-transparent underline-offset-[0.22em] transition-[text-decoration-color] duration-150 group-hover:decoration-accent">
                  {stat.cta}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className="size-4 text-subtle transition-[translate,color] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-fg"
                />
              </span>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
