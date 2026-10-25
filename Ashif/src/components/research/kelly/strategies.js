// The four bettors in the race, as multiples of the Kelly bet.
export const STRATEGIES = [
  { key: 'quarter', label: '¼ Kelly', multiple: 0.25, color: 'var(--muted)' },
  { key: 'half', label: '½ Kelly', multiple: 0.5, color: 'var(--spot)' },
  { key: 'full', label: 'Kelly', multiple: 1, color: 'var(--accent)' },
  { key: 'double', label: '2× Kelly', multiple: 2, color: 'var(--toy)' },
];

/** Bets can't go past almost everything you have. */
export const MAX_BET = 0.95;

export const betsFor = (fStar) => STRATEGIES.map((s) => Math.min(MAX_BET, s.multiple * fStar));

/** Bets per race and per simulated run. */
export const STEPS = 200;
