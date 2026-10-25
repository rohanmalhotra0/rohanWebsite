import { useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Markdown from './Markdown';
import { parseMarkdown } from './markdown';
import useTypewriter from './useTypewriter';

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;

// The log reads like a printed Q&A: each question is a plain line under a
// hairline, and its answer follows in body text. No avatars or bubbles.
const REPLY_TEXT = 'min-w-0 max-w-[62ch] text-[15px] leading-[1.65] text-muted';

export function Greeting({ children }) {
  return <p className={REPLY_TEXT}>{children}</p>;
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
      className="mt-3"
    >
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
      className="mt-7 border-t border-line pt-5 first:mt-0 first:border-t-0 first:pt-0"
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: EASE }}
    >
      <p className="max-w-[62ch] whitespace-pre-wrap break-words text-[15px] font-medium leading-[1.6] text-fg">
        <span className="sr-only">You: </span>
        {message.content}
      </p>
    </MotionDiv>
  );
}

/** A quiet line of text while the answer is on its way. */
export function TypingIndicator() {
  const reduceMotion = useReducedMotion();
  return (
    <MotionDiv
      data-role="typing"
      className="mt-3 text-[15px] leading-[1.65] text-subtle"
      initial={{ opacity: 0.45 }}
      animate={reduceMotion ? { opacity: 0.8 } : { opacity: [0.45, 1, 0.45] }}
      transition={reduceMotion ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      Thinking…
    </MotionDiv>
  );
}
