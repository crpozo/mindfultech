// Realistic people for the office: two Ready Player Me bodies (masculine and
// feminine, ~11k triangles each, one 768 px atlas) driven through the same
// joint API as the procedural rig in character.js, so index.js and the poses
// stay as they are. Standing people play motion-capture clips (idle, walk,
// talk); seated poses and deliberate gestures come from the procedural joint
// targets, applied to the bones in character space (facing +z, left side at
// +x) through each bone's rest frame — the poses never need to know the
// skeleton's own axes. Per-person variety comes from recolouring the atlas
// (top, trousers, shoes, skin, hair) into a canvas texture, plus glasses and
// lanyards built on the bones. Assets live in public/office/avatars.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import { HIP_STAND, REST, JOINTS } from "./character.js";

const PI = Math.PI;
export const AVATAR_BASE = "/office/avatars/";
const FILES = {
  M: { body: "m-body.glb", idle: "m-idle.glb", walk: "m-walk.glb", talk: "m-talk.glb", walkSpeed: 1.67 },
  F: { body: "f-body.glb", idle: "f-idle.glb", walk: "f-walk.glb", talk: "f-talk.glb", walkSpeed: 1.41 },
};
const Z = new THREE.Vector3(0, 0, 1);
const IDENT = new THREE.Quaternion();
/** T-pose arms point along ±x; hanging at the sides is a quarter turn about z (the +x arm turns negative). */
const ARM_BASE = { L: new THREE.Quaternion().setFromAxisAngle(Z, -PI / 2), R: new THREE.Quaternion().setFromAxisAngle(Z, PI / 2) };
const FINGERS = ["Index", "Middle", "Ring", "Pinky"];

// Procedural joint → bone. The procedural "L" side is −x, which is the body's
// right (it faces +z), so shL drives RightArm. "add" bones take the pose on
// top of the clip while standing; the others switch between clip and pose.
const MAP = [
  { bone: "Spine", rx: "torsoRx", ry: "torsoRy", rz: "torsoRz", share: 0.4, add: true, group: "torso" },
  { bone: "Spine1", rx: "torsoRx", ry: "torsoRy", rz: "torsoRz", share: 0.35, add: true, group: "torso" },
  { bone: "Spine2", rx: "torsoRx", ry: "torsoRy", rz: "torsoRz", share: 0.25, add: true, group: "torso" },
  { bone: "Neck", rx: "headRx", ry: "headRy", rz: "headRz", share: 0.35, add: true, group: "head" },
  { bone: "Head", rx: "headRx", ry: "headRy", rz: "headRz", share: 0.65, add: true, group: "head" },
  { bone: "RightArm", rx: "shLx", ry: "shLy", rz: "shLz", base: "R", group: "armL" },
  { bone: "RightForeArm", rx: "elLx", chain: "R", group: "armL" },
  { bone: "RightHand", rx: "wristLx", chain: "R", group: "armL" },
  { bone: "LeftArm", rx: "shRx", ry: "shRy", rz: "shRz", base: "L", group: "armR" },
  { bone: "LeftForeArm", rx: "elRx", chain: "L", group: "armR" },
  { bone: "LeftHand", rx: "wristRx", chain: "L", group: "armR" },
  { bone: "RightUpLeg", rx: "hipLx", rz: "hipLz", group: "legs" },
  { bone: "RightLeg", rx: "kneeLx", group: "legs" },
  { bone: "LeftUpLeg", rx: "hipRx", rz: "hipRz", group: "legs" },
  { bone: "LeftLeg", rx: "kneeRx", group: "legs" },
];
const GROUPS = {
  armL: ["shLx", "shLy", "shLz", "elLx", "wristLx"],
  armR: ["shRx", "shRy", "shRz", "elRx", "wristRx"],
  legs: ["hipLx", "hipRx", "hipLz", "hipRz", "kneeLx", "kneeRx"],
};

