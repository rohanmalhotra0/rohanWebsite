import { PageHeader } from '@/components/primitives/Section';
import Projects from '@/components/projects/Projects';
import { routeById } from '@/routes';

const route = routeById('projects');

export default function ProjectsPage() {
  return (
    <>
      <PageHeader route={route} />
      <div className="pb-20 sm:pb-28">
        <Projects />
      </div>
    </>
  );
}
