// MindfulTech hero scene — "Signal to Ship". Plain JS on purpose (allowJs): it is
// loaded lazily by Brain3D.tsx and keeps three.js out of the first-load bundle.
//
// One particle swarm (~4,100 points on desktop, ~2,000 on phones) that is the
// anatomical brain and reshapes itself into: a phone (apps in the stores), a
// browser of working code, an AWS lattice, an agent loop running 24/7, the
// world map of clients, and finally the MindfulTech mark.
//
// Craft on the brain station: custom point/line shaders with depth fade, soft
// discs and twinkle; fresnel rim shell + inner core glow; bottom-up assembly
// intro; impulses along real synapses with synchronised bursts; cursor
// parallax + repulsion field; drag to orbit; chips anchored to 3D regions with
// leader lines and occlusion dimming; fly-to on chip click.
// Light stage only (the founder's preference); no post-processing.
// Phones get a lite tier instead of nothing; reduced motion is respected.
import * as THREE from "three";
import { LAND_PATH, MAP_VIEW } from "@/lib/map/land";

// lat,lon pairs of the map's land dots, decoded once from the SVG path ClientMap draws
const LAND = (() => {
  const out = [];
  const re = /M(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)h/g;
  let m;
  while ((m = re.exec(LAND_PATH))) {
    const x = +m[1], y = +m[2];
    out.push(MAP_VIEW.lat1 - (y / MAP_VIEW.h) * (MAP_VIEW.lat1 - MAP_VIEW.lat0), MAP_VIEW.lon0 + (x / MAP_VIEW.w) * (MAP_VIEW.lon1 - MAP_VIEW.lon0));
  }
  return new Float32Array(out);
})();

export const STATIONS = ['brain', 'app', 'code', 'cloud', 'run', 'world', 'mark'];

export const REGIONS = {
  ux: [-0.34, 0.24, 0.55],
  agents: [0.38, 0.44, 0.28],
  cloud: [0.42, 0.26, -0.5],
  code: [-0.5, -0.04, 0.06],
  mobile: [0.02, -0.3, -0.5],
};

export const CLIENTS = [
  { id: 'quito', lat: -0.18, lon: -78.47, home: true },
  { id: 'california', lat: 36.8, lon: -119.4 },
  { id: 'chicago', lat: 41.88, lon: -87.63 },
  { id: 'florida', lat: 26.64, lon: -81.87 },
  { id: 'netherlands', lat: 52.1, lon: 5.3 },
  { id: 'germany', lat: 51.1, lon: 10.45 },
  { id: 'spain', lat: 40.3, lon: -3.7 },
  { id: 'greece', lat: 37.98, lon: 23.73 },
];

// per-station camera pose (group rotation), zoom factor, idle spin and tint
const POSES = {
  brain: { rx: 0.06, ry: -0.55, zoom: 1, spin: 0.09, tint: null, mix: 0 },
  app: { rx: 0.08, ry: -0.42, zoom: 1.02, spin: 0.02, tint: '#69c7b9', mix: 0.55 },
  code: { rx: 0.04, ry: -0.2, zoom: 1.0, spin: 0.015, tint: '#4FAE87', mix: 0.5 },
  cloud: { rx: 0.46, ry: -0.75, zoom: 1.05, spin: 0.08, tint: '#5aa9d6', mix: 0.55 },
  run: { rx: 0.5, ry: -0.3, zoom: 1.0, spin: 0.12, tint: '#6f5ae0', mix: 0.65 },
  world: { rx: 0.18, ry: 0.0, zoom: 1.06, spin: 0.05, tint: '#4FAE87', mix: 0.45 },
  mark: { rx: 0.0, ry: 0.0, zoom: 0.98, spin: 0.0, tint: '#4FAE87', mix: 0.9 },
};

const GLOBE_R = 0.86;
const GLOBE_LON0 = -40; // Atlantic faces the camera
const latLon = (lat, lon, r = GLOBE_R) => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const th = ((lon - GLOBE_LON0) * Math.PI) / 180;
  return [r * Math.sin(phi) * Math.sin(th), r * Math.cos(phi), r * Math.sin(phi) * Math.cos(th)];
};

// ---------- shared GLSL ----------
const MOTION_GLSL = /* glsl */ `
  attribute vec3 aScatter;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime, uIntro, uMorph, uMouseOn, uFocusOn, uStill;
  uniform vec3 uMouse, uFocus;
  float easeOut(float t) { return 1.0 - pow(1.0 - t, 3.0); }
  // position after intro assembly, station morph, drift and the cursor field
  vec3 motion(out float e, out float m, out float push) {
    float d = clamp((uIntro - aSeed * 0.35) / 0.65, 0.0, 1.0);
    e = easeOut(d);
    m = smoothstep(0.0, 1.0, clamp((uMorph - aSeed * 0.2) / 0.8, 0.0, 1.0));
    // quadratic bezier from → (outward bulge) → to, so a morph breathes instead of sliding
    vec3 mid = normalize(aFrom + aTo + vec3(0.0, 0.03, 0.0)) * 1.18;
    vec3 target = mix(mix(aFrom, mid, m), mix(mid, aTo, m), m);
    vec3 p = mix(aScatter, target, e);
    float t = uTime;
    p += 0.006 * (1.0 - uStill) * vec3(sin(t * 1.3 + aSeed * 6.28), cos(t * 1.1 + aSeed * 3.0), sin(t * 0.9 + aSeed * 9.0));
    vec3 dm = p - uMouse;
    float dist = length(dm);
    push = uMouseOn * smoothstep(0.46, 0.0, dist);
    p += normalize(dm + vec3(1e-4)) * push * 0.1;
    return p;
  }
`;

const POINT_VERT = /* glsl */ `
  ${MOTION_GLSL}
  uniform float uSize, uPixelRatio, uOpacity, uDark, uTintMix;
  uniform vec3 uFade, uHot, uTint;
  varying vec3 vColor;
  varying float vAlpha, vCore;
  void main() {
    float e, m, push;
    vec3 p = motion(e, m, push);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    float far = clamp((depth - 1.6) / 2.0, 0.0, 1.0);
    gl_PointSize = uSize * uPixelRatio * (1.0 / depth) * (1.0 + 0.7 * push) * (0.6 + 0.4 * e);
    vAlpha = uOpacity * mix(1.0, 0.32, far) * mix(0.28, 1.0, e);
    float fd = length(position - uFocus);
    float f = uFocusOn * pow(smoothstep(0.62, 0.0, fd), 0.8);
    vec3 col = mix(aColor, uTint * (0.85 + 0.3 * aSeed), uTintMix);
    vec3 rest = mix(col, uFade, uFocusOn * 0.72);
    col = mix(rest, uHot, f);
    col = mix(col, uHot, push * 0.85);
    float tw = 0.86 + 0.14 * sin(uTime * 2.2 + aSeed * 40.0);
    vColor = col * tw * (1.0 + 0.35 * uDark);
    vCore = f + push;
  }
`;

