// Small window-event bus so distant components can talk without shared state.

export const OPEN_PALETTE = 'rm:open-palette';
export const FOCUS_CHAT = 'rm:focus-chat';

/** Open the ⌘K command palette. */
export const openPalette = () =>
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE));

/** Scroll to RohanGPT, focus its input, and optionally send `prompt`. */
export const focusChat = (prompt) =>
  window.dispatchEvent(new CustomEvent(FOCUS_CHAT, { detail: { prompt } }));
