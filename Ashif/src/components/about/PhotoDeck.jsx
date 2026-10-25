import { lazy, Suspense, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Expand } from 'lucide-react';
import Button from '@/components/primitives/Button';
import useMediaQuery from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { srcSetFor } from './images';

const MotionDiv = motion.div;

// Lazy, like the old gallery's viewer: mounted (closed) as the deck comes
// near, so the first open is instant. If it can't load, the deck still works.
const Lightbox = lazy(() => import('./Lightbox').catch(() => ({ default: () => null })));

// Each print keeps its own tilt and offset in the pile, like prints dropped
// on a desk. Fixed numbers, so the server and the browser draw the same pile.
const TILTS = [-4.5, 3.5, -2, 5, -3.5, 2.5, -5, 4];
const OFFSETS = [
  [-14, 6],
  [16, -4],
  [-8, 12],
  [12, 10],
  [-18, -6],
  [8, -10],
];

const SETTLE = { type: 'spring', visualDuration: 0.5, bounce: 0.18 };
const TOSS = { duration: 0.34, ease: [0.25, 0.6, 0.35, 1] };
const ENTER = { type: 'spring', visualDuration: 0.45, bounce: 0.12 };
const INSTANT = { duration: 0 };

// Finger travel (px) or flick speed (px/s) that throws the top print.
const TOSS_DISTANCE = 90;
const TOSS_SPEED = 550;
// Pause between steps when a thumbnail flips through several prints.
const RIFFLE_MS = 110;

/** Where photo `index` rests at `depth` (0 = on top). The top print sits almost straight. */
function restPose(index, depth) {
  const tilt = TILTS[index % TILTS.length];
  if (depth === 0) return { x: 0, y: 0, rotate: tilt * 0.25, scale: 1 };
  const [x, y] = OFFSETS[index % OFFSETS.length];
  return { x, y: y + depth * 3, rotate: tilt, scale: 1 - Math.min(depth, 4) * 0.02 };
}

/** A point just off the desk in direction (dx, dy), for a print on its way out or in. */
function offDesk(stage, dx, dy) {
  const width = stage?.offsetWidth ?? 800;
  const height = stage?.offsetHeight ?? 500;
  const length = Math.hypot(dx, dy) || 1;
  const reach = Math.max(width, height) * 0.85 + 120;
  return { x: (dx / length) * reach, y: (dy / length) * reach * 0.7 };
}

/**
 * The About photos as a loose pile of prints. Drag or flick the top print
 * away and it goes to the bottom of the pile; tap it to see it full screen.
 * The buttons, arrow keys, and thumbnails flip through the pile too.
 */
