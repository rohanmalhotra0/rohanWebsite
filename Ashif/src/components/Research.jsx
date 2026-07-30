import { ArrowUpRight, BookOpen } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { research } from '@/data/portfolioData';

export default function Research() {
  return (
    <section
      id="research"
      className="relative scroll-mt-24 overflow-hidden bg-white px-4 py-16 sm:px-8 sm:py-24 md:px-12 lg:px-16 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="04 / RESEARCH"
          title="Research I’ve put into practice."
          description="These started as questions I wanted to test: whether sentiment helps explain returns, how prediction contracts can hedge income risk, and how Kelly sizing behaves under drawdowns."
        />

        <div className="mt-10 grid gap-5 sm:mt-14 lg:grid-cols-3">
          {research.map((paper) => (
            <article
              key={paper.title}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <figure className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <img
                  src={paper.imageUrl}
                  alt={paper.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
                />
              </figure>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="font-pixel text-[11px] text-gray-500">{paper.eyebrow}</p>
                <h3 className="mt-3 text-balance text-xl font-semibold text-gray-950">
                  {paper.title}
                </h3>
                <p className="mt-3 text-pretty text-sm leading-6 text-gray-600">
                  {paper.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Research methods">
                  {paper.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap gap-2 pt-7">
                  <a
                    href={paper.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white"
                  >
                    <BookOpen className="size-4" aria-hidden="true" />
                    Read paper
                  </a>
                  {paper.externalUrl ? (
                    <a
                      href={paper.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                    >
                      Published record
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
