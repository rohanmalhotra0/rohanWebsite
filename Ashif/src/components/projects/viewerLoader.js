// The project viewer is code-split: its chunk loads when a reader is about to
// need it (the section comes near, a card or row is hovered or focused, or the
// URL names a project). One shared promise; a failed load can be retried.
let viewerModule = null;
let loadedModule = null;

export function loadViewer() {
  viewerModule ??= import('./ProjectViewer').then(
    (module) => {
      loadedModule = module;
      return module;
    },
    (error) => {
      viewerModule = null;
      throw error;
    }
  );
  return viewerModule;
}

// The factory for React.lazy. The viewer is rendered only after its code is
// in, so once loaded this hands lazy a thenable that settles at once: the first
// render reads the module instead of suspending, which would hold the reveal
// (and an open waiting on it) back by React's 300ms Suspense throttle.
export function lazyViewer() {
  return loadedModule ? { then: (resolve) => resolve(loadedModule) } : loadViewer();
}

// A deep link needs the viewer at once: start loading it alongside the page.
if (typeof window !== 'undefined' && /^#project\//.test(window.location.hash)) loadViewer();
