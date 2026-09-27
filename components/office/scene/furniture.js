// Furniture and building-part builders. Every builder takes a `ctx`:
//   ctx.B   the Batcher for static geometry on the current floor
//   ctx.S   the Object3D dynamic meshes are added to (scene or the upper group)
//   ctx.M   shared materials
//   ctx.nav the NavGrid of the current floor (footprints are blocked here)
//   ctx.y   the floor's height (0 or the upper slab top)
//   ctx.dyn a bag for live things (screens, LEDs, clock hands)
// Positions are world x/z; heights are relative to ctx.y.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import * as T from "./textures.js";

export const PI = Math.PI;
export const DESK_H = 0.74;
export const STAND_DESK_H = 1.05;
export const std = (color, roughness = 0.75, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });

// ------------------------------------------------------------- batching ----
export class Batcher {
  constructor(parent) {
    this.parent = parent;
    this.groups = new Map();
  }
  add(geo, mat, matrix) {
    // merge needs every piece to agree on indexing; the rounded box is non-indexed
    const g = (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(matrix);
    if (!this.groups.has(mat)) this.groups.set(mat, []);
    this.groups.get(mat).push(g);
  }
  flush() {
    for (const [mat, list] of this.groups) {
      const merged = mergeGeometries(list, false);
      for (const g of list) g.dispose();
      const m = new THREE.Mesh(merged, mat);
      m.castShadow = true;
      m.receiveShadow = true;
      this.parent.add(m);
    }
    this.groups.clear();
  }
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
export function mat4(x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
  _e.set(rx, ry, rz);
  _q.setFromEuler(_e);
  _p.set(x, y, z);
  _s.set(sx, sy, sz);
  return _m.compose(_p, _q, _s).clone();
}
export const rbox = (w, h, d, r = 0.03, seg = 2) => new RoundedBoxGeometry(w, h, d, seg, r);
export const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
export const cyl = (rt, rb, h, seg = 16, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);
export const sph = (r, ws = 12, hs = 10) => new THREE.SphereGeometry(r, ws, hs);

/** A quad with explicit corners (light shafts, AO strips). uv v: 0 at p0/p1, 1 at p2/p3. */
export function quad(p0, p1, p2, p3) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([...p0, ...p1, ...p2, ...p3], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.computeVertexNormals();
  return g;
}

/** Dynamic (non-batched) mesh helper. */
export function dyn(ctx, geo, mat, x, y, z, ry = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, ctx.y + y, z);
  m.rotation.y = ry;
  m.castShadow = true;
  m.receiveShadow = true;
  ctx.S.add(m);
  return m;
}

/** forward / side unit vectors for a yaw (facing = (sin, cos)). */
export const fwd = (yaw) => new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
export const side = (yaw) => new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

// ------------------------------------------------------------ materials ----
export function makeMaterials(bots) {
  return {
    slab: std("#d9c9b8", 0.9),
    concrete: new THREE.MeshStandardMaterial({ map: T.concrete(), roughness: 0.85 }),
    wood: new THREE.MeshStandardMaterial({ map: T.woodFloor(), roughness: 0.6 }),
    plaster: new THREE.MeshStandardMaterial({ map: T.plaster(), roughness: 0.95 }),
    navy: std("#3d4a7a", 0.9),
    green: std("#8fb996", 0.9),
    orange: std("#e08a5c", 0.9),
    purple: std("#6f5a9e", 0.9),
    periwinkle: std("#6b6fae", 0.9),
    blackWall: std("#1b1b1f", 0.85),
    chairOrangeDark: std("#c9683a", 0.95),
    pouf: new THREE.MeshStandardMaterial({ map: T.fabric("#3a3b44"), roughness: 1 }),
    teal: std("#2f6f68", 0.8),
    frame: std("#f4f2ee", 0.6),
    black: std("#1e1f24", 0.5, { metalness: 0.3 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#dfeffc", roughness: 0.05, transparent: true, opacity: 0.2, depthWrite: false, clearcoat: 0.4, side: THREE.DoubleSide }),
    glassDark: new THREE.MeshPhysicalMaterial({ color: "#8fb8d8", roughness: 0.05, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide }),
    deskWood: std("#c98449", 0.55),
    lightWood: std("#e0b87a", 0.6),
    darkWood: std("#6b4a34", 0.7),
    metal: std("#25262c", 0.45, { metalness: 0.6 }),
    steel: std("#b6bcc4", 0.35, { metalness: 0.85 }),
    divider: new THREE.MeshStandardMaterial({ map: T.fabric("#2f6f68"), roughness: 0.95 }),
    chairSeat: new THREE.MeshStandardMaterial({ map: T.fabric("#e4e4e8"), roughness: 0.9 }),
    chairBlack: new THREE.MeshStandardMaterial({ map: T.fabric("#2b2c33"), roughness: 0.95 }),
    chairOrange: new THREE.MeshStandardMaterial({ map: T.fabric("#e0864f"), roughness: 0.95 }),
    chairDark: std("#2b2c33", 0.6),
    screenBezel: std("#1b1c21", 0.4, { metalness: 0.4 }),
    keyboard: new THREE.MeshStandardMaterial({ map: T.keyboard(), roughness: 0.7 }),
    white: std("#f7f7f8", 0.6),
    paper: std("#fbfbfb", 0.9),
    plant: std("#3f8f4f", 0.8),
    plant2: std("#5aae5e", 0.8),
    plant3: std("#2f7a4a", 0.8),
    potWhite: std("#f1ede7", 0.8),
    potClay: std("#c47a58", 0.9),
    soil: std("#3b2a1e", 1),
    sofa: new THREE.MeshStandardMaterial({ map: T.fabric("#d9a441"), roughness: 0.95 }),
    sofaDark: std("#b8862f", 0.95),
    sofaBlack: new THREE.MeshStandardMaterial({ map: T.fabric("#2d2f36"), roughness: 0.95 }),
    sofaBlackDark: std("#202127", 0.95),
    beanbag: new THREE.MeshStandardMaterial({ map: T.fabric("#e26d5c"), roughness: 1 }),
    beanbag2: new THREE.MeshStandardMaterial({ map: T.fabric("#4f8ad6"), roughness: 1 }),
    rug: new THREE.MeshStandardMaterial({ map: T.rug(), roughness: 1 }),
    lamp: std("#1d1b19", 0.85, { side: THREE.DoubleSide }),
    bulb: new THREE.MeshStandardMaterial({ color: "#fff3d6", emissive: "#ffd9a0", emissiveIntensity: 2.5 }),
    panel: new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#fff6e6", emissiveIntensity: 1.2, roughness: 0.9 }),
    lampShade: new THREE.MeshStandardMaterial({ color: "#f6efe2", emissive: "#ffe6bf", emissiveIntensity: 0.35, roughness: 1, side: THREE.DoubleSide }),
    tv: std("#141518", 0.35, { metalness: 0.5 }),
    bottle: new THREE.MeshPhysicalMaterial({ color: "#7cc7ff", roughness: 0.1, transparent: true, opacity: 0.55 }),
    laptopScreen: new THREE.MeshStandardMaterial({ color: "#dfe9ff", emissive: "#9fc4ff", emissiveIntensity: 0.6, roughness: 0.4 }),
    ledOn: new THREE.MeshStandardMaterial({ color: "#7cf0a8", emissive: "#4dffa0", emissiveIntensity: 2 }),
    ledBlue: new THREE.MeshStandardMaterial({ color: "#7cc0ff", emissive: "#3f9bff", emissiveIntensity: 2 }),
    ledOff: std("#1a2a24", 0.6),
    rack: std("#2a2d36", 0.5, { metalness: 0.4 }),
    books: ["#e26d5c", "#4f8ad6", "#f2c14e", "#69c7b9", "#6f5ae0", "#2f3b4a", "#f28c6b", "#7cb46b"].map((c) => std(c, 0.85)),
    stickies: ["#ffe66d", "#ff9ecb", "#9be8a1"].map((c) => new THREE.MeshStandardMaterial({ map: T.sticky(c), roughness: 0.9 })),
    accents: bots.map((b) => std(b.accent, 0.45)),
    pingpong: new THREE.MeshStandardMaterial({ map: T.pingpongTop(), roughness: 0.6 }),
    net: std("#e8e8ea", 0.9, { transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
    locker: std("#d8dde3", 0.6, { metalness: 0.2 }),
    lockerDoor: std("#5a7d9a", 0.6, { metalness: 0.2 }),
  };
}

// ---------------------------------------------------------------- desks ----
/** Sit-down desk with monitor, divider, chair and props; returns the visit spots. */
export function desk(ctx, seat, bot, i) {
  const { B, M, nav, y } = ctx;
  const f = fwd(seat.yaw), s = side(seat.yaw), yaw = seat.yaw;
  const at = (fw, sd, h = 0) => new THREE.Vector3(seat.x + f.x * fw + s.x * sd, y + h, seat.z + f.z * fw + s.z * sd);
  const c = at(0.52, 0);
  B.add(rbox(1.4, 0.04, 0.7, 0.01), M.deskWood, mat4(c.x, y + DESK_H - 0.02, c.z, 0, yaw, 0));
  for (const sd of [-0.62, 0.62]) {
    const p = at(0.52, sd);
    B.add(box(0.05, DESK_H - 0.04, 0.58), M.metal, mat4(p.x, y + (DESK_H - 0.04) / 2, p.z, 0, yaw, 0));
  }
  B.add(box(1.2, 0.05, 0.05), M.metal, mat4(c.x, y + 0.32, c.z, 0, yaw, 0));
  const d = at(0.85, 0);
  B.add(rbox(1.4, 0.4, 0.03, 0.01), M.divider, mat4(d.x, y + DESK_H + 0.2, d.z, 0, yaw, 0));
  B.add(box(1.42, 0.03, 0.06), M.deskWood, mat4(d.x, y + DESK_H + 0.41, d.z, 0, yaw, 0));
  for (let k = 0; k < 2; k++) {
    const p = at(0.822, -0.45 + k * 0.16 + (i % 3) * 0.08, DESK_H + 0.22 + (k % 2) * 0.09);
    const n = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), M.stickies[(i + k) % 3]);
    n.position.copy(p);
    n.rotation.y = yaw + PI + (k ? 0.08 : -0.06);
    ctx.S.add(n);
  }
  monitor(ctx, at(0.66, 0.02), yaw, DESK_H, bot);
  const kp = at(0.36, 0.02, DESK_H + 0.012);
  B.add(box(0.4, 0.022, 0.13), M.keyboard, mat4(kp.x, kp.y, kp.z, 0, yaw, 0));
  const mo = at(0.38, 0.3, DESK_H + 0.025);
  B.add(rbox(0.06, 0.04, 0.1, 0.02), M.white, mat4(mo.x, mo.y, mo.z, 0, yaw, 0));
  const mg = at(0.45, -0.42, DESK_H + 0.05);
  B.add(cyl(0.042, 0.037, 0.1), M.accents[i % M.accents.length], mat4(mg.x, mg.y, mg.z));
  B.add(new THREE.TorusGeometry(0.026, 0.007, 8, 14, PI), M.accents[i % M.accents.length], mat4(mg.x + 0.04, mg.y, mg.z, 0, PI / 2, 0));
  const nb = at(0.34, -0.24, DESK_H + 0.008);
  B.add(rbox(0.16, 0.012, 0.22, 0.004), M.paper, mat4(nb.x, nb.y, nb.z, 0, yaw + 0.15, 0));
  const ph = at(0.5, 0.38, DESK_H + 0.006);
  B.add(rbox(0.07, 0.01, 0.14, 0.004), M.screenBezel, mat4(ph.x, ph.y, ph.z, 0, yaw - 0.3, 0));
  const lp = at(0.72, 0.52, DESK_H);
  B.add(cyl(0.07, 0.08, 0.02), M.metal, mat4(lp.x, lp.y + 0.01, lp.z));
  B.add(cyl(0.012, 0.012, 0.42, 8), M.metal, mat4(lp.x - s.x * 0.06, lp.y + 0.22, lp.z - s.z * 0.06, 0, yaw, -0.3));
  B.add(new THREE.ConeGeometry(0.075, 0.1, 16, 1, true), M.lamp, mat4(lp.x - s.x * 0.16, lp.y + 0.41, lp.z - s.z * 0.16, 0.4, yaw, 0));
  if (i % 4 === 1 || i % 4 === 3) {
    const lb = at(0.45, -0.28, DESK_H + 0.008);
    B.add(rbox(0.3, 0.014, 0.21, 0.005), M.steel, mat4(lb.x, lb.y, lb.z, 0, yaw - 0.35, 0));
    const lid = at(0.55, -0.32, DESK_H + 0.11);
    B.add(rbox(0.3, 0.2, 0.012, 0.005), M.steel, mat4(lid.x, lid.y, lid.z, -0.25, yaw - 0.35, 0));
    const ls = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.17), M.laptopScreen);
    ls.position.copy(at(0.547, -0.318, DESK_H + 0.11));
    ls.rotation.set(-0.25, yaw - 0.35 + PI, 0, "YXZ");
    ctx.S.add(ls);
  } else if (i % 4 === 0) {
    const pp = at(0.72, -0.5);
    plant(ctx, pp.x, pp.z, 0.32, DESK_H, M.potClay);
  } else {
    const pp = at(0.5, -0.35, DESK_H + 0.006);
    B.add(box(0.21, 0.01, 0.3), M.paper, mat4(pp.x, pp.y, pp.z, 0, yaw + 0.3, 0));
    B.add(box(0.21, 0.01, 0.3), M.paper, mat4(pp.x + 0.03, pp.y + 0.01, pp.z + 0.02, 0, yaw - 0.1, 0));
  }
  const ch = at(-0.28, 0);
  chair(ctx, ch.x, ch.z, yaw);
  nav.blockBox(c.x, c.z, 1.4, 0.7, yaw, 0.3);
  const cb = at(-0.42, 0);
  nav.blockBox(cb.x, cb.z, 0.5, 0.5, yaw, 0.2);
  nav.clear(seat.x, seat.z, 0.13);
  const cand = [-1, 1].map((sd) => at(0.12, sd * 0.9));
  return cand.map((p) => ({ x: p.x, z: p.z, yaw: Math.atan2(seat.x - p.x, seat.z - p.z) }));
}

/** Standing desk (lab): tall top, monitor, no chair. */
export function standingDesk(ctx, seat, bot, i) {
  const { B, M, nav, y } = ctx;
  const f = fwd(seat.yaw), s = side(seat.yaw), yaw = seat.yaw;
  const at = (fw, sd, h = 0) => new THREE.Vector3(seat.x + f.x * fw + s.x * sd, y + h, seat.z + f.z * fw + s.z * sd);
  const c = at(0.6, 0);
  B.add(rbox(1.3, 0.04, 0.65, 0.01), M.lightWood, mat4(c.x, y + STAND_DESK_H - 0.02, c.z, 0, yaw, 0));
  for (const sd of [-0.5, 0.5]) {
    const p = at(0.6, sd);
    B.add(box(0.06, STAND_DESK_H - 0.04, 0.06), M.metal, mat4(p.x, y + (STAND_DESK_H - 0.04) / 2, p.z, 0, yaw, 0));
    B.add(box(0.5, 0.03, 0.06), M.metal, mat4(p.x, y + 0.02, p.z, 0, yaw, 0));
  }
  monitor(ctx, at(0.72, 0.02), yaw, STAND_DESK_H, bot);
  const kp = at(0.45, 0.02, STAND_DESK_H + 0.012);
  B.add(box(0.4, 0.022, 0.13), M.keyboard, mat4(kp.x, kp.y, kp.z, 0, yaw, 0));
  const mg = at(0.5, -0.42, STAND_DESK_H + 0.05);
  B.add(cyl(0.042, 0.037, 0.1), M.accents[i % M.accents.length], mat4(mg.x, mg.y, mg.z));
  nav.blockBox(c.x, c.z, 1.3, 0.65, yaw, 0.3);
  nav.clear(seat.x, seat.z, 0.13);
  const cand = [-1, 1].map((sd) => at(0.1, sd * 0.85));
  return cand.map((p) => ({ x: p.x, z: p.z, yaw: Math.atan2(seat.x - p.x, seat.z - p.z) }));
}

function monitor(ctx, mp, yaw, h, bot) {
  const { B, M, y } = ctx;
  B.add(cyl(0.11, 0.13, 0.02, 20), M.screenBezel, mat4(mp.x, y + h + 0.01, mp.z));
  B.add(box(0.04, 0.16, 0.03), M.screenBezel, mat4(mp.x, y + h + 0.09, mp.z, 0, yaw, 0));
  B.add(rbox(0.6, 0.36, 0.03, 0.008), M.screenBezel, mat4(mp.x, y + h + 0.33, mp.z, 0, yaw, 0));
  const scr = T.monitor(bot.screen, bot.accent);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.55, 0.31),
    new THREE.MeshStandardMaterial({ map: scr.tex, emissiveMap: scr.tex, emissive: "#ffffff", emissiveIntensity: 0.6, roughness: 0.5 })
  );
  const f = fwd(yaw);
  face.position.set(mp.x - f.x * 0.024, y + h + 0.33, mp.z - f.z * 0.024);
  face.rotation.y = yaw + PI;
  ctx.S.add(face);
  ctx.dyn.screens.push(scr);
}

