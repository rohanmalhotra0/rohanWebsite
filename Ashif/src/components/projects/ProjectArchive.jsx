import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown, Search, X } from 'lucide-react';
import Reveal from '@/components/primitives/Reveal';
import useMediaQuery from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import ArchivePreview from './ArchivePreview';
import CategoryFilter from './CategoryFilter';
import { ProjectLinkIcons } from './ProjectLinks';
import {
  ARCHIVE_ROWS,
  archiveCollapses,
  categoryOptions,
  EASE,
  matchesQuery,
  sentenceCase,
} from './projectData';
import { preloadImage } from './viewerDom';

const MotionDiv = motion.div;
const MotionButton = motion.button;

// One column template for the header, the rows, and the toggle:
// year | project | category (md+) | stack (lg+) | links.
const COLUMNS =
  'grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-x-3 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:gap-x-6 md:grid-cols-[4.5rem_minmax(0,1.5fr)_minmax(0,1fr)_auto] lg:grid-cols-[4.5rem_minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_auto]';

const LAYOUT = { layout: { duration: 0.4, ease: EASE } };

// Rows fade up on entry (staggered by `order`), fade out on exit. Rows hidden
// by "Show fewer" leave instantly so the page can stay anchored.
const ROW = {
  enter: { opacity: 0, y: 6 },
  show: (order) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE, delay: Math.min(order, 12) * 0.02 },
  }),
  exit: (change) => ({ opacity: 0, transition: { duration: change === 'collapse' ? 0 : 0.12 } }),
};

// `ref` comes from AnimatePresence's popLayout, which takes leaving rows out of
// the flow so the rows that stay can move up at once.
const ArchiveRow = memo(function ArchiveRow({
  ref,
  project,
  order,
  filterKey,
  reduceMotion,
  onOpen,
  onHover,
}) {
  const category = sentenceCase(project.category);

  return (
    <MotionDiv
      ref={ref}
      role="row"
      layout={reduceMotion ? false : 'position'}
      // Only re-measure when the filter changes, not when rows are added below.
      layoutDependency={filterKey}
      transition={LAYOUT}
      custom={order}
      variants={reduceMotion ? undefined : ROW}
      initial={reduceMotion ? false : 'enter'}
      animate="show"
      exit="exit"
      onPointerMove={(event) => {
        if (event.pointerType === 'mouse') onHover(project);
      }}
      className={cn(COLUMNS, 'group relative isolate min-h-16 border-b border-line py-2.5 sm:min-h-14')}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -inset-x-3 -z-10 rounded-lg bg-fg/[0.035] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      />
      <span role="cell" className="text-sm tabular-nums text-subtle">
        {project.year ?? (
          <>
            <span aria-hidden="true">&mdash;</span>
            <span className="sr-only">No year</span>
          </>
        )}
      </span>
      <span role="cell" className="min-w-0">
        {/* The button's ::after covers the row, so the whole row opens the viewer. */}
        <button
          type="button"
          aria-haspopup="dialog"
          data-project-trigger={`row:${project.slug}`}
          onClick={(event) => onOpen(project.slug, event.currentTarget)}
          className="max-w-full text-left text-[15px] font-medium text-fg decoration-fg/30 underline-offset-[0.2em] outline-none after:absolute after:inset-y-0 after:-inset-x-3 after:rounded-lg after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent group-hover:underline"
        >
          {project.title}
        </button>
        <span className="mt-0.5 block truncate text-[13px] text-subtle md:hidden">{category}</span>
      </span>
      <span role="cell" className="hidden truncate text-sm text-muted md:block">
        {category}
      </span>
      <span role="cell" className="hidden truncate text-[13px] text-subtle lg:block">
        {project.tags.join(' · ')}
      </span>
      <span role="cell">
        <ProjectLinkIcons project={project} />
      </span>
    </MotionDiv>
  );
});

/**
 * Every project as a filterable index: category filter, search, and a table
 * that shows 10 rows until expanded. Rows open the viewer; on desktop a small
 * cover follows the cursor over them.
 */
