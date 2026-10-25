import { useMemo, useRef } from 'react';
import { MAX_HEDGE, outcome } from './hedge';
import { halfWeeks, percent, share, weeks, weeksPair, weeksText } from './format';

// Two ways to size the hedge, over every hedge size from 0 to MAX_HEDGE: the
// swing (lowest at the minimum-variance hedge) and the worst 5% of years
// (best at a bigger hedge). Drag on either chart to set your hedge.

const W = 360;
const H = 210;
const X0 = 44;
const X1 = 344;
const Y0 = 34;
const Y1 = 168;
const mono = { fontFamily: 'var(--font-mono)' };

function MiniCurve({ id, points, mine, best, floor, title, onChange }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const values = points.map((point) => point.value);
  const lowest = Math.min(...values, floor?.value ?? Infinity);
  const highest = Math.max(...values);
  const pad = (highest - lowest) * 0.12 || 1;
  const top = highest + pad;
  const bottom = lowest - pad;
  const x = (size) => X0 + (size / MAX_HEDGE) * (X1 - X0);
  const y = (value) => Y0 + ((top - value) / (top - bottom)) * (Y1 - Y0);
  const line = `M${points.map((point) => `${x(point.size).toFixed(1)},${y(point.value).toFixed(1)}`).join('L')}`;
  const at = (size) => points.reduce((near, point) => (Math.abs(point.size - size) < Math.abs(near.size - size) ? point : near));

  const toSize = (event) => {
    const svg = svgRef.current;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
    const size = ((point.x - X0) / (X1 - X0)) * MAX_HEDGE;
    return Math.round(Math.min(MAX_HEDGE, Math.max(0, size)) * 2) / 2;
  };
  const down = (event) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onChange(toSize(event));
  };
  const move = (event) => {
    if (dragging.current) onChange(toSize(event));
  };
  const up = () => {
    dragging.current = false;
  };

  const you = at(mine);
  const ref = at(best.size);
  const refAnchor = x(ref.size) < X0 + 70 ? 'start' : x(ref.size) > X1 - 70 ? 'end' : 'middle';

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full touch-pan-y select-none"
      role="img"
      aria-label={title}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1={Y0} x2="0" y2={Y1} gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: best.color, stopOpacity: 0.22 }} />
          <stop offset="1" style={{ stopColor: best.color, stopOpacity: 0.02 }} />
        </linearGradient>
      </defs>
      <path d={`${line}L${X1},${Y1}L${X0},${Y1}Z`} fill={`url(#${id}-fill)`} />
      {floor ? (
        <g>
          <line x1={X0} x2={X1} y1={y(floor.value)} y2={y(floor.value)} stroke="var(--muted)" strokeDasharray="4 4" />
          <text x={X1} y={y(floor.value) + 15} fontSize="12" textAnchor="end" fill="var(--muted)">
            {floor.label}
          </text>
        </g>
      ) : null}
      <path d={line} fill="none" stroke="var(--fg)" strokeWidth="2.25" strokeLinejoin="round" />
      <line x1={X0} x2={X1} y1={Y1} y2={Y1} stroke="var(--line-strong)" />

      {/* Axis: hedge size. */}
      {[0, 13, 26].map((tick) => (
        <text key={tick} x={x(tick)} y={Y1 + 20} fontSize="12" textAnchor={tick === 0 ? 'start' : tick === MAX_HEDGE ? 'end' : 'middle'} fill="var(--subtle)" style={mono}>
          {tick === MAX_HEDGE ? '26 wk' : tick}
        </text>
      ))}
      <text x={x(MAX_HEDGE / 2)} y={H - 4} fontSize="12" textAnchor="middle" fill="var(--subtle)">
        Hedge size, weeks of pay
      </text>
      <text x={X0 - 8} y={y(top - pad) + 4} fontSize="12" textAnchor="end" fill="var(--subtle)" style={mono}>
        {weeks(top - pad)}
      </text>
      <text x={X0 - 8} y={y(bottom + pad) + 4} fontSize="12" textAnchor="end" fill="var(--subtle)" style={mono}>
        {weeks(bottom + pad)}
      </text>

      {/* Yours, then the reference size with its label on top (haloed, so it reads over your dot). */}
      <line x1={x(you.size)} x2={x(you.size)} y1={Y1} y2={y(you.value)} stroke="var(--mark)" strokeWidth="1.5" strokeDasharray="3 4" />
      <circle cx={x(you.size)} cy={y(you.value)} r="8" fill="var(--mark)" stroke="var(--surface)" strokeWidth="3" className="cursor-ew-resize" />
      <circle cx={x(ref.size)} cy={y(ref.value)} r="5.5" style={{ fill: best.color }} stroke="var(--surface)" strokeWidth="2" />
      <text
        x={x(ref.size)}
        y={y(ref.value) - 13}
        fontSize="13"
        fontWeight="600"
        textAnchor={refAnchor}
        fill="var(--fg)"
        stroke="var(--surface)"
        strokeWidth="5"
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {best.label}
      </text>
    </svg>
  );
}