export function chair(ctx, x, z, yaw, seatMat) {
  const { B, M, y } = ctx;
  const sm = seatMat || M.chairSeat;
  for (let k = 0; k < 5; k++) {
    const a = yaw + (k / 5) * PI * 2;
    B.add(rbox(0.3, 0.03, 0.05, 0.01), M.chairDark, mat4(x + Math.sin(a) * 0.15, y + 0.035, z + Math.cos(a) * 0.15, 0, a + PI / 2, 0));
    B.add(sph(0.028, 10, 8), M.chairDark, mat4(x + Math.sin(a) * 0.29, y + 0.028, z + Math.cos(a) * 0.29));
  }
  B.add(cyl(0.03, 0.035, 0.3, 12), M.steel, mat4(x, y + 0.2, z));
  B.add(rbox(0.46, 0.08, 0.46, 0.03), sm, mat4(x, y + 0.36, z, 0, yaw, 0));
  const bx = x - Math.sin(yaw) * 0.2, bz = z - Math.cos(yaw) * 0.2;
  B.add(rbox(0.44, 0.48, 0.07, 0.03), sm, mat4(bx, y + 0.66, bz, -0.12, yaw, 0));
  B.add(box(0.3, 0.05, 0.02), M.chairDark, mat4(bx + Math.sin(yaw) * 0.02, y + 0.42, bz + Math.cos(yaw) * 0.02, 0, yaw, 0));
  for (const sd of [-0.24, 0.24]) {
    const ax = x + Math.cos(yaw) * sd, az = z - Math.sin(yaw) * sd;
    B.add(rbox(0.05, 0.025, 0.28, 0.01), M.chairDark, mat4(ax, y + 0.6, az, 0, yaw, 0));
    B.add(box(0.03, 0.2, 0.03), M.chairDark, mat4(ax, y + 0.5, az, 0, yaw, 0));
  }
}

