import { Mesh, Quaternion, Vector3 } from 'three';
import { ball, cyl, merge, place } from './model';
import { clamp } from './math';

/** Lobe radius, so also the bone's resting height above the floor. */
export const TOY_REST = 0.019;

const GRAVITY = 9.8;
const STEP = 1 / 120;
/** Height a dragged toy is carried at, so it reads as picked up. */
export const DRAG_LIFT = 0.06;
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
    // hidden | flying | rolling | resting | held | dragged | fading
    state: 'hidden',
    landed: false,
    fade: 1,
    goal: new Vector3(),

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

    /** Lie still on the floor at `at`, long axis along `heading`. */
    rest(at, heading) {
      mesh.position.set(at.x, TOY_REST, at.z);
      mesh.quaternion.setFromAxisAngle(UP, heading);
      mesh.scale.setScalar(1);
      mesh.visible = true;
      toy.vel.set(0, 0, 0);
      toy.spin.set(0, 0, 0);
      toy.fade = 1;
      toy.landed = true;
      toy.state = 'resting';
    },

    /** Picked up by the pointer: follows `goal` (set by the caller) a little above the floor. */
    grab() {
      toy.goal.copy(mesh.position).setY(TOY_REST);
      toy.vel.set(0, 0, 0);
      toy.spin.set(0, 0, 0);
      toy.landed = false;
      toy.state = 'dragged';
    },

    /** Let go of a drag: it drops onto the floor, keeping a little of the hand's speed. */
    drop() {
      const speed = Math.hypot(toy.vel.x, toy.vel.z);
      if (speed > 1.2) toy.vel.multiplyScalar(1.2 / speed);
      toy.vel.y = 0;
      toy.release();
    },

    update(dt, bounds) {
      if (toy.state === 'flying' || toy.state === 'rolling') {
        let n = Math.ceil(dt / STEP);
        const h = dt / Math.max(n, 1);
        while (n-- > 0) step(h, bounds);
      } else if (toy.state === 'dragged') {
        // Critically damped follow, so a fast drag still looks carried.
        const p = mesh.position;
        const k = 1 - Math.exp(-22 * dt);
        const x = p.x + (toy.goal.x - p.x) * k;
        const z = p.z + (toy.goal.z - p.z) * k;
        const y = p.y + (TOY_REST + DRAG_LIFT - p.y) * (1 - Math.exp(-16 * dt));
        if (dt > 0) toy.vel.set((x - p.x) / dt, 0, (z - p.z) / dt);
        p.set(x, y, z);
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

    // Soft walls keep it on the visible floor once it has landed (the lob
    // itself starts outside them, on the viewer's side).
    if (!toy.landed) return spinAndSettle(h);
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

    spinAndSettle(h);
  }

  function spinAndSettle(h) {
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
