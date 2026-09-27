// The office itself: a cut-away diorama (floor slab, two walls, no ceiling)
// furnished like a real studio — a four-desk pinwheel pod under pendant
// lamps, two desks by the windows, a lounge, a coffee bar, whiteboard, TV wall
// with shelving, printer, water cooler and plants. Static geometry is merged
// per material so the whole room is a few dozen draw calls.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import * as T from "./textures.js";

export const ROOM = { x0: -5.5, x1: 5.5, z0: -4.5, z1: 4.5, wallH: 3.6 };
export const DESK_H = 0.74;

const PI = Math.PI;
const std = (color, roughness = 0.75, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });

// ------------------------------------------------------------- batching ----
class Batcher {
  constructor(scene) {
    this.scene = scene;
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
      this.scene.add(m);
    }
    this.groups.clear();
  }
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
function mat4(x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
  _e.set(rx, ry, rz);
  _q.setFromEuler(_e);
  _p.set(x, y, z);
  _s.set(sx, sy, sz);
  return _m.compose(_p, _q, _s).clone();
}
const rbox = (w, h, d, r = 0.03, seg = 2) => new RoundedBoxGeometry(w, h, d, seg, r);

/** A quad with explicit corners (for light shafts, AO strips). uv v: 0 at p0/p1, 1 at p2/p3. */
function quad(p0, p1, p2, p3) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([...p0, ...p1, ...p2, ...p3], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.computeVertexNormals();
  return g;
}

// -------------------------------------------------------------- builder ----
/**
 * @param scene THREE.Scene
 * @param nav NavGrid — furniture blocks its footprint here
 * @param bots the six employees, in desk order
 */
