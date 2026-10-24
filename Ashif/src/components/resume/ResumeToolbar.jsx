import { ArrowLeft, Download, Moon, Printer, Sun } from 'lucide-react';
import Button from '@/components/primitives/Button';
import { profile } from '@/data/portfolioData';
import { useTheme } from '@/lib/theme';

// Toolbar controls stay compact with a mouse and grow to 44px on touch.
const TOUCH = 'pointer-coarse:h-11';

export default function ResumeToolbar() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <header className="rv-toolbar sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[calc(816px+3rem)] items-center justify-between gap-2 px-4 sm:px-6">
        <Button
          href="#top"
          variant="ghost"
          size="sm"
          className={`-ml-3 text-fg ${TOUCH}`}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>
            <span className="sr-only sm:not-sr-only">Back to </span>
            <span className="max-sm:capitalize">portfolio</span>
          </span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            className={`max-sm:w-9 max-sm:px-0 max-sm:pointer-coarse:w-11 ${TOUCH}`}
          >
            <Printer className="size-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Print</span>
          </Button>
          <Button
            href={profile.resumeUrl}
            download
            variant="primary"
            size="sm"
            className={TOUCH}
          >
            <Download className="size-4" aria-hidden="true" />
            <span>
              <span className="sr-only sm:not-sr-only">Download </span>PDF
            </span>
          </Button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${nextTheme} theme`}
            title={`Switch to ${nextTheme} theme`}
            className="grid size-9 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-fg/5 hover:text-fg pointer-coarse:size-11"
          >
            {theme === 'dark' ? (
              <Sun className="size-[18px]" aria-hidden="true" />
            ) : (
              <Moon className="size-[18px]" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
