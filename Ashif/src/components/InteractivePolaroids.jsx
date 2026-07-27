import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Shuffle, X } from 'lucide-react';
import { photos } from '@/data/portfolioData';
import { cn } from '@/lib/utils';

const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
const MotionFigure = motion.figure;

export default function InteractivePolaroids({ className }) {
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef(null);
  const [orderedPhotos, setOrderedPhotos] = useState(photos);
  const [activePhoto, setActivePhoto] = useState(null);
  const [shuffleCount, setShuffleCount] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (activePhoto && dialog && !dialog.open) dialog.showModal();
  }, [activePhoto]);

  const closePhoto = () => {
    const dialog = dialogRef.current;
    if (dialog?.open) {
      dialog.close();
    } else {
      setActivePhoto(null);
    }
  };

  const shufflePhotos = () => {
    setOrderedPhotos((current) => {
      const next = [...current];
      for (let index = next.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      }
      return next;
    });
    setShuffleCount((count) => count + 1);
  };

  return (
    <>
      <div
        role="group"
        className={cn(
          'rounded-2xl border border-gray-300 bg-[#e8e6e1] p-4 shadow-inner sm:p-5',
          className
        )}
        aria-label="Photo board of Rohan Malhotra"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-pixel text-xs text-gray-600">PHOTO BOARD</p>
            <p className="mt-1 text-xs text-gray-500">Open a photo or mix them up.</p>
          </div>
          <button
            type="button"
            onClick={shufflePhotos}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <Shuffle className="size-4" aria-hidden="true" />
            Shuffle
          </button>
          <span className="sr-only" aria-live="polite">
            {shuffleCount ? `Photo board shuffled ${shuffleCount} times.` : ''}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {orderedPhotos.map((photo, index) => (
            <MotionFigure
              layout={!reduceMotion}
              key={photo.id}
              className={cn(
                'group relative overflow-hidden rounded-sm border border-black/10 bg-[#faf8f5] p-2 pb-3 text-left shadow-md',
                rotations[index % rotations.length]
              )}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              whileHover={
                reduceMotion ? undefined : { y: -8, rotate: 0, scale: 1.025 }
              }
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.18, ease: 'easeOut', delay: index * 0.03 }}
            >
              <button
                type="button"
                onClick={() => setActivePhoto(photo)}
                className="relative block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                aria-label={`Open photo: ${photo.label}`}
              >
                <span
                  className="absolute left-1/2 top-1 z-10 size-3 -translate-x-1/2 rounded-full border border-black/20 bg-yellow-300 shadow-sm"
                  aria-hidden="true"
                />
                <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
              </button>
              <figcaption className="px-1 pt-3">
                <span className="block text-xs font-semibold text-gray-950">
                  {photo.label}
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-gray-600">
                  {photo.caption}
                </span>
              </figcaption>
            </MotionFigure>
          ))}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setActivePhoto(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closePhoto();
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-xl bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
        aria-label={activePhoto?.label || 'Photo'}
      >
        {activePhoto ? (
          <motion.figure
            className="relative overflow-hidden rounded-xl bg-[#faf8f5] p-3 pb-5 shadow-2xl"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <button
              type="button"
              onClick={closePhoto}
              className="absolute right-5 top-5 z-10 flex size-11 items-center justify-center rounded-full bg-black text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Close photo"
              autoFocus
            >
              <X className="size-5" aria-hidden="true" />
            </button>
            <div className="overflow-hidden rounded-lg bg-gray-100">
              <img
                src={activePhoto.src}
                alt={activePhoto.alt}
                className="max-h-[68dvh] w-full object-contain"
              />
            </div>
            <figcaption className="px-2 pt-4">
              <p className="text-lg font-semibold text-gray-950">
                {activePhoto.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                {activePhoto.caption}
              </p>
            </figcaption>
          </motion.figure>
        ) : null}
      </dialog>
    </>
  );
}
