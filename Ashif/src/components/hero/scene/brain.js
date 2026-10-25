import { Vector3 } from 'three';
import { DIMS } from './model';
import { TOY_REST, toyAxis } from './toy';
import { damp, easeInOut, random } from './math';

/** Body centre to toy when grasping: the arm reaches just past the face. */
const REACH = 0.57;
const DOWN = new Vector3(0, -1, 0);

/** Word shown in the camera HUD for each state. */
export const STATUS = {
  idle: 'idle',
  track: 'detected',
  approach: 'fetching',
  reach: 'grasping',
  lift: 'grasping',
  return: 'returning',
  present: 'returning',
  trick: 'waving',
};

const MESSAGES = {
  track: 'Toy thrown. The robot spotted it and is going to fetch it.',
  lift: 'The robot picked up the toy.',
  drop: 'The robot brought the toy back.',
  trick: 'The robot waved.',
};

/**
 * Fetch behaviour as a small state machine on top of the controller:
 * idle → track (toy in the air) → approach → reach → lift → return →
 * present → idle, plus a wave trick. New throws retarget at any point.
 */
export function createBrain({ ctl, rig, toys, scene, home, viewer, onChange }) {
  const s = ctl.state;
  const arm = ctl.arm;
  const gaze = ctl.gaze;
  const rand = random(11);
  const start = new Vector3();
  const startDir = new Vector3();
  const grasp = new Vector3();
  const goal = new Vector3();
  const dir = new Vector3();
  const axis = new Vector3();
  const hand = new Vector3();
  const handVel = new Vector3();
  const pointer = { on: false, at: new Vector3() };

  let state = 'idle';
  let time = 0;
  let toy = null;
  let holding = false;
  let wanderIn = 2.4;

  function go(next, message) {
    state = next;
    time = 0;
    onChange(next, message);
  }

  function rememberHand() {
    rig.arm.wrist.getWorldPosition(start);
    rig.arm.wrist.getWorldDirection(startDir);
  }

  function letGo() {
    if (!holding) return;
    scene.attach(toy.mesh);
    toy.mesh.layers.set(0);
    toy.spin.set(rand() - 0.5, 0, rand() - 0.5).multiplyScalar(4);
    toy.release(handVel);
    holding = false;
  }

  function wander() {
    const r = rand();
    if (toy?.onFloor && r < 0.35) gaze.target.copy(toy.mesh.position);
    else if (r < 0.6) gaze.target.copy(viewer());
    else {
      const a = s.yaw + (rand() - 0.5) * 2.2;
      const d = 0.9 + rand() * 1.4;
      gaze.target.set(s.x + Math.sin(a) * d, 0.04, s.z + Math.cos(a) * d);
    }
  }

  function update(dt) {
    time += dt;
    rig.arm.grasp.getWorldPosition(dir);
    if (dt > 0) handVel.subVectors(dir, hand).divideScalar(dt);
    hand.copy(dir);

    let crouch = 0;
    let sit = 0;
    arm.mode = 'gaze';
    arm.rate = 7;
    arm.neck = 0;
    arm.align = null;
    arm.grip = -0.05;
    gaze.omega = 9;
    s.look = 0;

    switch (state) {
      case 'idle':
        s.look = 1;
        arm.mode = 'stow';
        if (pointer.on) {
          gaze.target.copy(pointer.at);
          gaze.omega = 6;
        } else {
          gaze.omega = 4.5;
          wanderIn -= dt;
          if (wanderIn <= 0) {
            wander();
            wanderIn = 1.6 + rand() * 2.4;
          }
        }
        // Drift back onto the home mark after a fetch.
        if (time > 1.2) ctl.goToPose(home.x, home.z, home.yaw);
        else ctl.stop();
        break;

      case 'track':
        s.look = 0.6;
        gaze.target.copy(toy.mesh.position);
        gaze.omega = 11;
        ctl.stop();
        if (toy.landed && time > 0.3) go('approach');
        break;

      case 'approach': {
        s.look = 0.3;
        arm.neck = -0.04;
        gaze.target.copy(toy.mesh.position);
        const p = toy.mesh.position;
        if (ctl.approachPoint(p.x, p.z, REACH) && ctl.settled() && toy.state === 'resting') {
          rememberHand();
          go('reach');
        }
        break;
      }

      case 'reach': {
        // Crouch, bring the open jaw over the bone, descend, close.
        crouch = 1;
        ctl.stop();
        const p = toy.mesh.position;
        grasp.set(p.x, p.y + DIMS.grasp, p.z);
        arm.mode = 'reach';
        arm.rate = 18;
        arm.align = toyAxis(toy, axis);
        if (time < 0.7) {
          const k = easeInOut(time / 0.7);
          goal.copy(grasp).setY(grasp.y + 0.11);
          arm.wrist.lerpVectors(start, goal, k);
          arm.dir.lerpVectors(startDir, DOWN, k).normalize();
        } else {
          arm.wrist.copy(grasp).setY(grasp.y + 0.11 * (1 - easeInOut((time - 0.7) / 0.4)));
          arm.dir.copy(DOWN);
        }
        arm.grip = time < 0.25 ? -0.05 : time < 1.12 ? 0.6 : 0;
        gaze.target.copy(p);
        if (time > 1.36) {
          rig.arm.grasp.attach(toy.mesh);
          toy.mesh.layers.set(1);
          toy.state = 'held';
          holding = true;
          go('lift', MESSAGES.lift);
        }
        break;
      }

      case 'lift':
        ctl.stop();
        arm.mode = 'carry';
        arm.rate = 5.5;
        arm.grip = 0;
        if (time > 0.75) go('return');
        break;

      case 'return': {
        arm.mode = 'carry';
        arm.rate = 6;
        arm.grip = 0;
        const v = viewer();
        const face = Math.atan2(v.x - home.x, v.z - home.z);
        if (ctl.goToPose(home.x, home.z, face) && ctl.settled()) {
          rememberHand();
          go('present');
        }
        break;
      }

      case 'present': {
        // Hold the bone out toward the viewer, then drop it.
        ctl.stop();
        const fx = Math.sin(s.yaw);
        const fz = Math.cos(s.yaw);
        goal.set(s.x + fx * 0.66, 0.62, s.z + fz * 0.66);
        dir.set(fx * 0.94, -0.34, fz * 0.94);
        if (time < 1.45) {
          const k = easeInOut(time / 0.8);
          arm.mode = 'reach';
          arm.rate = 14;
          arm.wrist.lerpVectors(start, goal, k);
          arm.dir.lerpVectors(startDir, dir, k).normalize();
          arm.grip = time < 1.3 ? 0 : 0.5;
        } else {
          gaze.target.copy(toy.mesh.position);
          arm.rate = 6;
        }
        if (holding && time > 1.3) {
          letGo();
          onChange(state, MESSAGES.drop);
        }
        if (time > 2.9) go('idle');
        break;
      }

      case 'trick':
        ctl.stop();
        s.look = 0.4;
        arm.mode = 'stow';
        sit = time < 2.35 ? 1 : 0;
        gaze.target.copy(viewer());
        gaze.omega = 6;
        if (time > 0.3 && time < 2.4) {
          arm.mode = 'wave';
          arm.rate = 9;
          arm.clock = time;
        }
        if (time > 3) go('idle');
        break;
    }

    s.crouch = damp(s.crouch, crouch, 5, dt);
    s.sit = damp(s.sit, sit, 4.5, dt);
  }

  return {
    update,
    get state() {
      return state;
    },
    get toy() {
      return toy;
    },

    setPointer(point) {
      pointer.on = Boolean(point);
      if (point) pointer.at.copy(point);
    },

    /** Lob a toy from the viewer's side onto `point` (on the floor). */
    throwTo(point) {
      if (toy) {
        letGo();
        toy.fadeOut();
      }
      toy = toy === toys[0] ? toys[1] : toys[0];
      // Lob it from the viewer's side, landing a little short so the bounce
      // carries it onto the spot that was clicked.
      const v = viewer();
      const len = Math.hypot(v.x - point.x, v.z - point.z) || 1;
      const ux = (v.x - point.x) / len;
      const uz = (v.z - point.z) / len;
      start.set(point.x + ux * 1.2, 1.25, point.z + uz * 1.2);
      goal.set(point.x + ux * 0.22, TOY_REST, point.z + uz * 0.22);
      toy.throwTo(start, goal, 0.72);
      go('track', MESSAGES.track);
    },

    /** Clicked the robot: wave, when it's not busy. */
    poke() {
      if (state === 'idle') go('trick', MESSAGES.trick);
    },
  };
}
