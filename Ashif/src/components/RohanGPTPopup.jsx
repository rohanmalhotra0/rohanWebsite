import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from '@chatscope/chat-ui-kit-react';
import { useRohanGPTChat } from '../services/rohangptService';

function RohanGPTPopup() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    try {
      return window.innerWidth < 768;
    } catch {
      return false;
    }
  });

  const [visitorName, setVisitorName] = useState(() => {
    try {
      return localStorage.getItem('rgpt_name') || '';
    } catch {
      return '';
    }
  });

  const panelRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    try {
      if (visitorName) localStorage.setItem('rgpt_name', visitorName);
    } catch {
      // ignore storage failures
    }
  }, [visitorName]);

  // Sync visitor name from storage when popup opens (picks up changes from the section)
  useEffect(() => {
    if (!open) return;
    try {
      const stored = localStorage.getItem('rgpt_name') || '';
      if (stored !== visitorName) setVisitorName(stored);
    } catch {
      // ignore
    }
  }, [open]);

  const { messages, loading, error, sendMessage, messageListRef, scrollMessagesToBottom } =
    useRohanGPTChat({ visitorName });

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // When popup opens, scroll to latest
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => scrollMessagesToBottom?.(), 60);
    return () => clearTimeout(t);
  }, [open, scrollMessagesToBottom]);

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

  const toggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Close RohanGPT chat' : 'Open RohanGPT chat'}
        aria-expanded={open}
        aria-controls="rohangpt-popup"
        onClick={toggle}
        className="rgpt-popup-toggle"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2V5z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="12" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
          </svg>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          id="rohangpt-popup"
          role="dialog"
          aria-label="RohanGPT chat"
          aria-modal={isMobile ? 'true' : 'false'}
          className="rgpt-popup-panel"
        >
          <div className="rgpt-popup-header">
            <div className="rgpt-popup-title">RohanGPT</div>
            <div className="rgpt-popup-actions">
              <button
                type="button"
                className="rgpt-popup-name-btn"
                onClick={() => {
                  const next = prompt('What should I call you?', visitorName || '');
                  if (next !== null) setVisitorName(next);
                }}
              >
                {visitorName?.trim() ? `Name: ${visitorName}` : 'Set name'}
              </button>
              <button
                type="button"
                aria-label="Close"
                className="rgpt-popup-close"
                onClick={() => setOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="rgpt-popup-body">
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

          {error && <div className="rgpt-popup-error">{error}</div>}
        </div>
      )}
    </>
  );
}

export default memo(RohanGPTPopup);