/** Simple four-leg chair (meeting/training rooms). */
export function simpleChair(ctx, x, z, yaw, mat) {
  const { B, M, y, nav } = ctx;
  const sm = mat || M.chairOrange;
  B.add(rbox(0.42, 0.05, 0.42, 0.02), sm, mat4(x, y + 0.42, z, 0, yaw, 0));
  const bx = x - Math.sin(yaw) * 0.19, bz = z - Math.cos(yaw) * 0.19;
  B.add(rbox(0.4, 0.4, 0.04, 0.02), sm, mat4(bx, y + 0.66, bz, -0.1, yaw, 0));
  for (const [sx, sz] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) {
    const lx = x + Math.cos(yaw) * sx + Math.sin(yaw) * sz, lz = z - Math.sin(yaw) * sx + Math.cos(yaw) * sz;
    B.add(cyl(0.012, 0.012, 0.4, 8), M.metal, mat4(lx, y + 0.2, lz));
  }
  nav.blockBox(x - Math.sin(yaw) * 0.1, z - Math.cos(yaw) * 0.1, 0.42, 0.42, yaw, 0.1);
}

// --------------------------------------------------------------- tables ----
export function table(ctx, x, z, w, d, yaw = 0, h = DESK_H, mat, margin = 0.28) {
  const { B, M, y, nav } = ctx;
  B.add(rbox(w, 0.05, d, 0.015), mat || M.lightWood, mat4(x, y + h - 0.025, z, 0, yaw, 0));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const lx = x + Math.cos(yaw) * sx * (w / 2 - 0.12) + Math.sin(yaw) * sz * (d / 2 - 0.12);
    const lz = z - Math.sin(yaw) * sx * (w / 2 - 0.12) + Math.cos(yaw) * sz * (d / 2 - 0.12);
    B.add(box(0.06, h - 0.05, 0.06), M.metal, mat4(lx, y + (h - 0.05) / 2, lz, 0, yaw, 0));
  }
  nav.blockBox(x, z, w, d, yaw, margin);
}
export function roundTable(ctx, x, z, r, h = DESK_H, mat, margin = 0.28) {
  const { B, M, y, nav } = ctx;
  B.add(cyl(r, r, 0.05, 40), mat || M.lightWood, mat4(x, y + h - 0.025, z));
  B.add(cyl(0.05, 0.07, h - 0.05, 16), M.metal, mat4(x, y + (h - 0.05) / 2, z));
  B.add(cyl(r * 0.5, r * 0.55, 0.03, 32), M.metal, mat4(x, y + 0.015, z));
  nav.blockCircle(x, z, r, margin);
}
export function highTable(ctx, x, z, r = 0.4) {
  roundTable(ctx, x, z, r, 1.05, ctx.M.darkWood);
}
export function stool(ctx, x, z, h = 0.75) {
  const { B, M, y, nav } = ctx;
  B.add(cyl(0.17, 0.17, 0.05, 20), M.chairDark, mat4(x, y + h, z));
  B.add(cyl(0.025, 0.025, h - 0.05, 10), M.steel, mat4(x, y + (h - 0.05) / 2, z));
  B.add(cyl(0.16, 0.16, 0.02, 20), M.steel, mat4(x, y + 0.01, z));
  nav.blockCircle(x, z, 0.17, 0.15);
}
export function coffeeTable(ctx, x, z) {
  const { B, M, y, nav } = ctx;
  B.add(rbox(1.1, 0.04, 0.55, 0.02), M.darkWood, mat4(x, y + 0.42, z));
  for (const [sx, sz] of [[-0.45, -0.2], [0.45, -0.2], [-0.45, 0.2], [0.45, 0.2]]) B.add(cyl(0.02, 0.02, 0.4, 8), M.metal, mat4(x + sx, y + 0.2, z + sz));
  B.add(rbox(0.22, 0.01, 0.3, 0.003), M.books[3], mat4(x - 0.2, y + 0.445, z, 0, 0.4, 0));
  plant(ctx, x + 0.3, z, 0.28, 0.44, M.potClay, M.plant3, M.plant2);
  nav.blockBox(x, z, 1.1, 0.55, 0, 0.22);
}

// ---------------------------------------------------------------- plants ----
export function plant(ctx, x, z, size, h = 0, potMat, leafA, leafB) {
  const { B, M, y } = ctx;
  const pm = potMat || M.potWhite, la = leafA || M.plant, lb = leafB || M.plant2;
  B.add(cyl(0.2 * size, 0.15 * size, 0.36 * size, 18), pm, mat4(x, y + h + 0.18 * size, z));
  B.add(cyl(0.18 * size, 0.18 * size, 0.02, 18), M.soil, mat4(x, y + h + 0.36 * size, z));
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * PI * 2 + size, r = 0.16 * size;
    B.add(sph(0.2 * size), k % 2 ? la : lb, mat4(x + Math.cos(a) * r, y + h + (0.62 + (k % 3) * 0.08) * size, z + Math.sin(a) * r, 0, 0, 0, 1, 0.75, 1));
  }
  B.add(sph(0.22 * size), la, mat4(x, y + h + 0.86 * size, z, 0, 0, 0, 1, 0.8, 1));
}
export function tree(ctx, x, z) {
  const { B, M, y, nav } = ctx;
  B.add(cyl(0.34, 0.28, 0.5, 24), M.potWhite, mat4(x, y + 0.25, z));
  B.add(cyl(0.31, 0.31, 0.02, 24), M.soil, mat4(x, y + 0.5, z));
  B.add(cyl(0.05, 0.07, 1.3, 10), M.darkWood, mat4(x, y + 1.1, z));
  for (let k = 0; k < 16; k++) {
    const a = k * 2.4, r = 0.3 + (k % 3) * 0.2, h = 1.45 + (k % 4) * 0.28;
    B.add(sph(0.3 + (k % 2) * 0.08, 14, 10), k % 3 ? M.plant : M.plant3, mat4(x + Math.cos(a) * r, y + h, z + Math.sin(a) * r, 0, 0, 0, 1, 0.7, 1));
  }
  B.add(sph(0.42, 16, 12), M.plant2, mat4(x, y + 2.35, z, 0, 0, 0, 1, 0.75, 1));
  nav.blockCircle(x, z, 0.4);
}
/** A living wall of plants (the reference's green metal shelf). */
export function plantWall(ctx, x, z, yaw, len) {
  const { B, M, y, nav } = ctx;
  const f = fwd(yaw), s = side(yaw);
  for (let r = 0; r < 4; r++) B.add(box(len, 0.03, 0.3), M.metal, mat4(x, y + 0.5 + r * 0.55, z, 0, yaw, 0));
  for (let k = -1; k <= 1; k++) B.add(box(0.03, 2.2, 0.3), M.metal, mat4(x + s.x * k * (len / 2 - 0.02), y + 1.1, z + s.z * k * (len / 2 - 0.02), 0, yaw, 0));
  for (let r = 0; r < 4; r++)
    for (let k = 0; k < Math.floor(len / 0.4); k++) {
      const sd = -len / 2 + 0.25 + k * 0.4;
      const px = x + s.x * sd + f.x * 0.05, pz = z + s.z * sd + f.z * 0.05;
      B.add(cyl(0.09, 0.07, 0.14, 10), M.potClay, mat4(px, y + 0.59 + r * 0.55, pz));
      B.add(sph(0.13, 10, 8), (r + k) % 2 ? M.plant : M.plant2, mat4(px, y + 0.75 + r * 0.55, pz, 0, 0, 0, 1, 0.7, 1));
    }
  nav.blockBox(x, z, len, 0.35, yaw, 0.25);
}

