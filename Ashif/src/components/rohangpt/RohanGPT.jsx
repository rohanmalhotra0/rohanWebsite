import { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import Reveal from '@/components/primitives/Reveal';
import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import useMediaQuery from '@/hooks/useMediaQuery';
import { FOCUS_CHAT } from '@/lib/events';
import { useRohanGPTChat } from '@/services/rohangptService';
import bringIntoView from './bringIntoView';
import ChatPanel from './ChatPanel';
import SuggestionList from './SuggestionList';

const DESCRIPTION =
  'Answers come from my résumé and project notes. If it doesn’t know something, it says so.';
const SUGGESTIONS_TITLE_ID = 'rohangpt-suggestions-title';

export default function RohanGPT() {
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

  // The hero, navbar, and command palette open the chat with focusChat(prompt?).
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
    <Section id="rohangpt">
      <Container>
        <SectionHeader title="Ask about my work" description={DESCRIPTION} />

        <div className="mt-12 grid gap-8 sm:mt-16 lg:grid-cols-12">
          <Reveal className="hidden lg:col-span-4 lg:block">
            <h3
              id={SUGGESTIONS_TITLE_ID}
              className="flex h-12 items-center text-[13px] text-subtle"
            >
              Suggested questions
            </h3>
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
      </Container>
    </Section>
  );
}
