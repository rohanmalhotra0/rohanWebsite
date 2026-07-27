import { ArrowUpRight, MapPin } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import InteractivePolaroids from './InteractivePolaroids';
import SectionHeading from './SectionHeading';
import { GridPattern } from '@/components/ui/grid-pattern';
import { profile } from '@/data/portfolioData';

const principles = [
  {
    label: 'Build the whole system',
    value: 'Models, APIs, interfaces, deployment, and documentation.',
  },
  {
    label: 'Measure the result',
    value: 'Accuracy, latency, risk, and operational usefulness—not demo theater.',
  },
  {
    label: 'Explain the hard parts',
    value: 'Research and engineering are only useful when other people can act on them.',
  },
];

const MotionDiv = motion.div;

export default function About() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="about"
      className="relative scroll-mt-24 overflow-hidden bg-white px-5 py-24 text-black sm:px-8 md:px-12 lg:px-16 lg:py-32"
    >
      <GridPattern
        width={44}
        height={44}
        className="fill-gray-300/15 stroke-gray-300/45 [mask-image:radial-gradient(720px_circle_at_20%_45%,white,transparent)]"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="01 / ABOUT"
          title="Technical depth, shipped."
          description="I like hard problems that cross boundaries: an AI model that still has to fit a business workflow, a robot that has to move in real time, or a financial model that has to become a product someone can actually use."
        />

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <InteractivePolaroids />

          <MotionDiv
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <p className="text-pretty text-2xl font-medium leading-10 text-gray-950 sm:text-3xl sm:leading-[1.4]">
              I’m a Computer Science student and Mathematics minor at NYU Courant,
              finishing an accelerated three-year degree while working across
              financial systems, applied AI, quantitative research, and robotics.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" aria-hidden="true" />
                {profile.location}
              </span>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-gray-950 hover:underline"
              >
                LinkedIn
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-gray-950 hover:underline"
              >
                GitHub
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>

            <dl className="mt-10 divide-y divide-gray-200 border-y border-gray-200">
              {principles.map((principle, index) => (
                <div
                  key={principle.label}
                  className="grid gap-2 py-5 sm:grid-cols-[2.25rem_12rem_1fr] sm:gap-4"
                >
                  <span className="font-pixel text-xs text-gray-400">
                    0{index + 1}
                  </span>
                  <dt className="font-semibold text-gray-950">{principle.label}</dt>
                  <dd className="text-pretty text-sm leading-6 text-gray-600">
                    {principle.value}
                  </dd>
                </div>
              ))}
            </dl>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
