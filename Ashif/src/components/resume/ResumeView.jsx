import { useRef } from 'react';
import '@/styles/resume.css';
import ResumePaper from './ResumePaper';
import ResumeToolbar from './ResumeToolbar';

export default function ResumeView() {
  const mainRef = useRef(null);

  // The app routes on the URL hash, so following "#resume-content" would
  // leave the résumé. Move focus by hand instead.
  const skipToContent = (event) => {
    event.preventDefault();
    mainRef.current?.focus();
  };

  return (
    <div className="rv min-h-svh bg-bg text-fg">
      <a
        href="#resume-content"
        onClick={skipToContent}
        className="rv-skip sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-fg focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-bg"
      >
        Skip to résumé
      </a>

      <ResumeToolbar />

      <main
        id="resume-content"
        ref={mainRef}
        tabIndex={-1}
        className="rv-main rv-frame pb-16 pt-4 outline-none sm:pb-24 sm:pt-10"
      >
        <ResumePaper />
      </main>
    </div>
  );
}
