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
  foot: 0.032,
  armBase: new Vector3(0, 0.08, 0.19),
  shoulder: 0.085,
  arm1: 0.33,
  arm2: 0.36,
  grasp: 0.19,
};

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
function place(geometry, p = ZERO, r = ZERO, s = ONE, parent) {
  _m.compose(_p.fromArray(p), _q.setFromEuler(_e.fromArray(r)), _s.fromArray(s));
  if (parent) _m.premultiply(parent);
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  if (g !== geometry) geometry.dispose();
  return g.applyMatrix4(_m);
}

const box = (w, h, d, r, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, r);
const cyl = (r, h, seg = 28, r2 = r) => new CylinderGeometry(r, r2, h, seg);
const ball = (r) => new SphereGeometry(r, 24, 16);

/**
 * A tapered, bevelled link: circles r1 at z = 0 and r2 at z = len joined by
 * tangents, extruded `thick` across x. Reads like a cast aluminium link.
 */
function taper(r1, r2, len, thick, bevel = 0.006) {
  const a = Math.asin((r1 - r2) / len);
  const shape = new Shape();
  shape.absarc(0, 0, r1 - bevel, Math.PI / 2 - a, Math.PI * 1.5 + a, false);
  shape.absarc(len, 0, r2 - bevel, -Math.PI / 2 + a, Math.PI / 2 - a, false);
  shape.closePath();
  const depth = thick - bevel * 2;
  const g = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 14,
  });
  g.translate(0, 0, -depth / 2);
  g.rotateY(-Math.PI / 2);
  return g;
}

function merge(list) {
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
      roughness: 0.42,
      clearcoat: 0.6,
      clearcoatRoughness: 0.32,
    }),
    graphite: new MeshStandardMaterial({ color: 0x2b2c30, roughness: 0.56, metalness: 0.22 }),
    dark: new MeshStandardMaterial({ color: 0x151618, roughness: 0.44, metalness: 0.12 }),
    glass: new MeshPhysicalMaterial({
      color: 0x040506,
      roughness: 0.08,
      metalness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
    }),
    metal: new MeshStandardMaterial({ color: 0xa9adb4, roughness: 0.3, metalness: 0.9 }),
    rubber: new MeshStandardMaterial({ color: 0x1c1d1f, roughness: 0.9 }),
  };
}

/** A stereo pair: two bezelled lenses on a dark glass plate. */
function stereoPair(parts, parent, spacing = 0.034) {
  parts.glass.push(place(box(spacing + 0.036, 0.036, 0.01, 0.01, 2), ZERO, ZERO, ONE, parent));
  for (const x of [-spacing / 2, spacing / 2]) {
    parts.metal.push(place(cyl(0.0115, 0.006, 20), [x, 0, 0.006], X90, ONE, parent));
    parts.glass.push(place(cyl(0.0082, 0.008, 20), [x, 0, 0.009], X90, ONE, parent));
  }
}

