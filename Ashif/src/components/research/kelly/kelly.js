// The math behind the Kelly explainer.
//
// The paper ("An Economic Approach to Optimize Capital Allocation") puts a
// fraction f of your money on an even-money bet each round: win f with
// probability p, lose f with probability q = 1 − p. Long-run growth per
// round is g(f) = p·ln(1 + f) + q·ln(1 − f), which peaks at f* = p − q.
//
// The explainer frames the bet as a prediction-market contract that costs c
// and pays 1: a win returns b = (1 − c)/c per unit staked, a loss costs the
// stake. Then g(f) = p·ln(1 + b·f) + q·ln(1 − f) and f* = (p − c)/(1 − c).
// At c = 0.5, b = 1 and both reduce to the paper's case.

/** Profit per unit staked when a contract bought at `c` pays out. */
export const payout = (c) => (1 - c) / c;

/** Long-run growth per bet, g(f), as a log rate. */
export const growth = (p, c, f) => p * Math.log1p(payout(c) * f) + (1 - p) * Math.log1p(-f);

/** The Kelly fraction, f* = (p − c)/(1 − c); zero without an edge. */
export const kelly = (p, c) => Math.max(0, (p - c) / (1 - c));

/** Typical growth per bet as a plain rate: +0.02 is 2% a bet. */
export const perBet = (p, c, f) => Math.exp(growth(p, c, f)) - 1;

/**
 * The bet size past which long-run growth turns negative: you go broke
 * there even though every bet has an edge. Found by bisection above f*.
 */
export function breakEven(p, c) {
  let lo = kelly(p, c);
  let hi = 0.999999;
  if (lo <= 0) return 0;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (growth(p, c, mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Growth at `multiple` × Kelly, as a share of the best possible growth. */
export function shareOfBest(p, c, multiple) {
  const f = Math.min(0.999, multiple * kelly(p, c));
  return growth(p, c, f) / growth(p, c, kelly(p, c));
}

/**
 * If your real edge (p − c) is `share` of the edge you think you have, the
 * growth you'd get betting `multiple` × the Kelly fraction you computed, as
 * a share of the best you could have done.
 */
export function growthIfWrong(p, c, share, multiple) {
  const real = c + share * (p - c);
  const best = growth(real, c, kelly(real, c));
  const bet = Math.min(0.999, multiple * kelly(p, c));
  if (best > 0) return growth(real, c, bet) / best;
  return growth(real, c, bet) >= 0 ? 1 : -Infinity;
}

/** The real-edge share below which half Kelly beats full Kelly (bisection). */
export function crossover(p, c) {
  let lo = 0.05;
  let hi = 1;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (growthIfWrong(p, c, mid, 0.5) > growthIfWrong(p, c, mid, 1)) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** A small seeded random generator (mulberry32): the same numbers everywhere. */
function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A bankroll that falls below this share of where it started is ruined. */
export const RUIN = 0.01;

/**
 * Bankrolls that start at 1 and bet each fraction in `bets` on the same
 * sequence of coin flips, `runs` times. The same seed gives the same flips,
 * so changing p, c or the bets reshapes the same runs instead of drawing new
 * ones. Plain multiplication only, so every engine gets identical numbers.
 *
 * Returns, for each bet: the first run's path (for the race) and, over all
 * runs, the median final bankroll and the shares that end behind, lose half
 * from a peak, and are ever ruined.
 */
export function simulate({ p, c, bets, runs = 1000, steps = 200, seed = 7 }) {
  const next = random(seed);
  const b = payout(c);
  const n = bets.length;
  const up = bets.map((f) => 1 + b * f);
  const down = bets.map((f) => 1 - f);
  const finals = bets.map(() => new Float64Array(runs));
  const behind = new Array(n).fill(0);
  const halved = new Array(n).fill(0);
  const ruined = new Array(n).fill(0);
  const paths = bets.map(() => new Float64Array(steps + 1));
  const w = new Float64Array(n);
  const peak = new Float64Array(n);
  const cut = new Uint8Array(n);
  const broke = new Uint8Array(n);

  for (let r = 0; r < runs; r++) {
    w.fill(1);
    peak.fill(1);
    cut.fill(0);
    broke.fill(0);
    if (r === 0) for (let i = 0; i < n; i++) paths[i][0] = 1;
    for (let t = 1; t <= steps; t++) {
      const win = next() < p;
      for (let i = 0; i < n; i++) {
        const v = w[i] * (win ? up[i] : down[i]);
        w[i] = v;
        if (v > peak[i]) peak[i] = v;
        else if (!cut[i] && v <= peak[i] * 0.5) cut[i] = 1;
        if (!broke[i] && v <= RUIN) broke[i] = 1;
        if (r === 0) paths[i][t] = v;
      }
    }
    for (let i = 0; i < n; i++) {
      finals[i][r] = w[i];
      if (w[i] < 1) behind[i]++;
      halved[i] += cut[i];
      ruined[i] += broke[i];
    }
  }

  return bets.map((f, i) => {
    const sorted = finals[i].sort();
    return {
      f,
      path: paths[i],
      median: sorted[Math.floor(runs / 2)],
      behind: behind[i] / runs,
      halved: halved[i] / runs,
      ruined: ruined[i] / runs,
    };
  });
}
