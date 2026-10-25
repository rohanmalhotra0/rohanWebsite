import SiteLayout from './components/layout/SiteLayout';
import ThemeProvider from './components/theme/ThemeProvider';
import RouterProvider from './lib/RouterProvider';
import { useRoute } from './lib/router';
import { loadedPage } from './routes';

/** The page for the current route; its code has loaded before it is shown. */
function CurrentPage() {
  const { route } = useRoute();
  const Page = loadedPage(route);
  const page = Page ? <Page /> : null;
  // The résumé brings its own toolbar instead of the site's navbar and footer.
  return route.chrome === false ? page : <SiteLayout route={route}>{page}</SiteLayout>;
}

/** `initialPath` is the page to render first: the URL in the browser, or the one being prerendered. */
export default function App({ initialPath }) {
  return (
    <ThemeProvider>
      <RouterProvider initialPath={initialPath}>
        <CurrentPage />
      </RouterProvider>
    </ThemeProvider>
  );
}
