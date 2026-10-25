import { useRoute } from '@/lib/router';

/**
 * A thin accent line along the top edge while a page's code is still
 * loading. It waits 150 ms before showing, so fast page changes (most of
 * them: pages are fetched ahead) never flash it.
 */
export default function RouteProgress() {
  const { pending } = useRoute();
  if (!pending) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 origin-left animate-[route-progress_2.4s_cubic-bezier(0.16,1,0.3,1)_150ms_both] bg-mark"
    />
  );
}
