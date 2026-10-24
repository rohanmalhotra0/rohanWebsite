import { Check, Copy } from 'lucide-react';
import { profile } from '@/data/portfolioData';
import { cn } from '@/lib/utils';
import useCopyToClipboard from './useCopyToClipboard';

const TOOLTIP = { idle: 'Copy email', copied: 'Copied', failed: 'Couldn’t copy' };
const ANNOUNCEMENT = {
  idle: '',
  copied: 'Email address copied',
  failed: 'Couldn’t copy the email address',
};

/**
 * The email as one large mailto link with a copy button beside it. The type
 * scales with its column (cqi), so address and button stay on one line from a
 * 320px phone to the desktop column; below that it breaks after the local part.
 */
export default function EmailLine({ className }) {
  const { status, copy } = useCopyToClipboard();
  const [local, domain] = profile.email.split('@');
  const copied = status === 'copied';

  return (
    <div className={cn('@container', className)}>
      <div className="flex items-center gap-2">
        <a
          href={`mailto:${profile.email}`}
          className="type-heading -my-3 min-w-0 py-3 text-[length:clamp(1.125rem,6.2cqi,3rem)] leading-[1.1] text-fg underline decoration-line-strong decoration-[length:0.06em] underline-offset-[0.16em] transition-[text-decoration-color] duration-150 [overflow-wrap:anywhere] hover:decoration-accent"
        >
          {local}
          <wbr />@{domain}
        </a>
        <button
          type="button"
          onClick={() => copy(profile.email)}
          aria-label="Copy email address"
          className="group relative grid size-11 shrink-0 place-items-center rounded-lg border border-line-strong text-muted transition-colors duration-150 hover:bg-fg/[0.05] hover:text-fg"
        >
          <Copy
            aria-hidden="true"
            className={cn(
              'col-start-1 row-start-1 size-[18px] transition-[opacity,scale] duration-200 ease-out',
              copied && 'scale-50 opacity-0'
            )}
          />
          <Check
            aria-hidden="true"
            strokeWidth={2.5}
            className={cn(
              'col-start-1 row-start-1 size-[18px] text-accent-strong transition-[opacity,scale] duration-200 ease-out',
              !copied && 'scale-50 opacity-0'
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-fg px-2 py-1 text-xs font-medium text-bg opacity-0 shadow-sm transition-[opacity,translate] duration-150 ease-out',
              'group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100',
              status !== 'idle' && 'translate-y-0 opacity-100'
            )}
          >
            {TOOLTIP[status]}
          </span>
        </button>
      </div>
      {/* Announces the result without moving focus. */}
      <p className="sr-only" aria-live="polite">
        {ANNOUNCEMENT[status]}
      </p>
    </div>
  );
}
