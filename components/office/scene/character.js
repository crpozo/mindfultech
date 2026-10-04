// A stylised office worker in the "smooth low-poly game character" style: normal
// human proportions (about seven heads tall, slim), smooth-shaded skin, hair
// and trousers, cloth with a faint facet. The skull, torso, pelvis, hair caps
// and beard are parametric surfaces (elliptical rings that follow a profile),
// limbs are ten-sided tapered tubes with ball joints, hands a palm, a curled
// finger block and a thumb. The face has a forehead, cheekbones, a bridged
// nose, eyes with a white, an iris and an upper lid, thin brows, closed lips
// and ears. Outfits: hoodies with a hood ring, drawstrings, kangaroo pocket
// and ribbing, tees, sweaters, collared shirts with ties and lanyards, blazers
// with lapels, cargo or straight trousers or a skirt, sneakers with a white toe
// cap, laces and sole, flats, boots and heels. Everything rigid is merged per
// material, so a person costs ~25 draw calls. Every joint has a current and a
// target value; poses only set targets and `update` eases towards them, so any
// state change blends.
import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

// Body plan (metres). The leg pivots sit HIP_OFF below the hips group; with the
// thigh level on a seat the pivot is ~0.08 above the cushion (thigh radius), so
// hips = seat + 0.13 for every seat in the office.
const HIP_OFF = 0.05, THIGH = 0.4, SHIN = 0.38, ANKLE = 0.07;
const UPPER_ARM = 0.29, FOREARM = 0.26;
export const HIP_STAND = HIP_OFF + THIGH + SHIN + ANKLE; // 0.90
export const HIP_SIT = 0.53; // office chair, seat at 0.40
export const HIP_CHAIR = 0.575; // four-leg chair, seat at 0.445
export const HIP_SOFA = 0.61; // sofa / armchair, seat at 0.48

// joint name → [part, property, axis]
export const JOINTS = [
  ["hipsY", "hips", "position", "y"],
  ["hipsZ", "hips", "position", "z"],
  ["hipsRx", "hips", "rotation", "x"],
  ["torsoRx", "torso", "rotation", "x"],
  ["torsoRy", "torso", "rotation", "y"],
  ["torsoRz", "torso", "rotation", "z"],
  ["headRx", "head", "rotation", "x"],
  ["headRy", "head", "rotation", "y"],
  ["headRz", "head", "rotation", "z"],
  ["shLx", "shL", "rotation", "x"],
  ["shLy", "shL", "rotation", "y"],
  ["shLz", "shL", "rotation", "z"],
  ["shRx", "shR", "rotation", "x"],
  ["shRy", "shR", "rotation", "y"],
  ["shRz", "shR", "rotation", "z"],
  ["elLx", "elL", "rotation", "x"],
  ["elRx", "elR", "rotation", "x"],
  ["hipLx", "hipL", "rotation", "x"],
  ["hipRx", "hipR", "rotation", "x"],
  ["hipLz", "hipL", "rotation", "z"],
  ["hipRz", "hipR", "rotation", "z"],
  ["kneeLx", "kneeL", "rotation", "x"],
  ["kneeRx", "kneeR", "rotation", "x"],
  ["wristLx", "handL", "rotation", "x"],
  ["wristRx", "handR", "rotation", "x"],
];

export const REST = {
  hipsY: HIP_STAND, hipsZ: 0, hipsRx: 0, torsoRx: 0, torsoRy: 0, torsoRz: 0,
  headRx: 0, headRy: 0, headRz: 0,
  shLx: 0, shLy: 0, shLz: -0.06, shRx: 0, shRy: 0, shRz: 0.06, elLx: -0.12, elRx: -0.12,
  hipLx: 0, hipRx: 0, hipLz: 0.012, hipRz: -0.012, kneeLx: 0.04, kneeRx: 0.04,
  wristLx: 0, wristRx: 0,
};

const PI = Math.PI;
/** smooth-shaded standard material; skin is slightly glossy, cloth matte */
const std = (color, roughness = 0.85, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
const EYE_COLORS = { brown: "#4a2c1a", blue: "#3d6a9a", green: "#4a7a55", hazel: "#7a5a2a", dark: "#1c1a1e" };
const SCLERA = std("#f1eee8", 0.35);
const PUPIL = std("#0e0d10", 0.3);
const MOUTH = std("#4a2226", 0.6);
const TEETH = std("#f3f1ea", 0.5);
const GLASS = std("#2a2a30", 0.5, { metalness: 0.3 });
const WHITE = std("#ebe9e2", 0.8);
const DARK = std("#26262c", 0.9);
const BADGE = std("#2a2a30", 0.7);
const BADGE_ICON = std("#f2c14e", 0.7);
const STRING = std("#eeece6", 0.8);
const AGLET = std("#d9d7d1", 0.45);
const HOOD_IN = std("#26262a", 0.95, { side: THREE.DoubleSide });
const MUG_IN = std("#ffffff", 0.5);
const PHONE = std("#1a1b20", 0.4, { metalness: 0.3 });
const PHONE_SCREEN = new THREE.MeshStandardMaterial({ color: "#8fd3ff", emissive: "#5aa9ff", emissiveIntensity: 0.9, roughness: 0.3 });
const SOLE = std("#ecebe6", 0.75);

/** Merge the rigid children of a group (everything not flagged `dynamic`) into one mesh per material. */
function mergeRigid(group, add) {
  const byMat = new Map();
  for (const c of [...group.children]) {
    if (!c.isMesh || c.userData.dynamic || c.children.length) continue;
    c.updateMatrix();
    const g = (c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone()).applyMatrix4(c.matrix);
    if (!byMat.has(c.material)) byMat.set(c.material, { list: [], bot: c.userData.bot });
    byMat.get(c.material).list.push(g);
    group.remove(c);
  }
  for (const [mat, { list, bot }] of byMat) {
    const m = new THREE.Mesh(mergeGeometries(list, false), mat);
    m.castShadow = true;
    m.receiveShadow = true;
    m.userData.bot = bot;
    add(group, m);
  }
}

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
/** A tapered box: bottom w×d, top w×d, height h; `zb`/`zt` shift the bottom/top faces along z (to keep one face vertical, or lean a shape). */
function frustum(wb, db, wt, dt, h, zb = 0, zt = 0) {
  const g = new THREE.BoxGeometry(1, h, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const top = p.getY(i) > 0;
    p.setX(i, (Math.sign(p.getX(i)) * (top ? wt : wb)) / 2);
    p.setZ(i, (Math.sign(p.getZ(i)) * (top ? dt : db)) / 2 + (top ? zt : zb));
  }
  g.computeVertexNormals();
  return g;
}
/** smooth limb segment: an eight-sided tapered tube along y (aligned with the 8-segment ball joints) */
const tube = (rt, rb, h, n = 8) => new THREE.CylinderGeometry(rt, rb, h, n);
/** smooth ball for joints and buns */
const ball = (r, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
/** an ellipsoid with radii rx, ry, rz: hair locks, ears, lips, shoe uppers */
function blob(rx, ry, rz, w = 8, h = 6) {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(rx, ry, rz);
  return g;
}
/** the same attribute set on every geometry so they can be merged */
function finish(g) {
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  const m = mergeVertices(g);
  m.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(m.attributes.position.count * 2), 2));
  m.computeVertexNormals();
  return m;
}
/** A box with rounded edges (a superellipsoid; n = 2 is a ball, 8 nearly square): palms, fingers, pockets. */
function soft(w, h, d, n = 5, seg = 2) {
  const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
  const p = g.attributes.position;
  const hw = w / 2, hh = h / 2, hd = d / 2;
  for (let i = 0; i < p.count; i++) {
    const cx = p.getX(i) / hw, cy = p.getY(i) / hh, cz = p.getZ(i) / hd;
    const k = (Math.abs(cx) ** n + Math.abs(cy) ** n + Math.abs(cz) ** n) ** (-1 / n);
    p.setXYZ(i, cx * k * hw, cy * k * hh, cz * k * hd);
  }
  return finish(g);
}
/** Cloth look: blend the smooth normals towards the face normals by `k`, so the surface keeps a faint facet. */
function facet(geo, k = 0.5) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const p = g.attributes.position, n = g.attributes.normal;
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), N = new THREE.Vector3(), S = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    A.fromBufferAttribute(p, i);
    B.fromBufferAttribute(p, i + 1);
    C.fromBufferAttribute(p, i + 2);
    N.subVectors(B, A).cross(S.subVectors(C, A)).normalize();
    for (let j = 0; j < 3; j++) {
      S.fromBufferAttribute(n, i + j).lerp(N, k).normalize();
      n.setXYZ(i + j, S.x, S.y, S.z);
    }
  }
  return g;
}
/**
 * A smooth surface sampled from `f(v, a, r, pole)` on `rows` rings of `segs` columns; `a` is the
 * angle around y (0 faces +z). `arc` = [a0, a1] makes an open strip instead of a ring;
 * `poleBottom` / `poleTop` collapse the first / last row into one vertex.
 */
