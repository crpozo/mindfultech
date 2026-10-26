// Background scene for concept 06 "Cerebrium": a fixed WebGL canvas behind the whole page.
// Ribbons with a fresnel + glowing-edge shader that undulate on their own, drift with the scroll and
// tilt with the pointer; a particle field; and a globe (fresnel shell + stacked rings) that takes over
// in the dark sections. Imported lazily by Cerebrium.tsx so three.js stays out of the first bundle.
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

const RIBBON_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  attribute float aFace;
  varying vec2 vUv;
  varying float vFace;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vFace = aFace;
    vec3 p = position;
    float w = sin(uTime * 0.6 + p.x * 0.9 + p.y * 0.7) * uAmp + sin(uTime * 0.35 + p.z * 1.3) * uAmp * 0.6;
    p += normal * w;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vNormalW = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const RIBBON_FRAG = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uMid;
  uniform vec3 uEdge;
  uniform float uEdgeW;
  uniform float uTime;
  uniform float uStreak;
  varying vec2 vUv;
  varying float vFace;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec3 n = normalize(vNormalW);
    if (!gl_FrontFacing) n = -n;
    vec3 v = normalize(vViewDir);
    float fres = pow(1.0 - max(dot(n, v), 0.0), 2.5);
    vec3 L = normalize(vec3(-0.3, 0.9, 0.5));
    float lambert = 0.22 + 0.78 * max(dot(n, L), 0.0);
    float spec = pow(max(dot(reflect(-L, n), v), 0.0), 28.0) * 0.5;
    vec3 col = mix(uBase, uMid, smoothstep(0.0, 1.0, vUv.x)) * lambert;
    if (vFace > 1.5) col *= 0.55;            /* the sides sit in shadow */
    if (vFace > 0.5 && vFace < 1.5) col *= 0.7;
    col = mix(col, uMid * 1.3, fres * 0.7) + spec * uEdge;
    /* a light streak travelling along the band, strongest on the top face */
    float head = fract(uTime * 0.07 + uStreak);
    float d = abs(vUv.x - head);
    float streak = smoothstep(0.06, 0.0, d) * (vFace < 0.5 ? 1.0 : 0.35);
    col += uEdge * streak * 2.2;
    /* soft rim on the long edges and film grain */
    float e = smoothstep(uEdgeW, 0.0, min(vUv.y, 1.0 - vUv.y));
    col += uEdge * e * 0.25;
    col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.022;
    gl_FragColor = vec4(col, 1.0);
  }
`;
const SHELL_VERT = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }
`;
const SHELL_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform float uAlpha;
  varying vec3 vN; varying vec3 vV;
  void main(){ float f = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 3.0); gl_FragColor = vec4(uColor, f * uAlpha); }
