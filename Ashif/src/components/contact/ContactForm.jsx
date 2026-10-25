import { useEffect, useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, CircleAlert, LoaderCircle } from 'lucide-react';
import Button from '@/components/primitives/Button';
import { Kbd, ModKey } from '@/components/primitives/Tag';
import { formspreeUrl } from '@/data/portfolioData';
import useMediaQuery from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import Stamp from './Stamp';
import useFormDraft from './useFormDraft';
import {
  EMAIL_PATTERN,
  FIELD_LABELS,
  FIELDS,
  SEND_FAILED,
  invalidSummary,
  mailtoWith,
  validationMessage,
} from './validation';

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;
const MotionSpan = motion.span;

const EMPTY = { name: '', email: '', message: '' };
const TIMEOUT_MS = 15000;

// Lines on the postcard: a faint fill over a 3:1 rule. accent-strong keeps the
// focused rule at 3:1+ on every surface, and it doubles in weight.
const inputClass = cn(
  'block w-full rounded-t-md border-0 border-b-2 border-input bg-fg/[0.035] px-3 text-base text-fg',
  'transition-[border-color,box-shadow,background-color] duration-150 ease-out placeholder:text-subtle',
  'hover:border-fg/70 focus-visible:outline-hidden focus:border-accent-strong focus:bg-fg/[0.06] focus:shadow-[0_2px_0_0_var(--accent-strong)]',
  'aria-[invalid=true]:border-accent-strong',
  // Keep browser autofill from painting its own background over the theme.
  'autofill:inset-shadow-[0_0_0_100px_var(--surface)] autofill:[-webkit-text-fill-color:var(--fg)]'
);

function Field({ id, label, error, className, children }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className={cn('pb-4', className)}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {/* Reserved slot, 4px under its own field and 16px above the next, so a message
          never pushes the form around and clearly belongs to the field it describes. */}
      <div id={`${id}-error`} className="mt-1 min-h-5 text-[13px] leading-5 text-accent-strong">
        {error ? (
          <MotionSpan
            key={error}
            initial={reduceMotion ? false : { opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="flex items-center gap-1.5"
          >
            <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
            {error}
          </MotionSpan>
        ) : null}
      </div>
    </div>
  );
}

function Success({ onReset }) {
  const headingRef = useRef(null);

  // Move focus to the confirmation so screen readers announce it.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    // Clear of the stamp, and at least as tall, so the postmark lands on the card.
    <div className="grid min-h-[5.25rem] grid-cols-[auto_minmax(0,1fr)] gap-x-3 pr-[5.5rem] sm:min-h-[7.5rem] sm:gap-x-4 sm:pr-[7.75rem]">
      <Check
        aria-hidden="true"
        strokeWidth={2.5}
        className="mt-[3px] size-6 text-accent-strong sm:size-7"
      />
      <div>
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="type-heading text-balance text-[1.625rem] leading-[1.15] text-fg outline-none sm:text-3xl sm:leading-[1.15]"
        >
          Thanks, I’ll get back to you soon.
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="link mt-2 inline-flex min-h-11 items-center text-[15px] text-muted hover:text-fg"
        >
          Send another message
        </button>
      </div>
    </div>
  );
}

/**
 * Contact form. Posts to Formspree with fetch so the page never redirects.
 * Drawn on a postcard (Contact's Postcard), with the stamp in its corner.
 */
