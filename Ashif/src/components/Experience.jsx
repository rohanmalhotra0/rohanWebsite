import { useState } from 'react';
import { MapPin } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { workExperience } from '@/data/portfolioData';

function WorkLogo({ job }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-28 items-center justify-center overflow-hidden border-b border-gray-200 bg-[#f4f4f2] px-6 py-4">
      {failed ? (
        <span className="font-pixel text-sm text-gray-900">{job.company}</span>
      ) : (
        <img
          src={job.imageUrl}
          alt={job.imageAlt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={`block object-contain transition-transform duration-300 group-hover:scale-[1.035] ${job.logoClassName}`}
        />
      )}
    </div>
  );
}

function ExperienceCard({ job }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">
      <WorkLogo job={job} />

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-amber-700">{job.company}</p>
          <p className="shrink-0 text-right text-xs text-gray-500">{job.date}</p>
        </div>

        <h3 className="mt-2 text-balance text-lg font-semibold text-gray-950">
          {job.role}
        </h3>

        {job.location !== job.date ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="size-3.5" aria-hidden="true" />
            {job.location}
          </p>
        ) : null}

        <p className="mt-3 text-pretty text-sm leading-5 text-gray-600">
          {job.summary}
        </p>

        <ul
          className="mt-4 flex flex-wrap gap-1.5"
          aria-label={`${job.company} technologies`}
        >
          {job.tags.slice(0, 3).map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700"
            >
              {tag}
            </li>
          ))}
        </ul>

        <details className="mt-auto border-t border-gray-200 pt-3 text-sm text-gray-600">
          <summary
            className="flex min-h-11 cursor-pointer items-center font-semibold text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            aria-label={`What I worked on at ${job.company}`}
          >
            What I worked on
          </summary>
          <ul className="mt-3 space-y-2 leading-5">
            {job.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-yellow-400"
                  aria-hidden="true"
                />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </article>
  );
}

export default function Experience() {
  return (
    <section
      id="experience"
      className="relative scroll-mt-24 overflow-hidden border-y border-gray-200 bg-[#ececea] px-5 py-20 text-gray-950 sm:px-8 md:px-12 lg:px-16 lg:py-24"
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(#d7d7d4_1px,transparent_1px),linear-gradient(90deg,#d7d7d4_1px,transparent_1px)] bg-[size:44px_44px] opacity-70"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="02 / EXPERIENCE"
          title="Work experience."
          description="My recent work includes Oracle forecasting at DRW through IBM, real-time vision for Boston Dynamics Spot, and income-risk research for Kalshi. Expand a card for the details."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workExperience.map((job) => (
            <ExperienceCard
              key={`${job.company}-${job.role}`}
              job={job}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
