import { useMemo, useRef, useState } from 'react';
import { Dices, Pause, Play, RotateCcw } from 'lucide-react';
import GrowthCurve, { MAX_F } from './GrowthCurve';
import RaceCanvas from './RaceCanvas';
import { breakEven, growth, kelly, perBet, RUIN, simulate } from './kelly';
import { multiple, signedPercent } from './format';
import { betsFor, STEPS, STRATEGIES } from './strategies';

// The lab, always drawn in the dark theme: set a contract's price and your
// probability, watch four bettors race on the same coin flips, then try any
// bet size on the growth curve.

const pct = (f) => `${Math.round(f * 100)}%`;

/** Where a bet sits relative to Kelly, in words. */
function verdict(f, fStar, fZero) {
  if (fStar <= 0) return f > 0 ? 'No edge: every bet loses money in the long run.' : 'No edge, no bet.';
  if (f >= fZero) return 'Past break-even: in the long run you go broke, even with the edge.';
  if (Math.abs(f - fStar) < 0.0075) return 'The Kelly bet: the fastest long-run growth.';
  if (f > fStar) return 'Over Kelly: more risk for less growth.';
  if (f >= fStar / 2) return 'Between half and full Kelly: a little less growth, much smaller swings.';
  if (f === 0) return 'No bet, no growth.';
  return 'Under half Kelly: safe, but slow.';
}

/** One sentence on how the race went. */
function outcome(paths) {
  const ruined = [];
  let best = -1;
  paths.forEach((path, i) => {
    const at = path.findIndex((w) => w <= RUIN);
    if (at >= 0) ruined.push(`${STRATEGIES[i].label} went broke at bet ${at}`);
    else if (best < 0 || path[STEPS] > paths[best][STEPS]) best = i;
  });
  const lead = best >= 0 ? `${STRATEGIES[best].label} finished ahead at ${multiple(paths[best][STEPS])}.` : '';
  const broke = ruined.length ? `${ruined.join(', ')}. ` : 'Nobody went broke this time. ';
  return `${broke}${lead} New flips change the winner; the odds below don’t.`;
}

