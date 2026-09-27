// A stylised office worker built from primitives: round head with a proper
// hairstyle (a cap tilted back off the forehead plus a back-of-the-head wedge,
// so the face is always clear), friendly cartoon eyes with whites, brows,
// nose and mouth; shirt torso with collar/placket/hood details, belt, arms
// with elbows, legs with knees and shoes. Every joint has a current and a
// target value; poses only set targets and `update` eases towards them, so
// any state change (typing → standing up → walking → laughing) blends
// without pops. Proportions are gently stylised (head ≈ 22 % of the height).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const HIP_STAND = 0.8;
export const HIP_SIT = 0.58; // chair seat at 0.40
export const HIP_SOFA = 0.61; // sofa seat at 0.43

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
  hipLx: 0, hipRx: 0, hipLz: 0.02, hipRz: -0.02, kneeLx: 0.05, kneeRx: 0.05,
};

const PI = Math.PI;
const std = (color, roughness = 0.72, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
const IRIS = std("#26221f", 0.35);
const EYE_HI = std("#ffffff", 0.2);
const GLASS = std("#2a2a30", 0.45, { metalness: 0.4 });
const WHITE = std("#f5f5f7", 0.5);
const DARK = std("#26262c", 0.6);
const MUG_IN = std("#ffffff", 0.4);
const PHONE = std("#1a1b20", 0.3, { metalness: 0.3 });
const PHONE_SCREEN = new THREE.MeshStandardMaterial({ color: "#8fd3ff", emissive: "#5aa9ff", emissiveIntensity: 0.9, roughness: 0.3 });
const SOLE = std("#f2f2f2", 0.6);

/** Merge the rigid children of a group (everything not flagged `dynamic`) into one
 *  mesh per material — a character drops from ~60 draw calls to ~25. */
function mergeRigid(group, add) {
  const byMat = new Map();
  for (const c of [...group.children]) {
    if (!c.isMesh || c.userData.dynamic || c.children.length) continue;
    c.updateMatrix();
    const g = (c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone()).applyMatrix4(c.matrix);
    if (!byMat.has(c.material)) byMat.set(c.material, { list: [], shadow: c.castShadow, bot: c.userData.bot });
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
const R = 0.19; // head radius

/** Hair: a cap tilted back off the forehead, a wedge over the back and sides,
 *  and chunky swept strands on top (the look of the clay-avatar references). */
function buildHair(head, look, hairMat, add) {
  const s = look.hairStyle;
  if (s === "bald") return;
  const cy = 0.19; // head centre in the head group
  const cap = mesh(new THREE.SphereGeometry(R * 1.06, 28, 16, 0, PI * 2, 0, PI * 0.36), hairMat, 0, cy + 0.005, -0.015);
  cap.rotation.x = -0.22;
  add(head, cap);
  const backLen = s === "long" ? PI * 0.98 : s === "curly" ? PI * 0.72 : PI * 0.68;
  add(head, mesh(new THREE.SphereGeometry(R * 1.07, 28, 16, PI, PI, 0, backLen), hairMat, 0, cy, -0.008));
  const strand = (x, y, z, sx, sy, sz, ry, rz, rx = 0) => {
    const m = mesh(new THREE.SphereGeometry(0.1, 14, 10), hairMat, x, y, z);
    m.scale.set(sx, sy, sz);
    m.rotation.set(rx, ry, rz);
    add(head, m);
    return m;
  };
  if (s === "short" || s === "side" || s === "ponytail" || s === "bun") {
    const dir = s === "side" ? 1 : 0.5;
    // three swept strands over the crown + a fringe lifted off the brow
    strand(-0.02 * dir, cy + 0.19, 0.03, 1.1, 0.45, 0.85, 0, -0.3 * dir);
    strand(0.07 * dir, cy + 0.165, 0.09, 0.9, 0.42, 0.75, 0.3, -0.5 * dir);
    strand(-0.08, cy + 0.17, 0.06, 0.8, 0.4, 0.7, -0.35, 0.35);
    strand(0.035 * dir, cy + 0.125, 0.155, 0.95, 0.32, 0.5, 0.15 * dir, -0.55 * dir, 0.6);
  }
  if (s === "bun") add(head, mesh(new THREE.SphereGeometry(0.075, 16, 12), hairMat, 0, cy + 0.17, -0.15));
  if (s === "ponytail") {
    const tail = mesh(new THREE.CapsuleGeometry(0.045, 0.24, 6, 12), hairMat, 0, cy - 0.06, -0.21);
    tail.rotation.x = 0.4;
    add(head, tail);
  }
  if (s === "long") {
    strand(0, cy + 0.19, 0.02, 1.15, 0.45, 0.95, 0, 0);
    strand(0.06, cy + 0.13, 0.15, 0.9, 0.3, 0.5, 0.2, -0.5, 0.6);
    add(head, mesh(rbox(0.36, 0.42, 0.14, 0.06), hairMat, 0, cy - 0.16, -0.13));
    add(head, mesh(rbox(0.07, 0.34, 0.12, 0.03), hairMat, -0.2, cy - 0.1, -0.02));
    add(head, mesh(rbox(0.07, 0.34, 0.12, 0.03), hairMat, 0.2, cy - 0.1, -0.02));
  }
  if (s === "curly") {
    for (let i = 0; i < 14; i++) {
      const a = PI * 0.15 + (i / 14) * PI * 1.7; // around the top/back, never the face
      const r = 0.17, y = cy + 0.1 + Math.sin(i * 1.7) * 0.06;
      const curl = mesh(new THREE.SphereGeometry(0.06, 10, 8), hairMat, Math.cos(a) * r, y, -Math.sin(a) * r * 0.9 - 0.02);
      curl.castShadow = false;
      add(head, curl);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2;
      add(head, mesh(new THREE.SphereGeometry(0.055, 10, 8), hairMat, Math.cos(a) * 0.09, cy + 0.19, Math.sin(a) * 0.09 - 0.02)).castShadow = false;
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
  const skin = std(look.skin, 0.5);
  const hair = std(look.hair, 0.8);
  const shirt = std(look.shirt, 0.65);
  const shirtDark = std(new THREE.Color(look.shirt).multiplyScalar(0.78), 0.8);
  const pants = std(look.pants, 0.85);
  const pantsDark = std(new THREE.Color(look.pants).multiplyScalar(0.7), 0.8);
  const shoes = std(look.shoes, 0.5);
  const sneakers = look.shoes === "#f1f1f1" || look.shoes === "#8d99ae";

  // ---- hips + legs ----
  const hips = new THREE.Group();
  hips.position.y = HIP_STAND;
  root.add(hips);
  if (look.skirt) {
    const skirt = mesh(new THREE.CylinderGeometry(0.19, 0.27, 0.3, 22, 1, true), std(look.pants, 0.85, { side: THREE.DoubleSide }), 0, -0.1, 0);
    add(hips, skirt);
    add(hips, mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 22), pants, 0, 0.03, 0));
  } else {
    add(hips, mesh(rbox(0.38, 0.25, 0.25, 0.08), pants, 0, -0.03, 0));
    add(hips, mesh(rbox(0.39, 0.035, 0.26, 0.01), DARK, 0, 0.075, 0)); // belt
    add(hips, mesh(rbox(0.04, 0.03, 0.012, 0.004), std("#c9a24a", 0.4, { metalness: 0.5 }), 0, 0.075, 0.132));
  }
  const leg = (side) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.1, -0.1, 0);
    hips.add(hip);
    add(hip, mesh(new THREE.CapsuleGeometry(0.072, 0.22, 6, 14), look.skirt ? skin : pants, 0, -0.165, 0));
    const knee = new THREE.Group();
    knee.position.y = -0.33;
    hip.add(knee);
    add(knee, mesh(new THREE.CapsuleGeometry(0.062, 0.2, 6, 14), look.skirt ? skin : pants, 0, -0.15, 0));
    add(knee, mesh(rbox(0.12, 0.07, 0.23, 0.03), shoes, 0, -0.315, 0.05));
    if (sneakers) add(knee, mesh(rbox(0.125, 0.025, 0.235, 0.01), SOLE, 0, -0.34, 0.05));
    return { hip, knee };
  };
  const L = leg(-1), Rg = leg(1);

  // ---- torso ----
  const torso = new THREE.Group();
  torso.position.y = 0.06;
  hips.add(torso);
  const body = add(torso, mesh(rbox(0.4, 0.46, 0.26, 0.08), shirt, 0, 0.23, 0));
  body.userData.main = true;
  if (look.shirtStyle === "collar" || look.shirtStyle === "blouse") {
    const cL = mesh(rbox(0.09, 0.08, 0.035, 0.008), shirtDark, -0.055, 0.44, 0.115);
    cL.rotation.z = 0.55;
    cL.rotation.x = -0.25;
    const cR = cL.clone();
    cR.position.x = 0.055;
    cR.rotation.z = -0.55;
    add(torso, cL);
    add(torso, cR);
    add(torso, mesh(rbox(0.035, 0.34, 0.012, 0.004), shirtDark, 0, 0.24, 0.132)); // placket
    for (let i = 0; i < 3; i++) add(torso, mesh(new THREE.SphereGeometry(0.009, 6, 6), WHITE, 0, 0.35 - i * 0.1, 0.14)).castShadow = false;
  }
  if (look.shirtStyle === "sweater") {
    const v = mesh(rbox(0.09, 0.09, 0.02, 0.01), skin, 0, 0.42, 0.125);
    v.rotation.z = PI / 4;
    add(torso, v);
    add(torso, mesh(rbox(0.41, 0.045, 0.27, 0.01), shirtDark, 0, 0.02, 0)); // ribbed hem
  }
  if (look.shirtStyle === "hoodie") {
    const hood = mesh(new THREE.TorusGeometry(0.14, 0.05, 10, 20, PI), shirtDark, 0, 0.45, -0.04);
    hood.rotation.x = PI / 2;
    hood.rotation.z = PI;
    add(torso, hood);
    add(torso, mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.16, 6), WHITE, -0.045, 0.33, 0.135));
    add(torso, mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.16, 6), WHITE, 0.045, 0.33, 0.135));
    add(torso, mesh(rbox(0.24, 0.1, 0.02, 0.01), shirtDark, 0, 0.08, 0.13)); // pocket
  }
  if (look.shirtStyle === "tee") add(torso, mesh(new THREE.TorusGeometry(0.075, 0.012, 8, 20), shirtDark, 0, 0.45, 0.0)).rotation.x = PI / 2;
  if (look.tie) {
    const tieM = std(look.tie, 0.6);
    add(torso, mesh(rbox(0.055, 0.28, 0.018, 0.008), tieM, 0, 0.25, 0.138));
    add(torso, mesh(rbox(0.065, 0.045, 0.024, 0.008), tieM, 0, 0.415, 0.139));
  }
  if (look.lanyard) {
    const strap = std(bot.accent, 0.7);
    const sL = mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.2, 6), strap, -0.045, 0.33, 0.136);
    sL.rotation.z = 0.25;
    const sR = sL.clone();
    sR.position.x = 0.045;
    sR.rotation.z = -0.25;
    add(torso, sL);
    add(torso, sR);
    add(torso, mesh(rbox(0.08, 0.11, 0.012, 0.005), WHITE, 0, 0.19, 0.14));
    add(torso, mesh(rbox(0.05, 0.02, 0.014, 0.004), strap, 0, 0.22, 0.142)).castShadow = false;
  }
  add(torso, mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 14), skin, 0, 0.5, 0));

  // ---- arms ----
  const arm = (side) => {
    const sh = new THREE.Group();
    sh.position.set(side * 0.225, 0.41, 0);
    torso.add(sh);
    add(sh, mesh(new THREE.SphereGeometry(0.065, 12, 10), shirt, 0, 0, 0));
    add(sh, mesh(new THREE.CapsuleGeometry(0.055, 0.15, 6, 12), look.sleeves === "long" || look.shirtStyle !== "tee" ? shirt : shirt, 0, -0.12, 0));
    const el = new THREE.Group();
    el.position.y = -0.24;
    sh.add(el);
    add(el, mesh(new THREE.CapsuleGeometry(0.05, 0.14, 6, 12), look.sleeves === "long" ? shirt : skin, 0, -0.11, 0));
    if (look.sleeves === "long") add(el, mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.03, 12), shirtDark, 0, -0.19, 0));
    const hand = new THREE.Group();
    hand.position.y = -0.22;
    el.add(hand);
    add(hand, mesh(new THREE.SphereGeometry(0.052, 12, 10), skin, 0, 0, 0)).scale.set(1, 1.1, 0.8);
    return { sh, el, hand };
  };
  const AL = arm(-1), AR = arm(1);

  // props in the right hand: a mug and a phone, hidden until needed
  const mug = new THREE.Group();
  mug.rotation.x = -PI / 2; // upright when the forearm is horizontal
  mug.position.set(0, 0, 0.02);
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
  phone.add(mesh(rbox(0.065, 0.13, 0.012, 0.006), PHONE, 0, 0.04, 0));
  const scr = mesh(rbox(0.055, 0.11, 0.004, 0.003), PHONE_SCREEN, 0, 0.04, 0.007);
  scr.castShadow = false;
  phone.add(scr);
  phone.visible = false;
  AR.hand.add(phone);
  const paddle = new THREE.Group();
  paddle.rotation.x = -PI / 2;
  paddle.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 20), std("#c0392b", 0.7), 0, 0.14, 0).rotateX(PI / 2));
  paddle.add(mesh(rbox(0.03, 0.12, 0.02, 0.008), std("#c9a24a", 0.7), 0, 0.03, 0));
  paddle.visible = false;
  AR.hand.add(paddle);

  // ---- head: soft "clay avatar" look — dot eyes, thick brows, big ears, a smile with teeth ----
  const head = new THREE.Group();
  head.position.y = 0.58;
  torso.add(head);
  const cy = R; // head centre
  const skull = add(head, mesh(new THREE.SphereGeometry(R, 32, 24), skin, 0, cy, 0));
  skull.scale.set(1, 1.08, 0.98);
  for (const s of [-1, 1]) {
    const ear = add(head, mesh(new THREE.SphereGeometry(0.045, 12, 10), skin, s * 0.19, cy - 0.005, -0.01));
    ear.scale.set(0.5, 1, 0.8);
  }
  add(head, mesh(new THREE.SphereGeometry(0.017, 10, 8), skin, 0, cy - 0.015, 0.19));
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = add(head, mesh(new THREE.SphereGeometry(0.021, 12, 10), IRIS, s * 0.068, cy + 0.02, 0.178));
    e.scale.set(1, 1.2, 0.55);
    e.castShadow = false;
    e.userData.dynamic = true;
    eyes.push(e);
    const hi = mesh(new THREE.SphereGeometry(0.0065, 6, 6), EYE_HI, 0.007, 0.008, 0.016);
    hi.castShadow = false;
    e.add(hi);
    const brow = add(head, mesh(rbox(0.075, 0.02, 0.022, 0.009), hair, s * 0.07, cy + 0.082, 0.172));
    brow.rotation.z = -s * 0.18;
    brow.rotation.y = s * 0.35;
    brow.castShadow = false;
  }
  // mouth: an open smile with a row of teeth; a wider one when laughing
  const mouth = new THREE.Group();
  mouth.position.set(0, cy - 0.062, 0.175);
  head.add(mouth);
  const lips = mesh(new THREE.SphereGeometry(0.03, 14, 10, 0, PI * 2, PI * 0.5, PI * 0.5), std("#8e3a3a", 0.6), 0, 0.006, 0);
  lips.scale.set(1.35, 1, 0.5);
  lips.castShadow = false;
  const teeth = mesh(rbox(0.05, 0.014, 0.012, 0.004), WHITE, 0, 0.0, 0.006);
  teeth.castShadow = false;
  mouth.add(lips, teeth);
  const smile = mouth;
  const open = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), std("#6d2a2a", 0.6));
  open.position.set(0, cy - 0.068, 0.172);
  open.scale.set(1.1, 1.2, 0.5);
  open.visible = false;
  open.castShadow = false;
  open.userData.dynamic = true;
  head.add(open);
  if (look.beard) {
    const beard = mesh(new THREE.SphereGeometry(R * 1.02, 24, 12, 0, PI, PI * 0.64, PI * 0.36), hair, 0, cy, 0.005);
    beard.scale.set(0.98, 0.95, 0.98);
    add(head, beard);
    add(head, mesh(rbox(0.09, 0.02, 0.025, 0.008), hair, 0, cy - 0.036, 0.185));
  }
  if (look.glasses) {
    for (const s of [-1, 1]) {
      const ring = mesh(new THREE.TorusGeometry(0.046, 0.005, 6, 18), GLASS, s * 0.07, cy + 0.02, 0.188);
      ring.castShadow = false;
      add(head, ring);
      const temple = mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.18, 6), GLASS, s * 0.118, cy + 0.025, 0.1);
      temple.rotation.x = PI / 2;
      temple.castShadow = false;
      add(head, temple);
    }
    add(head, mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.05, 6), GLASS, 0, cy + 0.025, 0.19)).rotation.z = PI / 2;
  }
  buildHair(head, look, hair, add);
  mouth.userData.dynamic = true;

  // merge what never moves relative to its joint: the head, the torso shell, the hips
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
    new THREE.RingGeometry(0.34, 0.42, 40),
    new THREE.MeshBasicMaterial({ color: bot.accent, transparent: true, opacity: 0, depthWrite: false })
  );
  ring.rotation.x = -PI / 2;
  ring.position.y = 0.012;
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
      for (const e of eyes) e.scale.y = closed ? 0.15 : 1.2;
    },
  };
  return rig;
}

