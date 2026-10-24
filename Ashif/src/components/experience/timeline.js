// Pure helpers for the experience timeline (kept out of component files so
// react-refresh stays happy).

export const EASE = [0.16, 1, 0.3, 1];

/** Logos that are full-bleed squares and should fill their tile edge to edge. */
const FULL_BLEED_LOGOS = new Set(['Kalshi']);

export const isFullBleedLogo = (company) => FULL_BLEED_LOGOS.has(company);

/**
 * Groups consecutive roles at the same company:
 * [{ company, imageUrl, imageAlt, roles: [{ ...role, index }] }]
 * `index` is the role's position in the original list (0 = most recent).
 */
export function groupByCompany(roles) {
  return roles.reduce((groups, role, index) => {
    const last = groups[groups.length - 1];
    const entry = { ...role, index };
    if (last && last.company === role.company) {
      last.roles.push(entry);
    } else {
      groups.push({
        company: role.company,
        imageUrl: role.imageUrl,
        imageAlt: role.imageAlt,
        roles: [entry],
      });
    }
    return groups;
  }, []);
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "May 2026" -> sortable month number, or NaN when it isn't a month/year. */
function monthValue(token) {
  const match = /^([A-Za-z]{3})[a-z]*\.?\s+(\d{4})$/.exec(token.trim());
  if (!match) return NaN;
  const month = MONTHS.indexOf(match[1].toLowerCase());
  return month < 0 ? NaN : Number(match[2]) * 12 + month;
}

/**
 * Overall range covered by a group of roles ("May 2026 – Aug 2026"), derived
 * from the roles' own dates. Returns null if any date isn't a "Mon YYYY – Mon YYYY" range.
 */
export function dateSpan(roles) {
  const ranges = roles.map((role) => role.date.split(/\s+[–-]\s+/));
  if (ranges.some((range) => range.length !== 2)) return null;

  let start = null;
  let end = null;
  for (const [from, to] of ranges) {
    const a = monthValue(from);
    const b = monthValue(to);
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    if (!start || a < start.value) start = { value: a, label: from.trim() };
    if (!end || b > end.value) end = { value: b, label: to.trim() };
  }
  return `${start.label} – ${end.label}`;
}

/** The location every role shares, or null. */
export function sharedLocation(roles) {
  const [first] = roles;
  return roles.every((role) => role.location === first.location) ? first.location : null;
}

// Standalone figures: 13, 898, 500,000, 36.7%, 99.5%, 10+. The lookarounds skip
// digits glued to words or symbols, so "YOLO11", "Qwen-Coder-32B" and "mAP@50" stay plain.
const FIGURE = /((?<![\w@.-])\d+(?:,\d{3})*(?:\.\d+)?%?\+?(?![\w%]))/;

/**
 * Splits text into alternating [plain, figure, plain, ...] parts so the figures
 * can be styled. Joining the parts gives back the original string.
 */
export const splitFigures = (text) => text.split(FIGURE);
