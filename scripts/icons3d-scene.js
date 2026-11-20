// Renders one 3D service icon into the page (sage glass-metal, same material
// as the knot on the home). Bundled with esbuild and screenshotted headless by
// scripts/icons3d-render.cjs to produce public/mt/icon-*.webp.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

window.renderIcon = (kind) => {
  document.querySelector("canvas")?.remove();
  const W = 640;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(W, W);
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environmentIntensity = 0.6;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.3, 9.6);
  camera.lookAt(0, 0, 0);

  const sage = () => new THREE.MeshPhysicalMaterial({ color: 0x6fb8ab, metalness: 0.85, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 0.9, iridescenceIOR: 1.6, iridescenceThicknessRange: [180, 520], sheen: 0.4, sheenColor: 0xbfeee3 });
  const pearl = () => new THREE.MeshPhysicalMaterial({ color: 0xeef4f2, metalness: 0.25, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 });
  const ink = () => new THREE.MeshPhysicalMaterial({ color: 0x1f2a28, metalness: 0.6, roughness: 0.28, clearcoat: 1 });
  const g = new THREE.Group();
  scene.add(g);
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    g.add(m);
    return m;
  };
  const box = (s = 1.5) => new RoundedBoxGeometry(s, s, s, 8, 0.22);

  if (kind === "ai") {
    // a core with two orbits: an agent at work
    add(new THREE.SphereGeometry(1.05, 64, 64), sage());
    add(new THREE.TorusGeometry(1.95, 0.16, 32, 160), pearl(), 0, 0, 0, 1.2, 0.35, 0);
    add(new THREE.TorusGeometry(2.35, 0.11, 32, 160), sage(), 0, 0, 0, 1.75, -0.6, 0.2);
    add(new THREE.SphereGeometry(0.27, 32, 32), ink(), 1.86, 0.55, 0.3);
    g.rotation.set(0.1, -0.3, 0.1);
    g.scale.setScalar(0.9);
  } else if (kind === "software") {
    // three stacked layers: an app built in layers
    add(new RoundedBoxGeometry(3.4, 0.5, 3.4, 8, 0.2), ink(), 0, -1.0, 0);
    add(new RoundedBoxGeometry(3.4, 0.5, 3.4, 8, 0.2), pearl(), 0, -0.1, 0);
    add(new RoundedBoxGeometry(3.4, 0.5, 3.4, 8, 0.2), sage(), 0, 0.8, 0);
    g.rotation.set(0.55, 0.78, 0);
    g.scale.setScalar(0.92);
  } else if (kind === "security") {
    // a shield with a check
    const s = new THREE.Shape();
    s.moveTo(0, 2.1);
    s.bezierCurveTo(0.9, 1.75, 1.5, 1.6, 1.85, 1.55);
    s.lineTo(1.85, 0.1);
    s.bezierCurveTo(1.85, -1.1, 0.9, -1.9, 0, -2.3);
    s.bezierCurveTo(-0.9, -1.9, -1.85, -1.1, -1.85, 0.1);
    s.lineTo(-1.85, 1.55);
    s.bezierCurveTo(-1.5, 1.6, -0.9, 1.75, 0, 2.1);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.22, bevelSize: 0.22, bevelSegments: 12, curveSegments: 48 });
    geo.center();
    add(geo, sage());
    const c = new THREE.Shape();
    c.moveTo(-0.85, 0.05);
    c.lineTo(-0.3, -0.55);
    c.lineTo(0.9, 0.7);
    c.lineTo(0.62, 0.98);
    c.lineTo(-0.3, 0.02);
    c.lineTo(-0.57, 0.33);
    c.closePath();
    const cg = new THREE.ExtrudeGeometry(c, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 6 });
    cg.center();
    add(cg, pearl(), 0, 0.05, 0.55);
    g.rotation.set(-0.08, -0.5, 0.04);
    g.scale.setScalar(0.95);
  } else if (kind === "cloud") {
    // a cloud resting on a server slab: hosting and infrastructure
    const c = sage();
    add(new THREE.SphereGeometry(1.0, 64, 64), c, -1.15, 0.35, 0);
    add(new THREE.SphereGeometry(1.35, 64, 64), c, 0, 0.85, 0);
    add(new THREE.SphereGeometry(1.05, 64, 64), c, 1.2, 0.4, 0);
    add(new THREE.CapsuleGeometry(0.72, 2.3, 16, 48), c, 0, -0.05, 0, 0, 0, Math.PI / 2);
    add(new RoundedBoxGeometry(3.6, 0.42, 1.9, 8, 0.18), ink(), 0, -1.55, 0);
    add(new RoundedBoxGeometry(3.6, 0.42, 1.9, 8, 0.18), pearl(), 0, -2.1, 0);
    add(new THREE.SphereGeometry(0.11, 24, 24), sage(), -1.4, -1.55, 0.97);
    add(new THREE.SphereGeometry(0.11, 24, 24), sage(), -1.05, -1.55, 0.97);
    g.rotation.set(0.18, -0.42, 0);
    g.position.y = 0.35;
    g.scale.setScalar(0.9);
  } else if (kind === "workshops") {
    // three people around a table
    const person = (x, z, h, mat) => {
      add(new THREE.CapsuleGeometry(0.62, h, 16, 32), mat, x, -1.1 + h / 2, z);
      add(new THREE.SphereGeometry(0.52, 48, 48), mat, x, -1.1 + h + 1.25, z);
    };
    person(-1.55, 0.2, 0.9, pearl());
    person(0, -0.5, 1.5, sage());
    person(1.55, 0.2, 0.9, ink());
    g.rotation.set(0.12, -0.25, 0);
    g.position.y = -0.25;
    g.scale.setScalar(0.95);
  } else if (kind === "integration") {
    // two linked rings: systems joined
    add(new THREE.TorusGeometry(1.35, 0.42, 48, 160), sage(), -0.95, 0, 0, 0.25, 0.2, 0);
    add(new THREE.TorusGeometry(1.35, 0.42, 48, 160), pearl(), 0.95, 0, 0, 1.45, 0.2, 0);
    g.rotation.set(0.15, -0.35, 0.3);
    g.scale.setScalar(0.8);
  } else if (kind === "office") {
    // a small block of desks: the 3D office
    add(box(), sage(), -0.8, -0.75, 0.8);
    add(box(), pearl(), 0.8, -0.75, 0.8);
    add(box(), ink(), -0.8, -0.75, -0.8);
    add(box(), sage(), 0.8, -0.75, -0.8);
    add(box(), sage(), -0.8, 0.85, -0.8);
    add(box(), pearl(), 0.8, 0.85, -0.8);
    g.rotation.set(0.55, 0.78, 0);
    g.scale.setScalar(0.88);
    g.position.y = 0.1;
  }

  const light = (c, i, x, y, z) => {
    const p = new THREE.PointLight(c, i, 40, 1.6);
    p.position.set(x, y, z);
    scene.add(p);
  };
  light(0xffffff, 90, 4, 5, 6);
  light(0x81c5b9, 140, -5, 1, 4);
  light(0x2b6a60, 120, 2, -5, 2);
  light(0xdffbf4, 60, -2, 4, -4);
  light(0x9be3d4, 70, 5, -2, -3);
  renderer.render(scene, camera);
  return true;
};
