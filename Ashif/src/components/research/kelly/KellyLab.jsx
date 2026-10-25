import { useMemo, useRef, useState } from 'react';
import { Dices, Pause, Play, RotateCcw } from 'lucide-react';
import GrowthCurve, { MAX_F } from './GrowthCurve';
import RaceCanvas from './RaceCanvas';
import { breakEven, growth, kelly, perBet, RUIN, simulate } from './kelly';
import { multiple, signedPercent } from './format';
import { betsFor, STEPS, STRATEGIES } from './strategies';
import { Readout, Slider } from '@/components/research/LabControls';

// The lab, always drawn in the dark theme: set a contract's price and your
// probability, watch five bettors race on the same coin flips, then try any
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
    if (at >= 0) ruined.push({ at, label: STRATEGIES[i].label });
    else if (best < 0 || path[STEPS] > paths[best][STEPS]) best = i;
  });
  // Earliest first: "3× Kelly went broke at bet 71, 2× Kelly at bet 107."
  ruined.sort((a, b) => a.at - b.at);
  const lead = best >= 0 ? `${STRATEGIES[best].label} finished ahead at ${multiple(paths[best][STEPS])}.` : '';
  const broke = ruined.length
    ? `${ruined.map((r, i) => `${r.label} ${i === 0 ? 'went broke ' : ''}at bet ${r.at}`).join(', ')}. `
    : 'Nobody went broke this time. ';
  return `${broke}${lead} New flips change the winner; the odds below don’t.`;
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

  // The race: one run of the bettors. `restart` replays the same flips.
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
            valueText={`Price ${price} cents. ${kellyText}`}
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
            valueText={`Chance ${chance}%. ${kellyText}`}
          />
        </div>
        <p className="text-pretty text-[15px] leading-6 text-muted md:col-span-2 lg:col-span-4">
          {edge > 0 ? (
            <>
              A {edge}-point edge. Kelly says bet <span className="font-mono font-bold text-fg">{pct(fStar)}</span>{' '}
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
            <h3 className="type-heading text-xl text-fg">Five bettors, the same coin flips</h3>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
              {STRATEGIES.map((s, i) => (
                <li key={s.key} className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="h-[3px] w-4 rounded-full"
                    style={{
                      background: s.dash
                        ? `repeating-linear-gradient(90deg, ${s.color} 0 5px, transparent 5px 8px)`
                        : s.color,
                    }}
                  />
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
          dashes={STRATEGIES.map((s) => s.dash)}
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
        <p className="mt-1 text-pretty text-[13px] leading-5 text-muted">
          At 2× Kelly your edge is gone: long-run growth is about zero. Past 2×, you lose money in the long run, even with
          an edge. Simulated coin flips.
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
                      { key: 'kelly', label: 'Kelly', value: Math.round(fStar * 100), color: 'var(--fg)' },
                      ...(fZero - fStar > 0.06
                        ? [
                            {
                              key: 'zero',
                              label: fZero - fStar > 0.24 ? 'broke' : '',
                              value: Math.round(fZero * 100),
                              color: 'var(--stop)',
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
            <Readout label="Typical growth per bet" value={signedPercent(rate)} tone={rate < 0 ? 'text-stop' : 'text-accent'} />
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
