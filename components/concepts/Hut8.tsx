"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { POSTS } from "@/lib/blog/posts";
import s from "./hut8.module.css";

/* Concept 04, "Hut 8" (Oct 2026): infrastructure-grade. Black, lime, a huge headline and a scroll journey
   through MindfulTech's three layers (Research 1.0, Software 2.0, Agents 3.0) over a white isometric diagram
   whose wiring lights up layer by layer. */

function Sun({ size = 52, color = "#f4f4f1" }: { size?: number; color?: string }) {
  return (
    <svg className={s.sun} viewBox="0 0 52 52" width={size} height={size} aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => <line key={i} x1="26" y1="4" x2="26" y2="18" stroke={color} strokeWidth="1.6" transform={`rotate(${i * 15} 26 26)`} />)}
    </svg>
  );
}

/* the three layers as an isometric plant: research (field), software (building), agents (racks) */
function Plant({ lit }: { lit: number }) {
  const w = (on: boolean) => ({ stroke: on ? "#8fd414" : "#b9b9b3", strokeWidth: on ? 2 : 1.2 });
  // isometric box with its origin at the front-bottom corner: top, left and right faces
  const box = (x: number, y: number, wd: number, h: number, d: number, fill = "#fff") => (
    <g key={`${x}-${y}`} stroke="#bdbdb7" strokeWidth="1">
      <path d={`M${x} ${y - h} l${wd} ${-wd / 2} l${d} ${d / 2} l${-wd} ${wd / 2}z`} fill={fill} />
      <path d={`M${x} ${y} v${-h} l${wd} ${-wd / 2} v${h}z`} fill="#f0f0ec" />
      <path d={`M${x + wd} ${y - wd / 2} v${-h} l${d} ${d / 2} v${h}z`} fill="#dededa" />
    </g>
  );
  return (
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {/* wiring */}
      <g fill="none" strokeLinejoin="round">
        <path d="M150 560 L420 425 L420 330 L640 220" {...w(lit >= 1)} />
        <path d="M640 220 L900 350 L900 420" {...w(lit >= 2)} />
        <path d="M900 420 L1120 530" {...w(lit >= 3)} />
        {[0, 6, 12].map((o) => <path key={o} d={`M${150 + o} ${560 + o / 2} L${420 + o} ${425 + o / 2} L${420 + o} ${330 + o / 2} L${640 + o} ${220 + o / 2}`} stroke="#d9d9d3" strokeWidth="1" />)}
      </g>
      {/* 1.0 research field: a grid of interview cards */}
      <g opacity={lit >= 1 ? 1 : 0.55}>{[0, 1, 2, 3].map((i) => [0, 1, 2].map((j) => box(80 + i * 34 + j * 26, 560 - i * 17 + j * 13, 26, 6, 18, lit >= 1 ? "#eaffb0" : "#fff")))}</g>
      {/* 2.0 software: a building */}
      <g opacity={lit >= 2 ? 1 : 0.55}>{box(400, 420, 110, 90, 80, lit >= 2 ? "#eaffb0" : "#fff")}{box(430, 325, 50, 22, 36, lit >= 2 ? "#eaffb0" : "#f7f7f4")}</g>
      {/* 3.0 agents: a rack hall with six desks */}
      <g opacity={lit >= 3 ? 1 : 0.55}>{[0, 1, 2].map((i) => [0, 1].map((j) => box(820 + i * 60 - j * 40, 420 - i * 30 - j * 20, 40, 34, 26, lit >= 3 ? "#eaffb0" : "#fff")))}</g>
      <g fontFamily="var(--mono)" fontSize="11" fill="#666" letterSpacing="1.5">
        <text x="80" y="640">1.0 RESEARCH</text><text x="380" y="470">2.0 SOFTWARE</text><text x="820" y="540">3.0 AGENTS</text>
      </g>
    </svg>
  );
}

