// The dot layout shared by the lab's lanes and the page's link-preview card.

/**
 * Lay dots out along x without overlaps: each one takes the free spot
 * nearest the lane's midline. Squeezed vertically if a lane overflows.
 */
export function swarm(points, r, room) {
  const gap = 2 * r + 0.75;
  const placed = [];
  for (const point of points) {
    const blocked = [];
    for (const other of placed) {
      const dx = point.x - other.x;
      if (Math.abs(dx) < gap) {
        const dy = Math.sqrt(gap * gap - dx * dx);
        blocked.push([other.y - dy, other.y + dy]);
      }
    }
    const options = [0];
    for (const [a, b] of blocked) options.push(a, b);
    options.sort((a, b) => Math.abs(a) - Math.abs(b) || a - b);
    const y = options.find((c) => blocked.every(([a, b]) => c <= a + 1e-6 || c >= b - 1e-6)) ?? 0;
    placed.push({ ...point, y });
  }
  const tallest = placed.reduce((most, point) => Math.max(most, Math.abs(point.y)), 0);
  const squeeze = tallest > room ? room / tallest : 1;
  return placed.map((point) => ({ ...point, y: point.y * squeeze }));
}
