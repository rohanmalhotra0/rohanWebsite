import { useId } from 'react';
import { useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Container, Section, SectionHeader } from '@/components/primitives/Section';
import Reveal from '@/components/primitives/Reveal';
import { workExperience } from '@/data/portfolioData';
import useMediaQuery from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { CompanyLogo, Rail, RailDot } from './Rail';
import RoleCard from './RoleCard';
import { dateSpan, groupByCompany, sharedLocation } from './timeline';

const groups = groupByCompany(workExperience);

const META = 'font-mono text-[11px] uppercase leading-5 tracking-[0.16em] text-subtle';

// Two-column row: rail column (logo tile / node) + content.
const ROW = 'grid grid-cols-[var(--tile)_minmax(0,1fr)] gap-x-3.5 sm:gap-x-5';

/** A company with several consecutive roles: one header, roles joined by the rail. */
function CompanyGroup({ group, lit, spotlight }) {
  const labelId = useId();
  const span = dateSpan(group.roles);
  const location = sharedLocation(group.roles);
  const meta = [location, span].filter(Boolean);

  return (
    <li>
      <Reveal className={cn(ROW, 'items-center')}>
        <CompanyLogo company={group.company} src={group.imageUrl} alt={group.imageAlt} lit={lit} />
        <div>
          <p id={labelId} className="text-base font-semibold tracking-[-0.01em] text-fg">
            {group.company}
            <span aria-hidden="true" className="mx-2 font-normal text-subtle">
              ·
            </span>
            <span className="font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-subtle">
              {group.roles.length} roles
            </span>
          </p>
          {meta.length ? <p className={META}>{meta.join(' · ')}</p> : null}
        </div>
      </Reveal>

      <ol aria-labelledby={labelId} className="mt-4 space-y-4">
        {group.roles.map((role, i) => (
          <Reveal as="li" key={role.role} delay={i * 0.08} className={ROW}>
            <div className="relative">
              <RailDot lit={lit} className="left-1/2 top-[calc(var(--pad)+var(--node-y))]" />
            </div>
            <RoleCard role={role} defaultOpen={role.index === 0} spotlight={spotlight} />
          </Reveal>
        ))}
      </ol>
    </li>
  );
}

/** A company with a single role: the logo tile sits on the rail beside the card. */
function SingleRole({ group, lit, spotlight }) {
  const [role] = group.roles;

  return (
    <Reveal as="li" className={ROW}>
      <div className="pt-[calc(var(--pad)+var(--node-y)-var(--tile)/2)]">
        <CompanyLogo company={group.company} src={group.imageUrl} alt={group.imageAlt} lit={lit} />
      </div>
      <RoleCard role={role} defaultOpen={role.index === 0} spotlight={spotlight} />
    </Reveal>
  );
}

function Timeline() {
  const reduceMotion = useReducedMotion();
  const spotlight = useMediaQuery('(hover: hover) and (pointer: fine)');
  const lit = !reduceMotion;

  return (
    <div className="relative [--node-y:10px] [--pad:20px] [--tile:44px] sm:[--node-y:14px] sm:[--pad:24px] sm:[--tile:56px]">
      <Rail progress={lit} />
      <ol aria-label="Work history" className="space-y-10 sm:space-y-12">
        {groups.map((group) =>
          group.roles.length > 1 ? (
            <CompanyGroup key={group.roles[0].index} group={group} lit={lit} spotlight={spotlight} />
          ) : (
            <SingleRole key={group.roles[0].index} group={group} lit={lit} spotlight={spotlight} />
          )
        )}
      </ol>
    </div>
  );
}

export default function Experience() {
  return (
    <Section id="experience">
      <Container className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeader
              index="01"
              label="Experience"
              title={
                <>
                  Where I&rsquo;ve <em>worked</em>
                </>
              }
              description="Recent work: Oracle forecasting and an on-prem AI assistant at IBM, real-time vision for a Boston Dynamics Spot, and income-risk research for Kalshi."
            >
              <p className={cn(META, 'mt-8 tracking-[0.2em]')}>
                <span className="text-fg tabular-nums">{workExperience.length} roles</span>
                {['AI', 'robotics', 'quant', 'aerospace'].map((area) => (
                  <span key={area}>
                    <span aria-hidden="true" className="mx-2 text-line-strong">
                      ·
                    </span>
                    {area}
                  </span>
                ))}
              </p>
              <a
                href="#/resume"
                className="group/link mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-fg"
              >
                <span className="border-b border-line-strong pb-0.5 transition-colors group-hover/link:border-fg">
                  Full résumé
                </span>
                <ArrowRight className="size-4 text-muted transition-transform duration-300 ease-out-expo group-hover/link:translate-x-0.5 group-hover/link:text-fg" />
              </a>
            </SectionHeader>
          </div>
        </div>

        <div className="mt-14 sm:mt-16 lg:col-span-7 lg:mt-0">
          <Timeline />
        </div>
      </Container>
    </Section>
  );
}
