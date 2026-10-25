import { Dices } from 'lucide-react';
import { Readout, Slider } from '@/components/research/LabControls';
import Lanes from './Lanes';
import { MAX_HEDGE, SAMPLE, SEARCH_WEEKS, YEARS } from './hedge';
import { halfWeeks, share, signedWeeks, weeks, weeksText } from './format';
import { shortVerdict, verdict } from './words';

// The lab, always drawn in the dark theme: set how likely you are to lose
// your job, watch 1,000 versions of next year, then size a hedge and see the
// years move.

const button =
  'inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-fg transition-colors duration-150 hover:bg-surface-2';
const chip =
  'inline-flex min-h-11 items-center rounded-full border border-line-strong px-3.5 text-sm text-fg transition-colors duration-150 hover:border-fg aria-pressed:border-mark aria-pressed:bg-surface-2';

export default function HedgeLab({ risk, setRisk, mult, setMult, hedge, setHedge, newYears, sim, model, mine }) {
  const downRisk = Math.min(99, Math.round(risk * mult));
  const { calm, tail, none, shares: split } = model;
  const words = verdict(hedge, calm.hedge, tail, split.keptInDownturn);
  // The two reference sizes, on the slider's half-week grid (as the buttons set them).
  const calmSize = halfWeeks(calm.hedge);
  const tailSize = halfWeeks(tail);
  const tailHelps = tailSize > calmSize;
  const marks = [{ key: 'calm', label: 'calmest', value: calm.hedge, color: 'var(--c5)' }];
  if (tailHelps) marks.push({ key: 'tail', label: 'worst years', value: tail, color: 'var(--c4)' });
  // Labels only when the two marks are far enough apart to read.
  if (marks.length === 2 && tail - calm.hedge < 7) marks[1].label = '';

  return (
    <div data-theme="dark" className="overflow-hidden rounded-2xl border border-line bg-surface text-fg">
      {/* Your job. */}
      <div className="grid gap-6 border-b border-line p-5 sm:p-7 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Slider
            id="hedge-risk"
            label="Chance you lose your job in a normal year"
            value={risk}
            min={1}
            max={15}
            onChange={setRisk}
            display={`${risk}%`}
            valueText={`${risk}% in a normal year, ${downRisk}% in a downturn.`}
          />
        </div>
        <div className="lg:col-span-4">
          <Slider
            id="hedge-mult"
            label="In a downturn, that chance is"
            value={mult}
            min={1}
            max={5}
            step={0.5}
            onChange={setMult}
            display={`×${mult}`}
            valueText={`${mult} times as likely in a downturn: ${downRisk}%.`}
          />
        </div>
        <p className="text-pretty text-[15px] leading-6 text-muted md:col-span-2 lg:col-span-4">
          That’s <span className="font-mono font-bold text-fg">{risk}%</span> in a normal year and{' '}
          <span className="font-mono font-bold text-fg">{downRisk}%</span> in a downturn. Assumed: a downturn comes 1 year
          in 5, and finding a new job takes about {Math.round(SEARCH_WEEKS.fine / 4.33)} months, or{' '}
          {Math.round(SEARCH_WEEKS.down / 4.33)} in a downturn.
        </p>
      </div>

      {/* The year, many times. */}
      <div className="border-b border-line p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div>
            <h2 className="type-heading text-xl text-fg">{SAMPLE.toLocaleString('en-US')} versions of next year</h2>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
              <li className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="size-2.5 rounded-full bg-fg" />
                A year you lose your job
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="h-3 w-1.5 rounded-full bg-muted" />
                Years you keep it
              </li>
              {hedge > 0 ? (
                <li className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className="size-2.5 rounded-full bg-mark" />
                  The contract paid out
                </li>
              ) : null}
            </ul>
          </div>
          <button type="button" onClick={newYears} className={`${button} -mr-2`}>
            <Dices aria-hidden="true" className="size-4" strokeWidth={1.75} />
            New years
          </button>
        </div>
        <Lanes
          sample={sim.sample}
          shares={split}
          hedge={hedge}
          cost={mine.cost}
          compact
          label={laneLabel(split, hedge, mine.cost)}
          className="mt-5 block sm:hidden"
        />
        <Lanes
          sample={sim.sample}
          shares={split}
          hedge={hedge}
          cost={mine.cost}
          label={laneLabel(split, hedge, mine.cost)}
          className="mt-5 hidden sm:block"
        />
        <p className="mt-3 text-pretty text-[13px] leading-5 text-muted">
          A sample of {SAMPLE.toLocaleString('en-US')} of the {YEARS.toLocaleString('en-US')} simulated years; the numbers
          below use all {YEARS.toLocaleString('en-US')}. Further left means more weeks without pay.
        </p>
      </div>

      {/* Your hedge. */}
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-5 lg:col-span-5">
          <div className="pb-4">
            <Slider
              id="hedge-size"
              label="Your hedge pays, if a downturn hits"
              value={hedge}
              min={0}
              max={MAX_HEDGE}
              step={0.5}
              onChange={setHedge}
              display={weeksText(hedge)}
              valueText={`${weeksText(hedge)} if a downturn hits, ${weeksText(mine.cost)} a year. ${shortVerdict(hedge, calm.hedge, tail)}`}
              marks={marks}
            />
          </div>
          <p className="text-pretty text-[15px] leading-6 text-muted">
            It costs <span className="font-mono font-bold text-fg">{weeksText(mine.cost)}</span> of pay a year: 20¢ for
            every $1 it would pay.
          </p>
          <div className="-my-1 flex flex-wrap gap-2" role="group" aria-label="Hedge sizes">
            <button type="button" className={chip} aria-pressed={hedge === 0} onClick={() => setHedge(0)}>
              No hedge
            </button>
            {calmSize > 0 ? (
              <button type="button" className={chip} aria-pressed={hedge === calmSize} onClick={() => setHedge(calmSize)}>
                Calmest: {weeks(calmSize)} wk
              </button>
            ) : null}
            {tailHelps ? (
              <button type="button" className={chip} aria-pressed={hedge === tailSize} onClick={() => setHedge(tailSize)}>
                Best for worst years: {weeks(tailSize)} wk
              </button>
            ) : null}
          </div>
          <p className="min-h-12 text-pretty text-[15px] leading-6 text-fg">{words}</p>
        </div>

        <div className="lg:col-span-7 lg:pt-1">
          <dl className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3">
            <Readout
              label="Worst 5% of years: average weeks of pay"
              value={weeks(mine.worst)}
              note={hedge > 0 ? `No hedge: ${weeks(none.worst)} (${signedWeeks(mine.worst - none.worst)})` : 'No hedge'}
            />
            <Readout
              label="Chance you lose over half a year’s pay"
              value={share(mine.half)}
              note={hedge > 0 ? `No hedge: ${share(none.half)}` : 'No hedge'}
            />
            <Readout
              label="Swing in weeks (standard deviation)"
              value={weeks(mine.sd)}
              note={hedge > 0 ? `No hedge: ${weeks(none.sd)}` : 'No hedge'}
            />
          </dl>
          <p className="mt-6 text-pretty text-[13px] leading-5 text-muted">
            At a fair price the hedge costs nothing on average: it only moves pay from normal years to downturns.
          </p>
        </div>
      </div>
    </div>
  );
}

/** The picture in words, for screen readers. */
function laneLabel(split, hedge, cost) {
  const base = `${SAMPLE} sample years. In years with no downturn, ${share(split.lostFine)} include a job loss; in downturns, ${share(split.lostDown)} do.`;
  if (!hedge) return `${base} No hedge.`;
  return `${base} With your hedge, downturn years get ${weeksText(hedge - cost)} more pay and other years ${weeksText(cost)} less.`;
}
