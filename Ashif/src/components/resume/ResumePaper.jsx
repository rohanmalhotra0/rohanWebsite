import {
  education,
  profile,
  research,
  skillGroups,
} from '@/data/portfolioData';
import { displayUrl, experienceGroups, resumeProjects } from './resumeData';

/** External link whose visible text is the URL itself, so it survives print. */
function UrlLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="rv-link">
      {children ?? displayUrl(href)}
    </a>
  );
}

function Section({ id, label, children }) {
  return (
    <section className="rv-section" aria-labelledby={id}>
      <h2 id={id} className="rv-label">
        {label}
      </h2>
      <div className="rv-body">{children}</div>
    </section>
  );
}

/** Left/right line: a title on the left, mono meta (date, place) on the right. */
function Row({ className = '', children, meta }) {
  return (
    <div className={`rv-row ${className}`}>
      {children}
      {meta ? <p className="rv-meta">{meta}</p> : null}
    </div>
  );
}

function Bullets({ items }) {
  return (
    <ul className="rv-bullets">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Header() {
  return (
    <header className="rv-head">
      <div>
        <h1 className="rv-name">
          {profile.name}
          <span className="rv-dot" aria-hidden="true" />
        </h1>
        <p className="rv-headline">{profile.headline}</p>
      </div>
      <address className="rv-contact">
        <ul>
          <li>{profile.location}</li>
          <li>
            <a href={`mailto:${profile.email}`} className="rv-link">
              {profile.email}
            </a>
          </li>
          <li>
            <UrlLink href={profile.website} />
          </li>
          <li>
            <UrlLink href={profile.github} />
          </li>
          <li>
            <UrlLink href={profile.linkedin} />
          </li>
        </ul>
      </address>
    </header>
  );
}

function EducationSection() {
  const { graduateCourse } = education;
  return (
    <Section id="rv-education" label="Education">
      <article className="rv-entry">
        <Row meta={education.dates}>
          <h3 className="rv-org">
            {education.school}
            <span className="rv-org-note">{education.college}</span>
          </h3>
        </Row>
        <Row meta={education.location}>
          <p className="rv-role">
            {education.degree}, {education.minor}
          </p>
        </Row>
        <ul className="rv-facts">
          <li>
            <span className="rv-fact-key">GPA</span>
            <span>
              <strong className="rv-num">
                {education.gpa} / {education.gpaScale}
              </strong>
              {' — '}
              {education.accelerated}
            </span>
          </li>
          <li>
            <span className="rv-fact-key">Graduate course</span>
            <span>
              <strong>{graduateCourse.title}</strong>
              {' — '}
              {graduateCourse.description}
            </span>
          </li>
          <li>
            <span className="rv-fact-key">Courses</span>
            <span>{education.coursework.join(', ')}</span>
          </li>
        </ul>
      </article>
    </Section>
  );
}

function ExperienceSection() {
  return (
    <Section id="rv-experience" label="Experience">
      {experienceGroups.map((group) => (
        <article key={group.company} className="rv-entry">
          <Row className="rv-org-row" meta={group.place}>
            <h3 className="rv-org">{group.company}</h3>
          </Row>
          {group.roles.map((job) => (
            <div key={job.role} className="rv-job">
              <Row meta={job.date}>
                <p className="rv-role">{job.role}</p>
              </Row>
              <Bullets items={job.highlights} />
            </div>
          ))}
        </article>
      ))}
    </Section>
  );
}

function ProjectsSection() {
  return (
    <Section id="rv-projects" label="Selected projects">
      <div className="rv-grid">
        {resumeProjects.map((project) => {
          const href = project.liveUrl || project.repoUrl;
          return (
            <article key={project.slug} className="rv-entry rv-project">
              <Row meta={project.year}>
                <h3 className="rv-title">{project.title}</h3>
              </Row>
              <p className="rv-text">{project.description}</p>
              <p className="rv-tags">
                {href ? <UrlLink href={href} /> : null}
                <span>{project.tags.join(' · ')}</span>
              </p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

function ResearchSection() {
  return (
    <Section id="rv-research" label="Research">
      {research.map((paper) => (
        <article key={paper.title} className="rv-entry">
          <Row meta={paper.eyebrow}>
            <h3 className="rv-title">
              <a
                href={paper.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="rv-link"
              >
                {paper.title}
              </a>
            </h3>
          </Row>
          <p className="rv-text">{paper.description}</p>
          {paper.externalUrl ? (
            <p className="rv-tags">
              <UrlLink href={paper.externalUrl} />
            </p>
          ) : null}
        </article>
      ))}
    </Section>
  );
}

function SkillsSection() {
  return (
    <Section id="rv-skills" label="Skills">
      <dl className="rv-facts">
        {skillGroups.map((group) => (
          <div key={group.label}>
            <dt className="rv-fact-key">{group.label}</dt>
            <dd>{group.items.join(', ')}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/** The document itself: always white, typeset for US Letter. */
export default function ResumePaper() {
  return (
    <article className="rv-paper" aria-label={`Résumé of ${profile.name}`}>
      <Header />
      <EducationSection />
      <ExperienceSection />
      <ProjectsSection />
      <ResearchSection />
      <SkillsSection />
    </article>
  );
}
