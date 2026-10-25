import { lazy, Suspense, useCallback, useEffect } from 'react';
import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import { projects } from '@/data/portfolioData';
import FeaturedWork from './FeaturedWork';
import ProjectArchive from './ProjectArchive';
import { featuredProjects } from './projectData';
import { useProjectViewer } from './useProjectViewer';
import { loadViewer } from './viewerLoader';

const ProjectViewer = lazy(loadViewer);

const DESCRIPTION = `${projects.length} projects, from internship work to small tools I built for myself.`;

export default function Projects() {
  const {
    viewer,
    dialogOpen,
    viewerLoaded,
    preloadViewer,
    onViewerReady,
    open,
    navigate,
    close,
    onExited,
    returnFocusRef,
  } = useProjectViewer();

  const openFeatured = useCallback(
    (index, options) => open(featuredProjects, index, 'featured', options),
    [open]
  );
  const openFromArchive = useCallback(
    (list, index, options) => open(list, index, 'archive', options),
    [open]
  );

  // Load the viewer as the section comes near, ahead of any click. Hover and
  // focus on a card or row also start it, for readers who jump straight there.
  useEffect(() => {
    const section = document.getElementById('projects');
    if (!section || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        preloadViewer();
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [preloadViewer]);

  return (
    <Section id="projects">
      <Container>
        <SectionHeader title="Projects" description={DESCRIPTION} />
        <FeaturedWork
          projects={featuredProjects}
          viewerOpen={viewer !== null}
          onOpen={openFeatured}
          onPreload={preloadViewer}
        />
        <ProjectArchive projects={projects} onOpen={openFromArchive} onPreload={preloadViewer} />
      </Container>

      {viewerLoaded ? (
        <Suspense fallback={null}>
          <ProjectViewer
            viewer={viewer}
            open={dialogOpen}
            onNavigate={navigate}
            onClose={close}
            onExited={onExited}
            onReady={onViewerReady}
            returnFocusRef={returnFocusRef}
          />
        </Suspense>
      ) : null}
    </Section>
  );
}
