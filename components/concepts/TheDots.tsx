"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import s from "./dots.module.css";

/* Concept 01, "The Dots": six small robots, one per role of the AI Management
   Office, automate an office overnight while you scroll. Ported from Carlos's
   prototype (Oct 2026). The scene is one SVG; `mountStory` drives it from the
   scroll position, imperatively, the way the prototype did. */

const GREEN = "#3DBE7D", LIME = "#BFF5CF", INK = "#0E1013", PAPER = "#F4F5F3", RED = "#FF6B5B", LAV = "#C9C4F2";
const ORDER = ["Sales", "Support", "Finance", "Marketing", "Operations", "Reception"] as const;
type Role = (typeof ORDER)[number];
const DESK: Record<Role, [number, number]> = { Sales: [330, 255], Support: [420, 210], Finance: [560, 300], Marketing: [480, 165], Operations: [640, 250], Reception: [500, 360] };
const DOT_NAMES = ["Rece", "Sal", "Sopo", "Fin", "Mark", "Opi"] as const;
const DOT_ROLE: Record<string, Role> = { Rece: "Reception", Sal: "Sales", Sopo: "Support", Fin: "Finance", Mark: "Marketing", Opi: "Operations" };
const ACC: Record<string, string> = { Rece: "bell", Sal: "headset", Sopo: "bubble", Fin: "visor", Mark: "megaphone", Opi: "wrench" };

const CAPS = {
  en: [
    ["01", "Every company has work nobody should be doing at 2 AM.", "An office in Quito. Six desks, six piles of paper, nobody in. Keep scrolling."],
    ["02", "Meet Rece. The first Dot.", "She turns the lights on and routes every request to the right desk. The others are coming."],
    ["03", "Sal catches a lead before it goes cold.", "WhatsApp → CRM → calendar. A meeting is booked before anyone wakes up."],
    ["04", "Sopo answers at 3 AM. And knows when not to.", "Three tickets solved. The hard one goes to a person. That is the point."],
    ["05", "Fin runs Helixona's medical billing, end to end.", "Claims, coding, follow-ups. A person signs off only where it matters."],
    ["06", "Opi turns a spreadsheet into a system.", "Western Fence Supply: Excel → Odoo, with delivery routes."],
    ["07", "Mark plans the week, publishes, reports.", "The short chapter. Marketing on autopilot, with a human on the report."],
    ["08", "This is the AI Management Office. It is running now.", "One agent per role, inside the tools you already use. The live demo is one click away."],
    ["09", "Now the desks are empty again. For you.", "Scroll down and pick the desk you would fill first."],
  ],
  es: [
    ["01", "Toda empresa tiene trabajo que nadie debería hacer a las 2 AM.", "Una oficina en Quito. Seis escritorios, seis pilas de papel, nadie adentro. Sigue bajando."],
    ["02", "Ella es Rece. La primera Dot.", "Enciende la luz y dirige cada solicitud al escritorio correcto. Los demás vienen en camino."],
    ["03", "Sal atrapa un lead antes de que se enfríe.", "WhatsApp → CRM → calendario. La reunión queda agendada antes de que alguien despierte."],
    ["04", "Sopo responde a las 3 AM. Y sabe cuándo no hacerlo.", "Tres tickets resueltos. El difícil va a una persona. De eso se trata."],
    ["05", "Fin lleva la facturación médica de Helixona de punta a punta.", "Reclamos, codificación, seguimientos. Una persona firma solo donde importa."],
    ["06", "Opi convierte una hoja de cálculo en un sistema.", "Western Fence Supply: de Excel a Odoo, con rutas de entrega."],
    ["07", "Mark planifica la semana, publica, reporta.", "El capítulo corto. Marketing en piloto automático, con un humano en el reporte."],
    ["08", "Esto es el AI Management Office. Está corriendo ahora.", "Un agente por rol, dentro de las herramientas que ya usas. La demo en vivo está a un clic."],
    ["09", "Ahora los escritorios vuelven a estar vacíos. Para ti.", "Baja y elige el escritorio que llenarías primero."],
  ],
};
const SIGNS = {
  en: { lead: "LEAD QUALIFIED / MEETING BOOKED", fin: "24/7 / A PERSON SIGNS OFF ONLY WHERE IT MATTERS", opi: "EXCEL → ODOO / WITH DELIVERY ROUTES", mark: "WEEK PLANNED / PUBLISHED / REPORTED", desk: "WHICH DESK IS YOURS?", tray: "NEEDS A PERSON", paid: "PAID", act: { Sales: "booked a meeting in the CRM", Support: "answered a WhatsApp ticket", Finance: "reconciled 14 bank entries", Marketing: "published this week's post", Operations: "reordered supplies", Reception: "confirmed 6 appointments" } as Record<Role, string> },
  es: { lead: "LEAD CALIFICADO / REUNIÓN AGENDADA", fin: "24/7 / UNA PERSONA FIRMA SOLO DONDE IMPORTA", opi: "EXCEL → ODOO / CON RUTAS DE ENTREGA", mark: "SEMANA PLANIFICADA / PUBLICADA / REPORTADA", desk: "¿CUÁL ESCRITORIO ES EL TUYO?", tray: "NECESITA UNA PERSONA", paid: "PAGADO", act: { Sales: "agendó una reunión en el CRM", Support: "respondió un ticket de WhatsApp", Finance: "concilió 14 movimientos", Marketing: "publicó el post de la semana", Operations: "repuso insumos", Reception: "confirmó 6 citas" } as Record<Role, string> },
};

type Lang = "en" | "es";
const LOGOS: [string, string][] = [["USFQ", "/logo-usfq.svg"], ["ThemedMotion", "/portfolio/themedmotion-logo-m.webp"], ["Helixona", "/helixona-logo-m.webp"], ["Western Fence Supply", "/wfs-logo.svg"], ["PARC Home Care", "/parc-logo-m.webp"]];
const ROLE_DESC: Record<Lang, Record<Role, string>> = {
  en: { Sales: "Qualifies leads, follows up and books meetings in your CRM.", Support: "Answers tickets and WhatsApp 24/7, escalates to a person when it matters.", Finance: "Issues invoices, reconciles the bank and chases receivables.", Marketing: "Plans, publishes and reports the week's campaigns.", Operations: "Orders supplies and keeps the calendar and inventory in order.", Reception: "Confirms appointments and routes every request to the right place." },
  es: { Sales: "Califica leads, da seguimiento y agenda reuniones en tu CRM.", Support: "Responde tickets y WhatsApp 24/7 y escala a una persona cuando importa.", Finance: "Emite facturas, concilia el banco y cobra cuentas pendientes.", Marketing: "Planifica, publica y reporta las campañas de la semana.", Operations: "Pide insumos y mantiene en orden el calendario y el inventario.", Reception: "Confirma citas y dirige cada solicitud al lugar correcto." },
};
const NS = "http://www.w3.org/2000/svg";
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);
function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent?: Element): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(e);
  return e;
}

