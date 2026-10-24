import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { getDegreeProgress } from './degreeProgress';

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;

/**
 * Thin bar from `start` to `end` (YYYY-MM-DD), measured against today.
 * The text label carries the meaning; the bar is a visual echo of it.
 */
export default function DegreeProgress({ start, end, className }) {
  // Read the clock once per mount; the page doesn't need to tick.
  const [{ ratio, label }] = useState(() => getDegreeProgress(start, end));
  const trackRef = useRef(null);
  const inView = useInView(trackRef, { once: true, amount: 'all' });
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn('max-w-xl', className)}>
      <div
        ref={trackRef}
        aria-hidden="true"
        className="relative h-0.5 overflow-hidden rounded-full bg-line-strong/60"
      >
        <MotionDiv
          className="absolute inset-0 origin-left bg-fg"
          initial={reduceMotion ? false : { scaleX: 0 }}
          animate={{ scaleX: inView || reduceMotion ? ratio : 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
        />
      </div>
      <p className="mt-3 text-sm tabular-nums text-subtle">{label}</p>
    </div>
  );
}
