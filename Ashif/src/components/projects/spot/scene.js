// The Spot story's illustration as pure functions of story progress, so the
// same frame renders on the server and every scroll position is reversible.
//
// `s` runs from 0 to 6 as the story's six steps scroll past:
//   0–1 label, 1–2 train, 2–3 evaluate, 3–4 connect, 4–5 fetch, 5–6 safety.
// `time` (seconds) only drives the live parts: the confidence flicker, the
// packets on the wire, and the dance. Units are SVG user units in a 640×360
// view, y down, with Spot facing right.

export const VIEW_W = 640;
export const VIEW_H = 360;
export const GROUND = 290;

/** Where the confidence meter runs along the bottom, and its 70% mark. */
export const METER = { x0: 356, x1: 616, y: 330, h: 8 };
export const THRESHOLD = 0.7;

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const clamp01 = (v) => clamp(v, 0, 1);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** 0→1 as `s` goes from `a` to `b`. */
export const seg = (s, a, b) => clamp01((s - a) / (b - a));

// ---------------------------------------------------------------- the toy --

// The bone: knobs at (±15, ±4.5) with radius 5, so 40 long and 19 tall.
const KNOB_X = 15;
const KNOB_Y = 4.5;
const KNOB_R = 5;

/** Where it lies on the floor, and the poses it takes in the labelling photos. */
export const TOY_HOME = { x: 470, y: GROUND - 14, angle: -5, scale: 1.4 };
const PHOTO_POSES = [
  { x: 420, y: 250, angle: 28, scale: 1.2 },
  { x: 548, y: 262, angle: -34, scale: 1.7 },
  { x: 476, y: 205, angle: 72, scale: 1.05 },
  { x: 402, y: 266, angle: -12, scale: 1.9 },
  { x: 566, y: 212, angle: 14, scale: 1.25 },
  { x: 506, y: 240, angle: -58, scale: 1.45 },
  { x: 446, y: 272, angle: 4, scale: 1.75 },
];

/** Axis-aligned box around the bone at a pose, padded like a label box. */
export function toyBox(pose, pad = 6) {
  const c = Math.cos(pose.angle * DEG);
  const s = Math.sin(pose.angle * DEG);
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [kx, ky] of [
    [KNOB_X, KNOB_Y],
    [KNOB_X, -KNOB_Y],
    [-KNOB_X, KNOB_Y],
    [-KNOB_X, -KNOB_Y],
  ]) {
    const x = pose.x + (kx * c - ky * s) * pose.scale;
    const y = pose.y + (kx * s + ky * c) * pose.scale;
    const r = KNOB_R * pose.scale + pad;
    x0 = Math.min(x0, x - r);
    y0 = Math.min(y0, y - r);
    x1 = Math.max(x1, x + r);
    y1 = Math.max(y1, y + r);
  }
  return { x0, y0, x1, y1 };
}

/** The other pink thing in the room: a ball, a little further back. */
export const DECOY = { x: 582, y: GROUND - 19, r: 14 };

// ------------------------------------------------------------- the robot --

const HIP_X = 54;
const HIP_Y = 8;
const THIGH = 56;
const SHIN = 60;
export const FOOT_R = 6;
const FOOT_Y = GROUND - FOOT_R;
const STAND_Y = FOOT_Y - 96 - HIP_Y;
// Sitting: the body rests low with the legs folded under it.
const LIE_Y = GROUND - 40;
// The far legs sit a little behind and above the near ones.
const FAR = { x: 7, y: -4 };
const SHOULDER = { x: 34, y: -30 };
const UPPER = 92;
const FORE = 96;
const JAW = 18;

const REST_X = 132;
const FETCH_X = 340;
// Three full gait cycles between the two, so every foot lands at the end.
const STRIDE = (FETCH_X - REST_X) / 6;

// Arm joint angles in degrees (0 = right, 90 = down). Stowed, the upper arm
// lies back along the body and the forearm folds forward over it.
const ARM_STOWED = [180, 355.5];
const ARM_HOLD = [315, 365];

