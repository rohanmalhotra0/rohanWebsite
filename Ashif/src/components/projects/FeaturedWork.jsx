import { memo } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { ProjectLinks } from './ProjectLinks';
import { FLIGHT, focalPoint, imageSize, INSTANT, mediaLayoutId, projectMeta } from './projectData';
import { canHover } from './viewerDom';

const MotionDiv = motion.div;

/**
 * One featured project: a 16:10 image with its caption beneath (or beside it,
 * for the wide rows). The title's button stretches over the whole card.
 *
 * The image frame shares a layoutId with the viewer's image. While the viewer
 * is open its layout transition is instant, so nothing animates behind the
 * scrim; once it closes, the frame flies back into place. Memoized so cards
 * re-render only when the viewer opens or closes.
 */
const FeaturedCard = memo(function FeaturedCard({ project, index, layout, viewerOpen, onOpen }) {
  const { width, height } = imageSize(project);
  const wide = layout !== 'grid';
  const flipped = layout === 'end';

  const caption = (
    <>
      <h3
        className={cn(
          'type-heading text-balance text-fg',
          wide ? 'text-2xl sm:text-3xl lg:text-[2.5rem] lg:leading-[1.05]' : 'mt-5 text-2xl sm:mt-6'
        )}
      >
        <button
          type="button"
          aria-haspopup="dialog"
          data-project-trigger={`card:${project.slug}`}
          onClick={(event) =>
            onOpen(index, {
              opener: event.currentTarget,
              // A mouse click (not Enter) on a hover device: the image is zoomed.
              fromHover: event.detail > 0 && canHover(),
            })
          }
          className="text-left decoration-fg/30 decoration-2 underline-offset-[0.14em] outline-none after:absolute after:inset-0 after:content-[''] group-hover:underline"
        >
          {project.title}
        </button>
      </h3>
      <p
        className={cn(
          'mt-3 max-w-xl text-pretty leading-relaxed text-muted',
          wide ? 'text-base' : 'text-[15px] sm:text-base'
        )}
      >
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <p className="text-sm text-subtle">{projectMeta(project)}</p>
        <ProjectLinks project={project} className="relative z-10" />
      </div>
    </>
  );

  return (
    <li
      className={
        wide
          ? 'md:col-span-2 lg:col-span-12'
          : // Image, title, description and meta are rows of a subgrid, so
            // captions of different lengths still line up across the pair.
            'md:row-span-4 md:grid md:grid-rows-subgrid md:gap-y-0 lg:col-span-6'
      }
    >
      <article
        data-project-card={project.slug}
        className={cn(
          'group relative',
          wide
            ? 'lg:grid lg:grid-cols-12 lg:gap-x-8'
            : 'md:row-span-4 md:grid md:grid-rows-subgrid md:gap-y-0'
        )}
      >
        <div
          data-project-media
          className={cn(
            'relative rounded-lg outline-offset-4 outline-accent-strong group-has-[button:focus-visible]:outline-2',
            wide && 'lg:col-span-8',
            flipped && 'lg:col-start-5 lg:row-start-1'
          )}
        >
          <MotionDiv
            layoutId={mediaLayoutId(project.slug)}
            transition={viewerOpen ? INSTANT : FLIGHT}
            style={{ borderRadius: 8 }}
            className="relative aspect-[16/10] overflow-hidden bg-surface-2 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-fg/10"
          >
            <img
              src={project.imageUrl}
              alt={project.imageAlt || ''}
              width={width}
              height={height}
              loading="lazy"
              decoding="async"
              draggable="false"
              className="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.02]"
              style={{ objectPosition: focalPoint(project) }}
            />
          </MotionDiv>
        </div>

        {wide ? (
          <div
            className={cn(
              'mt-5 sm:mt-6 lg:col-span-4 lg:mt-0 lg:self-end',
              flipped && 'lg:col-start-1 lg:row-start-1'
            )}
          >
            {caption}
          </div>
        ) : (
          caption
        )}
      </article>
    </li>
  );
});

/**
 * Featured work, laid out like a portfolio: the first project wide with its
 * caption beside it, then a two-column grid. When the grid would leave an
 * orphan, the last project closes the set as a mirrored wide row.
 */
function FeaturedWork({ projects, viewerOpen, onOpen }) {
  const endWide = (projects.length - 1) % 2 === 1;

  return (
    <ul className="mt-14 grid gap-x-8 gap-y-14 sm:mt-20 sm:gap-y-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-y-20">
      {projects.map((project, i) => (
        <FeaturedCard
          key={project.slug}
          project={project}
          index={i}
          layout={i === 0 ? 'lead' : endWide && i === projects.length - 1 ? 'end' : 'grid'}
          viewerOpen={viewerOpen}
          onOpen={onOpen}
        />
      ))}
    </ul>
  );
}

export default memo(FeaturedWork);