// ---------------------------------------------------------------- seating ----
export function sofa(ctx, x, z, yaw, len = 1.9, mat, matDark) {
  const { B, M, y, nav } = ctx;
  const sm = mat || M.sofa, sd = matDark || M.sofaDark;
  const f = fwd(yaw), s = side(yaw);
  const at = (fw, sw, h) => [x + f.x * fw + s.x * sw, y + h, z + f.z * fw + s.z * sw];
  const P = (fw, sw, h) => {
    const [px, py, pz] = at(fw, sw, h);
    return [px, py, pz];
  };
  let p = P(0, 0, 0.2);
  B.add(rbox(len, 0.3, 0.9, 0.04), sd, mat4(p[0], p[1], p[2], 0, yaw, 0));
  const n = Math.round(len / 0.9);
  for (let k = 0; k < n; k++) {
    const sw = -len / 2 + (k + 0.5) * (len / n);
    p = P(0.06, sw, 0.4);
    B.add(rbox(len / n - 0.06, 0.16, 0.72, 0.05), sm, mat4(p[0], p[1], p[2], 0, yaw, 0));
  }
  p = P(-0.36, 0, 0.6);
  B.add(rbox(len, 0.7, 0.22, 0.05), sm, mat4(p[0], p[1], p[2], 0.08, yaw, 0));
  for (const sw of [-len / 2 + 0.09, len / 2 - 0.09]) {
    p = P(0, sw, 0.55);
    B.add(rbox(0.18, 0.2, 0.9, 0.04), sd, mat4(p[0], p[1], p[2], 0, yaw, 0));
  }
  for (const [fw, sw] of [[-0.35, -len / 2 + 0.15], [-0.35, len / 2 - 0.15], [0.35, -len / 2 + 0.15], [0.35, len / 2 - 0.15]]) {
    p = P(fw, sw, 0.04);
    B.add(cyl(0.03, 0.025, 0.08, 8), M.darkWood, mat4(p[0], p[1], p[2]));
  }
  nav.blockBox(x - f.x * 0.05, z - f.z * 0.05, len, 1.0, yaw, 0.25);
}
export function beanbag(ctx, x, z, mat) {
  const { B, M, y, nav } = ctx;
  B.add(sph(0.42, 16, 12), mat || M.beanbag, mat4(x, y + 0.24, z, 0, 0, 0, 1, 0.6, 1));
  B.add(sph(0.3, 14, 10), mat || M.beanbag, mat4(x, y + 0.42, z - 0.15, 0, 0, 0, 1, 0.6, 1));
  nav.blockCircle(x, z, 0.42, 0.2);
}
export function bench(ctx, x, z, yaw, len = 1.6) {
  const { B, M, y, nav } = ctx;
  B.add(rbox(len, 0.06, 0.45, 0.02), M.lightWood, mat4(x, y + 0.45, z, 0, yaw, 0));
  const s = side(yaw);
  for (const sw of [-len / 2 + 0.15, len / 2 - 0.15]) B.add(box(0.06, 0.42, 0.4), M.metal, mat4(x + s.x * sw, y + 0.21, z + s.z * sw, 0, yaw, 0));
  nav.blockBox(x, z, len, 0.45, yaw, 0.25);
}

// ------------------------------------------------------------ wall items ----
export function tv(ctx, x, h, z, yaw, w = 1.5, hh = 0.86, draw) {
  const { B, M, y } = ctx;
  const f = fwd(yaw);
  B.add(rbox(w, hh, 0.05, 0.01), M.tv, mat4(x, y + h, z, 0, yaw, 0));
  const dash = draw || T.dashboard();
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(w - 0.08, hh - 0.08),
    new THREE.MeshStandardMaterial({ map: dash.tex, emissiveMap: dash.tex, emissive: "#ffffff", emissiveIntensity: 0.7, roughness: 0.4 })
  );
  scr.position.set(x + f.x * 0.03, y + h, z + f.z * 0.03);
  scr.rotation.y = yaw;
  ctx.S.add(scr);
  ctx.dyn.tvs.push(dash);
  return dash;
}
export function whiteboard(ctx, x, h, z, yaw, w = 1.9, hh = 1.3) {
  const { B, M, y } = ctx;
  const f = fwd(yaw);
  B.add(rbox(w, hh, 0.04, 0.01), M.steel, mat4(x, y + h, z, 0, yaw, 0));
  const wb = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.1, hh - 0.1), new THREE.MeshStandardMaterial({ map: T.whiteboard(), roughness: 0.35 }));
  wb.position.set(x + f.x * 0.025, y + h, z + f.z * 0.025);
  wb.rotation.y = yaw;
  ctx.S.add(wb);
  B.add(box(0.8, 0.03, 0.08), M.steel, mat4(x + f.x * 0.04, y + h - hh / 2 + 0.03, z + f.z * 0.04, 0, yaw, 0));
}
export function sign(ctx, x, h, z, yaw, lines, bg, fg, w = 1.4, hh = 0.7) {
  const { B, M, y } = ctx;
  const f = fwd(yaw);
  B.add(rbox(w + 0.1, hh + 0.1, 0.06, 0.03), std(bg, 0.8), mat4(x, y + h, z, 0, yaw, 0));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshStandardMaterial({ map: T.signText(lines, bg, fg, 512, Math.round((512 * hh) / w)), roughness: 0.8 }));
  m.position.set(x + f.x * 0.035, y + h, z + f.z * 0.035);
  m.rotation.y = yaw;
  ctx.S.add(m);
}
export function picture(ctx, x, h, z, yaw, seed) {
  const { B, M, y } = ctx;
  const f = fwd(yaw);
  B.add(rbox(0.5, 0.36, 0.03, 0.005), M.chairDark, mat4(x, y + h, z, 0, yaw, 0));
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.3), new THREE.MeshStandardMaterial({ map: T.picture(seed), roughness: 0.8 }));
  pic.position.set(x + f.x * 0.02, y + h, z + f.z * 0.02);
  pic.rotation.y = yaw;
  ctx.S.add(pic);
}
export function clock(ctx, x, h, z, yaw) {
  const { M, y } = ctx;
  const g = new THREE.Group();
  g.position.set(x, y + h, z);
  g.rotation.y = yaw;
  g.add(new THREE.Mesh(cyl(0.2, 0.2, 0.04, 32), M.chairDark).rotateX(PI / 2));
  g.add(new THREE.Mesh(cyl(0.17, 0.17, 0.05, 32), M.white).rotateX(PI / 2));
  const hour = new THREE.Mesh(box(0.02, 0.1, 0.01), M.chairDark);
  const minute = new THREE.Mesh(box(0.014, 0.14, 0.01), M.chairDark);
  hour.geometry.translate(0, 0.045, 0);
  minute.geometry.translate(0, 0.065, 0);
  hour.position.z = 0.03;
  minute.position.z = 0.035;
  g.add(hour, minute);
  ctx.S.add(g);
  ctx.dyn.clock = { hour, minute };
}
export function stickyWall(ctx, x, h, z, yaw, w = 2.0, hh = 1.4) {
  const f = fwd(yaw);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshStandardMaterial({ map: T.stickyWall(), roughness: 0.9 }));
  m.position.set(x + f.x * 0.01, ctx.y + h, z + f.z * 0.01);
  m.rotation.y = yaw;
  ctx.S.add(m);
}
export function ceilingPanel(ctx, x, h, z, w = 1.2, d = 0.6) {
  ctx.B.add(box(w, 0.04, d), ctx.M.panel, mat4(x, ctx.y + h, z));
}
export function pendant(ctx, x, h, z, top) {
  const { B, M, y } = ctx;
  B.add(cyl(0.006, 0.006, top - h, 6), M.metal, mat4(x, y + (top + h) / 2, z));
  B.add(cyl(0.03, 0.03, 0.06, 10), M.metal, mat4(x, y + h + 0.13, z));
  B.add(new THREE.ConeGeometry(0.3, 0.28, 32, 1, true), M.lamp, mat4(x, y + h, z));
  B.add(sph(0.05), M.bulb, mat4(x, y + h - 0.07, z));
}
export function floorLamp(ctx, x, z) {
  const { B, M, y, nav } = ctx;
  B.add(cyl(0.14, 0.16, 0.03, 20), M.metal, mat4(x, y + 0.015, z));
  B.add(cyl(0.014, 0.014, 1.5, 8), M.metal, mat4(x, y + 0.78, z));
  B.add(cyl(0.2, 0.24, 0.32, 24, true), M.lampShade, mat4(x, y + 1.6, z));
  B.add(sph(0.04, 10, 8), M.bulb, mat4(x, y + 1.55, z));
  nav.blockCircle(x, z, 0.16);
}

