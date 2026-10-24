import { cn } from '@/lib/utils';

export function Tag({ className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-line px-2.5 py-1 font-mono text-[11px] leading-none text-muted',
        className
      )}
    >
      {children}
    </span>
  );
}

export function Kbd({ className, children }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded border border-line-strong bg-surface-2 px-1 font-mono text-[10px] font-medium text-subtle',
        className
      )}
    >
      {children}
    </kbd>
  );
}
