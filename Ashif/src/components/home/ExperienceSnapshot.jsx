import { ArrowRight } from 'lucide-react';
import CompanyLogo from '@/components/experience/CompanyLogo';
import { groupByCompany, roleAnchor, yearSpan } from '@/components/experience/timeline';
import Reveal from '@/components/primitives/Reveal';
import { workExperience } from '@/data/portfolioData';
import { routeById } from '@/routes';
import TeaserHeader from './TeaserHeader';

const groups = groupByCompany(workExperience);
const experiencePath = routeById('experience').path;

/** One line per company, newest first, each linking to its entry on the Experience page. */
export default function ExperienceSnapshot() {
  return (
    <section aria-labelledby="experience-snapshot" className="border-t border-line py-20 sm:py-28">
      <div className="container-page">
        <TeaserHeader
          id="experience-snapshot"
          title="Experience"
          href={experiencePath}
          linkLabel="Full experience"
        />
        <Reveal as="ol" className="mt-10 border-t border-line sm:mt-12">
          {groups.map((group) => (
            <li key={group.company} className="border-b border-line">
              <a
                href={`${experiencePath}#${roleAnchor(group.company)}`}
                className="group relative isolate grid min-h-[4.5rem] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 py-3 sm:gap-x-6 md:grid-cols-[auto_minmax(0,16rem)_minmax(0,1fr)_auto]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -inset-x-3 -z-10 rounded-lg bg-surface opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                />
                <CompanyLogo company={group.company} src={group.imageUrl} />
                {/* Phones: company over its roles. md: two columns. */}
                <span className="flex min-w-0 flex-col md:contents">
                  <span className="truncate text-[15px] font-medium text-fg">{group.company}</span>
                  <span className="truncate text-sm text-muted md:text-[15px]">
                    {group.roles.map((role) => role.role).join(' · ')}
                  </span>
                </span>
                <span className="flex items-center gap-3 text-sm text-subtle">
                  <span className="whitespace-nowrap">{yearSpan(group.roles)}</span>
                  <ArrowRight
                    aria-hidden="true"
                    strokeWidth={1.75}
                    className="hidden size-4 -translate-x-1 opacity-0 transition-[opacity,translate] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 sm:block"
                  />
                </span>
              </a>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
