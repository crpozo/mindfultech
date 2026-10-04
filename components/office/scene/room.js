// The office building, laid out like the isometric reference: a two-storey
// cut-away on a sand-coloured base, seen from the front-left corner.
//
// Ground floor — the lobby strip along the left edge: turnstiles, the
// half-round welcome desk facing them, the black wall with the logo and a
// glass wall with a door. The hall: two quiet desks behind the glass, a plant
// grid, the ping-pong table, the tall cube bookshelf and the staircase that
// climbs to the right onto the periwinkle block. The block hides a reading
// nook behind arched openings; the open workspace with two rows of desks
// sits in front of it. Under the mezzanine: "Sala Chimborazo" (round table),
// "Sala Andes", the print/lockers corner and the server room, behind glass.
//
// Upper floor — a strip along the back plus the block's roof: the lounge
// with the dark L-sofa and poufs, the green training room with rows of
// orange chairs, the orange studio with two desks face to face, a phone
// booth, and the cafeteria on the right: coffee counter, high tables, TV and
// the "Piensa diferente" sign, behind glass curtain walls.
import * as THREE from "three";
import * as F from "./furniture.js";
import * as T from "./textures.js";
import { NavGrid } from "./nav.js";
import { textsFor } from "./i18n.js";

const { PI, box, mat4 } = F;

export const BLD = { x0: -10, x1: 10, z0: -6, z1: 8.8, deckZ: -0.5, wingZ: 4.0, lobbyX: -6.6, loungeX: -5.2, blockX: 3.8, floorH: 3.3, slabT: 0.25 };
export const UPPER_Y = BLD.floorH + BLD.slabT; // 3.55
const { x0, x1, z0, z1, deckZ: D, wingZ: WZ, lobbyX: LX, loungeX: LNG, blockX: BX, floorH } = BLD;
const PART_H = 2.5; // upper-floor partitions stay below the camera's eye

/** The staircase: climbs towards +x beside the hall, from the ground at x=-1.3 onto the block's roof. */
export const STAIRS = { x0: -1.3, x1: 3.8, z0: 0.9, z1: 2.3, bottom: [-1.45, 1.6], top: [3.95, 1.6], portal0: [-2.1, 1.6], portal1: [4.55, 1.6] };

/** Camera stops for the room navigator; `under` = hide the mezzanine to look inside. */
export const ROOMS = [
  { id: "reception", name: "Recepción", floor: 0, center: [-8.2, 0, 6.2], dist: 10 },
  { id: "hall", name: "Área central", floor: 0, center: [-2.6, 0, 4.6], dist: 13 },
  { id: "open", name: "Sala abierta", floor: 0, center: [7.0, 0, 6.4], dist: 11 },
  { id: "nook", name: "Rincón de lectura", floor: 0, center: [7.0, 0, 1.7], dist: 9, under: true, polar: 0.5 },
  { id: "meeting", name: "Sala Andes", floor: 0, center: [-2.9, 0, -3.3], dist: 10, under: true, azimuth: 0.1, polar: 0.6 },
  { id: "meeting2", name: "Sala Chimborazo", floor: 0, center: [-7.6, 0, -3.3], dist: 10, under: true, azimuth: -0.3, polar: 0.6 },
  { id: "utility", name: "Impresión y casilleros", floor: 0, center: [1.6, 0, -3.3], dist: 9, under: true, azimuth: 0.1, polar: 0.6 },
  { id: "servers", name: "Servidores", floor: 0, center: [6.9, 0, -3.3], dist: 10, under: true, azimuth: 0.0, polar: 0.45 },
  { id: "lounge", name: "Lounge", floor: 1, center: [-7.6, UPPER_Y, -3.4], dist: 10 },
  { id: "training", name: "Capacitación", floor: 1, center: [-3.0, UPPER_Y, -3.5], dist: 10 },
  { id: "studio", name: "Estudio", floor: 1, center: [1.0, UPPER_Y, -3.7], dist: 8.5 },
  { id: "cafe", name: "Cafetería", floor: 1, center: [6.9, UPPER_Y, -0.6], dist: 12 },
];
export const ROOM_NAMES = { ...Object.fromEntries(ROOMS.map((r) => [r.id, r.name])), booth: "Cabina", stairs: "Escaleras" };

/** ROOMS with their names in `lang` ("es" | "en"); same ids, centers and camera stops. */
export const roomsFor = (lang) => {
  const names = textsFor(lang).rooms;
  return ROOMS.map((r) => ({ ...r, name: names[r.id] || r.name }));
};
/** ROOM_NAMES in `lang`: every room id (plus "booth" and "stairs") → display name. */
export const roomNamesFor = (lang) => ({ ...ROOM_NAMES, ...textsFor(lang).rooms });

/** True where the ground floor is covered by the mezzanine (the camera hides it to look inside). */
export const underDeck = (x, z) => z < D || (x > BX && z < WZ);

