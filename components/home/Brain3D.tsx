"use client";

import * as React from "react";

/** Which scene station each discipline chip opens. `world` and `mark` are only
 *  visited by the idle tour. */
export const CHIP_STATION: Record<string, string> = {
  ux: "brain",
  mobile: "app",
  code: "code",
  cloud: "cloud",
  agents: "run",
};
const TOUR = ["brain", "app", "code", "cloud", "run", "world", "mark"];
// chip offsets on the ring around the object (px), per discipline
const NUDGE: Record<string, [number, number]> = {
  ux: [-10, -6],
  agents: [10, -10],
  cloud: [14, 6],
  code: [-14, 6],
  mobile: [0, 8],
};

type Scene = {
  goTo: (s: string) => void;
  setFocus: (k: string | null) => void;
  setHover: (k: string | null) => void;
  setScroll: (p: number) => void;
  state: { intro: number; station: string; mouse: { on: boolean }; dragging: boolean; focus: string | null };
  dispose: () => void;
};

/**
 * The hero's 3D stage: one particle swarm that is the anatomical brain and
 * reshapes itself into a phone, a browser of code, an AWS lattice, an agent
 * loop, the client world map and the MindfulTech mark. Chips are anchored to
 * 3D regions each frame (leader lines on the overlay canvas); clicking one
 * flies to its region or morphs to its station. After a few idle seconds the
 * scene tours the stations on its own; any pointer activity pauses it.
 *
 * Scene code lives in heroScene.js, imported lazily during idle time so it
 * never competes with the headline for the main thread. Phones never mount
 * it (CSS hides .hero-stage below 900px). Falls back to the brand mark when
 * WebGL is unavailable.
 */
export function Brain3D({
  focus = null,
  hover = null,
  chipEls,
}: {
  focus?: string | null;
  hover?: string | null;
  chipEls: React.MutableRefObject<Record<string, HTMLElement | null>>;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLCanvasElement>(null);
  const sceneRef = React.useRef<Scene | null>(null);
  const focusRef = React.useRef<string | null>(focus);
  const [failed, setFailed] = React.useState(false);

  // chip click → region fly-to (brain) or station morph; close → back to the brain
  React.useEffect(() => {
    focusRef.current = focus;
    const s = sceneRef.current;
    if (!s) return;
    const station = focus ? CHIP_STATION[focus] : "brain";
    s.goTo(station);
    s.setFocus(station === "brain" ? focus : null);
  }, [focus]);
  React.useEffect(() => {
    sceneRef.current?.setHover(hover);
  }, [hover]);

  React.useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    if (window.matchMedia("(max-width: 900px)").matches) return;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    const init = async () => {
      try {
        const { createHero } = await import("./heroScene.js");
        if (disposed || !ref.current || !overlayRef.current) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const chips = Object.keys(CHIP_STATION)
          .map((key) => ({ key, station: CHIP_STATION[key], nudge: NUDGE[key], el: chipEls.current[key] }))
          .filter((c) => c.el);
        const scene: Scene = createHero({
          mount,
          anchor: mount,
          overlay: overlayRef.current,
          chips,
          quality: "high",
          reduced,
        });
        sceneRef.current = scene;
        if (focusRef.current) {
          const station = CHIP_STATION[focusRef.current];
          scene.goTo(station);
          scene.setFocus(station === "brain" ? focusRef.current : null);
        }

        // ---- idle tour: sells on its own, yields to the visitor ----
        let lastAct = performance.now();
        let stepStart = 0;
        let touring = false;
        let toured = false;
        const act = () => {
          lastAct = performance.now();
          touring = false;
        };
        mount.addEventListener("pointerdown", act);
        window.addEventListener("keydown", act);
        const tick = window.setInterval(() => {
          if (reduced || document.hidden) return;
          const st = scene.state;
          const now = performance.now();
          const engaged = st.mouse.on || st.dragging || !!focusRef.current;
          if (engaged) {
            lastAct = now;
            if (touring) touring = false;
            return;
          }
          if (!touring) {
            if (st.intro >= 1 && now - lastAct > (toured ? 14000 : 8000)) {
              touring = true;
              toured = true;
              stepStart = now;
            }
            return;
          }
          if (now - stepStart >= 6000) {
            const next = TOUR[(TOUR.indexOf(st.station) + 1) % TOUR.length];
            scene.goTo(next);
            scene.setFocus(null);
            stepStart = now;
          }
        }, 250);

        // short scroll link over the hero's own height: dolly back and fade
        const onScroll = () => {
          const h = window.innerHeight || 1;
          scene.setScroll(Math.max(0, Math.min(1, window.scrollY / h)));
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        cleanup = () => {
          window.clearInterval(tick);
          mount.removeEventListener("pointerdown", act);
          window.removeEventListener("keydown", act);
          window.removeEventListener("scroll", onScroll);
          scene.dispose();
          sceneRef.current = null;
        };
      } catch {
        if (!disposed) setFailed(true);
      }
    };

    // Defer the heavy build off the LCP critical path: the hero copy paints
    // first and the scene assembles during idle time, at most ~1.5s later.
    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => void init(), { timeout: 1500 });
    } else {
      timerId = setTimeout(() => void init(), 1500);
    }
    return () => {
      disposed = true;
      if (idleId !== null) window.cancelIdleCallback(idleId);
      if (timerId !== null) clearTimeout(timerId);
      cleanup?.();
    };
    // chipEls is a stable ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed)
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-mark.webp" alt="" width={160} height={160} style={{ opacity: 0.9 }} />
      </div>
    );
  return (
    <>
      <div ref={ref} style={{ position: "absolute", inset: 0, cursor: "grab", touchAction: "pan-y" }} aria-hidden />
      <canvas ref={overlayRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} aria-hidden />
    </>
  );
}
