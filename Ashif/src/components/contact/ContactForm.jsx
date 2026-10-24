import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, CircleAlert, LoaderCircle } from 'lucide-react';
import Button from '@/components/primitives/Button';
import { Kbd } from '@/components/primitives/Tag';
import { formspreeUrl, profile } from '@/data/portfolioData';
import useMediaQuery from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;

const EMPTY = { name: '', email: '', message: '' };

// Inline copy for each field, keyed by the browser's own ValidityState flags.
const MESSAGES = {
  name: { valueMissing: 'What should I call you?' },
  email: {
    valueMissing: 'I need an email to reply to.',
    typeMismatch: 'That email doesn’t look quite right.',
  },
  message: { valueMissing: 'Write a line or two first.' },
};

function validationMessage(field) {
  if (!field || field.validity.valid) return '';
  const copy = MESSAGES[field.name] ?? {};
  const failed = Object.keys(copy).find((flag) => field.validity[flag]);
  return failed ? copy[failed] : field.validationMessage;
}

/** mailto: link that carries over whatever they already typed. */
function mailtoWith(values) {
  const params = new URLSearchParams();
  params.set('subject', values.name ? `Hello from ${values.name}` : 'Hello from rohanm.org');
  if (values.message) params.set('body', values.message);
  // URLSearchParams encodes spaces as "+", which mail clients show literally.
  return `mailto:${profile.email}?${params.toString().replace(/\+/g, '%20')}`;
}

const inputClass =
  'block w-full rounded-xl border border-line-strong bg-bg/60 px-4 text-[16px] text-fg shadow-[inset_0_1px_2px_rgb(0_0_0/0.12)] outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-subtle hover:border-fg/25 focus:border-accent-strong focus:bg-bg focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_18%,transparent)] focus-visible:outline-none aria-[invalid=true]:border-red-400/70 light:aria-[invalid=true]:border-red-600/60';

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      <p
        id={`${id}-error`}
        className={cn(
          'flex items-center gap-1.5 overflow-hidden text-[13px] leading-5 text-red-400 transition-[max-height,opacity,margin] duration-200 light:text-red-700',
          error ? 'mt-2 max-h-6 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {error ? (
          <>
            <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
            {error}
          </>
        ) : null}
      </p>
    </div>
  );
}

function Success({ name, email, onReset }) {
  const headingRef = useRef(null);
  const firstName = name.trim().split(/\s+/)[0];

  // Move focus to the confirmation so screen readers announce it.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="flex h-full flex-col items-start justify-center py-6">
      <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-ink shadow-[0_10px_30px_-10px_var(--accent)]">
        <Check aria-hidden="true" className="size-5" strokeWidth={2.5} />
      </span>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-fg outline-none sm:text-4xl"
      >
        Thanks{firstName ? `, ${firstName}` : ''}. <em>Got it.</em>
      </h3>
      <p className="mt-3 max-w-sm text-pretty text-base leading-7 text-muted">
        Your note is in my inbox. I&rsquo;ll reply to{' '}
        <span className="font-medium text-fg">{email}</span>.
      </p>
      <Button variant="secondary" className="mt-8" onClick={onReset}>
        Send another
      </Button>
    </div>
  );
}

/** Contact form that posts to Formspree with fetch, so the page never redirects. */
export default function ContactForm() {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const finePointer = useMediaQuery('(pointer: fine)');
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [sent, setSent] = useState(null);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);

  const fieldId = (name) => `${id}-${name}`;
  const describedBy = (name) => (errors[name] ? `${fieldId(name)}-error` : undefined);

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
    if (!value) return; // don't scold people for tabbing through
    setErrors((prev) => ({ ...prev, [name]: validationMessage(event.target) }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;

    const fields = ['name', 'email', 'message'].map((name) => form.elements[name]);
    const nextErrors = Object.fromEntries(fields.map((f) => [f.name, validationMessage(f)]));
    setErrors(nextErrors);
    const firstInvalid = fields.find((f) => nextErrors[f.name]);
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch(formspreeUrl, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Formspree responded ${response.status}`);
      setSent({ name: values.name, email: values.email });
      setValues(EMPTY);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  function handleMessageKeyDown(event) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.currentTarget.form.requestSubmit();
    }
  }

  const sending = status === 'sending';
  const swap = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
      };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === 'success' ? (
        <MotionDiv key="success" {...swap} transition={{ duration: 0.35, ease: EASE }} className="h-full">
          <Success
            name={sent?.name ?? ''}
            email={sent?.email ?? ''}
            onReset={() => {
              setErrors({});
              setStatus('idle');
            }}
          />
        </MotionDiv>
      ) : (
        <MotionDiv key="form" {...swap} transition={{ duration: 0.35, ease: EASE }}>
          <form
            noValidate
            onSubmit={handleSubmit}
            aria-busy={sending}
            aria-label="Contact form"
          >
            <fieldset disabled={sending} className="flex min-w-0 flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id={fieldId('name')} label="Name" error={errors.name}>
                  <input
                    id={fieldId('name')}
                    name="name"
                    type="text"
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder="Your name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={describedBy('name')}
                    className={cn(inputClass, 'h-12')}
                  />
                </Field>
                <Field id={fieldId('email')} label="Email" error={errors.email}>
                  <input
                    id={fieldId('email')}
                    name="email"
                    type="email"
                    required
                    maxLength={200}
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    placeholder="you@company.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={describedBy('email')}
                    className={cn(inputClass, 'h-12')}
                  />
                </Field>
              </div>

              <Field id={fieldId('message')} label="What are you working on?" error={errors.message}>
                <textarea
                  id={fieldId('message')}
                  name="message"
                  required
                  rows={6}
                  maxLength={5000}
                  placeholder="A project, a role, a research idea…"
                  value={values.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleMessageKeyDown}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={describedBy('message')}
                  className={cn(inputClass, 'min-h-36 resize-y py-3 leading-6')}
                />
              </Field>

              <input type="hidden" name="_subject" value="New message from rohanm.org" />
              {/* Honeypot: invisible to people, tempting to bots. Formspree drops anything that fills it. */}
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
                  className="flex gap-3 rounded-xl border border-red-400/25 bg-red-400/[0.07] p-4 text-sm leading-6 text-fg light:border-red-600/20 light:bg-red-600/[0.05]"
                >
                  <CircleAlert
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-red-400 light:text-red-700"
                  />
                  <p>
                    That didn&rsquo;t go through on my end. Try again, or{' '}
                    <a
                      href={mailtoWith(values)}
                      className="font-medium text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent-strong"
                    >
                      email me directly
                    </a>{' '}
                    and your message will come with you.
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                {finePointer ? (
                  <p className="hidden items-center gap-1.5 text-xs text-subtle sm:flex">
                    <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
                    <Kbd>↵</Kbd>
                    <span className="ml-1">to send</span>
                  </p>
                ) : (
                  <span aria-hidden="true" />
                )}
                <Button type="submit" size="lg" className="w-full disabled:opacity-100 sm:w-auto">
                  {sending ? (
                    <>
                      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                      Sending&hellip;
                    </>
                  ) : (
                    <>
                      {status === 'error' ? 'Try again' : 'Send message'}
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </fieldset>
          </form>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
