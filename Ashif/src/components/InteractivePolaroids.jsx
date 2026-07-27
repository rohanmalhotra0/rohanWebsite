import { motion, useReducedMotion } from 'motion/react';
import { photos } from '@/data/portfolioData';
import { cn } from '@/lib/utils';

const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
const MotionFigure = motion.figure;

export default function InteractivePolaroids({ className }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:gap-4',
        className
      )}
      aria-label="Labeled photos of Rohan Malhotra"
    >
      {photos.map((photo, index) => (
        <MotionFigure
          key={photo.id}
          className={cn(
            'relative overflow-hidden rounded-sm border border-black/10 bg-[#faf8f5] p-2 pb-3 shadow-md',
            rotations[index % rotations.length]
          )}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          whileHover={reduceMotion ? undefined : { y: -6 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.18, ease: 'easeOut', delay: index * 0.04 }}
        >
          <div className="absolute left-1/2 top-1 z-10 size-2 -translate-x-1/2 rounded-full border border-black/20 bg-yellow-300 shadow-sm" />
          <div className="aspect-[4/5] overflow-hidden bg-gray-100">
            <img
              src={photo.src}
              alt={photo.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="size-full object-cover"
            />
          </div>
          <figcaption className="px-1 pt-3 text-left">
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
  );
}
