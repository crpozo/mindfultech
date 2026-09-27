// A low-poly stylised office worker: normal human proportions (about seven
// heads tall, slim), faceted flat-shaded surfaces built from a handful of
// tapered boxes, six/seven-sided tubes and eight-segment lathes, a simple face
// (small eyes, thin brows, a small mouth, a wedge nose), chunky angular hair
// and streetwear / office-casual outfits: hoodies with a hood, kangaroo pocket
// and drawstrings, tees, sweaters, collared shirts with ties and lanyards,
// blazers with lapels, straight trousers or a skirt, chunky sneakers with
// white soles, flats, boots and heels. Everything rigid is merged per
// material, so a person costs ~25 draw calls. Every joint has a current and a
// target value; poses only set targets and `update` eases towards them, so any
// state change blends.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

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
const JOINTS = [
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

const REST = {
  hipsY: HIP_STAND, hipsZ: 0, hipsRx: 0, torsoRx: 0, torsoRy: 0, torsoRz: 0,
  headRx: 0, headRy: 0, headRz: 0,
  shLx: 0, shLy: 0, shLz: -0.06, shRx: 0, shRy: 0, shRz: 0.06, elLx: -0.12, elRx: -0.12,
  hipLx: 0, hipRx: 0, hipLz: 0.012, hipRz: -0.012, kneeLx: 0.04, kneeRx: 0.04,
  wristLx: 0, wristRx: 0,
};

const PI = Math.PI;
/** matte, flat-shaded: every facet reads as a plane */
const std = (color, roughness = 0.85, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, flatShading: true, ...extra });
const EYE_COLORS = { brown: "#3a2418", blue: "#34557d", green: "#3a6448", hazel: "#6b4a26", dark: "#17161a" };
const MOUTH = std("#4a2226", 0.6);
const TEETH = std("#f3f1ea", 0.5);
const GLASS = std("#2a2a30", 0.5, { metalness: 0.3 });
const WHITE = std("#ebe9e2", 0.9);
const DARK = std("#26262c", 0.9);
const BADGE = std("#2a2a30", 0.7);
const BADGE_ICON = std("#f2c14e", 0.7);
const STRING = std("#e6e3da", 0.9);
const MUG_IN = std("#ffffff", 0.5);
const PHONE = std("#1a1b20", 0.4, { metalness: 0.3 });
const PHONE_SCREEN = new THREE.MeshStandardMaterial({ color: "#8fd3ff", emissive: "#5aa9ff", emissiveIntensity: 0.9, roughness: 0.3 });
const SOLE = std("#ecebe6", 0.9);

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
/** faceted limb segment: a seven-sided tapered tube along y */
const tube = (rt, rb, h, n = 7) => new THREE.CylinderGeometry(rt, rb, h, n);
/** faceted ball for joints, buns and curls */
const blob = (r, detail = 1) => new THREE.IcosahedronGeometry(r, detail);
const lathe = (pts, seg = 8, start = PI / 8, len = PI * 2) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg, start, len);

// ---- head profile (radius, height above the neck pivot); lathed in 8 segments starting at
// 22.5° so a flat facet faces forward, then stretched 1.1× front-to-back
const HEAD = [[0, 0], [0.034, 0], [0.06, 0.022], [0.075, 0.065], [0.083, 0.11], [0.086, 0.155], [0.081, 0.195], [0.062, 0.225], [0.033, 0.242], [0, 0.248]];
const HEAD_TOP = HEAD[HEAD.length - 1][1];
const HEAD_DZ = 1.1;
const SIDE_K = Math.cos(PI / 8);
function headR(y) {
  for (let i = 1; i < HEAD.length; i++) {
    const [r0, y0] = HEAD[i - 1], [r1, y1] = HEAD[i];
    if (y <= y1) return r0 + (r1 - r0) * ((y - y0) / (y1 - y0));
  }
  return 0;
}
/** z of the front facet at height y */
const faceZ = (y) => headR(y) * HEAD_DZ * SIDE_K;
/** x of the side facet at height y */
const sideX = (y) => headR(y) * SIDE_K;
/** A shell hugging the skull between y0 and y1, pushed out by `scale`, with rims folded back to the skull so the edges look solid. */
function headShell(y0, y1, scale, seg = 8, start = PI / 8, len = PI * 2) {
  const r0 = headR(y0);
  const pts = r0 > 0 ? [[r0 * 0.96, y0], [r0 * scale, y0]] : [[0, y0]];
  for (const [r, y] of HEAD) if (y > y0 && y < y1) pts.push([r * scale, y]);
  pts.push([headR(y1) * scale, y1]);
  if (y1 < HEAD_TOP) pts.push([headR(y1) * 0.96, y1]);
  const g = lathe(pts, seg, start, len);
  g.scale(1, 1, HEAD_DZ);
  return g;
}

