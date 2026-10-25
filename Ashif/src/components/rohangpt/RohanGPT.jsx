import { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import Reveal from '@/components/primitives/Reveal';
import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import useMediaQuery from '@/hooks/useMediaQuery';
import { FOCUS_CHAT } from '@/lib/events';
import { useRohanGPTChat } from '@/services/rohangptService';
import ChatPanel from './ChatPanel';
import SuggestionList from './SuggestionList';

const DESCRIPTION =
  'Answers come from my résumé and project notes. If it doesn’t know something, it says so.';
const SUGGESTIONS_TITLE_ID = 'rohangpt-suggestions-title';
// Room for the fixed navbar; matches the page's scroll-padding-top.
const NAV_CLEARANCE = 80;
const EDGE = 24;

/** Scroll the page so the panel is fully visible, with the heading too if it fits. */
function bringIntoView(panel, smooth) {
  if (!panel) return;
  const rect = panel.getBoundingClientRect();
  const viewport = window.innerHeight;
  if (rect.top >= NAV_CLEARANCE && rect.bottom <= viewport) return;

  const heading = panel.closest('section')?.querySelector('h2');
  const headingTop = heading ? heading.getBoundingClientRect().top : rect.top;
  const fits = rect.bottom - headingTop + 2 * EDGE <= viewport - NAV_CLEARANCE;
  const delta = fits ? headingTop - NAV_CLEARANCE - EDGE : rect.bottom + EDGE - viewport;
  window.scrollTo({ top: window.scrollY + delta, behavior: smooth ? 'smooth' : 'auto' });
}

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
              className="flex h-11 items-center text-[13px] text-subtle"
            >
              Suggested questions
            </h3>
            <SuggestionList labelledBy={SUGGESTIONS_TITLE_ID} onAsk={(question) => ask(question)} />
          </Reveal>

          <Reveal delay={0.06} className="lg:col-span-8">
            <ChatPanel
              chat={chat}
              inputRef={inputRef}
              panelRef={panelRef}
              onAsk={(question) => ask(question)}
              finePointer={finePointer}
            />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
