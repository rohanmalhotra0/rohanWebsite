import { education, profile, research, skillGroups } from '@/data/portfolioData';
import {
  contactLines,
  displayUrl,
  resumeProjects,
  resumeRoles,
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

/** A middle dot between facts on one line; silent for screen readers. */
function Sep() {
  return (
    <span className="rv-sep" aria-hidden="true">
      {' · '}
    </span>
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
      <div className="rv-section-grid">
        <h2 id={id} className="rv-section-title type-heading">
          {title}
        </h2>
        <div className="rv-section-body">{children}</div>
      </div>
    </section>
  );
}

/**
 * The name and headline on the left; two contact lines on the right, each
 * sharing a baseline with its neighbour (a grid with two baseline rows).
 */
function Header() {
  return (
    <header className="rv-head">
      <h1 id="rv-name" className="rv-name type-display">
        {profile.name}
      </h1>
      <p className="rv-headline">{profile.headline}</p>
      {contactLines.map((line, index) => (
        <p key={index} className="rv-contact">
          {line.map((item, i) => (
            <span key={item.label} className="rv-contact-item">
              {i > 0 ? <Sep /> : null}
              {item.href ? (
                <PaperLink href={item.href}>{item.label}</PaperLink>
              ) : (
                item.label
              )}
            </span>
          ))}
        </p>
      ))}
    </header>
  );
}

function EducationSection() {
  return (
    <Section id="rv-education" title="Education">
      <div className="rv-entry">
        <Row meta={education.dates}>
          <h3 className="rv-heading">
            <span className="rv-strong">{education.school}</span>
            <span className="rv-note rv-college">
              <span className="rv-college-comma">, </span>
              {education.college}
            </span>
          </h3>
        </Row>
        <Row meta={education.location}>
          <p className="rv-sub">
            {education.degree}, {education.minor}
            <Sep />
            GPA {education.gpa} / {education.gpaScale}
          </p>
        </Row>
        <p className="rv-text rv-gap">{education.accelerated}</p>
        <p className="rv-text">
          <span className="rv-key">Graduate course:</span>{' '}
          {education.graduateCourse.title}
        </p>
        <p className="rv-text">
          <span className="rv-key">Coursework:</span>{' '}
          {education.coursework.join(', ')}
        </p>
      </div>
    </Section>
  );
}

function ExperienceSection() {
  return (
    <Section id="rv-experience" title="Experience">
      {resumeRoles.map((job) => (
        <div key={`${job.company}-${job.role}`} className="rv-entry">
          <Row meta={job.date}>
            <h3 className="rv-heading">
              <span className="rv-strong">{job.company}</span>
              <Sep />
              {job.role}
              {job.place ? (
                <>
                  <Sep />
                  <span className="rv-note rv-nowrap">{job.place}</span>
                </>
              ) : null}
            </h3>
          </Row>
          {job.highlights?.length ? (
            <ul className="rv-bullets">
              {job.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
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
            <div className="rv-heading">
              <h3 className="rv-strong rv-inline">{project.title}</h3>
              {project.link ? (
                <>
                  <Sep />
                  <PaperLink href={project.link} className="rv-note rv-url">
                    {displayUrl(project.link)}
                  </PaperLink>
                </>
              ) : null}
            </div>
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
          <Row meta={paper.year}>
            <h3 className="rv-heading rv-strong">
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
                <PaperLink href={paper.externalUrl} className="rv-note rv-url">
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
