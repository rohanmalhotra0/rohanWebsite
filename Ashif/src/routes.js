// The site's pages. Each has its own URL and is prerendered into its own HTML
// file at build time (scripts/prerender.mjs). Each page's code is a separate
// chunk that loads when a visitor is about to need it (see lib/router.js),
// except the home page's, which is in the main chunk (see main.jsx).
import { caseStudyPath } from '@/components/projects/projectData';
import { projects } from '@/data/portfolioData';

// One lazy loader per file in ./pages, keyed by './pages/<Name>.jsx'. Not the
// home page: main.jsx and entry-server.jsx import it and hand it over with
// definePage. Importing it here would be a cycle, and its sections call
// routeById as they load.
const pageModules = import.meta.glob(['./pages/*.jsx', '!./pages/HomePage.jsx']);

/**
 * `page` names the component file in ./pages. `label` puts a route in the
 * navbar, footer, and command palette. `title` and `description` go into the
 * prerendered <head>, and `description` is also the teaser at the bottom of
 * the page before it. `block` picks the palette's color block (a, b or c)
 * for the page's header, and `tagline` is the small line above its title.
 */
export const routes = [
  {
    id: 'home',
    path: '/',
    page: 'HomePage',
    title: 'Rohan Malhotra',
    description:
      'Rohan Malhotra is an NYU Courant math and computer science student building applied AI, robotics, and quantitative systems. Past work includes IBM and Kalshi.',
  },
  {
    id: 'experience',
    path: '/experience/',
    page: 'ExperiencePage',
    label: 'Experience',
    block: 'a',
    tagline: 'Where I’ve worked',
    title: 'Experience — Rohan Malhotra',
    description:
      'Internships in robotics, quant development, machine learning, aerospace research, and data, plus my degree at NYU Courant.',
  },
  {
    id: 'projects',
    path: '/projects/',
    page: 'ProjectsPage',
    label: 'Projects',
    block: 'b',
    tagline: 'Things I’ve built',
    title: 'Projects — Rohan Malhotra',
    description: `${projects.length} projects, from internship work to small tools I built for myself.`,
  },
  {
    id: 'research',
    path: '/research/',
    page: 'ResearchPage',
    label: 'Research',
    block: 'c',
    tagline: 'What I’ve written',
    title: 'Research — Rohan Malhotra',
    description:
      'Papers on hedging income risk with prediction markets, Reddit sentiment in financial models, and Kelly-criterion capital allocation.',
  },
  {
    id: 'about',
    path: '/about/',
    page: 'AboutPage',
    label: 'About',
    block: 'a',
    tagline: 'Who I am',
    title: 'About — Rohan Malhotra',
    description:
      'Who I am outside the résumé, what I’m working on now, and photos from the Alps, a lake, and a basketball court.',
  },
  {
    id: 'chat',
    path: '/chat/',
    page: 'ChatPage',
    label: 'Chat',
    block: 'b',
    tagline: 'Ask me anything',
    title: 'Ask about my work — Rohan Malhotra',
    description:
      'Ask about my projects, internships, research, or anything on my résumé. The answers come from my own notes.',
  },
  {
    id: 'contact',
    path: '/contact/',
    page: 'ContactPage',
    label: 'Contact',
    block: 'c',
    tagline: 'Say hello',
    title: 'Contact — Rohan Malhotra',
    description:
      'I’m interested in applied AI, robotics, quantitative systems, and developer tools. Send me a note if the work overlaps.',
  },
  {
    id: 'resume',
    path: '/resume/',
    page: 'ResumePage',
    title: 'Résumé — Rohan Malhotra',
    description:
      'Rohan Malhotra’s one-page résumé: IBM, Kalshi, Aress Software, the Virginia Tech Hume Center, and NYU Courant.',
    // Its own toolbar instead of the site's navbar and footer.
    chrome: false,
  },
];

