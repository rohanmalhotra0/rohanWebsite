import { useMemo, useState } from 'react';
import { ArrowUpRight, Github, Search } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import SectionHeading from './SectionHeading';
import { projects } from '@/data/portfolioData';
import { cn } from '@/lib/utils';

const MotionArticle = motion.article;

function ProjectImage({ project, className }) {
  const [failed, setFailed] = useState(false);

  return (
    <figure
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-gray-100',
        className
      )}
    >
      {failed ? (
        <div className="flex size-full min-h-48 items-center justify-center bg-gray-100 p-8 text-center text-gray-700">
          <span className="font-pixel text-lg">{project.title}</span>
        </div>
      ) : (
        <img
          src={project.imageUrl}
          alt={project.imageAlt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full object-contain"
        />
      )}
      <figcaption className="absolute bottom-3 left-3 max-w-[85%] rounded-md bg-black/85 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm">
        Project preview · {project.title}
      </figcaption>
      {project.imageCredit ? (
        <a
          href={project.imageCreditUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute right-3 top-3 max-w-[70%] rounded-md bg-black/85 px-2.5 py-1.5 text-xs font-medium text-white"
        >
          {project.imageCredit}
        </a>
      ) : null}
    </figure>
  );
}

function ProjectLinks({ project, inverse = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      {project.liveUrl ? (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(
            'inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold',
            inverse
              ? 'bg-white text-black'
              : 'bg-black text-white'
          )}
        >
          Live project
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      ) : null}
      {project.repoUrl ? (
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(
            'inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold',
            inverse
              ? 'border-white/25 text-white hover:bg-white/10'
              : 'border-gray-200 text-gray-800 hover:bg-gray-50'
          )}
        >
          <Github className="size-4" aria-hidden="true" />
          Source
        </a>
      ) : null}
    </div>
  );
}

function FeaturedProject({ project, index }) {
  const reduceMotion = useReducedMotion();

  return (
    <MotionArticle
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="group grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[1.08fr_0.92fr]"
    >
      <ProjectImage
        project={project}
        className="aspect-[16/10] min-h-64 lg:aspect-auto lg:min-h-[26rem]"
      />
      <div className="flex min-w-0 flex-col p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <p className="font-pixel text-xs text-amber-700">
            FEATURED / {String(index + 1).padStart(2, '0')}
          </p>
          <span className="text-xs text-gray-500">{project.year || 'Current'}</span>
        </div>
        <h3 className="mt-6 text-balance text-3xl font-semibold text-gray-950">
          {project.title}
        </h3>
        <p className="mt-4 text-pretty text-base leading-7 text-gray-600">
          {project.longDescription || project.description}
        </p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Project technologies">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700"
            >
              {tag}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-8">
          <ProjectLinks project={project} />
        </div>
      </div>
    </MotionArticle>
  );
}

function ArchiveProject({ project }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <ProjectImage project={project} className="aspect-video" />
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex min-w-0 items-center justify-between gap-3 text-xs text-gray-500">
          <span className="truncate font-semibold text-gray-700">
            {project.category}
          </span>
          <span className="shrink-0 tabular-nums">{project.year || 'Current'}</span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-balance text-xl font-semibold text-gray-950">
          {project.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-pretty text-sm leading-6 text-gray-600">
          {project.description}
        </p>
        {project.longDescription ? (
          <details className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <summary className="cursor-pointer font-semibold text-gray-900">
              Project depth
            </summary>
            <p className="mt-2 text-pretty leading-6">{project.longDescription}</p>
          </details>
        ) : null}
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Project technologies">
          {project.tags.slice(0, 5).map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700"
            >
              {tag}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-6">
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const featured = projects.filter((project) => project.featured);
  const categories = useMemo(
    () => ['All', ...new Set(projects.map((project) => project.category))],
    []
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects.filter((project) => {
      const inCategory = category === 'All' || project.category === category;
      const searchable = [
        project.title,
        project.description,
        project.category,
        ...project.tags,
      ]
        .join(' ')
        .toLowerCase();
      return inCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, query]);

  const isExploring = category !== 'All' || query.trim().length > 0;
  const visibleProjects = isExploring || showAll ? filtered : filtered.slice(0, 9);

  return (
    <section id="projects" className="scroll-mt-24">
      <div className="relative overflow-hidden bg-[#e7e7e5] px-5 py-24 text-gray-950 sm:px-8 md:px-12 lg:px-16 lg:py-32">
        <div
          className="absolute inset-0 bg-[linear-gradient(#d2d2cf_1px,transparent_1px),linear-gradient(90deg,#d2d2cf_1px,transparent_1px)] bg-[size:44px_44px] opacity-70"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="03 / SELECTED PROJECTS"
            title="Products, models, and systems."
            description="The strongest work gets case-study treatment here. The complete archive below is intentionally broad: production apps, research tools, quantitative models, learning systems, and experiments."
          />
          <div className="mt-14 space-y-6">
            {featured.map((project, index) => (
              <FeaturedProject key={project.slug} project={project} index={index} />
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-[#f7f7f5] px-5 py-24 sm:px-8 md:px-12 lg:px-16 lg:py-28">
        <div
          className="absolute inset-0 bg-[linear-gradient(#e4e4e4_1px,transparent_1px),linear-gradient(90deg,#e4e4e4_1px,transparent_1px)] bg-[size:44px_44px] opacity-60"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="font-pixel text-xs font-bold text-gray-500">
                FULL ARCHIVE
              </p>
              <h3 className="mt-3 text-balance text-3xl font-bold text-gray-950 sm:text-4xl">
                Browse {projects.length} builds.
              </h3>
              <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-gray-600">
                Filter by domain or search the technologies and problems behind each build.
              </p>
            </div>

            <label className="relative block w-full lg:max-w-sm">
              <span className="sr-only">Search projects</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowAll(false);
                }}
                placeholder="Search projects or technologies"
                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-950 shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap gap-2" aria-label="Filter projects">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => {
                  setCategory(item);
                  setShowAll(false);
                }}
                className={cn(
                  'min-h-10 rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-150',
                  category === item
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm text-gray-500" aria-live="polite">
            Showing{' '}
            <span className="tabular-nums font-semibold">
              {visibleProjects.length}
            </span>{' '}
            of <span className="tabular-nums font-semibold">{filtered.length}</span>{' '}
            projects
          </p>

          {filtered.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleProjects.map((project) => (
                <ArchiveProject key={project.slug} project={project} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="font-semibold text-gray-950">No projects match that filter.</p>
              <button
                type="button"
                onClick={() => {
                  setCategory('All');
                  setQuery('');
                }}
                className="mt-4 min-h-10 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                Reset filters
              </button>
            </div>
          )}

          {!isExploring && filtered.length > 9 ? (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                className="min-h-11 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white"
              >
                {showAll
                  ? 'Show the focused archive'
                  : `Show all ${filtered.length} projects`}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
