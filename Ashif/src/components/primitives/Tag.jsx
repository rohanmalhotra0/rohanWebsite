import { cn } from '@/lib/utils';

/** Tech stack as plain text ("Python · OpenCV · gRPC"), not a row of chips. */
export function TechList({ items, className }) {
  if (!items?.length) return null;
  return (
    <p className={cn('text-[13px] leading-6 text-subtle', className)}>
      {items.join(' · ')}
    </p>
  );
}

export function Kbd({ className, children }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded border border-line-strong bg-surface px-1 font-mono text-[11px] font-medium text-subtle',
        className
      )}
    >
      {children}
    </kbd>
  );
}
