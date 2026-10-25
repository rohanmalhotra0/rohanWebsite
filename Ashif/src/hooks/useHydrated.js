import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False in the server render and while React hydrates it, true from then on.
 * For markup that should change once JavaScript runs (a plain link that
 * becomes a button) without a hydration mismatch.
 */
export default function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
