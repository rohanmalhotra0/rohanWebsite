import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BLOCK_CLASS, routeNumber } from '@/routes';

/**
 * The end of a page: one big link on to the next page in reading order, in
 * that page's own color block, with its one-line description. A preview of
 * where you're going, and it keeps a reader moving through the site.
 */
export default function NextPage({ route }) {
  return (
    <nav aria-label="Next page" className="container-page py-16 sm:py-24">
      <a
        href={route.path}
        className={cn(
          'group grain mesh relative block overflow-hidden rounded-[1.75rem] px-6 py-10 outline-offset-4 sm:rounded-[2.25rem] sm:px-10 sm:py-14 lg:px-14 lg:py-16',
          BLOCK_CLASS[route.block] ?? 'block-a'
        )}
      >
        <span className="relative block font-mono text-xs uppercase tracking-[0.16em] text-on-block-muted sm:text-[13px]">
          Next · {routeNumber(route)}
        </span>
        <span className="relative mt-3 flex items-center gap-[0.25em] type-display text-[clamp(2.75rem,8.5vw,6.5rem)]">
          <span className="underline decoration-transparent decoration-[0.06em] underline-offset-[0.14em] transition-[text-decoration-color] duration-200 group-hover:decoration-current">
            {route.label}
          </span>
          <ArrowRight
            aria-hidden="true"
            strokeWidth={2.25}
            className="size-[0.62em] shrink-0 transition-transform duration-300 ease-out-expo group-hover:translate-x-[0.14em]"
          />
        </span>
        <span className="relative mt-5 block max-w-xl text-pretty text-base leading-7 text-on-block-muted sm:text-[17px]">
          {route.description}
        </span>
      </a>
    </nav>
  );
}
