import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import useMediaQuery from '@/hooks/useMediaQuery';
import { OPEN_PALETTE } from '@/lib/events';

/**
 * Live prefers-reduced-motion. Used instead of motion's own hook and
 * MotionConfig, which read the setting once and log a dev warning.
 */
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/**
 * True once the page has scrolled more than `threshold` px. rAF-throttled.
 * Starts false (as in the prerendered HTML); the effect syncs it on mount.
 */
export function useScrolled(threshold = 4) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return scrolled;
}

// Scroll locking is reference-counted so the menu and palette can overlap.
let lockCount = 0;
let saved = null;

/**
 * Prevent page scrolling while `active`, without the scrollbar-gap jump.
 * A layout effect, so the page is scrollable again before anything that runs
 * in the next frame (like scrolling to a section) happens.
 */
export function useScrollLock(active) {
  useLayoutEffect(() => {
    if (!active) return undefined;
    const root = document.documentElement;
    const { body } = document;

    if (lockCount === 0) {
      const gap = window.innerWidth - root.clientWidth;
      saved = { overflow: root.style.overflow, paddingRight: body.style.paddingRight };
      root.style.overflow = 'hidden';
      if (gap > 0) {
        body.style.paddingRight = `${gap}px`;
        // The fixed navbar reads this to stay put.
        root.style.setProperty('--scroll-lock-gap', `${gap}px`);
      }
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0 && saved) {
        root.style.overflow = saved.overflow;
        body.style.paddingRight = saved.paddingRight;
        root.style.removeProperty('--scroll-lock-gap');
        saved = null;
      }
    };
  }, [active]);
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keep Tab / Shift+Tab cycling inside `ref` while `active`. */
export function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event) => {
      const node = ref.current;
      if (event.key !== 'Tab' || !node) return;
      const items = [...node.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.getClientRects().length > 0
      );
      if (!items.length) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      const outside = !node.contains(current);
      if (event.shiftKey && (current === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [ref, active]);
}

/**
 * Focus handling for a modal. On open: remember what had focus (or use
 * `returnRef`, for a modal with one fixed trigger) and focus `initialRef`.
 * On close: give focus back, unless the caller set the returned ref to false
 * first (a link took the user somewhere) or something outside the modal has
 * already taken focus.
 */
export function useModalFocus(open, { initialRef, containerRef, returnRef }) {
  const returnTo = useRef(null);
  const restore = useRef(true);

  useLayoutEffect(() => {
    if (open) {
      const current = document.activeElement;
      // A re-run while already open (StrictMode, or a modal that mounts open,
      // like the lazily loaded palette) must not take the modal's own field
      // as the place to return to.
      if (!containerRef.current?.contains(current)) {
        returnTo.current = returnRef?.current ?? current;
      }
      restore.current = true;
      initialRef.current?.focus({ preventScroll: true });
      return;
    }
    const target = returnTo.current;
    returnTo.current = null;
    if (!restore.current || !target?.isConnected || target === document.body) return;
    const current = document.activeElement;
    const focusIsLost =
      !current || current === document.body || containerRef.current?.contains(current);
    if (focusIsLost) target.focus({ preventScroll: true });
  }, [open, initialRef, containerRef, returnRef]);

  return restore;
}

/**
 * Mirror the visual viewport height into `--vvh` on `ref`. It shrinks when the
 * on-screen keyboard opens, which 100dvh does not account for on iOS.
 */
export function useVisualViewportHeight(ref) {
  useLayoutEffect(() => {
    const viewport = window.visualViewport;
    const node = ref.current;
    if (!viewport || !node) return undefined;
    const update = () => node.style.setProperty('--vvh', `${viewport.height}px`);
    update();
    viewport.addEventListener('resize', update);
    return () => viewport.removeEventListener('resize', update);
  }, [ref]);
}

const isTypingTarget = (el) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

// Another dialog on the page (a lightbox, a project viewer) owns the keyboard.
// Our own menu and palette are marked with data-nav-dialog.
const otherDialogOpen = () =>
  Boolean(document.querySelector('dialog[open], [aria-modal="true"]:not([data-nav-dialog])'));

/**
 * Palette shortcuts: ⌘K / Ctrl+K toggles, "/" opens when not typing, and the
 * OPEN_PALETTE window event (openPalette() from anywhere) opens.
 * `setOpen` receives a boolean or an updater, like a state setter.
 */
export function usePaletteHotkeys(setOpen) {
  useEffect(() => {
    const onKeyDown = (event) => {
      // Autofill fires keydown events without a key.
      if (event.isComposing || event.altKey || typeof event.key !== 'string') return;
      const mod = event.metaKey || event.ctrlKey;
      if (mod && !event.shiftKey && event.key.toLowerCase() === 'k') {
        if (otherDialogOpen()) return;
        event.preventDefault();
        setOpen((open) => !open);
      } else if (
        event.key === '/' &&
        !mod &&
        !event.defaultPrevented &&
        !isTypingTarget(event.target) &&
        !otherDialogOpen()
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_PALETTE, onOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_PALETTE, onOpen);
    };
  }, [setOpen]);
}

/**
 * Call `preload` (warms the palette chunk) once the page has loaded and the
 * main thread is idle, or on the first Meta/Ctrl keydown (the start of ⌘K),
 * whichever comes first. With Save-Data on, only the keypress counts.
 */
export function usePalettePreload(preload) {
  useEffect(() => {
    let idle = 0;
    let timer = 0;
    const whenIdle = () => {
      if (window.requestIdleCallback) idle = window.requestIdleCallback(preload, { timeout: 4000 });
      else timer = window.setTimeout(preload, 1500);
    };
    if (!navigator.connection?.saveData) {
      if (document.readyState === 'complete') whenIdle();
      else window.addEventListener('load', whenIdle, { once: true });
    }

    const onKeyDown = (event) => {
      if (event.key !== 'Meta' && event.key !== 'Control') return;
      window.removeEventListener('keydown', onKeyDown);
      preload();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('load', whenIdle);
      window.removeEventListener('keydown', onKeyDown);
      if (idle) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, [preload]);
}
