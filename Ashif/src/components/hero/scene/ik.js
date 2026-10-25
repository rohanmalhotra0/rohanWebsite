import { clamp, wrap } from './math';

/** Interior angle opposite side c of a triangle with sides a, b, c. */
const cosineAngle = (a, b, c) =>
  Math.acos(clamp((a * a + b * b - c * c) / (2 * a * b), -1, 1));

/**
 * Analytic IK for one leg: hip roll (abduction), hip pitch, knee.
 *
 * (fx, fy, fz) is the foot relative to the hip-roll pivot, in body axes
 * (x left, y up, z forward). The leg's sagittal plane sits `offset` metres
 * outboard of the roll axis on `side` (+1 left, -1 right). Knees bend
 * backward, like Spot's. Angles: roll about +z, pitch positive = thigh
 * swings forward, knee = flexion.
 */
export function solveLeg(fx, fy, fz, side, offset, upper, lower, out) {
  // Frontal plane: rotate the leg about the roll axis so the foot lies in
  // the offset sagittal plane.
  const h = Math.sqrt(Math.max(fx * fx + fy * fy - offset * offset, 1e-6));
  out.roll = wrap(Math.atan2(fy, fx) - Math.atan2(-h, side * offset));

  // Sagittal plane: classic two-bone solve, knee behind the hip–foot line.
  const d = clamp(Math.hypot(fz, h), Math.abs(upper - lower) + 1e-3, upper + lower - 1e-3);
  out.knee = Math.PI - cosineAngle(upper, lower, d);
  out.pitch = Math.atan2(fz, h) - cosineAngle(upper, d, lower);
  return out;
}

/**
 * Planar two-link IK in the arm's vertical plane, elbow above the line to
 * the target. `f` is the horizontal reach and `u` the height of the wrist
 * relative to the shoulder. Shoulder is the elevation of the upper arm from
 * horizontal; elbow is the (negative) bend of the forearm relative to it.
 */
export function solveArm(f, u, a, b, out) {
  const d = clamp(Math.hypot(f, u), Math.abs(a - b) + 1e-3, a + b - 1e-3);
  out.shoulder = Math.atan2(u, f) + cosineAngle(a, d, b);
  out.elbow = -(Math.PI - cosineAngle(a, b, d));
  return out;
}
