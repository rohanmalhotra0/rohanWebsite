import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from '@chatscope/chat-ui-kit-react';
import { Highlighter } from '@/components/ui/highlighter';
import { GridPattern } from "@/components/ui/grid-pattern";
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
  const [kbOffset, setKbOffset] = useState(0);

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

  const { messages, loading, error, sendMessage, messageListRef, scrollMessagesToBottom } = useRohanGPTChat({ visitorName });

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
    if (!isMobile) return;

    const vv = window.visualViewport;
    if (!vv) return;

    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        setKbOffset(offset);
      });
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();

    return () => {
      cancelAnimationFrame(raf);
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [isMobile]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    let blurTimer = null;

    const onFocusIn = () => {
      if (window.innerWidth < 768) document.documentElement.classList.add('rgpt-focused');
      setTimeout(() => {
        recomputeChatHeight();
        scrollMessagesToBottom?.();
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
  }, [recomputeChatHeight, scrollMessagesToBottom]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const setInView = (inView) => {
      document.documentElement.classList.toggle('rgpt-inview', Boolean(inView));
    };

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting && (entry.intersectionRatio || 0) > 0.15),
      { threshold: [0, 0.15] }
    );
    io.observe(node);

    return () => {
      io.disconnect();
      document.documentElement.classList.remove('rgpt-inview');
    };
  }, []);

  const senderLabel = useMemo(() => (visitorName || '').trim() || 'You', [visitorName]);

  const typingIndicator = useMemo(
    () =>
      loading ? (
        <div className="rgpt-typing-indicator" aria-live="polite" aria-label="RohanGPT is typing">
          <span className="rgpt-typing-label">RohanGPT</span>
          <span className="rgpt-typing-text">typing</span>
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
      ref={sectionRef}
      id="rohangpt"
      className="relative w-full bg-white text-black py-14 sm:py-20 overflow-hidden"
    >
      <GridPattern
        width={44}
        height={44}
        className="fill-gray-300/20 stroke-gray-300/55 [mask-image:radial-gradient(620px_circle_at_center,white,transparent)]"
      />

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-5xl font-bold font-pixel underline-wavy-yellow inline-block">
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
            <div className="px-4 py-3 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-gray-800">RohanGPT</div>
                <button
                  type="button"
                  className="text-sm rounded-full border border-gray-300 px-3 py-1.5 bg-white"
                  onClick={() => {
                    const next = prompt('What should I call you?', visitorName || '');
                    if (next !== null) setVisitorName(next);
                  }}
                >
                  {visitorName?.trim() ? `Name: ${visitorName}` : 'Set name'}
                </button>
              </div>
            </div>
            <div
              ref={chatFrameRef}
              className="h-[560px]"
              style={
                isMobile
                  ? {
                      height: `${chatHeight}px`,
                      paddingBottom: `${kbOffset}px`,
                    }
                  : undefined
              }
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
                    placeholder={`${senderLabel}: Ask RohanGPT anything...`}
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

