// The lab's sentences about a hedge size. Sizes are compared on the slider's
// half-week grid, the same rounding the buttons use.

import { halfWeeks, percent, weeksText } from './format';

/** Which side of the two reference sizes a hedge of `size` weeks falls on. */
export function zone(size, calm, tail) {
  const calmSize = halfWeeks(calm);
  const tailSize = halfWeeks(tail);
  if (size === 0) return calmSize === 0 ? 'none-small' : 'none';
  if (size === calmSize) return 'calm';
  if (size < calmSize) return 'under';
  if (tailSize <= calmSize) return 'bet';
  if (size <= tailSize) return 'tail';
  return 'past';
}

/** One sentence on a hedge of `size` weeks. */
export function verdict(size, calm, tail, keptInDownturn) {
  switch (zone(size, calm, tail)) {
    case 'none-small':
      return 'No hedge. A downturn costs you under half a week of pay on average here, so a downturn contract has little to offer.';
    case 'none':
      return 'No hedge: when a downturn hits, nothing softens it.';
    case 'calm':
      return 'The calmest year: it pays back what a downturn costs you on average.';
    case 'under':
      return 'Smaller than the calmest hedge: cheaper, and it softens a downturn a little less.';
    case 'bet':
      return 'More than a downturn costs you: the extra is a bet on a recession, and it doesn’t help your worst years.';
    case 'tail':
      return `Bigger than the calmest hedge: your worst years get better, but ${percent(keptInDownturn)} of downturn years kept the job and didn’t need the payout.`;
    default:
      return `Past ${weeksText(halfWeeks(tail))}, it stops helping your worst years. The extra is a bet on a recession.`;
  }
}

/** A few words for the slider's spoken value. */
export function shortVerdict(size, calm, tail) {
  return {
    'none-small': 'No hedge.',
    none: 'No hedge.',
    calm: 'The calmest size.',
    under: 'Smaller than the calmest size.',
    bet: 'More than a downturn costs you.',
    tail: 'Helps your worst years.',
    past: 'A bet on a recession.',
  }[zone(size, calm, tail)];
}
