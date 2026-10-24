import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import ThemeProvider from './components/theme/ThemeProvider';
import Navbar from './components/nav/Navbar';
import Hero from './components/hero/Hero';
import Experience from './components/experience/Experience';
import Projects from './components/projects/Projects';
import Research from './components/research/Research';
import About from './components/about/About';
import Education from './components/education/Education';
import RohanGPT from './components/rohangpt/RohanGPT';
import Contact from './components/contact/Contact';
import Footer from './components/footer/Footer';

const ResumeView = lazy(() => import('./components/resume/ResumeView'));

const RESUME_HASH = '#/resume';

function useResumeRoute() {
  const [isResume, setIsResume] = useState(
    () => window.location.hash === RESUME_HASH
  );
  const wasResume = useRef(isResume);

  useEffect(() => {
    const onHashChange = () => {
      const next = window.location.hash === RESUME_HASH;
      setIsResume(next);
      // Only reset scroll when switching views; in-page anchors also fire hashchange.
      if (wasResume.current !== next) window.scrollTo({ top: 0 });
      wasResume.current = next;
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.title = isResume ? 'Résumé — Rohan Malhotra' : 'Rohan Malhotra';
  }, [isResume]);

  return isResume;
}

function Portfolio() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-ink"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Experience />
        <Projects />
        <Research />
        <About />
        <Education />
        <RohanGPT />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const isResume = useResumeRoute();

  return (
    <ThemeProvider>
      {isResume ? (
        <Suspense fallback={<div className="min-h-svh bg-bg" />}>
          <ResumeView />
        </Suspense>
      ) : (
        <Portfolio />
      )}
    </ThemeProvider>
  );
}
