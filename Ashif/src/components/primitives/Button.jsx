import { cn } from '@/lib/utils';

const variants = {
  primary:
    'bg-accent text-accent-ink shadow-[0_8px_24px_-10px_var(--accent)] hover:-translate-y-px hover:shadow-[0_12px_28px_-10px_var(--accent)]',
  secondary:
    'border border-line-strong bg-surface/70 text-fg backdrop-blur hover:-translate-y-px hover:bg-surface-2',
  ghost: 'text-muted hover:bg-fg/5 hover:text-fg',
};

const sizes = {
  sm: 'h-9 gap-1.5 px-3.5 text-[13px]',
  md: 'h-11 gap-2 px-5 text-sm',
  lg: 'h-12 gap-2 px-6 text-[15px]',
};

/**
 * Pill button. Renders an <a> when `href` is set; external http(s) links open
 * in a new tab unless `external={false}`.
 */
export default function Button({
  href,
  variant = 'primary',
  size = 'md',
  external,
  className,
  children,
  type,
  ...props
}) {
  const isLink = Boolean(href);
  const isExternal = external ?? (isLink && /^https?:\/\//.test(href));
  const Component = isLink ? 'a' : 'button';

  return (
    <Component
      href={href}
      type={isLink ? undefined : (type ?? 'button')}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer' : undefined}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-medium transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
