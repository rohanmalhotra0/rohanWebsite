/** Parse YYYY-MM-DD as UTC midnight so results never shift with the viewer's time zone. */
const parseDate = (iso) => new Date(`${iso}T00:00:00Z`).getTime();

/** 'May 2027' */
const formatMonthYear = (time) =>
  new Date(time).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

/**
 * How far through the degree we are at `now`. `ratio` is clamped to 0–1 and
 * `percent` is floored, so it never reads 100% before the end date.
 */
export function getDegreeProgress(startIso, endIso, now = Date.now()) {
  const start = parseDate(startIso);
  const end = parseDate(endIso);
  const total = end - start;
  const graduated = now >= end;
  const ratio = total > 0 ? Math.min(1, Math.max(0, (now - start) / total)) : Number(graduated);
  const percent = Math.floor(ratio * 100);

  return {
    ratio,
    percent,
    graduated,
    label: graduated ? `Graduated ${formatMonthYear(end)}` : `${percent}% done`,
  };
}
