import { education, workExperience } from '@/data/portfolioData';
import useHydrated from '@/hooks/useHydrated';
import { roleAnchor } from './timeline';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "May 2026" → a month count (2026 × 12 + 4), or null. */
function monthOf(text) {
  const match = /([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{4})/.exec(text || '');
  if (!match) return null;
  const month = MONTHS.indexOf(match[1].toLowerCase());
  return month < 0 ? null : Number(match[2]) * 12 + month;
}

/** "Nov 2024 – May 2025" → [start, end) in months, the end month included. */
function spanOf(dates) {
  const [from, to] = String(dates).split(/\s+[–-]\s+/);
  const start = monthOf(from);
  const end = monthOf(to);
  return start === null || end === null ? null : [start, end + 1];
}

// One color per company, from the palette's category colors; school in accent-2.
const companies = [...new Set(workExperience.map((role) => role.company))];
const companyColor = (company) => `var(--c${(companies.indexOf(company) % 5) + 1})`;

const lanes = [
  ...workExperience.map((role) => ({
    key: `${role.company}-${role.role}`,
    title: role.role,
    org: role.company,
    dates: role.date,
    span: spanOf(role.date),
    color: companyColor(role.company),
    href: `#${roleAnchor(role.company)}`,
  })),
  {
    key: 'school',
    title: 'B.A. Math and CS',
    org: 'NYU Courant',
    dates: education.dates,
    span: spanOf(education.dates),
    color: 'var(--accent-2)',
    href: '#education',
  },
].filter((lane) => lane.span);

// Whole years, from January of the first to January after the last.
const firstYear = Math.floor(Math.min(...lanes.map((lane) => lane.span[0])) / 12);
const lastYear = Math.floor((Math.max(...lanes.map((lane) => lane.span[1])) - 1) / 12);
const axisStart = firstYear * 12;
const axisEnd = (lastYear + 1) * 12;
const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
const at = (month) => `${(((month - axisStart) / (axisEnd - axisStart)) * 100).toFixed(3)}%`;

// The label column on wide screens; the track starts after it and its gap.
const LABEL = 'md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-x-8';

/**
 * Every role and the degree on one time axis, so overlaps and gaps show at
 * a glance (two IBM internships at once, Kalshi during the semester). Each
 * row links to its entry below. The bars only restate the dates beside them.
 */
export default function ExperienceTimeline({ className }) {
  // "Now" depends on the visitor's clock, so it appears after hydration.
  const hydrated = useHydrated();
  const now = new Date();
  const nowMonth = now.getFullYear() * 12 + now.getMonth();
  const showNow = hydrated && nowMonth >= axisStart && nowMonth < axisEnd;

  return (
    <div className={className}>
      <div className={`grid ${LABEL}`}>
        {/* Year labels over the track. */}
        <div aria-hidden="true" className="relative col-start-2 hidden h-6 md:block">
          {years.map((year) => (
            <span
              key={year}
              className="absolute top-0 -translate-x-1/2 text-xs tabular-nums text-subtle"
              style={{ left: at(year * 12) }}
            >
              {year}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Year lines and the "now" line, behind the bars. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 right-0 md:left-[calc(min(18rem,100%)+2rem)]">
          {years.map((year) => (
            <span
              key={year}
              className="absolute inset-y-0 hidden w-px bg-line md:block"
              style={{ left: at(year * 12) }}
            />
          ))}
          {showNow ? (
            <span
              className="absolute inset-y-0 hidden w-0.5 bg-mark md:block"
              style={{ left: at(nowMonth + now.getDate() / 31) }}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-accent-strong">
                Now
              </span>
            </span>
          ) : null}
        </div>

        <ol className="relative">
          {lanes.map((lane) => (
            <li key={lane.key}>
              <a
                href={lane.href}
                className={`group grid items-center gap-y-2 rounded-lg py-2.5 md:min-h-11 md:py-1.5 ${LABEL}`}
              >
                <span className="flex min-w-0 items-baseline justify-between gap-4 text-sm md:block">
                  <span className="min-w-0 truncate md:block">
                    <span className="font-medium text-fg group-hover:underline">{lane.title}</span>
                    <span className="text-muted"> · {lane.org}</span>
                  </span>
                  <span className="shrink-0 text-[13px] text-subtle md:hidden">{lane.dates}</span>
                </span>
                <span className="relative block h-3">
                  <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line md:hidden" />
                  <span
                    className="absolute inset-y-0 rounded-full transition-transform duration-200 ease-out group-hover:scale-y-[1.35]"
                    style={{
                      left: at(lane.span[0]),
                      width: `max(0.75rem, calc(${at(lane.span[1])} - ${at(lane.span[0])}))`,
                      backgroundColor: lane.color,
                    }}
                  />
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
