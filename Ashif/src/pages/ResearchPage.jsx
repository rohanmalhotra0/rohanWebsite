import { Container, PageHeader } from '@/components/primitives/Section';
import KellyExplainer from '@/components/research/kelly/KellyExplainer';
import Research from '@/components/research/Research';

export default function ResearchPage() {
  return (
    <>
      <PageHeader
        title="Research"
        description="Two are published on VTechWorks, Virginia Tech’s research repository. The newest came out of my work at Kalshi."
      />
      <Container className="pb-20 sm:pb-28">
        <KellyExplainer className="mt-14 sm:mt-20" />
        <h2 className="type-heading mt-24 text-3xl text-fg sm:mt-32 sm:text-4xl">Papers</h2>
        <Research className="mt-8 sm:mt-10" />
      </Container>
    </>
  );
}
