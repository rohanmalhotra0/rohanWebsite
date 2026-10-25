import { useLayoutEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { MAX_INPUT_CHARS } from '@/services/rohangptService';

const INPUT_ID = 'rohangpt-input';
const ERROR_ID = 'rohangpt-error';
const MAX_INPUT_HEIGHT = 160;

/**
 * The question box. Enter sends, Shift+Enter adds a line. While a reply is
 * pending it is read-only (not disabled) so it keeps focus.
 */
export default function Composer({ inputRef, busy, onSend, error, onRetry, onClear }) {
  const [draft, setDraft] = useState('');
  const canSend = draft.trim().length > 0 && !busy;

  // Grow with the text, up to a cap.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, MAX_INPUT_HEIGHT)}px`;
  }, [draft, inputRef]);

  const submit = () => {
    if (canSend && onSend(draft)) setDraft('');
  };

  const onKeyDown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    // The Enter that confirms an IME composition is not a send.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    submit();
  };

  return (
    <form
      className="shrink-0 border-t border-line p-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="flex items-end gap-2 rounded-lg border border-input bg-bg py-1.5 pl-3.5 pr-1.5 transition-colors duration-150 has-[textarea:focus]:border-accent-strong">
        <label htmlFor={INPUT_ID} className="sr-only">
          Your question
        </label>
        <textarea
          id={INPUT_ID}
          ref={inputRef}
          rows={1}
          value={draft}
          maxLength={MAX_INPUT_CHARS}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          readOnly={busy}
          aria-disabled={busy || undefined}
          aria-describedby={error ? ERROR_ID : undefined}
          enterKeyHint="send"
          autoComplete="off"
          placeholder="Ask a question"
          className="block min-h-11 flex-1 resize-none bg-transparent py-2.5 text-base leading-6 text-fg outline-none transition-opacity placeholder:text-subtle focus-visible:outline-none aria-disabled:opacity-60 pointer-fine:min-h-9 pointer-fine:py-1.5"
        />
        <button
          type="submit"
          aria-label="Send"
          aria-disabled={!canSend}
          // Keep focus (and the phone keyboard) in the textarea when tapped.
          onPointerDown={(event) => event.preventDefault()}
          className="grid size-11 shrink-0 place-items-center rounded-md text-fg transition-[background-color,color,scale] duration-150 hover:bg-surface-2 active:scale-95 aria-disabled:cursor-default aria-disabled:text-subtle aria-disabled:hover:bg-transparent aria-disabled:active:scale-100 pointer-fine:size-9"
        >
          <ArrowUp aria-hidden="true" className="size-[18px]" strokeWidth={2} />
        </button>
      </div>
      {error || onClear ? (
        <div className="mt-2 flex items-start justify-between gap-4 px-1 text-[13px] leading-5">
          {error ? (
            <p id={ERROR_ID} role="alert" className="text-accent-strong">
              {error}{' '}
              <button type="button" onClick={onRetry} className="link font-medium text-fg">
                Try again
              </button>
            </p>
          ) : (
            <span />
          )}
          {onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="-my-3 shrink-0 px-1 py-3 text-subtle transition-colors duration-150 hover:text-fg"
            >
              Clear
            </button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