/** Chunky angular hair: lathed shells over the crown, sides and nape, plus wedges, slabs, a bun, a tail or curls per style. */
function buildHair(head, look, hairMat, add) {
  const s = look.hairStyle;
  if (s === "bald") return;
  const shell = (y0, y1, start, len, scale = 1.07) => add(head, mesh(headShell(y0, y1, scale, Math.round(len / (PI / 4)), start, len), hairMat));
  const front = { short: 0.19, swept: 0.185, bun: 0.185, ponytail: 0.185, long: 0.175, curly: 0.17, bob: 0.19 }[s] ?? 0.185;
  const side = { short: 0.155, swept: 0.15, bun: 0.15, ponytail: 0.15, long: 0.12, curly: 0.12, bob: 0.12 }[s] ?? 0.15;
  const back = { short: 0.12, swept: 0.115, bun: 0.13, ponytail: 0.125, long: 0.1, curly: 0.1, bob: 0.1 }[s] ?? 0.12;
  shell(front, HEAD_TOP, PI / 8, PI * 2); // crown, all round from the front hairline up
  shell(side, front + 0.012, (3 * PI) / 8, (5 * PI) / 4); // sides and back, from above the ears
  shell(back, side + 0.012, (5 * PI) / 8, (3 * PI) / 4); // nape
  const wedge = (geo, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = mesh(geo, hairMat, x, y, z);
    m.rotation.set(rx, ry, rz);
    add(head, m);
    return m;
  };
  if (s === "short") wedge(box(0.12, 0.022, 0.05), 0, 0.243, 0.045, -0.5);
  if (s === "swept") {
    // a thick lock swept up and to one side over the forehead, a smaller one falling at the temple
    wedge(frustum(0.15, 0.07, 0.09, 0.04, 0.055, 0, -0.01), 0.015, 0.235, 0.05, -0.35, 0, -0.25);
    wedge(frustum(0.07, 0.06, 0.035, 0.03, 0.06), 0.065, 0.21, 0.045, -0.2, 0.3, -0.7);
  }
  if (s === "bun") {
    add(head, mesh(blob(0.042, 1), hairMat, 0, 0.215, -0.105));
    add(head, mesh(tube(0.03, 0.03, 0.012, 6), DARK, 0, 0.215, -0.105).rotateX(PI / 2));
  }
  if (s === "ponytail") {
    const tail = mesh(tube(0.028, 0.013, 0.23, 5), hairMat, 0, 0.05, -0.122);
    tail.rotation.x = 0.25;
    add(head, tail);
    add(head, mesh(tube(0.033, 0.033, 0.02, 6), DARK, 0, 0.155, -0.098).rotateX(0.25));
  }
  if (s === "bob") {
    for (const x of [-1, 1]) add(head, mesh(box(0.045, 0.15, 0.13), hairMat, x * 0.097, 0.1, -0.012));
    add(head, mesh(box(0.19, 0.17, 0.06), hairMat, 0, 0.11, -0.088));
    wedge(box(0.155, 0.04, 0.045), 0, 0.212, 0.062, -0.35); // straight fringe, ending above the brows
  }
  if (s === "long") {
    for (const x of [-1, 1]) add(head, mesh(box(0.05, 0.24, 0.13), hairMat, x * 0.1, 0.05, -0.02));
    add(head, mesh(box(0.185, 0.27, 0.07), hairMat, 0, 0.065, -0.088));
    wedge(frustum(0.13, 0.05, 0.08, 0.03, 0.04), 0.02, 0.205, 0.068, -0.4, 0, -0.2); // side-swept fringe
  }
  if (s === "curly") {
    // a cloud of faceted curls around the crown and the sides
    for (let i = 0; i < 9; i++) {
      const a = PI * 0.33 + (i / 8) * PI * 1.34, r = 0.095;
      add(head, mesh(blob(0.04, 0), hairMat, Math.sin(a) * r, 0.16 + (i % 2) * 0.03, Math.cos(a) * r * HEAD_DZ)).castShadow = false;
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2;
      add(head, mesh(blob(0.04, 0), hairMat, Math.sin(a) * 0.06, 0.235, Math.cos(a) * 0.06 - 0.01)).castShadow = false;
    }
    add(head, mesh(blob(0.045, 0), hairMat, 0, 0.262, -0.01)).castShadow = false;
  }
}

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
  const skin = std(look.skin, 0.8);
  const hair = std(look.hair, 0.85);
  const shirt = std(look.shirt, 0.9);
  const shirtDark = std(new THREE.Color(look.shirt).multiplyScalar(0.8), 0.9);
  const jacket = look.jacket ? std(look.jacket, 0.9) : null;
  const pants = std(look.pants, 0.9);
  const shoes = std(look.shoes, look.shoeStyle === "heels" || look.shoeStyle === "boots" ? 0.45 : 0.8);
  const lips = std(look.lips || new THREE.Color(look.skin).multiplyScalar(0.72), 0.7);
  const eye = std(EYE_COLORS[look.eyes] || EYE_COLORS.dark, 0.4);
  const style = look.shirtStyle || "tee";
  const bulk = style === "hoodie" || style === "sweater" ? 0.015 : 0; // knits sit looser than a shirt
  const shirtLight = new THREE.Color(look.shirt).getHSL({}).l > 0.6;
  const belt = !look.skirt && !jacket && (style === "collar" || style === "blouse"); // tucked shirt shows the belt

  // ---- hips + legs ----
  const hips = new THREE.Group();
  hips.position.y = HIP_STAND;
  root.add(hips);
  if (look.skirt) add(hips, mesh(frustum(0.36, 0.24, 0.29, 0.18, 0.27), pants, 0, -0.085, 0));
  else {
    add(hips, mesh(frustum(0.31, 0.19, 0.29, 0.18, 0.15), pants, 0, -0.025, 0));
    if (belt) add(hips, mesh(box(0.3, 0.03, 0.19), DARK, 0, 0.06, 0));
  }
  const leg = (side) => {
    const legMat = look.skirt ? skin : pants;
    const hip = new THREE.Group();
    hip.position.set(side * 0.095, -HIP_OFF, 0);
    hips.add(hip);
    add(hip, mesh(tube(0.078, 0.062, THIGH), legMat, 0, -THIGH / 2, 0));
    const knee = new THREE.Group();
    knee.position.y = -THIGH;
    hip.add(knee);
    add(knee, mesh(blob(0.058, 1), legMat, 0, 0, 0));
    add(knee, mesh(tube(0.058, 0.044, SHIN), legMat, 0, -SHIN / 2, 0));
    // shoes: the ankle is at -SHIN, the floor ANKLE below it
    const st = look.shoeStyle || "flats";
    const floor = -SHIN - ANKLE;
    if (st === "sneakers") {
      add(knee, mesh(box(0.1, 0.03, 0.27), SOLE, 0, floor + 0.015, 0.035));
      add(knee, mesh(frustum(0.095, 0.25, 0.08, 0.19, 0.055, 0, -0.025), shoes, 0, floor + 0.0575, 0.035));
      add(knee, mesh(box(0.04, 0.02, 0.05), WHITE, 0, floor + 0.09, 0.055)).castShadow = false; // tongue
    } else if (st === "boots") {
      add(knee, mesh(box(0.1, 0.02, 0.26), DARK, 0, floor + 0.01, 0.04));
      add(knee, mesh(frustum(0.095, 0.25, 0.085, 0.21, 0.06, 0, -0.015), shoes, 0, floor + 0.05, 0.04));
      add(knee, mesh(tube(0.06, 0.064, 0.12), shoes, 0, -SHIN + 0.05, 0));
    } else if (st === "heels") {
      const foot = mesh(frustum(0.08, 0.22, 0.068, 0.19, 0.035, 0, -0.01), shoes, 0, floor + 0.045, 0.05);
      foot.rotation.x = 0.25;
      add(knee, foot);
      add(knee, mesh(box(0.018, 0.07, 0.018), shoes, 0, floor + 0.035, -0.055));
    } else {
      add(knee, mesh(box(0.09, 0.012, 0.25), DARK, 0, floor + 0.006, 0.04));
      add(knee, mesh(frustum(0.088, 0.24, 0.07, 0.19, 0.045, 0, -0.02), shoes, 0, floor + 0.0345, 0.04));
    }
    return { hip, knee };
  };
  const L = leg(-1), Rg = leg(1);

  // ---- torso: abdomen + chest with a vertical front, then the outfit ----
  const torso = new THREE.Group();
  torso.position.y = 0.1;
  hips.add(torso);
  const hem = belt ? -0.03 : -0.08; // an untucked shirt hangs over the hips
  const FZ = 0.095 + bulk; // z of the torso's front face
  const body = (mat, w0, w1, y0, y1, d0, d1, fz = FZ) => add(torso, mesh(frustum(w0, d0, w1, d1, y1 - y0, fz - d0 / 2, fz - d1 / 2), mat, 0, (y0 + y1) / 2, 0));
  body(shirt, 0.28 + bulk, 0.32 + bulk, hem, 0.22, 0.17 + bulk, 0.19 + bulk);
  body(shirt, 0.32 + bulk, 0.37 + bulk, 0.22, 0.44, 0.19 + bulk, 0.2 + bulk);
  add(torso, mesh(tube(0.038, 0.046, 0.1, 6), skin, 0, 0.455, 0));
  const front = (geo, mat, x, y, dz = 0) => add(torso, mesh(geo, mat, x, y, (jacket ? FZ + 0.025 : FZ) + dz));
  if (style === "tee") add(torso, mesh(new THREE.TorusGeometry(0.052, 0.012, 4, 8), shirtDark, 0, 0.445, -0.005).rotateX(PI / 2));
  if (style === "sweater") {
    add(torso, mesh(new THREE.TorusGeometry(0.058, 0.017, 4, 8), shirtDark, 0, 0.445, -0.005).rotateX(PI / 2));
    body(shirtDark, 0.3 + bulk, 0.3 + bulk, hem, hem + 0.035, 0.18 + bulk, 0.18 + bulk, FZ + 0.004); // ribbed hem
  }
  if (style === "hoodie") {
    // hood bunched at the back of the neck, a chunky rim in a V at the front, drawstrings, kangaroo pocket
    const hood = mesh(frustum(0.22 + bulk, 0.11, 0.15, 0.06, 0.14, 0, -0.03), shirtDark, 0, 0.44, -0.1);
    hood.rotation.x = -0.4;
    add(torso, hood);
    add(torso, mesh(new THREE.TorusGeometry(0.072, 0.02, 4, 8), shirtDark, 0, 0.44, -0.01).rotateX(PI / 2));
    for (const s of [-1, 1]) {
      const rim = front(box(0.1, 0.035, 0.035), shirtDark, s * 0.045, 0.415, -0.012);
      rim.rotation.set(0, -s * 0.3, s * 0.7);
      front(tube(0.004, 0.004, 0.14, 4), STRING, s * 0.03, 0.335, 0.006);
      front(box(0.009, 0.018, 0.009), DARK, s * 0.03, 0.258, 0.006);
    }
    front(box(0.22, 0.1, 0.014), shirtDark, 0, 0.02, 0.004);
    body(shirtDark, 0.3 + bulk, 0.3 + bulk, hem, hem + 0.035, 0.18 + bulk, 0.18 + bulk, FZ + 0.004);
  }
  if (style === "collar" || style === "blouse") {
    const blouse = style === "blouse";
    for (const s of [-1, 1]) {
      const c = mesh(blouse ? box(0.06, 0.045, 0.01) : box(0.075, 0.05, 0.012), shirtDark, s * 0.042, 0.445, FZ - 0.025);
      c.rotation.set(-0.3, -s * 0.35, s * 0.55);
      add(torso, c);
    }
    if (!jacket) {
      front(box(0.024, 0.4, 0.006), shirtDark, 0, 0.19, 0.003);
      if (!blouse) for (let i = 0; i < 4; i++) front(box(0.011, 0.011, 0.006), shirtLight ? DARK : WHITE, 0, 0.36 - i * 0.09, 0.008).castShadow = false;
    }
  }
  if (jacket) {
    // blazer: a looser body over the shirt, the shirt showing in a V between two lapels, a collar at the back of the neck
    const JZ = FZ + 0.025;
    body(jacket, 0.34 + bulk, 0.36 + bulk, -0.07, 0.22, 0.215 + bulk, 0.235 + bulk, JZ);
    body(jacket, 0.36 + bulk, 0.41 + bulk, 0.22, 0.445, 0.235 + bulk, 0.245 + bulk, JZ);
    const open = look.jacketOpen;
    front(frustum(open ? 0.08 : 0.03, 0.006, open ? 0.2 : 0.14, 0.006, 0.42), shirt, 0, 0.14, 0.002);
    for (const s of [-1, 1]) {
      const lapel = front(box(0.065, 0.24, 0.008), jacket, s * (open ? 0.075 : 0.052), 0.3, 0.007);
      lapel.rotation.set(0, -s * 0.12, -s * 0.28);
    }
    add(torso, mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.035, 8, 1, true, PI / 2, PI), jacket, 0, 0.44, -0.01));
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

  // ---- arms ----
  const arm = (side) => {
    const sh = new THREE.Group();
    sh.position.set(side * (0.195 + bulk), 0.41, 0);
    torso.add(sh);
    const short = look.sleeves === "short" && !jacket;
    const upperMat = jacket || (short ? skin : shirt);
    const lowerMat = jacket || (look.sleeves === "long" ? shirt : skin);
    add(sh, mesh(blob(0.058 + bulk / 2, 1), jacket || shirt, 0, 0, 0));
    add(sh, mesh(tube(0.048, 0.04, 0.27), upperMat, 0, -0.15, 0));
    if (short) add(sh, mesh(tube(0.057, 0.052, 0.13), shirt, 0, -0.065, 0));
    const el = new THREE.Group();
    el.position.y = -UPPER_ARM;
    sh.add(el);
    add(el, mesh(blob(0.042, 1), lowerMat, 0, 0, 0));
    add(el, mesh(tube(0.04, 0.031, 0.25), lowerMat, 0, -0.125, 0));
    if (jacket) add(el, mesh(tube(0.036, 0.036, 0.022), shirt, 0, -0.245, 0));
    else if (bulk) add(el, mesh(tube(0.036, 0.034, 0.03), shirtDark, 0, -0.24, 0));
    const hand = new THREE.Group();
    hand.position.y = -FOREARM;
    el.add(hand);
    add(hand, mesh(frustum(0.06, 0.03, 0.05, 0.022, 0.09), skin, 0, -0.045, 0));
    add(hand, mesh(frustum(0.05, 0.02, 0.06, 0.03, 0.065), skin, 0, -0.1225, 0));
    const thumb = add(hand, mesh(box(0.018, 0.045, 0.02), skin, side * 0.032, -0.05, 0.01));
    thumb.rotation.z = -side * 0.35;
    return { sh, el, hand };
  };
  const AL = arm(-1), AR = arm(1);

  // props in the right hand: mug, phone, paddle — hidden until needed
  const mug = new THREE.Group();
  mug.rotation.x = PI / 2 - 0.3; // upright with the forearm level, tipping towards the face as the wrist folds
  mug.position.set(0, -0.075, 0.02);
  const mugBody = mesh(new THREE.CylinderGeometry(0.036, 0.032, 0.085, 8, 1, true), std(bot.accent, 0.6, { side: THREE.DoubleSide }), 0, 0.02, 0);
  mugBody.castShadow = false;
  mug.add(mugBody, mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.01, 8), MUG_IN, 0, 0.052, 0));
  const handle = mesh(new THREE.TorusGeometry(0.022, 0.006, 4, 8, PI), std(bot.accent, 0.6), 0.036, 0.02, 0);
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
  paddle.rotation.x = -PI / 2;
  paddle.position.y = -0.06;
  paddle.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 12), std("#c0392b", 0.8), 0, 0.15, 0).rotateX(PI / 2));
  paddle.add(mesh(box(0.03, 0.12, 0.02), std("#c9a24a", 0.8), 0, 0.035, 0));
  paddle.visible = false;
  AR.hand.add(paddle);

  // ---- head: an eight-sided lathed skull, small eyes, thin brows, wedge nose, small mouth ----
  const head = new THREE.Group();
  head.position.y = 0.48;
  torso.add(head);
  const skull = lathe(HEAD);
  skull.scale(1, 1, HEAD_DZ);
  add(head, mesh(skull, skin));
  const earStyles = new Set(["bald", "short", "swept", "bun", "ponytail"]);
  if (earStyles.has(look.hairStyle)) for (const s of [-1, 1]) add(head, mesh(box(0.012, 0.03, 0.022), skin, s * (sideX(0.14) + 0.004), 0.14, -0.006));
  const nose = add(head, mesh(new THREE.ConeGeometry(0.011, 0.028, 4), skin, 0, 0.128, faceZ(0.128) + 0.011));
  nose.rotation.x = PI / 2 + 0.15;
  const EYE_Y = 0.152, EYE_SY = 0.8;
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = mesh(new THREE.SphereGeometry(0.011, 6, 4), eye, s * 0.031, EYE_Y, faceZ(EYE_Y) + 0.002);
    e.scale.set(1, EYE_SY, 0.5);
    e.castShadow = false;
    e.userData.dynamic = true;
    e.userData.bot = bot.id;
    head.add(e);
    eyes.push(e);
    const brow = add(head, mesh(box(0.034, 0.006, 0.006), hair, s * 0.032, 0.178, faceZ(0.178) + 0.002));
    brow.rotation.set(0, s * 0.3, -s * 0.1);
    brow.castShadow = false;
  }
  // a small closed smile; a laugh swaps it for a small open mouth with a strip of teeth
  const MZ = faceZ(0.078) + 0.002;
  const smile = new THREE.Group();
  smile.position.set(0, 0.078, MZ);
  smile.userData.dynamic = true;
  head.add(smile);
  const smileLine = mesh(box(0.03, 0.005, 0.005), lips, 0, 0, 0);
  smileLine.castShadow = false;
  smile.add(smileLine);
  for (const s of [-1, 1]) {
    const corner = mesh(box(0.009, 0.005, 0.005), lips, s * 0.017, 0.003, 0);
    corner.rotation.z = s * 0.7;
    corner.castShadow = false;
    smile.add(corner);
  }
  const open = new THREE.Group();
  open.position.set(0, 0.076, MZ);
  open.userData.dynamic = true;
  open.visible = false;
  head.add(open);
  const openIn = mesh(box(0.024, 0.02, 0.006), MOUTH, 0, -0.003, 0);
  openIn.castShadow = false;
  const openTeeth = mesh(box(0.018, 0.004, 0.003), TEETH, 0, 0.005, 0.003);
  openTeeth.castShadow = false;
  open.add(openIn, openTeeth);
  if (look.beard) {
    add(head, mesh(headShell(0, 0.07, 1.06, 5, (-5 * PI) / 8, (5 * PI) / 4), hair));
    add(head, mesh(box(0.036, 0.008, 0.008), hair, 0, 0.093, faceZ(0.093) + 0.003)).castShadow = false;
  }
  if (look.glasses) {
    const gz = faceZ(EYE_Y) + 0.008;
    for (const s of [-1, 1]) {
      const ring = mesh(new THREE.TorusGeometry(0.019, 0.0025, 4, 8), GLASS, s * 0.031, EYE_Y, gz);
      ring.rotation.z = PI / 8;
      ring.castShadow = false;
      add(head, ring);
      const temple = mesh(box(0.003, 0.003, 0.1), GLASS, s * (sideX(EYE_Y) + 0.002), EYE_Y + 0.003, gz - 0.05);
      temple.castShadow = false;
      add(head, temple);
    }
    add(head, mesh(box(0.02, 0.003, 0.003), GLASS, 0, EYE_Y + 0.003, gz)).castShadow = false;
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
    hipL: L.hip, hipR: Rg.hip, kneeL: L.knee, kneeR: Rg.knee,
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
      for (const e of eyes) e.scale.y = closed ? 0.15 : EYE_SY;
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
    rig.set({ shRx: -0.05, elRx: -1.3, shRz: 0.05, shRy: -0.15, shLx: -0.15, elLx: -0.6 });
  },
  crossed(rig, t, p) {
    // arms folded, each hand tucked under the other upper arm
    POSES.stand(rig, t, p);
    rig.set({ shLx: 0.2, shRx: 0.15, elLx: -1.7, elRx: -1.62, shLy: 0.9, shRy: -0.9, shLz: 0, shRz: 0, headRx: -0.05 + Math.sin(t * 0.5 + p) * 0.03 });
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
    rig.set({ shRx: -0.6, shRz: 0.4, shRy: -0.5, elRx: -1.1, shLx: -0.35, elLx: -0.8, torsoRx: 0.12, headRx: 0.12, hipsY: HIP_STAND - 0.01, kneeLx: 0.3, kneeRx: 0.3, hipLx: -0.2, hipRx: -0.2 });
  },
  wave(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -2.6, shRz: 0.5 + Math.sin(t * 9) * 0.3, elRx: -0.5, headRx: -0.05 });
  },
};
