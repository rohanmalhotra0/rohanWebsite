import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const MS_PER_CHAR = 4;
const MIN_MS = 260;
// Long answers speed up so nobody waits more than about a second.
const MAX_MS = 950;

/**
 * Reveals `total` characters over a short, length-scaled duration.
 * Returns {count, typing}. Instant when disabled or with reduced motion.
 */
export default function useTypewriter(total, enabled = true) {
  const reduceMotion = useReducedMotion();
  const animate = enabled && !reduceMotion && total > 0;
  const [count, setCount] = useState(animate ? 0 : total);

  useEffect(() => {
    if (!animate) return undefined;
    const duration = Math.min(MAX_MS, Math.max(MIN_MS, total * MS_PER_CHAR));
    let frame = 0;
    let start = 0;

    const tick = (now) => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / duration);
      setCount(Math.ceil(progress * total));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, total]);

  const visible = animate ? count : total;
  return { count: visible, typing: visible < total };
}
