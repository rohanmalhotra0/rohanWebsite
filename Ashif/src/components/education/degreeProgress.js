const DAY_MS = 86_400_000;

/** Parse YYYY-MM-DD as UTC midnight so labels never shift with the viewer's time zone. */
const parseDate = (iso) => new Date(`${iso}T00:00:00Z`);

/** 'AUG 2024' */
const formatMonthYear = (date) =>
  date
    .toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .toUpperCase();

/**
 * How far through the degree we are right now.
 * `percent` is clamped to 0–100; `ticks` are Jan 1 boundaries inside the range,
 * positioned as a percent along the bar.
 */
export function getDegreeProgress(startIso, endIso, now = Date.now()) {
  const start = parseDate(startIso);
  const end = parseDate(endIso);
  const total = end - start;
  const raw = total > 0 ? ((now - start) / total) * 100 : 100;

  const ticks = [];
  for (let year = start.getUTCFullYear() + 1; year <= end.getUTCFullYear(); year += 1) {
    const time = Date.UTC(year, 0, 1);
    if (time > start && time < end) {
      ticks.push({ label: String(year), position: ((time - start) / total) * 100 });
    }
  }

  return {
    percent: Math.min(100, Math.max(0, raw)),
    graduated: now >= end,
    daysLeft: Math.max(0, Math.ceil((end - now) / DAY_MS)),
    startLabel: formatMonthYear(start),
    endLabel: formatMonthYear(end),
    ticks,
  };
}