`;

/* a band with real thickness along a curve: width `w` across the binormal, thickness `th` along the normal.
   Four faces (top, bottom, two sides); uv.x runs along the curve, uv.y across; aFace 0 = top, 1 = bottom, 2 = side. */
function bandGeometry(curve, w, th, segs = 260) {
  const frames = curve.computeFrenetFrames(segs, false);
  const pos = [], nor = [], uv = [], face = [], idx = [];
  let v = 0;
  const strip = (offA, offB, normalOf, f) => {
    const start = v;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const p = curve.getPointAt(t);
      const n = frames.normals[i], bn = frames.binormals[i];
      const A = offA(n, bn), B = offB(n, bn);
      const nn = normalOf(n, bn);
      pos.push(p.x + A.x, p.y + A.y, p.z + A.z, p.x + B.x, p.y + B.y, p.z + B.z);
      nor.push(nn.x, nn.y, nn.z, nn.x, nn.y, nn.z);
      uv.push(t, 0, t, 1);
      face.push(f, f);
      v += 2;
      if (i < segs) { const k = start + i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
  };
  const V = (n, bn, kn, kb) => new THREE.Vector3().addScaledVector(n, kn).addScaledVector(bn, kb);
  strip((n, b) => V(n, b, th / 2, -w / 2), (n, b) => V(n, b, th / 2, w / 2), (n) => n.clone(), 0);
  strip((n, b) => V(n, b, -th / 2, w / 2), (n, b) => V(n, b, -th / 2, -w / 2), (n) => n.clone().negate(), 1);
  strip((n, b) => V(n, b, -th / 2, -w / 2), (n, b) => V(n, b, th / 2, -w / 2), (n, b) => b.clone().negate(), 2);
  strip((n, b) => V(n, b, th / 2, w / 2), (n, b) => V(n, b, -th / 2, w / 2), (n, b) => b.clone(), 2);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("aFace", new THREE.Float32BufferAttribute(face, 1));
  g.setIndex(idx);
  return g;
}

export function createBackground(canvas, opts = {}) {
  const accent = new THREE.Color(opts.accent || "#3dbe7d");
  const edge = new THREE.Color(opts.edge || "#bff5cf");
  const base = new THREE.Color(opts.base || "#0f3d27");
  const reduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0b14, 0.04);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, -1.5, 13);

  /* ribbons */
  const ribbons = new THREE.Group();
  scene.add(ribbons);
  const mats = [];
  /* arches: they rise from below the fold, crest around the upper right third and dive back down */
  const defs = [
    { pts: [[-1, -11, -1], [1.5, -5, -0.5], [4.2, 0.5, 0], [6.5, 3.6, -0.5], [9, 1, -1.5], [11, -6, -2.5], [12, -12, -3]], w: 2.4, th: 0.45, amp: 0.1, mid: accent, streak: 0.0 },
    { pts: [[3.5, -12, -3.5], [5.5, -6, -3], [8, -0.5, -2.5], [10, 3, -3], [12, 0.5, -4], [13.5, -6, -5], [14, -12, -5.5]], w: 2.9, th: 0.55, amp: 0.12, mid: accent.clone().multiplyScalar(0.78), streak: 0.45 },
    { pts: [[-5, -12, -6], [-2.5, -7, -5.5], [1, -2.5, -5], [4, 0.2, -5.5], [7.5, -1.5, -6.5], [10.5, -6, -7.5], [12, -12, -8]], w: 2.2, th: 0.4, amp: 0.08, mid: accent.clone().multiplyScalar(0.5), streak: 0.8 },
  ];
  for (const d of defs) {
    const curve = new THREE.CatmullRomCurve3(d.pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, "catmullrom", 0.6);
    const geo = bandGeometry(curve, d.w, d.th);
    const mat = new THREE.ShaderMaterial({
      vertexShader: RIBBON_VERT, fragmentShader: RIBBON_FRAG, side: THREE.FrontSide,
      uniforms: { uTime: { value: Math.random() * 10 }, uAmp: { value: reduced ? 0 : d.amp }, uBase: { value: base }, uMid: { value: d.mid }, uEdge: { value: edge }, uEdgeW: { value: 0.05 }, uStreak: { value: d.streak } },
    });
    mats.push(mat);
    ribbons.add(new THREE.Mesh(geo, mat));
  }

  /* globe: fresnel shell + stacked rings, hidden until the dark sections */
  const globe = new THREE.Group();
  globe.visible = false;
  scene.add(globe);
  const shellMat = new THREE.ShaderMaterial({ vertexShader: SHELL_VERT, fragmentShader: SHELL_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uColor: { value: accent }, uAlpha: { value: 0.9 } } });
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(3.6, 64, 64), shellMat));
  const rings = new THREE.Group();
  for (let i = -3; i <= 3; i++) {
    const y = i * 0.78;
    const r = Math.sqrt(Math.max(3.1 * 3.1 - y * y, 0.3));
    const mat = new THREE.ShaderMaterial({ vertexShader: RIBBON_VERT, fragmentShader: RIBBON_FRAG, side: THREE.FrontSide, uniforms: { uTime: { value: i }, uAmp: { value: 0 }, uBase: { value: base }, uMid: { value: accent.clone().multiplyScalar(0.7 + 0.1 * Math.abs(i)) }, uEdge: { value: edge }, uEdgeW: { value: 0.12 }, uStreak: { value: (i + 3) / 7 } } });
    mats.push(mat);
    const ringGeo = new THREE.TorusGeometry(r, 0.26, 10, 120);
    ringGeo.setAttribute("aFace", new THREE.Float32BufferAttribute(new Float32Array(ringGeo.attributes.position.count), 1));
    const ring = new THREE.Mesh(ringGeo, mat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    rings.add(ring);
  }
  rings.rotation.z = 0.35;
  globe.add(rings);
  globe.position.set(2.6, -2.2, -2.5);

  /* particles */
  const N = 500;
  const pp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pp[i * 3] = (Math.random() - 0.5) * 30; pp[i * 3 + 1] = (Math.random() - 0.5) * 20; pp[i * 3 + 2] = -Math.random() * 12; }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pp, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: edge, size: 0.05, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  scene.add(particles);

  /* post */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.75, 0.6, 0.72);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const state = { scroll: 0, globe: 0, px: 0, py: 0, tx: 0, ty: 0, running: true };
  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    bloom.resolution.set(w, h);
    const narrow = w < 760;
    ribbons.scale.setScalar(narrow ? 0.72 : 1);
    ribbons.position.x = narrow ? -3.5 : -1.5;
    globe.position.x = narrow ? 0 : 2.6;
    globe.scale.setScalar(narrow ? 0.8 : 1);
  };
  resize();
  window.addEventListener("resize", resize);
  const onVis = () => { state.running = !document.hidden; if (state.running) loop(); };
  document.addEventListener("visibilitychange", onVis);

  const clock = new THREE.Clock();
  let raf = 0;
  function loop() {
    if (!state.running) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    state.px += (state.tx - state.px) * 0.06;
    state.py += (state.ty - state.py) * 0.06;
    for (const m of mats) m.uniforms.uTime.value += dt;
    // ribbons: drift down and tilt as the hero scrolls away, tilt with the pointer
    const s = state.scroll;
    ribbons.position.y = -1.8 - s * 6.5;
    ribbons.rotation.z = -0.08 * s + state.px * 0.06;
    ribbons.rotation.x = state.py * 0.08;
    ribbons.rotation.y = state.px * 0.1 + Math.sin(t * 0.12) * 0.04;
    // globe: scale and fade with the dark-section progress
    const g = state.globe;
    globe.visible = g > 0.01;
    const k = 0.2 + 0.8 * g;
    globe.scale.setScalar(k * (canvas.clientWidth < 760 ? 0.8 : 1));
    shellMat.uniforms.uAlpha.value = 0.9 * g;
    rings.rotation.y += dt * 0.25;
    rings.rotation.x = Math.sin(t * 0.2) * 0.12 + state.py * 0.15;
    globe.rotation.y = state.px * 0.25;
    particles.rotation.y = t * 0.01;
    particles.position.y = -s * 1.5 + Math.sin(t * 0.3) * 0.1;
    camera.position.x = state.px * 0.3;
    camera.position.y = state.py * 0.2;
    camera.lookAt(0, 0, 0);
    composer.render();
  }
  loop();

  return {
    setScroll(p) { state.scroll = Math.max(0, Math.min(1.4, p)); },
    setGlobe(g) { state.globe = Math.max(0, Math.min(1, g)); },
    setPointer(x, y) { state.tx = x; state.ty = y; },
    dispose() {
      state.running = false; cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVis);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
      composer.dispose?.(); renderer.dispose();
    },
  };
}
