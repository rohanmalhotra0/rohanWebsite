import { ArrowUpRight, Github } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageSize, META_TEXT, projectLinks } from './projectMeta';

/** Lazy cover image with its intrinsic size reserved (no layout shift). */
export function ProjectImage({ project, className, style, sizes }) {
  const { width, height } = getImageSize(project);
  return (
    <img
      src={project.imageUrl}
      alt={project.imageAlt || ''}
      width={width}
      height={height}
      sizes={sizes}
      loading="lazy"
      decoding="async"
      draggable="false"
      className={className}
      style={style}
    />
  );
}

/** "AI & Systems · 2026"; the year is simply left out when unknown. */
export function ProjectMeta({ project, className }) {
  return (
    <p className={cn(META_TEXT, className)}>
      {project.category}
      {project.year ? (
        <>
          <span aria-hidden="true" className="mx-2 text-line-strong">
            /
          </span>
          <span className="tabular-nums">{project.year}</span>
        </>
      ) : null}
    </p>
  );
}

/**
 * Small mono text links for the featured cards ("Live ↗  Source ↗"). They sit
 * above the card's stretched button, and pad their hit area to ~44px tall.
 */
export function CardLinks({ project, className }) {
  const links = projectLinks(project);
  if (!links.length) return null;
  return (
    <ul className={cn('relative z-10 flex items-center gap-1', className)}>
      {links.map((link) => (
        <li key={link.kind}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${project.title}: ${link.long} (opens in a new tab)`}
            className="group/link -my-2.5 inline-flex items-center gap-1 rounded-full px-2 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-fg"
          >
            {link.short}
            <ArrowUpRight
              aria-hidden="true"
              className="size-3 transition-transform duration-200 group-hover/link:-translate-y-px group-hover/link:translate-x-px"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}

const ROW_ICONS = { live: ArrowUpRight, repo: Github };

/**
 * Icon links for an archive row. Two fixed slots (live, source) keep the
 * column aligned; a missing link leaves an empty slot, never a dead link.
 */
export function RowLinks({ project }) {
  const links = projectLinks(project);
  const slots = ['live', 'repo'].map((kind) => links.find((l) => l.kind === kind));
  return (
    <div className="relative z-10 flex items-center justify-end">
      {slots.map((link, i) => {
        if (!link) {
          return <span key={i} aria-hidden="true" className="size-11 sm:size-9" />;
        }
        const Icon = ROW_ICONS[link.kind];
        return (
          <a
            key={link.kind}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            title={link.long}
            aria-label={`${project.title}: ${link.long} (opens in a new tab)`}
            className="inline-flex size-11 items-center justify-center rounded-full text-subtle transition-colors hover:bg-fg/[0.06] hover:text-fg sm:size-9"
          >
            <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
          </a>
        );
      })}
    </div>
  );
}
