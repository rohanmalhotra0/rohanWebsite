import { useCallback, useEffect, useRef, useState } from 'react';
import { readPalette } from './palette';

const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render driver|microsoft basic/i;

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

function rendererName(gl) {
  const name = gl.getParameter(gl.RENDERER) || '';
  // Chromium and Safari mask RENDERER; Firefox reports the real one (and
  // warns about the debug extension), so only ask the extension when masked.
  if (!/^webkit webgl$/i.test(name)) return name;
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  return (info && gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) || name;
}

/**
 * Probe WebGL 2 on throwaway canvases, so no renderer is built (or logs)
 * without it: 'none', 'software' (no GPU: SwiftShader, llvmpipe, a basic
 * display driver) or 'gpu'.
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
    const gl = probeWebGL();
    setWebgl(gl !== 'none');
    // Without a GPU the scene would block the main thread for seconds: keep
    // the poster and let the visitor opt in.
    if (gl === 'software') setMode('paused');
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
