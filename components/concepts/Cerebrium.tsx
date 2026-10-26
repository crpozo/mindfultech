"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { POSTS } from "@/lib/blog/posts";
import { CASES } from "@/lib/site/cases";
import { LAND_PATH, MAP_VIEW } from "@/lib/map/land";
import { Split, Scramble, HoldCursor, Dots, useInView } from "./CerebriumFx";
import { CbNav, CbFooter, CB } from "./CerebriumParts";
import { AgentsAtWork } from "./AgentsAtWork";
import { AgentCity } from "./AgentCity";
import { openContact } from "@/components/site/Shell";
import s from "./cerebrium.module.css";

/* Concept 06, "Cerebrium" (Oct 2026), after cerebrium.ai: deep navy with glowing ribbons, a sans headline with one
   gradient word, mono labels with a dot, a light "why" section (sticky list + product cards), a dark governance block,
   case cards, a feature cloud and the blog. All content is MindfulTech's. */

const POST_ICONS = [
  <svg key="office" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 32V14l14-8 14 8v18" /><path d="M6 32h28" /><rect x="14" y="20" width="12" height="12" /><path d="M20 20v12M14 26h12" /><circle cx="20" cy="12" r="1.6" fill="currentColor" stroke="none" /></svg>,
  <svg key="lab" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 6h8M18 6v10L9 31a3 3 0 0 0 2.6 4.5h16.8A3 3 0 0 0 31 31l-9-15V6" /><path d="M13 26h14" /><circle cx="17" cy="30" r="1.2" fill="currentColor" stroke="none" /><circle cx="23" cy="31.5" r="1.6" fill="currentColor" stroke="none" /></svg>,
  <svg key="app" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="12" y="4" width="16" height="32" rx="3" /><path d="M17 8h6" /><circle cx="20" cy="31" r="1.4" fill="currentColor" stroke="none" /><path d="M15 15h10M15 19h7M15 23h9" /></svg>,
];
const LOGO_OF: Record<string, string> = { usfq: "/logo-usfq.svg", themedmotion: "/portfolio/themedmotion-logo-m.webp", healthcare: "/helixona-logo-m.webp", fence: "/wfs-logo.svg", parc: "/parc-logo-m.webp" };
const LOGOS: [string, string][] = [["USFQ", "/logo-usfq.svg"], ["ThemedMotion", "/portfolio/themedmotion-logo-m.webp"], ["Helixona", "/helixona-logo-m.webp"], ["Western Fence Supply", "/wfs-logo.svg"], ["PARC Home Care", "/parc-logo-m.webp"]];
const PINS = [{ id: "ec", lat: -0.18, lon: -78.47, k: "EC" }, { id: "ca", lat: 36.8, lon: -119.8, k: "US-W" }, { id: "il", lat: 41.9, lon: -87.6, k: "US-C" }, { id: "fl", lat: 26.6, lon: -81.9, k: "US-E" }, { id: "nl", lat: 52.4, lon: 4.9, k: "NL" }, { id: "de", lat: 51.2, lon: 10.4, k: "DE" }, { id: "es", lat: 40.4, lon: -3.7, k: "ES" }, { id: "gr", lat: 37.98, lon: 23.7, k: "GR" }];
const proj = (lat: number, lon: number) => ({ x: ((lon - MAP_VIEW.lon0) / (MAP_VIEW.lon1 - MAP_VIEW.lon0)) * MAP_VIEW.w, y: ((MAP_VIEW.lat1 - lat) / (MAP_VIEW.lat1 - MAP_VIEW.lat0)) * MAP_VIEW.h });

