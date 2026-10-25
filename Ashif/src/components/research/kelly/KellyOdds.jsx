import { useDeferredValue, useMemo } from 'react';
import { kelly, simulate } from './kelly';
import { multiple, percent } from './format';
import { betsFor, STEPS, STRATEGIES } from './strategies';

// The race, run a thousand times: for each bettor, the typical result and
// how often it ever drops to half of its starting money or is ruined. Worked
// out a beat after the sliders move (deferred), so dragging them stays smooth.

const RUNS = 1000;

/** A bankroll multiple; under ×1 it gets a red down-marker (the number stays in the text color, for contrast). */
function Result({ value }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {value < 1 ? (
        <svg aria-hidden="true" viewBox="0 0 10 9" className="size-2.5 shrink-0" style={{ fill: 'var(--stop)' }}>
          <path d="M0 0h10L5 9z" />
        </svg>
      ) : null}
      {multiple(value)}
    </span>
  );
}

/** A share as a bar inside its cell. */
function Share({ value, tone }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-11 shrink-0 font-mono tabular-nums text-fg sm:text-right">{percent(value)}</span>
      <span aria-hidden="true" className="relative h-2 w-full min-w-10 overflow-hidden rounded-full bg-surface-2">
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${value * 100}%`, background: tone }} />
      </span>
    </div>
  );
}

export default function KellyOdds({ price, chance }) {
  const c = useDeferredValue(price) / 100;
  const p = useDeferredValue(chance) / 100;
  const fStar = kelly(p, c);
  const rows = useMemo(() => simulate({ p, c, bets: betsFor(fStar), runs: RUNS, steps: STEPS }), [p, c, fStar]);

  return (
    <div className="mt-10 sm:mt-12">
      <div className="max-w-2xl">
        <h3 className="type-heading text-balance text-2xl text-fg sm:text-3xl">Now run it a thousand times</h3>
        <p className="mt-3 text-pretty text-base leading-7 text-muted">
          One race is luck. These are the same bettors over {RUNS.toLocaleString('en-US')} runs of {STEPS} bets each, at the
          price and chance you set above.
        </p>
      </div>
      {/* Phones: one card per bettor. */}
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:hidden">
        {STRATEGIES.map((s, i) => (
          <li key={s.key} className="rounded-2xl border border-line bg-surface p-4">
            <p className="flex items-center justify-between gap-2 text-[15px] font-medium text-fg">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="font-mono text-[13px] font-normal text-muted">{Math.round(rows[i].f * 100)}%</span>
            </p>
            <dl className="mt-3 space-y-2.5 text-[13px]">
              <div>
                <dt className="text-muted">Typical result</dt>
                <dd className="font-mono text-lg font-bold tabular-nums text-fg">
                  <Result value={rows[i].median} />
                </dd>
              </div>
              <div>
                <dt className="text-muted">Ever drops to half your money</dt>
                <dd className="mt-1">
                  <Share value={rows[i].halved} tone="var(--fg)" />
                </dd>
              </div>
              <div>
                <dt className="text-muted">Ruined (down 99%)</dt>
                <dd className="mt-1">
                  <Share value={rows[i].ruined} tone="var(--stop)" />
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-line bg-surface sm:block">
        <table className="w-full text-left text-[15px]">
          <caption className="sr-only">
            Results of {RUNS} simulated runs of {STEPS} bets for each bettor
          </caption>
          <thead>
            <tr className="border-b border-line text-[13px] text-muted">
              <th scope="col" className="px-5 py-3 font-medium">
                Bettor
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Bets
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Typical result
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Ever drops to half your money
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                Ruined (down 99%)
              </th>
            </tr>
          </thead>
          <tbody>
            {STRATEGIES.map((s, i) => (
              <tr key={s.key} className="border-b border-line last:border-b-0">
                <th scope="row" className="px-5 py-3.5 font-medium text-fg">
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: s.color }} />
                    {s.label}
                  </span>
                </th>
                <td className="px-3 py-3.5 font-mono tabular-nums text-muted">{Math.round(rows[i].f * 100)}%</td>
                <td className="px-3 py-3.5 font-mono font-bold tabular-nums text-fg">
                  <Result value={rows[i].median} />
                </td>
                <td className="px-3 py-3.5">
                  <Share value={rows[i].halved} tone="var(--fg)" />
                </td>
                <td className="px-5 py-3.5">
                  <Share value={rows[i].ruined} tone="var(--stop)" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-pretty text-[13px] leading-5 text-subtle">
        Shares are out of {RUNS.toLocaleString('en-US')} runs. Typical result is the median bankroll after {STEPS} bets,
        starting from ×1.
      </p>
    </div>
  );
}
