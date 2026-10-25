import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import Button from '@/components/primitives/Button';
import { TechList } from '@/components/primitives/Tag';
import {
  EASE,
  FLIGHT,
  focalPoint,
  imageSize,
  mediaLayoutId,
  projectLinks,
  projectMeta,
} from './projectData';
import { lockScroll, preloadImage } from './viewerDom';

const MotionDiv = motion.div;
const MotionImg = motion.img;
const MotionArticle = motion.article;

// Floating panels are the one place the site uses a shadow.
const PANEL_SHADOW = '0 40px 100px -32px rgb(0 0 0 / 0.32), 0 16px 32px -16px rgb(0 0 0 / 0.16)';

const FADE_IN = { duration: 0.3, ease: EASE };
const FADE_OUT = { duration: 0.2, ease: EASE };

// `custom` is { first, dir, reduce }: the first slide rises with the panel;
// later slides come in from the side being browsed toward.
const MEDIA = {
  enter: ({ first, dir, reduce }) =>
    reduce ? { opacity: 0 } : first ? { opacity: 0, y: 12 } : { opacity: 0, x: dir * 32 },
  show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
};

const DETAILS = {
  enter: ({ first, dir, reduce }) =>
    reduce ? { opacity: 0 } : first ? { opacity: 0, y: 10 } : { opacity: 0, x: dir * 20 },
  show: ({ first, reduce }) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: reduce ? 0.2 : 0.4, ease: EASE, delay: first && !reduce ? 0.12 : 0.05 },
  }),
  exit: { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } },
};

/** Toolbar icon button; `shortcut` is the key that does the same thing. */
function IconButton({ label, shortcut, hint, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-keyshortcuts={shortcut}
      title={`${label} (${hint})`}
      className="inline-flex size-11 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-fg/[0.06] hover:text-fg"
    >
      {children}
    </button>
  );
}

/**
 * Featured covers keep their 16:10 crop so the flight from the card is a pure
 * move-and-scale. On the first slide of a featured open, the frame shares the
 * card's layoutId and Motion animates it out of the card.
 */
function ViewerMedia({ project, paired, first, fromHover, custom }) {
  const { width, height } = imageSize(project);

  if (project.featured) {
    const flying = paired && first;
    return (
      <MotionDiv
        layoutId={paired ? mediaLayoutId(project.slug) : undefined}
        // Fly as one solid image: the card hides instead of crossfading.
        layoutCrossfade={false}
        transition={FLIGHT}
        style={{ borderRadius: 8 }}
        custom={custom}
        variants={MEDIA}
        initial={flying ? false : 'enter'}
        animate="show"
        exit={paired ? undefined : 'exit'}
        className="relative aspect-[16/10] overflow-hidden bg-surface-2 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-fg/10"
      >
        <MotionImg
          src={project.imageUrl}
          alt={project.imageAlt || ''}
          width={width}
          height={height}
          draggable="false"
          // The card's image was zoomed on hover; settle it while it flies.
          initial={flying && fromHover ? { scale: 1.02 } : false}
          animate={{ scale: 1 }}
          transition={FLIGHT.layout}
          className="size-full object-cover"
          style={{ objectPosition: focalPoint(project) }}
        />
      </MotionDiv>
    );
  }

  // Other covers are screenshots of mixed sizes; some are tiny. Show each
  // whole, centered on a neutral field, and never larger than its pixels.
  return (
    <MotionDiv
      custom={custom}
      variants={MEDIA}
      initial="enter"
      animate="show"
      exit="exit"
      className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-lg bg-surface-2 p-5 sm:p-8"
    >
      <img
        src={project.imageUrl}
        alt={project.imageAlt || ''}
        width={width}
        height={height}
        decoding="async"
        draggable="false"
        className="h-auto max-h-full w-auto max-w-full rounded-md ring-1 ring-fg/10"
      />
    </MotionDiv>
  );
}

function Slide({ project, viewer, titleId, reduceMotion }) {
  const isPresent = useIsPresent();
  const first = viewer.step === 0;
  const custom = { first, dir: viewer.dir, reduce: reduceMotion };
  const links = projectLinks(project);

  return (
    <MotionArticle
      className="col-start-1 row-start-1 grid gap-6 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 sm:gap-8 sm:p-6 lg:grid-cols-12 lg:p-8"
    >
      {/* Above the details, so the flying image passes over the text. */}
      <div className="relative z-10 lg:col-span-7 xl:col-span-8">
        <ViewerMedia
          project={project}
          paired={viewer.paired}
          first={first}
          fromHover={viewer.fromHover}
          custom={custom}
        />
      </div>

      <div className="lg:relative lg:col-span-5 xl:col-span-4">
        <MotionDiv
          custom={custom}
          variants={DETAILS}
          initial="enter"
          animate="show"
          exit="exit"
          className="lg:absolute lg:inset-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-1"
        >
          <h2
            id={isPresent ? titleId : undefined}
            className="type-heading text-balance text-3xl leading-[1.05] text-fg sm:text-4xl"
          >
            {project.title}
          </h2>
          <p className="mt-3 text-sm text-subtle">{projectMeta(project)}</p>
          <p className="mt-6 max-w-prose text-pretty text-base leading-relaxed text-fg">
            {project.description}
          </p>
          {project.longDescription ? (
            <p className="mt-4 max-w-prose text-pretty text-base leading-relaxed text-muted">
              {project.longDescription}
            </p>
          ) : null}
          <TechList items={project.tags} className="mt-6" />
          {links.length ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {links.map((link) => (
                <Button
                  key={link.kind}
                  href={link.href}
                  variant={link.kind === 'live' ? 'primary' : 'secondary'}
                  size="lg"
                >
                  {link.label}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </Button>
              ))}
            </div>
          ) : null}
        </MotionDiv>
      </div>
    </MotionArticle>
  );
}

