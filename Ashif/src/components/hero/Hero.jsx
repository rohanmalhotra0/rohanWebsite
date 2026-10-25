import { profile } from '@/data/portfolioData';
import Button from '@/components/primitives/Button';
import RobotStage from './RobotStage';

const city = profile.location.split(',')[0];

const LINKS = [
  { label: 'GitHub', href: profile.github, external: true },
  { label: 'LinkedIn', href: profile.linkedin, external: true },
  { label: 'Email', href: `mailto:${profile.email}` },
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-x-clip">
      {/* DOM order is name, actions, stage (reading and tab order); from lg the
          grid places the stage in the right-hand columns. */}
      <div className="container-page grid min-h-svh grid-cols-1 content-start pb-10 pt-[4.75rem] sm:pt-24 lg:grid-cols-12 lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-8 lg:pb-10">
        <div className="relative z-10 lg:col-span-5 lg:row-start-2 lg:[container-type:inline-size]">
          {/* "Malhotra" is ~5.22em wide in Hubot Sans: on phones size it to the
              gutters (with margin to spare). From lg it is sized off this
              column (100cqw) so it always runs 6rem past the column gap, onto
              the robot's stage. Where the stage is a lab panel (palettes.css),
              the letters over it switch to the panel's ink: the split sits one
              gap past this column, which is the panel's left edge. */}
          <h1
            tabIndex={-1}
            data-page-focus=""
            className="type-display text-[length:min(calc((100vw_-_2rem)/5.6),4.5rem)] text-fg outline-none lg:w-min lg:bg-[linear-gradient(90deg,var(--fg)_calc(100cqw+2rem),var(--lab-ink,var(--fg))_calc(100cqw+2rem))] lg:bg-clip-text lg:text-[length:calc((100cqw+8rem)/5.22)] lg:text-transparent forced-colors:bg-none forced-colors:text-[CanvasText]"
          >
            {profile.name}
          </h1>
          <p className="mt-5 max-w-[34rem] text-pretty text-base leading-[1.65] text-muted sm:text-[17px] lg:mt-7">
            {profile.intro}
          </p>
        </div>

        <div className="relative z-10 mt-6 lg:col-span-5 lg:row-start-3 lg:mt-9">
          <div className="flex flex-wrap gap-3">
            {/* In the palette's accent (palettes.css); Paper keeps its ink. */}
            <Button href="/projects/" size="lg" className="hero-cta">
              View projects
            </Button>
            <Button href="/resume/" variant="secondary" size="lg">
              Résumé
            </Button>
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-6 text-[15px]">
            {LINKS.map(({ label, href, external }) => (
              <li key={label}>
                <a
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                  className="group inline-flex min-h-11 items-center gap-1 text-fg"
                >
                  <span className="link group-hover:decoration-mark">{label}</span>
                  {external ? (
                    <span aria-hidden="true" className="text-subtle">
                      ↗
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-subtle lg:mt-8">
            {city} · Graduating {profile.graduation}
          </p>
        </div>

        {/* The palette's glow pooled behind the robot. Decorative. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] bg-[radial-gradient(50%_45%_at_58%_50%,color-mix(in_srgb,var(--glow-1)_26%,transparent),transparent_75%)] lg:block"
        />
        <RobotStage className="mt-8 lg:col-span-7 lg:col-start-6 lg:row-span-4 lg:row-start-1 lg:mt-0 lg:self-center" />
      </div>
    </section>
  );
}
