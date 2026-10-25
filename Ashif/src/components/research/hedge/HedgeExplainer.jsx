import { useDeferredValue, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { research } from '@/data/portfolioData';
import HedgeCurves from './HedgeCurves';
import HedgeLab from './HedgeLab';
import { bestForWorstYears, minimumVariance, outcome, SEED, shares, simulate, YEARS } from './hedge';

// "Hedge your paycheck": the income-hedging paper as something to play with.
// The lab and the two charts share one risk and one hedge, so moving either
// re-works both. The simulation re-runs a beat after the risk sliders move
// (deferred), so dragging them stays smooth.

const paper = research.find((item) => item.keywords?.includes('Kalshi'));

function Formula({ children }) {
  return <p className="font-mono text-[15px] leading-7 text-fg sm:text-base">{children}</p>;
}

const v = (name) => <var className="font-mono not-italic text-fg">{name}</var>;

export default function HedgeExplainer({ className }) {
  const [risk, setRisk] = useState(4);
  const [mult, setMult] = useState(3);
  const [hedge, setHedge] = useState(8);
  const [seed, setSeed] = useState(SEED);
  const base = useDeferredValue(risk);
  const times = useDeferredValue(mult);

  const sim = useMemo(() => simulate({ base: base / 100, mult: times, seed }), [base, times, seed]);
  const model = useMemo(
    () => ({
      calm: minimumVariance(sim.counts),
      tail: bestForWorstYears(sim.counts),
      none: outcome(sim.counts, 0),
      shares: shares(sim.counts),
    }),
    [sim]
  );
  const mine = outcome(sim.counts, hedge);

  return (
    <div className={className}>
      <HedgeLab
        risk={risk}
        setRisk={setRisk}
        mult={mult}
        setMult={setMult}
        hedge={hedge}
        setHedge={setHedge}
        newYears={() => setSeed((value) => value + 1)}
        sim={sim}
        model={model}
        mine={mine}
      />
      <p className="mt-3 text-[13px] leading-5 text-subtle">Illustration, not advice.</p>

      <HedgeCurves counts={sim.counts} model={model} hedge={hedge} setHedge={setHedge} />

      <section aria-labelledby="hedge-math" className="mt-16 grid gap-6 rounded-2xl border border-line p-5 sm:mt-20 sm:p-8 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <h2 id="hedge-math" className="type-heading text-2xl text-fg">
            The math, from the paper
          </h2>
          {paper ? (
            <>
              <p className="mt-3 text-sm leading-6 text-subtle">
                {paper.title} · {paper.authors} · {paper.year}
              </p>
              <div className="-mb-3 mt-3">
                <a
                  href={paper.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="link inline-flex min-h-11 items-center gap-1 text-[15px] font-medium text-fg"
                >
                  Read the paper (PDF)
                  <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            </>
          ) : null}
        </div>
        <div className="space-y-2 md:col-span-8">
          <p className="text-pretty text-[15px] leading-7 text-muted">
            You’re employed ({v('E')} = 1) or not ({v('E')} = 0), and paid {v('S')} while employed:
          </p>
          <Formula>dW = S·E dt</Formula>
          <p className="text-pretty text-[15px] leading-7 text-muted">
            Job loss is a Poisson jump with a hazard {v('λ')} that depends on unemployment {v('U')}, interest rates {v('r')}{' '}
            and industry risk {v('I')}: <span className="whitespace-nowrap font-mono text-fg">λ = α + β₁U + β₂r + β₃I</span>.
            Here it simply jumps by your × in a downturn. A contract {v('H')} that pays when unemployment rises moves with
            the pay you lose, {v('L')}, and the hedge is sized to make the variance of {v('L − h·H')} as small as possible:
          </p>
          <Formula>h* = Cov(L, H) / Var(H)</Formula>
          <p className="text-pretty text-[15px] leading-7 text-muted">
            Worked out here for a $1 contract that pays in a downturn, which comes with probability {v('q')}:
          </p>
          <Formula>Var(H) = q(1 − q)</Formula>
          <Formula>Cov(L, H) = q(1 − q)·(E[L | downturn] − E[L | no downturn])</Formula>
          <p className="text-pretty text-[15px] leading-7 text-muted">so</p>
          <Formula>h* = E[L | downturn] − E[L | no downturn],</Formula>
          <p className="text-pretty text-[15px] leading-7 text-muted">
            what a downturn costs you on average. What’s left is{' '}
            <span className="whitespace-nowrap font-mono text-fg">Var(L)·(1 − ρ²)</span>, where {v('ρ')} is the correlation
            between {v('L')} and {v('H')}: the hedge removes the part of your risk that moves with the economy and none of
            the rest. The paper’s yardsticks are the ones in the lab: the variance, the expected shortfall (the worst 5% of
            cases), and the chance that income drops by more than half.
          </p>
        </div>
      </section>

      <section aria-labelledby="hedge-assumptions" className="mt-6 rounded-2xl border border-line p-5 sm:p-8">
        <h2 id="hedge-assumptions" className="type-heading text-xl text-fg">
          The assumptions
        </h2>
        <p className="mt-2 text-pretty text-[15px] leading-6 text-muted">Made up for illustration; none of this is market data.</p>
        <ul className="mt-4 grid gap-x-8 gap-y-3 text-pretty text-[15px] leading-6 text-muted md:grid-cols-2">
          <li>
            A downturn comes 1 year in 5. The contract costs 20¢ per $1 of payout, the same odds, so on average it costs
            nothing. Real markets charge fees.
          </li>
          <li>
            Each week you might be let go, at the chance you set. Out of work, you find a new job after 5 months on
            average, or 8 in a downturn.
          </li>
          <li>Pay is the same every week you work. No severance, unemployment benefits, taxes, or pay cut at the next job.</li>
          <li>
            {YEARS.toLocaleString('en-US')} simulated years from a fixed seed. Every setting reuses the same random draws, so
            moving a slider reshapes the same years.
          </li>
        </ul>
      </section>

      <p className="mt-10 max-w-2xl text-pretty text-base leading-7 text-muted">
        At Kalshi I co-authored this research and applied minimum-variance hedge ratios and Monte Carlo simulation to
        measure tail-risk reduction from Kalshi contracts. This page is a simplified version with made-up numbers.{' '}
        <a href="/projects/#project/income-risk-hedging" className="link inline-flex items-center gap-0.5 font-medium text-fg">
          See the hedging engine
          <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
        </a>
      </p>
      <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-muted">
        For sizing bets instead of hedges,{' '}
        <a href="/research/" className="link inline-flex items-center gap-0.5 font-medium text-fg">
          try my Kelly paper, interactive
          <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
        </a>
      </p>
    </div>
  );
}
