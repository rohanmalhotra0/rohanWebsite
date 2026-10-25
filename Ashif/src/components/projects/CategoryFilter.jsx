import { useId, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { EASE } from './projectData';

const MotionSpan = motion.span;
const MotionDiv = motion.div;

/**
 * Segmented control for the archive's categories, built on native radios
 * (arrow keys move between them). The active thumb slides between segments.
 * Scrolls sideways on narrow screens, keeping the chosen segment in view.
 */
export default function CategoryFilter({ options, value, onChange, className }) {
  const name = useId();
  const scrollerRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const select = (option, label) => {
    onChange(option.value);
    const scroller = scrollerRef.current;
    if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;
    // Center the chosen segment without scrolling the page.
    const left = label.offsetLeft - (scroller.clientWidth - label.offsetWidth) / 2;
    scroller.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="sr-only">Filter by category</legend>
      <MotionDiv
        ref={scrollerRef}
        layoutScroll
        className="-mx-4 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,transparent,var(--fg)_16px,var(--fg)_calc(100%-24px),transparent)] [scrollbar-width:none] sm:mx-0 sm:px-0 sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="inline-flex gap-0.5 rounded-lg bg-surface-2 p-1 dark:bg-surface">
          {options.map((option) => {
            const checked = option.value === value;
            return (
              <label key={option.value} className="relative shrink-0">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={checked}
                  onChange={(event) => select(option, event.currentTarget.parentElement)}
                  className="peer sr-only"
                />
                {checked ? (
                  <MotionSpan
                    layoutId={`${name}-thumb`}
                    transition={{ layout: reduceMotion ? { duration: 0 } : { duration: 0.3, ease: EASE } }}
                    style={{ borderRadius: 6 }}
                    className="absolute inset-0 bg-surface ring-1 ring-line-strong/70 dark:bg-surface-2"
                  />
                ) : null}
                <span
                  className={cn(
                    'relative flex h-11 cursor-pointer select-none items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-sm transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent sm:h-9',
                    checked ? 'text-fg' : 'text-muted hover:text-fg'
                  )}
                >
                  {option.label}
                  <span
                    className={cn(
                      'text-[13px] font-normal tabular-nums',
                      option.count ? 'text-subtle' : 'text-subtle/50'
                    )}
                  >
                    {option.count}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </MotionDiv>
    </fieldset>
  );
}
