import { Search } from 'lucide-react';
import { Kbd, ModKey } from '@/components/primitives/Tag';
import { cn } from '@/lib/utils';
import { PALETTE_SHORTCUT_ARIA } from './platform';
import { ICON_BUTTON } from './styles';

/** The name, linking back to the top of the page. */
export function Wordmark({ onClick, className }) {
  return (
    <a
      href="#top"
      onClick={onClick}
      className={cn(
        'type-heading inline-flex h-11 shrink-0 items-center whitespace-nowrap text-[15px] text-fg',
        className
      )}
    >
      Rohan Malhotra
    </a>
  );
}

/**
 * Opens the command palette. Icon only on small screens; icon and shortcut on
 * desktop. `onIntent` runs on hover or focus, ahead of the click, so the
 * palette's code can start loading.
 */
export function SearchButton({ ref, onClick, onIntent, className }) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onPointerEnter={onIntent}
      onFocus={onIntent}
      aria-label="Search"
      aria-haspopup="dialog"
      aria-keyshortcuts={PALETTE_SHORTCUT_ARIA}
      className={cn(ICON_BUTTON, 'lg:w-auto lg:gap-2 lg:pl-2.5 lg:pr-2', className)}
    >
      <Search className="size-[18px] lg:size-4" strokeWidth={1.75} aria-hidden="true" />
      <Kbd className="hidden lg:inline-flex">
        <ModKey space />K
      </Kbd>
    </button>
  );
}

/** Two-line menu icon, drawn on the same 24px grid and stroke as the lucide icons. */
export function MenuIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
      className={cn('size-5', className)}
    >
      <path d="M4 9h16M4 15h16" />
    </svg>
  );
}
