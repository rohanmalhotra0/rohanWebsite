import { ArrowUp, ArrowUpRight } from 'lucide-react';
import useNewYorkTime from '@/components/about/useNewYorkTime';
import { profile, sections } from '@/data/portfolioData';

const elsewhere = [
  { label: 'GitHub', href: profile.github, external: true },
  { label: 'LinkedIn', href: profile.linkedin, external: true },
  { label: 'Email', href: `mailto:${profile.email}` },
  { label: 'Résumé', href: '#/resume' },
];

const linkClass =
  'group inline-flex min-h-11 items-center gap-3 text-sm text-muted transition-colors duration-200 hover:text-fg lg:min-h-9';

function ColumnTitle({ children }) {
  return (
    <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">{children}</h2>
  );
}

export default function Footer() {
  const { time, zone } = useNewYorkTime();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="container-page pt-16 sm:pt-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-5">
            <p className="text-lg font-semibold tracking-[-0.03em] text-fg">
              {profile.name}
              <span className="text-accent-strong">.</span>
            </p>
            <p className="mt-3 max-w-xs text-pretty text-sm leading-6 text-muted">
              Built by me with React, WebGL, and Tailwind. Set in Geist.
            </p>
            <p className="mt-6 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              New York
              <span className="tabular-nums tracking-normal text-fg">
                <span className="sr-only">local time </span>
                {time}
              </span>
              {zone}
            </p>
          </div>

          <nav aria-labelledby="footer-sections" className="lg:col-span-3 lg:col-start-6">
            <ColumnTitle>
              <span id="footer-sections">Sections</span>
            </ColumnTitle>
            <ul className="mt-4">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className={linkClass}>
                    <span className="w-5 font-mono text-[11px] tabular-nums text-subtle transition-colors group-hover:text-accent-strong">
                      {section.index}
                    </span>
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-elsewhere" className="lg:col-span-2">
            <ColumnTitle>
              <span id="footer-elsewhere">Elsewhere</span>
            </ColumnTitle>
            <ul className="mt-4">
              {elsewhere.map(({ label, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noreferrer' : undefined}
                    className={linkClass}
                  >
                    {label}
                    {external ? (
                      <>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="-ml-1.5 size-3.5 text-subtle transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                        <span className="sr-only">(opens in a new tab)</span>
                      </>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 flex lg:col-span-2 lg:col-start-11 lg:justify-end">
            <a
              href="#top"
              className="group inline-flex h-11 items-center gap-2 self-start rounded-full border border-line-strong px-4 text-sm font-medium text-fg transition-[background-color,transform] duration-200 ease-out hover:bg-surface-2 active:scale-[0.98]"
            >
              Back to top
              <ArrowUp
                aria-hidden="true"
                className="size-4 transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line py-6 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {profile.name}
          </p>
          <p>{profile.location}</p>
        </div>
      </div>

      {/* Giant wordmark, sized to the container width and cut off by the bottom of the page. */}
      <div aria-hidden="true" className="container-page pointer-events-none select-none @container">
        {/* 14.9cqw ≈ the size at which the name exactly fills the container in Geist. */}
        <p className="h-[0.74em] overflow-hidden whitespace-nowrap text-center text-[14.9cqw] font-semibold leading-[0.92] tracking-[-0.065em]">
          <span className="bg-[linear-gradient(180deg,color-mix(in_oklab,var(--fg)_85%,transparent)_10%,color-mix(in_oklab,var(--fg)_4%,transparent)_92%)] bg-clip-text text-transparent">
            {profile.name}
          </span>
        </p>
      </div>
    </footer>
  );
}
