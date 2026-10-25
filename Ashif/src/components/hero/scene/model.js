import {
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  Euler,
  ExtrudeGeometry,
  Group,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Shape,
  SphereGeometry,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Metres, body frame: x left, y up, z forward, origin at the body centre.
// Proportions follow Spot: ~1.1 m long, legs 0.32 + 0.335 m, arm 0.33 + 0.36 m.
export const DIMS = {
  height: 0.53,
  hipX: 0.072,
  hipY: -0.06,
  hipZ: 0.29,
  legOffset: 0.083,
  upper: 0.32,
  lower: 0.335,
  foot: 0.034,
  armBase: new Vector3(0, 0.09, 0.19),
  shoulder: 0.09,
  arm1: 0.33,
  arm2: 0.36,
  grasp: 0.19,
};

/** Downward tilt of the palm camera relative to the jaw axis. */
export const EYE_TILT = 0.21;

export const LEGS = [
  { side: 1, end: 1, pair: 0 },
  { side: -1, end: 1, pair: 1 },
  { side: 1, end: -1, pair: 1 },
  { side: -1, end: -1, pair: 0 },
];

const _m = new Matrix4();
const _q = new Quaternion();
const _e = new Euler();
const _p = new Vector3();
const _s = new Vector3();
const ZERO = [0, 0, 0];
const ONE = [1, 1, 1];
const X90 = [Math.PI / 2, 0, 0];
const Z90 = [0, 0, Math.PI / 2];

const frame = (p, r = ZERO) =>
  new Matrix4().compose(_p.fromArray(p), _q.setFromEuler(_e.fromArray(r)), _s.set(1, 1, 1));

/** Bake a primitive into link space (non-indexed so links can be merged). */
export function place(geometry, p = ZERO, r = ZERO, s = ONE, parent) {
  _m.compose(_p.fromArray(p), _q.setFromEuler(_e.fromArray(r)), _s.fromArray(s));
  if (parent) _m.premultiply(parent);
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  if (g !== geometry) geometry.dispose();
  return g.applyMatrix4(_m);
}

const box = (w, h, d, r, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, r);
export const cyl = (r, h, seg = 28, r2 = r) => new CylinderGeometry(r, r2, h, seg);
export const ball = (r) => new SphereGeometry(r, 24, 16);

/** Extrude a side profile (z forward, y up) across x with rounded edges. */
function slab(shape, width, bevel, curveSegments = 14) {
  const depth = width - bevel * 2;
  const g = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments,
  });
  g.translate(0, 0, -depth / 2);
  g.rotateY(-Math.PI / 2);
  return g;
}

/**
 * A tapered link: circles r1 at z = 0 and r2 at z = len joined by tangents,
 * `thick` wide across x. Reads like a machined aluminium link.
 */
function taper(r1, r2, len, thick, bevel = 0.006) {
  const a = Math.asin((r1 - r2) / len);
  const shape = new Shape();
  shape.absarc(0, 0, r1 - bevel, Math.PI / 2 - a, Math.PI * 1.5 + a, false);
  shape.absarc(len, 0, r2 - bevel, -Math.PI / 2 + a, Math.PI / 2 - a, false);
  shape.closePath();
  return slab(shape, thick, bevel);
}

/** The body's top cover: flat deck, sloped nose and tail (side profile). */
function coverShape(b) {
  const shape = new Shape();
  shape.moveTo(-0.372 + b, -0.03 + b);
  shape.lineTo(0.352 - b, -0.03 + b);
  shape.lineTo(0.352 - b, 0.004);
  shape.lineTo(0.262, 0.09 - b);
  shape.lineTo(-0.3, 0.09 - b);
  shape.lineTo(-0.372 + b, 0.02);
  shape.closePath();
  return shape;
}

export function merge(list) {
  let count = 0;
  for (const g of list) count += g.attributes.position.array.length;
  const position = new Float32Array(count);
  const normal = new Float32Array(count);
  let offset = 0;
  for (const g of list) {
    position.set(g.attributes.position.array, offset);
    normal.set(g.attributes.normal.array, offset);
    offset += g.attributes.position.array.length;
    g.dispose();
  }
  const out = new BufferGeometry();
  out.setAttribute('position', new BufferAttribute(position, 3));
  out.setAttribute('normal', new BufferAttribute(normal, 3));
  out.computeBoundingSphere();
  return out;
}

