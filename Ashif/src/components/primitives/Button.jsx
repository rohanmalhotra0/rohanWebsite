import { cn } from '@/lib/utils';

const variants = {
  // Ink button: black on paper, paper on graphite.
  primary: 'bg-fg text-bg hover:bg-fg/85',
  // Safety orange. Use for at most one thing per view.
  accent: 'bg-accent text-accent-ink hover:brightness-110',
  secondary: 'border border-line-strong bg-transparent text-fg hover:bg-fg/[0.05]',
  ghost: 'text-muted hover:bg-fg/[0.05] hover:text-fg',
};

const sizes = {
  sm: 'h-9 gap-1.5 px-3 text-[13px]',
  md: 'h-11 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-5 text-[15px]',
};

/**
 * Button. Renders an <a> when `href` is set; external http(s) links open in a
 * new tab unless `external={false}`.
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
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-lg font-medium transition-[background-color,color,filter,transform] duration-150 ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
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
