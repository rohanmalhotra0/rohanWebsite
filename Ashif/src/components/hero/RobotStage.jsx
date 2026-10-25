import { assetUrl } from '@/data/portfolioData';
import Button from '@/components/primitives/Button';
import useMediaQuery from '@/hooks/useMediaQuery';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import useRobotScene from './useRobotScene';

const LIVE_LABEL =
  'Interactive 3D model of a four-legged robot with an arm. Throw it a toy and it walks over, picks it up with its gripper and brings it back.';
const STILL_LABEL = 'A four-legged robot with an arm, standing on a lab floor.';

/**
 * The robot stage: a poster still that paints immediately, cross-faded to
 * the live three.js scene once its chunk has loaded and drawn a frame.
 */
export default function RobotStage({ className }) {
  const { theme } = useTheme();
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const coarse = useMediaQuery('(pointer: coarse)');
  const { hostRef, posterRef, frameRef, boxRef, labelRef, hudRef, live, message, touched, throwToy } =
    useRobotScene({ enabled: !reduced, theme });

  return (
    <div
      className={cn(
        'relative -mx-[var(--gutter)] h-[58svh] max-h-[560px] min-h-[340px] [--gutter:clamp(1rem,4vw,2.5rem)]',
        'lg:mx-0 lg:-mr-[var(--bleed)] lg:h-[min(calc(100svh-7rem),54rem)] lg:max-h-none lg:[--bleed:calc(max(0px,(100vw_-_78rem)/2)_+_var(--gutter)_-_1rem)]',
        className
      )}
    >
      <div role="img" aria-label={live ? LIVE_LABEL : STILL_LABEL} className="absolute inset-0">
        <img
          ref={posterRef}
          src={assetUrl(`img/hero/robot-${theme}.webp`)}
          alt=""
          width={1600}
          height={1333}
          fetchPriority="high"
          draggable={false}
          className={cn(
            'absolute inset-0 size-full select-none object-contain transition-opacity duration-500 ease-out',
            live && 'opacity-0'
          )}
        />
        <div
          ref={hostRef}
          className={cn('absolute inset-0 opacity-0 transition-opacity duration-500 ease-out', live && 'opacity-100')}
        />
      </div>

      {/* Inset for the robot's camera feed; the canvas draws into this rect. */}
      <div
        ref={frameRef}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute right-[var(--gutter)] top-1 h-[90px] w-[160px] opacity-0 transition-opacity duration-500 sm:h-[108px] sm:w-[192px]',
          'lg:bottom-4 lg:right-[var(--bleed)] lg:top-auto lg:h-[144px] lg:w-[256px]',
          live && 'opacity-100'
        )}
      >
        <div className="absolute inset-0 overflow-hidden rounded-lg ring-1 ring-inset ring-fg/10">
          <div ref={boxRef} className="absolute left-0 top-0 rounded-[3px] border border-accent opacity-0">
            <span
              ref={labelRef}
              className="absolute left-0 top-0 whitespace-nowrap rounded-br-[3px] bg-accent px-1 font-mono text-[9px] leading-[14px] text-accent-ink"
            >
              toy 0.97
            </span>
          </div>
        </div>
        <p
          ref={hudRef}
          className="absolute left-0 top-full mt-1.5 whitespace-nowrap font-mono text-[10px] leading-4 text-subtle lg:bottom-full lg:mb-1.5 lg:mt-0 lg:top-auto lg:text-[11px]"
        >
          cam0 · 30 fps · idle
        </p>
      </div>

      {live ? (
        <div className="absolute bottom-2 left-[var(--gutter)] flex items-center gap-4 lg:bottom-4 lg:left-0">
          <Button variant="secondary" size="sm" onClick={throwToy} className="max-lg:h-11 max-lg:px-4">
            Throw a toy
          </Button>
          <p
            className={cn(
              'text-[13px] leading-5 text-subtle transition-opacity duration-500',
              touched && 'opacity-0'
            )}
          >
            {coarse ? 'Tap' : 'Click'} the floor to throw a toy.
          </p>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