// ------------------------------------------------------------ appliances ----
export function coffeeBar(ctx, x0, x1, z, depth = 0.6) {
  const { B, M, y, nav } = ctx;
  const cx = (x0 + x1) / 2, len = x1 - x0;
  B.add(box(len, 0.9, depth), M.white, mat4(cx, y + 0.45, z));
  B.add(rbox(len + 0.06, 0.05, depth + 0.08, 0.01), M.deskWood, mat4(cx, y + 0.925, z));
  for (let k = 1; k < Math.round(len / 0.7); k++) B.add(box(0.01, 0.8, 0.02), M.slab, mat4(x0 + (k * len) / Math.round(len / 0.7), y + 0.45, z + depth / 2));
  for (let k = 0; k < Math.round(len / 0.7); k++) B.add(box(0.12, 0.015, 0.02), M.steel, mat4(x0 + ((k + 0.5) * len) / Math.round(len / 0.7), y + 0.6, z + depth / 2 + 0.01));
  const mx = x0 + 0.55;
  B.add(rbox(0.42, 0.4, 0.38, 0.03), M.steel, mat4(mx, y + 1.15, z));
  B.add(rbox(0.46, 0.06, 0.4, 0.02), M.chairDark, mat4(mx, y + 1.38, z));
  B.add(box(0.3, 0.12, 0.3), M.chairDark, mat4(mx, y + 1.0, z + 0.05));
  B.add(cyl(0.03, 0.03, 0.12, 10), M.chairDark, mat4(mx - 0.05, y + 1.1, z + 0.22, PI / 2));
  B.add(cyl(0.04, 0.035, 0.08, 12), M.white, mat4(mx - 0.05, y + 1.0, z + 0.18));
  B.add(sph(0.02, 8, 8), M.books[0], mat4(mx + 0.12, y + 1.32, z + 0.19));
  for (let k = 0; k < 4; k++) B.add(cyl(0.04, 0.034, 0.09, 12), M.accents[k % M.accents.length], mat4(mx + 0.55 + k * 0.17, y + 0.995, z + 0.1));
  B.add(cyl(0.1, 0.09, 0.2, 16), M.steel, mat4(mx + 1.4, y + 1.05, z - 0.05));
  B.add(rbox(0.5, 0.36, 0.34, 0.03), M.chairDark, mat4(x1 - 0.5, y + 1.13, z));
  // upper cabinets
  B.add(box(len, 0.7, 0.35), M.white, mat4(cx, y + 2.1, z - depth / 2 + 0.18));
  for (let k = 0; k < Math.round(len / 0.6); k++) B.add(box(0.28, 0.02, 0.02), M.steel, mat4(x0 + ((k + 0.5) * len) / Math.round(len / 0.6), y + 1.85, z + 0.005));
  nav.block(x0, z - depth / 2, x1, z + depth / 2, 0.3);
  return { machine: [mx, z] };
}
export function fridge(ctx, x, z) {
  const { B, M, y, nav } = ctx;
  B.add(rbox(0.7, 1.8, 0.7, 0.03), M.steel, mat4(x, y + 0.9, z));
  B.add(box(0.03, 0.5, 0.03), M.chairDark, mat4(x + 0.3, y + 1.15, z + 0.36));
  B.add(box(0.03, 0.4, 0.03), M.chairDark, mat4(x + 0.3, y + 0.45, z + 0.36));
  B.add(box(0.7, 0.02, 0.7), M.chairDark, mat4(x, y + 0.8, z));
  nav.blockBox(x, z, 0.7, 0.7, 0, 0.28);
}
export function printer(ctx, x, z, yaw = 0) {
  const { B, M, y, nav } = ctx;
  B.add(rbox(0.9, 0.75, 0.5, 0.02), M.white, mat4(x, y + 0.375, z, 0, yaw, 0));
  B.add(box(0.86, 0.02, 0.46), M.chairDark, mat4(x, y + 0.74, z, 0, yaw, 0));
  B.add(rbox(0.62, 0.34, 0.46, 0.03), M.chairDark, mat4(x, y + 0.93, z, 0, yaw, 0));
  B.add(box(0.4, 0.02, 0.3), M.white, mat4(x, y + 1.11, z, 0, yaw, 0));
  const f = fwd(yaw);
  B.add(box(0.3, 0.04, 0.2), M.paper, mat4(x + f.x * 0.25, y + 1.13, z + f.z * 0.25, 0, yaw, 0));
  nav.blockBox(x, z, 0.9, 0.5, yaw, 0.28);
}
export function waterCooler(ctx, x, z) {
  const { B, M, y, nav } = ctx;
  B.add(rbox(0.36, 1.0, 0.36, 0.03), M.white, mat4(x, y + 0.5, z));
  B.add(box(0.3, 0.2, 0.3), M.chairDark, mat4(x, y + 0.1, z));
  B.add(cyl(0.15, 0.15, 0.42, 20), M.bottle, mat4(x, y + 1.22, z));
  B.add(sph(0.15, 20, 12), M.bottle, mat4(x, y + 1.43, z, 0, 0, 0, 1, 0.6, 1));
  B.add(box(0.06, 0.05, 0.08), M.books[1], mat4(x - 0.08, y + 0.75, z + 0.2));
  B.add(box(0.06, 0.05, 0.08), M.books[0], mat4(x + 0.08, y + 0.75, z + 0.2));
  nav.blockBox(x, z, 0.4, 0.4, 0, 0.28);
}
export function lockers(ctx, x, z, yaw, n = 5) {
  const { B, M, y, nav } = ctx;
  const s = side(yaw), f = fwd(yaw);
  const len = n * 0.4;
  B.add(box(len, 1.9, 0.45), M.locker, mat4(x, y + 0.95, z, 0, yaw, 0));
  for (let k = 0; k < n; k++) {
    const sw = -len / 2 + 0.2 + k * 0.4;
    B.add(rbox(0.34, 1.7, 0.02, 0.01), M.lockerDoor, mat4(x + s.x * sw + f.x * 0.23, y + 0.95, z + s.z * sw + f.z * 0.23, 0, yaw, 0));
    B.add(box(0.03, 0.12, 0.02), M.steel, mat4(x + s.x * (sw + 0.12) + f.x * 0.25, y + 1.0, z + s.z * (sw + 0.12) + f.z * 0.25, 0, yaw, 0));
  }
  nav.blockBox(x, z, len, 0.45, yaw, 0.28);
}
/** Big grid shelving. Runs along x at `at` (z) or, with axis "z", along z at `at` (x),
 *  with its open face towards +z / +x respectively. */
