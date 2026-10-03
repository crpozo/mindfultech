// The campus around the building: a paved plaza, lawns, a road with a
// sidewalk and lamp posts, a parking strip with cars, trees, hedges and
// planters, and a ring of glass office blocks with green roofs under a pale
// sky. Everything is static — instanced where repeated — so the whole campus
// is a couple of dozen draw calls. The office floor is y = 0 and its plinth
// is 0.6 m, so the campus ground sits at y = −0.6.
import * as THREE from "three";
import * as T from "./textures.js";
import { BLD } from "./room.js";

export const GROUND_Y = -0.6;
const PI = Math.PI;
const std = (color, roughness = 0.9, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const rnd = (a, b) => a + Math.random() * (b - a);

export function buildCampus(scene) {
  const { x0, x1, z0, z1 } = BLD;
  const G = new THREE.Group();
  G.name = "campus";
  scene.add(G);

  // ------------------------------------------------------------- sky ----
  // Vertex-colour gradient on an inside-out sphere; drawn first, no depth,
  // and exempt from the fog that softens everything else.
  {
    const geo = new THREE.SphereGeometry(230, 32, 18);
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
    const top = new THREE.Color("#8fb4da"), mid = new THREE.Color("#d5e3ee"), low = new THREE.Color("#e9edef");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const t = pos.getY(i) / 230;
      if (t > 0.12) c.copy(mid).lerp(top, Math.min(1, (t - 0.12) / 0.6));
      else c.copy(low).lerp(mid, Math.max(0, (t + 0.1) / 0.22));
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    sky.renderOrder = -10;
    G.add(sky);
  }
  scene.fog = new THREE.Fog("#e3e9ed", 70, 190);

  // ---------------------------------------------------------- ground ----
  const flat = (w, d, x, z, mat, y = GROUND_Y, shadow = true) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    m.rotation.x = -PI / 2;
    m.position.set(x, y, z);
    m.receiveShadow = shadow;
    G.add(m);
    return m;
  };
  const lawn = std("#8da27c", 1); // olive, not mint: it has to sit under warm pavers
  flat(700, 700, 0, 0, lawn, GROUND_Y - 0.02);
  const paversMat = new THREE.MeshStandardMaterial({ map: T.pavers(), roughness: 0.95 });
  paversMat.map.repeat.set(24, 21);
  flat(48, 42, -4, 7, paversMat); // plaza: x −28…20, z −14…28
  const walkMat = new THREE.MeshStandardMaterial({ map: T.pavers(), roughness: 0.95, color: "#e2dfd6" });
  walkMat.map.repeat.set(140, 2);
  flat(280, 4, 0, 30, walkMat, GROUND_Y + 0.004); // sidewalk along the road
  const asphalt = new THREE.MeshStandardMaterial({ map: T.asphalt(), roughness: 1 });
  asphalt.map.repeat.set(70, 2.2);
  flat(280, 9, 0, 36.5, asphalt, GROUND_Y - 0.004); // the road
  const lineMat = std("#e9e7df", 0.9);
  for (let x = -136; x < 136; x += 6) flat(3, 0.14, x, 36.5, lineMat, GROUND_Y + 0.001, false);
  flat(280, 4, 0, 43, walkMat, GROUND_Y + 0.004); // far sidewalk
  // parking strip west of the plaza: two rows of bays facing a lane
  const bayMat = new THREE.MeshStandardMaterial({ map: T.parkingBay(), roughness: 1 });
  bayMat.map.repeat.set(6, 1);
  const bays = [];
  for (const [zc, flip] of [[8.4, false], [19.6, true]]) {
    const m = flat(16.2, 5.2, -38.1, zc, bayMat, GROUND_Y + 0.002);
    if (flip) m.rotation.z = PI;
    for (let k = 0; k < 6; k++) bays.push({ x: -38.1 - 8.1 + 1.35 + k * 2.7, z: zc, yaw: flip ? PI : 0 });
  }
  flat(16.2, 6, -38.1, 14, asphalt, GROUND_Y - 0.004); // the lane between the rows
  flat(6, 14, -27.5, 36.5 - 14 + 1, asphalt, GROUND_Y - 0.004); // exit to the road

  // ----------------------------------------------------------- plinth ----
  // Dark base under the slab and two broad steps up to the lobby corner.
  const base = std("#8a8c90", 0.8);
  const add = (geo, mat, x, y, z, ry = 0, shadow = true) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.castShadow = shadow;
    m.receiveShadow = true;
    G.add(m);
    return m;
  };
  add(new THREE.BoxGeometry(x1 - x0 + 0.8, 0.12, z1 - z0 + 0.8), base, 0, GROUND_Y + 0.06, (z0 + z1) / 2, 0, false);
  const step = std("#cfcac1", 0.9);
  add(new THREE.BoxGeometry(7, 0.3, 0.9), step, x0 + 3.6, -0.15, z1 + 0.75);
  add(new THREE.BoxGeometry(7, 0.3, 1.8), step, x0 + 3.6, -0.45, z1 + 1.2);

  // ------------------------------------------------------------ trees ----
  const trunkGeo = new THREE.CylinderGeometry(0.11, 0.17, 1, 6);
  const leafGeo = new THREE.IcosahedronGeometry(1, 1);
  const trunk = new THREE.InstancedMesh(trunkGeo, std("#5b4332", 0.9), 160);
  const leaves = new THREE.InstancedMesh(leafGeo, std("#ffffff", 0.95), 320);
  trunk.castShadow = leaves.castShadow = true;
  leaves.receiveShadow = true;
  const greens = ["#447a40", "#5c9450", "#366d3c", "#73a05a", "#4f8446"].map((c) => new THREE.Color(c));
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), SC = new THREE.Vector3();
  let ti = 0, li = 0;
  const tree = (x, z, s = 1) => {
    const h = rnd(1.6, 2.4) * s, r = rnd(1.1, 1.6) * s;
    M4.compose(V.set(x, GROUND_Y + h / 2, z), Q.identity(), SC.set(1, h, 1));
    trunk.setMatrixAt(ti++, M4);
    for (const [dx, dy, dz, rr] of [[0, h + r * 0.75, 0, r], [rnd(-0.5, 0.5) * r, h + r * 1.25, rnd(-0.5, 0.5) * r, r * 0.7]]) {
      M4.compose(V.set(x + dx, GROUND_Y + dy, z + dz), Q.setFromEuler(new THREE.Euler(rnd(0, 1), rnd(0, 3), 0)), SC.set(rr, rr * 0.9, rr));
      leaves.setMatrixAt(li, M4);
      leaves.setColorAt(li, greens[Math.floor(Math.random() * greens.length)]);
      li++;
    }
  };
  // rows along the plaza edges, the road, the parking strip and the back lawn
  for (let x = -26; x <= 18; x += 5.5) tree(x + rnd(-0.6, 0.6), -16 + rnd(-0.8, 0.8));
  for (let z = -12; z <= 26; z += 6) tree(22.5 + rnd(-0.6, 0.6), z + rnd(-0.6, 0.6));
  for (let x = -60; x <= 60; x += 7) if (Math.abs(x + 2) > 4 && Math.abs(x + 27.5) > 4) tree(x + rnd(-0.8, 0.8), 28.5, 0.9);
  for (let x = -60; x <= 60; x += 9) tree(x + rnd(-1, 1), 45 + rnd(-1, 1), 1.1);
  for (let z = 0; z <= 28; z += 7) tree(-49 + rnd(-0.6, 0.6), z + rnd(-0.6, 0.6));
  for (let i = 0; i < 40; i++) {
    const a = rnd(0, PI * 2), d = rnd(34, 70);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (z > 24 || (x < -16 && z > 0 && z < 30)) continue; // not on the road or the parking
    tree(x, z - 4, rnd(0.9, 1.4));
  }
  trunk.count = ti;
  leaves.count = li;
  trunk.instanceMatrix.needsUpdate = leaves.instanceMatrix.needsUpdate = true;
  if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
  G.add(trunk, leaves);

  // ------------------------------------------- hedges, planters, benches ----
  const hedge = std("#4f8b4a", 1);
  for (const [w, d, x, z] of [[18, 0.7, -17, -13.2], [0.7, 14, 19.4, 1], [10, 0.7, 12, 27.3], [10, 0.7, -16, 27.3]]) add(new THREE.BoxGeometry(w, 0.9, d), hedge, x, GROUND_Y + 0.45, z);
  const planterMat = std("#2e2f33", 0.8), bush = std("#5d9450", 1);
  for (const [x, z] of [[-13.5, 12.2], [-13.5, 15.4], [-13.5, 18.6], [-2, 12.2], [6, 12.2], [14, 12.2]]) {
    add(new THREE.BoxGeometry(1.4, 0.6, 0.7), planterMat, x, GROUND_Y + 0.3, z);
    add(new THREE.IcosahedronGeometry(0.42, 1), bush, x - 0.3, GROUND_Y + 0.85, z);
    add(new THREE.IcosahedronGeometry(0.36, 1), bush, x + 0.35, GROUND_Y + 0.8, z + 0.05);
  }
  const seat = std("#b88a5a", 0.8), legs = std("#2e2f33", 0.6);
  for (const [x, z, ry] of [[2, 15.5, 0], [10, 15.5, 0], [-18.5, 4, PI / 2]]) {
    add(new THREE.BoxGeometry(1.9, 0.08, 0.5), seat, x, GROUND_Y + 0.46, z, ry);
    for (const s of [-0.8, 0.8]) add(new THREE.BoxGeometry(0.08, 0.42, 0.44), legs, x + Math.cos(ry) * s, GROUND_Y + 0.21, z - Math.sin(ry) * s, ry);
  }

  // ------------------------------------------------------------- cars ----
  const bodyGeo = new THREE.BoxGeometry(1.85, 0.62, 4.3), cabinGeo = new THREE.BoxGeometry(1.65, 0.6, 2.2), wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 12);
  const n = bays.length;
  const bodies = new THREE.InstancedMesh(bodyGeo, std("#ffffff", 0.35, { metalness: 0.4 }), n);
  const cabins = new THREE.InstancedMesh(cabinGeo, std("#1d2229", 0.15, { metalness: 0.6 }), n);
  const wheels = new THREE.InstancedMesh(wheelGeo, std("#17181b", 0.9), n * 4);
  bodies.castShadow = cabins.castShadow = true;
  const paints = ["#e8e9eb", "#9aa0a8", "#1f2a44", "#b73a2c", "#c9cdd2", "#2b2d33", "#6f7f94", "#d9d4c8"].map((c) => new THREE.Color(c));
  let wi = 0;
  bays.forEach((b, i) => {
    if (i % 7 === 3) return; // one bay free per row
    const yaw = b.yaw + rnd(-0.03, 0.03), z = b.z + (b.yaw ? 0.4 : -0.4);
    M4.compose(V.set(b.x, GROUND_Y + 0.62, z), Q.setFromEuler(new THREE.Euler(0, yaw, 0)), SC.set(1, 1, 1));
    bodies.setMatrixAt(i, M4);
    bodies.setColorAt(i, paints[i % paints.length]);
    M4.compose(V.set(b.x, GROUND_Y + 1.22, z - Math.cos(yaw) * 0.25), Q, SC.set(1, 1, 1));
    cabins.setMatrixAt(i, M4);
    for (const [sx, sz] of [[-0.85, 1.35], [0.85, 1.35], [-0.85, -1.35], [0.85, -1.35]]) {
      const wx = b.x + sx * Math.cos(yaw) + sz * Math.sin(yaw), wz = z - sx * Math.sin(yaw) + sz * Math.cos(yaw);
      M4.compose(V.set(wx, GROUND_Y + 0.34, wz), Q.setFromEuler(new THREE.Euler(0, yaw, PI / 2)), SC.set(1, 1, 1));
      wheels.setMatrixAt(wi++, M4);
    }
  });
  bodies.instanceMatrix.needsUpdate = cabins.instanceMatrix.needsUpdate = wheels.instanceMatrix.needsUpdate = true;
  if (bodies.instanceColor) bodies.instanceColor.needsUpdate = true;
  wheels.count = wi;
  G.add(bodies, cabins, wheels);

  // -------------------------------------------------------- lamp posts ----
  const post = std("#2b2d33", 0.6), head = new THREE.MeshStandardMaterial({ color: "#fff6e0", emissive: "#ffe8b8", emissiveIntensity: 0.9 });
  for (let x = -54; x <= 54; x += 18) {
    add(new THREE.CylinderGeometry(0.06, 0.09, 5.2, 8), post, x, GROUND_Y + 2.6, 31.3);
    add(new THREE.BoxGeometry(0.5, 0.14, 0.26), head, x, GROUND_Y + 5.2, 31.0);
  }

  // ------------------------------------------------- neighbouring blocks ----
  // Glass offices with black frames and green roofs, like the reference: two
  // low ones close enough to read, taller ones further out, all behind and to
  // the right of the camera's rest view so they never cover the office.
  const roofGreen = std("#6f9a5a", 1), parapet = std("#1f2328", 0.7), core = std("#2a2d33", 0.7);
  const block = (x, z, w, d, h, tone, lit) => {
    const mat = new THREE.MeshStandardMaterial({ map: T.facade(tone, lit), roughness: 0.35, metalness: 0.2 });
    mat.map.repeat.set(Math.max(1, Math.round(w / 12)), Math.max(1, Math.round(h / 21.6)));
    add(new THREE.BoxGeometry(w, h, d), mat, x, GROUND_Y + h / 2, z);
    add(new THREE.BoxGeometry(w + 0.4, 0.5, d + 0.4), parapet, x, GROUND_Y + h + 0.25, z, 0, false);
    add(new THREE.BoxGeometry(w - 1.6, 0.4, d - 1.6), roofGreen, x, GROUND_Y + h + 0.5, z, 0, false);
    add(new THREE.BoxGeometry(Math.min(5, w * 0.3), 2.6, Math.min(4, d * 0.3)), core, x + w * 0.22, GROUND_Y + h + 1.6, z - d * 0.2, 0, false);
  };
  // the two nearest are low, so the rest view sees them past the back wall
  block(31, -19, 16, 12, 7.4, "#3a4656", 0.3);
  block(-31, -24, 18, 12, 7.4, "#3a4656", 0.25);
  block(4, -34, 22, 12, 7.8, "#3a4656", 0.3);
  block(58, -46, 24, 18, 15, "#33404f", 0.3);
  block(88, -14, 20, 20, 22, "#2f3b4a", 0.35);
  block(26, -70, 30, 20, 12, "#3a4656", 0.25);
  block(-14, -82, 26, 22, 26, "#2c3744", 0.3);
  block(-66, -56, 22, 22, 18, "#33404f", 0.3);
  block(112, 24, 22, 18, 30, "#2c3744", 0.35);
  block(-96, -10, 20, 26, 13, "#3a4656", 0.25);
  block(70, 60, 26, 20, 16, "#33404f", 0.3);
  return G;
}
