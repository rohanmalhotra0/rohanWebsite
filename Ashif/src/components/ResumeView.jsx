import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Printer,
} from 'lucide-react';
import {
  profile,
  projects,
  research,
  skillGroups,
  workExperience,
} from '@/data/portfolioData';

const resumeProjects = projects.filter((project) => project.featured).slice(0, 6);

function ResumeSection({ id, title, children }) {
  return (
    <section id={id} className="resume-section scroll-mt-24 border-t border-gray-300 pt-7">
      <h2 className="font-pixel text-sm font-bold text-gray-950">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function ResumeView() {
  return (
    <div className="resume-view min-h-dvh bg-[#ececea] px-4 py-4 text-gray-950 sm:px-6 sm:py-6">
      <a
        href="#resume-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-black focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to résumé content
      </a>

      <div className="resume-toolbar sticky top-4 z-40 mx-auto mb-4 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm">
        <a
          href="#top"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-gray-100"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to portfolio
        </a>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            <Printer className="size-4" aria-hidden="true" />
            Print
          </button>
          <a
            href={profile.resumeUrl}
            download
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white"
          >
            <Download className="size-4" aria-hidden="true" />
            Download PDF
          </a>
        </div>
      </div>

      <main
        id="resume-content"
        className="resume-paper mx-auto max-w-5xl rounded-sm bg-white px-6 py-10 shadow-xl sm:px-10 lg:px-14 lg:py-14"
      >
        <header className="grid gap-8 border-b-2 border-black pb-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="font-pixel text-xs text-gray-500">PROFESSIONAL PROFILE</p>
            <h1 className="mt-3 text-balance text-4xl font-bold sm:text-5xl">
              {profile.name}
            </h1>
            <p className="mt-3 text-pretty text-lg font-medium text-gray-700">
              {profile.headline}
            </p>
            <p className="mt-4 max-w-3xl text-pretty text-sm leading-6 text-gray-600">
              {profile.summary}
            </p>
          </div>
          <address className="not-italic">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden="true" />
                {profile.location}
              </li>
              <li>
                <a className="flex items-center gap-2 hover:underline" href={`mailto:${profile.email}`}>
                  <Mail className="size-4" aria-hidden="true" />
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  className="flex items-center gap-2 hover:underline"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin className="size-4" aria-hidden="true" />
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  className="flex items-center gap-2 hover:underline"
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="size-4" aria-hidden="true" />
                  GitHub
                </a>
              </li>
            </ul>
          </address>
        </header>

        <div className="mt-9 space-y-10">
          <ResumeSection id="resume-experience" title="EXPERIENCE">
            <div className="space-y-8">
              {workExperience.map((job) => (
                <article key={`${job.company}-${job.role}`} className="break-inside-avoid">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
                    <div>
                      <h3 className="text-lg font-bold">{job.company}</h3>
                      <p className="text-sm font-semibold text-gray-700">{job.role}</p>
                    </div>
                    <p className="text-sm text-gray-500 sm:text-right">
                      {job.date}
                      <span className="block">{job.location}</span>
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-700">{job.summary}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
                    {job.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-black" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </ResumeSection>

          <ResumeSection id="resume-projects" title="SELECTED PROJECTS">
            <div className="grid gap-6 md:grid-cols-2">
              {resumeProjects.map((project) => (
                <article key={project.slug} className="break-inside-avoid">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold">{project.title}</h3>
                    <a
                      href={project.liveUrl || project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${project.title}`}
                      className="shrink-0 text-gray-500 hover:text-black"
                    >
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {project.longDescription || project.description}
                  </p>
                  <p className="mt-2 text-xs font-medium text-gray-500">
                    {project.tags.join(' · ')}
                  </p>
                </article>
              ))}
            </div>
          </ResumeSection>

          <ResumeSection id="resume-research" title="RESEARCH">
            <div className="grid gap-5 md:grid-cols-3">
              {research.map((paper) => (
                <article key={paper.title} className="break-inside-avoid">
                  <h3 className="font-bold">{paper.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {paper.description}
                  </p>
                </article>
              ))}
            </div>
          </ResumeSection>

          <ResumeSection id="resume-education" title="EDUCATION">
            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              <div>
                <h3 className="text-lg font-bold">
                  New York University, Courant Institute
                </h3>
                <p className="mt-1 text-sm font-semibold text-gray-700">
                  B.A. Computer Science · Mathematics minor
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  GPA 3.7 / 4.0 · Accelerated three-year graduate
                </p>
              </div>
              <p className="text-sm text-gray-500 sm:text-right">
                Aug 2024 – May 2027
                <span className="block">New York, NY</span>
              </p>
            </div>
          </ResumeSection>

          <ResumeSection id="resume-skills" title="TECHNICAL SKILLS">
            <dl className="grid gap-4 md:grid-cols-2">
              {skillGroups.map((group) => (
                <div key={group.label}>
                  <dt className="text-sm font-bold">{group.label}</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {group.items.join(' · ')}
                  </dd>
                </div>
              ))}
            </dl>
          </ResumeSection>
        </div>

        <footer className="mt-12 flex flex-col justify-between gap-2 border-t border-gray-300 pt-5 text-xs text-gray-500 sm:flex-row">
          <p>Last updated July 2026</p>
          <a href={profile.website} target="_blank" rel="noreferrer" className="hover:underline">
            rohanm.org
          </a>
        </footer>
      </main>
    </div>
  );
}
