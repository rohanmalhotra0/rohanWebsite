import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

/** Focus an element by id as soon as it exists (waits up to ~2s of frames). */
function focusWhenReady(id, framesLeft = 120) {
  const element = document.getElementById(id);
  if (element) {
    element.focus({ preventScroll: true });
    return;
  }
  if (framesLeft > 0) {
    requestAnimationFrame(() => focusWhenReady(id, framesLeft - 1));
  }
}

function useResumeRoute() {
  const [isResume, setIsResume] = useState(
    () => window.location.hash === RESUME_HASH
  );
  const wasResume = useRef(isResume);
  // Where the portfolio was scrolled when the résumé opened, and what to do
  // once the portfolio renders again: restore that offset or jump to an anchor.
  const savedScroll = useRef(0);
  const pendingReturn = useRef(null);

  useEffect(() => {
    const onHashChange = () => {
      const next = window.location.hash === RESUME_HASH;
      setIsResume(next);
      // Only react when switching views; in-page anchors also fire hashchange.
      if (wasResume.current !== next) {
        if (next) {
          savedScroll.current = window.scrollY;
          window.scrollTo({ top: 0, behavior: 'instant' });
          // Move keyboard and screen-reader focus into the résumé once its lazy
          // chunk has rendered, so the view change is announced.
          focusWhenReady('resume-content');
        } else {
          // "Back to portfolio" (#top) and history back return to where the
          // reader was; any other anchor is honoured once the page exists.
          const id = decodeURIComponent(window.location.hash.slice(1));
          pendingReturn.current =
            id === '' || id === 'top' ? { top: savedScroll.current } : { id };
        }
      }
      wasResume.current = next;
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Runs after the portfolio has committed, before paint, so there's no flash
  // of the page at the top.
  useLayoutEffect(() => {
    const target = pendingReturn.current;
    if (isResume || !target) return;
    pendingReturn.current = null;
    const element = target.id ? document.getElementById(target.id) : null;
    if (element) element.scrollIntoView({ behavior: 'instant', block: 'start' });
    else window.scrollTo({ top: target.top ?? 0, behavior: 'instant' });
  }, [isResume]);

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
