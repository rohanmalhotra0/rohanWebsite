/**
 * Run `task` once the browser is idle (and within `timeout` ms at the
 * latest), or after `fallback` ms where requestIdleCallback is missing
 * (Safari). Returns a function that cancels it. Does nothing on the server.
 */
export function whenIdle(task, { timeout = 2000, fallback = 200 } = {}) {
  if (typeof window === 'undefined') return () => {};
  if (window.requestIdleCallback) {
    const id = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, fallback);
  return () => window.clearTimeout(id);
}
