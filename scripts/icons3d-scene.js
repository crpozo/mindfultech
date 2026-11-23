// Renders one 3D service icon into the page (sage glass-metal, same material
// as the knot on the home). Bundled with esbuild and screenshotted headless by
// scripts/icons3d-render.cjs to produce public/mt/icon-*.webp.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

window.renderIcon = (kind, W = 640, H = W) => {
  document.querySelector("canvas")?.remove();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environmentIntensity = 0.6;
  const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
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
  } else if (kind === "vision") {
    // a security camera on its wall mount: computer vision
    const cam = new THREE.Group();
    const put = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      cam.add(m);
    };
    // body lies along x, lens to the left
    put(new THREE.CapsuleGeometry(0.78, 2.3, 24, 48), pearl(), 0, 0, 0, 0, 0, Math.PI / 2);
    put(new RoundedBoxGeometry(3.3, 0.24, 1.9, 8, 0.1), sage(), -0.2, 0.86, 0);
    put(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 64), sage(), -1.75, 0, 0, 0, 0, Math.PI / 2);
    put(new THREE.CylinderGeometry(0.56, 0.56, 0.2, 64), ink(), -2.02, 0, 0, 0, 0, Math.PI / 2);
    put(new THREE.SphereGeometry(0.34, 48, 48), ink(), -2.02, 0, 0);
    put(new THREE.SphereGeometry(0.09, 24, 24), pearl(), -2.3, 0.14, 0.12);
    put(new THREE.SphereGeometry(0.1, 24, 24), sage(), 1.0, 0.3, 0.72);
    cam.rotation.set(0, 0, 0.3);
    cam.position.set(-0.35, 0.55, 0);
    g.add(cam);
    // arm and wall plate
    add(new THREE.CylinderGeometry(0.2, 0.2, 1.9, 32), ink(), 1.45, -0.52, 0, 0, 0, 0.885);
    add(new THREE.SphereGeometry(0.34, 32, 32), ink(), 0.75, 0.05, 0);
    add(new RoundedBoxGeometry(0.4, 2.3, 1.7, 8, 0.14), ink(), 2.15, -1.1, 0);
    g.rotation.set(0.12, 0.62, 0);
    g.scale.setScalar(0.86);
    g.position.y = 0.2;
  } else if (kind === "hub") {
    // one platform in the middle, every system wired into it
    camera.position.set(11.5, 9.2, 11.5);
    camera.lookAt(0, 0.9, 0);
    const glow = (c = 0x8fe6d3) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
    const tex = (draw, w = 512, h = 352) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const x = c.getContext("2d");
      draw(x, w, h);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    };
    const frame = (x, w, h) => {
      x.fillStyle = "#0f1f1d";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#8fe6d3";
      x.fillRect(34, 34, 120, 14);
      x.fillStyle = "#3d6f66";
      x.fillRect(34, 60, 200, 8);
    };
    const charts = {
      bars: (x, w, h) => {
        frame(x, w, h);
        [0.35, 0.55, 0.42, 0.75, 0.6, 0.9, 0.7].forEach((v, i) => {
          x.fillStyle = i === 5 ? "#ffffff" : "#6fc9b8";
          x.fillRect(40 + i * 64, h - 36 - v * 200, 40, v * 200);
        });
      },
      line: (x, w, h) => {
        frame(x, w, h);
        const pts = [0.3, 0.42, 0.36, 0.58, 0.5, 0.72, 0.66, 0.88];
        x.beginPath();
        pts.forEach((v, i) => x[i ? "lineTo" : "moveTo"](40 + i * 62, h - 40 - v * 200));
        x.lineWidth = 9;
        x.strokeStyle = "#8fe6d3";
        x.lineJoin = "round";
        x.stroke();
        x.lineTo(40 + 7 * 62, h - 36);
        x.lineTo(40, h - 36);
        x.fillStyle = "rgba(143,230,211,0.18)";
        x.fill();
      },
      donut: (x, w, h) => {
        frame(x, w, h);
        const cx = 150, cy = h / 2 + 40, r = 82;
        x.lineWidth = 34;
        x.strokeStyle = "#2c5850";
        x.beginPath();
        x.arc(cx, cy, r, 0, Math.PI * 2);
        x.stroke();
        x.strokeStyle = "#8fe6d3";
        x.beginPath();
        x.arc(cx, cy, r, -Math.PI / 2, Math.PI * 0.95);
        x.stroke();
        [0.9, 0.6, 0.75, 0.45].forEach((v, i) => {
          x.fillStyle = i ? "#3d6f66" : "#ffffff";
          x.fillRect(290, 118 + i * 48, 180 * v, 16);
        });
      },
      rows: (x, w, h) => {
        frame(x, w, h);
        [0.8, 0.55, 0.9, 0.4, 0.7].forEach((v, i) => {
          x.fillStyle = "#8fe6d3";
          x.beginPath();
          x.arc(52, 122 + i * 46, 11, 0, Math.PI * 2);
          x.fill();
          x.fillStyle = i === 2 ? "#ffffff" : "#3d6f66";
          x.fillRect(84, 114 + i * 46, 380 * v, 16);
        });
      },
    };
    // the platform
    add(new RoundedBoxGeometry(5.2, 0.4, 5.2, 8, 0.18), ink(), 0, 0, 0);
    add(new RoundedBoxGeometry(4.1, 0.4, 4.1, 8, 0.18), pearl(), 0, 0.42, 0);
    add(new RoundedBoxGeometry(3.0, 0.55, 3.0, 8, 0.22), sage(), 0, 0.92, 0);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, map: tex((x, w, h) => {
      x.clearRect(0, 0, w, h);
      x.fillStyle = "#12302b";
      x.beginPath();
      x.roundRect(0, 0, w, h, 70);
      x.fill();
      x.fillStyle = "#c9fff3";
      x.font = "600 250px Outfit, Helvetica, Arial, sans-serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("AI", w / 2, h / 2 + 14);
    }, 512, 512) }));
    top.position.set(0, 1.2, 0);
    top.rotation.set(-Math.PI / 2, 0, Math.PI / 4);
    g.add(top);
    for (let i = -4; i <= 4; i++) {
      add(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 12), pearl(), i * 0.5, 0.05, 2.68, Math.PI / 2, 0, 0);
      add(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 12), pearl(), 2.68, 0.05, i * 0.5, 0, 0, Math.PI / 2);
    }
    // systems: standing screens around the platform, each wired to it
    const screens = [
      [-6.2, 2.6, -1.2, "bars", Math.PI / 2, 2.9],
      [-1.2, 2.9, -6.2, "donut", 0, 2.9],
      [-5.4, 2.4, -5.4, "line", Math.PI / 4, 2.5],
      [3.6, 2.2, -6.0, "rows", 0, 2.4],
      [-6.0, 2.2, 3.6, "line", Math.PI / 2, 2.4],
    ];
    screens.forEach(([x, y, z, kind2, ry, w]) => {
      const h = w * 0.69;
      const body = add(new RoundedBoxGeometry(w + 0.16, h + 0.16, 0.1, 6, 0.05), ink(), x, y, z, 0, ry, 0);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(charts[kind2]), toneMapped: false }));
      face.position.z = 0.056;
      body.add(face);
      add(new THREE.CylinderGeometry(0.035, 0.035, y - h / 2, 8), glow(0x4f9b8d), x, (y - h / 2) / 2 - 0.2, z);
    });
    // flat tiles on the floor in front
    [[5.6, 1.4, "bars", 2.6], [1.4, 5.6, "rows", 2.6], [5.4, 5.2, "donut", 2.2]].forEach(([x, z, kind2, w]) => {
      const h = w * 0.69;
      add(new RoundedBoxGeometry(w + 0.16, 0.1, h + 0.16, 6, 0.05), ink(), x, -0.15, z);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(charts[kind2]), toneMapped: false }));
      face.position.set(x, -0.09, z);
      face.rotation.x = -Math.PI / 2;
      g.add(face);
    });
    // traces on the floor from the platform to each system
    const trace = (x1, z1, x2, z2) => {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      add(new THREE.BoxGeometry(len, 0.04, 0.07), glow(), (x1 + x2) / 2, -0.18, (z1 + z2) / 2, 0, -Math.atan2(dz, dx), 0);
      add(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 24), glow(0xffffff), x2, -0.17, z2);
    };
    [[-2.6, -0.6, -6.2, -0.6], [-2.6, -1.2, -6.2, -1.2], [-0.6, -2.6, -0.6, -6.2], [-1.2, -2.6, -1.2, -6.2], [-2.6, -2.6, -5.4, -5.4], [1.8, -2.6, 3.6, -6.0], [-2.6, 1.8, -6.0, 3.6], [2.6, 1.0, 4.2, 1.0], [2.6, 1.6, 4.2, 1.6], [1.0, 2.6, 1.0, 4.6], [1.6, 2.6, 1.6, 4.6], [2.6, 2.6, 4.3, 4.3]].forEach((a) => trace(...a));
    g.position.y = 0.35;
    g.scale.setScalar(0.66);
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
