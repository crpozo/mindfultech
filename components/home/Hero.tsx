"use client";

import * as React from "react";
import { useLang } from "../i18n";

const MONO = "var(--mono)";

function openForm(e: React.MouseEvent) {
  e.preventDefault();
  window.dispatchEvent(new CustomEvent("mt:open-form"));
}

const MARQUEE: { name: string; img?: string; h?: number }[] = [
  { name: "USFQ" },
  { name: "ThemedMotion", img: "/portfolio/themedmotion-logo.webp", h: 36 },
  { name: "Helixona" },
  { name: "Western Fence Supply" },
  { name: "CarCompraCorp" },
  { name: "PARC Home Care" },
  { name: "AWS Partner" },
];

/* ---- living-brain stage geometry ------------------------------------------
   The brand mark (logo viewBox 96×88) scaled into a 640×520 stage. It draws
   itself stroke by stroke, the joints breathe, and discipline chips feed the
   brain through dashed connectors with travelling pulses. */
const BS = 3.6;
const BOX = 147.5;
const BOY = 87;
const bx = (x: number) => +(BOX + BS * x).toFixed(1);
const by = (y: number) => +(BOY + BS * y).toFixed(1);

// [x1, y1, x2, y2] in logo coords, ordered so the mark draws outward from the
// crown; dashoffset animates from (x1,y1) toward (x2,y2).
const SEGS: [number, number, number, number][] = [
  [47, 11, 63, 17],
  [47, 11, 29, 16],
  [63, 17, 77, 28],
  [29, 16, 15, 30],
  [77, 28, 84, 43],
  [15, 30, 9, 47],
  [84, 43, 75, 57],
  [9, 47, 16, 56],
  [16, 56, 27, 64],
  [27, 64, 43, 69],
  [43, 69, 60, 66],
  [47, 11, 52, 28],
  [29, 16, 33, 33],
  [77, 28, 65, 42],
  [52, 28, 43, 48],
  [65, 42, 60, 66],
  [43, 48, 43, 69],
  [43, 69, 40, 81],
];

// d: pop-in delay ms (matches when the drawing stroke reaches the joint);
// w: clockwise perimeter index for the "thought wave", -1 for inner joints.
const NODES: { x: number; y: number; r: number; d: number; w: number }[] = [
  { x: 47, y: 11, r: 3, d: 150, w: 0 },
  { x: 63, y: 17, r: 3.4, d: 560, w: 1 },
  { x: 29, y: 16, r: 3.4, d: 690, w: 11 },
  { x: 77, y: 28, r: 3, d: 820, w: 2 },
  { x: 15, y: 30, r: 3, d: 950, w: 10 },
  { x: 84, y: 43, r: 3.4, d: 1080, w: 3 },
  { x: 9, y: 47, r: 3.4, d: 1210, w: 9 },
  { x: 75, y: 57, r: 3, d: 1340, w: 4 },
  { x: 16, y: 56, r: 2.6, d: 1470, w: 8 },
  { x: 27, y: 64, r: 3.4, d: 1600, w: 7 },
  { x: 43, y: 69, r: 3, d: 1730, w: 6 },
  { x: 60, y: 66, r: 3.4, d: 1860, w: 5 },
  { x: 52, y: 28, r: 2.8, d: 1980, w: -1 },
  { x: 33, y: 33, r: 2.8, d: 2110, w: -1 },
  { x: 65, y: 42, r: 2.8, d: 2240, w: -1 },
  { x: 43, y: 48, r: 3, d: 2370, w: -1 },
  { x: 40, y: 81, r: 3, d: 2700, w: -1 },
];

const SYN: [number, number, number][] = [
  [23, 23, 1.7],
  [41, 22, 1.5],
  [57, 25, 1.7],
  [72, 38, 1.5],
  [20, 41, 1.5],
  [31, 44, 1.7],
  [56, 52, 1.5],
  [31, 57, 1.7],
  [52, 57, 1.5],
  [24, 50, 1.3],
  [61, 32, 1.3],
  [37, 27, 1.3],
];

