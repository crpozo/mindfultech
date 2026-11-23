"use client";

import * as React from "react";

/**
 * The integration block's illustration: one platform in the middle with every
 * system wired into it, drawn live in 3D. An orthographic camera keeps every
 * panel on the same isometric axes, so nothing looks skewed. Data pulses run
 * along the wires into the platform and the charts on each screen keep moving.
 * The still render is the fallback (no WebGL, or reduced motion) and the scene
 * only draws while the block is on screen.
 */
export function Hub3D({ className, alt }: { className?: string; alt: string }) {
  const host = React.useRef<HTMLDivElement>(null);
  const [live, setLive] = React.useState(false);

  React.useEffect(() => {
    const el = host.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let dead = false;
    let stop = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      const { RoundedBoxGeometry } = await import("three/examples/jsm/geometries/RoundedBoxGeometry.js");
      if (dead) return;
      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      } catch {
        return;
      }
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      const canvas = renderer.domElement;
      canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
      el.appendChild(canvas);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
      scene.environmentIntensity = 0.6;
      const camera = new THREE.OrthographicCamera(-10, 10, 8, -8, 0.1, 100);
      camera.position.set(14, 11.5, 14);
      camera.lookAt(0, 1.3, 0);

      const world = new THREE.Group();
      scene.add(world);
      const sage = new THREE.MeshPhysicalMaterial({ color: 0x6fb8ab, metalness: 0.85, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 0.9, iridescenceIOR: 1.6, iridescenceThicknessRange: [180, 520], sheen: 0.4, sheenColor: 0xbfeee3 });
      const pearl = new THREE.MeshPhysicalMaterial({ color: 0xeef4f2, metalness: 0.25, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 });
      const ink = new THREE.MeshPhysicalMaterial({ color: 0x1f2a28, metalness: 0.6, roughness: 0.28, clearcoat: 1 });
      const floor = new THREE.MeshBasicMaterial({ color: 0xf7fbfa, toneMapped: false });
      const add = (geo: import("three").BufferGeometry, mat: import("three").Material, x = 0, y = 0, z = 0, parent: import("three").Object3D = world) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        parent.add(m);
        return m;
      };

      // the island everything stands on
      add(new RoundedBoxGeometry(12.8, 0.36, 12.8, 6, 0.3), floor, 0, -0.18, 0);

      // the platform
      add(new RoundedBoxGeometry(5.2, 0.42, 5.2, 8, 0.18), ink, 0, 0.21, 0);
      add(new RoundedBoxGeometry(4.1, 0.42, 4.1, 8, 0.18), pearl, 0, 0.63, 0);
      const core = add(new RoundedBoxGeometry(3.0, 0.56, 3.0, 8, 0.22), sage, 0, 1.2, 0);
      const label = document.createElement("canvas");
      label.width = label.height = 512;
      const lx = label.getContext("2d")!;
      lx.fillStyle = "#12302b";
      lx.beginPath();
      lx.roundRect(0, 0, 512, 512, 80);
      lx.fill();
      lx.fillStyle = "#c9fff3";
      lx.font = "600 250px Outfit, Helvetica, Arial, sans-serif";
      lx.textAlign = "center";
      lx.textBaseline = "middle";
      lx.fillText("AI", 256, 272);
      const labelTex = new THREE.CanvasTexture(label);
      labelTex.colorSpace = THREE.SRGBColorSpace;
      const top = add(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, toneMapped: false }), 0, 0.29, 0, core);
      top.rotation.set(-Math.PI / 2, 0, Math.PI / 4);
      const pin = new THREE.BoxGeometry(0.16, 0.12, 0.5);
      for (let i = -4; i <= 4; i++) {
        add(pin, pearl, i * 0.5, 0.08, 2.75);
        add(pin, pearl, i * 0.5, 0.08, -2.75);
        add(pin, pearl, 2.75, 0.08, i * 0.5).rotation.y = Math.PI / 2;
        add(pin, pearl, -2.75, 0.08, i * 0.5).rotation.y = Math.PI / 2;
      }

      // charts drawn on canvases, redrawn a few times a second
      let acc = "#8fe6d3";
      type Draw = (x: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
      const head = (x: CanvasRenderingContext2D, w: number, h: number) => {
        x.fillStyle = "#ffffff";
        x.fillRect(0, 0, w, h);
        x.fillStyle = acc;
        x.fillRect(26, 26, 96, 11);
        x.fillStyle = "#d3dddb";
        x.fillRect(26, 46, 150, 6);
      };
      const charts: Record<string, Draw> = {
        bars: (x, w, h, t) => {
          head(x, w, h);
          for (let i = 0; i < 7; i++) {
            const v = 0.5 + 0.34 * Math.sin(t * 1.1 + i * 0.9);
            x.fillStyle = i === 4 ? "#1f2a28" : acc;
            x.fillRect(30 + i * 48, h - 26 - v * 150, 30, v * 150);
          }
        },
        line: (x, w, h, t) => {
          head(x, w, h);
          x.beginPath();
          for (let i = 0; i <= 16; i++) {
            const v = 0.22 + i * 0.035 + 0.1 * Math.sin(t * 1.3 + i * 0.7);
            if (i) x.lineTo(28 + i * 20.5, h - 30 - v * 170);
            else x.moveTo(28, h - 30 - v * 170);
          }
          x.lineWidth = 7;
          x.lineJoin = "round";
          x.strokeStyle = acc;
          x.stroke();
          x.lineTo(28 + 16 * 20.5, h - 24);
          x.lineTo(28, h - 24);
          x.globalAlpha = 0.16;
          x.fillStyle = acc;
          x.fill();
          x.globalAlpha = 1;
        },
        donut: (x, w, h, t) => {
          head(x, w, h);
          const cx = 112, cy = h / 2 + 30, r = 60;
          x.lineWidth = 26;
          x.strokeStyle = "#e4ecea";
          x.beginPath();
          x.arc(cx, cy, r, 0, Math.PI * 2);
          x.stroke();
          x.strokeStyle = acc;
          x.beginPath();
          x.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * (1.25 + 0.4 * Math.sin(t * 0.8)));
          x.stroke();
          for (let i = 0; i < 4; i++) {
            x.fillStyle = i ? "#d3dddb" : "#1f2a28";
            x.fillRect(218, 92 + i * 36, 130 * (0.6 + 0.3 * Math.sin(t + i * 1.7)), 12);
          }
        },
        rows: (x, w, h, t) => {
          head(x, w, h);
          const on = Math.floor(t * 0.9) % 5;
          for (let i = 0; i < 5; i++) {
            x.fillStyle = acc;
            x.beginPath();
            x.arc(38, 92 + i * 34, 8, 0, Math.PI * 2);
            x.fill();
            x.fillStyle = i === on ? "#1f2a28" : "#d3dddb";
            x.fillRect(62, 86 + i * 34, 290 * (0.45 + 0.45 * Math.abs(Math.sin(i * 2.1 + 1))), 12);
          }
        },
      };
      const faces: { ctx: CanvasRenderingContext2D; tex: import("three").CanvasTexture; draw: Draw; phase: number; color: string }[] = [];
      const face = (kind: string, w: number, h: number, color: string) => {
        const c = document.createElement("canvas");
        c.width = 384;
        c.height = 264;
        const ctx = c.getContext("2d")!;
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        const phase = faces.length * 1.3;
        acc = color;
        charts[kind](ctx, 384, 264, phase);
        faces.push({ ctx, tex, draw: charts[kind], phase, color });
        return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
      };

      // wires on the floor, with pulses running into the platform
      const pulses: { m: import("three").Mesh; from: [number, number]; to: [number, number]; phase: number }[] = [];
      const pulseGeo = new THREE.SphereGeometry(0.13, 16, 16);
      const nodeGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 24);
      const wireTo = (x: number, z: number, color: string) => {
        const lit = new THREE.MeshBasicMaterial({ color, toneMapped: false });
        const dim = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.45), toneMapped: false });
        // straight run along one axis from the system to the platform's edge
        const alongX = Math.abs(x) > Math.abs(z);
        const ex = alongX ? Math.sign(x) * 2.6 : x;
        const ez = alongX ? z : Math.sign(z) * 2.6;
        const len = Math.hypot(x - ex, z - ez);
        add(new THREE.BoxGeometry(alongX ? len : 0.08, 0.04, alongX ? 0.08 : len), dim, (x + ex) / 2, 0.03, (z + ez) / 2);
        add(nodeGeo, lit, x, 0.04, z);
        for (let k = 0; k < 2; k++) {
          const m = add(pulseGeo, lit, x, 0.12, z);
          pulses.push({ m, from: [x, z], to: [ex, ez], phase: k * 0.5 + pulses.length * 0.137 });
        }
      };

      // standing screens on the two back sides
      const W = 3.0, H = 2.06;
      const frameGeo = new RoundedBoxGeometry(W + 0.16, H + 0.16, 0.1, 6, 0.05);
      const standGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.0, 12);
      const footGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 32);
      const screen = (x: number, z: number, ry: number, kind: string, color: string) => {
        const g = new THREE.Group();
        g.position.set(x, 0, z);
        g.rotation.y = ry;
        world.add(g);
        add(footGeo, sage, 0, 0.04, 0, g);
        add(standGeo, ink, 0, 0.55, 0, g);
        add(frameGeo, ink, 0, 1.05 + H / 2, -0.02, g);
        const f = face(kind, W, H, color);
        f.position.set(0, 1.05 + H / 2, 0.056);
        g.add(f);
        wireTo(x, z, color);
      };
      screen(-5.6, -1.9, Math.PI / 2, "bars", "#eda233");
      screen(-5.6, 1.9, Math.PI / 2, "line", "#4a93ee");
      screen(-1.9, -5.6, 0, "donut", "#8a76f2");
      screen(1.9, -5.6, 0, "rows", "#f0745a");

      // flat tablets on the two front sides
      const tabGeo = new RoundedBoxGeometry(W + 0.16, 0.1, H + 0.16, 6, 0.05);
      const tablet = (x: number, z: number, turn: number, kind: string, color: string) => {
        const g = new THREE.Group();
        g.position.set(x, 0.05, z);
        g.rotation.y = turn;
        world.add(g);
        add(tabGeo, ink, 0, 0, 0, g);
        const f = face(kind, W, H, color);
        f.rotation.x = -Math.PI / 2;
        f.position.y = 0.056;
        g.add(f);
        const dx = Math.abs(x) > Math.abs(z) ? Math.sign(x) * (H / 2 + 0.3) : 0;
        const dz = dx ? 0 : Math.sign(z) * (H / 2 + 0.3);
        wireTo(x - dx, z - dz, color);
      };
      tablet(4.6, 0, Math.PI / 2, "line", "#3fae9a");
      tablet(0, 4.6, 0, "bars", "#ec6aac");

      const light = (c: number, i: number, x: number, y: number, z: number) => {
        const p = new THREE.PointLight(c, i, 60, 1.6);
        p.position.set(x, y, z);
        scene.add(p);
      };
      light(0xffffff, 110, 4, 10, 5);
      light(0x81c5b9, 200, -8, 5, 6);
      light(0x9be3d4, 120, 8, 4, -6);
      light(0xdffbf4, 90, -3, 8, -6);

      let lastW = 0, lastH = 0;
      const size = () => {
        const w = el.clientWidth || 300;
        const h = el.clientHeight || 240;
        if (w === lastW && h === lastH) return;
        lastW = w;
        lastH = h;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h, false);
        const a = w / h;
        // fit the island's diagonal across, and its depth plus the screens up and down
        const half = Math.max(9.5 / a, 6.9);
        camera.left = -half * a;
        camera.right = half * a;
        camera.top = half;
        camera.bottom = -half;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(el);

      let raf = 0;
      let visible = false;
      let lastDraw = 0;
      const t0 = performance.now();
      const frame = (now: number) => {
        const t = (now - t0) / 1000;
        world.rotation.y = Math.sin(t * 0.32) * 0.09;
        core.position.y = 1.2 + Math.sin(t * 1.4) * 0.09;
        for (const p of pulses) {
          const k = (t * 0.45 + p.phase) % 1;
          p.m.position.x = p.from[0] + (p.to[0] - p.from[0]) * k;
          p.m.position.z = p.from[1] + (p.to[1] - p.from[1]) * k;
          p.m.scale.setScalar(0.6 + Math.sin(k * Math.PI) * 0.7);
        }
        if (now - lastDraw > 70) {
          lastDraw = now;
          for (const f of faces) {
            acc = f.color;
            f.draw(f.ctx, 384, 264, t + f.phase);
            f.tex.needsUpdate = true;
          }
        }
        renderer.render(scene, camera);
        if (visible) raf = requestAnimationFrame(frame);
      };
      const io = new IntersectionObserver(([e]) => {
        const was = visible;
        visible = e.isIntersecting && !document.hidden;
        if (visible && !was) raf = requestAnimationFrame(frame);
        if (!visible) cancelAnimationFrame(raf);
      }, { rootMargin: "120px" });
      io.observe(el);
      renderer.render(scene, camera);
      setLive(true);

      stop = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        scene.traverse((o) => {
          const m = o as import("three").Mesh;
          if (m.geometry) m.geometry.dispose();
        });
        for (const f of faces) f.tex.dispose();
        labelTex.dispose();
        pmrem.dispose();
        renderer.dispose();
        canvas.remove();
      };
      if (dead) stop();
    })();

    return () => {
      dead = true;
      stop();
    };
  }, []);

  return (
    <div ref={host} className={className} data-live={live} role="img" aria-label={alt}>
      <img src="/mt/hub.webp" alt="" width={1100} height={880} loading="lazy" />
    </div>
  );
}
