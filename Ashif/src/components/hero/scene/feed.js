import {
  Box3,
  Color,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderTarget,
} from 'three';

// The capture is linear and premultiplied (three blends that way); composite
// it over a backdrop, then map luminance onto a two-tone tint.
const FEED_FRAGMENT = /* glsl */ `
uniform sampler2D map;
uniform vec3 uBack;
uniform vec3 uDark;
uniform vec3 uLight;
uniform vec2 uSize;
uniform float uRadius;
varying vec2 vUv;
void main() {
  vec4 raw = texture2D(map, vUv);
  vec3 c = raw.rgb + uBack * (1.0 - raw.a);
  // Red-leaning mono mix, like a filtered sensor: orange reads bright.
  float l = dot(c, vec3(0.55, 0.38, 0.07));
  l = smoothstep(0.0, 1.0, pow(l / (l + 0.35) * 1.35, 0.7));
  vec2 v = vUv - 0.5;
  l *= 1.0 - dot(v, v) * 0.55;
  vec2 p = abs((vUv - 0.5) * uSize) - (uSize * 0.5 - uRadius);
  float d = length(max(p, 0.0)) - uRadius;
  gl_FragColor = vec4(mix(uDark, uLight, l), 1.0 - smoothstep(-0.75, 0.75, d));
  #include <colorspace_fragment>
}`;

// Mono tint per theme: ink on paper in light mode, cool graphite in dark.
const TINTS = {
  light: { dark: 0x23211d, light: 0xf7f5ef, back: 0xc4c1b8 },
  dark: { dark: 0x0a0b0a, light: 0xd3d6ce, back: 0x2e2f2c },
};

const _box = new Box3();
const _v = new Vector3();

/**
 * The robot's own camera, rendered offscreen at ~30 fps and composited,
 * mono and rounded, into a corner inset of the main canvas.
 */
export function createFeed(renderer) {
  const target = new WebGLRenderTarget(16, 9, { samples: 4 });
  target.texture.colorSpace = SRGBColorSpace;
  const camera = new PerspectiveCamera(60, 16 / 9, 0.03, 30);

  const uniforms = {
    map: { value: target.texture },
    uBack: { value: new Color() },
    uDark: { value: new Color() },
    uLight: { value: new Color() },
    uSize: { value: new Vector2(256, 144) },
    uRadius: { value: 8 },
  };
  const quad = new Mesh(
    new PlaneGeometry(2, 2),
    new ShaderMaterial({
      uniforms,
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: FEED_FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    })
  );
  quad.frustumCulled = false;
  const quadScene = new Scene();
  quadScene.add(quad);
  const quadCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // Inset rectangle in CSS px, top-left origin, relative to the canvas.
  const rect = { x: 0, y: 0, w: 0, h: 0 };

  return {
    camera,
    target,
    rect,

    setPalette(palette) {
      const t = TINTS[palette.theme];
      uniforms.uDark.value.set(t.dark);
      uniforms.uLight.value.set(t.light);
      uniforms.uBack.value.set(t.back);
    },

    setRect(x, y, w, h, pixelRatio) {
      Object.assign(rect, { x, y, w, h });
      if (!w || !h) return;
      // Capture at up to 1.25x: soft like a real camera, and cheap.
      const scale = Math.min(pixelRatio, 1.25);
      target.setSize(Math.round(w * scale), Math.round(h * scale));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.uSize.value.set(w * pixelRatio, h * pixelRatio);
      uniforms.uRadius.value = 8 * pixelRatio;
    },

    /** Render the gripper camera offscreen. */
    capture(scene) {
      if (!rect.w) return;
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
    },

    /** Composite the last capture into the inset (after the main view). */
    draw(width, height) {
      if (!rect.w) return;
      const y = height - rect.y - rect.h;
      renderer.autoClear = false;
      renderer.setScissorTest(true);
      renderer.setScissor(rect.x, y, rect.w, rect.h);
      renderer.setViewport(rect.x, y, rect.w, rect.h);
      renderer.render(quadScene, quadCamera);
      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, width, height);
      renderer.autoClear = true;
    },

    /**
     * Project a mesh's bounds into the inset like a detector would: a loose
     * axis-aligned box in inset pixels, or null when out of view.
     */
    detect(mesh, out) {
      if (!mesh.visible || !rect.w) return null;
      _box.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (let i = 0; i < 8; i++) {
        _v.set(i & 1 ? _box.max.x : _box.min.x, i & 2 ? _box.max.y : _box.min.y, i & 4 ? _box.max.z : _box.min.z);
        _v.applyMatrix4(camera.matrixWorldInverse);
        if (_v.z > -camera.near) continue;
        _v.applyMatrix4(camera.projectionMatrix);
        const px = (_v.x * 0.5 + 0.5) * rect.w;
        const py = (0.5 - _v.y * 0.5) * rect.h;
        minX = Math.min(minX, px);
        maxX = Math.max(maxX, px);
        minY = Math.min(minY, py);
        maxY = Math.max(maxY, py);
      }
      if (minX > rect.w || maxX < 0 || minY > rect.h || maxY < 0) return null;
      out.x = Math.max(minX - 2, 0);
      out.y = Math.max(minY - 2, 0);
      out.w = Math.min(maxX + 2, rect.w) - out.x;
      out.h = Math.min(maxY + 2, rect.h) - out.y;
      return out.w > 3 && out.h > 3 ? out : null;
    },

    dispose() {
      target.dispose();
      quad.geometry.dispose();
      quad.material.dispose();
    },
  };
}
