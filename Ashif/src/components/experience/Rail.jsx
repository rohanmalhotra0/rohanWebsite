import { useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { isFullBleedLogo } from './timeline';
import { useNodeLit, useRailFill } from './useRailProgress';

const MotionDiv = motion.div;
const MotionSpan = motion.span;

/*
 * Geometry is shared through CSS variables set on the timeline wrapper:
 *   --tile    logo tile size (the rail runs through the tiles' centres)
 *   --pad     role card padding
 *   --node-y  distance from a card's padding edge to the middle of its first text line
 */

/** Hairline rail with an accent fill that tracks scroll progress through the timeline. */
export function Rail({ target, progress }) {
  const fill = useRailFill(target);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-[calc(var(--tile)/2)] top-[calc(var(--tile)/2)] w-px -translate-x-1/2 [mask-image:linear-gradient(to_bottom,#000_88%,transparent)]"
    >
      <div className="absolute inset-0 bg-line-strong" />
      {progress ? (
        <MotionDiv
          style={{ scaleY: fill }}
          className="absolute inset-0 origin-top bg-linear-to-b from-accent-strong/0 via-accent-strong/50 to-accent-strong"
        />
      ) : null}
    </div>
  );
}

/** Small node on the rail marking one role inside a multi-role company. */
export function RailDot({ lit, className }) {
  const ref = useRef(null);
  const opacity = useNodeLit(ref);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        'absolute size-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line-strong bg-bg shadow-[0_0_0_5px_var(--bg)]',
        className
      )}
    >
      {lit ? (
        <MotionSpan
          style={{ opacity }}
          className="absolute -inset-px rounded-full bg-accent-strong shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_22%,transparent)]"
        />
      ) : null}
    </span>
  );
}

/**
 * Company logo on a white tile (logos ship on white or transparent backgrounds),
 * doubling as the rail node for that company. Full-bleed square logos fill the tile.
 */
export function CompanyLogo({ company, src, alt, lit, className }) {
  const ref = useRef(null);
  const opacity = useNodeLit(ref);
  const fullBleed = isFullBleedLogo(company);

  return (
    <span
      ref={ref}
      className={cn(
        'relative block size-[var(--tile)] shrink-0 rounded-xl shadow-[0_0_0_5px_var(--bg)]',
        className
      )}
    >
      {lit ? (
        <MotionSpan
          aria-hidden="true"
          style={{ opacity }}
          className="absolute -inset-[3px] rounded-[15px] border border-accent-strong/70"
        />
      ) : null}
      <span className="relative grid size-full place-items-center overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgb(10_10_12/0.08),0_1px_2px_rgb(10_10_12/0.06)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.06)]">
        <img
          src={src}
          alt={alt}
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
          draggable="false"
          className={cn(
            'size-full select-none',
            fullBleed ? 'object-cover' : 'object-contain p-[13%]'
          )}
        />
      </span>
    </span>
  );
}
