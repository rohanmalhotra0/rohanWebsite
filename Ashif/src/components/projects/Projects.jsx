import { useCallback } from 'react';
import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import { projects } from '@/data/portfolioData';
import FeaturedWork from './FeaturedWork';
import ProjectArchive from './ProjectArchive';
import ProjectViewer from './ProjectViewer';
import { featuredProjects } from './projectData';
import { useProjectViewer } from './useProjectViewer';

const DESCRIPTION = `${projects.length} projects, from internship work to small tools I built for myself.`;

export default function Projects() {
  const { viewer, dialogOpen, open, navigate, close, onExited, returnFocusRef } =
    useProjectViewer();

  const openFeatured = useCallback(
    (index, options) => open(featuredProjects, index, 'featured', options),
    [open]
  );
  const openFromArchive = useCallback(
    (list, index, options) => open(list, index, 'archive', options),
    [open]
  );

  return (
    <Section id="projects">
      <Container>
        <SectionHeader title="Projects" description={DESCRIPTION} />
        <FeaturedWork
          projects={featuredProjects}
          viewerOpen={viewer !== null}
          onOpen={openFeatured}
        />
        <ProjectArchive projects={projects} onOpen={openFromArchive} />
      </Container>

      <ProjectViewer
        viewer={viewer}
        open={dialogOpen}
        onNavigate={navigate}
        onClose={close}
        onExited={onExited}
        returnFocusRef={returnFocusRef}
      />
    </Section>
  );
}
