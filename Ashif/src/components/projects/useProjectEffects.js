import { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Pointer tracking for the featured cards. Writes CSS variables straight onto
 * the element (batched to one write per frame), so hovering never re-renders:
 *   --mx / --my  pointer position in px (spotlight border + sheen)
 *   --px / --py  pointer offset from the center in [-0.5, 0.5] (image parallax)
 */
export function useSpotlight() {
  const frame = useRef(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const onPointerMove = useCallback(
    (event) => {
      if (event.pointerType === 'touch') return;
      const el = event.currentTarget;
      const { clientX, clientY } = event;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        el.style.setProperty('--mx', `${x}px`);
        el.style.setProperty('--my', `${y}px`);
        if (!reduceMotion) {
          el.style.setProperty('--px', (x / rect.width - 0.5).toFixed(3));
          el.style.setProperty('--py', (y / rect.height - 0.5).toFixed(3));
        }
      });
    },
    [reduceMotion]
  );

  const onPointerLeave = useCallback((event) => {
    cancelAnimationFrame(frame.current);
    event.currentTarget.style.setProperty('--px', '0');
    event.currentTarget.style.setProperty('--py', '0');
  }, []);

  return { onPointerMove, onPointerLeave };
}

/**
 * Locks page scroll while a modal is open. Pads the body by the scrollbar's
 * width so content doesn't shift. Returns the unlock function.
 */
export function lockBodyScroll() {
  const { documentElement: html, body } = document;
  const scrollbar = window.innerWidth - html.clientWidth;
  const previous = { overflow: html.style.overflow, paddingRight: body.style.paddingRight };
  html.style.overflow = 'hidden';
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  return () => {
    html.style.overflow = previous.overflow;
    body.style.paddingRight = previous.paddingRight;
  };
}