function Slider({ id, label, value, min, max, onChange, display, valueText, marks = [] }) {
  const at = (v) => `calc(11px + (100% - 22px) * ${(v - min) / (max - min)})`;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm text-muted">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-lg font-bold text-fg tabular-nums">
          {display}
        </output>
      </div>
      <div className="relative mt-1.5">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step="1"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-valuetext={valueText}
          className="kelly-range block w-full"
          style={{ '--val': `${((value - min) / (max - min)) * 100}%` }}
        />
        {marks.map((mark) => (
          <span
            key={mark.key}
            aria-hidden="true"
            className="pointer-events-none absolute top-full -mt-1 flex -translate-x-[5px] items-center gap-1 whitespace-nowrap font-mono text-[11px] leading-4"
            style={{ left: at(mark.value), color: mark.color }}
          >
            <span className="text-[10px]">▲</span>
            {mark.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Readout({ label, value, tone = 'text-fg' }) {
  return (
    <div className="flex flex-col-reverse justify-end gap-1">
      <dt className="text-[13px] leading-5 text-muted">{label}</dt>
      <dd className={`type-heading text-[1.75rem] leading-none tabular-nums ${tone}`}>{value}</dd>
    </div>
  );
}

const button =
  'inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-fg transition-colors duration-150 hover:bg-surface-2';

export default function KellyLab({ price, setPrice, chance, setChance }) {
  const c = price / 100;
  const p = chance / 100;
  const fStar = kelly(p, c);
  const fZero = breakEven(p, c);
  const bets = betsFor(fStar);
  const edge = Math.round((p - c) * 100);

  // The race: one run of the four bettors. `restart` replays the same flips.
  const [seed, setSeed] = useState(7);
  const [restart, setRestart] = useState(0);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const stepRef = useRef(null);
  const paths = useMemo(
    () => simulate({ p, c, bets: betsFor(fStar), runs: 1, steps: STEPS, seed }).map((r) => r.path),
    [p, c, fStar, seed]
  );
  const startOver = (nextSeed) => {
    if (nextSeed) setSeed((value) => value + 1);
    else setRestart((value) => value + 1);
    setPaused(false);
    setFinished(false);
  };

  // Your own bet, on the growth curve.
  const [mine, setMine] = useState(30);
  const f = mine / 100;
  const words = verdict(f, fStar, fZero);
  const rate = perBet(p, c, f);
  const markers = STRATEGIES.map((s, i) => ({ label: s.label, f: bets[i], color: s.color }));
  const pick = (next) => setMine(Math.round(next * 100));
  const kellyText = edge > 0 ? `The Kelly bet is ${pct(fStar)} of your money.` : 'No edge at this price.';

  return (
    <div data-theme="dark" className="overflow-hidden rounded-2xl border border-line bg-surface text-fg">
      {/* The bet. */}
      <div className="grid gap-6 border-b border-line p-5 sm:p-7 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Slider
            id="kelly-price"
            label="Price of a contract that pays $1"
            value={price}
            min={5}
            max={95}
            onChange={setPrice}
            display={`${price}¢`}
            valueText={`${price} cents. ${kellyText}`}
          />
        </div>
        <div className="lg:col-span-4">
          <Slider
            id="kelly-chance"
            label="Your chance it happens"
            value={chance}
            min={1}
            max={99}
            onChange={setChance}
            display={`${chance}%`}
            valueText={`${chance}% chance. ${kellyText}`}
          />
        </div>
        <p className="text-pretty text-[15px] leading-6 text-muted md:col-span-2 lg:col-span-4">
          {edge > 0 ? (
            <>
              A {edge}-point edge. Kelly says bet <span className="font-mono font-bold text-accent">{pct(fStar)}</span>{' '}
              of your money each time: <span className="whitespace-nowrap font-mono text-fg">f* = (p − c)/(1 − c)</span>.
              {price === 50 ? ' At 50¢ that’s the paper’s even-money bet, f* = p − q.' : ''}
            </>
          ) : (
            <>No edge: you don’t think it’s any likelier than the price says. Kelly says don’t bet.</>
          )}
        </p>
      </div>

      {/* The race. */}
      <div className="border-b border-line p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div>
            <h3 className="type-heading text-xl text-fg">Four bettors, the same coin flips</h3>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
              {STRATEGIES.map((s, i) => (
                <li key={s.key} className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-[3px] w-4 rounded-full" style={{ background: s.color }} />
                  {s.label} <span className="font-mono text-subtle">{pct(bets[i])}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-1">
            <p className="mr-2 font-mono text-[13px] text-subtle tabular-nums" aria-hidden="true">
              bet <span ref={stepRef}>0</span>/{STEPS}
            </p>
            {finished ? (
              <button type="button" onClick={() => startOver(false)} className={button}>
                <RotateCcw aria-hidden="true" className="size-4" strokeWidth={1.75} />
                Replay
              </button>
            ) : (
              <button type="button" onClick={() => setPaused((value) => !value)} className={`${button} motion-reduce:hidden`}>
                {paused ? (
                  <Play aria-hidden="true" className="size-4" strokeWidth={1.75} />
                ) : (
                  <Pause aria-hidden="true" className="size-4" strokeWidth={1.75} />
                )}
                {paused ? 'Play' : 'Pause'}
              </button>
            )}
            <button type="button" onClick={() => startOver(true)} className={`${button} -mr-2`}>
              <Dices aria-hidden="true" className="size-4" strokeWidth={1.75} />
              New flips
            </button>
          </div>
        </div>
        <RaceCanvas
          paths={paths}
          colors={STRATEGIES.map((s) => s.color)}
          names={STRATEGIES.map((s) => s.label)}
          runKey={`${seed}:${restart}`}
          paused={paused}
          onStep={(step) => {
            if (stepRef.current) stepRef.current.textContent = String(step);
          }}
          onFinish={() => setFinished(true)}
          label={`A race of ${STEPS} bets on the same coin flips. ${outcome(paths)}`}
          className="mt-4 block h-64 w-full sm:h-80"
        />
        <p aria-live="polite" className="mt-3 min-h-12 text-pretty text-[15px] leading-6 text-fg">
          {finished ? outcome(paths) : ''}
        </p>
      </div>

      {/* Your bet on the growth curve. */}
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="pb-4">
            <Slider
              id="kelly-mine"
              label="Try your own bet"
              value={mine}
              min={0}
              max={Math.round(MAX_F * 100)}
              onChange={setMine}
              display={`${mine}%`}
              valueText={`${mine}% of your money each bet. ${words}`}
              marks={
                fStar > 0
                  ? [
                      { key: 'kelly', label: 'Kelly', value: Math.round(fStar * 100), color: 'var(--accent)' },
                      ...(fZero - fStar > 0.06
                        ? [
                            {
                              key: 'zero',
                              label: fZero - fStar > 0.24 ? 'broke' : '',
                              value: Math.round(fZero * 100),
                              color: 'var(--toy)',
                            },
                          ]
                        : []),
                    ]
                  : []
              }
            />
          </div>
          <p className="min-h-12 text-pretty text-[15px] leading-6 text-fg">{words}</p>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-6">
            <Readout label="Typical growth per bet" value={signedPercent(rate)} tone={rate < 0 ? 'text-toy' : 'text-accent'} />
            <Readout label={`Typical bankroll after ${STEPS} bets`} value={multiple(Math.exp(STEPS * growth(p, c, f)))} />
          </dl>
        </div>
        <div className="lg:col-span-8">
          <GrowthCurve p={p} c={c} f={f} onChange={pick} markers={markers} compact className="block sm:hidden" />
          <GrowthCurve p={p} c={c} f={f} onChange={pick} markers={markers} className="hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