/** Two-link IK from (ax, ay): the middle joint on the `bend` side (+1 = behind). */
function ik(ax, ay, tx, ty, l1, l2, bend) {
  let dx = tx - ax;
  let dy = ty - ay;
  const d = Math.hypot(dx, dy) || 1e-6;
  const r = clamp(d, Math.abs(l1 - l2) + 0.01, l1 + l2 - 0.01);
  dx *= r / d;
  dy *= r / d;
  const off = Math.acos(clamp((l1 * l1 + r * r - l2 * l2) / (2 * l1 * r), -1, 1));
  const a = Math.atan2(dy, dx) + bend * off;
  return { kx: ax + l1 * Math.cos(a), ky: ay + l1 * Math.sin(a), fx: ax + dx, fy: ay + dy };
}

/** Shift `deg` by whole turns into [from, from + 360). */
const unwrap = (deg, from) => deg - 360 * Math.floor((deg - from) / 360);

/** Arm angles that put the jaw's tip on (x, y), elbow up, from shoulder (sx, sy). */
function reachAngles(sx, sy, x, y) {
  // Aim the wrist a jaw's length above the target, so the jaw comes down onto it.
  const j = ik(sx, sy, x, y - JAW, UPPER, FORE, -1);
  const a1 = Math.atan2(j.ky - sy, j.kx - sx) / DEG;
  const a2 = Math.atan2(j.fy - j.ky, j.fx - j.kx) / DEG;
  return [unwrap(a1, ARM_STOWED[0]), unwrap(a2, ARM_STOWED[1] - 180)];
}

/** Where a foot sits relative to its hip for gait phase `p`: stance, then swing. */
function gait(p) {
  const u = (((p / TAU) % 1) + 1) % 1;
  if (u < 0.5) return { dx: lerp(STRIDE / 2, -STRIDE / 2, u * 2), dy: 0 };
  const k = (u - 0.5) * 2;
  return { dx: lerp(-STRIDE / 2, STRIDE / 2, smooth(k)), dy: -14 * Math.sin(Math.PI * k) };
}

/**
 * The robot's joints in world space. `pose`: x, y (body centre), pitch (deg,
 * + = nose down), phase (gait, radians), stride (0–1 how much of the gait
 * shows), power (0 lying down – 1 standing), lifts (per-leg foot lift for
 * the dance), arm ([upper, fore] deg), jawOpen (0 closed – 1 open).
 */
export function spotJoints(pose) {
  const c = Math.cos(pose.pitch * DEG);
  const s = Math.sin(pose.pitch * DEG);
  const toWorld = (lx, ly) => ({ x: pose.x + lx * c - ly * s, y: pose.y + lx * s + ly * c });

  // Near front, near rear, far front, far rear; trot pairs share a phase.
  const legs = [
    { hx: HIP_X, phase: 0, far: false },
    { hx: -HIP_X, phase: Math.PI, far: false },
    { hx: HIP_X, phase: Math.PI, far: true },
    { hx: -HIP_X, phase: 0, far: true },
  ].map((leg, i) => {
    const near = toWorld(leg.hx, HIP_Y);
    const hip = leg.far ? { x: near.x + FAR.x, y: near.y + FAR.y } : near;
    const step = gait(pose.phase + leg.phase);
    // Sitting, the foot tucks in just ahead of the hip, so the thigh slopes
    // down and back to a knee near the floor and the shin lies along it
    // underneath; standing, the foot is under the hip.
    const rest = pose.x + leg.hx + (leg.far ? FAR.x : 0) + lerp(8, 0, pose.power);
    const fx = rest + step.dx * pose.stride;
    const fy = FOOT_Y + (leg.far ? FAR.y : 0) + step.dy * pose.stride - (pose.lifts?.[i] ?? 0);
    const j = ik(hip.x, hip.y, fx, fy, THIGH, SHIN, 1);
    return { far: leg.far, hip, knee: { x: j.kx, y: j.ky }, foot: { x: j.fx, y: j.fy } };
  });

  const shoulder = toWorld(SHOULDER.x, SHOULDER.y);
  const [a1, a2] = pose.arm;
  const elbow = {
    x: shoulder.x + UPPER * Math.cos(a1 * DEG),
    y: shoulder.y + UPPER * Math.sin(a1 * DEG),
  };
  const wrist = { x: elbow.x + FORE * Math.cos(a2 * DEG), y: elbow.y + FORE * Math.sin(a2 * DEG) };
  const tip = { x: wrist.x + JAW * Math.cos(a2 * DEG), y: wrist.y + JAW * Math.sin(a2 * DEG) };

  return { legs, shoulder, elbow, wrist, tip, jawAngle: a2, jawOpen: pose.jawOpen ?? 0 };
}

