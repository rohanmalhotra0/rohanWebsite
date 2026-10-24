import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { centerOf } from './navigation';

const MotionSpan = motion.span;
const SWAP = { duration: 0.25, ease: [0.16, 1, 0.3, 1] };
const SHOWN = { opacity: 1, rotate: 0, scale: 1 };

/**
 * Light/dark toggle. The icon shows what a press does (a moon in the light
 * theme); the two icons swap with a short turn. Under reduced motion only
 * the cross-fade remains (see MotionConfig in Navbar).
 */
export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

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
        animate={isDark ? SHOWN : { opacity: 0, rotate: 90, scale: 0.5 }}
        transition={SWAP}
      >
        <Sun className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
      </MotionSpan>
      <MotionSpan
        className="absolute"
        initial={false}
        animate={isDark ? { opacity: 0, rotate: -90, scale: 0.5 } : SHOWN}
        transition={SWAP}
      >
        <Moon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
      </MotionSpan>
    </button>
  );
}