export function Hut8() {
  const { lang, setLang } = useLang();
  const es = lang === "es";
  const [pct, setPct] = React.useState(0);
  const [boot, setBoot] = React.useState(true);
  const [gone, setGone] = React.useState(false);
  const [lit, setLit] = React.useState(0);
  const stepRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  React.useEffect(() => {
    let p = 0; const id = window.setInterval(() => { p = Math.min(100, p + 3 + Math.random() * 5); setPct(Math.round(p)); if (p >= 100) { window.clearInterval(id); window.setTimeout(() => setBoot(false), 300); window.setTimeout(() => setGone(true), 1000); } }, 60);
    return () => window.clearInterval(id);
  }, []);
  React.useEffect(() => {
    const onScroll = () => { const line = window.innerHeight * 0.6; let k = 0; stepRefs.current.forEach((el, i) => { if (el && el.getBoundingClientRect().top <= line) k = i + 1; }); setLit(k); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const layers: [string, string, string, string][] = es
    ? [["Investigación", "Capa 1.0", "Entrevistas de campo, mapas de recorrido y prototipos probados con usuarios reales. Encontramos el problema real antes de una línea de código.", "/services/discovery"], ["Software", "Capa 2.0", "Diseñamos, construimos y operamos plataformas web, móviles y herramientas internas en AWS, con CI, pruebas y monitoreo desde el primer sprint.", "/services/custom"], ["Agentes", "Capa 3.0", "Un agente por rol dentro de las herramientas que ya usas, con una persona firmando donde importa. El AI Management Office es nuestro producto.", "/office-demo"]]
    : [["Research", "Layer 1.0", "Field interviews, journey maps and prototypes tested with real users. We find the real problem before a line of code.", "/services/discovery"], ["Software", "Layer 2.0", "We design, build and operate web and mobile platforms and internal tools on AWS, with CI, tests and monitoring from the first sprint.", "/services/custom"], ["Agents", "Layer 3.0", "One agent per role inside the tools you already use, with a person signing off where it matters. The AI Management Office is our product.", "/office-demo"]];
  const biz: [string, string, string][] = es
    ? [["Product Discovery", "Investigación de campo, mapas de experiencia y prototipos probados con usuarios reales antes del código de producción.", "/services/discovery"], ["Software a medida", "Plataformas y herramientas internas con la forma de tus procesos, integradas con lo que ya usas y mantenidas a largo plazo.", "/services/custom"], ["AI Management Office", "Una oficina donde cada empleado es un agente de IA: Ventas, Soporte, Finanzas, Marketing, Operaciones y Recepción, por suscripción mensual.", "/office-demo"]]
    : [["Product Discovery", "Field research, journey maps and prototypes tested with real users before production code.", "/services/discovery"], ["Custom software", "Platforms and internal tools shaped around your workflows, integrated with what you already run and maintained for the long run.", "/services/custom"], ["AI Management Office", "An office where every employee is an AI agent: Sales, Support, Finance, Marketing, Operations and Reception, by monthly subscription.", "/office-demo"]];
  return (
    <div className={s.root}>
      {!gone && (
        <div className={`${s.boot} ${boot ? "" : s.bootOff}`} aria-hidden={!boot}>
          <Sun />
          <div style={{ height: 160 }} />
          <div className={s.bootLine}><i style={{ width: `${pct}%` }} /></div>
          <div className={s.bootPct}>{pct}%</div>
        </div>
      )}
      <div className={s.nav}>
        <Link href="/" aria-label="MindfulTech"><Sun color={lit > 0 && lit < 4 ? "#111" : "#f4f4f1"} /></Link>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => setLang(es ? "en" : "es")} className={`${s.navBtn} ${s.navDark}`} style={{ cursor: "pointer", border: 0, font: "inherit" }}>{es ? "EN" : "ES"}</button>
          <Link href="/concept" className={s.navBtn}>MindfulTech <i /></Link>
        </div>
      </div>

      <section className={s.hero}>
        <div className={s.heroArt}><Sun size={700} color="#1f1f1f" /></div>
        <h1 className={s.h1}>{es ? <>Donde la investigación<br />desbloquea<br />la IA</> : <>Where research<br />unlocks<br />AI</>}</h1>
        <div className={s.heroRow}>
          <p className={s.lead}>{es ? "Laboratorio de software e IA. Desarrollamos y operamos un portafolio integrado de investigación, software y agentes, construido para poner la IA a trabajar en empresas reales." : "Software and AI lab. We develop and operate an integrated portfolio of research, software and agents, built to put AI to work in real companies."}</p>
          <a href="#platform" className={s.link}>{es ? "Saber más" : "Learn more"} →</a>
        </div>
      </section>

      <section className={s.intro}>
        <p>{es ? "Tomamos un enfoque de investigación primero: desarrollamos, comercializamos y operamos la infraestructura de software y agentes que sostiene a las empresas de hoy y de mañana." : "We take a research-first, product-driven approach to developing, commercializing and operating the software and agent infrastructure that underpins the companies of today and tomorrow."}</p>
        <small>{es ? "Plataforma MindfulTech" : "MindfulTech platform"}</small>
      </section>

      <section id="platform" className={s.journey}>
        <div className={s.jStage}>
          <Plant lit={lit} />
          <div className={s.jBadge}><Sun size={24} color="#111" /></div>
        </div>
        {layers.map(([t, k, d, href], i) => (
          <div key={t} className={s.jStep} ref={(el) => { stepRefs.current[i] = el; }}>
            <b>{t}</b><small>{k}</small><p>{d}</p><Link href={href}>{es ? "Saber más →" : "Learn more →"}</Link>
          </div>
        ))}
      </section>

      <section className={s.sec}>
        <div className={s.two}>
          <h2 className={s.h2}>{es ? "Desbloqueando el potencial de las personas" : "Unlocking human potential"}</h2>
          <p>{es ? "A medida que la IA transforma el trabajo, presiona a equipos que ya van al límite. Nuestra plataforma integra investigación, software y agentes para responder a ese reto con una persona siempre al mando." : "As AI transforms work, it puts pressure on teams already at capacity. Our platform integrates research, software and agents to meet that challenge with a person always in charge."}</p>
        </div>
        <div className={s.biz}>
          {biz.map(([t, d, href]) => <div key={t} className={s.bizRow}><b>{t}</b><p>{d}</p><Link href={href}>{es ? "Explorar →" : "Explore →"}</Link></div>)}
        </div>
      </section>

      <section className={s.sec}>
        <div className={s.two}>
          <h2 className={s.h2}>{es ? "Noticias y perspectivas" : "News & insights"}</h2>
          <p>{es ? "Lo que aprendemos construyendo agentes y software para clínicas, distribuidores y universidades." : "What we learn building agents and software for clinics, distributors and universities."}</p>
        </div>
        <div className={s.news}>
          {POSTS.slice(0, 3).map((p) => <Link key={p.slug} href={`/blog/${p.slug}`}><small>{p.tag[lang]} / {p.dateLabel[lang]}</small><b>{p.title[lang]}</b><span>{es ? "Leer →" : "Read →"}</span></Link>)}
        </div>
      </section>

      <section className={s.cta}>
        <h2 className={s.h2}>{es ? "Tu operación, con agentes" : "Your operation, with agents"}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start" }}>
          <p>{es ? "Escríbenos y te mostramos un agente corriendo sobre uno de tus flujos reales." : "Write to us and we'll show an agent running on one of your real workflows."}</p>
          <a href="mailto:info@mindfultech.ec" className={s.btn}>{es ? "Contacto" : "Contact us"} →</a>
        </div>
      </section>

      <footer className={s.foot}>
        <div><b>MindfulTech</b>Quito, Ecuador<br />info@mindfultech.ec</div>
        <div><b>{es ? "Plataforma" : "Platform"}</b><Link href="/services/discovery">{es ? "Investigación" : "Research"}</Link><Link href="/services">Software</Link><Link href="/office-demo">{es ? "Agentes" : "Agents"}</Link></div>
        <div><b>{es ? "Empresa" : "Company"}</b><Link href="/company">{es ? "Nosotros" : "About us"}</Link><Link href="/work">{es ? "Proyectos" : "Work"}</Link><Link href="/blog">Blog</Link></div>
        <div><b>{es ? "Conceptos" : "Concepts"}</b><Link href="/concept">{es ? "Todos los conceptos" : "All concepts"}</Link></div>
      </footer>
    </div>
  );
}
