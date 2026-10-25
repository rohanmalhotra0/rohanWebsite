import { useCallback, useEffect, useRef, useState } from 'react';
import { readPalette } from './palette';

/** WebGL 2 check on a throwaway canvas, so no renderer is built (or logs) without it. */
function supportsWebGL2() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

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
 * paint, mounts it into `hostRef` (the scene follows the theme attribute
 * itself) and disposes it on unmount.
 *
 * `mode` is 'auto' (run unless the user prefers reduced motion), 'paused'
 * (the device was too slow) or 'forced' (the user pressed "Run demo").
 */
export default function useRobotScene({ reducedMotion }) {
  const hostRef = useRef(null);
  const posterRef = useRef(null);
  const frameRef = useRef(null);
  const boxRef = useRef(null);
  const hudRef = useRef(null);
  const controlsRef = useRef(null);
  const sceneRef = useRef(null);
  const [webgl, setWebgl] = useState(null);
  const [mode, setMode] = useState('auto');
  const [generation, setGeneration] = useState(0);
  const [live, setLive] = useState(false);
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);
  const [mobile] = useState(
    () => window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
  );

  useEffect(() => {
    setWebgl(supportsWebGL2());
  }, []);

  const active = webgl === true && (mode === 'forced' || (mode === 'auto' && !reducedMotion));

  useEffect(() => {
    if (!active) return undefined;
    const controller = new AbortController();
    let scene = null;
    let retry = 0;

    whenSettled(posterRef.current, controller.signal)
      .then(() => import('./scene/createRobotScene.js'))
      .then(({ createRobotScene }) => {
        if (controller.signal.aborted || !hostRef.current) return;
        scene = createRobotScene({
          host: hostRef.current,
          overlay: { frame: frameRef, box: boxRef, hud: hudRef, controls: controlsRef },
          palette: readPalette(),
          mobile,
          forced: mode === 'forced',
          onReady: () => setLive(true),
          // A lost GPU context: show the poster, then rebuild on a fresh canvas.
          onLost: () => {
            setLive(false);
            retry = setTimeout(() => setGeneration((g) => g + 1), 1000);
          },
          onSlow: () => setMode('paused'),
          onAnnounce: setMessage,
          onInteract: () => setTouched(true),
        });
        if (!scene) setWebgl(false);
        sceneRef.current = scene;
      })
      .catch(() => {
        // Chunk failed to load: the poster stays, which is a fine fallback.
      });

    return () => {
      controller.abort();
      clearTimeout(retry);
      scene?.dispose();
      sceneRef.current = null;
      setLive(false);
    };
  }, [active, mode, mobile, generation]);

  const throwToy = useCallback(() => sceneRef.current?.throwRandom(), []);
  const runDemo = useCallback(() => setMode('forced'), []);

  return {
    hostRef,
    posterRef,
    frameRef,
    boxRef,
    hudRef,
    controlsRef,
    live,
    message,
    touched,
    throwToy,
    // Offer a manual start when the demo isn't running on its own.
    canRun: webgl === true && !active,
    runDemo,
  };
}
