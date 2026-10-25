// Small window-event bus so distant components can talk without shared state.
import { normalizePath, routeById } from '@/routes';
import { navigate } from './router';

export const OPEN_PALETTE = 'rm:open-palette';
export const FOCUS_CHAT = 'rm:focus-chat';

/** Open the ⌘K command palette. */
export const openPalette = () =>
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE));

// A question asked from another page, waiting for the Chat page to mount.
let pendingChat = null;

/**
 * Bring up the chat, focus its input, and optionally send `prompt`. From
 * another page this goes to the Chat page first, which picks the question up
 * with takePendingChat().
 */
export function focusChat(prompt) {
  const chat = routeById('chat');
  if (normalizePath(window.location.pathname) !== chat.path) {
    pendingChat = { prompt };
    navigate(chat.path);
    return;
  }
  window.dispatchEvent(new CustomEvent(FOCUS_CHAT, { detail: { prompt } }));
}

/** The question focusChat() left for the Chat page, once; or null. */
export function takePendingChat() {
  const pending = pendingChat;
  pendingChat = null;
  return pending;
}
