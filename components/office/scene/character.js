// A stylised office worker in the look of the 3D-avatar reference: a big
// round head with dot eyes and highlights, thick brows, prominent ears, an
// open smile with teeth, chunky glossy hair, a slim body about four heads
// tall. Outfits: blazers with lapels over shirts, collared shirts with ties
// and lanyard badges, tees, sweaters, hoodies, a skirt, boots, heels and
// sneakers. Built from primitives and merged per material, so a person costs
// ~25 draw calls. Every joint has a current and a target value; poses only
// set targets and `update` eases towards them, so any state change blends.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const HIP_STAND = 0.71;
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
];

const REST = {
  hipsY: HIP_STAND, hipsZ: 0, hipsRx: 0, torsoRx: 0, torsoRy: 0, torsoRz: 0,
  headRx: 0, headRy: 0, headRz: 0,
  shLx: 0, shLy: 0, shLz: -0.08, shRx: 0, shRy: 0, shRz: 0.08, elLx: -0.15, elRx: -0.15,
  hipLx: 0, hipRx: 0, hipLz: 0.015, hipRz: -0.015, kneeLx: 0.05, kneeRx: 0.05,
};

const PI = Math.PI;
const std = (color, roughness = 0.6, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
const EYE = std("#141418", 0.25);
const EYE_HI = std("#ffffff", 0.2);
const TEETH = std("#ffffff", 0.35);
const MOUTH = std("#b8353b", 0.5);
const GLASS = std("#2a2a30", 0.45, { metalness: 0.4 });
const WHITE = std("#f7f7f8", 0.6);
const DARK = std("#26262c", 0.6);
const BADGE = std("#2a2a30", 0.5);
const BADGE_ICON = std("#f2c14e", 0.5);
const MUG_IN = std("#ffffff", 0.4);
const PHONE = std("#1a1b20", 0.3, { metalness: 0.3 });
const PHONE_SCREEN = new THREE.MeshStandardMaterial({ color: "#8fd3ff", emissive: "#5aa9ff", emissiveIntensity: 0.9, roughness: 0.3 });
const SOLE = std("#f2f2f2", 0.6);

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
const rbox = (w, h, d, r = 0.05, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, r);
const sph = (r, ws = 16, hs = 12) => new THREE.SphereGeometry(r, ws, hs);
const R = 0.2; // head radius

/** Chunky hair: a cap tilted off the forehead, a wedge over the back and sides, and big swept tufts. */
function buildHair(head, look, hairMat, add) {
  const s = look.hairStyle;
  if (s === "bald") return;
  const cy = R;
  const cap = mesh(new THREE.SphereGeometry(R * 1.07, 28, 16, 0, PI * 2, 0, PI * 0.44), hairMat, 0, cy + 0.008, -0.012);
  cap.rotation.x = -0.16;
  add(head, cap);
  const backLen = { bob: PI * 0.9, long: PI * 0.98, curly: PI * 0.74, short: PI * 0.66, swept: PI * 0.64, bun: PI * 0.7, ponytail: PI * 0.68 }[s] || PI * 0.68;
  add(head, mesh(new THREE.SphereGeometry(R * 1.08, 28, 16, PI, PI, 0, backLen), hairMat, 0, cy, -0.01));
  const tuft = (x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) => {
    const m = mesh(sph(0.1, 16, 12), hairMat, x, y, z);
    m.scale.set(sx, sy, sz);
    m.rotation.set(rx, ry, rz);
    add(head, m);
    return m;
  };
  if (s === "bun" || s === "ponytail" || s === "bob") {
    // straight bangs high on the forehead, never over the eyes
    tuft(0, cy + 0.15, 0.13, 1.75, 0.45, 0.8, 0.5, 0, 0);
  }
  if (s === "bun") add(head, mesh(sph(0.075, 16, 12), hairMat, 0, cy + 0.2, -0.1));
  if (s === "ponytail") {
    const tail = mesh(new THREE.CapsuleGeometry(0.045, 0.3, 6, 12), hairMat, 0, cy - 0.1, -0.235);
    tail.rotation.x = 0.35;
    add(head, tail);
  }
  if (s === "bob") {
    add(head, mesh(rbox(0.08, 0.26, 0.22, 0.03), hairMat, -0.185, cy - 0.06, 0.0));
    add(head, mesh(rbox(0.08, 0.26, 0.22, 0.03), hairMat, 0.185, cy - 0.06, 0.0));
  }
  if (s === "swept" || s === "short") {
    // volume on top swept to one side, pointed tips over the forehead
    tuft(-0.04, cy + 0.19, 0.03, 1.5, 0.65, 1.35, 0, 0, -0.15);
    tuft(0.05, cy + 0.155, 0.12, 1.4, 0.5, 0.9, 0.45, 0.35, -0.35);
    tuft(0.12, cy + 0.12, 0.135, 0.55, 0.32, 0.9, 0.35, 0.6, -0.55);
    tuft(-0.1, cy + 0.16, 0.1, 0.8, 0.42, 0.85, 0.3, -0.4, 0.3);
  }
  if (s === "long") {
    tuft(0.04, cy + 0.15, 0.125, 1.5, 0.45, 0.75, 0.5, 0, -0.25);
    add(head, mesh(rbox(0.36, 0.5, 0.15, 0.05), hairMat, 0, cy - 0.22, -0.14));
    add(head, mesh(rbox(0.08, 0.44, 0.16, 0.03), hairMat, -0.195, cy - 0.16, 0.0));
    add(head, mesh(rbox(0.08, 0.44, 0.16, 0.03), hairMat, 0.195, cy - 0.16, 0.0));
  }
  if (s === "curly") {
    for (let i = 0; i < 12; i++) {
      const a = PI * 0.15 + (i / 12) * PI * 1.7, r = 0.18, y = cy + 0.1 + Math.sin(i * 1.7) * 0.05;
      const curl = mesh(sph(0.065, 10, 8), hairMat, Math.cos(a) * r, y, -Math.sin(a) * r * 0.9 - 0.01);
      curl.castShadow = false;
      add(head, curl);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2;
      add(head, mesh(sph(0.06, 10, 8), hairMat, Math.cos(a) * 0.1, cy + 0.2, Math.sin(a) * 0.1 - 0.01)).castShadow = false;
    }
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
  const skin = std(look.skin, 0.45);
  const hair = std(look.hair, 0.38);
  const shirt = std(look.shirt, 0.6);
  const shirtDark = std(new THREE.Color(look.shirt).multiplyScalar(0.82), 0.65);
  const jacket = look.jacket ? std(look.jacket, 0.6) : null;
  const sleeveMat = jacket || shirt;
  const pants = std(look.pants, 0.7);
  const shoes = std(look.shoes, look.shoeStyle === "heels" || look.shoeStyle === "boots" ? 0.35 : 0.55);

  // ---- hips + legs ----
  const hips = new THREE.Group();
  hips.position.y = HIP_STAND;
  root.add(hips);
  if (look.skirt) {
    add(hips, mesh(rbox(0.36, 0.26, 0.24, 0.07), pants, 0, -0.07, 0));
  } else {
    add(hips, mesh(rbox(0.34, 0.2, 0.22, 0.07), pants, 0, -0.02, 0));
    if (!jacket) add(hips, mesh(rbox(0.35, 0.03, 0.23, 0.01), DARK, 0, 0.07, 0));
  }
  const leg = (side) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.09, -0.05, 0);
    hips.add(hip);
    add(hip, mesh(new THREE.CapsuleGeometry(0.06, 0.2, 6, 14), look.skirt ? skin : pants, 0, -0.16, 0));
    const knee = new THREE.Group();
    knee.position.y = -0.32;
    hip.add(knee);
    add(knee, mesh(new THREE.CapsuleGeometry(0.052, 0.19, 6, 14), look.skirt ? skin : pants, 0, -0.145, 0));
    const st = look.shoeStyle || "flats";
    if (st === "boots") {
      add(knee, mesh(rbox(0.11, 0.14, 0.14, 0.03), shoes, 0, -0.27, -0.01));
      add(knee, mesh(rbox(0.1, 0.06, 0.25, 0.025), shoes, 0, -0.31, 0.05));
    } else if (st === "heels") {
      add(knee, mesh(rbox(0.09, 0.05, 0.23, 0.02), shoes, 0, -0.315, 0.05));
      add(knee, mesh(new THREE.CylinderGeometry(0.012, 0.01, 0.05, 8), shoes, 0, -0.33, -0.05));
    } else {
      add(knee, mesh(rbox(0.1, 0.06, 0.25, 0.025), shoes, 0, -0.31, 0.05));
      if (st === "sneakers") add(knee, mesh(rbox(0.105, 0.022, 0.255, 0.01), SOLE, 0, -0.332, 0.05));
    }
    return { hip, knee };
  };
  const L = leg(-1), Rg = leg(1);

  // ---- torso: waist + chest, an optional blazer with lapels, collar, tie, lanyard ----
  const torso = new THREE.Group();
  torso.position.y = 0.1;
  hips.add(torso);
  add(torso, mesh(rbox(0.33, 0.16, 0.21, 0.06), shirt, 0, 0.05, 0));
  add(torso, mesh(rbox(0.42, 0.3, 0.25, 0.09), shirt, 0, 0.27, 0));
  if (jacket) {
    add(torso, mesh(rbox(0.46, 0.44, 0.28, 0.08), jacket, 0, 0.21, -0.005));
    add(torso, mesh(rbox(0.12, 0.3, 0.02, 0.008), shirt, 0, 0.26, 0.14));
    for (const s of [-1, 1]) {
      const lapel = mesh(rbox(0.07, 0.2, 0.014, 0.006), jacket, s * 0.085, 0.3, 0.145);
      lapel.rotation.z = s * 0.45;
      lapel.rotation.y = -s * 0.2;
      add(torso, lapel);
    }
    add(torso, mesh(new THREE.SphereGeometry(0.009, 6, 6), DARK, 0.035, 0.11, 0.143)).castShadow = false;
  }
  if (look.shirtStyle === "collar" || look.shirtStyle === "blouse") {
    for (const s of [-1, 1]) {
      const c = mesh(rbox(0.085, 0.07, 0.03, 0.01), shirtDark, s * 0.05, 0.415, 0.11);
      c.rotation.z = s * 0.6;
      c.rotation.x = -0.35;
      add(torso, c);
    }
    if (!jacket) {
      add(torso, mesh(rbox(0.03, 0.3, 0.012, 0.004), shirtDark, 0, 0.25, 0.128));
      for (let i = 0; i < 3; i++) add(torso, mesh(new THREE.SphereGeometry(0.008, 6, 6), WHITE, 0, 0.35 - i * 0.09, 0.134)).castShadow = false;
    }
  }
  if (look.shirtStyle === "sweater") {
    const v = mesh(rbox(0.08, 0.08, 0.02, 0.01), skin, 0, 0.4, 0.122);
    v.rotation.z = PI / 4;
    add(torso, v);
  }
  if (look.shirtStyle === "hoodie") {
    const hood = mesh(new THREE.TorusGeometry(0.13, 0.045, 10, 20, PI), shirtDark, 0, 0.42, -0.03);
    hood.rotation.x = PI / 2;
    hood.rotation.z = PI;
    add(torso, hood);
  }
  if (look.tie) {
    const tieM = std(look.tie, 0.55);
    add(torso, mesh(rbox(0.05, 0.24, 0.016, 0.007), tieM, 0, 0.255, 0.148));
    add(torso, mesh(rbox(0.06, 0.04, 0.024, 0.008), tieM, 0, 0.395, 0.15));
  }
  if (look.lanyard) {
    const strap = std(typeof look.lanyard === "string" ? look.lanyard : bot.accent, 0.6);
    const sL = mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.24, 6), strap, -0.055, 0.29, 0.135);
    sL.rotation.z = 0.3;
    const sR = sL.clone();
    sR.position.x = 0.055;
    sR.rotation.z = -0.3;
    add(torso, sL);
    add(torso, sR);
    add(torso, mesh(rbox(0.08, 0.1, 0.014, 0.006), BADGE, 0, 0.14, 0.14));
    add(torso, mesh(new THREE.SphereGeometry(0.013, 8, 8), BADGE_ICON, 0, 0.16, 0.15)).castShadow = false;
    add(torso, mesh(rbox(0.036, 0.018, 0.008, 0.004), BADGE_ICON, 0, 0.128, 0.15)).castShadow = false;
  }
  add(torso, mesh(new THREE.CylinderGeometry(0.055, 0.062, 0.1, 14), skin, 0, 0.44, 0));

  // ---- arms ----
  const arm = (side) => {
    const sh = new THREE.Group();
    sh.position.set(side * 0.23, 0.38, 0);
    torso.add(sh);
    add(sh, mesh(sph(0.06, 12, 10), sleeveMat, 0, 0, 0));
    const short = look.sleeves === "short" && !jacket;
    add(sh, mesh(new THREE.CapsuleGeometry(0.05, 0.16, 6, 12), short ? skin : sleeveMat, 0, -0.13, 0));
    if (short) add(sh, mesh(new THREE.CylinderGeometry(0.058, 0.055, 0.09, 12), shirt, 0, -0.04, 0));
    const el = new THREE.Group();
    el.position.y = -0.25;
    sh.add(el);
    add(el, mesh(new THREE.CapsuleGeometry(0.045, 0.14, 6, 12), look.sleeves === "long" || jacket ? sleeveMat : skin, 0, -0.115, 0));
    if (jacket) add(el, mesh(new THREE.CylinderGeometry(0.047, 0.047, 0.02, 12), WHITE, 0, -0.2, 0));
    const hand = new THREE.Group();
    hand.position.y = -0.22;
    el.add(hand);
    add(hand, mesh(rbox(0.07, 0.09, 0.04, 0.015), skin, 0, -0.04, 0));
    return { sh, el, hand };
  };
  const AL = arm(-1), AR = arm(1);

  // props in the right hand: mug, phone, paddle — hidden until needed
  const mug = new THREE.Group();
  mug.rotation.x = -PI / 2;
  mug.position.set(0, -0.03, 0.025);
  const mugBody = mesh(new THREE.CylinderGeometry(0.036, 0.032, 0.085, 16, 1, true), std(bot.accent, 0.4, { side: THREE.DoubleSide }), 0, 0.02, 0);
  mugBody.castShadow = false;
  mug.add(mugBody, mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.01, 16), MUG_IN, 0, 0.052, 0));
  const handle = mesh(new THREE.TorusGeometry(0.022, 0.006, 8, 14, PI), std(bot.accent, 0.4), 0.036, 0.02, 0);
  handle.rotation.y = PI / 2;
  mug.add(handle);
  mug.visible = false;
  AR.hand.add(mug);
  const phone = new THREE.Group();
  phone.rotation.x = -1.2;
  phone.position.y = -0.03;
  phone.add(mesh(rbox(0.065, 0.13, 0.01, 0.005), PHONE, 0, 0.045, 0));
  const scr = mesh(rbox(0.055, 0.11, 0.004, 0.003), PHONE_SCREEN, 0, 0.045, 0.006);
  scr.castShadow = false;
  phone.add(scr);
  phone.visible = false;
  AR.hand.add(phone);
  const paddle = new THREE.Group();
  paddle.rotation.x = -PI / 2;
  paddle.position.y = -0.03;
  paddle.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 20), std("#c0392b", 0.7), 0, 0.15, 0).rotateX(PI / 2));
  paddle.add(mesh(rbox(0.03, 0.12, 0.02, 0.008), std("#c9a24a", 0.7), 0, 0.035, 0));
  paddle.visible = false;
  AR.hand.add(paddle);

  // ---- head: round skull, big ears, dot eyes with highlights, thick brows, smile with teeth ----
  const head = new THREE.Group();
  head.position.y = 0.48;
  torso.add(head);
  const cy = R;
  const skull = add(head, mesh(new THREE.SphereGeometry(R, 32, 24), skin, 0, cy, 0));
  skull.scale.set(1, 1.06, 0.98);
  const jaw = add(head, mesh(sph(0.165, 24, 16), skin, 0, cy - 0.1, 0.01));
  jaw.scale.set(0.98, 0.85, 0.95);
  for (const s of [-1, 1]) add(head, mesh(sph(0.055, 12, 10), skin, s * 0.19, cy - 0.01, -0.01)).scale.set(0.5, 1, 0.8);
  add(head, mesh(sph(0.02, 10, 8), skin, 0, cy - 0.03, 0.195)).scale.set(0.8, 1.2, 0.7);
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = add(head, mesh(sph(0.023, 14, 12), EYE, s * 0.072, cy + 0.01, 0.176));
    e.scale.set(1, 1.1, 0.7);
    e.castShadow = false;
    e.userData.dynamic = true;
    eyes.push(e);
    const hi = mesh(sph(0.006, 6, 6), EYE_HI, s * 0.072 + 0.007, cy + 0.018, 0.195);
    hi.castShadow = false;
    hi.userData.dynamic = true;
    head.add(hi);
    const brow = add(head, mesh(rbox(0.085, 0.022, 0.022, 0.01), hair, s * 0.078, cy + 0.072, 0.172));
    brow.rotation.z = s * 0.22;
    brow.rotation.y = s * 0.35;
    brow.castShadow = false;
  }
  // smile with teeth; a laugh opens the mouth wide
  const smile = new THREE.Group();
  smile.position.set(0, cy - 0.095, 0.178);
  smile.userData.dynamic = true;
  head.add(smile);
  const smileIn = mesh(rbox(0.1, 0.05, 0.03, 0.02), MOUTH, 0, 0, 0);
  smileIn.castShadow = false;
  const smileTeeth = mesh(rbox(0.076, 0.02, 0.012, 0.005), TEETH, 0, 0.012, 0.012);
  smileTeeth.castShadow = false;
  smile.add(smileIn, smileTeeth);
  const open = new THREE.Group();
  open.position.set(0, cy - 0.1, 0.176);
  open.userData.dynamic = true;
  open.visible = false;
  head.add(open);
  const openIn = mesh(sph(0.05, 16, 12), MOUTH, 0, 0, 0);
  openIn.scale.set(1.15, 0.85, 0.5);
  openIn.castShadow = false;
  const openTeeth = mesh(rbox(0.076, 0.02, 0.012, 0.005), TEETH, 0, 0.028, 0.02);
  openTeeth.castShadow = false;
  open.add(openIn, openTeeth);
  if (look.beard) {
    const beard = mesh(new THREE.SphereGeometry(R * 1.02, 24, 12, 0, PI, PI * 0.6, PI * 0.4), hair, 0, cy, 0.008);
    beard.scale.set(0.98, 0.95, 0.98);
    add(head, beard);
  }
  if (look.glasses) {
    for (const s of [-1, 1]) {
      const ring = mesh(new THREE.TorusGeometry(0.046, 0.0045, 6, 22), GLASS, s * 0.074, cy + 0.01, 0.192);
      ring.castShadow = false;
      add(head, ring);
      const temple = mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.2, 6), GLASS, s * 0.12, cy + 0.015, 0.095);
      temple.rotation.x = PI / 2;
      temple.castShadow = false;
      add(head, temple);
    }
    add(head, mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.06, 6), GLASS, 0, cy + 0.015, 0.195)).rotation.z = PI / 2;
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
  for (const g of [AL.sh, AR.sh, AL.el, AR.el, L.hip, Rg.hip, L.knee, Rg.knee]) rebuild(g);

  // ---- selection ring ----
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.37, 40),
    new THREE.MeshBasicMaterial({ color: bot.accent, transparent: true, opacity: 0, depthWrite: false })
  );
  ring.rotation.x = -PI / 2;
  ring.position.y = 0.045;
  root.add(ring);

  const parts = { hips, torso, head, shL: AL.sh, shR: AR.sh, elL: AL.el, elR: AR.el, hipL: L.hip, hipR: Rg.hip, kneeL: L.knee, kneeR: Rg.knee };
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
      for (const e of eyes) e.scale.y = closed ? 0.15 : 1.1;
    },
  };
  return rig;
}

