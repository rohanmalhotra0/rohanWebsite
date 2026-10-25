import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { crossover, growthIfWrong, shareOfBest } from './kelly';
import { percent, signedShare } from './format';

// Why people bet a fraction of f*, worked out at the price and chance set in
// the lab: the growth curve is lopsided, and edges are easy to overestimate.
// Standard results, not claims from the paper.

/** Growth as a share of the best, against the bet as a multiple of Kelly. */
function Lopsided({ p, c }) {
  const W = 320;
  const H = 168;
  const X0 = 12;
  const X1 = 308;
  const Y0 = 26;
  const Y1 = 142;
  const MAX = 2.5;
  const top = 1.18;
  const bottom = -0.55;
  const x = (m) => X0 + (m / MAX) * (X1 - X0);
  const y = (s) => Y0 + ((top - s) / (top - bottom)) * (Y1 - Y0);
  const zero = y(0);
  const points = [];
  for (let i = 0; i <= 100; i++) {
    const m = (i / 100) * MAX;
    points.push(`${x(m).toFixed(1)},${Math.min(Y1 + 30, y(shareOfBest(p, c, m))).toFixed(1)}`);
  }
  const area = `M${X0},${zero}L${points.join('L')}L${X1},${zero}Z`;
  const marks = [
    { m: 0.5, label: '½ Kelly', color: 'var(--fg)' },
    { m: 1, label: 'Kelly', color: 'var(--accent)' },
    { m: 2, label: '2×', color: 'var(--toy)' },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-[24rem]" aria-hidden="true">
      <defs>
        <clipPath id="lopsided-above">
          <rect x={X0} y={0} width={X1 - X0} height={zero} />
        </clipPath>
        <clipPath id="lopsided-below">
          <rect x={X0} y={zero} width={X1 - X0} height={Y1 - zero} />
        </clipPath>
        <clipPath id="lopsided-plot">
          <rect x={X0} y={0} width={X1 - X0} height={Y1} />
        </clipPath>
      </defs>
      <g clipPath="url(#lopsided-plot)">
        <path d={area} clipPath="url(#lopsided-above)" fill="var(--spot)" opacity="0.35" />
        <path d={area} clipPath="url(#lopsided-below)" fill="var(--toy)" opacity="0.32" />
        <path d={`M${points.join('L')}`} fill="none" stroke="var(--fg)" strokeWidth="2.25" />
      </g>
      <line x1={X0} y1={zero} x2={X1} y2={zero} stroke="var(--line-strong)" />
      {marks.map(({ m, label, color }) => {
        const s = shareOfBest(p, c, m);
        const cy = Math.min(Y1, y(s));
        return (
          <g key={m}>
            <circle cx={x(m)} cy={cy} r="5" fill={color} stroke="var(--surface)" strokeWidth="2" />
            {/* Low points get their label beside them, clear of the curve. */}
            <text
              x={s < 0.3 ? x(m) + 9 : x(m)}
              y={s < 0.3 ? cy + 4 : cy - 11}
              fontSize="13"
              fontWeight="600"
              textAnchor={s < 0.3 ? 'start' : 'middle'}
              fill="var(--fg)"
            >
              {signedShare(s)}
            </text>
            <text x={x(m)} y={H - 6} fontSize="12" textAnchor="middle" fill="var(--subtle)">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Two bars on one scale, from −100% to +100% of the best growth. */
function Bar({ label, share }) {
  const clamped = Math.max(-1, Math.min(1, Number.isFinite(share) ? share : -1));
  const ZERO = 30; // percent of the width left of zero
  const width = clamped >= 0 ? clamped * (100 - ZERO) : -clamped * ZERO;
  const left = clamped >= 0 ? ZERO : ZERO - width;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className={`font-mono font-bold tabular-nums ${share < 0 ? 'text-stop' : 'text-fg'}`}>{signedShare(share)}</span>
      </div>
      <div className="relative mt-1.5 h-3 rounded-full bg-surface-2">
        <span aria-hidden="true" className="absolute inset-y-[-3px] w-px bg-line-strong" style={{ left: `${ZERO}%` }} />
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 rounded-full transition-[left,width] duration-200 ease-out motion-reduce:transition-none ${share < 0 ? 'bg-toy' : 'bg-spot'}`}
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h4 className="type-heading text-xl text-fg">{title}</h4>
      {children}
    </div>
  );
}

export default function WhyHalf({ price, chance }) {
  const c = price / 100;
  const p = chance / 100;
  const [real, setReal] = useState(50);
  const hasEdge = p > c;
  const full = growthIfWrong(p, c, real / 100, 1);
  const half = growthIfWrong(p, c, real / 100, 0.5);

  return (
    <div className="mt-16 sm:mt-20">
      <div className="max-w-2xl">
        <h3 className="type-heading text-balance text-2xl text-fg sm:text-3xl">Why people bet half</h3>
        <p className="mt-3 text-pretty text-base leading-7 text-muted">
          The paper stops at f*. In practice, traders often bet a fraction of it. Two reasons, worked out at the price and
          chance you set above.
        </p>
      </div>

      {hasEdge ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card title="Half the bet, most of the growth">
            <div className="mt-4">
              <Lopsided p={p} c={c} />
            </div>
            <p className="mt-4 text-pretty text-[15px] leading-6 text-muted">
              Half Kelly keeps{' '}
              <strong className="font-semibold text-fg">{signedShare(shareOfBest(p, c, 0.5))}</strong> of the long-run
              growth. Double Kelly gets <strong className="font-semibold text-fg">{signedShare(shareOfBest(p, c, 2))}</strong>:
              betting too much costs far more than betting too little.
            </p>
          </Card>

          <Card title="If your edge is smaller than you think">
            <label htmlFor="kelly-real" className="mt-4 text-sm text-muted">
              Your real edge is <span className="font-mono font-bold text-fg">{real}%</span> of what you think
            </label>
            <input
              id="kelly-real"
              type="range"
              min="10"
              max="150"
              step="5"
              value={real}
              onChange={(event) => setReal(Number(event.target.value))}
              aria-valuetext={`Your real edge is ${real}% of what you think. Full Kelly gets ${signedShare(full)} of the best growth; half Kelly gets ${signedShare(half)}.`}
              className="kelly-range mt-1 block w-full"
              style={{ '--val': `${((real - 10) / 140) * 100}%` }}
            />
            <div className="mt-4 space-y-3">
              <Bar label="Full Kelly" share={full} />
              <Bar label="Half Kelly" share={half} />
            </div>
            <p className="mt-4 text-pretty text-[15px] leading-6 text-muted">
              Share of the best growth you could have had. Half Kelly comes out ahead whenever your real edge is under{' '}
              <strong className="font-semibold text-fg">{percent(crossover(p, c))}</strong> of your estimate.
            </p>
          </Card>
        </div>
      ) : (
        <p className="mt-6 max-w-2xl rounded-2xl border border-line bg-surface p-5 text-pretty text-[15px] leading-6 text-muted">
          Set your chance above the price to give yourself an edge; without one, there’s nothing to size.
        </p>
      )}

      <p className="mt-8 max-w-2xl text-pretty text-base leading-7 text-muted">
        Prediction-market contracts are bets like these. I built a dashboard that streams live Kalshi prices and lets me test
        position sizes with the Kelly criterion.{' '}
        <a href="/projects/#project/kalshi-live-kelly" className="link inline-flex items-center gap-0.5 font-medium text-fg">
          See the Kalshi dashboard
          <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
        </a>
      </p>
    </div>
  );
}