// ------------------------------------------------------------- loading ----
let assetsPromise = null;
/** Load both bodies and their clips once; resolves to { M, F } templates. */
export function loadAvatars(base = AVATAR_BASE) {
  if (assetsPromise) return assetsPromise;
  const loader = new GLTFLoader();
  const load = (f) => loader.loadAsync(base + f);
  assetsPromise = Promise.all(
    ["M", "F"].map(async (sex) => {
      const f = FILES[sex];
      const [body, idle, walk, talk] = await Promise.all([load(f.body), load(f.idle), load(f.walk), load(f.talk)]);
      return [sex, prepareTemplate(sex, body.scene, { idle: idle.animations[0], walk: stripRootMotion(walk.animations[0]), talk: talk.animations[0] }, f.walkSpeed)];
    })
  ).then((pairs) => Object.fromEntries(pairs));
  return assetsPromise;
}

/** The walk clip travels forward; take the linear trend out of the hips track so the body stays on its root. */
function stripRootMotion(clip) {
  for (const tr of clip.tracks) {
    if (!/Hips\.position$/.test(tr.name)) continue;
    const v = tr.values, n = tr.times.length, t0 = tr.times[0], t1 = tr.times[n - 1];
    const x0 = v[0], z0 = v[2], x1 = v[(n - 1) * 3], z1 = v[(n - 1) * 3 + 2];
    for (let i = 0; i < n; i++) {
      const k = (tr.times[i] - t0) / (t1 - t0 || 1);
      v[i * 3] -= x0 + (x1 - x0) * k;
      v[i * 3 + 2] -= z0 + (z1 - z0) * k;
    }
  }
  return clip;
}

function prepareTemplate(sex, scene, clips, walkSpeed) {
  scene.updateMatrixWorld(true);
  let skinned = null;
  const restWorld = new Map(), restPos = new Map();
  scene.traverse((o) => {
    if (o.isSkinnedMesh) skinned = o;
    if (o.isBone) {
      restWorld.set(o.name, o.getWorldQuaternion(new THREE.Quaternion()));
      restPos.set(o.name, o.getWorldPosition(new THREE.Vector3()));
    }
  });
  const P = (n) => restPos.get(n);
  const dims = {
    hips: P("Hips").y,
    thigh: P("LeftUpLeg").y - P("LeftLeg").y,
    shin: P("LeftLeg").y - P("LeftFoot").y,
    foot: P("LeftFoot").y,
    head: P("Head").y,
    eyes: P("LeftEye").y,
    eyeL: P("LeftEye").clone().sub(P("Head")),
    eyeR: P("RightEye").clone().sub(P("Head")),
  };
  const atlas = prepareAtlas(skinned, dims);
  return { sex, scene, skinned, clips, walkSpeed, restWorld, restPos, dims, atlas };
}

