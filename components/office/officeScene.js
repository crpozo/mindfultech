// Office demo scene — plain JS on purpose (allowJs): OfficeDemo.tsx imports it
// lazily so three.js and the addons stay out of the page's first-load bundle.
//
// A sunlit studio office (wood floor, pendant lamps, floor-to-ceiling windows, plants)
// with six procedural "astronaut" bots, one per role. Each bot owns a desk and
// runs a small state machine: type at the desk, walk the aisles to the coffee
// machine / whiteboard / lounge / a colleague, chat there, walk back. Walking
// follows a grid of aisle waypoints so nobody clips through furniture.
// Monitors show a live canvas texture per role. Clicking a bot selects it and
// the camera glides to it; the React side draws the chat + screen panel.
//
// Quality: MSAA, device pixel ratio up to 2, PCF soft shadows, ACES tone
// mapping, physically based materials under a RoomEnvironment probe.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// ---------------------------------------------------------------- layout ----
// metres; +z is towards the camera, the window wall is at z = -5.5
const DESKS = [
  { x: -4.2, z: 1.3 },
  { x: 0, z: 1.3 },
  { x: 4.2, z: 1.3 },
  { x: -4.2, z: -2.2 },
  { x: 0, z: -2.2 },
  { x: 4.2, z: -2.2 },
];
const DESK_W = 1.7;
const DESK_D = 0.75;
const DESK_H = 1.0; // standing desks — the bots stand behind them, facing +z
const STAND_OFF = 0.72; // bot stands this far behind the desk centre (towards -z)

// aisle waypoints: three horizontal aisles × seven columns
const AISLE_X = [-6.9, -4.2, -2.1, 0, 2.1, 4.2, 6.9];
const AISLE_Z = [-4.3, -0.55, 3.2];
// columns free of desks, where a bot can cross between aisles
const CROSS_X = new Set([-6.9, -2.1, 2.1, 6.9]);

// places a bot can go to, with the aisle node they hang off and a facing yaw
const PLACES = {
  coffee: { x: -6.6, z: -4.45, node: [-6.9, -4.3], yaw: Math.PI, label: "coffee" },
  board: { x: 6.3, z: -4.55, node: [6.9, -4.3], yaw: Math.PI, label: "board" },
  meeting: { x: 6.85, z: -1.05, node: [6.9, -0.55], yaw: Math.PI / 2, label: "meeting" },
  meeting2: { x: 6.85, z: 0.05, node: [6.9, -0.55], yaw: Math.PI / 2, label: "meeting" },
  lounge: { x: 6.2, z: 3.9, node: [6.9, 3.2], yaw: Math.PI / 2, label: "lounge" },
  printer: { x: -6.55, z: 3.4, node: [-6.9, 3.2], yaw: -Math.PI / 2, label: "printer" },
  plant: { x: -2.1, z: -4.6, node: [-2.1, -4.3], yaw: Math.PI, label: "plant" },
  plant2: { x: 2.1, z: -4.6, node: [2.1, -4.3], yaw: Math.PI, label: "plant" },
};

const WALK_SPEED = 1.05;
const TURN_SPEED = 6;

// ------------------------------------------------------------ utilities ----
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const lerp = (a, b, t) => a + (b - a) * t;
const nodeKey = (x, z) => `${x},${z}`;

