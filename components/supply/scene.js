/**
 * Command Instinct transit node: an isometric hub where every truck is a
 * shipment bound for (or from) Venezuela under an OFAC general license. At
 * the verdict gate the real per-license logic (engine.js) decides it: a pass
 * goes to the dock, a fail is pulled into the hold bay until the engine's
 * compliant substitute moves instead. The simulation lives here and React
 * only reads snapshots, so the list and the yard can never disagree.
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SCENARIOS, evaluate, substitutes } from "./engine";

const DOCK_X = [-3.5, 3, 9.5, 16];
const ROAD_Z = 14;
const LANE_Z = 9.6;
const DOCK_Z = 6.2;
const GATE_X = -31.5;
const BAY = { x: -19.5, z: 20 };

const C = { green: 0x00c71b, soft: 0x3fdd57, red: 0xe5654b, amber: 0xe6a12e, blue: 0x4a9ed6 };
// the order shipments arrive in: about three passes for every two fails
const ORDER = [0, 1, 2, 4, 3, 6, 8, 5, 10, 13, 7, 15, 0, 9, 2, 11, 4, 12, 6, 14];
const PASS_IDX = SCENARIOS.map((x, i) => i).filter((i) => !evaluate(SCENARIOS[i]).fail);
const FAIL_IDX = SCENARIOS.map((x, i) => i).filter((i) => evaluate(SCENARIOS[i]).fail);
const CARRIERS = ["Caribe Overland", "Magdalena Freight", "Andes Linehaul", "Istmo Logistics", "Bolivar Cargo"];

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
  const target = new THREE.Vector3(small ? 4 : -9, 0, 4);
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

  scene.add(new THREE.HemisphereLight(0xdff5e6, 0x0d1210, 2.4));
  const sun = new THREE.DirectionalLight(0xf2fff5, 2.6);
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

  box(world, 88, 0.8, 64, 0x070b09, 0, -1.6, 0, { cast: false });
  box(world, 86, 0.8, 62, 0x1a231e, 0, -0.8, 0, { cast: false });
  // roads sit on their own heights so nothing shares a plane with the ground
  box(world, 86, 0.05, 5.4, 0x0f1512, 0, 0, ROAD_Z, { cast: false });
  box(world, 86, 0.05, 4.6, 0x0f1512, 0, 0, -22, { cast: false });
  box(world, 44, 0.04, 9.6, 0x232e28, 4, 0, 6.6, { cast: false });
  for (let x = -41; x <= 41; x += 4) {
    box(world, 1.8, 0.03, 0.18, 0x4a5a50, x, 0.05, ROAD_Z, { cast: false });
    box(world, 1.8, 0.03, 0.18, 0x4a5a50, x, 0.05, -22, { cast: false });
  }
  // dock bays painted on the apron
  DOCK_X.forEach((x) => {
    box(world, 0.14, 0.03, 4.2, 0x1f8a35, x - 3.2, 0.04, 5.4, { cast: false });
    box(world, 0.14, 0.03, 4.2, 0x1f8a35, x + 3.2, 0.04, 5.4, { cast: false });
  });
  // holding bay, hatched in amber
  box(world, 15, 0.04, 5.4, 0x231d12, BAY.x - 0.5, 0, BAY.z, { cast: false });
  for (let i = 0; i < 7; i++) box(world, 0.22, 0.03, 4.6, 0xe6a12e, BAY.x - 7 + i * 2.2, 0.04, BAY.z, { cast: false }).rotation.y = 0.5;

  // warehouse
  const wh = new THREE.Group();
  world.add(wh);
  box(wh, 26, 6, 14, 0x2a3a31, 6, 0, -5);
  box(wh, 26.8, 0.45, 14.8, 0x1e2a24, 6, 6, -5);
  for (let x = -6; x <= 18; x += 2) box(wh, 0.22, 0.16, 14.2, 0x33443a, x, 6.45, -5, { cast: false });
  for (let i = 0; i < 4; i++) box(wh, 3.2, 0.2, 1.6, 0x0d3d1a, -2 + i * 5.4, 6.45, -8, { cast: false, mat: { emissive: 0x00c71b, emissiveIntensity: 0.9 } });
  box(wh, 26.4, 0.28, 2.6, 0x3a4a40, 6, 4.5, 3.1); // canopy over the docks
  for (let x = -6.6; x <= 18.6; x += 6.3) box(wh, 0.18, 4.5, 0.18, 0x4a5a50, x, 0, 4.2);
  box(wh, 26, 0.9, 0.5, 0x0d3d1a, 6, 0, 2.2); // dock platform
  const doors = DOCK_X.map((x, i) => {
    box(wh, 3.5, 3.9, 0.12, 0x1f8a35, x, 0.9, 2.02, { cast: false });
    box(wh, 3.1, 3.6, 0.1, 0x050806, x, 0.9, 2.06, { cast: false });
    const door = box(wh, 3.1, 3.6, 0.1, 0x93a89c, x, 0.9, 2.12, { cast: false });
    for (let k = 1; k < 5; k++) box(door, 3.1, 0.05, 0.02, 0x607064, 0, -1.8 + k * 0.72 - 0.025, 0.06, { cast: false });
    const n = textPlane(String(i + 1), 0.9, 0.9, "#3fdd57", "#08260f");
    n.position.set(x, 5.25, 2.03);
    wh.add(n);
    return { mesh: door, open: 0 };
  });
  const sign = textPlane("COMMAND INSTINCT", 11.5, 1.2, "#3fdd57");
  sign.position.set(19.02, 4.2, -5);
  sign.rotation.y = Math.PI / 2;
  wh.add(sign);
  for (let i = 0; i < 5; i++) box(wh, 0.08, 1.1, 1.7, 0x0d3d1a, 19.03, 1.4, -10.4 + i * 2.7, { cast: false });
  // office annex
  box(wh, 6, 3.8, 7, 0x33443a, -10, 0, -6);
  box(wh, 6.4, 0.3, 7.4, 0x1e2a24, -10, 3.8, -6);
  for (let i = 0; i < 3; i++) box(wh, 1.3, 1.5, 0.08, 0x0d3d1a, -11.8 + i * 1.8, 1.5, -2.47, { cast: false, mat: { emissive: 0x3fdd57, emissiveIntensity: 0.5 } });
  box(wh, 1.2, 2.2, 0.08, 0x0d1210, -8.2, 0, -2.47, { cast: false });

  // licence gate: booth + scanner arch + traffic light bar
  const gate = new THREE.Group();
  world.add(gate);
  box(gate, 2.6, 2.6, 2.6, 0x33443a, -28, 0, 18.4);
  box(gate, 3, 0.3, 3, 0x0d3d1a, -28, 2.6, 18.4);
  box(gate, 1.6, 1, 0.08, 0x0d3d1a, -28, 1.2, 17.06, { cast: false, mat: { emissive: 0x3fdd57, emissiveIntensity: 0.5 } });
  box(gate, 0.45, 5.6, 0.45, 0x3a4a40, -28, 0, 10.9);
  box(gate, 0.45, 5.6, 0.45, 0x3a4a40, -28, 0, 17.0);
  box(gate, 0.6, 0.6, 6.6, 0x3a4a40, -28, 5.4, 13.95);
  const scanMat = new THREE.MeshStandardMaterial({ color: C.blue, emissive: C.blue, emissiveIntensity: 1.4 });
  box(gate, 0.2, 0.22, 5.4, scanMat, -27.66, 5.55, 13.95, { cast: false });
  const gateSign = textPlane("VERDICT GATE", 5.2, 0.62, "#3fdd57", "#141b18");
  gateSign.position.set(-27.68, 6.5, 13.95);
  gateSign.rotation.y = Math.PI / 2;
  gate.add(gateSign);
  box(gate, 0.6, 0.7, 6.6, 0x141b18, -28, 6.15, 13.95, { cast: false });
  let scanState = "idle";
  let scanUntil = 0;

  // container stacks
  const CONT = [0x1f6b2c, 0x7a5a1c, 0x2c5f80, 0x4a5a50, 0x7a3325, 0x0d3d1a];
  [[-36, -6], [-36, -9.2], [-29, -6], [-29, -9.2], [-22.5, -9.2]].forEach(([x, z], i) => {
    box(world, 6, 2.5, 2.5, CONT[i % CONT.length], x, 0, z);
    if (i !== 2 && i !== 4) box(world, 6, 2.5, 2.5, CONT[(i + 3) % CONT.length], x, 2.5, z);
  });
  // pallet yard
  const carton = [0x8a6c42, 0x7a5d36, 0x9a7b4e];
  for (const px of [25, 29, 33, 37]) {
    for (let pz = -9; pz <= 0; pz += 3) {
      box(world, 1.9, 0.18, 1.9, 0x5a4428, px, 0, pz);
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
    box(world, 0.3 * s, 0.9 * s, 0.3 * s, 0x3a3026, x, 0, z);
    const top = new THREE.Mesh(new THREE.ConeGeometry(1.1 * s, 2.6 * s, 7), mat(0x1f7a33));
    top.position.set(x, 0.9 * s + 1.3 * s, z);
    top.castShadow = true;
    world.add(top);
  };
  for (let x = -40; x <= 40; x += 6.5) tree(x + rand(-0.8, 0.8), -27.5 + rand(-0.6, 0.6), rand(0.85, 1.2));
  for (let x = 2; x <= 40; x += 5.5) tree(x, 26 + rand(-1, 1), rand(0.8, 1.15));
  [[-40, 26], [-36, 27.5], [-40, -15], [-16, -15], [-18, -3]].forEach(([x, z]) => tree(x, z));
  for (const x of [-20, -2, 16, 34]) {
    box(world, 0.16, 5, 0.16, 0x4a5a50, x, 0, 17.4);
    box(world, 0.9, 0.14, 0.3, 0xe8f0eb, x, 4.9, 17.0, { mat: { emissive: 0xc8ffd2, emissiveIntensity: 1.2 } });
  }
  // staff cars by the office
  [0x93a89c, 0x33443a, 0x607064].forEach((c, i) => {
    const g = new THREE.Group();
    box(g, 2.3, 0.6, 1.2, c, 0, 0.25, 0);
    box(g, 1.2, 0.5, 1.1, 0x0d1210, -0.1, 0.85, 0);
    g.position.set(-15.5 + i * 2.0, 0, -0.4);
    g.rotation.y = Math.PI / 2;
    world.add(g);
  });

  // ---------------------------------------------------------------- vehicles
  const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.34, 14);
  wheelGeo.rotateX(Math.PI / 2);
  const wheel = (parent, x, z, r = 1) => {
    const m = new THREE.Mesh(wheelGeo, mat(0x050806));
    m.scale.setScalar(r);
    m.position.set(x, 0.5 * r, z);
    m.castShadow = true;
    parent.add(m);
  };
  const makeTruck = () => {
    const g = new THREE.Group();
    // the stripe carries the verdict: amber pending, green cleared, red blocked, blue rerouted
    const stripe = new THREE.MeshStandardMaterial({ color: C.amber, emissive: C.amber, emissiveIntensity: 0.55, roughness: 0.6 });
    box(g, 8.2, 0.3, 1.5, 0x0d1210, -0.3, 0.55, 0);
    box(g, 6.3, 2.55, 2.3, 0xc9d4cd, -1.25, 0.95, 0);
    box(g, 6.32, 0.5, 2.32, stripe, -1.25, 1.3, 0, { cast: false });
    box(g, 6.32, 0.08, 2.32, 0x93a89c, -1.25, 3.5, 0, { cast: false });
    box(g, 1.9, 2.25, 2.2, 0x4a5a50, 3.0, 0.7, 0);
    box(g, 0.08, 0.9, 1.9, 0x0d1210, 3.96, 1.8, 0, { cast: false });
    box(g, 1.2, 0.8, 2.22, 0x0d1210, 3.1, 1.85, 0, { cast: false });
    box(g, 0.3, 0.35, 2.25, 0x1a231e, 3.9, 0.55, 0, { cast: false });
    for (const x of [-3.5, -2.4, 2.9]) {
      wheel(g, x, 1.02);
      wheel(g, x, -1.02);
    }
    box(g, 0.5, 0.22, 0.5, stripe, 3.0, 2.95, 0, { cast: false });
    g.userData.stripe = stripe;
    return g;
  };
  const makeForklift = () => {
    const g = new THREE.Group();
    box(g, 1.5, 0.75, 1.0, 0xe6a12e, -0.2, 0.25, 0);
    box(g, 0.7, 0.9, 0.9, 0x1a231e, -0.5, 1.0, 0);
    box(g, 0.12, 2.1, 0.9, 0x1a231e, 0.62, 0.15, 0);
    box(g, 0.9, 0.07, 0.14, 0x565f75, 1.1, 0.22, 0.28);
    box(g, 0.9, 0.07, 0.14, 0x565f75, 1.1, 0.22, -0.28);
    wheel(g, 0.25, 0.5, 0.55);
    wheel(g, 0.25, -0.5, 0.55);
    wheel(g, -0.7, 0.5, 0.5);
    wheel(g, -0.7, -0.5, 0.5);
    const load = new THREE.Group();
    box(load, 0.95, 0.12, 0.95, 0x5a4428, 1.1, 0.3, 0);
    box(load, 0.85, 0.75, 0.85, 0x9a7b4e, 1.1, 0.42, 0);
    g.add(load);
    g.userData.load = load;
    return g;
  };
  const makeVan = (color) => {
    const g = new THREE.Group();
    box(g, 3.2, 1.5, 1.5, color, 0, 0.4, 0);
    box(g, 0.9, 0.6, 1.52, 0x0d1210, 1.0, 1.2, 0, { cast: false });
    for (const x of [-1, 1]) {
      wheel(g, x, 0.7, 0.62);
      wheel(g, x, -0.7, 0.62);
    }
    return g;
  };

  const ring = new THREE.Mesh(new THREE.RingGeometry(4.9, 5.4, 48), new THREE.MeshBasicMaterial({ color: C.soft, transparent: true, opacity: 0.9, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.12;
  ring.visible = false;
  world.add(ring);

  // -------------------------------------------------------------- simulation
  let seq = 4410;
  let turn = 0;
  let verdictsToday = 212;
  let clearedToday = 131;
  let whToday = 3.07;
  const docks = [null, null, null, null];
  const trucks = [];
  let selected = null;

  const newDelivery = (wait, want) => {
    // `want` forces a pass or a fail for the opening state; otherwise follow ORDER
    let idx;
    if (want === true) idx = pick(PASS_IDX);
    else if (want === false) idx = pick(FAIL_IDX);
    else idx = ORDER[turn++ % ORDER.length];
    const sc = SCENARIOS[idx];
    const verdict = evaluate(sc);
    const tokens = Math.round(rand(340, 520));
    return {
      id: `CI-${++seq}`,
      sc,
      verdict,
      option: verdict.fail ? substitutes(sc)[0] : null,
      carrier: pick(CARRIERS),
      plate: `${pick("KTVW")}${pick("ABDKX")}${pick("LMRS")}-${Math.floor(rand(100, 999))}`,
      units: Math.floor(rand(6, 20)),
      tokens,
      wh: +(tokens * rand(0.000028, 0.000036)).toFixed(4),
      peakW: Math.round(rand(96, 142)),
      evaluated: false,
      rerouted: false,
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
  const emit = (kind, d, extra) => hooks.onEvent && hooks.onEvent({ kind, id: d.id, gl: d.verdict.license.name, at: Date.now(), ...extra });
  const mark = (d) => {
    d.evaluated = true;
    verdictsToday++;
    whToday += d.wh;
    if (!d.verdict.fail) clearedToday++;
  };

  const spawnTruck = (d, x = -47, z = ROAD_Z) => {
    const g = makeTruck();
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
    const mk = (pass) => {
      const d = newDelivery(0, pass);
      d.evaluated = true;
      return d;
    };
    const a = mk(true);
    a.state = "loading"; a.dock = 1; docks[1] = a; a.dur = a.units * 1.3; a.t = a.dur * 0.45;
    spawnTruck(a, DOCK_X[1] + 1.2, DOCK_Z);
    const b = mk(true);
    b.state = "loading"; b.dock = 3; docks[3] = b; b.dur = b.units * 1.3; b.t = b.dur * 0.1;
    spawnTruck(b, DOCK_X[3] + 1.2, DOCK_Z);
    const c = mk(true);
    c.state = "toDock"; c.dock = 0; docks[0] = c;
    spawnTruck(c, -22, ROAD_Z).path = dockPath(0);
    const e = newDelivery(0, false);
    e.state = "inbound";
    spawnTruck(e, -43, ROAD_Z).path = [{ x: GATE_X, z: ROAD_Z, stop: true }];
    const f = mk(true); f.state = "transit"; f.dur = 46; f.progress = 0.55;
    const h = mk(false); h.rerouted = true; h.state = "transit"; h.dur = 52; h.progress = 0.2;
    const j = mk(true); j.state = "delivered"; j.progress = 1; j.t = 4;
    deliveries.push(a, b, c, e, f, h, j, newDelivery(7), newDelivery(16), newDelivery(27));
  }

  const forklifts = [0, 1, 2].map((i) => {
    const g = makeForklift();
    world.add(g);
    const aisle = i === 2 ? 31 : 27;
    return { g, x: aisle + (i === 1 ? 0.01 : 0), z: 3.4 - i * 3.2, heading: 0, path: [], job: -1, aisle, carrying: i % 2 === 0, pause: 0 };
  });
  const vans = [0, 1, 2, 3].map((i) => {
    const g = makeVan([0x93a89c, 0x4a5a50, 0x607064, 0x33443a][i]);
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
        if (!d.evaluated) {
          mark(d);
          if (d.verdict.fail) {
            const why = d.verdict.checks.find((k) => k[0] === "no");
            d.state = "held";
            d.phase = "toBay";
            t.path = [{ x: -27, z: 14.7 }, { x: -23.8, z: 18.6 }, { x: BAY.x, z: BAY.z, stop: true }];
            scanState = "red";
            scanUntil = now + 3200;
            emit("blocked", d, { why: why[1] });
            break;
          }
        }
        const k = freeDock();
        if (k < 0) break;
        docks[k] = d;
        d.dock = k;
        d.state = "toDock";
        t.path = dockPath(k);
        scanState = "green";
        scanUntil = now + 3200;
        const note = d.verdict.checks.find((x) => x[0] === "wn");
        emit(note ? "note" : "cleared", d, note ? { why: note[1] } : undefined);
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
            d.rerouted = true;
            docks[k] = d;
            d.dock = k;
            d.state = "toDock";
            d.phase = "";
            t.path = [{ x: -15.2, z: 19.4 }, { x: -13, z: 14.6 }, ...dockPath(k).slice(1)];
            emit("rerouted", d, { option: d.option[0] });
          }
        }
        break;
      case "toDock":
        if (!t.path.length) {
          d.state = "loading";
          d.t = 0;
          d.dur = d.units * 1.3;
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
          emit("loaded", d, { units: d.units, dest: d.sc.to });
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
          emit("delivered", d, { dest: d.sc.to });
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
      const d = t.d;
      const blink = Math.sin(now / 160) > 0;
      const col = !d.evaluated ? C.amber : d.state === "held" ? C.red : d.rerouted ? C.blue : C.green;
      const st = t.g.userData.stripe;
      st.color.setHex(col);
      st.emissive.setHex(col);
      st.emissiveIntensity = d.state === "held" ? (blink ? 1.3 : 0.25) : d.state === "gate" ? 0.5 + Math.sin(now / 110) * 0.4 : 0.55;
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
    const sc = scanState === "green" ? C.green : scanState === "red" ? C.red : scanState === "scan" ? C.amber : C.blue;
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
      const tag = !t.d.evaluated ? "scan" : t.d.state === "held" ? "held" : t.d.rerouted ? "sub" : "ok";
      if (t.el.dataset.s !== tag) t.el.dataset.s = tag;
      const on = t.d.id === selected ? "1" : "0";
      if (t.el.dataset.on !== on) t.el.dataset.on = on;
    }

    if (now - snapAt > 280) {
      snapAt = now;
      hooks.onSnapshot &&
        hooks.onSnapshot({
          verdictsToday,
          clearedToday,
          whToday,
          deliveries: deliveries.map((d) => ({
            id: d.id,
            sc: d.sc,
            gl: d.verdict.license.name,
            china: d.verdict.license.china,
            scope: d.verdict.license.scope,
            checks: d.evaluated ? d.verdict.checks : null,
            fail: d.evaluated ? d.verdict.fail : null,
            option: d.evaluated ? d.option : null,
            rerouted: d.rerouted,
            carrier: d.carrier,
            plate: d.plate,
            units: d.units,
            tokens: d.tokens,
            wh: d.wh,
            peakW: d.peakW,
            state: d.state,
            progress: d.progress,
            dock: d.dock,
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
