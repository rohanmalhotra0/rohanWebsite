import '@/styles/resume.css';
import ResumePaper from './ResumePaper';
import ResumeToolbar from './ResumeToolbar';

// The app routes on the URL hash, so a plain "#resume-content" link would
// leave the résumé. Move focus manually instead.
function skipToContent(event) {
  event.preventDefault();
  document.getElementById('resume-content')?.focus();
}

export default function ResumeView() {
  return (
    <div className="rv relative min-h-svh bg-bg text-fg">
      <a
        href="#resume-content"
        onClick={skipToContent}
        className="rv-skip sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-ink"
      >
        Skip to résumé
      </a>

      <ResumeToolbar />

      <main
        id="resume-content"
        tabIndex={-1}
        className="rv-main relative px-4 pb-20 pt-6 outline-none sm:px-6 sm:pb-28 sm:pt-12"
      >
        <ResumePaper />
      </main>
    </div>
  );
}