/** One mesh per material for a rigid link. */
function assemble(parent, parts, materials) {
  for (const key of Object.keys(parts)) {
    if (!parts[key].length) continue;
    const mesh = new Mesh(merge(parts[key]), materials[key]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
  }
}

export function createMaterials() {
  return {
    // Safety amber, clear-coated like painted ABS.
    paint: new MeshPhysicalMaterial({
      color: 0xf4a11c,
      roughness: 0.44,
      clearcoat: 0.55,
      clearcoatRoughness: 0.34,
    }),
    graphite: new MeshStandardMaterial({ color: 0x2a2b2f, roughness: 0.58, metalness: 0.2 }),
    dark: new MeshStandardMaterial({ color: 0x141517, roughness: 0.46, metalness: 0.1 }),
    glass: new MeshPhysicalMaterial({
      color: 0x040506,
      roughness: 0.08,
      metalness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
    }),
    anodized: new MeshStandardMaterial({ color: 0x55585e, roughness: 0.36, metalness: 0.75 }),
    metal: new MeshStandardMaterial({ color: 0xb4b8bf, roughness: 0.28, metalness: 0.9 }),
    rubber: new MeshStandardMaterial({ color: 0x1c1d1f, roughness: 0.9 }),
  };
}

const newParts = () => ({ paint: [], graphite: [], dark: [], glass: [], anodized: [], metal: [], rubber: [] });

/** A stereo pair: two bezelled lenses on a dark glass plate. */
function stereoPair(parts, parent, spacing = 0.036, lens = 0.0105) {
  parts.glass.push(place(box(spacing + 0.042, 0.04, 0.01, 0.012, 2), ZERO, ZERO, ONE, parent));
  for (const x of [-spacing / 2, spacing / 2]) {
    parts.metal.push(place(cyl(lens + 0.0032, 0.006, 24), [x, 0, 0.006], X90, ONE, parent));
    parts.glass.push(place(cyl(lens, 0.008, 24), [x, 0, 0.009], X90, ONE, parent));
  }
}

function buildBody(materials) {
  const body = new Group();
  const parts = newParts();

  // Lower chassis and belly pan.
  parts.graphite.push(place(box(0.204, 0.12, 0.72, 0.03), [0, -0.07, 0]));
  parts.dark.push(place(box(0.15, 0.025, 0.5, 0.01, 2), [0, -0.134, 0]));

  // Top cover with a dark payload deck and rails behind the arm mount.
  parts.paint.push(slab(coverShape(0.018), 0.25, 0.018, 6));
  parts.dark.push(place(box(0.13, 0.012, 0.44, 0.004, 2), [0, 0.094, -0.1]));
  for (const s of [1, -1]) {
    parts.dark.push(place(box(0.016, 0.014, 0.42, 0.005, 2), [s * 0.05, 0.106, -0.1]));
  }

  // Front sensor head: a dark face under the sloped nose, looking forward and
  // down, with two stereo pairs angled outward (Spot's "eyes").
  const face = frame([0, -0.032, 0.338], [0.6, 0, 0]);
  parts.dark.push(place(box(0.21, 0.1, 0.06, 0.024), ZERO, ZERO, ONE, face));
  for (const s of [1, -1]) {
    stereoPair(parts, frame([s * 0.053, 0.008, 0.032], [0, s * 0.22, 0]).premultiply(face));
  }

  // Tail face and side cameras.
  const tail = frame([0, -0.034, -0.368], [-0.5, Math.PI, 0]);
  parts.dark.push(place(box(0.2, 0.092, 0.05, 0.02), ZERO, ZERO, ONE, tail));
  stereoPair(parts, frame([0, 0.004, 0.027]).premultiply(tail));
  for (const s of [1, -1]) {
    stereoPair(parts, frame([s * 0.103, -0.07, 0.02], [0, s * Math.PI / 2, 0]), 0.05, 0.009);
  }

  assemble(body, parts, materials);
  return body;
}

function buildLeg(def, materials) {
  const { side, end } = def;
  const root = new Group();
  root.position.set(side * DIMS.hipX, DIMS.hipY, end * DIMS.hipZ);
  assemble(root, { graphite: [place(cyl(0.046, 0.11), [0, 0, -end * 0.02], X90)] }, materials);

  const thigh = new Group();
  thigh.position.x = side * DIMS.legOffset;
  root.add(thigh);
  // The thigh's own rounded top is the hip housing; the amber cover wraps
  // over it like Spot's upper-leg shell.
  assemble(thigh, {
    graphite: [place(taper(0.056, 0.032, DIMS.upper, 0.054), ZERO, X90)],
    paint: [place(taper(0.05, 0.028, DIMS.upper - 0.06, 0.062), ZERO, X90)],
    anodized: [place(cyl(0.024, 0.068, 28), ZERO, Z90)],
  }, materials);

  const knee = new Group();
  knee.position.y = -DIMS.upper;
  thigh.add(knee);
  assemble(knee, {
    graphite: [place(cyl(0.034, 0.064), ZERO, Z90)],
    dark: [place(taper(0.03, 0.017, DIMS.lower - 0.012, 0.034), ZERO, X90)],
    anodized: [place(cyl(0.018, 0.068), ZERO, Z90)],
    rubber: [place(ball(DIMS.foot), [0, -DIMS.lower, 0], ZERO, [1, 0.92, 1.06])],
  }, materials);

  return { ...def, root, thigh, knee };
}

function buildArm(materials) {
  const base = new Group();
  base.position.copy(DIMS.armBase);
  assemble(base, {
    graphite: [place(cyl(0.06, 0.05, 32, 0.064), [0, 0.025, 0])],
    metal: [place(cyl(0.0615, 0.008, 32), [0, 0.05, 0])],
  }, materials);

  const shoulder = new Group();
  shoulder.position.y = DIMS.shoulder;
  base.add(shoulder);
  assemble(shoulder, {
    graphite: [place(cyl(0.05, 0.112, 32), ZERO, Z90), place(taper(0.046, 0.036, DIMS.arm1, 0.058))],
    paint: [place(taper(0.038, 0.03, DIMS.arm1 - 0.1, 0.066), [0, 0, 0.05])],
    anodized: [place(cyl(0.028, 0.116), ZERO, Z90)],
  }, materials);

  const elbow = new Group();
  elbow.position.z = DIMS.arm1;
  shoulder.add(elbow);
  assemble(elbow, {
    graphite: [place(cyl(0.041, 0.088, 32), ZERO, Z90), place(taper(0.035, 0.028, DIMS.arm2, 0.05))],
    anodized: [place(cyl(0.023, 0.092), ZERO, Z90)],
  }, materials);

  const wrist = new Group();
  wrist.position.z = DIMS.arm2;
  elbow.add(wrist);
  assemble(wrist, { graphite: [place(cyl(0.032, 0.064), ZERO, Z90)] }, materials);

  // Wrist roll, gripper body, top and palm cameras.
  const roll = new Group();
  wrist.add(roll);
  assemble(roll, {
    metal: [place(cyl(0.029, 0.03), [0, 0, 0.035], X90)],
    graphite: [place(box(0.066, 0.06, 0.082, 0.016), [0, 0, 0.09])],
    dark: [place(box(0.032, 0.016, 0.028, 0.006, 2), [0, 0.037, 0.108])],
    glass: [
      place(cyl(0.0068, 0.006, 16), [0, 0.037, 0.123], X90),
      place(cyl(0.0078, 0.006, 16), [0, 0, 0.132], X90),
    ],
  }, materials);

  // Two tapered jaws, hinged at the front of the gripper body.
  const fingers = [1, -1].map((sign) => {
    const group = new Group();
    group.position.set(0, sign * 0.02, 0.128);
    roll.add(group);
    assemble(group, { dark: [place(taper(0.014, 0.006, 0.09, 0.05, 0.004), [0, 0, 0], [0, 0, 0])] }, materials);
    return { group, sign };
  });

  const grasp = new Object3D();
  grasp.position.z = DIMS.grasp;
  roll.add(grasp);

  // Palm camera mount, looking out between the jaws, tilted slightly down.
  const eye = new Object3D();
  eye.position.set(0, 0, 0.132);
  eye.rotation.set(EYE_TILT, Math.PI, 0);
  roll.add(eye);
  roll.traverse((o) => o.layers.set(1));

  return { base, shoulder, elbow, wrist, roll, fingers, grasp, eye };
}

export function buildRobot(materials) {
  const root = new Group();
  const body = buildBody(materials);
  body.position.y = DIMS.height;
  root.add(body);

  const legs = LEGS.map((def) => {
    const leg = buildLeg(def, materials);
    body.add(leg.root);
    return leg;
  });

  const arm = buildArm(materials);
  body.add(arm.base);

  return { root, body, legs, arm };
}
