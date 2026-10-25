import { useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Markdown from './Markdown';
import { parseMarkdown } from './markdown';
import useTypewriter from './useTypewriter';

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;
const MotionSpan = motion.span;

// Shared by replies and the greeting so their text lines up exactly.
const REPLY_TEXT = 'min-w-0 max-w-[62ch] flex-1 pt-0.5 text-[15px] leading-[1.65] text-muted';

function Avatar() {
  return (
    <span
      aria-hidden="true"
      className="type-heading grid size-7 shrink-0 select-none place-items-center rounded-full bg-fg text-[12px] text-bg"
    >
      R
    </span>
  );
}

export function Greeting({ children }) {
  return (
    <div className="flex gap-3">
      <Avatar />
      <p className={REPLY_TEXT}>{children}</p>
    </div>
  );
}

export function AssistantMessage({ message }) {
  const reduceMotion = useReducedMotion();
  const blocks = useMemo(() => parseMarkdown(message.content), [message.content]);
  const textRef = useRef(null);
  useTypewriter(textRef, !reduceMotion);

  return (
    <div
      data-message-id={message.id}
      data-role="assistant"
      data-source={message.source}
      className="flex gap-3"
    >
      <Avatar />
      <div className={REPLY_TEXT}>
        <span className="sr-only">Rohan: </span>
        <Markdown ref={textRef} blocks={blocks} className="break-words" />
      </div>
    </div>
  );
}

export function UserMessage({ message }) {
  const reduceMotion = useReducedMotion();
  return (
    <MotionDiv
      data-message-id={message.id}
      data-role="user"
      className="flex justify-end"
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: EASE }}
    >
      <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-lg bg-surface-2 px-3.5 py-2 text-[15px] leading-[1.6] text-fg">
        <span className="sr-only">You: </span>
        {message.content}
      </p>
    </MotionDiv>
  );
}

export function TypingIndicator() {
  const reduceMotion = useReducedMotion();
  return (
    <div data-role="typing" className="flex items-center gap-3">
      <Avatar />
      <span className="sr-only">Writing a reply…</span>
      <span aria-hidden="true" className="flex h-7 items-center gap-1.5 pl-0.5">
        {[0, 1, 2].map((dot) => (
          <MotionSpan
            key={dot}
            className="size-1.5 rounded-full bg-subtle"
            initial={{ opacity: 0.3 }}
            animate={reduceMotion ? { opacity: 0.6 } : { opacity: [0.3, 1, 0.3] }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 1.2, repeat: Infinity, delay: dot * 0.18, ease: 'easeInOut' }
            }
          />
        ))}
      </span>
    </div>
  );
}
