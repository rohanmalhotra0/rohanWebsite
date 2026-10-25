import { ArrowRight } from 'lucide-react';

/**
 * The end of a page: one big link on to the next page in reading order, with
 * that page's one-line description. Keeps a reader moving through the site
 * instead of hunting for the navbar.
 */
export default function NextPage({ route }) {
  return (
    <nav aria-label="Next page" className="border-t border-line">
      <a
        href={route.path}
        className="group container-page block py-16 outline-offset-[-3px] sm:py-24"
      >
        <span className="block text-sm text-subtle">Next</span>
        <span className="mt-3 flex items-center gap-[0.25em] type-display text-[clamp(2.75rem,8.5vw,6rem)] text-fg">
          <span className="underline decoration-transparent decoration-[0.06em] underline-offset-[0.14em] transition-[text-decoration-color] duration-200 group-hover:decoration-accent">
            {route.label}
          </span>
          <ArrowRight
            aria-hidden="true"
            strokeWidth={2.25}
            className="size-[0.62em] shrink-0 text-subtle transition-[translate,color] duration-300 ease-out-expo group-hover:translate-x-[0.12em] group-hover:text-accent-strong"
          />
        </span>
        <span className="mt-5 block max-w-xl text-pretty text-base leading-7 text-muted sm:text-[17px]">
          {route.description}
        </span>
      </a>
    </nav>
  );
}
