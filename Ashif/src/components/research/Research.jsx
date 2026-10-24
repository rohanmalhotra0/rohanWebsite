import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, FileText } from 'lucide-react';
import Button from '@/components/primitives/Button';
import Reveal from '@/components/primitives/Reveal';
import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import { Tag } from '@/components/primitives/Tag';
import { research } from '@/data/portfolioData';
import useTilt from './useTilt';

const EASE = [0.16, 1, 0.3, 1];
const MotionSpan = motion.span;
const pad = (n) => String(n).padStart(2, '0');

export default function Research() {
  return (
    <Section id="research">
      <Container>
        <SectionHeader
          index="03"
          label="Research"
          title={
            <>
              Questions I&rsquo;ve <em>tested</em>
            </>
          }
          description="These started as questions I wanted to test: whether sentiment helps explain returns, how prediction contracts can hedge income risk, and how Kelly sizing behaves under drawdowns."
        />

        {/* Table-of-contents column heads, desktop only. */}
        <div
          aria-hidden="true"
          className="mt-16 hidden grid-cols-12 gap-10 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle lg:grid"
        >
          <span className="col-span-2">No.</span>
          <span className="col-span-6">Paper</span>
          <span className="col-span-4">Figure</span>
        </div>

        <ol className="mt-12 border-b border-line lg:mt-0">
          {research.map((paper, index) => (
            <PaperRow key={paper.title} paper={paper} index={index} />
          ))}
        </ol>
      </Container>
    </Section>
  );
}

function PaperRow({ paper, index }) {
  const reduceMotion = useReducedMotion();
  const number = `R.${pad(index + 1)}`;
  const titleId = `research-${index + 1}-title`;
  const delay = index * 0.08;

  return (
    <Reveal as="li" delay={delay} amount={0.15} className="group relative">
      {/* Top rule draws in from the left as the row arrives. */}
      <MotionSpan
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left bg-line-strong"
        initial={reduceMotion ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      />

      <article
        aria-labelledby={titleId}
        className="grid gap-7 py-10 sm:py-12 md:grid-cols-12 md:gap-10 lg:py-14"
      >
        {/* Index column (desktop). On smaller screens the number sits in the eyebrow. */}
        <div className="hidden lg:col-span-2 lg:block">
          <p className="font-mono text-[15px] tabular-nums text-subtle">
            R.
            <span className="text-fg transition-colors duration-300 group-hover:text-accent-strong">
              {pad(index + 1)}
            </span>
          </p>
        </div>

        <div className="md:col-span-7 lg:col-span-6">
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
            <span className="tabular-nums text-accent-strong lg:hidden">{number}</span>
            <span aria-hidden="true" className="h-px w-6 bg-line-strong lg:hidden" />
            <span>{paper.eyebrow}</span>
          </p>

          <h3
            id={titleId}
            className="mt-4 text-balance text-[1.625rem] font-semibold leading-[1.12] tracking-[-0.035em] text-fg sm:text-3xl lg:text-[2.125rem]"
          >
            {paper.title}
          </h3>

          <p className="mt-4 max-w-xl text-pretty text-[15px] leading-7 text-muted sm:text-base">
            {paper.description}
          </p>

          {paper.tags?.length ? (
            <ul aria-label="Topics" className="mt-5 flex flex-wrap gap-2">
              {paper.tags.map((tag) => (
                <li key={tag}>
                  <Tag>{tag}</Tag>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <Button href={paper.liveUrl} external variant="secondary">
              <FileText aria-hidden="true" className="size-4" />
              Read paper
              <span className="sr-only">: {paper.title} (PDF, opens in a new tab)</span>
            </Button>
            {paper.externalUrl ? (
              <Button href={paper.externalUrl} variant="ghost" className="group/link">
                Published record
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                />
                <span className="sr-only">(opens in a new tab)</span>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="order-first md:order-none md:col-span-5 lg:col-span-4">
          <PaperFigure paper={paper} number={index + 1} />
        </div>
      </article>
    </Reveal>
  );
}

/** Thumbnail mounted like a printed figure plate, with a pointer-driven tilt. */
function PaperFigure({ paper, number }) {
  const { containerRef, targetRef } = useTilt();

  return (
    <div ref={containerRef} className="mx-auto max-w-md md:max-w-none">
      <figure
        ref={targetRef}
        className="relative rounded-xl border border-line bg-surface-2 p-2 shadow-[var(--shadow-card)] transition-shadow duration-300 will-change-transform group-hover:border-line-strong sm:p-2.5"
      >
        {/* Mouse convenience only; the "Read paper" button is the accessible link. */}
        <a
          href={paper.liveUrl}
          target="_blank"
          rel="noreferrer"
          tabIndex={-1}
          aria-hidden="true"
          className="block overflow-hidden rounded-md bg-white shadow-[0_1px_2px_rgb(0_0_0/0.12)] ring-1 ring-black/5"
        >
          <img
            src={paper.imageUrl}
            alt={paper.imageAlt}
            width="600"
            height="400"
            loading="lazy"
            decoding="async"
            className="aspect-[3/2] w-full object-cover object-top dark:brightness-[0.92]"
          />
        </a>

        <figcaption className="flex gap-2 px-1 pb-0.5 pt-2.5 font-mono text-[11px] leading-4 text-subtle">
          <span className="shrink-0 uppercase tracking-[0.16em] text-muted">Fig. {number}</span>
          <span aria-hidden="true">&mdash;</span>
          <span className="line-clamp-2">{paper.imageAlt}</span>
        </figcaption>

        {/* Sheen that follows the pointer; --glare is 0 at rest. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-xl opacity-[var(--glare,0)]"
          style={{
            background:
              'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgb(255 255 255 / 0.16), transparent 60%)',
          }}
        />
      </figure>
    </div>
  );
}
