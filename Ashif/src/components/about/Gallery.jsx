import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { photos } from '@/data/portfolioData';
import { cn } from '@/lib/utils';
import { srcSetFor, thumbnailSizes } from './images';

// photos[0] is the portrait, shown on its own.
const gallery = photos.slice(1);
const totalAspect = gallery.reduce((total, photo) => total + photo.width / photo.height, 0);

// The viewer is not in the main bundle. It is mounted (closed) once the photos
// come within half a screen, or on first hover/focus of a thumbnail, rather than
// on click: a lazy component suspends on its first render and React holds back
// the reveal, so mounting early is what makes the first open instant (touch
// included, where hover only fires with the tap). If it can't load, thumbnails do nothing.
const Lightbox = lazy(() => import('./Lightbox').catch(() => ({ default: () => null })));

export default function Gallery({ className }) {
  const [view, setView] = useState(null);
  const [viewerWanted, setViewerWanted] = useState(false);
  const list = useRef(null);
  const buttons = useRef([]);

  const wantViewer = () => setViewerWanted(true);

  useEffect(() => {
    if (viewerWanted || !list.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setViewerWanted(true);
      },
      { rootMargin: '0px 0px 50% 0px' }
    );
    observer.observe(list.current);
    return () => observer.disconnect();
  }, [viewerWanted]);

  const open = (index) => {
    setViewerWanted(true);
    setView({ index, direction: 0 });
  };

  const navigate = (direction) =>
    setView(
      (current) =>
        current && {
          index: (current.index + direction + gallery.length) % gallery.length,
          direction,
        }
    );

  // Back to the thumbnail of the photo that was last on screen.
  const close = (index) => {
    setView(null);
    buttons.current[index]?.focus();
  };

  return (
    <>
      <ul
        ref={list}
        aria-label="Photos"
        className={cn(
          // Phones and tablets: a strip that runs to the screen edges, the next photo peeking in.
          '-mx-[var(--gutter)] -mt-2 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto overscroll-x-contain px-[var(--gutter)] pb-4 pt-2 scroll-px-[var(--gutter)] [--gutter:clamp(1rem,4vw,2.5rem)] [scrollbar-color:var(--line-strong)_transparent] [scrollbar-width:thin]',
          // Desktop: one justified row. Widths follow each photo's aspect ratio, so every
          // photo gets the same height and none is cropped.
          'lg:m-0 lg:gap-5 lg:overflow-visible lg:p-0',
          className
        )}
      >
        {gallery.map((photo, index) => (
          <li
            key={photo.id}
            style={{ '--ratio': photo.width / photo.height }}
            className="w-min shrink-0 snap-start lg:w-auto lg:min-w-0 lg:shrink lg:grow-(--ratio) lg:basis-0"
          >
            <figure>
              <button
                ref={(element) => {
                  buttons.current[index] = element;
                }}
                type="button"
                aria-haspopup="dialog"
                onClick={() => open(index)}
                onPointerEnter={wantViewer}
                onFocus={wantViewer}
                className="group block w-full cursor-zoom-in overflow-hidden rounded-lg bg-surface-2"
              >
                <img
                  src={photo.src}
                  srcSet={srcSetFor(photo)}
                  sizes={thumbnailSizes(photo, totalAspect)}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                  className="block h-64 w-auto max-w-none transition-transform duration-500 ease-out-expo motion-safe:group-hover:scale-[1.03] sm:h-72 lg:h-auto lg:w-full"
                />
              </button>
              <figcaption className="mt-3 text-[13px] leading-5 text-subtle">
                <span className="block font-medium">{photo.label}</span>
                {photo.caption ? (
                  <span className="mt-0.5 block text-pretty">{photo.caption}</span>
                ) : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {viewerWanted ? (
        <Suspense fallback={null}>
          <Lightbox photos={gallery} view={view} onNavigate={navigate} onClose={close} />
        </Suspense>
      ) : null}
    </>
  );
}