function ProjectArchive({ projects, onOpen }) {
  const bodyId = useId();
  const searchId = useId();
  const reduceMotion = useReducedMotion();
  const canPreview = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 768px)');

  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  // What caused the latest change to the rows: 'filter' | 'expand' | 'collapse'.
  const [change, setChange] = useState('filter');
  const [hovered, setHovered] = useState(null);

  const toggleRef = useRef(null);
  const anchorRef = useRef(null);
  const preloadedRef = useRef(false);

  const deferredQuery = useDeferredValue(query);
  const searched = useMemo(
    () => projects.filter((p) => matchesQuery(p, deferredQuery)),
    [projects, deferredQuery]
  );
  const options = useMemo(() => categoryOptions(projects, searched), [projects, searched]);
  const results = useMemo(
    () => (category === 'all' ? searched : searched.filter((p) => p.category === category)),
    [searched, category]
  );

  const collapsible = archiveCollapses(results.length);
  const rows = collapsible && !expanded ? results.slice(0, ARCHIVE_ROWS) : results;
  const filterKey = `${category}\n${deferredQuery.trim().toLowerCase()}`;
  const filtering = category !== 'all' || deferredQuery.trim() !== '';
  const staggerFrom = change === 'expand' ? ARCHIVE_ROWS : 0;

  const updateQuery = (value) => {
    setChange('filter');
    setQuery(value);
  };

  const updateCategory = (value) => {
    setChange('filter');
    setCategory(value);
  };

  const clearFilters = () => {
    setChange('filter');
    setQuery('');
    setCategory('all');
  };

  const toggleExpanded = () => {
    // Collapsing removes rows above the button: keep the button where it is.
    if (expanded) anchorRef.current = toggleRef.current?.getBoundingClientRect().top ?? null;
    setChange(expanded ? 'collapse' : 'expand');
    setExpanded((value) => !value);
  };

  useLayoutEffect(() => {
    const before = anchorRef.current;
    anchorRef.current = null;
    if (before == null || !toggleRef.current) return;
    const delta = toggleRef.current.getBoundingClientRect().top - before;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' });
  }, [expanded]);

  const openRow = useCallback(
    (slug, opener) => {
      setHovered(null);
      onOpen(results, results.findIndex((p) => p.slug === slug), { opener });
    },
    [results, onOpen]
  );

  // The preview belongs to the row under a still cursor; scrolling moves rows away.
  useEffect(() => {
    if (!hovered) return undefined;
    const hide = () => setHovered(null);
    window.addEventListener('scroll', hide, { passive: true });
    return () => window.removeEventListener('scroll', hide);
  }, [hovered]);

  // Warm every cover on the first hover so previews appear without a wait.
  const warmPreviews = () => {
    if (preloadedRef.current || !canPreview) return;
    preloadedRef.current = true;
    for (const p of projects) preloadImage(p.imageUrl);
  };

  return (
    <div id="projects-archive" className="mt-24 scroll-mt-24 border-t border-line pt-12 sm:mt-32 sm:pt-16">
      <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8">
        <h3 className="type-heading text-[1.75rem] text-fg sm:text-3xl">All projects</h3>
        <div className="relative w-full md:w-72">
          <label htmlFor={searchId} className="sr-only">
            Search projects
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle"
            strokeWidth={1.75}
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && query) {
                event.preventDefault();
                event.stopPropagation();
                updateQuery('');
              }
            }}
            placeholder="Search projects"
            autoComplete="off"
            spellCheck="false"
            enterKeyHint="search"
            className="h-11 w-full rounded-lg border border-line bg-surface pl-10 pr-11 text-base text-fg transition-colors duration-150 placeholder:text-subtle hover:border-line-strong focus:border-line-strong sm:h-10 sm:text-sm [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => updateQuery('')}
              aria-label="Clear search"
              className="absolute right-0.5 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-subtle transition-colors hover:text-fg sm:size-9"
            >
              <X aria-hidden="true" className="size-4" strokeWidth={1.75} />
            </button>
          ) : null}
        </div>
      </Reveal>

      <Reveal className="mt-6">
        <CategoryFilter options={options} value={category} onChange={updateCategory} />
      </Reveal>

      <Reveal className="mt-8">
        <p className="sr-only" aria-live="polite">
          {filtering ? `${results.length} ${results.length === 1 ? 'project' : 'projects'}` : ''}
        </p>

        <div role="table" aria-label="All projects">
          <div role="rowgroup">
            <div
              role="row"
              className={cn(COLUMNS, 'border-b border-line-strong pb-3 text-[13px] text-subtle')}
            >
              <span role="columnheader">Year</span>
              <span role="columnheader">Project</span>
              <span role="columnheader" className="hidden md:block">
                Category
              </span>
              <span role="columnheader" className="hidden lg:block">
                Stack
              </span>
              <span role="columnheader" className="w-[5.5rem] sm:w-20">
                <span className="sr-only">Links</span>
              </span>
            </div>
          </div>

          <div
            role="rowgroup"
            id={bodyId}
            className="relative"
            onPointerEnter={warmPreviews}
            onPointerLeave={() => setHovered(null)}
          >
            <AnimatePresence initial={false} mode="popLayout" custom={change}>
              {rows.map((project, i) => (
                <ArchiveRow
                  key={project.slug}
                  project={project}
                  order={i - staggerFrom}
                  filterKey={filterKey}
                  reduceMotion={reduceMotion}
                  onOpen={openRow}
                  onHover={setHovered}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="border-b border-line py-14 sm:pl-[calc(4.5rem+1.5rem)]">
            <p className="text-pretty text-[15px] text-muted">
              No projects match &ldquo;<span className="text-fg">{deferredQuery.trim()}</span>&rdquo;
              {category !== 'all' ? ' in this category' : ''}.
            </p>
            <button type="button" onClick={clearFilters} className="link mt-3 text-sm text-fg">
              Clear filters
            </button>
          </div>
        ) : null}

        {collapsible ? (
          <MotionButton
            ref={toggleRef}
            type="button"
            layout={reduceMotion ? false : 'position'}
            layoutDependency={filterKey}
            transition={LAYOUT}
            aria-expanded={expanded}
            aria-controls={bodyId}
            onClick={toggleExpanded}
            className={cn(
              COLUMNS,
              'group relative isolate min-h-14 w-full border-b border-line text-left text-sm text-muted transition-colors duration-150 hover:text-fg'
            )}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -inset-x-3 -z-10 rounded-lg bg-fg/[0.035] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            />
            <span aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5">
              {expanded ? 'Show fewer' : `Show all ${results.length}`}
              <ChevronDown
                aria-hidden="true"
                strokeWidth={1.75}
                className={cn('size-4 transition-transform duration-300', expanded && 'rotate-180')}
              />
            </span>
          </MotionButton>
        ) : null}
      </Reveal>

      {canPreview ? <ArchivePreview project={hovered} /> : null}
    </div>
  );
}

export default memo(ProjectArchive);
