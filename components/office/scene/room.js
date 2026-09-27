// The office building: a two-storey cut-away like the reference. Ground floor —
// reception with turnstiles, an open workspace with two four-desk pods, a
// ping-pong table, lockers and a plant wall; under the upper deck a kitchen,
// the "Sala Andes" meeting room, phone booths with printer and water cooler,
// and a server room, all behind black-framed glass. Upper floor (over the back
// half) — lounge, training room, the round "Sala Chimborazo" and a lab with
// standing desks. A staircase links the floors; the right facade is glass.
import * as THREE from "three";
import * as F from "./furniture.js";
import * as T from "./textures.js";
import { NavGrid } from "./nav.js";

const { PI, box, mat4 } = F;

export const BLD = { x0: -9, x1: 9, z0: -6, z1: 6, deckZ: 0.3, floorH: 3.3, slabT: 0.25 };
export const UPPER_Y = BLD.floorH + BLD.slabT; // 3.55

/** The staircase: bottom at x0 on the ground, top at x1 on the deck. */
export const STAIRS = { x0: -2.7, x1: -7.0, z0: 0.35, z1: 1.55, mid: 0.95, portal0: [-2.0, 0.95], portal1: [-7.0, -0.35] };

/** Camera stops for the room navigator. */
export const ROOMS = [
  { id: "reception", name: "Recepción", floor: 0, center: [-6.0, 0, 3.5], dist: 11 },
  { id: "open", name: "Sala abierta", floor: 0, center: [1.0, 0, 3.4], dist: 12.5 },
  { id: "kitchen", name: "Cafetería", floor: 0, center: [-6.5, 0, -2.9], dist: 10 },
  { id: "meeting", name: "Sala Andes", floor: 0, center: [-1.5, 0, -2.9], dist: 10 },
  { id: "booths", name: "Cabinas", floor: 0, center: [3.0, 0, -2.9], dist: 9.5 },
  { id: "servers", name: "Servidores", floor: 0, center: [7.0, 0, -2.9], dist: 9.5 },
  { id: "lounge", name: "Lounge", floor: 1, center: [-6.2, UPPER_Y, -2.9], dist: 10 },
  { id: "training", name: "Capacitación", floor: 1, center: [-1.0, UPPER_Y, -2.9], dist: 10 },
  { id: "meeting2", name: "Sala Chimborazo", floor: 1, center: [3.5, UPPER_Y, -2.9], dist: 9.5 },
  { id: "lab", name: "Laboratorio", floor: 1, center: [7.2, UPPER_Y, -2.9], dist: 9.5 },
];

/**
 * @param scene THREE.Scene
 * @param bots the employees, in station order
 * @returns everything the simulation needs: stations, spots, nav grids, hotspots…
 */
