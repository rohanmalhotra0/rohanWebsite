import { Matrix4, Quaternion, Vector3 } from 'three';
import { DIMS, EYE_TILT } from './model';
import { solveArm, solveLeg } from './ik';
import { approach, clamp, damp, dampAngle, lerp, smooth, springTo, wrap } from './math';

// Trot: diagonal pairs swing half a cycle apart, with a short four-foot
// support phase between swings.
const PERIOD = 0.5;
const SWING = 0.42;
const SWING_TIME = PERIOD * SWING;
const STANCE_TIME = PERIOD - SWING_TIME;

const MAX_SPEED = 0.62;
const MAX_TURN = 1.7;
const ACCEL = 1.3;
const TURN_ACCEL = 5;
const STANCE_X = DIMS.hipX + DIMS.legOffset;
const SHOULDER = new Vector3(DIMS.armBase.x, DIMS.armBase.y + DIMS.shoulder, DIMS.armBase.z);
const JOINTS = ['sh', 'el', 'wr'];
// Arm folded flat along the back, the gripper over the nose looking down at
// the floor ahead (so its camera sees the floor at rest).
const STOW = { yaw: 0, sh: Math.PI + 0.06, el: -(Math.PI - 0.24), wr: -0.75 };

/** Drives the rig: locomotion, gait, body pose, leg IK and the arm. */
export function createController({ root, body, legs, arm }) {
  const inv = new Matrix4();
  const quat = new Quaternion();
  const v = new Vector3();
  const w = new Vector3();
  const sol = { roll: 0, pitch: 0, knee: 0, shoulder: 0, elbow: 0 };

  const s = {
    x: 0, z: 0, yaw: 0,
    vf: 0, vl: 0, w: 0,
    cmdF: 0, cmdL: 0, cmdW: 0,
    accel: 0,
    phase: 0, walking: false, gaitMix: 0,
    crouch: 0, sit: 0, look: 1,
    twist: 0, nod: 0,
    time: 0,
  };

  const feet = legs.map((leg) => ({
    leg,
    offset: leg.pair * 0.5,
    pos: new Vector3(),
    from: new Vector3(),
    to: new Vector3(),
    swing: false,
    lift: 0,
  }));

  const gaze = { target: new Vector3(), pos: new Vector3(), vel: new Vector3(), omega: 5 };
  const armCtl = {
    mode: 'stow',
    wrist: new Vector3(),
    dir: new Vector3(0, -1, 0),
    align: null,
    grip: 0,
    rate: 7,
    neck: 0,
    clock: 0,
  };
  const q = { yaw: 0, sh: 0, el: 0, wr: 0, roll: 0, grip: 0 };
  const qt = { yaw: 0, sh: 0, el: 0, wr: 0, roll: 0 };

  body.rotation.order = 'YXZ';

  // World position of a foot's neutral stance for a given root pose.
  function nominal(leg, x, z, yaw, out) {
    const lx = leg.side * STANCE_X;
    const lz = leg.end * DIMS.hipZ;
    const c = Math.cos(yaw);
    const sn = Math.sin(yaw);
    return out.set(x + lx * c + lz * sn, DIMS.foot, z - lx * sn + lz * c);
  }

  // Raibert-style foothold: under the hip at mid-stance, predicted from the
  // current body velocity and yaw rate.
  function foothold(f, remaining) {
    const t = remaining + STANCE_TIME / 2;
    const ym = s.yaw + (s.w * t) / 2;
    const px = s.x + (s.vf * Math.sin(ym) + s.vl * Math.cos(ym)) * t;
    const pz = s.z + (s.vf * Math.cos(ym) - s.vl * Math.sin(ym)) * t;
    return nominal(f.leg, px, pz, s.yaw + s.w * t, f.to);
  }

  function footError() {
    let worst = 0;
    for (const f of feet) {
      nominal(f.leg, s.x, s.z, s.yaw, v);
      worst = Math.max(worst, Math.hypot(v.x - f.pos.x, v.z - f.pos.z));
    }
    return worst;
  }

  function updateLocomotion(dt) {
    const before = s.vf;
    s.vf = approach(s.vf, s.cmdF, ACCEL * dt);
    s.vl = approach(s.vl, s.cmdL, ACCEL * dt);
    s.w = approach(s.w, s.cmdW, TURN_ACCEL * dt);
    if (dt > 0) s.accel = damp(s.accel, (s.vf - before) / dt, 6, dt);
    const ym = s.yaw + (s.w * dt) / 2;
    s.x += (s.vf * Math.sin(ym) + s.vl * Math.cos(ym)) * dt;
    s.z += (s.vf * Math.cos(ym) - s.vl * Math.sin(ym)) * dt;
    s.yaw = wrap(s.yaw + s.w * dt);
  }

  function updateGait(dt) {
    const commanded = Math.abs(s.cmdF) + Math.abs(s.cmdL) > 0.004 || Math.abs(s.cmdW) > 0.01;
    const moving = commanded || Math.abs(s.vf) + Math.abs(s.vl) > 0.01 || Math.abs(s.w) > 0.02;
    if (!s.walking) {
      if (!moving && footError() < 0.07) return;
      s.walking = true;
      s.phase = 0;
    }
    s.phase = (s.phase + dt / PERIOD) % 1;
    for (const f of feet) {
      const u = (s.phase - f.offset + 1) % 1;
      if (u < SWING) {
        if (!f.swing) {
          f.swing = true;
          f.from.copy(f.pos);
        }
        const p = u / SWING;
        foothold(f, (1 - p) * SWING_TIME);
        const k = smooth(p);
        const step = Math.hypot(f.to.x - f.from.x, f.to.z - f.from.z);
        f.lift = Math.sin(Math.PI * p);
        f.pos.set(
          lerp(f.from.x, f.to.x, k),
          DIMS.foot + clamp(0.022 + step * 0.3, 0.03, 0.085) * f.lift,
          lerp(f.from.z, f.to.z, k)
        );
      } else if (f.swing) {
        f.swing = false;
        f.lift = 0;
        f.pos.set(f.to.x, DIMS.foot, f.to.z);
      }
    }
    if (!moving && !feet.some((f) => f.swing) && footError() < 0.02) s.walking = false;
  }

  function updateBody(dt) {
    const speed = Math.hypot(s.vf, s.vl) + Math.abs(s.w) * 0.25;
    s.gaitMix = damp(s.gaitMix, s.walking ? clamp(speed / 0.35, 0.25, 1) : 0, 5, dt);
    const still = 1 - s.gaitMix;
    const t = s.time;
    const ph = s.phase * Math.PI * 2;

    // Head-led posture: twist and nod a little toward what the arm looks at.
    const gx = gaze.pos.x - s.x;
    const gz = gaze.pos.z - s.z;
    const bearing = wrap(Math.atan2(gx, gz) - s.yaw);
    s.twist = damp(s.twist, clamp(bearing * 0.32, -0.2, 0.2) * s.look * still, 3, dt);
    s.nod = damp(s.nod, clamp((0.45 - gaze.pos.y) * 0.1, -0.05, 0.08) * s.look, 3, dt);

    const swayX = (0.011 * Math.sin(t * 0.47) + 0.005 * Math.sin(t * 1.21 + 1.3)) * still;
    const swayZ = 0.006 * Math.sin(t * 0.63 + 0.4) * still;
    body.position.set(
      swayX,
      DIMS.height -
        0.07 * s.crouch -
        0.055 * s.sit +
        0.006 * s.gaitMix * Math.cos(2 * ph - SWING * Math.PI * 2) +
        0.0035 * Math.sin(t * 1.6) * still,
      swayZ - 0.05 * s.sit
    );
    body.rotation.set(
      0.1 * s.crouch - 0.25 * s.sit - clamp(0.035 * s.accel, -0.04, 0.04) + s.nod,
      s.twist,
      -clamp(0.09 * s.vf * s.w, -0.06, 0.06) +
        0.012 * s.gaitMix * Math.sin(ph - SWING * Math.PI) -
        swayX * 0.5 -
        s.twist * 0.25
    );
  }

  function solveLegs() {
    for (const f of feet) {
      v.copy(f.pos).applyMatrix4(inv).sub(f.leg.root.position);
      solveLeg(v.x, v.y, v.z, f.leg.side, DIMS.legOffset, DIMS.upper, DIMS.lower, sol);
      f.leg.root.rotation.z = sol.roll;
      f.leg.thigh.rotation.x = -sol.pitch;
      f.leg.knee.rotation.x = -sol.knee;
    }
  }

  // Arm targets ---------------------------------------------------------

  function pose(out, yaw, reach, up, pitch) {
    solveArm(reach, up, DIMS.arm1, DIMS.arm2, sol);
    out.yaw = yaw;
    out.sh = sol.shoulder;
    out.el = sol.elbow;
    out.wr = pitch - sol.shoulder - sol.elbow;
  }

  // "Neck" pose: the gripper camera acts as the head and points at the gaze
  // target, like Spot looking around with its arm unstowed.
  function aimGaze(out) {
    v.copy(gaze.pos).applyMatrix4(inv);
    const yaw = clamp(Math.atan2(v.x - SHOULDER.x, v.z - SHOULDER.z), -1.35, 1.35);
    const reach = 0.28;
    const up = 0.15 + armCtl.neck;
    const sy = Math.sin(yaw);
    const cy = Math.cos(yaw);
    const ahead = (v.x - SHOULDER.x - sy * reach) * sy + (v.z - SHOULDER.z - cy * reach) * cy;
    // Aim the palm camera, not the jaw, at the target.
    const pitch = clamp(Math.atan2(v.y - SHOULDER.y - up, Math.max(ahead, 0.1)) + EYE_TILT, -1.4, 0.8);
    pose(out, yaw, reach, up, pitch);
  }

  // Place the wrist at a world point with the gripper along a world direction.
  function aimWrist(out) {
    v.copy(armCtl.wrist).applyMatrix4(inv);
    const dx = v.x - SHOULDER.x;
    const dz = v.z - SHOULDER.z;
    const yaw = Math.atan2(dx, dz);
    w.copy(armCtl.dir).transformDirection(inv);
    const pitch = Math.atan2(w.y, w.x * Math.sin(yaw) + w.z * Math.cos(yaw));
    pose(out, yaw, Math.hypot(dx, dz), v.y - SHOULDER.y, pitch);
  }

  /** Joint targets for the current arm mode; returns the jaw opening. */
  function armTargets() {
    qt.roll = 0;
    if (armCtl.mode === 'stow') Object.assign(qt, STOW);
    else if (armCtl.mode === 'gaze') aimGaze(qt);
    else if (armCtl.mode === 'reach') aimWrist(qt);
    else if (armCtl.mode === 'carry') pose(qt, 0, 0.27, 0.1, -0.78);
    else {
      // Wave: arm up toward the gaze target, gripper swinging and snapping.
      const k = armCtl.clock;
      v.copy(gaze.pos).applyMatrix4(inv);
      const face = clamp(Math.atan2(v.x - SHOULDER.x, v.z - SHOULDER.z), -1.2, 1.2);
      pose(qt, face + 0.36 * Math.sin(k * 8.5), 0.13, 0.5, 0.45);
      qt.roll = 0.45 * Math.sin(k * 8.5 + 0.9);
      return 0.22 + 0.22 * Math.sin(k * 15);
    }
    return armCtl.grip;
  }

  function updateArm(dt) {
    const grip = armTargets();
    const rate = armCtl.rate;
    q.yaw = dampAngle(q.yaw, qt.yaw, rate, dt);
    for (const j of JOINTS) q[j] = damp(q[j], qt[j], rate, dt);
    q.grip = damp(q.grip, grip, 14, dt);

    arm.base.rotation.y = q.yaw;
    arm.shoulder.rotation.x = -q.sh;
    arm.elbow.rotation.x = -q.el;
    arm.wrist.rotation.x = -q.wr;

    if (armCtl.align) {
      // Roll the jaw so it closes across the toy's long axis.
      arm.wrist.updateWorldMatrix(true, false);
      quat.setFromRotationMatrix(arm.wrist.matrixWorld).invert();
      v.copy(armCtl.align).applyQuaternion(quat);
      qt.roll = wrap(Math.atan2(v.y, v.x) * 2) / 2;
    }
    q.roll = damp(q.roll, qt.roll, rate, dt);
    arm.roll.rotation.z = q.roll;
    for (const f of arm.fingers) f.group.rotation.x = -f.sign * q.grip;
  }

  function apply(dt) {
    root.position.set(s.x, 0, s.z);
    root.rotation.y = s.yaw;
    body.updateWorldMatrix(true, false);
    inv.copy(body.matrixWorld).invert();
    solveLegs();
    updateArm(dt);
  }

  // Navigation helpers: each sets velocity commands and reports arrival.

  /** Face a point and stop `stopAt` metres short of it. */
  function approachPoint(tx, tz, stopAt) {
    const dx = tx - s.x;
    const dz = tz - s.z;
    const err = wrap(Math.atan2(dx, dz) - s.yaw);
    const gap = Math.hypot(dx, dz) - stopAt;
    if (Math.abs(gap) < 0.03 && Math.abs(err) < 0.05) {
      stop();
      return true;
    }
    // Turn in place for large heading errors, otherwise steer while walking.
    s.cmdW = clamp(err * 3.2, -MAX_TURN, MAX_TURN);
    s.cmdF = Math.abs(err) < 0.8 ? clamp(gap * 1.8, -0.2, MAX_SPEED) * Math.cos(err) ** 2 : 0;
    s.cmdL = 0;
    return false;
  }

  /** Walk to a point, then finish omnidirectionally and turn to `yaw`. */
  function goToPose(tx, tz, yaw) {
    const dx = tx - s.x;
    const dz = tz - s.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 0.3) {
      approachPoint(tx, tz, 0);
      return false;
    }
    const err = wrap(yaw - s.yaw);
    if (dist < 0.03 && Math.abs(err) < 0.04) {
      stop();
      return true;
    }
    const c = Math.cos(s.yaw);
    const sn = Math.sin(s.yaw);
    s.cmdF = clamp((dx * sn + dz * c) * 1.6, -0.25, 0.25);
    s.cmdL = clamp((dx * c - dz * sn) * 1.6, -0.2, 0.2);
    s.cmdW = clamp(err * 3, -MAX_TURN, MAX_TURN);
    return false;
  }

  function stop() {
    s.cmdF = 0;
    s.cmdL = 0;
    s.cmdW = 0;
  }

  return {
    state: s,
    feet,
    gaze,
    arm: armCtl,
    approachPoint,
    goToPose,
    stop,
    settled: () => !s.walking && Math.abs(s.vf) + Math.abs(s.vl) + Math.abs(s.w) < 0.02,

    /** Snap to a pose with no transitions (used for the first frame). */
    reset(x, z, yaw, look) {
      Object.assign(s, { x, z, yaw, vf: 0, vl: 0, w: 0, time: 0, walking: false, gaitMix: 0 });
      stop();
      for (const f of feet) nominal(f.leg, x, z, yaw, f.pos);
      gaze.target.copy(look);
      gaze.pos.copy(look);
      gaze.vel.set(0, 0, 0);
      root.position.set(x, 0, z);
      root.rotation.y = yaw;
      // Converge the head-led posture so the poster and frame one agree.
      for (let i = 0; i < 60; i++) updateBody(0.1);
      body.updateWorldMatrix(true, false);
      inv.copy(body.matrixWorld).invert();
      const grip = armTargets();
      Object.assign(q, qt, { grip });
      apply(0);
    },

    update(dt) {
      s.time += dt;
      springTo(gaze.pos, gaze.vel, gaze.target, gaze.omega, dt);
      updateLocomotion(dt);
      updateGait(dt);
      updateBody(dt);
      apply(dt);
    },
  };
}
