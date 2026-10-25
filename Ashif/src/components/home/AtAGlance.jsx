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
      {/* A color block in the palette's first color: the numbers in its ink. */}
      <Reveal className="block-a grain mesh relative overflow-hidden rounded-[1.75rem] px-6 py-9 sm:rounded-[2.25rem] sm:px-10 sm:py-12 lg:px-14">
        <h2
          id="at-a-glance"
          className="relative font-mono text-xs uppercase tracking-[0.16em] text-on-block-muted sm:text-[13px]"
        >
          At a glance
        </h2>
        <ul className="relative mt-6 grid gap-x-8 gap-y-10 min-[480px]:grid-cols-2 sm:mt-8 lg:grid-cols-4 lg:gap-x-10">
          {STATS.map((stat) => (
            <li key={stat.cta}>
              <a href={stat.href} className="group flex h-full flex-col outline-offset-4">
                <span className="type-display text-[clamp(2.75rem,5.2vw,4rem)]">{stat.value}</span>
                <span className="mt-3 max-w-[30ch] text-pretty text-[15px] leading-6 text-on-block-muted">
                  {stat.label}
                </span>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium">
                  <span className="underline decoration-[color-mix(in_srgb,currentColor_35%,transparent)] underline-offset-[0.22em] transition-[text-decoration-color] duration-150 group-hover:decoration-current">
                    {stat.cta}
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    strokeWidth={1.75}
                    className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                  />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
