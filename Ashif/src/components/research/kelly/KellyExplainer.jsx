import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { research } from '@/data/portfolioData';
import KellyLab from './KellyLab';
import KellyOdds from './KellyOdds';
import WhyHalf from './WhyHalf';

// "How much would you bet?": the Kelly paper as something to play with. The
// lab, the odds and the "why half" cards share one price and one chance, so
// moving either re-works all of them.

const paper = research.find((item) => item.tags?.includes('Kelly Criterion'));

function Formula({ children }) {
  return <p className="font-mono text-[15px] leading-7 text-fg sm:text-base">{children}</p>;
}

export default function KellyExplainer({ className }) {
  const [price, setPrice] = useState(50);
  const [chance, setChance] = useState(60);

  return (
    <section aria-labelledby="kelly-title" className={className}>
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
        <div className="lg:col-span-7">
          <p className="text-sm text-subtle">My Kelly paper, interactive</p>
          <h2 id="kelly-title" className="type-display mt-3 text-balance text-[clamp(2.25rem,6vw,4.5rem)] text-fg">
            How much would you bet?
          </h2>
        </div>
        <p className="max-w-xl text-pretty text-base leading-7 text-muted sm:text-[17px] lg:col-span-5">
          A contract costs 50¢ and pays $1 if something happens. You think there’s a 60% chance. That’s an edge, but bet
          too much of your money on it and you can still go broke. My paper works out the share that grows your money
          fastest: <span className="whitespace-nowrap font-mono text-fg">f* = p − q</span>.
        </p>
      </div>

      <div className="mt-10 sm:mt-12">
        <KellyLab price={price} setPrice={setPrice} chance={chance} setChance={setChance} />
      </div>

      <KellyOdds price={price} chance={chance} />

      <WhyHalf price={price} chance={chance} />

      <div className="mt-16 grid gap-6 rounded-2xl border border-line p-5 sm:mt-20 sm:p-8 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <h3 className="type-heading text-2xl text-fg">The math, from the paper</h3>
          {paper ? (
            <p className="mt-3 text-sm leading-6 text-subtle">
              {paper.title} · {paper.year}
            </p>
          ) : null}
          {paper ? (
            <div className="-mb-3 mt-3 flex flex-wrap gap-x-6">
              <a href={paper.liveUrl} target="_blank" rel="noreferrer" className="link inline-flex min-h-11 items-center gap-1 text-[15px] font-medium text-fg">
                Read the paper (PDF)
                <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <a href={paper.externalUrl} target="_blank" rel="noreferrer" className="link inline-flex min-h-11 items-center gap-1 text-[15px] font-medium text-fg">
                VTechWorks
                <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          ) : null}
        </div>
        <div className="space-y-2 md:col-span-8">
          <p className="text-pretty text-[15px] leading-7 text-muted">
            Each round you bet a fraction <var className="font-mono not-italic text-fg">f</var> of your money. You win it
            with probability <var className="font-mono not-italic text-fg">p</var> and lose it with{' '}
            <var className="font-mono not-italic text-fg">q = 1 − p</var>. Over many rounds your money grows at
          </p>
          <Formula>g(f) = p·ln(1 + f) + q·ln(1 − f)</Formula>
          <p className="text-pretty text-[15px] leading-7 text-muted">per round. Setting its slope to zero,</p>
          <Formula>g′(f) = p/(1 + f) − q/(1 − f) = 0 &nbsp;⇒&nbsp; f* = p − q,</Formula>
          <p className="text-pretty text-[15px] leading-7 text-muted">
            and <span className="font-mono text-fg">g″(f) &lt; 0</span>, so that’s the peak of the curve above. That’s the
            contract at 50¢. At any price <var className="font-mono not-italic text-fg">c</var>, a win pays{' '}
            <span className="whitespace-nowrap font-mono text-fg">(1 − c)/c</span> per dollar staked, and the same steps
            give <span className="whitespace-nowrap font-mono text-fg">f* = (p − c)/(1 − c)</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
