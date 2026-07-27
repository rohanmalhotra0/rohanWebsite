import { ArrowUpRight, MapPin } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import InteractivePolaroids from './InteractivePolaroids';
import SectionHeading from './SectionHeading';
import { GridPattern } from '@/components/ui/grid-pattern';
import { profile } from '@/data/portfolioData';

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
          title="Hi, I’m Rohan."
        />

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <InteractivePolaroids />

          <MotionDiv
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <p className="text-pretty text-xl font-medium leading-8 text-gray-950 sm:text-2xl sm:leading-9">
              I learn by building. If I get curious about prediction markets, I
              make a hedging model. If I want to understand computer vision, I
              train a robot to find a toy. This site is basically the trail of
              whatever I was trying to figure out next.
            </p>

            <p className="mt-6 text-pretty text-base leading-7 text-gray-600">
              I’m studying Computer Science and Mathematics at NYU Courant and
              finishing the degree in three years. Most of my work sits somewhere
              between finance, robotics, and software that people can actually use.
            </p>

            <div className="mt-7 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm leading-6 text-gray-800">
                Right now: finishing NYU, working across IBM and DRW, and trying
                not to turn every random idea into another side project.
              </p>
            </div>

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
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