function surface(segs, rows, f, { arc = null, poleBottom = false, poleTop = false } = {}) {
  const cols = arc ? segs + 1 : segs;
  const pos = [], idx = [], start = [];
  const v = new THREE.Vector3();
  const angle = (s) => (arc ? arc[0] + ((arc[1] - arc[0]) * s) / segs : (s / segs) * PI * 2);
  for (let r = 0; r < rows; r++) {
    start.push(pos.length / 3);
    const pole = (r === 0 && poleBottom) || (r === rows - 1 && poleTop);
    const n = pole ? 1 : cols;
    for (let s = 0; s < n; s++) {
      f(v, angle(s), r, pole);
      pos.push(v.x, v.y, v.z);
    }
  }
  for (let r = 0; r < rows - 1; r++) {
    const a0 = start[r], b0 = start[r + 1];
    const ap = r === 0 && poleBottom, bp = r + 1 === rows - 1 && poleTop;
    for (let s = 0; s < segs; s++) {
      const s1 = (s + 1) % cols;
      if (ap) idx.push(a0, b0 + s1, b0 + s);
      else if (bp) idx.push(a0 + s, a0 + s1, b0);
      else idx.push(a0 + s, a0 + s1, b0 + s1, a0 + s, b0 + s1, b0 + s);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
/** Linear interpolation of a profile ([y, ...values] rows sorted by y) at height y. */
function profileAt(rows, y) {
  if (y <= rows[0][0]) return rows[0].slice(1);
  for (let i = 1; i < rows.length; i++) {
    const a = rows[i - 1], b = rows[i];
    if (y <= b[0]) {
      const t = (y - a[0]) / (b[0] - a[0]);
      return a.slice(1).map((v, k) => v + ((b[k + 1] ?? v) - v) * t);
    }
  }
  return rows[rows.length - 1].slice(1);
}
/** Point of an elliptical ring: half-width X, front depth Zf, back depth Zb; `ez` < 1 flattens the front, `ex` < 1 flattens the sides. */
function ringPoint(v, a, y, X, Zf, Zb, ez = 1, ex = 1) {
  const s = Math.sin(a), c = Math.cos(a);
  v.set(X * Math.sign(s) * Math.abs(s) ** ex, y, c >= 0 ? Zf * c ** ez : -Zb * (-c) ** ez);
}
/** A body of stacked elliptical rings from `rows` = [y, X, Zf, Zb?, ez?, ex?]; rows with X = 0 are poles. */
function rowsSurface(rows, segs = 12) {
  return surface(segs, rows.length, (v, a, r) => ringPoint(v, a, ...rows[r]), { poleBottom: rows[0][1] === 0, poleTop: rows[rows.length - 1][1] === 0 });
}

// ---- head: profile rows [y above the neck pivot, half width, front depth, back depth, front flatness, side flatness]
const HEAD = [
  [-0.012, 0, 0, 0],
  [0.0, 0.036, 0.05, 0.032],
  [0.012, 0.05, 0.068, 0.042],
  [0.035, 0.064, 0.078, 0.054, 0.85],
  [0.065, 0.071, 0.083, 0.072, 0.75],
  [0.095, 0.079, 0.086, 0.088, 0.72],
  [0.125, 0.084, 0.088, 0.098, 0.72, 0.9],
  [0.15, 0.086, 0.087, 0.102, 0.78, 0.88],
  [0.175, 0.086, 0.086, 0.104, 0.9, 0.88],
  [0.2, 0.083, 0.079, 0.102, 1, 0.9],
  [0.222, 0.074, 0.066, 0.09],
  [0.24, 0.053, 0.044, 0.066],
  [0.25, 0, 0, 0],
];
const HEAD_TOP = HEAD[HEAD.length - 1][0];
const HEAD_C = 0.13; // hair caps scale about this height
/**
 * Point on the skull at angle `a` and height `y`, scaled by `scale` about the head centre.
 * `drop` lets y go below the jaw for hair curtains: the ring keeps the cheek width and flares.
 */
function headAt(v, a, y, scale = 1, drop = false) {
  let k = scale;
  let py = y;
  if (drop && y < 0.105) {
    k *= 1 + 0.9 * (0.105 - y);
    py = 0.105;
  }
  const [X, Zf, Zb, ez, ex] = profileAt(HEAD, py);
  ringPoint(v, a, y, X, Zf, Zb, ez, ex);
  v.x *= k;
  v.z *= k;
  v.y = HEAD_C + (v.y - HEAD_C) * scale;
}
/** z of the face surface at (x, y) */
function faceZ(x, y) {
  const [X, Zf, , ez = 1, ex = 1] = profileAt(HEAD, y);
  const s = Math.min(1, Math.abs(x) / X) ** (1 / ex);
  return Zf * Math.sqrt(Math.max(0, 1 - s * s)) ** ez;
}
/** half width of the head at height y */
const sideX = (y) => profileAt(HEAD, y)[0];
/**
 * A chunky hair cap over the skull: the bottom edge follows `hairline(a)` (folded back into the
 * skull so it reads solid), the shell sits `scale(a, t)` out from the skull and closes at the crown.
 */
function hairCap(hairline, scale, rows = 7, segs = 16) {
  return surface(segs, rows, (v, a, r, pole) => {
    if (pole) return headAt(v, 0, HEAD_TOP, scale(0, 1));
    const y0 = hairline(a);
    const t = r <= 1 ? 0 : (r - 1) / (rows - 2);
    const y = y0 + (HEAD_TOP - y0) * t;
    headAt(v, a, y, r === 0 ? 0.985 : scale(a, t), true);
  }, { poleTop: true });
}

/** Chunky hair with volume: a smooth cap plus a few thick locks, a bun, a tail, curtains or curls per style. */
function buildHair(head, look, hairMat, add) {
  const s = look.hairStyle;
  if (s === "bald") return;
  const f = (a) => 0.5 + 0.5 * Math.cos(a); // 1 at the front, 0 at the nape
  const lock = (rx, ry, rz, x, y, z, ax = 0, ay = 0, az = 0) => {
    const m = mesh(blob(rx, ry, rz, 7, 5), hairMat, x, y, z);
    m.rotation.set(ax, ay, az);
    add(head, m);
    return m;
  };
  const cap = (hairline, scale, rows) => add(head, mesh(hairCap(hairline, scale, rows), hairMat));
  const thick = (base, top = 0.05) => (a, t) => base + top * t;
  if (s === "short") {
    cap((a) => 0.108 + 0.088 * f(a) ** 1.3, thick(1.15, 0.06));
    lock(0.045, 0.011, 0.065, 0.028, 0.262, 0.02, 0, 0.5, -0.1);
    lock(0.04, 0.01, 0.055, -0.03, 0.26, -0.02, 0, -0.4, 0.08);
    lock(0.05, 0.012, 0.028, 0.005, 0.214, 0.09, -0.5, 0, -0.08);
  }
  if (s === "swept") {
    // a thick fringe swept up and across the forehead, a lock at the temple, two on top
    cap((a) => 0.11 + 0.08 * f(a) ** 1.3, thick(1.16, 0.06));
    lock(0.072, 0.016, 0.034, 0.018, 0.224, 0.086, -0.5, 0.05, -0.28);
    lock(0.024, 0.042, 0.026, 0.082, 0.2, 0.045, 0, 0.5, -0.22);
    lock(0.05, 0.011, 0.07, -0.025, 0.262, 0.012, 0, -0.5, 0.06);
  }
  if (s === "bun" || s === "ponytail") {
    // pulled back tight: a thinner cap, a small lift at the front
    cap((a) => 0.11 + 0.08 * f(a) ** 1.4, thick(1.1, 0.03));
    lock(0.06, 0.012, 0.028, 0, 0.216, 0.088, -0.45);
  }
  if (s === "bun") {
    add(head, mesh(ball(0.046, 10, 7), hairMat, 0, 0.215, -0.11));
    add(head, mesh(new THREE.TorusGeometry(0.03, 0.006, 4, 10), DARK, 0, 0.215, -0.108));
  }
  if (s === "ponytail") {
    const tail = mesh(tube(0.03, 0.012, 0.26, 8), hairMat, 0, 0.03, -0.128);
    tail.rotation.x = 0.28;
    add(head, tail);
    add(head, mesh(ball(0.036, 8, 6), hairMat, 0, 0.152, -0.108));
    add(head, mesh(new THREE.TorusGeometry(0.03, 0.006, 4, 10), DARK, 0, 0.152, -0.108).rotateX(0.25));
  }
  if (s === "bob") {
    // a rounded curtain down to the jaw all round, a straight fringe ending above the brows
    cap((a) => (f(a) > 0.82 ? 0.19 : 0.03 - 0.02 * (1 - f(a))), thick(1.12, 0.04), 8);
    lock(0.07, 0.016, 0.03, 0, 0.205, 0.09, -0.35);
  }
  if (s === "long") {
    // a curtain past the shoulders at the back and to the collarbone at the sides, a side-swept fringe
    cap((a) => (f(a) > 0.8 ? 0.185 : -0.02 - 0.08 * (1 - f(a)) ** 2), thick(1.12, 0.04), 9);
    lock(0.07, 0.016, 0.03, 0.018, 0.21, 0.088, -0.45, 0, -0.22);
  }
  if (s === "curly") {
    // a bumpy thick cap and a crowd of curls around its edge and on top
    cap((a) => 0.11 + 0.07 * f(a) ** 1.3, (a, t) => 1.2 + 0.05 * t + 0.04 * Math.sin(a * 4 + t * 9) * Math.sin(t * 5 + 1));
    for (let i = 0; i < 9; i++) {
      const a = PI * 0.3 + (i / 8) * PI * 1.4, r = 0.098;
      add(head, mesh(ball(0.036, 6, 5), hairMat, Math.sin(a) * r, 0.155 + (i % 2) * 0.035, Math.cos(a) * r * 1.08 - 0.01)).castShadow = false;
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2;
      add(head, mesh(ball(0.038, 6, 5), hairMat, Math.sin(a) * 0.065, 0.245, Math.cos(a) * 0.065 - 0.015)).castShadow = false;
    }
    add(head, mesh(ball(0.042, 6, 5), hairMat, 0, 0.272, -0.01)).castShadow = false;
  }
}

// ---- torso profile [y in the torso group, half width, front depth, back depth]; the hem row is added per outfit
const TORSO = [
  [-0.1, 0.15, 0.094, 0.09],
  [-0.02, 0.146, 0.091, 0.088],
  [0.1, 0.152, 0.096, 0.092],
  [0.22, 0.166, 0.104, 0.1],
  [0.33, 0.178, 0.104, 0.104],
  [0.4, 0.182, 0.097, 0.102],
  [0.44, 0.178, 0.09, 0.096],
  [0.462, 0.14, 0.075, 0.082],
  [0.478, 0.08, 0.052, 0.058],
  [0.49, 0, 0, 0],
];
/** torso rows from `hem` up to the neck, grown by `b` all round (`y1` cuts them off early, closing flat) */
function torsoRows(hem, b, y1 = 1) {
  const rows = [[hem, ...profileAt(TORSO, hem)]];
  for (const r of TORSO) if (r[0] > hem && r[0] < y1) rows.push(r);
  if (y1 < 1) rows.push([y1, ...profileAt(TORSO, y1)], [y1, 0, 0, 0]);
  const grown = rows.map(([y, X, Zf, Zb]) => (X ? [y, X + b, Zf + b, Zb + b] : [y, X, Zf, Zb]));
  grown.unshift([hem, 0, 0, 0]); // closed underneath
  return grown;
}
// ---- pelvis rows in the hips group
const PELVIS = [
  [-0.105, 0, 0, 0],
  [-0.095, 0.125, 0.08, 0.08],
  [-0.06, 0.16, 0.095, 0.1],
  [0.0, 0.165, 0.095, 0.1],
  [0.06, 0.152, 0.09, 0.092],
  [0.07, 0, 0, 0],
];

/**
 * Build one character. `look` decides skin, hair, outfit. Returns the rig:
 * root group, joint parts, meshes for picking, and helpers for poses.
 */
export function buildCharacter(bot) {
  const look = bot.look;
  const root = new THREE.Group();
  const meshes = [];
  const add = (parent, m) => {
    m.userData.bot = bot.id;
    meshes.push(m);
    parent.add(m);
    return m;
  };
  const skin = std(look.skin, 0.55);
  const skinDark = std(new THREE.Color(look.skin).multiplyScalar(0.7), 0.6);
  const hair = std(look.hair, 0.55);
  const brow = std(new THREE.Color(look.hair).multiplyScalar(0.75), 0.7);
  const shirt = std(look.shirt, 0.9);
  const shirtDark = std(new THREE.Color(look.shirt).multiplyScalar(0.72), 0.9);
  const jacket = look.jacket ? std(look.jacket, 0.85) : null;
  const pants = std(look.pants, 0.8);
  const pantsDark = std(new THREE.Color(look.pants).multiplyScalar(0.75), 0.8);
  const shoes = std(look.shoes, look.shoeStyle === "heels" || look.shoeStyle === "boots" ? 0.4 : 0.7);
  const lips = std(look.lips || new THREE.Color(look.skin).multiplyScalar(0.8), 0.5);
  const eye = std(EYE_COLORS[look.eyes] || EYE_COLORS.dark, 0.3);
  const style = look.shirtStyle || "tee";
  const bulk = style === "hoodie" || style === "sweater" ? 0.015 : 0; // knits sit looser than a shirt
  const shirtLight = new THREE.Color(look.shirt).getHSL({}).l > 0.6;
  const belt = !look.skirt && !jacket && (style === "collar" || style === "blouse"); // tucked shirt shows the belt
  const cargo = !look.skirt && !jacket && (style === "hoodie" || style === "tee"); // streetwear: cargo pockets, gathered cuffs

  // ---- hips + legs ----
  const hips = new THREE.Group();
  hips.position.y = HIP_STAND;
  root.add(hips);
  if (look.skirt) {
    const skirt = rowsSurface([[-0.27, 0, 0, 0], [-0.26, 0.19, 0.125, 0.125], [-0.1, 0.17, 0.108, 0.108], [0.03, 0.158, 0.096, 0.098], [0.06, 0.15, 0.09, 0.092], [0.07, 0, 0, 0]], 14);
    add(hips, mesh(facet(skirt, 0.45), pants));
  } else {
    add(hips, mesh(facet(rowsSurface(PELVIS, 12), 0.45), pants));
    if (belt) add(hips, mesh(rowsSurface([[0.03, 0.156, 0.094, 0.096], [0.062, 0.156, 0.094, 0.096]], 12), DARK));
    else add(hips, mesh(rowsSurface([[0.035, 0.155, 0.093, 0.095], [0.065, 0.152, 0.091, 0.093]], 12), pantsDark)); // waistband
  }
  const leg = (side) => {
    const legMat = look.skirt ? skin : pants;
    const hip = new THREE.Group();
    hip.position.set(side * 0.095, -HIP_OFF, 0);
    hips.add(hip);
    if (look.skirt) add(hip, mesh(tube(0.076, 0.06, THIGH), skin, 0, -THIGH / 2, 0));
    else {
      add(hip, mesh(facet(tube(0.081, 0.066, THIGH), 0.4), pants, 0, -THIGH / 2, 0));
      if (cargo) {
        // cargo pocket on the outer thigh, with a flap
        add(hip, mesh(soft(0.026, 0.1, 0.09, 6), pants, side * 0.072, -0.215, 0.02));
        add(hip, mesh(soft(0.03, 0.022, 0.095, 6), pantsDark, side * 0.073, -0.165, 0.02));
      }
    }
    const knee = new THREE.Group();
    knee.position.y = -THIGH;
    hip.add(knee);
    const floor = -SHIN - ANKLE;
    add(knee, mesh(ball(look.skirt ? 0.056 : 0.062, 8, 6), legMat, 0, 0, 0));
    if (look.skirt) {
      add(knee, mesh(tube(0.056, 0.042, SHIN), skin, 0, -SHIN / 2, 0));
      add(knee, mesh(tube(0.037, 0.034, 0.07), skin, 0, -SHIN - 0.025, 0));
    } else if (cargo) {
      // jogger-style: the leg bunches over a ribbed cuff above the ankle
      add(knee, mesh(facet(tube(0.06, 0.056, 0.3), 0.4), pants, 0, -0.15, 0));
      add(knee, mesh(blob(0.061, 0.032, 0.061, 8, 6), pants, 0, -0.305, 0));
      add(knee, mesh(tube(0.047, 0.045, 0.05), pantsDark, 0, -0.345, 0));
      add(knee, mesh(tube(0.034, 0.032, 0.07), skin, 0, -0.39, 0));
    } else {
      add(knee, mesh(facet(tube(0.062, 0.055, SHIN - 0.02), 0.4), pants, 0, -(SHIN - 0.02) / 2, 0));
      add(knee, mesh(tube(0.056, 0.056, 0.012), pantsDark, 0, -SHIN + 0.014, 0));
      add(knee, mesh(tube(0.035, 0.033, 0.07), skin, 0, -SHIN - 0.02, 0));
    }
    // shoes: the ankle is at -SHIN, the floor ANKLE below it
    const st = look.shoeStyle || "flats";
    const sole = (w, l, h, mat, z) => {
      // a rounded-oval slab, extruded then laid flat
      const pts = [];
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * PI * 2, c = Math.cos(a), s = Math.sin(a);
        pts.push(new THREE.Vector2(w * Math.sign(c) * Math.abs(c) ** 0.7, l * Math.sign(s) * Math.abs(s) ** 0.75 + (s > 0 ? 0.02 : 0)));
      }
      const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: h, bevelEnabled: false });
      g.rotateX(-PI / 2);
      return add(knee, mesh(g, mat, 0, floor, z));
    };
    if (st === "sneakers") {
      sole(0.045, 0.115, 0.018, SOLE, 0.03);
      const cy = floor + 0.06, cz = 0.03;
      add(knee, mesh(blob(0.047, 0.046, 0.128, 8, 6), shoes, 0, cy, cz));
      add(knee, mesh(new THREE.SphereGeometry(1, 5, 6, PI / 3, PI / 3).scale(0.049, 0.044, 0.131), SOLE, 0, cy - 0.004, cz));
      for (const dz of [0.025, 0.05, 0.075]) add(knee, mesh(box(0.028, 0.004, 0.007), WHITE, 0, cy + 0.046 * Math.sqrt(1 - (dz / 0.128) ** 2) - 0.002, cz + dz)).castShadow = false;
    } else if (st === "boots") {
      sole(0.048, 0.118, 0.022, DARK, 0.035);
      add(knee, mesh(blob(0.047, 0.045, 0.128, 8, 6), shoes, 0, floor + 0.064, 0.035));
      add(knee, mesh(tube(0.05, 0.055, 0.13), shoes, 0, -SHIN + 0.04, 0));
    } else if (st === "heels") {
      sole(0.038, 0.1, 0.008, DARK, 0.05);
      const foot = mesh(blob(0.039, 0.028, 0.115, 8, 6), shoes, 0, floor + 0.048, 0.05);
      foot.rotation.x = 0.28;
      add(knee, foot);
      add(knee, mesh(box(0.016, 0.07, 0.016), shoes, 0, floor + 0.035, -0.055));
    } else {
      sole(0.043, 0.11, 0.012, DARK, 0.04);
      add(knee, mesh(blob(0.043, 0.032, 0.12, 8, 6), shoes, 0, floor + 0.04, 0.04));
    }
    return { hip, knee };
  };
  const L = leg(-1), Rg = leg(1);

  // ---- torso: a smooth body of stacked rings, then the outfit ----
  const torso = new THREE.Group();
  torso.position.y = 0.1;
  hips.add(torso);
  const hem = belt ? -0.03 : -0.1; // an untucked shirt hangs over the hips
  const JB = jacket ? 0.025 : 0;
  /** z of the outfit's front at height y */
  const frontZ = (y) => profileAt(TORSO, y)[1] + bulk + JB;
  add(torso, mesh(facet(rowsSurface(torsoRows(hem, bulk), 12), 0.5), shirt));
  add(torso, mesh(tube(0.045, 0.052, 0.11), skin, 0, 0.45, 0)); // neck
  const front = (geo, mat, x, y, dz = 0) => add(torso, mesh(geo, mat, x, y, frontZ(y) + dz));
  const ribHem = (mat) => add(torso, mesh(rowsSurface(torsoRows(hem, bulk + 0.003, hem + 0.035).slice(0, -1), 12), mat));
  if (style === "tee") add(torso, mesh(new THREE.TorusGeometry(0.052, 0.011, 5, 12), shirtDark, 0, 0.45, -0.004).rotateX(PI / 2));
  if (style === "sweater") {
    add(torso, mesh(new THREE.TorusGeometry(0.058, 0.017, 5, 12), shirtDark, 0, 0.45, -0.004).rotateX(PI / 2));
    ribHem(shirtDark);
  }
  if (style === "hoodie") {
    // a rolled hood ring around the neck, its inside dark, the hood bunched softly at the back of the
    // neck; two drawstrings with aglets, a kangaroo pocket with slanted hand slits, ribbed hem
    const ring = mesh(facet(new THREE.TorusGeometry(0.087, 0.031, 6, 12), 0.35), shirt, 0, 0.474, -0.016);
    ring.rotation.x = PI / 2 + 0.24;
    ring.scale.set(1, 1.06, 0.85);
    add(torso, ring);
    add(torso, mesh(new THREE.CylinderGeometry(0.06, 0.056, 0.07, 12, 1, true), HOOD_IN, 0, 0.47, -0.015));
    // the hood itself lies down the upper back as a soft pointed fold
    const hood = mesh(facet(rowsSurface([[0, 0, 0, 0], [0.01, 0.11, 0.03, 0.04], [0.08, 0.12, 0.035, 0.048], [0.15, 0.1, 0.035, 0.045], [0.2, 0.05, 0.03, 0.03], [0.225, 0, 0, 0]], 12), 0.5), shirt, 0, 0.28, -0.078 - bulk);
    hood.rotation.x = -0.12;
    add(torso, hood);
    for (const s of [-1, 1]) {
      const str = front(tube(0.0035, 0.0035, 0.14, 6), STRING, s * 0.03, 0.375, 0.01);
      str.rotation.z = -s * 0.04;
      front(tube(0.0045, 0.0045, 0.016, 6), AGLET, s * 0.033, 0.297, 0.01);
    }
    front(soft(0.2, 0.125, 0.026, 6), shirt, 0, 0.035, 0.004);
    for (const s of [-1, 1]) front(box(0.028, 0.004, 0.004), shirtDark, s * 0.092, 0.105, 0.016).castShadow = false;
    ribHem(shirtDark);
  }
  if (style === "collar" || style === "blouse") {
    const blouse = style === "blouse";
    for (const s of [-1, 1]) {
      const c = mesh(blouse ? box(0.06, 0.045, 0.01) : box(0.075, 0.05, 0.012), shirtDark, s * 0.042, 0.45, frontZ(0.45) - 0.02);
      c.rotation.set(-0.3, -s * 0.35, s * 0.55);
      add(torso, c);
    }
    if (!jacket) {
      for (let i = 0; i < 6; i++) front(box(0.024, 0.075, 0.006), shirtDark, 0, 0.395 - i * 0.07, 0.002);
      if (!blouse) for (let i = 0; i < 4; i++) front(box(0.011, 0.011, 0.006), shirtLight ? DARK : WHITE, 0, 0.36 - i * 0.09, 0.006).castShadow = false;
    }
  }
  if (jacket) {
    // blazer: a looser body over the shirt, the shirt showing in a V between two lapels, a collar at the back of the neck
    add(torso, mesh(facet(rowsSurface(torsoRows(-0.07, bulk + JB, 0.455), 12), 0.5), jacket));
    const open = look.jacketOpen;
    front(frustum(open ? 0.08 : 0.03, 0.006, open ? 0.2 : 0.14, 0.006, 0.42), shirt, 0, 0.14, 0.002);
    for (const s of [-1, 1]) {
      const lapel = front(box(0.065, 0.24, 0.008), jacket, s * (open ? 0.075 : 0.052), 0.3, 0.007);
      lapel.rotation.set(0, -s * 0.12, -s * 0.28);
    }
    add(torso, mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.035, 10, 1, true, PI / 2, PI), jacket, 0, 0.445, -0.01));
    if (!open) front(box(0.012, 0.012, 0.006), DARK, 0, 0.1, 0.008).castShadow = false;
  }
  if (look.tie) {
    const tieM = std(look.tie, 0.7);
    front(box(0.036, 0.03, 0.02), tieM, 0, 0.425, 0.01);
    front(frustum(0.046, 0.012, 0.032, 0.012, 0.22), tieM, 0, 0.29, 0.008);
    front(frustum(0.004, 0.012, 0.046, 0.012, 0.03), tieM, 0, 0.165, 0.008);
  }
  if (look.lanyard) {
    const strap = std(typeof look.lanyard === "string" ? look.lanyard : bot.accent, 0.8);
    for (const s of [-1, 1]) {
      const st = front(tube(0.004, 0.004, 0.235, 4), strap, s * 0.025, 0.315, 0.005);
      st.rotation.z = -s * 0.214;
    }
    front(box(0.07, 0.09, 0.008), BADGE, 0, 0.155, 0.005);
    front(box(0.028, 0.028, 0.004), BADGE_ICON, 0, 0.172, 0.011).castShadow = false;
    front(box(0.04, 0.01, 0.004), BADGE_ICON, 0, 0.135, 0.011).castShadow = false;
  }

  // ---- arms: deltoid ball, tapered upper arm and forearm, palm + curled fingers + thumb ----
  const arm = (side) => {
    const sh = new THREE.Group();
    sh.position.set(side * (0.195 + bulk), 0.41, 0);
    torso.add(sh);
    const short = look.sleeves === "short" && !jacket;
    const upperMat = jacket || (short ? skin : shirt);
    const lowerMat = jacket || (look.sleeves === "long" ? shirt : skin);
    const cloth = (g, mat) => (mat === skin ? g : facet(g, 0.45));
    add(sh, mesh(blob(0.056 + bulk / 2, 0.048, 0.056 + bulk / 2, 8, 6), jacket || shirt, 0, -0.014, 0));
    add(sh, mesh(cloth(tube(0.05 + bulk / 2, 0.041, 0.28), upperMat), upperMat, 0, -0.15, 0));
    if (short) add(sh, mesh(facet(tube(0.054, 0.05, 0.13), 0.45), shirt, 0, -0.065, 0));
    const el = new THREE.Group();
    el.position.y = -UPPER_ARM;
    sh.add(el);
    add(el, mesh(ball(0.042, 8, 6), lowerMat, 0, 0, 0));
    if (jacket) {
      add(el, mesh(facet(tube(0.042, 0.036, 0.245), 0.45), jacket, 0, -0.1225, 0));
      add(el, mesh(tube(0.034, 0.034, 0.024), shirt, 0, -0.248, 0));
    } else if (bulk) {
      // knit sleeve bunching over a ribbed cuff
      add(el, mesh(facet(tube(0.044, 0.042, 0.225), 0.45), lowerMat, 0, -0.1125, 0));
      add(el, mesh(tube(0.036, 0.034, 0.036), shirtDark, 0, -0.238, 0));
    } else add(el, mesh(cloth(tube(0.042, 0.033, 0.25), lowerMat), lowerMat, 0, -0.125, 0));
    add(el, mesh(tube(0.029, 0.029, 0.05), skin, 0, -0.245, 0)); // wrist
    const hand = new THREE.Group();
    hand.position.y = -FOREARM;
    el.add(hand);
    const yaw = side * 0.45; // palms turned a little towards the thighs
    const part = (geo, x, y, z, rx = 0, rz = 0) => {
      const m = mesh(geo, skin, x * Math.cos(yaw) + z * Math.sin(yaw), y, -x * Math.sin(yaw) + z * Math.cos(yaw));
      m.rotation.set(rx, yaw, rz, "YXZ");
      return add(hand, m);
    };
    part(soft(0.062, 0.084, 0.028, 4), 0, -0.04, 0);
    part(soft(0.056, 0.084, 0.022, 4), 0, -0.112, -0.004, 0.25);
    part(blob(0.011, 0.027, 0.012, 6, 5), -side * 0.03, -0.05, 0.012, 0.15, side * 0.4);
    return { sh, el, hand };
  };
  const AL = arm(-1), AR = arm(1);

  // props in the right hand: mug, phone, paddle — hidden until needed
  const mug = new THREE.Group();
  mug.rotation.x = PI / 2 - 0.3; // upright with the forearm level, tipping towards the face as the wrist folds
  mug.position.set(0, -0.075, 0.02);
  const mugBody = mesh(new THREE.CylinderGeometry(0.036, 0.032, 0.085, 10, 1, true), std(bot.accent, 0.6, { side: THREE.DoubleSide }), 0, 0.02, 0);
  mugBody.castShadow = false;
  mug.add(mugBody, mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.01, 10), MUG_IN, 0, 0.052, 0));
  const handle = mesh(new THREE.TorusGeometry(0.022, 0.006, 5, 8, PI), std(bot.accent, 0.6), 0.036, 0.02, 0);
  handle.rotation.y = PI / 2;
  mug.add(handle);
  mug.visible = false;
  AR.hand.add(mug);
  const phone = new THREE.Group();
  phone.position.set(0, -0.03, 0.018); // flat on the hand, screen facing away from the palm
  phone.add(mesh(box(0.065, 0.13, 0.01), PHONE, 0, 0.045, 0));
  const scr = mesh(box(0.055, 0.11, 0.004), PHONE_SCREEN, 0, 0.045, 0.006);
  scr.castShadow = false;
  phone.add(scr);
  phone.visible = false;
  AR.hand.add(phone);
  const paddle = new THREE.Group();
  paddle.rotation.x = PI - 0.6; // the blade continues the forearm out of the fist, tipped up a little
  paddle.position.y = -0.06;
  const blade = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 12), std("#c0392b", 0.8), 0, 0.15, 0).rotateX(PI / 2);
  paddle.add(blade);
  paddle.add(mesh(box(0.03, 0.12, 0.02), std("#c9a24a", 0.8), 0, 0.035, 0));
  paddle.visible = false;
  AR.hand.add(paddle);

  // ---- head: a smooth skull with a jaw and chin, ears, a bridged nose, eyes, brows, lips ----
  const head = new THREE.Group();
  head.position.y = 0.48;
  torso.add(head);
  add(head, mesh(surface(16, HEAD.length, (v, a, r) => headAt(v, a, HEAD[r][0]), { poleBottom: true, poleTop: true }), skin));
  const earStyles = new Set(["bald", "short", "swept", "bun", "ponytail"]);
  if (earStyles.has(look.hairStyle)) {
    for (const s of [-1, 1]) {
      const ear = add(head, mesh(blob(0.008, 0.02, 0.014, 6, 5), skin, s * (sideX(0.13) + 0.002), 0.128, -0.012));
      ear.rotation.y = s * 0.25;
      const cup = add(head, mesh(blob(0.004, 0.011, 0.007, 5, 3), skinDark, s * (sideX(0.13) + 0.007), 0.128, -0.01));
      cup.rotation.y = s * 0.25;
      cup.castShadow = false;
    }
  }
  // nose: a bridge running down from between the brows to a rounded tip, small alae either side
  const NB = 0.162, NT = 0.1;
  const bridge = add(head, mesh(new THREE.ConeGeometry(0.0115, 0.06, 7), skin, 0, (NB + NT) / 2, (faceZ(0, NB) + faceZ(0, NT)) / 2 + 0.009));
  bridge.rotation.x = 0.16;
  add(head, mesh(blob(0.0115, 0.0095, 0.011, 7, 5), skin, 0, NT, faceZ(0, NT) + 0.016));
  for (const s of [-1, 1]) add(head, mesh(blob(0.0075, 0.0065, 0.0075, 6, 4), skin, s * 0.0115, NT - 0.003, faceZ(0.0115, NT) + 0.009));
  // eyes: an almond white sunk into the socket, a dark iris and pupil, an upper lid line; brows in two strokes
  const EYE_Y = 0.142, EYE_X = 0.031;
  const eyes = [];
  for (const s of [-1, 1]) {
    const ez = faceZ(EYE_X, EYE_Y);
    const g = new THREE.Group();
    g.position.set(s * EYE_X, EYE_Y, ez - 0.004);
    g.rotation.y = s * 0.14;
    g.userData.dynamic = true;
    head.add(g);
    const white = mesh(blob(0.0135, 0.0065, 0.005, 8, 4), SCLERA, 0, 0, 0);
    const iris = mesh(ball(0.0064, 7, 4), eye, s * -0.0005, -0.0005, 0.0035);
    const pupil = mesh(ball(0.0028, 5, 3), PUPIL, s * -0.0005, -0.0005, 0.0085);
    const lid = mesh(new THREE.TorusGeometry(0.0125, 0.003, 3, 6, PI), skinDark, 0, 0.0005, 0.005);
    for (const m of [white, iris, pupil, lid]) {
      m.castShadow = false;
      m.userData.bot = bot.id;
      g.add(m);
    }
    eyes.push(g);
    const b1 = add(head, mesh(box(0.024, 0.0042, 0.004), brow, s * 0.02, 0.169, faceZ(0.02, 0.169) + 0.002));
    b1.rotation.set(0, s * 0.22, s * 0.08);
    const b2 = add(head, mesh(box(0.022, 0.0036, 0.004), brow, s * 0.042, 0.169, faceZ(0.042, 0.169) + 0.001));
    b2.rotation.set(0, s * 0.62, -s * 0.16);
    b1.castShadow = b2.castShadow = false;
  }
  // a closed neutral mouth: two lips and the line between them; a laugh swaps it for an open mouth with teeth
  const MY = 0.06, MZ = faceZ(0, MY);
  const smile = new THREE.Group();
  smile.position.set(0, MY, MZ);
  smile.userData.dynamic = true;
  head.add(smile);
  const upperLip = mesh(blob(0.018, 0.003, 0.0045, 8, 4), lips, 0, 0.002, 0);
  const lowerLip = mesh(blob(0.015, 0.004, 0.005, 8, 4), lips, 0, -0.0032, 0);
  const crease = mesh(box(0.031, 0.0012, 0.003), skinDark, 0, 0, 0.0035);
  for (const m of [upperLip, lowerLip, crease]) {
    m.castShadow = false;
    smile.add(m);
  }
  const open = new THREE.Group();
  open.position.set(0, MY, MZ);
  open.userData.dynamic = true;
  open.visible = false;
  head.add(open);
  const openIn = mesh(soft(0.03, 0.022, 0.01, 4), MOUTH, 0, -0.004, 0);
  const openTeeth = mesh(box(0.02, 0.004, 0.003), TEETH, 0, 0.004, 0.005);
  const openLip = mesh(blob(0.018, 0.004, 0.005, 8, 4), lips, 0, -0.015, 0.002);
  for (const m of [openIn, openTeeth, openLip]) {
    m.castShadow = false;
    open.add(m);
  }
  if (look.beard) {
    // a short beard hugging the jaw and cheeks up to the sideburns (no moustache: a dark bar over the lips reads as an open mouth)
    const top = (a) => 0.048 + 0.07 * Math.sin(a) ** 2;
    const beard = surface(14, 5, (v, a, r) => {
      const y = [0.004, 0.004, (0.004 + top(a)) / 2, top(a), top(a)][r];
      headAt(v, a, y, r === 0 || r === 4 ? 0.985 : 1.055);
    }, { arc: [-1.95, 1.95] });
    add(head, mesh(beard, hair));
  }
  if (look.glasses) {
    const gz = faceZ(EYE_X, EYE_Y) + 0.012;
    for (const s of [-1, 1]) {
      const ring = mesh(new THREE.TorusGeometry(0.02, 0.0025, 4, 12), GLASS, s * EYE_X, EYE_Y, gz);
      ring.rotation.set(0, s * 0.2, PI / 12);
      ring.castShadow = false;
      add(head, ring);
      const temple = mesh(box(0.003, 0.003, 0.1), GLASS, s * (sideX(EYE_Y) + 0.002), EYE_Y + 0.004, gz - 0.055);
      temple.castShadow = false;
      add(head, temple);
    }
    add(head, mesh(box(0.024, 0.003, 0.003), GLASS, 0, EYE_Y + 0.004, gz)).castShadow = false;
  }
  buildHair(head, look, hair, add);

  // merge what never moves relative to its joint
  const rebuild = (group) => {
    const before = new Set(group.children);
    mergeRigid(group, (parent, m) => {
      parent.add(m);
      meshes.push(m);
    });
    for (const c of before) {
      const k = meshes.indexOf(c);
      if (k >= 0 && !group.children.includes(c)) meshes.splice(k, 1);
    }
  };
  rebuild(head);
  rebuild(torso);
  rebuild(hips);
  for (const g of [AL.sh, AR.sh, AL.el, AR.el, AL.hand, AR.hand, L.hip, Rg.hip, L.knee, Rg.knee]) rebuild(g);

  // ---- selection ring ----
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.37, 40),
    new THREE.MeshBasicMaterial({ color: bot.accent, transparent: true, opacity: 0, depthWrite: false })
  );
  ring.rotation.x = -PI / 2;
  ring.position.y = 0.045;
  root.add(ring);

  const parts = {
    hips, torso, head, shL: AL.sh, shR: AR.sh, elL: AL.el, elR: AR.el, handL: AL.hand, handR: AR.hand,
    hipL: L.hip, hipR: Rg.hip, kneeL: L.knee, kneeR: Rg.knee, blade,
  };
  const cur = { ...REST };
  const target = { ...REST };
  let blinkAt = 2 + Math.random() * 4;
  let blinkUntil = 0;

  const rig = {
    root,
    parts,
    meshes,
    ring,
    head,
    /** top of the skull above the head pivot (hair adds ~0.02); standing, the pivot is at 1.48 m */
    headTop: HEAD_TOP,
    shirtMat: shirt,
    accent: bot.accent,
    target,
    cur,
    rest() {
      Object.assign(target, REST);
    },
    set(o) {
      Object.assign(target, o);
    },
    hold(what) {
      mug.visible = what === "mug";
      phone.visible = what === "phone";
      paddle.visible = what === "paddle";
    },
    mouth(kind) {
      open.visible = kind === "open";
      smile.visible = kind !== "open";
    },
    /** ease joints to their targets; `rate` per second */
    update(dt, t, rate = 10) {
      const k = Math.min(1, rate * dt);
      for (const [name, part, prop, axis] of JOINTS) {
        cur[name] += (target[name] - cur[name]) * k;
        parts[part][prop][axis] = cur[name];
      }
      if (t > blinkAt) {
        blinkUntil = t + 0.12;
        blinkAt = t + 2.5 + Math.random() * 4;
      }
      const closed = t < blinkUntil;
      for (const e of eyes) e.scale.y = closed ? 0.12 : 1;
    },
  };
  return rig;
}

