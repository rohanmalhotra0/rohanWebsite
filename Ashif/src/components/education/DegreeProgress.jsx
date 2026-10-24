import { useEffect, useId, useRef, useState } from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { getDegreeProgress } from './degreeProgress';

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;
const MotionSpan = motion.span;
// Year labels closer than this (in %) to either end would collide with the end labels.
const LABEL_EDGE_GAP = 22;

/**
 * Live progress bar from `start` to `end` (YYYY-MM-DD), computed from today's
 * date. Fills from 0 when scrolled into view; static under reduced motion.
 */
export default function DegreeProgress({ start, end }) {
  // Computed once per mount: "today" doesn't need to tick while the page is open.
  const [progress] = useState(() => getDegreeProgress(start, end));
  const { percent, graduated, daysLeft, startLabel, endLabel, ticks } = progress;

  const labelId = useId();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();

  // One motion value drives the fill, the counter, and the live dot so they stay in sync.
  const value = useMotionValue(0);
  const counter = useTransform(value, (v) => Math.floor(v));
  const fillX = useTransform(value, (v) => `${v - 100}%`);
  const dotOpacity = useTransform(
    value,
    [Math.max(0, percent - 3), Math.max(percent, 0.01)],
    [0, 1]
  );

  useEffect(() => {
    if (reduceMotion) {
      value.set(percent);
      return undefined;
    }
    if (!inView) return undefined;
    const controls = animate(value, percent, { duration: 1.6, delay: 0.15, ease: EASE });
    return () => controls.stop();
  }, [inView, percent, reduceMotion, value]);

  const valueText = graduated
    ? `Graduated ${endLabel.toLowerCase()}`
    : `${Math.floor(percent)}% complete, ${daysLeft} days until ${endLabel.toLowerCase()}`;

  return (
    <div ref={ref}>
      <div className="flex items-baseline justify-between gap-4">
        <p
          id={labelId}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle"
        >
          Degree progress
        </p>
        <p aria-hidden="true" className="font-mono text-[13px] tabular-nums text-subtle">
          {graduated ? (
            <span className="text-fg">Graduated</span>
          ) : (
            <>
              <span className="text-fg">
                <MotionSpan>{counter}</MotionSpan>%
              </span>
              <span className="mx-2 text-line-strong">/</span>
              {daysLeft} days left
            </>
          )}
        </p>
      </div>

      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.floor(percent)}
        aria-valuetext={valueText}
        className="relative mt-3.5 h-2"
      >
        <div className="absolute inset-0 overflow-hidden rounded-full bg-fg/10">
          <MotionDiv
            className="h-full w-full rounded-full bg-accent light:shadow-[inset_0_0_0_1px_rgb(77_124_15/0.35)]"
            style={{ x: fillX }}
          />
        </div>

        {ticks.map((tick) => (
          <span
            key={tick.label}
            aria-hidden="true"
            className="absolute top-full mt-1.5 h-1.5 w-px bg-line-strong"
            style={{ left: `${tick.position}%` }}
          />
        ))}

        {/* "Today" marker at the end of the fill. */}
        {!graduated && percent > 0 ? (
          <MotionSpan
            aria-hidden="true"
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 animate-pulse-dot rounded-full border-2 border-surface bg-accent"
            style={{ left: `${percent}%`, opacity: dotOpacity }}
          />
        ) : null}
      </div>

      <div
        aria-hidden="true"
        className="relative mt-4 h-4 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle sm:text-[11px]"
      >
        <span className="absolute left-0">{startLabel}</span>
        {ticks
          .filter((t) => t.position > LABEL_EDGE_GAP && t.position < 100 - LABEL_EDGE_GAP)
          .map((tick) => (
            <span
              key={tick.label}
              className="absolute hidden -translate-x-1/2 sm:block"
              style={{ left: `${tick.position}%` }}
            >
              {tick.label}
            </span>
          ))}
        <span className="absolute right-0">{endLabel}</span>
      </div>
    </div>
  );
}
