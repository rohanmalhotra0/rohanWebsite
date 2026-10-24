import { education, profile, research, skillGroups } from '@/data/portfolioData';
import {
  contactLinks,
  displayUrl,
  experienceGroups,
  resumeProjects,
} from './resumeData';

/** Text link on paper. Web links open in a new tab; mailto stays put. */
function PaperLink({ href, className = '', children }) {
  const newTab = !href.startsWith('mailto:');
  return (
    <a
      href={href}
      className={`rv-link ${className}`}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noreferrer' : undefined}
    >
      {children}
    </a>
  );
}

/** A line with its main content on the left and dates or a place on the right. */
function Row({ meta, children }) {
  return (
    <div className="rv-row">
      {children}
      {meta ? <span className="rv-meta">{meta}</span> : null}
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section className="rv-section" aria-labelledby={id}>
      <h2 id={id} className="rv-section-title type-heading">
        {title}
      </h2>
      <div className="rv-section-body">{children}</div>
    </section>
  );
}

function Header() {
  return (
    <header className="rv-head">
      <div>
        <h1 id="rv-name" className="rv-name type-display">
          {profile.name}
        </h1>
        <p className="rv-headline">{profile.headline}</p>
      </div>
      <address className="rv-contact">
        <ul>
          <li>{profile.location}</li>
          {contactLinks.map((link) => (
            <li key={link.href}>
              <PaperLink href={link.href}>{link.label}</PaperLink>
            </li>
          ))}
        </ul>
      </address>
    </header>
  );
}

function EducationSection() {
  return (
    <Section id="rv-education" title="Education">
      <div className="rv-entry">
        <Row meta={education.dates}>
          <h3 className="rv-org">
            {education.school}
            <span className="rv-org-note">
              <span className="rv-org-sep">, </span>
              {education.college}
            </span>
          </h3>
        </Row>
        <Row meta={education.location}>
          <p className="rv-role">
            {education.degree}, {education.minor}
          </p>
        </Row>
        <dl className="rv-facts">
          <div>
            <dt>GPA</dt>
            <dd>
              <span className="rv-num">
                {education.gpa} / {education.gpaScale}
              </span>
              . {education.accelerated}
            </dd>
          </div>
          <div>
            <dt>Graduate course</dt>
            <dd>{education.graduateCourse.title}</dd>
          </div>
          <div>
            <dt>Coursework</dt>
            <dd>{education.coursework.join(', ')}</dd>
          </div>
        </dl>
      </div>
    </Section>
  );
}

function ExperienceSection() {
  return (
    <Section id="rv-experience" title="Experience">
      {experienceGroups.map((group, index) => (
        <div key={`${group.company}-${index}`} className="rv-entry">
          <Row meta={group.place}>
            <h3 className="rv-org">{group.company}</h3>
          </Row>
          {group.roles.map((job) => (
            <div key={job.role} className="rv-job">
              <Row meta={[job.place, job.date].filter(Boolean).join(' · ')}>
                <p className="rv-role">{job.role}</p>
              </Row>
              <ul className="rv-bullets">
                {job.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </Section>
  );
}

function ProjectsSection() {
  return (
    <Section id="rv-projects" title="Projects">
      {resumeProjects.map((project) => (
        <div key={project.slug} className="rv-entry">
          <Row meta={project.year}>
            <p className="rv-title-line">
              <span className="rv-title">{project.title}</span>
              {project.link ? (
                <PaperLink href={project.link} className="rv-url">
                  {displayUrl(project.link)}
                </PaperLink>
              ) : null}
            </p>
          </Row>
          <p className="rv-text">{project.description}</p>
          {project.tags?.length ? (
            <p className="rv-stack">{project.tags.join(' · ')}</p>
          ) : null}
        </div>
      ))}
    </Section>
  );
}

function ResearchSection() {
  return (
    <Section id="rv-research" title="Research">
      {research.map((paper) => (
        <div key={paper.title} className="rv-entry">
          <Row meta={paper.eyebrow}>
            <h3 className="rv-title">
              {paper.liveUrl ? (
                <PaperLink href={paper.liveUrl}>{paper.title}</PaperLink>
              ) : (
                paper.title
              )}
            </h3>
          </Row>
          <p className="rv-text">
            {paper.description}
            {paper.externalUrl ? (
              <>
                {' '}
                <PaperLink href={paper.externalUrl} className="rv-url">
                  {displayUrl(paper.externalUrl)}
                </PaperLink>
              </>
            ) : null}
          </p>
        </div>
      ))}
    </Section>
  );
}

function SkillsSection() {
  return (
    <Section id="rv-skills" title="Skills">
      <dl className="rv-facts">
        {skillGroups.map((group) => (
          <div key={group.label}>
            <dt>{group.label}</dt>
            <dd>{group.items.join(', ')}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/** The document: always white, typeset on an 8.5in sheet. */
export default function ResumePaper() {
  return (
    <article className="rv-paper" aria-labelledby="rv-name">
      <Header />
      <EducationSection />
      <ExperienceSection />
      <ProjectsSection />
      <ResearchSection />
      <SkillsSection />
    </article>
  );
}
