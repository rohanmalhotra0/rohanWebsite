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
import { approach, clamp, damp, smooth } from './math';
import { readPalette } from '../palette';

const HOME = { x: 0, z: 0, yaw: -0.62 };
const TARGET = new Vector3(0, 0.24, 0.02);
// Camera framing: a 3/4 view of a square reference frame (the poster). Wide
// stages crop its top and bottom by up to `crop`, narrow ones fit its width;
// the poster is sized in CSS with the same rule (see RobotStage).
export const VIEW = { az: 0.08, el: 0.32, dist: 3.85, fov: 27, crop: 0.72 };
const BOUNDS = { minX: -1.7, maxX: 1.7, minZ: -1.25, maxZ: 1.4 };
// Where the gripper camera looks on frame one (and in the poster).
const FIRST_LOOK = new Vector3(-0.95, 0.1, 1.15);
const ROBOT_BOX = new Box3(new Vector3(-0.26, 0, -0.52), new Vector3(0.26, 0.9, 0.66));
const UP = new Vector3(0, 1, 0);

// Quality steps for slower GPUs: render scale, shadow map size, camera rate.
// None of them recompile shaders.
const QUALITY = [
  { ratio: 1, min: 1, shadow: 2048, feed: 1 / 30 },
  { ratio: 0.75, min: 1, shadow: 1024, feed: 1 / 20 },
  { ratio: 0.5, min: 0.75, shadow: 512, feed: 1 / 12 },
];

// The camera inset shows only while there is something to watch: from a
// throw until a moment after the toy is back on the floor.
const WATCH = new Set(['track', 'approach', 'reach', 'lift', 'return', 'present']);
const LINGER = 2.2;
const FEED_FADE = 0.3; // seconds; matches the frame's CSS opacity transition

const yieldToPage = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mounts the robot stage into `host` and boots it in small steps so the page
 * stays responsive. Returns null when a WebGL 2 renderer can't be created.
 *
 * `overlay` holds React refs to the DOM over the canvas (camera inset frame,
 * detection box, HUD line, controls); the scene sets the frame's opacity.
 * Slow frames step quality down; a second or so of frames over 100 ms stops
 * the loop and calls `onSlow` (unless `forced`). In poster mode it renders
 * one still frame and exposes `capture()`.
 */