function angleLerp(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

// BFS over the aisle grid
const NODES = [];
const ADJ = new Map();
for (const z of AISLE_Z)
  for (const x of AISLE_X) {
    NODES.push([x, z]);
    ADJ.set(nodeKey(x, z), []);
  }
for (let zi = 0; zi < AISLE_Z.length; zi++)
  for (let xi = 0; xi < AISLE_X.length; xi++) {
    const x = AISLE_X[xi], z = AISLE_Z[zi];
    if (xi + 1 < AISLE_X.length) {
      const nx = AISLE_X[xi + 1];
      ADJ.get(nodeKey(x, z)).push([nx, z]);
      ADJ.get(nodeKey(nx, z)).push([x, z]);
    }
    if (zi + 1 < AISLE_Z.length && CROSS_X.has(x)) {
      const nz = AISLE_Z[zi + 1];
      ADJ.get(nodeKey(x, z)).push([x, nz]);
      ADJ.get(nodeKey(x, nz)).push([x, z]);
    }
  }
function findPath(from, to) {
  const start = nodeKey(from[0], from[1]);
  const goal = nodeKey(to[0], to[1]);
  if (start === goal) return [to];
  const prev = new Map([[start, null]]);
  const q = [from];
  while (q.length) {
    const cur = q.shift();
    const ck = nodeKey(cur[0], cur[1]);
    if (ck === goal) break;
    for (const n of ADJ.get(ck)) {
      const nk = nodeKey(n[0], n[1]);
      if (prev.has(nk)) continue;
      prev.set(nk, cur);
      q.push(n);
    }
  }
  const out = [];
  let c = to;
  while (c) {
    out.unshift(c);
    c = prev.get(nodeKey(c[0], c[1]));
  }
  return out;
}

// ------------------------------------------------------------- textures ----
function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function woodTexture() {
  const c = makeCanvas(1024, 1024);
  const g = c.getContext("2d");
  g.fillStyle = "#b98a5c";
  g.fillRect(0, 0, 1024, 1024);
  const plankH = 128;
  for (let row = 0; row < 8; row++) {
    const offset = (row % 2) * 300;
    for (let i = -1; i < 4; i++) {
      const x = i * 400 + offset;
      const tone = 0.9 + Math.random() * 0.2;
      g.fillStyle = `rgb(${Math.round(190 * tone)},${Math.round(140 * tone)},${Math.round(95 * tone)})`;
      g.fillRect(x, row * plankH, 396, plankH - 3);
      // grain
      g.strokeStyle = "rgba(90,55,25,0.16)";
      g.lineWidth = 1.5;
      for (let k = 0; k < 14; k++) {
        const y = row * plankH + 6 + Math.random() * (plankH - 12);
        g.beginPath();
        g.moveTo(x, y);
        g.bezierCurveTo(x + 130, y + rnd(-6, 6), x + 260, y + rnd(-6, 6), x + 396, y + rnd(-4, 4));
        g.stroke();
      }
    }
  }
  g.fillStyle = "rgba(60,35,15,0.35)";
  for (let row = 0; row < 8; row++) g.fillRect(0, row * plankH + plankH - 3, 1024, 3);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 5);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function skyTexture() {
  const c = makeCanvas(1024, 512);
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#9fd0f5");
  grad.addColorStop(0.55, "#dcefff");
  grad.addColorStop(0.72, "#e9f3e2");
  grad.addColorStop(1, "#8fbf7a");
  g.fillStyle = grad;
  g.fillRect(0, 0, 1024, 512);
  // distant tree line
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 1024, r = rnd(25, 70), y = 372 + rnd(-10, 14);
    const gg = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    gg.addColorStop(0, "#9ccf7c");
    gg.addColorStop(1, "#4f8a46");
    g.fillStyle = gg;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function rugTexture() {
  const c = makeCanvas(512, 512);
  const g = c.getContext("2d");
  g.fillStyle = "#e8e2d6";
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#69c7b9";
  g.lineWidth = 10;
  g.strokeRect(24, 24, 464, 464);
  g.strokeStyle = "#cfc6b6";
  g.lineWidth = 4;
  for (let i = 60; i < 460; i += 40) {
    g.beginPath();
    g.moveTo(i, 60);
    g.lineTo(i, 452);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Live monitor content per role, drawn on a small canvas every ~250 ms. */
function makeScreen(kind, accent) {
  const W = 512, H = 320;
  const c = makeCanvas(W, H);
  const g = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  let frame = 0;
  const bars = Array.from({ length: 14 }, () => rnd(0.3, 1));
  const draw = () => {
    frame++;
    g.fillStyle = kind === "dev" ? "#14161c" : "#f5f7fa";
    g.fillRect(0, 0, W, H);
    // top bar
    g.fillStyle = kind === "dev" ? "#1e2129" : "#ffffff";
    g.fillRect(0, 0, W, 34);
    g.fillStyle = accent;
    g.beginPath();
    g.arc(20, 17, 8, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = kind === "dev" ? "#3a3f4b" : "#dfe4ea";
    g.fillRect(40, 12, 120, 10);
    g.fillRect(W - 90, 12, 60, 10);
    if (kind === "dev") {
      // terminal lines
      const cols = ["#7dd3a5", "#9ab6ff", "#e6e6e6", "#f5c46b"];
      for (let i = 0; i < 11; i++) {
        const seed = (i * 37 + Math.floor(frame / 3)) % 17;
        g.fillStyle = cols[(i + seed) % cols.length];
        const w = 90 + ((seed * 53 + i * 71) % 300);
        g.fillRect(24 + (i % 3) * 18, 54 + i * 22, w, 9);
      }
      const blink = Math.floor(frame / 2) % 2 === 0;
      if (blink) {
        g.fillStyle = "#e6e6e6";
        g.fillRect(24, 54 + 11 * 22, 10, 12);
      }
      g.fillStyle = "#2fb36b";
      g.fillRect(24, H - 30, 180, 12);
    } else if (kind === "finance") {
      // spreadsheet grid
      g.strokeStyle = "#e1e6ec";
      g.lineWidth = 1;
      for (let y = 46; y < H; y += 24) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y);
        g.stroke();
      }
      for (let x = 0; x < W; x += 96) {
        g.beginPath();
        g.moveTo(x, 34);
        g.lineTo(x, H);
        g.stroke();
      }
      for (let r = 0; r < 11; r++)
        for (let cI = 0; cI < 5; cI++) {
          const filled = (r * 5 + cI) < (frame % 60);
          g.fillStyle = filled ? (cI === 4 ? accent : "#5c6470") : "#eef1f5";
          g.fillRect(cI * 96 + 10, 52 + r * 24, 40 + ((r * 13 + cI * 29) % 40), 8);
        }
    } else if (kind === "social") {
      // post cards + bar chart
      for (let i = 0; i < 3; i++) {
        g.fillStyle = "#ffffff";
        g.fillRect(20 + i * 160, 50, 146, 110);
        g.fillStyle = i === Math.floor(frame / 8) % 3 ? accent : "#e9d9ff";
        g.fillRect(28 + i * 160, 58, 130, 60);
        g.fillStyle = "#c8ccd4";
        g.fillRect(28 + i * 160, 126, 100, 8);
        g.fillRect(28 + i * 160, 142, 70, 8);
      }
      for (let i = 0; i < 14; i++) {
        bars[i] = THREE.MathUtils.clamp(bars[i] + rnd(-0.05, 0.05), 0.2, 1);
        g.fillStyle = i === 13 ? accent : "#cbb7ee";
        const h = bars[i] * 110;
        g.fillRect(24 + i * 34, H - 20 - h, 22, h);
      }
    } else if (kind === "support") {
      // ticket list with a typing reply
      for (let i = 0; i < 6; i++) {
        const active = i === Math.floor(frame / 10) % 6;
        g.fillStyle = active ? "#e6f6f3" : "#ffffff";
        g.fillRect(16, 46 + i * 44, 200, 38);
        g.fillStyle = active ? accent : "#c4cad3";
        g.beginPath();
        g.arc(34, 65 + i * 44, 8, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#6b7280";
        g.fillRect(52, 58 + i * 44, 120, 7);
        g.fillStyle = "#d4d9e0";
        g.fillRect(52, 70 + i * 44, 80, 6);
      }
      g.fillStyle = "#ffffff";
      g.fillRect(232, 46, 264, 260);
      g.fillStyle = "#374151";
      const lines = 7;
      const progress = (frame % 40) / 40;
      for (let i = 0; i < lines; i++) {
        const full = 220;
        const w = i < progress * lines ? full - ((i * 61) % 90) : i === Math.floor(progress * lines) ? ((progress * lines) % 1) * full : 0;
        if (w > 0) g.fillRect(248, 66 + i * 20, w, 8);
      }
      g.fillStyle = accent;
      g.fillRect(248, 250, 90, 26);
    } else if (kind === "ops") {
      // calendar week
      for (let d = 0; d < 5; d++) {
        g.fillStyle = "#ffffff";
        g.fillRect(16 + d * 98, 46, 90, 260);
        g.fillStyle = "#9aa3ad";
        g.fillRect(24 + d * 98, 54, 40, 7);
        const n = 2 + ((d * 7 + 3) % 3);
        for (let e = 0; e < n; e++) {
          const on = (d * 3 + e) === Math.floor(frame / 6) % 15;
          g.fillStyle = on ? accent : ["#dcefd0", "#d6e8f7", "#f6e2cf"][(d + e) % 3];
          g.fillRect(22 + d * 98, 72 + e * 64 + ((d * e) % 20), 78, 44);
        }
      }
    } else {
      // sales: pipeline columns
      const stages = 4;
      for (let s = 0; s < stages; s++) {
        g.fillStyle = "#ffffff";
        g.fillRect(16 + s * 122, 46, 114, 262);
        g.fillStyle = "#9aa3ad";
        g.fillRect(24 + s * 122, 54, 60, 7);
        const cards = 3 + ((s * 5) % 3);
        for (let k = 0; k < cards; k++) {
          const hot = (s * 7 + k) === Math.floor(frame / 5) % 20;
          g.fillStyle = hot ? "#fff2d6" : "#f1f4f8";
          g.fillRect(22 + s * 122, 70 + k * 48, 102, 40);
          g.fillStyle = hot ? accent : "#c4cad3";
          g.fillRect(28 + s * 122, 78 + k * 48, 60, 7);
          g.fillStyle = "#dfe4ea";
          g.fillRect(28 + s * 122, 92 + k * 48, 40, 6);
        }
      }
    }
    tex.needsUpdate = true;
  };
  draw();
  return { tex, draw };
}

function labelSprite(name, role, accent) {
  const c = makeCanvas(512, 176);
  const g = c.getContext("2d");
  const r = 44;
  g.fillStyle = "rgba(14,13,18,0.86)";
  g.beginPath();
  g.roundRect(8, 8, 496, 140, r);
  g.fill();
  g.fillStyle = accent;
  g.beginPath();
  g.arc(64, 78, 22, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#ffffff";
  g.font = "600 52px Outfit, system-ui, sans-serif";
  g.textBaseline = "middle";
  g.fillText(name, 104, 58);
  g.fillStyle = "rgba(255,255,255,0.72)";
  g.font = "400 34px Outfit, system-ui, sans-serif";
  g.fillText(role, 106, 106);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sp.scale.set(1.45, 0.5, 1);
  sp.renderOrder = 10;
  return sp;
}

// ------------------------------------------------------------ materials ----
const M = {
  wall: new THREE.MeshStandardMaterial({ color: "#f3efe8", roughness: 0.95 }),
  beam: new THREE.MeshStandardMaterial({ color: "#5b3f2c", roughness: 0.8 }),
  frame: new THREE.MeshStandardMaterial({ color: "#2b2b2f", roughness: 0.5, metalness: 0.6 }),
  glass: new THREE.MeshPhysicalMaterial({
    color: "#dfefff",
    roughness: 0.02,
    metalness: 0,
    transparent: true,
    opacity: 0.16,
    clearcoat: 1,
    depthWrite: false,
  }),
  deskTop: new THREE.MeshStandardMaterial({ color: "#c69a68", roughness: 0.55 }),
  deskLeg: new THREE.MeshStandardMaterial({ color: "#2a2a2e", roughness: 0.4, metalness: 0.7 }),
  monitor: new THREE.MeshStandardMaterial({ color: "#1c1d22", roughness: 0.35, metalness: 0.5 }),
  keyboard: new THREE.MeshStandardMaterial({ color: "#e9e9ec", roughness: 0.6 }),
  key: new THREE.MeshStandardMaterial({ color: "#c9cbd2", roughness: 0.7 }),
  mugs: ["#69c7b9", "#f2a65a", "#e26d5c", "#6f5ae0", "#4f8ad6", "#f4d98a"].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 })
  ),
  pot: new THREE.MeshStandardMaterial({ color: "#d9c3a5", roughness: 0.9 }),
  leaf: new THREE.MeshStandardMaterial({ color: "#3f8f4f", roughness: 0.7 }),
  leaf2: new THREE.MeshStandardMaterial({ color: "#5aae5e", roughness: 0.7 }),
  soil: new THREE.MeshStandardMaterial({ color: "#3b2a1e", roughness: 1 }),
  sofa: new THREE.MeshStandardMaterial({ color: "#6f8f8b", roughness: 0.95 }),
  sofa2: new THREE.MeshStandardMaterial({ color: "#5c7a76", roughness: 0.95 }),
  lampShade: new THREE.MeshStandardMaterial({ color: "#1f1c19", roughness: 0.9, side: THREE.DoubleSide }),
  lampBulb: new THREE.MeshStandardMaterial({ color: "#fff1cf", emissive: "#ffd9a0", emissiveIntensity: 2.2 }),
  white: new THREE.MeshStandardMaterial({ color: "#f7f7f8", roughness: 0.6 }),
  steel: new THREE.MeshStandardMaterial({ color: "#9aa0a8", roughness: 0.35, metalness: 0.8 }),
  dark: new THREE.MeshStandardMaterial({ color: "#26262b", roughness: 0.6 }),
  board: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.35 }),
  book: ["#e26d5c", "#4f8ad6", "#f2c14e", "#69c7b9", "#6f5ae0", "#2f3b4a"].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 })
  ),
  eye: new THREE.MeshStandardMaterial({ color: "#1a1a22", roughness: 0.3 }),
  eyeHi: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.2 }),
  visor: new THREE.MeshPhysicalMaterial({
    color: "#dff0ff",
    roughness: 0.08,
    metalness: 0,
    transparent: true,
    opacity: 0.13,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
    envMapIntensity: 0.35,
    depthWrite: false,
  }),
};

