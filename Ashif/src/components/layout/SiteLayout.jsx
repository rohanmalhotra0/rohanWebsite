import Footer from '@/components/footer/Footer';
import Navbar from '@/components/nav/Navbar';
import { nextRoute } from '@/routes';
import NextPage from './NextPage';
import RouteProgress from './RouteProgress';

/** Navbar, the page, a link on to the next page, and the footer. */
export default function SiteLayout({ route, children }) {
  const next = nextRoute(route);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-ink"
      >
        Skip to main content
      </a>
      <RouteProgress />
      <Navbar route={route} />
      <main id="main-content">
        {children}
        {next ? <NextPage route={next} /> : null}
      </main>
      <Footer />
    </>
  );
}
