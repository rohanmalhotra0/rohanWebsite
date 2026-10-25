import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/primitives/Reveal';

/** A home-page section heading with a link to the page it previews. */
export default function TeaserHeader({ id, title, href, linkLabel }) {
  return (
    <Reveal className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <h2 id={id} className="type-heading text-[2rem] text-fg sm:text-[2.75rem]">
        {title}
      </h2>
      <a href={href} className="group -my-2 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-fg">
        <span className="link group-hover:decoration-accent">{linkLabel}</span>
        <ArrowRight
          aria-hidden="true"
          strokeWidth={1.75}
          className="size-4 text-subtle transition-[translate,color] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-fg"
        />
      </a>
    </Reveal>
  );
}