const POINT_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha, vCore;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv) * 2.0;
    float a = smoothstep(1.0, 0.3, r);
    float core = smoothstep(0.5, 0.0, r);
    vec3 c = vColor + core * (0.25 + 0.6 * vCore);
    float alpha = a * vAlpha;
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(c, alpha);
  }
`;

const LINE_VERT = /* glsl */ `
  ${MOTION_GLSL}
  uniform float uOpacity, uDark, uLines;
  uniform vec3 uFade, uHot;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float e, m, push;
    vec3 p = motion(e, m, push);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    float far = clamp((depth - 1.6) / 2.0, 0.0, 1.0);
    float lineIn = clamp((uIntro - 0.55) / 0.45, 0.0, 1.0);
    vAlpha = uOpacity * mix(1.0, 0.25, far) * lineIn * uLines;
    float fd = length(position - uFocus);
    float f = uFocusOn * pow(smoothstep(0.62, 0.0, fd), 0.8);
    vec3 rest = mix(aColor, uFade, uFocusOn * 0.8);
    vColor = mix(rest, uHot, max(f, push * 0.8)) * (1.0 + 0.35 * uDark);
  }
`;

const LINE_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    if (vAlpha < 0.01) discard;
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

const RIM_VERT = /* glsl */ `
  uniform float uIntro, uShell;
  varying vec3 vN, vV;
  void main() {
    float e = 1.0 - pow(1.0 - clamp((uIntro - 0.2) / 0.8, 0.0, 1.0), 3.0);
    float s = mix(0.7, 1.0, e) * mix(0.6, 1.0, uShell);
    vec4 mv = modelViewMatrix * vec4(position * s, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const RIM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength, uIntro, uShell;
  varying vec3 vN, vV;
  void main() {
    float fr = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 4.0);
    float e = clamp((uIntro - 0.3) / 0.7, 0.0, 1.0);
    float a = fr * uStrength * e * uShell;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

// ---------- helpers ----------
const hash = (x, y, z) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
const mix = (a, b, t) => a + (b - a) * t;
const vnoise = (x, y, z) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const h = (i, j, k) => hash(xi + i, yi + j, zi + k);
  return mix(
    mix(mix(h(0, 0, 0), h(1, 0, 0), u), mix(h(0, 1, 0), h(1, 1, 0), u), v),
    mix(mix(h(0, 0, 1), h(1, 0, 1), u), mix(h(0, 1, 1), h(1, 1, 1), u), v),
    w
  );
};
const fbm = (x, y, z) => vnoise(x, y, z) * 0.55 + vnoise(x * 2.7, y * 2.7, z * 2.7) * 0.3 + vnoise(x * 6.1, y * 6.1, z * 6.1) * 0.15;

// deterministic PRNG so every load (and every station layout) is identical
const makeRng = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const rng = makeRng(1337);
const randDir = (r = rng) => {
  let x = 0, y = 0, z = 0, l = 2;
  while (l > 1 || l < 1e-4) {
    x = r() * 2 - 1; y = r() * 2 - 1; z = r() * 2 - 1;
    l = x * x + y * y + z * z;
  }
  l = Math.sqrt(l);
  return { x: x / l, y: y / l, z: z / l };
};

// the cortex envelope shared by the point sampler and the rim shell
function cortex(d, side, gyri = 0.34) {
  let x = d.x * 0.6, y = d.y * 0.5, z = d.z * 0.78;
  if (y < 0) y *= 0.74;
  if (z > 0.25) y *= 1 - (z - 0.25) * 0.16;
  const w = 1 + (fbm(x * 4 + side * 9, y * 4, z * 4) - 0.5) * gyri;
  x *= w; y *= w; z *= w;
  x += side * 0.012;
  y += 0.1;
  return [x, y, z];
}

// ---------- station shape samplers: each returns a flat Float32Array of exactly N points ----------
// A shape is a list of primitives with a weight (its length/area); N points are
// distributed proportionally so silhouettes stay crisp at any budget.
function sampleShape(prims, N, r) {
  const total = prims.reduce((s, p) => s + p.w, 0);
  const out = new Float32Array(N * 3);
  let i = 0;
  prims.forEach((p, k) => {
    const n = k === prims.length - 1 ? N - i : Math.round((p.w / total) * N);
    for (let j = 0; j < n && i < N; j++, i++) {
      const [x, y, z] = p.f(r(), r(), r());
      out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
    }
  });
  while (i < N) { // rounding leftovers land on the first primitive
    const [x, y, z] = prims[0].f(r(), r(), r());
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
    i++;
  }
  return out;
}
const seg = (a, b, jit = 0.004) => ({ w: Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), f: (u, v, w) => [a[0] + (b[0] - a[0]) * u + (v - 0.5) * jit, a[1] + (b[1] - a[1]) * u + (w - 0.5) * jit, a[2] + (b[2] - a[2]) * u + (v - 0.5) * jit] });
// rounded-rectangle outline in the XY plane at depth z, optionally offset
function roundedRect(w, h, rr, z, weight = 1, ox = 0, oy = 0) {
  const sx = w / 2 - rr, sy = h / 2 - rr;
  const straight = [w - 2 * rr, h - 2 * rr, w - 2 * rr, h - 2 * rr];
  const arc = (Math.PI / 2) * rr;
  const per = 2 * (w + h) - 8 * rr + 2 * Math.PI * rr;
  const corners = [[sx, sy], [-sx, sy], [-sx, -sy], [sx, -sy]];
  return { w: per * weight, f: (u) => {
    let t = u * per;
    for (let k = 0; k < 4; k++) {
      if (t < straight[k]) {
        const s = t / straight[k];
        if (k === 0) return [ox + sx - s * (w - 2 * rr), oy + h / 2, z];
        if (k === 1) return [ox - w / 2, oy + sy - s * (h - 2 * rr), z];
        if (k === 2) return [ox - sx + s * (w - 2 * rr), oy - h / 2, z];
        return [ox + w / 2, oy - sy + s * (h - 2 * rr), z];
      }
      t -= straight[k];
      if (t < arc) {
        const a = (t / arc) * (Math.PI / 2) + (Math.PI / 2) * (k + 1);
        const [cx, cy] = corners[(k + 1) % 4];
        return [ox + cx + Math.cos(a) * rr, oy + cy + Math.sin(a) * rr, z];
      }
      t -= arc;
    }
    return [ox + sx, oy + h / 2, z];
  } };
}
const circle = (cx, cy, cz, r, weight = 1) => ({ w: 2 * Math.PI * r * weight, f: (u, v) => { const a = u * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, cz + (v - 0.5) * 0.01]; } });
const disc = (cx, cy, cz, r, weight = 1) => ({ w: Math.PI * r * r * weight * 6, f: (u, v) => { const a = u * Math.PI * 2, rr = Math.sqrt(v) * r; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, cz]; } });

