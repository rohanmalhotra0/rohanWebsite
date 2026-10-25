import { useEffect, useRef } from 'react';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Fades and lifts its children into view once, when scrolled to.
 * Stagger siblings with `delay={index * 0.05}` (seconds).
 *
 * The markup is always visible, so prerendered pages paint complete and
 * nothing depends on JavaScript. Once mounted, an element that starts out
 * off screen is hidden (unseen, since it's off screen) and comes up when it
 * scrolls a little way into view. Anything already on screen stays put.
 * Reduced motion skips all of it.
 */
export default function Reveal({ as = 'div', delay = 0, y = 14, className, children, ...rest }) {
  const ref = useRef(null);
  const Component = as;

  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    let reveal = null;
    const first = new IntersectionObserver(([entry]) => {
      first.disconnect();
      if (entry.isIntersecting) return;

      const { style } = element;
      style.opacity = '0';
      style.transform = `translateY(${y}px)`;
      reveal = new IntersectionObserver(
        ([next]) => {
          if (!next.isIntersecting) return;
          reveal.disconnect();
          style.transition = `opacity 0.6s ${EASE} ${delay}s, transform 0.6s ${EASE} ${delay}s`;
          style.opacity = '';
          style.transform = '';
          element.addEventListener(
            'transitionend',
            () => {
              style.transition = '';
            },
            { once: true }
          );
        },
        // Wait until it is a little way up from the bottom edge.
        { rootMargin: '0px 0px -12% 0px' }
      );
      reveal.observe(element);
    });
    first.observe(element);

    return () => {
      first.disconnect();
      reveal?.disconnect();
      // Never leave it hidden for a later run to inherit.
      element.style.opacity = '';
      element.style.transform = '';
    };
  }, [delay, y]);

  // data-reveal lets print styles show content that hasn't scrolled into view.
  return (
    <Component ref={ref} data-reveal="" className={className} {...rest}>
      {children}
    </Component>
  );
}
