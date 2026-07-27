import { motion, useReducedMotion } from 'motion/react';
import { Braces, BrainCircuit, CloudCog, Landmark } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { skillGroups } from '@/data/portfolioData';

const icons = [Braces, BrainCircuit, CloudCog, Landmark];
const MotionArticle = motion.article;

export default function Skills() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="skills"
      className="relative scroll-mt-24 overflow-hidden bg-[#090909] px-5 py-24 text-white sm:px-8 md:px-12 lg:px-16 lg:py-32"
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(#202020_1px,transparent_1px),linear-gradient(90deg,#202020_1px,transparent_1px)] bg-[size:44px_44px] opacity-30"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="[&_h2]:text-white [&_p]:text-white/60">
          <SectionHeading
            eyebrow="07 / WORKING SET"
            title="A stack shaped by the problem."
            description="The tools span low-level systems, AI, cloud applications, and financial planning because the work does too. I’m happiest when the boundaries between those layers are visible."
          />
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {skillGroups.map((group, index) => {
            const Icon = icons[index];
            return (
              <MotionArticle
                key={group.label}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="rounded-2xl border border-white/15 bg-black/45 p-6 sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-pixel text-sm text-yellow-300">{group.label}</h3>
                  <Icon className="size-5 text-white/45" aria-hidden="true" />
                </div>
                <ul className="mt-7 flex flex-wrap gap-2.5">
                  {group.items.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white/80"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </MotionArticle>
            );
          })}
        </div>
      </div>
    </section>
  );
}
