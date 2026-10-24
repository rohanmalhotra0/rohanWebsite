import { useSyncExternalStore } from 'react';

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
});

// Cache per minute so useSyncExternalStore gets a stable object between ticks.
let cachedMinute = -1;
let cachedValue = { time: '', zone: '' };

function getSnapshot() {
  const minute = Math.floor(Date.now() / 60000);
  if (minute !== cachedMinute) {
    cachedMinute = minute;
    const parts = formatter.formatToParts(new Date());
    cachedValue = {
      time: parts
        .filter((part) => part.type !== 'timeZoneName')
        .map((part) => part.value)
        .join('')
        .trim(),
      zone: parts.find((part) => part.type === 'timeZoneName')?.value ?? '',
    };
  }
  return cachedValue;
}

function subscribe(onChange) {
  let interval;
  // Line the ticks up with the top of each minute so the clock flips on time.
  const timeout = setTimeout(() => {
    onChange();
    interval = setInterval(onChange, 60000);
  }, 60000 - (Date.now() % 60000));
  // Background tabs throttle timers; catch up as soon as the tab is visible again.
  document.addEventListener('visibilitychange', onChange);

  return () => {
    clearTimeout(timeout);
    clearInterval(interval);
    document.removeEventListener('visibilitychange', onChange);
  };
}

/** Live New York local time, e.g. { time: '7:03 PM', zone: 'EDT' }. Updates each minute. */
export default function useNewYorkTime() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
