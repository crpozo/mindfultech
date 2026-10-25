"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { WorldMap } from "@/components/site/Home";
import { SiteNav, CtaBand } from "@/components/site/Shell";
import { DotsStage, mountDotsStory, DOT_ORDER, DOT_ROLE_DESC } from "./TheDots";
import site from "@/components/site/site.module.css";
import dots from "./dots.module.css";
import s from "./mix.module.css";

/* Concept 05, "Mix": the best of every concept on the site's own design system.
   Preloader with the company card (Heron / Hut 8) → serif hero with the collage band (site) →
   the Dots scene pinned beside real chapters (AI Journey) → the three-layer diagram that lights up
   (Hut 8) → sector tiles (Fauna) → the client map and the green-grid CTA (site). */

type Lang = "en" | "es";
const LOGOS: [string, string][] = [["USFQ", "/logo-usfq.svg"], ["ThemedMotion", "/portfolio/themedmotion-logo-m.webp"], ["Helixona", "/helixona-logo-m.webp"], ["Western Fence Supply", "/wfs-logo.svg"], ["PARC Home Care", "/parc-logo-m.webp"]];
const BOOT: Record<Lang, string[]> = {
  en: ["INITIALIZE RESEARCH", "LOAD 22 FIELD INTERVIEWS", "PROTOTYPE WITH USERS", "WIRE CI, TESTS, MONITORING", "DEPLOY TO AWS", "CONNECT CRM / INBOX / BANK", "HIRE ONE AGENT PER ROLE", "ADD HUMAN SIGN-OFF", "OPEN THE OFFICE"],
  es: ["INICIAR INVESTIGACIÓN", "CARGAR 22 ENTREVISTAS", "PROTOTIPAR CON USUARIOS", "CONECTAR CI, PRUEBAS, MONITOREO", "DESPLEGAR EN AWS", "CONECTAR CRM / CORREO / BANCO", "CONTRATAR UN AGENTE POR ROL", "AÑADIR FIRMA HUMANA", "ABRIR LA OFICINA"],
};

function Layers({ lit }: { lit: number }) {
  const w = (on: boolean) => ({ stroke: on ? "#3dbe7d" : "#b9b9b3", strokeWidth: on ? 2.5 : 1.2 });
  const box = (x: number, y: number, wd: number, h: number, d: number, fill: string) => (
    <g key={`${x}-${y}`} stroke="#0e1013" strokeWidth="1">
      <path d={`M${x} ${y - h} l${wd} ${-wd / 2} l${d} ${d / 2} l${-wd} ${wd / 2}z`} fill={fill} />
      <path d={`M${x} ${y} v${-h} l${wd} ${-wd / 2} v${h}z`} fill="#f0f0ec" />
      <path d={`M${x + wd} ${y - wd / 2} v${-h} l${d} ${d / 2} v${h}z`} fill="#dededa" />
    </g>
  );
  const on = (k: number) => (lit >= k ? "#bff5cf" : "#fff");
  return (
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g fill="none" strokeLinejoin="round">
        <path d="M150 560 L420 425 L420 330 L640 220" {...w(lit >= 1)} />
        <path d="M640 220 L900 350 L900 420" {...w(lit >= 2)} />
        <path d="M900 420 L1120 530" {...w(lit >= 3)} />
      </g>
      <g opacity={lit >= 1 ? 1 : 0.5}>{[0, 1, 2, 3].map((i) => [0, 1, 2].map((j) => box(80 + i * 34 + j * 26, 560 - i * 17 + j * 13, 26, 6, 18, on(1))))}</g>
      <g opacity={lit >= 2 ? 1 : 0.5}>{box(400, 420, 110, 90, 80, on(2))}{box(430, 325, 50, 22, 36, on(2))}</g>
      <g opacity={lit >= 3 ? 1 : 0.5}>{[0, 1, 2].map((i) => [0, 1].map((j) => box(820 + i * 60 - j * 40, 420 - i * 30 - j * 20, 40, 34, 26, on(3))))}</g>
      <g fontFamily="var(--font-jbmono)" fontSize="11" fill="#555" letterSpacing="1.5">
        <text x="80" y="640">1.0 RESEARCH</text><text x="380" y="470">2.0 SOFTWARE</text><text x="820" y="540">3.0 AGENTS</text>
      </g>
    </svg>
  );
}

