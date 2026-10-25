import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import useMediaQuery from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { navRoutes } from '@/routes';
import { MenuIcon, SearchButton, Wordmark } from './BarControls';
import MobileMenu from './MobileMenu';
import PalettePicker from './PalettePicker';
import ThemeToggle from './ThemeToggle';
import { usePaletteHotkeys, usePalettePreload, useReducedMotion, useScrolled } from './hooks';
import { loadPalette } from './loadPalette';
import { BAR_ROW, ICON_BUTTON, NAV_LINK } from './styles';

const MotionSpan = motion.span;
const MARKER_SLIDE = { duration: 0.35, ease: [0.16, 1, 0.3, 1] };

/** `route` is the page on screen; its link is marked. */
export default function Navbar({ route }) {
  const scrolled = useScrolled();
  // A case study sits under Projects.
  const active = navRoutes.includes(route) ? route.id : (route.parent ?? null);
  // The marker stays mounted on the last page's link so it can fade out in
  // place when you go to a page without one (home, 404).
  const [last, setLast] = useState(active);
  if (active && active !== last) setLast(active);
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
            <Wordmark className="justify-self-start" />

            <nav aria-label="Primary" className="hidden h-full lg:block">
              <ul className="flex h-full items-center">
                {navRoutes.map((page) => {
                  const isActive = active === page.id;
                  return (
                    <li key={page.id} className="relative flex h-full items-center">
                      <a
                        href={page.path}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(NAV_LINK, isActive ? 'text-fg' : 'text-muted hover:text-fg')}
                      >
                        {page.label}
                      </a>
                      {markerOn === page.id ? (
                        <MotionSpan
                          layoutId="nav-marker"
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-2 -bottom-px h-0.5 bg-mark xl:inset-x-3"
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
              <PalettePicker className={ICON_BUTTON} />
              {/* On phones the palette panel holds the light/dark switch. */}
              <ThemeToggle className={cn(ICON_BUTTON, 'max-sm:hidden')} />
              {/* A plain link like the pages; the negative margin puts its
                  text, not its padding, on the page's right edge. */}
              <a
                href="/resume/"
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
        onSearch={openPalette}
        onSearchIntent={preloadPalette}
        triggerRef={menuButtonRef}
      />
      {Palette ? <Palette open={paletteOpen} onClose={closePalette} /> : null}
    </>
  );
}
