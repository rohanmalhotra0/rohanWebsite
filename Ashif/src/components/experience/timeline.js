// Pure helpers for the experience section (kept out of component files so
// react-refresh stays happy).

export const EASE = [0.16, 1, 0.3, 1];

// The latest role shows every highlight and the next two show a couple. Older
// roles lead with their summary and keep highlights behind "Show N more".
const RECENT_ROLES = 3;
const PREVIEW = 2;

/** How many of a role's highlights show before "Show N more". */
export function visibleHighlights(index, count) {
  if (index === 0) return count;
  if (index >= RECENT_ROLES) return 0;
  // Hiding a single bullet would save nothing.
  return count - PREVIEW > 1 ? PREVIEW : count;
}

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

/** The location every role in a group shares, or null. */
export function sharedLocation(roles) {
  const [{ location }] = roles;
  return roles.every((role) => role.location === location) ? location : null;
}
