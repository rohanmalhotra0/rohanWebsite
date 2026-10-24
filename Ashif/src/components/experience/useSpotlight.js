import { useEffect, useRef } from 'react';

/**
 * Cursor-following spotlight. Writes the pointer position (px, relative to the
 * element) into the `--mx` / `--my` CSS variables, at most once per frame.
 * Pass `enabled = false` on touch / no-hover devices to skip the listener.
 */
export default function useSpotlight(enabled) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return undefined;

    let frame = 0;
    let x = 0;
    let y = 0;

    const write = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${x - rect.left}px`);
      el.style.setProperty('--my', `${y - rect.top}px`);
    };

    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(write);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerenter', onMove);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerenter', onMove);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return ref;
}
