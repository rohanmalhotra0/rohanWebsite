const TAU = Math.PI * 2;

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, t) => a + (b - a) * t;

/** Smoothstep on [0, 1]: zero velocity at both ends. */
export const smooth = (t) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

export const easeInOut = (t) => {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - (2 - 2 * x) ** 3 / 2;
};

/** Wrap an angle to [-PI, PI). */
export const wrap = (a) => a - TAU * Math.floor((a + Math.PI) / TAU);

/** Frame-rate independent exponential approach. */
export const damp = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));
export const dampAngle = (a, b, rate, dt) =>
  a + wrap(b - a) * (1 - Math.exp(-rate * dt));

/** Move toward b by at most `step`. */
export const approach = (a, b, step) => a + clamp(b - a, -step, step);

const AXES = ['x', 'y', 'z'];

/** Critically damped spring on a Vector3 position/velocity pair. */
export function springTo(pos, vel, target, omega, dt) {
  const e = Math.exp(-omega * dt);
  for (const k of AXES) {
    const d = pos[k] - target[k];
    const t = (vel[k] + omega * d) * dt;
    vel[k] = (vel[k] - omega * t) * e;
    pos[k] = target[k] + (d + t) * e;
  }
}

/** Small deterministic PRNG (mulberry32), so the first frame matches the poster. */
export function random(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
