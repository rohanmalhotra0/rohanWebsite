import { memo } from 'react';
import { motion } from 'motion/react';
import { navigate } from '@/lib/router';
import { cn } from '@/lib/utils';
import CategoryDot from './CategoryDot';
import { ProjectLinks } from './ProjectLinks';
import TypeCover from './TypeCover';
import {
  caseStudyPath,
  FLIGHT,
  focalPoint,
  imageSize,
  INSTANT,
  mediaLayoutId,
  projectHash,
  projectMeta,
} from './projectData';
import { canHover } from './viewerDom';

const MotionDiv = motion.div;

/**
 * One featured project: a 16:10 image with its caption beneath (or beside it,
 * for the wide rows). The title links to the project's deep link and its
 * stretched ::after makes the whole card clickable; the image takes its own clicks.
 *
 * The image frame shares a layoutId with the viewer's image. While the viewer
 * is open its layout transition is instant, so nothing animates behind the
 * scrim; once it closes, the frame flies back into place. Memoized so cards
 * re-render only when the viewer opens or closes.
 */
const FeaturedCard = memo(function FeaturedCard({
  project,
  index,
  layout,
  viewerOpen,
  onOpen,
  onPreload,
}) {
  const { width, height } = imageSize(project);
  const wide = layout !== 'grid';
  const flipped = layout === 'end';
  // A project with a case study goes to its page; the rest open the viewer.
  const study = caseStudyPath(project);
  const href = study ?? projectHash(project.slug);

  // A mouse click (not Enter) on a hover device means the image is zoomed.
  const open = (event) =>
    study ? navigate(study) : onOpen(index, { fromHover: event.detail > 0 && canHover() });

  // The title links to the project's deep link: a modified click opens it in a
  // new tab, a plain click opens the viewer here. A case study link is a plain
  // page link, which the router handles.
  const openFromLink = (event) => {
    if (study) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open(event);
  };

  const caption = (
    <>
      <h3
        className={cn(
          'type-heading text-balance text-fg',
          wide ? 'text-2xl sm:text-3xl lg:text-[2.5rem] lg:leading-[1.05]' : 'mt-5 text-2xl sm:mt-6'
        )}
      >
        {/* Its ::after covers the card, so the whole card is one target. */}
        <a
          href={href}
          aria-haspopup={study ? undefined : 'dialog'}
          data-project-trigger={`card:${project.slug}`}
          onClick={openFromLink}
          className="decoration-fg/30 decoration-2 underline-offset-[0.14em] outline-none after:absolute after:inset-0 after:content-[''] group-hover:underline"
        >
          {project.title}
        </a>
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
        <p className="flex items-center gap-2 text-sm text-subtle">
          <CategoryDot category={project.category} />
          {projectMeta(project)}
        </p>
        <ProjectLinks project={project} className="relative z-10" />
      </div>
    </>
  );

  return (
    <li
      className={cn(
        // From md the list has no row gap (it would leak into the subgrid
        // rows); items space themselves with bottom padding instead.
        layout === 'end' ? '' : 'md:pb-16 lg:pb-20',
        wide
          ? 'md:col-span-2 lg:col-span-12'
          : // Image, title, description and meta are rows of a subgrid, so
            // captions of different lengths still line up across the pair.
            'md:row-span-4 md:grid md:grid-rows-subgrid lg:col-span-6'
      )}
    >
      <article
        data-project-card={project.slug}
        onPointerEnter={onPreload}
        onFocus={onPreload}
        className={cn(
          'group relative',
          wide
            ? 'lg:grid lg:grid-cols-12 lg:gap-x-8'
            : 'md:row-span-4 md:grid md:grid-rows-subgrid'
        )}
      >
        {/* Sits above the title's stretched area so the image itself takes the
            click; the title link remains the keyboard and screen reader control. */}
        <div
          data-project-media
          onClick={open}
          className={cn(
            'relative z-10 cursor-pointer rounded-lg outline-offset-4 outline-accent-strong group-has-[[data-project-trigger]:focus-visible]:outline-2',
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
            {project.imageUrl ? (
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
            ) : (
              <TypeCover project={project} />
            )}
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
function FeaturedWork({ projects, viewerOpen, onOpen, onPreload }) {
  const endWide = (projects.length - 1) % 2 === 1;

  return (
    <ul className="mt-14 grid gap-x-8 gap-y-14 sm:mt-20 sm:gap-y-16 md:grid-cols-2 md:gap-y-0 lg:grid-cols-12">
      {projects.map((project, i) => (
        <FeaturedCard
          key={project.slug}
          project={project}
          index={i}
          layout={i === 0 ? 'lead' : endWide && i === projects.length - 1 ? 'end' : 'grid'}
          viewerOpen={viewerOpen}
          onOpen={onOpen}
          onPreload={onPreload}
        />
      ))}
    </ul>
  );
}

export default memo(FeaturedWork);