export function buildRoom(scene, bots) {
  const M = F.makeMaterials(bots);
  const upper = new THREE.Group();
  scene.add(upper);
  const nav0 = new NavGrid(BLD.x0 + 0.45, BLD.z0 + 0.45, BLD.x1 - 0.45, BLD.z1 - 0.25, 0.25);
  const nav1 = new NavGrid(BLD.x0 + 0.45, BLD.z0 + 0.45, BLD.x1 - 0.45, 0.0, 0.25);
  const B0 = new F.Batcher(scene), B1 = new F.Batcher(upper);
  const dyn = { screens: [], tvs: [], leds: [], clock: null };
  const g = { B: B0, S: scene, M, nav: nav0, y: 0, dyn }; // ground context
  const u = { B: B1, S: upper, M, nav: nav1, y: UPPER_Y, dyn }; // upper context
  const lights = [];
  const light = (parent, x, y, z, color = "#ffe6c8", intensity = 4, dist = 7) => {
    const l = new THREE.PointLight(color, intensity, dist, 2);
    l.position.set(x, y, z);
    parent.add(l);
    lights.push(l);
    return l;
  };

  // =============================================================== shell ====
  B0.add(box(BLD.x1 - BLD.x0 + 0.6, 0.6, BLD.z1 - BLD.z0 + 0.6), M.slab, mat4(0, -0.3, 0));
  const groundFloor = new THREE.Mesh(new THREE.PlaneGeometry(BLD.x1 - BLD.x0, BLD.z1 - BLD.z0), M.concrete);
  M.concrete.map.repeat.set(9, 6);
  groundFloor.rotation.x = -PI / 2;
  groundFloor.position.y = 0.002;
  groundFloor.receiveShadow = true;
  scene.add(groundFloor);
  const backWood = new THREE.Mesh(new THREE.PlaneGeometry(BLD.x1 - BLD.x0, BLD.deckZ - BLD.z0), M.wood);
  M.wood.map.repeat.set(9, 3.15);
  backWood.rotation.x = -PI / 2;
  backWood.position.set(0, 0.004, (BLD.z0 + BLD.deckZ) / 2);
  backWood.receiveShadow = true;
  scene.add(backWood);
  const under = new THREE.Mesh(new THREE.PlaneGeometry(30, 24), new THREE.MeshBasicMaterial({ map: T.blob(), transparent: true, depthWrite: false }));
  under.rotation.x = -PI / 2;
  under.position.set(0.8, -0.75, 0.8);
  scene.add(under);
  // upper deck slab (the back rooms' ceiling) + its wood floor
  const deckD = BLD.deckZ - BLD.z0;
  B1.add(box(BLD.x1 - BLD.x0 + 0.3, BLD.slabT, deckD), M.slab, mat4(0, BLD.floorH + BLD.slabT / 2, (BLD.z0 + BLD.deckZ) / 2));
  const upWood = new THREE.Mesh(new THREE.PlaneGeometry(BLD.x1 - BLD.x0, deckD), M.wood.clone());
  upWood.material.map = M.wood.map.clone();
  upWood.material.map.repeat.set(9, 3.15);
  upWood.rotation.x = -PI / 2;
  upWood.position.set(0, UPPER_Y + 0.003, (BLD.z0 + BLD.deckZ) / 2);
  upWood.receiveShadow = true;
  upper.add(upWood);
  // ceiling light panels belong to the deck, so they vanish with it
  for (const [x, z] of [[-6.5, -2.9], [-6.5, -4.6], [-1.5, -2.9], [-1.5, -4.6], [3.0, -2.9], [3.0, -4.6], [7.0, -2.9], [7.0, -4.6]]) F.ceilingPanel({ ...u, y: 0 }, x, BLD.floorH - 0.03, z);

  // exterior walls: back and left plaster, right a glass facade
  const H2 = BLD.floorH * 2 + BLD.slabT;
  const plasterBox = (w, h, d, x, y, z) => {
    const pl = M.plaster.clone();
    pl.map = M.plaster.map.clone();
    pl.map.repeat.set(Math.max(w, d) / 2, h / 2);
    const m = new THREE.Mesh(box(w, h, d), [pl, pl, M.slab, M.slab, pl, pl]);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
  };
  plasterBox(BLD.x1 - BLD.x0 + 0.5, H2, 0.25, 0, H2 / 2, BLD.z0 - 0.125);
  plasterBox(0.25, H2, BLD.deckZ - BLD.z0 + 0.25, BLD.x0 - 0.125, H2 / 2, (BLD.z0 + BLD.deckZ) / 2 - 0.125);
  plasterBox(0.25, BLD.floorH, BLD.z1 - BLD.deckZ, BLD.x0 - 0.125, BLD.floorH / 2, (BLD.deckZ + BLD.z1) / 2);
  F.glassWall(g, BLD.z0, BLD.deckZ, BLD.x1, H2, [], true);
  F.glassWall(g, BLD.deckZ, BLD.z1, BLD.x1, BLD.floorH, [], true);
  const outside = new THREE.Mesh(new THREE.PlaneGeometry(14, 8.5), new THREE.MeshBasicMaterial({ map: T.outside() }));
  outside.rotation.y = -PI / 2;
  outside.position.set(BLD.x1 + 0.7, 3.6, 0);
  scene.add(outside);
  B0.add(box(0.04, 0.1, BLD.z1 - BLD.z0), M.darkWood, mat4(BLD.x0 + 0.02, 0.05, 0));
  B0.add(box(BLD.x1 - BLD.x0, 0.1, 0.04), M.darkWood, mat4(0, 0.05, BLD.z0 + 0.02));
  const aoMat = new THREE.MeshBasicMaterial({ map: T.aoStrip(), transparent: true, depthWrite: false });
  scene.add(new THREE.Mesh(F.quad([BLD.x0, 0.006, BLD.z0], [BLD.x0, 0.006, BLD.z1], [BLD.x0 + 0.6, 0.006, BLD.z1], [BLD.x0 + 0.6, 0.006, BLD.z0]), aoMat));
  scene.add(new THREE.Mesh(F.quad([BLD.x1, 0.006, BLD.z0], [BLD.x0, 0.006, BLD.z0], [BLD.x0, 0.006, BLD.z0 + 0.6], [BLD.x1, 0.006, BLD.z0 + 0.6]), aoMat));
  upper.add(new THREE.Mesh(F.quad([BLD.x1, UPPER_Y + 0.006, BLD.z0], [BLD.x0, UPPER_Y + 0.006, BLD.z0], [BLD.x0, UPPER_Y + 0.006, BLD.z0 + 0.6], [BLD.x1, UPPER_Y + 0.006, BLD.z0 + 0.6]), aoMat));

  // ground back rooms: coloured partitions + glass fronts with doors
  F.wall(g, BLD.z0, BLD.deckZ, -4.0, BLD.floorH, M.green, true);
  F.wall(g, BLD.z0, BLD.deckZ, 1.0, BLD.floorH, M.orange, true);
  F.wall(g, BLD.z0, BLD.deckZ, 5.0, BLD.floorH, M.navy, true);
  F.glassWall(g, BLD.x0, BLD.x1, BLD.deckZ, BLD.floorH, [[-5.6, -4.6], [-2.0, -1.0], [2.5, 3.5], [6.5, 7.5]]);
  for (const [x0, x1, mat] of [[-4.0, 1.0, M.green], [1.0, 5.0, M.orange], [5.0, BLD.x1, M.navy]]) B0.add(box(x1 - x0, BLD.floorH, 0.05), mat, mat4((x0 + x1) / 2, BLD.floorH / 2, BLD.z0 + 0.03));
  // upper rooms: partitions + railing
  F.wall(u, BLD.z0, -1.1, -3.5, BLD.floorH, M.navy, true);
  F.wall(u, BLD.z0, -1.1, 1.5, BLD.floorH, M.green, true);
  F.wall(u, BLD.z0, -1.1, 5.5, BLD.floorH, M.orange, true);
  F.railing(u, BLD.x0, BLD.x1, BLD.deckZ, [-7.6, -6.4]);
  for (const [x0, x1, mat] of [[BLD.x0, -3.5, M.navy], [-3.5, 1.5, M.green], [1.5, 5.5, M.orange], [5.5, BLD.x1, M.purple]]) B1.add(box(x1 - x0, BLD.floorH, 0.05), mat, mat4((x0 + x1) / 2, UPPER_Y + BLD.floorH / 2, BLD.z0 + 0.03));
  F.stairs(g, STAIRS.x0, STAIRS.x1, STAIRS.z0, STAIRS.z1, UPPER_Y, 20);
  B1.add(box(0.9, 0.1, 0.1), M.lightWood, mat4(-7.0, UPPER_Y - 0.05, BLD.deckZ + 0.02));

  // ========================================================= ground floor ====
  const stations = [];
  const desk = (seat, bot, i, ctx = g, standing = false) => {
    const visit = standing ? F.standingDesk(ctx, seat, bot, i) : F.desk(ctx, seat, bot, i);
    stations.push({ seat: { ...seat, y: ctx.y }, floor: ctx === g ? 0 : 1, kind: standing ? "stand" : "desk", visit, bot });
  };
  const pod = (cx, cz, firstIdx) => {
    const seats = [
      { x: cx - 1.25, z: cz + 0.45, yaw: PI / 2 }, // west, faces +x
      { x: cx - 0.45, z: cz - 1.25, yaw: 0 }, // north, faces +z
      { x: cx + 0.45, z: cz + 1.25, yaw: PI }, // south, faces -z
      { x: cx + 1.25, z: cz - 0.45, yaw: -PI / 2 }, // east, faces -x
    ];
    seats.forEach((s, k) => desk(s, bots[firstIdx + k], firstIdx + k));
    F.pendant(g, cx, 2.5, cz, 4.2);
    light(scene, cx, 2.3, cz, "#ffd7a6", 4, 6.5);
  };
  pod(-1.4, 3.5, 0);
  pod(3.2, 3.5, 4);
  desk({ x: 6.5, z: -2.65, yaw: 0 }, bots[8], 8, u, true);
  desk({ x: 8.0, z: -2.65, yaw: 0 }, bots[9], 9, u, true);
  F.reception(g, -6.3, 5.05);
  stations.push({ seat: { x: -6.3, z: 4.35, yaw: 0, y: 0 }, floor: 0, kind: "stand", visit: [{ x: -4.6, z: 4.6, yaw: -PI / 2 }, { x: -6.3, z: 5.95, yaw: PI }], bot: bots[10] });
  nav0.clear(-6.3, 4.35, 0.15);
  // reception area
  F.turnstile(g, -8.3, 5.5);
  F.turnstile(g, -7.55, 5.5);
  F.bench(g, -5.0, 2.7, 0, 1.6);
  F.plant(g, -4.0, 2.7, 1.0);
  nav0.blockCircle(-4.0, 2.7, 0.2);
  F.bookshelfBig(g, 1.9, 4.5, BLD.x0 + 0.22, 2.8, 5, 0.4, "z");
  F.tv(g, BLD.x0 + 0.16, 2.2, 5.2, PI / 2, 1.4, 0.8);
  F.clock(g, BLD.x0 + 0.16, 3.05, 3.2, PI / 2);
  // open space extras
  const pp = F.pingpong(g, 6.4, 3.6, 0);
  F.lockers(g, BLD.x1 - 0.35, 1.2, -PI / 2, 5);
  F.plantWall(g, BLD.x1 - 0.3, 4.2, -PI / 2, 2.4);
  F.sign(g, 4.6, 2.5, BLD.deckZ + 0.12, 0, ["JUNTOS ES", "EL CAMINO"], "#3d4a7a", "#ffffff", 2.2, 0.9);
  F.plant(g, 1.0, 1.2, 0.9);
  nav0.blockCircle(1.0, 1.2, 0.2);
  F.plant(g, 8.4, 5.4, 1.0);
  nav0.blockCircle(8.4, 5.4, 0.22);
  B0.add(F.cyl(0.14, 0.11, 0.3, 16, true), M.metal, mat4(0.4, 0.15, 5.4));
  nav0.blockCircle(0.4, 5.4, 0.14, 0.15);

  // kitchen
  const bar = F.coffeeBar(g, -8.7, -5.2, BLD.z0 + 0.35);
  F.fridge(g, -4.55, BLD.z0 + 0.45);
  F.highTable(g, -7.0, -2.6, 0.45);
  for (const a of [0.4, 2.5, 4.6]) F.stool(g, -7.0 + Math.cos(a) * 0.85, -2.6 + Math.sin(a) * 0.85);
  F.plant(g, -8.5, -0.4, 0.9);
  nav0.blockCircle(-8.5, -0.4, 0.2);
  F.picture(g, BLD.x0 + 0.16, 2.1, -1.6, PI / 2, 1);
  F.picture(g, BLD.x0 + 0.16, 2.1, -1.0, PI / 2, 2);
  light(scene, -6.5, 3.05, -2.9, "#fff1dc", 5, 7);
  // Sala Andes
  F.table(g, -1.5, -3.0, 2.8, 1.1, 0, F.DESK_H, M.lightWood, 0.15);
  const meetSeats = [];
  for (const x of [-2.4, -1.5, -0.6]) {
    F.simpleChair(g, x, -2.15, PI, M.chairOrange);
    meetSeats.push({ x, z: -2.15 - 0.28, yaw: PI, sit: 0.27 });
    F.simpleChair(g, x, -3.85, 0, M.chairOrange);
    meetSeats.push({ x, z: -3.85 + 0.28, yaw: 0, sit: 0.27 });
  }
  F.tv(g, -1.5, 2.0, BLD.z0 + 0.09, 0, 1.6, 0.9);
  F.plant(g, 0.5, -5.4, 0.9);
  nav0.blockCircle(0.5, -5.4, 0.2);
  light(scene, -1.5, 3.05, -2.9, "#fff1dc", 5, 7);
  // booths + printer + water
  for (const x of [1.8, 3.0, 4.2]) F.booth(g, x, -5.2);
  F.sign(g, 3.0, 2.85, BLD.z0 + 0.12, 0, ["HAZLO AHORA"], "#e08a5c", "#ffffff", 1.6, 0.5);
  F.printer(g, 4.4, -1.4, 0);
  F.waterCooler(g, 1.6, -1.4);
  light(scene, 3.0, 3.05, -2.9, "#fff1dc", 4.5, 7);
  // server room
  for (const x of [5.8, 6.7, 7.6, 8.5]) F.serverRack(g, x, -5.4);
  F.sign(g, 7.0, 2.6, BLD.z0 + 0.12, 0, ["SERVIDORES"], "#1e2a44", "#7cc0ff", 1.6, 0.5);
  light(scene, 7.0, 3.05, -2.9, "#9fc4ff", 4, 7);

  // ========================================================== upper floor ====
  F.sofa(u, -8.25, -3.8, PI / 2, 2.7, M.sofaBlack, M.sofaBlackDark);
  F.coffeeTable(u, -7.0, -3.8);
  F.beanbag(u, -5.2, -4.9, M.beanbag);
  F.beanbag(u, -5.0, -2.5, M.beanbag2);
  const rugM = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.2), M.rug);
  rugM.rotation.x = -PI / 2;
  rugM.position.set(-6.6, UPPER_Y + 0.006, -3.8);
  rugM.receiveShadow = true;
  upper.add(rugM);
  F.tv(u, -3.58, 1.9, -3.8, -PI / 2, 1.5, 0.86);
  F.floorLamp(u, -8.3, -1.0);
  F.plant(u, -4.0, -5.4, 1.1);
  nav1.blockCircle(-4.0, -5.4, 0.22);
  F.sign(u, -6.2, 2.3, BLD.z0 + 0.12, 0, ["TRABAJAR JUNTOS", "ES EL CAMINO"], "#3d4a7a", "#ffffff", 2.8, 0.9);
  // training room
  F.whiteboard(u, 1.42, 1.75, -3.0, -PI / 2, 2.4, 1.4);
  const trainSeats = [];
  for (const x of [-2.5, -1.5, -0.5])
    for (const z of [-1.4, -2.4, -3.4, -4.4]) {
      F.simpleChair(u, x, z, PI / 2, M.chairBlack);
      trainSeats.push({ x: x + 0.28, z, yaw: PI / 2, sit: 0.27 });
    }
  F.plant(u, -3.0, -5.4, 0.9);
  nav1.blockCircle(-3.0, -5.4, 0.2);
  F.sign(u, -1.0, 2.4, BLD.z0 + 0.12, 0, ["APRENDER", "CADA DÍA"], "#8fb996", "#1e2a24", 1.6, 0.8);
  // Sala Chimborazo
  F.roundTable(u, 3.5, -3.3, 0.8, F.DESK_H, M.lightWood, 0.15);
  const meet2Seats = [];
  for (const a of [PI / 4, (3 * PI) / 4, (5 * PI) / 4, (7 * PI) / 4]) {
    const x = 3.5 + Math.cos(a) * 1.2, z = -3.3 + Math.sin(a) * 1.2;
    const yaw = Math.atan2(3.5 - x, -3.3 - z);
    F.simpleChair(u, x, z, yaw, M.chairOrange);
    meet2Seats.push({ x: x + Math.sin(yaw) * 0.28, z: z + Math.cos(yaw) * 0.28, yaw, sit: 0.27 });
  }
  F.tv(u, 3.5, 2.0, BLD.z0 + 0.09, 0, 1.6, 0.9);
  F.plant(u, 5.0, -5.4, 0.9);
  nav1.blockCircle(5.0, -5.4, 0.2);
  F.sign(u, 3.5, 2.7, BLD.z0 + 0.12, 0, ["SALA", "CHIMBORAZO"], "#e08a5c", "#ffffff", 1.4, 0.7);
  // lab
  F.whiteboard(u, 7.2, 1.75, BLD.z0 + 0.09, 0, 2.2, 1.4);
  F.stickyWall(u, 5.58, 1.6, -3.4, PI / 2, 2.2, 1.6);
  F.sign(u, 5.58, 2.8, -3.4, PI / 2, ["PIENSA", "DIFERENTE"], "#6f5a9e", "#ffffff", 1.6, 0.7);
  F.beanbag(u, 8.1, -0.9, M.beanbag2);
  F.plant(u, 8.4, -5.4, 0.9);
  nav1.blockCircle(8.4, -5.4, 0.2);

  B0.flush();
  B1.flush();

  // ============================================================ spots ====
  const spots = {
    coffee: [{ x: bar.machine[0], z: -4.85, yaw: PI, floor: 0 }, { x: bar.machine[0] + 0.85, z: -4.85, yaw: PI, floor: 0 }],
    kitchen: [{ x: -7.0, z: -1.6, yaw: PI, floor: 0 }, { x: -6.0, z: -2.6, yaw: -PI / 2, floor: 0 }],
    meeting: meetSeats.map((s) => ({ ...s, floor: 0 })),
    booth: [1.8, 3.0, 4.2].map((x) => ({ x, z: -4.95, yaw: PI, floor: 0 })),
    printer: [{ x: 4.4, z: -0.75, yaw: PI, floor: 0 }],
    water: [{ x: 1.6, z: -0.75, yaw: PI, floor: 0 }],
    servers: [{ x: 7.2, z: -4.5, yaw: PI, floor: 0 }],
    pingpong: [{ x: pp.ends[0][0], z: pp.ends[0][1], yaw: 0, floor: 0 }, { x: pp.ends[1][0], z: pp.ends[1][1], yaw: PI, floor: 0 }],
    tv: [{ x: -8.0, z: 5.2, yaw: -PI / 2, floor: 0 }, { x: -8.0, z: 4.4, yaw: -PI / 2, floor: 0 }],
    lounge: [-4.7, -3.8, -2.9].map((z) => ({ x: -7.65, z, yaw: PI / 2, sit: 0.6, floor: 1 })),
    beanbag: [{ x: -5.2, z: -4.2, yaw: PI, sit: 0.55, low: true, floor: 1 }, { x: -5.0, z: -1.8, yaw: PI, sit: 0.55, low: true, floor: 1 }],
    trainer: [{ x: 0.75, z: -2.9, yaw: PI / 2, floor: 1 }],
    trainee: trainSeats.filter((s) => s.x < 0 && s.z < -1.6).map((s) => ({ ...s, floor: 1 })),
    meeting2: meet2Seats.map((s) => ({ ...s, floor: 1 })),
    labBoard: [{ x: 7.6, z: -5.0, yaw: PI, floor: 1 }, { x: 6.7, z: -4.9, yaw: PI, floor: 1 }],
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

  // ========================================================= hotspots ====
  const hotspots = [
    { id: "board", name: "Tablero de tareas", icon: "📋", x: 1.42, y: UPPER_Y + 1.75, z: -3.0, w: 0.3, h: 1.5, d: 2.5, floor: 1 },
    { id: "tv", name: "Dashboard en vivo", icon: "📺", x: BLD.x0 + 0.2, y: 2.2, z: 5.2, w: 0.3, h: 0.9, d: 1.5, floor: 0 },
    { id: "coffee", name: "Cafetera", icon: "☕", x: bar.machine[0], y: 1.15, z: bar.machine[1], w: 0.6, h: 0.7, d: 0.6, floor: 0 },
    { id: "printer", name: "Impresora", icon: "🖨️", x: 4.4, y: 0.7, z: -1.4, w: 1.0, h: 1.4, d: 0.6, floor: 0 },
    { id: "shelf", name: "Base de conocimiento", icon: "📚", x: BLD.x0 + 0.22, y: 1.4, z: 3.2, w: 0.5, h: 2.8, d: 2.6, floor: 0 },
    { id: "water", name: "Radio pasillo", icon: "💬", x: 1.6, y: 0.8, z: -1.4, w: 0.5, h: 1.6, d: 0.5, floor: 0 },
    { id: "clock", name: "Línea de tiempo", icon: "🕒", x: BLD.x0 + 0.2, y: 3.05, z: 3.2, w: 0.3, h: 0.5, d: 0.5, floor: 0 },
    { id: "servers", name: "Estado de sistemas", icon: "🖥️", x: 7.15, y: 1.0, z: -5.4, w: 3.4, h: 2.0, d: 0.9, floor: 0 },
    { id: "pingpong", name: "Marcador de ping-pong", icon: "🏓", x: 6.4, y: 0.6, z: 3.6, w: 1.6, h: 0.5, d: 2.8, floor: 0 },
    { id: "reception", name: "Recepción", icon: "🛎️", x: -6.3, y: 0.6, z: 5.05, w: 2.7, h: 1.1, d: 0.8, floor: 0 },
    { id: "meeting", name: "Agenda de reuniones", icon: "📅", x: -1.5, y: 0.5, z: -3.0, w: 2.8, h: 0.8, d: 1.1, floor: 0 },
    { id: "lounge", name: "Bienestar del equipo", icon: "🛋️", x: -8.25, y: UPPER_Y + 0.4, z: -3.8, w: 1.0, h: 0.9, d: 2.7, floor: 1 },
  ];

  return { stations, spots, hotspots, nav0, nav1, upper, dyn, lights, pingpong: pp, materials: M };
}