// ------------------------------------------------------------------ poses ----
// Each pose writes targets on the rig. `t` is the simulation time, `p` a
// per-character phase so people never move in lock-step.

/** Thigh/shin angles that put the feet on the floor for a given seat height (shins vertical). */
function legsFor(seatY) {
  const a = Math.acos(Math.max(-1, Math.min(1, (seatY - 0.38) / 0.32)));
  return { hipLx: -a, hipRx: -a, kneeLx: a, kneeRx: a, hipLz: 0.06, hipRz: -0.06 };
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
    const s = Math.sin(walkT), c = Math.cos(walkT);
    rig.rest();
    rig.set({
      hipsY: HIP_STAND + Math.abs(c) * 0.018,
      hipLx: s * 0.42,
      hipRx: -s * 0.42,
      kneeLx: 0.12 + Math.max(0, s) * 0.8,
      kneeRx: 0.12 + Math.max(0, -s) * 0.8,
      shLx: -s * 0.45,
      shRx: mug ? -0.35 : s * 0.45,
      elLx: -0.3,
      elRx: mug ? -1.25 : -0.3,
      torsoRx: 0.06,
      torsoRy: s * 0.06,
      headRx: 0.02,
    });
  },
  sitType(rig, t, p, seatY = HIP_SIT) {
    rig.rest();
    rig.set({
      ...legsFor(seatY),
      hipsY: seatY,
      hipsZ: -0.2,
      torsoRx: 0.15,
      shLx: -0.75 + Math.sin(t * 14 + p) * 0.05,
      shRx: -0.75 + Math.cos(t * 13 + p) * 0.05,
      shLz: -0.14, shRz: 0.14,
      elLx: -0.85 + Math.sin(t * 15 + p) * 0.08,
      elRx: -0.85 + Math.cos(t * 16 + p) * 0.08,
      headRx: 0.12 + Math.sin(t * 0.8 + p) * 0.03,
      headRy: Math.sin(t * 0.5 + p) * 0.08,
    });
  },
  sitIdle(rig, t, p, seatY = HIP_SIT, z = -0.2) {
    rig.rest();
    rig.set({
      ...legsFor(seatY),
      hipsY: seatY, hipsZ: z,
      torsoRx: 0.03,
      shLx: -0.35, shRx: -0.35, elLx: -0.9, elRx: -0.9, shLz: -0.12, shRz: 0.12,
      headRx: 0.02,
    });
  },
  sitThink(rig, t, p) {
    POSES.sitIdle(rig, t, p);
    rig.set({ shRx: -0.7, elRx: -2.3, shRz: 0.3, shRy: -0.3, headRx: 0.05, headRz: 0.14, headRy: 0.1 + Math.sin(t * 0.6) * 0.05, torsoRx: 0.06 });
  },
  sitStretch(rig, t, p) {
    POSES.sitIdle(rig, t, p);
    rig.set({ shLx: -2.8, shRx: -2.8, shLz: -0.3, shRz: 0.3, elLx: -0.2, elRx: -0.2, torsoRx: -0.2, headRx: -0.35 });
  },
  sitSip(rig, t, p) {
    POSES.sitIdle(rig, t, p);
    rig.set({ shRx: -0.85, elRx: -2.35, shRz: 0.2, headRx: -0.05, torsoRx: 0.02 });
  },
  sitPhone(rig, t, p) {
    POSES.sitIdle(rig, t, p);
    rig.set({ shRx: -0.85, elRx: -1.95, shRz: 0.15, shRy: -0.25, headRx: 0.42, headRz: 0.05, torsoRx: 0.1 });
  },
  sitLean(rig, t, p) {
    POSES.sitIdle(rig, t, p);
    rig.set({ torsoRx: -0.28, shLx: -2.2, shRx: -2.2, shLz: -0.55, shRz: 0.55, shLy: 0.6, shRy: -0.6, elLx: -2.3, elRx: -2.3, headRx: -0.2 });
  },
  sitHost(rig, t, p, headRy) {
    POSES.sitIdle(rig, t, p);
    rig.set({ headRy, torsoRy: headRy * 0.35, headRx: -0.02, shRx: -0.2, elRx: -0.5 });
  },
  sitSofa(rig, t, p) {
    rig.rest();
    rig.set({
      ...legsFor(HIP_SOFA),
      hipsY: HIP_SOFA, hipsZ: 0,
      hipLz: 0.14, hipRz: -0.14,
      torsoRx: -0.12,
      shLx: -0.25, shRx: -0.25, shLz: -0.4, shRz: 0.4, elLx: -0.8, elRx: -0.8,
      headRx: -0.03,
    });
  },
  sitLow(rig, t, p, seatY = 0.55, z = -0.55) {
    rig.rest();
    rig.set({
      hipsY: seatY, hipsZ: z,
      hipLx: -1.0, hipRx: -1.0, kneeLx: 0.6, kneeRx: 0.6, hipLz: 0.16, hipRz: -0.16,
      torsoRx: -0.2,
      shLx: -0.3, shRx: -0.7, shLz: -0.45, shRz: 0.3, elLx: -0.9, elRx: -2.0, shRy: -0.25,
      headRx: 0.3,
    });
  },
  talk(rig, t, p, intensity = 1) {
    POSES.stand(rig, t, p);
    const g = Math.sin(t * 5.5 + p);
    rig.set({
      shRx: -0.7 + g * 0.25 * intensity,
      elRx: -1.35 + Math.cos(t * 4 + p) * 0.25 * intensity,
      shRz: 0.3,
      shRy: -0.3 + g * 0.2,
      shLx: -0.25 + Math.sin(t * 3 + p) * 0.1,
      elLx: -0.7,
      shLz: -0.15,
      headRx: 0.03 + Math.sin(t * 3.2 + p) * 0.04,
      headRy: Math.sin(t * 1.7 + p) * 0.05,
      torsoRx: 0.04,
    });
  },
  listen(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({
      shLx: -0.35, shRx: -0.35, elLx: -2.0, elRx: -2.0, shLy: 0.8, shRy: -0.8, shLz: -0.2, shRz: 0.2,
      headRx: 0.05 + Math.max(0, Math.sin(t * 2.4 + p)) * 0.08,
      headRz: 0.06,
    });
  },
  laugh(rig, t, p) {
    POSES.stand(rig, t, p);
    const b = Math.abs(Math.sin(t * 13 + p));
    rig.set({
      hipsY: HIP_STAND + b * 0.02,
      torsoRx: -0.2 + b * 0.06,
      headRx: -0.35,
      shLx: -0.5, shRx: -0.5, elLx: -1.6, elRx: -1.6, shLz: -0.45 + b * 0.1, shRz: 0.45 - b * 0.1,
    });
  },
  sitLaugh(rig, t, p, seatY = HIP_SIT, z = -0.2) {
    POSES.sitIdle(rig, t, p, seatY, z);
    const b = Math.abs(Math.sin(t * 13 + p));
    rig.set({ hipsY: seatY + b * 0.015, torsoRx: -0.22 + b * 0.05, headRx: -0.3, shLx: -0.6, shRx: -0.6, elLx: -1.7, elRx: -1.7 });
  },
  pump(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.9 + Math.sin(t * 9) * 0.35, elRx: -1.4, shRz: 0.2, shLx: -0.2, elLx: -0.6, headRx: 0.08, torsoRx: 0.08 });
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
    rig.set({ torsoRx: 0.38, headRx: 0.45, shLx: 0.15, shRx: 0.15, elLx: -0.05, elRx: -0.05, shLz: 0, shRz: 0, hipsY: HIP_STAND - 0.02 });
  },
  press(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -1.25, elRx: -0.35, shRz: 0.1, headRx: 0.15, torsoRx: 0.08 });
  },
  sipStand(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.85, elRx: -2.4, shRz: 0.2, headRx: -0.08, shLx: -0.1, elLx: -0.5 });
  },
  holdMug(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.5, elRx: -1.5, shRz: 0.15, shLx: -0.15, elLx: -0.6 });
  },
  crossed(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shLx: -0.4, shRx: -0.4, elLx: -2.05, elRx: -2.05, shLy: 0.85, shRy: -0.85, shLz: -0.2, shRz: 0.2, headRx: -0.05 + Math.sin(t * 0.5 + p) * 0.03 });
  },
  write(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -1.7 + Math.sin(t * 2.2 + p) * 0.12, elRx: -0.45, shRz: 0.12 + Math.sin(t * 3.1 + p) * 0.2, shRy: -0.2, shLx: -0.2, elLx: -0.7, headRx: -0.15, torsoRx: 0.05 });
  },
  printer(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.95, elRx: -0.5, shLx: -0.6, elLx: -0.7, headRx: 0.35, torsoRx: 0.15 });
  },
  standType(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({
      shLx: -0.6 + Math.sin(t * 14 + p) * 0.05,
      shRx: -0.6 + Math.cos(t * 13 + p) * 0.05,
      shLz: -0.1, shRz: 0.1,
      elLx: -1.05 + Math.sin(t * 15 + p) * 0.08,
      elRx: -1.05 + Math.cos(t * 16 + p) * 0.08,
      headRx: 0.18 + Math.sin(t * 0.8 + p) * 0.03,
      headRy: Math.sin(t * 0.5 + p) * 0.08,
      torsoRx: 0.08,
    });
  },
  standThink(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.7, elRx: -2.3, shRz: 0.3, shRy: -0.3, shLx: -0.5, elLx: -1.0, headRx: 0.05, headRz: 0.14, torsoRx: 0.05 });
  },
  standPhone(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.85, elRx: -1.95, shRz: 0.15, shRy: -0.25, headRx: 0.4, headRz: 0.05 });
  },
  call(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.6, elRx: -2.45, shRz: 0.45, shRy: -0.4, headRx: 0.02, headRz: 0.15, shLx: -0.3 + Math.sin(t * 2 + p) * 0.15, elLx: -0.9, torsoRx: 0.03 });
  },
  swing(rig, t, p, k) {
    POSES.stand(rig, t, p);
    const a = Math.sin(k * PI);
    rig.set({ shRx: -0.5 - a * 1.1, shRz: 0.45 - a * 0.3, shRy: -0.6 + a * 0.9, elRx: -0.9 + a * 0.3, torsoRy: 0.25 - a * 0.5, hipLz: 0.1, hipRz: -0.1, headRx: 0.12, shLx: -0.3, elLx: -0.7 });
  },
  ready(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.6, shRz: 0.4, shRy: -0.5, elRx: -1.1, shLx: -0.35, elLx: -0.8, torsoRx: 0.12, headRx: 0.12, hipsY: HIP_STAND - 0.03, kneeLx: 0.25, kneeRx: 0.25, hipLx: -0.2, hipRx: -0.2 });
  },
  wave(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -2.6, shRz: 0.5 + Math.sin(t * 9) * 0.3, elRx: -0.5, headRx: -0.05 });
  },
};