function Card({ title, children }) {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h3 className="type-heading text-xl text-fg">{title}</h3>
      {children}
    </div>
  );
}

export default function HedgeCurves({ counts, model, hedge, setHedge }) {
  const { calm, tail, none, shares: split } = model;
  const points = useMemo(() => {
    const list = [];
    for (let size = 0; size <= MAX_HEDGE; size += 0.5) list.push({ size, ...outcome(counts, size) });
    return list;
  }, [counts]);
  const calmOutcome = outcome(counts, calm.hedge);
  const tailOutcome = outcome(counts, tail);
  const tailHelps = tail > calm.hedge + 0.5;
  // Sizes as the slider can set them, so the charts and the buttons agree.
  const calmSize = halfWeeks(calm.hedge);
  const tailSize = halfWeeks(tail);
  const [calmSwing, noSwing] = weeksPair(calmOutcome.sd, none.sd);

  return (
    <div className="mt-16 sm:mt-20">
      <div className="max-w-2xl">
        <h2 className="type-heading text-balance text-2xl text-fg sm:text-3xl">Two ways to size a hedge</h2>
        <p className="mt-3 text-pretty text-base leading-7 text-muted">
          Over all 10,000 simulated years, at the risk you set above. Drag on a chart to try a size; your hedge is the
          bright dot.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card title="The calmest year">
          <div className="mt-4">
            <MiniCurve
              id="hedge-swing"
              title={`Swing in weeks of pay against hedge size. It is lowest at about ${weeksText(calmSize)}.`}
              points={points.map((point) => ({ size: point.size, value: point.sd }))}
              mine={hedge}
              best={{ size: calm.hedge, label: `Calmest: ${weeks(calmSize)} wk`, color: 'var(--c5)' }}
              floor={{ value: calm.ownLuck, label: 'Your own luck' }}
              onChange={setHedge}
            />
          </div>
          <p className="mt-4 text-pretty text-[15px] leading-6 text-muted">
            A hedge of about <strong className="font-semibold text-fg">{weeksText(calmSize)}</strong> pays back what a
            downturn costs you on average, so your swing is as small as it gets:{' '}
            <strong className="font-semibold text-fg">{calmSwing}</strong> weeks, down from {noSwing}.
            That removes only <strong className="font-semibold text-fg">{percent(calm.removed)}</strong> of the variance.
            The rest is your own luck: whether you in particular lose your job, in a good year or a bad one. No contract on
            the economy can reach that.
          </p>
        </Card>

        <Card title="The safest bad years">
          <div className="mt-4">
            <MiniCurve
              id="hedge-worst"
              title={`Average pay in the worst 5% of years against hedge size. It is highest at about ${weeksText(tailSize)}.`}
              points={points.map((point) => ({ size: point.size, value: point.worst }))}
              mine={hedge}
              best={{ size: tail, label: tailHelps ? `Best: ${weeks(tailSize)} wk` : 'Best: none', color: 'var(--c4)' }}
              onChange={setHedge}
            />
          </div>
          <p className="mt-4 text-pretty text-[15px] leading-6 text-muted">
            {tailHelps ? (
              <>
                Your worst 5% of years do best with about <strong className="font-semibold text-fg">{weeksText(tailSize)}</strong>:{' '}
                {weeks(tailOutcome.worst)} weeks of pay on average instead of {weeks(none.worst)}, and the chance of losing
                over half a year’s pay falls from {share(none.half)} to {share(tailOutcome.half)}. The price is a bigger
                swing, {weeks(tailOutcome.sd)} weeks instead of {weeks(none.sd)}, because{' '}
                {percent(split.keptInDownturn)} of downturn years keep the job anyway: for them the payout is a win on a
                bet.
              </>
            ) : (
              <>
                Here a hedge doesn’t help your worst years at all. Your job barely moves with the economy, so most of the
                payout would land in years you didn’t need it, and the cost comes out of the years you did.
              </>
            )}
          </p>
        </Card>
      </div>
    </div>
  );
}
