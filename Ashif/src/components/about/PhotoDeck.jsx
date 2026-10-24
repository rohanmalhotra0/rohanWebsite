import { useRef, useState } from 'react';
import {
  animate,
  motion,
  motionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { photos } from '@/data/portfolioData';
import useMediaQuery from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

// Fixed "random" tilt per photo: the pile looks hand-dropped but stays stable between renders.
const TILTS = [-3.5, 5, -6.5, 3.5, -4.5, 6];
// Small sideways nudge per photo so the pile isn't perfectly centered.
const NUDGES = [-4, 10, -12, 6, -8, 12];
const VISIBLE_CARDS = 4; // cards drawn in the pile; the rest wait (invisible) at the back
const THROW_DISTANCE = 90; // px of drag past which a release sends the card away
const THROW_VELOCITY = 500; // px/s flick that does the same
const STACK_SPRING = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 };
const RETURN_SPRING = { type: 'spring', stiffness: 220, damping: 28 };
const THROW_TWEEN = { duration: 0.24, ease: [0.33, 1, 0.68, 1] };
const INSTANT = { duration: 0 };

const pad = (n) => String(n).padStart(2, '0');

const MotionDiv = motion.div;
const MotionFigure = motion.figure;

function DeckCard({ photo, index, position, total, x, reduceMotion, onDragEnd }) {
  const isTop = position === 0;
  const hidden = position >= VISIBLE_CARDS;
  const baseTilt = TILTS[index % TILTS.length];
  const nudge = NUDGES[index % NUDGES.length];
  // Extra tilt while the card is being dragged or thrown, like it pivots in your fingers.
  const dragTilt = useTransform(x, [-320, 0, 320], [-12, 0, 12]);

  return (
    <MotionDiv
      aria-hidden={!isTop}
      className="absolute inset-0"
      style={{ zIndex: total - position }}
      initial={false}
      animate={{
        // The top card straightens up so its photo reads; the pile underneath fans out.
        rotate: isTop ? baseTilt * 0.3 : baseTilt,
        x: isTop ? 0 : nudge,
        y: position * 10,
        scale: 1 - position * 0.025,
        opacity: hidden ? 0 : 1,
      }}
      transition={reduceMotion ? INSTANT : STACK_SPRING}
    >
      <MotionFigure
        drag={isTop ? 'x' : false}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        whileTap={isTop && !reduceMotion ? { scale: 1.015 } : undefined}
        style={{ x, rotate: dragTilt }}
        className={cn(
          'flex size-full select-none flex-col rounded-2xl border border-line-strong bg-surface-2 p-2.5 light:border-line light:bg-surface',
          'shadow-[0_1px_0_0_rgb(255_255_255/0.06)_inset,0_28px_56px_-28px_rgb(0_0_0/0.9),0_10px_24px_-14px_rgb(0_0_0/0.6)]',
          'light:shadow-[0_1px_2px_rgb(10_10_12/0.06),0_28px_56px_-30px_rgb(10_10_12/0.35),0_10px_24px_-16px_rgb(10_10_12/0.18)]',
          isTop && 'cursor-grab active:cursor-grabbing'
        )}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-bg after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-fg/10">
          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="size-full object-cover"
          />
        </div>
        <figcaption className="flex flex-1 items-start justify-between gap-4 px-1.5 pb-1 pt-3.5">
          <span className="min-w-0">
            <span className="block text-[15px] font-medium tracking-[-0.01em] text-fg">
              {photo.label}
            </span>
            {photo.caption ? (
              <span className="mt-1 line-clamp-2 block text-[13px] leading-5 text-muted">
                {photo.caption}
              </span>
            ) : null}
          </span>
          <span className="pt-1 font-mono text-[11px] tabular-nums text-subtle">
            {pad(index + 1)}
          </span>
        </figcaption>
      </MotionFigure>
    </MotionDiv>
  );
}

/**
 * A pile of photo cards. Drag/swipe the top card away (or use the buttons / arrow keys)
 * and it tucks in at the back of the pile.
 */
