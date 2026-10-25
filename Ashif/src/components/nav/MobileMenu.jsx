import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';
import { profile, sections } from '@/data/portfolioData';
import Button from '@/components/primitives/Button';
import { cn } from '@/lib/utils';
import { SearchButton, Wordmark } from './BarControls';
import ThemeToggle from './ThemeToggle';
import { useFocusTrap, useModalFocus, useReducedMotion, useScrollLock } from './hooks';
import { isPlainClick } from './navigation';
import { BAR_ROW, ICON_BUTTON } from './styles';

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;
const MotionLi = motion.li;

const LINKS = [
  { label: 'GitHub', href: profile.github, external: true },
  { label: 'LinkedIn', href: profile.linkedin, external: true },
  { label: 'Email', href: `mailto:${profile.email}` },
];

/**
 * Full-screen menu for small screens. Modal: focus is trapped while open and
 * handed back to the menu button on close; Esc, the close button, or a tap on
 * empty space closes it. Its top row repeats the navbar so it opens in place.
 * `onNavigate(id)` runs before an in-page link scrolls, `onSearch` opens the
 * palette, and `triggerRef` (the menu button) gets focus back on close.
 */
export default function MobileMenu({ open, onClose, active, onNavigate, onSearch, triggerRef }) {
  const sheetRef = useRef(null);
  const closeRef = useRef(null);

  useScrollLock(open);
  useFocusTrap(sheetRef, open);
  const restoreFocus = useModalFocus(open, {
    initialRef: closeRef,
    containerRef: sheetRef,
    returnRef: triggerRef,
  });

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      restoreFocus.current = true;
      onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, restoreFocus]);

  const close = ({ restore = true } = {}) => {
    restoreFocus.current = restore;
    onClose();
  };

  // In-page links: the anchor does the scrolling (fragment navigation also
  // moves the focus starting point there), so just close and tell the spy.
  const onSectionClick = (id) => (event) => {
    if (!isPlainClick(event)) return;
    event.currentTarget.blur();
    onNavigate(id);
    close({ restore: false });
  };

  return (
    <AnimatePresence>
      {open ? (
        <Sheet
          key="sheet"
          sheetRef={sheetRef}
          closeRef={closeRef}
          active={active}
          onClose={() => close()}
          onSectionClick={onSectionClick}
          onLeave={() => close({ restore: false })}
          onSearch={onSearch}
        />
      ) : null}
    </AnimatePresence>
  );
}

function Sheet({ sheetRef, closeRef, active, onClose, onSectionClick, onLeave, onSearch }) {
  const reduceMotion = useReducedMotion();
  const rise = (i) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35, delay: 0.04 + i * 0.03, ease: EASE },
        };

  return (
    <MotionDiv
      ref={sheetRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      data-nav-dialog=""
      className="fixed inset-0 z-[60] flex flex-col overflow-y-auto overscroll-contain bg-bg lg:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE } }}
      transition={{ duration: 0.2, ease: EASE }}
      // The sheet's empty space is its backdrop: a tap there closes it.
      onClick={(event) => {
        if (!event.target.closest('a, button')) onClose();
      }}
    >
      <div className="shrink-0 pt-[env(safe-area-inset-top)]">
        <div className={BAR_ROW}>
          <Wordmark onClick={onSectionClick('top')} />
          <div className="flex items-center">
            <SearchButton onClick={onSearch} />
            <ThemeToggle className={ICON_BUTTON} />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className={cn(ICON_BUTTON, '-mr-3 text-fg')}
            >
              <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <nav aria-label="Mobile" className="container-page shrink-0 pt-5">
        <ul className="border-t border-line">
          {sections.map((section, i) => {
            const isActive = active === section.id;
            return (
              <MotionLi key={section.id} {...rise(i)} className="border-b border-line">
                <a
                  href={`#${section.id}`}
                  onClick={onSectionClick(section.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className="type-heading flex min-h-14 items-center text-[1.75rem] text-fg transition-opacity active:opacity-60"
                >
                  <span
                    className={cn(
                      'underline-offset-[0.3em]',
                      isActive && 'underline decoration-accent decoration-2'
                    )}
                  >
                    {section.label}
                  </span>
                </a>
              </MotionLi>
            );
          })}
        </ul>
      </nav>

      <MotionDiv
        {...rise(sections.length)}
        className="container-page mt-auto shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-8"
      >
        <Button href="#/resume" variant="secondary" size="lg" onClick={onLeave} className="w-full">
          Résumé
        </Button>
        <ul className="mt-2 flex items-center justify-between">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer' : undefined}
                onClick={onClose}
                className="inline-flex h-11 items-center gap-1 text-[15px] text-muted transition-colors hover:text-fg active:text-fg"
              >
                {link.label}
                {link.external ? (
                  <ArrowUpRight className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      </MotionDiv>
    </MotionDiv>
  );
}
