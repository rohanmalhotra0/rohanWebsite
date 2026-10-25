import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Moon, Sun } from 'lucide-react';
import { PALETTES, useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { useReducedMotion } from './hooks';
import { centerOf } from './navigation';

const MotionDiv = motion.div;
const EASE = [0.16, 1, 0.3, 1];

/**
 * A palette's two colors as a split disc. Decorative. Without `colors` it
 * shows the active palette's, from CSS (--swatch-1/2), so it is right before
 * any JavaScript runs.
 */
export function Swatch({ colors = ['var(--swatch-1)', 'var(--swatch-2)'], className }) {
  const [a, b] = colors;
  return (
    <span
      aria-hidden="true"
      className={cn('block size-5 shrink-0 rounded-full ring-1 ring-fg/15 ring-inset', className)}
      style={{ background: `linear-gradient(135deg, ${a} 0 50%, ${b} 50% 100%)` }}
    />
  );
}

/**
 * The palettes as a radio group: arrow keys move through it and switch as
 * they go (a live preview), a click switches with the circular reveal.
 */
export function PaletteOptions({ className, compact = false, labelledBy }) {
  const { palette, setPalette } = useTheme();
  const refs = useRef([]);

  const onKeyDown = (event) => {
    const index = PALETTES.findIndex((p) => p.id === palette);
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    let next = null;
    if (step) next = (index + step + PALETTES.length) % PALETTES.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = PALETTES.length - 1;
    if (next === null) return;
    event.preventDefault();
    setPalette(PALETTES[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={labelledBy ? undefined : 'Color palette'}
      aria-labelledby={labelledBy}
      onKeyDown={onKeyDown}
      className={cn(compact ? 'flex flex-wrap gap-2' : 'flex flex-col', className)}
    >
      {PALETTES.map((option, index) => {
        const checked = option.id === palette;
        return (
          <button
            key={option.id}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={compact ? `${option.name}: ${option.blurb}` : undefined}
            tabIndex={checked ? 0 : -1}
            onClick={(event) =>
              setPalette(option.id, event.detail === 0 ? centerOf(event.currentTarget) : event)
            }
            className={cn(
              'flex items-center rounded-lg text-left transition-colors duration-150',
              compact
                ? cn(
                    'size-12 justify-center ring-1 ring-inset',
                    checked ? 'bg-fg/[0.06] ring-mark ring-2' : 'ring-line hover:bg-fg/[0.04]'
                  )
                : cn('min-h-12 gap-3 px-2.5 py-2', checked ? 'bg-fg/[0.06]' : 'hover:bg-fg/[0.04]')
            )}
          >
            <Swatch colors={option.swatch} className={compact ? 'size-7' : undefined} />
            {compact ? null : (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-fg">{option.name}</span>
                  <span className="block text-xs text-subtle">{option.blurb}</span>
                </span>
                <Check
                  aria-hidden="true"
                  strokeWidth={2.25}
                  className={cn('size-4 shrink-0 text-accent-strong', checked ? 'opacity-100' : 'opacity-0')}
                />
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Light and dark as two buttons, for the palette panel. */
function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const options = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
  ];
  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-2/70 p-1" role="group" aria-label="Theme">
      {options.map((option) => {
        const { id, label } = option;
        const Icon = option.icon;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={theme === id}
            onClick={(event) => {
              if (theme !== id) toggleTheme(event.detail === 0 ? centerOf(event.currentTarget) : event);
            }}
            className={cn(
              'flex h-9 items-center justify-center gap-1.5 rounded-md text-[13px] font-medium transition-colors duration-150',
              theme === id ? 'bg-surface text-fg shadow-sm ring-1 ring-line' : 'text-muted hover:text-fg'
            )}
          >
            <Icon aria-hidden="true" className="size-3.5" strokeWidth={2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The navbar's palette button: shows the current palette's swatch and opens
 * a small panel with every palette and the light/dark switch. Esc or a click
 * outside closes it; picking a palette leaves it open, to compare.
 */
export default function PalettePicker({ className }) {
  const { palette } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const current = PALETTES.find((option) => option.id === palette) ?? PALETTES[0];

  useEffect(() => {
    if (!open) return undefined;
    // Start on the checked palette, so arrow keys work at once.
    rootRef.current?.querySelector('[role="radio"][aria-checked="true"]')?.focus({ preventScroll: true });
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        data-palette-button=""
        aria-label={`Color palette: ${current.name}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={className}
      >
        <Swatch className="size-[18px]" />
      </button>

      <AnimatePresence>
        {open ? (
          <MotionDiv
            id={panelId}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: EASE }}
            style={{ transformOrigin: '100% 0%' }}
            className="absolute right-0 top-full z-10 mt-2 w-[17rem] rounded-xl border border-line bg-surface p-1.5 shadow-2xl dark:border-line-strong"
          >
            <p id={titleId} className="px-2.5 pb-1 pt-2 text-xs font-medium text-subtle">
              Palette
            </p>
            <PaletteOptions labelledBy={titleId} />
            <div className="mt-1.5 border-t border-line px-1 pb-1 pt-2.5">
              <ThemeSwitch />
            </div>
          </MotionDiv>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
