import { ArrowUpRight } from 'lucide-react';
import Reveal from '@/components/primitives/Reveal';
import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import { TechList } from '@/components/primitives/Tag';
import { research } from '@/data/portfolioData';

export default function Research() {
  return (
    <Section id="research">
      <Container>
        <SectionHeader
          title="Research"
          description="These started as questions I wanted to test: whether sentiment helps explain returns, how prediction contracts can hedge income risk, and how Kelly sizing behaves under drawdowns."
        />

        <ul className="mt-12 border-t border-line sm:mt-16">
          {research.map((paper, index) => (
            <Paper key={paper.title} paper={paper} index={index} />
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function Paper({ paper, index }) {
  const titleId = `research-${index + 1}`;

  return (
    <Reveal as="li" delay={index * 0.05} className="border-b border-line">
      <article
        aria-labelledby={titleId}
        className="grid gap-6 py-10 sm:py-12 md:grid-cols-12 md:gap-8"
      >
        <div className="md:col-span-7">
          {paper.eyebrow ? <p className="text-sm leading-6 text-subtle">{paper.eyebrow}</p> : null}
          <h3
            id={titleId}
            className="type-heading mt-2 text-balance text-[1.625rem] leading-[1.15] text-fg"
          >
            {paper.title}
          </h3>
          <p className="mt-4 max-w-[62ch] text-pretty text-[15px] leading-7 text-muted sm:text-base">
            {paper.description}
          </p>
          <TechList items={paper.tags} className="mt-4" />
          {paper.liveUrl || paper.externalUrl ? (
            // 44px tap targets; the negative margin keeps the visual rhythm.
            <div className="-mb-3 mt-2 flex flex-wrap gap-x-6">
              {paper.liveUrl ? <PaperLink href={paper.liveUrl}>Read paper (PDF)</PaperLink> : null}
              {paper.externalUrl ? (
                <PaperLink href={paper.externalUrl}>Published record</PaperLink>
              ) : null}
            </div>
          ) : null}
        </div>

        {paper.imageUrl ? (
          <div className="order-first md:order-none md:col-span-5 md:mt-1.5 lg:col-span-4 lg:col-start-9">
            <Thumbnail paper={paper} />
          </div>
        ) : null}
      </article>
    </Reveal>
  );
}

function PaperLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="link inline-flex min-h-11 items-center gap-1 text-[15px] font-medium text-fg"
    >
      {children}
      <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-subtle" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/** The first page of the paper. A mouse shortcut to the PDF; the text link is the accessible one. */
function Thumbnail({ paper }) {
  const image = (
    <img
      src={paper.imageUrl}
      alt={paper.imageAlt ?? ''}
      width="600"
      height="400"
      loading="lazy"
      decoding="async"
      className="aspect-video w-full object-cover object-top transition-[filter] duration-200 md:aspect-[3/2] dark:brightness-[0.85] dark:group-hover/thumb:brightness-100"
    />
  );

  const frame = 'group/thumb block overflow-hidden rounded-lg border border-line bg-surface';

  if (!paper.liveUrl) return <div className={frame}>{image}</div>;

  return (
    <a
      href={paper.liveUrl}
      target="_blank"
      rel="noreferrer"
      tabIndex={-1}
      aria-hidden="true"
      className={`${frame} transition-colors duration-200 hover:border-line-strong`}
    >
      {image}
    </a>
  );
}
