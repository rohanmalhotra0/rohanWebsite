// The lab's sentences about a hedge size.

import { percent, weeksText } from './format';

/** Where a hedge of `size` weeks sits against the two reference sizes, in words. */
export function verdict(size, calm, tail, keptInDownturn) {
  if (size === 0) {
    return calm < 0.5
      ? 'No hedge. Your job barely moves with the economy, so a downturn contract has little to offer.'
      : 'No hedge: when a downturn hits, nothing softens it.';
  }
  if (Math.abs(size - calm) <= 0.5) return 'The calmest year: it pays back what a downturn costs you on average.';
  if (size < calm) return 'Smaller than the calmest hedge: cheaper, and it softens a downturn a little less.';
  if (tail <= calm + 0.5) {
    return 'More than a downturn costs you: the extra is a bet on a recession, and it makes your worst years worse.';
  }
  if (size <= tail + 0.5) {
    return `Bigger than the calmest hedge: your worst years get better, but ${percent(keptInDownturn)} of downturn years kept the job and didn’t need the payout.`;
  }
  return `Past ${weeksText(tail)}, it stops helping your worst years. The extra is a bet on a recession.`;
}
