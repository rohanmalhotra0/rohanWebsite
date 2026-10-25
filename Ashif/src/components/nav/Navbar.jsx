import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { sections } from '@/data/portfolioData';
import useMediaQuery from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { MenuIcon, SearchButton, Wordmark } from './BarControls';
import MobileMenu from './MobileMenu';
import ThemeToggle from './ThemeToggle';
import {
  usePaletteHotkeys,
  usePalettePreload,
  useReducedMotion,
  useScrolled,
  useScrollSpy,
} from './hooks';
import { loadPalette } from './loadPalette';
import { goToSection, isPlainClick } from './navigation';
import { BAR_ROW, ICON_BUTTON, NAV_LINK } from './styles';

const MotionSpan = motion.span;
const SECTION_IDS = sections.map((section) => section.id);
const MARKER_SLIDE = { duration: 0.35, ease: [0.16, 1, 0.3, 1] };

export default function Navbar() {
  const scrolled = useScrolled();
  const { active, last, lockTo } = useScrollSpy(SECTION_IDS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  // The palette component, once its chunk has loaded.
  const [Palette, setPaletteComponent] = useState(null);
  const isDesktop = useMediaQuery('(min-width: 64rem)');
  const menuButtonRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const preloadPalette = useCallback(() => {
    loadPalette().then(
      (module) => setPaletteComponent(() => module.default),
      // Offline, or the chunk is gone after a redeploy: drop the queued open
      // instead of leaving it pending. The rest of the page is unaffected.
      () => setPaletteOpen(false)
    );
  }, []);
  usePalettePreload(preloadPalette);

  // Opening the palette always closes the menu, whatever opened it. An open
  // that arrives before the chunk has loaded stays queued in `paletteOpen`;
  // the palette mounts already open (and takes focus) when it lands.
  const setPalette = useCallback(
    (next) => {
      preloadPalette();
      setMenuOpen(false);
      setPaletteOpen(next);
    },
    [preloadPalette]
  );
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
            'border-b pt-[env(safe-area-inset-top)] transition-[background-color,border-color] duration-200 ease-out',
            scrolled ? 'border-line bg-bg' : 'border-transparent'
          )}
        >
          {/* Equal side columns center the links; max-content minimums mean that
              when space runs short they drift off-center instead of overlapping. */}
          <div
            className={cn(
              BAR_ROW,
              'lg:grid lg:grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)]'
            )}
          >
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
                        className={cn(NAV_LINK, isActive ? 'text-fg' : 'text-muted hover:text-fg')}
                      >
                        {section.label}
                      </a>
                      {markerOn === section.id ? (
                        <MotionSpan
                          layoutId="nav-marker"
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-2 -bottom-px h-0.5 bg-accent xl:inset-x-3"
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
                onIntent={preloadPalette}
                onClick={(event) => {
                  // Safari doesn't focus buttons on click; the palette gives focus back to this.
                  event.currentTarget.focus({ preventScroll: true });
                  openPalette();
                }}
              />
              <ThemeToggle className={ICON_BUTTON} />
              {/* A plain link like the sections; the negative margin puts its
                  text, not its padding, on the page's right edge. */}
              <a
                href="#/resume"
                className={cn(NAV_LINK, '-mr-2 hidden text-muted hover:text-fg lg:flex xl:-mr-3')}
              >
                Résumé
              </a>
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
        onSearchIntent={preloadPalette}
        triggerRef={menuButtonRef}
      />
      {Palette ? (
        <Palette open={paletteOpen} onClose={closePalette} onNavigate={navigateTo} />
      ) : null}
    </>
  );
}
