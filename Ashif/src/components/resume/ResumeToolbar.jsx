import { ArrowLeft, Download, Moon, Printer, Sun } from 'lucide-react';
import Button from '@/components/primitives/Button';
import { profile } from '@/data/portfolioData';
import { useTheme } from '@/lib/theme';

// Compact with a mouse, 44px on touch screens.
const TOUCH = 'pointer-coarse:h-11 pointer-coarse:min-w-11';

// The negative margins on the first and last controls put the visible
// arrow and theme glyphs (not their padded boxes) on the sheet's edges.

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="-mr-2.5 grid size-9 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-fg/[0.06] hover:text-fg pointer-coarse:size-11"
    >
      <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

export default function ResumeToolbar() {
  return (
    <header className="rv-toolbar sticky top-0 z-40 border-b border-line bg-bg pt-[env(safe-area-inset-top)]">
      <div className="rv-frame flex h-14 items-center justify-between gap-3 sm:h-16">
        <Button
          href="#top"
          variant="ghost"
          size="sm"
          className={`-ml-[13px] px-2.5 text-fg ${TOUCH}`}
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
          <span>
            Back<span className="max-sm:sr-only"> to portfolio</span>
          </span>
        </Button>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            className={`text-fg max-sm:w-9 max-sm:px-0 ${TOUCH}`}
          >
            <Printer className="size-4" strokeWidth={1.75} aria-hidden="true" />
            <span className="max-sm:sr-only">Print</span>
          </Button>
          <Button
            href={profile.resumeUrl}
            download
            variant="primary"
            size="sm"
            className={TOUCH}
          >
            <Download className="size-4" strokeWidth={1.75} aria-hidden="true" />
            <span>
              <span className="max-sm:sr-only">Download </span>PDF
            </span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
