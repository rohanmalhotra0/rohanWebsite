import { useRef } from 'react';

/**
 * Pointer handlers for dragging along a chart to set a value. A mouse or pen
 * sets it on press. A finger waits to see which way it moves: a vertical
 * swipe still scrolls the page (the chart is touch-action: pan-y), and only a
 * sideways drag or a tap sets the value. Only the primary button counts.
 */
export default function useScrub(toValue, onChange) {
  const drag = useRef(null);
  const end = () => {
    drag.current = null;
  };

  return {
    onPointerDown(event) {
      if (event.button !== 0 || !event.isPrimary) return;
      const touch = event.pointerType === 'touch';
      drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, live: !touch };
      if (!touch) {
        event.currentTarget.setPointerCapture(event.pointerId);
        onChange(toValue(event));
      }
    },
    onPointerMove(event) {
      const current = drag.current;
      if (!current || current.id !== event.pointerId) return;
      if (!current.live) {
        const dx = Math.abs(event.clientX - current.x);
        const dy = Math.abs(event.clientY - current.y);
        if (dx < 8 && dy < 8) return;
        // Mostly vertical: a scroll, so let it go.
        if (dy >= dx) {
          end();
          return;
        }
        current.live = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      onChange(toValue(event));
    },
    onPointerUp(event) {
      const current = drag.current;
      // A tap: the finger never moved far enough to pick a direction.
      if (current && current.id === event.pointerId && !current.live) onChange(toValue(event));
      end();
    },
    onPointerCancel: end,
    onLostPointerCapture: end,
  };
}
