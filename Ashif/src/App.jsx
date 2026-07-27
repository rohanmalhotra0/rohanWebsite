import { lazy, Suspense, useEffect, useState } from 'react';
import Hero from './components/hero';
import Navbar from './components/Navbar';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Research from './components/Research';
import About from './components/About';
import Education from './components/Education';
import Skills from './components/Skills';
import ContactForm from './components/ContactForm';
import SocialMagnet from './components/SocialMagnet';
import ResumeView from './components/ResumeView';
import './App.css';

const RohanGPT = lazy(() => import('./components/RohanGPT'));

function useResumeRoute() {
  const [isResume, setIsResume] = useState(
    () => window.location.hash === '#/resume'
  );

  useEffect(() => {
    const onHashChange = () => {
      const next = window.location.hash === '#/resume';
      setIsResume(next);
      if (next) window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.title = isResume
      ? 'Rohan Malhotra — Resume'
      : 'Rohan Malhotra — Applied AI, Robotics & Quant Systems';
  }, [isResume]);

  return isResume;
}

function Portfolio() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-black"
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
        <Skills />
        <Suspense
          fallback={
            <section className="bg-white px-5 py-24" aria-label="Loading RohanGPT">
              <div className="mx-auto h-96 max-w-5xl animate-pulse rounded-2xl bg-gray-100" />
            </section>
          }
        >
          <RohanGPT />
        </Suspense>
        <ContactForm />
      </main>
      <SocialMagnet />
    </>
  );
}

export default function App() {
  return useResumeRoute() ? <ResumeView /> : <Portfolio />;
}
