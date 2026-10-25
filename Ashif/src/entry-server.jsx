import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import { findRoute, loadRoute, notFoundRoute, routes } from './routes';

export { notFoundRoute, routes };

/** The markup for the page at `path`, with that page's code loaded first. */
export async function render(path) {
  await loadRoute(findRoute(path) ?? notFoundRoute);
  return renderToString(<App initialPath={path} />);
}