function phoneShape(N, r) {
  const W = 0.78, H = 1.5, D = 0.09, R = 0.12;
  const prims = [roundedRect(W, H, R, D / 2, 2.2), roundedRect(W, H, R, -D / 2, 1.2)];
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    prims.push(seg([sx * (W / 2 - R * 0.3), sy * (H / 2 - R * 0.3), -D / 2], [sx * (W / 2 - R * 0.3), sy * (H / 2 - R * 0.3), D / 2]));
  }
  prims.push(roundedRect(W - 0.09, H - 0.11, R * 0.7, D / 2 + 0.005, 1.3)); // screen bezel
  // UI: a header row, an image tile, four list rows, a pill CTA
  const z = D / 2 + 0.01;
  prims.push(seg([-0.28, 0.56, z], [0.0, 0.56, z], 0.012));
  prims.push(circle(0.24, 0.56, z, 0.035, 1.5));
  prims.push(roundedRect(0.56, 0.24, 0.04, z, 1.4, 0, 0.33));
  for (let k = 0; k < 4; k++) {
    const y = 0.1 - k * 0.15;
    prims.push(seg([-0.22, y, z], [-0.22 + (0.34 + (k % 2) * 0.16), y, z], 0.012));
    prims.push(circle(-0.29, y, z, 0.018, 0.5));
  }
  prims.push(roundedRect(0.5, 0.11, 0.055, z, 2.0, 0, -0.6));
  return sampleShape(prims, N, r);
}

function codeShape(N, r) {
  const W = 1.62, H = 1.08, z = 0;
  const prims = [roundedRect(W, H, 0.06, z, 2.4), seg([-W / 2, H / 2 - 0.12, z], [W / 2, H / 2 - 0.12, z], 0.006)];
  prims.push(circle(-W / 2 + 0.09, H / 2 - 0.06, z, 0.02, 0.8), circle(-W / 2 + 0.16, H / 2 - 0.06, z, 0.02, 0.8), circle(-W / 2 + 0.23, H / 2 - 0.06, z, 0.02, 0.8));
  // twelve lines of code with indentation, like a real editor
  const indents = [0, 1, 2, 2, 1, 0, 0, 1, 2, 3, 1, 0];
  const lens = [0.55, 0.42, 0.66, 0.38, 0.5, 0.2, 0.6, 0.48, 0.7, 0.34, 0.44, 0.26];
  for (let k = 0; k < 12; k++) {
    const y = H / 2 - 0.24 - k * 0.066;
    const x0 = -W / 2 + 0.12 + indents[k] * 0.09;
    prims.push(seg([x0, y, z], [x0 + lens[k], y, z], 0.014));
  }
  // a floating "commit" node: tests passed
  prims.push(circle(W / 2 - 0.18, -H / 2 + 0.16, z + 0.02, 0.07, 2.0));
  prims.push(seg([W / 2 - 0.23, -H / 2 + 0.16, z + 0.02], [W / 2 - 0.19, -H / 2 + 0.12, z + 0.02], 0.01), seg([W / 2 - 0.19, -H / 2 + 0.12, z + 0.02], [W / 2 - 0.12, -H / 2 + 0.21, z + 0.02], 0.01));
  return sampleShape(prims, N, r);
}

function cloudShape(N, r) {
  const prims = [];
  const S = 0.42, C = 0.24;
  const corners = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) corners.push([x * S, y * S, z * S]);
  const h = C / 2;
  const v = [[-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h], [-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h]];
  const EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  for (const [cx, cy, cz] of corners) {
    for (const [a, b] of EDGES) prims.push(seg([cx + v[a][0], cy + v[a][1], cz + v[a][2]], [cx + v[b][0], cy + v[b][1], cz + v[b][2]], 0.006));
  }
  // connectors between neighbouring cubes along the axes (the "network")
  for (const [cx, cy, cz] of corners) {
    for (const d of [[S, 0, 0], [0, S, 0], [0, 0, S]]) {
      const nx = cx + d[0], ny = cy + d[1], nz = cz + d[2];
      if (Math.abs(nx) > S + 0.01 || Math.abs(ny) > S + 0.01 || Math.abs(nz) > S + 0.01) continue;
      const f = (C / 2) / S;
      prims.push(seg([cx + d[0] * f, cy + d[1] * f, cz + d[2] * f], [nx - d[0] * f, ny - d[1] * f, nz - d[2] * f], 0.02));
    }
  }
  // three orbiting service nodes
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    prims.push(disc(Math.cos(a) * 1.05, 0.15 * Math.sin(a * 2), Math.sin(a) * 1.05, 0.06, 2));
  }
  return sampleShape(prims, N, r);
}

function runShape(N, r) {
  const prims = [];
  const R = 0.74, T = 0.05;
  prims.push({ w: 2 * Math.PI * R * 4, f: (u, v) => { const a = u * Math.PI * 2, b = v * Math.PI * 2; const rr = R + Math.cos(b) * T; return [Math.cos(a) * rr, Math.sin(b) * T, Math.sin(a) * rr]; } });
  // core: the agent
  prims.push({ w: 1.6, f: () => { const d = randDir(r); const s = 0.17 * (0.75 + r() * 0.25); return [d.x * s, d.y * s + 0.02, d.z * s]; } });
  // three checkpoints on the loop (human review where it counts) + spokes
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.4;
    prims.push({ w: 0.5, f: () => { const d = randDir(r); const s = 0.09; return [Math.cos(a) * R + d.x * s, d.y * s, Math.sin(a) * R + d.z * s]; } });
    prims.push(seg([0, 0.02, 0], [Math.cos(a) * (R - 0.1), 0, Math.sin(a) * (R - 0.1)], 0.01));
  }
  return sampleShape(prims, N, r);
}

function worldShape(N, r) {
  const order = Array.from({ length: LAND.length / 2 }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const li = order[i % order.length];
    const [gx, gy, gz] = latLon(LAND[li * 2], LAND[li * 2 + 1]);
    out[i * 3] = gx; out[i * 3 + 1] = gy; out[i * 3 + 2] = gz;
  }
  return out;
}

