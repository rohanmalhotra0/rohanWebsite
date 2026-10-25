import {
  ACESFilmicToneMapping,
  Box3,
  Matrix4,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  Plane,
  Ray,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from 'three';
import { buildRobot, createMaterials } from './model';
import { createController } from './robot';
import { createBrain, STATUS } from './brain';
import { boneGeometry, createToy, TOY_REST } from './toy';
import { createStage } from './stage';
import { createFeed } from './feed';
import { clamp, damp, smooth } from './math';

const HOME = { x: 0, z: 0, yaw: -0.62 };
const TARGET = new Vector3(0, 0.4, 0.02);
// Camera framing: a 3/4 view that "contains" the robot at a reference aspect,
// matching how the poster image is fitted with object-fit: contain.
export const VIEW = { az: 0.08, el: 0.32, dist: 3.85, fov: 27, aspect: 1 };
const BOUNDS = { minX: -1.7, maxX: 1.7, minZ: -1.25, maxZ: 1.4 };
// Where the gripper camera looks on frame one (and in the poster).
const FIRST_LOOK = new Vector3(-0.95, 0.1, 1.15);
const ROBOT_BOX = new Box3(new Vector3(-0.26, 0, -0.52), new Vector3(0.26, 0.9, 0.66));
const FEED_INTERVAL = 1 / 30;
const UP = new Vector3(0, 1, 0);

/**
 * Mounts the robot stage into `host`. Returns null when WebGL is unavailable.
 * In poster mode it renders one still frame and exposes `capture()`.
 */
export function createRobotScene({
  host,
  overlay = {},
  palette,
  mobile = false,
  poster = false,
  onReady,
  onStatus,
  onAnnounce,
  onInteract,
  onLost,
}) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;outline:none';
  let renderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: poster,
    });
  } catch {
    return null;
  }
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(canvas);

  const scene = new Scene();
  const materials = createMaterials();
  const rig = buildRobot(materials);
  scene.add(rig.root);
  const ctl = createController(rig);
  const stage = createStage(renderer, scene, { mobile, home: HOME });

  const toyMaterial = new MeshStandardMaterial({ roughness: 0.5 });
  const toyGeometry = boneGeometry();
  const toys = [createToy(toyGeometry, toyMaterial), createToy(toyGeometry, toyMaterial)];
  for (const t of toys) scene.add(t.mesh);

  const camera = new PerspectiveCamera(VIEW.fov, 1, 0.1, 40);
  // Layer 1 holds the gripper and a held toy: drawn in the main view and in
  // shadows, but invisible to the robot's own palm camera.
  camera.layers.enable(1);
  const feed = poster ? null : createFeed(renderer);
  if (feed) rig.arm.eye.add(feed.camera);

  let status = 'idle';
  const brain = createBrain({
    ctl,
    rig,
    toys,
    scene,
    home: HOME,
    viewer: () => camera.position,
    onChange(next, message) {
      status = STATUS[next];
      onStatus?.(status);
      if (message) onAnnounce?.(message);
    },
  });

  // Camera rig ------------------------------------------------------------

  const orbit = { az: 0, el: 0, goalAz: 0, goalEl: 0, px: 0, py: 0, goalPx: 0, goalPy: 0 };

  function placeCamera() {
    const az = VIEW.az + orbit.az + orbit.px * 0.045;
    const el = VIEW.el + orbit.el + orbit.py * 0.02;
    camera.position.set(
      TARGET.x + VIEW.dist * Math.sin(az) * Math.cos(el),
      TARGET.y + VIEW.dist * Math.sin(el),
      TARGET.z + VIEW.dist * Math.cos(az) * Math.cos(el)
    );
    camera.lookAt(TARGET);
    camera.updateMatrixWorld();
  }

  let width = 0;
  let height = 0;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);

  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    width = w;
    height = h;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    camera.fov =
      aspect >= VIEW.aspect
        ? VIEW.fov
        : (Math.atan(Math.tan((VIEW.fov * Math.PI) / 360) * (VIEW.aspect / aspect)) * 360) / Math.PI;
    camera.updateProjectionMatrix();
    if (feed && overlay.frame) {
      const f = overlay.frame.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      feed.setRect(f.left - c.left, f.top - c.top, f.width, f.height, pixelRatio);
    }
    if (ready && !running) frame(0);
  }

  // Floor targets ----------------------------------------------------------

  const ndc = new Vector2();
  const raycaster = new Raycaster();
  const floorPlane = new Plane(UP, 0);
  const wallNormal = new Vector3(Math.sin(VIEW.az), 0, Math.cos(VIEW.az));
  const wallPlane = new Plane(wallNormal, -wallNormal.dot(TARGET));
  const hit = new Vector3();
  const look = new Vector3();
  const probe = new Vector3();
  const homeVec = new Vector3(HOME.x, 0, HOME.z);
  const localRay = new Ray();
  const inverse = new Matrix4();
  const hover = new Vector4();
  const hoverGoal = new Vector3();
  let hoverAlpha = 0;

  const inBounds = (p) => p.x > BOUNDS.minX && p.x < BOUNDS.maxX && p.z > BOUNDS.minZ && p.z < BOUNDS.maxZ;

  function onScreen(p) {
    probe.copy(p).project(camera);
    return Math.abs(probe.x) < 0.86 && probe.y > -0.82 && probe.y < 0.78;
  }

  function hitsRobot(ray) {
    inverse.copy(rig.root.matrixWorld).invert();
    return localRay.copy(ray).applyMatrix4(inverse).intersectsBox(ROBOT_BOX);
  }

  /** Keep a throw on the visible floor and off the robot's footprint. */
  function clampTarget(p) {
    p.set(clamp(p.x, BOUNDS.minX + 0.12, BOUNDS.maxX - 0.12), 0, clamp(p.z, BOUNDS.minZ + 0.12, BOUNDS.maxZ - 0.12));
    const s = ctl.state;
    const c = Math.cos(s.yaw);
    const sn = Math.sin(s.yaw);
    const dx = p.x - s.x;
    const dz = p.z - s.z;
    let lx = dx * c - dz * sn;
    let lz = dx * sn + dz * c;
    if (Math.abs(lx) < 0.38 && Math.abs(lz) < 0.72) {
      if (0.38 - Math.abs(lx) < 0.72 - Math.abs(lz)) lx = Math.sign(lx || 1) * 0.38;
      else lz = Math.sign(lz || 1) * 0.72;
      p.set(s.x + lx * c + lz * sn, 0, s.z - lx * sn + lz * c);
    }
    for (let i = 0; i < 14 && !onScreen(p); i++) p.lerp(homeVec, 0.15);
    return p;
  }

  function throwTo(p) {
    brain.throwTo(clampTarget(p));
    onInteract?.();
    if (!running) frame(0);
  }

  function throwRandom() {
    const s = ctl.state;
    const p = new Vector3();
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.7 + Math.random() * 0.8;
      p.set(HOME.x + Math.sin(a) * r * 1.3, 0, HOME.z + Math.cos(a) * r);
      if (inBounds(p) && onScreen(p) && Math.hypot(p.x - s.x, p.z - s.z) > 0.85) break;
    }
    throwTo(p);
  }

  // Input ------------------------------------------------------------------

  const input = { x: 0, y: 0, mouse: false, moved: 0, down: null, dragging: false };

  function setNdc(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;
    input.down = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), type: e.pointerType, az: orbit.goalAz, el: orbit.goalEl };
    if (e.pointerType === 'mouse') canvas.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    input.x = e.clientX;
    input.y = e.clientY;
    input.mouse = e.pointerType === 'mouse';
    input.moved = performance.now();
    const d = input.down;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    // Touch only orbits on horizontal drags; vertical drags scroll the page.
    if (!input.dragging && (Math.abs(dx) > 8 || (d.type === 'mouse' && Math.abs(dy) > 8))) {
      input.dragging = true;
      canvas.style.cursor = 'grabbing';
    }
    if (input.dragging) {
      orbit.goalAz = clamp(d.az - dx * 0.005, -0.75, 0.75);
      if (d.type === 'mouse') orbit.goalEl = clamp(d.el + dy * 0.003, -0.2, 0.28);
    }
  }

  function onPointerUp(e) {
    const d = input.down;
    if (!d || d.id !== e.pointerId) return;
    if (!input.dragging && performance.now() - d.t < 600) {
      setNdc(e.clientX, e.clientY);
      if (hitsRobot(raycaster.ray)) brain.poke();
      else if (raycaster.ray.intersectPlane(floorPlane, hit)) throwTo(hit.clone());
    }
    input.down = null;
    input.dragging = false;
    canvas.style.cursor = '';
  }

  function onPointerCancel() {
    input.down = null;
    input.dragging = false;
  }

  function onPointerLeave() {
    input.mouse = false;
  }

  /** Pointer-driven gaze, parallax and the floor reticle (once per frame). */
  function updatePointer(dt) {
    const active = input.mouse && performance.now() - input.moved < 6000;
    orbit.goalPx = active ? clamp((input.x / window.innerWidth) * 2 - 1, -1, 1) : 0;
    orbit.goalPy = active ? clamp((input.y / window.innerHeight) * 2 - 1, -1, 1) : 0;
    orbit.px = damp(orbit.px, orbit.goalPx, 2.5, dt);
    orbit.py = damp(orbit.py, orbit.goalPy, 2.5, dt);
    orbit.az = damp(orbit.az, orbit.goalAz, 7, dt);
    orbit.el = damp(orbit.el, orbit.goalEl, 7, dt);

    let floorHover = false;
    if (active) {
      setNdc(input.x, input.y);
      const ray = raycaster.ray;
      if (ray.intersectPlane(floorPlane, hit) && hit.distanceTo(homeVec) < 3.2) look.copy(hit).setY(0.04);
      else if (ray.intersectPlane(wallPlane, hit)) look.copy(hit).setY(clamp(hit.y, 0.05, 1.5));
      else look.copy(camera.position);
      brain.setPointer(look);

      const inside = Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1;
      if (inside && !input.dragging) {
        const overRobot = hitsRobot(ray);
        floorHover = !overRobot && ray.intersectPlane(floorPlane, hit) !== null && inBounds(hit) && onScreen(hit);
        if (floorHover) hoverGoal.copy(hit);
        canvas.style.cursor = overRobot || floorHover ? 'pointer' : '';
      }
    } else {
      brain.setPointer(null);
    }
    hoverAlpha = damp(hoverAlpha, floorHover ? 0.85 : 0, 10, dt);
    hover.set(hoverGoal.x, hoverGoal.z, hoverAlpha, 0);
  }

  // Frame ------------------------------------------------------------------

  const detection = { x: 0, y: 0, w: 0, h: 0 };
  const toyWorld = new Vector3();
  let feedClock = FEED_INTERVAL;
  let feedFrames = 0;
  let fpsClock = 0;
  let fps = 30;
  let confClock = 0;
  let hudText = '';
  let boxShown = false;

  function step(dt) {
    if (!poster) updatePointer(dt);
    brain.update(dt);
    ctl.update(dt);
    for (const t of toys) t.update(dt, BOUNDS);
    placeCamera();

    const toy = brain.toy;
    let strength = 0;
    if (toy?.mesh.visible) {
      toy.mesh.getWorldPosition(toyWorld);
      strength = (1 - smooth((toyWorld.y - TOY_REST) / 0.7)) * 0.9 * (toy.state === 'fading' ? toy.fade : 1);
    }
    stage.update(ctl, toyWorld, strength, hover);
    scene.updateMatrixWorld();
  }

  function updateOverlay(dt) {
    const { box, label, hud } = overlay;
    const toy = brain.toy;
    const found = toy && toy.state !== 'held' ? feed.detect(toy.mesh, detection) : null;
    if (box) {
      if (found) {
        box.style.transform = `translate3d(${found.x.toFixed(1)}px, ${found.y.toFixed(1)}px, 0)`;
        box.style.width = `${found.w.toFixed(1)}px`;
        box.style.height = `${found.h.toFixed(1)}px`;
      }
      if (Boolean(found) !== boxShown) {
        boxShown = Boolean(found);
        box.style.opacity = boxShown ? '1' : '0';
      }
    }
    confClock -= dt;
    if (label && found && confClock <= 0) {
      confClock = 0.3;
      label.textContent = `toy ${(0.95 + Math.random() * 0.04).toFixed(2)}`;
    }
    const text = `cam0 · ${fps} fps · ${status}`;
    if (hud && text !== hudText) {
      hudText = text;
      hud.textContent = text;
    }
  }

  function draw(dt) {
    renderer.shadowMap.needsUpdate = true;
    if (feed) {
      feedClock += dt;
      fpsClock += dt;
      if (feedClock >= FEED_INTERVAL) {
        feedClock %= FEED_INTERVAL;
        feedFrames++;
        stage.setView(width, height, false);
        feed.capture(scene, width, height);
        updateOverlay(FEED_INTERVAL);
      }
      if (fpsClock >= 1) {
        fps = Math.min(30, Math.round(feedFrames / fpsClock));
        feedFrames = 0;
        fpsClock = 0;
      }
    }
    stage.setView(width * pixelRatio, height * pixelRatio, true);
    renderer.render(scene, camera);
    feed?.draw(width, height);
  }

  // Loop, visibility and adaptive resolution --------------------------------

  let raf = 0;
  let last = 0;
  let ready = false;
  let running = false;
  let visible = true;
  let lost = false;
  let disposed = false;
  let first = true;
  const perf = { time: 0, frames: 0, age: 0 };

  function frame(dt) {
    step(dt);
    draw(dt);
    if (first) {
      first = false;
      onReady?.();
    }
  }

  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 0;
    last = now;
    frame(dt);
    // Drop resolution a step at a time if frames are consistently slow.
    perf.time += dt;
    perf.frames++;
    perf.age += dt;
    if (perf.time > 2) {
      if (perf.age > 3 && perf.time / perf.frames > 1 / 40 && pixelRatio > 1) {
        pixelRatio = Math.max(1, pixelRatio - 0.25);
        resize();
      }
      perf.time = 0;
      perf.frames = 0;
    }
  }

  function sync() {
    const should = ready && visible && !document.hidden && !lost && !disposed;
    if (should && !running) {
      running = true;
      last = 0;
      raf = requestAnimationFrame(tick);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }

  function applyPalette(p) {
    stage.setPalette(p);
    feed?.setPalette(p);
    toyMaterial.color.set(p.accent);
  }

  // Setup -------------------------------------------------------------------

  ctl.reset(HOME.x, HOME.z, HOME.yaw, FIRST_LOOK);
  applyPalette(palette);
  resize();
  placeCamera();
  scene.updateMatrixWorld();

  if (poster) {
    frame(0);
    return {
      canvas,
      capture: (type = 'image/webp', quality = 0.9) => canvas.toDataURL(type, quality),
      dispose() {
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      },
    };
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersection = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      sync();
    },
    { rootMargin: '120px' }
  );
  intersection.observe(host);

  function onContextLost(e) {
    e.preventDefault();
    lost = true;
    sync();
    onLost?.();
  }

  function onContextRestored() {
    // three re-creates GPU resources lazily; only the baked environment
    // (a render target) has to be rendered again.
    stage.bake();
    lost = false;
    first = true;
    sync();
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerCancel);
  document.documentElement.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('visibilitychange', sync);

  // Compile shaders off the main thread where the browser supports it;
  // otherwise the first frame compiles them (the poster covers that).
  const warm = renderer.extensions.has('KHR_parallel_shader_compile')
    ? renderer.compileAsync(scene, camera)
    : Promise.resolve();
  warm
    .catch(() => {})
    .then(() => {
      if (disposed) return;
      ready = true;
      sync();
      if (!running) frame(0);
    });

  const api = {
    canvas,
    throwRandom,

    setPalette(p) {
      palette = p;
      applyPalette(p);
      if (ready && !lost) frame(0);
    },

    dispose() {
      disposed = true;
      sync();
      resizeObserver.disconnect();
      intersection.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', sync);
      scene.traverse((o) => o.geometry?.dispose());
      for (const m of Object.values(materials)) m.dispose();
      toyMaterial.dispose();
      stage.dispose();
      feed?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };

  // Test hook for the Playwright checks; stripped from production builds.
  if (import.meta.env.DEV) canvas.robot = { ctl, brain, toys, camera, orbit, feed, throwTo };

  return api;
}
