import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { BadgeCheck } from 'lucide-react';
import Markdown from './Markdown';
import { countChars, parseMarkdown, toPlainText } from './markdown';
import useTypewriter from './useTypewriter';

const EASE = [0.16, 1, 0.3, 1];

export function Avatar() {
  return (
    <span
      aria-hidden="true"
      className="grid size-7 shrink-0 place-items-center rounded-lg border border-line-strong bg-surface-2 font-mono text-[10px] font-semibold tracking-tight text-fg"
    >
      RM
    </span>
  );
}

/** Fades a row in; static under reduced motion. */
function Row({ className, children }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function UserMessage({ content }) {
  return (
    <Row className="flex justify-end">
      <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md border border-line bg-surface-2 px-3.5 py-2 text-[15px] leading-6 text-fg">
        <span className="sr-only">You said: </span>
        {content}
      </p>
    </Row>
  );
}

export function AssistantMessage({ content, source }) {
  const blocks = useMemo(() => parseMarkdown(content), [content]);
  const total = useMemo(() => countChars(blocks), [blocks]);
  const { count, typing } = useTypewriter(total);

  return (
    <Row className="flex gap-3">
      <Avatar />
      <div className="min-w-0 flex-1 pt-0.5">
        <span className="sr-only">RohanGPT said: </span>
        {/* Screen readers get the whole reply at once; the visual copy types out. */}
        {typing ? <span className="sr-only">{toPlainText(blocks)}</span> : null}
        <Markdown
          blocks={blocks}
          limit={count}
          typing={typing}
          aria-hidden={typing || undefined}
          className="break-words text-[15px] leading-7 text-muted"
        />
        {source === 'profile' && !typing ? (
          <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            <BadgeCheck aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
            From my verified profile
          </p>
        ) : null}
      </div>
    </Row>
  );
}

export function TypingIndicator() {
  const reduceMotion = useReducedMotion();
  return (
    <Row className="flex items-center gap-3">
      <Avatar />
      <span className="sr-only">RohanGPT is typing…</span>
      <span aria-hidden="true" className="flex h-7 items-center gap-1 px-1">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="size-1.5 rounded-full bg-muted"
            animate={reduceMotion ? { opacity: 0.6 } : { opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 0.9, repeat: Infinity, delay: dot * 0.15, ease: 'easeInOut' }
            }
          />
        ))}
      </span>
    </Row>
  );
}