export default function ContactForm() {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const showShortcut = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 640px)');
  const [values, setValues, clearDraft] = useFormDraft(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  // Form-level status for screen readers; field errors are also tied to their inputs.
  const [announcement, setAnnouncement] = useState('');
  const request = useRef(null);
  const focusNameOnMount = useRef(false);

  // Abandon an in-flight request if the section unmounts.
  useEffect(() => () => request.current?.abort('unmount'), []);

  const sending = status === 'sending';
  const fieldId = (name) => `${id}-${name}`;
  const fieldProps = (name) => ({
    id: fieldId(name),
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    readOnly: sending,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${fieldId(name)}-error` : undefined,
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Once a field is flagged, re-check as they type so the message clears right away.
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validationMessage(event.target) }));
    }
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    if (!value) return; // Tabbing through empty fields is not an error yet.
    const message = validationMessage(event.target);
    setErrors((prev) => ({ ...prev, [name]: message }));
    // Focus has already moved on, so say it out loud. (The region only re-speaks on change.)
    if (message) setAnnouncement(`${FIELD_LABELS[name]}: ${message}`);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (request.current) return;
    const form = event.currentTarget;

    const fields = FIELDS.map((name) => form.elements.namedItem(name));
    const nextErrors = Object.fromEntries(fields.map((f) => [f.name, validationMessage(f)]));
    const invalid = FIELDS.filter((name) => nextErrors[name]);
    if (invalid.length) {
      // Commit aria-invalid, aria-describedby and the message text before focus lands,
      // so the screen reader reads the error together with the field.
      flushSync(() => {
        setErrors(nextErrors);
        setAnnouncement(invalidSummary(invalid));
      });
      form.elements.namedItem(invalid[0]).focus();
      return;
    }
    setErrors(nextErrors);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), TIMEOUT_MS);
    request.current = controller;
    setStatus('sending');
    setAnnouncement('Sending your message…');
    try {
      const response = await fetch(formspreeUrl, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Formspree responded ${response.status}`);
      clearDraft();
      setAnnouncement(''); // The confirmation heading takes focus and is read instead.
      setStatus('success');
    } catch {
      if (controller.signal.reason === 'unmount') return;
      setAnnouncement(SEND_FAILED);
      setStatus('error');
    } finally {
      clearTimeout(timer);
      request.current = null;
    }
  }

  function handleReset() {
    setErrors({});
    setAnnouncement('');
    focusNameOnMount.current = true;
    setStatus('idle');
  }

  function handleMessageKeyDown(event) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.currentTarget.form.requestSubmit();
    }
  }

  const swap = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
      };

  return (
    <>
      <Stamp
        sent={status === 'success'}
        className="absolute right-5 top-5 h-[5.25rem] w-[4.375rem] sm:right-8 sm:top-8 sm:h-[7.5rem] sm:w-[6.25rem]"
      />
      <AnimatePresence mode="wait" initial={false}>
        {status === 'success' ? (
          <MotionDiv key="success" {...swap} transition={{ duration: 0.25, ease: EASE }}>
            <Success onReset={handleReset} />
          </MotionDiv>
        ) : (
          <MotionDiv key="form" {...swap} transition={{ duration: 0.2, ease: EASE }}>
            <form
              action={formspreeUrl}
              method="POST"
              noValidate
              onSubmit={handleSubmit}
              aria-label="Send a message"
              aria-busy={sending}
            >
              {/* The sender's lines and the stamp. Where the card is narrow (phones,
                  and beside the tiles from lg) the name sits next to the stamp and
                  the email runs full width under both; on the full-width card
                  between, the two lines share the row beside the stamp. */}
              <div className="grid gap-x-6 sm:grid-cols-2 sm:pr-[7.75rem] lg:grid-cols-1 lg:pr-0">
                <Field
                  id={fieldId('name')}
                  label={FIELD_LABELS.name}
                  error={errors.name}
                  className="pr-[5.5rem] sm:pr-0 lg:pr-[7.75rem]"
                >
                  <input
                    {...fieldProps('name')}
                    ref={(node) => {
                      if (node && focusNameOnMount.current) {
                        focusNameOnMount.current = false;
                        node.focus();
                      }
                    }}
                    type="text"
                    required
                    maxLength={120}
                    autoComplete="name"
                    autoCapitalize="words"
                    className={cn(inputClass, 'h-12')}
                  />
                </Field>
                <Field id={fieldId('email')} label={FIELD_LABELS.email} error={errors.email}>
                  <input
                    {...fieldProps('email')}
                    type="email"
                    required
                    maxLength={200}
                    pattern={EMAIL_PATTERN}
                    autoComplete="email"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="email"
                    className={cn(inputClass, 'h-12')}
                  />
                </Field>
              </div>

              <Field id={fieldId('message')} label={FIELD_LABELS.message} error={errors.message}>
                <textarea
                  {...fieldProps('message')}
                  required
                  rows={5}
                  maxLength={5000}
                  placeholder="What are you working on?"
                  onKeyDown={handleMessageKeyDown}
                  aria-keyshortcuts="Control+Enter Meta+Enter"
                  className={cn(inputClass, 'postcard-ruled min-h-[12.75rem] resize-y py-2 leading-7')}
                />
              </Field>

              <input type="hidden" name="_subject" value="New message from rohanm.org" />
              {/* Honeypot: hidden from people, tempting to bots. Formspree drops anything that fills it. */}
              <input
                type="text"
                name="_gotcha"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              {/* Visible version of the failure; the status region below announces it. */}
              {status === 'error' ? (
                <div className="mb-5 flex gap-3 rounded-lg border border-line-strong bg-surface px-4 py-3.5 text-[15px] leading-6 text-fg">
                  <CircleAlert aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent-strong" />
                  <p>
                    The message didn’t go through. Try again, or{' '}
                    <a href={mailtoWith(values)} className="link font-medium">
                      send it by email
                    </a>
                    .
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                <Button
                  type="submit"
                  size="lg"
                  aria-disabled={sending || undefined}
                  className="w-full sm:w-auto"
                >
                  {/* Both labels share one grid cell, so the button keeps its width. */}
                  <span className="grid">
                    <span className={cn('col-start-1 row-start-1', sending && 'invisible')}>
                      Send message
                    </span>
                    <span
                      className={cn(
                        'col-start-1 row-start-1 inline-flex items-center justify-center gap-2',
                        !sending && 'invisible'
                      )}
                    >
                      <LoaderCircle
                        aria-hidden="true"
                        className={cn('size-4', sending && 'animate-spin')}
                      />
                      Sending…
                    </span>
                  </span>
                </Button>
                {/* Visual hint only; the textarea exposes the shortcut via aria-keyshortcuts. */}
                {showShortcut ? (
                  <p aria-hidden="true" className="flex items-center gap-1 text-[13px] text-subtle">
                    <Kbd>
                      <ModKey />
                    </Kbd>
                    <Kbd>↵</Kbd>
                    <span className="ml-1">to send</span>
                  </p>
                ) : null}
              </div>
            </form>
          </MotionDiv>
        )}
      </AnimatePresence>
      {/* Always mounted (outside the swap) so screen readers pick up every change. */}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
