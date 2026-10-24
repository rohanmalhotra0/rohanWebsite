import { useCallback, useEffect } from 'react';
import { useMotionValue, useMotionValueEvent, useScroll, useSpring } from 'motion/react';

// The rail fills down to this line (fraction of viewport height). A node lights up
// over a short band once the line passes its centre.
const LINE = 0.62;
const NODE_BAND = 0.05;

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/**
 * A 0 → 1 motion value recomputed from `measure(rect, viewportHeight)` whenever
 * the window scrolls or resizes (and when `ref` itself resizes). Measuring the
 * element directly avoids useScroll's `target` mode, which expects a positioned
 * scroll container and warns about the static <html> element.
 */
function useViewportProgress(ref, measure) {
  const progress = useMotionValue(0);
  const { scrollY } = useScroll();

  const update = useCallback(() => {
    const el = ref.current;
    if (el) progress.set(clamp01(measure(el.getBoundingClientRect(), window.innerHeight)));
  }, [ref, measure, progress]);

  useMotionValueEvent(scrollY, 'change', update);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    const observer = new ResizeObserver(update);
    if (ref.current) observer.observe(ref.current);
    return () => {
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, [ref, update]);

  return progress;
}

const railMeasure = (rect, vh) => (vh * LINE - rect.top) / rect.height;
const nodeMeasure = (rect, vh) => (vh * LINE - rect.top - rect.height / 2) / (vh * NODE_BAND);

/** How far the timeline has scrolled past the viewport line (springed so it glides). */
export function useRailFill(ref) {
  const progress = useViewportProgress(ref, railMeasure);
  return useSpring(progress, { stiffness: 260, damping: 40, mass: 0.4 });
}

/** Opacity for a rail node's lit state: 0 → 1 as the viewport line reaches it. */
export function useNodeLit(ref) {
  return useViewportProgress(ref, nodeMeasure);
}
