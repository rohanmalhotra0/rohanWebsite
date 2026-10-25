import { useCallback, useSyncExternalStore } from 'react';

/** Live boolean for a CSS media query, e.g. useMediaQuery('(pointer: fine)'). */
export default function useMediaQuery(query) {
  // Stable per query, so React doesn't resubscribe on every render.
  const subscribe = useCallback(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