// ------------------------------------------------------------------ poses ----
// Each pose writes targets on the rig. `t` is the simulation time, `p` a
// per-character phase so six people never move in lock-step.

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
      hipsY: HIP_STAND + Math.abs(c) * 0.025,
      hipLx: s * 0.6,
      hipRx: -s * 0.6,
      kneeLx: 0.15 + Math.max(0, s) * 0.8,
      kneeRx: 0.15 + Math.max(0, -s) * 0.8,
      shLx: -s * 0.5,
      shRx: mug ? -0.35 : s * 0.5,
      elLx: -0.35,
      elRx: mug ? -1.25 : -0.35,
      torsoRx: 0.07,
      torsoRy: s * 0.06,
      headRx: 0.02,
    });
  },
  sitType(rig, t, p, seatY = HIP_SIT) {
    rig.rest();
    rig.set({
      hipsY: seatY,
      hipsZ: -0.27,
      hipLx: -1.3, hipRx: -1.3, kneeLx: 1.5, kneeRx: 1.5,
      hipLz: 0.06, hipRz: -0.06,
      torsoRx: 0.12,
      shLx: -0.55 + Math.sin(t * 14 + p) * 0.05,
      shRx: -0.55 + Math.cos(t * 13 + p) * 0.05,
      shLz: -0.15, shRz: 0.15,
      elLx: -1.05 + Math.sin(t * 15 + p) * 0.08,
      elRx: -1.05 + Math.cos(t * 16 + p) * 0.08,
      headRx: 0.16 + Math.sin(t * 0.8 + p) * 0.03,
      headRy: Math.sin(t * 0.5 + p) * 0.08,
    });
  },
  sitIdle(rig, t, p, seatY = HIP_SIT, z = -0.27) {
    rig.rest();
    rig.set({
      hipsY: seatY, hipsZ: z,
      hipLx: -1.3, hipRx: -1.3, kneeLx: 1.5, kneeRx: 1.5, hipLz: 0.08, hipRz: -0.08,
      torsoRx: 0.03,
      shLx: -0.35, shRx: -0.35, elLx: -0.9, elRx: -0.9, shLz: -0.12, shRz: 0.12,
      headRx: 0.02,
    });
  },
  sitThink(rig, t, p) {
    POSES.sitIdle(rig, t, p);
    rig.set({ shRx: -0.7, elRx: -2.25, shRz: 0.35, shRy: -0.3, headRx: 0.05, headRz: 0.14, headRy: 0.1 + Math.sin(t * 0.6) * 0.05, torsoRx: 0.06 });
  },
  sitStretch(rig, t, p) {
    POSES.sitIdle(rig, t, p);
    rig.set({ shLx: -2.8, shRx: -2.8, shLz: -0.35, shRz: 0.35, elLx: -0.2, elRx: -0.2, torsoRx: -0.2, headRx: -0.35 });
  },
  sitSip(rig, t, p) {
    POSES.sitIdle(rig, t, p);
    rig.set({ shRx: -0.85, elRx: -2.3, shRz: 0.25, headRx: -0.05, torsoRx: 0.02 });
  },
  sitPhone(rig, t, p) {
    POSES.sitIdle(rig, t, p);
    rig.set({ shRx: -0.85, elRx: -1.95, shRz: 0.2, shRy: -0.25, headRx: 0.42, headRz: 0.05, torsoRx: 0.1 });
  },
  sitLean(rig, t, p) {
    POSES.sitIdle(rig, t, p);
    rig.set({ torsoRx: -0.28, shLx: -2.2, shRx: -2.2, shLz: -0.6, shRz: 0.6, shLy: 0.6, shRy: -0.6, elLx: -2.3, elRx: -2.3, headRx: -0.2 });
  },
  sitHost(rig, t, p, headRy) {
    POSES.sitIdle(rig, t, p);
    rig.set({ headRy, torsoRy: headRy * 0.35, headRx: -0.02, shRx: -0.2, elRx: -0.5 });
  },
  sitSofa(rig, t, p) {
    rig.rest();
    rig.set({
      hipsY: HIP_SOFA, hipsZ: 0,
      hipLx: -1.2, hipRx: -1.2, kneeLx: 1.35, kneeRx: 1.35, hipLz: 0.14, hipRz: -0.14,
      torsoRx: -0.12,
      shLx: -0.25, shRx: -0.25, shLz: -0.45, shRz: 0.45, elLx: -0.8, elRx: -0.8,
      headRx: -0.03,
    });
  },
  talk(rig, t, p, intensity = 1) {
    POSES.stand(rig, t, p);
    const g = Math.sin(t * 5.5 + p);
    rig.set({
      shRx: -0.7 + g * 0.25 * intensity,
      elRx: -1.35 + Math.cos(t * 4 + p) * 0.25 * intensity,
      shRz: 0.35,
      shRy: -0.3 + g * 0.2,
      shLx: -0.25 + Math.sin(t * 3 + p) * 0.1,
      elLx: -0.7,
      shLz: -0.2,
      headRx: 0.03 + Math.sin(t * 3.2 + p) * 0.04,
      headRy: Math.sin(t * 1.7 + p) * 0.05,
      torsoRx: 0.04,
    });
  },
  listen(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({
      shLx: -0.35, shRx: -0.35, elLx: -1.9, elRx: -1.9, shLy: 0.75, shRy: -0.75, shLz: -0.25, shRz: 0.25,
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
      shLx: -0.5, shRx: -0.5, elLx: -1.6, elRx: -1.6, shLz: -0.5 + b * 0.1, shRz: 0.5 - b * 0.1,
    });
  },
  sitLaugh(rig, t, p, seatY = HIP_SIT, z = -0.27) {
    POSES.sitIdle(rig, t, p, seatY, z);
    const b = Math.abs(Math.sin(t * 13 + p));
    rig.set({ hipsY: seatY + b * 0.015, torsoRx: -0.22 + b * 0.05, headRx: -0.3, shLx: -0.6, shRx: -0.6, elLx: -1.7, elRx: -1.7 });
  },
  pump(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.9 + Math.sin(t * 9) * 0.35, elRx: -1.4, shRz: 0.25, shLx: -0.2, elLx: -0.6, headRx: 0.08, torsoRx: 0.08 });
  },
  reveal(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -1.1, elRx: -1.0, shRz: 0.3, shLx: -0.2, elLx: -0.6, headRx: 0.1 });
  },
  cheer(rig, t, p) {
    POSES.stand(rig, t, p);
    const b = Math.abs(Math.sin(t * 9 + p));
    rig.set({ hipsY: HIP_STAND + b * 0.05, shLx: -2.9, shRx: -2.9, shLz: -0.4, shRz: 0.4, elLx: -0.3, elRx: -0.3, torsoRx: -0.12, headRx: -0.3 });
  },
  slump(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ torsoRx: 0.38, headRx: 0.45, shLx: 0.15, shRx: 0.15, elLx: -0.05, elRx: -0.05, shLz: 0, shRz: 0, hipsY: HIP_STAND - 0.02 });
  },
  press(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -1.25, elRx: -0.35, shRz: 0.12, headRx: 0.15, torsoRx: 0.08 });
  },
  sipStand(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.85, elRx: -2.35, shRz: 0.25, headRx: -0.08, shLx: -0.1, elLx: -0.5 });
  },
  holdMug(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.5, elRx: -1.5, shRz: 0.2, shLx: -0.15, elLx: -0.6 });
  },
  crossed(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shLx: -0.4, shRx: -0.4, elLx: -1.95, elRx: -1.95, shLy: 0.8, shRy: -0.8, shLz: -0.25, shRz: 0.25, headRx: -0.05 + Math.sin(t * 0.5 + p) * 0.03 });
  },
  write(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -1.7 + Math.sin(t * 2.2 + p) * 0.12, elRx: -0.45, shRz: 0.15 + Math.sin(t * 3.1 + p) * 0.2, shRy: -0.2, shLx: -0.2, elLx: -0.7, headRx: -0.15, torsoRx: 0.05 });
  },
  printer(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.95, elRx: -0.5, shLx: -0.6, elLx: -0.7, headRx: 0.35, torsoRx: 0.15 });
  },
  standType(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({
      shLx: -0.62 + Math.sin(t * 14 + p) * 0.05,
      shRx: -0.62 + Math.cos(t * 13 + p) * 0.05,
      shLz: -0.12, shRz: 0.12,
      elLx: -1.0 + Math.sin(t * 15 + p) * 0.08,
      elRx: -1.0 + Math.cos(t * 16 + p) * 0.08,
      headRx: 0.18 + Math.sin(t * 0.8 + p) * 0.03,
      headRy: Math.sin(t * 0.5 + p) * 0.08,
      torsoRx: 0.08,
    });
  },
  standThink(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.7, elRx: -2.25, shRz: 0.35, shRy: -0.3, shLx: -0.5, elLx: -1.0, headRx: 0.05, headRz: 0.14, torsoRx: 0.05 });
  },
  standPhone(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.85, elRx: -1.95, shRz: 0.2, shRy: -0.25, headRx: 0.4, headRz: 0.05 });
  },
  call(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.6, elRx: -2.4, shRz: 0.5, shRy: -0.4, headRx: 0.02, headRz: 0.15, shLx: -0.3 + Math.sin(t * 2 + p) * 0.15, elLx: -0.9, torsoRx: 0.03 });
  },
  swing(rig, t, p, k) {
    // k: 0..1 through the ping-pong stroke
    POSES.stand(rig, t, p);
    const a = Math.sin(k * PI);
    rig.set({ shRx: -0.5 - a * 1.1, shRz: 0.5 - a * 0.3, shRy: -0.6 + a * 0.9, elRx: -0.9 + a * 0.3, torsoRy: 0.25 - a * 0.5, hipLz: 0.1, hipRz: -0.1, headRx: 0.12, shLx: -0.3, elLx: -0.7 });
  },
  ready(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -0.6, shRz: 0.45, shRy: -0.5, elRx: -1.1, shLx: -0.35, elLx: -0.8, torsoRx: 0.12, headRx: 0.12, hipsY: HIP_STAND - 0.03, kneeLx: 0.25, kneeRx: 0.25, hipLx: -0.2, hipRx: -0.2 });
  },
  sitLow(rig, t, p, seatY = 0.44, z = -0.55) {
    rig.rest();
    rig.set({
      hipsY: seatY, hipsZ: z,
      hipLx: -0.75, hipRx: -0.75, kneeLx: 0.45, kneeRx: 0.45, hipLz: 0.16, hipRz: -0.16,
      torsoRx: -0.25,
      shLx: -0.3, shRx: -0.7, shLz: -0.5, shRz: 0.3, elLx: -0.9, elRx: -2.0, shRy: -0.25,
      headRx: 0.3,
    });
  },
  wave(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -2.6, shRz: 0.5 + Math.sin(t * 9) * 0.3, elRx: -0.5, headRx: -0.05 });
  },
  highFive(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -2.2, shRz: 0.35, elRx: -0.15, headRx: -0.15, torsoRx: -0.05 });
  },
};
