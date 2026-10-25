import { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import Reveal from '@/components/primitives/Reveal';
import useMediaQuery from '@/hooks/useMediaQuery';
import { FOCUS_CHAT, takePendingChat } from '@/lib/events';
import { cn } from '@/lib/utils';
import { useRohanGPTChat } from '@/services/rohangptService';
import bringIntoView from './bringIntoView';
import ChatPanel from './ChatPanel';
import SuggestionList from './SuggestionList';

const SUGGESTIONS_TITLE_ID = 'rohangpt-suggestions-title';

/** Suggested questions beside the conversation (desktop), or inside it (phones). */
export default function RohanGPT({ className }) {
  const chat = useRohanGPTChat();
  const { sendMessage } = chat;
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const finePointer = useMediaQuery('(pointer: fine)');
  const reduceMotion = useReducedMotion();

  const ask = useCallback(
    (prompt, { focusInput = finePointer } = {}) => {
      bringIntoView(panelRef.current, !reduceMotion);
      if (focusInput) inputRef.current?.focus({ preventScroll: true });
      if (prompt) sendMessage(prompt);
    },
    [finePointer, reduceMotion, sendMessage]
  );

  // A question asked on another page (the palette, the home page) arrives
  // with the page change. Picked up a frame after mounting, once the page
  // change has settled (and only once under StrictMode's double effects).
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const pending = takePendingChat();
      if (pending) ask(pending.prompt, { focusInput: finePointer || !pending.prompt });
    });
    return () => cancelAnimationFrame(frame);
  }, [ask, finePointer]);

  // On this page, the palette opens the chat with focusChat(prompt?).
  useEffect(() => {
    let frame = 0;
    const onFocusChat = (event) => {
      const prompt = typeof event.detail?.prompt === 'string' ? event.detail.prompt.trim() : '';
      cancelAnimationFrame(frame);
      // Wait a frame so whatever fired this (a closing dialog) has let go of focus.
      frame = requestAnimationFrame(() =>
        // On touch screens the keyboard would cover the reply, so focus only
        // when there is nothing to send.
        ask(prompt, { focusInput: finePointer || !prompt })
      );
    };
    window.addEventListener(FOCUS_CHAT, onFocusChat);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(FOCUS_CHAT, onFocusChat);
    };
  }, [ask, finePointer]);

  return (
    <div className={cn('grid gap-8 lg:grid-cols-12', className)}>
      <Reveal className="hidden lg:col-span-4 lg:block">
        <h2 id={SUGGESTIONS_TITLE_ID} className="flex h-12 items-center text-[13px] text-subtle">
          Suggested questions
        </h2>
        <SuggestionList labelledBy={SUGGESTIONS_TITLE_ID} onAsk={ask} />
      </Reveal>

      <Reveal delay={0.06} className="lg:col-span-8">
        <ChatPanel
          chat={chat}
          inputRef={inputRef}
          panelRef={panelRef}
          onAsk={ask}
          finePointer={finePointer}
        />
      </Reveal>
    </div>
  );
}
