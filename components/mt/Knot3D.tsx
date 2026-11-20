"use client";

import * as React from "react";

/**
 * The sage knot behind the four control cards, turning slowly in real 3D.
 * The still render shows first and stays as the fallback (no WebGL, or the
 * visitor asked for reduced motion); the canvas fades in over it once ready
 * and only draws while the block is on screen.
 */
export function Knot3D({ className }: { className?: string }) {
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
      if (dead) return;
      let renderer: import("three").WebGLRenderer;
      try {
        // preserveDrawingBuffer keeps the last frame in the canvas, so the frosted
        // cards above it never sample an empty buffer when the page repaints
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
      scene.environmentIntensity = 0.55;
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0.2, 11.8);
      camera.lookAt(0, 0, 0);

      const geo = new THREE.TorusKnotGeometry(1.75, 0.6, 260, 40, 2, 3);
      const mat = new THREE.MeshPhysicalMaterial({ color: 0x6fb8ab, metalness: 0.85, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 0.9, iridescenceIOR: 1.6, iridescenceThicknessRange: [180, 520], sheen: 0.4, sheenColor: 0xbfeee3 });
      const knot = new THREE.Mesh(geo, mat);
      knot.rotation.set(0.5, -0.5, 0.25);
      scene.add(knot);
      const light = (c: number, i: number, x: number, y: number, z: number) => {
        const p = new THREE.PointLight(c, i, 40, 1.6);
        p.position.set(x, y, z);
        scene.add(p);
      };
      light(0xffffff, 90, 4, 5, 6);
      light(0x81c5b9, 140, -5, 1, 4);
      light(0x2b6a60, 120, 2, -5, 2);
      light(0xdffbf4, 60, -2, 4, -4);
      light(0x9be3d4, 70, 5, -2, -3);

      let lastW = 0;
      const size = () => {
        const w = el.clientWidth || 300;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        if (w === lastW) return;
        lastW = w;
        renderer.setSize(w, w, false);
        // resizing clears the canvas: draw straight away so it never shows blank
        renderer.render(scene, camera);
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(el);

      let raf = 0;
      let visible = false;
      const t0 = performance.now();
      const frame = (now: number) => {
        const t = (now - t0) / 1000;
        knot.rotation.set(0.5 + Math.sin(t * 0.35) * 0.22, -0.5 + t * 0.28, 0.25 + Math.sin(t * 0.22) * 0.12);
        knot.position.y = Math.sin(t * 0.6) * 0.12;
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
        geo.dispose();
        mat.dispose();
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
    <div ref={host} className={className} aria-hidden="true" data-live={live}>
      <img src="/mt/knot.webp" alt="" width={1200} height={1200} loading="lazy" />
    </div>
  );
}
