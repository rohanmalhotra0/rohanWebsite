import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import Button from '@/components/primitives/Button';

const EASE = [0.16, 1, 0.3, 1];
const MotionImg = motion.img;
const SWIPE_DISTANCE = 60; // px of finger travel that counts as a swipe
const SWIPE_VELOCITY = 400; // px/s flick that counts even when short

const slide = {
  enter: (direction) => ({ opacity: 0, x: direction * 48 }),
  center: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction * -48 }),
};

/**
 * Full-screen photo viewer on a native modal <dialog>. Arrow keys, swipes and
 * the buttons step through the photos; Esc, the close button or a click outside
 * the photo closes it. `view` is { index, direction }, or null when closed.
 */
export default function Lightbox({ photos, view, onNavigate, onClose }) {
  const dialogRef = useRef(null);
  const pressedOutside = useRef(false);
  const reduceMotion = useReducedMotion();
  const isOpen = view !== null;

  // Keep the last photo on screen while the dialog fades out.
  const [shown, setShown] = useState(view);
  if (view && view !== shown) setShown(view);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // Freeze the page behind; the stable gutter stops it shifting when the scrollbar goes.
  useEffect(() => {
    if (!isOpen) return;
    const { style } = document.documentElement;
    const previous = { overflow: style.overflow, scrollbarGutter: style.scrollbarGutter };
    style.scrollbarGutter = 'stable';
    style.overflow = 'hidden';
    return () => Object.assign(style, previous);
  }, [isOpen]);

  const index = shown?.index ?? 0;
  const direction = shown?.direction ?? 0;
  const photo = shown ? photos[index] : null;
  const close = () => dialogRef.current?.close();

  function handleKeyDown(event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    event.stopPropagation();
    onNavigate(event.key === 'ArrowRight' ? 1 : -1);
  }

  function handleDragEnd(_, { offset, velocity }) {
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) onNavigate(1);
    else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) onNavigate(-1);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Photos"
      onClose={() => onClose(index)}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-hidden border-0 bg-bg/95 p-0 text-fg opacity-0 transition-[opacity,display,overlay] duration-200 ease-out transition-discrete backdrop:bg-transparent open:opacity-100 starting:open:opacity-0"
    >
      {photo ? (
        <div className="flex size-full flex-col px-[max(1rem,env(safe-area-inset-left),env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-[max(1.5rem,env(safe-area-inset-left),env(safe-area-inset-right))]">
          <div className="flex items-center justify-between">
            <p aria-hidden="true" className="text-[13px] tabular-nums text-subtle">
              {index + 1} / {photos.length}
            </p>
            <Button variant="ghost" aria-label="Close" onClick={close} className="-mr-2.5 w-11 px-0">
              <X aria-hidden="true" className="size-5" />
            </Button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center py-3"
            onPointerDown={(event) => {
              pressedOutside.current = event.target === event.currentTarget;
            }}
            onClick={(event) => {
              // Only a click that starts and ends outside the photo; a swipe that ends there doesn't count.
              if (pressedOutside.current && event.target === event.currentTarget) close();
            }}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <MotionImg
                key={photo.id}
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                decoding="async"
                draggable={false}
                custom={direction}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={reduceMotion ? { duration: 0 } : { duration: 0.24, ease: EASE }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={handleDragEnd}
                className="max-h-full min-w-0 max-w-full select-none rounded-lg object-contain"
              />
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
            <Button variant="secondary" aria-label="Previous photo" onClick={() => onNavigate(-1)} className="w-11 px-0">
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Button>
            <div className="min-w-0 text-center">
              <p className="text-[15px] font-medium leading-6 text-fg">{photo.label}</p>
              {photo.caption ? (
                <p className="mx-auto max-w-md text-balance text-[13px] leading-5 text-muted">
                  {photo.caption}
                </p>
              ) : null}
            </div>
            <Button variant="secondary" aria-label="Next photo" onClick={() => onNavigate(1)} className="w-11 px-0">
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </div>

          <p className="sr-only" aria-live="polite">
            Photo {index + 1} of {photos.length}: {photo.alt}
          </p>
        </div>
      ) : null}
    </dialog>
  );
}