/** Builds the dynamic parts of the scene and returns a render(progress) function plus a cleanup. */
function mountStory(root: HTMLElement, lang: Lang, onChapter: (i: number) => void, s_blink: string) {
  const q = <T extends Element = SVGElement>(sel: string) => root.querySelector(sel) as T;
  const SG = SIGNS[lang];
  // desks
  const desks = q("[data-id=desks]");
  ORDER.forEach((r) => {
    const [x, y] = DESK[r]; const g = el("g", {}, desks);
    el("path", { d: `M${x - 42} ${y} ${x} ${y + 21} ${x} ${y + 40} ${x - 42} ${y + 19}Z`, fill: "#1A1D23", stroke: PAPER }, g);
    el("path", { d: `M${x} ${y + 21} ${x + 42} ${y} ${x + 42} ${y + 19} ${x} ${y + 40}Z`, fill: "#23262E", stroke: PAPER }, g);
    el("path", { d: `M${x - 42} ${y} ${x} ${y - 21} ${x + 42} ${y} ${x} ${y + 21}Z`, fill: "#2E323B", stroke: PAPER }, g);
    const t = el("text", { x, y: y + 58, "text-anchor": "middle", fill: "#9AA3A1", "font-size": 9 }, g); t.textContent = r.toUpperCase();
  });
  // paper piles
  const piles = q("[data-id=piles]"); const pileEls: Partial<Record<Role, SVGGElement>> = {};
  ORDER.forEach((r) => {
    const [x, y] = DESK[r]; const g = el("g", {}, piles);
    for (let i = 0; i < 5; i++) el("path", { d: `M${x - 14} ${y - 6 - i * 3} ${x + 2} ${y + 2 - i * 3} ${x + 16} ${y - 5 - i * 3} ${x} ${y - 13 - i * 3}Z`, fill: "#F2F2F2", stroke: INK, "stroke-width": 0.6 }, g);
    pileEls[r] = g;
  });
  // the Dots
  const dotsG = q("[data-id=dots]");
  const D: Record<string, { g: SVGGElement; body: SVGGElement; pupils: SVGCircleElement[]; carry: SVGGElement; x: number; y: number }> = {};
  // Cute, MicroDuck-like: a chubby egg body, two big eyes with highlights, blush, a tiny beak, stubby feet and
  // a lit antenna. Each Dot keeps the accessory that says its job.
  DOT_NAMES.forEach((n, idx) => {
    const g = el("g", { opacity: 0 }, dotsG); const body = el("g", {}, g);
    el("ellipse", { cx: 0, cy: 27, rx: 17, ry: 5, fill: "#000", opacity: 0.35 }, body);
    // feet
    el("ellipse", { cx: -8, cy: 25, rx: 7, ry: 3.2, fill: "#F2A33C" }, body);
    el("ellipse", { cx: 8, cy: 25, rx: 7, ry: 3.2, fill: "#F2A33C" }, body);
    // body + belly
    el("ellipse", { cx: 0, cy: 2, rx: 22, ry: 24, fill: GREEN }, body);
    el("ellipse", { cx: 0, cy: 10, rx: 13, ry: 11, fill: LIME, opacity: 0.55 }, body);
    el("circle", { cx: -9, cy: -11, r: 6, fill: "#fff", opacity: 0.28 }, body);
    // stubby arms
    el("ellipse", { cx: -21, cy: 8, rx: 4.5, ry: 7, fill: GREEN, transform: "rotate(18 -21 8)" }, body);
    el("ellipse", { cx: 21, cy: 8, rx: 4.5, ry: 7, fill: GREEN, transform: "rotate(-18 21 8)" }, body);
    // antenna with its light
    el("path", { d: "M0 -22 q2 -8 6 -12", fill: "none", stroke: INK, "stroke-width": 2, "stroke-linecap": "round" }, body);
    el("circle", { cx: 6.5, cy: -35, r: 3.2, fill: LIME, stroke: INK, "stroke-width": 1.2 }, body);
    // eyes
    const pupils: SVGCircleElement[] = [];
    [-7.5, 7.5].forEach((ex) => {
      el("circle", { cx: ex, cy: -4, r: 7.2, fill: "#fff", stroke: INK, "stroke-width": 1.2 }, body);
      pupils.push(el("circle", { cx: ex, cy: -3, r: 3.6, fill: INK }, body));
      el("circle", { cx: ex + 1.6, cy: -5.2, r: 1.4, fill: "#fff" }, body);
      const lid = el("rect", { x: ex - 7.6, y: -11.6, width: 15.2, height: 15.2, rx: 7.6, fill: GREEN, class: s_blink }, body);
      lid.style.animationDelay = `${(idx * 0.7) % 4}s`;
    });
    // blush + beak + smile
    el("ellipse", { cx: -13, cy: 3, rx: 3.6, ry: 2, fill: "#FF9BB0", opacity: 0.8 }, body);
    el("ellipse", { cx: 13, cy: 3, rx: 3.6, ry: 2, fill: "#FF9BB0", opacity: 0.8 }, body);
    el("path", { d: "M-4 4 q4 3 8 0 q-4 5 -8 0z", fill: "#F2A33C", stroke: INK, "stroke-width": 0.8 }, body);
    const a = el("g", {}, body); const acc = ACC[n];
    if (acc === "bell") { el("path", { d: "M-24 -14 q6 -11 12 0 z", fill: "#fff", stroke: INK, "stroke-width": 1 }, a); el("circle", { cx: -18, cy: -12, r: 1.8, fill: INK }, a); }
    if (acc === "headset") { el("path", { d: "M-23 -6 a23 23 0 0 1 46 0", fill: "none", stroke: "#fff", "stroke-width": 3 }, a); el("rect", { x: -27, y: -9, width: 6, height: 12, rx: 3, fill: "#fff" }, a); el("rect", { x: 21, y: -9, width: 6, height: 12, rx: 3, fill: "#fff" }, a); el("path", { d: "M24 3 q0 10 -10 10", fill: "none", stroke: "#fff", "stroke-width": 2 }, a); }
    if (acc === "bubble") { el("path", { d: "M12 -48 h22 a5 5 0 0 1 5 5 v10 a5 5 0 0 1 -5 5 h-12 l-6 6 v-6 h-4 a5 5 0 0 1 -5 -5 v-10 a5 5 0 0 1 5 -5z", fill: "#fff" }, a); [19, 25, 31].forEach((cx) => el("circle", { cx, cy: -38, r: 1.6, fill: INK }, a)); }
    if (acc === "visor") { el("path", { d: "M-21 -16 h42 l5 7 h-52z", fill: "#1F7A4D" }, a); el("rect", { x: -18, y: -15, width: 36, height: 3, fill: "#fff", opacity: 0.6 }, a); }
    if (acc === "megaphone") { el("path", { d: "M24 2 l16 -10 v24 l-16 -10z", fill: "#fff", stroke: INK, "stroke-width": 1 }, a); el("rect", { x: 20, y: 2, width: 5, height: 8, rx: 1, fill: "#fff" }, a); }
    if (acc === "wrench") { el("path", { d: "M-24 10 l-10 10 M24 10 l10 10", stroke: "#fff", "stroke-width": 4, "stroke-linecap": "round" }, a); el("circle", { cx: -36, cy: 22, r: 4, fill: "none", stroke: "#fff", "stroke-width": 2.2 }, a); el("circle", { cx: 36, cy: 22, r: 4, fill: "none", stroke: "#fff", "stroke-width": 2.2 }, a); }
    const carry = el("g", { opacity: 0 }, body); el("rect", { x: -10, y: 14, width: 20, height: 12, rx: 2, fill: "#fff", stroke: INK, "stroke-width": 0.8 }, carry);
    const name = el("text", { x: 0, y: 46, "text-anchor": "middle", fill: "#9AA3A1", "font-size": 9 }, g); name.textContent = n.toUpperCase();
    D[n] = { g, body, pupils, carry, x: 0, y: 0 };
  });
  const place = (n: string, x: number, y: number, o: number, scale = 1) => { const d = D[n]; d.x = x; d.y = y; d.g.setAttribute("opacity", String(o)); d.g.setAttribute("transform", `translate(${x},${y}) scale(${scale})`); };
  const bob = (n: string, t: number, amt = 4) => D[n].body.setAttribute("transform", `translate(0,${Math.sin(t * 22) * amt}) rotate(${Math.sin(t * 22) * amt * 0.6})`);
  const still = (n: string) => D[n].body.setAttribute("transform", "");
  const carry = (n: string, on: boolean) => D[n].carry.setAttribute("opacity", on ? "1" : "0");
  const path2 = (n: string, t: number, pts: [number, number][]) => { const segs = pts.length - 1, k = Math.min(segs - 1, Math.floor(t * segs)), lt = t * segs - k; const a = pts[k], b = pts[k + 1]; place(n, lerp(a[0], b[0], lt), lerp(a[1], b[1], lt), 1); bob(n, t, 4); };
  let mx = 0.5, my = 0.5;
  const onMove = (e: PointerEvent) => { mx = e.clientX / window.innerWidth; my = e.clientY / window.innerHeight; };
  const eyes = () => Object.keys(D).forEach((n) => D[n].pupils.forEach((pp, i) => { pp.setAttribute("cx", String((i ? 7.5 : -7.5) + (mx - 0.5) * 5)); pp.setAttribute("cy", String(-3 + (my - 0.5) * 4)); }));

  // props
  const CLAIMS = 18; const mountain = q("[data-id=mountain]"), paid = q("[data-id=paid]"), trayDocs = q("[data-id=trayDocs]");
  const claimEls: SVGElement[] = [], paidEls: SVGElement[] = [];
  for (let i = 0; i < CLAIMS; i++) { const col = i % 6, row = Math.floor(i / 6); const x = 520 + col * 9 - row * 9, y = 300 - row * 7 + col * 4; claimEls.push(el("path", { d: `M${x - 12} ${y} ${x} ${y + 6} ${x + 12} ${y} ${x} ${y - 6}Z`, fill: "#F2F2F2", stroke: INK, "stroke-width": 0.6 }, mountain)); }
  for (let i = 0; i < CLAIMS; i++) { const x = 560, y = 470 - i * 2.6; paidEls.push(el("path", { d: `M${x - 12} ${y} ${x} ${y + 6} ${x + 12} ${y} ${x} ${y - 6}Z`, fill: GREEN, stroke: INK, "stroke-width": 0.6, opacity: 0 }, paid)); }
  const trayEls = [0, 1].map((i) => el("path", { d: `M${718 + i * 8} ${418 - i * 4} ${730 + i * 8} ${424 - i * 4} ${742 + i * 8} ${418 - i * 4} ${730 + i * 8} ${412 - i * 4}Z`, fill: RED, opacity: 0 }, trayDocs));
  const cells = q("[data-id=cells]"), shelves = q("[data-id=shelves]"); const cellEls: SVGRectElement[] = [];
  for (let i = 0; i < 12; i++) cellEls.push(el("rect", { x: 0, y: 0, width: 16, height: 9, fill: "#F2F2F2", stroke: INK, "stroke-width": 0.6 }, cells));
  [0, 1, 2].forEach((i) => el("path", { d: `M690 ${268 + i * 26} 740 ${293 + i * 26} 740 ${296 + i * 26} 690 ${271 + i * 26}Z`, fill: "#fff", opacity: 0.5 }, shelves));
  const sh = el("text", { x: 690, y: 258, fill: "#9AA3A1", "font-size": 9 }, shelves); sh.textContent = "ODOO";
  const tickets = q("[data-id=tickets]"); const tEls = [0, 1, 2, 3].map((i) => el("rect", { x: 0, y: 0, width: 34, height: 16, rx: 4, fill: i === 3 ? RED : "#fff" }, tickets));
  const conf = q("[data-id=confetti]"); const cEls = Array.from({ length: 26 }, (_, i) => el("rect", { x: 0, y: 0, width: 5, height: 8, fill: i % 3 ? GREEN : LAV, transform: `rotate(${i * 37})` }, conf));
  const act = q("[data-id=activity]"); const actEls: Partial<Record<Role, SVGGElement>> = {};
  ORDER.forEach((r) => { const [x, y] = DESK[r]; const g = el("g", { opacity: 0 }, act); const w = SG.act[r].length * 5.4 + 18; el("rect", { x: x - w / 2, y: y - 78, width: w, height: 20, rx: 2, fill: "#fff" }, g); const t = el("text", { x, y: y - 65, "text-anchor": "middle", fill: INK, "font-size": 8 }, g); t.textContent = SG.act[r]; actEls[r] = g; });
  q<SVGTextElement>("[data-id=trayT]").textContent = SG.tray; q<SVGTextElement>("[data-id=paidT]").textContent = SG.paid;

  const sign = q("[data-id=sign]"), signT = q<SVGTextElement>("[data-id=signT]"), signR = q("[data-id=signR]");
  const showSign = (x: number, y: number, text: string) => { sign.setAttribute("opacity", "1"); sign.setAttribute("transform", `translate(${x},${y})`); signT.textContent = text; const w = text.length * 6.2 + 24; signR.setAttribute("x", String(-w / 2)); signR.setAttribute("width", String(w)); };
  const clock = (h: number, m: number, label: string) => { q("[data-id=clkH]").setAttribute("transform", `rotate(${(h % 12) * 30 + m * 0.5} 470 80)`); q("[data-id=clkM]").setAttribute("transform", `rotate(${m * 6 - 90} 470 80)`); q<SVGTextElement>("[data-id=clkT]").textContent = label; };
  const seated = (name: string, role: Role) => { const [x, y] = DESK[role]; place(name, x + 6, y - 26, 1, 0.85); };
  const ids = ["msg", "sign", "human", "pen", "claims", "excel", "tickets", "confetti", "map", "board", "activity", "doors", "glow", "crmCard", "calSlot"] as const;
  const E = Object.fromEntries(ids.map((id) => [id, q(`[data-id=${id}]`)])) as Record<(typeof ids)[number], SVGElement>;
  const dark = q("[data-id=dark]"), hint = root.querySelector("[data-id=hint]") as HTMLElement, prog = root.querySelector("[data-id=prog]") as HTMLElement;
  let lastCh = -1;

  function render(p: number) {
    const CH = 9; const ch = Math.min(CH - 1, Math.floor(p * CH)), t = ease(p * CH - ch);
    if (ch !== lastCh) { lastCh = ch; onChapter(ch); }
    if (hint) hint.style.opacity = p < 0.02 ? "1" : "0";
    let darkO = 0;
    Object.keys(D).forEach((n) => { place(n, D[n].x, D[n].y, 0); still(n); carry(n, false); });
    ids.forEach((id) => E[id].setAttribute("opacity", "0"));
    ORDER.forEach((r) => pileEls[r]!.setAttribute("opacity", "1"));

    if (ch === 0) { darkO = 0.86; clock(2, 14, "2:14 AM"); }
    if (ch === 1) {
      darkO = lerp(0.86, 0, seg(t, 0.65, 1)); clock(2, 14, "2:14 AM");
      path2("Rece", seg(t, 0, 0.6), [[60, 330], [330, 300]]);
      if (t > 0.38 && t < 0.5) D.Rece.body.setAttribute("transform", `rotate(${Math.sin(t * 90) * 18})`);
      if (t > 0.6) { place("Rece", 330, 300, 1); still("Rece"); }
      if (t > 0.5) pileEls.Sales!.setAttribute("opacity", "0.35");
    }
    if (ch >= 2) { seated("Rece", "Reception"); pileEls.Reception!.setAttribute("opacity", "0"); clock(2, 40, "2:40 AM"); }
    if (ch === 2) {
      const fy = lerp(-40, 230, seg(t, 0, 0.25)); E.msg.setAttribute("opacity", t < 0.35 ? "1" : "0"); E.msg.setAttribute("transform", `translate(420,${fy})`);
      if (t < 0.35) path2("Sal", seg(t, 0.05, 0.35), [[120, 420], [400, 260]]);
      else if (t < 0.7) { path2("Sal", seg(t, 0.35, 0.7), [[400, 260], [300, 230]]); carry("Sal", true); }
      else { path2("Sal", seg(t, 0.7, 0.95), [[300, 230], [600, 170]]); carry("Sal", t < 0.9); E.crmCard.setAttribute("opacity", "1"); }
      if (t > 0.9) { E.calSlot.setAttribute("opacity", "1"); showSign(600, 110, SG.lead); }
      pileEls.Sales!.setAttribute("opacity", String(lerp(1, 0, t)));
    }
    if (ch >= 3) { seated("Sal", "Sales"); pileEls.Sales!.setAttribute("opacity", "0"); }
    if (ch === 3) {
      darkO = lerp(0, 0.8, seg(t, 0, 0.15)) * (t < 0.9 ? 1 : lerp(1, 0, seg(t, 0.9, 1))); clock(3, 2, "3:02 AM");
      const [sx, sy] = DESK.Support; place("Sopo", sx + 6, sy - 26, 1, 0.85);
      E.glow.setAttribute("opacity", String(darkO * 0.25)); E.glow.setAttribute("cx", String(sx + 6)); E.glow.setAttribute("cy", String(sy - 26));
      E.tickets.setAttribute("opacity", "1");
      tEls.forEach((e, i) => {
        const st = seg(t, 0.1 + i * 0.17, 0.25 + i * 0.17); const x = lerp(sx + 60, sx - 30, st), y = lerp(sy - 110, sy - 40, st);
        e.setAttribute("transform", `translate(${x},${y})`); e.setAttribute("opacity", t > 0.1 + i * 0.17 && (i < 3 ? st < 1 || t < 0.9 : true) ? "1" : "0");
        if (i === 3 && st >= 1) { const h = seg(t, 0.78, 0.95); e.setAttribute("transform", `translate(${lerp(sx - 30, DESK.Reception[0] + 60, h)},${lerp(sy - 40, DESK.Reception[1] - 20, h)})`); }
      });
      if (t > 0.5 && t < 0.8) D.Sopo.body.setAttribute("transform", `rotate(${Math.sin(t * 40) * 8})`);
      pileEls.Support!.setAttribute("opacity", String(lerp(1, 0, t)));
    }
    if (ch >= 4) { seated("Sopo", "Support"); pileEls.Support!.setAttribute("opacity", "0"); clock(3, 30, "3:30 AM"); }
    if (ch === 4) {
      E.claims.setAttribute("opacity", "1"); pileEls.Finance!.setAttribute("opacity", "0");
      const [fx, fy] = DESK.Finance; place("Fin", fx - 40, fy - 10, 1, 0.9); bob("Fin", t * 3, 2);
      const done = Math.floor(seg(t, 0.08, 0.78) * CLAIMS);
      claimEls.forEach((e, i) => e.setAttribute("opacity", i < CLAIMS - done ? "1" : "0"));
      paidEls.forEach((e, i) => e.setAttribute("opacity", i < done - 2 ? "1" : "0"));
      trayEls.forEach((e, i) => e.setAttribute("opacity", done > 6 + i * 5 ? "1" : "0"));
      if (t > 0.72) { E.human.setAttribute("opacity", "1"); const st = seg(t, 0.72, 0.86); E.human.setAttribute("transform", `translate(${lerp(960, 760, st)},${lerp(430, 392, st)})`); if (st >= 1) { E.pen.setAttribute("opacity", "1"); trayEls.forEach((e) => e.setAttribute("fill", t > 0.93 ? GREEN : RED)); } }
      if (t > 0.9) showSign(600, 520, SG.fin);
    }
    if (ch >= 5) { seated("Fin", "Finance"); pileEls.Finance!.setAttribute("opacity", "0"); }
    if (ch === 5) {
      E.excel.setAttribute("opacity", "1"); E.map.setAttribute("opacity", "1"); pileEls.Operations!.setAttribute("opacity", "0");
      const [ox, oy] = DESK.Operations; place("Opi", ox - 10, oy - 28, 1, 0.9); bob("Opi", t * 2, 2);
      cellEls.forEach((e, i) => { const c = i % 4, r = Math.floor(i / 4); const st = seg(t, 0.1 + i * 0.045, 0.3 + i * 0.045); const x0 = ox - 60 + c * 18, y0 = oy + 20 + r * 11, x1 = 695 + c * 11, y1 = 280 + r * 26 + c * 5.5; e.setAttribute("x", String(lerp(x0, x1, st))); e.setAttribute("y", String(lerp(y0, y1, st))); e.setAttribute("fill", st >= 1 ? GREEN : "#F2F2F2"); });
      q("[data-id=route]").setAttribute("stroke-dashoffset", String(lerp(140, 0, seg(t, 0.7, 0.95))));
      if (t > 0.92) showSign(640, 520, SG.opi);
    }
    if (ch >= 6) { seated("Opi", "Operations"); pileEls.Operations!.setAttribute("opacity", "0"); clock(8, 0, "8:00 AM"); }
    if (ch === 6) {
      E.board.setAttribute("opacity", "1"); pileEls.Marketing!.setAttribute("opacity", "0");
      const [mxx, myy] = DESK.Marketing; place("Mark", mxx + 8, myy - 28, 1, 0.85); bob("Mark", t * 2, 2);
      ["b1", "b2", "b3", "b4"].forEach((id, i) => q(`[data-id=${id}]`).setAttribute("opacity", t > 0.1 + i * 0.12 ? "1" : "0"));
      if (t > 0.55 && t < 0.9) { E.confetti.setAttribute("opacity", "1"); const st = seg(t, 0.55, 0.9); cEls.forEach((e, i) => { const a = (i / cEls.length) * Math.PI * 2; e.setAttribute("transform", `translate(${mxx + 8 + Math.cos(a) * st * 90},${myy - 40 + Math.sin(a) * st * 60 + st * st * 80}) rotate(${i * 37 + st * 300})`); }); }
      if (t > 0.8) { E.human.setAttribute("opacity", "1"); E.human.setAttribute("transform", "translate(600,150)"); showSign(640, 520, SG.mark); }
    }
    if (ch >= 7) { seated("Mark", "Marketing"); pileEls.Marketing!.setAttribute("opacity", "0"); clock(9, 15, "9:15 AM"); }
    if (ch === 7) {
      E.doors.setAttribute("opacity", String(seg(t, 0, 0.3))); E.activity.setAttribute("opacity", "1");
      ORDER.forEach((r, i) => actEls[r]!.setAttribute("opacity", t > 0.15 + i * 0.1 ? "1" : "0"));
      Object.keys(D).forEach((n, i) => bob(n, t * 4 + i, 1.5));
    }
    if (ch === 8) {
      E.doors.setAttribute("opacity", "1");
      DOT_NAMES.forEach((n, i) => { const [x, y] = DESK[DOT_ROLE[n]]; const st = seg(t, 0, 0.5); place(n, lerp(x + 6, 380 + i * 48, st), lerp(y - 26, 470, st), lerp(1, 0, seg(t, 0.75, 1)), lerp(0.85, 1, st)); bob(n, t * 3 + i, 1.5); });
      if (t > 0.5) { showSign(500, 520, SG.desk); sign.setAttribute("opacity", String(seg(t, 0.5, 0.7))); }
    }
    dark.setAttribute("opacity", String(darkO));
    eyes();
  }

  const story = root.querySelector("[data-id=story]") as HTMLElement;
  let raf: number | null = null;
  const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-ch]"));
  const tick = () => {
    // progress = chapter index + how far the viewport's reading line has travelled through that chapter's section,
    // so the scene and the copy stay in step whatever each section's height
    const line = window.scrollY + window.innerHeight * 0.55;
    let i = 0, frac = 0;
    sections.forEach((sec, k) => { const top = sec.getBoundingClientRect().top + window.scrollY; if (line >= top) { i = k; frac = clamp((line - top) / Math.max(1, sec.offsetHeight), 0, 0.999); } });
    const p = sections.length ? clamp((i + frac) / sections.length, 0, 0.9999) : clamp(-story.getBoundingClientRect().top / (story.offsetHeight - window.innerHeight), 0, 1);
    render(p);
    if (prog) prog.style.width = `${(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100}%`;
  };
  const schedule = () => { if (raf === null) raf = requestAnimationFrame(() => { raf = null; tick(); }); };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointermove", schedule, { passive: true });
  tick();
  return () => {
    window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);
    window.removeEventListener("pointermove", onMove); window.removeEventListener("pointermove", schedule);
    if (raf !== null) cancelAnimationFrame(raf);
    [desks, piles, dotsG, mountain, paid, trayDocs, cells, shelves, tickets, conf, act].forEach((g) => { while (g.firstChild) g.removeChild(g.firstChild); });
  };
}

