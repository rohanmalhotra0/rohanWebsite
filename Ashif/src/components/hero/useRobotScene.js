import { useCallback, useEffect, useRef, useState } from 'react';
import { readPalette } from './palette';
import { rendererName, SOFTWARE } from './webgl';

/** QA override for tools that render on software GL on purpose. */
function forceWebGL() {
  try {
    if (window.localStorage.getItem('rm-webgl') === 'force') return true;
  } catch {
    // Storage blocked: fall through to the URL flag.
  }
  return new URLSearchParams(window.location.search).get('webgl') === 'force';
}

function context(options) {
  try {
    return document.createElement('canvas').getContext('webgl2', options);
  } catch {
    return null;
  }
}

/**
 * Probe WebGL 2 on throwaway canvases, so no renderer is built (or logs)
 * without it: 'none', 'software' (no GPU: SwiftShader, llvmpipe, a basic
 * display driver) or 'gpu'. The main-thread fallback for probeInWorker.
 */
function probeWebGL() {
  const force = forceWebGL();
  const fast = context({ failIfMajorPerformanceCaveat: true });
  if (fast) {
    const software = SOFTWARE.test(rendererName(fast));
    fast.getExtension('WEBGL_lose_context')?.loseContext();
    return software && !force ? 'software' : 'gpu';
  }
  const slow = context();
  if (!slow) return 'none';
  slow.getExtension('WEBGL_lose_context')?.loseContext();
  return force ? 'gpu' : 'software';
}

/**
 * The same probe in a worker, so the GPU setup behind the first WebGL context
 * never blocks the page. Resolves to 'gpu' or 'software', or null when the
 * worker can't tell (no workers or OffscreenCanvas, no WebGL in workers, an
 * error, or no answer within 2 s).
 */
function probeInWorker() {
  if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    let worker = null;
    let timer = 0;
    const done = (result) => {
      window.clearTimeout(timer);
      worker?.terminate();
      resolve(result);
    };
    timer = window.setTimeout(() => done(null), 2000);
    try {
      worker = new Worker(new URL('./probe.worker.js', import.meta.url), { type: 'module' });
    } catch {
      done(null);
      return;
    }
    worker.onmessage = ({ data }) => done(data === 'gpu' || data === 'software' ? data : null);
    worker.onerror = () => done(null);
    worker.postMessage(null);
  });
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
 * (software rendering, or frames too slow) or 'forced' (the user pressed
 * "Run demo").
 */
export default function useRobotScene({ reducedMotion }) {
  const hostRef = useRef(null);
  const posterRef = useRef(null);
  const frameRef = useRef(null);
  const boxRef = useRef(null);
  const hudRef = useRef(null);
  const controlsRef = useRef(null);
  const handleRef = useRef(null);
  const sceneRef = useRef(null);
  const [webgl, setWebgl] = useState(null);
  const [mode, setMode] = useState('auto');
  const [generation, setGeneration] = useState(0);
  const [live, setLive] = useState(false);
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);
  // Only read inside the effect, so the server value never reaches the markup.
  const [mobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768)
  );

  useEffect(() => {
    let cancelled = false;
    // Probe when the page is idle, not inside the first render's effects: in
    // a worker when the browser can, else here.
    const run = async () => {
      const answer = await probeInWorker();
      if (cancelled) return;
      const gl = answer === 'software' && forceWebGL() ? 'gpu' : (answer ?? probeWebGL());
      setWebgl(gl !== 'none');
      // Without a GPU the scene would block the main thread for seconds:
      // keep the poster and let the visitor opt in.
      if (gl === 'software') setMode('paused');
    };
    let cancel;
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run, { timeout: 1500 });
      cancel = () => window.cancelIdleCallback(id);
    } else {
      const id = setTimeout(run, 200);
      cancel = () => clearTimeout(id);
    }
    return () => {
      cancelled = true;
      cancel();
    };
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
          overlay: { frame: frameRef, box: boxRef, hud: hudRef, controls: controlsRef, handle: handleRef },
          palette: readPalette(hostRef.current),
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
    handleRef,
    live,
    message,
    touched,
    throwToy,
    // Offer a manual start when the demo isn't running on its own.
    canRun: webgl === true && !active,
    runDemo,
  };
}
