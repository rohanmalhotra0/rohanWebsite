import { ArrowUpRight } from 'lucide-react';
import Reveal from '@/components/primitives/Reveal';
import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import { photos, profile } from '@/data/portfolioData';
import { cn } from '@/lib/utils';
import { useNewYorkTime } from './clock';
import Gallery from './Gallery';
import GitHubActivity from './GitHubActivity';

const [portrait] = photos;

const bodyText = 'max-w-[62ch] text-pretty text-base leading-7 text-muted sm:text-[17px] sm:leading-[1.7]';

export default function About() {
  return (
    <Section id="about">
      <Container>
        {/* Phones: one column. md: lede across, then text beside the portrait.
            lg: a spread, the portrait running from the heading down beside the text. */}
        <div className="grid gap-y-10 md:grid-cols-12 md:gap-x-6 lg:grid-rows-[auto_auto_1fr] lg:gap-x-8">
          <SectionHeader title="About" className="md:col-span-12 lg:col-span-7 lg:row-start-1" />

          <Reveal
            as="p"
            className="text-pretty text-[1.375rem] font-[450] leading-[1.42] tracking-[-0.012em] text-fg sm:text-2xl md:col-span-11 md:row-start-2 lg:col-span-6 xl:text-[1.625rem]"
          >
            I learn by building. If I get curious about prediction markets, I make a hedging
            model. If I want to understand computer vision, I train a robot to find a toy. This
            site is basically the trail of whatever I was trying to figure out next.
          </Reveal>

          <Reveal
            delay={0.08}
            className="md:col-span-5 md:col-start-8 md:row-start-3 lg:row-span-3 lg:row-start-1"
          >
            <img
              src={portrait.src}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full rounded-lg bg-surface-2 object-cover object-[50%_20%] outline -outline-offset-1 outline-fg/10 md:aspect-[2/3]"
            />
            <MetaLine className="mt-4" />
          </Reveal>

          <Reveal
            delay={0.12}
            className="flex flex-col md:col-span-7 md:col-start-1 md:row-start-3 lg:col-span-6"
          >
            <p className={bodyText}>
              I’m studying Computer Science and Mathematics at NYU Courant and finishing the
              degree in three years. Most of my work sits somewhere between finance, robotics,
              and software that people can actually use.
            </p>
            <p className={cn(bodyText, 'mt-4')}>
              Right now I’m finishing my last year at NYU and trying not to turn every random
              idea into another side project.
            </p>
            {/* Sits at the bottom of the column, in space the portrait already takes up,
                so it can appear (or not) without moving anything. */}
            <GitHubActivity className="md:mt-auto" />
          </Reveal>
        </div>

        <Reveal className="mt-16 sm:mt-20 lg:mt-24">
          <Gallery />
        </Reveal>
      </Container>
    </Section>
  );
}

function MetaLine({ className }) {
  const { label, iso } = useNewYorkTime();

  return (
    <div
      className={cn(
        'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-[15px] leading-6',
        className
      )}
    >
      <p className="text-muted">
        {profile.location} · It’s{' '}
        <time dateTime={iso} className="tabular-nums">
          {label}
        </time>{' '}
        here
      </p>
      <p className="flex gap-x-5">
        <ExternalLink href={profile.linkedin}>LinkedIn</ExternalLink>
        <ExternalLink href={profile.github}>GitHub</ExternalLink>
      </p>
    </div>
  );
}

function ExternalLink({ href, children }) {
  return (
    // Padding cancelled by negative margin: a 44px tap target on a 24px line.
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="link -my-2.5 inline-flex items-center gap-1 py-2.5 font-medium text-fg"
    >
      {children}
      <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-subtle" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
