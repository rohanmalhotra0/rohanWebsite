// Number formats for the Kelly explainer.

/** A growth rate as a signed percent: +2.0%, −0.4%, +0.18%. */
export function signedPercent(rate) {
  const pct = rate * 100;
  const digits = Math.abs(pct) < 1 ? 2 : 1;
  const text = Math.abs(pct).toFixed(digits);
  if (Number(text) === 0) return '0%';
  return `${pct > 0 ? '+' : '−'}${text}%`;
}

/** A share as a whole percent, with the ends spelled out: <1%, >99%. */
export function percent(share) {
  const pct = share * 100;
  if (pct > 0 && pct < 1) return '<1%';
  if (pct > 99 && pct < 100) return '>99%';
  return `${Math.round(pct)}%`;
}

/** A share of the best growth, which can be negative: 75%, −12%. */
export function signedShare(share) {
  if (!Number.isFinite(share)) return '−∞';
  const pct = Math.round(share * 100);
  return pct < 0 ? `−${-pct}%` : `${pct}%`;
}

/** A bankroll multiple: ×0.69, ×20.5, ×1,293, ×229k, ×1.2M, ×3.4B. */
export function multiple(x) {
  if (!(x > 0)) return '×0';
  if (x < 0.01) return '<×0.01';
  if (x < 10) return `×${x.toFixed(2)}`;
  if (x < 100) return `×${x.toFixed(1)}`;
  if (x < 10_000) return `×${Math.round(x).toLocaleString('en-US')}`;
  if (x < 1_000_000) return `×${Math.round(x / 1000)}k`;
  if (x < 1e9) return `×${(x / 1e6).toFixed(1)}M`;
  if (x < 1e12) return `×${(x / 1e9).toFixed(1)}B`;
  return `×${(x / 1e12).toFixed(1)}T`;
}

/** An axis label for a power of ten: ×0.01, ×1, ×100, ×10k, ×1M, ×1B. */
export function powerLabel(exponent) {
  if (exponent < 0) return `×${(10 ** exponent).toFixed(-exponent)}`;
  if (exponent < 4) return `×${(10 ** exponent).toLocaleString('en-US')}`;
  if (exponent < 6) return `×${10 ** (exponent - 3)}k`;
  if (exponent < 9) return `×${10 ** (exponent - 6)}M`;
  if (exponent < 12) return `×${10 ** (exponent - 9)}B`;
  return `×${10 ** (exponent - 12)}T`;
}
