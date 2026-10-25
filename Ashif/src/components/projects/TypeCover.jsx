import { cn } from '@/lib/utils';
import { projectMeta } from './projectData';

/**
 * Cover for a project without a real image: its title set on paper (or
 * graphite), with the category and year above it. The small square is the
 * only color. Fills its parent and sizes its type to the space it gets.
 * Decorative: the same title and meta are always shown as text nearby.
 */
export default function TypeCover({ project, className }) {
  return (
    <div aria-hidden="true" data-type-cover className={cn('@container size-full bg-bg', className)}>
      <div className="flex size-full flex-col justify-between p-5 @md:p-8 @2xl:p-10">
        <p className="flex items-center gap-2.5 text-[13px] text-subtle @md:text-sm">
          <span className="size-1.5 shrink-0 bg-accent" />
          {projectMeta(project)}
        </p>
        <p className="type-heading max-w-[20ch] text-balance text-2xl leading-[1.05] text-fg @md:text-3xl @2xl:text-5xl">
          {project.title}
        </p>
      </div>
    </div>
  );
}