function box(w, h, d, mat, x = 0, y = 0, z = 0, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}
function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 24) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
function sph(r, mat, x = 0, y = 0, z = 0, seg = 24) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- office ----
function buildOffice(scene, bots) {
  const room = new THREE.Group();
  scene.add(room);

  // floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(16.4, 20),
    new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.55, metalness: 0.02 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = 4.3;
  floor.receiveShadow = true;
  room.add(floor);

  // walls: back (windows) + sides; no front wall or ceiling so the camera sees in
  const H = 4;
  const sideL = box(0.2, H, 20, M.wall, -8.3, H / 2, 4.3);
  const sideR = box(0.2, H, 20, M.wall, 8.3, H / 2, 4.3);
  room.add(sideL, sideR);
  // baseboards
  room.add(box(0.06, 0.12, 20, M.dark, -8.18, 0.06, 4.3, false), box(0.06, 0.12, 20, M.dark, 8.18, 0.06, 4.3, false));

  // back wall: low sill, pillars between window panes, lintel
  const wz = -5.6;
  room.add(box(16.6, 0.5, 0.25, M.wall, 0, 0.25, wz));
  room.add(box(16.6, 0.4, 0.25, M.wall, 0, H - 0.2, wz));
  const panes = 5;
  const paneW = 16.4 / panes;
  for (let i = 0; i <= panes; i++) {
    const x = -8.2 + i * paneW;
    room.add(box(0.14, H, 0.2, M.frame, x, H / 2, wz));
  }
  for (let i = 0; i < panes; i++) {
    const x = -8.2 + paneW * (i + 0.5);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(paneW - 0.14, H - 0.9), M.glass);
    glass.position.set(x, 0.5 + (H - 0.9) / 2, wz);
    room.add(glass);
    // horizontal mullion
    room.add(box(paneW, 0.06, 0.18, M.frame, x, 2.2, wz));
  }
  // the outside: sky backdrop + hedge + trees
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshBasicMaterial({ map: skyTexture() }));
  sky.position.set(0, 6, -13);
  scene.add(sky);
  const hedge = box(20, 1.1, 1.2, M.leaf2, 0, 0.55, -7.2);
  scene.add(hedge);
  for (let i = 0; i < 9; i++) {
    const x = -9 + i * 2.3 + rnd(-0.4, 0.4);
    const z = -8.6 - rnd(0, 1.6);
    const h = rnd(2.2, 3.4);
    const trunk = cyl(0.09, 0.13, h, M.beam, x, h / 2, z, 10);
    const crown = sph(rnd(0.9, 1.4), i % 2 ? M.leaf : M.leaf2, x, h + 0.5, z, 20);
    crown.scale.y = 1.25;
    scene.add(trunk, crown);
  }
  // sun patches on the floor come from the directional light through the glass

  // pendant lamps on long cords (the camera looks in from above, so no ceiling)
  const lamps = [];
  for (const [x, z] of [[-4.2, -0.4], [0, -0.4], [4.2, -0.4], [-6.4, 3.0], [6.4, 3.0]]) {
    const cord = cyl(0.008, 0.008, 2.4, M.dark, x, 3.75, z, 6);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.32, 32, 1, true), M.lampShade);
    shade.position.set(x, 2.55, z);
    shade.castShadow = true;
    const bulb = sph(0.07, M.lampBulb, x, 2.47, z, 12);
    bulb.castShadow = false;
    const light = new THREE.PointLight("#ffd9a8", 6, 7, 2);
    light.position.set(x, 2.4, z);
    room.add(cord, shade, bulb, light);
    lamps.push(light);
  }

  // desks + monitors (one per bot)
  const screens = [];
  bots.forEach((bot, i) => {
    const d = DESKS[i];
    const g = new THREE.Group();
    g.position.set(d.x, 0, d.z);
    g.add(box(DESK_W, 0.05, DESK_D, M.deskTop, 0, DESK_H, 0));
    g.add(box(0.06, DESK_H, 0.06, M.deskLeg, -DESK_W / 2 + 0.12, DESK_H / 2, -DESK_D / 2 + 0.1));
    g.add(box(0.06, DESK_H, 0.06, M.deskLeg, DESK_W / 2 - 0.12, DESK_H / 2, -DESK_D / 2 + 0.1));
    g.add(box(0.06, DESK_H, 0.06, M.deskLeg, -DESK_W / 2 + 0.12, DESK_H / 2, DESK_D / 2 - 0.1));
    g.add(box(0.06, DESK_H, 0.06, M.deskLeg, DESK_W / 2 - 0.12, DESK_H / 2, DESK_D / 2 - 0.1));
    g.add(box(DESK_W - 0.3, 0.05, 0.05, M.deskLeg, 0, 0.35, 0));
    // monitor faces the bot (-z side): the bot stands behind the desk, we look over its shoulder
    const mon = new THREE.Group();
    mon.position.set(0, DESK_H + 0.03, 0.08);
    mon.add(cyl(0.12, 0.16, 0.02, M.monitor, 0, 0.01, 0));
    mon.add(box(0.05, 0.22, 0.03, M.monitor, 0, 0.12, 0));
    mon.add(box(0.78, 0.46, 0.035, M.monitor, 0, 0.44, 0));
    const scr = makeScreen(bot.screen, bot.accent);
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 0.41),
      new THREE.MeshStandardMaterial({ map: scr.tex, emissiveMap: scr.tex, emissive: "#ffffff", emissiveIntensity: 0.55, roughness: 0.6 })
    );
    face.position.set(0, 0.44, -0.02);
    face.rotation.y = Math.PI; // faces -z, towards the bot
    mon.add(face);
    // a faint glow on the back side so the camera reads it as lit
    g.add(mon);
    screens.push(scr);
    // the screen lights the bot's face
    const glow = new THREE.PointLight(bot.accent, 1.6, 2.2, 2);
    glow.position.set(0, DESK_H + 0.5, -0.3);
    g.add(glow);
    // keyboard + mouse on the bot's side
    const kb = box(0.42, 0.02, 0.14, M.keyboard, -0.05, DESK_H + 0.035, -0.18);
    g.add(kb);
    for (let r = 0; r < 3; r++)
      for (let k = 0; k < 11; k++) g.add(box(0.028, 0.008, 0.028, M.key, -0.05 - 0.19 + k * 0.037, DESK_H + 0.05, -0.22 + r * 0.038, false));
    const mouse = sph(0.035, M.keyboard, 0.3, DESK_H + 0.04, -0.2, 16);
    mouse.scale.set(1, 0.6, 1.4);
    g.add(mouse);
    // mug in the bot's colour
    const mug = cyl(0.045, 0.04, 0.1, M.mugs[i % M.mugs.length], 0.6, DESK_H + 0.075, -0.05, 16);
    g.add(mug);
    // notebook
    g.add(box(0.2, 0.012, 0.26, M.white, -0.55, DESK_H + 0.03, -0.12));
    room.add(g);
  });

  // plants: pots by the window and corners
  const plant = (x, z, s = 1) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.add(cyl(0.22 * s, 0.17 * s, 0.4 * s, M.pot, 0, 0.2 * s, 0));
    g.add(cyl(0.2 * s, 0.2 * s, 0.02, M.soil, 0, 0.4 * s, 0));
    const stem = cyl(0.02, 0.03, 0.6 * s, M.beam, 0, 0.7 * s, 0, 8);
    g.add(stem);
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      const leaf = sph(0.26 * s, k % 2 ? M.leaf : M.leaf2, Math.cos(a) * 0.22 * s, 1.0 * s + rnd(-0.12, 0.18) * s, Math.sin(a) * 0.22 * s, 16);
      leaf.scale.set(1, 0.75, 1);
      g.add(leaf);
    }
    g.add(sph(0.3 * s, M.leaf, 0, 1.25 * s, 0, 16));
    room.add(g);
  };
  plant(-2.1, -5.0, 1.15);
  plant(2.1, -5.0, 1.15);
  plant(-7.6, -0.6, 0.9);
  plant(7.7, 1.6, 1.0);
  plant(-4.6, 4.4, 0.8);

  // coffee corner (back-left): counter, espresso machine, cups, shelf
  {
    const g = new THREE.Group();
    g.position.set(-6.6, 0, -5.0);
    g.add(box(2.2, 0.95, 0.65, M.white, 0, 0.475, 0));
    g.add(box(2.3, 0.05, 0.75, M.deskTop, 0, 0.97, 0));
    g.add(box(0.45, 0.42, 0.4, M.steel, -0.5, 1.21, 0));
    g.add(box(0.5, 0.06, 0.45, M.dark, -0.5, 1.45, 0));
    g.add(cyl(0.04, 0.035, 0.08, M.white, -0.5, 1.04, 0.12, 12));
    for (let k = 0; k < 4; k++) g.add(cyl(0.04, 0.035, 0.09, M.mugs[k], 0.2 + k * 0.16, 1.045, 0.05, 12));
    g.add(box(0.3, 0.35, 0.3, M.steel, 0.75, 1.175, -0.1));
    // shelf with books
    g.add(box(2.0, 0.04, 0.3, M.deskTop, 0, 2.1, -0.15));
    for (let k = 0; k < 9; k++) g.add(box(0.07, rnd(0.22, 0.3), 0.2, M.book[k % 6], -0.85 + k * 0.1, 2.25, -0.15));
    room.add(g);
  }

  // whiteboard (back-right) with a sketch in brand colours
  {
    const c = makeCanvas(512, 320);
    const g = c.getContext("2d");
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 512, 320);
    g.strokeStyle = "#0e0d12";
    g.lineWidth = 6;
    g.strokeRect(60, 60, 130, 80);
    g.strokeRect(320, 60, 130, 80);
    g.strokeRect(190, 200, 130, 80);
    g.strokeStyle = "#69c7b9";
    g.beginPath();
    g.moveTo(190, 100);
    g.lineTo(320, 100);
    g.moveTo(125, 140);
    g.lineTo(255, 200);
    g.moveTo(385, 140);
    g.lineTo(255, 200);
    g.stroke();
    g.fillStyle = "#e26d5c";
    g.font = "600 34px Outfit, system-ui, sans-serif";
    g.fillText("Q4 · agentes", 60, 40);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const bg = new THREE.Group();
    bg.position.set(6.3, 0, -5.42);
    bg.add(box(2.4, 1.5, 0.05, M.frame, 0, 1.85, 0));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.4), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 }));
    face.position.set(0, 1.85, 0.03);
    bg.add(face);
    bg.add(box(2.4, 0.04, 0.1, M.frame, 0, 1.08, 0.04));
    room.add(bg);
  }

  // meeting table (right, between the rows)
  {
    const g = new THREE.Group();
    g.position.set(7.7, 0, -0.5);
    g.add(cyl(0.52, 0.52, 0.04, M.deskTop, 0, 1.0, 0, 40));
    g.add(cyl(0.05, 0.08, 0.99, M.deskLeg, 0, 0.495, 0, 16));
    g.add(cyl(0.3, 0.32, 0.03, M.deskLeg, 0, 0.015, 0, 32));
    g.add(cyl(0.06, 0.05, 0.14, M.white, 0.15, 1.09, 0.1, 12));
    g.add(box(0.36, 0.01, 0.26, M.white, -0.2, 1.025, -0.05));
    room.add(g);
  }

  // lounge (front-right): sofa on a rug + low table
  {
    const g = new THREE.Group();
    g.position.set(7.0, 0, 4.2);
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.2), new THREE.MeshStandardMaterial({ map: rugTexture(), roughness: 1 }));
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(-0.5, 0.005, 0);
    rug.receiveShadow = true;
    g.add(rug);
    g.add(box(0.7, 0.42, 1.8, M.sofa, 0.55, 0.21, 0));
    g.add(box(0.2, 0.85, 1.8, M.sofa2, 0.85, 0.42, 0));
    g.add(box(0.7, 0.14, 0.18, M.sofa2, 0.55, 0.49, -0.86));
    g.add(box(0.7, 0.14, 0.18, M.sofa2, 0.55, 0.49, 0.86));
    g.add(cyl(0.3, 0.3, 0.04, M.deskTop, -0.7, 0.4, 0, 32));
    g.add(cyl(0.03, 0.03, 0.38, M.deskLeg, -0.7, 0.19, 0, 10));
    room.add(g);
  }

  // printer (front-left)
  {
    const g = new THREE.Group();
    g.position.set(-7.4, 0, 3.4);
    g.add(box(0.7, 0.75, 0.55, M.white, 0, 0.375, 0));
    g.add(box(0.6, 0.35, 0.5, M.dark, 0, 0.93, 0));
    g.add(box(0.3, 0.02, 0.28, M.white, 0, 1.115, 0.05));
    g.add(box(0.02, 0.01, 0.15, M.white, 0.15, 1.12, 0.03, false));
    room.add(g);
  }

  return { room, screens, lamps };
}

