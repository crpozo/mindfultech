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
    float lambert = 0.18 + 0.62 * max(dot(n, L), 0.0);
    float spec = pow(max(dot(reflect(-L, n), v), 0.0), 40.0) * 0.18;
    vec3 col = mix(uBase, uMid, smoothstep(0.0, 1.0, vUv.x)) * lambert;
    if (vFace > 1.5) col *= 0.55;            /* the sides sit in shadow */
    if (vFace > 0.5 && vFace < 1.5) col *= 0.7;
    col = mix(col, uMid * 1.1, fres * 0.45) + spec * uEdge;
    /* a light streak travelling along the band, strongest on the top face */
    float head = fract(uTime * 0.07 + uStreak);
    float d = abs(vUv.x - head);
    float streak = smoothstep(0.035, 0.0, d) * (vFace < 0.5 ? 1.0 : 0.3);
    col += uEdge * streak * 1.1;
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
function bandGeometry(curve, w, th, segs = 150) {
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
  const mode = opts.mode || "bands"; // bands (arches), globe (sliced core on the right), columns (tall vertical bands)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: false, powerPreference: "high-performance", logarithmicDepthBuffer: true });
  let dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0b14, 0.04);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 80);
  camera.position.set(0, -1.5, 13);

  /* ribbons */
  const ribbons = new THREE.Group();
  scene.add(ribbons);
  const mats = [];
  /* arches: they rise from below the fold, crest around the upper right third and dive back down */
  const archDefs = [
    { pts: [[-1, -11, -1], [1.5, -5, -0.5], [4.2, 0.5, 0], [6.5, 3.6, -0.5], [9, 1, -1.5], [11, -6, -2.5], [12, -12, -3]], w: 2.4, th: 0.45, amp: 0.1, mid: accent, streak: 0.0 },
    { pts: [[3.5, -12, -3.5], [5.5, -6, -3], [8, -0.5, -2.5], [10, 3, -3], [12, 0.5, -4], [13.5, -6, -5], [14, -12, -5.5]], w: 2.9, th: 0.55, amp: 0.12, mid: accent.clone().multiplyScalar(0.78), streak: 0.45 },
    { pts: [[-5, -12, -6], [-2.5, -7, -5.5], [1, -2.5, -5], [4, 0.2, -5.5], [7.5, -1.5, -6.5], [10.5, -6, -7.5], [12, -12, -8]], w: 2.2, th: 0.4, amp: 0.08, mid: accent.clone().multiplyScalar(0.5), streak: 0.8 },
  ];
  /* columns: tall bands leaning to the right, like a curtain (the company page) */
  const columnDefs = Array.from({ length: 6 }, (_, i) => {
    const x = -2 + i * 2.6, z = -1.5 - i * 2.2, lean = 2.2 + i * 0.3;
    return { pts: [[x - lean, -12, z], [x - lean * 0.4, -5, z], [x + 0.2, 0, z], [x + lean * 0.5, 6, z], [x + lean, 12, z]], w: 1.6 + (i % 3) * 0.4, th: 0.5, amp: 0, mid: accent.clone().multiplyScalar(0.45 + 0.1 * (i % 3)), streak: i / 6 };
  });
  const defs = mode === "globe" ? [] : mode === "columns" ? columnDefs : archDefs;
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

  /* globe: a dim translucent shell with a stack of matte discs inside (some with a wedge cut), like a sliced core.
     It stays dark on purpose so the copy in front of it keeps its contrast. */
  const globe = new THREE.Group();
  globe.visible = false;
  scene.add(globe);
  const shellMat = new THREE.ShaderMaterial({ vertexShader: SHELL_VERT, fragmentShader: SHELL_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uColor: { value: accent.clone().multiplyScalar(0.75) }, uAlpha: { value: 0.75 } } });
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(3.8, 48, 32), shellMat));
  const innerLight = new THREE.PointLight(accent.getHex(), 9, 14, 1.4);
  innerLight.position.set(1.5, 2.5, 3);
  globe.add(innerLight);
  globe.add(new THREE.AmbientLight(0x2a4a38, 1.6));
  const rings = new THREE.Group();
  const discMat = new THREE.MeshStandardMaterial({ color: new THREE.Color("#1d6b45"), roughness: 0.8, metalness: 0.1, emissive: new THREE.Color("#0f3d27"), emissiveIntensity: 0.9 });
  const discMatCut = discMat.clone(); discMatCut.color = new THREE.Color("#2a9a62");
  for (let i = -4; i <= 4; i++) {
    const y = i * 0.62;
    const r = Math.sqrt(Math.max(3.0 * 3.0 - y * y, 0.4));
    const cut = (i + 7) % 3 === 0;
    const geo = new THREE.CylinderGeometry(r, r, 0.46, 72, 1, false, cut ? 0.9 : 0, cut ? Math.PI * 1.55 : Math.PI * 2);
    const disc = new THREE.Mesh(geo, cut ? discMatCut : discMat);
    disc.position.y = y;
    disc.rotation.y = i * 0.35;
    rings.add(disc);
  }
  rings.rotation.z = 0.3;
  rings.rotation.x = 0.15;
  globe.add(rings);
  /* a dust of points inside the shell */
  const dustN = 260; const dust = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(2.2 + Math.random() * 1.5); dust[i * 3] = v.x; dust[i * 3 + 1] = v.y; dust[i * 3 + 2] = v.z; }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute("position", new THREE.BufferAttribute(dust, 3));
  globe.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: edge, size: 0.035, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })));
  globe.position.set(2.6, -2.2, -2.5);
  if (mode === "globe") { globe.position.set(3.6, -0.8, -2); globe.scale.setScalar(1.45); }

  /* particles */
  const N = 420;
  const pp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pp[i * 3] = (Math.random() - 0.5) * 30; pp[i * 3 + 1] = (Math.random() - 0.5) * 20; pp[i * 3 + 2] = -Math.random() * 12; }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pp, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: new THREE.Color("#e6fff0"), size: 0.075, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  scene.add(particles);

  /* post */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.45, 0.5, 0.8);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const state = { scroll: 0, globe: 0, foot: 0, px: 0, py: 0, tx: 0, ty: 0, hold: 0, h: 0, running: true };
  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(dpr); composer.setPixelRatio(dpr);
    renderer.setSize(w, h, false); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    bloom.resolution.set(w, h);
    const narrow = w < 760;
    if (mode === "globe") { globe.position.x = narrow ? 0.5 : 3.6; globe.position.y = narrow ? -3.5 : -0.8; }
    if (mode !== "globe") globe.position.x = narrow ? 0 : 2.6;
  };
  resize();
  window.addEventListener("resize", resize);
  const onVis = () => { state.running = !document.hidden; if (state.running) loop(); };
  document.addEventListener("visibilitychange", onVis);

  renderer.compile(scene, camera);
  const clock = new THREE.Clock();
  let raf = 0, frames = 0, slow = 0;
  function loop() {
    if (!state.running) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    // adaptive quality: if the first seconds run slow, drop the pixel ratio and the bloom once
    if (frames < 120) { frames++; if (dt > 0.03) slow++; if (frames === 120 && slow > 50) { dpr = Math.max(0.7, dpr * 0.65); bloom.strength = 0.5; resize(); } }
    const t = clock.elapsedTime;
    state.px += (state.tx - state.px) * 0.06;
    state.py += (state.ty - state.py) * 0.06;
    // the hold: camera pushes in, bands twist and race their streak, bloom pumps, particles rush
    state.h += (state.hold - state.h) * 0.12;
    const H = state.h;
    for (const m of mats) m.uniforms.uTime.value += dt * (1 + H * 6);
    bloom.strength = 0.45 + H * 0.9;
    // ribbons: drift down and tilt as the hero scrolls away, tilt with the pointer
    const s = state.scroll;
    // drift slowly out of the hero (still behind the logos and the dot band), come back for the footer
    const f = state.foot;
    ribbons.position.y = mode === "columns" ? -s * 1.5 * (1 - f) : (-1.8 - Math.min(s, 1.8) * 2.6) * (1 - f) + (-2.6) * f;
    ribbons.visible = defs.length > 0 && (mode === "columns" || s < 2.4 || f > 0.01);
    ribbons.position.x += (-(canvas.clientWidth < 760 ? 3.5 : 1.5) - H * 5 - ribbons.position.x) * 0.1;
    ribbons.rotation.z = -0.08 * s + state.px * 0.06 - H * 0.5;
    ribbons.rotation.x = state.py * 0.08 + H * 0.25;
    ribbons.rotation.y = state.px * 0.1 + Math.sin(t * 0.12) * 0.04 + H * 0.9;
    ribbons.scale.setScalar((canvas.clientWidth < 760 ? 0.72 : 1) * (1 + H * 0.25));
    // globe: scale and fade with the dark-section progress
    const g = mode === "globe" ? Math.max(0.15, 1 - s * 0.6) : state.globe;
    globe.visible = g > 0.01;
    const k = (mode === "globe" ? 1.45 : 0.2 + 0.8 * g) * (canvas.clientWidth < 760 ? 0.8 : 1);
    globe.scale.setScalar(k);
    shellMat.uniforms.uAlpha.value = 0.75 * g;
    discMat.opacity = discMatCut.opacity = g; discMat.transparent = discMatCut.transparent = g < 0.99;
    rings.rotation.y += dt * 0.18;
    rings.rotation.x = 0.15 + Math.sin(t * 0.2) * 0.1 + state.py * 0.12;
    globe.rotation.y = state.px * 0.25;
    particles.rotation.y = t * 0.01;
    particles.position.y = -s * 1.5 + Math.sin(t * 0.3) * 0.1;
    // cinematic hold: three looks, one per word (bands close-up, bands from above, the sliced globe)
    const seg = Math.min(3.999, H * 4), si = Math.floor(seg), st = seg - si;
    const looks = [[0, -1.5, 13, 38], [3.5, 1.5, 7.5, 46], [-2.5, 0.5, 9, 42], [1.2, -1.4, 12.5, 40], [1.2, -1.4, 12.5, 40]];
    // final phase: the sliced core alone, slowly turning in a loop
    const fin = Math.max(0, (H - 0.75) * 4);
    if (fin > 0) { rings.rotation.y += dt * 0.35 * fin; globe.rotation.z = Math.sin(t * 0.4) * 0.15 * fin; globe.position.x = 2.6 - fin * 1.2; globe.position.y = -2.2 + fin * 1.0; }
    const L0 = looks[si], L1 = looks[si + 1];
    const e = st * st * (3 - 2 * st);
    const cx = L0[0] + (L1[0] - L0[0]) * e, cy = L0[1] + (L1[1] - L0[1]) * e, cz = L0[2] + (L1[2] - L0[2]) * e, cf = L0[3] + (L1[3] - L0[3]) * e;
    camera.position.x = (H < 0.02 ? 0 : cx) + state.px * 0.3;
    camera.position.y = (H < 0.02 ? -1.5 : cy) + state.py * 0.2;
    camera.position.z = H < 0.02 ? 13 : cz;
    camera.fov = H < 0.02 ? 38 : cf; camera.updateProjectionMatrix();
    if (mode !== "globe") { const gh = Math.max(0, (H - 0.5) * 2); globe.visible = globe.visible || gh > 0.01; if (gh > 0) { globe.scale.setScalar(0.3 + gh * 0.75); shellMat.uniforms.uAlpha.value = Math.max(shellMat.uniforms.uAlpha.value, 0.7 * gh); innerLight.intensity = 9 + gh * 10; } else innerLight.intensity = 9; }
    particles.scale.setScalar(1 + H * 0.5);
    camera.lookAt(0, 0, 0);
    composer.render();
  }
  loop();

  return {
    setScroll(p) { state.scroll = Math.max(0, p); },
    setGlobe(g) { state.globe = Math.max(0, Math.min(1, g)); },
    setFooter(f) { state.foot = Math.max(0, Math.min(1, f)); },
    setPointer(x, y) { state.tx = x; state.ty = y; },
    setHold(p) { state.hold = Math.max(0, Math.min(1, p)); },
    dispose() {
      state.running = false; cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVis);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
      composer.dispose?.(); renderer.dispose();
    },
  };
}
