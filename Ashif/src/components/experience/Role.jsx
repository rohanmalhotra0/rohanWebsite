import { TechList } from '@/components/primitives/Tag';
import { cn } from '@/lib/utils';
import CompanyLogo from './CompanyLogo';
import Highlights from './Highlights';

/**
 * Dates and location. One line above the role on phones; a two-line column
 * from md up, baseline-aligned with the role title beside it.
 */
export function RoleMeta({ date, location, className }) {
  return (
    <p className={cn('text-sm leading-5 text-subtle tabular-nums', className)}>
      <span className="md:block">{date}</span>
      {location ? (
        <>
          <span aria-hidden="true" className="md:hidden">
            {' · '}
          </span>
          {/* Nudged so its baseline meets the company line's. */}
          <span className="md:mt-[3px] md:block">{location}</span>
        </>
      ) : null}
    </p>
  );
}

/**
 * Logo tile beside a two-line title block. The tile is positioned out of flow
 * so the block's first baseline is the title's, which the meta column aligns to.
 */
export function RoleHeader({ company, imageUrl, title, subtitle, as: Heading = 'h3' }) {
  return (
    <header className="relative flex min-h-10 flex-col justify-center pl-[3.25rem]">
      <CompanyLogo
        company={company}
        src={imageUrl}
        className="absolute left-0 top-1/2 -translate-y-1/2"
      />
      <Heading className="type-heading text-balance text-xl leading-[1.625rem] text-fg sm:text-[1.375rem]">
        {title}
      </Heading>
      {subtitle ? <p className="text-[15px] leading-6 text-muted">{subtitle}</p> : null}
    </header>
  );
}

/** Summary, highlights, and tools for one role. */
export function RoleBody({ role, expanded }) {
  return (
    <>
      <p className="mt-5 max-w-[38rem] text-pretty text-base leading-[1.625rem] text-muted">
        {role.summary}
      </p>
      <Highlights items={role.highlights} expanded={expanded} className="mt-4" />
      <TechList items={role.tags} className="mt-5" />
    </>
  );
}
