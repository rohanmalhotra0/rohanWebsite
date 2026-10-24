import { Github, Linkedin, MapPin } from 'lucide-react';
import Button from '@/components/primitives/Button';
import Reveal from '@/components/primitives/Reveal';
import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import { profile } from '@/data/portfolioData';
import PhotoDeck from './PhotoDeck';
import useNewYorkTime from './useNewYorkTime';

function NewYorkClock() {
  const { time, zone } = useNewYorkTime();

  return (
    <p className="flex min-h-11 items-center gap-2.5 text-sm text-muted">
      <MapPin aria-hidden="true" className="size-4 text-subtle" />
      <span>{profile.location}</span>
      <span aria-hidden="true" className="h-3.5 w-px bg-line-strong" />
      <span className="font-mono text-[13px] tabular-nums text-fg">
        <span className="sr-only">Local time </span>
        {time}
        <span className="ml-1.5 text-subtle">{zone}</span>
      </span>
    </p>
  );
}

export default function About() {
  return (
    // overflow-x-clip: thrown photo cards can fly past the viewport edge without causing scroll.
    <Section id="about" className="overflow-x-clip">
      <Container className="grid gap-x-16 gap-y-14 lg:grid-cols-12 lg:gap-y-10">
        <SectionHeader
          index="04"
          label="About"
          title={
            <>
              Hi, I&rsquo;m <em>Rohan</em>.
            </>
          }
          className="lg:col-span-7"
        />

        {/* Above the text on phones; a column of its own on the right from lg up. */}
        <Reveal
          delay={0.1}
          className="relative z-10 pb-2 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-center lg:pt-6"
        >
          <PhotoDeck />
        </Reveal>

        <div className="lg:col-span-7 lg:row-start-2">
          <Reveal>
            <p className="max-w-2xl text-pretty text-2xl font-medium leading-[1.4] tracking-[-0.025em] text-fg sm:text-[1.75rem]">
              I learn by building. If I get curious about prediction markets, I make a hedging
              model. If I want to understand computer vision, I train a robot to find a toy.
              This site is basically the trail of whatever I was trying to figure out next.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-muted sm:text-lg sm:leading-8">
              I&rsquo;m studying Computer Science and Mathematics at NYU Courant and finishing
              the degree in three years. Most of my work sits somewhere between finance,
              robotics, and software that people can actually use.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="card mt-10 max-w-xl p-5 sm:p-6">
            <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
              <span
                aria-hidden="true"
                className="size-1.5 animate-pulse-dot rounded-full bg-accent"
              />
              Now
            </p>
            <p className="mt-3 text-pretty text-[15px] leading-7 text-fg">
              Finishing my last year at NYU and trying not to turn every random idea into
              another side project.
            </p>
          </Reveal>

          <Reveal
            delay={0.18}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between lg:max-w-xl"
          >
            <NewYorkClock />
            <div className="flex gap-2">
              <Button href={profile.linkedin} variant="secondary">
                <Linkedin aria-hidden="true" className="size-4" />
                LinkedIn
              </Button>
              <Button href={profile.github} variant="secondary">
                <Github aria-hidden="true" className="size-4" />
                GitHub
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