// Discipline chips: centered at (cx, cy) in stage coords, connector path runs
// chip → brain joint, `node` is the NODES index that glows on pulse arrival.
const CHIPS: {
  label: { en: string; es: string };
  cx: number;
  cy: number;
  d: string;
  node: number;
}[] = [
  {
    label: { en: "UX RESEARCH", es: "UX RESEARCH" },
    cx: 92,
    cy: 148,
    d: `M92 148 Q150 152 ${bx(15)} ${by(30)}`,
    node: 4,
  },
  {
    label: { en: "AI AGENTS", es: "AGENTES DE IA" },
    cx: 548,
    cy: 132,
    d: `M548 132 Q460 118 ${bx(63)} ${by(17)}`,
    node: 1,
  },
  {
    label: { en: "AWS CLOUD", es: "AWS CLOUD" },
    cx: 566,
    cy: 306,
    d: `M566 306 Q512 282 ${bx(84)} ${by(43)}`,
    node: 5,
  },
  {
    label: { en: "FULL-STACK CODE", es: "CÓDIGO FULL-STACK" },
    cx: 98,
    cy: 336,
    d: `M98 336 Q152 326 ${bx(16)} ${by(56)}`,
    node: 8,
  },
  {
    label: { en: "MOBILE APPS", es: "APPS MÓVILES" },
    cx: 320,
    cy: 478,
    d: `M320 478 Q310 432 ${bx(40)} ${by(81)}`,
    node: 16,
  },
];

