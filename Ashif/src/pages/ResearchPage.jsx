import { Container, PageHeader } from '@/components/primitives/Section';
import Research from '@/components/research/Research';

export default function ResearchPage() {
  return (
    <>
      <PageHeader
        title="Research"
        description="Two are published on VTechWorks, Virginia Tech’s research repository. The newest came out of my work at Kalshi."
      />
      <Container className="pb-20 sm:pb-28">
        <Research className="mt-14 sm:mt-20" />
      </Container>
    </>
  );
}