function MiniMap({ active }: { active: string }) {
  const home = proj(PINS[0].lat, PINS[0].lon);
  return (
    <svg viewBox={`0 0 ${MAP_VIEW.w} ${MAP_VIEW.h}`} aria-hidden="true">
      <path d={LAND_PATH} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={3.2} strokeLinecap="round" />
      {PINS.slice(1).map((p, i) => { const q = proj(p.lat, p.lon); const dx = q.x - home.x; const lift = Math.abs(dx) * (0.1 + 0.07 * (i % 3)) + 10 * i; return <path key={p.id} d={`M${home.x},${home.y} C${home.x + dx * 0.2},${home.y - lift} ${home.x + dx * 0.75},${q.y - lift * 0.5} ${q.x},${q.y}`} fill="none" stroke={active === p.id ? "#bff5cf" : "rgba(61,190,125,0.45)"} strokeWidth={active === p.id ? 2 : 1} />; })}
      {PINS.map((p) => { const q = proj(p.lat, p.lon); const on = active === p.id; return (
        <g key={p.id}>
          {on && <circle cx={q.x} cy={q.y} r={16} fill="rgba(61,190,125,0.25)" />}
          <rect x={q.x - 5} y={q.y - 5} width={10} height={10} rx={2} fill={on ? "#bff5cf" : "#3dbe7d"} />
          <rect x={q.x + 10} y={q.y - 11} width={p.k.length * 8 + 12} height={20} rx={4} fill={on ? "#bff5cf" : "rgba(255,255,255,0.1)"} />
          <text x={q.x + 16} y={q.y + 3} fontFamily="var(--font-jbmono), monospace" fontSize="11" fill={on ? "#0e1013" : "#fff"}>{p.k}</text>
        </g>
      ); })}
    </svg>
  );
}

function Chart({ mode }: { mode: number }) {
  const n = 40;
  const a = Array.from({ length: n }, (_, i) => 60 - 22 * Math.sin(i / 4 + mode) - (i > 26 && i < 31 ? 22 : 0) + (i % 5 === 0 ? 4 : 0));
  const b = Array.from({ length: n }, (_, i) => 92 - 10 * Math.cos(i / 3 + mode));
  const path = (arr: number[]) => arr.map((v, i) => `${i === 0 ? "M" : "L"}${20 + (i * 560) / (n - 1)},${v * 1.8}`).join(" ");
  return (
    <svg viewBox="0 0 600 200" aria-hidden="true">
      {[40, 80, 120, 160].map((y) => <line key={y} x1={20} y1={y} x2={580} y2={y} stroke="rgba(255,255,255,0.08)" />)}
      {["P50", "P90", "MAX"].map((t, i) => <text key={t} x={590} y={40 + i * 40} textAnchor="end" fontFamily="var(--font-jbmono), monospace" fontSize="9" fill="#8a8fa6">{t}</text>)}
      <path d={path(b)} fill="none" stroke="rgba(191,245,207,0.5)" strokeWidth={1.5} strokeDasharray="3 4" />
      <path d={path(a)} fill="none" stroke="#3dbe7d" strokeWidth={2} />
      {a.map((v, i) => (i % 8 === 0 ? <circle key={i} cx={20 + (i * 560) / (n - 1)} cy={v * 1.8} r={2.5} fill="#bff5cf" /> : null))}
      <text x={20} y={195} fontFamily="var(--font-jbmono), monospace" fontSize="9" fill="#8a8fa6">00:00</text>
      <text x={580} y={195} textAnchor="end" fontFamily="var(--font-jbmono), monospace" fontSize="9" fill="#8a8fa6">23:59</text>
    </svg>
  );
}