export default function PhotoDeck({ className }) {
  const reduceMotion = useReducedMotion();
  const isTouch = useMediaQuery('(pointer: coarse)');
  const [order, setOrder] = useState(() => photos.map((_, i) => i));
  // One x motion value per photo, so any card can be thrown imperatively.
  const [xs] = useState(() => photos.map(() => motionValue(0)));
  const busy = useRef(false);
  const deckRef = useRef(null);

  const total = photos.length;
  const current = photos[order[0]];
  const throwDistance = () => (deckRef.current?.offsetWidth ?? 320) * 0.85;

  // Top card flies off to one side, then slides back in behind the pile.
  async function next(direction = 1, velocity = 0) {
    if (busy.current) return;
    busy.current = true;
    const id = order[0];
    if (reduceMotion) {
      xs[id].jump(0);
    } else {
      await animate(xs[id], direction * throwDistance(), { ...THROW_TWEEN, velocity });
    }
    setOrder((prev) => [...prev.slice(1), prev[0]]);
    busy.current = false;
    animate(xs[id], 0, reduceMotion ? INSTANT : RETURN_SPRING);
  }

  // The bottom card comes out from the left and lands on top.
  async function previous() {
    if (busy.current) return;
    busy.current = true;
    const id = order[total - 1];
    const backIsVisible = total - 1 < VISIBLE_CARDS;
    if (reduceMotion || !backIsVisible) {
      xs[id].jump(reduceMotion ? 0 : -throwDistance());
    } else {
      await animate(xs[id], -throwDistance(), THROW_TWEEN);
    }
    setOrder((prev) => [prev[prev.length - 1], ...prev.slice(0, -1)]);
    busy.current = false;
    animate(xs[id], 0, reduceMotion ? INSTANT : RETURN_SPRING);
  }

  function handleDragEnd(_, info) {
    const { offset, velocity } = info;
    const thrown =
      Math.abs(offset.x) > THROW_DISTANCE || Math.abs(velocity.x) > THROW_VELOCITY;
    if (thrown) {
      next(Math.sign(offset.x || velocity.x) || 1, velocity.x);
    } else {
      animate(xs[order[0]], 0, reduceMotion ? INSTANT : STACK_SPRING);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previous();
    }
  }

  return (
    <div className={cn('mx-auto w-full max-w-[19rem] sm:max-w-[21rem]', className)}>
      <div
        ref={deckRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Photos of Rohan"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative rounded-2xl outline-offset-8"
      >
        {/* Invisible copy of a card's frame gives the pile its height. */}
        <div aria-hidden="true" className="invisible flex flex-col border p-2.5">
          <div className="aspect-[4/5]" />
          <div className="h-[84px]" />
        </div>
        {photos.map((photo, index) => (
          <DeckCard
            key={photo.id}
            photo={photo}
            index={index}
            position={order.indexOf(index)}
            total={total}
            x={xs[index]}
            reduceMotion={reduceMotion}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      <div className="mt-12 flex items-center justify-between gap-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
          <p aria-hidden="true" className="tabular-nums">
            <span className="text-fg">{pad(order[0] + 1)}</span> / {pad(total)}
          </p>
          <p className="mt-1.5 normal-case tracking-normal">
            {isTouch ? 'Swipe to shuffle' : 'Drag to shuffle'}
          </p>
        </div>
        <p className="sr-only" aria-live="polite">
          Photo {order[0] + 1} of {total}: {current.label}
        </p>
        <div className="flex gap-2">
          <DeckButton label="Previous photo" onClick={previous}>
            <ArrowLeft aria-hidden="true" className="size-4" />
          </DeckButton>
          <DeckButton label="Next photo" onClick={() => next()}>
            <ArrowRight aria-hidden="true" className="size-4" />
          </DeckButton>
        </div>
      </div>
    </div>
  );
}

function DeckButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong bg-surface/70 text-fg transition-[transform,background-color] duration-200 ease-out hover:bg-surface-2 active:scale-95"
    >
      {children}
    </button>
  );
}
