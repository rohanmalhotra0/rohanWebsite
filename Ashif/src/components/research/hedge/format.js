// Number formats for the paycheck explainer. Pay and hedge sizes are in weeks of pay.

/** 36.3, 1.8, 20: one decimal, without a trailing .0. */
export function weeks(value) {
  const text = value.toFixed(1);
  return text.endsWith('.0') ? text.slice(0, -2) : text;
}

/** "1 week", "1.8 weeks", "20 weeks". */
export function weeksText(value) {
  const text = weeks(value);
  return `${text} ${text === '1' ? 'week' : 'weeks'}`;
}

/**
 * Two amounts in weeks, with enough decimals (up to 3) to tell them apart:
 * [36.3, 34.7], or [4.48, 4.53] when one decimal would make them equal.
 */
export function weeksPair(a, b) {
  if (weeks(a) !== weeks(b)) return [weeks(a), weeks(b)];
  for (const digits of [2, 3]) {
    if (a.toFixed(digits) !== b.toFixed(digits) || digits === 3) return [a.toFixed(digits), b.toFixed(digits)];
  }
  return [weeks(a), weeks(b)];
}

/** A hedge size rounded to the slider's half weeks. */
export const halfWeeks = (value) => Math.round(value * 2) / 2;

/** +2.6, −0.4, 0: a change in weeks. */
export function signedWeeks(value) {
  const text = weeks(Math.abs(value));
  if (text === '0') return '0';
  return `${value > 0 ? '+' : '−'}${text}`;
}

/** A share of years: 0.7%, 1.1%, 1%, 13%, with <0.1% for tiny ones. */
export function share(value) {
  const pct = value * 100;
  if (pct === 0) return '0%';
  if (pct < 0.1) return '<0.1%';
  if (pct < 10) return `${pct.toFixed(1).replace(/\.0$/, '')}%`;
  return `${Math.round(pct)}%`;
}

/** A whole percent: 4%, 88%. */
export const percent = (value) => `${Math.round(value * 100)}%`;
