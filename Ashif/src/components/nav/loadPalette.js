// The ⌘K palette (its UI, search index, and fuzzy matcher) is a separate
// chunk, so it costs nothing on first load. The navbar warms it when the page
// is idle or at the first sign of intent, and queues any open that arrives
// before it is ready.

let pending = null;

/** Import the palette chunk once. A failed load is forgotten, so the next call retries. */
export function loadPalette() {
  pending ??= import('./CommandPalette').catch((error) => {
    pending = null;
    throw error;
  });
  return pending;
}