// ------------------------------------------------------------------ poses ----
// Each pose writes targets on the rig. `t` is the simulation time, `p` a
// per-character phase so people never move in lock-step.

/** Thigh/shin angles that put the feet on the floor for a given hips height (shins vertical). */
function legsFor(seatY) {
  const a = Math.acos(Math.max(-1, Math.min(1, (seatY - HIP_OFF - SHIN - ANKLE) / THIGH)));
  return { hipLx: -a, hipRx: -a, kneeLx: a, kneeRx: a, hipLz: 0.05, hipRz: -0.05 };
}

export const POSES = {
  stand(rig, t, p) {
    rig.rest();
    rig.set({
      hipsY: HIP_STAND + Math.sin(t * 1.3 + p) * 0.004,
      torsoRz: Math.sin(t * 0.7 + p) * 0.02,
      torsoRx: 0.02,
      shLx: Math.sin(t * 0.9 + p) * 0.03,
      shRx: -Math.sin(t * 0.9 + p) * 0.03,
    });
  },
  walk(rig, t, p, walkT, mug) {
    // thigh swings with sin; the knee bends while the leg swings forward (cos > 0) and is
    // straight when the foot lands, which reads as a walk rather than a march. The swing
    // matches the stride (WALK / cadence ≈ 0.5 m per step) so the planted foot does not slide.
    const s = Math.sin(walkT), c = Math.cos(walkT);
    rig.rest();
    rig.set({
      hipsY: HIP_STAND - 0.025 + Math.abs(c) * 0.025,
      hipLx: s * 0.36,
      hipRx: -s * 0.36,
      kneeLx: 0.05 + Math.max(0, c) * 0.65,
      kneeRx: 0.05 + Math.max(0, -c) * 0.65,
      shLx: -s * 0.3,
      shRx: mug ? -0.05 : s * 0.3,
      elLx: -0.3,
      elRx: mug ? -1.3 : -0.3,
      shRy: mug ? -0.15 : 0,
      torsoRx: 0.05,
      torsoRy: s * 0.04,
      headRx: 0.02,
    });
  },
  sitType(rig, t, p, seatY = HIP_SIT) {
    // upper arms hang, forearms level with the desk top (0.74), wrists dropped so the fingers rest on the keys
    rig.rest();
    rig.set({
      ...legsFor(seatY),
      hipsY: seatY,
      hipsZ: -0.18,
      torsoRx: 0.12,
      shLx: -0.58 + Math.sin(t * 11 + p) * 0.03,
      shRx: -0.58 + Math.cos(t * 10 + p) * 0.03,
      shLz: -0.06, shRz: 0.06,
      elLx: -1.2 + Math.sin(t * 13 + p) * 0.03,
      elRx: -1.2 + Math.cos(t * 12 + p) * 0.03,
      wristLx: 0.15 + Math.sin(t * 13 + p) * 0.05,
      wristRx: 0.15 + Math.cos(t * 12 + p) * 0.05,
      headRx: 0.14 + Math.sin(t * 0.8 + p) * 0.03,
      headRy: Math.sin(t * 0.5 + p) * 0.08,
    });
  },
  sitIdle(rig, t, p, seatY = HIP_SIT, z = -0.18) {
    // hands resting on the lap
    rig.rest();
    rig.set({
      ...legsFor(seatY),
      hipsY: seatY, hipsZ: z,
      torsoRx: 0.03,
      shLx: -0.15, shRx: -0.15, elLx: -0.94, elRx: -0.94, shLz: -0.03, shRz: 0.03, shLy: 0.36, shRy: -0.36,
      headRx: 0.02,
    });
  },
  sitThink(rig, t, p) {
    // fist under the chin
    POSES.sitIdle(rig, t, p);
    rig.set({ shRx: -0.91, elRx: -2.45, shRz: -0.05, shRy: -0.5, wristRx: -0.4, headRx: 0.08, headRz: 0.14, headRy: 0.1 + Math.sin(t * 0.6) * 0.05, torsoRx: 0.1 });
  },
  sitStretch(rig, t, p) {
    POSES.sitIdle(rig, t, p);
    rig.set({ shLx: -2.8, shRx: -2.8, shLz: -0.3, shRz: 0.3, shLy: 0, shRy: 0, elLx: -0.2, elRx: -0.2, torsoRx: -0.2, headRx: -0.35 });
  },
  sitSip(rig, t, p) {
    // mug to the lips, tipped by the wrist
    POSES.sitIdle(rig, t, p);
    rig.set({ shRx: -0.95, elRx: -2.35, shRz: -0.05, shRy: -0.55, wristRx: 0.9, headRx: -0.05, torsoRx: 0.05 });
  },
  sitPhone(rig, t, p) {
    POSES.sitIdle(rig, t, p);
    rig.set({ shRx: -0.52, elRx: -1.74, shRz: -0.04, shRy: -0.47, wristRx: -0.3, headRx: 0.42, headRz: 0.05, torsoRx: 0.1 });
  },
  sitLean(rig, t, p) {
    POSES.sitIdle(rig, t, p);
    rig.set({ torsoRx: -0.28, shLx: -2.2, shRx: -2.2, shLz: -0.55, shRz: 0.55, shLy: 0.6, shRy: -0.6, elLx: -2.3, elRx: -2.3, headRx: -0.2 });
  },
  sitHost(rig, t, p, headRy) {
    POSES.sitIdle(rig, t, p);
    rig.set({ headRy, torsoRy: headRy * 0.35, headRx: -0.02, shRx: -0.2, elRx: -0.5, shRy: -0.1 });
  },
  sitSofa(rig, t, p) {
    // sunk into the cushion, leaning back, hands on the thighs
    rig.rest();
    rig.set({
      ...legsFor(HIP_SOFA),
      hipsY: HIP_SOFA, hipsZ: 0,
      hipLz: -0.1, hipRz: 0.1,
      torsoRx: -0.12,
      shLx: 0.05, shRx: 0.05, shLz: -0.15, shRz: 0.15, shLy: 0.25, shRy: -0.25, elLx: -1.05, elRx: -1.05,
      headRx: -0.03,
    });
  },
  sitLow(rig, t, p, seatY = 0.55, z = -0.55) {
    // beanbag: sunk low, knees up, shins vertical with the feet flat on the floor, one hand at the chin
    rig.rest();
    rig.set({
      hipsY: seatY, hipsZ: z,
      hipLx: -1.45, hipRx: -1.45, kneeLx: 1.45, kneeRx: 1.45, hipLz: -0.1, hipRz: 0.1,
      torsoRx: -0.2,
      shLx: 0.15, elLx: -0.95, shLz: 0, shLy: 0.2, // left hand on the thigh
      shRx: -0.66, elRx: -2.5, shRz: -0.05, shRy: -0.5, wristRx: -0.4,
      headRx: 0.3,
    });
  },
  talk(rig, t, p, intensity = 1) {
    // a relaxed gesture with one hand, slow and small
    POSES.stand(rig, t, p);
    const g = Math.sin(t * 3.2 + p);
    rig.set({
      shRx: -0.4 + g * 0.15 * intensity,
      elRx: -1.3 + Math.cos(t * 2.6 + p) * 0.18 * intensity,
      shRz: 0.15,
      shRy: -0.2 + g * 0.12,
      wristRx: -0.2 + g * 0.1,
      shLx: -0.15 + Math.sin(t * 2 + p) * 0.06,
      elLx: -0.5,
      shLz: -0.1,
      headRx: 0.03 + Math.sin(t * 2.4 + p) * 0.03,
      headRy: Math.sin(t * 1.3 + p) * 0.05,
      torsoRx: 0.04,
    });
  },
  listen(rig, t, p) {
    // hands loosely together in front, nodding now and then
    POSES.stand(rig, t, p);
    rig.set({
      shLx: 0.1, shRx: 0.1, elLx: -1.19, elRx: -1.19, shLy: 0.9, shRy: -0.9, shLz: -0.05, shRz: 0.05,
      headRx: 0.05 + Math.max(0, Math.sin(t * 2.0 + p)) * 0.07,
      headRz: 0.05,
      clipArms: 1, // on the motion-capture bodies the clip's relaxed arms read better than folded hands
    });
  },
  laugh(rig, t, p) {
    POSES.stand(rig, t, p);
    const b = Math.abs(Math.sin(t * 9 + p));
    rig.set({
      hipsY: HIP_STAND + b * 0.012,
      torsoRx: -0.15 + b * 0.05,
      headRx: -0.28,
      shLx: -0.4, shRx: -0.4, elLx: -1.6, elRx: -1.6, shLz: -0.3 + b * 0.06, shRz: 0.3 - b * 0.06,
    });
  },
  sitLaugh(rig, t, p, seatY = HIP_SIT, z = -0.2) {
    POSES.sitIdle(rig, t, p, seatY, z);
    const b = Math.abs(Math.sin(t * 13 + p));
    rig.set({ hipsY: seatY + b * 0.015, torsoRx: -0.22 + b * 0.05, headRx: -0.3, shLx: -0.6, shRx: -0.6, elLx: -1.7, elRx: -1.7, shLy: 0.2, shRy: -0.2 });
  },
  pump(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.9 + Math.sin(t * 9) * 0.35, elRx: -1.5, shRz: 0.2, shLx: -0.2, elLx: -0.6, headRx: 0.08, torsoRx: 0.08 });
  },
  reveal(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -1.1, elRx: -1.0, shRz: 0.25, shLx: -0.2, elLx: -0.6, headRx: 0.1 });
  },
  cheer(rig, t, p) {
    POSES.stand(rig, t, p);
    const b = Math.abs(Math.sin(t * 9 + p));
    rig.set({ hipsY: HIP_STAND + b * 0.05, shLx: -2.9, shRx: -2.9, shLz: -0.35, shRz: 0.35, elLx: -0.3, elRx: -0.3, torsoRx: -0.12, headRx: -0.3 });
  },
  slump(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ torsoRx: 0.38, headRx: 0.45, shLx: 0.15, shRx: 0.15, elLx: -0.05, elRx: -0.05, shLz: 0, shRz: 0, hipsY: HIP_STAND - 0.005, hipLx: -0.05, hipRx: -0.05, kneeLx: 0.1, kneeRx: 0.1 });
  },
  press(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -1.25, elRx: -0.35, shRz: 0.1, wristRx: 0.3, headRx: 0.15, torsoRx: 0.08 });
  },
  sipStand(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.95, elRx: -2.35, shRz: -0.05, shRy: -0.55, wristRx: 0.9, headRx: -0.08, shLx: -0.1, elLx: -0.5 });
  },
  holdMug(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.05, elRx: -1.3, shRz: 0.05, shRy: -0.15, shLx: -0.15, elLx: -0.6, clipArms: 1 });
  },
  crossed(rig, t, p) {
    // arms folded, each hand tucked under the other upper arm
    POSES.stand(rig, t, p);
    rig.set({ shLx: 0.2, shRx: 0.15, elLx: -1.7, elRx: -1.62, shLy: 0.9, shRy: -0.9, shLz: 0, shRz: 0, headRx: -0.05 + Math.sin(t * 0.5 + p) * 0.03, clipArms: 1 });
  },
  write(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -1.7 + Math.sin(t * 2.2 + p) * 0.12, elRx: -0.45, shRz: 0.12 + Math.sin(t * 3.1 + p) * 0.2, shRy: -0.2, shLx: -0.2, elLx: -0.7, headRx: -0.15, torsoRx: 0.05 });
  },
  printer(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.95, elRx: -0.5, shLx: -0.6, elLx: -0.7, wristLx: 0.3, wristRx: 0.3, headRx: 0.35, torsoRx: 0.15 });
  },
  standType(rig, t, p) {
    // standing desk at 1.05, keyboard 0.45 in front: forearms level with the top
    POSES.stand(rig, t, p);
    rig.set({
      shLx: -0.2 + Math.sin(t * 14 + p) * 0.05,
      shRx: -0.2 + Math.cos(t * 13 + p) * 0.05,
      shLz: -0.06, shRz: 0.06,
      elLx: -1.45 + Math.sin(t * 15 + p) * 0.04,
      elRx: -1.45 + Math.cos(t * 16 + p) * 0.04,
      wristLx: 0.15 + Math.sin(t * 15 + p) * 0.05,
      wristRx: 0.15 + Math.cos(t * 16 + p) * 0.05,
      headRx: 0.18 + Math.sin(t * 0.8 + p) * 0.03,
      headRy: Math.sin(t * 0.5 + p) * 0.08,
      torsoRx: 0.08,
    });
  },
  standThink(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.91, elRx: -2.45, shRz: -0.05, shRy: -0.5, wristRx: -0.4, shLx: -0.5, elLx: -1.0, shLy: 0.3, headRx: 0.08, headRz: 0.14, torsoRx: 0.08 });
  },
  standPhone(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.44, elRx: -1.78, shRz: 0.06, shRy: -0.54, wristRx: -0.3, headRx: 0.4, headRz: 0.05 });
  },
  call(rig, t, p) {
    // phone to the ear
    POSES.stand(rig, t, p);
    rig.set({ shRx: -1.1, elRx: -2.56, shRz: 0.05, shRy: -0.45, wristRx: -0.2, headRx: 0.02, headRz: 0.15, shLx: -0.3 + Math.sin(t * 2 + p) * 0.15, elLx: -0.9, torsoRx: 0.03 });
  },
  swing(rig, t, p, k) {
    POSES.stand(rig, t, p);
    const a = Math.sin(k * PI);
    rig.set({ shRx: -0.5 - a * 1.1, shRz: 0.45 - a * 0.3, shRy: -0.6 + a * 0.9, elRx: -0.9 + a * 0.3, torsoRy: 0.25 - a * 0.5, hipLz: 0.1, hipRz: -0.1, headRx: 0.12, shLx: -0.3, elLx: -0.7 });
  },
  ready(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.3, shRz: 0.3, shRy: -0.4, elRx: -1.5, shLx: -0.35, elLx: -0.9, torsoRx: 0.12, headRx: 0.12, hipsY: HIP_STAND - 0.01, kneeLx: 0.3, kneeRx: 0.3, hipLx: -0.2, hipRx: -0.2 });
  },
  wave(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -2.6, shRz: 0.5 + Math.sin(t * 9) * 0.3, elRx: -0.5, headRx: -0.05 });
  },
};
