import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { EASE } from './timeline';

const MotionLi = motion.li;

// From md up the dash hangs in the gutter and the text lines up with the summary.
const ITEM = 'md:-ml-4';

// Spacing sits on this inner box so an item animating its height has no padding.
function ItemContent({ text }) {
  return (
    <div className="relative pl-4 pt-2">
      <span aria-hidden="true" className="absolute left-0 text-subtle">
        –
      </span>
      {text}
    </div>
  );
}

/**
 * A role's highlights: the first `visible` show, the rest sit behind a quiet
 * "Show N more" button. `label` ("Robotics Engineer Intern at IBM") completes
 * the button's accessible name so each one is distinct.
 */
export default function Highlights({ items, visible, label, className }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const listId = useId();

  if (!items?.length) return null;

  const shown = visible ?? items.length;
  const head = items.slice(0, shown);
  const rest = items.slice(shown);
  const transition = reduceMotion
    ? { duration: 0 }
    : { height: { duration: 0.25, ease: EASE }, opacity: { duration: 0.18, ease: 'easeOut' } };

  return (
    <div className={className}>
      <ul
        id={listId}
        className="-mt-2 max-w-[38rem] text-pretty text-[15px] leading-6 text-muted"
      >
        {head.map((text) => (
          <li key={text} className={ITEM}>
            <ItemContent text={text} />
          </li>
        ))}
        <AnimatePresence initial={false}>
          {open
            ? rest.map((text) => (
                <MotionLi
                  key={text}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={transition}
                  className={cn(ITEM, 'overflow-hidden')}
                >
                  <ItemContent text={text} />
                </MotionLi>
              ))
            : null}
        </AnimatePresence>
      </ul>

      {rest.length ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            'link -mb-3 mt-0.5 flex min-h-11 w-fit items-center text-sm font-medium text-muted hover:text-fg',
            // On phones, line up with the bullet text when bullets show by default.
            head.length && 'pl-4 md:pl-0'
          )}
        >
          {open ? 'Show less' : `Show ${rest.length} more`}
          {label ? <span className="sr-only"> for {label}</span> : null}
        </button>
      ) : null}
    </div>
  );
}
