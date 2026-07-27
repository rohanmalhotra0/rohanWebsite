import { memo, useCallback, useMemo } from 'react';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from '@chatscope/chat-ui-kit-react';
import { Bot, Gauge, Sparkles } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { useRohanGPTChat } from '../services/rohangptService';

const suggestions = [
  'What did Rohan build at IBM?',
  'Explain the DRW and EPM work.',
  'Which projects should a recruiter see first?',
  'Summarize the Kalshi research.',
];

function RohanGPT() {
  const {
    messages,
    loading,
    error,
    sendMessage,
    messageListRef,
  } = useRohanGPTChat();

  const typingIndicator = useMemo(
    () =>
      loading ? (
        <div className="rgpt-typing-indicator" aria-live="polite">
          <span className="rgpt-typing-label">RohanGPT</span>
          <span className="rgpt-typing-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </div>
      ) : null,
    [loading]
  );

  const handleSend = useCallback(
    (text) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  return (
    <section
      id="rohangpt"
      className="relative scroll-mt-24 overflow-hidden bg-white px-5 py-24 text-black sm:px-8 md:px-12 lg:px-16 lg:py-32"
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(#e8e8e8_1px,transparent_1px),linear-gradient(90deg,#e8e8e8_1px,transparent_1px)] bg-[size:44px_44px] opacity-60"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="08 / ROHANGPT"
          title="Ask the portfolio."
          description="The most common questions answer instantly from a verified local profile. Broader questions use the live assistant when the production endpoint is connected."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-2xl border border-gray-200 bg-[#111] p-6 text-white shadow-sm sm:p-8">
            <div className="flex size-12 items-center justify-center rounded-xl bg-yellow-300 text-black">
              <Bot className="size-6" aria-hidden="true" />
            </div>
            <h3 className="mt-6 text-balance text-2xl font-semibold">
              A faster, cleaner RohanGPT.
            </h3>
            <p className="mt-3 text-pretty text-sm leading-6 text-white/60">
              Recruiter questions stay factual, project summaries stay current, and common answers do not need a network round trip.
            </p>

            <div className="mt-7 grid gap-3">
              <div className="flex gap-3 rounded-xl border border-white/15 p-4">
                <Gauge className="mt-0.5 size-5 shrink-0 text-yellow-300" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">Instant profile answers</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    IBM, DRW, Kalshi, research, skills, and résumé context.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-white/15 p-4">
                <Sparkles className="mt-0.5 size-5 shrink-0 text-yellow-300" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">Grounded portfolio mode</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    No invented employers, dates, metrics, or project claims.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="font-pixel text-[11px] text-white/40">TRY A PROMPT</p>
              <div className="mt-3 flex flex-col gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={loading}
                    onClick={() => sendMessage(suggestion)}
                    className="min-h-11 rounded-lg border border-white/15 px-3 py-2 text-left text-xs font-medium text-white/75 transition-colors duration-150 hover:bg-white/10 disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-950">RohanGPT</p>
                <p className="mt-0.5 text-xs text-gray-500">Portfolio guide</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
                Instant answers ready
              </span>
            </div>
            <div className="h-[34rem] max-h-[70dvh] min-h-96">
              <MainContainer>
                <ChatContainer>
                  <MessageList ref={messageListRef} typingIndicator={typingIndicator}>
                    {messages.map((message) => (
                      <Message
                        key={message.id}
                        model={{
                          message: message.content,
                          sender: message.role,
                          direction:
                            message.role === 'user' ? 'outgoing' : 'incoming',
                        }}
                      />
                    ))}
                  </MessageList>
                  <MessageInput
                    placeholder="Ask about the work…"
                    onSend={handleSend}
                    disabled={loading}
                    attachButton={false}
                  />
                </ChatContainer>
              </MainContainer>
            </div>
            {error ? (
              <p className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(RohanGPT);