export function bookshelfBig(ctx, a0, a1, at, h = 3.0, rows = 6, depth = 0.4, axis = "x", flip = false) {
  const { B, M, y, nav } = ctx;
  const len = a1 - a0, c = (a0 + a1) / 2;
  const cols = Math.round(len / 0.5);
  const cw = len / cols, rh = h / rows;
  const sgn = flip ? -1 : 1; // flip: open face towards -z / -x instead
  // P(a, dOff) → world x,z; geo(w,h,d) → box with the long side along the run
  const P = (a, dOff) => (axis === "x" ? [a, at + sgn * dOff] : [at + sgn * dOff, a]);
  const G = (w, hh, d) => (axis === "x" ? box(w, hh, d) : box(d, hh, w));
  const put = (geo, mat, a, hh, dOff = 0, rx = 0) => {
    const [px, pz] = P(a, dOff);
    B.add(geo, mat, mat4(px, y + hh, pz, axis === "x" ? rx : 0, 0, axis === "x" ? 0 : rx));
  };
  put(G(len, 0.03, depth), M.lightWood, c, 0.02);
  for (let r = 1; r <= rows; r++) put(G(len, 0.03, depth), M.lightWood, c, r * rh);
  for (let k = 0; k <= cols; k++) put(G(0.03, h, depth), M.lightWood, a0 + k * cw, h / 2);
  put(G(len, h, 0.02), M.lightWood, c, h / 2, -depth / 2 + 0.01);
  for (let r = 0; r < rows; r++)
    for (let k = 0; k < cols; k++) {
      const seed = (r * 7 + k * 13) % 10;
      const ba = a0 + k * cw + 0.06, by = r * rh + 0.03;
      if (seed < 4) {
        const n = 3 + (seed % 3);
        for (let b = 0; b < n; b++) put(G(0.05, rh * 0.62 + (b % 2) * 0.05, depth * 0.55), M.books[(r + k + b) % 8], ba + 0.04 + b * 0.065, by + rh * 0.33);
      } else if (seed < 6) {
        put(rbox(0.2, rh * 0.5, 0.2, 0.02), M.white, ba + cw / 2 - 0.06, by + rh * 0.27);
      } else if (seed < 8) {
        const [px, pz] = P(ba + cw / 2 - 0.06, 0);
        plant(ctx, px, pz, 0.22, by, M.potClay);
      } else if (seed === 8) {
        put(rbox(0.18, 0.14, 0.02, 0.005), M.metal, ba + cw / 2 - 0.06, by + 0.1, 0.05, -0.15);
      }
    }
  const [x0, z0] = P(a0, -depth / 2), [x1, z1] = P(a1, depth / 2);
  nav.block(Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1), 0.28);
}
export function serverRack(ctx, x, z) {
  const { B, M, y, nav } = ctx;
  B.add(rbox(0.6, 2.0, 0.8, 0.02), M.rack, mat4(x, y + 1.0, z));
  B.add(box(0.5, 1.9, 0.02), M.chairDark, mat4(x, y + 1.0, z + 0.4));
  for (let k = 0; k < 8; k++) {
    B.add(box(0.46, 0.14, 0.02), M.steel, mat4(x, y + 0.2 + k * 0.22, z + 0.41));
    for (let l = 0; l < 3; l++) {
      const led = new THREE.Mesh(box(0.025, 0.025, 0.01), l === 2 ? M.ledBlue : M.ledOn);
      led.position.set(x - 0.16 + l * 0.05, y + 0.2 + k * 0.22, z + 0.425);
      ctx.S.add(led);
      ctx.dyn.leds.push(led);
    }
  }
  nav.blockBox(x, z, 0.6, 0.8, 0, 0.3);
}
export function booth(ctx, x, z) {
  const { B, M, y, nav } = ctx;
  const w = 1.15, d = 1.15, h = 2.3;
  B.add(box(w, h, 0.06), M.navy, mat4(x, y + h / 2, z - d / 2));
  B.add(box(0.06, h, d), M.navy, mat4(x - w / 2, y + h / 2, z));
  B.add(box(0.06, h, d), M.navy, mat4(x + w / 2, y + h / 2, z));
  B.add(box(w, 0.06, d), M.navy, mat4(x, y + h, z));
  const g = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.1, h - 0.1), M.glassDark);
  g.position.set(x, y + h / 2, z + d / 2);
  ctx.S.add(g);
  B.add(box(w - 0.1, 0.04, 0.04), M.metal, mat4(x, y + h - 0.05, z + d / 2));
  B.add(box(0.5, 0.03, 0.35), M.lightWood, mat4(x, y + 1.0, z - d / 2 + 0.2));
  B.add(cyl(0.02, 0.02, 0.15, 8), M.metal, mat4(x + 0.15, y + 1.1, z - d / 2 + 0.2));
  B.add(box(0.06, 0.1, 0.03), M.chairDark, mat4(x + 0.15, y + 1.22, z - d / 2 + 0.2));
  B.add(box(w - 0.4, 0.04, 0.4), M.panel, mat4(x, y + h - 0.08, z));
  nav.blockBox(x, z - d / 2, w, 0.1, 0, 0.25);
  nav.blockBox(x - w / 2, z, 0.1, d, 0, 0.25);
  nav.blockBox(x + w / 2, z, 0.1, d, 0, 0.25);
  nav.clear(x, z, 0.3);
}
export function pingpong(ctx, x, z, yaw) {
  const { B, M, y, nav } = ctx;
  const f = fwd(yaw), s = side(yaw);
  const top = new THREE.Mesh(box(1.52, 0.04, 2.74), M.pingpong);
  top.position.set(x, y + 0.76, z);
  top.rotation.y = yaw;
  top.castShadow = top.receiveShadow = true;
  ctx.S.add(top);
  for (const [sw, fw] of [[-0.6, -1.1], [0.6, -1.1], [-0.6, 1.1], [0.6, 1.1]]) B.add(box(0.05, 0.72, 0.05), M.metal, mat4(x + s.x * sw + f.x * fw, y + 0.36, z + s.z * sw + f.z * fw, 0, yaw, 0));
  B.add(box(1.3, 0.04, 0.05), M.metal, mat4(x - f.x * 1.1, y + 0.1, z - f.z * 1.1, 0, yaw, 0));
  B.add(box(1.3, 0.04, 0.05), M.metal, mat4(x + f.x * 1.1, y + 0.1, z + f.z * 1.1, 0, yaw, 0));
  const net = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.16), M.net);
  net.position.set(x, y + 0.86, z);
  net.rotation.y = yaw;
  ctx.S.add(net);
  for (const sw of [-0.85, 0.85]) B.add(box(0.02, 0.18, 0.02), M.chairDark, mat4(x + s.x * sw, y + 0.87, z + s.z * sw));
  nav.blockBox(x, z, 1.52, 2.74, yaw, 0.28);
  const ball = new THREE.Mesh(sph(0.021, 10, 8), std("#ffffff", 0.4));
  ball.position.set(x, y + 1.0, z);
  ball.visible = false;
  ctx.S.add(ball);
  return { ball, ends: [[x - f.x * 1.75, z - f.z * 1.75], [x + f.x * 1.75, z + f.z * 1.75]], y: y + 0.85 };
}
export function reception(ctx, x, z) {
  const { B, M, y, nav } = ctx;
  B.add(rbox(2.6, 1.05, 0.7, 0.05), M.navy, mat4(x, y + 0.525, z));
  B.add(rbox(2.7, 0.05, 0.8, 0.02), M.lightWood, mat4(x, y + 1.07, z));
  B.add(box(2.4, 0.04, 0.5), M.lightWood, mat4(x, y + 0.72, z - 0.15));
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.36), new THREE.MeshStandardMaterial({ map: T.signText(["MINDFULTECH"], "#3d4a7a", "#ffffff", 512, 116), roughness: 0.8 }));
  logo.position.set(x, y + 0.62, z + 0.36);
  ctx.S.add(logo);
  B.add(cyl(0.11, 0.13, 0.02, 20), M.screenBezel, mat4(x + 0.7, y + 1.1, z - 0.1));
  B.add(box(0.04, 0.16, 0.03), M.screenBezel, mat4(x + 0.7, y + 1.18, z - 0.1));
  B.add(rbox(0.5, 0.32, 0.03, 0.008), M.screenBezel, mat4(x + 0.7, y + 1.4, z - 0.1));
  B.add(box(0.36, 0.02, 0.12), M.keyboard, mat4(x + 0.7, y + 1.1, z + 0.12));
  plant(ctx, x - 1.0, z, 0.36, 1.1, M.potClay);
  B.add(cyl(0.05, 0.05, 0.06, 12), M.white, mat4(x - 0.2, y + 1.13, z + 0.1));
  nav.blockBox(x, z, 2.7, 0.8, 0, 0.3);
}
/** Turnstile gate: body long along fwd(yaw), arm out to the side. */
export function turnstile(ctx, x, z, yaw = 0) {
  const { B, M, y, nav } = ctx;
  const s = side(yaw), f = fwd(yaw);
  B.add(rbox(0.25, 1.0, 1.0, 0.04), M.steel, mat4(x, y + 0.5, z, 0, yaw, 0));
  B.add(box(0.29, 0.06, 1.04), M.chairDark, mat4(x, y + 1.02, z, 0, yaw, 0));
  B.add(cyl(0.02, 0.02, 0.5, 8), M.chairDark, mat4(x + s.x * 0.35, y + 0.85, z + s.z * 0.35, 0, yaw, PI / 2));
  B.add(box(0.06, 0.06, 0.06), M.ledOn, mat4(x + f.x * 0.4, y + 1.06, z + f.z * 0.4, 0, yaw, 0));
  nav.blockBox(x, z, 0.3, 1.0, yaw, 0.2);
}