// A project with a case study gets a page of its own under /projects/
// (no `label`, so it isn't in the navbar; `parent` marks Projects instead).
// Its header is Projects' color block, with the role and dates as tagline.
const projectsBlock = routes.find((route) => route.id === 'projects').block;
for (const project of projects.filter((p) => p.caseStudy)) {
  routes.push({
    id: `case-${project.slug}`,
    path: caseStudyPath(project),
    page: 'CaseStudyPage',
    parent: 'projects',
    project: project.slug,
    block: projectsBlock,
    tagline: project.caseStudy.context,
    title: `${project.title} — Rohan Malhotra`,
    description: project.description,
  });
}

/** Shown for any other path (and written to 404.html for GitHub Pages). */
export const notFoundRoute = {
  id: 'not-found',
  path: null,
  page: 'NotFoundPage',
  block: 'b',
  tagline: 'Error 404',
  title: 'Page not found — Rohan Malhotra',
  description: 'There’s no page at this address.',
};

/** The pages in the navbar, footer, and palette, in reading order. */
export const navRoutes = routes.filter((route) => route.label);

export const routeById = (id) => routes.find((route) => route.id === id) ?? null;

/** "01" for the first page in the navbar, "02" for the next; null for others. */
export function routeNumber(route) {
  const index = navRoutes.indexOf(route);
  return index >= 0 ? String(index + 1).padStart(2, '0') : null;
}

/** The color-block utility for a route's `block`. */
export const BLOCK_CLASS = { a: 'block-a', b: 'block-b', c: 'block-c' };

/**
 * A page's link-preview card (og:image): public/og/<id>.jpg, drawn from the
 * page's block by `npm run og` (scripts/og). Pages without a block of their
 * own (home, résumé, 404) share the home page's.
 */
export function ogCard(route) {
  const project = route.project && projects.find((p) => p.slug === route.project);
  if (project) {
    return {
      id: route.id,
      alt: `${project.title}, a case study by Rohan Malhotra: the robot's camera view, the pink toy boxed at 0.91.`,
    };
  }
  if (route.label) return { id: route.id, alt: `${route.label}, Rohan Malhotra: ${route.tagline}. rohanm.org` };
  return { id: 'home', alt: 'Rohan Malhotra, rohanm.org: a yellow robot dog in a graphite lab.' };
}

/** The page that comes after `route` in reading order, for the link at its end. */
export function nextRoute(route) {
  const index = navRoutes.indexOf(route);
  return index >= 0 ? (navRoutes[index + 1] ?? null) : null;
}

/**
 * '/projects', '/projects/' and '/projects/index.html' are one page. Paths
 * that aren't pages (a PDF, an image) come back unchanged in shape, so they
 * never match a route.
 */
export function normalizePath(pathname) {
  let path = String(pathname || '/').replace(/\/index\.html$/, '/');
  if (!path.endsWith('/')) path += '/';
  return path.replace(/\/{2,}/g, '/');
}

const byPath = new Map(routes.map((route) => [route.path, route]));

/** The route for a pathname, or null when it isn't one of the site's pages. */
export const findRoute = (pathname) => byPath.get(normalizePath(pathname)) ?? null;

const loaded = new Map();
const loading = new Map();

/**
 * Load a route's page component once. Resolves to the component; a failed
 * load isn't kept, so the next attempt fetches again.
 */
export function loadRoute(route) {
  if (loaded.has(route.id)) return Promise.resolve(loaded.get(route.id));
  let promise = loading.get(route.id);
  if (!promise) {
    promise = pageModules[`./pages/${route.page}.jsx`]().then(
      (module) => {
        loaded.set(route.id, module.default);
        loading.delete(route.id);
        return module.default;
      },
      (error) => {
        loading.delete(route.id);
        throw error;
      }
    );
    loading.set(route.id, promise);
  }
  return promise;
}

/** Hand over a page component an entry imported directly (the home page). */
export function definePage(id, component) {
  loaded.set(id, component);
}

/** The route's page component if it has loaded, else null. */
export const loadedPage = (route) => loaded.get(route.id) ?? null;
