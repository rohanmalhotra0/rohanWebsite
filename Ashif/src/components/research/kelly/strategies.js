// The bettors in the race, as multiples of the Kelly bet. At 2× Kelly the
// long-run growth is about zero (the edge is used up); past it, growth is
// negative, so 3× loses money in the long run even with an edge.
//
// Colors are palette tokens picked to stay apart in every palette and theme
// (at least ΔE 13 from each other, and 4.3:1 on the lab and the table);
// 3× and ruin are the stop red.
export const STRATEGIES = [
  { key: 'quarter', label: '¼ Kelly', multiple: 0.25, color: 'var(--muted)' },
  { key: 'half', label: '½ Kelly', multiple: 0.5, color: 'var(--c5)' },
  { key: 'full', label: 'Kelly', multiple: 1, color: 'var(--fg)' },
  { key: 'double', label: '2× Kelly', multiple: 2, color: 'var(--c4)' },
  // Dashed as well, so it never depends on color alone.
  { key: 'triple', label: '3× Kelly', multiple: 3, color: 'var(--stop)', dash: [7, 5] },
];

/** Bets can't go past almost everything you have. */
export const MAX_BET = 0.95;

export const betsFor = (fStar) => STRATEGIES.map((s) => Math.min(MAX_BET, s.multiple * fStar));

/** Bets per race and per simulated run. */
export const STEPS = 200;
