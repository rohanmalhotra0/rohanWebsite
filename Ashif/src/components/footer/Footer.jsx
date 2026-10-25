import { ArrowUpRight } from 'lucide-react';
import { profile, sections } from '@/data/portfolioData';

const ELSEWHERE = [
  { label: 'GitHub', href: profile.github, external: true },
  { label: 'LinkedIn', href: profile.linkedin, external: true },
  { label: 'Email', href: `mailto:${profile.email}` },
  { label: 'Résumé', href: '#/resume' },
];

// 44px rows for touch; a tighter list rhythm for a mouse or trackpad on wide screens.
const linkClass =
  'group inline-flex min-h-11 items-center gap-1 text-[15px] text-muted transition-colors duration-150 hover:text-fg md:pointer-fine:min-h-8 md:pointer-fine:text-sm';

const titleClass = 'text-[13px] font-medium text-subtle';

function FooterLink({ href, external, children }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className={linkClass}
    >
      {children}
      {external ? (
        <>
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 text-subtle transition-[translate,color] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
          />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      ) : null}
    </a>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="container-page">
        {/* Columns sit on the same 12-column grid as the sections above. */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 pb-12 pt-14 md:grid-cols-12 md:pb-16 md:pt-20">
          <div className="col-span-2 md:col-span-7">
            <p className="type-heading text-2xl text-fg">{profile.name}</p>
            <p className="mt-2.5 text-[15px] leading-6 text-muted">{profile.headline}</p>
          </div>

          <nav aria-labelledby="footer-sections" className="md:col-span-3">
            <h2 id="footer-sections" className={titleClass}>
              Sections
            </h2>
            <ul className="mt-2 md:pointer-fine:mt-3">
              {sections.map(({ id, label }) => (
                <li key={id}>
                  <FooterLink href={`#${id}`}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2">
            <h2 className={titleClass}>Elsewhere</h2>
            <ul className="mt-2 md:pointer-fine:mt-3">
              {ELSEWHERE.map(({ label, href, external }) => (
                <li key={label}>
                  <FooterLink href={href} external={external}>
                    {label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Same columns as above: "Back to top" lines up with the Elsewhere links.
            Every cell is placed explicitly; row-locked auto items would jump the queue. */}
        <div className="grid grid-cols-2 items-baseline gap-x-8 border-t border-line pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 text-[13px] leading-5 text-subtle md:grid-cols-12 md:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p className="col-start-1 row-start-1 text-muted md:col-span-7 md:col-start-1">
            © {year} {profile.name}
          </p>
          <p className="col-span-2 col-start-1 row-start-2 text-balance md:col-span-3 md:col-start-8 md:row-start-1">
            Built with React, three.js, and Tailwind.
          </p>
          <a
            href="#top"
            className="col-start-2 row-start-1 inline-flex min-h-11 items-center justify-self-start text-muted transition-colors duration-150 hover:text-fg md:col-span-2 md:col-start-11"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
