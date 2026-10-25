import Reveal from '@/components/primitives/Reveal';
import TypeCover from '@/components/projects/TypeCover';
import { focalPoint, imageSize, projectHash, projectMeta } from '@/components/projects/projectData';
import { projects, selectedWork } from '@/data/portfolioData';
import { routeById } from '@/routes';
import TeaserHeader from './TeaserHeader';

const picks = selectedWork.map((slug) => projects.find((project) => project.slug === slug)).filter(Boolean);
const projectsPath = routeById('projects').path;

/** Three projects, one per theme, each opening in the Projects page's viewer. */
export default function SelectedWork() {
  return (
    <section aria-labelledby="selected-work" className="border-t border-line py-20 sm:py-28">
      <div className="container-page">
        <TeaserHeader
          id="selected-work"
          title="Selected work"
          href={projectsPath}
          linkLabel={`All ${projects.length} projects`}
        />
        <ul className="mt-10 grid gap-x-8 gap-y-12 sm:mt-12 md:grid-cols-3">
          {picks.map((project, index) => (
            <Reveal as="li" key={project.slug} delay={index * 0.06}>
              <WorkCard project={project} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function WorkCard({ project }) {
  const { width, height } = imageSize(project);

  return (
    <a href={`${projectsPath}${projectHash(project.slug)}`} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-surface-2 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-fg/10">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.imageAlt || ''}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            draggable="false"
            className="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
            style={{ objectPosition: focalPoint(project) }}
          />
        ) : (
          <TypeCover project={project} />
        )}
      </div>
      <h3 className="type-heading mt-5 text-balance text-2xl text-fg decoration-fg/30 decoration-2 underline-offset-[0.14em] group-hover:underline">
        {project.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-pretty text-[15px] leading-6 text-muted">{project.description}</p>
      <p className="mt-3 text-sm text-subtle">{projectMeta(project)}</p>
    </a>
  );
}
