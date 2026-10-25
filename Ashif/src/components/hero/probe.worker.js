// The WebGL probe, off the main thread. The first WebGL context on a page
// makes the browser set up its GPU backend, and that blocks whichever thread
// asks: a few hundred ms without a GPU. Answers 'gpu' or 'software', or
// 'unknown' when this browser can't make a WebGL context in a worker (the
// page then probes on the main thread instead).
import { rendererName, SOFTWARE } from './webgl';

function context(options) {
  try {
    return new OffscreenCanvas(1, 1).getContext('webgl2', options);
  } catch {
    return null;
  }
}

self.onmessage = () => {
  if (typeof OffscreenCanvas === 'undefined') {
    self.postMessage('unknown');
    return;
  }
  const fast = context({ failIfMajorPerformanceCaveat: true });
  if (fast) {
    const software = SOFTWARE.test(rendererName(fast));
    fast.getExtension('WEBGL_lose_context')?.loseContext();
    self.postMessage(software ? 'software' : 'gpu');
    return;
  }
  const slow = context();
  if (slow) {
    slow.getExtension('WEBGL_lose_context')?.loseContext();
    self.postMessage('software');
    return;
  }
  self.postMessage('unknown');
};
