import { cn } from '@/lib/utils';
import { BLOCK_CLASS, routeNumber } from '@/routes';
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
 * The top of a page: a rounded color block in the page's palette color
 * (`route.block`), with a small tagline, the title (the page's h1), an
 * optional description, and the page's number as a giant outlined numeral.
 * Never animated in, so a page opened directly shows its title at first
 * paint. After a page change the router focuses the title (data-page-focus),
 * so screen readers announce it.
 */
export function PageHeader({ route, title = route.label, description = route.description, className, children }) {
  // The display face draws zero with a bar through it, so the numeral drops its leading zero.
  const number = routeNumber(route)?.replace(/^0/, '');

  return (
    <header className={cn('container-page pt-[4.5rem] sm:pt-20 lg:pt-[5.5rem]', className)}>
      <div
        className={cn(
          'grain mesh relative overflow-hidden rounded-[1.75rem] px-6 pb-10 pt-12 sm:rounded-[2.25rem] sm:px-10 sm:pb-14 sm:pt-16 lg:px-14 lg:pb-16 lg:pt-20',
          BLOCK_CLASS[route.block] ?? 'block-a'
        )}
      >
        {number ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[0.14em] -right-[0.02em] select-none type-display text-[clamp(8rem,28vw,22rem)] leading-none text-transparent opacity-40 [-webkit-text-stroke:2px_var(--on-block)]"
          >
            {number}
          </span>
        ) : null}
        {route.tagline ? (
          <p className="relative font-mono text-xs uppercase tracking-[0.16em] text-on-block-muted sm:text-[13px]">
            {route.tagline}
          </p>
        ) : null}
        <h1
          tabIndex={-1}
          data-page-focus=""
          className="relative mt-4 type-display text-balance text-[clamp(2.75rem,9.5vw,7.5rem)] outline-none sm:mt-6"
        >
          {title}
        </h1>
        {description ? (
          <p className="relative mt-6 max-w-xl text-pretty text-base leading-7 text-on-block-muted sm:text-lg sm:leading-8">
            {description}
          </p>
        ) : null}
        {children}
      </div>
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
