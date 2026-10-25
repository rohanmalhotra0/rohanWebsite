import {
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  PlaneGeometry,
  PMREMGenerator,
  ShaderMaterial,
  ShadowMaterial,
  Vector2,
  Vector4,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// The floor is never painted: the canvas is transparent and this shader only
// adds ink (grid, tape, contact shadows), so the page background shows
// through exactly in both themes.
const FLOOR_VERTEX = /* glsl */ `
varying vec2 vXZ;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vXZ = world.xz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const FLOOR_FRAGMENT = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uTape;
uniform vec3 uAccent;
uniform vec4 uAlpha;   // grid, tape, shade, edge fade on/off
uniform vec4 uHome;    // x, z, cos(yaw), sin(yaw)
uniform vec4 uBody;    // x, z, yaw, strength
uniform vec4 uFeet[4]; // x, z, contact, -
uniform vec4 uToy;     // x, z, strength, radius
uniform vec4 uHover;   // x, z, alpha, -
uniform vec2 uView;    // canvas size in px
varying vec2 vXZ;

float grid(vec2 p, float spacing, float halfWidth) {
  vec2 d = abs(fract(p / spacing + 0.5) - 0.5) * spacing;
  vec2 fw = fwidth(p);
  vec2 hw = max(vec2(halfWidth), fw * 0.5);
  vec2 l = (1.0 - smoothstep(hw - fw * 0.5, hw + fw * 0.5, d)) * (halfWidth / hw);
  return max(l.x, l.y);
}

float box(vec2 p, vec2 c, vec2 h) {
  vec2 d = abs(p - c) - h;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float fill(float d) {
  float fw = fwidth(d);
  return 1.0 - smoothstep(-fw, fw, d);
}

vec4 over(vec4 dst, vec3 color, float a) {
  float outA = a + dst.a * (1.0 - a);
  vec3 rgb = (color * a + dst.rgb * dst.a * (1.0 - a)) / max(outA, 1e-4);
  return vec4(rgb, outA);
}

void main() {
  vec2 rel = vXZ - uHome.xy;
  float r = length(rel);
  float fade = 1.0 - smoothstep(1.0, 2.6, r);
  if (uAlpha.w > 0.5) {
    vec2 uv = gl_FragCoord.xy / uView;
    vec2 edge = min(uv, 1.0 - uv) * uView / min(uView.x, uView.y);
    fade *= smoothstep(0.0, 0.16, min(edge.x, edge.y));
  }

  float lines = max(grid(vXZ, 0.25, 0.0012) * 0.55, grid(vXZ, 1.0, 0.002));

  // Tape corners marking the robot's home square.
  vec2 q = abs(mat2(uHome.z, -uHome.w, uHome.w, uHome.z) * rel);
  vec2 corner = vec2(0.36, 0.62);
  float w = 0.012;
  float arm = 0.15;
  float tape = fill(min(
    box(q, corner - vec2(arm * 0.5 - w, 0.0), vec2(arm * 0.5, w)),
    box(q, corner - vec2(0.0, arm * 0.5 - w), vec2(w, arm * 0.5))
  ));

  // Soft contact shadow: body footprint, feet and toy.
  float c = cos(uBody.z);
  float s = sin(uBody.z);
  vec2 b = vXZ - uBody.xy;
  vec2 local = vec2(b.x * c - b.y * s, b.x * s + b.y * c);
  float body = pow(1.0 - smoothstep(0.0, 1.0, length(local / vec2(0.3, 0.62))), 1.6) * uBody.w;
  float feet = 0.0;
  for (int i = 0; i < 4; i++) {
    float d = length(vXZ - uFeet[i].xy);
    feet = max(feet, (1.0 - smoothstep(0.0, 0.075, d)) * uFeet[i].z);
  }
  float toy = (1.0 - smoothstep(0.0, uToy.w, length(vXZ - uToy.xy))) * uToy.z;
  float shade = clamp(max(body, max(feet * 0.85, toy)), 0.0, 1.0);

  float ring = abs(length(vXZ - uHover.xy) - 0.085);
  float hover = fill(ring - 0.004) * uHover.z;

  vec4 col = vec4(uInk, 0.0);
  col = over(col, uInk, lines * fade * uAlpha.x);
  col = over(col, uTape, tape * fade * uAlpha.y);
  col = over(col, vec3(0.0), shade * uAlpha.z);
  col = over(col, uAccent, hover * fade);
  gl_FragColor = col;
  #include <colorspace_fragment>
}`;

// Per-theme lighting. Dark mode leans on the rim light to keep the graphite
// silhouette readable against the page.
const LIGHTING = {
  light: { hemi: 1.2, key: 2.7, rim: 0.8, env: 0.62, shadow: 0.2, grid: 0.6, tape: 0.5, shade: 0.24 },
  dark: { hemi: 0.75, key: 2.6, rim: 2.2, env: 0.5, shadow: 0.55, grid: 0.55, tape: 0.55, shade: 0.55 },
};

export function createStage(renderer, scene, { mobile, home }) {
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTarget = pmrem.fromScene(room, 0.04);
  scene.environment = envTarget.texture;
  room.dispose();
  pmrem.dispose();

  const hemi = new HemisphereLight(0xffffff, 0x808080, 1);
  const key = new DirectionalLight(0xfffaf2, 2.6);
  key.position.set(-2.4, 4.6, 3.1);
  key.castShadow = true;
  const size = mobile ? 1024 : 2048;
  key.shadow.mapSize.set(size, size);
  Object.assign(key.shadow.camera, { left: -2.4, right: 2.4, top: 2.4, bottom: -2.4, near: 1, far: 12 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.012;
  key.shadow.radius = mobile ? 3 : 4;
  const rim = new DirectionalLight(0xffffff, 1);
  rim.position.set(2.6, 2.4, -3.2);
  scene.add(hemi, key, key.target, rim);

  const plane = new PlaneGeometry(9, 9);
  plane.rotateX(-Math.PI / 2);

  const catcher = new Mesh(plane, new ShadowMaterial({ depthWrite: false }));
  catcher.receiveShadow = true;
  catcher.renderOrder = 2;

  const uniforms = {
    uInk: { value: new Color() },
    uTape: { value: new Color() },
    uAccent: { value: new Color() },
    uAlpha: { value: new Vector4(0.6, 0.5, 0.25, 1) },
    uHome: { value: new Vector4(home.x, home.z, Math.cos(home.yaw), Math.sin(home.yaw)) },
    uBody: { value: new Vector4() },
    uFeet: { value: [new Vector4(), new Vector4(), new Vector4(), new Vector4()] },
    uToy: { value: new Vector4() },
    uHover: { value: new Vector4() },
    uView: { value: new Vector2(1, 1) },
  };
  const floor = new Mesh(
    plane,
    new ShaderMaterial({
      uniforms,
      vertexShader: FLOOR_VERTEX,
      fragmentShader: FLOOR_FRAGMENT,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    })
  );
  floor.renderOrder = 1;
  scene.add(floor, catcher);

  return {
    uniforms,

    setPalette(palette) {
      const L = LIGHTING[palette.theme];
      hemi.color.set(0xffffff);
      hemi.groundColor.set(palette.bg);
      hemi.intensity = L.hemi;
      key.intensity = L.key;
      rim.intensity = L.rim;
      scene.environmentIntensity = L.env;
      catcher.material.opacity = L.shadow;
      uniforms.uInk.value.set(palette.fg);
      uniforms.uTape.value.set(palette.fg);
      uniforms.uAccent.value.set(palette.accent);
      uniforms.uAlpha.value.set(L.grid * 0.16, L.tape, L.shade, uniforms.uAlpha.value.w);
    },

    /** Feed the contact-shadow uniforms from the robot, feet and toy. */
    update(ctl, toyPos, toyStrength, hover) {
      const s = ctl.state;
      uniforms.uBody.value.set(s.x, s.z, s.yaw, 0.55 + 0.25 * s.crouch);
      ctl.feet.forEach((f, i) => uniforms.uFeet.value[i].set(f.pos.x, f.pos.z, 1 - f.lift * 0.8, 0));
      uniforms.uToy.value.set(toyPos.x, toyPos.z, toyStrength, 0.05 + (1 - toyStrength) * 0.05);
      uniforms.uHover.value.copy(hover);
    },

    /** Canvas size, and whether to fade the floor out at the canvas edges. */
    setView(width, height, edgeFade) {
      uniforms.uView.value.set(width, height);
      uniforms.uAlpha.value.w = edgeFade ? 1 : 0;
    },

    dispose() {
      envTarget.dispose();
      plane.dispose();
      floor.material.dispose();
      catcher.material.dispose();
    },
  };
}
