import React, { memo, useCallback, useMemo } from 'react';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import { Highlighter } from '@/components/ui/highlighter';
import { useRohanGPTChat } from '../services/rohangptService';

function RohanGPT() {
  const { messages, loading, error, sendMessage, messageListRef } = useRohanGPTChat();

  const typingIndicator = useMemo(
    () => (loading ? <TypingIndicator content="RohanGPT is typing" /> : null),
    [loading]
  );

  const handleSend = useCallback(
    (text) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  return (
    <section id="rohangpt" className="w-full bg-white text-black py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-5xl font-bold font-pixel inline-block">
            <Highlighter action="underline" color="#FFD700">
              RohanGPT
            </Highlighter>
          </h2>
          <p className="mt-3 text-sm text-gray-600 max-w-xl mx-auto">
            Ask about systems work, research themes, or project details.
          </p>
        </div>

        <div className="max-w-screen-md mx-auto">
          <div className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden bg-white">
            <div className="h-[560px]">
              <MainContainer>
                <ChatContainer>
                  <MessageList ref={messageListRef} typingIndicator={typingIndicator}>
                    {messages.map((m) => (
                      <Message
                        key={m.id}
                        model={{
                          message: m.content,
                          sender: m.role,
                          direction: m.role === 'user' ? 'outgoing' : 'incoming',
                        }}
                      />
                    ))}
                  </MessageList>
                  <MessageInput
                    placeholder="Ask RohanGPT anything..."
                    onSend={handleSend}
                    disabled={loading}
                    attachButton={false}
                  />
                </ChatContainer>
              </MainContainer>
            </div>

            {error && (
              <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border-t border-red-100">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(RohanGPT);

