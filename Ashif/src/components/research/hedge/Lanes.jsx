import { useEffect, useMemo, useRef, useState } from 'react';
import { WEEKS } from './hedge';
import { percent } from './format';

// "1,000 versions of next year": two lanes, normal years above and downturns
// below, on one axis of pay received over the next 12 months. Each dot is a
// year with a job loss; the bar at 52 weeks is every year without one. The
// dots are a sample; the shares in the labels are over all simulated years. The
// hedge moves whole lanes: downturns get the payout minus the cost, normal
// years pay the cost. The first time the chart scrolls into view, the dots
// leave the full-pay bar in the order the layoffs happened.

const LAYOUTS = {
  wide: { W: 960, X0: 16, X1: 944, LANE: 116, GAP: 14, AXIS: 44, R: 4.25, BAR: 7, ticks: [0, 13, 26, 39, 52, 65] },
  compact: { W: 360, X0: 8, X1: 352, LANE: 108, GAP: 12, AXIS: 40, R: 3.1, BAR: 5, ticks: [0, 26, 52] },
};
/** The axis runs past a full year, so a downturn year with a big payout still fits. */
const X_MAX = 74;
const LABEL_ROW = 30;
const mono = { fontFamily: 'var(--font-mono)' };

/**
 * Lay dots out along x without overlaps: each one takes the free spot
 * nearest the lane's midline. Squeezed vertically if a lane overflows.
 */
function swarm(points, r, room) {
  const gap = 2 * r + 0.75;
  const placed = [];
  for (const point of points) {
    const blocked = [];
    for (const other of placed) {
      const dx = point.x - other.x;
      if (Math.abs(dx) < gap) {
        const dy = Math.sqrt(gap * gap - dx * dx);
        blocked.push([other.y - dy, other.y + dy]);
      }
    }
    const options = [0];
    for (const [a, b] of blocked) options.push(a, b);
    options.sort((a, b) => Math.abs(a) - Math.abs(b) || a - b);
    const y = options.find((c) => blocked.every(([a, b]) => c <= a + 1e-6 || c >= b - 1e-6)) ?? 0;
    placed.push({ ...point, y });
  }
  const tallest = placed.reduce((most, point) => Math.max(most, Math.abs(point.y)), 0);
  const squeeze = tallest > room ? room / tallest : 1;
  return placed.map((point) => ({ ...point, y: point.y * squeeze }));
}

