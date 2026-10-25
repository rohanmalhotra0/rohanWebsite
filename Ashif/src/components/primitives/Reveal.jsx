import { motion } from 'motion/react';
import useMediaQuery from '@/hooks/useMediaQuery';

const EASE = [0.16, 1, 0.3, 1];

/**
 * Fades and lifts its children into view once, when scrolled to.
 * Stagger siblings with `delay={index * 0.05}`.
 */
export default function Reveal({
  as = 'div',
  delay = 0,
  y = 14,
  amount = 0.15,
  className,
  children,
  ...rest
}) {
  // Our own media query instead of motion's useReducedMotion, which logs a
  // dev warning for every reduced-motion visitor.
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const Component = motion[as] ?? motion.div;

  // data-reveal lets print styles show content that hasn't scrolled into view.
  if (reduceMotion) {
    // Snap to visible: this also covers reduced motion switching on after an
    // element mounted hidden and before it was revealed.
    return (
      <Component
        data-reveal=""
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0 }}
        className={className}
        {...rest}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      data-reveal=""
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}
