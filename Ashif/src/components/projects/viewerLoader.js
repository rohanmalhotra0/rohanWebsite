// The project viewer is code-split: its chunk loads when a reader is about to
// need it (the section comes near, a card or row is hovered or focused, or the
// URL names a project). One shared promise; a failed load can be retried.
let viewerModule = null;

export function loadViewer() {
  viewerModule ??= import('./ProjectViewer').catch((error) => {
    viewerModule = null;
    throw error;
  });
  return viewerModule;
}