export function Cerebrium() {
  const { lang, setLang } = useLang();
  const es = lang === "es";
  const [feat, setFeat] = React.useState(0);
  const [chart, setChart] = React.useState(0);
  const [built, setBuilt] = React.useState(0);
  const railRef = React.useRef<HTMLDivElement>(null);
  const [cine, setCine] = React.useState(0);
  const [pin, setPin] = React.useState("ec");
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const heroRef = React.useRef<HTMLElement>(null);
  const darkRef = React.useRef<HTMLElement>(null);
  const [chartRef, chartOn] = useInView<HTMLDivElement>();

  // Native scrolling (never blocked by the 3D); the WebGL scene is built in idle time after the first paint.
  const bgRef = React.useRef<{ setScroll: (p: number) => void; setGlobe: (g: number) => void; setFooter: (f: number) => void; setPointer: (x: number, y: number) => void; setHold: (p: number) => void; dispose: () => void } | null>(null);
  React.useEffect(() => {
    let raf = 0, alive = true, idle = 0;
    const onMove = (e: PointerEvent) => bgRef.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    const feed = () => {
      const bg = bgRef.current; if (!bg) return;
      const h = heroRef.current?.offsetHeight || window.innerHeight;
      bg.setScroll(window.scrollY / h);
      const d = darkRef.current;
      if (d) { const r = d.getBoundingClientRect(); const vh = window.innerHeight; const vis = Math.min(r.bottom, vh) - Math.max(r.top, 0); bg.setGlobe(Math.max(0, Math.min(1, vis / (vh * 0.7)))); }
      const ft = document.querySelector<HTMLElement>("[data-cb-foot]");
      if (ft) { const r = ft.getBoundingClientRect(); const vh = window.innerHeight; bg.setFooter(Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.5)))); }
    };
    const loop = () => { feed(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const buildScene = async () => {
      const { createBackground } = await import("./cerebriumScene.js");
      if (!alive || !canvasRef.current) return;
      bgRef.current = createBackground(canvasRef.current, { accent: "#1f6b47", edge: "#9fe8be", base: "#07201a" });
      window.addEventListener("pointermove", onMove);
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (typeof w.requestIdleCallback === "function") idle = w.requestIdleCallback(() => { buildScene(); }, { timeout: 1500 }); else idle = window.setTimeout(buildScene, 300) as unknown as number;
    return () => {
      alive = false; cancelAnimationFrame(raf);
      if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(idle); else window.clearTimeout(idle);
      window.removeEventListener("pointermove", onMove); bgRef.current?.dispose(); bgRef.current = null;
    };
  }, []);
  const onHold = React.useCallback((p: number) => { bgRef.current?.setHold(p); setCine(p); }, []);

  React.useEffect(() => { const id = window.setInterval(() => setPin((p) => PINS[(PINS.findIndex((x) => x.id === p) + 1) % PINS.length].id), 1600); return () => window.clearInterval(id); }, []);
  React.useEffect(() => {
    const obs = new IntersectionObserver((entries) => { for (const e of entries) if (e.isIntersecting) setFeat(Number((e.target as HTMLElement).dataset.i)); }, { rootMargin: "-40% 0px -45% 0px" });
    cardRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);
  const go = (i: number) => { setFeat(i); cardRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" }); };

  const FEATS = es
    ? ["Una operación agentizada", "Un equipo, tres continentes", "Agentes dentro de tus herramientas", "Observabilidad de punta a punta"]
    : ["An agentized operation", "One team, three continents", "Agents inside your tools", "End-to-end observability"];
  const GOV = es
    ? [["Una persona firma", "Cada agente propone y una persona aprueba donde importa: pagos, contratos, salud. El criterio humano queda en el circuito."], ["Tus datos en tus herramientas", "Los agentes trabajan dentro de tu CRM, ERP y correo. Nada se copia a un sistema nuevo ni sale de tu región."], ["Aislamiento por agente", "Cada rol corre aislado, con sus propias credenciales y permisos mínimos. Un agente de ventas no ve finanzas."], ["Registro de auditoría", "Cada acción queda registrada: quién pidió, qué hizo el agente, quién aprobó. Exportable cuando lo necesites."]]
    : [["A person signs off", "Every agent proposes and a person approves where it matters: payments, contracts, health. Human judgment stays in the loop."], ["Your data in your tools", "Agents work inside your CRM, ERP and inbox. Nothing is copied into a new system or leaves your region."], ["Isolation per agent", "Each role runs isolated, with its own credentials and least privilege. A sales agent never sees finance."], ["Audit trail", "Every action is logged: who asked, what the agent did, who approved. Exportable whenever you need it."]];
  const TINTS6 = ["#2a1a3a", "#1a2a3a", "#1f2d1a", "#3a2a1a", "#1a1f3a", "#2a1a1a"];
  const BUILT: { tab: number; t: string; d: string; img?: string; href: string; tint?: string }[] = (es
    ? [{ tab: 0, t: "Agente de facturación médica, 24/7", d: "Reclamos, codificación y seguimientos dentro de las herramientas de la clínica.", img: "/art/helixona-hero.webp", href: "/work/healthcare" }, { tab: 0, t: "Siete agentes para una oficina universitaria", d: "Finanzas, donantes y proyectos en una oficina 3D con dashboards reales.", img: "/office-demo-preview.webp", href: "/office-usfq" }, { tab: 1, t: "EventFlow en el App Store", d: "Check-in, agendas y certificados para 10.000 estudiantes.", img: "/art/eventflow-login-wide.webp", href: "/work/usfq" }, { tab: 1, t: "De Excel a Odoo con rutas de entrega", d: "Cotizaciones, inventario y choferes en el teléfono.", img: "/art/wfs-hero.webp", href: "/work/fence" }, { tab: 2, t: "Portafolio 3D para animatrónicos", d: "React Three Fiber, Spline y scroll storytelling.", img: "/art/themedmotion-wide.webp", href: "/work/themedmotion" }, { tab: 2, t: "Dashboard de IA para concesionarios", d: "Un tablero que lee los números y responde en lenguaje claro.", img: "/art/internet-coaches.webp", href: "/work" }]
    : [{ tab: 0, t: "Medical billing agent, 24/7", d: "Claims, coding and follow-ups inside the clinic's tools.", img: "/art/helixona-hero.webp", href: "/work/healthcare" }, { tab: 0, t: "Seven agents for a university office", d: "Finance, donors and projects in a 3D office with real dashboards.", img: "/office-demo-preview.webp", href: "/office-usfq" }, { tab: 1, t: "EventFlow on the App Store", d: "Check-in, agendas and certificates for 10,000 students.", img: "/art/eventflow-login-wide.webp", href: "/work/usfq" }, { tab: 1, t: "Excel to Odoo with delivery routes", d: "Quotes, inventory and drivers on their phones.", img: "/art/wfs-hero.webp", href: "/work/fence" }, { tab: 2, t: "3D portfolio for animatronics", d: "React Three Fiber, Spline and scroll storytelling.", img: "/art/themedmotion-wide.webp", href: "/work/themedmotion" }, { tab: 2, t: "AI dashboard for car dealerships", d: "A board that reads the numbers and answers in plain language.", img: "/art/internet-coaches.webp", href: "/work" }]).map((b, i) => ({ ...b, tint: TINTS6[i % TINTS6.length] }));
  const FEATURES = es
    ? ["Agentes por rol", "Firma humana", "Integración con CRM y ERP", "WhatsApp y correo", "Investigación UX", "Prototipos probados", "Apps iOS y Android", "Next.js y React", "AWS con CI/CD", "Monitoreo 24/7", "Multi-región", "Odoo y Salesforce", "Dashboards en tiempo real", "Documentación incluida", "Mantenimiento tras el launch", "Español e inglés"]
    : ["Agents per role", "Human sign-off", "CRM & ERP integration", "WhatsApp & email", "UX research", "Tested prototypes", "iOS & Android apps", "Next.js & React", "AWS with CI/CD", "24/7 monitoring", "Multi-region", "Odoo & Salesforce", "Real-time dashboards", "Documentation included", "Maintained after launch", "Spanish & English"];
  const ICONS = [
    <svg key="a" viewBox="0 0 24 24" fill="none" stroke="#bff5cf" strokeWidth="1.6"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" /><path d="M9 12l2 2 4-4" /></svg>,
    <svg key="b" viewBox="0 0 24 24" fill="none" stroke="#bff5cf" strokeWidth="1.6"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M8 4v6" /></svg>,
    <svg key="c" viewBox="0 0 24 24" fill="none" stroke="#bff5cf" strokeWidth="1.6"><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>,
    <svg key="d" viewBox="0 0 24 24" fill="none" stroke="#bff5cf" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  ];

  return (
    <div className={s.root}>
      <canvas ref={canvasRef} className={s.bg} aria-hidden="true" />
      <div style={{ opacity: cine > 0.02 ? 0 : 1, transition: "opacity 0.25s", position: "relative", zIndex: 20 }}><CbNav active="home" /></div>

      <section className={s.hero} ref={heroRef}>
        <HoldCursor label={es ? "Mantén presionado" : "Click and hold"} onProgress={onHold} />
        <div className={s.cine} style={{ opacity: cine > 0.02 ? 1 : 0 }} aria-hidden="true">
          {(es ? ["Rápido", "Escala", "Global"] : ["Quickly", "Scale", "Globally"]).map((w, i) => { const ph = cine * 4; const k = Math.max(0, Math.min(1, ph - i)); const on = ph >= i && ph < i + 1; return <span key={w} className={`${s.cineWord} ${s[`cw${i}`]}`} style={{ opacity: on ? 1 : 0, transform: `translateY(${(1 - k) * 30}px)` }}>{w}</span>; })}
        </div>
        <div className={s.heroIn} style={{ opacity: cine > 0.02 ? 0 : 1, transition: "opacity 0.25s" }}>
          <div>
            <h1 className={s.h1}>{es ? <><Split text="Agentes de IA que" /><br /><Split text="hacen el" delay={240} /> <span className={s.grad}><Split text="trabajo" delay={300} /></span><br /><Split text="repetitivo" delay={420} /></> : <><Split text="AI agents that" /><br /><Split text="do the" delay={240} /> <span className={s.grad}><Split text="repetitive" delay={300} /></span><br /><Split text="work" delay={420} /></>}</h1>
          </div>
          <div className={s.heroSide}>
            <p>{es ? "Facturación, soporte, ventas y operaciones: un agente por área, conectado a tu CRM, ERP y correo, trabajando 24/7. En una semana el primero está en producción. Hoy uno factura para una clínica en EE. UU. sin un humano en el ciclo, salvo para firmar." : "Billing, support, sales and operations: one agent per area, plugged into your CRM, ERP and inbox, working 24/7. The first one is in production within a week. Today one runs billing for a US clinic with no human in the loop except to sign off."}</p>
            <div className={s.ctas}><button type="button" onClick={() => openContact()} className={`${s.btn} ${s.btnAcc}`}><Scramble text={es ? "Habla con nosotros" : "Talk to us"} /></button><Link href="/office-demo" className={`${s.btn} ${s.btnSolid}`}><Scramble text="AI Management Office" /></Link></div>
          </div>
        </div>
      </section>

      <div className={s.logos}><div className={s.marquee}><div className={s.marqueeTrack}>{[0, 1].map((k) => <div key={k} className={s.logosIn} aria-hidden={k === 1}>{LOGOS.map(([n, src]) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={n} src={src} alt={n} title={n} />)}<b>CarCompraCorp</b><b>The Internet Coaches</b></div>)}</div></div></div>
      <div className={s.dotBand}><Dots className={s.dots} squares /></div>

      <section className={s.light} data-cb-light>
        <div className={s.wrap}>
          <div className={s.whyHead}>
            <span className={`${s.mono} ${s.label}`}>{es ? "Por qué MindfulTech" : "Why MindfulTech"}</span>
            <h2 className={s.h2}><Split text={es ? "Hecho para equipos" : "Built for teams,"} /><br /><span className={s.grad2}><Split text={es ? "que empujan límites" : "pushing boundaries"} delay={300} /></span></h2>
            <p>{es ? "Velocidad de producción sin la complejidad de producción." : "Production speed without the production complexity."}</p>
          </div>
          <div className={s.why}>
            <div className={s.whyList}>
              {FEATS.map((f, i) => <button key={f} type="button" className={feat === i ? s.on : ""} onClick={() => go(i)}>{f}</button>)}
            </div>
            <div className={s.cards}>
              <div className={s.card} data-i={0} ref={(el) => { cardRefs.current[0] = el; }}>
                <div className={s.stage} style={{ padding: 0, overflow: "hidden" }}>
                  <AgentCity es={es} />
                </div>
                <h3>{es ? "Toda tu operación, agentizada." : "Your whole operation, agentized."}</h3>
                <p>{es ? "Ventas, soporte, facturación y operaciones reciben cada uno un agente. Se mueven entre tus sistemas como un equipo por una ciudad: los datos fluyen, el trabajo se hace y las luces siguen encendidas a las 3 AM. Y cuando algo requiere criterio, una persona firma." : "Sales, support, billing and operations each get an agent. They move between your systems like a team across a city: data flows, work gets done and the lights stay on at 3 AM. And when something needs judgment, a person signs off."}</p>
              </div>
              <div className={s.card} data-i={1} ref={(el) => { cardRefs.current[1] = el; }}>
                <div className={s.stage}>
                  <span className={`${s.chip} ${s.mono}`}>{es ? "Clientes : 3 continentes" : "Clients : 3 continents"}</span>
                  <div className={s.map}><MiniMap active={pin} /></div>
                  <div className={`${s.mapFoot} ${s.mono}`}>{es ? "Regiones : EC, US-W, US-C, US-E, NL, DE, ES, GR" : "Regions : EC, US-W, US-C, US-E, NL, DE, ES, GR"}</div>
                </div>
                <h3>{es ? "Un equipo en Quito, clientes en tres continentes." : "One team in Quito, clients on three continents."}</h3>
                <p>{es ? "Diez años entregando para empresas de América y Europa, en tu zona horaria de trabajo y en tu idioma. Sin intermediarios ni agencias entre tú y la gente que construye." : "Ten years shipping for companies across the Americas and Europe, in your working hours and your language. No intermediaries or agencies between you and the people who build."}</p>
              </div>
              <div className={s.card} data-i={2} ref={(el) => { cardRefs.current[2] = el; }}>
                <div className={s.stage} style={{ padding: 0, overflow: "hidden" }}>
                  <AgentsAtWork es={es} />
                </div>
                <h3>{es ? "Un agente por rol, dentro de tus herramientas." : "One agent per role, inside your tools."}</h3>
                <p>{es ? "Fin factura, Sopo responde, Sal agenda. Trabajan en tu CRM, tu ERP y tu correo, sin reescribir nada, y cuando algo requiere criterio lo pasan a una persona que firma." : "Fin bills, Sopo answers, Sal books. They work inside your CRM, your ERP and your inbox, nothing rewritten, and when something needs judgment they hand it to a person who signs off."}</p>
              </div>
              <div className={s.card} data-i={3} ref={(el) => { cardRefs.current[3] = el; }}>
                <div className={s.stage}>
                  <div className={s.tabs}>{(es ? ["Reclamos", "Tickets", "Uptime"] : ["Claims", "Tickets", "Uptime"]).map((t, i) => <button key={t} type="button" className={chart === i ? s.on : ""} onClick={() => setChart(i)}>{t}</button>)}</div>
                  <div className={`${s.chart} ${chartOn ? s.chartOn : ""}`} ref={chartRef}><Chart mode={chart} /></div>
                </div>
                <h3>{es ? "Observabilidad de punta a punta para cada agente." : "End-to-end observability for every agent."}</h3>
                <p>{es ? "Cada acción, aprobación y excepción en un panel en tiempo real. Métricas por rol, alertas cuando algo se sale del guion y exportación a tu stack de monitoreo." : "Every action, approval and exception in a real-time panel. Metrics per role, alerts when something leaves the script, and export to your monitoring stack."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${s.dark} ${s.darkClear}`} ref={darkRef}>
        <Dots className={s.dots} />
        <div className={s.darkIn}>
          <div>
            <span className={`${s.mono} ${s.label}`} style={{ color: "#c9cbd6" }}>{es ? "Gobernanza" : "Governance"}</span>
            <h2 className={s.h2} style={{ marginTop: 18 }}><Split text={es ? "Estable," : "Stable,"} /> <span className={s.grad}><Split text={es ? "segura" : "secure"} delay={200} /></span> <Split text={es ? "y gobernada" : "and governed"} delay={320} /></h2>
            <div className={s.darkLinks}><Link href="/office-demo" className={`${s.btn} ${s.btnAcc}`}>{es ? "Ver la oficina" : "See the office"}</Link><Link href="/blog/ai-management-office" className={`${s.btn} ${s.btnGhost}`}>{es ? "Cómo funciona" : "How it works"}</Link></div>
          </div>
          <div className={s.gov}>{GOV.map(([t, d], i) => <div key={t}>{ICONS[i]}<b>{t}</b><p>{d}</p></div>)}</div>
        </div>
        <div className={`${s.wrap} ${s.section}`} style={{ position: "relative", zIndex: 1, paddingTop: 0 }}>
          <div className={s.secHead} style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <h2 className={s.h2}><Split text={es ? "Construido con MindfulTech" : "Built with MindfulTech"} /></h2>
            <div className={s.segTabs}>{(es ? ["Agentes", "Apps", "Otros"] : ["Agents", "Apps", "Other"]).map((t, i) => <button key={t} type="button" className={built === i ? s.on : ""} onClick={() => setBuilt(i)}>{t}</button>)}</div>
          </div>
          <div className={s.built}>
            {BUILT.filter((b) => b.tab === built).map((b) => (
              <Link key={b.t} href={b.href} className={`${s.builtCard} ${s.builtDark}`}>
                <div className={`${s.thumb} ${s.mockThumb}`} style={{ ["--tint" as string]: b.tint }}>{b.img && <span className={s.win}><i /><i /><i />{/* eslint-disable-next-line @next/next/no-img-element */}<img src={b.img} alt="" width={1200} height={675} loading="lazy" /></span>}</div>
                <b>{b.t}</b><span>{b.d}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={s.light} data-cb-light style={{ display: "none" }}>
        <div className={`${s.wrap} ${s.section}`} style={{ display: "none" }}>
          <div className={s.secHead}>
            <h2 className={s.h2}>{es ? "Construido con MindfulTech" : "Built with MindfulTech"}</h2>
            <div className={s.pillTabs}>{(es ? ["Agentes", "Apps", "Otros"] : ["Agents", "Apps", "Other"]).map((t, i) => <button key={t} type="button" className={built === i ? s.on : ""} onClick={() => setBuilt(i)}>{t}</button>)}</div>
          </div>
          <div className={s.built}>
            {BUILT.filter((b) => b.tab === built).map((b) => (
              <Link key={b.t} href={b.href} className={s.builtCard}>
                <div className={s.thumb}>{b.img && /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.img} alt="" width={1200} height={675} loading="lazy" />}</div>
                <b>{b.t}</b><span>{b.d}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${s.dark} ${s.darkClear}`}>
        <div className={`${s.wrap}`} style={{ padding: "110px 40px" }}>
          <div className={s.secHead}><h2 className={s.h2}>{es ? "Lo último del blog" : "Latest from our blog"}</h2><Link href="/blog" className={`${s.btn} ${s.btnGhost}`}>{es ? "Ver todo" : "See all"}</Link></div>
          <div className={s.posts}>{POSTS.slice(0, 3).map((p, i) => <Link key={p.slug} href={`/blog/${p.slug}`} className={s.post}><span className={s.mono}>{p.dateLabel[lang]} / {p.tag[lang]}</span><span className={s.postIcon} aria-hidden="true">{POST_ICONS[i % POST_ICONS.length]}</span><b>{p.title[lang]}</b><span className={s.mono} style={{ color: "#bff5cf" }}>{es ? "Leer →" : "Read →"}</span></Link>)}</div>
        </div>
      </section>
      <CbFooter />
      <section className={`${s.dark} ${s.darkClear}`} style={{ display: "none" }}>
      </section>
    </div>
  );
}
