// A stylised office worker built from primitives: rounded head with hair,
// eyes, brows and a mouth; shirt torso, arms with elbows, legs with knees and
// shoes. Every joint has a current and a target value; poses only set targets
// and `update` eases towards them, so any state change (typing → standing up →
// walking → laughing) blends without pops. Proportions are chibi-ish (head is
// ~27 % of the height) which reads well from an isometric camera.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const HIP_STAND = 0.76;
export const HIP_SIT = 0.57; // chair seat at 0.40
export const HIP_SOFA = 0.6; // sofa seat at 0.43

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
  shLx: 0, shLy: 0, shLz: -0.1, shRx: 0, shRy: 0, shRz: 0.1, elLx: -0.15, elRx: -0.15,
  hipLx: 0, hipRx: 0, hipLz: 0.02, hipRz: -0.02, kneeLx: 0.05, kneeRx: 0.05,
};

const std = (color, roughness = 0.75, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
const EYE = std("#1b1a22", 0.35);
const EYE_HI = std("#ffffff", 0.2);
const GLASS = std("#2a2a30", 0.45, { metalness: 0.4 });
const WHITE = std("#f5f5f7", 0.5);
const MUG_IN = std("#ffffff", 0.4);
const PHONE = std("#1a1b20", 0.3, { metalness: 0.3 });
const PHONE_SCREEN = new THREE.MeshStandardMaterial({ color: "#8fd3ff", emissive: "#5aa9ff", emissiveIntensity: 0.9, roughness: 0.3 });

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
const rbox = (w, h, d, r = 0.05, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, r);

function buildHair(head, look, hairMat, add) {
  const s = look.hairStyle;
  if (s === "bald") return;
  // the cap: top hemisphere, tilted back so the forehead shows
  const cap = mesh(new THREE.SphereGeometry(0.265, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), hairMat, 0, 0.23, -0.01);
  cap.rotation.x = 0.32;
  if (s === "curly") cap.scale.set(1.14, 1.12, 1.14);
  add(head, cap);
  if (s === "short" || s === "side" || s === "bun" || s === "ponytail") {
    // fringe
    const fringe = mesh(rbox(0.22, 0.07, 0.1, 0.03), hairMat, s === "side" ? 0.06 : 0, 0.35, 0.17);
    fringe.rotation.z = s === "side" ? -0.35 : 0;
    fringe.rotation.x = 0.3;
    add(head, fringe);
  }
  if (s === "bun") add(head, mesh(new THREE.SphereGeometry(0.09, 16, 12), hairMat, 0, 0.42, -0.19));
  if (s === "ponytail") {
    const tail = mesh(new THREE.CapsuleGeometry(0.055, 0.28, 6, 12), hairMat, 0, 0.1, -0.27);
    tail.rotation.x = 0.35;
    add(head, tail);
  }
  if (s === "long") {
    add(head, mesh(rbox(0.46, 0.5, 0.16, 0.06), hairMat, 0, 0.06, -0.17));
    add(head, mesh(rbox(0.09, 0.38, 0.14, 0.04), hairMat, -0.24, 0.12, 0.02));
    add(head, mesh(rbox(0.09, 0.38, 0.14, 0.04), hairMat, 0.24, 0.12, 0.02));
  }
  if (s === "curly") {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, r = 0.25;
      const curl = mesh(new THREE.SphereGeometry(0.075, 10, 8), hairMat, Math.cos(a) * r, 0.36 + Math.sin(i * 2.1) * 0.05, Math.sin(a) * r * 0.9 - 0.02);
      curl.castShadow = false;
      add(head, curl);
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
  const skin = std(look.skin, 0.65);
  const hair = std(look.hair, 0.8);
  const shirt = std(look.shirt, 0.8);
  const shirtDark = std(new THREE.Color(look.shirt).multiplyScalar(0.8), 0.8);
  const pants = std(look.pants, 0.85);
  const shoes = std(look.shoes, 0.5);

  // ---- hips + legs ----
  const hips = new THREE.Group();
  hips.position.y = HIP_STAND;
  root.add(hips);
  if (look.skirt) {
    const skirt = mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.3, 20, 1, true), pants, 0, -0.1, 0);
    skirt.material = std(look.pants, 0.85, { side: THREE.DoubleSide });
    add(hips, skirt);
    add(hips, mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 20), pants, 0, 0.03, 0));
  } else {
    add(hips, mesh(rbox(0.4, 0.26, 0.28, 0.09), pants, 0, -0.03, 0));
  }
  const leg = (side) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.11, -0.12, 0);
    hips.add(hip);
    add(hip, mesh(new THREE.CapsuleGeometry(0.08, 0.2, 6, 14), look.skirt ? skin : pants, 0, -0.16, 0));
    const knee = new THREE.Group();
    knee.position.y = -0.3;
    hip.add(knee);
    add(knee, mesh(new THREE.CapsuleGeometry(0.07, 0.18, 6, 14), look.skirt ? skin : pants, 0, -0.14, 0));
    add(knee, mesh(rbox(0.13, 0.08, 0.24, 0.03), shoes, 0, -0.3, 0.05));
    return { hip, knee };
  };
  const L = leg(-1), R = leg(1);

  // ---- torso ----
  const torso = new THREE.Group();
  torso.position.y = 0.05;
  hips.add(torso);
  const body = add(torso, mesh(rbox(0.44, 0.5, 0.28, 0.09), shirt, 0, 0.25, 0));
  body.userData.main = true;
  if (look.shirtStyle === "collar" || look.shirtStyle === "blouse") {
    const cL = mesh(rbox(0.1, 0.09, 0.04, 0.01), shirtDark, -0.06, 0.48, 0.13);
    cL.rotation.z = 0.5;
    cL.rotation.x = -0.2;
    const cR = cL.clone();
    cR.position.x = 0.06;
    cR.rotation.z = -0.5;
    add(torso, cL);
    add(torso, cR);
  }
  if (look.shirtStyle === "sweater") add(torso, mesh(rbox(0.2, 0.05, 0.05, 0.02), shirtDark, 0, 0.47, 0.12));
  if (look.shirtStyle === "hoodie") {
    const hood = mesh(new THREE.TorusGeometry(0.15, 0.05, 10, 20, Math.PI), shirtDark, 0, 0.5, -0.05);
    hood.rotation.x = Math.PI / 2;
    hood.rotation.z = Math.PI;
    add(torso, hood);
    add(torso, mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 6), WHITE, -0.05, 0.36, 0.145));
    add(torso, mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 6), WHITE, 0.05, 0.36, 0.145));
  }
  if (look.tie) {
    const tie = mesh(rbox(0.06, 0.3, 0.02, 0.008), std(look.tie, 0.6), 0, 0.3, 0.145);
    add(torso, tie);
    add(torso, mesh(rbox(0.07, 0.05, 0.025, 0.008), std(look.tie, 0.6), 0, 0.46, 0.146));
  }
  if (look.lanyard) {
    const strap = std(bot.accent, 0.7);
    const sL = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 6), strap, -0.05, 0.36, 0.146);
    sL.rotation.z = 0.25;
    const sR = sL.clone();
    sR.position.x = 0.05;
    sR.rotation.z = -0.25;
    add(torso, sL);
    add(torso, sR);
    add(torso, mesh(rbox(0.09, 0.12, 0.012, 0.005), WHITE, 0, 0.2, 0.15));
  }
  if (look.shirtStyle === "tee" || look.shirtStyle === "collar") {
    for (let i = 0; i < 3; i++) add(torso, mesh(new THREE.SphereGeometry(0.01, 6, 6), shirtDark, 0, 0.4 - i * 0.1, 0.145));
  }
  add(torso, mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.1, 14), skin, 0, 0.53, 0));

  // ---- arms ----
  const arm = (side) => {
    const sh = new THREE.Group();
    sh.position.set(side * 0.25, 0.44, 0);
    torso.add(sh);
    add(sh, mesh(new THREE.SphereGeometry(0.07, 12, 10), shirt, 0, 0, 0));
    add(sh, mesh(new THREE.CapsuleGeometry(0.06, 0.16, 6, 12), shirt, 0, -0.13, 0));
    const el = new THREE.Group();
    el.position.y = -0.25;
    sh.add(el);
    add(el, mesh(new THREE.CapsuleGeometry(0.055, 0.15, 6, 12), look.sleeves === "long" ? shirt : skin, 0, -0.12, 0));
    const hand = new THREE.Group();
    hand.position.y = -0.24;
    el.add(hand);
    add(hand, mesh(new THREE.SphereGeometry(0.06, 12, 10), skin, 0, 0, 0));
    return { sh, el, hand };
  };
  const AL = arm(-1), AR = arm(1);

  // props in the right hand: a mug and a phone, hidden until needed
  const mug = new THREE.Group();
  mug.rotation.x = -Math.PI / 2; // upright when the forearm is horizontal
  mug.position.set(0, 0, 0.02);
  const mugBody = mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.09, 16, 1, true), std(bot.accent, 0.4, { side: THREE.DoubleSide }), 0, 0.02, 0);
  mugBody.castShadow = false;
  mug.add(mugBody, mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.01, 16), MUG_IN, 0, 0.055, 0));
  const handle = mesh(new THREE.TorusGeometry(0.025, 0.007, 8, 14, Math.PI), std(bot.accent, 0.4), 0.04, 0.02, 0);
  handle.rotation.y = Math.PI / 2;
  mug.add(handle);
  mug.visible = false;
  AR.hand.add(mug);
  const phone = new THREE.Group();
  phone.rotation.x = -1.2;
  phone.add(mesh(rbox(0.07, 0.14, 0.012, 0.006), PHONE, 0, 0.04, 0));
  const scr = mesh(rbox(0.06, 0.12, 0.004, 0.003), PHONE_SCREEN, 0, 0.04, 0.007);
  scr.castShadow = false;
  phone.add(scr);
  phone.visible = false;
  AR.hand.add(phone);

  // ---- head ----
  const head = new THREE.Group();
  head.position.y = 0.56;
  torso.add(head);
  const skull = add(head, mesh(new THREE.SphereGeometry(0.25, 30, 22), skin, 0, 0.22, 0));
  skull.scale.set(1, 1.06, 0.96);
  add(head, mesh(new THREE.SphereGeometry(0.035, 10, 8), skin, -0.245, 0.2, 0));
  add(head, mesh(new THREE.SphereGeometry(0.035, 10, 8), skin, 0.245, 0.2, 0));
  add(head, mesh(new THREE.SphereGeometry(0.02, 10, 8), skin, 0, 0.18, 0.245));
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = add(head, mesh(new THREE.SphereGeometry(0.028, 12, 10), EYE, s * 0.085, 0.235, 0.225));
    e.scale.set(1, 1.25, 0.6);
    e.castShadow = false;
    eyes.push(e);
    const hi = mesh(new THREE.SphereGeometry(0.009, 6, 6), EYE_HI, s * 0.085 + 0.01, 0.245, 0.243);
    hi.castShadow = false;
    e.add(hi);
    hi.position.set(0.012 / 1, 0.01 / 1.25, 0.02 / 0.6);
    const brow = add(head, mesh(rbox(0.075, 0.014, 0.012, 0.005), hair, s * 0.09, 0.3, 0.228));
    brow.rotation.z = -s * 0.12;
    brow.castShadow = false;
  }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.007, 8, 16, Math.PI), EYE);
  smile.position.set(0, 0.135, 0.232);
  smile.rotation.z = Math.PI;
  smile.castShadow = false;
  head.add(smile);
  const open = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), EYE);
  open.position.set(0, 0.12, 0.23);
  open.scale.set(1, 1.2, 0.4);
  open.visible = false;
  open.castShadow = false;
  head.add(open);
  if (look.beard) {
    const beard = mesh(new THREE.SphereGeometry(0.255, 24, 14, 0, Math.PI * 2, Math.PI * 0.62, Math.PI * 0.38), hair, 0, 0.225, 0.02);
    beard.scale.set(0.98, 0.9, 0.96);
    add(head, beard);
    add(head, mesh(rbox(0.11, 0.025, 0.03, 0.01), hair, 0, 0.165, 0.235));
  }
  if (look.glasses) {
    for (const s of [-1, 1]) {
      const ring = mesh(new THREE.TorusGeometry(0.052, 0.006, 6, 18), GLASS, s * 0.088, 0.235, 0.245);
      ring.castShadow = false;
      add(head, ring);
      const temple = mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.22, 6), GLASS, s * 0.14, 0.24, 0.13);
      temple.rotation.x = Math.PI / 2;
      temple.castShadow = false;
      add(head, temple);
    }
    add(head, mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.07, 6), GLASS, 0, 0.24, 0.25)).rotation.z = Math.PI / 2;
  }
  buildHair(head, look, hair, add);

  // ---- floor helpers: contact blob + selection ring ----
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.36, 0.44, 40),
    new THREE.MeshBasicMaterial({ color: bot.accent, transparent: true, opacity: 0, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.012;
  root.add(ring);

  const parts = { hips, torso, head, shL: AL.sh, shR: AR.sh, elL: AL.el, elR: AR.el, hipL: L.hip, hipR: R.hip, kneeL: L.knee, kneeR: R.knee };
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
    /** start from REST and let the caller override */
    rest() {
      Object.assign(target, REST);
    },
    set(o) {
      Object.assign(target, o);
    },
    hold(what) {
      mug.visible = what === "mug";
      phone.visible = what === "phone";
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
      // blink
      if (t > blinkAt) {
        blinkUntil = t + 0.12;
        blinkAt = t + 2.5 + Math.random() * 4;
      }
      const closed = t < blinkUntil;
      for (const e of eyes) e.scale.y = closed ? 0.15 : 1.25;
    },
    dispose() {
      // geometries/materials are shared per character; the scene-level traverse disposes them
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
  wave(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -2.6, shRz: 0.5 + Math.sin(t * 9) * 0.3, elRx: -0.5, headRx: -0.05 });
  },
  highFive(rig, t, p) {
    POSES.stand(rig, t, p);
    rig.set({ shRx: -2.2, shRz: 0.35, elRx: -0.15, headRx: -0.15, torsoRx: -0.05 });
  },
};
