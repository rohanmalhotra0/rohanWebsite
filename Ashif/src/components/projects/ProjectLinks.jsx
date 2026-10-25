import { ArrowUpRight, Github } from 'lucide-react';
import { cn } from '@/lib/utils';
import { projectLinks } from './projectData';

/** Quiet text links under a featured image: "Open site ↗  Source ↗". */
export function ProjectLinks({ project, className }) {
  const links = projectLinks(project);
  if (!links.length) return null;
  return (
    <ul className={cn('flex items-center gap-5', className)}>
      {links.map((link) => (
        <li key={link.kind}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${link.label}: ${project.title} (opens in a new tab)`}
            className="group/link -my-3 inline-flex min-h-11 items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-fg"
          >
            <span className="underline decoration-transparent decoration-1 underline-offset-[0.22em] transition-[text-decoration-color] duration-150 group-hover/link:decoration-line-strong">
              {link.label}
            </span>
            <ArrowUpRight aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
          </a>
        </li>
      ))}
    </ul>
  );
}

const ICONS = { live: ArrowUpRight, repo: Github };

/**
 * Icon links for an archive row. Two fixed slots (site, source) keep the
 * column aligned; a missing link leaves its slot empty.
 */
export function ProjectLinkIcons({ project }) {
  const links = projectLinks(project);
  return (
    <div className="relative z-10 flex items-center justify-end">
      {['live', 'repo'].map((kind) => {
        const link = links.find((l) => l.kind === kind);
        if (!link) return <span key={kind} aria-hidden="true" className="size-11 sm:size-10" />;
        const Icon = ICONS[kind];
        return (
          <a
            key={kind}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            title={link.label}
            aria-label={`${link.label}: ${project.title} (opens in a new tab)`}
            className="inline-flex size-11 items-center justify-center rounded-lg text-subtle transition-colors duration-150 hover:bg-fg/[0.06] hover:text-fg sm:size-10"
          >
            <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
          </a>
        );
      })}
    </div>
  );
}
