// The model behind "Hedge your paycheck".
//
// The paper ("Hedging Personal Income Risk Using Prediction Markets") pays a
// salary while you're employed, dW = S·E dt, and makes job loss a Poisson
// jump whose hazard rises with unemployment. A hedge is a contract that pays
// when unemployment rises, sized by the minimum-variance hedge ratio
// h* = Cov(L, H) / Var(H), where L is the pay lost to unemployment.
//
// Here, in weeks: each simulated year is a normal one or a downturn. Every
// week you might be let go (more often in a downturn); out of work, every
// week you might find a new job (less often in a downturn). The contract pays
// $1 if the year is a downturn and costs its odds, so it's free on average.
// Sizes and incomes are in weeks of pay. Only +, −, ×, ÷, comparisons and
// square roots, so the server and every browser get identical numbers.

import { seededRandom } from '@/lib/random';

export const WEEKS = 52;
/** A downturn comes 1 year in 5; the contract costs 20¢ per $1 it pays. */
export const DOWNTURN = 0.2;
export const PRICE = DOWNTURN;
/** The average job search, in weeks: about 5 months, or 8 in a downturn. */
export const SEARCH_WEEKS = { fine: 20, down: 35 };
/** Simulated years, and how many of them the picture draws. */
export const YEARS = 10_000;
export const SAMPLE = 1_000;
/** The largest hedge on offer: half a year's pay. */
export const MAX_HEDGE = 26;
/** The first seed: its 1,000-year sample is typical (20% downturns, job losses near the model's rates). */
export const SEED = 163;

/**
 * The weekly chance that adds up to `annual` over a year:
 * 1 − (1 − w)^52 = annual, found by bisection with plain multiplication.
 */
export function weeklyChance(annual) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    let kept = 1;
    for (let k = 0; k < WEEKS; k++) kept *= 1 - mid;
    if (1 - kept < annual) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Simulate YEARS years. `base` is the chance of losing your job in a normal
 * year and `mult` how many times likelier it is in a downturn. Each year uses
 * the same 53 draws whatever the settings, so the same seed reshapes the same
 * years when a slider moves instead of drawing new ones.
 *
 * Returns how many years ended with each number of paid weeks (0–52), for
 * normal years and downturns, plus the first SAMPLE years for the picture:
 * whether it was a downturn, the weeks paid, and the week of the first layoff
 * (−1 if none).
 */
export function simulate({ base, mult, seed = SEED }) {
  const next = seededRandom(seed);
  const lose = { fine: weeklyChance(base), down: weeklyChance(Math.min(0.99, base * mult)) };
  const hire = { fine: 1 / SEARCH_WEEKS.fine, down: 1 / SEARCH_WEEKS.down };
  const counts = { fine: new Array(WEEKS + 1).fill(0), down: new Array(WEEKS + 1).fill(0) };
  const sample = [];

  for (let year = 0; year < YEARS; year++) {
    const state = next() < DOWNTURN ? 'down' : 'fine';
    let working = true;
    let paid = 0;
    let laidOff = -1;
    for (let week = 0; week < WEEKS; week++) {
      const u = next();
      if (working) {
        if (u < lose[state]) {
          working = false;
          if (laidOff < 0) laidOff = week;
        } else paid++;
      } else if (u < hire[state]) {
        working = true;
        paid++;
      }
    }
    counts[state][paid]++;
    if (year < SAMPLE) sample.push({ id: year, down: state === 'down', paid, laidOff });
  }
  return { counts, sample };
}

/** Years, average paid weeks and the variance within each kind of year. */
function moments(row) {
  let n = 0;
  let sum = 0;
  row.forEach((count, weeks) => {
    n += count;
    sum += count * weeks;
  });
  const mean = n ? sum / n : 0;
  let spread = 0;
  row.forEach((count, weeks) => {
    spread += count * (weeks - mean) * (weeks - mean);
  });
  return { n, mean, variance: n ? spread / n : 0 };
}

/**
 * The year's pay with a hedge that pays `hedge` weeks of pay in a downturn:
 * every year pays its cost, PRICE × hedge, and downturns get the payout.
 *
 * mean      average pay (the same with or without a fairly priced hedge)
 * sd        the swing: standard deviation of the year's pay
 * worst     average pay in the worst 5% of years (expected shortfall)
 * half      share of years that pay less than half a year
 */
export function outcome(counts, hedge) {
  const cost = PRICE * hedge;
  const rows = [];
  let n = 0;
  let sum = 0;
  for (const [state, shift] of [
    ['fine', -cost],
    ['down', hedge - cost],
  ]) {
    counts[state].forEach((count, weeks) => {
      if (!count) return;
      rows.push([weeks + shift, count]);
      n += count;
      sum += count * (weeks + shift);
    });
  }
  const mean = sum / n;
  let spread = 0;
  let half = 0;
  for (const [pay, count] of rows) {
    spread += count * (pay - mean) * (pay - mean);
    if (pay < WEEKS / 2) half += count;
  }
  rows.sort((a, b) => a[0] - b[0]);
  const tail = n * 0.05;
  let need = tail;
  let worst = 0;
  for (const [pay, count] of rows) {
    const take = Math.min(count, need);
    worst += take * pay;
    need -= take;
    if (need <= 0) break;
  }
  return { mean, sd: Math.sqrt(spread / n), worst: worst / tail, half: half / n, cost };
}

/**
 * The minimum-variance hedge, h* = Cov(L, H) / Var(H). For a $1 contract on
 * the downturn that's E[L | downturn] − E[L | normal year]: what a downturn
 * costs you on average. Also the swing that's left at h* (your own luck: the
 * part no downturn contract can reach) and the share of the variance it
 * removes, ρ².
 */
export function minimumVariance(counts) {
  const fine = moments(counts.fine);
  const down = moments(counts.down);
  const n = fine.n + down.n;
  const hedge = Math.max(0, fine.mean - down.mean);
  const ownLuck = Math.sqrt((fine.n * fine.variance + down.n * down.variance) / n);
  const unhedged = outcome(counts, 0).sd;
  return { hedge, ownLuck, removed: unhedged > 0 ? 1 - (ownLuck * ownLuck) / (unhedged * unhedged) : 0 };
}

/** The hedge, in quarter weeks up to MAX_HEDGE, that does the most for the worst 5% of years. */
export function bestForWorstYears(counts) {
  let best = 0;
  let top = -Infinity;
  for (let hedge = 0; hedge <= MAX_HEDGE; hedge += 0.25) {
    const { worst } = outcome(counts, hedge);
    if (worst > top + 1e-9) {
      top = worst;
      best = hedge;
    }
  }
  return best;
}

/** Shares of years: downturns, job losses, and job losses that came in a downturn. */
export function shares(counts) {
  const fine = moments(counts.fine).n;
  const down = moments(counts.down).n;
  const lostFine = fine - counts.fine[WEEKS];
  const lostDown = down - counts.down[WEEKS];
  const n = fine + down;
  return {
    down: down / n,
    lostFine: fine ? lostFine / fine : 0,
    lostDown: down ? lostDown / down : 0,
    keptInDownturn: down ? counts.down[WEEKS] / down : 0,
    lossesInDownturn: lostFine + lostDown ? lostDown / (lostFine + lostDown) : 0,
  };
}
