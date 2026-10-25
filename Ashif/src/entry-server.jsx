import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import HomePage from './pages/HomePage';
import { definePage, findRoute, loadRoute, notFoundRoute, routes } from './routes';

export { notFoundRoute, routes };

// As in main.jsx, the home page is part of the entry, not a lazy chunk.
definePage('home', HomePage);

/** The markup for the page at `path`, with that page's code loaded first. */
export async function render(path) {
  await loadRoute(findRoute(path) ?? notFoundRoute);
  return renderToString(<App initialPath={path} />);
}
