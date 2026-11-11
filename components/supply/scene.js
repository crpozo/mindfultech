/**
 * CommandInstinct yard: an isometric distribution centre where every truck
 * is a delivery. A truck stops at the licence gate, is cleared or pulled into
 * the holding bay, loads at a dock and leaves; the delivery then continues
 * "in transit" as data only. The simulation lives here and React only reads
 * snapshots, so the list and the 3D yard can never disagree.
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const DOCK_X = [-3.5, 3, 9.5, 16];
const ROAD_Z = 14;
const LANE_Z = 9.6;
const DOCK_Z = 6.2;
const GATE_X = -31.5;
const BAY = { x: -19.5, z: 20 };

export const SUPPLIERS = [
  { name: "Andes Fresh Produce", color: 0x34b27b, cargo: "produce", special: "sanitary" },
  { name: "Pacifico Seafood", color: 0x22b8cf, cargo: "seafood", special: "coldchain" },
  { name: "Quito Pharma Labs", color: 0x7c6cf2, cargo: "pharma", special: "health" },
  { name: "Volcan Chemicals", color: 0xf2994a, cargo: "solvents", special: "hazmat" },
  { name: "Sierra Building Supply", color: 0xe7b53c, cargo: "construction", special: "oversize" },
  { name: "Costa Beverages", color: 0xea5a5a, cargo: "beverages", special: "excise" },
];
const DESTS = [
  ["Guayaquil", 420], ["Cuenca", 460], ["Manta", 390], ["Ambato", 150],
  ["Loja", 640], ["Ibarra", 115], ["Riobamba", 190], ["Santo Domingo", 150],
];
const DRIVERS = ["L. Andrade", "M. Cevallos", "J. Paredes", "D. Zambrano", "R. Mora", "S. Guaman", "P. Villacis", "A. Chiriboga"];

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function createSupplyScene(container, canvas, labelLayer, hooks) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const small = window.matchMedia("(max-width: 900px)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-50, 50, 30, -30, 1, 400);
  const target = new THREE.Vector3(small ? 4 : -6, 0, 3);
  camera.position.set(target.x + 60, 52, target.z + 60);
  camera.lookAt(target);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minZoom = 0.7;
  controls.maxZoom = 3.2;
  controls.screenSpacePanning = false;
  controls.update();
  const polar = controls.getPolarAngle();
  controls.minPolarAngle = polar;
  controls.maxPolarAngle = polar;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfdcf2, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.position.set(-38, 64, 42);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -66, right: 66, top: 66, bottom: -66, near: 1, far: 220 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.06;
  scene.add(sun);

  // ---------------------------------------------------------------- helpers
  const mats = new Map();
  const mat = (color, extra) => {
    const key = color + JSON.stringify(extra || {});
    if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, ...extra }));
    return mats.get(key);
  };
  const geos = new Map();
  const boxGeo = (w, h, d) => {
    const key = `${w}|${h}|${d}`;
    if (!geos.has(key)) geos.set(key, new THREE.BoxGeometry(w, h, d));
    return geos.get(key);
  };
  /** A box whose `y` is its base, so everything sits on the ground by default. */
  const box = (parent, w, h, d, color, x = 0, y = 0, z = 0, opts = {}) => {
    const m = new THREE.Mesh(boxGeo(w, h, d), typeof color === "number" ? mat(color, opts.mat) : color);
    m.position.set(x, y + h / 2, z);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = opts.receive !== false;
    parent.add(m);
    return m;
  };
  const textPlane = (text, w, h, fg, bg) => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = Math.round((1024 * h) / w);
    const g = c.getContext("2d");
    if (bg) {
      g.fillStyle = bg;
      g.fillRect(0, 0, c.width, c.height);
    }
    g.fillStyle = fg;
    g.font = `700 ${Math.round(c.height * 0.62)}px Outfit, system-ui, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, c.width / 2, c.height / 2 + c.height * 0.04);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: !bg }));
  };

  // ------------------------------------------------------------------ world
  const world = new THREE.Group();
  scene.add(world);

  box(world, 88, 0.8, 64, 0xd5deeb, 0, -1.6, 0, { cast: false });
  box(world, 86, 0.8, 62, 0xeef2f8, 0, -0.8, 0, { cast: false });
  // roads sit on their own heights so nothing shares a plane with the ground
  box(world, 86, 0.05, 5.4, 0xc7d0de, 0, 0, ROAD_Z, { cast: false });
  box(world, 86, 0.05, 4.6, 0xc7d0de, 0, 0, -22, { cast: false });
  box(world, 44, 0.04, 9.6, 0xdce3ee, 4, 0, 6.6, { cast: false });
  for (let x = -41; x <= 41; x += 4) {
    box(world, 1.8, 0.03, 0.18, 0xffffff, x, 0.05, ROAD_Z, { cast: false });
    box(world, 1.8, 0.03, 0.18, 0xffffff, x, 0.05, -22, { cast: false });
  }
  // dock bays painted on the apron
  DOCK_X.forEach((x) => {
    box(world, 0.14, 0.03, 4.2, 0xffffff, x - 3.2, 0.04, 5.4, { cast: false });
    box(world, 0.14, 0.03, 4.2, 0xffffff, x + 3.2, 0.04, 5.4, { cast: false });
  });
  // holding bay, hatched in amber
  box(world, 15, 0.04, 5.4, 0xe7ebf2, BAY.x - 0.5, 0, BAY.z, { cast: false });
  for (let i = 0; i < 7; i++) box(world, 0.22, 0.03, 4.6, 0xf2b84b, BAY.x - 7 + i * 2.2, 0.04, BAY.z, { cast: false }).rotation.y = 0.5;

  // warehouse
  const wh = new THREE.Group();
  world.add(wh);
  box(wh, 26, 6, 14, 0x3d74f2, 6, 0, -5);
  box(wh, 26.8, 0.45, 14.8, 0x6f9cff, 6, 6, -5);
  for (let x = -6; x <= 18; x += 2) box(wh, 0.22, 0.16, 14.2, 0x5a8af5, x, 6.45, -5, { cast: false });
  for (let i = 0; i < 4; i++) box(wh, 3.2, 0.2, 1.6, 0xdff0ff, -2 + i * 5.4, 6.45, -8, { cast: false, mat: { emissive: 0x9fd0ff, emissiveIntensity: 0.25 } });
  box(wh, 26.4, 0.28, 2.6, 0xf4f7fb, 6, 4.5, 3.1); // canopy over the docks
  for (let x = -6.6; x <= 18.6; x += 6.3) box(wh, 0.18, 4.5, 0.18, 0xdfe6f0, x, 0, 4.2);
  box(wh, 26, 0.9, 0.5, 0x2c58c9, 6, 0, 2.2); // dock platform
  const doors = DOCK_X.map((x, i) => {
    box(wh, 3.5, 3.9, 0.12, 0xffffff, x, 0.9, 2.02, { cast: false });
    box(wh, 3.1, 3.6, 0.1, 0x16233f, x, 0.9, 2.06, { cast: false });
    const door = box(wh, 3.1, 3.6, 0.1, 0xb9c8e6, x, 0.9, 2.12, { cast: false });
    for (let k = 1; k < 5; k++) box(door, 3.1, 0.05, 0.02, 0x8fa5cf, 0, -1.8 + k * 0.72 - 0.025, 0.06, { cast: false });
    const n = textPlane(String(i + 1), 0.9, 0.9, "#ffffff", "#2c58c9");
    n.position.set(x, 5.25, 2.03);
    wh.add(n);
    return { mesh: door, open: 0 };
  });
  const sign = textPlane("COMMANDINSTINCT", 11, 1.25, "#ffffff");
  sign.position.set(19.02, 4.2, -5);
  sign.rotation.y = Math.PI / 2;
  wh.add(sign);
  for (let i = 0; i < 5; i++) box(wh, 0.08, 1.1, 1.7, 0xcfe4ff, 19.03, 1.4, -10.4 + i * 2.7, { cast: false });
  // office annex
  box(wh, 6, 3.8, 7, 0xf6f8fc, -10, 0, -6);
  box(wh, 6.4, 0.3, 7.4, 0xdfe6f1, -10, 3.8, -6);
  for (let i = 0; i < 3; i++) box(wh, 1.3, 1.5, 0.08, 0x8fc0ff, -11.8 + i * 1.8, 1.5, -2.47, { cast: false });
  box(wh, 1.2, 2.2, 0.08, 0x2c58c9, -8.2, 0, -2.47, { cast: false });

  // licence gate: booth + scanner arch + traffic light bar
  const gate = new THREE.Group();
  world.add(gate);
  box(gate, 2.6, 2.6, 2.6, 0xf6f8fc, -28, 0, 18.4);
  box(gate, 3, 0.3, 3, 0x3d74f2, -28, 2.6, 18.4);
  box(gate, 1.6, 1, 0.08, 0x8fc0ff, -28, 1.2, 17.06, { cast: false });
  box(gate, 0.45, 5.6, 0.45, 0x2b3a5c, -28, 0, 10.9);
  box(gate, 0.45, 5.6, 0.45, 0x2b3a5c, -28, 0, 17.0);
  box(gate, 0.6, 0.6, 6.6, 0x2b3a5c, -28, 5.4, 13.95);
  const scanMat = new THREE.MeshStandardMaterial({ color: 0x4f8cff, emissive: 0x4f8cff, emissiveIntensity: 1.4 });
  box(gate, 0.2, 0.22, 5.4, scanMat, -27.66, 5.55, 13.95, { cast: false });
  const gateSign = textPlane("LICENCE GATE", 5.2, 0.62, "#ffffff", "#2b3a5c");
  gateSign.position.set(-27.68, 6.5, 13.95);
  gateSign.rotation.y = Math.PI / 2;
  gate.add(gateSign);
  box(gate, 0.6, 0.7, 6.6, 0x2b3a5c, -28, 6.15, 13.95, { cast: false });
  let scanState = "idle";
  let scanUntil = 0;

  // container stacks
  const CONT = [0x3d74f2, 0xf2994a, 0x2fb6a3, 0xf6f8fc, 0xea5a5a, 0x7c6cf2];
  [[-36, -6], [-36, -9.2], [-29, -6], [-29, -9.2], [-22.5, -9.2]].forEach(([x, z], i) => {
    box(world, 6, 2.5, 2.5, CONT[i % CONT.length], x, 0, z);
    if (i !== 2 && i !== 4) box(world, 6, 2.5, 2.5, CONT[(i + 3) % CONT.length], x, 2.5, z);
  });
  // pallet yard
  const carton = [0xd8a868, 0xcf9b58, 0xe3b97c];
  for (const px of [25, 29, 33, 37]) {
    for (let pz = -9; pz <= 0; pz += 3) {
      box(world, 1.9, 0.18, 1.9, 0xb98b52, px, 0, pz);
      const h = 1 + Math.floor(Math.random() * 3);
      for (let k = 0; k < h; k++) {
        box(world, 0.85, 0.8, 0.85, carton[(k + px) % 3], px - 0.45, 0.18 + k * 0.8, pz - 0.45);
        box(world, 0.85, 0.8, 0.85, carton[(k + px + 1) % 3], px + 0.45, 0.18 + k * 0.8, pz - 0.45);
        if (k < h - 1 || Math.random() > 0.4) box(world, 0.85, 0.8, 0.85, carton[(k + 2) % 3], px - 0.45, 0.18 + k * 0.8, pz + 0.45);
        if (k < h - 1) box(world, 0.85, 0.8, 0.85, carton[k % 3], px + 0.45, 0.18 + k * 0.8, pz + 0.45);
      }
    }
  }
  // trees and lamps
  const tree = (x, z, s = 1) => {
    box(world, 0.3 * s, 0.9 * s, 0.3 * s, 0x9a7650, x, 0, z);
    const top = new THREE.Mesh(new THREE.ConeGeometry(1.1 * s, 2.6 * s, 7), mat(0x58c08b));
    top.position.set(x, 0.9 * s + 1.3 * s, z);
    top.castShadow = true;
    world.add(top);
  };
  for (let x = -40; x <= 40; x += 6.5) tree(x + rand(-0.8, 0.8), -27.5 + rand(-0.6, 0.6), rand(0.85, 1.2));
  for (let x = 2; x <= 40; x += 5.5) tree(x, 26 + rand(-1, 1), rand(0.8, 1.15));
  [[-40, 26], [-36, 27.5], [-40, -15], [-16, -15], [-18, -3]].forEach(([x, z]) => tree(x, z));
  for (const x of [-20, -2, 16, 34]) {
    box(world, 0.16, 5, 0.16, 0x9aa7bd, x, 0, 17.4);
    box(world, 0.9, 0.14, 0.3, 0xffffff, x, 4.9, 17.0, { mat: { emissive: 0xfff3c4, emissiveIntensity: 0.6 } });
  }
  // staff cars by the office
  [0xffffff, 0x2b3a5c, 0xea5a5a].forEach((c, i) => {
    const g = new THREE.Group();
    box(g, 2.3, 0.6, 1.2, c, 0, 0.25, 0);
    box(g, 1.2, 0.5, 1.1, 0x9fc2f5, -0.1, 0.85, 0);
    g.position.set(-15.5 + i * 2.0, 0, -0.4);
    g.rotation.y = Math.PI / 2;
    world.add(g);
  });

  // ---------------------------------------------------------------- vehicles
  const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.34, 14);
  wheelGeo.rotateX(Math.PI / 2);
  const wheel = (parent, x, z, r = 1) => {
    const m = new THREE.Mesh(wheelGeo, mat(0x1c2232));
    m.scale.setScalar(r);
    m.position.set(x, 0.5 * r, z);
    m.castShadow = true;
    parent.add(m);
  };
  const makeTruck = (color) => {
    const g = new THREE.Group();
    box(g, 8.2, 0.3, 1.5, 0x2b3142, -0.3, 0.55, 0);
    box(g, 6.3, 2.55, 2.3, 0xffffff, -1.25, 0.95, 0);
    box(g, 6.32, 0.5, 2.32, color, -1.25, 1.3, 0, { cast: false });
    box(g, 6.32, 0.08, 2.32, 0xdfe6f1, -1.25, 3.5, 0, { cast: false });
    box(g, 1.9, 2.25, 2.2, color, 3.0, 0.7, 0);
    box(g, 0.08, 0.9, 1.9, 0x1e2a44, 3.96, 1.8, 0, { cast: false });
    box(g, 1.2, 0.8, 2.22, 0x1e2a44, 3.1, 1.85, 0, { cast: false });
    box(g, 0.3, 0.35, 2.25, 0x2b3142, 3.9, 0.55, 0, { cast: false });
    for (const x of [-3.5, -2.4, 2.9]) {
      wheel(g, x, 1.02);
      wheel(g, x, -1.02);
    }
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0x9aa7bd, emissive: 0x000000 });
    box(g, 0.5, 0.22, 0.5, beaconMat, 3.0, 2.95, 0, { cast: false });
    g.userData.beacon = beaconMat;
    return g;
  };
  const makeForklift = () => {
    const g = new THREE.Group();
    box(g, 1.5, 0.75, 1.0, 0xf5a623, -0.2, 0.25, 0);
    box(g, 0.7, 0.9, 0.9, 0x2b3142, -0.5, 1.0, 0);
    box(g, 0.12, 2.1, 0.9, 0x2b3142, 0.62, 0.15, 0);
    box(g, 0.9, 0.07, 0.14, 0x565f75, 1.1, 0.22, 0.28);
    box(g, 0.9, 0.07, 0.14, 0x565f75, 1.1, 0.22, -0.28);
    wheel(g, 0.25, 0.5, 0.55);
    wheel(g, 0.25, -0.5, 0.55);
    wheel(g, -0.7, 0.5, 0.5);
    wheel(g, -0.7, -0.5, 0.5);
    const load = new THREE.Group();
    box(load, 0.95, 0.12, 0.95, 0xb98b52, 1.1, 0.3, 0);
    box(load, 0.85, 0.75, 0.85, 0xd8a868, 1.1, 0.42, 0);
    g.add(load);
    g.userData.load = load;
    return g;
  };
  const makeVan = (color) => {
    const g = new THREE.Group();
    box(g, 3.2, 1.5, 1.5, color, 0, 0.4, 0);
    box(g, 0.9, 0.6, 1.52, 0x1e2a44, 1.0, 1.2, 0, { cast: false });
    for (const x of [-1, 1]) {
      wheel(g, x, 0.7, 0.62);
      wheel(g, x, -0.7, 0.62);
    }
    return g;
  };

  const ring = new THREE.Mesh(new THREE.RingGeometry(4.9, 5.4, 48), new THREE.MeshBasicMaterial({ color: 0x2f6bff, transparent: true, opacity: 0.85, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.12;
  ring.visible = false;
  world.add(ring);

  // -------------------------------------------------------------- simulation
  let seq = 2040;
  let deliveredToday = 128;
  const docks = [null, null, null, null];
  const trucks = [];
  let selected = null;

  const newLicences = (sup, issue) => {
    const list = [
      { key: "transport", days: Math.round(rand(60, 330)) },
      { key: "insurance", days: Math.round(rand(40, 300)) },
      { key: "driver", days: Math.round(rand(90, 900)) },
      { key: sup.special, days: Math.round(rand(35, 240)) },
    ];
    if (issue === "expired") list[pick([0, 3])].days = -Math.round(rand(1, 6));
    else if (issue === "expiring") list[pick([0, 1, 3])].days = Math.round(rand(3, 21));
    return list;
  };
  const newDelivery = (wait, issue) => {
    // rotate through the suppliers so the list never fills up with one name
    const si = (seq * 5 + 1) % SUPPLIERS.length;
    const [dest, km] = pick(DESTS);
    const r = Math.random();
    const kind = issue !== undefined ? issue : r < 0.2 ? "expired" : r < 0.42 ? "expiring" : null;
    return {
      id: `CI-${++seq}`,
      si,
      dest,
      km,
      driver: pick(DRIVERS),
      plate: `P${pick("ABCGT")}${pick("ABDKX")}-${Math.floor(rand(1000, 9999))}`,
      pallets: Math.floor(rand(8, 22)),
      weight: Math.floor(rand(42, 180)) * 100,
      licences: newLicences(SUPPLIERS[si], kind),
      state: "scheduled",
      t: 0,
      wait,
      progress: 0,
      dock: -1,
      phase: "",
      dur: 0,
    };
  };
  const deliveries = [];
  const emit = (kind, d, extra) => hooks.onEvent && hooks.onEvent({ kind, id: d.id, supplier: SUPPLIERS[d.si].name, at: Date.now(), ...extra });

  const spawnTruck = (d, x = -47, z = ROAD_Z) => {
    const g = makeTruck(SUPPLIERS[d.si].color);
    world.add(g);
    const el = document.createElement("button");
    el.type = "button";
    el.className = "ci-tag";
    el.innerHTML = `<i></i><span>${d.id}</span>`;
    el.addEventListener("click", () => select(d.id));
    labelLayer.appendChild(el);
    const t = { d, g, el, x, z, heading: 0, path: [], v: 0, blocked: 0, ignore: 0 };
    d.truck = t;
    trucks.push(t);
    return t;
  };
  const removeTruck = (t) => {
    world.remove(t.g);
    t.el.remove();
    trucks.splice(trucks.indexOf(t), 1);
    t.d.truck = null;
  };
  const dockPath = (k) => [{ x: -13, z: ROAD_Z }, { x: DOCK_X[k] - 7, z: LANE_Z }, { x: DOCK_X[k] + 1.2, z: DOCK_Z, stop: true }];
  const freeDock = () => docks.findIndex((v) => v === null);

  const select = (id) => {
    selected = id;
    hooks.onSelect && hooks.onSelect(id);
  };

  // opening state: the yard is already busy when the page loads
  {
    const mk = (issue) => newDelivery(0, issue);
    const a = mk(null);
    a.state = "loading"; a.dock = 1; docks[1] = a; a.dur = a.pallets * 1.3; a.t = a.dur * 0.45;
    Object.assign(spawnTruck(a, DOCK_X[1] + 1.2, DOCK_Z), {});
    const b = mk("expiring");
    b.state = "loading"; b.dock = 3; docks[3] = b; b.dur = b.pallets * 1.3; b.t = b.dur * 0.1;
    spawnTruck(b, DOCK_X[3] + 1.2, DOCK_Z);
    const c = mk(null);
    c.state = "toDock"; c.dock = 0; docks[0] = c;
    spawnTruck(c, -22, ROAD_Z).path = dockPath(0);
    const e = mk("expired");
    e.state = "inbound";
    spawnTruck(e, -43, ROAD_Z).path = [{ x: GATE_X, z: ROAD_Z, stop: true }];
    const f = mk(null); f.state = "transit"; f.dur = 46; f.progress = 0.55;
    const h = mk("expiring"); h.state = "transit"; h.dur = 52; h.progress = 0.2;
    const j = mk(null); j.state = "delivered"; j.progress = 1; j.t = 4;
    deliveries.push(a, b, c, e, f, h, j, newDelivery(7), newDelivery(16), newDelivery(27));
  }

  const forklifts = [0, 1, 2].map((i) => {
    const g = makeForklift();
    world.add(g);
    const aisle = i === 2 ? 31 : 27;
    return { g, x: aisle + (i === 1 ? 0.01 : 0), z: 3.4 - i * 3.2, heading: 0, path: [], job: -1, aisle, carrying: i % 2 === 0, pause: 0 };
  });
  const vans = [0, 1, 2, 3].map((i) => {
    const g = makeVan([0xffffff, 0xf2994a, 0x2fb6a3, 0x2b3a5c][i]);
    world.add(g);
    const dir = i % 2 ? -1 : 1;
    g.rotation.y = dir > 0 ? 0 : Math.PI;
    return { g, x: -40 + i * 23, z: dir > 0 ? -20.9 : -23.1, dir, v: rand(5, 8) };
  });

  const fade = (x) => Math.max(0.001, Math.min(1, (x + 46.5) / 3.5, (46.5 - x) / 3.5));

  const stepTruck = (t, dt) => {
    const p = t.path[0];
    if (!p) return;
    const dx = p.x - t.x;
    const dz = p.z - t.z;
    const dist = Math.hypot(dx, dz);
    const ux = dx / (dist || 1);
    const uz = dz / (dist || 1);
    // hold back behind whoever is directly ahead in this lane
    let blocked = false;
    if (t.ignore <= 0) {
      for (const o of trucks) {
        if (o === t) continue;
        const rx = o.x - t.x;
        const rz = o.z - t.z;
        const fwd = rx * ux + rz * uz;
        const lat = Math.abs(rx * uz - rz * ux);
        if (fwd > 0.5 && fwd < 10.6 && lat < 2.6) {
          blocked = true;
          break;
        }
      }
    } else t.ignore -= dt;
    if (blocked) {
      t.blocked += dt;
      if (t.blocked > 7) {
        t.ignore = 1.6;
        t.blocked = 0;
      }
    } else t.blocked = 0;
    const want = blocked ? 0 : Math.min(7.5, p.stop ? 1.1 + dist * 1.15 : 7.5);
    t.v += (want - t.v) * Math.min(1, dt * 3.2);
    const move = Math.min(dist, t.v * dt);
    t.x += ux * move;
    t.z += uz * move;
    if (dist > 0.4) {
      let dh = Math.atan2(-uz, ux) - t.heading;
      dh = Math.atan2(Math.sin(dh), Math.cos(dh));
      t.heading += dh * Math.min(1, dt * 3.4);
    }
    if (dist < 0.25) t.path.shift();
  };

  const mergeClear = () => !trucks.some((o) => o.z < 17 && o.x > -36 && o.x < -4 && o.d.state !== "loading");
  const entryClear = () => !trucks.some((o) => o.x < -33.5 + 11 && o.z < 17 && (o.d.state === "inbound" || o.d.state === "gate"));

  const stepDelivery = (d, dt, now) => {
    const t = d.truck;
    switch (d.state) {
      case "scheduled":
        d.wait -= dt;
        if (d.wait <= 0 && trucks.length < 5 && entryClear()) {
          d.state = "inbound";
          spawnTruck(d).path = [{ x: GATE_X, z: ROAD_Z, stop: true }];
        }
        break;
      case "inbound":
        if (!t.path.length) {
          d.state = "gate";
          d.t = 0;
          scanState = "scan";
          emit("arrive", d);
        }
        break;
      case "gate": {
        d.t += dt;
        if (d.t < 2.4) break;
        const bad = d.licences.find((l) => l.days < 0);
        if (bad) {
          d.state = "held";
          d.phase = "toBay";
          t.path = [{ x: -27, z: 14.7 }, { x: -23.8, z: 18.6 }, { x: BAY.x, z: BAY.z, stop: true }];
          scanState = "red";
          scanUntil = now + 3200;
          emit("held", d, { licence: bad.key, days: -bad.days });
          break;
        }
        const k = freeDock();
        if (k < 0) break;
        docks[k] = d;
        d.dock = k;
        d.state = "toDock";
        t.path = dockPath(k);
        scanState = "green";
        scanUntil = now + 3200;
        const soon = d.licences.find((l) => l.days <= 30);
        if (soon) emit("warn", d, { licence: soon.key, days: soon.days });
        else emit("cleared", d);
        break;
      }
      case "held":
        if (d.phase === "toBay") {
          if (!t.path.length) {
            d.phase = "wait";
            d.t = 0;
          }
        } else {
          d.t += dt;
          const k = freeDock();
          if (d.t > 13 && k >= 0 && mergeClear()) {
            d.licences.forEach((l) => {
              if (l.days < 0) l.days = 365;
            });
            docks[k] = d;
            d.dock = k;
            d.state = "toDock";
            d.phase = "";
            t.path = [{ x: -15.2, z: 19.4 }, { x: -13, z: 14.6 }, ...dockPath(k).slice(1)];
            emit("renewed", d);
          }
        }
        break;
      case "toDock":
        if (!t.path.length) {
          d.state = "loading";
          d.t = 0;
          d.dur = d.pallets * 1.3;
          emit("dock", d, { dock: d.dock + 1 });
        }
        break;
      case "loading":
        d.t += dt;
        d.progress = Math.min(1, d.t / d.dur);
        if (d.t >= d.dur) {
          const x = DOCK_X[d.dock];
          docks[d.dock] = null;
          d.state = "leaving";
          d.progress = 0;
          t.path = [{ x: x + 8.5, z: LANE_Z }, { x: 23, z: LANE_Z }, { x: 28.5, z: ROAD_Z }, { x: 47.5, z: ROAD_Z }];
          emit("loaded", d, { pallets: d.pallets, dest: d.dest });
        }
        break;
      case "leaving":
        if (!t.path.length) {
          removeTruck(t);
          d.state = "transit";
          d.progress = 0.02;
          d.dur = rand(34, 58);
          d.dock = -1;
        }
        break;
      case "transit":
        d.progress += dt / d.dur;
        if (d.progress >= 1) {
          d.progress = 1;
          d.state = "delivered";
          d.t = 0;
          deliveredToday++;
          emit("delivered", d, { dest: d.dest });
        }
        break;
      case "delivered":
        d.t += dt;
        if (d.t > 15) {
          const fresh = newDelivery(rand(2, 9));
          if (selected === d.id) selected = null;
          deliveries[deliveries.indexOf(d)] = fresh;
        }
        break;
    }
  };

  const moveTo = (o, dt, speed) => {
    const p = o.path[0];
    if (!p) return true;
    const dx = p.x - o.x;
    const dz = p.z - o.z;
    const dist = Math.hypot(dx, dz);
    const move = Math.min(dist, speed * dt);
    if (dist > 0.001) {
      o.x += (dx / dist) * move;
      o.z += (dz / dist) * move;
      let dh = Math.atan2(-dz, dx) - o.heading;
      dh = Math.atan2(Math.sin(dh), Math.cos(dh));
      o.heading += dh * Math.min(1, dt * 7);
    }
    if (dist < 0.08) o.path.shift();
    return o.path.length === 0;
  };
  const stepForklift = (f, dt) => {
    if (f.job >= 0 && (!docks[f.job] || docks[f.job].state !== "loading")) {
      f.job = -1;
      f.path = [{ x: f.aisle, z: 3.4 }];
      f.carrying = false;
    }
    if (f.job < 0) {
      const k = docks.findIndex((d, i) => d && d.state === "loading" && !forklifts.some((o) => o.job === i));
      if (k >= 0) {
        f.job = k;
        f.carrying = true;
        f.path = [{ x: f.aisle, z: 3.4 }, { x: DOCK_X[k] - 0.6, z: 3.2 }, { x: DOCK_X[k] - 0.6, z: 4.5 }];
      }
    }
    if (f.pause > 0) {
      f.pause -= dt;
    } else if (moveTo(f, dt, 3.4)) {
      f.pause = 0.35;
      if (f.job >= 0) {
        const atTruck = f.z > 4;
        f.carrying = !atTruck;
        f.path = [{ x: DOCK_X[f.job] - 0.6, z: atTruck ? 3.0 : 4.5 }];
      } else {
        const out = f.z > 0;
        f.carrying = !f.carrying;
        f.path = [{ x: f.aisle, z: out ? rand(-8.5, -3) : 3.4 }];
        f.pause = rand(0.4, 1.4);
      }
    }
    f.g.position.set(f.x, 0, f.z);
    f.g.rotation.y = f.heading;
    f.g.userData.load.visible = f.carrying;
  };

  // ------------------------------------------------------------- frame loop
  const v3 = new THREE.Vector3();
  let w = 1;
  let h = 1;
  const resize = () => {
    w = Math.max(1, container.clientWidth);
    h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    const aspect = w / h;
    const halfW = aspect > 1.15 ? 47 : 27;
    const halfH = Math.max(halfW / aspect, 22);
    camera.left = -halfH * aspect;
    camera.right = halfH * aspect;
    camera.top = halfH;
    camera.bottom = -halfH;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  const ray = new THREE.Raycaster();
  let down = null;
  const onDown = (e) => (down = { x: e.clientX, y: e.clientY });
  const onUp = (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = ray.intersectObjects(trucks.map((t) => t.g), true)[0];
    if (!hit) return;
    let o = hit.object;
    while (o.parent && o.parent !== world) o = o.parent;
    const t = trucks.find((k) => k.g === o);
    if (t) select(t.d.id);
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);

  const TAG = { inbound: "go", gate: "scan", held: "held", toDock: "go", loading: "load", leaving: "go" };
  let last = performance.now();
  let snapAt = 0;
  let raf = 0;
  let alive = true;
  const frame = (now) => {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const wall = Date.now();

    for (const d of deliveries.slice()) stepDelivery(d, dt, wall);
    for (const t of trucks) {
      stepTruck(t, dt);
      t.g.position.set(t.x, 0, t.z);
      t.g.rotation.y = t.heading;
      t.g.scale.setScalar(fade(t.x));
      const held = t.d.state === "held";
      const blink = Math.sin(now / 160) > 0;
      t.g.userData.beacon.emissive.setHex(held ? (blink ? 0xff3b3b : 0x330000) : t.d.state === "loading" ? 0x2f6bff : 0x000000);
      t.g.userData.beacon.color.setHex(held ? 0xff5a5a : 0x9aa7bd);
    }
    forklifts.forEach((f) => stepForklift(f, dt));
    for (const v of vans) {
      v.x += v.dir * v.v * dt;
      if (v.x > 47) v.x = -47;
      if (v.x < -47) v.x = 47;
      v.g.position.set(v.x, 0, v.z);
      v.g.scale.setScalar(fade(v.x));
    }
    docks.forEach((d, i) => {
      const door = doors[i];
      const open = d && d.state === "loading" ? 1 : 0;
      door.open += (open - door.open) * Math.min(1, dt * 2.5);
      const s = 1 - door.open * 0.9;
      door.mesh.scale.y = s;
      door.mesh.position.y = 0.9 + 3.6 - (3.6 * s) / 2;
    });
    if (scanState !== "scan" && scanState !== "idle" && wall > scanUntil) scanState = trucks.some((t) => t.d.state === "gate") ? "scan" : "idle";
    if (scanState === "scan" && !trucks.some((t) => t.d.state === "gate")) scanState = "idle";
    const sc = scanState === "green" ? 0x2fd47f : scanState === "red" ? 0xff4d4d : scanState === "scan" ? 0xffb020 : 0x4f8cff;
    scanMat.color.setHex(sc);
    scanMat.emissive.setHex(sc);
    scanMat.emissiveIntensity = scanState === "scan" ? 1.2 + Math.sin(now / 90) * 0.8 : 1.5;

    const sel = trucks.find((t) => t.d.id === selected);
    ring.visible = !!sel;
    if (sel) {
      ring.position.set(sel.x, 0.12, sel.z);
      ring.scale.setScalar((1 + Math.sin(now / 300) * 0.04) * fade(sel.x));
    }

    controls.update();
    renderer.render(scene, camera);

    for (const t of trucks) {
      v3.set(t.x, 5.2, t.z).project(camera);
      const x = (v3.x * 0.5 + 0.5) * w;
      const y = (-v3.y * 0.5 + 0.5) * h;
      t.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
      t.el.style.opacity = fade(t.x) > 0.6 ? "1" : "0";
      const tag = TAG[t.d.state] || "go";
      if (t.el.dataset.s !== tag) t.el.dataset.s = tag;
      const on = t.d.id === selected ? "1" : "0";
      if (t.el.dataset.on !== on) t.el.dataset.on = on;
    }

    if (now - snapAt > 280) {
      snapAt = now;
      hooks.onSnapshot &&
        hooks.onSnapshot({
          deliveredToday,
          deliveries: deliveries.map((d) => ({
            id: d.id,
            si: d.si,
            dest: d.dest,
            km: d.km,
            driver: d.driver,
            plate: d.plate,
            pallets: d.pallets,
            weight: d.weight,
            state: d.state,
            progress: d.progress,
            dock: d.dock,
            licences: d.licences.map((l) => ({ ...l })),
          })),
        });
    }
  };
  raf = requestAnimationFrame(frame);

  const onVis = () => {
    last = performance.now();
  };
  document.addEventListener("visibilitychange", onVis);

  return {
    select(id) {
      selected = id;
    },
    dispose() {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      controls.dispose();
      trucks.forEach((t) => t.el.remove());
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (o.material.map) o.material.map.dispose();
          o.material.dispose();
        }
      });
      renderer.dispose();
    },
  };
}
