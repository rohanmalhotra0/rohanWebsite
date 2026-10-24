import { useCallback, useEffect, useRef, useState } from 'react';

// Fallback for browsers or insecure contexts without the async clipboard API.
function legacyCopy(text) {
  const previous = document.activeElement;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  // 16px keeps iOS from zooming in when the textarea takes focus.
  Object.assign(textarea.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    fontSize: '16px',
    opacity: '0',
  });
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  textarea.remove();
  // Selecting the textarea stole focus; hand it back to the button.
  previous?.focus?.({ preventScroll: true });
  return ok;
}

/**
 * copy(text) writes to the clipboard. `status` is 'idle' | 'copied' | 'failed'
 * and returns to 'idle' after `resetMs`.
 */
export default function useCopyToClipboard(resetMs = 2000) {
  const [status, setStatus] = useState('idle');
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text) => {
      let ok = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          ok = true;
        } else {
          ok = legacyCopy(text);
        }
      } catch {
        ok = legacyCopy(text);
      }
      setStatus(ok ? 'copied' : 'failed');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus('idle'), resetMs);
    },
    [resetMs]
  );

  return { status, copy };
}