/* ---- dense neural mesh -----------------------------------------------------
   A particle constellation filling the brain silhouette: micro nodes joined
   to their nearest neighbours, colour-graded violet → blue → teal → brand
   green across the profile, with white sparks and background stars. Seeded
   PRNG so the server-rendered markup matches hydration exactly. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HULL: [number, number][] = [
  [47, 11],
  [63, 17],
  [77, 28],
  [84, 43],
  [75, 57],
  [60, 66],
  [43, 69],
  [27, 64],
  [16, 56],
  [9, 47],
  [15, 30],
  [29, 16],
];

function inHull(x: number, y: number) {
  let inside = false;
  for (let i = 0, j = HULL.length - 1; i < HULL.length; j = i++) {
    const [xi, yi] = HULL[i];
    const [xj, yj] = HULL[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

const G_STOPS: [number, [number, number, number]][] = [
  [0, [108, 92, 225]],
  [0.45, [58, 116, 205]],
  [0.75, [42, 158, 133]],
  [1, [63, 146, 112]],
];

function meshColor(t: number) {
  const u = t <= 0 ? 0 : t >= 1 ? 1 : t;
  let i = 0;
  while (i < G_STOPS.length - 2 && u > G_STOPS[i + 1][0]) i++;
  const [t0, a] = G_STOPS[i];
  const [t1, b] = G_STOPS[i + 1];
  const k = (u - t0) / (t1 - t0);
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)})`;
}

type MeshPt = {
  x: number;
  y: number;
  c: string;
  r: number;
  lo: number;
  hi: number;
  dur: number;
  del: number;
  band: number;
  tw: boolean;
};

const MESH: MeshPt[] = (() => {
  const rnd = mulberry32(1337);
  const pts: MeshPt[] = [];
  const push = (x: number, y: number) => {
    const tx = (x - 9) / 75;
    pts.push({
      x: +bx(x).toFixed(1),
      y: +by(y).toFixed(1),
      c: meshColor(tx + (rnd() - 0.5) * 0.12),
      r: +(1.0 + rnd() * 1.2).toFixed(2),
      lo: +(0.25 + rnd() * 0.25).toFixed(2),
      hi: +(0.7 + rnd() * 0.3).toFixed(2),
      dur: +(2.8 + rnd() * 2.4).toFixed(2),
      del: +(-rnd() * 4).toFixed(2),
      band: tx < 0.33 ? 0 : tx < 0.66 ? 1 : 2,
      tw: rnd() < 0.55,
    });
  };
  let guard = 0;
  while (pts.length < 430 && guard++ < 9000) {
    const x = 9 + rnd() * 75;
    const y = 11 + rnd() * 58;
    if (inHull(x, y)) push(x, y);
  }
  // reinforce the outline — the reference reads densest along the silhouette
  for (let i = 0; i < 110; i++) {
    const e = HULL[i % 12];
    const f = HULL[(i + 1) % 12];
    const t = rnd();
    let x = e[0] + (f[0] - e[0]) * t;
    let y = e[1] + (f[1] - e[1]) * t;
    const k = 0.02 + rnd() * 0.08;
    x += (46.5 - x) * k;
    y += (41 - y) * k;
    push(x, y);
  }
  return pts;
})();

type MeshLink = { x1: number; y1: number; x2: number; y2: number; c: string; o: number; band: number };

const LINKS: MeshLink[] = (() => {
    const rnd = mulberry32(4242);
    const out: MeshLink[] = [];
    const used = new Set<string>();
    MESH.forEach((p, i) => {
      const near = MESH.map((q, j) => ({
        j,
        d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2,
      }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      near.forEach(({ j, d }) => {
        if (d > 900) return; // skip stragglers — keeps the web short-range
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (used.has(key)) return;
        used.add(key);
        out.push({
          x1: p.x,
          y1: p.y,
          x2: MESH[j].x,
          y2: MESH[j].y,
          c: p.c,
          o: +(0.16 + rnd() * 0.16).toFixed(2),
          band: p.band,
        });
      });
    });
    return out;
  })();

const SPARKS = (() => {
  const rnd = mulberry32(99);
  return Array.from({ length: 22 }, () => {
    const p = MESH[Math.floor(rnd() * MESH.length)];
    return {
      x: p.x,
      y: p.y,
      dur: +(4 + rnd() * 5).toFixed(2),
      del: +(-rnd() * 9).toFixed(2),
    };
  });
})();


export function Hero() {
  const { lang } = useLang();
  const es = lang === "es";
  const stageRef = React.useRef<HTMLDivElement>(null);
  const marqRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const stage = stageRef.current;
    const segs = stage
      ? Array.from(stage.querySelectorAll<SVGLineElement>("[data-seg]"))
      : [];
    const nodes = stage
      ? Array.from(stage.querySelectorAll<SVGCircleElement>("[data-node]"))
      : [];
    const glows = stage
      ? Array.from(stage.querySelectorAll<SVGCircleElement>("[data-glow]"))
      : [];
    const syns = stage
      ? Array.from(stage.querySelectorAll<SVGCircleElement>("[data-syn]"))
      : [];
    const conns = stage
      ? Array.from(stage.querySelectorAll<SVGPathElement>("[data-conn]"))
      : [];
    const pulses = stage
      ? Array.from(stage.querySelectorAll<SVGCircleElement>("[data-pulse]"))
      : [];
    const chips = stage
      ? Array.from(stage.querySelectorAll<HTMLElement>("[data-chip]"))
      : [];
    const halo = stage?.querySelector<SVGCircleElement>("[data-halo]") ?? null;
    const meshes = stage
      ? Array.from(stage.querySelectorAll<SVGGElement>("[data-mesh]"))
      : [];

    const segLens = segs.map((l) =>
      Math.hypot(
        +(l.getAttribute("x2") || 0) - +(l.getAttribute("x1") || 0),
        +(l.getAttribute("y2") || 0) - +(l.getAttribute("y1") || 0)
      )
    );
    segs.forEach((l, i) => {
      l.style.strokeDasharray = String(segLens[i]);
      l.style.strokeDashoffset = String(segLens[i]);
    });
    const connLens = conns.map((p) => {
      try {
        return p.getTotalLength();
      } catch {
        return 300;
      }
    });

    const clamp01 = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x);
    const ease = (x: number) =>
      x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3);
    const pop = (x: number) => {
      // easeOutBack — joints land with a little overshoot
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    };
    const boost = new Array(NODES.length).fill(0);
    const t0 = performance.now();

    // TRUSTED BY marquee — driven here (not CSS) so we can wrap on the exact
    // one-set period and it never runs out of logos on wide screens.
    const marq = marqRef.current;
    const SET = MARQUEE.length; // logos per repeat
    let marqX = 0;
    let lastMarq = t0;
    let raf = 0;

    const frame = () => {
      const now = performance.now();
      if (marq) {
        const dtMs = Math.min(120, now - lastMarq);
        lastMarq = now;
        marqX -= 42 * (dtMs / 1000);
        const kids = marq.children;
        // exact width of one repeat (incl. gaps) so the seam is invisible
        const period =
          kids.length > SET
            ? (kids[SET] as HTMLElement).offsetLeft -
              (kids[0] as HTMLElement).offsetLeft
            : marq.scrollWidth / 2;
        if (period > 0 && marqX <= -period) marqX += period;
        marq.style.transform = "translate3d(" + marqX.toFixed(1) + "px,0,0)";
      }

      const t = now - t0;

      // 1 — the mark draws itself, crown outward; the mesh wakes in 3 bands
      segs.forEach((l, k) => {
        const p = ease((t - (150 + k * 130)) / 340);
        l.style.strokeDashoffset = String(segLens[k] * (1 - p));
      });
      meshes.forEach((el, b) => {
        el.setAttribute("opacity", ease((t - (900 + b * 550)) / 700).toFixed(2));
      });

      // 2 — ambient boosts: perimeter thought wave + pulse arrivals
      boost.fill(0);
      if (t > 3800) {
        const w = (((t - 3800) / 5800) % 1) * 12;
        NODES.forEach((n, j) => {
          if (n.w < 0) return;
          let dd = Math.abs(n.w - w);
          dd = Math.min(dd, 12 - dd);
          boost[j] += Math.exp((-dd * dd) / 0.5) * 0.9;
        });
      }
      pulses.forEach((pl, i) => {
        const per = 2400 + i * 380;
        if (t < 3600) {
          pl.setAttribute("opacity", "0");
          return;
        }
        const u = ((t - 3600 + i * 777) % per) / per;
        const c = CHIPS[i];
        boost[c.node] += Math.exp(-Math.pow(u - 0.68, 2) / 0.0035) * 0.8;
        if (u < 0.65 && conns[i]) {
          const q = u / 0.65;
          const qq = q * q * (3 - 2 * q);
          try {
            const pt = conns[i].getPointAtLength(qq * connLens[i]);
            pl.setAttribute("cx", pt.x.toFixed(1));
            pl.setAttribute("cy", pt.y.toFixed(1));
          } catch {
            /* noop */
          }
          pl.setAttribute("opacity", (Math.sin(Math.PI * q) * 0.95).toFixed(2));
        } else {
          pl.setAttribute("opacity", "0");
        }
        // chip flashes as its pulse departs
        const chip = chips[i];
        if (chip) {
          const dep = Math.exp(-Math.pow(u - 0.02, 2) / 0.002);
          chip.style.borderColor = `rgba(79,174,135,${(0.3 + 0.6 * dep).toFixed(2)})`;
        }
      });

      // 3 — joints pop in, then breathe
      nodes.forEach((el, j) => {
        const n = NODES[j];
        const p = pop((t - n.d) / 340);
        const breath = 1 + 0.07 * Math.sin(t / 850 + j * 1.7);
        const base = n.r * 2.0;
        el.setAttribute(
          "r",
          Math.max(0, base * p * (breath + 0.3 * boost[j])).toFixed(2)
        );
        el.setAttribute("opacity", clamp01(p).toFixed(2));
        const g = glows[j];
        if (g) {
          g.setAttribute("r", (base * (2.6 + 1.4 * boost[j])).toFixed(1));
          g.setAttribute(
            "opacity",
            (
              clamp01(p) *
              (0.12 + 0.05 * Math.sin(t / 850 + j * 1.7) + 0.45 * boost[j])
            ).toFixed(2)
          );
        }
      });

      // 4 — synapses twinkle
      syns.forEach((el, i) => {
        const p = ease((t - (2150 + i * 70)) / 400);
        el.setAttribute(
          "opacity",
          (p * (0.3 + 0.55 * Math.abs(Math.sin(t / 650 + i * 2.1)))).toFixed(2)
        );
      });

      // 5 — connectors fade in, chips rise in and bob
      conns.forEach((el, i) => {
        el.setAttribute("opacity", (ease((t - (2750 + i * 140)) / 420) * 0.3).toFixed(2));
      });
      chips.forEach((el, i) => {
        const o = ease((t - (2500 + i * 150)) / 450);
        const bob = 3 * Math.sin(t / 1500 + i * 1.3) * o;
        el.style.opacity = o.toFixed(2);
        el.style.transform = `translate(-50%,-50%) translateY(${((1 - o) * 10 + bob).toFixed(1)}px)`;
      });

      if (halo) {
        halo.setAttribute(
          "opacity",
          (ease((t - 1200) / 1600) * (0.55 + 0.2 * Math.sin(t / 2400))).toFixed(2)
        );
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      id="home"
      style={{
        position: "relative",
        flex: "1 0 auto",
        minHeight: 560,
        display: "flex",
        alignItems: "center",
        background:
          "linear-gradient(180deg,#edf2fa 0%,#e7edf8 55%,#e1e8f4 100%)",
        overflow: "hidden",
      }}
    >
      {/* one centered row: copy left, living-brain visual right (together.ai
          layout). DOM keeps the stage first; row-reverse puts the copy left. */}
      <div
        className="hero-row"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 1560,
          margin: "0 auto",
          padding: "10px 48px 90px",
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 44,
        }}
      >
      {/* animation stage — the brand mark alive */}
      <div
        ref={stageRef}
        className="hero-stage"
        style={{
          flex: "0 1 46%",
          width: "46%",
          minHeight: 520,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(620px,100%)",
            aspectRatio: "640 / 520",
          }}
        >
          <svg
            viewBox="0 0 640 520"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              display: "block",
            }}
            aria-hidden
          >
            <defs>
              <radialGradient id="mtHalo">
                <stop offset="0%" stopColor="#4FAE87" stopOpacity="0.16" />
                <stop offset="55%" stopColor="#4FAE87" stopOpacity="0.07" />
                <stop offset="100%" stopColor="#4FAE87" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle data-halo cx="316" cy="248" r="215" fill="url(#mtHalo)" opacity="0" />
            {[0, 1, 2].map((b) => (
              <g key={"mb" + b} data-mesh={b} opacity="0">
                {LINKS.filter((l) => l.band === b).map((l, i) => (
                  <line
                    key={i}
                    x1={l.x1}
                    y1={l.y1}
                    x2={l.x2}
                    y2={l.y2}
                    stroke={l.c}
                    strokeOpacity={l.o}
                    strokeWidth="0.8"
                  />
                ))}
                {MESH.filter((p) => p.band === b).map((p, i) => (
                  <circle
                    key={"p" + i}
                    cx={p.x}
                    cy={p.y}
                    r={p.r}
                    fill={p.c}
                    style={
                      p.tw
                        ? ({
                            "--tw-lo": String(p.lo),
                            "--tw-hi": String(p.hi),
                            animation: `mtTwinkle ${p.dur}s ease-in-out ${p.del}s infinite`,
                          } as React.CSSProperties)
                        : { opacity: (p.lo + p.hi) / 2 }
                    }
                  />
                ))}
              </g>
            ))}
            {SPARKS.map((s, i) => (
              <g
                key={"sp" + i}
                style={{
                  animation: `mtSpark ${s.dur}s linear ${s.del}s infinite`,
                  opacity: 0,
                }}
              >
                <circle cx={s.x} cy={s.y} r="4.5" fill="#4FAE87" opacity="0.25" />
                <circle cx={s.x} cy={s.y} r="1.6" fill="#2e8f6b" />
              </g>
            ))}
            {CHIPS.map((c, i) => (
              <g key={"c" + i}>
                <path
                  data-conn={i}
                  d={c.d}
                  stroke="#24344E"
                  strokeWidth="1.6"
                  strokeDasharray="3 8"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0"
                />
                <circle data-pulse={i} r="4.5" fill="#4FAE87" opacity="0" />
              </g>
            ))}
            {SEGS.map((s, i) => (
              <line
                key={"l" + i}
                data-seg={i}
                x1={bx(s[0])}
                y1={by(s[1])}
                x2={bx(s[2])}
                y2={by(s[3])}
                stroke="#4FAE87"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ))}
            {NODES.map((n, i) => (
              <circle
                key={"g" + i}
                data-glow={i}
                cx={bx(n.x)}
                cy={by(n.y)}
                r={n.r * 7}
                fill="#4FAE87"
                opacity="0"
              />
            ))}
            {NODES.map((n, i) => (
              <circle
                key={"n" + i}
                data-node={i}
                cx={bx(n.x)}
                cy={by(n.y)}
                r={n.r * 2.0}
                fill="#4FAE87"
                opacity="0"
              />
            ))}
            {SYN.map((s, i) => (
              <circle
                key={"s" + i}
                data-syn={i}
                cx={bx(s[0])}
                cy={by(s[1])}
                r={s[2] * 2.4}
                fill="#4FAE87"
                opacity="0"
              />
            ))}
          </svg>
          {CHIPS.map((c, i) => (
            <div
              key={"chip" + i}
              data-chip={i}
              style={{
                position: "absolute",
                left: `${((c.cx / 640) * 100).toFixed(2)}%`,
                top: `${((c.cy / 520) * 100).toFixed(2)}%`,
                transform: "translate(-50%,-50%)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,.9)",
                border: "1.5px solid rgba(79,174,135,.35)",
                borderRadius: 999,
                padding: "8px 14px",
                fontFamily: MONO,
                fontSize: 10.5,
                fontWeight: 500,
                letterSpacing: ".14em",
                color: "#24344E",
                boxShadow: "0 12px 28px -14px rgba(14,13,18,.3)",
                backdropFilter: "blur(6px)",
                whiteSpace: "nowrap",
                opacity: 0,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#4FAE87",
                  flex: "none",
                }}
              />
              {c.label[lang]}
            </div>
          ))}
        </div>
      </div>

      {/* hero copy */}
      <div className="hero-copy" style={{ flex: "0 1 660px", minWidth: 0 }}>
        <div>
          <h1
            style={{
              fontWeight: 500,
              fontSize: "clamp(40px,4.2vw,70px)",
              lineHeight: 1.04,
              letterSpacing: "-.025em",
              margin: 0,
              color: "var(--ink)",
            }}
          >
            {es ? "Construyendo el futuro" : "Building the future"}
            <br />
            <span style={{ color: "#9aa0ad" }}>{es ? "con software de IA" : "with AI software"}</span>
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: 1.5,
              color: "#4c4a55",
              fontWeight: 400,
              margin: "24px 0 0",
              maxWidth: 560,
            }}
          >
            {es ? "Laboratorio de software full-stack, impulsado por investigación UX e IA aplicada." : "Full-stack software lab, powered by UX research and applied AI."}
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
            <a
              href="#contact"
              onClick={openForm}
              className="btn-dark"
              style={ctaDark}
            >
              {es ? "EMPIEZA A CONSTRUIR" : "START BUILDING"}
            </a>
            <a
              href="#contact"
              onClick={openForm}
              className="btn-light"
              style={{
                textDecoration: "none",
                fontFamily: MONO,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: ".12em",
                background: "#fff",
                color: "var(--ink)",
                border: "1.5px solid rgba(14,13,18,.28)",
                padding: "14.5px 26px",
                borderRadius: 6,
                boxShadow: "0 8px 20px -14px rgba(14,13,18,.35)",
                transition: "background .2s",
              }}
            >
              {es ? "HABLEMOS" : "CONTACT SALES"}
            </a>
          </div>
        </div>
      </div>
      </div>

      {/* TRUSTED BY marquee */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          padding: "16px 48px",
          display: "flex",
          alignItems: "center",
          gap: 44,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: ".16em",
            color: "#8b8896",
            flex: "none",
          }}
        >
          {es ? "CONFÍAN EN NOSOTROS" : "TRUSTED BY"}
        </span>
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            WebkitMaskImage:
              "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
            maskImage:
              "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
          }}
        >
          <div
            ref={marqRef}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 72,
              width: "max-content",
              willChange: "transform",
            }}
          >
            {/* Enough copies that the trailing sets always fill the widest
                viewport; the rAF loop wraps on one set's exact width. */}
            {Array.from({ length: 6 }).flatMap((_, s) =>
              MARQUEE.map((m) =>
                m.img ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={s + "-" + m.name}
                    src={m.img}
                    alt={m.name}
                    style={{
                      height: m.h || 26,
                      width: "auto",
                      display: "block",
                      opacity: 0.55,
                      filter: "grayscale(1)",
                    }}
                  />
                ) : (
                  <span
                    key={s + "-" + m.name}
                    style={{
                      fontWeight: 600,
                      fontSize: 19,
                      color: "#0e0d12",
                      opacity: 0.4,
                      letterSpacing: ".02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.name}
                  </span>
                )
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const ctaDark: React.CSSProperties = {
  textDecoration: "none",
  fontFamily: MONO,
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: ".12em",
  background: "#0e0d12",
  color: "#fff",
  padding: "16px 26px",
  borderRadius: 6,
};
