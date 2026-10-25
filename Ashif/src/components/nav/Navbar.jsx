import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { sections } from '@/data/portfolioData';
import Button from '@/components/primitives/Button';
import useMediaQuery from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { MenuIcon, SearchButton, Wordmark } from './BarControls';
import CommandPalette from './CommandPalette';
import MobileMenu from './MobileMenu';
import ThemeToggle from './ThemeToggle';
import { usePaletteHotkeys, useReducedMotion, useScrolled, useScrollSpy } from './hooks';
import { goToSection, isPlainClick } from './navigation';
import { BAR_ROW, ICON_BUTTON } from './styles';

const MotionSpan = motion.span;
const SECTION_IDS = sections.map((section) => section.id);
const MARKER_SLIDE = { duration: 0.35, ease: [0.16, 1, 0.3, 1] };

export default function Navbar() {
  const scrolled = useScrolled();
  const { active, last, lockTo } = useScrollSpy(SECTION_IDS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 64rem)');
  const menuButtonRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // Opening the palette always closes the menu, whatever opened it.
  const setPalette = useCallback((next) => {
    setMenuOpen(false);
    setPaletteOpen(next);
  }, []);
  usePaletteHotkeys(setPalette);

  // The sheet is for small screens only; don't leave it (and its scroll lock)
  // open when the window grows past the breakpoint.
  useEffect(() => {
    if (isDesktop) setMenuOpen(false);
  }, [isDesktop]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const openPalette = useCallback(() => setPalette(true), [setPalette]);

  const navigateTo = useCallback(
    (id) => {
      lockTo(id);
      goToSection(id);
    },
    [lockTo]
  );

  // Plain anchors do the scrolling; this keeps the marker from sweeping
  // across every section on the way there.
  const onAnchorClick = (id) => (event) => {
    if (isPlainClick(event)) lockTo(id);
  };

  // The marker stays mounted on the last section so it can fade out in place
  // when you scroll back up into the hero.
  const markerOn = active ?? last;

  return (
    <>
      <header className="fixed left-0 right-[var(--scroll-lock-gap,0px)] top-0 z-50">
        <div
          className={cn(
            'border-b pt-[env(safe-area-inset-top)] transition-[background-color,border-color,backdrop-filter] duration-200 ease-out',
            scrolled ? 'border-line bg-bg/85 backdrop-blur-md' : 'border-transparent'
          )}
        >
          <div className={cn(BAR_ROW, 'lg:grid lg:grid-cols-[1fr_auto_1fr]')}>
            <Wordmark onClick={onAnchorClick('top')} className="justify-self-start" />

            <nav aria-label="Primary" className="hidden h-full lg:block">
              <ul className="flex h-full items-center">
                {sections.map((section) => {
                  const isActive = active === section.id;
                  return (
                    <li key={section.id} className="relative flex h-full items-center">
                      <a
                        href={`#${section.id}`}
                        onClick={onAnchorClick(section.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={cn(
                          'flex h-9 items-center rounded-md px-3 text-[13.5px] font-medium transition-colors duration-150 pointer-coarse:h-11',
                          isActive ? 'text-fg' : 'text-muted hover:text-fg'
                        )}
                      >
                        {section.label}
                      </a>
                      {markerOn === section.id ? (
                        <MotionSpan
                          layoutId="nav-marker"
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-3 -bottom-px h-0.5 bg-accent"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isActive ? 1 : 0 }}
                          transition={{
                            layout: reduceMotion ? { duration: 0 } : MARKER_SLIDE,
                            opacity: { duration: 0.2 },
                          }}
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center justify-self-end lg:gap-1">
              <SearchButton
                onClick={(event) => {
                  // Safari doesn't focus buttons on click; the palette gives focus back to this.
                  event.currentTarget.focus({ preventScroll: true });
                  openPalette();
                }}
              />
              <ThemeToggle className={ICON_BUTTON} />
              <Button
                href="#/resume"
                variant="secondary"
                size="sm"
                className="ml-2 hidden lg:inline-flex pointer-coarse:h-11"
              >
                Résumé
              </Button>
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                aria-controls={menuOpen ? 'mobile-menu' : undefined}
                className={cn(ICON_BUTTON, '-mr-3 text-fg lg:hidden')}
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen && !isDesktop}
        onClose={closeMenu}
        active={active}
        onNavigate={lockTo}
        onSearch={openPalette}
        triggerRef={menuButtonRef}
      />
      <CommandPalette open={paletteOpen} onClose={closePalette} onNavigate={navigateTo} />
    </>
  );
}
