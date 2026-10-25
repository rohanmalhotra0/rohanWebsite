import { useRef } from 'react';
import { breakEven, kelly, perBet } from './kelly';
import { signedPercent } from './format';

// Growth per bet against bet size, for one edge: a hump that peaks at the
// Kelly bet and dives below zero past break-even, with the race's
// bettors marked on it. Drag along it to try your own bet (the slider beside
// it is the keyboard control for the same value).

export const MAX_F = 0.95;
const SAMPLES = 190;
// Two sizes: phones get a narrower drawing, so its text stays readable.
const LAYOUTS = {
  wide: { W: 640, H: 236, X0: 48, X1: 624, Y0: 22, Y1: 196, ticks: [0, 0.25, 0.5, 0.75] },
  compact: { W: 360, H: 236, X0: 50, X1: 350, Y0: 24, Y1: 192, ticks: [0, 0.25, 0.5] },
};
const pct = (f) => `${Math.round(f * 100)}%`;
const mono = { fontFamily: 'var(--font-mono)' };

export default function GrowthCurve({ p, c, f, onChange, markers = [], compact = false, className = '' }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const { W, H, X0, X1, Y0, Y1, ticks } = LAYOUTS[compact ? 'compact' : 'wide'];
  const id = compact ? 'kelly-c' : 'kelly-w';
  const xOf = (value) => X0 + (value / MAX_F) * (X1 - X0);

  const fStar = kelly(p, c);
  const fZero = breakEven(p, c);
  const peak = Math.max(perBet(p, c, fStar), 1e-6);
  const top = peak * 1.5;
  const bottom = -peak * 1.7;
  const yOf = (v) => Y0 + ((top - v) / (top - bottom)) * (Y1 - Y0);
  const zero = yOf(0);

  const points = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const ff = (i / SAMPLES) * MAX_F;
    // Clamp far below the plot so the dive leaves it cleanly.
    points.push(`${xOf(ff).toFixed(1)},${Math.min(Y1 + 40, yOf(perBet(p, c, ff))).toFixed(1)}`);
  }
  const line = `M${points.join('L')}`;
  const area = `M${X0},${zero.toFixed(1)}L${points.join('L')}L${X1},${zero.toFixed(1)}Z`;

  const value = perBet(p, c, f);
  const handleY = Math.min(Y1, yOf(value));
  const losing = value < 0;

  const toF = (event) => {
    const svg = svgRef.current;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
    return Math.min(MAX_F, Math.max(0, ((point.x - X0) / (X1 - X0)) * MAX_F));
  };
  const down = (event) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onChange(toF(event));
  };
  const move = (event) => {
    if (dragging.current) onChange(toF(event));
  };
  const up = () => {
    dragging.current = false;
  };

  // Labels sit on whichever side has room.
  const kellyAnchor = xOf(fStar) < X0 + 90 ? 'start' : xOf(fStar) > X1 - 90 ? 'end' : 'middle';
  const zeroAnchor = xOf(fZero) > X1 - 170 ? 'end' : 'start';

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className={`h-auto w-full touch-pan-y select-none ${className}`}
      role="img"
      aria-label={`Growth per bet against bet size. It peaks at the Kelly bet, ${pct(fStar)}, and drops below zero past ${pct(fZero)}.`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      <defs>
        <clipPath id={`${id}-above`}>
          <rect x={X0} y={0} width={X1 - X0} height={Math.max(0, zero)} />
        </clipPath>
        <clipPath id={`${id}-below`}>
          <rect x={X0} y={zero} width={X1 - X0} height={Math.max(0, Y1 - zero)} />
        </clipPath>
        <clipPath id={`${id}-plot`}>
          <rect x={X0} y={Y0 - 12} width={X1 - X0} height={Y1 - Y0 + 12} />
        </clipPath>
        <linearGradient id={`${id}-gain`} x1="0" y1={Y0} x2="0" y2={zero} gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: 'var(--spot)', stopOpacity: 0.75 }} />
          <stop offset="1" style={{ stopColor: 'var(--spot)', stopOpacity: 0.12 }} />
        </linearGradient>
        <linearGradient id={`${id}-loss`} x1="0" y1={zero} x2="0" y2={Y1} gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: 'var(--toy)', stopOpacity: 0.12 }} />
          <stop offset="1" style={{ stopColor: 'var(--toy)', stopOpacity: 0.5 }} />
        </linearGradient>
      </defs>

      <text x={X0} y="12" fontSize="13" fill="var(--subtle)">
        Typical growth per bet
      </text>

      <g clipPath={`url(#${id}-plot)`}>
        <path d={area} clipPath={`url(#${id}-above)`} fill={`url(#${id}-gain)`} />
        <path d={area} clipPath={`url(#${id}-below)`} fill={`url(#${id}-loss)`} />
        <path d={line} fill="none" stroke="var(--fg)" strokeWidth="2.5" strokeLinejoin="round" />
      </g>
      <line x1={X0} y1={zero} x2={X1} y2={zero} stroke="var(--subtle)" strokeWidth="1.25" />
      <text x={X0 - 8} y={zero + 4} fontSize="12" textAnchor="end" fill="var(--subtle)" style={mono}>
        0%
      </text>
      <text x={X0 - 8} y={yOf(peak) + 4} fontSize="12" textAnchor="end" fill="var(--subtle)" style={mono}>
        {signedPercent(peak)}
      </text>

      {/* Bet-size axis. */}
      {ticks.map((tick) => (
        <text key={tick} x={xOf(tick)} y={H - 10} fontSize="12" textAnchor={tick === 0 ? 'start' : 'middle'} fill="var(--subtle)" style={mono}>
          {pct(tick)}
        </text>
      ))}
      <text x={X1} y={H - 10} fontSize="12" textAnchor="end" fill="var(--subtle)">
        Bet size →
      </text>

      {/* Break-even: past it, growth is negative. */}
      <circle cx={xOf(fZero)} cy={zero} r="4.5" fill="var(--surface)" stroke="var(--toy)" strokeWidth="2.5" />
      <text x={xOf(fZero) + (zeroAnchor === 'start' ? 26 : -12)} y={zero + 24} fontSize="13" textAnchor={zeroAnchor} fill="var(--toy)">
        Past {pct(fZero)}, you go broke
      </text>

      {/* The race's bettors, Kelly at the top of the hump. */}
      {markers.map((marker) => (
        <circle
          key={marker.label}
          cx={xOf(marker.f)}
          cy={Math.min(Y1, yOf(perBet(p, c, marker.f)))}
          r={marker.f === fStar ? 6.5 : 5}
          style={{ fill: marker.color }}
          stroke="var(--surface)"
          strokeWidth="2"
        />
      ))}
      <text x={xOf(fStar)} y={yOf(peak) - 14} fontSize="14" fontWeight="600" textAnchor={kellyAnchor} fill="var(--fg)">
        Kelly: f* = {pct(fStar)}
      </text>

      {/* Your bet. */}
      <line x1={xOf(f)} y1={zero} x2={xOf(f)} y2={handleY} stroke={losing ? 'var(--toy)' : 'var(--fg)'} strokeWidth="1.5" strokeDasharray="3 4" />
      <circle cx={xOf(f)} cy={handleY} r="10" fill={losing ? 'var(--toy)' : 'var(--fg)'} stroke="var(--surface)" strokeWidth="3" className="cursor-ew-resize" />
    </svg>
  );
}
