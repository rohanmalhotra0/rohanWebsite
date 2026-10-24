import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import useMediaQuery from '@/hooks/useMediaQuery';

const MAX_TILT = 6; // degrees at the very edge of the element
const LIFT = 0.015; // extra scale while hovered
const SMOOTHING = 0.14; // lerp factor per frame (higher = snappier)

/**
 * Pointer-driven 3D tilt for hover devices.
 *
 * Listeners go on `containerRef` (which never transforms, so its rect stays
 * stable) and the transform is written to `targetRef`. A rAF loop eases toward
 * the pointer and stops as soon as it settles, so nothing runs while idle.
 * Also exposes --glare-x / --glare-y / --glare (0–1) on the target for a sheen.
 */
export default function useTilt() {
  const containerRef = useRef(null);
  const targetRef = useRef(null);
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reduceMotion = useReducedMotion();
  const enabled = canHover && !reduceMotion;

  useEffect(() => {
    const container = containerRef.current;
    const target = targetRef.current;
    if (!enabled || !container || !target) return undefined;

    const goal = { x: 0, y: 0, hover: 0 };
    const state = { x: 0, y: 0, hover: 0 };
    let frame = 0;

    const render = () => {
      state.x += (goal.x - state.x) * SMOOTHING;
      state.y += (goal.y - state.y) * SMOOTHING;
      state.hover += (goal.hover - state.hover) * SMOOTHING;

      const settled =
        Math.abs(goal.x - state.x) < 0.001 &&
        Math.abs(goal.y - state.y) < 0.001 &&
        Math.abs(goal.hover - state.hover) < 0.001;

      if (settled && goal.hover === 0) {
        // Back at rest: drop the inline transform entirely.
        target.style.transform = '';
        target.style.setProperty('--glare', '0');
        frame = 0;
        return;
      }

      target.style.transform =
        `perspective(900px) rotateX(${(-state.y * MAX_TILT).toFixed(3)}deg) ` +
        `rotateY(${(state.x * MAX_TILT).toFixed(3)}deg) scale(${(1 + state.hover * LIFT).toFixed(4)})`;
      target.style.setProperty('--glare-x', `${((state.x + 1) * 50).toFixed(1)}%`);
      target.style.setProperty('--glare-y', `${((state.y + 1) * 50).toFixed(1)}%`);
      target.style.setProperty('--glare', state.hover.toFixed(3));

      frame = settled ? 0 : requestAnimationFrame(render);
    };

    const kick = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onMove = (event) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      const rect = container.getBoundingClientRect();
      // Normalize to -1…1 from the center of the element.
      goal.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      goal.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      goal.hover = 1;
      kick();
    };

    const onLeave = () => {
      goal.x = 0;
      goal.y = 0;
      goal.hover = 0;
      kick();
    };

    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerleave', onLeave);
    return () => {
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
      target.style.transform = '';
    };
  }, [enabled]);

  return { containerRef, targetRef };
}
