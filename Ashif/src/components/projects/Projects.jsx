import { lazy, Suspense, useCallback, useEffect } from 'react';
import { Container } from '@/components/primitives/Section';
import { projects } from '@/data/portfolioData';
import FeaturedWork from './FeaturedWork';
import ProjectArchive from './ProjectArchive';
import { featuredProjects } from './projectData';
import { useProjectViewer } from './useProjectViewer';
import { lazyViewer } from './viewerLoader';

const ProjectViewer = lazy(lazyViewer);

/** Featured work, the full archive, and the project viewer they both open. */
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

  // Load the viewer once the page is idle, ahead of any click. Hover and
  // focus on a card or row also start it, for readers who are quicker.
  useEffect(() => {
    if (!window.requestIdleCallback) {
      const timer = window.setTimeout(preloadViewer, 1000);
      return () => window.clearTimeout(timer);
    }
    const idle = window.requestIdleCallback(preloadViewer, { timeout: 2000 });
    return () => window.cancelIdleCallback(idle);
  }, [preloadViewer]);

  return (
    <div>
      <Container>
        <h2 className="sr-only">Featured</h2>
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
    </div>
  );
}
