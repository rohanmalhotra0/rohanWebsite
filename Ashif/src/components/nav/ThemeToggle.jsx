import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { useReducedMotion } from './hooks';
import { centerOf } from './navigation';

const MotionSpan = motion.span;
const SWAP = { duration: 0.25, ease: [0.16, 1, 0.3, 1] };
const SHOWN = { opacity: 1, rotate: 0, scale: 1 };

/**
 * Light/dark toggle. The icon shows what a press does (a moon in the light
 * theme); the two icons swap with a short turn, or a plain cross-fade under
 * reduced motion.
 */
export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const isDark = theme === 'dark';
  const hidden = (turn) =>
    reduceMotion ? { opacity: 0, rotate: 0, scale: 1 } : { opacity: 0, rotate: turn, scale: 0.5 };

  return (
    <button
      type="button"
      data-theme-toggle=""
      // Keyboard clicks report (0, 0); grow the reveal from the button instead.
      onClick={(event) =>
        toggleTheme(event.detail === 0 ? centerOf(event.currentTarget) : event)
      }
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
    >
      <MotionSpan
        className="absolute"
        initial={false}
        animate={isDark ? SHOWN : hidden(90)}
        transition={SWAP}
      >
        <Sun className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
      </MotionSpan>
      <MotionSpan
        className="absolute"
        initial={false}
        animate={isDark ? hidden(-90) : SHOWN}
        transition={SWAP}
      >
        <Moon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
      </MotionSpan>
    </button>
  );
}
