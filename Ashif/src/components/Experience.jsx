import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MapPin } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { workExperience } from '@/data/portfolioData';
import { cn } from '@/lib/utils';

const MotionArticle = motion.article;

function WorkIdentity({ job }) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className="w-full max-w-[13rem] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex h-24 items-center justify-center bg-[#f7f7f5] p-3">
        {failed ? (
          <span className="font-pixel text-sm text-gray-900">{job.company}</span>
        ) : (
          <img
            src={job.imageUrl}
            alt={job.imageAlt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="max-h-full w-full object-contain"
          />
        )}
      </div>
      <figcaption className="min-h-12 border-t border-gray-200 px-3 py-2 text-pretty text-xs font-semibold leading-4 text-gray-900">
        {job.imageLabel}
      </figcaption>
    </figure>
  );
}

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
      className="relative scroll-mt-24 overflow-hidden border-y border-gray-200 bg-[#ececea] px-5 py-24 text-gray-950 sm:px-8 md:px-12 lg:px-16 lg:py-32"
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(#d7d7d4_1px,transparent_1px),linear-gradient(90deg,#d7d7d4_1px,transparent_1px)] bg-[size:44px_44px] opacity-70"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="02 / EXPERIENCE"
          title="Work that made it to production."
          description="From Oracle financial systems and on-prem AI to a Boston Dynamics robot and prediction-market research, the through-line is owning the technical path from idea to usable system."
        />

        <div className="mt-16 space-y-5">
          {workExperience.map((job, index) => (
            <MotionArticle
              key={`${job.company}-${job.role}`}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={cn(
                'grid gap-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10',
                index < 3 && 'border-gray-300 bg-[#fafaf8]'
              )}
            >
              <div className="min-w-0">
                <WorkIdentity job={job} />
                <p className="mt-5 font-pixel text-xs text-gray-400">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-2 text-sm font-medium text-gray-800">{job.date}</p>
                {job.location !== job.date ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {job.location}
                  </p>
                ) : null}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-700">{job.company}</p>
                <h3 className="mt-2 text-balance text-2xl font-semibold text-gray-950 sm:text-3xl">
                  {job.role}
                </h3>
                <p className="mt-4 max-w-3xl text-pretty text-base leading-7 text-gray-600">
                  {job.summary}
                </p>
                <ul className="mt-6 grid gap-3 text-sm leading-6 text-gray-700 2xl:grid-cols-2">
                  {job.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-yellow-400" />
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
