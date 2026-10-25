import LiteYouTube from '@/components/primitives/LiteYouTube';
import { TechList } from '@/components/primitives/Tag';
import { cn } from '@/lib/utils';
import CompanyLogo from './CompanyLogo';
import Highlights from './Highlights';
import { visibleHighlights } from './timeline';

/**
 * Dates and location: one line on phones, two lines from md up, where the
 * first is baseline-aligned with the role title beside it.
 */
export function RoleMeta({ date, location, className }) {
  if (!date && !location) return null;

  return (
    <p className={cn('text-sm leading-5 text-subtle', className)}>
      {date ? <span className="md:block">{date}</span> : null}
      {date && location ? (
        <>
          <span className="sr-only">, </span>
          <span aria-hidden="true" className="md:hidden">
            {' · '}
          </span>
        </>
      ) : null}
      {/* Nudged so its baseline meets the company line's. */}
      {location ? <span className="md:mt-[2px] md:block">{location}</span> : null}
    </p>
  );
}

/** The company, spoken with a role heading that doesn't already name it. */
export function SrCompany({ company }) {
  return <span className="sr-only">, {company}</span>;
}

/**
 * Logo tile beside a two-line title block. The tile is positioned out of flow
 * so the block's first baseline is the title's, which the meta column aligns to.
 * When the second line is the company, screen readers get it inside the heading
 * ("Quantitative Developer, Kalshi") instead of hearing it twice.
 */
export function RoleHeader({ company, imageUrl, title, subtitle, className }) {
  const companyLine = subtitle === company;

  return (
    <header
      className={cn(
        'relative flex min-h-10 flex-col justify-center',
        imageUrl && 'pl-[3.25rem]',
        className
      )}
    >
      {imageUrl ? (
        <CompanyLogo
          company={company}
          src={imageUrl}
          className="absolute left-0 top-1/2 -translate-y-1/2"
        />
      ) : null}
      <h3 className="type-heading text-balance text-xl leading-[1.625rem] text-fg sm:text-[1.375rem]">
        {title}
        {companyLine ? <SrCompany company={company} /> : null}
      </h3>
      {subtitle ? (
        <p aria-hidden={companyLine || undefined} className="text-[15px] leading-6 text-muted">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

/** Summary, an optional video and link, highlights, and tools for one role. */
export function RoleBody({ role, className }) {
  return (
    <div className={className}>
      {role.summary ? (
        <p className="mt-5 max-w-[38rem] text-pretty text-base leading-[1.625rem] text-muted">
          {role.summary}
        </p>
      ) : null}
      {role.video ? <LiteYouTube {...role.video} className="mt-6 max-w-[38rem]" /> : null}
      {role.link ? (
        <p className="mt-3 text-[15px]">
          <a href={role.link.href} className="link font-medium text-fg">
            {role.link.label}
          </a>
        </p>
      ) : null}
      <Highlights
        items={role.highlights}
        visible={visibleHighlights(role.index, role.highlights?.length ?? 0)}
        label={`${role.role} at ${role.company}`}
        className={role.video ? 'mt-6' : 'mt-4'}
      />
      <TechList items={role.tags} className="mt-5" />
    </div>
  );
}