export function Mix() {
  const { lang } = useLang();
  const es = lang === "es";
  const L = lang as Lang;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [pct, setPct] = React.useState(0);
  const [booting, setBooting] = React.useState(true);
  const [gone, setGone] = React.useState(false);
  const [ch, setCh] = React.useState(0);
  const [lit, setLit] = React.useState(0);
  const [coords, setCoords] = React.useState("X:0000 Y:0000");
  const layerRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  React.useEffect(() => {
    let p = 0; const id = window.setInterval(() => { p = Math.min(100, p + 2.5 + Math.random() * 4); setPct(Math.round(p)); if (p >= 100) { window.clearInterval(id); window.setTimeout(() => setBooting(false), 300); window.setTimeout(() => setGone(true), 900); } }, 65);
    return () => window.clearInterval(id);
  }, []);
  React.useEffect(() => {
    if (!rootRef.current) return;
    return mountDotsStory(rootRef.current, lang, setCh, dots.blink);
  }, [lang]);
  React.useEffect(() => {
    const onMove = (e: PointerEvent) => setCoords(`X:${String(Math.round(e.clientX)).padStart(4, "0")} Y:${String(Math.round(e.clientY)).padStart(4, "0")}`);
    const onScroll = () => { const line = window.innerHeight * 0.6; let k = 0; layerRefs.current.forEach((el, i) => { if (el && el.getBoundingClientRect().top <= line) k = i + 1; }); setLit(k); };
    window.addEventListener("pointermove", onMove, { passive: true }); window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("scroll", onScroll); };
  }, []);
  const lit1 = Math.min(BOOT[L].length, Math.ceil((pct / 100) * BOOT[L].length));
  const roleLabel = es ? { Sales: "Ventas", Support: "Soporte", Finance: "Finanzas", Marketing: "Marketing", Operations: "Operaciones", Reception: "Recepción" } : { Sales: "Sales", Support: "Support", Finance: "Finance", Marketing: "Marketing", Operations: "Operations", Reception: "Reception" };
  const chapters: [string, string, string, React.ReactNode][] = [
    ["01", es ? "Toda empresa tiene trabajo que nadie debería hacer a las 2 AM" : "Every company has work nobody should be doing at 2 AM", es ? "Facturas, reclamos, seguimientos y reportes se hacen a mano, uno por uno. Es exactamente el trabajo que el software debería hacer por ti." : "Invoices, claims, follow-ups and reports are done by hand, one at a time. It is exactly the work software should be doing for you.", null],
    ["02", es ? "Un laboratorio, de punta a punta" : "One lab, end to end", es ? "Rece dirige cada solicitud al escritorio correcto. Así trabajamos: investigación, diseño, ingeniería e IA en un solo equipo." : "Rece routes every request to the right desk. That is how we work: research, design, engineering and AI in one team.", <div className={site.list} key="l">{([["Product Discovery", "/services/ux"], [es ? "Aplicaciones web y móviles" : "Web & mobile applications", "/services/apps"], [es ? "Software a medida" : "Custom software", "/services/custom"], [es ? "IA y automatización" : "AI & automation", "/services/ai"]] as [string, string][]).map(([t, h]) => <Link key={t} href={h} className={site.item}><span className={site.itemBody}><span className={site.itemTitle}>{t}</span></span><span>→</span></Link>)}</div>],
    ["03", es ? "Agentes de IA que hacen el trabajo" : "AI agents that do the work", es ? "Sal atrapa un lead de WhatsApp, lo registra en el CRM y agenda la reunión antes de que alguien despierte." : "Sal catches a WhatsApp lead, logs it in the CRM and books the meeting before anyone wakes up.", <div className={site.statRow} key="s">{[["24/7", es ? "agente en facturación médica" : "agent on medical billing"], ["6", es ? "semanas a producción" : "weeks to production"], ["1", es ? "persona firma donde importa" : "person signs where it matters"]].map(([b, t]) => <div key={b} className={site.stat} style={{ background: "#fff", border: "1px solid #e3e6e1", minHeight: 120 }}><b>{b}</b><span>{t}</span></div>)}</div>],
    ["04", es ? "IA en la que tus usuarios sí pueden confiar" : "AI your users can actually trust", es ? "Sopo resuelve tres tickets a las 3 AM. El difícil va a una persona. Grounding en tus datos, respuestas citadas, escalamiento humano." : "Sopo solves three tickets at 3 AM. The hard one goes to a person. Grounded in your data, cited answers, human escalation.", null],
    ["05", es ? "Un agente que lleva la facturación médica" : "An agent that runs medical billing", es ? "Helixona, clínica de medicina funcional en EE. UU.: reclamos en eClinicalWorks y envíos a Blue Shield, 24/7. Fin es su retrato." : "Helixona, a functional-medicine clinic in the US: claims in eClinicalWorks and Blue Shield submissions, 24/7. Fin is its portrait.", <Link key="h" href="/work#healthcare" className={site.featureFrame} style={{ display: "block", maxWidth: 520 }}><span className={site.featureBar}><i /><i /><i /><em>helixona.com</em></span>{/* eslint-disable-next-line @next/next/no-img-element */}<img className={site.featureImg} src="/art/helixona-hero.webp" alt="Helixona" width={1200} height={675} loading="lazy" /></Link>],
    ["06", es ? "De Excel a un CRM que se enruta solo" : "From Excel to a CRM that routes itself", es ? "Western Fence Supply: de hojas de cálculo a Odoo, con asignación automática de leads y rutas de entrega. Opi convierte la hoja en estantes." : "Western Fence Supply: from spreadsheets to Odoo, with automatic lead routing and delivery routes. Opi turns the sheet into shelves.", <Link key="w" href="/work#fence" className={site.featureFrame} style={{ display: "block", maxWidth: 520 }}><span className={site.featureBar}><i /><i /><i /><em>westernfencesupply.com</em></span>{/* eslint-disable-next-line @next/next/no-img-element */}<img className={site.featureImg} src="/art/wfs-hero.webp" alt="Western Fence Supply" width={1200} height={675} loading="lazy" /></Link>],
    ["07", es ? "Resultados medibles, en producción" : "Measured results, in production", es ? "Mark planifica, publica y reporta. Nosotros también: estas son las cifras del laboratorio." : "Mark plans, publishes and reports. So do we: these are the lab's numbers.", <div className={site.statRow} key="n">{[["3,650+", es ? "días lanzando productos" : "days shipping products"], ["48", es ? "productos en producción" : "products in production"], ["8", es ? "países con clientes" : "countries with clients"]].map(([b, t]) => <div key={b} className={site.stat} style={{ background: "#bff5cf", minHeight: 120 }}><b>{b}</b><span>{t}</span></div>)}</div>],
    ["08", es ? "Una oficina donde cada empleado es un agente de IA" : "An office where every employee is an AI agent", es ? "El AI Management Office es nuestro producto, por suscripción mensual. Abres la oficina, ves qué hace cada agente y apruebas lo que necesite una persona." : "The AI Management Office is our product, sold as a monthly subscription. You open the office, watch what each agent is doing and sign off on whatever needs a person.", <div key="r" style={{ display: "flex", flexDirection: "column", gap: 16 }}><div className={site.roles} style={{ background: "#e3e6e1", border: "1px solid #e3e6e1" }}>{DOT_ORDER.map((r) => <div key={r} className={site.role} style={{ background: "#fff", padding: 16 }}><b style={{ color: "#1f7a4d", fontSize: 24 }}>{roleLabel[r]}</b><span style={{ color: "#333", fontSize: 13.5 }}>{DOT_ROLE_DESC[L][r]}</span></div>)}</div><Link href="/office-demo" className={`${site.btn} ${site.btnGreen}`} style={{ alignSelf: "flex-start" }}>{es ? "Abrir la demo en vivo" : "Open the live demo"}</Link></div>],
    ["09", es ? "¿Cuál escritorio es el tuyo?" : "Which desk is yours?", es ? "Los Dots te miran y se van. Elige el escritorio que llenarías primero y escríbenos." : "The Dots look at you and leave. Pick the desk you'd fill first and write to us.", <div key="c" className={site.ctas} style={{ justifyContent: "flex-start" }}><a href="mailto:info@mindfultech.ec" className={`${site.btn} ${site.btnInk}`}>{es ? "Empieza un proyecto" : "Start a project"}</a><a href="https://wa.me/593958731994" target="_blank" rel="noreferrer" className={`${site.btn} ${site.btnOutline}`}>WhatsApp →</a></div>],
  ];
  const layers: [string, string, string][] = es
    ? [["Investigación", "Capa 1.0", "Entrevistas de campo, mapas de recorrido y prototipos probados con usuarios reales antes de una línea de código."], ["Software", "Capa 2.0", "Web, móvil y herramientas internas en AWS, con CI, pruebas y monitoreo desde el primer sprint. Mantenemos lo que construimos."], ["Agentes", "Capa 3.0", "Un agente por rol dentro de las herramientas que ya usas, con una persona firmando donde importa."]]
    : [["Research", "Layer 1.0", "Field interviews, journey maps and prototypes tested with real users before a line of code."], ["Software", "Layer 2.0", "Web, mobile and internal tools on AWS, with CI, tests and monitoring from the first sprint. We maintain what we build."], ["Agents", "Layer 3.0", "One agent per role inside the tools you already use, with a person signing off where it matters."]];
  const sectors: [string, string, string, string][] = es
    ? [["Salud", "Un agente lleva la facturación de Helixona 24/7; la clínica firma las excepciones.", "#e3f1fb", "/work#healthcare"], ["Distribución", "Western Fence Supply pasó de Excel a Odoo, con rutas de entrega multi-parada.", "#bff5cf", "/work#fence"], ["Educación", "EventFlow para la USFQ en el App Store y USFQ NEXT con su tablero de donaciones.", "#eeedfb", "/work#usfq"], ["Entretenimiento y cuidado", "Un portafolio 3D para ThemedMotion y PARC Connect en las dos tiendas.", "#f4d98a", "/work#themedmotion"]]
    : [["Healthcare", "An agent runs Helixona's billing 24/7; the clinic signs the exceptions.", "#e3f1fb", "/work#healthcare"], ["Distribution", "Western Fence Supply moved from Excel to Odoo, with multi-stop delivery routes.", "#bff5cf", "/work#fence"], ["Education", "EventFlow for USFQ on the App Store and USFQ NEXT with its donations dashboard.", "#eeedfb", "/work#usfq"], ["Entertainment & care", "A 3D portfolio for ThemedMotion and PARC Connect in both stores.", "#f4d98a", "/work#themedmotion"]];
  return (
    <div className={site.root} ref={rootRef}>
      {!gone && (
        <div className={`${s.boot} ${booting ? "" : s.bootOff}`} aria-hidden={!booting}>
          <div className={s.bootTop}><div className={s.bootTitle}>{es ? "Software con IA, construido desde la investigación, desde Quito" : "AI software, built from research, from Quito"}</div><span className={s.bootPct}>{pct}%</span></div>
          <div>
            <div className={s.bootBar}><i style={{ width: `${pct}%` }} /></div>
            <div className={s.bootGrid}>
              <div className={s.ficha}><b>{es ? "Tipo" : "Type"}</b><span>:</span><span>{es ? "Laboratorio de software full-stack e IA" : "Full-stack software & AI lab"}</span><b>{es ? "Fundado" : "Founded"}</b><span>:</span><span>2016</span><b>{es ? "Foco" : "Focus"}</b><span>:</span><span>{es ? "Investigación UX, ingeniería y agentes de IA" : "UX research, engineering and AI agents"}</span><b>{es ? "Ubicación" : "Location"}</b><span>:</span><span>Quito, Ecuador / {es ? "clientes en EE. UU. y Europa" : "clients in the US and Europe"}</span></div>
              <div className={s.lines}>{BOOT[L].map((l, i) => <span key={l} className={i < lit1 ? "on" : ""}><em>{String(i + 1).padStart(3, "0")}</em>{l}</span>)}</div>
            </div>
          </div>
          <button type="button" className={s.skip} onClick={() => setBooting(false)}>{es ? "Saltar →" : "Skip →"}</button>
        </div>
      )}
      <span className={s.coords}>{coords}</span>
      <SiteNav active="home" />

      {/* hero: serif + collage (site) */}
      <section className={site.hero}>
        <div className={site.heroIn}>
          <div className={site.pill}><span className={site.chip}>MIX</span><span>{es ? "Lo mejor de los cinco conceptos, en una sola home." : "The best of the five concepts, in one home."}</span><Link href="/concept">{es ? "Ver todos →" : "See all →"}</Link></div>
          <h1 className={site.h1}>{es ? "Pon software con IA a trabajar para tu negocio" : "Put AI software to work for your business"}</h1>
          <p className={site.heroSub}>{es ? "Laboratorio de software full-stack, impulsado por investigación UX e IA aplicada: del descubrimiento al agente corriendo en producción." : "Full-stack software lab, powered by UX research and applied AI: from discovery to the agent running in production."}</p>
          <div className={site.ctas}><a href="#story" className={`${site.btn} ${site.btnOutline}`}>{es ? "Ver la historia" : "See the story"}</a><a href="mailto:info@mindfultech.ec" className={`${site.btn} ${site.btnGreen}`}>{es ? "Empieza un proyecto" : "Start a project"}</a></div>
        </div>
        <div className={site.band} aria-hidden="true"><div className={site.bandInner}><div className={`${site.bandGridL} ${site.grid}`} /><div className={`${site.bandGridR} ${site.grid}`} /><div className={site.bandTri} /><div className={site.bandPhoto}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/art/team.webp" alt="" width={1200} height={900} /></div><div className={site.bandCard}>{es ? "Un agente de IA en producción en 6 semanas" : "Ship an AI agent to production in 6 weeks"}</div><div className={site.bandStat}><b>3,650+</b><span>{es ? "días lanzando productos" : "days shipping products"}</span></div><div className={site.bandCol}><i /><i /></div></div></div>
      </section>
      <div className={site.trusted}><div className={site.trustedIn} style={{ maxWidth: 1440, margin: "0 auto" }}><span className={site.mono}>{es ? "Confían en nosotros" : "Trusted by"}</span><div className={site.marquee}><div className={site.marqueeTrack}>{[0, 1].map((k) => <div key={k} className={site.marqueeGroup} aria-hidden={k === 1}>{LOGOS.map(([n, src]) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={n} src={src} alt={n} title={n} />)}<b>CarCompraCorp</b><b>The Internet Coaches</b></div>)}</div></div></div></div>

      {/* the Dots story beside real chapters (AI Journey) */}
      <section id="story" className={`${site.wrap} ${site.sectionFirst}`} data-id="story">
        <div className={s.storyWrap}>
          <div className={s.storyCopy}>
            {chapters.map(([n, h, p, extra], i) => (
              <section key={n} className={s.chapter} data-ch={i + 1}><span className={s.kicker}>{n}</span><h2>{h}</h2><p>{p}</p>{extra}</section>
            ))}
          </div>
          <div className={`${s.storyStage} ${dots.root}`}>
            <DotsStage ch={ch} lang={lang} />
          </div>
        </div>
      </section>

      {/* three layers that light up (Hut 8) */}
      <section className={`${site.wrap} ${site.section}`}>
        <div className={site.head}><span className={site.label}>{es ? "Plataforma" : "Platform"}</span><h2 className={site.h2}>{es ? "Tres capas, un solo laboratorio" : "Three layers, one lab"}</h2></div>
        <div className={s.layers}>
          <div className={s.layerStage}><Layers lit={lit} /></div>
          <div>{layers.map(([t, k, d], i) => <div key={t} className={s.layerStep} ref={(el) => { layerRefs.current[i] = el; }}><small>{k}</small><b>{t}</b><p>{d}</p></div>)}</div>
        </div>
      </section>

      {/* sectors (Fauna) */}
      <section className={`${site.wrap} ${site.section}`}>
        <div className={site.head}><span className={site.label}>{es ? "Sectores" : "Sectors"}</span><h2 className={site.h2}>{es ? "Hecho para la gente que opera" : "Made for the people who run the operation"}</h2></div>
        <div className={s.sectors}>{sectors.map(([t, d, bg, href]) => <div key={t} className={s.sector} style={{ background: bg }}><b>{t}</b><p>{d}</p><Link href={href}>{es ? "Ver el caso →" : "See the case →"}</Link></div>)}</div>
      </section>

      {/* map (site) */}
      <section className={`${site.wrap} ${site.section}`}><WorldMap lang={lang} /></section>
      <CtaBand />
    </div>
  );
}
