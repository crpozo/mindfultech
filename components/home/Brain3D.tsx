"use client";

import * as React from "react";

/**
 * 3D neural brain for the hero — anatomical point cloud (two hemispheres with
 * gyri, cerebellum, brainstem) whose neurons link to near neighbours and carry
 * travelling impulses along the graph. Renders on a transparent canvas over
 * the light hero wash, auto-rotates slowly and can be dragged. The scene
 * assembles on mount, pauses while offscreen, and falls back to the brand
 * mark if WebGL is unavailable.
 */
export function Brain3D() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import(
          "three/examples/jsm/controls/OrbitControls.js"
        );
        if (disposed || !ref.current) return;

        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
        });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          38,
          mount.clientWidth / mount.clientHeight,
          0.1,
          60
        );
        camera.position.set(1.74, 0.26, 2.0); // ~0.87× → brain fills the canvas

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, -0.02, 0);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.autoRotate = !reduced;
        controls.autoRotateSpeed = 0.8;
        controls.enablePan = false;
        controls.enableZoom = false; // never hijack page scroll

        // ---- noise for the gyri ----
        const hash = (x: number, y: number, z: number) => {
          const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
          return s - Math.floor(s);
        };
        const mix = (a: number, b: number, t: number) => a + (b - a) * t;
        const vnoise = (x: number, y: number, z: number) => {
          const xi = Math.floor(x),
            yi = Math.floor(y),
            zi = Math.floor(z),
            xf = x - xi,
            yf = y - yi,
            zf = z - zi;
          const u = xf * xf * (3 - 2 * xf),
            v = yf * yf * (3 - 2 * yf),
            w = zf * zf * (3 - 2 * zf);
          const h = (i: number, j: number, k: number) =>
            hash(xi + i, yi + j, zi + k);
          return mix(
            mix(mix(h(0, 0, 0), h(1, 0, 0), u), mix(h(0, 1, 0), h(1, 1, 0), u), v),
            mix(mix(h(0, 0, 1), h(1, 0, 1), u), mix(h(0, 1, 1), h(1, 1, 1), u), v),
            w
          );
        };
        const fbm = (x: number, y: number, z: number) =>
          vnoise(x, y, z) * 0.55 +
          vnoise(x * 2.7, y * 2.7, z * 2.7) * 0.3 +
          vnoise(x * 6.1, y * 6.1, z * 6.1) * 0.15;
        const randDir = () => {
          let x = 0,
            y = 0,
            z = 0,
            l = 2;
          while (l > 1 || l < 1e-4) {
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
            z = Math.random() * 2 - 1;
            l = x * x + y * y + z * z;
          }
          l = Math.sqrt(l);
          return { x: x / l, y: y / l, z: z / l };
        };

        // ---- anatomy sampled as neurons; palette deep enough for light bg --
        const pts: number[] = [];
        const cols: number[] = [];
        const colBack = new THREE.Color("#3f9e76"); // deeper brand green
        const colFront = new THREE.Color("#57c295"); // lighter brand green
        const colCb = new THREE.Color("#2f8d6c"); // cerebellum, deeper
        const colSt = new THREE.Color("#3f8f70"); // brainstem
        const tmpC = new THREE.Color();
        const pushPt = (x: number, y: number, z: number, c: { r: number; g: number; b: number }) => {
          pts.push(x, y, z);
          const v = 0.75 + Math.random() * 0.4;
          cols.push(c.r * v, c.g * v, c.b * v);
        };
        for (const side of [-1, 1]) {
          let n = 0;
          while (n < 1400) {
            const d = randDir();
            if (d.x * side < 0.015) continue; // hairline longitudinal fissure
            let x = d.x * 0.6,
              y = d.y * 0.5,
              z = d.z * 0.78;
            if (y < 0) y *= 0.74; // flat base
            if (z > 0.25) y *= 1 - (z - 0.25) * 0.16; // frontal taper
            const w = 1 + (fbm(x * 4 + side * 9, y * 4, z * 4) - 0.5) * 0.34; // gyri
            x *= w;
            y *= w;
            z *= w;
            x += side * 0.012;
            y += 0.1;
            const m = Math.min(Math.max((z + 0.85) / 1.7, 0), 1);
            tmpC.copy(colBack).lerp(colFront, m);
            pushPt(x, y, z, tmpC);
            n++;
          }
        }
        let cb = 0;
        while (cb < 340) {
          const d = randDir();
          // cerebellum — a small bulge tucked under the occipital lobe, not a
          // second sphere; keep it modest so brain proportions read correctly
          let x = d.x * 0.22,
            y = d.y * 0.15,
            z = d.z * 0.2;
          const bands = Math.sin(y * 46 + fbm(x * 5, y * 5, z * 5) * 3) * 0.5 + 0.5;
          const w = 1 + (bands - 0.5) * 0.16 + (fbm(x * 6, y * 6, z * 6) - 0.5) * 0.1;
          x *= w;
          y *= w;
          z *= w;
          y -= 0.28;
          z -= 0.52;
          pushPt(x, y, z, colCb);
          cb++;
        }
        for (let i = 0; i < 170; i++) {
          const t = Math.random(),
            a = Math.random() * Math.PI * 2;
          const r = (0.13 - 0.05 * t) * (0.7 + Math.random() * 0.5);
          pushPt(
            Math.cos(a) * r,
            -0.14 - t * 0.55,
            -0.16 - t * 0.26 + Math.sin(a) * r,
            colSt
          );
        }
        const N = pts.length / 3;
        const posArr = new Float32Array(pts);
        const colArr = new Float32Array(cols);

        const glowTexture = () => {
          const c = document.createElement("canvas");
          c.width = c.height = 64;
          const g = c.getContext("2d")!;
          const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
          gr.addColorStop(0, "rgba(255,255,255,1)");
          gr.addColorStop(0.35, "rgba(255,255,255,.55)");
          gr.addColorStop(1, "rgba(255,255,255,0)");
          g.fillStyle = gr;
          g.fillRect(0, 0, 64, 64);
          return new THREE.CanvasTexture(c);
        };
        const glow = glowTexture();

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
        geo.setAttribute("color", new THREE.BufferAttribute(colArr, 3));
        const ptsMat = new THREE.PointsMaterial({
          size: 0.034,
          map: glow,
          vertexColors: true,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
          sizeAttenuation: true,
        });
        const cloud = new THREE.Points(geo, ptsMat);

        // ---- synapses: edges between near neighbours via spatial hash ----
        const cell = 0.13;
        const grid = new Map<string, number[]>();
        const gk = (i: number, j: number, k: number) => i + "," + j + "," + k;
        for (let i = 0; i < N; i++) {
          const k = gk(
            Math.floor(posArr[i * 3] / cell),
            Math.floor(posArr[i * 3 + 1] / cell),
            Math.floor(posArr[i * 3 + 2] / cell)
          );
          let a = grid.get(k);
          if (!a) {
            a = [];
            grid.set(k, a);
          }
          a.push(i);
        }
        const edges: [number, number][] = [];
        const adj: number[][] = Array.from({ length: N }, () => []);
        const maxD2 = 0.125 * 0.125;
        for (let i = 0; i < N; i++) {
          const xi = posArr[i * 3],
            yi = posArr[i * 3 + 1],
            zi = posArr[i * 3 + 2];
          const ci = Math.floor(xi / cell),
            cj = Math.floor(yi / cell),
            ck = Math.floor(zi / cell);
          const cand: [number, number][] = [];
          for (let a = -1; a <= 1; a++)
            for (let b = -1; b <= 1; b++)
              for (let c = -1; c <= 1; c++) {
                const arr = grid.get(gk(ci + a, cj + b, ck + c));
                if (!arr) continue;
                for (const j of arr) {
                  if (j <= i) continue;
                  const dx = posArr[j * 3] - xi,
                    dy = posArr[j * 3 + 1] - yi,
                    dz = posArr[j * 3 + 2] - zi;
                  const d2 = dx * dx + dy * dy + dz * dz;
                  if (d2 < maxD2) cand.push([d2, j]);
                }
              }
          cand.sort((p, q) => p[0] - q[0]);
          for (let m = 0; m < Math.min(2, cand.length); m++) {
            const j = cand[m][1],
              e = edges.length;
            edges.push([i, j]);
            adj[i].push(e);
            adj[j].push(e);
          }
        }
        const eLen = edges.map(([a, b]) => {
          const dx = posArr[b * 3] - posArr[a * 3],
            dy = posArr[b * 3 + 1] - posArr[a * 3 + 1],
            dz = posArr[b * 3 + 2] - posArr[a * 3 + 2];
          return Math.sqrt(dx * dx + dy * dy + dz * dz);
        });
        const lpos = new Float32Array(edges.length * 6);
        const lcol = new Float32Array(edges.length * 6);
        edges.forEach(([a, b], e) => {
          for (let k = 0; k < 3; k++) {
            lpos[e * 6 + k] = posArr[a * 3 + k];
            lpos[e * 6 + 3 + k] = posArr[b * 3 + k];
            lcol[e * 6 + k] = colArr[a * 3 + k] * 0.6;
            lcol[e * 6 + 3 + k] = colArr[b * 3 + k] * 0.6;
          }
        });
        const lgeo = new THREE.BufferGeometry();
        lgeo.setAttribute("position", new THREE.BufferAttribute(lpos, 3));
        lgeo.setAttribute("color", new THREE.BufferAttribute(lcol, 3));
        const lMat = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.34,
          depthWrite: false,
        });
        const lines = new THREE.LineSegments(lgeo, lMat);

        // ---- impulses travelling the graph ----
        const NP = 110,
          TR = 3;
        const ppos = new Float32Array(NP * TR * 3);
        const pcol = new Float32Array(NP * TR * 3);
        const headC = [0.42, 0.36, 0.88]; // violet impulses pop on the green mesh
        const dim = [1, 0.55, 0.3];
        for (let p = 0; p < NP; p++)
          for (let s = 0; s < TR; s++)
            for (let k = 0; k < 3; k++)
              pcol[(p * TR + s) * 3 + k] = headC[k] * (2 - dim[s]);
        type Pulse = { e: number; dir: number; t: number; sp: number };
        const pulses: Pulse[] = [];
        for (let p = 0; p < NP; p++)
          pulses.push({
            e: (Math.random() * edges.length) | 0,
            dir: Math.random() < 0.5 ? 1 : -1,
            t: Math.random(),
            sp: (0.9 + Math.random() * 1.6) * 0.14,
          });
        const pgeo = new THREE.BufferGeometry();
        pgeo.setAttribute("position", new THREE.BufferAttribute(ppos, 3));
        pgeo.setAttribute("color", new THREE.BufferAttribute(pcol, 3));
        const pMat = new THREE.PointsMaterial({
          size: 0.055,
          map: glow,
          vertexColors: true,
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
          sizeAttenuation: true,
        });
        const pulseCloud = new THREE.Points(pgeo, pMat);

        const writePulsePos = (pu: Pulse, tt: number, slot: number) => {
          const [a, b] = edges[pu.e];
          const from = pu.dir > 0 ? a : b,
            to = pu.dir > 0 ? b : a;
          for (let k = 0; k < 3; k++)
            ppos[slot * 3 + k] =
              posArr[from * 3 + k] +
              (posArr[to * 3 + k] - posArr[from * 3 + k]) * tt;
        };
        const updatePulses = (dt: number) => {
          for (let p = 0; p < NP; p++) {
            const pu = pulses[p];
            pu.t += (dt * pu.sp) / Math.max(eLen[pu.e], 0.02);
            if (pu.t >= 1) {
              // hop to a connected synapse so impulses follow real paths
              const [a, b] = edges[pu.e];
              const node = pu.dir > 0 ? b : a;
              const opts = adj[node];
              const ne = opts.length
                ? opts[(Math.random() * opts.length) | 0]
                : (Math.random() * edges.length) | 0;
              pu.e = ne;
              pu.dir =
                edges[pu.e][0] === node ? 1 : edges[pu.e][1] === node ? -1 : Math.random() < 0.5 ? 1 : -1;
              pu.t = 0;
            }
            writePulsePos(pu, pu.t, p * TR);
            writePulsePos(pu, Math.max(pu.t - 0.14, 0), p * TR + 1);
            writePulsePos(pu, Math.max(pu.t - 0.28, 0), p * TR + 2);
          }
          pgeo.attributes.position.needsUpdate = true;
        };

        const brain = new THREE.Group();
        brain.add(cloud, lines, pulseCloud);
        brain.rotation.x = 0.05;
        scene.add(brain);

        // ---- run: assemble intro, breathe, pause offscreen ----
        const clock = new THREE.Clock();
        let raf = 0;
        let visible = true;
        let running = false;
        let intro = 0; // 0 → 1 over the first ~1.4s

        const frame = () => {
          raf = requestAnimationFrame(frame);
          const dt = Math.min(clock.getDelta(), 0.05);
          const t = clock.elapsedTime;
          if (intro < 1) {
            intro = Math.min(1, intro + dt / 1.4);
            const e = 1 - Math.pow(1 - intro, 3);
            brain.scale.setScalar(0.65 + 0.35 * e);
            ptsMat.opacity = 0.95 * e;
            lMat.opacity = 0.34 * e;
            pMat.opacity = 0.9 * e;
            brain.rotation.y = (1 - e) * -0.9;
          } else if (!reduced) {
            const breathe = 1 + Math.sin(t * 1.35) * 0.012;
            brain.scale.setScalar(breathe);
            ptsMat.opacity = 0.88 + Math.sin(t * 1.35) * 0.07;
          }
          if (!reduced || intro < 1) updatePulses(dt);
          controls.update();
          renderer.render(scene, camera);
        };
        const start = () => {
          if (running) return;
          running = true;
          clock.getDelta();
          raf = requestAnimationFrame(frame);
        };
        const stop = () => {
          running = false;
          cancelAnimationFrame(raf);
        };
        const io = new IntersectionObserver(
          ([en]) => {
            visible = en.isIntersecting;
            if (visible && !document.hidden) start();
            else stop();
          },
          { threshold: 0.05 }
        );
        io.observe(mount);
        const onVis = () => {
          if (!document.hidden && visible) start();
          else stop();
        };
        document.addEventListener("visibilitychange", onVis);

        const ro = new ResizeObserver(() => {
          const w = mount.clientWidth,
            h = mount.clientHeight;
          if (!w || !h) return;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        });
        ro.observe(mount);

        start();

        cleanup = () => {
          stop();
          io.disconnect();
          ro.disconnect();
          document.removeEventListener("visibilitychange", onVis);
          controls.dispose();
          geo.dispose();
          lgeo.dispose();
          pgeo.dispose();
          ptsMat.dispose();
          lMat.dispose();
          pMat.dispose();
          glow.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  if (failed)
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-mark.webp" alt="" width={160} height={160} style={{ opacity: 0.9 }} />
      </div>
    );
  return (
    <div
      ref={ref}
      style={{ position: "absolute", inset: 0, cursor: "grab" }}
      aria-hidden
    />
  );
}
