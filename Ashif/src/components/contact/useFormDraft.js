import { useCallback, useEffect, useRef, useState } from 'react';

const KEY = 'rm-contact-draft';
const SAVE_DELAY_MS = 300;

function readDraft(empty) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return empty;
    // Only the known string fields come back; anything else stored under the key is ignored.
    return Object.fromEntries(
      Object.keys(empty).map((key) => [key, typeof saved[key] === 'string' ? saved[key] : empty[key]])
    );
  } catch {
    return empty;
  }
}

function writeDraft(values) {
  try {
    if (Object.values(values).some((value) => value.trim())) {
      sessionStorage.setItem(KEY, JSON.stringify(values));
    } else {
      sessionStorage.removeItem(KEY);
    }
  } catch {
    // Storage blocked or full: the draft just won't survive leaving the page.
  }
}

/**
 * Form values that survive leaving the portfolio in this tab (it unmounts on
 * #/resume): restored on mount, saved to sessionStorage after a short pause and
 * again on unmount. clear() empties the form and the saved copy.
 * `empty` must be a stable object.
 */
export default function useFormDraft(empty) {
  const [values, setValues] = useState(() => readDraft(empty));
  const latest = useRef(values);

  useEffect(() => {
    latest.current = values;
    const timer = setTimeout(() => writeDraft(values), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [values]);

  // Leaving within the debounce window would drop the last keystrokes; save them now.
  useEffect(() => () => writeDraft(latest.current), []);

  const clear = useCallback(() => {
    latest.current = empty;
    writeDraft(empty);
    setValues(empty);
  }, [empty]);

  return [values, setValues, clear];
}
