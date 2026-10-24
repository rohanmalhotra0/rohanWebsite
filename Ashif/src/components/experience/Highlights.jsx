import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { EASE, VISIBLE_HIGHLIGHTS, splitFigures } from './timeline';

const MotionLi = motion.li;

// Each item carries its own top spacing so the height animation includes it.
// From md up the dash hangs in the gutter and the text lines up with the summary.
const ITEM = 'relative pl-4 pt-2 md:-ml-4';

/** Highlight text with standalone figures (898, 99.5%, 500,000) set in ink. */
function Figures({ text }) {
  return splitFigures(text).map((part, i) =>
    part.figure ? (
      <span key={i} className="font-medium text-fg">
        {part.text}
      </span>
    ) : (
      part.text
    )
  );
}

function ItemContent({ text }) {
  return (
    <>
      <span aria-hidden="true" className="absolute left-0 text-line-strong">
        –
      </span>
      <Figures text={text} />
    </>
  );
}

/**
 * A role's highlights. Unless `expanded`, only the first few show, with a quiet
 * text button for the rest. Hiding a single bullet would save nothing, so
 * short lists always show in full.
 */
export default function Highlights({ items, expanded = false, className }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const listId = useId();

  if (!items?.length) return null;

  const collapsible = !expanded && items.length > VISIBLE_HIGHLIGHTS + 1;
  const head = collapsible ? items.slice(0, VISIBLE_HIGHLIGHTS) : items;
  const rest = collapsible ? items.slice(VISIBLE_HIGHLIGHTS) : [];
  const transition = reduceMotion
    ? { duration: 0 }
    : { height: { duration: 0.4, ease: EASE }, opacity: { duration: 0.25, ease: 'easeOut' } };

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

      {collapsible ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
          className="link -mb-3 mt-0.5 inline-flex min-h-11 items-center pl-4 text-sm font-medium text-muted hover:text-fg md:pl-0"
        >
          {open ? 'Show less' : `Show ${rest.length} more`}
        </button>
      ) : null}
    </div>
  );
}
