import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EASE, imageSize } from './projectData';

const MotionDiv = motion.div;

const MAX_WIDTH = 240; // px; tiny covers stay at their natural width
const GAP = 28; // px between the cursor and the preview
const EDGE = 16; // px kept clear of the viewport edges
const SHADOW = '0 24px 48px -20px rgb(0 0 0 / 0.35), 0 8px 16px -8px rgb(0 0 0 / 0.15)';

const previewSize = (project) => {
  const { width, height } = imageSize(project);
  const w = Math.min(MAX_WIDTH, width);
  return { w, h: Math.round((w * height) / width) };
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * A small cover that trails the cursor while an archive row is hovered.
 * Position and fade are eased in one rAF loop with frame-rate-independent
 * smoothing; the loop sleeps once everything settles and wakes on the next
 * pointer move. Portaled to <body> so no ancestor transform can affect it.
 */
export default function ArchivePreview({ project }) {
  const reduceMotion = useReducedMotion();
  const anchorRef = useRef(null);
  const sizeRef = useRef({ w: MAX_WIDTH, h: 150 });
  const wakeRef = useRef(() => {});
  // Keep the last project on screen while the preview fades out.
  const [shown, setShown] = useState(project);
  if (project && project !== shown) setShown(project);

  const visible = Boolean(project);
  const { w, h } = shown ? previewSize(shown) : sizeRef.current;

  // The loop reads the size from a ref; wake it so a new size re-clamps.
  useLayoutEffect(() => {
    sizeRef.current = { w, h };
    wakeRef.current();
  }, [w, h]);

  useEffect(() => {
    const el = anchorRef.current;
    const state = { x: 0, y: 0, fade: 0, px: -1, py: -1, placed: false };
    let raf = 0;
    let last = 0;

    const tick = (now) => {
      const dt = Math.min(64, last ? now - last : 16);
      last = now;
      raf = 0;

      const { w, h } = sizeRef.current;
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      // Right of the cursor; flip to the left near the edge; stay on screen.
      const right = state.px + GAP;
      const tx = clamp(right + w > vw - EDGE ? state.px - GAP - w : right, EDGE, vw - w - EDGE);
      const ty = clamp(state.py - h / 2, EDGE, vh - h - EDGE);
      if (!state.placed) {
        state.x = tx;
        state.y = ty;
        state.placed = true;
      }

      const follow = reduceMotion ? 1 : 1 - Math.exp(-dt / 90);
      const fadeRate = reduceMotion ? 1 : 1 - Math.exp(-dt / 60);
      state.x += (tx - state.x) * follow;
      state.y += (ty - state.y) * follow;
      state.fade += ((visible ? 1 : 0) - state.fade) * fadeRate;

      const scale = reduceMotion ? 1 : 0.97 + 0.03 * state.fade;
      el.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      el.style.opacity = state.fade.toFixed(3);
      el.style.visibility = 'visible';

      const moving = Math.abs(tx - state.x) > 0.1 || Math.abs(ty - state.y) > 0.1;
      const fading = Math.abs((visible ? 1 : 0) - state.fade) > 0.002;
      if (moving || fading) {
        raf = requestAnimationFrame(tick);
      } else if (!visible) {
        el.style.visibility = 'hidden';
        state.placed = false; // the next preview starts at the cursor
      }
    };

    const wake = () => {
      if (!raf && state.px >= 0) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    wakeRef.current = wake;

    const onPointerMove = (event) => {
      state.px = event.clientX;
      state.py = event.clientY;
      wake();
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    if (visible) wake();

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(raf);
      wakeRef.current = () => {};
    };
  }, [visible, reduceMotion]);

  return createPortal(
    <div
      ref={anchorRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-40 will-change-transform"
      style={{ width: w, height: h, opacity: 0, visibility: 'hidden' }}
    >
      <AnimatePresence initial={false}>
        {shown ? (
          <MotionDiv
            key={shown.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="absolute inset-0 m-auto overflow-hidden rounded-lg bg-surface-2 after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-fg/10"
            style={{ width: w, height: h, boxShadow: SHADOW }}
          >
            <img
              src={shown.imageUrl}
              alt=""
              width={w}
              height={h}
              decoding="async"
              className="size-full object-cover"
            />
          </MotionDiv>
        ) : null}
      </AnimatePresence>
    </div>,
    document.body
  );
}
