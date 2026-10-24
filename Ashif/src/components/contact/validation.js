import { profile } from '@/data/portfolioData';

export const FIELDS = ['name', 'email', 'message'];

// type="email" accepts "a@b"; also require a dot in the domain.
export const EMAIL_PATTERN = '[^@\\s]+@[^@\\s]+\\.[^@\\s]+';

// Inline copy for each field, keyed by the browser's own ValidityState flags.
const MESSAGES = {
  name: { valueMissing: 'Please add your name.' },
  email: {
    valueMissing: 'Please add your email so I can reply.',
    typeMismatch: 'That email address doesn’t look complete.',
    patternMismatch: 'That email address doesn’t look complete.',
  },
  message: { valueMissing: 'Please write a short message.' },
};

/** Friendly message for a form control, or '' when it is valid. */
export function validationMessage(field) {
  if (!field) return '';
  const copy = MESSAGES[field.name] ?? {};
  // `required` alone lets whitespace-only answers through.
  if (field.required && !field.value.trim()) {
    return copy.valueMissing ?? field.validationMessage;
  }
  if (field.validity.valid) return '';
  const flag = Object.keys(copy).find((key) => field.validity[key]);
  return flag ? copy[flag] : field.validationMessage;
}

/** mailto: link that carries over whatever was already typed. */
export function mailtoWith({ name, message }) {
  const params = new URLSearchParams();
  params.set('subject', name.trim() ? `Hello from ${name.trim()}` : 'Hello from rohanm.org');
  if (message.trim()) params.set('body', message);
  // URLSearchParams encodes spaces as "+", which mail clients show literally.
  return `mailto:${profile.email}?${params.toString().replace(/\+/g, '%20')}`;
}
