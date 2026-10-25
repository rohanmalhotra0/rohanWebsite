// Telling a real GPU from software rendering, shared by the hero (main
// thread) and its probe worker.

export const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render driver|microsoft basic/i;

export function rendererName(gl) {
  const name = gl.getParameter(gl.RENDERER) || '';
  // Chromium and Safari mask RENDERER; Firefox reports the real one (and
  // warns about the debug extension), so only ask the extension when masked.
  if (!/^webkit webgl$/i.test(name)) return name;
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  return (info && gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) || name;
}
