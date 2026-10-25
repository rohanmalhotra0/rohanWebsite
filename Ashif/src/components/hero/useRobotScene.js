import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { readPalette } from './palette';

/**
 * Resolves once the poster has loaded (or failed, or 2.5 s passed) and the
 * browser has painted and gone idle, so three.js never competes with the
 * hero's first paint or its largest image.
 */
function whenSettled(img, signal) {
  return new Promise((resolve) => {
    const idle = () => {
      if (signal.aborted) return;
      if ('requestIdleCallback' in window) window.requestIdleCallback(resolve, { timeout: 1200 });
      else setTimeout(resolve, 150);
    };
    if (!img || img.complete) {
      requestAnimationFrame(() => requestAnimationFrame(idle));
      return;
    }
    const done = () => {
      clearTimeout(timer);
      img.removeEventListener('load', done);
      img.removeEventListener('error', done);
      idle();
    };
    const timer = setTimeout(done, 2500);
    img.addEventListener('load', done);
    img.addEventListener('error', done);
  });
}

/**
 * Owns the lazily loaded robot scene: loads the three.js chunk after first
 * paint, mounts it into `hostRef`, keeps its colours in sync with the theme
 * and disposes it on unmount.
 */
export default function useRobotScene({ enabled, theme }) {
  const hostRef = useRef(null);
  const posterRef = useRef(null);
  const frameRef = useRef(null);
  const boxRef = useRef(null);
  const labelRef = useRef(null);
  const hudRef = useRef(null);
  const controlsRef = useRef(null);
  const sceneRef = useRef(null);
  const [live, setLive] = useState(false);
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);
  const [mobile] = useState(
    () => window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
  );

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    let scene = null;

    whenSettled(posterRef.current, controller.signal)
      .then(() => import('./scene/createRobotScene.js'))
      .then(({ createRobotScene }) => {
        if (controller.signal.aborted || !hostRef.current) return;
        scene = createRobotScene({
          host: hostRef.current,
          overlay: { frame: frameRef, box: boxRef, label: labelRef, hud: hudRef, controls: controlsRef },
          palette: readPalette(),
          mobile,
          onReady: () => setLive(true),
          onLost: () => setLive(false),
          onAnnounce: setMessage,
          onInteract: () => setTouched(true),
        });
        sceneRef.current = scene;
      })
      .catch(() => {
        // Chunk failed to load: the poster stays, which is a fine fallback.
      });

    return () => {
      controller.abort();
      scene?.dispose();
      sceneRef.current = null;
      setLive(false);
    };
  }, [enabled, mobile]);

  // Layout effect so the canvas recolours in the same frame as the page
  // (the theme switch is a view transition).
  useLayoutEffect(() => {
    sceneRef.current?.setPalette(readPalette());
  }, [theme]);

  const throwToy = useCallback(() => sceneRef.current?.throwRandom(), []);

  return {
    hostRef,
    posterRef,
    frameRef,
    boxRef,
    labelRef,
    hudRef,
    controlsRef,
    live,
    message,
    touched,
    throwToy,
  };
}
