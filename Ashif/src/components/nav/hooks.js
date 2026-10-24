import { useCallback, useEffect, useRef, useState } from 'react';
import { OPEN_PALETTE } from '@/lib/events';

/** True once the page has scrolled more than `threshold` px. rAF-throttled. */
export function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > threshold);

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

// A thin horizontal band ~35% down the viewport. Whichever section crosses it
// is "current". The hero (#top) is observed too so nothing is active there.
const SPY_MARGIN = '-35% 0px -64% 0px';
const LOCK_FALLBACK_MS = 1200;

/**
 * Scrollspy over `ids` (stable array of section ids).
 * - `active`: the current section id, or null in the hero.
 * - `last`: the most recent non-null id (lets the indicator fade out in place).
 * - `lockTo(id)`: jump the indicator to `id` right away and ignore the sections
 *   passed on the way while the click-triggered smooth scroll runs.
 */
export function useScrollSpy(ids) {
  const [state, setState] = useState({ active: null, last: null });
  const visible = useRef(new Map());
  const order = useRef([]);
  const locked = useRef(null);

  const select = useCallback((id) => {
    const next = id === 'top' ? null : id;
    setState((prev) =>
      prev.active === next ? prev : { active: next, last: next ?? prev.last }
    );
  }, []);

  const sync = useCallback(() => {
    const hit = order.current.find((id) => visible.current.get(id));
    // Nothing under the band (e.g. in the footer): keep the previous section.
    if (hit !== undefined) select(hit);
  }, [select]);

  useEffect(() => {
    const elements = ['top', ...ids]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    order.current = elements.map((el) => el.id);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          visible.current.set(entry.target.id, entry.isIntersecting)
        );
        if (!locked.current) sync();
      },
      { rootMargin: SPY_MARGIN }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, sync]);

  const lockTo = useCallback(
    (id) => {
      locked.current?.release();
      select(id);

      let timer = 0;
      const release = () => {
        window.removeEventListener('scrollend', release);
        clearTimeout(timer);
        if (locked.current?.release === release) locked.current = null;
        sync();
      };
      // `scrollend` is the precise signal; the timeout covers browsers without it
      // and clicks that don't scroll at all.
      window.addEventListener('scrollend', release);
      timer = window.setTimeout(release, LOCK_FALLBACK_MS);
      locked.current = { release };
    },
    [select, sync]
  );

  useEffect(() => () => locked.current?.release(), []);

  return { active: state.active, last: state.last, lockTo };
}

// Scroll locking is reference-counted so the menu and palette can overlap.
let lockCount = 0;
let saved = null;

/** Prevent page scrolling while `active`, without the scrollbar-gap jump. */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    const root = document.documentElement;
    const { body } = document;

    if (lockCount === 0) {
      const gap = window.innerWidth - root.clientWidth;
      saved = {
        overflow: root.style.overflow,
        paddingRight: body.style.paddingRight,
      };
      root.style.overflow = 'hidden';
      if (gap > 0) {
        body.style.paddingRight = `${gap}px`;
        // Fixed elements (the navbar) read this to stay put.
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

const isTypingTarget = (el) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/**
 * Palette shortcuts: ⌘K / Ctrl+K toggles, "/" opens when not typing, and the
 * OPEN_PALETTE window event (openPalette() from anywhere) opens.
 * `setOpen` receives a boolean or an updater, like a state setter.
 */
export function usePaletteHotkeys(setOpen) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.isComposing || event.altKey) return;
      const mod = event.metaKey || event.ctrlKey;
      if (mod && !event.shiftKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((open) => !open);
      } else if (
        event.key === '/' &&
        !mod &&
        !event.defaultPrevented &&
        !isTypingTarget(event.target)
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