// the MindfulTech mark, traced from components/Logo.tsx (96×88 viewBox)
function markShape(N, r) {
  const L = [[9, 47, 15, 30], [15, 30, 29, 16], [29, 16, 47, 11], [47, 11, 63, 17], [63, 17, 77, 28], [77, 28, 84, 43], [84, 43, 75, 57], [60, 66, 43, 69], [43, 69, 27, 64], [27, 64, 16, 56], [16, 56, 9, 47], [29, 16, 33, 33], [47, 11, 52, 28], [52, 28, 43, 48], [43, 48, 43, 69], [77, 28, 65, 42], [65, 42, 60, 66], [43, 69, 40, 81]];
  const J = [[9, 47, 3.4], [15, 30, 3], [29, 16, 3.4], [47, 11, 3], [63, 17, 3.4], [77, 28, 3], [84, 43, 3.4], [75, 57, 3], [60, 66, 3.4], [43, 69, 3], [27, 64, 3.4], [16, 56, 2.6], [33, 33, 2.8], [52, 28, 2.8], [43, 48, 3], [65, 42, 2.8], [40, 81, 3]];
  const D = [[23, 23, 1.7], [41, 22, 1.5], [57, 25, 1.7], [72, 38, 1.5], [20, 41, 1.5], [31, 44, 1.7], [56, 52, 1.5], [31, 57, 1.7], [52, 57, 1.5], [24, 50, 1.3], [61, 32, 1.3], [37, 27, 1.3]];
  const S = 1.75 / 96; // ≈1.75 units wide
  const P = (x, y) => [(x - 48) * S, (46 - y) * S];
  const prims = [];
  for (const [x1, y1, x2, y2] of L) { const a = P(x1, y1), b = P(x2, y2); prims.push(seg([a[0], a[1], 0], [b[0], b[1], 0], 0.03)); }
  for (const [x, y, rr] of J) { const c = P(x, y); prims.push(disc(c[0], c[1], 0.01, rr * S * 1.4, 1.2)); }
  for (const [x, y, rr] of D) { const c = P(x, y); prims.push(disc(c[0], c[1], -0.01, rr * S * 1.6, 1.4)); }
  const out = sampleShape(prims, N, r);
  for (let i = 0; i < N; i++) out[i * 3 + 2] += (r() - 0.5) * 0.06; // a hint of depth
  return out;
}

const glowTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.3, 'rgba(255,255,255,.6)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
};