export function buildRoom(scene, nav, bots) {
  const B = new Batcher(scene);
  const dynamic = { screens: [], tv: null, clock: null };

  // ---- materials ----
  const M = {
    slab: std("#d9b8ab", 0.9),
    floor: new THREE.MeshStandardMaterial({ map: T.woodFloor(), roughness: 0.6 }),
    plaster: new THREE.MeshStandardMaterial({ map: T.plaster(), roughness: 0.95 }),
    frame: std("#f4f2ee", 0.6),
    glass: new THREE.MeshPhysicalMaterial({ color: "#eaf4ff", roughness: 0.05, transparent: true, opacity: 0.18, depthWrite: false, clearcoat: 0.5 }),
    outside: new THREE.MeshBasicMaterial({ map: T.outside() }),
    shaft: new THREE.MeshBasicMaterial({ map: T.shaft(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    ao: new THREE.MeshBasicMaterial({ map: T.aoStrip(), transparent: true, depthWrite: false }),
    blob: new THREE.MeshBasicMaterial({ map: T.blob(), transparent: true, depthWrite: false }),
    deskWood: std("#c98449", 0.55),
    darkWood: std("#6b4a34", 0.7),
    metal: std("#25262c", 0.45, { metalness: 0.6 }),
    steel: std("#b6bcc4", 0.35, { metalness: 0.85 }),
    divider: new THREE.MeshStandardMaterial({ map: T.fabric("#2f6f68"), roughness: 0.95 }),
    chairSeat: new THREE.MeshStandardMaterial({ map: T.fabric("#e4e4e8"), roughness: 0.9 }),
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
    rug: new THREE.MeshStandardMaterial({ map: T.rug(), roughness: 1 }),
    lamp: std("#1d1b19", 0.85, { side: THREE.DoubleSide }),
    bulb: new THREE.MeshStandardMaterial({ color: "#fff3d6", emissive: "#ffd9a0", emissiveIntensity: 2.5 }),
    lampShade: new THREE.MeshStandardMaterial({ color: "#f6efe2", emissive: "#ffe6bf", emissiveIntensity: 0.35, roughness: 1, side: THREE.DoubleSide }),
    teal: std("#2f6f68", 0.7),
    tv: std("#141518", 0.35, { metalness: 0.5 }),
    bottle: new THREE.MeshPhysicalMaterial({ color: "#7cc7ff", roughness: 0.1, transparent: true, opacity: 0.55, transmission: 0 }),
    laptopScreen: new THREE.MeshStandardMaterial({ color: "#dfe9ff", emissive: "#9fc4ff", emissiveIntensity: 0.6, roughness: 0.4 }),
    books: ["#e26d5c", "#4f8ad6", "#f2c14e", "#69c7b9", "#6f5ae0", "#2f3b4a", "#f28c6b", "#7cb46b"].map((c) => std(c, 0.85)),
    stickies: ["#ffe66d", "#ff9ecb", "#9be8a1"].map((c) => new THREE.MeshStandardMaterial({ map: T.sticky(c), roughness: 0.9 })),
    accents: bots.map((b) => std(b.accent, 0.45)),
  };

  // ---- slab + floor ----
  B.add(new THREE.BoxGeometry(ROOM.x1 - ROOM.x0 + 0.6, 0.6, ROOM.z1 - ROOM.z0 + 0.6), M.slab, mat4(0, -0.3, 0));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.x1 - ROOM.x0, ROOM.z1 - ROOM.z0), M.floor);
  M.floor.map.repeat.set((ROOM.x1 - ROOM.x0) / 2, (ROOM.z1 - ROOM.z0) / 2);
  floor.rotation.x = -PI / 2;
  floor.position.y = 0.002;
  floor.receiveShadow = true;
  scene.add(floor);
  // soft shadow on the void below the slab
  const under = new THREE.Mesh(new THREE.PlaneGeometry(19, 17), M.blob);
  under.rotation.x = -PI / 2;
  under.position.set(0.6, -0.75, 0.6);
  scene.add(under);

  // ---- walls ----
  const H = ROOM.wallH, TH = 0.3;
  const brickTex = T.brick();
  const brickMat = (z0, z1, y0, y1) => {
    const map = brickTex.map.clone(), bump = brickTex.bump.clone();
    map.repeat.set(z1 - z0, y1 - y0);
    map.offset.set(-z1, -y1);
    bump.repeat.copy(map.repeat);
    bump.offset.copy(map.offset);
    return new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 0.6, roughness: 0.9 });
  };
  const brickPiece = (z0, z1, y0, y1) => {
    const g = new THREE.BoxGeometry(TH, y1 - y0, z1 - z0);
    const m = new THREE.Mesh(g, [brickMat(z0, z1, y0, y1), M.slab, M.slab, M.slab, M.slab, M.slab]);
    m.position.set(ROOM.x0 - TH / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
  };
  const WIN = [
    { z0: -3.3, z1: -1.5 },
    { z0: 0.1, z1: 1.9 },
  ];
  const SILL = 1.0, LINTEL = 2.9;
  brickPiece(ROOM.z0 - 0.15, WIN[0].z0, 0, H);
  brickPiece(WIN[0].z1, WIN[1].z0, 0, H);
  brickPiece(WIN[1].z1, ROOM.z1 + 0.15, 0, H);
  for (const w of WIN) {
    brickPiece(w.z0, w.z1, 0, SILL);
    brickPiece(w.z0, w.z1, LINTEL, H);
    // frame, mullions, glass, the bright outside
    const cz = (w.z0 + w.z1) / 2, cw = w.z1 - w.z0, ch = LINTEL - SILL, cy = (SILL + LINTEL) / 2, wx = ROOM.x0 - TH / 2;
    B.add(new THREE.BoxGeometry(0.36, 0.08, cw + 0.16), M.frame, mat4(wx, SILL - 0.02, cz));
    B.add(new THREE.BoxGeometry(0.36, 0.08, cw + 0.16), M.frame, mat4(wx, LINTEL + 0.02, cz));
    B.add(new THREE.BoxGeometry(0.36, ch + 0.08, 0.08), M.frame, mat4(wx, cy, w.z0 - 0.02));
    B.add(new THREE.BoxGeometry(0.36, ch + 0.08, 0.08), M.frame, mat4(wx, cy, w.z1 + 0.02));
    B.add(new THREE.BoxGeometry(0.12, ch, 0.05), M.frame, mat4(wx, cy, cz));
    B.add(new THREE.BoxGeometry(0.12, 0.05, cw), M.frame, mat4(wx, SILL + ch / 3, cz));
    B.add(new THREE.BoxGeometry(0.12, 0.05, cw), M.frame, mat4(wx, SILL + (2 * ch) / 3, cz));
    // window sill ledge inside
    B.add(new THREE.BoxGeometry(0.16, 0.04, cw + 0.3), M.frame, mat4(ROOM.x0 + 0.02, SILL - 0.06, cz));
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(cw, ch), M.glass);
    glass.rotation.y = PI / 2;
    glass.position.set(wx, cy, cz);
    scene.add(glass);
    const out = new THREE.Mesh(new THREE.PlaneGeometry(cw + 1.2, ch + 1.2), M.outside);
    out.rotation.y = PI / 2;
    out.position.set(ROOM.x0 - TH - 0.25, cy, cz);
    scene.add(out);
    // sun shafts: quads from the lintel and the sill, following the sun
    const dir = new THREE.Vector3(10, -8, 2).normalize();
    const shaftFrom = (y, alpha) => {
      const s = y / -dir.y;
      const ex = ROOM.x0 + dir.x * s, ez = dir.z * s;
      const g = quad([ROOM.x0 + 0.02, y, w.z0], [ROOM.x0 + 0.02, y, w.z1], [ex, 0.01, w.z1 + ez], [ex, 0.01, w.z0 + ez]);
      const m = new THREE.Mesh(g, M.shaft.clone());
      m.material.opacity = alpha;
      scene.add(m);
    };
    shaftFrom(LINTEL, 0.16);
    shaftFrom(SILL + 0.9, 0.07);
  }
  // white wall (plaster on the inside)
  {
    const len = ROOM.x1 - ROOM.x0 + 0.3;
    const pl = M.plaster.clone();
    pl.map = M.plaster.map.clone();
    pl.map.repeat.set(len / 2, H / 2);
    const m = new THREE.Mesh(new THREE.BoxGeometry(len, H, TH), [M.slab, M.slab, M.slab, M.slab, pl, M.slab]);
    m.position.set((ROOM.x0 + ROOM.x1) / 2 - 0.15, H / 2, ROOM.z0 - TH / 2);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
  }
  // baseboards + floor-wall ambient occlusion
  B.add(new THREE.BoxGeometry(0.04, 0.1, ROOM.z1 - ROOM.z0), M.darkWood, mat4(ROOM.x0 + 0.02, 0.05, 0));
  B.add(new THREE.BoxGeometry(ROOM.x1 - ROOM.x0, 0.1, 0.04), M.darkWood, mat4(0, 0.05, ROOM.z0 + 0.02));
  scene.add(new THREE.Mesh(quad([ROOM.x0, 0.004, ROOM.z0], [ROOM.x0, 0.004, ROOM.z1], [ROOM.x0 + 0.7, 0.004, ROOM.z1], [ROOM.x0 + 0.7, 0.004, ROOM.z0]), M.ao));
  scene.add(new THREE.Mesh(quad([ROOM.x1, 0.004, ROOM.z0], [ROOM.x0, 0.004, ROOM.z0], [ROOM.x0, 0.004, ROOM.z0 + 0.7], [ROOM.x1, 0.004, ROOM.z0 + 0.7]), M.ao));

  // ---- door on the white wall ----
  {
    const dx = -4.65, dz = ROOM.z0 + 0.03;
    B.add(new THREE.BoxGeometry(1.0, 2.15, 0.06), M.frame, mat4(dx, 1.075, dz));
    B.add(rbox(0.86, 2.05, 0.05, 0.01), M.teal, mat4(dx, 1.025, dz + 0.02));
    B.add(rbox(0.6, 0.9, 0.02, 0.01), M.glass, mat4(dx, 1.45, dz + 0.05));
    B.add(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 8), M.steel, mat4(dx + 0.34, 1.02, dz + 0.08, 0, 0, PI / 2));
  }

  // ---- pendant lamps ----
  const lights = [];
  for (const [x, z] of [[-0.2, -1.55], [1.4, 0.2]]) {
    B.add(new THREE.CylinderGeometry(0.006, 0.006, H - 2.35, 6), M.metal, mat4(x, 2.35 + (H - 2.35) / 2, z));
    B.add(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 10), M.metal, mat4(x, 2.36, z));
    B.add(new THREE.ConeGeometry(0.3, 0.28, 32, 1, true), M.lamp, mat4(x, 2.22, z));
    B.add(new THREE.SphereGeometry(0.05, 12, 10), M.bulb, mat4(x, 2.15, z));
    const l = new THREE.PointLight("#ffd7a6", 5, 6.5, 2);
    l.position.set(x, 2.05, z);
    scene.add(l);
    lights.push(l);
  }

  // ---- desks (one per bot) ----
  const seats = [
    { x: -0.65, z: 0.15, yaw: PI / 2 }, // pod west, faces +x
    { x: 0.15, z: -1.85, yaw: 0 }, // pod north, faces +z
    { x: -2.95, z: 0.35, yaw: 0 }, // window pair, right
    { x: 1.85, z: -1.05, yaw: -PI / 2 }, // pod east, faces -x
    { x: -4.4, z: 0.35, yaw: 0 }, // window pair, left
    { x: 1.05, z: 0.65, yaw: PI }, // pod south, faces -z
  ];
  const desks = seats.map((seat, i) => buildDesk(seat, bots[i], i));

  function buildDesk(seat, bot, i) {
    const f = new THREE.Vector3(Math.sin(seat.yaw), 0, Math.cos(seat.yaw));
    const s = new THREE.Vector3(Math.cos(seat.yaw), 0, -Math.sin(seat.yaw));
    const at = (fw, sd, y) => new THREE.Vector3(seat.x + f.x * fw + s.x * sd, y, seat.z + f.z * fw + s.z * sd);
    const yaw = seat.yaw;
    const c = at(0.65, 0, 0); // desk centre
    // top + legs + beam
    B.add(rbox(1.4, 0.04, 0.7, 0.01), M.deskWood, mat4(c.x, DESK_H - 0.02, c.z, 0, yaw, 0));
    for (const sd of [-0.62, 0.62]) {
      const p = at(0.65, sd, 0);
      B.add(new THREE.BoxGeometry(0.05, DESK_H - 0.04, 0.58), M.metal, mat4(p.x, (DESK_H - 0.04) / 2, p.z, 0, yaw, 0));
    }
    const beam = at(0.65, 0, 0);
    B.add(new THREE.BoxGeometry(1.2, 0.05, 0.05), M.metal, mat4(beam.x, 0.32, beam.z, 0, yaw, 0));
    // privacy divider along the front edge, with a wood cap
    const d = at(0.98, 0, 0);
    B.add(rbox(1.4, 0.4, 0.03, 0.01), M.divider, mat4(d.x, DESK_H + 0.2, d.z, 0, yaw, 0));
    B.add(new THREE.BoxGeometry(1.42, 0.03, 0.06), M.deskWood, mat4(d.x, DESK_H + 0.41, d.z, 0, yaw, 0));
    // sticky notes on the divider (facing the sitter)
    for (let k = 0; k < 2; k++) {
      const p = at(0.965, -0.45 + k * 0.16 + (i % 3) * 0.08, DESK_H + 0.22 + (k % 2) * 0.09);
      const n = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), M.stickies[(i + k) % 3]);
      n.position.copy(p);
      n.rotation.y = yaw + PI + (k ? 0.08 : -0.06);
      scene.add(n);
    }
    // monitor: stand, neck, bezel, live screen facing the sitter
    const mp = at(0.78, 0.02, DESK_H);
    B.add(new THREE.CylinderGeometry(0.11, 0.13, 0.02, 20), M.screenBezel, mat4(mp.x, DESK_H + 0.01, mp.z));
    B.add(new THREE.BoxGeometry(0.04, 0.16, 0.03), M.screenBezel, mat4(mp.x, DESK_H + 0.09, mp.z, 0, yaw, 0));
    B.add(rbox(0.6, 0.36, 0.03, 0.008), M.screenBezel, mat4(mp.x, DESK_H + 0.33, mp.z, 0, yaw, 0));
    const scr = T.monitor(bot.screen, bot.accent);
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.31),
      new THREE.MeshStandardMaterial({ map: scr.tex, emissiveMap: scr.tex, emissive: "#ffffff", emissiveIntensity: 0.6, roughness: 0.5 })
    );
    const fp = at(0.762, 0.02, DESK_H + 0.33);
    face.position.copy(fp);
    face.rotation.y = yaw + PI;
    scene.add(face);
    dynamic.screens.push(scr);
    // keyboard + mouse
    const kp = at(0.5, 0.02, DESK_H + 0.012);
    B.add(new THREE.BoxGeometry(0.4, 0.022, 0.13), M.keyboard, mat4(kp.x, kp.y, kp.z, 0, yaw, 0));
    const mo = at(0.5, 0.3, DESK_H + 0.025);
    B.add(rbox(0.06, 0.04, 0.1, 0.02), M.white, mat4(mo.x, mo.y, mo.z, 0, yaw, 0));
    // mug in the bot's colour, notebook, pen, phone
    const mg = at(0.55, -0.42, DESK_H + 0.05);
    B.add(new THREE.CylinderGeometry(0.042, 0.037, 0.1, 16), M.accents[i], mat4(mg.x, mg.y, mg.z));
    B.add(new THREE.TorusGeometry(0.026, 0.007, 8, 14, PI), M.accents[i], mat4(mg.x + 0.04, mg.y, mg.z, 0, PI / 2, 0));
    const nb = at(0.45, -0.24, DESK_H + 0.008);
    B.add(rbox(0.16, 0.012, 0.22, 0.004), M.paper, mat4(nb.x, nb.y, nb.z, 0, yaw + 0.15, 0));
    B.add(new THREE.CylinderGeometry(0.005, 0.005, 0.14, 6), M.metal, mat4(nb.x + 0.05, nb.y + 0.01, nb.z, 0, yaw, PI / 2));
    const ph = at(0.6, 0.38, DESK_H + 0.006);
    B.add(rbox(0.07, 0.01, 0.14, 0.004), M.screenBezel, mat4(ph.x, ph.y, ph.z, 0, yaw - 0.3, 0));
    // desk lamp (black, like the reference) on the far corner
    const lp = at(0.85, 0.52, DESK_H);
    B.add(new THREE.CylinderGeometry(0.07, 0.08, 0.02, 16), M.metal, mat4(lp.x, DESK_H + 0.01, lp.z));
    B.add(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 8), M.metal, mat4(lp.x - s.x * 0.06, DESK_H + 0.22, lp.z - s.z * 0.06, 0, yaw, -0.3));
    B.add(new THREE.ConeGeometry(0.075, 0.1, 16, 1, true), M.lamp, mat4(lp.x - s.x * 0.16, DESK_H + 0.41, lp.z - s.z * 0.16, 0.4, yaw, 0));
    // laptop on two desks, small plant on two others, papers on the rest
    if (i === 3 || i === 2) {
      const lb = at(0.55, -0.28, DESK_H + 0.008);
      B.add(rbox(0.3, 0.014, 0.21, 0.005), M.steel, mat4(lb.x, lb.y, lb.z, 0, yaw - 0.35, 0));
      const lid = at(0.65, -0.32, DESK_H + 0.11);
      B.add(rbox(0.3, 0.2, 0.012, 0.005), M.steel, mat4(lid.x, lid.y, lid.z, -0.25, yaw - 0.35, 0));
      const ls = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.17), M.laptopScreen);
      ls.position.copy(at(0.647, -0.318, DESK_H + 0.11));
      ls.rotation.set(-0.25, yaw - 0.35 + PI, 0, "YXZ");
      scene.add(ls);
    } else if (i === 0 || i === 5) {
      plant(at(0.85, -0.5, DESK_H).x, at(0.85, -0.5, DESK_H).z, 0.32, DESK_H, M.potClay);
    } else {
      const pp = at(0.6, -0.35, DESK_H + 0.006);
      B.add(new THREE.BoxGeometry(0.21, 0.01, 0.3), M.paper, mat4(pp.x, pp.y, pp.z, 0, yaw + 0.3, 0));
      B.add(new THREE.BoxGeometry(0.21, 0.01, 0.3), M.paper, mat4(pp.x + 0.03, pp.y + 0.01, pp.z + 0.02, 0, yaw - 0.1, 0));
    }
    // chair behind the seat
    const ch = at(-0.28, 0, 0);
    chair(ch.x, ch.z, yaw);
    // nav: desk + chair footprints, keep the seat cell open
    nav.blockBox(c.x, c.z, 1.4, 0.7, yaw, 0.25);
    const cb = at(-0.4, 0, 0);
    nav.blockBox(cb.x, cb.z, 0.5, 0.5, yaw, 0.1);
    nav.clear(seat.x, seat.z, 0.13);
    // where a visitor stands: beside the sitter, on whichever side is free
    const cand = [-1, 1].map((sd) => at(0.12, sd * 0.85, 0));
    return { seat, f, s, visit: cand.map((p) => ({ x: p.x, z: p.z, yaw: Math.atan2(seat.x - p.x, seat.z - p.z) })) };
  }

  function chair(x, z, yaw) {
    const y0 = 0;
    for (let k = 0; k < 5; k++) {
      const a = yaw + (k / 5) * PI * 2;
      B.add(rbox(0.3, 0.03, 0.05, 0.01), M.chairDark, mat4(x + Math.sin(a) * 0.15, y0 + 0.035, z + Math.cos(a) * 0.15, 0, a + PI / 2, 0));
      B.add(new THREE.SphereGeometry(0.028, 10, 8), M.chairDark, mat4(x + Math.sin(a) * 0.29, y0 + 0.028, z + Math.cos(a) * 0.29));
    }
    B.add(new THREE.CylinderGeometry(0.03, 0.035, 0.3, 12), M.steel, mat4(x, 0.2, z));
    B.add(rbox(0.46, 0.08, 0.46, 0.03), M.chairSeat, mat4(x, 0.36, z, 0, yaw, 0));
    const bx = x - Math.sin(yaw) * 0.2, bz = z - Math.cos(yaw) * 0.2;
    B.add(rbox(0.44, 0.48, 0.07, 0.03), M.chairSeat, mat4(bx, 0.66, bz, -0.12, yaw, 0));
    B.add(new THREE.BoxGeometry(0.3, 0.05, 0.02), M.chairDark, mat4(bx + Math.sin(yaw) * 0.02, 0.42, bz + Math.cos(yaw) * 0.02, 0, yaw, 0));
    for (const sd of [-0.24, 0.24]) {
      const ax = x + Math.cos(yaw) * sd, az = z - Math.sin(yaw) * sd;
      B.add(rbox(0.05, 0.025, 0.28, 0.01), M.chairDark, mat4(ax, 0.6, az, 0, yaw, 0));
      B.add(new THREE.BoxGeometry(0.03, 0.2, 0.03), M.chairDark, mat4(ax, 0.5, az, 0, yaw, 0));
    }
  }

  function plant(x, z, size, y0 = 0, potMat = M.potWhite, leafA = M.plant, leafB = M.plant2) {
    B.add(new THREE.CylinderGeometry(0.2 * size, 0.15 * size, 0.36 * size, 18), potMat, mat4(x, y0 + 0.18 * size, z));
    B.add(new THREE.CylinderGeometry(0.18 * size, 0.18 * size, 0.02, 18), M.soil, mat4(x, y0 + 0.36 * size, z));
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * PI * 2 + size, r = 0.16 * size;
      B.add(new THREE.SphereGeometry(0.2 * size, 12, 10), k % 2 ? leafA : leafB, mat4(x + Math.cos(a) * r, y0 + (0.62 + (k % 3) * 0.08) * size, z + Math.sin(a) * r, 0, 0, 0, 1, 0.75, 1));
    }
    B.add(new THREE.SphereGeometry(0.22 * size, 12, 10), leafA, mat4(x, y0 + 0.86 * size, z, 0, 0, 0, 1, 0.8, 1));
  }

  // ---- big tree in the front-left corner (like the reference) ----
  {
    const x = -4.85, z = 3.85;
    B.add(new THREE.CylinderGeometry(0.34, 0.28, 0.5, 24), M.potWhite, mat4(x, 0.25, z));
    B.add(new THREE.CylinderGeometry(0.31, 0.31, 0.02, 24), M.soil, mat4(x, 0.5, z));
    B.add(new THREE.CylinderGeometry(0.05, 0.07, 1.3, 10), M.darkWood, mat4(x, 1.1, z));
    for (let k = 0; k < 16; k++) {
      const a = k * 2.4, r = 0.3 + (k % 3) * 0.2, h = 1.45 + (k % 4) * 0.28;
      B.add(new THREE.SphereGeometry(0.3 + (k % 2) * 0.08, 14, 10), k % 3 ? M.plant : M.plant3, mat4(x + Math.cos(a) * r, h, z + Math.sin(a) * r, 0, 0, 0, 1, 0.7, 1));
    }
    B.add(new THREE.SphereGeometry(0.42, 16, 12), M.plant2, mat4(x, 2.35, z, 0, 0, 0, 1, 0.75, 1));
    nav.blockCircle(x, z, 0.4);
  }
  plant(-5.0, -0.6, 0.9);
  nav.blockCircle(-5.0, -0.6, 0.2);
  plant(2.75, 1.05, 0.7, 0, M.potClay);
  nav.blockCircle(2.75, 1.05, 0.15);

  // ---- TV wall: shelving unit, TV, frames, clock ----
  {
    const x0 = -2.2, x1 = 0.8, z = ROOM.z0 + 0.22, h = 0.95, dpt = 0.4;
    const cx = (x0 + x1) / 2, len = x1 - x0;
    B.add(new THREE.BoxGeometry(len, 0.04, dpt), M.deskWood, mat4(cx, h, z));
    B.add(new THREE.BoxGeometry(len, 0.04, dpt), M.deskWood, mat4(cx, 0.06, z));
    B.add(new THREE.BoxGeometry(len - 0.08, 0.03, dpt - 0.04), M.deskWood, mat4(cx, h / 2, z));
    for (let k = 0; k <= 3; k++) B.add(new THREE.BoxGeometry(0.04, h, dpt), M.deskWood, mat4(x0 + (k * len) / 3, h / 2, z));
    B.add(new THREE.BoxGeometry(len, h, 0.02), M.deskWood, mat4(cx, h / 2, z - dpt / 2 + 0.01));
    // cubby contents
    const cub = (k, row) => ({ x: x0 + 0.02 + (k * len) / 3, y: row ? h / 2 + 0.015 : 0.08, w: len / 3 - 0.04 });
    let bx = cub(0, 1);
    for (let k = 0; k < 8; k++) B.add(new THREE.BoxGeometry(0.06, 0.24 + (k % 3) * 0.04, 0.22), M.books[k % 8], mat4(bx.x + 0.08 + k * 0.075, bx.y + 0.14, z, 0, 0, k === 7 ? 0.25 : 0));
    bx = cub(1, 1);
    for (let k = 0; k < 4; k++) B.add(rbox(0.08, 0.28, 0.24, 0.01), M.white, mat4(bx.x + 0.1 + k * 0.1, bx.y + 0.14, z));
    plant(bx.x + 0.7, z, 0.35, bx.y, M.potClay);
    bx = cub(2, 1);
    B.add(rbox(0.26, 0.2, 0.02, 0.005), M.metal, mat4(bx.x + 0.3, bx.y + 0.12, z + 0.05, -0.15));
    for (let k = 0; k < 5; k++) B.add(new THREE.BoxGeometry(0.06, 0.26, 0.22), M.books[(k + 3) % 8], mat4(bx.x + 0.6 + k * 0.075, bx.y + 0.14, z));
    bx = cub(0, 0);
    for (let k = 0; k < 3; k++) B.add(rbox(0.28, 0.12, 0.3, 0.02), M.books[5], mat4(bx.x + 0.5, bx.y + 0.07 + k * 0.13, z));
    bx = cub(1, 0);
    for (let k = 0; k < 6; k++) B.add(new THREE.BoxGeometry(0.06, 0.28, 0.22), M.books[(k + 5) % 8], mat4(bx.x + 0.15 + k * 0.075, bx.y + 0.15, z));
    bx = cub(2, 0);
    B.add(rbox(0.3, 0.26, 0.3, 0.03), M.potWhite, mat4(bx.x + 0.5, bx.y + 0.14, z));
    // on top
    plant(x0 + 0.25, z, 0.42, h + 0.02);
    B.add(rbox(0.12, 0.2, 0.12, 0.03), M.chairDark, mat4(x1 - 0.3, h + 0.12, z));
    nav.block(x0, ROOM.z0, x1, z + dpt / 2, 0.25);
    // TV with the live dashboard
    const tvx = -0.7, tvy = 2.35;
    B.add(rbox(1.5, 0.86, 0.05, 0.01), M.tv, mat4(tvx, tvy, ROOM.z0 + 0.04));
    const dash = T.dashboard();
    const tvScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.42, 0.78),
      new THREE.MeshStandardMaterial({ map: dash.tex, emissiveMap: dash.tex, emissive: "#ffffff", emissiveIntensity: 0.7, roughness: 0.4 })
    );
    tvScreen.position.set(tvx, tvy, ROOM.z0 + 0.07);
    scene.add(tvScreen);
    dynamic.tv = dash;
    // framed pictures, clock
    for (const [fx, fy, seed] of [[-3.55, 2.25, 1], [-3.0, 2.62, 2], [-3.05, 1.95, 3]]) {
      B.add(rbox(0.5, 0.36, 0.03, 0.005), M.chairDark, mat4(fx, fy, ROOM.z0 + 0.03));
      const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.3), new THREE.MeshStandardMaterial({ map: T.picture(seed), roughness: 0.8 }));
      pic.position.set(fx, fy, ROOM.z0 + 0.05);
      scene.add(pic);
    }
    const clock = new THREE.Group();
    clock.position.set(-1.95, 3.05, ROOM.z0 + 0.04);
    clock.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 32), M.chairDark).rotateX(PI / 2));
    clock.add(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 32), M.white).rotateX(PI / 2));
    const hour = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 0.01), M.chairDark);
    const minute = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.14, 0.01), M.chairDark);
    hour.geometry.translate(0, 0.045, 0);
    minute.geometry.translate(0, 0.065, 0);
    hour.position.z = 0.03;
    minute.position.z = 0.035;
    clock.add(hour, minute);
    scene.add(clock);
    dynamic.clock = { hour, minute };
  }

  // ---- whiteboard ----
  {
    const x = 2.0, y = 1.8, z = ROOM.z0 + 0.03;
    B.add(rbox(1.9, 1.3, 0.04, 0.01), M.steel, mat4(x, y, z));
    const wb = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), new THREE.MeshStandardMaterial({ map: T.whiteboard(), roughness: 0.35 }));
    wb.position.set(x, y, z + 0.025);
    scene.add(wb);
    B.add(new THREE.BoxGeometry(0.8, 0.03, 0.08), M.steel, mat4(x, y - 0.68, z + 0.04));
    B.add(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), M.books[0], mat4(x - 0.2, y - 0.65, z + 0.05, 0, 0, PI / 2));
    B.add(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), M.books[1], mat4(x, y - 0.65, z + 0.05, 0, 0, PI / 2));
  }

  // ---- coffee bar in the back-right corner ----
  {
    const x0 = 3.25, x1 = 5.35, z = ROOM.z0 + 0.3, cx = (x0 + x1) / 2, len = x1 - x0;
    B.add(new THREE.BoxGeometry(len, 0.9, 0.6), M.white, mat4(cx, 0.45, z));
    B.add(rbox(len + 0.06, 0.05, 0.68, 0.01), M.deskWood, mat4(cx, 0.925, z));
    for (let k = 1; k < 3; k++) B.add(new THREE.BoxGeometry(0.01, 0.8, 0.02), M.slab, mat4(x0 + (k * len) / 3, 0.45, z + 0.3));
    for (let k = 0; k < 3; k++) B.add(new THREE.BoxGeometry(0.12, 0.015, 0.02), M.steel, mat4(x0 + ((k + 0.5) * len) / 3, 0.6, z + 0.31));
    // espresso machine
    const mx = 4.7;
    B.add(rbox(0.42, 0.4, 0.38, 0.03), M.steel, mat4(mx, 1.15, z));
    B.add(rbox(0.46, 0.06, 0.4, 0.02), M.chairDark, mat4(mx, 1.38, z));
    B.add(new THREE.BoxGeometry(0.3, 0.12, 0.3), M.chairDark, mat4(mx, 1.0, z + 0.05));
    B.add(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 10), M.chairDark, mat4(mx - 0.05, 1.1, z + 0.22, PI / 2));
    B.add(new THREE.CylinderGeometry(0.04, 0.035, 0.08, 12), M.white, mat4(mx - 0.05, 1.0, z + 0.18));
    B.add(new THREE.SphereGeometry(0.02, 8, 8), M.books[0], mat4(mx + 0.12, 1.32, z + 0.19));
    // cups, kettle, jars, a shelf
    for (let k = 0; k < 4; k++) B.add(new THREE.CylinderGeometry(0.04, 0.034, 0.09, 12), M.accents[k], mat4(3.55 + k * 0.17, 0.995, z + 0.1));
    B.add(new THREE.CylinderGeometry(0.1, 0.09, 0.2, 16), M.steel, mat4(4.2, 1.05, z - 0.05));
    B.add(new THREE.BoxGeometry(1.6, 0.04, 0.26), M.deskWood, mat4(cx, 1.95, ROOM.z0 + 0.14));
    for (let k = 0; k < 5; k++) B.add(new THREE.CylinderGeometry(0.07, 0.07, 0.18 + (k % 2) * 0.06, 12), k % 2 ? M.glass : M.white, mat4(3.6 + k * 0.32, 2.07, ROOM.z0 + 0.14));
    nav.block(x0, ROOM.z0, x1, z + 0.3, 0.25);
  }

  // ---- water cooler + printer along the white wall ----
  {
    const x = -2.7, z = ROOM.z0 + 0.35;
    B.add(rbox(0.36, 1.0, 0.36, 0.03), M.white, mat4(x, 0.5, z));
    B.add(new THREE.BoxGeometry(0.3, 0.2, 0.3), M.chairDark, mat4(x, 0.1, z));
    B.add(new THREE.CylinderGeometry(0.15, 0.15, 0.42, 20), M.bottle, mat4(x, 1.22, z));
    B.add(new THREE.SphereGeometry(0.15, 20, 12), M.bottle, mat4(x, 1.43, z, 0, 0, 0, 1, 0.6, 1));
    B.add(new THREE.BoxGeometry(0.06, 0.05, 0.08), M.books[1], mat4(x - 0.08, 0.75, z + 0.2));
    B.add(new THREE.BoxGeometry(0.06, 0.05, 0.08), M.books[0], mat4(x + 0.08, 0.75, z + 0.2));
    nav.block(x - 0.2, ROOM.z0, x + 0.2, z + 0.2, 0.22);
    const px = -3.55;
    B.add(rbox(0.9, 0.75, 0.5, 0.02), M.white, mat4(px, 0.375, z));
    B.add(new THREE.BoxGeometry(0.86, 0.02, 0.46), M.chairDark, mat4(px, 0.74, z));
    B.add(rbox(0.62, 0.34, 0.46, 0.03), M.chairDark, mat4(px, 0.93, z));
    B.add(new THREE.BoxGeometry(0.4, 0.02, 0.3), M.white, mat4(px, 1.11, z + 0.08));
    B.add(new THREE.BoxGeometry(0.3, 0.04, 0.2), M.paper, mat4(px, 1.13, z + 0.25));
    nav.block(px - 0.45, ROOM.z0, px + 0.45, z + 0.25, 0.22);
  }

  // ---- lounge in the front-right corner ----
  {
    const rugM = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.6), M.rug);
    rugM.rotation.x = -PI / 2;
    rugM.position.set(3.9, 0.006, 3.0);
    rugM.receiveShadow = true;
    scene.add(rugM);
    const sx = 4.6, sz = 3.0;
    B.add(rbox(0.9, 0.3, 1.9, 0.04), M.sofaDark, mat4(sx, 0.2, sz));
    B.add(rbox(0.72, 0.16, 0.86, 0.05), M.sofa, mat4(sx - 0.06, 0.4, sz - 0.55));
    B.add(rbox(0.72, 0.16, 0.86, 0.05), M.sofa, mat4(sx - 0.06, 0.4, sz + 0.55));
    B.add(rbox(0.22, 0.7, 1.9, 0.05), M.sofa, mat4(sx + 0.36, 0.6, sz, 0, 0, 0.08));
    B.add(rbox(0.9, 0.2, 0.18, 0.04), M.sofaDark, mat4(sx, 0.55, sz - 1.0));
    B.add(rbox(0.9, 0.2, 0.18, 0.04), M.sofaDark, mat4(sx, 0.55, sz + 1.0));
    for (const [lx, lz] of [[-0.38, -0.85], [0.38, -0.85], [-0.38, 0.85], [0.38, 0.85]]) B.add(new THREE.CylinderGeometry(0.03, 0.025, 0.08, 8), M.darkWood, mat4(sx + lx, 0.04, sz + lz));
    // a cushion in the accent of the roster's first bot, for colour
    B.add(rbox(0.32, 0.32, 0.1, 0.04), M.accents[2], mat4(sx + 0.16, 0.62, sz - 0.5, 0, 0, 0, 1, 1, 1));
    nav.block(sx - 0.45, sz - 0.95, sx + 0.5, sz + 0.95, 0.22);
    // low round table + magazine + small plant
    B.add(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 32), M.darkWood, mat4(3.45, 0.4, sz));
    B.add(new THREE.CylinderGeometry(0.03, 0.03, 0.38, 10), M.metal, mat4(3.45, 0.19, sz));
    B.add(new THREE.CylinderGeometry(0.2, 0.22, 0.03, 24), M.metal, mat4(3.45, 0.015, sz));
    B.add(rbox(0.22, 0.01, 0.3, 0.003), M.books[3], mat4(3.36, 0.425, sz + 0.05, 0, 0.4, 0));
    plant(3.56, sz - 0.1, 0.3, 0.42, M.potClay, M.plant3, M.plant2);
    nav.blockCircle(3.45, sz, 0.3, 0.12);
    // floor lamp
    B.add(new THREE.CylinderGeometry(0.14, 0.16, 0.03, 20), M.metal, mat4(5.05, 0.015, 1.75));
    B.add(new THREE.CylinderGeometry(0.014, 0.014, 1.5, 8), M.metal, mat4(5.05, 0.78, 1.75));
    B.add(new THREE.CylinderGeometry(0.2, 0.24, 0.32, 24, 1, true), M.lampShade, mat4(5.05, 1.6, 1.75));
    B.add(new THREE.SphereGeometry(0.04, 10, 8), M.bulb, mat4(5.05, 1.55, 1.75));
    const fl = new THREE.PointLight("#ffe0b8", 2.2, 4.5, 2);
    fl.position.set(5.05, 1.5, 1.75);
    scene.add(fl);
    lights.push(fl);
    nav.blockCircle(5.05, 1.75, 0.16);
    plant(5.05, 4.15, 1.0, 0, M.potWhite, M.plant3, M.plant);
    nav.blockCircle(5.05, 4.15, 0.25);
  }

  // ---- paper bin + a coat stand for life ----
  B.add(new THREE.CylinderGeometry(0.14, 0.11, 0.3, 16, 1, true), M.metal, mat4(2.45, 0.15, -2.35));
  nav.blockCircle(2.45, -2.35, 0.14, 0.15);
  {
    const x = -5.05, z = -4.05;
    B.add(new THREE.CylinderGeometry(0.16, 0.18, 0.03, 16), M.chairDark, mat4(x, 0.015, z));
    B.add(new THREE.CylinderGeometry(0.014, 0.014, 1.8, 8), M.chairDark, mat4(x, 0.9, z));
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * PI * 2;
      B.add(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 6), M.chairDark, mat4(x + Math.cos(a) * 0.08, 1.75, z + Math.sin(a) * 0.08, 0.9 * Math.sin(a), 0, -0.9 * Math.cos(a)));
    }
    B.add(rbox(0.36, 0.5, 0.14, 0.05), M.teal, mat4(x + 0.1, 1.42, z + 0.05, 0, 0.4, 0));
    nav.blockCircle(x, z, 0.18, 0.15);
  }

  B.flush();

  // ---- standing spots (facing yaw) ----
  const spots = {
    coffee: [{ x: 4.7, z: -3.35, yaw: PI }, { x: 3.85, z: -3.35, yaw: PI }],
    water: [{ x: -2.7, z: -3.3, yaw: PI }],
    printer: [{ x: -3.55, z: -3.05, yaw: PI }],
    tv: [{ x: -1.5, z: -3.15, yaw: PI }, { x: -0.5, z: -3.15, yaw: PI }],
    board: [{ x: 2.0, z: -3.55, yaw: PI }, { x: 1.15, z: -3.35, yaw: PI }],
    window: [{ x: -4.7, z: -2.4, yaw: -PI / 2 }],
    lounge: [{ x: 3.95, z: 2.35, yaw: -PI / 2, sit: 0.6 }, { x: 3.95, z: 3.65, yaw: -PI / 2, sit: 0.6 }],
    game: [{ x: 2.35, z: 2.35, yaw: 0 }, { x: 2.35, z: 3.65, yaw: PI }],
  };
  for (const list of Object.values(spots))
    for (const sp of list) {
      const [x, z] = nav.nearestFree(sp.x, sp.z);
      sp.x = x;
      sp.z = z;
    }
  for (const d of desks) {
    const free = d.visit.filter((v) => nav.freeAt(v.x, v.z));
    if (free.length) d.visit = free;
    for (const v of d.visit) {
      const [x, z] = nav.nearestFree(v.x, v.z);
      v.x = x;
      v.z = z;
      v.yaw = Math.atan2(d.seat.x - x, d.seat.z - z);
    }
  }

  return { desks, spots, dynamic, lights, materials: M };
}
