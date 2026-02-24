import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const sectionRef = useRef(null);
  const chatFrameRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() => {
    try {
      return window.innerWidth < 768;
    } catch {
      return false;
    }
  });

  const [chatHeight, setChatHeight] = useState(560);

  const [visitorName, setVisitorName] = useState(() => {
    try {
      return localStorage.getItem('rgpt_name') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    try {
      if (visitorName) localStorage.setItem('rgpt_name', visitorName);
      else localStorage.removeItem('rgpt_name');
    } catch {
      // ignore storage failures (private mode, disabled storage, etc.)
    }
  }, [visitorName]);

  const recomputeChatHeight = useCallback(() => {
    const el = chatFrameRef.current;
    if (!el) return;

    const vv = window.visualViewport;
    const viewportHeight = vv?.height ?? window.innerHeight;
    const top = el.getBoundingClientRect().top;
    const available = Math.floor(viewportHeight - top - 12);
    const clamped = Math.max(320, Math.min(560, available));
    setChatHeight(clamped);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const vv = window.visualViewport;
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recomputeChatHeight);
    };

    schedule();
    window.addEventListener('resize', schedule);
    vv?.addEventListener('resize', schedule);
    vv?.addEventListener('scroll', schedule);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', schedule);
      vv?.removeEventListener('resize', schedule);
      vv?.removeEventListener('scroll', schedule);
    };
  }, [isMobile, recomputeChatHeight]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    let blurTimer = null;

    const onFocusIn = () => {
      if (window.innerWidth < 768) document.documentElement.classList.add('rgpt-focused');
      // Give iOS a moment to open the keyboard, then recompute + scroll.
      setTimeout(() => {
        recomputeChatHeight();
        chatFrameRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
      }, 50);
    };

    const onFocusOut = () => {
      if (blurTimer) window.clearTimeout(blurTimer);
      blurTimer = window.setTimeout(() => {
        if (!node.contains(document.activeElement)) {
          document.documentElement.classList.remove('rgpt-focused');
        }
      }, 0);
    };

    node.addEventListener('focusin', onFocusIn);
    node.addEventListener('focusout', onFocusOut);

    return () => {
      if (blurTimer) window.clearTimeout(blurTimer);
      node.removeEventListener('focusin', onFocusIn);
      node.removeEventListener('focusout', onFocusOut);
      document.documentElement.classList.remove('rgpt-focused');
    };
  }, [recomputeChatHeight]);

  const { messages, loading, error, sendMessage, messageListRef } = useRohanGPTChat({ visitorName });

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
    <section ref={sectionRef} id="rohangpt" className="w-full bg-white text-black py-14 sm:py-20">
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
          <div className="mb-4 flex justify-center">
            <div className="w-full max-w-sm text-left">
              <label htmlFor="rgpt-name" className="block text-sm font-medium text-gray-700">
                Your name
              </label>
              <input
                id="rgpt-name"
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="e.g., Zach"
                autoComplete="name"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
          </div>
          <div className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden bg-white">
            <div
              ref={chatFrameRef}
              className="h-[560px]"
              style={isMobile ? { height: `${chatHeight}px` } : undefined}
            >
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

