import { ArrowRight } from 'lucide-react';
import EmailLine from '@/components/contact/EmailLine';
import Reveal from '@/components/primitives/Reveal';
import SuggestionList from '@/components/rohangpt/SuggestionList';
import { focusChat } from '@/lib/events';
import { routeById } from '@/routes';

const SUGGESTIONS_ID = 'home-chat-title';

function MoreLink({ href, children }) {
  return (
    <a href={href} className="group mt-6 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-fg">
      <span className="link group-hover:decoration-accent">{children}</span>
      <ArrowRight
        aria-hidden="true"
        strokeWidth={1.75}
        className="size-4 text-subtle transition-[translate,color] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-fg"
      />
    </a>
  );
}

/** The end of the home page: ask the chat something, or write to me. */
export default function HomeCta() {
  return (
    <section aria-label="Ask or get in touch" className="border-t border-line py-20 sm:py-28">
      <div className="container-page grid gap-16 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-6">
          <h2 id={SUGGESTIONS_ID} className="type-heading text-[2rem] text-fg sm:text-[2.75rem]">
            Ask about my work
          </h2>
          <p className="mt-4 max-w-md text-pretty text-base leading-7 text-muted">
            A chat that answers from my résumé and project notes. Pick a question to start.
          </p>
          <SuggestionList labelledBy={SUGGESTIONS_ID} onAsk={focusChat} className="mt-8" />
          <MoreLink href={routeById('chat').path}>Ask something else</MoreLink>
        </Reveal>

        <Reveal delay={0.06} className="lg:col-span-5 lg:col-start-8">
          <h2 className="type-heading text-[2rem] text-fg sm:text-[2.75rem]">Get in touch</h2>
          <p className="mt-4 max-w-md text-pretty text-base leading-7 text-muted">
            I’m interested in applied AI, robotics, quantitative systems, and developer tools. Send me a note if the
            work overlaps.
          </p>
          <EmailLine className="mt-8" />
          <MoreLink href={routeById('contact').path}>Send a message</MoreLink>
        </Reveal>
      </div>
    </section>
  );
}
