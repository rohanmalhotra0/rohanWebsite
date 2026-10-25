// Which modifier the palette shortcut uses: ⌘ on Apple devices, Ctrl elsewhere.

function detectApple() {
  if (typeof navigator === 'undefined') return false;
  const platform =
    navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}

export const IS_APPLE = detectApple();

/** Visible label for the shortcut hint, e.g. in a <Kbd>. */
export const PALETTE_SHORTCUT = IS_APPLE ? '⌘K' : 'Ctrl K';

/** Value for aria-keyshortcuts. */
export const PALETTE_SHORTCUT_ARIA = IS_APPLE ? 'Meta+K' : 'Control+K';