// -------------------------------------------------------------- atlas ----
// The Ready Player Me atlas: head (face + scalp) top-left quarter, top of the
// outfit bottom-left quarter, trousers / shoes in the next column, eyes and
// mouth to the right, and a flat skin swatch the arms and hands map to.
const RECT = {
  head: [0, 0, 0.5, 0.5],
  top: [0, 0.5, 0.5, 1],
  pants: [0.5, 0, 0.75, 0.25],
  shoes: [0.5, 0.25, 0.75, 0.75],
  swatch: [0.75, 0.75, 0.875, 0.875],
};
const inRect = (r, u, v) => u >= r[0] && u < r[2] && v >= r[1] && v < r[3];
const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
/** red-dominant, warm hue, not too dark: skin, not hair, brows or lips */
function skinLike(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (mx < 90 || d < 18 || mx !== r) return false;
  const h = (g - b) / d;
  return h > 0.08 && h < 0.85;
}
function median(samples) {
  if (!samples.length) return [128, 128, 128];
  const out = [];
  for (let k = 0; k < 3; k++) {
    const arr = samples.map((s) => s[k]).sort((a, b) => a - b);
    out.push(arr[arr.length >> 1]);
  }
  return out;
}
function prepareAtlas(skinned, dims) {
  const S = 512;
  const img = skinned.material.map.image;
  const base = document.createElement("canvas");
  base.width = base.height = S;
  base.getContext("2d").drawImage(img, 0, 0, S, S);
  const px = base.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, S, S).data;
  // the scalp: triangles high on the head (above the eyes, not the face) or round the back
  const mask = document.createElement("canvas");
  mask.width = mask.height = S;
  const mg = mask.getContext("2d", { willReadFrequently: true });
  mg.fillStyle = "#000";
  mg.fillRect(0, 0, S, S);
  mg.fillStyle = "#fff";
  const geo = skinned.geometry, pos = geo.attributes.position, uv = geo.attributes.uv, idx = geo.index;
  const hairAt = (i) => {
    const y = pos.getY(i), z = pos.getZ(i);
    return (y > dims.eyes + 0.045 && z < 0.06) || (y > dims.head - 0.03 && z < -0.02);
  };
  for (let i = 0; i < idx.count; i += 3) {
    const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2);
    if (!(hairAt(a) && hairAt(b) && hairAt(c))) continue;
    mg.beginPath();
    mg.moveTo(uv.getX(a) * S, uv.getY(a) * S);
    mg.lineTo(uv.getX(b) * S, uv.getY(b) * S);
    mg.lineTo(uv.getX(c) * S, uv.getY(c) * S);
    mg.closePath();
    mg.fill();
  }
  const hairPx = mg.getImageData(0, 0, S, S).data;
  const hair = new Uint8Array(S * S);
  for (let i = 0; i < S * S; i++) hair[i] = hairPx[i * 4] > 127 ? 1 : 0;
  // dominant colours per region
  const sm = { top: [], pants: [], shoes: [], skin: [], hair: [] };
  for (let y = 0; y < S; y += 2)
    for (let x = 0; x < S; x += 2) {
      const i = (y * S + x) * 4, u = x / S, v = y / S;
      if (px[i + 3] < 128) continue;
      const c = [px[i], px[i + 1], px[i + 2]];
      if (inRect(RECT.top, u, v)) sm.top.push(c);
      else if (inRect(RECT.pants, u, v)) sm.pants.push(c);
      else if (inRect(RECT.shoes, u, v)) sm.shoes.push(c);
      else if (inRect(RECT.head, u, v)) {
        if (hair[y * S + x]) sm.hair.push(c);
        else if (skinLike(c[0], c[1], c[2])) sm.skin.push(c);
      }
    }
  const dom = { top: median(sm.top), pants: median(sm.pants), shoes: median(sm.shoes), skin: median(sm.skin), hair: [] };
  // hair: the darker half of the scalp samples (the hairline mixes in skin)
  const skinL = lum(...dom.skin);
  dom.hair = median(sm.hair.filter((c) => lum(...c) < skinL * 0.75));
  // one class per pixel, decided once: 1 top (print), 2 top, 3 trousers, 4 shoes, 5 swatch, 6 hair, 7 skin
  const cls = new Uint8Array(S * S);
  const hairL = lum(...dom.hair);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4, u = x / S, v = y / S, k = y * S + x;
      if (px[i + 3] < 128) continue;
      if (inRect(RECT.top, u, v)) cls[k] = Math.abs(px[i] - dom.top[0]) + Math.abs(px[i + 1] - dom.top[1]) + Math.abs(px[i + 2] - dom.top[2]) > 150 ? 1 : 2;
      else if (inRect(RECT.pants, u, v)) cls[k] = 3;
      else if (inRect(RECT.shoes, u, v)) cls[k] = 4;
      else if (inRect(RECT.swatch, u, v)) cls[k] = 5;
      else if (inRect(RECT.head, u, v)) {
        const l = lum(px[i], px[i + 1], px[i + 2]);
        if (hair[k] && l < skinL * 0.75) cls[k] = 6;
        else if (skinLike(px[i], px[i + 1], px[i + 2])) cls[k] = 7;
      }
    }
  return { S, base, px, hair, dom, cls, hairL, skinL };
}
const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
const hex = (c) => {
  const col = new THREE.Color(c);
  return [Math.round(col.r * 255), Math.round(col.g * 255), Math.round(col.b * 255)];
};
/** A person's own atlas: the template recoloured for their look. */
function makeVariant(atlas, look) {
  const { S, px, dom, cls, hairL } = atlas;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  const out = g.createImageData(S, S), d = out.data;
  d.set(px);
  const top = hex(look.jacket || look.shirt), pants = hex(look.pants), shoes = hex(look.shoes), skin = hex(look.skin), hairC = hex(look.hair);
  const kSkin = [0, 1, 2].map((k) => skin[k] / Math.max(1, dom.skin[k]));
  // light sources keep their shading by ratio, dark ones by difference
  const mode = (from) => (lum(...from) > 128 ? 1 : 0);
  const mTop = mode(dom.top), mPants = mode(dom.pants), mShoes = mode(dom.shoes);
  const n = S * S;
  for (let k = 0; k < n; k++) {
    const t = cls[k];
    if (!t) continue;
    const i = k * 4;
    if (t === 1) { d[i] = top[0]; d[i + 1] = top[1]; d[i + 2] = top[2]; continue; }
    if (t === 5) { d[i] = skin[0]; d[i + 1] = skin[1]; d[i + 2] = skin[2]; continue; }
    if (t === 6) {
      const l = lum(d[i], d[i + 1], d[i + 2]), f = Math.min(1.6, Math.max(0.6, l / Math.max(8, hairL)));
      d[i] = clamp255(hairC[0] * f); d[i + 1] = clamp255(hairC[1] * f); d[i + 2] = clamp255(hairC[2] * f);
      continue;
    }
    if (t === 7) { d[i] = clamp255(d[i] * kSkin[0]); d[i + 1] = clamp255(d[i + 1] * kSkin[1]); d[i + 2] = clamp255(d[i + 2] * kSkin[2]); continue; }
    const from = t === 2 ? dom.top : t === 3 ? dom.pants : dom.shoes, to = t === 2 ? top : t === 3 ? pants : shoes, mul = t === 2 ? mTop : t === 3 ? mPants : mShoes;
    for (let q = 0; q < 3; q++) d[i + q] = clamp255(mul ? (to[q] * d[i + q]) / Math.max(1, from[q]) : to[q] + (d[i + q] - from[q]));
  }
  g.putImageData(out, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.flipY = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ----------------------------------------------------------- the rig ----
const FEMININE = new Set(["bun", "bob", "long", "ponytail"]);
export const sexOf = (look) => (look.body ? look.body : look.skirt || look.shoeStyle === "heels" || FEMININE.has(look.hairStyle) ? "F" : "M");
const PROP_MAT = {
  mugIn: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5 }),
  phone: new THREE.MeshStandardMaterial({ color: "#1a1b20", roughness: 0.4, metalness: 0.3 }),
  screen: new THREE.MeshStandardMaterial({ color: "#8fd3ff", emissive: "#5aa9ff", emissiveIntensity: 0.9, roughness: 0.3 }),
  paddle: new THREE.MeshStandardMaterial({ color: "#c0392b", roughness: 0.8 }),
  handle: new THREE.MeshStandardMaterial({ color: "#c9a24a", roughness: 0.8 }),
  frame: new THREE.MeshStandardMaterial({ color: "#2a2a30", roughness: 0.5, metalness: 0.3 }),
  badge: new THREE.MeshStandardMaterial({ color: "#2a2a30", roughness: 0.7 }),
  badgeIcon: new THREE.MeshStandardMaterial({ color: "#f2c14e", roughness: 0.7 }),
};
const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
};
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion(), _e = new THREE.Euler();