// ---------------------------------------------------------- label boxes --

// A fixed scatter of small offsets, so the hand-drawn box wobbles the same
// way on the server and in every browser.
const JITTER = [0.62, -0.41, 0.93, -0.77, 0.18, -0.95, 0.47, 0.71, -0.28, 0.85, -0.6, 0.33, -0.14, 0.56, -0.88, 0.09];

/**
 * The four edges of a box as separate quadratic paths. `wobble` 1 is a quick
 * hand-drawn box (overshooting corners, bowed sides); 0 is a crisp rectangle.
 */
export function boxEdges(box, wobble, seed = 0) {
  const { x0, y0, x1, y1 } = box;
  const corners = [
    [x0, y0, x1, y0],
    [x1, y0, x1, y1],
    [x1, y1, x0, y1],
    [x0, y1, x0, y0],
  ];
  return corners.map(([ax, ay, bx, by], i) => {
    const j = (k) => JITTER[(seed * 5 + i * 4 + k) % JITTER.length];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const ux = (bx - ax) / len;
    const uy = (by - ay) / len;
    const nx = -uy;
    const ny = ux;
    const w = wobble;
    const sx = ax - ux * (5 + 3 * j(0)) * w + nx * 1.6 * j(1) * w;
    const sy = ay - uy * (5 + 3 * j(0)) * w + ny * 1.6 * j(1) * w;
    const ex = bx + ux * (4 + 3 * j(2)) * w + nx * 1.6 * j(3) * w;
    const ey = by + uy * (4 + 3 * j(2)) * w + ny * 1.6 * j(3) * w;
    const bow = 3.2 * j(1 + 2) * w;
    const cx = (sx + ex) / 2 + nx * bow;
    const cy = (sy + ey) / 2 + ny * bow;
    return { sx, sy, cx, cy, ex, ey };
  });
}

export const edgePath = (e) =>
  `M${e.sx.toFixed(1)} ${e.sy.toFixed(1)}Q${e.cx.toFixed(1)} ${e.cy.toFixed(1)} ${e.ex.toFixed(1)} ${e.ey.toFixed(1)}`;

/** A point `t` of the way along an edge's curve (for the pen tip). */
export function edgePoint(e, t) {
  const u = 1 - t;
  return {
    x: u * u * e.sx + 2 * u * t * e.cx + t * t * e.ex,
    y: u * u * e.sy + 2 * u * t * e.cy + t * t * e.ey,
  };
}

// --------------------------------------------------------- the timeline --

/** A number in −1…1 for each integer, the same in every JS engine (no trig). */
function hash(n) {
  const h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(n >>> 13, 0xc2b2ae35);
  return ((h >>> 0) / 4294967296) * 2 - 1;
}

/**
 * A smooth flicker in −1…1, stepping ~8 times a second like inference
 * frames. It reaches the confidence text, which must render the same on the
 * server and in any browser, hence the integer hash.
 */
function flicker(time) {
  const f = Math.floor(time * 8);
  return lerp(hash(f), hash(f + 1), smooth(time * 8 - f));
}

// Confetti for the victory dance: fixed launch angles, speeds and spins, so
// a burst is a pure function of its age.
const CONFETTI = Array.from({ length: 28 }, (_, i) => {
  const r = (k) => {
    const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
    return (x - Math.floor(x)) * 2 - 1;
  };
  const angle = (-90 + r(0) * 62) * DEG;
  const speed = 210 + 90 * r(1);
  return {
    vx: Math.cos(angle) * speed + 30,
    vy: Math.sin(angle) * speed,
    spin: 420 * r(2),
    tone: i % 4,
    long: i % 3 !== 0,
  };
});
const GRAVITY = 560;
export const CONFETTI_COUNT = CONFETTI.length;

