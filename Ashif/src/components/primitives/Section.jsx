import { cn } from '@/lib/utils';
import Reveal from './Reveal';

export function Section({ id, className, children, ...props }) {
  return (
    <section
      id={id}
      className={cn('relative scroll-mt-20 py-24 sm:py-32', className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function Container({ className, children }) {
  return <div className={cn('container-page', className)}>{children}</div>;
}

/** Mono eyebrow like "01 —— EXPERIENCE". */
export function Eyebrow({ index, label, className }) {
  return (
    <p
      className={cn(
        'flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle',
        className
      )}
    >
      {index ? <span className="text-accent-strong">{index}</span> : null}
      {index ? <span aria-hidden="true" className="h-px w-8 bg-line-strong" /> : null}
      <span>{label}</span>
    </p>
  );
}

/**
 * Section header. Put <em> around a word in `title` for the serif-italic accent:
 * title={<>Things I&rsquo;ve <em>built</em></>}
 */
export function SectionHeader({
  index,
  label,
  title,
  description,
  className,
  children,
}) {
  return (
    <Reveal className={cn('max-w-3xl', className)}>
      <Eyebrow index={index} label={label} />
      <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.04em] text-fg sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted sm:text-lg sm:leading-8">
          {description}
        </p>
      ) : null}
      {children}
    </Reveal>
  );
}
