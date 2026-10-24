import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { getDegreeProgress } from './degreeProgress';

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;

/**
 * Thin bar from `start` to `end` (YYYY-MM-DD), measured against today, with
 * the reading set under the end of the fill. The text carries the meaning;
 * the bar only echoes it, so it is hidden from assistive tech.
 */
export default function DegreeProgress({ start, end, className }) {
  // Read the clock once per mount; the page doesn't need to tick.
  const [{ ratio, label }] = useState(() => getDegreeProgress(start, end));
  const trackRef = useRef(null);
  const inView = useInView(trackRef, { once: true, amount: 'all' });
  const reduceMotion = useReducedMotion();

  // Near the start there's no room to hang the label off the fill end.
  const labelStyle = ratio >= 0.25 ? { right: `${(1 - ratio) * 100}%` } : { left: 0 };

  return (
    <div className={cn('relative pb-8', className)}>
      <div
        ref={trackRef}
        aria-hidden="true"
        className="relative h-0.5 overflow-hidden rounded-full bg-line"
      >
        <MotionDiv
          className="absolute inset-0 origin-left bg-accent"
          initial={reduceMotion ? false : { scaleX: 0 }}
          animate={{ scaleX: inView || reduceMotion ? ratio : 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
        />
      </div>
      <p
        className="absolute top-3 whitespace-nowrap text-sm leading-5 text-subtle"
        style={labelStyle}
      >
        {label}
      </p>
    </div>
  );
}
