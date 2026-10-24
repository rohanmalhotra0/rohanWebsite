import { useCallback, useEffect, useRef, useState } from 'react';

// Older browsers and non-secure contexts have no async clipboard API.
function legacyCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  textarea.remove();
  return ok;
}

/**
 * copy(text) writes to the clipboard; `status` is 'idle' | 'copied' | 'failed'
 * and falls back to 'idle' after `resetMs`.
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
