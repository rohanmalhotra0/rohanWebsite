import { ArrowRight } from 'lucide-react';
import EmailLine from '@/components/contact/EmailLine';
import Reveal from '@/components/primitives/Reveal';
import SuggestionList from '@/components/rohangpt/SuggestionList';
import { focusChat } from '@/lib/events';
import { routeById } from '@/routes';

const SUGGESTIONS_ID = 'home-chat-title';

function MoreLink({ href, children }) {
  return (
    <a href={href} className="group relative mt-6 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-fg">
      <span className="link group-hover:decoration-mark">{children}</span>
      <ArrowRight
        aria-hidden="true"
        strokeWidth={1.75}
        className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
      />
    </a>
  );
}

/**
 * The end of the home page, as two color blocks: ask the chat something, or
 * write to me. The components inside take each block's ink (index.css).
 */
export default function HomeCta() {
  return (
    <section aria-label="Ask or get in touch" className="container-page grid gap-4 pb-20 pt-20 sm:pb-28 sm:pt-28 lg:grid-cols-12 lg:gap-5">
      <Reveal className="block-b grain mesh relative overflow-hidden rounded-[1.75rem] px-6 py-10 sm:rounded-[2.25rem] sm:px-10 sm:py-12 lg:col-span-7">
        <h2 id={SUGGESTIONS_ID} className="relative type-heading text-[2rem] sm:text-[2.75rem]">
          Ask about my work
        </h2>
        <p className="relative mt-4 max-w-md text-pretty text-base leading-7 text-muted">
          A chat that answers from my résumé and project notes. Pick a question to start.
        </p>
        <SuggestionList labelledBy={SUGGESTIONS_ID} onAsk={focusChat} className="relative mt-8" />
        <MoreLink href={routeById('chat').path}>Ask something else</MoreLink>
      </Reveal>

      <Reveal
        delay={0.06}
        className="block-c grain mesh relative flex flex-col overflow-hidden rounded-[1.75rem] px-6 py-10 sm:rounded-[2.25rem] sm:px-10 sm:py-12 lg:col-span-5"
      >
        <h2 className="relative type-heading text-[2rem] sm:text-[2.75rem]">Get in touch</h2>
        <p className="relative mt-4 max-w-md text-pretty text-base leading-7 text-muted">
          I’m interested in applied AI, robotics, quantitative systems, and developer tools. Send me a note if the
          work overlaps.
        </p>
        <EmailLine className="relative mt-8 lg:mt-auto lg:pt-10" />
        <MoreLink href={routeById('contact').path}>Send a message</MoreLink>
      </Reveal>
    </section>
  );
}
