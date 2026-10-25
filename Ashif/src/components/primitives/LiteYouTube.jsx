import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import useHydrated from '@/hooks/useHydrated';
import { cn } from '@/lib/utils';

/**
 * A YouTube video that costs nothing until it's played: a 16:9 card with a
 * play button, swapped for a youtube-nocookie player on click. Nothing is
 * requested from YouTube before that click.
 *
 * The prerendered card is a plain link to the video, so it still works with
 * JavaScript off; once the page hydrates it becomes the play button. The
 * player takes the card's box, so nothing shifts, and focus moves into it.
 * `poster` replaces the card's graph paper with a picture of its own.
 */
export default function LiteYouTube({ id, title, source, poster, className }) {
  const hydrated = useHydrated();
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => {
    if (playing) frameRef.current?.focus();
  }, [playing]);

  const fullTitle = source ? `${source}: ${title}` : title;

  // The visible title and source are the control's name, with what it does
  // said around them, so the name contains the words on screen.
  const card = (lead, tail) => (
    <>
      {poster ?? (
        // Graph paper, like the hero's taped field.
        <span
          aria-hidden="true"
          className="absolute inset-0 opacity-70 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-position:-1px_-1px] [background-size:2rem_2rem]"
        />
      )}
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-fg text-bg shadow-[0_6px_20px_-6px_rgb(0_0_0/0.35)] transition-transform duration-200 ease-out group-hover:scale-105 sm:size-16"
      >
        <Play fill="currentColor" strokeWidth={1.5} className="ml-0.5 size-5 sm:size-6" />
      </span>
      <span className="relative block">
        <span className="sr-only">{lead} </span>
        <span className="type-heading block text-balance text-lg leading-6 text-fg sm:text-xl">
          {title}
        </span>
        <span className="mt-1 block text-sm leading-5 text-subtle">
          {source ? `${source} · YouTube` : 'YouTube'}
        </span>
        {tail ? <span className="sr-only"> {tail}</span> : null}
      </span>
    </>
  );

  const cardClass =
    'group absolute inset-0 flex w-full flex-col justify-end p-4 text-left outline-none sm:p-5';

  return (
    <div
      className={cn(
        'rounded-lg outline-offset-4 outline-accent-strong has-[:focus-visible]:outline-2',
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden rounded-[inherit] bg-surface-2 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-fg/10">
        {playing ? (
          <iframe
            ref={frameRef}
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`}
            title={fullTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full"
          />
        ) : hydrated ? (
          <button type="button" onClick={() => setPlaying(true)} className={cn(cardClass, 'cursor-pointer')}>
            {card('Play video:')}
          </button>
        ) : (
          <a
            href={`https://www.youtube.com/watch?v=${id}`}
            target="_blank"
            rel="noreferrer"
            className={cardClass}
          >
            {card('Watch on YouTube:', '(opens in a new tab)')}
          </a>
        )}
      </div>
    </div>
  );
}
