import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { projects } from '@/data/portfolioData';
import { featuredProjects, findProject, projectHash, slugFromHash } from './projectData';
import { findTrigger, revealCard, revealElement } from './viewerDom';

const stripHash = () => window.location.pathname + window.location.search;

/**
 * State for the project viewer, kept in sync with `#project/<slug>`.
 *
 * `viewer` is `{ list, index, origin, paired, fromHover, dir, step }` or null:
 * - list/index: the projects prev/next browse through, and the current one.
 * - origin: 'featured' (a featured card), 'archive' (a table row), or 'link'
 *   (opened from the URL). Only featured opens fly the image (`paired`).
 * `dialogOpen` stays true until the closing animation has finished.
 *
 * Opening from the page pushes a history entry, so Back closes the viewer.
 */
export function useProjectViewer() {
  const reduceMotion = useReducedMotion();
  const [viewer, setViewer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const viewerRef = useRef(null);
  const reduceRef = useRef(reduceMotion);
  const openerRef = useRef(null);
  const returnFocusRef = useRef(null);
  // We pushed the current #project entry, so closing should step back over it.
  const pushedRef = useRef(false);
  // scrollRestoration to put back once our history.back() has landed.
  const restoreRef = useRef(null);

  useLayoutEffect(() => {
    viewerRef.current = viewer;
    reduceRef.current = reduceMotion;
  });

  const open = useCallback((list, index, origin, { opener = null, fromHover = false } = {}) => {
    const project = list[index];
    if (!project) return;
    openerRef.current = opener;

    if (origin === 'link') {
      // Put the page where this project lives, behind the viewer, so closing lands there.
      if (project.featured) revealCard(project.slug);
      else revealElement(document.getElementById('projects-archive'));
    } else {
      window.history.pushState(window.history.state, '', projectHash(project.slug));
      pushedRef.current = true;
    }

    const paired = origin === 'featured' && !reduceRef.current;
    setViewer({ list, index, origin, paired, fromHover, dir: 1, step: 0 });
    setDialogOpen(true);
  }, []);

  const openLink = useCallback(
    (slug) => {
      const project = findProject(slug);
      const list = project.featured ? featuredProjects : projects;
      open(list, list.indexOf(project), 'link');
    },
    [open]
  );

  const goTo = useCallback((index, dir) => {
    const current = viewerRef.current;
    if (!current || index === current.index) return;
    window.history.replaceState(window.history.state, '', projectHash(current.list[index].slug));
    setViewer({ ...current, index, dir, step: current.step + 1 });
  }, []);

  const navigate = useCallback(
    (delta) => {
      const current = viewerRef.current;
      if (!current || current.list.length < 2) return;
      const count = current.list.length;
      goTo((current.index + delta + count) % count, delta > 0 ? 1 : -1);
    },
    [goTo]
  );

  /** `fromHistory`: the URL already moved on (Back button), so leave history alone. */
  const close = useCallback((fromHistory = false) => {
    const current = viewerRef.current;
    if (!current) return;
    const { slug, featured } = current.list[current.index];

    // Bring the card into view first so the image has somewhere visible to land.
    if (current.paired) revealCard(slug);
    returnFocusRef.current =
      current.origin === 'archive'
        ? openerRef.current
        : (findTrigger(featured ? 'card' : 'row', slug) ?? openerRef.current);

    if (!fromHistory) {
      if (pushedRef.current) {
        // Step back over our entry. Manual restoration stops the browser from
        // scrolling to where the page was when the entry was pushed.
        restoreRef.current = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';
        window.history.back();
      } else if (slugFromHash(window.location.hash)) {
        window.history.replaceState(window.history.state, '', stripHash());
      }
    }
    pushedRef.current = false;
    setViewer(null);
  }, []);

  const onExited = useCallback(() => setDialogOpen(false), []);

  // Open a project named in the URL on first load, before the first paint.
  useLayoutEffect(() => {
    const slug = slugFromHash(window.location.hash);
    if (slug) openLink(slug);
  }, [openLink]);

  useEffect(() => {
    const onHashChange = () => {
      if (restoreRef.current) {
        window.history.scrollRestoration = restoreRef.current;
        restoreRef.current = null;
      }
      const slug = slugFromHash(window.location.hash);
      const current = viewerRef.current;
      if (!slug) {
        if (current) close(true);
        return;
      }
      if (!current) {
        openLink(slug);
        return;
      }
      const index = current.list.findIndex((p) => p.slug === slug);
      if (index >= 0) goTo(index, index > current.index ? 1 : -1);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [close, goTo, openLink]);

  return { viewer, dialogOpen, open, navigate, close, onExited, returnFocusRef };
}
