import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import Reveal from '@/components/primitives/Reveal';
import { workExperience } from '@/data/portfolioData';
import { RoleBody, RoleHeader, RoleMeta } from './Role';
import { groupByCompany, roleLocation, sharedLocation } from './timeline';

const groups = groupByCompany(workExperience);

// From md up: dates in 3 of 12 columns, the role in the other 9.
const ROW = 'grid gap-y-3 md:grid-cols-12 md:items-baseline md:gap-x-8';
const META = 'md:col-span-3';
const CONTENT = 'md:col-span-9';

function SingleRole({ role }) {
  return (
    <div className={ROW}>
      <RoleMeta date={role.date} location={roleLocation(role)} className={META} />
      <div className={CONTENT}>
        <RoleHeader
          company={role.company}
          imageUrl={role.imageUrl}
          title={role.role}
          subtitle={role.company}
        />
        <RoleBody role={role} expanded={role.index === 0} />
      </div>
    </div>
  );
}

/** Consecutive roles at one company: a company header, then each role with its own dates. */
function CompanyRoles({ group }) {
  const location = sharedLocation(group.roles);

  return (
    <>
      <div className={ROW}>
        <div className="md:col-span-9 md:col-start-4">
          <RoleHeader
            company={group.company}
            imageUrl={group.imageUrl}
            title={group.company}
            subtitle={location}
          />
        </div>
      </div>
      <ol className="mt-8 space-y-10 md:mt-10">
        {group.roles.map((role) => (
          <li key={role.index} className={ROW}>
            <RoleMeta
              date={role.date}
              location={location ? null : roleLocation(role)}
              className={META}
            />
            <div className={CONTENT}>
              <h4 className="type-heading text-balance text-lg leading-[1.625rem] text-fg sm:text-xl">
                {role.role}
              </h4>
              <RoleBody role={role} expanded={role.index === 0} />
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

export default function Experience() {
  return (
    <Section id="experience">
      <Container>
        <SectionHeader
          title="Experience"
          description="Recent work: Oracle forecasting and an on-prem AI assistant at IBM, real-time vision for a Boston Dynamics Spot, and income-risk research for Kalshi."
        />
        <ol className="mt-12 sm:mt-16">
          {groups.map((group) => (
            <Reveal
              as="li"
              key={group.roles[0].index}
              className="border-t border-line py-10 last:pb-0 md:py-12"
            >
              {group.roles.length > 1 ? (
                <CompanyRoles group={group} />
              ) : (
                <SingleRole role={group.roles[0]} />
              )}
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
