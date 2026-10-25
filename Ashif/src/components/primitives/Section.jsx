import { cn } from '@/lib/utils';
import Reveal from './Reveal';

/** Page section. Sections are separated by a hairline rule, like a printed spec. */
export function Section({ id, className, children, ...props }) {
  return (
    <section
      id={id}
      className={cn('relative border-t border-line py-20 sm:py-28', className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function Container({ className, children }) {
  return <div className={cn('container-page', className)}>{children}</div>;
}

/**
 * The top of a page: its title (the page's h1) and an optional short
 * description, beside it from lg up. Never animated in, so a page opened
 * directly shows its title at first paint. After a page change the router
 * focuses the title (data-page-focus), so screen readers announce it.
 */
export function PageHeader({ title, description, className, children }) {
  return (
    <header className={cn('container-page pt-28 sm:pt-36 lg:pt-40', className)}>
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
        <h1
          tabIndex={-1}
          data-page-focus=""
          className="type-display text-balance text-[clamp(2.75rem,8.5vw,6rem)] text-fg outline-none lg:col-span-8"
        >
          {title}
        </h1>
        {description ? (
          <p className="max-w-md text-pretty text-base leading-7 text-muted sm:text-[17px] lg:col-span-4 lg:pb-2">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </header>
  );
}

/**
 * Section header: a plain, wide heading on the left and an optional short
 * description (or any `aside` content) on the right from md up.
 */
export function SectionHeader({ title, description, aside, className }) {
  return (
    <Reveal
      className={cn(
        'grid gap-5 md:grid-cols-12 md:items-end md:gap-8',
        className
      )}
    >
      <h2 className="type-heading text-[2.5rem] text-fg sm:text-6xl md:col-span-7">
        {title}
      </h2>
      {description || aside ? (
        <div className="md:col-span-5 md:pb-1.5">
          {description ? (
            <p className="max-w-md text-pretty text-base leading-7 text-muted">
              {description}
            </p>
          ) : null}
          {aside}
        </div>
      ) : null}
    </Reveal>
  );
}
