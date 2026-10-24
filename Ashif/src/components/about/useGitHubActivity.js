import { useEffect, useState } from 'react';
import { loadActivity, readCache } from './githubActivity';

/**
 * Latest public GitHub activity. Served from the session cache when fresh;
 * otherwise fetched once the enclosing section comes within a screen of the
 * viewport. Resolves to null (render nothing) on any failure.
 */
export default function useGitHubActivity(ref) {
  const [cached] = useState(readCache);
  const [fetched, setFetched] = useState(null);

  useEffect(() => {
    const element = ref.current;
    if (cached !== undefined || !element || !('IntersectionObserver' in window)) return;

    let active = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        loadActivity().then((value) => {
          if (active) setFetched(value);
        });
      },
      { rootMargin: '0px 0px 100% 0px' }
    );
    observer.observe(element.closest('section') ?? element);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [cached, ref]);

  return cached === undefined
    ? { activity: fetched, fromCache: false }
    : { activity: cached, fromCache: true };
}