export default function PhotoDeck({ photos, className }) {
  const count = photos.length;
  const [top, setTop] = useState(0);
  // Prints in the air, by photo index: { kind: 'toss' | 'enter', x, y, rotate, id }.
  const [flights, setFlights] = useState({});
  const [view, setView] = useState(null);
  const [viewerWanted, setViewerWanted] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const finePointer = useMediaQuery('(pointer: fine)');
  const stageRef = useRef(null);
  const topButtonRef = useRef(null);
  const topRef = useRef(top);
  const flightsRef = useRef(flights);
  const riffleRef = useRef([]);
  const flightId = useRef(0);
  const focusTop = useRef(false);
  const captionId = useId();
  const current = photos[top];

  useLayoutEffect(() => {
    topRef.current = top;
    flightsRef.current = flights;
    // Back from full screen: focus returns to the print now on top.
    if (focusTop.current) {
      focusTop.current = false;
      topButtonRef.current?.focus({ preventScroll: true });
    }
  });

  const announce = (index) =>
    setAnnouncement(`Photo ${index + 1} of ${count}: ${photos[index].label}`);

  /** Throw the top print off the desk toward (dx, dy); the next one comes up. */
  const toss = useCallback(
    (dx, dy, spin) => {
      const leaving = topRef.current;
      const next = (leaving + 1) % count;
      if (!reduceMotion) {
        const { x, y } = offDesk(stageRef.current, dx, dy);
        const rotate = restPose(leaving, 0).rotate + (spin ?? (dx < 0 ? -16 : 16));
        flightId.current += 1;
        setFlights((all) => ({ ...all, [leaving]: { kind: 'toss', x, y, rotate, id: flightId.current } }));
      }
      topRef.current = next;
      setTop(next);
      return next;
    },
    [count, reduceMotion]
  );

  /** Bring the print at the bottom of the pile back onto the top, from the left. */
  const bringBack = useCallback(() => {
    const index = (topRef.current - 1 + count) % count;
    if (!reduceMotion) {
      // One still on its way out turns around from where it is.
      const inFlight = flightsRef.current[index]?.kind === 'toss';
      const { x, y } = offDesk(stageRef.current, -1, -0.3);
      flightId.current += 1;
      setFlights((all) => ({
        ...all,
        [index]: { kind: 'enter', from: inFlight ? null : { x, y, rotate: -18 }, id: flightId.current },
      }));
    }
    topRef.current = index;
    setTop(index);
    return index;
  }, [count, reduceMotion]);

  const stopRiffle = () => {
    riffleRef.current.forEach((timer) => window.clearTimeout(timer));
    riffleRef.current = [];
  };

  useEffect(() => stopRiffle, []);

  const step = (direction) => {
    stopRiffle();
    const index = direction > 0 ? toss(-1, -0.15) : bringBack();
    announce(index);
  };

  /** Flip through the pile to photo `target`, the short way round. */
  const showPhoto = (target) => {
    stopRiffle();
    const forward = (target - topRef.current + count) % count;
    if (!forward) return;
    const backward = count - forward;
    const steps = forward <= backward ? forward : backward;
    const move = forward <= backward ? () => toss(-1, -0.15) : bringBack;
    if (reduceMotion) {
      topRef.current = target;
      setTop(target);
    } else {
      move();
      for (let i = 1; i < steps; i += 1) riffleRef.current.push(window.setTimeout(move, i * RIFFLE_MS));
    }
    announce(target);
  };

  const landed = (index, id) =>
    setFlights((all) => {
      if (all[index]?.id !== id) return all;
      const rest = { ...all };
      delete rest[index];
      return rest;
    });

  // Mount the full-screen viewer (closed) once the deck is near, so the first open is instant.
  useEffect(() => {
    const stage = stageRef.current;
    if (viewerWanted || !stage || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setViewerWanted(true);
      },
      { rootMargin: '0px 0px 50% 0px' }
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, [viewerWanted]);

  const open = () => {
    stopRiffle();
    setViewerWanted(true);
    setView({ index: topRef.current, direction: 0 });
  };

  // Back from full screen: the pile shows whichever photo was last on screen.
  const closeViewer = (index) => {
    setView(null);
    setFlights({});
    topRef.current = index;
    setTop(index);
    focusTop.current = true;
  };

  const onKeyDown = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      step(event.key === 'ArrowRight' ? 1 : -1);
    }
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Photos"
      onKeyDown={onKeyDown}
      className={cn('grid gap-8 lg:grid-cols-12 lg:gap-8', className)}
    >
      <div
        ref={stageRef}
        className="relative isolate grid h-[26rem] place-items-center overflow-hidden rounded-xl border border-line bg-surface-2 [background-image:radial-gradient(var(--line-strong)_1px,transparent_1.2px)] [background-size:22px_22px] [container-type:size] sm:h-[30rem] lg:col-span-7 lg:h-[34rem]"
      >
        {photos.map((photo, index) => {
          const depth = (index - top + count) % count;
          return (
            <Print
              key={photo.id}
              ref={depth === 0 ? topButtonRef : undefined}
              photo={photo}
              index={index}
              depth={depth}
              count={count}
              flight={flights[index]}
              reduceMotion={reduceMotion}
              draggable={!reduceMotion}
              hoverLift={finePointer}
              describedBy={captionId}
              onToss={toss}
              onLanded={landed}
              onOpen={open}
              onPick={() => showPhoto(index)}
            />
          );
        })}

        {/* Bench labels, in the hero's HUD voice. */}
        <p
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 left-4 font-mono text-[11px] leading-4 text-subtle"
        >
          desk · {count} prints
        </p>
        <p
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-4 font-mono text-[11px] leading-4 text-subtle"
        >
          {reduceMotion ? 'tap to open' : (
            <>
              <span className="pointer-coarse:hidden">drag or click</span>
              <span className="hidden pointer-coarse:inline">swipe or tap</span>
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col lg:col-span-5 lg:justify-end">
        <div id={captionId} className="min-h-[7.5rem] sm:min-h-[8.5rem]">
          <p className="font-mono text-[13px] leading-5 text-subtle tabular-nums">
            {String(top + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </p>
          <h3 className="type-heading mt-2 text-[1.75rem] text-fg sm:text-[2.25rem]">{current.label}</h3>
          {current.caption ? (
            <p className="mt-3 max-w-sm text-pretty text-base leading-7 text-muted">{current.caption}</p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button variant="secondary" aria-label="Previous photo" onClick={() => step(-1)} className="w-11 px-0">
            <ArrowLeft aria-hidden="true" className="size-4" />
          </Button>
          <Button variant="secondary" aria-label="Next photo" onClick={() => step(1)} className="w-11 px-0">
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
          <Button
            variant="ghost"
            aria-haspopup="dialog"
            onClick={open}
            onPointerEnter={() => setViewerWanted(true)}
            className="text-fg"
          >
            <Expand aria-hidden="true" className="size-4" strokeWidth={1.75} />
            Full screen
          </Button>
        </div>

        <ul aria-label="All photos" className="mt-6 flex flex-wrap gap-2">
          {photos.map((photo, index) => (
            <li key={photo.id}>
              <button
                type="button"
                aria-label={`Show ${photo.label}`}
                aria-current={index === top ? 'true' : undefined}
                onClick={() => showPhoto(index)}
                className={cn(
                  'block size-12 overflow-hidden rounded-md bg-surface-2 ring-offset-2 ring-offset-bg transition-[box-shadow,opacity] duration-200 sm:size-14',
                  index === top ? 'ring-2 ring-mark' : 'opacity-70 ring-1 ring-line hover:opacity-100'
                )}
              >
                <img
                  src={photo.src}
                  srcSet={srcSetFor(photo)}
                  sizes="56px"
                  alt=""
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="size-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {viewerWanted ? (
        <Suspense fallback={null}>
          <Lightbox
            photos={photos}
            view={view}
            onNavigate={(direction) =>
              setView((shown) =>
                shown && { index: (shown.index + direction + count) % count, direction }
              )
            }
            onClose={closeViewer}
          />
        </Suspense>
      ) : null}
    </div>
  );
}

/**
 * One print. The one on top holds a button (it opens the photo full screen)
 * and can be dragged and thrown; the ones under it are scenery for screen
 * readers and keyboards, but a click on an edge that peeks out brings that
 * print up. The moving element is the same whatever the print's depth, so a
 * print animates smoothly from the top of the pile to the bottom and back.
 */
function Print({
  ref,
  photo,
  index,
  depth,
  count,
  flight,
  reduceMotion,
  draggable,
  hoverLift,
  describedBy,
  onToss,
  onLanded,
  onOpen,
  onPick,
}) {
  const dragged = useRef(false);
  const isTop = depth === 0;
  const rest = restPose(index, depth);

  let animate = rest;
  let transition = reduceMotion ? INSTANT : SETTLE;
  // Stacking follows the pile; a thrown print stays above it until it is off the desk.
  let zIndex = count - depth;
  if (flight?.kind === 'toss') {
    animate = { x: flight.x, y: flight.y, rotate: flight.rotate, scale: 1 };
    transition = TOSS;
    zIndex = count + 1;
  } else if (flight?.kind === 'enter') {
    transition = ENTER;
    if (flight.from) {
      animate = {
        x: [flight.from.x, rest.x],
        y: [flight.from.y, rest.y],
        rotate: [flight.from.rotate, rest.rotate],
        scale: 1,
      };
    }
  }

  const aspect = photo.width / photo.height;
  const image = (
    <img
      src={photo.src}
      srcSet={srcSetFor(photo)}
      sizes={`(min-width: 1024px) ${Math.round(Math.min(420 * aspect, 560))}px, ${Math.round(Math.min(78, 62 * aspect))}vw`}
      alt={isTop ? photo.alt : ''}
      width={photo.width}
      height={photo.height}
      loading="lazy"
      decoding="async"
      draggable={false}
      // As tall as the desk allows, and never wider than it.
      style={{ height: `min(70cqh, ${(76 / aspect).toFixed(2)}cqw)` }}
      className={cn(
        'pointer-events-none block w-auto max-w-none select-none rounded-[2px] bg-surface-2 transition-[filter] duration-700 ease-out',
        isTop ? 'dark:brightness-[0.92]' : 'grayscale contrast-[1.08]'
      )}
    />
  );

  // Prints under the pile are a duotone in the palette's two photo colors
  // (shadows in --duo-dark, highlights in --duo-light); the one on top
  // develops into full color as the tint fades.
  const tint = cn(
    'pointer-events-none absolute inset-0 rounded-[2px] transition-opacity duration-700 ease-out',
    isTop ? 'opacity-0' : 'opacity-100'
  );
  const print = (
    <span className="relative block">
      {image}
      <span aria-hidden="true" className={cn(tint, 'bg-[var(--duo-light)] mix-blend-multiply')} />
      <span aria-hidden="true" className={cn(tint, 'bg-[var(--duo-dark)] mix-blend-screen')} />
    </span>
  );

  return (
    <MotionDiv
      aria-hidden={isTop ? undefined : 'true'}
      onClick={isTop ? undefined : onPick}
      initial={false}
      animate={animate}
      transition={transition}
      onAnimationComplete={flight ? () => onLanded(index, flight.id) : undefined}
      style={{ zIndex }}
      drag={isTop && draggable}
      dragSnapToOrigin
      whileDrag={{ scale: 1.04 }}
      whileHover={isTop && hoverLift && draggable ? { scale: 1.015 } : undefined}
      onPointerDown={() => {
        dragged.current = false;
      }}
      onDragStart={() => {
        dragged.current = true;
      }}
      onDragEnd={(_, { offset, velocity }) => {
        const far = Math.hypot(offset.x, offset.y) > TOSS_DISTANCE;
        const fast = Math.hypot(velocity.x, velocity.y) > TOSS_SPEED;
        if (!far && !fast) return;
        const dx = offset.x + velocity.x * 0.15;
        const dy = offset.y + velocity.y * 0.15;
        onToss(dx, dy, Math.sign(dx || 1) * Math.min(28, 10 + Math.abs(velocity.x) / 120));
      }}
      className={cn(
        'col-start-1 row-start-1 rounded-[4px] bg-[#fbfaf7] p-2 sm:p-2.5 dark:bg-[#dedcd5]',
        isTop
          ? 'shadow-[0_2px_4px_rgb(0_0_0/0.08),0_18px_40px_-12px_rgb(0_0_0/0.35)]'
          : 'cursor-pointer shadow-[0_1px_2px_rgb(0_0_0/0.08),0_8px_20px_-10px_rgb(0_0_0/0.3)]',
        // Sideways swipes drag the print; vertical ones still scroll the page.
        isTop && draggable && 'cursor-grab touch-pan-y! active:cursor-grabbing'
      )}
    >
      {isTop ? (
        <button
          ref={ref}
          type="button"
          aria-haspopup="dialog"
          aria-describedby={describedBy}
          onClick={() => {
            // The click that ends a drag isn't a tap.
            if (dragged.current) return;
            onOpen();
          }}
          className={cn('block rounded-[2px] outline-offset-[6px]', !draggable && 'cursor-zoom-in')}
        >
          {print}
        </button>
      ) : (
        print
      )}
    </MotionDiv>
  );
}