/**
 * Build one person on a Ready Player Me body. Same return shape as
 * character.js's buildCharacter, plus `motion(mode, speed)`: "idle" | "walk" |
 * "talk" picks the clip that plays under the pose.
 */
export function buildGlbCharacter(bot, templates, seed = 0) {
  const look = bot.look;
  const tpl = templates[sexOf(look)];
  const root = new THREE.Group();
  const model = SkeletonUtils.clone(tpl.scene);
  const scale = 0.96 + ((seed * 7919) % 9) * 0.01; // 0.96 … 1.04 by person
  model.scale.setScalar(scale);
  root.add(model);
  let skinned = null;
  const bones = {};
  model.traverse((o) => {
    if (o.isSkinnedMesh) skinned = o;
    if (o.isBone) bones[o.name] = o;
  });
  const shirtMat = new THREE.MeshStandardMaterial({ map: makeVariant(tpl.atlas, look), roughness: 0.8, metalness: 0 });
  skinned.material = shirtMat;
  skinned.castShadow = true;
  skinned.receiveShadow = true;
  skinned.frustumCulled = false; // the bind-pose bounds do not follow a seated or walking body
  skinned.userData.bot = bot.id;

  // ---- joints: per bone, the rest local rotation and the frame the pose is expressed in ----
  const joints = MAP.filter((m) => bones[m.bone]).map((m) => {
    const bone = bones[m.bone];
    const chain = m.chain ? ARM_BASE[m.chain] : IDENT;
    const Rp = chain.clone().multiply(tpl.restWorld.get(bone.parent.name) || IDENT);
    return { ...m, bone, q0: bone.quaternion.clone(), Rp, RpInv: Rp.clone().invert(), ownBase: m.base ? ARM_BASE[m.base] : IDENT };
  });
  const hips = bones.Hips;
  const hipsRest = { q0: hips.quaternion.clone(), Rp: tpl.restWorld.get(hips.parent.name) || IDENT.clone() };
  hipsRest.RpInv = hipsRest.Rp.clone().invert();
  // fingers: a curl in each hand's rest frame — a light one at rest so the hands
  // never splay flat, the full fist on the prop hand (the body's left) when holding
  const grip = [], curl = [];
  for (const side of ["Left", "Right"])
    for (const f of FINGERS)
      for (let k = 1; k <= 3; k++) {
        const b = bones[side + "Hand" + f + k];
        if (!b) continue;
        const Pp = tpl.restWorld.get(b.parent.name), PpInv = Pp.clone().invert();
        const D = new THREE.Quaternion().setFromAxisAngle(Z, (side === "Left" ? -1 : 1) * (k === 1 ? 0.9 : 1.1));
        const q = PpInv.clone().multiply(D).multiply(Pp).multiply(b.quaternion);
        (side === "Left" ? grip : curl).push({ bone: b, q });
      }

  // ---- clips ----
  const mixer = new THREE.AnimationMixer(model);
  const actions = {};
  for (const k of ["idle", "walk", "talk"]) {
    const a = mixer.clipAction(tpl.clips[k]);
    a.play();
    a.setEffectiveWeight(k === "idle" ? 1 : 0);
    a.time = (seed * 1.37 + k.length) % tpl.clips[k].duration;
    actions[k] = a;
  }
  let mode = "idle";

  // ---- props on the left hand, in a frame that matches the procedural hand group ----
  const anchor = new THREE.Group();
  anchor.quaternion.copy(ARM_BASE.L).multiply(tpl.restWorld.get("LeftHand")).invert();
  bones.LeftHand.add(anchor);
  const accentMat = new THREE.MeshStandardMaterial({ color: bot.accent, roughness: 0.6, side: THREE.DoubleSide });
  const mug = new THREE.Group();
  mug.rotation.x = PI / 2 - 0.3;
  mug.position.set(0, -0.075, 0.02);
  mug.add(mesh(new THREE.CylinderGeometry(0.036, 0.032, 0.085, 10, 1, true), accentMat, 0, 0.02, 0), mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.01, 10), PROP_MAT.mugIn, 0, 0.052, 0));
  const handle = mesh(new THREE.TorusGeometry(0.022, 0.006, 5, 8, PI), accentMat, 0.036, 0.02, 0);
  handle.rotation.y = PI / 2;
  mug.add(handle);
  const phone = new THREE.Group();
  phone.position.set(0, -0.03, 0.018);
  phone.add(mesh(new THREE.BoxGeometry(0.065, 0.13, 0.01), PROP_MAT.phone, 0, 0.045, 0), mesh(new THREE.BoxGeometry(0.055, 0.11, 0.004), PROP_MAT.screen, 0, 0.045, 0.006));
  // the blade continues the forearm out of the fist and tips up a little (shakehand grip)
  const paddle = new THREE.Group();
  paddle.rotation.x = PI - 0.6;
  paddle.position.y = -0.06;
  const blade = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 12), PROP_MAT.paddle, 0, 0.15, 0).rotateX(PI / 2);
  paddle.add(blade, mesh(new THREE.BoxGeometry(0.03, 0.12, 0.02), PROP_MAT.handle, 0, 0.035, 0));
  for (const p of [mug, phone, paddle]) {
    p.visible = false;
    p.scale.setScalar(1 / scale);
    anchor.add(p);
  }
  let held = null;

  // ---- glasses and lanyard, in model-axis frames on the head and chest ----
  const headFrame = new THREE.Group();
  headFrame.quaternion.copy(tpl.restWorld.get("Head")).invert();
  bones.Head.add(headFrame);
  if (look.glasses) {
    const { eyeL, eyeR } = tpl.dims;
    for (const e of [eyeL, eyeR]) {
      const ring = mesh(new THREE.TorusGeometry(0.021, 0.0022, 5, 14), PROP_MAT.frame, e.x, e.y + 0.002, e.z + 0.013);
      ring.castShadow = false;
      headFrame.add(ring);
      const temple = mesh(new THREE.BoxGeometry(0.003, 0.003, 0.11), PROP_MAT.frame, Math.sign(e.x) * 0.075, e.y + 0.008, e.z - 0.045);
      temple.castShadow = false;
      headFrame.add(temple);
    }
    headFrame.add(mesh(new THREE.BoxGeometry(0.02, 0.003, 0.003), PROP_MAT.frame, 0, eyeL.y + 0.006, eyeL.z + 0.013));
  }
  if (look.lanyard) {
    const chest = new THREE.Group();
    chest.quaternion.copy(tpl.restWorld.get("Spine2")).invert();
    bones.Spine2.add(chest);
    const strap = new THREE.MeshStandardMaterial({ color: typeof look.lanyard === "string" ? look.lanyard : bot.accent, roughness: 0.8 });
    for (const s of [-1, 1]) {
      const st = mesh(new THREE.BoxGeometry(0.008, 0.2, 0.004), strap, s * 0.03, 0.03, 0.125);
      st.rotation.z = -s * 0.2;
      chest.add(st);
    }
    chest.add(mesh(new THREE.BoxGeometry(0.07, 0.09, 0.006), PROP_MAT.badge, 0, -0.1, 0.135), mesh(new THREE.BoxGeometry(0.028, 0.028, 0.004), PROP_MAT.badgeIcon, 0, -0.085, 0.14));
  }

  // ---- picking proxy and the selection ring ----
  const proxy = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.8, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  proxy.position.y = 0.9;
  proxy.userData.bot = bot.id;
  root.add(proxy);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.37, 40), new THREE.MeshBasicMaterial({ color: bot.accent, transparent: true, opacity: 0, depthWrite: false }));
  ring.rotation.x = -PI / 2;
  ring.position.y = 0.045;
  root.add(ring);

  // ---- state ----
  const cur = { ...REST }, target = { ...REST }, tgt = { ...REST };
  const w = { all: 0, armL: 0, armR: 0, legs: 0 };
  const { dims } = tpl;
  const isSet = (group) => GROUPS[group].some((j) => Math.abs(target[j] - REST[j]) > 0.06);

  const rig = {
    root,
    parts: { hips, elR: bones.LeftForeArm, elL: bones.RightForeArm, head: bones.Head, torso: bones.Spine1, blade },
    meshes: [proxy],
    ring,
    head: bones.Head,
    headTop: 0.14,
    shirtMat,
    accent: bot.accent,
    target,
    cur,
    rest() {
      Object.assign(target, REST);
      target.clipArms = 0;
    },
    set(o) {
      Object.assign(target, o);
    },
    hold(what) {
      held = what;
      mug.visible = what === "mug";
      phone.visible = what === "phone";
      paddle.visible = what === "paddle";
    },
    mouth() {},
    motion(m, speed = 1) {
      if (m !== mode) {
        // a fade scales the action's own weight, so the incoming one must be at 1 (three's blending example)
        const to = actions[m], from = actions[mode];
        to.enabled = true;
        to.setEffectiveTimeScale(1);
        to.setEffectiveWeight(1);
        if (m === "walk") to.time = 0;
        from.crossFadeTo(to, 0.35, false);
        mode = m;
      }
      actions.walk.timeScale = (speed * 1.15) / tpl.walkSpeed;
    },
    update(dt, t, rate = 10) {
      // seated poses: re-solve the legs for this body's lengths so the feet reach the floor
      Object.assign(tgt, target);
      if (target.hipsY < 0.8 && target.kneeLx > 0.5 && target.kneeRx > 0.5) {
        const a = Math.acos(Math.max(-1, Math.min(1, (target.hipsY - dims.shin - dims.foot) / dims.thigh)));
        tgt.hipLx = tgt.hipRx = -a;
        tgt.kneeLx = tgt.kneeRx = a;
      }
      const k = Math.min(1, rate * dt);
      for (const [name] of JOINTS) cur[name] += (tgt[name] - cur[name]) * k;
      // weights: everything procedural when seated; standing, a group follows the pose only when the pose sets it
      const seated = Math.max(0, Math.min(1, (0.86 - cur.hipsY) / 0.08));
      const kw = Math.min(1, 8 * dt);
      w.all += (seated - w.all) * kw;
      for (const gname of ["armL", "armR", "legs"]) {
        const propArm = gname === "armR" && held;
        const allowed = propArm || (mode === "idle" && !(target.clipArms && gname !== "legs"));
        const want = Math.max(seated, allowed && isSet(gname) ? 1 : 0);
        w[gname] += (want - w[gname]) * kw;
      }
      mixer.update(dt);
      // the walk clip rounds the upper back and neck forward (~13° more than idle): straighten it while it plays
      const wf = actions.walk.getEffectiveWeight();
      // bones: the clip's local rotation, then the pose in the parent's rest frame
      for (const j of joints) {
        const sh = j.share || 1;
        const fix = wf && j.add ? (j.group === "head" ? -0.17 : -0.1) * wf : 0;
        _e.set(((j.rx ? cur[j.rx] : 0) + fix) * sh, (j.ry ? cur[j.ry] : 0) * sh, (j.rz ? cur[j.rz] : 0) * sh);
        _q.setFromEuler(_e);
        const bq = j.bone.quaternion; // holds the clip's value now
        if (j.add) {
          // delta on top of the clip while standing, the full pose when seated
          _q2.copy(j.RpInv).multiply(_q).multiply(j.Rp);
          _q3.copy(_q2).multiply(bq); // clip + delta
          _q2.multiply(j.q0); // the pose alone
          bq.copy(_q3).slerp(_q2, w.all);
        } else {
          const wg = Math.max(w.all, w[j.group]);
          if (wg < 0.001) continue;
          _q.multiply(j.ownBase);
          _q2.copy(j.RpInv).multiply(_q).multiply(j.Rp).multiply(j.q0);
          bq.slerp(_q2, wg);
        }
      }
      // hips: the pose's height and forward offset; standing, only the difference from the rest height moves it
      const clipY = hips.position.y;
      hips.position.y = THREE.MathUtils.lerp(clipY + (cur.hipsY - HIP_STAND), cur.hipsY, w.all);
      hips.position.z += cur.hipsZ;
      if (cur.hipsRx) {
        _e.set(cur.hipsRx, 0, 0);
        _q.setFromEuler(_e);
        _q2.copy(hipsRest.RpInv).multiply(_q).multiply(hipsRest.Rp);
        hips.quaternion.premultiply(_q2);
      }
      // hands: resting curl, fist around a prop
      for (const f of grip) f.bone.quaternion.slerp(f.q, held ? 1 : 0.3);
      for (const f of curl) f.bone.quaternion.slerp(f.q, 0.3);
    },
  };
  return rig;
}
