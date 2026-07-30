import { memo, useCallback, useMemo } from 'react';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from '@chatscope/chat-ui-kit-react';
import { useRohanGPTChat } from '../services/rohangptService';

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
      className="relative scroll-mt-24 overflow-hidden bg-white px-4 py-16 text-black sm:px-8 sm:py-20 md:px-12 lg:px-16 lg:py-24"
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(#e8e8e8_1px,transparent_1px),linear-gradient(90deg,#e8e8e8_1px,transparent_1px)] bg-[size:44px_44px] opacity-60"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:rounded-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:items-center sm:px-5">
            <div>
              <p className="font-pixel text-[11px] text-gray-500">08 / ROHANGPT</p>
              <h2 className="mt-1 text-xl font-semibold text-gray-950">RohanGPT</h2>
            </div>
            <span className="inline-flex shrink-0 items-center rounded-full bg-gray-100 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 sm:px-3 sm:text-xs">
              Ask about my work
            </span>
          </div>
          <div className="h-[28rem] max-h-[65dvh] min-h-80 sm:h-[32rem] sm:max-h-[70dvh] sm:min-h-96">
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
                  placeholder="Ask RohanGPT…"
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
    </section>
  );
}

export default memo(RohanGPT);
