// A stylised office worker with natural proportions (about seven heads tall),
// in the look of the references: expressive eyes with coloured irises,
// shaped hair (bun, bob, swept, ponytail, long, curly), glasses, blazers over
// white shirts, tees, sweaters, trousers or a skirt, boots, heels, sneakers.
// Built from primitives and merged per material, so a person costs ~25 draw
// calls. Every joint has a current and a target value; poses only set targets
// and `update` eases towards them, so any state change blends without pops.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const HIP_STAND = 0.92;
export const HIP_SIT = 0.53; // office chair, seat at 0.40
export const HIP_CHAIR = 0.57; // four-leg chair, seat at 0.445
export const HIP_SOFA = 0.56; // sofa / armchair, seat at 0.48

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
  shLx: 0, shLy: 0, shLz: -0.06, shRx: 0, shRy: 0, shRz: 0.06, elLx: -0.15, elRx: -0.15,
  hipLx: 0, hipRx: 0, hipLz: 0.015, hipRz: -0.015, kneeLx: 0.05, kneeRx: 0.05,
};

const PI = Math.PI;
const std = (color, roughness = 0.72, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
const SCLERA = std("#ffffff", 0.25);
const PUPIL = std("#101014", 0.3);
const EYE_HI = std("#ffffff", 0.2);
const LASH = std("#2a1e1a", 0.6);
const GLASS = std("#2a2a30", 0.45, { metalness: 0.4 });
const WHITE = std("#f7f7f8", 0.6);
const DARK = std("#26262c", 0.6);
const MUG_IN = std("#ffffff", 0.4);
const PHONE = std("#1a1b20", 0.3, { metalness: 0.3 });
const PHONE_SCREEN = new THREE.MeshStandardMaterial({ color: "#8fd3ff", emissive: "#5aa9ff", emissiveIntensity: 0.9, roughness: 0.3 });
const SOLE = std("#f2f2f2", 0.6);
const MOUTH_IN = std("#5a2424", 0.6);
const IRIS_COLORS = { brown: "#5a3a22", blue: "#4f86c6", green: "#4f8a5b", hazel: "#8a6a3a", dark: "#2b1d16" };

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
const R = 0.115; // head radius

/** Hair styles: a cap tilted off the forehead, a wedge over the back and sides, and shaped strands. */
function buildHair(head, look, hairMat, add) {
  const s = look.hairStyle;
  if (s === "bald") return;
  const cy = R + 0.005;
  const cap = mesh(new THREE.SphereGeometry(R * 1.06, 28, 16, 0, PI * 2, 0, PI * 0.42), hairMat, 0, cy + 0.004, -0.008);
  cap.rotation.x = -0.18;
  add(head, cap);
  const backLen = { bob: PI * 0.92, long: PI * 0.98, curly: PI * 0.74, short: PI * 0.66, swept: PI * 0.62, bun: PI * 0.72, ponytail: PI * 0.7 }[s] || PI * 0.7;
  add(head, mesh(new THREE.SphereGeometry(R * 1.07, 28, 16, PI, PI, 0, backLen), hairMat, 0, cy, -0.006));
  const strand = (x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) => {
    const m = mesh(sph(0.06, 14, 10), hairMat, x, y, z);
    m.scale.set(sx, sy, sz);
    m.rotation.set(rx, ry, rz);
    add(head, m);
    return m;
  };
  if (s === "bun" || s === "ponytail" || s === "bob") {
    // straight bangs across the forehead
    strand(0, cy + 0.083, 0.078, 1.55, 0.42, 0.75, 0.55, 0, 0);
  }
  if (s === "bun") add(head, mesh(sph(0.045, 16, 12), hairMat, 0, cy + 0.125, -0.06));
  if (s === "ponytail") {
    const tail = mesh(new THREE.CapsuleGeometry(0.028, 0.2, 6, 12), hairMat, 0, cy - 0.06, -0.135);
    tail.rotation.x = 0.35;
    add(head, tail);
  }
  if (s === "bob") {
    add(head, mesh(rbox(0.05, 0.15, 0.13, 0.02), hairMat, -0.105, cy - 0.04, 0.01));
    add(head, mesh(rbox(0.05, 0.15, 0.13, 0.02), hairMat, 0.105, cy - 0.04, 0.01));
  }
  if (s === "swept" || s === "short") {
    // volume on top, swept to one side
    strand(0.01, cy + 0.11, 0.015, 1.5, 0.55, 1.25, 0, 0, -0.2);
    strand(0.045, cy + 0.095, 0.07, 1.1, 0.5, 0.8, 0.35, 0.3, -0.5);
    strand(-0.05, cy + 0.1, 0.045, 0.9, 0.45, 0.8, 0.2, -0.3, 0.35);
  }
  if (s === "long") {
    strand(0.03, cy + 0.085, 0.078, 1.3, 0.4, 0.7, 0.55, 0, -0.25);
    add(head, mesh(rbox(0.22, 0.3, 0.09, 0.04), hairMat, 0, cy - 0.14, -0.085));
    add(head, mesh(rbox(0.045, 0.26, 0.09, 0.02), hairMat, -0.115, cy - 0.09, 0.0));
    add(head, mesh(rbox(0.045, 0.26, 0.09, 0.02), hairMat, 0.115, cy - 0.09, 0.0));
  }
  if (s === "curly") {
    for (let i = 0; i < 12; i++) {
      const a = PI * 0.15 + (i / 12) * PI * 1.7, r = 0.105, y = cy + 0.055 + Math.sin(i * 1.7) * 0.035;
      const curl = mesh(sph(0.036, 10, 8), hairMat, Math.cos(a) * r, y, -Math.sin(a) * r * 0.9 - 0.01);
      curl.castShadow = false;
      add(head, curl);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2;
      add(head, mesh(sph(0.034, 10, 8), hairMat, Math.cos(a) * 0.055, cy + 0.115, Math.sin(a) * 0.055 - 0.01)).castShadow = false;
    }
  }
}

/**
 * Build one character. `look` decides skin, hair, eyes, outfit. Returns the
 * rig: root group, joint parts, meshes for picking, and helpers for poses.
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
  const hair = std(look.hair, 0.78);
  const shirt = std(look.shirt, 0.75);
  const shirtDark = std(new THREE.Color(look.shirt).multiplyScalar(0.8), 0.8);
  const jacket = look.jacket ? std(look.jacket, 0.7) : null;
  const sleeveMat = jacket || shirt;
  const pants = std(look.pants, 0.82);
  const shoes = std(look.shoes, look.shoeStyle === "heels" || look.shoeStyle === "boots" ? 0.35 : 0.55);
  const iris = std(IRIS_COLORS[look.eyes] || IRIS_COLORS.brown, 0.3);
  const lips = std(look.lips || "#b0665f", 0.55);

  // ---- hips + legs ----
  const hips = new THREE.Group();
  hips.position.y = HIP_STAND;
  root.add(hips);
  if (look.skirt) {
    add(hips, mesh(rbox(0.31, 0.3, 0.2, 0.06), pants, 0, -0.09, 0));
  } else {
    add(hips, mesh(rbox(0.3, 0.22, 0.2, 0.07), pants, 0, -0.02, 0));
    if (!jacket) add(hips, mesh(rbox(0.31, 0.028, 0.21, 0.01), DARK, 0, 0.075, 0));
  }
  const leg = (side) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.085, -0.06, 0);
    hips.add(hip);
    add(hip, mesh(new THREE.CapsuleGeometry(0.062, 0.32, 6, 14), look.skirt ? skin : pants, 0, -0.2, 0));
    const knee = new THREE.Group();
    knee.position.y = -0.42;
    hip.add(knee);
    add(knee, mesh(new THREE.CapsuleGeometry(0.05, 0.32, 6, 14), look.skirt ? skin : pants, 0, -0.19, 0));
    const st = look.shoeStyle || "flats";
    if (st === "boots") {
      add(knee, mesh(rbox(0.095, 0.14, 0.13, 0.03), shoes, 0, -0.37, -0.01));
      add(knee, mesh(rbox(0.09, 0.06, 0.24, 0.025), shoes, 0, -0.41, 0.05));
    } else if (st === "heels") {
      add(knee, mesh(rbox(0.08, 0.05, 0.22, 0.02), shoes, 0, -0.415, 0.05));
      add(knee, mesh(new THREE.CylinderGeometry(0.012, 0.01, 0.05, 8), shoes, 0, -0.43, -0.05));
    } else {
      add(knee, mesh(rbox(0.09, 0.06, 0.24, 0.025), shoes, 0, -0.41, 0.05));
      if (st === "sneakers") add(knee, mesh(rbox(0.095, 0.022, 0.245, 0.01), SOLE, 0, -0.432, 0.05));
    }
    return { hip, knee };
  };
  const L = leg(-1), Rg = leg(1);

  // ---- torso: waist + chest, an optional blazer with lapels, collar, tie, lanyard ----
  const torso = new THREE.Group();
  torso.position.y = 0.1;
  hips.add(torso);
  add(torso, mesh(rbox(0.29, 0.18, 0.19, 0.06), shirt, 0, 0.05, 0));
  add(torso, mesh(rbox(0.35, 0.3, 0.22, 0.08), shirt, 0, 0.28, 0));
  if (jacket) {
    add(torso, mesh(rbox(0.39, 0.46, 0.25, 0.07), jacket, 0, 0.21, -0.005));
    // shirt showing between the lapels
    add(torso, mesh(rbox(0.1, 0.3, 0.02, 0.008), shirt, 0, 0.27, 0.125));
    for (const s of [-1, 1]) {
      const lapel = mesh(rbox(0.06, 0.2, 0.014, 0.006), jacket, s * 0.075, 0.31, 0.13);
      lapel.rotation.z = s * 0.45;
      lapel.rotation.y = -s * 0.2;
      add(torso, lapel);
    }
    add(torso, mesh(new THREE.SphereGeometry(0.008, 6, 6), DARK, 0.03, 0.12, 0.128)).castShadow = false;
  }
  if (look.shirtStyle === "collar" || look.shirtStyle === "blouse") {
    for (const s of [-1, 1]) {
      const c = mesh(rbox(0.07, 0.06, 0.03, 0.008), shirtDark, s * 0.04, 0.44, 0.1);
      c.rotation.z = s * 0.6;
      c.rotation.x = -0.3;
      add(torso, c);
    }
    if (!jacket) {
      add(torso, mesh(rbox(0.03, 0.3, 0.012, 0.004), shirtDark, 0, 0.26, 0.114));
      for (let i = 0; i < 3; i++) add(torso, mesh(new THREE.SphereGeometry(0.007, 6, 6), WHITE, 0, 0.36 - i * 0.09, 0.12)).castShadow = false;
    }
  }
  if (look.shirtStyle === "sweater") {
    const v = mesh(rbox(0.07, 0.07, 0.02, 0.01), skin, 0, 0.42, 0.108);
    v.rotation.z = PI / 4;
    add(torso, v);
  }
  if (look.shirtStyle === "hoodie") {
    const hood = mesh(new THREE.TorusGeometry(0.11, 0.04, 10, 20, PI), shirtDark, 0, 0.45, -0.03);
    hood.rotation.x = PI / 2;
    hood.rotation.z = PI;
    add(torso, hood);
  }
  if (look.tie) {
    const tieM = std(look.tie, 0.6);
    add(torso, mesh(rbox(0.04, 0.24, 0.014, 0.006), tieM, 0, 0.27, 0.132));
    add(torso, mesh(rbox(0.05, 0.035, 0.02, 0.006), tieM, 0, 0.415, 0.133));
  }
  if (look.lanyard) {
    const strap = std(bot.accent, 0.7);
    const sL = mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.18, 6), strap, -0.035, 0.34, 0.115);
    sL.rotation.z = 0.22;
    const sR = sL.clone();
    sR.position.x = 0.035;
    sR.rotation.z = -0.22;
    add(torso, sL);
    add(torso, sR);
    add(torso, mesh(rbox(0.065, 0.09, 0.01, 0.004), WHITE, 0, 0.22, 0.12));
  }
  add(torso, mesh(new THREE.CylinderGeometry(0.042, 0.05, 0.1, 14), skin, 0, 0.47, 0));

  // ---- arms ----
  const arm = (side) => {
    const sh = new THREE.Group();
    sh.position.set(side * 0.19, 0.42, 0);
    torso.add(sh);
    add(sh, mesh(sph(0.052, 12, 10), sleeveMat, 0, 0, 0));
    const short = look.sleeves === "short" && !jacket;
    add(sh, mesh(new THREE.CapsuleGeometry(0.045, 0.2, 6, 12), short ? skin : sleeveMat, 0, -0.15, 0));
    if (short) add(sh, mesh(new THREE.CylinderGeometry(0.052, 0.05, 0.09, 12), shirt, 0, -0.04, 0));
    const el = new THREE.Group();
    el.position.y = -0.28;
    sh.add(el);
    add(el, mesh(new THREE.CapsuleGeometry(0.038, 0.18, 6, 12), look.sleeves === "long" || jacket ? sleeveMat : skin, 0, -0.13, 0));
    if (jacket) add(el, mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), WHITE, 0, -0.235, 0));
    const hand = new THREE.Group();
    hand.position.y = -0.26;
    el.add(hand);
    add(hand, mesh(rbox(0.055, 0.085, 0.03, 0.012), skin, 0, -0.035, 0));
    return { sh, el, hand };
  };
  const AL = arm(-1), AR = arm(1);

  // props in the right hand: mug, phone, paddle — hidden until needed
  const mug = new THREE.Group();
  mug.rotation.x = -PI / 2;
  mug.position.set(0, -0.03, 0.02);
  const mugBody = mesh(new THREE.CylinderGeometry(0.034, 0.03, 0.08, 16, 1, true), std(bot.accent, 0.4, { side: THREE.DoubleSide }), 0, 0.02, 0);
  mugBody.castShadow = false;
  mug.add(mugBody, mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.01, 16), MUG_IN, 0, 0.05, 0));
  const handle = mesh(new THREE.TorusGeometry(0.02, 0.005, 8, 14, PI), std(bot.accent, 0.4), 0.034, 0.02, 0);
  handle.rotation.y = PI / 2;
  mug.add(handle);
  mug.visible = false;
  AR.hand.add(mug);
  const phone = new THREE.Group();
  phone.rotation.x = -1.2;
  phone.position.y = -0.03;
  phone.add(mesh(rbox(0.06, 0.12, 0.01, 0.005), PHONE, 0, 0.04, 0));
  const scr = mesh(rbox(0.05, 0.1, 0.004, 0.003), PHONE_SCREEN, 0, 0.04, 0.006);
  scr.castShadow = false;
  phone.add(scr);
  phone.visible = false;
  AR.hand.add(phone);
  const paddle = new THREE.Group();
  paddle.rotation.x = -PI / 2;
  paddle.position.y = -0.03;
  paddle.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.012, 20), std("#c0392b", 0.7), 0, 0.14, 0).rotateX(PI / 2));
  paddle.add(mesh(rbox(0.028, 0.11, 0.02, 0.008), std("#c9a24a", 0.7), 0, 0.03, 0));
  paddle.visible = false;
  AR.hand.add(paddle);

  // ---- head: expressive eyes with irises, brows, nose, lips, ears ----
  const head = new THREE.Group();
  head.position.y = 0.52;
  torso.add(head);
  const cy = R + 0.005;
  const skull = add(head, mesh(new THREE.SphereGeometry(R, 32, 24), skin, 0, cy, 0));
  skull.scale.set(1, 1.1, 0.98);
  const jaw = add(head, mesh(sph(0.09, 20, 14), skin, 0, cy - 0.055, 0.012));
  jaw.scale.set(0.98, 0.78, 0.95);
  for (const s of [-1, 1]) add(head, mesh(sph(0.022, 10, 8), skin, s * 0.112, cy - 0.005, -0.004)).scale.set(0.5, 1, 0.8);
  add(head, mesh(sph(0.012, 10, 8), skin, 0, cy - 0.012, 0.113)).scale.set(0.8, 1.3, 1);
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = add(head, mesh(sph(0.021, 14, 12), SCLERA, s * 0.042, cy + 0.012, 0.1));
    e.scale.set(1, 1.15, 0.5);
    e.castShadow = false;
    e.userData.dynamic = true;
    eyes.push(e);
    const ir = mesh(sph(0.0125, 12, 10), iris, s * 0.042, cy + 0.012, 0.109);
    ir.scale.set(1, 1, 0.5);
    ir.castShadow = false;
    ir.userData.dynamic = true;
    head.add(ir);
    const pu = mesh(sph(0.006, 8, 8), PUPIL, s * 0.042, cy + 0.012, 0.114);
    pu.castShadow = false;
    pu.userData.dynamic = true;
    head.add(pu);
    const hi = mesh(sph(0.0035, 6, 6), EYE_HI, s * 0.042 + 0.004, cy + 0.017, 0.117);
    hi.castShadow = false;
    hi.userData.dynamic = true;
    head.add(hi);
    const lash = mesh(new THREE.TorusGeometry(0.023, 0.0028, 6, 14, PI), LASH, s * 0.042, cy + 0.014, 0.106);
    lash.castShadow = false;
    add(head, lash);
    const brow = add(head, mesh(rbox(0.05, 0.011, 0.012, 0.005), hair, s * 0.045, cy + 0.048, 0.1));
    brow.rotation.z = -s * 0.16;
    brow.rotation.y = s * 0.3;
    brow.castShadow = false;
  }
  // lips: upper arc + lower lip; a laugh opens the mouth
  const mouth = new THREE.Group();
  mouth.position.set(0, cy - 0.047, 0.098);
  mouth.userData.dynamic = true;
  head.add(mouth);
  const upper = mesh(new THREE.TorusGeometry(0.02, 0.005, 8, 16, PI), lips, 0, 0.004, 0);
  upper.rotation.z = PI;
  upper.castShadow = false;
  const lower = mesh(sph(0.014, 12, 8), lips, 0, -0.004, 0.002);
  lower.scale.set(1.3, 0.55, 0.6);
  lower.castShadow = false;
  mouth.add(upper, lower);
  const smile = mouth;
  const open = new THREE.Mesh(sph(0.018, 12, 10), MOUTH_IN);
  open.position.set(0, cy - 0.05, 0.1);
  open.scale.set(1.2, 1.1, 0.5);
  open.visible = false;
  open.castShadow = false;
  open.userData.dynamic = true;
  head.add(open);
  if (look.beard) {
    const beard = mesh(new THREE.SphereGeometry(R * 1.02, 24, 12, 0, PI, PI * 0.62, PI * 0.38), hair, 0, cy, 0.006);
    beard.scale.set(0.98, 0.95, 0.98);
    add(head, beard);
  }
  if (look.glasses) {
    for (const s of [-1, 1]) {
      const ring = mesh(new THREE.TorusGeometry(0.027, 0.0032, 6, 20), GLASS, s * 0.043, cy + 0.012, 0.114);
      ring.castShadow = false;
      add(head, ring);
      const temple = mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.12, 6), GLASS, s * 0.07, cy + 0.015, 0.055);
      temple.rotation.x = PI / 2;
      temple.castShadow = false;
      add(head, temple);
    }
    add(head, mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.03, 6), GLASS, 0, cy + 0.015, 0.116)).rotation.z = PI / 2;
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
      for (const e of eyes) e.scale.y = closed ? 0.12 : 1.15;
    },
  };
  return rig;
}

// ------------------------------------------------------------------ poses ----
// Each pose writes targets on the rig. `t` is the simulation time, `p` a
// per-character phase so people never move in lock-step.

const SEATED = { hipLx: -1.45, hipRx: -1.45, kneeLx: 1.55, kneeRx: 1.55, hipLz: 0.05, hipRz: -0.05 };

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
      hipsY: HIP_STAND + Math.abs(c) * 0.02,
      hipLx: s * 0.55,
      hipRx: -s * 0.55,
      kneeLx: 0.12 + Math.max(0, s) * 0.85,
      kneeRx: 0.12 + Math.max(0, -s) * 0.85,
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
      ...SEATED,
      hipsY: seatY,
      hipsZ: -0.25,
      torsoRx: 0.15,
      shLx: -0.7 + Math.sin(t * 14 + p) * 0.05,
      shRx: -0.7 + Math.cos(t * 13 + p) * 0.05,
      shLz: -0.12, shRz: 0.12,
      elLx: -0.9 + Math.sin(t * 15 + p) * 0.08,
      elRx: -0.9 + Math.cos(t * 16 + p) * 0.08,
      headRx: 0.12 + Math.sin(t * 0.8 + p) * 0.03,
      headRy: Math.sin(t * 0.5 + p) * 0.08,
    });
  },
  sitIdle(rig, t, p, seatY = HIP_SIT, z = -0.25) {
    rig.rest();
    rig.set({
      ...SEATED,
      hipsY: seatY, hipsZ: z,
      torsoRx: 0.03,
      shLx: -0.35, shRx: -0.35, elLx: -0.9, elRx: -0.9, shLz: -0.1, shRz: 0.1,
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
      hipsY: HIP_SOFA, hipsZ: 0,
      hipLx: -1.35, hipRx: -1.35, kneeLx: 1.35, kneeRx: 1.35, hipLz: 0.12, hipRz: -0.12,
      torsoRx: -0.12,
      shLx: -0.25, shRx: -0.25, shLz: -0.4, shRz: 0.4, elLx: -0.8, elRx: -0.8,
      headRx: -0.03,
    });
  },
  sitLow(rig, t, p, seatY = 0.46, z = -0.55) {
    rig.rest();
    rig.set({
      hipsY: seatY, hipsZ: z,
      hipLx: -1.2, hipRx: -1.2, kneeLx: 0.26, kneeRx: 0.26, hipLz: 0.14, hipRz: -0.14,
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
  sitLaugh(rig, t, p, seatY = HIP_SIT, z = -0.25) {
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