// ---------------------------------------------------------- building ----
/** Solid interior wall segment (x0..x1 at z, or z0..z1 at x when `vertical`). */
export function wall(ctx, a0, a1, at, h, mat, vertical = false, thick = 0.15, block = true) {
  const { B, nav, y } = ctx;
  const len = Math.abs(a1 - a0), c = (a0 + a1) / 2;
  if (vertical) {
    B.add(box(thick, h, len), mat, mat4(at, y + h / 2, c));
    if (block) nav.block(at - thick / 2, Math.min(a0, a1), at + thick / 2, Math.max(a0, a1), 0.3);
  } else {
    B.add(box(len, h, thick), mat, mat4(c, y + h / 2, at));
    if (block) nav.block(Math.min(a0, a1), at - thick / 2, Math.max(a0, a1), at + thick / 2, 0.3);
  }
}
/** Glass partition with black frames and door gaps; gaps = [[a0,a1], ...] along the run. */
export function glassWall(ctx, a0, a1, at, h, gaps = [], vertical = false, noStartPost = false) {
  const { B, M, nav, y } = ctx;
  const segs = [];
  let cur = Math.min(a0, a1);
  const end = Math.max(a0, a1);
  for (const [g0, g1] of gaps.sort((p, q) => p[0] - q[0])) {
    if (g0 > cur) segs.push([cur, g0]);
    cur = g1;
  }
  if (cur < end) segs.push([cur, end]);
  const P = (a, hh) => (vertical ? [at, y + hh, a] : [a, y + hh, at]);
  for (const [s0, s1] of segs) {
    const len = s1 - s0, c = (s0 + s1) / 2;
    const [px, py, pz] = P(c, h / 2);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(len, h - 0.1), M.glass);
    glass.position.set(px, py, pz);
    glass.rotation.y = vertical ? PI / 2 : 0;
    ctx.S.add(glass);
    const geo = (w, hh, d) => (vertical ? box(d, hh, w) : box(w, hh, d));
    B.add(geo(len, 0.06, 0.08), M.black, mat4(...P(c, 0.03)));
    B.add(geo(len, 0.06, 0.08), M.black, mat4(...P(c, h - 0.03)));
    const n = Math.max(1, Math.round(len / 1.2));
    for (let k = noStartPost && s0 === Math.min(a0, a1) ? 1 : 0; k <= n; k++) B.add(geo(0.05, h, 0.08), M.black, mat4(...P(s0 + (k * len) / n, h / 2)));
    if (vertical) nav.block(at - 0.05, s0, at + 0.05, s1, 0.28);
    else nav.block(s0, at - 0.05, s1, at + 0.05, 0.28);
  }
  // door frames at the gaps
  for (const [g0, g1] of gaps) {
    const geo = (w, hh, d) => (vertical ? box(d, hh, w) : box(w, hh, d));
    B.add(geo(0.06, h, 0.1), M.black, mat4(...P(g0, h / 2)));
    B.add(geo(0.06, h, 0.1), M.black, mat4(...P(g1, h / 2)));
    B.add(geo(g1 - g0, 0.06, 0.1), M.black, mat4(...P((g0 + g1) / 2, h - 0.03)));
  }
}
/** Glass balustrade along the upper-floor edge, with a gap for the stairs. */
export function railing(ctx, x0, x1, z, gap) {
  const { B, M, y, nav } = ctx;
  const segs = gap ? [[x0, gap[0]], [gap[1], x1]] : [[x0, x1]];
  for (const [s0, s1] of segs) {
    const len = s1 - s0, c = (s0 + s1) / 2;
    const g = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.95), M.glass);
    g.position.set(c, y + 0.55, z);
    ctx.S.add(g);
    B.add(box(len, 0.05, 0.08), M.black, mat4(c, y + 1.03, z));
    B.add(box(len, 0.04, 0.06), M.black, mat4(c, y + 0.06, z));
    const n = Math.max(1, Math.round(len / 1.0));
    for (let k = 0; k <= n; k++) B.add(box(0.04, 1.0, 0.06), M.black, mat4(s0 + (k * len) / n, y + 0.52, z));
    nav.block(s0, z - 0.05, s1, z + 0.05, 0.28);
  }
}
/** Straight stairs along x: bottom at x0 (y=0), top at x1 (y=rise), between z0..z1; rails on the sides listed. */
export function stairs(ctx, x0, x1, z0, z1, rise, steps = 20, rails = [z1]) {
  const { B, M, nav, y } = ctx;
  const dir = Math.sign(x1 - x0), run = Math.abs(x1 - x0), sw = z1 - z0, cz = (z0 + z1) / 2;
  const sr = rise / steps, sd = run / steps;
  // solid body: a right-triangle prism extruded across the width
  const shape = new THREE.Shape();
  shape.moveTo(x0, 0);
  shape.lineTo(x1, 0);
  shape.lineTo(x1, rise);
  shape.closePath();
  const prism = new THREE.ExtrudeGeometry(shape, { depth: sw, bevelEnabled: false });
  B.add(prism, M.lightWood, mat4(0, y, z0));
  for (let k = 0; k < steps; k++) {
    const xt = x0 + dir * (k + 0.5) * sd, yt = (k + 1) * sr;
    B.add(box(sd + 0.02, 0.035, sw + 0.02), M.white, mat4(xt, y + yt - 0.0175, cz)); // tread
    B.add(box(0.03, sr, sw), M.slab, mat4(x0 + dir * (k * sd + 0.015), y + yt - sr / 2, cz)); // riser
  }
  const len = Math.hypot(run, rise), ang = Math.atan2(rise, run) * dir;
  for (const zr of rails) {
    const zz = zr + (zr > cz ? 0.02 : -0.02);
    B.add(box(0.04, 1.0, 0.04), M.black, mat4(x0 + dir * 0.1, y + 0.6, zz));
    B.add(box(0.04, 1.0, 0.04), M.black, mat4(x1 - dir * 0.1, y + rise + 0.5, zz));
    B.add(box(len, 0.05, 0.05), M.black, mat4((x0 + x1) / 2, y + rise / 2 + 1.05, zz, 0, 0, ang));
    for (let k = 1; k < steps; k += 3) B.add(box(0.03, 1.0, 0.03), M.black, mat4(x0 + dir * k * sd, y + k * sr + 0.5, zz));
  }
  nav.block(Math.min(x0, x1) - 0.1, z0, Math.max(x0, x1) + 0.1, z1, 0.3);
}

// ------------------------------------------------- reference-office extras ----
/** Stepped bookshelf against the +z side of stairs rising towards +x; every column stays under the slope. */
export function stairShelf(ctx, x0, x1, z, rise, depth = 0.42, cw = 0.5, rh = 0.55) {
  const { B, M, nav, y } = ctx;
  const run = x1 - x0;
  const cols = Math.floor(run / cw);
  const hAt = (x) => ((x - x0) / run) * rise;
  const rowsAt = (k) => Math.floor((hAt(x0 + k * cw) - 0.08) / rh);
  let first = -1;
  for (let k = 0; k < cols; k++) {
    const rows = rowsAt(k);
    if (rows <= 0) continue;
    if (first < 0) first = k;
    const xl = x0 + k * cw, cx = xl + cw / 2, cz = z + depth / 2;
    const h = rows * rh + 0.03;
    B.add(box(cw, h, 0.02), M.lightWood, mat4(cx, y + h / 2, z + 0.01));
    B.add(box(0.03, h, depth), M.lightWood, mat4(xl + 0.015, y + h / 2, cz));
    if (k === cols - 1) B.add(box(0.03, h, depth), M.lightWood, mat4(xl + cw - 0.015, y + h / 2, cz));
    for (let r = 0; r <= rows; r++) B.add(box(cw, 0.03, depth), M.lightWood, mat4(cx, y + r * rh + 0.015, cz));
    for (let r = 0; r < rows; r++) {
      const seed = (r * 7 + k * 13) % 10;
      const by = r * rh + 0.03;
      if (seed < 5) {
        const n = 3 + (seed % 3);
        for (let b = 0; b < n; b++) B.add(box(0.05, rh * 0.62 + (b % 2) * 0.05, depth * 0.55), M.books[(r + k + b) % 8], mat4(xl + 0.1 + b * 0.065, y + by + rh * 0.33, cz));
      } else if (seed < 7) {
        B.add(rbox(0.2, rh * 0.5, 0.2, 0.02), M.white, mat4(cx, y + by + rh * 0.27, cz));
      } else if (seed < 9) {
        plant(ctx, cx, cz, 0.22, by, M.potClay);
      }
    }
    if (k % 3 === 1) plant(ctx, cx, cz, 0.3, h + 0.01, M.potClay);
  }
  if (first >= 0) nav.block(x0 + first * cw, z, x1, z + depth, 0.2);
}

/** Wall (along x at z=at, or along z at x=at) with arched openings: {x, w, h, sill}. */
export function archWall(ctx, a0, a1, at, h, arches, mat, vertical = false, thick = 0.15) {
  const { B, nav, y } = ctx;
  const len = a1 - a0;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(len, 0);
  shape.lineTo(len, h);
  shape.lineTo(0, h);
  shape.closePath();
  for (const a of arches) {
    const cx = a.x - a0, r = a.w / 2, sill = a.sill || 0, top = a.h;
    const hole = new THREE.Path();
    hole.moveTo(cx - r, sill);
    hole.lineTo(cx - r, top - r);
    hole.absarc(cx, top - r, r, PI, 0, true);
    hole.lineTo(cx + r, sill);
    hole.closePath();
    shape.holes.push(hole);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false, curveSegments: 24 });
  if (vertical) B.add(geo, mat, mat4(at + thick / 2, y, a0, 0, -PI / 2, 0));
  else B.add(geo, mat, mat4(a0, y, at - thick / 2));
  // nav: solid parts blocked, door arches (sill 0) left open
  let cur = a0;
  const doors = arches.filter((a) => !a.sill).sort((p, q) => p.x - q.x);
  const segs = [];
  for (const d of doors) {
    if (d.x - d.w / 2 > cur) segs.push([cur, d.x - d.w / 2]);
    cur = d.x + d.w / 2;
  }
  if (cur < a1) segs.push([cur, a1]);
  for (const [s0, s1] of segs) {
    if (vertical) nav.block(at - thick / 2, s0, at + thick / 2, s1, 0.3);
    else nav.block(s0, at - thick / 2, s1, at + thick / 2, 0.3);
  }
}

/** Black bar balustrade along x (z=at) or along z (x=at), with optional gaps. */
export function railingBars(ctx, a0, a1, at, vertical = false, gaps = []) {
  const { B, M, y, nav } = ctx;
  const segs = [];
  let cur = Math.min(a0, a1);
  const end = Math.max(a0, a1);
  for (const [g0, g1] of gaps.sort((p, q) => p[0] - q[0])) {
    if (g0 > cur) segs.push([cur, g0]);
    cur = g1;
  }
  if (cur < end) segs.push([cur, end]);
  const P = (a, hh) => (vertical ? [at, y + hh, a] : [a, y + hh, at]);
  const geo = (w, hh, d) => (vertical ? box(d, hh, w) : box(w, hh, d));
  for (const [s0, s1] of segs) {
    const len = s1 - s0, c = (s0 + s1) / 2;
    B.add(geo(len, 0.05, 0.06), M.black, mat4(...P(c, 1.02)));
    B.add(geo(len, 0.03, 0.04), M.black, mat4(...P(c, 0.1)));
    const n = Math.max(1, Math.round(len / 0.45));
    for (let k = 0; k <= n; k++) B.add(geo(0.03, 1.0, 0.03), M.black, mat4(...P(s0 + (k * len) / n, 0.52)));
    if (vertical) nav.block(at - 0.04, s0, at + 0.04, s1, 0.28);
    else nav.block(s0, at - 0.04, s1, at + 0.04, 0.28);
  }
}