/** Which room a point is in. */
export function roomAt(x, z, y) {
  if (y > 1.6 && y < UPPER_Y - 0.05) return "stairs";
  if (y >= UPPER_Y - 0.05) return x < LNG ? "lounge" : x > BX ? "cafe" : x < -0.8 ? "training" : x > 2.5 && z < -4.6 ? "booth" : "studio";
  if (z >= D) return x < LX ? "reception" : x > BX ? (z < WZ ? "nook" : "open") : "hall";
  return x < LNG ? "meeting2" : x < -0.6 ? "meeting" : x < BX ? "utility" : "servers";
}

/**
 * @param scene THREE.Scene
 * @param bots the employees, in station order
 * @param lang "es" | "en" — the language of the wall signs and hotspot names
 * @returns everything the simulation needs: stations, spots, nav grids, hotspots…
 */
export function buildRoom(scene, bots, lang = "es") {
  const L = textsFor(lang);
  const M = F.makeMaterials(bots);
  const upper = new THREE.Group();
  scene.add(upper);
  const nav0 = new NavGrid(x0 + 0.45, z0 + 0.45, x1 - 0.45, z1 - 0.25, 0.25);
  const nav1 = new NavGrid(x0 + 0.45, z0 + 0.45, x1 - 0.45, WZ, 0.25);
  nav1.block(x0 - 1, D, BX, z1 + 1, 0.3); // the void: everything in front of the back strip except the block's roof
  const B0 = new F.Batcher(scene), B1 = new F.Batcher(upper);
  const dyn = { screens: [], tvs: [], leds: [], clock: null };
  const g = { B: B0, S: scene, M, nav: nav0, y: 0, dyn }; // ground context
  const u = { B: B1, S: upper, M, nav: nav1, y: UPPER_Y, dyn }; // upper context
  // walls live in their own groups so the HUD can lower or hide them (Sims-style);
  // W* hold the solid walls, WI* what hangs on them (signs, screens, glass panes)
  const W0 = new THREE.Group(), WI0 = new THREE.Group(), W1 = new THREE.Group(), WI1 = new THREE.Group();
  scene.add(W0, WI0);
  upper.add(W1, WI1);
  const BW0 = new F.Batcher(W0), BW1 = new F.Batcher(W1);
  const gw = { ...g, B: BW0, S: WI0 }; // ground walls context
  const uw = { ...u, B: BW1, S: WI1 }; // upper walls context
  const lights = [];
  const light = (parent, x, y, z, color = "#ffe6c8", intensity = 4, dist = 7) => {
    const l = new THREE.PointLight(color, intensity, dist, 2);
    l.position.set(x, y, z);
    parent.add(l);
    lights.push(l);
    return l;
  };
  const woodPlane = (parent, w, d, x, y, z) => {
    const mat = M.wood.clone();
    mat.map = M.wood.map.clone();
    mat.map.repeat.set(w / 2, d / 2);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    m.rotation.x = -PI / 2;
    m.position.set(x, y, z);
    m.receiveShadow = true;
    parent.add(m);
  };

  // =============================================================== shell ====
  B0.add(box(x1 - x0 + 0.6, 0.6, z1 - z0 + 0.6), M.slab, mat4(0, -0.3, (z0 + z1) / 2));
  // oak herringbone everywhere on the ground floor (the back strip and the
  // block repeat it a centimetre higher through woodPlane, same tile)
  const gfMat = M.wood.clone();
  gfMat.map = M.wood.map.clone();
  gfMat.map.repeat.set((x1 - x0) / 2, (z1 - z0) / 2);
  const groundFloor = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), gfMat);
  groundFloor.rotation.x = -PI / 2;
  groundFloor.position.set(0, 0.004, (z0 + z1) / 2);
  groundFloor.receiveShadow = true;
  scene.add(groundFloor);
  // wood under the mezzanine: back strip and the block
  woodPlane(scene, x1 - x0, D - z0, 0, 0.016, (z0 + D) / 2);
  woodPlane(scene, x1 - BX, WZ - D, (BX + x1) / 2, 0.016, (D + WZ) / 2);
  const under = new THREE.Mesh(new THREE.PlaneGeometry(34, 28), new THREE.MeshBasicMaterial({ map: T.blob(), transparent: true, depthWrite: false }));
  under.rotation.x = -PI / 2;
  under.position.set(0.8, -0.594, 1.6); // on the campus paving, a soft ambient shadow around the plinth
  scene.add(under);
  // mezzanine slabs (back strip + the block's roof) with wood on top
  const slabY = floorH + BLD.slabT / 2;
  B1.add(box(x1 - x0 + 0.3, BLD.slabT, D - z0), M.slabDark, mat4(0, slabY, (z0 + D) / 2));
  B1.add(box(x1 - BX + 0.15, BLD.slabT, WZ - D), M.slabDark, mat4((BX + x1) / 2 + 0.075, slabY, (D + WZ) / 2));
  woodPlane(upper, x1 - x0, D - z0, 0, UPPER_Y + 0.012, (z0 + D) / 2);
  woodPlane(upper, x1 - BX, WZ - D, (BX + x1) / 2, UPPER_Y + 0.012, (D + WZ) / 2);
  // ceiling light panels belong to the deck, so they vanish with it
  // the industrial ceiling under the mezzanine: black slab, dark ducts and a
  // red pipe running the length of the back strip, disc pendants over the tables
  // (they belong to the upper batch so they vanish with the deck in the ground-floor view, instead of crossing the rooms seen from above)
  const ductY = floorH - 0.3;
  B1.add(F.cyl(0.15, 0.15, BX - x0 - 0.4, 14), M.duct, mat4((x0 + BX) / 2, ductY, -4.9, 0, 0, PI / 2));
  B1.add(F.cyl(0.1, 0.1, BX - x0 - 0.4, 12), M.duct, mat4((x0 + BX) / 2, ductY + 0.04, -1.25, 0, 0, PI / 2));
  B1.add(F.cyl(0.04, 0.04, BX - x0 - 0.4, 8), M.redPipe, mat4((x0 + BX) / 2, floorH - 0.12, -2.3, 0, 0, PI / 2));
  B1.add(F.cyl(0.1, 0.1, WZ - D - 0.4, 12), M.duct, mat4(9.2, ductY, (D + WZ) / 2, PI / 2, 0, 0));
  for (const [x, z, r] of [[-7.6, -3.0, 0.4], [-2.9, -3.4, 0.4], [1.6, -3.4, 0.34], [6.9, -3.3, 0.34], [7.0, 1.65, 0.32]]) F.discPendant(g, x, 2.5, z, r, floorH - 0.02);

  // exterior walls: plaster back and left (as far as the mezzanine), navy behind the servers and the cafe sign, glass on the right
  const H2 = floorH * 2 + BLD.slabT;
  const plasterBox = (w, h, d, x, y, z) => {
    const pl = M.plaster.clone();
    pl.map = M.plaster.map.clone();
    pl.map.repeat.set(Math.max(w, d) / 2, h / 2);
    const m = new THREE.Mesh(box(w, h, d), [pl, pl, M.slab, M.slab, pl, pl]);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    W0.add(m);
  };
  plasterBox(BX - x0 + 0.25, H2, 0.25, (x0 + BX) / 2 - 0.125, H2 / 2, z0 - 0.125);
  BW0.add(box(x1 - BX + 0.25, floorH, 0.25), M.navy, mat4((BX + x1) / 2 + 0.125, floorH / 2, z0 - 0.125));
  BW1.add(box(7.2 - BX, floorH, 0.25), M.navy, mat4((BX + 7.2) / 2, UPPER_Y + floorH / 2, z0 - 0.125));
  F.glassWall(uw, 7.2, x1, z0, floorH, [], false, true);
  F.glassWall(uw, z0, WZ, x1, floorH, [], true, true);
  F.wall(gw, z0, D, x1, floorH, M.navy, true, 0.25);
  F.archWall(gw, D, WZ, x1, floorH, [{ x: 1.7, w: 1.1, h: 2.1, sill: 0.85 }], M.periwinkle, true);
  B0.add(box(0.04, 0.1, D - z0), M.darkWood, mat4(x0 + 0.02, 0.05, (z0 + D) / 2));
  B0.add(box(x1 - x0, 0.1, 0.04), M.darkWood, mat4(0, 0.05, z0 + 0.02));
  const aoMat = new THREE.MeshBasicMaterial({ map: T.aoStrip(), transparent: true, depthWrite: false });
  scene.add(new THREE.Mesh(F.quad([x1, 0.03, z0], [x0, 0.03, z0], [x0, 0.03, z0 + 0.6], [x1, 0.03, z0 + 0.6]), aoMat));
  upper.add(new THREE.Mesh(F.quad([x1, UPPER_Y + 0.03, z0], [x0, UPPER_Y + 0.03, z0], [x0, UPPER_Y + 0.03, z0 + 0.6], [x1, UPPER_Y + 0.03, z0 + 0.6]), aoMat));

  // ========================================================= ground floor ====
  const stations = [];
  const desk = (seat, bot, i, ctx = g) => {
    const visit = F.desk(ctx, seat, bot, i);
    stations.push({ seat: { ...seat, y: ctx.y }, floor: ctx === g ? 0 : 1, kind: "desk", visit, bot });
  };

  // ---- lobby strip: the black logo wall + glass line at x = LX, desk facing the turnstiles ----
  F.wall(gw, 4.4, 7.8, LX, floorH, M.slats, true, 0.15);
  F.glassWall(gw, D, 4.4, LX, floorH, [[-0.2, 0.9]], true);
  F.sign(gw, LX - 0.09, 2.62, 6.1, -PI / 2, L.signs.logo, "#1b1b1f", "#ffffff", 1.9, 0.42);
  F.clock(gw, LX - 0.09, 1.75, 4.95, -PI / 2);
  // the entrance: glazed on the street side with a door gap in front of the
  // turnstiles; the oak block desk faces it, two disc pendants above
  F.glassWall(gw, 4.0, z1, x0, floorH, [[5.9, 7.3]], true);
  F.discPendant(g, -7.9, 2.6, 5.6, 0.34, floorH);
  F.discPendant(g, -7.7, 2.75, 7.0, 0.26, floorH);
  F.receptionBlock(g, -7.9, 6.3, -PI / 2);
  stations.push({ seat: { x: -7.25, z: 6.3, yaw: -PI / 2, y: 0 }, floor: 0, kind: "stand", visit: [{ x: -7.25, z: 8.0, yaw: PI }, { x: -7.25, z: 4.7, yaw: 0 }], approach: { x: -7.2, z: 7.4 }, bot: bots[10] });
  nav0.clear(-7.25, 6.3, 0.15);
  F.planter(g, -7.9, 4.55);
  F.planter(g, -7.9, 8.05);
  for (const z of [5.0, 5.75, 6.5, 7.25, 8.0]) F.turnstile(g, -9.3, z, PI / 2);
  F.oakBench(g, -9.5, 2.3, PI / 2, 1.6);
  F.bike(g, -6.98, 1.3, 0);
  F.coatRack(g, -7.0, 3.9);
  F.plant(g, -9.4, 0.3, 0.9);
  nav0.blockCircle(-9.4, 0.3, 0.2);
  light(scene, -8.2, 2.9, 6.3, "#ffd7a6", 3.5, 7);

  // ---- hall: quiet desks behind the glass, plant grid, ping-pong, bookshelf block and the stairs ----
  desk({ x: -5.4, z: 1.6, yaw: -PI / 2 }, bots[6], 6);
  desk({ x: -5.4, z: 3.2, yaw: -PI / 2 }, bots[7], 7);
  F.plantWall(g, -5.3, 4.5, 0, 2.4);
  const pp = F.pingpong(g, -4.0, 7.0, PI / 2);
  F.pendant(g, -4.0, 2.6, 7.0, 4.6);
  light(scene, -4.0, 2.4, 7.0, "#ffd7a6", 3.5, 6.5);
  // the stairs carry the library on their side, like the reference's cube bookshelf
  F.stairs(g, STAIRS.x0, STAIRS.x1, STAIRS.z0, STAIRS.z1, UPPER_Y, 20, [STAIRS.z0]);
  F.stairShelf(g, STAIRS.x0, STAIRS.x1, STAIRS.z1, UPPER_Y);
  // two small tables for a quick chat in the hall
  for (const [tx, tz] of [[0.9, 7.0], [2.5, 4.9]]) {
    F.roundTable(g, tx, tz, 0.5, F.DESK_H, M.lightWood, 0.15);
    for (const a of [PI * 0.25, PI * 1.25]) {
      const x = tx + Math.cos(a) * 0.85, z = tz + Math.sin(a) * 0.85;
      F.simpleChair(g, x, z, Math.atan2(tx - x, tz - z), M.chairBlack);
    }
  }
  F.plant(g, -3.6, 4.5, 0.9);
  nav0.blockCircle(-3.6, 4.5, 0.2);
  F.planter(g, -1.6, 2.95);
  F.plant(g, -1.4, 8.4, 1.0);
  nav0.blockCircle(-1.4, 8.4, 0.22);

  // ---- open workspace: two rows of desks facing each other across an aisle that opens onto the hall ----
  for (let k = 0; k < 3; k++) desk({ x: 5.4 + k * 1.5, z: 5.2, yaw: PI }, bots[k], k);
  for (let k = 0; k < 3; k++) desk({ x: 5.4 + k * 1.5, z: 7.5, yaw: 0 }, bots[3 + k], 3 + k);
  for (const x of [5.6, 8.2]) {
    F.pendant(g, x, 2.5, 6.35, 4.6);
    light(scene, x, 2.3, 6.35, "#ffd7a6", 4, 6.5);
  }
  F.plant(g, 9.6, 4.4, 0.9);
  nav0.blockCircle(9.6, 4.4, 0.2);
  F.plant(g, 4.4, 8.4, 0.9);
  nav0.blockCircle(4.4, 8.4, 0.2);

  // ---- the periwinkle block: arched faces, reading nook inside ----
  F.archWall(gw, D, WZ, BX, floorH, [{ x: 0.2, w: 1.1, h: 2.1, sill: 0.85 }, { x: 3.15, w: 1.3, h: 2.3 }], M.periwinkle, true);
  F.archWall(gw, BX, x1, WZ, floorH, [{ x: 5.6, w: 1.1, h: 2.1, sill: 0.85 }, { x: 8.4, w: 1.1, h: 2.1, sill: 0.85 }], M.periwinkle);
  F.sign(gw, 7.0, 2.9, WZ + 0.09, 0, L.signs.future, "#2a2320", "#f3e6d4", 3.6, 0.62);
  F.wall(gw, BX, x1, D, floorH, M.navy);
  const rugN = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.4), M.rug);
  rugN.rotation.x = -PI / 2;
  rugN.position.set(7.0, 0.022, 1.65); // under the table foot (its top is at 0.03), above the wood (0.016)
  rugN.receiveShadow = true;
  scene.add(rugN);
  F.sofa(g, 7.4, 0.6, -PI / 2 + 0.45, 0.95, M.chairOrange, M.chairOrangeDark);
  F.sofa(g, 7.4, 2.7, -PI / 2 - 0.45, 0.95, M.chairOrange, M.chairOrangeDark);
  F.roundTable(g, 6.4, 1.65, 0.35, 0.45, M.darkWood, 0.2);
  F.floorLamp(g, 9.4, 0.0);
  F.plant(g, 9.3, 3.4, 0.9);
  nav0.blockCircle(9.3, 3.4, 0.2);
  F.picture(gw, 8.6, 2.0, D + 0.09, 0, 1);
  light(scene, 7.0, 2.7, 1.7, "#ffd7a6", 3.5, 6);

  // ---- under the mezzanine ----
  F.glassWall(gw, x0, BX, D, floorH, [[-8.1, -7.0], [-2.5, -1.2], [1.9, 3.0]]);
  F.wall(gw, z0, D, LNG, floorH, M.wallWhite, true);
  F.wall(gw, z0, D, -0.6, floorH, M.green, true);
  F.wall(gw, z0, -2.2, BX, floorH, M.navy, true);
  F.wall(gw, -0.6, D, BX, floorH, M.navy, true);
  for (const [a0, a1, mat] of [[x0, LNG, M.wallWhite], [LNG, -0.6, M.green], [-0.6, BX, M.orange]]) F.texturedBox(gw, box(a1 - a0, floorH, 0.05), mat, mat4((a0 + a1) / 2, floorH / 2, z0 + 0.03), a1 - a0, floorH);
  // Sala Chimborazo
  F.roundTable(g, -7.6, -3.0, 0.85, F.DESK_H, M.lightWood, 0.15);
  const meet2Seats = [];
  for (const a of [PI / 4, (3 * PI) / 4, (5 * PI) / 4, (7 * PI) / 4]) {
    const x = -7.6 + Math.cos(a) * 1.25, z = -3.0 + Math.sin(a) * 1.25;
    const yaw = Math.atan2(-7.6 - x, -3.0 - z);
    F.simpleChair(g, x, z, yaw, M.chairBlack);
    meet2Seats.push({ x: x + Math.sin(yaw) * 0.28, z: z + Math.cos(yaw) * 0.28, yaw, sit: 0.27 });
  }
  F.tv(gw, -7.6, 2.0, z0 + 0.09, 0, 1.5, 0.86);
  F.sign(gw, LNG - 0.09, 2.6, -3.0, -PI / 2, L.signs.chimborazo, "#1b1b1f", "#ffffff", 1.4, 0.7);
  F.picture(gw, LNG - 0.09, 2.1, -4.4, -PI / 2, 1);
  F.picture(gw, LNG - 0.09, 2.1, -5.0, -PI / 2, 2);
  F.floorLamp(g, -9.5, -1.0);
  F.plant(g, -5.7, -5.4, 0.9);
  nav0.blockCircle(-5.7, -5.4, 0.2);
  light(scene, -7.6, 3.05, -3.0, "#fff1dc", 5, 7);
  // Sala Andes
  F.table(g, -2.9, -3.4, 2.8, 1.1, 0, F.DESK_H, M.darkTable, 0.15);
  const meetSeats = [];
  for (const x of [-3.8, -2.9, -2.0]) {
    F.simpleChair(g, x, -2.55, PI, M.chairOrange);
    meetSeats.push({ x, z: -2.55 - 0.28, yaw: PI, sit: 0.27 });
    F.simpleChair(g, x, -4.25, 0, M.chairOrange);
    meetSeats.push({ x, z: -4.25 + 0.28, yaw: 0, sit: 0.27 });
  }
  F.tv(gw, -2.9, 2.0, z0 + 0.09, 0, 1.6, 0.9);
  F.whiteboard(gw, LNG + 0.09, 1.75, -3.4, PI / 2, 2.0, 1.3);
  F.sign(gw, -4.6, 2.6, z0 + 0.12, 0, L.signs.andes, "#c9a06a", "#2a2320", 1.3, 0.45);
  F.plant(g, -1.0, -5.4, 0.9);
  nav0.blockCircle(-1.0, -5.4, 0.2);
  light(scene, -2.9, 3.05, -3.2, "#fff1dc", 5, 7);
  // print / lockers corner
  F.lockers(g, 0.6, z0 + 0.3, 0, 5);
  F.printer(g, 2.9, z0 + 0.4, 0);
  F.waterCooler(g, -0.1, -2.0);
  F.plant(g, 1.6, -1.1, 0.9);
  nav0.blockCircle(1.6, -1.1, 0.2);
  light(scene, 1.6, 3.05, -3.2, "#fff1dc", 4.5, 7);
  // server room
  for (const x of [5.0, 5.9, 6.8, 7.7, 8.6]) F.serverRack(g, x, z0 + 0.6);
  F.sign(gw, 6.9, 2.6, z0 + 0.12, 0, L.signs.servers, "#1e2a44", "#7cc0ff", 1.6, 0.5);
  light(scene, 6.9, 3.05, -3.2, "#9fc4ff", 4, 7);

  // ========================================================== upper floor ====
  F.railingBars(u, x0, BX, D);
  F.railingBars(u, D, WZ, BX, true, [[STAIRS.z0, STAIRS.z1]]);
  F.railingBars(u, BX, x1, WZ);
  F.wall(uw, z0, -1.8, LNG, PART_H, M.slats, true);
  F.wall(uw, z0, -1.8, -0.8, PART_H, M.green, true);
  F.wall(uw, z0, -1.8, BX, PART_H, M.orange, true);
  for (const [a0, a1, mat] of [[x0, LNG, M.slats], [LNG, -0.8, M.green], [-0.8, BX, M.orange]]) F.texturedBox(uw, box(a1 - a0, floorH, 0.05), mat, mat4((a0 + a1) / 2, UPPER_Y + floorH / 2, z0 + 0.03), a1 - a0, floorH);
  B1.add(box(0.1, 0.1, STAIRS.z1 - STAIRS.z0 + 0.1), M.lightWood, mat4(BX + 0.03, UPPER_Y - 0.05, 1.6));
  // lounge
  F.sofa(u, -7.6, z0 + 0.55, 0, 2.7, M.sofaBlack, M.sofaBlackDark);
  F.sofa(u, x0 + 0.55, -3.4, PI / 2, 2.0, M.sofaBlack, M.sofaBlackDark);
  F.coffeeTable(u, -7.8, -3.9);
  F.pouf(u, -6.2, -3.9);
  F.pouf(u, -6.2, -2.6);
  const rugM = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.4), M.rug);
  rugM.rotation.x = -PI / 2;
  rugM.position.set(-7.7, UPPER_Y + 0.022, -3.9);
  rugM.receiveShadow = true;
  upper.add(rugM);
  F.floorLamp(u, -9.5, -1.2);
  F.plant(u, -5.6, -5.5, 0.8);
  nav1.blockCircle(-5.6, -5.5, 0.18);
  F.sign(uw, LNG - 0.09, 2.1, -4.0, -PI / 2, L.signs.doNow, "#a8322c", "#fbf4ea", 1.1, 0.9);
  F.sign(uw, -7.5, 2.35, z0 + 0.12, 0, L.signs.calm, "#a8322c", "#fbf4ea", 2.4, 0.9);
  // training room
  F.whiteboard(uw, LNG + 0.1, 1.7, -3.6, PI / 2, 2.2, 1.35);
  const trainSeats = [];
  for (const x of [-3.5, -2.5, -1.5])
    for (const z of [-5.3, -4.3, -3.3, -2.3]) {
      F.simpleChair(u, x, z, -PI / 2, M.chairOrange);
      trainSeats.push({ x: x - 0.28, z, yaw: -PI / 2, sit: 0.27 });
    }
  F.floorLamp(u, -4.6, -5.5);
  F.plant(u, -1.2, -5.5, 0.9);
  nav1.blockCircle(-1.2, -5.5, 0.2);
  F.sign(uw, -2.5, 2.35, z0 + 0.12, 0, L.signs.everyDay, "#c9a06a", "#2a2320", 1.8, 0.8);
  // studio: two desks face to face
  desk({ x: -0.15, z: -3.9, yaw: PI / 2 }, bots[8], 8, u);
  desk({ x: 1.85, z: -3.9, yaw: -PI / 2 }, bots[9], 9, u);
  stations[stations.length - 2].approach = { x: -0.15, z: -1.2 };
  stations[stations.length - 1].approach = { x: 1.85, z: -1.2 };
  // third studio desk, in line with the first: procurement (bots[11])
  desk({ x: -0.15, z: -2.4, yaw: PI / 2 }, bots[11], 11, u);
  stations[stations.length - 1].approach = { x: -0.15, z: -1.2 };
  F.stickyWall(uw, 1.0, 1.7, z0 + 0.09, 0, 2.2, 1.4);
  F.plant(u, 0.3, -5.5, 0.8);
  nav1.blockCircle(0.3, -5.5, 0.18);
  // phone booth: a black glass-fronted cabin in the studio's back corner
  F.booth(u, 3.1, -5.25, M.beam);
  // cafeteria: the screen alone, centred on the wall panel between the phone
  // booth sign (ends at x≈3.6) and the counter (starts at x≈6.6)
  F.tv(uw, 5.15, 1.85, z0 + 0.14, 0, 1.6, 0.9);
  const bar = F.cafeCounter(u, 8.0, -4.6, 0, 2.8);
  F.tilePanel(u, 8.0, 1.6, -5.0, 0, 2.9, 1.3);
  for (const x of [7.2, 8.0, 8.8]) F.conePendant(u, x, 2.0, -4.6, floorH);
  F.discPendant(u, 7.0, 2.1, -1.9, 0.5, floorH);
  F.discPendant(u, 8.6, 2.2, 1.4, 0.4, floorH);
  F.discPendant(u, 6.0, 2.3, 2.8, 0.4, floorH);
  F.discPendant(u, -7.6, 2.25, -3.6, 0.52, floorH);
  F.discPendant(u, -2.5, 2.3, -3.8, 0.45, floorH);
  F.discPendant(u, 0.85, 2.35, -3.2, 0.42, floorH);
  for (const [x, z] of [[5.4, -2.2], [8.6, -1.6], [8.6, 1.4], [6.0, 2.8]]) F.highTable(u, x, z, 0.4);
  for (const [x, z] of [[5.4, -2.95], [5.4, -1.45], [9.35, -1.6], [8.6, -2.35], [9.35, 1.4], [8.6, 2.15], [6.0, 3.55], [5.25, 2.8], [6.75, 2.8]]) F.stool(u, x, z);
  F.planter(u, 4.4, 3.55);
  F.plant(u, 9.5, -5.5, 0.9);
  nav1.blockCircle(9.5, -5.5, 0.2);
  F.plant(u, 9.5, 3.5, 0.8);
  nav1.blockCircle(9.5, 3.5, 0.18);
  light(upper, 6.6, UPPER_Y + 2.4, -2.4, "#ffe6c8", 4, 8);
  light(upper, 7.0, UPPER_Y + 2.4, 1.8, "#ffe6c8", 3, 7);
  light(upper, -2.9, UPPER_Y + 2.4, -3.6, "#ffe6c8", 3, 7);
  light(upper, -7.6, UPPER_Y + 2.4, -3.2, "#ffe6c8", 3, 7);

  B0.flush();
  B1.flush();
  BW0.flush();
  BW1.flush();
  stations.sort((a, b) => bots.indexOf(a.bot) - bots.indexOf(b.bot));
  // seal every pocket of free cells that cannot be reached from the stairs, so spots and
  // approach points always land on connected floor and nobody walks through furniture
  nav0.sealPockets(STAIRS.portal0[0], STAIRS.portal0[1]);
  nav1.sealPockets(STAIRS.portal1[0], STAIRS.portal1[1]);

  // ============================================================ spots ====
  const toward = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
  const spots = {
    coffee: [{ x: bar.machine[0], z: bar.machine[1], yaw: PI, floor: 1 }, { x: bar.machine[0] + 0.85, z: bar.machine[1], yaw: PI, floor: 1 }],
    kitchen: [
      { x: 4.6, z: -2.2, yaw: toward(4.6, -2.2, 5.4, -2.2), floor: 1 },
      { x: 6.2, z: -2.2, yaw: toward(6.2, -2.2, 5.4, -2.2), floor: 1 },
      { x: 7.8, z: 1.4, yaw: toward(7.8, 1.4, 8.6, 1.4), floor: 1 },
      { x: 8.6, z: 0.6, yaw: toward(8.6, 0.6, 8.6, 1.4), floor: 1 },
    ],
    tv: [{ x: 5.3, z: -4.3, yaw: PI, floor: 1 }, { x: 6.05, z: -4.3, yaw: PI, floor: 1 }],
    meeting: meetSeats.map((s) => ({ ...s, floor: 0 })),
    meeting2: meet2Seats.map((s) => ({ ...s, floor: 0 })),
    booth: [{ x: 3.1, z: -5.2, yaw: PI, floor: 1 }],
    printer: [{ x: 2.9, z: z0 + 1.1, yaw: PI, floor: 0 }],
    water: [{ x: -0.1, z: -1.35, yaw: PI, floor: 0 }],
    servers: [{ x: 6.9, z: z0 + 1.6, yaw: PI, floor: 0 }],
    pingpong: [{ x: pp.ends[0][0], z: pp.ends[0][1], yaw: PI / 2, floor: 0 }, { x: pp.ends[1][0], z: pp.ends[1][1], yaw: -PI / 2, floor: 0 }],
    lounge: [
      ...[-8.5, -7.6, -6.7].map((x) => ({ x, z: z0 + 0.55 + 0.6, yaw: 0, sit: 0.6, floor: 1 })),
      ...[-3.9, -2.9].map((z) => ({ x: x0 + 0.55 + 0.6, z, yaw: PI / 2, sit: 0.6, floor: 1 })),
    ],
    beanbag: [{ x: -6.75, z: -3.9, yaw: -PI / 2, sit: 0.55, low: true, floor: 1 }, { x: -6.75, z: -2.6, yaw: -PI / 2, sit: 0.55, low: true, floor: 1 }],
    nook: [
      { x: 7.4 + Math.sin(-PI / 2 + 0.45) * 0.6, z: 0.6 + Math.cos(-PI / 2 + 0.45) * 0.6, yaw: -PI / 2 + 0.45, sit: 0.6, floor: 0 },
      { x: 7.4 + Math.sin(-PI / 2 - 0.45) * 0.6, z: 2.7 + Math.cos(-PI / 2 - 0.45) * 0.6, yaw: -PI / 2 - 0.45, sit: 0.6, floor: 0 },
    ],
    trainer: [{ x: -4.35, z: -3.6, yaw: -PI / 2, floor: 1 }],
    trainee: trainSeats.map((s) => ({ ...s, floor: 1 })),
  };
  const navOf = (fl) => (fl ? nav1 : nav0);
  // standing spots snap to a free cell; seats keep their exact place (the route
  // ends with a short approach into the chair)
  for (const list of Object.values(spots))
    for (const sp of list) {
      if (sp.sit) continue;
      const [x, z] = navOf(sp.floor).nearestFree(sp.x, sp.z);
      sp.x = x;
      sp.z = z;
    }
  for (const st of stations) {
    const nav = navOf(st.floor);
    const free = st.visit.filter((v) => nav.freeAt(v.x, v.z));
    if (free.length) st.visit = free;
    for (const v of st.visit) {
      const [x, z] = nav.nearestFree(v.x, v.z);
      v.x = x;
      v.z = z;
      v.yaw = Math.atan2(st.seat.x - x, st.seat.z - z);
      v.floor = st.floor;
    }
  }
  // people enter and leave a seat from behind the chair, never across the desk or table
  for (const st of stations) {
    const nav = navOf(st.floor);
    const [ax, az] = st.approach ? nav.nearestFree(st.approach.x, st.approach.z) : nav.approachFor(st.seat.x, st.seat.z, st.seat.yaw);
    st.approach = { x: ax, z: az };
  }
  for (const list of Object.values(spots))
    for (const sp of list) {
      if (!sp.sit) continue;
      const f = F.fwd(sp.yaw);
      // chairs are entered from behind; sofas, armchairs and poufs from the front
      const fromFront = sp.low || sp.sit >= 0.5;
      const [ax, az] = fromFront
        ? navOf(sp.floor).approachFor(sp.x + f.x * 0.2, sp.z + f.z * 0.2, sp.yaw + PI)
        : navOf(sp.floor).approachFor(sp.x - f.x * 0.1, sp.z - f.z * 0.1, sp.yaw);
      sp.approach = { x: ax, z: az };
    }

  // ========================================================= hotspots ====
  // names come from the language dictionary (i18n.js → hotspots)
  const H = L.hotspots;
  const hotspots = [
    { id: "board", name: H.board, icon: "📋", x: LNG + 0.1, y: UPPER_Y + 1.7, z: -3.6, w: 0.3, h: 1.4, d: 2.3, floor: 1 },
    { id: "tv", name: H.tv, icon: "📺", x: 5.15, y: UPPER_Y + 1.85, z: z0 + 0.14, w: 1.7, h: 1.0, d: 0.3, floor: 1 },
    { id: "coffee", name: H.coffee, icon: "☕", x: bar.machine[0], y: UPPER_Y + 1.25, z: -4.62, w: 0.6, h: 0.7, d: 0.6, floor: 1 },
    { id: "shelf", name: H.shelf, icon: "📚", x: 1.5, y: 1.4, z: STAIRS.z1 + 0.22, w: 4.4, h: 2.8, d: 0.44, floor: 0 },
    { id: "clock", name: H.clock, icon: "🕒", x: LX - 0.1, y: 1.75, z: 4.95, w: 0.3, h: 0.5, d: 0.5, floor: 0 },
    { id: "servers", name: H.servers, icon: "🖥️", x: 6.8, y: 1.0, z: z0 + 0.6, w: 4.2, h: 2.0, d: 0.9, floor: 0 },
    { id: "pingpong", name: H.pingpong, icon: "🏓", x: -4.0, y: 0.6, z: 7.0, w: 2.8, h: 0.5, d: 1.6, floor: 0 },
    { id: "reception", name: H.reception, icon: "🛎️", x: -8.4, y: 0.6, z: 6.3, w: 1.4, h: 1.1, d: 2.6, floor: 0 },
    { id: "meeting", name: H.meeting, icon: "📅", x: -2.9, y: 0.5, z: -3.4, w: 2.8, h: 0.8, d: 1.1, floor: 0 },
    { id: "lounge", name: H.lounge, icon: "📊", x: -7.6, y: UPPER_Y + 0.4, z: z0 + 0.55, w: 2.7, h: 0.9, d: 1.0, floor: 1 },
  ];

  return { stations, spots, hotspots, nav0, nav1, upper, dyn, lights, pingpong: pp, materials: M, walls: { W0, W1, WI0, WI1 } };
}
