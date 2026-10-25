import { useState } from 'react';
import { assetUrl } from '@/data/portfolioData';
import Button from '@/components/primitives/Button';
import useMediaQuery from '@/hooks/useMediaQuery';
import { DEFAULT_PALETTE, useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import useRobotScene from './useRobotScene';

const LIVE_LABEL =
  'Interactive 3D model of a four-legged robot with an arm. Throw or drag its toy and it walks over, picks it up with its gripper and brings it back.';
const STILL_LABEL = 'A four-legged robot with an arm, standing on a lab floor.';
// Small button on desktop, a full 44 px target on touch layouts.
const TAP = 'max-lg:h-11 max-lg:px-4';
// The poster is about 55vw from lg up. On phones the frame crops it, so it is
// drawn up to ~116vw wide, but saying 100vw keeps the 800px copy for screens
// below 2x: a few percent of upscaling on a picture the live scene replaces,
// for less than half the bytes. One still per palette and theme
// (scripts/render-posters.mjs), so it matches the scene's colors. Keep in
// sync with the preload in index.html.
const POSTER_SIZES = '(min-width: 1024px) 55vw, 100vw';
const posterName = (palette, theme) => `img/hero/robot-${palette}-${theme}`;
const posterSrcSet = (name) => `${assetUrl(`${name}-800.webp`)} 800w, ${assetUrl(`${name}.webp`)} 1600w`;
// A square that keeps --fit-w of the stage's width and --fit-h of its height
// in view, like the camera frames the scene.
const POSTER_BOX =
  'absolute left-1/2 top-1/2 size-[min(calc(100cqw/var(--fit-w)),calc(100cqh/var(--fit-h)))] max-w-none -translate-x-1/2 -translate-y-1/2 select-none';

/**
 * The robot stage: a poster still that paints immediately, cross-faded to
 * the live three.js scene once its chunk has loaded and drawn a frame.
 */
export default function RobotStage({ className }) {
  const { theme, palette } = useTheme();
  const poster = posterName(palette, theme);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const stage = useRobotScene({ reducedMotion: reduced });
  const [posterFailed, setPosterFailed] = useState(false);
  const { live, touched, canRun } = stage;

  return (
    <div
      className={cn(
        // .hero-lab: a dark panel in most light themes (palettes.css). It
        // bleeds off the right edge from lg, and is a full-width band below.
        'hero-lab relative -mx-[var(--gutter)] [--gutter:clamp(1rem,4vw,2.5rem)] max-lg:pb-4',
        'lg:mx-0 lg:-mr-[var(--bleed)] lg:h-[min(calc(100svh-7rem),54rem)] lg:rounded-l-[2.25rem] lg:[--bleed:calc(max(0px,(100vw_-_78rem)/2)_+_var(--gutter)_-_1rem)]',
        className
      )}
    >
      {/* --fit-w/--fit-h: how much of the reference square stays in view
          (read by the scene too). Desktop keeps the whole width; phones crop
          a little more so the robot is bigger on a short stage. */}
      <div className="relative h-[40svh] max-h-[440px] min-h-[280px] [--fit-h:0.72] [--fit-w:1] [container-type:size] max-lg:[--fit-h:0.64] max-lg:[--fit-w:0.86] lg:absolute lg:inset-0 lg:h-auto lg:max-h-none lg:min-h-0">
        {/* Clipped to the stage and its rounded corners: in a lab panel the
            stills are opaque, and the square is bigger than the stage. */}
        <div
          role="img"
          aria-label={live ? LIVE_LABEL : STILL_LABEL}
          className="absolute inset-0 overflow-hidden lg:rounded-l-[2.25rem]"
        >
          {posterFailed ? null : (
            <img
              ref={stage.posterRef}
              src={assetUrl(`${poster}.webp`)}
              srcSet={posterSrcSet(poster)}
              sizes={POSTER_SIZES}
              alt=""
              width={1600}
              height={1600}
              fetchPriority="high"
              draggable={false}
              onError={() => setPosterFailed(true)}
              // The poster is the scene's first frame, framed the same way. It
              // stays under the canvas while that fades in, then drops out, so
              // the swap never ghosts.
              className={cn(POSTER_BOX, 'transition-opacity duration-0', live && 'opacity-0 delay-300')}
            />
          )}
          {/* Without JavaScript the poster above gets no src (an inline script
              picks the visitor's palette), and the page is in the default one. */}
          <noscript>
            <img
              src={assetUrl(`${posterName(DEFAULT_PALETTE, 'light')}.webp`)}
              srcSet={posterSrcSet(posterName(DEFAULT_PALETTE, 'light'))}
              sizes={POSTER_SIZES}
              alt=""
              width={1600}
              height={1600}
              className={POSTER_BOX}
            />
          </noscript>
          <div
            ref={stage.hostRef}
            className={cn('absolute inset-0 opacity-0 transition-opacity duration-250 ease-out', live && 'opacity-100')}
          />
        </div>

        {/* Grab handle that the scene keeps over the toy while it lies on the
            floor (shown and positioned by the scene). Only this small area
            blocks touch scrolling, so dragging the toy works on phones. */}
        <div
          ref={stage.handleRef}
          aria-hidden="true"
          className="absolute left-0 top-0 hidden size-11 cursor-grab touch-none rounded-full pointer-coarse:size-16"
        />

        {/* Inset for the robot's camera: the canvas draws its view into this
            rect and fades it in (opacity set by the scene) only during a
            fetch. Phones skip it; the stage is too short to share. */}
        <div
          ref={stage.frameRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 right-[var(--gutter)] z-[2] h-[90px] w-[160px] opacity-0 transition-opacity duration-300 ease-linear max-sm:hidden lg:bottom-4 lg:right-[var(--bleed)] lg:h-[144px] lg:w-[256px]"
        >
          <div className="absolute inset-0 overflow-hidden rounded-lg ring-1 ring-inset ring-fg/10">
            <div ref={stage.boxRef} className="absolute left-0 top-0 rounded-[3px] border border-accent opacity-0">
              <span className="absolute left-0 top-0 rounded-br-[3px] bg-accent px-1 font-mono text-[9px] leading-[14px] text-accent-ink">
                toy
              </span>
            </div>
          </div>
          {/* Below lg the robot fills the short stage and walks behind anything
              above the inset, so the readout sits under it. */}
          <p
            ref={stage.hudRef}
            className="absolute right-0 top-full mt-1 whitespace-nowrap font-mono text-[10px] leading-4 text-subtle lg:bottom-full lg:top-auto lg:mb-1.5 lg:mt-0 lg:text-[11px]"
          >
            cam0 · simulated · idle
          </p>
        </div>

        <p className="sr-only" aria-live="polite">
          {stage.message}
        </p>
      </div>

      {/* Always rendered, so the row's height is reserved from first paint
          (no layout shift when the scene comes up); hidden until usable. */}
      <div
        ref={stage.controlsRef}
        className={cn(
          // Above the lab panel's glow (palettes.css).
          'relative z-[2] mt-3 flex items-center gap-4 px-[var(--gutter)] transition-opacity duration-300 max-lg:min-h-11 sm:mt-5',
          'lg:absolute lg:bottom-6 lg:left-8 lg:mt-0 lg:flex-col-reverse lg:items-start lg:gap-1.5 lg:px-0',
          !(live || canRun) && 'invisible opacity-0'
        )}
      >
        {canRun ? (
          <Button variant="secondary" size="sm" onClick={stage.runDemo} className={TAP}>
            Run demo
          </Button>
        ) : (
          <>
            <Button variant="secondary" size="sm" onClick={stage.throwToy} className={TAP}>
              Throw a toy
            </Button>
            <p className={cn('text-[13px] leading-5 text-subtle transition-opacity duration-500', touched && 'opacity-0')}>
              Drag the toy or <span className="pointer-coarse:hidden">click</span>
              <span className="hidden pointer-coarse:inline">tap</span> the floor
            </p>
          </>
        )}
      </div>
    </div>
  );
}