/** Half-round welcome desk (the reference's WELCOME counter): the round front faces fwd(yaw). */
export function receptionRound(ctx, x, z, yaw = 0) {
  const { B, M, y, nav } = ctx;
  const r = 1.25;
  const f = fwd(yaw), sd = side(yaw);
  const at = (fw, sw, h) => [x + f.x * fw + sd.x * sw, y + h, z + f.z * fw + sd.z * sw];
  let p;
  B.add(new THREE.CylinderGeometry(r, r, 1.02, 40, 1, false, -PI / 2, PI), M.lightWood, mat4(x, y + 0.51, z, 0, yaw, 0));
  B.add(new THREE.CylinderGeometry(r + 0.05, r + 0.05, 0.05, 40, 1, false, -PI / 2, PI), M.deskWood, mat4(x, y + 1.045, z, 0, yaw, 0));
  p = at(-0.03, 0, 0.51);
  B.add(box(2 * r, 1.02, 0.06), M.lightWood, mat4(p[0], p[1], p[2], 0, yaw, 0));
  p = at(0.3, 0, 0.72);
  B.add(box(2 * r - 0.3, 0.04, 0.55), M.lightWood, mat4(p[0], p[1], p[2], 0, yaw, 0));
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.2), new THREE.MeshStandardMaterial({ map: T.signText(["BIENVENIDOS"], "#e0b87a", "#2a2320", 512, 114), roughness: 0.8 }));
  p = at(r + 0.012, 0, 0.6);
  logo.position.set(p[0], p[1], p[2]);
  logo.rotation.y = yaw;
  ctx.S.add(logo);
  p = at(0.35, 0.5, 1.08);
  B.add(cyl(0.11, 0.13, 0.02, 20), M.screenBezel, mat4(p[0], p[1], p[2]));
  p = at(0.35, 0.5, 1.16);
  B.add(box(0.04, 0.16, 0.03), M.screenBezel, mat4(p[0], p[1], p[2], 0, yaw, 0));
  p = at(0.35, 0.5, 1.38);
  B.add(rbox(0.5, 0.32, 0.03, 0.008), M.screenBezel, mat4(p[0], p[1], p[2], 0, yaw, 0));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.26), M.laptopScreen);
  p = at(0.33, 0.5, 1.38);
  scr.position.set(p[0], p[1], p[2]);
  scr.rotation.y = yaw + PI;
  ctx.S.add(scr);
  p = at(0.1, 0.5, 1.08);
  B.add(box(0.36, 0.02, 0.12), M.keyboard, mat4(p[0], p[1], p[2], 0, yaw, 0));
  p = at(0.4, -0.4, 1.1);
  B.add(cyl(0.05, 0.05, 0.06, 12), M.white, mat4(p[0], p[1], p[2]));
  p = at(0.3, -0.75, 1.08);
  B.add(rbox(0.16, 0.012, 0.22, 0.004), M.paper, mat4(p[0], p[1], p[2], 0, yaw + 0.3, 0));
  p = at(0.55, 0, 0);
  nav.blockBox(p[0], p[2], 2.6, 1.3, yaw, 0.3);
}

/** Tall terracotta planter with a shrub. */
export function planter(ctx, x, z, h = 0.9) {
  const { B, M, y, nav } = ctx;
  B.add(cyl(0.3, 0.24, h, 24), M.potClay, mat4(x, y + h / 2, z));
  B.add(cyl(0.27, 0.27, 0.02, 24), M.soil, mat4(x, y + h, z));
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * PI * 2;
    B.add(sph(0.2, 12, 10), k % 2 ? M.plant : M.plant3, mat4(x + Math.cos(a) * 0.17, y + h + 0.22 + (k % 3) * 0.06, z + Math.sin(a) * 0.17, 0, 0, 0, 1, 0.8, 1));
  }
  B.add(sph(0.22, 12, 10), M.plant2, mat4(x, y + h + 0.42, z, 0, 0, 0, 1, 0.8, 1));
  nav.blockCircle(x, z, 0.3, 0.22);
}

/** Square upholstered pouf. */
export function pouf(ctx, x, z, mat) {
  const { B, M, y, nav } = ctx;
  B.add(rbox(0.6, 0.42, 0.6, 0.08), mat || M.pouf, mat4(x, y + 0.21, z));
  nav.blockBox(x, z, 0.6, 0.6, 0, 0.2);
}

/** Freestanding coffee bar: wood front, white top, machine + cups; faces +fwd(yaw). Returns the machine's spot. */
export function cafeCounter(ctx, x, z, yaw, len = 2.6) {
  const { B, M, y, nav } = ctx;
  const f = fwd(yaw), s = side(yaw);
  const at = (fw, sw, h) => [x + f.x * fw + s.x * sw, y + h, z + f.z * fw + s.z * sw];
  let p = at(0, 0, 0.5);
  B.add(box(len, 1.0, 0.6), M.deskWood, mat4(p[0], p[1], p[2], 0, yaw, 0));
  p = at(0, 0, 1.025);
  B.add(rbox(len + 0.08, 0.05, 0.68, 0.01), M.white, mat4(p[0], p[1], p[2], 0, yaw, 0));
  for (let k = 1; k < Math.round(len / 0.65); k++) {
    p = at(0.31, -len / 2 + (k * len) / Math.round(len / 0.65), 0.5);
    B.add(box(0.01, 0.9, 0.02), M.darkWood, mat4(p[0], p[1], p[2], 0, yaw, 0));
  }
  // espresso machine at the left end, cups and a plant along the top
  const mx = -len / 2 + 0.45;
  p = at(-0.05, mx, 1.25);
  B.add(rbox(0.44, 0.4, 0.4, 0.03), M.steel, mat4(p[0], p[1], p[2], 0, yaw, 0));
  p = at(-0.05, mx, 1.48);
  B.add(rbox(0.48, 0.06, 0.42, 0.02), M.chairDark, mat4(p[0], p[1], p[2], 0, yaw, 0));
  p = at(0.12, mx, 1.1);
  B.add(box(0.3, 0.1, 0.24), M.chairDark, mat4(p[0], p[1], p[2], 0, yaw, 0));
  p = at(0.2, mx - 0.06, 1.1);
  B.add(cyl(0.04, 0.035, 0.08, 12), M.white, mat4(p[0], p[1], p[2]));
  for (let k = 0; k < 5; k++) {
    p = at(-0.1, mx + 0.5 + k * 0.16, 1.095);
    B.add(cyl(0.04, 0.034, 0.09, 12), M.accents[k % M.accents.length], mat4(p[0], p[1], p[2]));
  }
  p = at(-0.08, mx + 1.4, 1.15);
  B.add(cyl(0.1, 0.09, 0.2, 16), M.steel, mat4(p[0], p[1], p[2]));
  p = at(-0.05, len / 2 - 0.35, 1.05);
  plant(ctx, p[0], p[2], 0.34, 1.05, M.potClay);
  p = at(-0.1, mx + 0.95, 1.06);
  B.add(rbox(0.28, 0.08, 0.2, 0.02), M.lightWood, mat4(p[0], p[1], p[2], 0, yaw, 0));
  nav.blockBox(x, z, len, 0.6, yaw, 0.3);
  const spot = at(0.65, mx, 0);
  return { machine: [spot[0], spot[2]], yaw: yaw + PI };
}

/** Small desk with a laptop and a chair (no station). */
export function laptopDesk(ctx, x, z, yaw) {
  const { B, M, y, nav } = ctx;
  const f = fwd(yaw), s = side(yaw);
  const at = (fw, sw, h) => [x + f.x * fw + s.x * sw, y + h, z + f.z * fw + s.z * sw];
  let p = at(0.5, 0, DESK_H - 0.02);
  B.add(rbox(1.2, 0.04, 0.6, 0.01), M.lightWood, mat4(p[0], p[1], p[2], 0, yaw, 0));
  for (const sw of [-0.52, 0.52]) {
    p = at(0.5, sw, (DESK_H - 0.04) / 2);
    B.add(box(0.05, DESK_H - 0.04, 0.5), M.metal, mat4(p[0], p[1], p[2], 0, yaw, 0));
  }
  p = at(0.45, 0.05, DESK_H + 0.008);
  B.add(rbox(0.3, 0.014, 0.21, 0.005), M.steel, mat4(p[0], p[1], p[2], 0, yaw, 0));
  p = at(0.55, 0.05, DESK_H + 0.11);
  B.add(rbox(0.3, 0.2, 0.012, 0.005), M.steel, mat4(p[0], p[1], p[2], -0.25, yaw, 0));
  const ls = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.17), M.laptopScreen);
  const q = at(0.547, 0.05, DESK_H + 0.11);
  ls.position.set(q[0], q[1], q[2]);
  ls.rotation.set(-0.25, yaw + PI, 0, "YXZ");
  ctx.S.add(ls);
  p = at(0.6, -0.4, DESK_H + 0.05);
  B.add(cyl(0.042, 0.037, 0.1), M.accents[3], mat4(p[0], p[1], p[2]));
  p = at(-0.1, 0, 0);
  simpleChair(ctx, p[0], p[2], yaw, M.chairBlack);
  nav.blockBox(x + f.x * 0.5, z + f.z * 0.5, 1.2, 0.6, yaw, 0.28);
}
