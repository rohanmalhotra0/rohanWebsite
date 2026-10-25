import { ArrowUpRight } from 'lucide-react';
import { profile } from '@/data/portfolioData';
import { cn } from '@/lib/utils';
import { navRoutes, routeById } from '@/routes';

const linkClass =
  'group inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-muted transition-colors duration-150 hover:text-fg';

// The build year (vite.config.js), so the prerendered HTML and the client agree.
const YEAR = import.meta.env.VITE_BUILD_YEAR;

const FOOTER_PAGES = [...navRoutes, { ...routeById('resume'), label: 'Résumé' }];

export default function Footer() {
  const year = YEAR;

  return (
    <footer className="border-t border-line">
      {/* Every page, so the end of any page leads anywhere. */}
      <nav aria-label="Site" className="container-page pt-4">
        <ul className="-ml-3 flex flex-wrap text-sm">
          {FOOTER_PAGES.map((page) => (
            <li key={page.id}>
              <a href={page.path} className={cn(linkClass, 'px-3')}>
                {page.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* One row on the page grid: the colophon link sits on the column-8 line used by every
          section above. On phones, © takes its own line and the two links share the next. */}
      <div className="container-page grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-8 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 text-[13px] leading-5 text-subtle md:grid-cols-12 md:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <p className="col-span-2 pb-1 text-muted md:col-span-7 md:pb-0">
          © {year} {profile.name}
        </p>
        <a
          href={profile.siteRepo}
          target="_blank"
          rel="noreferrer"
          className={cn(linkClass, 'justify-self-start md:col-span-3')}
        >
          Source for this site
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 text-subtle transition-[translate,color] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
          />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a href="#top" className={cn(linkClass, 'justify-self-end md:col-span-2')}>
          Back to top
        </a>
      </div>
    </footer>
  );
}