export function createRobotScene({
  host,
  overlay = {},
  palette: initialPalette,
  mobile = false,
  poster = false,
  forced = false,
  onReady,
  onAnnounce,
  onInteract,
  onLost,
  onSlow,
}) {
  const el = (key) => overlay[key]?.current;
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
  const camera = new PerspectiveCamera(VIEW.fov, 1, 0.1, 40);
  // Layer 1 holds the gripper and a held toy: drawn in the main view and in
  // shadows, but invisible to the robot's own palm camera.
  camera.layers.enable(1);
  const materials = createMaterials();
  const toyMaterial = new MeshStandardMaterial({ roughness: 0.5 });
  const toyGeometry = boneGeometry();
  const toys = [createToy(toyGeometry, toyMaterial), createToy(toyGeometry, toyMaterial)];
  for (const t of toys) scene.add(t.mesh);
  const feed = poster ? null : createFeed(renderer);

  // Built during boot.
  let rig = null;
  let ctl = null;
  let brain = null;
  let stage = null;

  let palette = initialPalette;
  let status = 'idle';
  let ready = false;
  let running = false;
  let visible = true;
  let lost = false;
  let disposed = false;
  let first = true;
  let manual = false;
  let gaveUp = false;
  let lastEvent = 0;
  let raf = 0;
  let last = 0;

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

  // Auto-framing: `zoom` is the fraction of the reference frame's height in
  // view. It sits at the stage's default and widens just enough to keep the
  // raised arm and the body's ends inside the frame, then eases back.
  const TAN = Math.tan((VIEW.fov * Math.PI) / 360);
  const corner = new Vector3();
  let baseZoom = 1;
  let zoom = 1;

  function frameRobot(dt) {
    let need = baseZoom;
    const s = ctl.state;
    const fit = (p, pad) => {
      p.applyMatrix4(camera.matrixWorldInverse);
      if (p.z > -0.1) return;
      need = Math.max(
        need,
        (p.y / -p.z / TAN + pad) / 0.88,
        (Math.abs(p.x / -p.z) / TAN + pad) / (0.94 * camera.aspect)
      );
    };
    for (const o of [rig.arm.elbow, rig.arm.wrist, rig.arm.grasp]) fit(o.getWorldPosition(corner), 0.06);
    for (const end of [0.5, -0.5]) {
      fit(corner.set(s.x + Math.sin(s.yaw) * end, 0.5, s.z + Math.cos(s.yaw) * end), 0.04);
    }
    zoom = dt > 0 ? damp(zoom, need, need > zoom ? 5 : 1.2, dt) : need;
    camera.fov = (Math.atan(TAN * zoom) * 360) / Math.PI;
    camera.updateProjectionMatrix();
  }

  const baseRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
  let quality = 0;
  let pixelRatio = baseRatio;
  let feedInterval = QUALITY[0].feed;
  let width = 0;
  let height = 0;

  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    width = w;
    height = h;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    baseZoom = Math.max(1 / camera.aspect, VIEW.crop);
    if (ctl) frameRobot(0);
    else {
      zoom = baseZoom;
      camera.fov = (Math.atan(TAN * zoom) * 360) / Math.PI;
      camera.updateProjectionMatrix();
    }
    const inset = el('frame');
    if (feed && inset) {
      const f = inset.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      feed.setRect(f.left - c.left, f.top - c.top, f.width, f.height, pixelRatio);
    }
    if (ready && !running && !lost) frame(0);
  }

  function setQuality(level) {
    quality = level;
    const q = QUALITY[level];
    pixelRatio = Math.max(q.min, baseRatio * q.ratio);
    feedInterval = q.feed;
    stage.setShadowSize(Math.min(q.shadow, mobile ? 1024 : 2048));
    resize();
  }

  // Floor targets ----------------------------------------------------------

  const ndc = new Vector2();
  const raycaster = new Raycaster();
  raycaster.layers.enable(1);
  const floorPlane = new Plane(UP, 0);
  // Idle gaze: pointer rays meet a camera-facing plane in front of the robot,
  // so screen left/right/up/down map to the robot looking that way at you.
  const wallNormal = new Vector3(Math.sin(VIEW.az), 0, Math.cos(VIEW.az));
  const wallPlane = new Plane(wallNormal, -wallNormal.dot(TARGET) - 1.3);
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

  // A throw target must keep the robot readable: not too close to the
  // camera, inside the canvas margins, above the overlays and (on desktop)
  // clear of the name.
  function onScreen(p) {
    if (p.z > HOME.z + 0.95) return false;
    probe.copy(p).project(camera);
    const x = (probe.x * 0.5 + 0.5) * width;
    const y = (0.5 - probe.y * 0.5) * height;
    const left = window.innerWidth >= 1024 ? 0.24 : 0.08;
    if (x < width * left || x > width * 0.92 || y < height * 0.14 || y > height * 0.76) return false;
    const c = canvas.getBoundingClientRect();
    for (const key of ['frame', 'controls']) {
      const r = el(key)?.getBoundingClientRect();
      if (r?.width && x > r.left - c.left - 48 && x < r.right - c.left + 48 && y > r.top - c.top - 56 && y < r.bottom - c.top + 48) {
        return false;
      }
    }
    return true;
  }

  // Cheap box test for the hover cursor; clicks confirm against the meshes.
  function nearRobot(ray) {
    inverse.copy(rig.root.matrixWorld).invert();
    return localRay.copy(ray).applyMatrix4(inverse).intersectsBox(ROBOT_BOX);
  }

  const hitsRobot = () => nearRobot(raycaster.ray) && raycaster.intersectObject(rig.root, true).length > 0;

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
    if (!ready) return;
    brain.throwTo(clampTarget(p));
    onInteract?.();
    if (!running && !lost) frame(0);
  }

  function throwRandom() {
    if (!ready) return;
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

  const input = { x: 0, y: 0, mouse: false, moved: 0, down: null, dragging: false, released: 0 };

  function setNdc(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;
    input.down = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      type: e.pointerType,
      az: orbit.goalAz,
      el: orbit.goalEl,
    };
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
      if (hitsRobot()) {
        brain.poke();
        if (!running && !lost) frame(0);
      } else if (raycaster.ray.intersectPlane(floorPlane, hit)) {
        throwTo(hit.clone());
      }
    }
    if (input.dragging) input.released = performance.now();
    input.down = null;
    input.dragging = false;
    canvas.style.cursor = '';
  }

  function onPointerCancel() {
    if (input.dragging) input.released = performance.now();
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
    // A few seconds after a drag, drift back to the composed view.
    if (!input.dragging && input.released && performance.now() - input.released > 5000) {
      orbit.goalAz = damp(orbit.goalAz, 0, 0.8, dt);
      orbit.goalEl = damp(orbit.goalEl, 0, 0.8, dt);
    }
    orbit.px = damp(orbit.px, orbit.goalPx, 2.5, dt);
    orbit.py = damp(orbit.py, orbit.goalPy, 2.5, dt);
    orbit.az = damp(orbit.az, orbit.goalAz, 7, dt);
    orbit.el = damp(orbit.el, orbit.goalEl, 7, dt);

    let floorHover = false;
    if (active) {
      setNdc(input.x, input.y);
      const ray = raycaster.ray;
      // Floor points count only if they are not behind the robot.
      const s = ctl.state;
      const floorHit = ray.intersectPlane(floorPlane, hit) !== null;
      if (floorHit && hit.distanceTo(homeVec) < 2.6 && (hit.x - s.x) * wallNormal.x + (hit.z - s.z) * wallNormal.z > -0.2) {
        look.copy(hit).setY(0.04);
      } else if (ray.intersectPlane(wallPlane, hit)) look.copy(hit).setY(clamp(hit.y, 0.05, 1.6));
      else look.copy(camera.position);
      brain.setPointer(look);

      const inside = Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1;
      if (inside && !input.dragging) {
        const overRobot = nearRobot(ray);
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
  let feedClock = Infinity;
  let hudText = '';
  let boxShown = false;
  let clock = 0;
  let watchUntil = -1;
  let feedFade = 0;
  let feedShown = false;

  /** Fade the inset in for a fetch and out a moment after (WebGL quad and DOM frame together). */
  function updateInset(dt) {
    clock += dt;
    if (WATCH.has(brain.state)) watchUntil = clock + LINGER;
    const want = Boolean(feed?.rect.w) && clock < watchUntil;
    feedFade = approach(feedFade, want ? 1 : 0, dt / FEED_FADE);
    if (want === feedShown) return;
    feedShown = want;
    if (want) feedClock = Infinity;
    const frameEl = el('frame');
    if (frameEl) frameEl.style.opacity = want ? '1' : '0';
  }

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
    frameRobot(dt);
    if (feed) updateInset(dt);
  }

  // The "detection" is the toy's real projected bounds in the robot camera;
  // there is no model here, so the inset says so and shows no score.
  function updateOverlay() {
    const box = el('box');
    const hud = el('hud');
    const toy = brain.toy;
    let found = toy && toy.state !== 'held' ? feed.detect(toy.mesh, detection) : null;
    // At point-blank range the box would fill the inset; a detector loses it.
    if (found && found.w * found.h > feed.rect.w * feed.rect.h * 0.65) found = null;
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
    const text = `cam0 · simulated · ${status}`;
    if (hud && text !== hudText) {
      hudText = text;
      hud.textContent = text;
    }
  }

  function draw(dt) {
    renderer.shadowMap.needsUpdate = true;
    const inset = feed && feedFade > 0;
    if (inset) {
      feedClock += dt;
      if (feedClock >= feedInterval) {
        feedClock = feedClock === Infinity ? 0 : feedClock % feedInterval;
        stage.setView(width, height, false);
        feed.capture(scene);
        updateOverlay();
      }
    }
    stage.setView(width * pixelRatio, height * pixelRatio, true);
    renderer.render(scene, camera);
    if (inset) feed.draw(width, height, feedFade);
  }

  function frame(dt) {
    step(dt);
    draw(dt);
    if (first) {
      first = false;
      onReady?.();
    }
  }

  // Loop, visibility and adaptive quality ----------------------------------

  const perf = { skip: 3, samples: [], slow: 0, slowMs: 0 };

  // Frames over 100 ms several times in a row (about a second of real jank,
  // where one long task elsewhere counts once) mean no usable GPU: stop now
  // and hand back to the poster + "Run demo". Otherwise the median of 30
  // frames steps quality down above a ~30 fps budget.
  function measure(ms) {
    if (perf.skip > 0) {
      perf.skip--;
      return;
    }
    if (ms > 100) {
      perf.slow += 1;
      perf.slowMs += Math.min(ms, 400);
      if (!forced && perf.slow >= 4 && perf.slowMs >= 1000) {
        gaveUp = true;
        sync();
        onSlow?.();
        return;
      }
    } else {
      perf.slow = 0;
      perf.slowMs = 0;
    }
    perf.samples.push(ms);
    if (perf.samples.length < 30) return;
    perf.samples.sort((a, b) => a - b);
    const median = perf.samples[15];
    perf.samples.length = 0;
    perf.skip = 6;
    if (median > 34 && quality < QUALITY.length - 1) setQuality(quality + 1);
  }

  function tick(now) {
    raf = requestAnimationFrame(tick);
    // Nothing happening: 30 fps is plenty for breathing and sway.
    const calm =
      brain.state === 'idle' && hoverAlpha < 0.01 && now - Math.max(input.moved, lastEvent) > 4000;
    if (calm && last && now - last < 30) return;
    const ms = last ? now - last : 0;
    last = now;
    frame(Math.min(ms / 1000, 1 / 20));
    // Calm frames are spaced out on purpose; only count them when slow.
    if (ms) measure(calm && ms < 50 ? 16 : ms);
  }

  function sync() {
    const should =
      ready &&
      visible &&
      !document.hidden &&
      !lost &&
      !disposed &&
      !gaveUp &&
      !(import.meta.env.DEV && manual);
    if (should && !running) {
      running = true;
      last = 0;
      perf.skip = Math.max(perf.skip, 3);
      raf = requestAnimationFrame(tick);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }

  function applyPalette(p) {
    stage?.setPalette(p);
    feed?.setPalette(p);
    toyMaterial.color.set(p.accent);
  }

  // Boot ------------------------------------------------------------------

  /**
   * Compile every shader the scene will use before the first visible frame.
   * With KHR_parallel_shader_compile that happens off the main thread;
   * otherwise draw the (still hidden) canvas one material at a time, for the
   * screen and for the camera's offscreen target, yielding in between.
   */
  async function warmUp() {
    const target = feed?.rect.w ? feed.target : null;
    if (renderer.extensions.has('KHR_parallel_shader_compile')) {
      const jobs = [renderer.compileAsync(scene, camera)];
      if (target) {
        renderer.setRenderTarget(target);
        jobs.push(renderer.compileAsync(scene, camera));
        renderer.setRenderTarget(null);
        jobs.push(feed.warm());
      }
      await Promise.all(jobs).catch(() => {});
      return;
    }
    const groups = new Map();
    scene.traverse((o) => {
      if (!o.isMesh) return;
      if (!groups.has(o.material)) groups.set(o.material, []);
      groups.get(o.material).push(o);
    });
    const meshes = [...groups.values()].flat();
    const shown = new Map(meshes.map((m) => [m, m.visible]));
    for (const t of toys) t.mesh.position.set(HOME.x, TOY_REST, HOME.z + 0.8);
    for (const list of groups.values()) {
      for (const m of meshes) m.visible = false;
      for (const m of list) m.visible = true;
      renderer.shadowMap.needsUpdate = true;
      renderer.render(scene, camera);
      if (target) {
        renderer.setRenderTarget(target);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
      }
      await yieldToPage();
      if (disposed) return;
    }
    for (const [m, v] of shown) m.visible = v;
    if (target) feed.draw(width, height, 0);
  }

  async function boot() {
    await yieldToPage();
    const steps = buildRobot(materials);
    let next = steps.next();
    while (!next.done) {
      await yieldToPage();
      if (disposed) return;
      next = steps.next();
    }
    rig = next.value;
    scene.add(rig.root);
    ctl = createController(rig);
    if (feed) rig.arm.eye.add(feed.camera);
    brain = createBrain({
      ctl,
      rig,
      toys,
      scene,
      home: HOME,
      viewer: () => camera.position,
      onChange(state, message) {
        lastEvent = performance.now();
        status = STATUS[state];
        if (message) onAnnounce?.(message);
      },
    });
    ctl.reset(HOME.x, HOME.z, HOME.yaw, FIRST_LOOK);

    await yieldToPage();
    if (disposed) return;
    stage = createStage(renderer, scene, { mobile, home: HOME });
    applyPalette(palette);
    placeCamera();
    scene.updateMatrixWorld();
    resize();
    // The reflection bake compiles and renders on its own; give it a task.
    await yieldToPage();
    if (disposed) return;
    stage.bakeEnvironment();

    if (poster) {
      frame(0);
      return;
    }

    await yieldToPage();
    if (disposed) return;
    await warmUp();
    if (disposed) return;

    resizeObserver.observe(host);
    intersection.observe(host);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', sync);

    // Test hook for the Playwright checks (deterministic stepping); stripped
    // from production builds.
    if (import.meta.env.DEV) {
      canvas.robot = {
        ctl,
        brain,
        toys,
        camera,
        feed,
        renderer,
        throwTo,
        pause() {
          manual = true;
          sync();
        },
        advance(seconds, dt = 1 / 60) {
          for (let t = dt; t <= seconds + 1e-6; t += dt) step(dt);
        },
        render() {
          feedClock = Infinity;
          draw(1 / 60);
        },
      };
    }

    ready = true;
    sync();
    if (!running && !lost) frame(0);
  }

  const resizeObserver = new ResizeObserver(resize);
  const intersection = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      sync();
    },
    { rootMargin: '120px' }
  );

  // A lost context ends this instance: the owner disposes it (GL calls on a
  // lost context are no-ops) and mounts a fresh one on a new canvas.
  function onContextLost() {
    lost = true;
    sync();
    onLost?.();
  }

  canvas.addEventListener('webglcontextlost', onContextLost);

  function setPalette(p) {
    palette = p;
    applyPalette(p);
    feedClock = Infinity;
    if (ready && !lost) frame(0);
  }

  // Follow the theme attribute directly, so the canvas recolours in the same
  // frame as the page (including inside the theme view transition).
  const themeObserver = new MutationObserver(() => setPalette(readPalette()));
  if (!poster) themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    canvas,
    ready: boot(),
    throwRandom,
    setPalette,
    capture: poster ? (type = 'image/webp', q = 0.9) => canvas.toDataURL(type, q) : undefined,

    dispose() {
      if (disposed) return;
      disposed = true;
      sync();
      themeObserver.disconnect();
      resizeObserver.disconnect();
      intersection.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', sync);
      const frameEl = el('frame');
      if (frameEl) frameEl.style.opacity = '';
      scene.traverse((o) => o.geometry?.dispose());
      for (const m of Object.values(materials)) m.dispose();
      toyMaterial.dispose();
      stage?.dispose();
      feed?.dispose();
      renderer.dispose();
      if (!renderer.getContext().isContextLost()) renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