export default function Lanes({ sample, shares, hedge, cost, compact = false, label, className = '' }) {
  const { W, X0, X1, LANE, GAP, AXIS, R, BAR, ticks } = LAYOUTS[compact ? 'compact' : 'wide'];
  const H = LANE * 2 + GAP + AXIS;
  const perWeek = (X1 - X0) / X_MAX;
  const x = (weeks) => X0 + weeks * perWeek;
  const hedged = hedge > 0;

  // Each lane's dots, laid out once per sample and layout.
  const lanes = useMemo(() => {
    const layout = LAYOUTS[compact ? 'compact' : 'wide'];
    const step = (layout.X1 - layout.X0) / X_MAX;
    const room = (layout.LANE - LABEL_ROW - 10) / 2 - layout.R;
    return [false, true].map((down) => {
      const years = sample.filter((year) => year.down === down);
      const losses = years
        .filter((year) => year.laidOff >= 0)
        .map((year) => ({ id: year.id, x: layout.X0 + year.paid * step, laidOff: year.laidOff }))
        .sort((a, b) => a.x - b.x || a.id - b.id);
      return { down, dots: swarm(losses, layout.R, room) };
    });
  }, [sample, compact]);

  // The intro: 'done' on the server and once played; 'start' parks the dots
  // in the full-pay bar until the chart scrolls into view.
  const svgRef = useRef(null);
  const [phase, setPhase] = useState('done');
  useEffect(() => {
    const svg = svgRef.current;
    // Not for the copy hidden at this width, or with reduced motion.
    if (!svg || !svg.getClientRects().length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const box = svg.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return undefined;
    setPhase('start');
    let timer = 0;
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        seen.disconnect();
        setPhase('intro');
        timer = window.setTimeout(() => setPhase('done'), 2000);
      },
      { threshold: 0.5 }
    );
    seen.observe(svg);
    return () => {
      seen.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const fullPay = x(WEEKS);

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className={`h-auto w-full ${className}`} role="img" aria-label={label}>
      {lanes.map((lane, index) => {
        const top = index * (LANE + GAP);
        const mid = top + LABEL_ROW + (LANE - LABEL_ROW - 10) / 2 + 2;
        const shift = (lane.down ? hedge - cost : -cost) * perWeek;
        const paid = lane.down && hedged;
        const tone = paid ? 'var(--mark)' : 'var(--fg)';
        const name = lane.down ? 'Downturn' : 'Economy fine';
        return (
          <g key={name}>
            <rect x={0} y={top} width={W} height={LANE} rx={14} fill="var(--surface-2)" />
            <rect
              x={0}
              y={top}
              width={W}
              height={LANE}
              rx={14}
              fill="var(--mark)"
              className="transition-opacity duration-300 motion-reduce:transition-none"
              opacity={paid ? 0.09 : 0}
            />
            <text x={14} y={top + 21} fontSize="14" fontWeight="600" fill="var(--fg)">
              {name}
              <tspan dx="8" fontWeight="400" fill="var(--muted)">
                {percent(lane.down ? shares.down : 1 - shares.down)}
                {compact ? '' : lane.down ? ' of years, when the contract pays' : ' of years'}
              </tspan>
            </text>

            {/* Where the full-pay bar sat before the hedge moved it. */}
            {hedge > 0 ? (
              <rect
                x={fullPay - BAR / 2}
                y={top + LABEL_ROW - 2}
                width={BAR}
                height={LANE - LABEL_ROW - 6}
                rx={BAR / 2}
                fill="none"
                stroke="var(--line-strong)"
                strokeDasharray="3 3"
              />
            ) : null}

            <g
              className="transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(${shift.toFixed(2)}px)` }}
            >
              <rect
                x={fullPay - BAR / 2}
                y={top + LABEL_ROW - 2}
                width={BAR}
                height={LANE - LABEL_ROW - 6}
                rx={BAR / 2}
                fill={paid ? 'var(--mark)' : 'var(--muted)'}
                className="transition-[fill] duration-300 motion-reduce:transition-none"
              />
              <text x={fullPay - BAR / 2 - 7} y={top + 21} fontSize="13" textAnchor="end" fill="var(--muted)">
                {compact ? 'Kept: ' : 'Kept the job: '}
                <tspan fill="var(--fg)" fontWeight="600" style={mono}>
                  {percent(1 - (lane.down ? shares.lostDown : shares.lostFine))}
                </tspan>
              </text>
              {lane.dots.map((dot) => {
                const parked = phase === 'start';
                const style = {
                  transform: parked
                    ? `translate(${fullPay.toFixed(2)}px, ${mid.toFixed(2)}px)`
                    : `translate(${dot.x.toFixed(2)}px, ${(mid + dot.y).toFixed(2)}px)`,
                  transitionProperty: parked ? 'none' : 'transform, fill',
                  transitionDuration: phase === 'intro' ? '900ms, 300ms' : '450ms, 300ms',
                  transitionDelay: phase === 'intro' ? `${dot.laidOff * 16}ms, 0ms` : '0ms',
                  transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                };
                return (
                  <circle
                    key={dot.id}
                    r={R}
                    fill={tone}
                    stroke="var(--surface)"
                    strokeWidth="1"
                    style={style}
                    className="motion-reduce:transition-none"
                  />
                );
              })}
            </g>
          </g>
        );
      })}

      {/* Pay received over the next 12 months, in weeks of pay. */}
      <g transform={`translate(0 ${LANE * 2 + GAP})`}>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={x(tick)} x2={x(tick)} y1={4} y2={10} stroke="var(--line-strong)" />
            <text
              x={x(tick)}
              y={26}
              fontSize="12"
              textAnchor={tick === 0 ? 'start' : 'middle'}
              fill={tick === WEEKS ? 'var(--fg)' : 'var(--subtle)'}
              fontWeight={tick === WEEKS ? 600 : 400}
              style={mono}
            >
              {tick === WEEKS ? '52 = full year' : tick}
            </text>
          </g>
        ))}
        {compact ? null : (
          <text x={X1} y={26} fontSize="12" textAnchor="end" fill="var(--subtle)">
            weeks of pay →
          </text>
        )}
      </g>
    </svg>
  );
}