export function createHero({ mount, anchor, overlay, chips, note = null, onStation = null, quality = "high", reduced = false }) {
  const isLite = quality === 'lite';
  const renderer = new THREE.WebGLRenderer({ antialias: !isLite, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isLite ? 1.25 : 1.5));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, mount.clientWidth / mount.clientHeight, 0.1, 40);
  const mode = 'light';
  // the object is framed on the anchor box with a shift-lens (off-axis frustum):
  // the canvas is full-bleed behind the hero, so no rectangle edge ever shows
  let HOME_Z = 3.55;
  let box = { x: 0, y: 0, w: mount.clientWidth, h: mount.clientHeight };
  const frameAnchor = () => {
    const mr = mount.getBoundingClientRect();
    const ar = (anchor || mount).getBoundingClientRect();
    box = { x: ar.left - mr.left, y: ar.top - mr.top, w: ar.width, h: ar.height };
    const W = mount.clientWidth, H = mount.clientHeight;
    if (!W || !H || !box.w || !box.h) return;
    const ppu = box.h / (mode === 'card' ? 2.75 : 2.3); // pixels per world unit at the object's depth
    HOME_Z = (H / 2) / (Math.tan((camera.fov * Math.PI) / 360) * ppu);
    camera.setViewOffset(W, H, W / 2 - (box.x + box.w / 2), H / 2 - (box.y + box.h / 2), W, H);
    // dark card: only the card window shows the canvas
    mount.style.clipPath = mode === 'card' ? `inset(${box.y}px ${W - box.x - box.w}px ${H - box.y - box.h}px ${box.x}px round 22px)` : '';
  };
  frameAnchor();
  camera.position.set(0, 0.12, HOME_Z);
  camera.lookAt(0, -0.02, 0);

  // ---------- sample the anatomy (the BRAIN station, also the synapse graph) ----------
  const pts = [], cols = [], scat = [], seeds = [];
  const colBack = new THREE.Color('#3f9e76');
  const colFront = new THREE.Color('#57c295');
  const colCb = new THREE.Color('#2f8d6c');
  const colSt = new THREE.Color('#3f8f70');
  const tmp = new THREE.Color();
  const perHemi = isLite ? 850 : 1750, nCb = isLite ? 200 : 420, nSt = isLite ? 90 : 190;
  const push = (x, y, z, c) => {
    pts.push(x, y, z);
    const v = 0.78 + rng() * 0.4;
    cols.push(c.r * v, c.g * v, c.b * v);
    // assembly start: scattered below/behind so the brain builds bottom-up
    const d = randDir();
    const r = 1.6 + rng() * 2.2;
    scat.push(x + d.x * r, y + d.y * r - 0.4, z + d.z * r - 0.6);
    seeds.push(rng());
  };
  for (const side of [-1, 1]) {
    let n = 0;
    while (n < perHemi) {
      const d = randDir();
      if (d.x * side < 0.015) continue;
      const [x, y, z] = cortex(d, side);
      const m = Math.min(Math.max((z + 0.85) / 1.7, 0), 1);
      tmp.copy(colBack).lerp(colFront, m);
      push(x, y, z, tmp);
      n++;
    }
  }
  for (let i = 0; i < nCb; i++) {
    const d = randDir();
    let x = d.x * 0.22, y = d.y * 0.15, z = d.z * 0.2;
    const bands = Math.sin(y * 46 + fbm(x * 5, y * 5, z * 5) * 3) * 0.5 + 0.5;
    const w = 1 + (bands - 0.5) * 0.16 + (fbm(x * 6, y * 6, z * 6) - 0.5) * 0.1;
    x *= w; y *= w; z *= w;
    push(x, y - 0.28, z - 0.52, colCb);
  }
  for (let i = 0; i < nSt; i++) {
    const t = rng(), a = rng() * Math.PI * 2;
    const r = (0.13 - 0.05 * t) * (0.7 + rng() * 0.5);
    push(Math.cos(a) * r, -0.14 - t * 0.55, -0.16 - t * 0.26 + Math.sin(a) * r, colSt);
  }
  const N = pts.length / 3;
  const posArr = new Float32Array(pts);
  const colArr = new Float32Array(cols);
  const scatArr = new Float32Array(scat);
  const seedArr = new Float32Array(seeds);

  // ---------- the other stations ----------
  const targets = {
    brain: posArr,
    app: phoneShape(N, makeRng(11)),
    code: codeShape(N, makeRng(22)),
    cloud: cloudShape(N, makeRng(33)),
    run: runShape(N, makeRng(44)),
    world: worldShape(N, makeRng(55)),
    mark: markShape(N, makeRng(66)),
  };
  const fromArr = new Float32Array(posArr);
  const toArr = new Float32Array(posArr);

  const shared = {
    uTime: { value: 0 },
    uIntro: { value: reduced ? 1 : 0 },
    uMouse: { value: new THREE.Vector3(9, 9, 9) },
    uMouseOn: { value: 0 },
    uFocus: { value: new THREE.Vector3(0, 0, 0) },
    uFocusOn: { value: 0 },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uDark: { value: 0 },
    uFade: { value: new THREE.Color('#aebbd2') },
    uHot: { value: new THREE.Color('#6f5ae0') },
    uStill: { value: 0 },
  };
  const pointUniforms = { ...shared, uMorph: { value: 1 }, uSize: { value: isLite ? 10.5 : 12 }, uOpacity: { value: 1.0 }, uTint: { value: new THREE.Color('#4FAE87') }, uTintMix: { value: 0 } };
  const lineUniforms = { ...shared, uMorph: { value: 1 }, uOpacity: { value: 0.4 }, uLines: { value: 1 } };

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(colArr, 3));
  geo.setAttribute('aScatter', new THREE.BufferAttribute(scatArr, 3));
  geo.setAttribute('aFrom', new THREE.BufferAttribute(fromArr, 3));
  geo.setAttribute('aTo', new THREE.BufferAttribute(toArr, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seedArr, 1));
  const ptsMat = new THREE.ShaderMaterial({ uniforms: pointUniforms, vertexShader: POINT_VERT, fragmentShader: POINT_FRAG, transparent: true, depthWrite: false });
  const cloud = new THREE.Points(geo, ptsMat);
  cloud.frustumCulled = false;

  // ---------- synapses (brain station only) ----------
  const cell = 0.13;
  const grid = new Map();
  const gk = (i, j, k) => i + ',' + j + ',' + k;
  for (let i = 0; i < N; i++) {
    const k = gk(Math.floor(posArr[i * 3] / cell), Math.floor(posArr[i * 3 + 1] / cell), Math.floor(posArr[i * 3 + 2] / cell));
    let a = grid.get(k);
    if (!a) grid.set(k, (a = []));
    a.push(i);
  }
  const edges = [];
  const adj = Array.from({ length: N }, () => []);
  const maxD2 = 0.125 * 0.125;
  for (let i = 0; i < N; i++) {
    const xi = posArr[i * 3], yi = posArr[i * 3 + 1], zi = posArr[i * 3 + 2];
    const ci = Math.floor(xi / cell), cj = Math.floor(yi / cell), ck = Math.floor(zi / cell);
    const cand = [];
    for (let a = -1; a <= 1; a++)
      for (let b = -1; b <= 1; b++)
        for (let c = -1; c <= 1; c++) {
          const arr = grid.get(gk(ci + a, cj + b, ck + c));
          if (!arr) continue;
          for (const j of arr) {
            if (j <= i) continue;
            const dx = posArr[j * 3] - xi, dy = posArr[j * 3 + 1] - yi, dz = posArr[j * 3 + 2] - zi;
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 < maxD2) cand.push([d2, j]);
          }
        }
    cand.sort((p, q) => p[0] - q[0]);
    for (let m = 0; m < Math.min(2, cand.length); m++) {
      const j = cand[m][1], e = edges.length;
      edges.push([i, j]);
      adj[i].push(e);
      adj[j].push(e);
    }
  }
  const E = edges.length;
  const lpos = new Float32Array(E * 6), lcol = new Float32Array(E * 6), lscat = new Float32Array(E * 6), lseed = new Float32Array(E * 2);
  edges.forEach(([a, b], e) => {
    for (let k = 0; k < 3; k++) {
      lpos[e * 6 + k] = posArr[a * 3 + k]; lpos[e * 6 + 3 + k] = posArr[b * 3 + k];
      lcol[e * 6 + k] = colArr[a * 3 + k] * 0.62; lcol[e * 6 + 3 + k] = colArr[b * 3 + k] * 0.62;
      lscat[e * 6 + k] = scatArr[a * 3 + k]; lscat[e * 6 + 3 + k] = scatArr[b * 3 + k];
    }
    lseed[e * 2] = seedArr[a]; lseed[e * 2 + 1] = seedArr[b];
  });
  const lgeo = new THREE.BufferGeometry();
  lgeo.setAttribute('position', new THREE.BufferAttribute(lpos, 3));
  lgeo.setAttribute('aColor', new THREE.BufferAttribute(lcol, 3));
  lgeo.setAttribute('aScatter', new THREE.BufferAttribute(lscat, 3));
  lgeo.setAttribute('aFrom', new THREE.BufferAttribute(lpos, 3));
  lgeo.setAttribute('aTo', new THREE.BufferAttribute(lpos, 3));
  lgeo.setAttribute('aSeed', new THREE.BufferAttribute(lseed, 1));
  const lMat = new THREE.ShaderMaterial({ uniforms: lineUniforms, vertexShader: LINE_VERT, fragmentShader: LINE_FRAG, transparent: true, depthWrite: false });
  const lines = new THREE.LineSegments(lgeo, lMat);
  lines.frustumCulled = false;

  // ---------- impulses (CPU, along real synapse paths; trail dims toward the tail) ----------
  const glow = glowTexture();
  const NP = isLite ? 70 : 150, TR = 4;
  const ppos = new Float32Array(NP * TR * 3);
  const pcol = new Float32Array(NP * TR * 3);
  const headC = [0.44, 0.35, 0.9];
  const dim = [1, 0.62, 0.38, 0.2];
  for (let p = 0; p < NP; p++)
    for (let s = 0; s < TR; s++)
      for (let k = 0; k < 3; k++) pcol[(p * TR + s) * 3 + k] = headC[k] * (0.35 + 0.65 * dim[s]) + (s === 0 ? 0.25 : 0);
  const eLen = edges.map(([a, b]) => Math.hypot(posArr[b * 3] - posArr[a * 3], posArr[b * 3 + 1] - posArr[a * 3 + 1], posArr[b * 3 + 2] - posArr[a * 3 + 2]));
  const pulses = [];
  for (let p = 0; p < NP; p++) pulses.push({ e: (rng() * E) | 0, dir: rng() < 0.5 ? 1 : -1, t: rng(), sp: (0.9 + rng() * 1.6) * 0.15 });
  const pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
  pgeo.setAttribute('color', new THREE.BufferAttribute(pcol, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.078, map: glow, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true });
  const pulseCloud = new THREE.Points(pgeo, pMat);
  pulseCloud.frustumCulled = false;
  const writePulse = (pu, tt, slot) => {
    const [a, b] = edges[pu.e];
    const from = pu.dir > 0 ? a : b, to = pu.dir > 0 ? b : a;
    for (let k = 0; k < 3; k++) ppos[slot * 3 + k] = posArr[from * 3 + k] + (posArr[to * 3 + k] - posArr[from * 3 + k]) * tt;
  };
  let burst = 0;
  const updatePulses = (dt) => {
    for (let p = 0; p < NP; p++) {
      const pu = pulses[p];
      pu.t += (dt * pu.sp * (1 + burst * 1.6)) / Math.max(eLen[pu.e], 0.02);
      if (pu.t >= 1) {
        const [a, b] = edges[pu.e];
        const node = pu.dir > 0 ? b : a;
        const opts = adj[node];
        const ne = opts.length ? opts[(Math.random() * opts.length) | 0] : (Math.random() * E) | 0;
        pu.e = ne;
        pu.dir = edges[ne][0] === node ? 1 : edges[ne][1] === node ? -1 : Math.random() < 0.5 ? 1 : -1;
        pu.t = 0;
      }
      for (let s = 0; s < TR; s++) writePulse(pu, Math.max(pu.t - s * 0.16, 0), p * TR + s);
    }
    pgeo.attributes.position.needsUpdate = true;
  };

  // ---------- rim shell + core glow (brain volume) ----------
  const rimUniforms = { uColor: { value: new THREE.Color('#4FAE87') }, uStrength: { value: 0.3 }, uIntro: shared.uIntro, uShell: { value: 1 } };
  const rimMat = new THREE.ShaderMaterial({ uniforms: rimUniforms, vertexShader: RIM_VERT, fragmentShader: RIM_FRAG, transparent: true, depthWrite: false, side: THREE.FrontSide });
  const shell = new THREE.Group();
  for (const side of [-1, 1]) {
    const sg = new THREE.SphereGeometry(1, isLite ? 40 : 72, isLite ? 28 : 52, side < 0 ? Math.PI : 0, Math.PI);
    const pa = sg.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const [x, y, z] = cortex({ x: pa.getX(i), y: pa.getY(i), z: pa.getZ(i) }, side, 0.1);
      pa.setXYZ(i, x * 0.99, y * 0.99, z * 0.99);
    }
    sg.computeVertexNormals();
    shell.add(new THREE.Mesh(sg, rimMat));
  }
  const coreMat = new THREE.SpriteMaterial({ map: glow, color: new THREE.Color('#8fd9c0'), transparent: true, opacity: 0, depthWrite: false, depthTest: false });
  const core = new THREE.Sprite(coreMat);
  core.scale.setScalar(2.1);
  core.position.set(0, 0.05, 0);
  // contact shadow under the object (light stage): grounds it on the page
  const shadowMat = new THREE.SpriteMaterial({ map: glow, color: new THREE.Color('#24344E'), transparent: true, opacity: 0, depthWrite: false, depthTest: false });
  const shadow = new THREE.Sprite(shadowMat);
  shadow.scale.set(1.9, 0.5, 1);
  shadow.position.set(0, -0.95, 0);

  const haloMat = new THREE.SpriteMaterial({ map: glow, color: new THREE.Color('#7d67f0'), transparent: true, opacity: 0, depthWrite: false, depthTest: false });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.setScalar(0.7);

  // ---------- world station extras: client pins + arcs from Quito ----------
  const pinGeo = new THREE.BufferGeometry();
  const pinPos = new Float32Array(CLIENTS.length * 3);
  CLIENTS.forEach((c, i) => {
    const [x, y, z] = latLon(c.lat, c.lon, GLOBE_R + 0.012);
    pinPos[i * 3] = x; pinPos[i * 3 + 1] = y; pinPos[i * 3 + 2] = z;
  });
  pinGeo.setAttribute('position', new THREE.BufferAttribute(pinPos, 3));
  const pinMat = new THREE.PointsMaterial({ size: 0.11, map: glow, color: new THREE.Color('#6f5ae0'), transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true });
  const pins = new THREE.Points(pinGeo, pinMat);
  const arcs = new THREE.Group();
  const home = CLIENTS.find((c) => c.home);
  const hv = new THREE.Vector3(...latLon(home.lat, home.lon));
  const arcLines = [];
  for (const c of CLIENTS) {
    if (c.home) continue;
    const tv = new THREE.Vector3(...latLon(c.lat, c.lon));
    const midv = hv.clone().add(tv).multiplyScalar(0.5);
    midv.normalize().multiplyScalar(GLOBE_R * (1 + hv.distanceTo(tv) * 0.42));
    const curve = new THREE.QuadraticBezierCurve3(hv, midv, tv);
    const ag = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
    const am = new THREE.LineBasicMaterial({ color: new THREE.Color('#6f5ae0'), transparent: true, opacity: 0, depthWrite: false });
    const al = new THREE.Line(ag, am);
    al.geometry.setDrawRange(0, 0);
    arcLines.push(al);
    arcs.add(al);
  }

  const brain = new THREE.Group();
  brain.add(cloud, lines, pulseCloud, shell, core, shadow, halo, pins, arcs);
  brain.rotation.set(0.06, -0.55, 0);
  scene.add(brain);


  // ---------- station machine ----------
  const state = {
    intro: reduced ? 1 : 0,
    station: 'brain',
    morphT: 1, // 0→1 during a morph
    focus: null, hover: null,
    rotX: 0.06, rotY: -0.55, targetX: 0.06, targetY: -0.55,
    spin: 0, dragging: false, moved: 0,
    mouse: { x: 0, y: 0, on: false },
    zoom: HOME_Z,
    scroll: 0,
    lines: 1, shell: 1, arcIn: 0, tintMix: 0,
  };
  const tint = new THREE.Color('#4FAE87');
  const goTo = (name) => {
    if (!targets[name] || (name === state.station && state.morphT >= 1)) return;
    // freeze the current (possibly mid-morph) positions as the new origin
    const m = state.morphT >= 1 ? 1 : state.morphT * state.morphT * (3 - 2 * state.morphT);
    for (let i = 0; i < N * 3; i++) fromArr[i] = fromArr[i] + (toArr[i] - fromArr[i]) * m;
    toArr.set(targets[name]);
    geo.attributes.aFrom.needsUpdate = true;
    geo.attributes.aTo.needsUpdate = true;
    state.station = name;
    state.morphT = reduced ? 1 : 0;
    morphStart = performance.now();
    if (name !== 'brain') state.focus = null;
    if (onStation) onStation(name);
  };

  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const ndc = new THREE.Vector2();
  const hit = new THREE.Vector3();
  const inv = new THREE.Matrix4();

  const onMove = (e) => {
    const r = mount.getBoundingClientRect();
    state.mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    state.mouse.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    state.mouse.on = true;
    if (state.dragging && state.drag) {
      const dx = e.clientX - state.drag.x, dy = e.clientY - state.drag.y;
      state.drag = { x: e.clientX, y: e.clientY };
      state.targetY += dx * 0.006;
      state.targetX = Math.max(-0.9, Math.min(0.9, state.targetX + dy * 0.004));
      state.moved += Math.abs(dx) + Math.abs(dy);
    }
  };
  const onLeave = () => { state.mouse.on = false; };
  const onDown = (e) => {
    if (e.target.closest && e.target.closest('.chip, .note-card, a, button')) return;
    state.dragging = true;
    state.moved = 0;
    state.drag = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => { state.dragging = false; };
  mount.addEventListener('pointermove', onMove);
  mount.addEventListener('pointerleave', onLeave);
  mount.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);

  // ---------- chips anchored in 3D + proof card beside the active chip ----------
  const ctx = overlay.getContext('2d');
  const v3 = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  const camDir = new THREE.Vector3();
  const layoutChips = (w, h) => {
    const dpr = Math.min(devicePixelRatio, 2);
    if (overlay.width !== Math.round(w * dpr) || overlay.height !== Math.round(h * dpr)) { overlay.width = Math.round(w * dpr); overlay.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const chipsIn = Math.max(0, Math.min(1, (state.intro - 0.85) / 0.15)) * (1 - 0.6 * state.scroll);
    v3.set(0, 0.05, 0).applyMatrix4(brain.matrixWorld);
    const viewZ = Math.abs(v3.clone().applyMatrix4(camera.matrixWorldInverse).z);
    const pxPerUnit = (h / 2) / (Math.tan((camera.fov * Math.PI) / 360) * viewZ);
    const ring = pxPerUnit * 0.98 + (w < 640 ? 30 : 46);
    v3.project(camera);
    const ccx = (v3.x * 0.5 + 0.5) * w, ccy = (-v3.y * 0.5 + 0.5) * h;
    camera.getWorldDirection(camDir);
    const spill = mode === 'card' ? -6 : w < 640 ? 8 : 44;
    let activeChip = null;
    for (const chip of chips) {
      const p = REGIONS[chip.key];
      v3.set(p[0], p[1], p[2]).applyMatrix4(brain.matrixWorld);
      v3.project(camera);
      const ax = (v3.x * 0.5 + 0.5) * w, ay = (-v3.y * 0.5 + 0.5) * h;
      nrm.set(p[0], p[1], p[2]).normalize().transformDirection(brain.matrixWorld);
      const behind = -nrm.dot(camDir) < -0.1;
      let dx = ax - ccx, dy = ay - ccy;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      let bx = ccx + dx * ring * 1.06 + chip.nudge[0] * (w < 640 ? 0.4 : 1);
      let by = ccy + dy * ring * 0.86 + chip.nudge[1] * (w < 640 ? 0.4 : 1);
      const active = chip.station === state.station && (state.station !== 'brain' || state.focus === chip.key);
      const hot = active || state.hover === chip.key;
      if (active) { bx = ccx + ring * 0.8; by = ccy - ring * 0.7; } // callout on the up-right diagonal
      const el = chip.el;
      const ew = el.offsetWidth, eh = el.offsetHeight;
      bx = Math.max(box.x + ew / 2 - spill, Math.min(box.x + box.w - ew / 2 + spill, bx));
      by = Math.max(box.y + eh / 2 - 30, Math.min(box.y + box.h - eh / 2 + 30, by));
      bx = Math.max(ew / 2 + 6, Math.min(w - ew / 2 - 6, bx));
      by = Math.max(eh / 2 + 6, Math.min(h - eh / 2 - 6, by));
      const dimmed = state.station !== 'brain' ? !active : state.focus && state.focus !== chip.key;
      const alpha = chipsIn * (dimmed ? 0.35 : behind ? 0.55 : 1);
      chip.screen = { x: bx, y: by, w: ew, h: eh, ax, ay, alpha, hot, behind, active };
      if (active) activeChip = chip;
    }
    // 1-D collision pass: chips that land on each other slide apart vertically (active one stays)
    const placed = chips.filter((c) => c.screen).sort((a, b) => a.screen.y - b.screen.y);
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
        const A = placed[i].screen, B = placed[j].screen;
        const ox = (A.w + B.w) / 2 + 8 - Math.abs(A.x - B.x);
        const oy = (A.h + B.h) / 2 + 6 - Math.abs(A.y - B.y);
        if (ox > 0 && oy > 0) {
          const mover = A.active ? B : B.active ? A : B;
          const other = mover === A ? B : A;
          mover.y = other.y + (mover.y >= other.y ? 1 : -1) * ((A.h + B.h) / 2 + 6);
          mover.y = Math.max(mover.h / 2 + 6, Math.min(h - mover.h / 2 - 6, mover.y));
        }
      }
    }
    for (const chip of chips) {
      const { x: bx, y: by, w: ew, h: eh, ax, ay, alpha, hot, behind } = chip.screen;
      const el = chip.el;
      el.style.transform = `translate(${(bx - ew / 2).toFixed(1)}px, ${(by - eh / 2).toFixed(1)}px)`;
      el.style.opacity = alpha.toFixed(3);
      el.style.zIndex = hot ? 6 : behind ? 2 : 4;
      el.style.pointerEvents = chipsIn > 0.5 ? 'auto' : 'none';
      if (alpha > 0.02) {
        ctx.globalAlpha = alpha * (hot ? 0.95 : 0.6);
        ctx.setLineDash(behind && !hot ? [3, 4] : []);
        ctx.strokeStyle = hot ? '#6f5ae0' : mode === 'card' ? '#7ee0b8' : '#4FAE87';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = hot ? 1.6 : 1.1;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ax, ay); ctx.stroke();
        ctx.beginPath(); ctx.arc(ax, ay, hot ? 4.5 : 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = alpha * 0.35;
        ctx.beginPath(); ctx.arc(ax, ay, hot ? 11 : 7, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    // proof card: beside the active chip, flipped to whichever side has room; else under the object
    if (note && note.firstElementChild) {
      const nw = note.offsetWidth, nh = note.offsetHeight;
      let nx, ny;
      if (activeChip) {
        const s = activeChip.screen;
        nx = Math.min(s.x + s.w / 2, box.x + box.w + spill) - nw;
        ny = s.y + s.h / 2 + 10;
      } else {
        nx = ccx - nw / 2;
        ny = box.y + box.h - nh - 12;
      }
      nx = Math.max(8, Math.min(w - nw - 8, nx));
      ny = Math.max(8, Math.min(h - nh - 8, ny));
      note.style.transform = `translate(${nx.toFixed(1)}px, ${ny.toFixed(1)}px)`;
    }
  };

  // ---------- run loop ----------
  let raf = 0, running = false, visible = true, skip = false;
  let last = performance.now(), elapsed = 0, introStart = null, frameNo = 0, morphStart = 0;
  const tmpV = new THREE.Vector3();
  const lerp = (a, b, k) => a + (b - a) * k;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const busy = state.intro < 1 || state.morphT < 1 || state.focus || state.dragging || state.mouse.on || state.scroll > 0;
    if (!busy && !isLite && (skip = !skip)) return; // 30fps when calm
    const now = performance.now();
    if ((frameNo++ & 15) === 0) { frameAnchor(); camera.updateProjectionMatrix(); }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;
    const t = elapsed;
    shared.uTime.value = t;
    if (state.intro < 1) {
      if (introStart === null) introStart = now;
      state.intro = reduced ? 1 : Math.min(1, (now - introStart) / 2100);
      shared.uIntro.value = state.intro;
    }
    // station morph
    if (state.morphT < 1) state.morphT = Math.min(1, (now - morphStart) / 1400);
    pointUniforms.uMorph.value = state.morphT;
    const pose = POSES[state.station];
    const atBrain = state.station === 'brain' ? 1 : 0;
    const k = 1 - Math.pow(0.004, dt);
    state.lines = lerp(state.lines, atBrain, Math.min(1, k * 1.4));
    state.shell = lerp(state.shell, atBrain, k);
    state.arcIn = lerp(state.arcIn, state.station === 'world' && state.morphT > 0.7 ? 1 : 0, k);
    state.tintMix = lerp(state.tintMix, pose.mix, k);
    if (pose.tint) tint.set(pose.tint);
    pointUniforms.uTint.value.lerp(tint, k);
    pointUniforms.uTintMix.value = state.tintMix;
    lineUniforms.uLines.value = state.lines;
    rimUniforms.uShell.value = state.shell;
    shared.uStill.value = 1 - atBrain * 0.6 - 0.4 * (state.station === 'world' ? 1 : 0);
    // camera: pose + idle spin + cursor parallax + drag + focus fly-to
    if (!reduced && !state.dragging && !state.focus) state.spin += dt * pose.spin;
    const parX = state.mouse.on ? state.mouse.y * -0.12 : 0;
    const parY = state.mouse.on ? state.mouse.x * 0.18 : 0;
    let goalX = pose.rx + (state.targetX - 0.06) + parX;
    let goalY = pose.ry + (state.targetY + 0.55) + state.spin + parY;
    let goalZoom = HOME_Z * pose.zoom * (1 + 0.08 * state.scroll);
    if (state.focus && state.station === 'brain') {
      const p = REGIONS[state.focus];
      goalY = -Math.atan2(p[0], p[2]);
      goalX = Math.atan2(p[1], Math.hypot(p[0], p[2]));
      goalZoom = HOME_Z * 0.86;
      const cur = state.rotY;
      goalY = cur + Math.atan2(Math.sin(goalY - cur), Math.cos(goalY - cur));
    }
    state.rotX = lerp(state.rotX, goalX, k);
    state.rotY = lerp(state.rotY, goalY, k);
    state.zoom = lerp(state.zoom, goalZoom, k);
    brain.rotation.set(state.rotX, state.rotY, 0);
    brain.position.y = 0.15 * state.scroll;
    camera.position.z = state.zoom;
    camera.position.y = 0.12;
    camera.lookAt(0, -0.02 + (isLite && state.station === 'world' ? 0.2 : 0), 0);
    if (!reduced && state.intro >= 1) brain.scale.setScalar(1 + Math.sin(t * 1.35) * 0.01 * atBrain);
    brain.updateMatrixWorld();
    // cursor field in object-local space
    if (state.mouse.on && !reduced) {
      ndc.set(state.mouse.x, state.mouse.y);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) {
        inv.copy(brain.matrixWorld).invert();
        hit.applyMatrix4(inv);
        shared.uMouse.value.lerp(hit, 0.35);
        shared.uMouseOn.value += (1 - shared.uMouseOn.value) * 0.12;
      }
    } else shared.uMouseOn.value *= 0.9;
    // region glow (brain only)
    const wantFocus = state.station !== 'brain' ? 0 : state.focus ? 1 : state.hover ? 0.55 : 0;
    shared.uFocusOn.value += (wantFocus - shared.uFocusOn.value) * 0.1;
    const fk = state.focus || state.hover;
    if (fk && REGIONS[fk]) {
      const p = REGIONS[fk];
      shared.uFocus.value.lerp(tmpV.set(p[0], p[1], p[2]), 0.2);
      halo.position.copy(shared.uFocus.value);
    }
    haloMat.opacity = shared.uFocusOn.value * 0.4;
    // impulses + bursts only on the assembled brain
    const pulseOn = Math.max(0, Math.min(1, (state.intro - 0.8) / 0.2)) * state.lines;
    pMat.opacity = (mode === 'card' ? 1 : 0.9) * pulseOn * (1 - 0.6 * shared.uFocusOn.value);
    burst = Math.max(0, Math.sin(t * 0.45) - 0.82) * 5.5;
    if ((!reduced || state.intro < 1) && pulseOn > 0) updatePulses(dt);
    coreMat.opacity = (mode === 'card' ? 0.42 : 0.2) * Math.min(1, state.intro * 1.4) * (0.5 + 0.5 * state.shell);
    shadowMat.opacity = mode === 'card' ? 0 : 0.14 * Math.min(1, state.intro * 1.4) * (1 - state.scroll);
    pinMat.opacity = state.arcIn;
    arcLines.forEach((al, i) => {
      const segN = Math.floor(Math.max(0, Math.min(1, (state.arcIn - i * 0.06) * 1.6)) * 49);
      al.geometry.setDrawRange(0, segN);
      al.material.opacity = 0.75 * state.arcIn;
    });
    renderer.domElement.style.opacity = (1 - 0.45 * state.scroll).toFixed(3);
    renderer.render(scene, camera);
    layoutChips(mount.clientWidth, mount.clientHeight);
  };
  const start = () => { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !document.hidden) start(); else stop(); }, { threshold: 0.02 });
  io.observe(mount);
  const onVis = () => { if (!document.hidden && visible) start(); else stop(); };
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(() => {
    const w = mount.clientWidth, h = mount.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    frameAnchor();
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    shared.uPixelRatio.value = renderer.getPixelRatio();
  });
  ro.observe(mount);
  start();

  return {
    goTo,
    setFocus(key) { state.focus = key; },
    setHover(key) { state.hover = key; },
    setScroll(p) { state.scroll = Math.max(0, Math.min(1, p)); },
    replayIntro() { goTo('brain'); state.intro = 0; shared.uIntro.value = 0; introStart = null; state.focus = null; },
    get state() { return state; },
    stats: { points: N, synapses: E, impulses: NP, stations: STATIONS.length },
    dispose() {
      stop(); io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      mount.removeEventListener('pointermove', onMove);
      mount.removeEventListener('pointerleave', onLeave);
      mount.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
