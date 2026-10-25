import { Mesh, Quaternion, Vector3 } from 'three';
import { ball, cyl, merge, place } from './model';
import { clamp } from './math';

/** Lobe radius, so also the bone's resting height above the floor. */
export const TOY_REST = 0.019;

const GRAVITY = 9.8;
const STEP = 1 / 120;
const UP = new Vector3(0, 1, 0);
const LONG_AXIS = new Vector3(1, 0, 0);
const _dq = new Quaternion();
const _flat = new Quaternion();
const _axis = new Vector3();
const _long = new Vector3();

/** A small dog bone: shaft along x with two lobes at each end, lying flat in xz. */
export function boneGeometry() {
  const parts = [place(cyl(0.0115, 0.104, 18), [0, 0, 0], [0, 0, Math.PI / 2])];
  for (const x of [-0.052, 0.052]) {
    for (const z of [-0.0135, 0.0135]) parts.push(place(ball(TOY_REST), [x, 0, z]));
  }
  const geometry = merge(parts);
  geometry.computeBoundingBox();
  return geometry;
}

export function createToy(geometry, material) {
  const mesh = new Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.visible = false;

  const toy = {
    mesh,
    vel: new Vector3(),
    spin: new Vector3(),
    // hidden | flying | rolling | resting | held | fading
    state: 'hidden',
    landed: false,
    fade: 1,

    get onFloor() {
      return toy.state === 'rolling' || toy.state === 'resting';
    },

    /** Lob from `from` so it lands on `to` after `duration` seconds. */
    throwTo(from, to, duration) {
      mesh.position.copy(from);
      toy.vel.subVectors(to, from).divideScalar(duration);
      toy.vel.y += 0.5 * GRAVITY * duration;
      toy.spin.set(toy.vel.z, 0, -toy.vel.x).normalize().multiplyScalar(11);
      mesh.quaternion.setFromAxisAngle(UP, Math.atan2(toy.vel.x, toy.vel.z) + Math.PI / 2);
      toy.release();
    },

    /** Let go: physics from the current world transform. */
    release(vel) {
      if (vel) toy.vel.copy(vel);
      toy.state = 'flying';
      toy.landed = false;
      toy.fade = 1;
      mesh.scale.setScalar(1);
      mesh.visible = true;
    },

    fadeOut() {
      if (toy.state !== 'hidden') toy.state = 'fading';
    },

    update(dt, bounds) {
      if (toy.state === 'flying' || toy.state === 'rolling') {
        let n = Math.ceil(dt / STEP);
        const h = dt / Math.max(n, 1);
        while (n-- > 0) step(h, bounds);
      } else if (toy.state === 'held') {
        // Ease into the centre of the jaws after the grasp.
        mesh.position.multiplyScalar(Math.exp(-14 * dt));
      } else if (toy.state === 'fading') {
        toy.fade -= dt * 4;
        mesh.scale.setScalar(Math.max(toy.fade, 0.001));
        if (toy.fade <= 0) {
          toy.state = 'hidden';
          mesh.visible = false;
        }
      }
    },
  };

  function step(h, bounds) {
    const p = mesh.position;
    const v = toy.vel;
    if (toy.state === 'flying') v.y -= GRAVITY * h;
    p.addScaledVector(v, h);

    if (p.y <= TOY_REST && v.y <= 0) {
      p.y = TOY_REST;
      if (v.y < -0.45) {
        v.y *= -0.42;
        v.x *= 0.3;
        v.z *= 0.3;
        toy.spin.multiplyScalar(0.45);
      } else {
        v.y = 0;
        toy.state = 'rolling';
      }
      toy.landed = true;
    }

    // Soft walls keep it on the visible floor.
    if (p.x < bounds.minX || p.x > bounds.maxX) {
      p.x = clamp(p.x, bounds.minX, bounds.maxX);
      v.x *= -0.4;
    }
    if (p.z < bounds.minZ || p.z > bounds.maxZ) {
      p.z = clamp(p.z, bounds.minZ, bounds.maxZ);
      v.z *= -0.4;
    }

    if (toy.state === 'rolling') {
      const k = Math.exp(-10 * h);
      v.x *= k;
      v.z *= k;
      toy.spin.multiplyScalar(Math.exp(-8 * h));
      if (Math.hypot(v.x, v.z) < 0.01) {
        v.set(0, 0, 0);
        toy.state = 'resting';
      }
    }

    const a = toy.spin.length();
    if (a > 1e-4) {
      _dq.setFromAxisAngle(_axis.copy(toy.spin).divideScalar(a), a * h);
      mesh.quaternion.premultiply(_dq);
    }
    if (toy.landed) {
      // Settle flat, keeping the heading it landed with.
      _long.copy(LONG_AXIS).applyQuaternion(mesh.quaternion);
      _flat.setFromAxisAngle(UP, Math.atan2(-_long.z, _long.x));
      mesh.quaternion.slerp(_flat, 1 - Math.exp(-(toy.state === 'flying' ? 5 : 14) * h));
    }
  }

  return toy;
}

/** World-space long axis of the bone, for aligning the gripper. */
export const toyAxis = (toy, out) => out.copy(LONG_AXIS).applyQuaternion(toy.mesh.quaternion);
