import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/primitives/Section';
import HedgeExplainer from '@/components/research/hedge/HedgeExplainer';
import { useRoute } from '@/lib/router';

/** "Hedge your paycheck": the income-hedging paper, interactive (/research/hedge-your-paycheck/). */
export default function HedgePage() {
  const { route } = useRoute();
  return (
    <>
      <div className="container-page pt-[4.5rem] sm:pt-20 lg:pt-[5.5rem]">
        <a
          href="/research/"
          className="-ml-0.5 inline-flex min-h-11 items-center gap-1.5 text-sm text-muted transition-colors duration-150 hover:text-fg"
        >
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.75} />
          Research
        </a>
      </div>
      <PageHeader
        route={route}
        title="Hedge your paycheck"
        description="Lose your job and your paycheck stops, and a downturn makes that likelier. Prediction markets list contracts that pay $1 if unemployment rises past a set level, so a few of them would pay out right when you’d need it. How many should you buy?"
        className="pt-2 sm:pt-3 lg:pt-3"
      />
      <div className="container-page pb-20 sm:pb-28">
        <HedgeExplainer className="mt-12 sm:mt-16" />
      </div>
    </>
  );
}
