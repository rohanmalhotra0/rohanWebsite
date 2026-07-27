import { motion, useReducedMotion } from 'motion/react';
import { MapPin } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { workExperience } from '@/data/portfolioData';
import { cn } from '@/lib/utils';

const MotionArticle = motion.article;

function TagList({ tags }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies used">
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

export default function Experience() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="experience"
      className="relative scroll-mt-24 overflow-hidden border-y border-white/10 bg-[#090909] px-5 py-24 text-white sm:px-8 md:px-12 lg:px-16 lg:py-32"
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(#202020_1px,transparent_1px),linear-gradient(90deg,#202020_1px,transparent_1px)] bg-[size:44px_44px] opacity-30"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="[&_h2]:text-white [&_p]:text-white/60">
          <SectionHeading
            eyebrow="02 / EXPERIENCE"
            title="Work that made it to production."
            description="From Oracle financial systems and on-prem AI to a Boston Dynamics robot and prediction-market research, the through-line is owning the technical path from idea to usable system."
          />
        </div>

        <div className="mt-16 space-y-5">
          {workExperience.map((job, index) => (
            <MotionArticle
              key={`${job.company}-${job.role}`}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={cn(
                'grid gap-6 rounded-2xl border border-white/15 bg-black/55 p-5 shadow-sm sm:p-7 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10',
                index < 3 && 'border-white/25 bg-[#111]'
              )}
            >
              <div>
                <figure className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white p-2 pr-4">
                  <img
                    src={job.imageUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-11 rounded-lg object-contain"
                  />
                  <figcaption className="max-w-28 text-xs font-semibold leading-4 text-black">
                    {job.imageLabel}
                  </figcaption>
                </figure>
                <p className="mt-5 font-pixel text-xs text-white/45">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-2 text-sm font-medium text-white/80">{job.date}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/50">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {job.location}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-yellow-300">{job.company}</p>
                <h3 className="mt-2 text-balance text-2xl font-semibold text-white sm:text-3xl">
                  {job.role}
                </h3>
                <p className="mt-4 max-w-3xl text-pretty text-base leading-7 text-white/65">
                  {job.summary}
                </p>
                <ul className="mt-6 grid gap-3 text-sm leading-6 text-white/75 xl:grid-cols-2">
                  {job.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-yellow-300" />
                      <span className="text-pretty">{highlight}</span>
                    </li>
                  ))}
                </ul>
                <TagList tags={job.tags} />
              </div>
            </MotionArticle>
          ))}
        </div>
      </div>
    </section>
  );
}
