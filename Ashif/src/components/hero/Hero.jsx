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
      <div className="container-page grid min-h-svh grid-cols-1 content-start pb-12 pt-20 sm:pt-24 lg:grid-cols-12 lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-8 lg:pb-10">
        <div className="relative z-10 lg:col-span-5 lg:row-start-2">
          <h1 className="type-display text-[clamp(3.25rem,8vw,7.5rem)] text-fg">{profile.name}</h1>
          <p className="mt-5 max-w-[34rem] text-pretty text-base leading-[1.65] text-muted sm:text-[17px] lg:mt-7">
            {profile.summary}
          </p>
        </div>

        <RobotStage className="mt-3 lg:col-span-7 lg:col-start-6 lg:row-span-4 lg:row-start-1 lg:mt-0 lg:self-center" />

        <div className="relative z-10 mt-5 lg:col-span-5 lg:row-start-3 lg:mt-9">
          <div className="flex flex-wrap gap-3">
            <Button href="#projects" size="lg">
              View projects
            </Button>
            <Button href="#/resume" variant="secondary" size="lg">
              Résumé
            </Button>
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-6 text-[15px]">
            {LINKS.map(({ label, href, external }) => (
              <li key={label}>
                <a
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                  className="link inline-flex min-h-11 items-center gap-1 text-fg"
                >
                  {label}
                  {external ? (
                    <span aria-hidden="true" className="text-subtle">
                      ↗
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-subtle lg:mt-8">
            {city} · Graduating {profile.graduation}
          </p>
        </div>
      </div>
    </section>
  );
}