// ------------------------------------------------------------------ bots ----
function buildBot(bot) {
  const g = new THREE.Group();
  const suit = new THREE.MeshStandardMaterial({ color: bot.suit, roughness: 0.55, metalness: 0.05 });
  const suitDark = new THREE.MeshStandardMaterial({ color: new THREE.Color(bot.suit).multiplyScalar(0.72), roughness: 0.6 });
  const accent = new THREE.MeshStandardMaterial({ color: bot.accent, roughness: 0.4, emissive: bot.accent, emissiveIntensity: 0.25 });
  const skin = new THREE.MeshStandardMaterial({ color: bot.skin, roughness: 0.7 });
  const hair = new THREE.MeshStandardMaterial({ color: bot.hair, roughness: 0.85 });
  const meshes = [];
  const add = (parent, m) => {
    m.userData.bot = bot.id;
    meshes.push(m);
    parent.add(m);
    return m;
  };

  // body pivot for bobbing
  const body = new THREE.Group();
  g.add(body);
  const torso = add(body, new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.28, 8, 24), suit));
  torso.position.y = 0.72;
  torso.castShadow = true;
  torso.receiveShadow = true;
  // chest panel + badge
  add(body, box(0.22, 0.16, 0.06, suitDark, 0, 0.78, 0.24));
  const badge = add(body, cyl(0.045, 0.045, 0.02, accent, 0, 0.78, 0.275, 16));
  badge.rotation.x = Math.PI / 2;
  // belt
  add(body, cyl(0.265, 0.265, 0.05, suitDark, 0, 0.56, 0, 24));
  // backpack
  add(body, box(0.34, 0.36, 0.16, suitDark, 0, 0.76, -0.28));
  add(body, cyl(0.03, 0.03, 0.2, M.steel, -0.1, 1.02, -0.3, 8));
  add(body, cyl(0.03, 0.03, 0.2, M.steel, 0.1, 1.02, -0.3, 8));

  // neck ring + helmet with the face inside
  add(body, cyl(0.2, 0.22, 0.07, suitDark, 0, 0.98, 0, 24));
  const head = new THREE.Group();
  head.position.y = 1.3;
  body.add(head);
  add(head, sph(0.24, skin, 0, 0, 0.02, 28)); // face ball
  const hairCap = add(head, sph(0.245, hair, 0, 0.06, -0.03, 28));
  hairCap.scale.set(1, 0.75, 1);
  // eyes: big dark ovals with a highlight, Sintra-style
  for (const s of [-1, 1]) {
    const e = add(head, sph(0.05, M.eye, s * 0.095, -0.01, 0.215, 16));
    e.scale.set(1, 1.35, 0.5);
    const hi = add(head, sph(0.016, M.eyeHi, s * 0.095 + 0.015, 0.012, 0.245, 8));
    hi.castShadow = false;
  }
  // smile
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 8, 16, Math.PI), M.eye);
  smile.position.set(0, -0.085, 0.222);
  smile.rotation.z = Math.PI;
  smile.castShadow = false;
  head.add(smile);
  // cheeks
  const cheek = new THREE.MeshStandardMaterial({ color: "#f39a9a", roughness: 0.9, transparent: true, opacity: 0.55 });
  for (const s of [-1, 1]) {
    const c = add(head, sph(0.03, cheek, s * 0.15, -0.06, 0.19, 10));
    c.scale.set(1, 0.6, 0.4);
    c.castShadow = false;
  }
  // glass helmet + rim + two antenna "ears"
  const helmet = add(head, sph(0.36, M.visor, 0, 0.02, 0, 36));
  helmet.castShadow = false;
  helmet.renderOrder = 5;
  const rim = add(head, new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 12, 40), suit));
  rim.position.y = -0.2;
  rim.rotation.x = Math.PI / 2;
  rim.castShadow = true;
  for (const s of [-1, 1]) {
    const ear = add(head, cyl(0.04, 0.05, 0.16, suit, s * 0.33, 0.24, 0, 12));
    ear.rotation.z = -s * 0.55;
    const tip = add(head, sph(0.045, accent, s * 0.37, 0.31, 0, 12));
    tip.castShadow = false;
  }

  // arms (pivot at shoulder) and legs (pivot at hip)
  const limb = (r, len, mat) => {
    const p = new THREE.Group();
    const m = add(p, new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 16), mat));
    m.position.y = -len / 2 - r * 0.3;
    m.castShadow = true;
    return p;
  };
  const armL = limb(0.075, 0.3, suit);
  armL.position.set(-0.3, 0.9, 0);
  const armR = limb(0.075, 0.3, suit);
  armR.position.set(0.3, 0.9, 0);
  body.add(armL, armR);
  // gloves
  add(armL, sph(0.085, suitDark, 0, -0.42, 0, 14));
  add(armR, sph(0.085, suitDark, 0, -0.42, 0, 14));
  const legL = limb(0.085, 0.22, suitDark);
  legL.position.set(-0.13, 0.45, 0);
  const legR = limb(0.085, 0.22, suitDark);
  legR.position.set(0.13, 0.45, 0);
  g.add(legL, legR);
  // boots
  const bootL = add(legL, box(0.17, 0.1, 0.24, M.dark, 0, -0.4, 0.03));
  const bootR = add(legR, box(0.17, 0.1, 0.24, M.dark, 0, -0.4, 0.03));
  bootL.castShadow = bootR.castShadow = true;

  // selection ring on the floor
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.5, 48),
    new THREE.MeshBasicMaterial({ color: bot.accent, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.012;
  g.add(ring);

  // name label above the helmet
  const label = labelSprite(bot.name, bot.role, bot.accent);
  label.position.y = 2.05;
  g.add(label);

  return { group: g, body, head, armL, armR, legL, legR, ring, label, meshes, suitMat: suit, accentMat: accent };
}

// ---------------------------------------------------------------- scene ----
export function createOffice({ mount, bots, onSelect, onHover, onStatus, reduced }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#dfe9f2");
  scene.fog = new THREE.Fog("#dfe9f2", 22, 40);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  camera.position.set(0.6, 6.6, 12.2);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.9, -0.6);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 6;
  controls.maxDistance = 24;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.32;
  controls.minAzimuthAngle = -0.85;
  controls.maxAzimuthAngle = 0.85;
  controls.enablePan = false;
  controls.update();

  // lights: sun through the windows (warm, sharp shadows), sky fill, soft front fill
  const sun = new THREE.DirectionalLight("#fff2dc", 3.2);
  sun.position.set(5, 9, -7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = -11;
  sun.shadow.camera.right = 11;
  sun.shadow.camera.top = 10;
  sun.shadow.camera.bottom = -10;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 4;
  scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight("#cfe4ff", "#6a5540", 0.85);
  scene.add(hemi);
  const fill = new THREE.DirectionalLight("#ffffff", 0.7);
  fill.position.set(-4, 6, 10);
  scene.add(fill);

  const { screens } = buildOffice(scene, bots);

  // ---- bots + behaviour ----
  const actors = bots.map((bot, i) => {
    const rig = buildBot(bot);
    const desk = DESKS[i];
    const home = { x: desk.x, z: desk.z - STAND_OFF, yaw: 0 };
    rig.group.position.set(home.x, 0, home.z);
    rig.group.rotation.y = 0;
    rig.group.scale.setScalar(1.12);
    scene.add(rig.group);
    return {
      bot,
      rig,
      home,
      homeNode: [desk.x, desk.z < 0 ? -4.3 : -0.55],
      state: "work",
      until: reduced ? 1e9 : rnd(6, 34),
      path: [],
      yaw: 0,
      targetYaw: 0,
      place: "desk",
      phase: Math.random() * 10,
      walkT: 0,
      lookT: 0,
      lookYaw: 0,
    };
  });
  const allMeshes = actors.flatMap((a) => a.rig.meshes);

  const emit = (a) => onStatus && onStatus(a.bot.id, a.place);
  actors.forEach(emit);

  // occupancy so two bots don't pick the same spot at once
  const taken = new Set();
  const goSomewhere = (a) => {
    const options = Object.keys(PLACES).filter((k) => !taken.has(k));
    // sometimes visit a colleague's desk instead
    if (Math.random() < 0.3) {
      const other = pick(actors.filter((o) => o !== a && o.state === "work"));
      if (other) {
        const side = other.home.x > a.home.x ? -1 : 1;
        const dest = { x: other.home.x + side * 0.95, z: other.home.z + 0.1, yaw: side > 0 ? -Math.PI / 2 : Math.PI / 2, node: other.homeNode, label: "visit" };
        startWalk(a, dest, null);
        return;
      }
    }
    const key = pick(options);
    taken.add(key);
    startWalk(a, PLACES[key], key);
  };
  const startWalk = (a, dest, key) => {
    const nodes = findPath(a.homeNode, dest.node);
    a.path = [...nodes.map(([x, z]) => ({ x, z })), { x: dest.x, z: dest.z }];
    a.dest = dest;
    a.destKey = key;
    a.state = "walk";
    a.place = "walk";
    emit(a);
  };
  const goHome = (a) => {
    if (a.destKey) taken.delete(a.destKey);
    a.destKey = null;
    const nodes = findPath(a.dest.node, a.homeNode);
    a.path = [...nodes.map(([x, z]) => ({ x, z })), { x: a.home.x, z: a.home.z }];
    a.dest = { ...a.home, label: "desk" };
    a.state = "walk";
    a.place = "walk";
    emit(a);
  };

  const stepActor = (a, dt, t) => {
    const g = a.rig.group;
    if (a.state === "walk") {
      const next = a.path[0];
      if (!next) {
        a.state = a.dest.label === "desk" ? "work" : "away";
        a.place = a.dest.label;
        a.targetYaw = a.dest.yaw;
        a.until = t + (a.state === "work" ? rnd(9, 22) : rnd(4, 9));
        emit(a);
      } else {
        const dx = next.x - g.position.x, dz = next.z - g.position.z;
        const dist = Math.hypot(dx, dz);
        const step = WALK_SPEED * dt;
        if (dist <= step) {
          g.position.x = next.x;
          g.position.z = next.z;
          a.path.shift();
        } else {
          g.position.x += (dx / dist) * step;
          g.position.z += (dz / dist) * step;
          a.targetYaw = Math.atan2(dx, dz);
        }
        a.walkT += dt * 9;
      }
    } else if (t > a.until) {
      if (a.state === "work") {
        const away = actors.filter((o) => o.state !== "work").length;
        if (away >= 3) a.until = t + rnd(3, 8);
        else goSomewhere(a);
      } else goHome(a);
    }
    a.yaw = angleLerp(a.yaw, a.targetYaw, Math.min(1, TURN_SPEED * dt));
    g.rotation.y = a.yaw;

    // ---- pose ----
    const r = a.rig;
    const p = a.phase + t;
    if (a.state === "walk") {
      const s = Math.sin(a.walkT);
      r.legL.rotation.x = s * 0.55;
      r.legR.rotation.x = -s * 0.55;
      r.armL.rotation.x = -s * 0.45;
      r.armR.rotation.x = s * 0.45;
      r.armL.rotation.z = 0.12;
      r.armR.rotation.z = -0.12;
      r.body.position.y = Math.abs(Math.cos(a.walkT)) * 0.045;
      r.body.rotation.z = Math.sin(a.walkT) * 0.03;
      r.head.rotation.y = lerp(r.head.rotation.y, 0, 0.1);
      r.head.rotation.x = 0.06;
    } else if (a.state === "work") {
      // typing: forearms over the keyboard, small quick jitters, head nodding at the screen
      r.legL.rotation.x = lerp(r.legL.rotation.x, 0, 0.15);
      r.legR.rotation.x = lerp(r.legR.rotation.x, 0, 0.15);
      r.armL.rotation.x = -1.15 + Math.sin(p * 13) * 0.08;
      r.armR.rotation.x = -1.15 + Math.cos(p * 11 + 1) * 0.08;
      r.armL.rotation.z = 0.28;
      r.armR.rotation.z = -0.28;
      r.body.position.y = Math.sin(p * 1.6) * 0.008;
      r.body.rotation.z = 0;
      r.head.rotation.y = Math.sin(p * 0.7) * 0.08;
      r.head.rotation.x = 0.16 + Math.sin(p * 2.3) * 0.02;
    } else {
      // away: relaxed stance, looking around, an occasional gesture
      r.legL.rotation.x = lerp(r.legL.rotation.x, 0, 0.15);
      r.legR.rotation.x = lerp(r.legR.rotation.x, 0, 0.15);
      const gesture = Math.sin(p * 0.9) > 0.6 ? 1 : 0;
      r.armL.rotation.x = lerp(r.armL.rotation.x, gesture ? -0.9 + Math.sin(p * 6) * 0.15 : -0.1, 0.08);
      r.armR.rotation.x = lerp(r.armR.rotation.x, gesture ? -0.5 : -0.1, 0.08);
      r.armL.rotation.z = 0.15;
      r.armR.rotation.z = -0.15;
      r.body.position.y = Math.sin(p * 1.4) * 0.01;
      r.body.rotation.z = Math.sin(p * 0.5) * 0.015;
      if (t > a.lookT) {
        a.lookT = t + rnd(1.5, 4);
        a.lookYaw = rnd(-0.6, 0.6);
      }
      r.head.rotation.y = lerp(r.head.rotation.y, a.lookYaw, 0.05);
      r.head.rotation.x = lerp(r.head.rotation.x, 0, 0.05);
    }
  };

  // ---- picking ----
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hoverId = null;
  let selectedId = null;
  let downAt = null;
  const pickAt = (ev) => {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(allMeshes, false)[0];
    return hit ? hit.object.userData.bot : null;
  };
  const onMove = (ev) => {
    const id = pickAt(ev);
    if (id !== hoverId) {
      hoverId = id;
      renderer.domElement.style.cursor = id ? "pointer" : "grab";
      onHover && onHover(id);
    }
  };
  const onDown = (ev) => {
    downAt = [ev.clientX, ev.clientY];
  };
  const onUp = (ev) => {
    if (!downAt) return;
    const moved = Math.hypot(ev.clientX - downAt[0], ev.clientY - downAt[1]);
    downAt = null;
    if (moved > 6) return; // it was an orbit drag
    const id = pickAt(ev);
    onSelect && onSelect(id);
  };
  renderer.domElement.addEventListener("pointermove", onMove);
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointerup", onUp);
  renderer.domElement.style.cursor = "grab";

  // ---- camera focus ----
  const restTarget = new THREE.Vector3(0, 0.9, -0.6);
  const focusTarget = new THREE.Vector3();
  let focusActor = null;
  let wantDistance = null;
  // narrow (phone) viewports need the camera further back to fit the room
  const distanceFor = (base) => {
    const aspect = camera.aspect || 1.6;
    return aspect < 1.5 ? base * Math.min(1.6, 1.5 / aspect) : base;
  };
  const setSelected = (id) => {
    selectedId = id;
    focusActor = actors.find((a) => a.bot.id === id) || null;
    wantDistance = distanceFor(focusActor ? 7.2 : 14);
  };

  // ---- resize ----
  const resize = () => {
    const w = mount.clientWidth || 1, h = mount.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    wantDistance = distanceFor(focusActor ? 7.2 : 14);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(mount);

  // ---- loop ----
  let last = performance.now();
  let simT = 0;
  let raf = 0;
  let screenTick = 0;
  let disposed = false;
  const tmp = new THREE.Vector3();
  const frame = () => {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    const nowMs = performance.now();
    // clamped so a hidden/slow tab never teleports anyone; window.__OFFICE_TIME_SCALE is a test hook
    const dt = Math.min((nowMs - last) / 1000, 0.1) * (window.__OFFICE_TIME_SCALE || 1);
    last = nowMs;
    simT += dt;
    const t = simT;

    for (const a of actors) stepActor(a, dt, t);

    // rings + hover/selection emphasis
    for (const a of actors) {
      const sel = a.bot.id === selectedId, hov = a.bot.id === hoverId;
      const want = sel ? 0.85 + Math.sin(t * 4) * 0.15 : hov ? 0.5 : 0;
      a.rig.ring.material.opacity = lerp(a.rig.ring.material.opacity, want, 0.15);
      a.rig.ring.scale.setScalar(sel ? 1 + Math.sin(t * 4) * 0.04 : 1);
      a.rig.suitMat.emissive.set(a.bot.accent);
      a.rig.suitMat.emissiveIntensity = lerp(a.rig.suitMat.emissiveIntensity, sel ? 0.12 : hov ? 0.08 : 0, 0.15);
      a.rig.label.material.opacity = lerp(a.rig.label.material.opacity, sel || hov ? 1 : 0.9, 0.1);
    }

    // camera glides to the selected bot and back
    if (focusActor) {
      tmp.copy(focusActor.rig.group.position);
      tmp.y += 1.0;
      focusTarget.lerp(tmp, 0.06);
    } else focusTarget.lerp(restTarget, 0.05);
    controls.target.lerp(focusTarget, 0.35);
    if (wantDistance !== null) {
      const d = camera.position.distanceTo(controls.target);
      const nd = lerp(d, wantDistance, 0.05);
      tmp.subVectors(camera.position, controls.target).setLength(nd);
      camera.position.copy(controls.target).add(tmp);
      if (Math.abs(nd - wantDistance) < 0.05) wantDistance = null;
    }
    controls.update();

    // monitors repaint a few times a second
    screenTick += dt;
    if (screenTick > 0.25) {
      screenTick = 0;
      for (const s of screens) s.draw();
    }
    renderer.render(scene, camera);
  };
  if (!focusTarget.length()) focusTarget.copy(restTarget);
  frame();

  return {
    setSelected,
    /** the bot's current spot, for the roster */
    placeOf: (id) => actors.find((a) => a.bot.id === id)?.place,
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      controls.dispose();
      pmrem.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        for (const m of mats) {
          for (const k of ["map", "emissiveMap"]) if (m[k]) m[k].dispose();
          m.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    },
  };
}