export function TheDots() {
  const { lang } = useLang();
  const es = lang === "es";
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [ch, setCh] = React.useState(0);
  const [roles, setRoles] = React.useState<Role[]>([]);
  React.useEffect(() => {
    if (!rootRef.current) return;
    return mountStory(rootRef.current, lang, setCh, s.blink);
  }, [lang]);
  const caps = CAPS[lang];
  const roleLabel: Record<Role, string> = es ? { Sales: "Ventas", Support: "Soporte", Finance: "Finanzas", Marketing: "Marketing", Operations: "Operaciones", Reception: "Recepción" } : { Sales: "Sales", Support: "Support", Finance: "Finance", Marketing: "Marketing", Operations: "Operations", Reception: "Reception" };
  const mailto = `mailto:info@mindfultech.ec?subject=${encodeURIComponent(es ? "Quiero un escritorio en el AI Management Office" : "I want a desk in the AI Management Office")}&body=${encodeURIComponent((es ? "Escritorios que llenaría primero: " : "Desks I would fill first: ") + (roles.length ? roles.map((r) => roleLabel[r]).join(", ") : "—"))}`;
  const skew = (k: number) => `skewY(${k})`;
  return (
    <div className={s.root} ref={rootRef}>
      <div className={s.prog} data-id="prog" />
      <div className={s.bar}>
        <Link href="/" className={s.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} />
          <em>{es ? "Concepto 01 / The Dots" : "Concept 01 / The Dots"}</em>
        </Link>
        <span className={s.mono}>{es ? "Capítulo" : "Chapter"} {ch + 1} / 9</span>
      </div>

      <section className={s.story} data-id="story" aria-label="The Dots: a scroll story">
        <div className={s.layout}>
          <div className={s.copy}>
            {/* 01 hero */}
            <section className={s.chapter} id="c1" data-ch="1">
              <span className={s.kicker}>{caps[0][0]} / {es ? "2:14 AM, Quito" : "2:14 AM, Quito"}</span>
              <h1 className={s.h}>{es ? "Pon software con IA a trabajar para tu negocio" : "Put AI software to work for your business"}</h1>
              <p className={s.lead}>{es ? "Laboratorio de software full-stack, impulsado por investigación UX e IA aplicada: del descubrimiento al despliegue. Esta página te lo cuenta con seis agentes en una oficina a las 2 de la mañana." : "Full-stack software lab, powered by UX research and applied AI, from discovery to deployment. This page tells it with six agents in an office at 2 AM."}</p>
              <div className={s.ctas}>
                <a href="#c5" className={`${s.btn} ${s.btnFill}`}>{es ? "Ver proyectos" : "See the work"}</a>
                <a href="#c9" className={s.btn}>{es ? "Empieza un proyecto" : "Start a project"}</a>
              </div>
              <div className={s.logos}>
                <span className={s.mono}>{es ? "Confían en nosotros" : "Trusted by"}</span>
                {LOGOS.map(([n, src]) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={n} src={src} alt={n} title={n} />
                ))}
                <b>CarCompraCorp</b>
              </div>
              <span className={`${s.hint}`} data-id="hint">{es ? "Baja para seguir la historia ↓" : "Scroll to follow the story ↓"}</span>
            </section>

            {/* 02 what we do */}
            <section className={s.chapter} id="c2" data-ch="2">
              <span className={s.kicker}>{caps[1][0]} / {caps[1][1]}</span>
              <h2 className={s.h}>{es ? "Un laboratorio, de punta a punta" : "One lab, end to end"}</h2>
              <p className={s.lead}>{es ? "Rece dirige cada solicitud al escritorio correcto. Así trabajamos nosotros: investigación, diseño, ingeniería e IA en un solo equipo y una sola hoja de ruta." : "Rece routes every request to the right desk. That is how we work: research, design, engineering and AI in one team and one roadmap."}</p>
              <div className={s.list}>
                {([["Product Discovery", es ? "Investigación, mapas de experiencia y prototipos probados con usuarios reales antes del código." : "Research, journey maps and prototypes tested with real users before production code.", "/services/ux"], [es ? "Aplicaciones web y móviles" : "Web & mobile applications", es ? "Plataformas a medida en stacks modernos, mantenidas a largo plazo." : "Tailor-made platforms on modern stacks, maintained for the long run.", "/services/apps"], [es ? "Software a medida" : "Custom software", es ? "Herramientas internas con la forma de tus procesos, integradas con lo que ya usas." : "Internal tools shaped around your workflows, integrated with what you already run.", "/services/custom"], [es ? "IA y automatización" : "AI & automation", es ? "Asistentes, copilotos y agentes con revisión humana donde importa." : "Assistants, copilots and agents with human review where it matters.", "/services/ai"]] as [string, string, string][]).map(([t, d, href]) => (
                  <Link key={t} href={href} className={s.row}><b>{t}</b><span>{d}</span><i>→</i></Link>
                ))}
              </div>
            </section>

            {/* 03 Sal: AI agents at work */}
            <section className={s.chapter} id="c3" data-ch="3">
              <span className={s.kicker}>{caps[2][0]} / {caps[2][1]}</span>
              <h2 className={s.h}>{es ? "Agentes de IA que hacen el trabajo" : "AI agents that do the work"}</h2>
              <p className={s.lead}>{es ? "Sal atrapa un lead de WhatsApp, lo registra en el CRM y agenda la reunión antes de que alguien despierte. Un agente por rol, dentro de las herramientas que ya usas." : "Sal catches a WhatsApp lead, logs it in the CRM and books the meeting before anyone wakes up. One agent per role, inside the tools you already use."}</p>
              <div className={s.stats}>
                <div><b>24/7</b><span>{es ? "un agente lleva la facturación médica de Helixona" : "an AI agent runs Helixona's medical billing"}</span></div>
                <div><b>6</b><span>{es ? "semanas para poner un agente en producción" : "weeks to ship an agent to production"}</span></div>
                <div><b>1</b><span>{es ? "persona firma, solo donde importa" : "person signs off, only where it matters"}</span></div>
              </div>
              <Link href="/services/ai" className={s.btn}>{es ? "IA y automatización →" : "AI & automation →"}</Link>
            </section>

            {/* 04 Sopo: human in the loop */}
            <section className={s.chapter} id="c4" data-ch="4">
              <span className={s.kicker}>{caps[3][0]} / {caps[3][1]}</span>
              <h2 className={s.h}>{es ? "IA en la que tus usuarios sí pueden confiar" : "AI your users can actually trust"}</h2>
              <p className={s.lead}>{es ? "Sopo resuelve tres tickets a las 3 AM. El difícil va a una persona. Así diseñamos cada asistente: con grounding en tus datos, respuestas citadas y escalamiento humano." : "Sopo solves three tickets at 3 AM. The hard one goes to a person. That is how we design every assistant: grounded in your data, cited answers, human escalation."}</p>
              <div className={s.checks}>
                {(es ? ["Respuestas desde tu propia base de conocimiento, con fuentes", "Compuertas de revisión donde importa el criterio", "Evals, guardrails y monitoreo en producción", "Web, WhatsApp o dentro de tu producto"] : ["Answers from your own knowledge base, with sources", "Review gates where judgment matters", "Evals, guardrails and monitoring in production", "Web, WhatsApp or inside your product"]).map((x) => <span key={x}><i />{x}</span>)}
              </div>
            </section>

            {/* 05 Fin: Helixona */}
            <section className={s.chapter} id="c5" data-ch="5">
              <span className={s.kicker}>{caps[4][0]} / {caps[4][1]}</span>
              <h2 className={s.h}>{es ? "Un agente de IA que lleva la facturación médica" : "An AI agent that runs medical billing"}</h2>
              <p className={s.lead}>{es ? "Helixona, una clínica de medicina funcional en Estados Unidos. Nuestro agente procesa reclamos en eClinicalWorks, navega los envíos a Blue Shield y mantiene la documentación en movimiento. Fin es su retrato." : "Helixona, a functional-medicine clinic in the US. Our agent processes claims in eClinicalWorks, navigates Blue Shield submissions and keeps documentation moving. Fin is its portrait."}</p>
              <Link href="/work#healthcare" className={s.card}>
                <span className={s.cardBar}><i /><i /><i /><em>helixona.com</em></span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/art/helixona-hero.webp" alt="Helixona" width={1200} height={675} loading="lazy" />
                <span className={s.cardFoot}><span>{es ? "Salud / agente de IA / 24/7" : "Healthcare / AI agent / 24/7"}</span><b>{es ? "Caso →" : "Case →"}</b></span>
              </Link>
            </section>

            {/* 06 Opi: WFS + the rest of the work */}
            <section className={s.chapter} id="c6" data-ch="6">
              <span className={s.kicker}>{caps[5][0]} / {caps[5][1]}</span>
              <h2 className={s.h}>{es ? "De Excel a un CRM que se enruta solo" : "From Excel to a CRM that routes itself"}</h2>
              <p className={s.lead}>{es ? "Western Fence Supply: migramos el CRM de hojas de cálculo a Odoo, con asignación automática de leads y un módulo de rutas de entrega multi-parada. Opi convierte la hoja en estantes y la ruta en un camión." : "Western Fence Supply: we moved the CRM from spreadsheets to Odoo, with automatic lead routing and a multi-stop delivery module. Opi turns the sheet into shelves and the route into a truck."}</p>
              <Link href="/work#fence" className={s.card}>
                <span className={s.cardBar}><i /><i /><i /><em>westernfencesupply.com</em></span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/art/wfs-hero.webp" alt="Western Fence Supply" width={1200} height={675} loading="lazy" />
                <span className={s.cardFoot}><span>{es ? "Distribución / Odoo / rutas" : "Distribution / Odoo / routes"}</span><b>{es ? "Caso →" : "Case →"}</b></span>
              </Link>
              <div className={s.more}>
                {([["USFQ", es ? "EventFlow, publicada en el App Store" : "EventFlow, shipped on the App Store", "/work#usfq"], ["ThemedMotion", es ? "Portafolio 3D para un estudio de animatrónica" : "An immersive 3D portfolio for an animatronics studio", "/work#themedmotion"], ["PARC Home Care", es ? "PARC Connect, en las dos tiendas" : "PARC Connect, in both app stores", "/work#parc"], ["The Internet Coaches", es ? "Dashboard de IA para concesionarios" : "AI dashboard for car dealerships", "/work"]] as [string, string, string][]).map(([c, t, href]) => (
                  <Link key={c} href={href} className={s.row}><b>{c}</b><span>{t}</span><i>→</i></Link>
                ))}
              </div>
            </section>

            {/* 07 Mark: the numbers */}
            <section className={s.chapter} id="c7" data-ch="7">
              <span className={s.kicker}>{caps[6][0]} / {caps[6][1]}</span>
              <h2 className={s.h}>{es ? "Resultados medibles, en producción" : "Measured results, in production"}</h2>
              <p className={s.lead}>{es ? "Mark planifica, publica y reporta. Nosotros también reportamos: estas son las cifras del laboratorio." : "Mark plans, publishes and reports. So do we: these are the lab's numbers."}</p>
              <div className={s.stats}>
                <div><b>3,650+</b><span>{es ? "días lanzando productos" : "days shipping products"}</span></div>
                <div><b>48</b><span>{es ? "productos en producción" : "products in production"}</span></div>
                <div><b>2</b><span>{es ? "tiendas publican PARC Connect" : "app stores carry PARC Connect"}</span></div>
                <div><b>8</b><span>{es ? "países con clientes, desde Quito" : "countries with clients, from Quito"}</span></div>
              </div>
            </section>

            {/* 08 the office */}
            <section className={s.chapter} id="c8" data-ch="8">
              <span className={s.kicker}>{caps[7][0]} / {es ? "Nuestro producto" : "Our product"}</span>
              <h2 className={s.h}>{es ? "Una oficina donde cada empleado es un agente de IA" : "An office where every employee is an AI agent"}</h2>
              <p className={s.lead}>{es ? "El AI Management Office es un producto nuestro, por suscripción mensual. Abres la oficina, ves qué hace cada agente, le preguntas y apruebas lo que necesite una persona. Los Dots son su versión de bolsillo." : "The AI Management Office is our own product, sold as a monthly subscription. You open the office, watch what each agent is doing, ask it questions and sign off on whatever needs a person. The Dots are its pocket version."}</p>
              <div className={s.roleGrid}>
                {ORDER.map((r) => (
                  <div key={r}><b>{roleLabel[r]}</b><span>{ROLE_DESC[lang][r]}</span></div>
                ))}
              </div>
              <div className={s.ctas}>
                <Link href="/office-demo" className={`${s.btn} ${s.btnFill}`}>{es ? "Abrir la demo en vivo" : "Open the live demo"}</Link>
                <Link href="/blog/ai-management-office" className={s.btn}>{es ? "Cómo funciona →" : "How it works →"}</Link>
              </div>
            </section>

            {/* 09 your desk */}
            <section className={s.chapter} id="c9" data-ch="9">
              <span className={s.kicker}>{caps[8][0]} / {es ? "Tu oficina" : "Your office"}</span>
              <h2 className={s.h}>{es ? "¿Cuál escritorio es el tuyo?" : "Which desk is yours?"}</h2>
              <p className={s.lead}>{es ? "Elige el escritorio que llenarías primero y escríbenos. Respondemos en un día hábil con una primera lectura y los siguientes pasos." : "Pick the desk you'd fill first and write to us. We reply within one business day with a first read and next steps."}</p>
              <div className={s.roles}>
                {ORDER.map((r) => (
                  <button key={r} type="button" aria-pressed={roles.includes(r)} onClick={() => setRoles((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]))}>{roleLabel[r]}</button>
                ))}
              </div>
              <div className={s.ctas}>
                <a href={mailto} className={`${s.btn} ${s.btnFill}`}>{es ? "Empieza un proyecto" : "Start a project"}</a>
                <a href="https://wa.me/593958731994" target="_blank" rel="noreferrer" className={s.btn}>WhatsApp →</a>
              </div>
              <p className={s.note}>info@mindfultech.ec / +593 958 73 1994 / Quito, Ecuador<br />{es ? "Ecuador, California, Chicago, Florida, Países Bajos, Alemania, España, Grecia" : "Ecuador, California, Chicago, Florida, Netherlands, Germany, Spain, Greece"}</p>
            </section>
          </div>

          <div className={s.stage}>
      <svg className={s.scene} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="img" aria-label={es ? "Oficina isométrica donde pequeños robots automatizan el trabajo mientras bajas" : "Isometric office where small robots automate work as you scroll"}>
        <defs>
          <linearGradient id="dotsFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1A1D24" /><stop offset="1" stopColor="#14161C" /></linearGradient>
        </defs>
        <path d="M500 95 905 300 500 505 95 300Z" fill="url(#dotsFloor)" stroke="#2A2E37" />
        <g stroke="#23262E" strokeWidth="1" opacity=".8"><path d="M297 197 702 402M702 197 297 402M399 146 804 351M601 146 196 351M196 249 601 454M804 249 399 454" /></g>
        <path d="M95 300 500 95 500 20 95 225Z" fill="#111318" stroke="#2A2E37" />
        <path d="M905 300 500 95 500 20 905 225Z" fill="#0F1115" stroke="#2A2E37" />
        <g data-id="doors" opacity="0">
          {([["M150 262 200 237 200 290 150 315Z", 175, 280, "USFQ"], ["M240 217 290 192 290 245 240 270Z", 265, 235, "PARC"], ["M330 172 380 147 380 200 330 225Z", 355, 190, "WFS"], ["M620 147 670 172 670 225 620 200Z", 645, 190, "HELIXONA"], ["M710 192 760 217 760 270 710 245Z", 735, 235, "THEMED\u00a0MOTION"]] as [string, number, number, string][]).map(([d, x, y, n]) => (
            <g key={n}><path d={d} fill="#191C23" stroke="#fff" strokeWidth="1" /><text x={x} y={y} textAnchor="middle" fontSize="7.5" fill="#fff">{n}</text></g>
          ))}
        </g>
        <g><circle cx="470" cy="80" r="22" fill="#15181E" stroke="#fff" /><line data-id="clkH" x1="470" y1="80" x2="470" y2="68" stroke="#fff" strokeWidth="2" /><line data-id="clkM" x1="470" y1="80" x2="480" y2="80" stroke={GREEN} strokeWidth="2" /><text data-id="clkT" x="470" y="118" textAnchor="middle" fontSize="11" fill="#9AA3A1">2:14 AM</text></g>
        <g><rect x="620" y="60" width="90" height="70" rx="2" fill="#15181E" stroke="#fff" transform={skew(26.6)} /><text x="632" y="80" transform={skew(26.6)} fontSize="9" fill="#9AA3A1">{es ? "CALENDARIO" : "CALENDAR"}</text><rect data-id="calSlot" x="632" y="88" width="66" height="14" fill={GREEN} opacity="0" transform={skew(26.6)} /></g>
        <g><rect x="250" y="130" width="70" height="90" rx="2" fill="#15181E" stroke="#fff" transform={skew(-26.6)} /><text x="258" y="150" transform={skew(-26.6)} fontSize="9" fill="#9AA3A1">CRM</text><g transform={skew(-26.6)} stroke="#fff" opacity=".6"><line x1="258" y1="165" x2="312" y2="165" /><line x1="258" y1="185" x2="312" y2="185" /><line x1="258" y1="205" x2="312" y2="205" /></g><rect data-id="crmCard" x="262" y="170" width="46" height="10" fill={GREEN} opacity="0" transform={skew(-26.6)} /></g>
        <g data-id="map" opacity="0"><rect x="730" y="100" width="110" height="80" rx="2" fill="#15181E" stroke="#fff" transform={skew(26.6)} /><text x="742" y="120" transform={skew(26.6)} fontSize="9" fill="#9AA3A1">{es ? "MAPA DE ENTREGAS" : "DELIVERY MAP"}</text><path data-id="route" d="M745 130 L770 150 L800 140 L825 165" fill="none" stroke={GREEN} strokeWidth="2" strokeDasharray="140" strokeDashoffset="140" transform={skew(26.6)} /></g>
        <g data-id="board" opacity="0"><rect x="330" y="80" width="110" height="80" rx="2" fill="#15181E" stroke="#fff" transform={skew(-26.6)} /><text x="342" y="100" transform={skew(-26.6)} fontSize="9" fill="#9AA3A1">{es ? "PLAN SEMANAL" : "WEEK PLAN"}</text><g transform={skew(-26.6)} fill={GREEN}><rect data-id="b1" x="342" y="110" width="24" height="10" opacity="0" /><rect data-id="b2" x="372" y="110" width="24" height="10" opacity="0" /><rect data-id="b3" x="402" y="110" width="24" height="10" opacity="0" /><rect data-id="b4" x="342" y="128" width="54" height="10" opacity="0" /></g></g>
        <g data-id="desks" />
        <g data-id="piles" />
        <g data-id="claims" opacity="0">
          <g data-id="mountain" /><g data-id="paid" />
          <g><path d="M690 420 730 400 770 420 730 440Z" fill="#2A1614" stroke={RED} /><text data-id="trayT" x="700" y="462" fontSize="9" fill={RED}>NEEDS A PERSON</text><g data-id="trayDocs" /></g>
          <text data-id="paidT" x="560" y="500" fontSize="9" fill="#9AA3A1">PAID</text>
        </g>
        <g data-id="excel" opacity="0"><g data-id="cells" /><g data-id="shelves" /></g>
        <g data-id="tickets" opacity="0" />
        <g data-id="confetti" opacity="0" />
        <g data-id="msg" opacity="0"><rect x="-26" y="-14" width="52" height="28" rx="2" fill="#fff" /><text x="0" y="4" textAnchor="middle" fontSize="9" fill={INK}>WHATSAPP</text></g>
        <g data-id="sign" opacity="0"><rect data-id="signR" x="-100" y="-14" width="200" height="28" fill="#fff" stroke={INK} strokeWidth="2" /><text data-id="signT" x="0" y="4" textAnchor="middle" fontSize="9" fill={INK}>…</text></g>
        <g data-id="human" opacity="0"><circle cx="0" cy="-30" r="9" fill="none" stroke="#fff" strokeWidth="2" /><path d="M0 -21 V8 M-12 -8 H12 M0 8 L-9 30 M0 8 L9 30" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" /><g data-id="pen" opacity="0"><path d="M14 -6 l10 -10" stroke={GREEN} strokeWidth="3" strokeLinecap="round" /></g></g>
        <g data-id="activity" opacity="0" />
        <g data-id="dots" />
        <rect data-id="dark" x="0" y="0" width="1000" height="600" fill={INK} opacity=".86" style={{ pointerEvents: "none" }} />
        <circle data-id="glow" r="60" fill={GREEN} opacity="0" style={{ pointerEvents: "none" }} />
      </svg>
            <div className={s.cap}>
              <span className={s.n}>{caps[ch][0]}</span>
              <span className={s.capT}>{caps[ch][1]}</span>
            </div>
          </div>
        </div>
      </section>

      <section className={s.read}>
        <div className={s.wrap}>
          <div className={s.readHead}>
            <h3>{es ? "La historia, en texto" : "The story, as text"}</h3>
            <span className={s.mono}>{es ? "Para leer sin animación" : "To read without the animation"}</span>
          </div>
          <ol>
            {caps.map(([n, h, p]) => (
              <li key={n}><span>{n}</span><b>{h}</b><p>{p}</p></li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
