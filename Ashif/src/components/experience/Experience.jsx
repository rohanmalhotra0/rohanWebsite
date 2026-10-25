import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import Reveal from '@/components/primitives/Reveal';
import { workExperience } from '@/data/portfolioData';
import { cn } from '@/lib/utils';
import { RoleBody, RoleHeader, RoleMeta } from './Role';
import { groupByCompany, roleLocation, sharedLocation } from './timeline';

const groups = groupByCompany(workExperience);

/*
 * Phones: one column, dates first. From md up: dates in 3 of 12 columns beside
 * the role in the other 9. The title comes first in the DOM so screen readers
 * (and heading navigation) meet the role before its dates.
 */
const ROW = 'grid md:grid-cols-12 md:items-baseline md:gap-x-8';
const TITLE = 'md:col-span-9 md:col-start-4 md:row-start-1';
const META = 'order-first mb-3 md:order-none md:col-span-3 md:col-start-1 md:row-start-1 md:mb-0';
const BODY = 'md:col-span-9 md:col-start-4';

function SingleRole({ role }) {
  return (
    <div className={ROW}>
      <RoleHeader
        company={role.company}
        imageUrl={role.imageUrl}
        title={role.role}
        subtitle={role.company}
        className={TITLE}
      />
      <RoleMeta date={role.date} location={roleLocation(role)} className={META} />
      <RoleBody role={role} expanded={role.index === 0} className={BODY} />
    </div>
  );
}

/** Consecutive roles at one company: a company header, then each role with its own dates. */
function CompanyRoles({ group }) {
  const location = sharedLocation(group.roles);

  return (
    <>
      <div className={ROW}>
        <RoleHeader
          company={group.company}
          imageUrl={group.imageUrl}
          title={group.company}
          subtitle={location}
          className={TITLE}
        />
      </div>
      <ol className="mt-7 space-y-10 md:mt-8">
        {group.roles.map((role) => (
          <li key={role.index} className={ROW}>
            <h4
              className={cn(
                TITLE,
                'type-heading text-balance text-lg leading-[1.625rem] text-fg sm:text-xl'
              )}
            >
              {role.role}
            </h4>
            <RoleMeta
              date={role.date}
              location={location ? null : roleLocation(role)}
              className={META}
            />
            <RoleBody role={role} expanded={role.index === 0} className={BODY} />
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
