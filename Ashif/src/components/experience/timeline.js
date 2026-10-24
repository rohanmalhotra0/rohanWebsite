// Pure helpers for the experience section (kept out of component files so
// react-refresh stays happy).

export const EASE = [0.16, 1, 0.3, 1];

/** Highlights shown before "Show more". The most recent role shows all of them. */
export const VISIBLE_HIGHLIGHTS = 2;

/**
 * Groups consecutive roles at the same company, keeping each role's position
 * in the original list (0 = most recent):
 * [{ company, imageUrl, roles: [{ ...role, index }] }]
 */
export function groupByCompany(roles) {
  return roles.reduce((groups, role, index) => {
    const last = groups[groups.length - 1];
    const entry = { ...role, index };
    if (last && last.company === role.company) last.roles.push(entry);
    else groups.push({ company: role.company, imageUrl: role.imageUrl, roles: [entry] });
    return groups;
  }, []);
}

/** Some entries reuse their date text as the location ("Earlier experience"). */
export const roleLocation = (role) =>
  role.location && role.location !== role.date ? role.location : null;

/** The location every role in a group shares, or null. */
export function sharedLocation(roles) {
  const location = roleLocation(roles[0]);
  return roles.every((role) => roleLocation(role) === location) ? location : null;
}

// Standalone figures: 898, 500,000, 36.7%, 99.4%, 10+.
const FIGURE = /\d+(?:,\d{3})*(?:\.\d+)?%?\+?/g;
// Figures glued to a word stay plain: YOLO11, Qwen-Coder-32B, mAP@50, 13-day.
const GLUED_BEFORE = /[\w@.-]/;
const GLUED_AFTER = /[\w%-]/;

/**
 * Splits text into [{ text, figure }] parts so standalone figures can be
 * emphasized. Joining the parts' text gives back the original string.
 * (No regex lookbehind: older Safari can't parse it.)
 */
export function splitFigures(text) {
  const parts = [];
  let last = 0;
  for (const match of text.matchAll(FIGURE)) {
    const start = match.index;
    const end = start + match[0].length;
    if (GLUED_BEFORE.test(text[start - 1] ?? '') || GLUED_AFTER.test(text[end] ?? '')) continue;
    if (start > last) parts.push({ text: text.slice(last, start) });
    parts.push({ text: match[0], figure: true });
    last = end;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
