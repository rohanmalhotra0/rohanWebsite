import { ArrowRight } from 'lucide-react';
import { Container, PageHeader } from '@/components/primitives/Section';
import { navRoutes, notFoundRoute } from '@/routes';

/** Any address that isn't a page: say so, and offer every page that is. */
export default function NotFoundPage() {
  return (
    <>
      <PageHeader
        route={notFoundRoute}
        title="Page not found"
        description="There’s no page at this address. It may have moved when the site was split into pages."
      />
      <Container className="pb-24 pt-12 sm:pb-32 sm:pt-16">
        <ul className="border-t border-line">
          {[{ id: 'home', path: '/', label: 'Home' }, ...navRoutes].map((page) => (
            <li key={page.id} className="border-b border-line">
              <a
                href={page.path}
                className="group flex min-h-14 items-center justify-between gap-4 text-[17px] font-medium text-fg"
              >
                <span className="link group-hover:decoration-mark">{page.label}</span>
                <ArrowRight
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className="size-4 text-subtle transition-[translate,color] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-fg"
                />
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
