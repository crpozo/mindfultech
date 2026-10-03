// Procedural textures for the office: everything is painted on a canvas at
// start-up so the page ships no image assets. Sizes are small (≤1024) and each
// texture is uploaded once; the two live ones (monitors, TV) repaint on a timer.
import * as THREE from "three";

export const rnd = (a, b) => a + Math.random() * (b - a);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function grain(g, w, h, n, alpha, light = true) {
  for (let i = 0; i < n; i++) {
    const v = light ? 255 : 0;
    g.fillStyle = `rgba(${v},${v},${v},${Math.random() * alpha})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

function tex(c, { repeat, srgb = true, aniso = 8, wrap = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (wrap) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = aniso;
  return t;
}

/** Dark walnut planks; the tile covers 2 m × 2 m. */
export function woodFloor() {
  const S = 1024, c = makeCanvas(S, S), g = c.getContext("2d");
  g.fillStyle = "#5a3b2a";
  g.fillRect(0, 0, S, S);
  const rows = 12, ph = S / rows;
  for (let r = 0; r < rows; r++) {
    const off = ((r * 0.37) % 1) * 380;
    for (let i = -1; i < 4; i++) {
      const x = i * 400 + off, w = 396;
      const t = rnd(0.82, 1.16);
      g.fillStyle = `rgb(${Math.round(104 * t)},${Math.round(68 * t)},${Math.round(46 * t)})`;
      g.fillRect(x, r * ph, w, ph - 2);
      g.strokeStyle = "rgba(40,20,10,0.22)";
      g.lineWidth = 1.2;
      for (let k = 0; k < 9; k++) {
        const y = r * ph + 4 + Math.random() * (ph - 8);
        g.beginPath();
        g.moveTo(x, y);
        g.bezierCurveTo(x + 120, y + rnd(-5, 5), x + 250, y + rnd(-5, 5), x + w, y + rnd(-3, 3));
        g.stroke();
      }
      g.fillStyle = "rgba(255,230,200,0.06)";
      g.fillRect(x, r * ph + 2, w, 3);
    }
  }
  g.fillStyle = "rgba(20,10,5,0.55)";
  for (let r = 0; r < rows; r++) g.fillRect(0, r * ph + ph - 2, S, 2);
  grain(g, S, S, 6000, 0.08, false);
  return tex(c, { repeat: [1, 1] });
}

/** Red brick with mortar; the tile covers 1 m × 1 m. Returns map + bump. */
export function brick() {
  const S = 512, c = makeCanvas(S, S), g = c.getContext("2d");
  const b = makeCanvas(S, S), gb = b.getContext("2d");
  g.fillStyle = "#b9a48f";
  g.fillRect(0, 0, S, S);
  gb.fillStyle = "#555";
  gb.fillRect(0, 0, S, S);
  const bh = 40, bw = 124, gap = 5;
  const reds = ["#8e3f2e", "#9c4a36", "#7d3527", "#a65744", "#8a4232", "#95493a", "#7a3a2c"];
  for (let r = 0; r * bh < S; r++) {
    const off = r % 2 ? bw / 2 : 0;
    for (let i = -1; i * bw < S + bw; i++) {
      const x = i * bw + off + gap / 2, y = r * bh + gap / 2, w = bw - gap, h = bh - gap;
      g.fillStyle = pick(reds);
      g.fillRect(x, y, w, h);
      g.fillStyle = "rgba(255,200,170,0.08)";
      g.fillRect(x, y, w, 3);
      g.fillStyle = "rgba(0,0,0,0.12)";
      g.fillRect(x, y + h - 3, w, 3);
      for (let k = 0; k < 30; k++) {
        g.fillStyle = `rgba(${Math.random() < 0.5 ? "0,0,0" : "255,220,200"},${Math.random() * 0.12})`;
        g.fillRect(x + Math.random() * w, y + Math.random() * h, rnd(1, 4), rnd(1, 3));
      }
      gb.fillStyle = `rgb(${Math.round(rnd(190, 235))},${Math.round(rnd(190, 235))},${Math.round(rnd(190, 235))})`;
      gb.fillRect(x, y, w, h);
    }
  }
  grain(g, S, S, 3000, 0.1, false);
  return { map: tex(c), bump: tex(b, { srgb: false }) };
}

/** Warm off-white plaster with a fine speckle; tile 2 m × 2 m. */
export function plaster() {
  const S = 512, c = makeCanvas(S, S), g = c.getContext("2d");
  g.fillStyle = "#ebe6dd";
  g.fillRect(0, 0, S, S);
  grain(g, S, S, 9000, 0.12, false);
  grain(g, S, S, 6000, 0.25, true);
  return tex(c);
}

/** Solid fabric with a subtle weave, for sofa, dividers and chairs. */
export function fabric(color) {
  const S = 256, c = makeCanvas(S, S), g = c.getContext("2d");
  g.fillStyle = color;
  g.fillRect(0, 0, S, S);
  g.fillStyle = "rgba(0,0,0,0.08)";
  for (let y = 0; y < S; y += 3) g.fillRect(0, y, S, 1);
  g.fillStyle = "rgba(255,255,255,0.05)";
  for (let x = 0; x < S; x += 3) g.fillRect(x, 0, 1, S);
  grain(g, S, S, 1500, 0.1, false);
  return tex(c, { repeat: [3, 3] });
}

/** Patterned rug in warm tones. */
export function rug() {
  const S = 512, c = makeCanvas(S, S), g = c.getContext("2d");
  g.fillStyle = "#d9d7d1";
  g.fillRect(0, 0, S, S);
  g.fillStyle = "#bfbdb6";
  g.fillRect(28, 28, S - 56, S - 56);
  g.fillStyle = "#e4e2dc";
  g.fillRect(52, 52, S - 104, S - 104);
  g.fillStyle = "#cfccc4";
  for (let y = 80; y < S - 80; y += 48)
    for (let x = 80; x < S - 80; x += 48) {
      g.beginPath();
      g.moveTo(x + 24, y);
      g.lineTo(x + 48, y + 24);
      g.lineTo(x + 24, y + 48);
      g.lineTo(x, y + 24);
      g.closePath();
      g.fill();
    }
  g.strokeStyle = "#a8a59d";
  g.lineWidth = 4;
  g.strokeRect(40, 40, S - 80, S - 80);
  grain(g, S, S, 4000, 0.1, false);
  return tex(c, { wrap: false });
}

/** The sun-lit outside seen through the windows: bright, slightly warm. */
export function outside() {
  const c = makeCanvas(256, 256), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "#ffffff");
  gr.addColorStop(0.55, "#fff7e6");
  gr.addColorStop(1, "#dfe9ea");
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  return tex(c, { wrap: false });
}

/** Soft radial blob for contact shadows under furniture and people. */
export function blob() {
  const c = makeCanvas(128, 128), g = c.getContext("2d");
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  gr.addColorStop(0, "rgba(0,0,0,0.55)");
  gr.addColorStop(0.5, "rgba(0,0,0,0.22)");
  gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return tex(c, { wrap: false, srgb: false });
}

/** Vertical gradient for the light shafts: bright at the window, gone by the floor. */
export function shaft() {
  const c = makeCanvas(64, 256), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "rgba(255,240,210,0.55)");
  gr.addColorStop(0.5, "rgba(255,240,210,0.18)");
  gr.addColorStop(1, "rgba(255,240,210,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 256);
  return tex(c, { wrap: false });
}

/** Floor-to-wall ambient occlusion strip. */
export function aoStrip() {
  const c = makeCanvas(8, 128), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, "rgba(0,0,0,0.42)");
  gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 8, 128);
  return tex(c, { wrap: false, srgb: false });
}

/** Keyboard top: rows of keys. */
export function keyboard() {
  const c = makeCanvas(256, 96), g = c.getContext("2d");
  g.fillStyle = "#d9dbe0";
  g.fillRect(0, 0, 256, 96);
  g.fillStyle = "#3b3d44";
  for (let r = 0; r < 5; r++)
    for (let k = 0; k < 15; k++) {
      const w = r === 4 && k > 3 && k < 10 ? (k === 6 ? 60 : 0) : 14;
      if (w) g.fillRect(8 + k * 16 + (r === 4 && k === 6 ? -40 : 0), 8 + r * 17, w, 13);
    }
  return tex(c, { wrap: false });
}

/** The whiteboard: a sprint sketch in marker. */
export function whiteboard() {
  const c = makeCanvas(640, 400), g = c.getContext("2d");
  g.fillStyle = "#fbfbfb";
  g.fillRect(0, 0, 640, 400);
  g.font = "600 30px Outfit, system-ui, sans-serif";
  g.fillStyle = "#2b3a67";
  g.fillText("Sprint 42 · agentes", 30, 48);
  g.lineWidth = 5;
  g.strokeStyle = "#2b3a67";
  const boxes = [[40, 90, 150, 70, "Leads"], [250, 90, 150, 70, "Calificar"], [460, 90, 150, 70, "Agendar"], [250, 250, 150, 70, "CRM"]];
  for (const [x, y, w, h, label] of boxes) {
    g.strokeRect(x, y, w, h);
    g.font = "500 24px Outfit, system-ui, sans-serif";
    g.fillText(label, x + 18, y + 44);
  }
  g.strokeStyle = "#4FAE87";
  g.beginPath();
  g.moveTo(190, 125);
  g.lineTo(250, 125);
  g.moveTo(400, 125);
  g.lineTo(460, 125);
  g.moveTo(325, 160);
  g.lineTo(325, 250);
  g.stroke();
  g.strokeStyle = "#e26d5c";
  g.beginPath();
  g.moveTo(40, 340);
  g.lineTo(200, 300);
  g.lineTo(330, 330);
  g.lineTo(470, 280);
  g.lineTo(600, 300);
  g.stroke();
  g.fillStyle = "#e26d5c";
  g.font = "500 22px Outfit, system-ui, sans-serif";
  g.fillText("+23 %", 540, 270);
  g.fillStyle = "#2b3a67";
  g.fillText("✓ demo jueves", 40, 385);
  return tex(c, { wrap: false, aniso: 4 });
}

/** A framed picture: soft abstract shapes in brand colours. */
export function picture(seed) {
  const c = makeCanvas(192, 128), g = c.getContext("2d");
  g.fillStyle = ["#f4e9d8", "#e8eef7", "#f7e4e0"][seed % 3];
  g.fillRect(0, 0, 192, 128);
  const cols = ["#69c7b9", "#e26d5c", "#4f8ad6", "#f2c14e", "#2b3a67"];
  for (let i = 0; i < 4; i++) {
    g.fillStyle = cols[(seed + i) % cols.length];
    g.globalAlpha = 0.85;
    g.beginPath();
    g.arc(30 + ((seed * 37 + i * 53) % 130), 25 + ((seed * 19 + i * 41) % 80), 18 + ((seed + i * 7) % 22), 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
  return tex(c, { wrap: false, aniso: 2 });
}

/** Sticky note with a scribble. */
export function sticky(color) {
  const c = makeCanvas(64, 64), g = c.getContext("2d");
  g.fillStyle = color;
  g.fillRect(0, 0, 64, 64);
  g.strokeStyle = "rgba(0,0,0,0.5)";
  g.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    g.beginPath();
    g.moveTo(10, 18 + i * 14);
    g.lineTo(18 + Math.random() * 36, 18 + i * 14);
    g.stroke();
  }
  return tex(c, { wrap: false, aniso: 2 });
}

/** The wall TV: an operations dashboard that ticks every couple of seconds. */
export function dashboard() {
  const W = 640, H = 360, c = makeCanvas(W, H), g = c.getContext("2d");
  const t = tex(c, { wrap: false, aniso: 4 });
  const series = Array.from({ length: 24 }, (_, i) => 40 + Math.sin(i * 0.6) * 18 + Math.random() * 14);
  let frame = 0;
  const draw = () => {
    frame++;
    series.push(THREE.MathUtils.clamp(series[series.length - 1] + rnd(-9, 10), 20, 95));
    series.shift();
    g.fillStyle = "#12151c";
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#e8ebf0";
    g.font = "600 22px Outfit, system-ui, sans-serif";
    g.fillText("Operaciones · en vivo", 24, 38);
    g.fillStyle = "#69c7b9";
    g.beginPath();
    g.arc(W - 30, 30, 6 + (frame % 2) * 1.5, 0, Math.PI * 2);
    g.fill();
    const kpis = [["Leads hoy", 38 + (frame % 5)], ["Tickets", 127 + (frame % 3)], ["Cobrado", `$${(12.4 + (frame % 4) * 0.3).toFixed(1)}k`], ["Uptime", "99,98 %"]];
    kpis.forEach(([l, v], i) => {
      g.fillStyle = "#1c2029";
      g.fillRect(24 + i * 150, 56, 138, 70);
      g.fillStyle = "#9aa3b2";
      g.font = "500 14px Outfit, system-ui, sans-serif";
      g.fillText(l, 36 + i * 150, 80);
      g.fillStyle = "#ffffff";
      g.font = "600 26px Outfit, system-ui, sans-serif";
      g.fillText(String(v), 36 + i * 150, 112);
    });
    g.fillStyle = "#1c2029";
    g.fillRect(24, 142, 380, 194);
    g.fillRect(420, 142, 196, 194);
    g.strokeStyle = "#69c7b9";
    g.lineWidth = 3;
    g.beginPath();
    series.forEach((v, i) => {
      const x = 40 + (i / (series.length - 1)) * 350, y = 320 - (v / 100) * 160;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    });
    g.stroke();
    g.fillStyle = "rgba(105,199,185,0.15)";
    g.lineTo(390, 320);
    g.lineTo(40, 320);
    g.fill();
    for (let i = 0; i < 6; i++) {
      const h = 30 + ((i * 41 + frame * 13) % 120);
      g.fillStyle = i === 5 ? "#e26d5c" : "#4f8ad6";
      g.fillRect(436 + i * 30, 320 - h, 20, h);
    }
    t.needsUpdate = true;
  };
  draw();
  return { tex: t, draw };
}

/** Live monitor content per role, repainted a few times a second. */
export function monitor(kind, accent) {
  const W = 512, H = 320, c = makeCanvas(W, H), g = c.getContext("2d");
  const t = tex(c, { wrap: false, aniso: 4 });
  let frame = 0;
  const bars = Array.from({ length: 14 }, () => rnd(0.3, 1));
  const draw = () => {
    frame++;
    g.fillStyle = kind === "dev" ? "#14161c" : "#f5f7fa";
    g.fillRect(0, 0, W, H);
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
      const cols = ["#7dd3a5", "#9ab6ff", "#e6e6e6", "#f5c46b"];
      for (let i = 0; i < 11; i++) {
        const seed = (i * 37 + Math.floor(frame / 3)) % 17;
        g.fillStyle = cols[(i + seed) % cols.length];
        g.fillRect(24 + (i % 3) * 18, 54 + i * 22, 90 + ((seed * 53 + i * 71) % 300), 9);
      }
      if (Math.floor(frame / 2) % 2 === 0) {
        g.fillStyle = "#e6e6e6";
        g.fillRect(24, 54 + 11 * 22, 10, 12);
      }
      g.fillStyle = "#2fb36b";
      g.fillRect(24, H - 30, 180, 12);
    } else if (kind === "finance") {
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
          const filled = r * 5 + cI < frame % 60;
          g.fillStyle = filled ? (cI === 4 ? accent : "#5c6470") : "#eef1f5";
          g.fillRect(cI * 96 + 10, 52 + r * 24, 40 + ((r * 13 + cI * 29) % 40), 8);
        }
    } else if (kind === "social") {
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
      const progress = (frame % 40) / 40, lines = 7;
      for (let i = 0; i < lines; i++) {
        const full = 220;
        const w = i < progress * lines ? full - ((i * 61) % 90) : i === Math.floor(progress * lines) ? ((progress * lines) % 1) * full : 0;
        if (w > 0) g.fillRect(248, 66 + i * 20, w, 8);
      }
      g.fillStyle = accent;
      g.fillRect(248, 250, 90, 26);
    } else if (kind === "ops") {
      for (let d = 0; d < 5; d++) {
        g.fillStyle = "#ffffff";
        g.fillRect(16 + d * 98, 46, 90, 260);
        g.fillStyle = "#9aa3ad";
        g.fillRect(24 + d * 98, 54, 40, 7);
        const n = 2 + ((d * 7 + 3) % 3);
        for (let e = 0; e < n; e++) {
          const on = d * 3 + e === Math.floor(frame / 6) % 15;
          g.fillStyle = on ? accent : ["#dcefd0", "#d6e8f7", "#f6e2cf"][(d + e) % 3];
          g.fillRect(22 + d * 98, 72 + e * 64 + ((d * e) % 20), 78, 44);
        }
      }
    } else {
      for (let s = 0; s < 4; s++) {
        g.fillStyle = "#ffffff";
        g.fillRect(16 + s * 122, 46, 114, 262);
        g.fillStyle = "#9aa3ad";
        g.fillRect(24 + s * 122, 54, 60, 7);
        const cards = 3 + ((s * 5) % 3);
        for (let k = 0; k < cards; k++) {
          const hot = s * 7 + k === Math.floor(frame / 5) % 20;
          g.fillStyle = hot ? "#fff2d6" : "#f1f4f8";
          g.fillRect(22 + s * 122, 70 + k * 48, 102, 40);
          g.fillStyle = hot ? accent : "#c4cad3";
          g.fillRect(28 + s * 122, 78 + k * 48, 60, 7);
          g.fillStyle = "#dfe4ea";
          g.fillRect(28 + s * 122, 92 + k * 48, 40, 6);
        }
      }
    }
    t.needsUpdate = true;
  };
  draw();
  return { tex: t, draw };
}

/** Light polished concrete for the ground-floor open space; tile 2 m × 2 m. */
export function concrete() {
  const S = 512, c = makeCanvas(S, S), g = c.getContext("2d");
  g.fillStyle = "#d9d3c8";
  g.fillRect(0, 0, S, S);
  grain(g, S, S, 14000, 0.09, false);
  grain(g, S, S, 9000, 0.18, true);
  g.strokeStyle = "rgba(0,0,0,0.12)";
  g.lineWidth = 2;
  g.strokeRect(1, 1, S - 2, S - 2);
  return tex(c);
}

/** A wall sign with big text, like the motivational boards in the reference. */
export function signText(lines, bg, fg, w = 512, h = 256) {
  const c = makeCanvas(w, h), g = c.getContext("2d");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.fillStyle = fg;
  g.textAlign = "center";
  g.textBaseline = "middle";
  // start from the height budget, then shrink until the widest line fits the
  // board with a margin on both sides (long lines used to run off the edges)
  let size = h / (lines.length + 0.8);
  const font = (px) => `700 ${px}px Outfit, system-ui, sans-serif`;
  g.font = font(size);
  const widest = Math.max(...lines.map((l) => g.measureText(l).width));
  if (widest > w * 0.86) size *= (w * 0.86) / widest;
  g.font = font(size);
  lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.15));
  return tex(c, { wrap: false, aniso: 4 });
}

/** A wall of sticky notes for the lab. */
export function stickyWall() {
  const S = 512, c = makeCanvas(S, S), g = c.getContext("2d");
  g.fillStyle = "#f3eee6";
  g.fillRect(0, 0, S, S);
  const cols = ["#ffe66d", "#ff9ecb", "#9be8a1", "#8fd3ff", "#ffc67a"];
  for (let r = 0; r < 5; r++)
    for (let k = 0; k < 6; k++) {
      if (Math.random() < 0.15) continue;
      g.save();
      g.translate(50 + k * 76, 50 + r * 90);
      g.rotate(rnd(-0.12, 0.12));
      g.fillStyle = pick(cols);
      g.fillRect(-30, -30, 60, 60);
      g.strokeStyle = "rgba(0,0,0,0.45)";
      g.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.moveTo(-20, -12 + i * 12);
        g.lineTo(-20 + rnd(15, 40), -12 + i * 12);
        g.stroke();
      }
      g.restore();
    }
  return tex(c, { wrap: false, aniso: 4 });
}

/** Ping-pong table top with the centre line. */
export function pingpongTop() {
  const c = makeCanvas(256, 512), g = c.getContext("2d");
  g.fillStyle = "#2b6cb0";
  g.fillRect(0, 0, 256, 512);
  g.strokeStyle = "#ffffff";
  g.lineWidth = 6;
  g.strokeRect(4, 4, 248, 504);
  g.beginPath();
  g.moveTo(128, 0);
  g.lineTo(128, 512);
  g.stroke();
  return tex(c, { wrap: false, aniso: 4 });
}

// ---------------------------------------------------------------- redesign ----
// Oak, slats, pavers and facades for the warm-industrial look and the campus.

/** Oak herringbone, planks 1:4 laid at 45°; the tile covers 2 m × 2 m, so a
    plank is about 9 × 35 cm. In the frame where planks are axis-aligned the
    pattern repeats every 8 plank widths (lattice (5,3)/(−1,1), vertical plank
    4 widths to the right); rotated 45° that is a square of side 8·W·√2, and
    two of those fit the tile. */
export function herringbone() {
  const S = 1024, c = makeCanvas(S, S), g = c.getContext("2d");
  const W = S / (16 * Math.SQRT2), L = 4 * W;
  g.fillStyle = "#7d5233";
  g.fillRect(0, 0, S, S);
  g.save();
  g.translate(S / 2, S / 2);
  g.rotate(Math.PI / 4);
  const plank = (x, y, w, h) => {
    const t = rnd(0.86, 1.14);
    g.fillStyle = `rgb(${Math.round(198 * t)},${Math.round(152 * t)},${Math.round(104 * t)})`;
    g.fillRect(x + 1, y + 1, w - 2, h - 2);
    g.strokeStyle = "rgba(60,35,15,0.16)";
    g.lineWidth = 1;
    for (let k = 0; k < 3; k++) {
      g.beginPath();
      if (w > h) { const yy = y + 3 + Math.random() * (h - 6); g.moveTo(x + 2, yy); g.lineTo(x + w - 2, yy + rnd(-2, 2)); }
      else { const xx = x + 3 + Math.random() * (w - 6); g.moveTo(xx, y + 2); g.lineTo(xx + rnd(-2, 2), y + h - 2); }
      g.stroke();
    }
    g.fillStyle = "rgba(255,240,220,0.08)";
    g.fillRect(x + 1, y + 1, w - 2, 2);
  };
  for (let i = -12; i <= 12; i++)
    for (let j = -44; j <= 44; j++) {
      const ox = (5 * i - j) * W, oy = (3 * i + j) * W;
      if (Math.abs(ox) > S || Math.abs(oy) > S) continue;
      plank(ox, oy, L, W);
      plank(ox + L, oy, W, L);
    }
  g.restore();
  grain(g, S, S, 5000, 0.07, false);
  return tex(c, { repeat: [1, 1] });
}

/** Vertical oak slats on a dark backing, for feature walls; tile = 1 m × 1 m. */
export function slats() {
  const S = 512, c = makeCanvas(S, S), g = c.getContext("2d");
  g.fillStyle = "#2a2320";
  g.fillRect(0, 0, S, S);
  const n = 12, pitch = S / n, w = pitch * 0.62;
  for (let i = 0; i < n; i++) {
    const x = i * pitch + (pitch - w) / 2, t = rnd(0.9, 1.1);
    g.fillStyle = `rgb(${Math.round(192 * t)},${Math.round(144 * t)},${Math.round(98 * t)})`;
    g.fillRect(x, 0, w, S);
    g.fillStyle = "rgba(255,235,210,0.16)";
    g.fillRect(x, 0, 3, S);
    g.fillStyle = "rgba(40,20,10,0.28)";
    g.fillRect(x + w - 4, 0, 4, S);
    g.strokeStyle = "rgba(70,40,20,0.14)";
    g.lineWidth = 1;
    for (let k = 0; k < 4; k++) {
      const xx = x + 4 + Math.random() * (w - 8);
      g.beginPath();
      g.moveTo(xx, 0);
      g.lineTo(xx + rnd(-3, 3), S);
      g.stroke();
    }
  }
  return tex(c, { repeat: [1, 1] });
}

/** Light concrete pavers for the plaza; tile = 2 m × 2 m (4 × 4 pavers). */
export function pavers() {
  const S = 512, c = makeCanvas(S, S), g = c.getContext("2d");
  g.fillStyle = "#b4afa5";
  g.fillRect(0, 0, S, S);
  const n = 4, p = S / n;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const t = rnd(0.94, 1.06);
      g.fillStyle = `rgb(${Math.round(212 * t)},${Math.round(206 * t)},${Math.round(194 * t)})`;
      g.fillRect(i * p + 2, j * p + 2, p - 4, p - 4);
    }
  grain(g, S, S, 6000, 0.08, false);
  grain(g, S, S, 3000, 0.1, true);
  return tex(c);
}

/** Asphalt; tile = 4 m × 4 m. */
export function asphalt() {
  const S = 256, c = makeCanvas(S, S), g = c.getContext("2d");
  g.fillStyle = "#5a5d64";
  g.fillRect(0, 0, S, S);
  grain(g, S, S, 5000, 0.12, true);
  grain(g, S, S, 5000, 0.18, false);
  return tex(c);
}

/** One parking bay with white lines; tile = 2.7 m × 5.2 m. */
export function parkingBay() {
  const c = makeCanvas(128, 256), g = c.getContext("2d");
  g.fillStyle = "#5a5d64";
  g.fillRect(0, 0, 128, 256);
  grain(g, 128, 256, 1500, 0.15, true);
  g.fillStyle = "rgba(240,240,236,0.85)";
  g.fillRect(0, 0, 5, 256);
  g.fillRect(123, 0, 5, 256);
  g.fillRect(0, 0, 128, 5);
  return tex(c);
}

/** Glass office facade: 4 × 6 window bays, a few lit; tile = 12 m × 21.6 m. */
export function facade(tone = "#3a4656", lit = 0.28) {
  const W = 256, H = 384, c = makeCanvas(W, H), g = c.getContext("2d");
  g.fillStyle = "#1f2328";
  g.fillRect(0, 0, W, H);
  const cols = 4, rows = 6, cw = W / cols, rh = H / rows;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      g.fillStyle = Math.random() < lit ? "#efe6cc" : tone;
      g.fillRect(i * cw + 4, j * rh + 4, cw - 8, rh - 10);
      g.fillStyle = "rgba(255,255,255,0.10)";
      g.fillRect(i * cw + 4, j * rh + 4, cw - 8, 6);
    }
  return tex(c);
}

/** Wide straight oak boards (the loft reference); tile = 2 m × 2 m, ten boards of 0.2 m. */
export function planks() {
  const S = 1024, c = makeCanvas(S, S), g = c.getContext("2d");
  g.fillStyle = "#8a5f3c";
  g.fillRect(0, 0, S, S);
  const rows = 10, ph = S / rows;
  // a board may cross the tile's seam: paint the part that sticks out on the other side too
  const board = (x, w, r, fill) => {
    for (const ox of [0, -S, S]) {
      const bx = x + ox;
      if (bx >= S || bx + w <= 0) continue;
      fill(bx, r * ph, w, ph);
    }
  };
  for (let r = 0; r < rows; r++) {
    let x = -rnd(0, 500);
    while (x < S) {
      const w = rnd(440, 960), t = rnd(0.86, 1.12), warm = rnd(-7, 7);
      const col = `rgb(${Math.round(196 * t + warm)},${Math.round(146 * t)},${Math.round(98 * t - warm)})`;
      board(x, w, r, (bx, by, bw, bh) => {
        g.fillStyle = col;
        g.fillRect(bx + 2, by + 2, bw - 4, bh - 4);
        g.strokeStyle = "rgba(70,40,18,0.13)";
        g.lineWidth = 1;
        for (let k = 0; k < 10; k++) {
          const yy = by + 4 + Math.random() * (bh - 8);
          g.beginPath();
          g.moveTo(bx + 3, yy);
          g.bezierCurveTo(bx + bw * 0.3, yy + rnd(-4, 4), bx + bw * 0.6, yy + rnd(-4, 4), bx + bw - 3, yy + rnd(-2, 2));
          g.stroke();
        }
        if (Math.random() < 0.3) {
          const kx = bx + rnd(60, bw - 60), ky = by + rnd(20, bh - 20);
          g.fillStyle = "rgba(60,32,14,0.35)";
          g.beginPath();
          g.ellipse(kx, ky, rnd(6, 11), rnd(3, 5), rnd(0, 3), 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = "rgba(60,32,14,0.25)";
          g.beginPath();
          g.ellipse(kx, ky, rnd(14, 20), rnd(6, 9), 0, 0, Math.PI * 2);
          g.stroke();
        }
        g.fillStyle = "rgba(255,240,220,0.09)";
        g.fillRect(bx + 2, by + 2, bw - 4, 2);
        g.fillStyle = "rgba(30,15,5,0.45)";
        g.fillRect(bx + bw - 3, by, 3, bh);
      });
      x += w;
    }
  }
  g.fillStyle = "rgba(25,12,4,0.5)";
  for (let r = 0; r < rows; r++) g.fillRect(0, r * ph - 1, S, 2);
  grain(g, S, S, 7000, 0.06, false);
  return tex(c, { repeat: [1, 1] });
}

/** Lawn: short grass strokes over a mottled base; tile = 4 m × 4 m. */
export function grass() {
  const S = 512, c = makeCanvas(S, S), g = c.getContext("2d");
  g.fillStyle = "#67804a";
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 70; i++) {
    const r = rnd(30, 90), light = Math.random() < 0.5;
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
    gr.addColorStop(0, light ? "rgba(140,170,95,0.35)" : "rgba(60,85,40,0.35)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.save();
    g.translate(Math.random() * S, Math.random() * S);
    g.fillStyle = gr;
    g.fillRect(-r, -r, 2 * r, 2 * r);
    g.restore();
  }
  const cols = ["#86a95a", "#5e7d3f", "#749650", "#9ab86a", "#4e6b36"];
  g.lineWidth = 1.2;
  for (let i = 0; i < 14000; i++) {
    const x = Math.random() * S, y = Math.random() * S, a = rnd(-0.6, 0.6) - Math.PI / 2, l = rnd(2, 6);
    g.strokeStyle = cols[(Math.random() * cols.length) | 0];
    g.globalAlpha = rnd(0.35, 0.9);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  g.globalAlpha = 1;
  return tex(c);
}

/** Tree bark: ridges and dark fissures; tile = 0.5 m around × 1 m up. */
export function bark() {
  const W = 256, H = 512, c = makeCanvas(W, H), g = c.getContext("2d");
  g.fillStyle = "#5c4a3a";
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * W, w = rnd(6, 22), t = rnd(0.75, 1.2);
    g.fillStyle = `rgba(${Math.round(110 * t)},${Math.round(90 * t)},${Math.round(70 * t)},0.8)`;
    g.fillRect(x, 0, w, H);
    if (x + w > W) g.fillRect(x - W, 0, w, H);
  }
  g.strokeStyle = "rgba(25,15,8,0.75)";
  for (let i = 0; i < 40; i++) {
    let x = Math.random() * W;
    g.lineWidth = rnd(1, 3.5);
    g.beginPath();
    g.moveTo(x, -10);
    for (let y = 0; y <= H + 10; y += 24) {
      x += rnd(-5, 5);
      g.lineTo(x, y);
    }
    g.stroke();
  }
  grain(g, W, H, 3000, 0.12, true);
  grain(g, W, H, 3000, 0.2, false);
  return tex(c);
}

/** A cluster of leaves on a transparent background, for canopy and shrub cards (256 px ≈ 1.2 m). */
export function leafCluster(kind = "tree") {
  const S = 256, c = makeCanvas(S, S), g = c.getContext("2d");
  g.clearRect(0, 0, S, S);
  const tree = kind === "tree";
  const cols = tree ? ["#2f6b31", "#3f7f3a", "#4e9144", "#63a34f", "#79b45c"] : ["#2b5e2f", "#3a7a3a", "#4d8f45", "#5f9f50", "#6fae58"];
  const n = tree ? 150 : 120, R = S * 0.46;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * R * 0.92;
    const x = S / 2 + Math.cos(a) * d, y = S / 2 + Math.sin(a) * d;
    const rx = tree ? rnd(9, 15) : rnd(8, 13), ry = tree ? rnd(5, 8) : rnd(5, 8), rot = rnd(0, Math.PI);
    g.fillStyle = cols[(Math.random() * cols.length) | 0];
    g.beginPath();
    g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(255,255,220,0.14)";
    g.beginPath();
    g.ellipse(x - 2, y - 2, rx * 0.6, ry * 0.5, rot, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(10,30,10,0.35)";
    g.lineWidth = 0.8;
    g.beginPath();
    g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    g.stroke();
  }
  return tex(c, { wrap: false });
}

/** One broad split leaf with a stem (monstera-like) on a transparent background, for indoor plants. */
export function bigLeaf() {
  const S = 256, c = makeCanvas(S, S), g = c.getContext("2d");
  g.clearRect(0, 0, S, S);
  g.translate(S / 2, S * 0.97);
  const grd = g.createLinearGradient(0, -S * 0.9, 0, 0);
  grd.addColorStop(0, "#56a04c");
  grd.addColorStop(1, "#2d6a33");
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(0, -8);
  g.bezierCurveTo(-70, -18, -115, -95, -95, -155);
  g.bezierCurveTo(-85, -205, -40, -230, 0, -238);
  g.bezierCurveTo(40, -230, 85, -205, 95, -155);
  g.bezierCurveTo(115, -95, 70, -18, 0, -8);
  g.fill();
  g.globalCompositeOperation = "destination-out";
  for (const sd of [-1, 1])
    for (const [y, l] of [[-62, 52], [-112, 66], [-162, 52]]) {
      g.beginPath();
      g.ellipse(sd * (l + 34), y, l, 8, sd * 0.35, 0, Math.PI * 2);
      g.fill();
    }
  g.globalCompositeOperation = "source-over";
  g.strokeStyle = "rgba(205,238,185,0.55)";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(0, -4);
  g.lineTo(0, -226);
  g.stroke();
  g.lineWidth = 1.4;
  for (const sd of [-1, 1])
    for (const y of [-40, -88, -138, -188]) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(sd * 70, y - 44);
      g.stroke();
    }
  g.strokeStyle = "#3f7a3a";
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(0, -10);
  g.stroke();
  g.setTransform(1, 0, 0, 1, 0, 0);
  return tex(c, { wrap: false });
}

/** Dense small leaves, no transparency, for clipped hedges; tile = 1 m × 1 m. */
export function foliage() {
  const S = 512, c = makeCanvas(S, S), g = c.getContext("2d");
  g.fillStyle = "#24481f";
  g.fillRect(0, 0, S, S);
  const cols = ["#2f6b2b", "#3c7d33", "#4a8f3c", "#5b9d47", "#2a5c27"];
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * S, y = Math.random() * S, rx = rnd(5, 9), ry = rnd(3, 5), rot = rnd(0, Math.PI);
    g.fillStyle = cols[(Math.random() * cols.length) | 0];
    for (const [ox, oy] of [[0, 0], [S, 0], [-S, 0], [0, S], [0, -S]]) {
      g.beginPath();
      g.ellipse(x + ox, y + oy, rx, ry, rot, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "rgba(255,255,210,0.12)";
    g.beginPath();
    g.ellipse(x - 1, y - 1, rx * 0.5, ry * 0.5, rot, 0, Math.PI * 2);
    g.fill();
  }
  return tex(c);
}

/** White square tiles with grey grout; tile = 1 m × 1 m (8 × 8 tiles). */
export function tiles() {
  const S = 512, c = makeCanvas(S, S), g = c.getContext("2d");
  g.fillStyle = "#b9b6ae";
  g.fillRect(0, 0, S, S);
  const n = 8, p = S / n;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const t = rnd(0.96, 1.02);
      g.fillStyle = `rgb(${Math.round(242 * t)},${Math.round(240 * t)},${Math.round(234 * t)})`;
      g.fillRect(i * p + 2, j * p + 2, p - 4, p - 4);
      g.fillStyle = "rgba(255,255,255,0.35)";
      g.fillRect(i * p + 2, j * p + 2, p - 4, 3);
    }
  return tex(c);
}