/** Where the confetti starts: the toy held up at the end of the fetch. */
const BURST_FROM = (() => {
  const j = spotJoints({ x: FETCH_X, y: STAND_Y, pitch: 0, phase: 0, stride: 0, power: 1, arm: ARM_HOLD });
  return j.tip;
})();

/** The confetti `age` seconds into a burst; empty when there's none. */
function confettiAt(age) {
  if (age == null || age < 0 || age > 2.2) return [];
  const fade = 1 - smooth(seg(age, 1.5, 2.2));
  return CONFETTI.map((c) => ({
    x: BURST_FROM.x + c.vx * age,
    y: Math.min(GROUND - 3, BURST_FROM.y + c.vy * age + 0.5 * GRAVITY * age * age),
    angle: c.spin * age,
    tone: c.tone,
    long: c.long,
    opacity: fade,
  }));
}

/**
 * Everything the illustration shows at story progress `s`. `live` is the
 * safety demo's state: `hide` (toy out of view) and `kill` (kill-switch),
 * each eased 0–1 by the caller. `burst` is how many seconds ago the victory
 * dance began (null for none). `still` drops the live motion (reduced
 * motion), leaving each step's end state.
 */
export function sceneAt(s, time = 0, live = { hide: 0, kill: 0, power: 1 }, still = false, burst = null) {
  const t = still ? 0 : time;

  // Label: the pen draws a box round the toy, then 897 more photos flip by.
  const draw = seg(s, 0.1, 0.45);
  const flip = seg(s, 0.55, 0.97);
  const photo = s >= 0.97 ? 898 : Math.max(1, Math.round(lerp(1, 898, flip ** 1.6)));
  const posing = flip > 0 && photo < 898;
  const photoPose = posing ? PHOTO_POSES[Math.floor(photo / 64) % PHOTO_POSES.length] : null;

  // Train: the hand-drawn box straightens into the model's box.
  const morph = easeInOut(seg(s, 1.2, 1.75));
  const chip = easeOut(seg(s, 1.1, 1.35));
  const tag = easeOut(seg(s, 1.6, 1.85));

  // Evaluate: confidence climbs past 70%; the pink ball is checked and dropped.
  const rise = easeOut(seg(s, 2.1, 2.6));
  const liveHud = seg(s, 2.0, 2.1);
  const decoyIn = seg(s, 2.25, 2.4);
  const decoyOut = seg(s, 2.75, 2.92);

  // Connect: the wire draws in, packets flow, and Spot powers up and stands.
  const wire = easeInOut(seg(s, 3.05, 3.35));
  const grpc = seg(s, 3.25, 3.4);
  const wake = easeInOut(seg(s, 3.4, 3.85));

  // Fetch: walk over, reach down, grip, lift, dance. Safety then sets the toy
  // back down (lower, open, stow) so the demo starts from it on the floor.
  const walk = seg(s, 4.0, 4.5);
  const reach = easeInOut(seg(s, 4.5, 4.62)) * (1 - easeInOut(seg(s, 5.2, 5.32)));
  const grip = seg(s, 4.62, 4.68) * (1 - seg(s, 5.15, 5.2));
  const lift = easeInOut(seg(s, 4.68, 4.8)) * (1 - easeInOut(seg(s, 5.05, 5.15)));
  const dance = still ? 0 : seg(s, 4.8, 4.88) * (1 - seg(s, 5.0, 5.06));

  // ---- the robot
  const x = lerp(REST_X, FETCH_X, easeInOut(walk));
  const phase = ((x - REST_X) / (2 * STRIDE)) * TAU;
  const stride = smooth(seg(walk, 0, 0.12)) * smooth(1 - seg(walk, 0.88, 1));

  // Powered down until connected; in the safety demo, the kill-switch or a
  // lost toy powers it down again.
  const power = wake * live.power;
  let y = lerp(LIE_Y, STAND_Y, power);
  let pitch = 7 * reach * power;
  const lifts = [0, 0, 0, 0];

  // Arm: stowed → reach (the jaw on the toy) → hold (the toy up high).
  const reachTo = reachAngles(x + SHOULDER.x, y + SHOULDER.y, TOY_HOME.x, TOY_HOME.y);
  let a1 = lerp(lerp(ARM_STOWED[0], reachTo[0], reach), ARM_HOLD[0], lift);
  let a2 = lerp(lerp(ARM_STOWED[1], reachTo[1], reach), ARM_HOLD[1], lift);

  if (dance > 0) {
    const d = dance * power;
    y -= d * 7 * Math.abs(Math.sin((t * TAU) / 0.9));
    pitch += d * 5 * Math.sin((t * TAU) / 1.8);
    lifts[0] = d * 18 * Math.max(0, Math.sin((t * TAU) / 1.8));
    lifts[2] = d * 18 * Math.max(0, -Math.sin((t * TAU) / 1.8));
    a1 += d * 8 * Math.sin((t * TAU) / 0.9);
    a2 += d * 16 * Math.sin((t * TAU) / 0.45);
  }

  const joints = spotJoints({
    x,
    y,
    pitch,
    phase,
    stride,
    power,
    lifts,
    arm: [a1, a2],
    // The jaw opens on the way down to the toy and closes on it.
    jawOpen: reach * (1 - grip),
  });

  // ---- the toy: in a photo pose, on the floor, or in the jaw. It eases into
  // the jaw over the first part of the lift, so it never jumps.
  let toy = photoPose ? { ...photoPose } : { ...TOY_HOME };
  if (grip > 0.5 && lift > 0) {
    const k = smooth(seg(lift, 0, 0.35));
    const ja = joints.jawAngle * DEG;
    // The bone lies across the jaw; it looks the same turned half a turn.
    const across = ((((joints.jawAngle - 90) % 180) + 270) % 180) - 90;
    toy = {
      x: lerp(TOY_HOME.x, joints.tip.x + 2 * Math.cos(ja), k),
      y: lerp(TOY_HOME.y, joints.tip.y + 2 * Math.sin(ja), k),
      angle: lerp(TOY_HOME.angle, across, k),
      scale: TOY_HOME.scale,
    };
  }
  // Hidden in the safety demo: it slides out of the camera's view.
  if (live.hide > 0) toy = { ...toy, x: toy.x + 44 * smooth(live.hide) };
  const toyShown = 1 - live.hide;

  // ---- confidence: what the meter and the box's tag read.
  const base = 0.91 + 0.025 * flicker(t);
  let conf = rise * base;
  conf *= 1 - live.hide * 0.97;

  // ---- the box: hand-drawn while labelling, then the model's, on the toy.
  const box = toyBox(toy);
  const boxOn = s >= 0.1 && toyShown > 0.02;

  return {
    s,
    photo,
    hudPhotos: 1 - liveHud,
    hudLive: liveHud,
    draw,
    flash: posing ? clamp01(1 - ((photo % 64) / 64) * 4) : 0,
    handLabel: seg(s, 0.42, 0.5) * (1 - seg(s, 1.55, 1.7)),
    box,
    boxOn,
    boxSeed: photoPose ? Math.floor(photo / 64) : 0,
    morph,
    chip,
    tag: tag * toyShown,
    confOn: rise > 0 ? 1 : 0,
    conf,
    meter: seg(s, 2.0, 2.15),
    decoy: decoyIn,
    decoyBox: decoyIn * (1 - decoyOut),
    wire,
    grpc,
    packets: wire >= 1 ? 1 : 0,
    joints,
    spotX: x,
    spotY: y,
    pitch,
    power,
    toy,
    toyShown,
    estop: live.kill,
    // Rings: the meter's 70% mark as confidence crosses it, and Spot's face
    // as it powers up.
    crossRing: seg(s, 2.28, 2.5),
    wakeRing: seg(s, 3.42, 3.8),
    confetti: still ? [] : confettiAt(burst),
  };
}
