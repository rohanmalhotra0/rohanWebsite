import { useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AssistantMessage, Greeting, TypingIndicator, UserMessage } from './ChatMessage';
import Composer from './Composer';
import { GREETING } from './prompts';
import SuggestionList from './SuggestionList';
import useStickToBottom from './useStickToBottom';
import { TYPEWRITER_CSS } from './useTypewriter';

const TITLE_ID = 'rohangpt-conversation-title';

/** The conversation panel: header, scrolling messages, and the question box. */
export default function ChatPanel({ chat, inputRef, panelRef, onAsk, finePointer }) {
  const { messages, loading, error, sendMessage, retry, reset } = chat;
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const hasMessages = messages.length > 0;
  const { scrollToBottom, revealReply } = useStickToBottom(scrollRef, contentRef, hasMessages);
  const last = messages[messages.length - 1];

  // A new question always jumps to the bottom; a new reply is shown from its
  // start; an empty conversation reads from the top.
  useLayoutEffect(() => {
    if (!last) {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      return;
    }
    if (last.role === 'user') scrollToBottom();
    else revealReply(contentRef.current?.querySelector(`[data-message-id="${last.id}"]`));
  }, [last, scrollToBottom, revealReply]);

  const clear = () => {
    reset();
    // The Clear button goes away with the messages, so move focus somewhere
    // useful. On touch screens, focusing the input would open the keyboard.
    (finePointer ? inputRef.current : scrollRef.current)?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={panelRef}
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-line bg-surface',
        // Empty, the panel is only as tall as its greeting and question box;
        // it takes its scrolling height once the conversation starts.
        hasMessages
          ? 'h-[70svh] max-h-[640px] min-h-[440px] lg:h-[560px] lg:max-h-none'
          : 'lg:min-h-[17.5rem]'
      )}
    >
      <style href="rohangpt-typewriter" precedence="default">
        {TYPEWRITER_CSS}
      </style>

      <div className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-line pl-4 pr-1 sm:pl-5">
        <h3 id={TITLE_ID} className="text-[13px] text-subtle">
          Conversation
        </h3>
        {hasMessages ? (
          <button
            type="button"
            onClick={clear}
            className="h-11 rounded-md px-3 text-[13px] text-subtle transition-colors duration-150 hover:text-fg"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        role="region"
        aria-labelledby={TITLE_ID}
        tabIndex={0}
        className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:var(--line-strong)_transparent] [scrollbar-width:thin] focus-visible:outline-offset-[-2px] lg:overscroll-contain"
      >
        <div ref={contentRef} className="flex min-h-full flex-col justify-end p-4 sm:px-5 sm:py-5">
          <Greeting>{GREETING}</Greeting>
          {hasMessages ? null : (
            <SuggestionList onAsk={onAsk} compact className="ml-10 mt-3 lg:hidden" />
          )}
          <div
            role="log"
            aria-live="polite"
            aria-label="Messages"
            className="mt-6 flex flex-col gap-6 empty:mt-0"
          >
            {messages.map((message) =>
              message.role === 'user' ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AssistantMessage key={message.id} message={message} />
              )
            )}
            {loading ? <TypingIndicator /> : null}
          </div>
        </div>
      </div>

      <Composer
        inputRef={inputRef}
        busy={loading}
        onSend={sendMessage}
        error={error}
        onRetry={retry}
      />
    </div>
  );
}
