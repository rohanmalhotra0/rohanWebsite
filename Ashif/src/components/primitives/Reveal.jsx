import { motion, useReducedMotion } from 'motion/react';

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
  const reduceMotion = useReducedMotion();
  const Component = motion[as] ?? motion.div;

  if (reduceMotion) {
    return (
      <Component className={className} {...rest}>
        {children}
      </Component>
    );
  }

  return (
    <Component
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
