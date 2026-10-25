import Education from '@/components/education/Education';
import Experience from '@/components/experience/Experience';
import { Container, PageHeader } from '@/components/primitives/Section';
import { routeById } from '@/routes';

const route = routeById('experience');

export default function ExperiencePage() {
  return (
    <>
      <PageHeader title="Experience" description={route.description} />
      <Container className="pb-20 sm:pb-28">
        <h2 className="sr-only">Roles</h2>
        <Experience className="mt-14 sm:mt-20" />
      </Container>
      <Education />
    </>
  );
}