function ViewerContent({ viewer, titleId, dialogRef, reduceMotion, onNavigate, onClose }) {
  const { list, index, step } = viewer;
  const project = list[index];
  const count = list.length;
  const settle = reduceMotion || viewer.paired ? false : { y: 16 };

  // Each new project starts at the top (the dialog scrolls on small screens).
  useLayoutEffect(() => {
    if (step > 0) dialogRef.current?.scrollTo({ top: 0 });
  }, [step, dialogRef]);

  return (
    <>
      <MotionDiv
        aria-hidden="true"
        className="fixed inset-0 bg-bg/[0.97]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: FADE_IN }}
        exit={{ opacity: 0, transition: { duration: 0.25, ease: EASE } }}
      />

      {/* A click on the margin around the panel closes the viewer. */}
      <div
        className="relative flex min-h-full justify-center sm:items-center sm:p-6 lg:p-10"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <MotionDiv
          initial={settle}
          animate={{ y: 0, transition: { duration: 0.4, ease: EASE } }}
          exit={settle ? { y: 8, transition: FADE_OUT } : undefined}
          className="relative flex w-full flex-col sm:max-w-2xl lg:max-w-[84rem]"
        >
          <MotionDiv
            aria-hidden="true"
            className="absolute inset-0 bg-surface sm:rounded-xl sm:border sm:border-line"
            style={{ boxShadow: PANEL_SHADOW }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: FADE_IN }}
            exit={{ opacity: 0, transition: FADE_OUT }}
          />

          {/* Sticky so Close stays in reach while a long project scrolls on phones. */}
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: FADE_IN }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            className="sticky top-0 z-10 box-content flex h-14 shrink-0 items-center gap-4 border-b border-line bg-surface pl-4 pr-1.5 pt-[env(safe-area-inset-top)] sm:mx-px sm:mt-px sm:rounded-t-[11px] sm:pl-6 sm:pr-2"
          >
            <p className="text-sm tabular-nums text-subtle">
              {index + 1} of {count}
            </p>
            <div className="ml-auto flex items-center">
              {count > 1 ? (
                <>
                  <IconButton label="Previous project" shortcut="ArrowLeft" hint="←" onClick={() => onNavigate(-1)}>
                    <ArrowLeft aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
                  </IconButton>
                  <IconButton label="Next project" shortcut="ArrowRight" hint="→" onClick={() => onNavigate(1)}>
                    <ArrowRight aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
                  </IconButton>
                  <span aria-hidden="true" className="mx-1.5 h-5 w-px bg-line" />
                </>
              ) : null}
              <IconButton label="Close" shortcut="Escape" hint="Esc" onClick={() => onClose()}>
                <X aria-hidden="true" className="size-5" strokeWidth={1.75} />
              </IconButton>
            </div>
          </MotionDiv>

          <p className="sr-only" aria-live="polite">
            {step > 0 ? `${project.title}, ${index + 1} of ${count}` : ''}
          </p>

          {/* Slides share one grid cell, so the leaving and arriving slides
              overlap without either leaving the flow. No scroll container in
              here: one would clip the image mid-flight. */}
          <div className="grid">
            <AnimatePresence custom={viewer.dir} propagate>
              <Slide
                key={project.slug}
                project={project}
                viewer={viewer}
                titleId={titleId}
                reduceMotion={reduceMotion}
              />
            </AnimatePresence>
          </div>
        </MotionDiv>
      </div>
    </>
  );
}

/**
 * The project viewer: a native <dialog> opened with showModal(), which gives
 * focus trapping, Esc, and an inert page. A full-height sheet on phones, a
 * centered two-column panel on large screens. The dialog stays open until the
 * closing animation (including the flight back to the card) has finished.
 */
export default function ProjectViewer({ viewer, open, onNavigate, onClose, onExited, returnFocusRef }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const reduceMotion = useReducedMotion();

  // Opened in a layout effect so the dialog is on screen before Motion
  // measures the image it is about to fly in. The dialog itself takes focus,
  // so arrow keys scroll it and Tab starts at the toolbar.
  useLayoutEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    dialog.focus({ preventScroll: true });
    const unlock = lockScroll();
    return () => {
      unlock();
      if (dialog.open) dialog.close();
      const target = returnFocusRef.current;
      returnFocusRef.current = null;
      if (target?.isConnected) target.focus({ preventScroll: true });
    };
  }, [open, returnFocusRef]);

  // Warm the neighbors so prev/next never waits on the network.
  useEffect(() => {
    if (!viewer) return;
    const { list, index } = viewer;
    preloadImage(list[(index + 1) % list.length].imageUrl);
    preloadImage(list[(index - 1 + list.length) % list.length].imageUrl);
  }, [viewer]);

  const onKeyDown = (event) => {
    if (!viewer || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      onNavigate(event.key === 'ArrowRight' ? 1 : -1);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // Esc: run the animated close instead of the instant native one.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // The browser can still close it on its own (a repeated Esc); sync state.
      onClose={() => {
        if (viewer) onClose();
      }}
      onKeyDown={onKeyDown}
      tabIndex={-1}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 bg-transparent p-0 text-fg outline-none backdrop:bg-transparent"
    >
      <AnimatePresence onExitComplete={onExited}>
        {viewer ? (
          <ViewerContent
            key="viewer"
            viewer={viewer}
            titleId={titleId}
            dialogRef={dialogRef}
            reduceMotion={reduceMotion}
            onNavigate={onNavigate}
            onClose={onClose}
          />
        ) : null}
      </AnimatePresence>
    </dialog>
  );
}
