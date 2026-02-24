import React, { memo, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';

function assetUrl(path) {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${String(path || '').replace(/^\/+/, '')}`;
}

function HeadshotCarousel({
  intervalMs = 3500,
  className = '',
}) {
  const images = useMemo(
    () => [
      { src: assetUrl('website-photos/me/01.png'), alt: 'Rohan Malhotra photo 1' },
      { src: assetUrl('website-photos/me/02.jpg'), alt: 'Rohan Malhotra photo 2' },
      { src: assetUrl('website-photos/me/03.jpg'), alt: 'Rohan Malhotra photo 3' },
      { src: assetUrl('website-photos/me/04.jpg'), alt: 'Rohan Malhotra photo 4' },
      { src: assetUrl('website-photos/me/05.jpg'), alt: 'Rohan Malhotra photo 5' },
      { src: assetUrl('website-photos/me/06.png'), alt: 'Rohan Malhotra photo 6' },
      { src: assetUrl('website-photos/me/07.png'), alt: 'Rohan Malhotra photo 7' },
      { src: assetUrl('website-photos/me/09.png'), alt: 'Rohan Malhotra photo 9' },
    ],
    []
  );

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setIdx((v) => (v + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [images.length, intervalMs]);

  const current = images[idx];

  return (
    <div className={className}>
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl shadow-lg border border-gray-200 bg-gray-100">
        <AnimatePresence mode="wait" initial={false}>
          <Motion.img
            key={current.src}
            src={current.src}
            alt={current.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}

export default memo(HeadshotCarousel);

