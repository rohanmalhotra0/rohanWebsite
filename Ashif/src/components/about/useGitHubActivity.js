import { useEffect, useState } from 'react';
import { loadActivity, readCache } from './githubActivity';

/**
 * Latest public GitHub activity. Served from the session cache when fresh;
 * otherwise fetched once the enclosing section comes within a screen of the
 * viewport. `activity` is null on any failure; `settled` turns true once
 * there is an answer either way, so the caller can show a fallback.
 */
export default function useGitHubActivity(ref) {
  // undefined = not checked yet (the prerendered HTML and hydration render
  // match); the session cache is read once mounted.
  const [cached, setCached] = useState(undefined);
  const [checked, setChecked] = useState(false);
  const [fetched, setFetched] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setCached(readCache());
    setChecked(true);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!checked || cached !== undefined || !element || !('IntersectionObserver' in window)) return;

    let active = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        loadActivity().then((value) => {
          if (!active) return;
          setFetched(value);
          setDone(true);
        });
      },
      { rootMargin: '0px 0px 100% 0px' }
    );
    observer.observe(element.closest('section') ?? element);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [checked, cached, ref]);

  return cached === undefined
    ? { activity: fetched, fromCache: false, settled: done }
    : { activity: cached, fromCache: true, settled: true };
}
