import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { whenIdle } from '@/lib/idle';

export const MINUTE = 60_000;

const currentMinute = () => Math.floor(Date.now() / MINUTE);

// One timer shared by everything that shows "now" to the minute (the New York
// clock and the GitHub "3 hours ago"), lined up with the top of each minute.
const listeners = new Set();
let timer;

const notify = () => listeners.forEach((listener) => listener());

function schedule() {
  timer = setTimeout(() => {
    notify();
    schedule();
  }, MINUTE - (Date.now() % MINUTE));
}

function subscribe(listener) {
  if (!listeners.size) {
    schedule();
    // Hidden tabs throttle timers; catch up as soon as the tab is visible again.
    document.addEventListener('visibilitychange', notify);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', notify);
    }
  };
}

/** Start of the current minute (ms since epoch); re-renders when the minute changes. */
/**
 * The current minute as a timestamp, or null while hydrating: the prerendered
 * HTML was made at build time, so it carries no clock reading.
 */
export function useMinute() {
  const minute = useSyncExternalStore(subscribe, currentMinute, () => null);
  return minute === null ? null : minute * MINUTE;
}

// The first Intl.DateTimeFormat on a page sets up the date formats: a long
// task on a phone. So it's built only once the About page is up, in an idle
// moment after it mounts: never while the router preloads this module on
// another page, and never inside the render of a page change.
let newYork = null;
const newYorkTime = () =>
  (newYork ??= new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  }));

/**
 * Live New York time, e.g. { label: '7:16 pm', iso: '2026-10-24T23:16:00.000Z' },
 * or null until the formatter is ready after the first client render.
 */
export function useNewYorkTime() {
  const now = useMinute();
  const [ready, setReady] = useState(() => newYork !== null);
  useEffect(() => {
    if (ready) return undefined;
    return whenIdle(
      () => {
        newYorkTime();
        setReady(true);
      },
      { timeout: 500 }
    );
  }, [ready]);
  return useMemo(() => {
    if (now === null || !ready) return null;
    const label = newYorkTime()
      .formatToParts(now)
      .map(({ type, value }) => {
        if (type === 'dayPeriod') return value.toLowerCase();
        // Keep "7:16 pm" on one line.
        if (type === 'literal' && /^\s+$/.test(value)) return '\u00a0';
        return value;
      })
      .join('');
    return { label, iso: new Date(now).toISOString() };
  }, [now, ready]);
}
