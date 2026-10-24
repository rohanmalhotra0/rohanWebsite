import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, CircleAlert, LoaderCircle } from 'lucide-react';
import Button from '@/components/primitives/Button';
import { Kbd } from '@/components/primitives/Tag';
import { formspreeUrl } from '@/data/portfolioData';
import useMediaQuery from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { EMAIL_PATTERN, FIELDS, mailtoWith, validationMessage } from './validation';

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;
const MotionSpan = motion.span;

const EMPTY = { name: '', email: '', message: '' };
const TIMEOUT_MS = 15000;
const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

const inputClass = cn(
  'block w-full rounded-lg border border-line-strong bg-surface px-3.5 text-base text-fg',
  'transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-subtle',
  'hover:border-fg/30 focus-visible:outline-hidden focus:border-accent focus:ring-3 focus:ring-accent/25',
  'aria-[invalid=true]:border-accent-strong',
  // Keep browser autofill from painting its own background over the theme.
  'autofill:inset-shadow-[0_0_0_100px_var(--surface)] autofill:[-webkit-text-fill-color:var(--fg)]'
);

function Field({ id, label, error, children }) {
  const reduceMotion = useReducedMotion();
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {/* The slot keeps its height, so a message never pushes the form around. */}
      <p id={`${id}-error`} className="mt-1.5 min-h-5 text-[13px] leading-5 text-accent-strong">
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
      </p>
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
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 sm:gap-x-4">
      <Check
        aria-hidden="true"
        strokeWidth={2.5}
        className="mt-[3px] size-6 text-accent-strong sm:size-7"
      />
      <div>
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="type-heading text-[1.625rem] leading-[1.15] text-fg outline-none sm:text-3xl sm:leading-[1.15]"
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

/** Contact form. Posts to Formspree with fetch so the page never redirects. */
export default function ContactForm() {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const showShortcut = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 640px)');
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
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
    setErrors((prev) => ({ ...prev, [name]: validationMessage(event.target) }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (request.current) return;
    const form = event.currentTarget;

    const fields = FIELDS.map((name) => form.elements.namedItem(name));
    const nextErrors = Object.fromEntries(fields.map((f) => [f.name, validationMessage(f)]));
    setErrors(nextErrors);
    const firstInvalid = fields.find((f) => nextErrors[f.name]);
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), TIMEOUT_MS);
    request.current = controller;
    setStatus('sending');
    try {
      const response = await fetch(formspreeUrl, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Formspree responded ${response.status}`);
      setValues(EMPTY);
      setStatus('success');
    } catch {
      if (controller.signal.reason !== 'unmount') setStatus('error');
    } finally {
      clearTimeout(timer);
      request.current = null;
    }
  }

  function handleReset() {
    setErrors({});
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
    <AnimatePresence mode="wait" initial={false}>
      {status === 'success' ? (
        <MotionDiv key="success" {...swap} transition={{ duration: 0.25, ease: EASE }}>
          <Success onReset={handleReset} />
        </MotionDiv>
      ) : (
        <MotionDiv key="form" {...swap} transition={{ duration: 0.2, ease: EASE }}>
          <form noValidate onSubmit={handleSubmit} aria-label="Send a message" aria-busy={sending}>
            <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-1">
              <Field id={fieldId('name')} label="Name" error={errors.name}>
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
              <Field id={fieldId('email')} label="Email" error={errors.email}>
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

            <Field id={fieldId('message')} label="Message" error={errors.message}>
              <textarea
                {...fieldProps('message')}
                required
                rows={5}
                maxLength={5000}
                placeholder="What are you working on?"
                onKeyDown={handleMessageKeyDown}
                className={cn(inputClass, 'min-h-36 resize-y py-3 leading-6')}
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

            {status === 'error' ? (
              <div
                role="alert"
                className="mb-5 flex gap-3 rounded-lg border border-line-strong bg-surface px-4 py-3.5 text-[15px] leading-6 text-fg"
              >
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

            <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:gap-5">
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
                    <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                    Sending…
                  </span>
                </span>
              </Button>
              {showShortcut ? (
                <p className="flex items-center gap-1 text-[13px] text-subtle">
                  <Kbd>{IS_MAC ? '⌘' : 'Ctrl'}</Kbd>
                  <Kbd>↵</Kbd>
                  <span className="ml-1">to send</span>
                </p>
              ) : null}
            </div>
          </form>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