function buildBody(materials) {
  const body = new Group();
  const parts = { paint: [], graphite: [], dark: [], glass: [], metal: [] };

  parts.graphite.push(place(box(0.2, 0.125, 0.78, 0.045), [0, -0.035, 0]));
  parts.dark.push(place(box(0.15, 0.03, 0.5, 0.012, 2), [0, -0.1, 0]));
  parts.paint.push(place(box(0.25, 0.1, 0.68, 0.045, 4), [0, 0.03, -0.02]));
  for (const s of [1, -1]) {
    parts.dark.push(place(box(0.016, 0.012, 0.42, 0.005, 2), [s * 0.058, 0.086, -0.1]));
  }

  // Front sensor head: a sloped dark face with two stereo pairs angled
  // outward, the detail that gives Spot its "eyes".
  const face = frame([0, -0.016, 0.36], [0.4, 0, 0]);
  parts.dark.push(place(box(0.214, 0.11, 0.1, 0.038), ZERO, ZERO, ONE, face));
  for (const s of [1, -1]) {
    const eye = frame([s * 0.051, 0.012, 0.052], [0, s * 0.2, 0]).premultiply(face);
    stereoPair(parts, eye);
  }

  // Rear and side cameras.
  parts.dark.push(place(box(0.205, 0.105, 0.07, 0.032), [0, -0.016, -0.372]));
  stereoPair(parts, frame([0, -0.008, -0.408], [0, Math.PI, 0]));
  for (const s of [1, -1]) {
    stereoPair(parts, frame([s * 0.101, -0.036, 0.03], [0, s * Math.PI / 2, 0]), 0.05);
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
  assemble(thigh, {
    graphite: [
      place(cyl(0.056, 0.07, 32), ZERO, Z90),
      place(taper(0.05, 0.031, DIMS.upper, 0.05), ZERO, X90),
    ],
    paint: [place(taper(0.04, 0.026, DIMS.upper - 0.09, 0.058), [0, -0.035, 0], X90)],
    metal: [place(cyl(0.027, 0.074), ZERO, Z90)],
  }, materials);

  const knee = new Group();
  knee.position.y = -DIMS.upper;
  thigh.add(knee);
  assemble(knee, {
    graphite: [place(cyl(0.032, 0.062), ZERO, Z90)],
    dark: [place(taper(0.027, 0.016, DIMS.lower - 0.012, 0.032), ZERO, X90)],
    metal: [place(cyl(0.016, 0.066), ZERO, Z90)],
    rubber: [place(ball(DIMS.foot), [0, -DIMS.lower, 0], ZERO, [1, 0.9, 1.08])],
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
    graphite: [place(cyl(0.048, 0.11, 32), ZERO, Z90), place(taper(0.045, 0.035, DIMS.arm1, 0.056))],
    paint: [place(taper(0.036, 0.029, DIMS.arm1 - 0.1, 0.064), [0, 0, 0.05])],
    metal: [place(cyl(0.026, 0.114), ZERO, Z90)],
  }, materials);

  const elbow = new Group();
  elbow.position.z = DIMS.arm1;
  shoulder.add(elbow);
  assemble(elbow, {
    graphite: [place(cyl(0.04, 0.086, 32), ZERO, Z90), place(taper(0.034, 0.027, DIMS.arm2, 0.048))],
    metal: [place(cyl(0.022, 0.09), ZERO, Z90)],
  }, materials);

  const wrist = new Group();
  wrist.position.z = DIMS.arm2;
  elbow.add(wrist);
  assemble(wrist, { graphite: [place(cyl(0.031, 0.062), ZERO, Z90)] }, materials);

  // Wrist roll, gripper body, palm and top cameras.
  const roll = new Group();
  wrist.add(roll);
  assemble(roll, {
    metal: [place(cyl(0.028, 0.03), [0, 0, 0.035], X90)],
    graphite: [place(box(0.064, 0.058, 0.08, 0.016), [0, 0, 0.09])],
    dark: [place(box(0.03, 0.016, 0.026, 0.006, 2), [0, 0.036, 0.112])],
    glass: [
      place(cyl(0.0065, 0.006, 16), [0, 0.036, 0.126], X90),
      place(cyl(0.0078, 0.006, 16), [0, 0, 0.131], X90),
    ],
  }, materials);

  const fingers = [1, -1].map((sign) => {
    const group = new Group();
    group.position.set(0, sign * 0.02, 0.128);
    roll.add(group);
    assemble(group, {
      dark: [place(box(0.044, 0.011, 0.082, 0.005, 2), [0, -sign * 0.002, 0.041])],
    }, materials);
    return { group, sign };
  });

  const grasp = new Object3D();
  grasp.position.z = DIMS.grasp;
  roll.add(grasp);

  // Mount for the feed camera: on the top camera, looking down the gripper.
  const eye = new Object3D();
  eye.position.set(0, 0.036, 0.128);
  eye.rotation.set(0.2, Math.PI, 0);
  roll.add(eye);

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
