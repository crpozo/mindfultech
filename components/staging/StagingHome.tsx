"use client";

import * as React from "react";
import Link from "next/link";
import { useLang, type Lang } from "@/components/i18n";
import s from "./staging.module.css";

/* Staging port of the home redesign (design_handoff_mindfultech_home, Oct 2026):
   serif display + flat geometric collage. Copy, tokens and interactions follow the
   handoff README; assets are the site's real ones. */

const T = {
  en: {
    nav: ["Services", "Work", "Blog", "Company"],
    start: "Start a project",
    pillNew: "NEW",
    pill: "AI Management Office — governed AI agents for your ops.",
    learn: "Learn more →",
    h1: "Put AI software to work for your business",
    heroSub: "Full-stack software lab, powered by UX research and applied AI — from discovery to deployment.",
    projects: "Our projects",
    bandCard: "Ship an AI agent to production in 6 weeks",
    bandStat: "days shipping products",
    trusted: "Trusted by",
    diffH2: "The MindfulTech difference",
    diffSub: "Measured results across design, engineering, and AI automation.",
    diff: [
      ["↑ Days shipping", "3,650+", "human-centered products in production."],
      ["↑ Automation", "24/7", "an AI agent runs Helixona's medical billing end to end."],
      ["↑ In production", "2", "app stores carry PARC Connect: App Store and Google Play."],
    ],
    learnHow: "Learn how →",
    whyH2: "Why teams choose MindfulTech",
    whySub: "One lab from the first interview to the agent running in production.",
    why: [
      ["Research before code", "Field interviews, journey maps and prototypes tested with real users. We find the real problem before a single line of production code.", "Explore product discovery"],
      ["Ship on modern stacks, for the long run", "Web, mobile and custom software on AWS, with CI, tests and monitoring from day one. We maintain what we build.", "Explore engineering"],
      ["AI agents that do the work", "One agent per role, inside the tools you already use. A person signs off only where it matters.", "Open the AI Management Office"],
      ["One lab, end to end", "Research, design, engineering and AI in one team and one roadmap. No hand-offs, no agencies in between.", "Start a project"],
    ],
    svcH2a: "Full-stack lab, ",
    svcH2b: "end to end",
    svcSub: "Powering every step of the product journey, from first research session to production AI.",
    svc: [
      ["Product Discovery", "Research, journey maps and prototypes tested with real users before production code."],
      ["Web Applications", "Scalable, tailor-made platforms on modern stacks, maintained for the long run."],
      ["AI Integration", "Assistants, copilots and intelligent agents your users can trust."],
    ],
    projectsLbl: "● Projects",
    workH2: "Built by MindfulTech",
    work: [
      ["Helixona", "An AI agent that runs medical billing"],
      ["USFQ", "EventFlow, shipped on the App Store"],
      ["Western Fence Supply", "Excel → Odoo, with delivery routes"],
      ["ThemedMotion · Netherlands", "An immersive 3D portfolio for an animatronics studio"],
      ["PARC Home Care", "PARC Connect, home care in your pocket"],
      ["The Internet Coaches · California", "AI dashboard for car dealerships"],
    ],
    featChip: "Healthcare · AI agent · 24/7",
    featText: "Claims, coding and follow-ups handled end to end inside the clinic's tools. A person signs off only where it matters.",
    caseStudy: "Case study →",
    officeTag: "AI as a service · our new product",
    officeH2a: "An office where every employee is an ",
    officeH2b: "AI agent",
    officeP: "A product we built, sold as a monthly subscription. One agent per role, connected to the tools you already use. You open the office, watch what each agent is doing, ask it questions and sign off on whatever needs a person.",
    officeBtn: "Open the live demo",
    roles: [
      ["Sales", "Qualifies leads, follows up and books meetings in your CRM."],
      ["Support", "Answers tickets and WhatsApp 24/7, escalates to a person when it matters."],
      ["Finance", "Issues invoices, reconciles the bank and chases receivables."],
      ["Marketing", "Plans, publishes and reports the week's campaigns."],
      ["Operations", "Orders supplies and keeps the calendar and inventory in order."],
      ["Reception", "Confirms appointments and routes every request to the right place."],
    ],
    whereLbl: "● Where we work",
    whereH2: "MindfulTech helps companies worldwide",
    whereSub: "From Ecuador, for teams across the Americas and Europe.",
    homeBase: "Home base",
    us: "United States",
    eu: "Europe",
    ctaH2: "Start building with MindfulTech",
    ctaSub: "From the first research session to production AI: one lab, end to end.",
    ctaBtn: "Get started now",
    fServices: ["UX Design", "Web & Mobile Apps", "Custom Software", "AI & Automation", "Cloud Architecture"],
    fWork: ["Case studies", "ThemedMotion 3D", "Helixona billing AI", "USFQ EventFlow", "Odoo CRM & delivery"],
    fCompany: ["About us", "Blog", "Careers", "Press"],
    rights: "© 2026 MindfulTech. All rights reserved.",
    legal: ["Privacy", "Terms", "Cookies"],
  },
  es: {
    nav: ["Servicios", "Proyectos", "Blog", "Empresa"],
    start: "Empieza un proyecto",
    pillNew: "NUEVO",
    pill: "AI Management Office: agentes de IA gobernados para tu operación.",
    learn: "Saber más →",
    h1: "Pon software con IA a trabajar para tu negocio",
    heroSub: "Laboratorio de software full-stack, impulsado por investigación UX e IA aplicada: del descubrimiento al despliegue.",
    projects: "Nuestros proyectos",
    bandCard: "Un agente de IA en producción en 6 semanas",
    bandStat: "días lanzando productos",
    trusted: "Confían en nosotros",
    diffH2: "La diferencia MindfulTech",
    diffSub: "Resultados medibles en diseño, ingeniería y automatización con IA.",
    diff: [
      ["↑ Días lanzando", "3,650+", "productos centrados en las personas, en producción."],
      ["↑ Automatización", "24/7", "un agente de IA lleva la facturación médica de Helixona de punta a punta."],
      ["↑ En producción", "2", "tiendas publican PARC Connect: App Store y Google Play."],
    ],
    learnHow: "Cómo lo hacemos →",
    whyH2: "Por qué los equipos eligen MindfulTech",
    whySub: "Un solo laboratorio desde la primera entrevista hasta el agente corriendo en producción.",
    why: [
      ["Investigar antes de programar", "Entrevistas de campo, mapas de experiencia y prototipos probados con usuarios reales. Encontramos el problema real antes de una sola línea de código de producción.", "Conoce product discovery"],
      ["Stacks modernos, pensados para durar", "Web, móvil y software a medida en AWS, con CI, pruebas y monitoreo desde el día uno. Mantenemos lo que construimos.", "Conoce la ingeniería"],
      ["Agentes de IA que hacen el trabajo", "Un agente por rol, dentro de las herramientas que ya usas. Una persona aprueba solo donde importa.", "Abre el AI Management Office"],
      ["Un laboratorio, de punta a punta", "Investigación, diseño, ingeniería e IA en un solo equipo y una sola hoja de ruta. Sin traspasos ni agencias de por medio.", "Empieza un proyecto"],
    ],
    svcH2a: "Laboratorio full-stack, ",
    svcH2b: "de punta a punta",
    svcSub: "Impulsamos cada paso del producto, de la primera sesión de investigación a la IA en producción.",
    svc: [
      ["Product Discovery", "Investigación, mapas de experiencia y prototipos probados con usuarios reales antes del código de producción."],
      ["Aplicaciones web", "Plataformas escalables y a medida en stacks modernos, mantenidas a largo plazo."],
      ["Integración de IA", "Asistentes, copilotos y agentes inteligentes en los que tus usuarios pueden confiar."],
    ],
    projectsLbl: "● Proyectos",
    workH2: "Construido por MindfulTech",
    work: [
      ["Helixona", "Un agente de IA que lleva la facturación médica"],
      ["USFQ", "EventFlow, publicada en el App Store"],
      ["Western Fence Supply", "De Excel a Odoo, con rutas de entrega"],
      ["ThemedMotion · Países Bajos", "Un portafolio 3D inmersivo para un estudio de animatrónica"],
      ["PARC Home Care", "PARC Connect, cuidado en casa en tu bolsillo"],
      ["The Internet Coaches · California", "Dashboard de IA para concesionarios"],
    ],
    featChip: "Salud · agente de IA · 24/7",
    featText: "Reclamos, codificación y seguimientos resueltos de punta a punta dentro de las herramientas de la clínica. Una persona aprueba solo donde importa.",
    caseStudy: "Caso de estudio →",
    officeTag: "IA como servicio · nuestro nuevo producto",
    officeH2a: "Una oficina donde cada empleado es un ",
    officeH2b: "agente de IA",
    officeP: "Un producto nuestro, vendido como suscripción mensual. Un agente por rol, conectado a las herramientas que ya usas. Abres la oficina, ves qué hace cada agente, le preguntas y apruebas lo que necesite una persona.",
    officeBtn: "Abrir la demo en vivo",
    roles: [
      ["Ventas", "Califica leads, da seguimiento y agenda reuniones en tu CRM."],
      ["Soporte", "Responde tickets y WhatsApp 24/7 y escala a una persona cuando importa."],
      ["Finanzas", "Emite facturas, concilia el banco y cobra cuentas pendientes."],
      ["Marketing", "Planifica, publica y reporta las campañas de la semana."],
      ["Operaciones", "Pide insumos y mantiene en orden el calendario y el inventario."],
      ["Recepción", "Confirma citas y dirige cada solicitud al lugar correcto."],
    ],
    whereLbl: "● Dónde trabajamos",
    whereH2: "MindfulTech ayuda a empresas en todo el mundo",
    whereSub: "Desde Ecuador, para equipos de América y Europa.",
    homeBase: "Sede",
    us: "Estados Unidos",
    eu: "Europa",
    ctaH2: "Empieza a construir con MindfulTech",
    ctaSub: "De la primera sesión de investigación a la IA en producción: un laboratorio, de punta a punta.",
    ctaBtn: "Empecemos",
    fServices: ["Diseño UX", "Apps web y móviles", "Software a medida", "IA y automatización", "Arquitectura cloud"],
    fWork: ["Casos de estudio", "ThemedMotion 3D", "IA de facturación Helixona", "USFQ EventFlow", "CRM Odoo y entregas"],
    fCompany: ["Nosotros", "Blog", "Carreras", "Prensa"],
    rights: "© 2026 MindfulTech. Todos los derechos reservados.",
    legal: ["Privacidad", "Términos", "Cookies"],
  },
} as const;

const WHY_TINTS = [
  ["#EEEDFB", "#C9C4F2"],
  ["#E6F7EC", "#3DBE7D"],
  ["#E3F1FB", "#85BFE9"],
  ["#F4F5F3", "#0E1013"],
];
const WHY_HREF = ["/services", "/services", "/office-demo", "#contact"];
const SVC = [
  { tint: "#EEEDFB", hot: "#BDB5FA", gl: "#C9C4F2" },
  { tint: "#E6F7EC", hot: "#8EF2B4", gl: "#9FDDBB" },
  { tint: "#E3F1FB", hot: "#8ED0FF", gl: "#9CCBEF" },
];
const LOGOS: [string, string][] = [
  ["USFQ", "/logo-usfq.svg"],
  ["ThemedMotion", "/portfolio/themedmotion-logo-m.webp"],
  ["Helixona", "/helixona-logo-m.webp"],
  ["Western Fence Supply", "/wfs-logo.svg"],
  ["PARC Home Care", "/parc-logo-m.webp"],
];

/* ------------------------------------------------- why: the four mocks ---- */
function WhyMock({ i }: { i: number }) {
  if (i === 0)
    return (
      <>
        <div className={s.mock} style={{ left: "8%", top: "12%", width: "52%", background: "#EEEDFB", boxShadow: "8px 8px 0 #C9C4F2", gap: 14 }}>
          <div className={s.mockHead}>Interview #14<span className={s.mockLbl}>CLINIC · QUITO</span></div>
          <div className={s.lines}><i style={{ width: "85%" }} /><i style={{ width: "60%" }} /><i style={{ width: "72%" }} /></div>
          <div className={s.tags}><span>PAIN · BILLING</span><span>WORKAROUND</span><span className={s.outline}>QUOTE</span></div>
        </div>
        <div className={s.mock} style={{ right: "8%", top: "38%", width: "48%" }}>
          <div className={s.mockLbl}>JOURNEY MAP · DAY 1 → DAY 30</div>
          <div className={s.bars}><i style={{ height: "40%" }} /><i style={{ height: "70%" }} /><i style={{ height: "100%", background: "#0E1013" }} /><i style={{ height: "55%" }} /><i style={{ height: "30%" }} /></div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>Peak friction: claim rejections on day 12</div>
        </div>
      </>
    );
  if (i === 1)
    return (
      <>
        <div className={s.mock} style={{ left: "10%", top: "14%", width: "60%", background: "#E6F7EC", boxShadow: "8px 8px 0 #3DBE7D", padding: 0, gap: 0 }}>
          <div className={s.mockHead} style={{ padding: "14px 18px", borderBottom: "2px solid #0E1013" }}>Deploy · main<span className={s.mockLbl} style={{ color: "#1F7A4D" }}>● LIVE</span></div>
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div className={s.kv}><span>build</span><b>✓ 42s</b></div>
            <div className={s.kv}><span>tests · 318</span><b>✓ passed</b></div>
            <div className={s.kv}><span>deploy · aws</span><b>✓ 1m 08s</b></div>
          </div>
        </div>
        <div className={s.mock} style={{ right: "6%", top: "52%", width: "44%", padding: 18, gap: 8 }}>
          <span className={s.mockLbl}>UPTIME · 90 DAYS</span>
          <span className={s.uptime}>99.98%</span>
          <div className={s.seg}><i /><i /><i /><i /><i /><i /></div>
        </div>
      </>
    );
  if (i === 2)
    return (
      <>
        <div className={s.mock} style={{ left: "8%", top: "10%", width: "56%", background: "#E3F1FB", padding: 0, gap: 0 }}>
          <div className={s.mockHead} style={{ padding: "14px 18px", borderBottom: "2px solid #0E1013" }}>Finance agent · today</div>
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div className={s.fin}><span>Invoices issued</span><b>37</b></div>
            <div className={s.fin}><span>Bank reconciled</span><b>✓</b></div>
            <div className={`${s.fin} ${s.finHot}`}><span>Needs your signature</span><b>2</b></div>
          </div>
        </div>
        <div className={s.mock} style={{ right: "6%", top: "44%", width: "48%", boxShadow: "8px 8px 0 #85BFE9", padding: 18, gap: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#85BFE9", display: "block", marginTop: 6, flexShrink: 0 }} />
            <span style={{ fontSize: 15, lineHeight: 1.45 }}>Approved the two receivables over $5k. Follow-ups sent to the rest.</span>
          </div>
          <div className={s.reply}>Reply to Finance agent<span>→</span></div>
        </div>
      </>
    );
  return (
    <>
      <div className={s.mock} style={{ left: "8%", right: "8%", top: "16%", padding: 22, gap: 18 }}>
        <div className={s.mockLbl} style={{ display: "flex", justifyContent: "space-between" }}><span>ONE TEAM · ONE ROADMAP</span><span>WEEK 1 → 12</span></div>
        <div className={s.roadmap}>
          <span style={{ gridColumn: "1/4", background: "#C9C4F2" }}>Research</span>
          <span style={{ gridColumn: "3/8", background: "#BFF5CF" }}>Design + build</span>
          <span style={{ gridColumn: "7/11", background: "#85BFE9" }}>AI agents</span>
          <span style={{ gridColumn: "10/13", background: "#0E1013", color: "#fff" }}>Launch</span>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 15, color: "#333", flexWrap: "wrap" }}><span>No hand-offs</span><span>No agencies in between</span><span>One Slack channel</span></div>
      </div>
      <div className={s.quote} style={{ position: "absolute", left: "12%", bottom: "12%", border: "2px solid #0E1013" }}>“They sat in our clinic for two weeks before writing code.”</div>
    </>
  );
}

/* ------------------------------------------- services: CSS illustrations ---- */
function ArtDiscovery() {
  const doc = (l: string, t: string, w: number, h: number, delay: number) => (
    <div className={s.doc} style={{ left: l, top: t, width: w, height: h, animationDelay: `${delay}s` }}><i style={{ width: "80%" }} /><i style={{ width: "58%" }} /><i style={{ width: "36%" }} /></div>
  );
  return (
    <div className={s.art} style={{ ["--gl" as string]: "#C9C4F2" }}>
      {doc("18%", "20%", 120, 130, 0)}
      {doc("48%", "34%", 130, 110, 1.2)}
      <div style={{ left: "40%", top: "66%", width: 22, height: 22, background: "#3DBE7D", clipPath: "polygon(0 0,100% 40%,45% 55%,30% 100%)", animation: "mtDrift 4s ease-in-out infinite" }} />
      <div style={{ left: "74%", top: "18%", width: 36, height: 36, background: "#C9C4F2", clipPath: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)", animation: "mtSpin 12s linear infinite" }} />
      <div style={{ left: "12%", top: "70%", width: 16, height: 16, border: "3px solid #0E1013", transform: "rotate(45deg)" }} />
    </div>
  );
}
function ArtApps() {
  const node = (l: string, t: string, delay: number) => (
    <div className={s.node} style={{ left: l, top: t, width: 120, height: 70, animationDelay: `${delay}s` }}><i style={{ width: "75%" }} /><i style={{ width: "50%" }} /></div>
  );
  return (
    <div className={s.art} style={{ ["--gl" as string]: "#9FDDBB" }}>
      {node("12%", "26%", 0)}
      {node("60%", "52%", 1.5)}
      <div style={{ left: "33%", top: "calc(26% + 33px)", width: "30%", height: 3, background: "#0E1013" }} />
      <div style={{ left: "62%", top: "calc(26% + 33px)", width: 3, height: "26%", background: "#0E1013" }} />
      <div style={{ left: "33%", top: "calc(26% + 26px)", width: 16, height: 16, borderRadius: "50%", background: "#3DBE7D", animation: "mtFlow 2.4s ease-in-out infinite" }} />
      <div style={{ left: "70%", top: "14%", width: 56, height: 56, borderRadius: "50%", background: "#1F7A4D", animation: "mtPulse 3s ease-in-out infinite" }} />
      <div style={{ left: "22%", top: "66%", width: 50, height: 44, background: "#3DBE7D", clipPath: "polygon(50% 0,100% 100%,0 100%)", animation: "mtDrift 5s ease-in-out .8s infinite" }} />
    </div>
  );
}
function ArtAI() {
  return (
    <div className={s.art} style={{ ["--gl" as string]: "#9CCBEF" }}>
      <div style={{ left: "50%", top: "50%", width: 56, height: 56, marginLeft: -28, marginTop: -28, background: "#85BFE9", clipPath: "polygon(50% 0,100% 50%,50% 100%,0 50%)", animation: "mtPulse 2.5s ease-in-out infinite" }} />
      {[[0, 14], [60, 18], [120, 22]].map(([rot, dur]) => (
        <div key={rot} className={s.ring} style={{ ["--rot" as string]: `${rot}deg`, animationName: "mtSpinFrom", animationDuration: `${dur}s` }} />
      ))}
      <div style={{ left: "76%", top: "22%", width: 40, height: 34, background: "#1F3A8A", clipPath: "polygon(0 0,100% 50%,0 100%)", animation: "mtDrift 5s ease-in-out infinite" }} />
      <div style={{ left: "18%", top: "60%", width: 26, height: 26, background: "#85BFE9", clipPath: "polygon(50% 0,100% 100%,0 100%)" }} />
      <div style={{ left: "70%", top: "70%", width: 24, height: 24, background: "#1F3A8A", transform: "rotate(45deg)", animation: "mtFloat 4s ease-in-out 1s infinite" }} />
      <div style={{ left: "24%", top: "26%", width: 10, height: 10, borderRadius: "50%", background: "#0E1013" }} />
      <div style={{ left: "82%", top: "56%", width: 8, height: 8, borderRadius: "50%", background: "#0E1013" }} />
    </div>
  );
}

/* ------------------------------------------------------------------ page ---- */
export function StagingHome() {
  const { lang, setLang } = useLang();
  const t = T[lang as Lang];
  const [why, setWhy] = React.useState(0);
  const paused = React.useRef(false);
  React.useEffect(() => {
    const id = window.setInterval(() => {
      if (!paused.current) setWhy((w) => (w + 1) % 4);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);
  const activate = (i: number) => {
    paused.current = true;
    setWhy(i);
  };
  const navHref = ["/services", "/work", "/blog", "/company"];
  return (
    <div className={s.root}>
      {/* nav */}
      <div className={s.nav}>
        <div className={`${s.navIn}`} style={{ maxWidth: 1440, margin: "0 auto" }}>
          <Link href="/staging" className={s.navLogo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} />
          </Link>
          <div className={s.navLinks}>
            {t.nav.map((n, i) => (
              <Link key={n} href={navHref[i]}>{n}</Link>
            ))}
          </div>
          <div className={s.navRight}>
            <button type="button" className={lang === "en" ? s.on : ""} onClick={() => setLang("en")}>EN</button>
            <button type="button" className={lang === "es" ? s.on : ""} onClick={() => setLang("es")}>ES</button>
            <a href="#contact" className={s.navCta}>{t.start}</a>
          </div>
        </div>
      </div>

      {/* hero */}
      <section className={s.hero}>
        <div className={s.heroIn}>
          <div className={s.pill}>
            <span className={s.chip}>{t.pillNew}</span>
            <span>{t.pill}</span>
            <a href="#office">{t.learn}</a>
          </div>
          <h1 className={s.h1}>{t.h1}</h1>
          <p className={s.heroSub}>{t.heroSub}</p>
          <div className={s.ctas}>
            <a href="#work" className={`${s.btn} ${s.btnOutline}`}>{t.projects}</a>
            <a href="#contact" className={`${s.btn} ${s.btnGreen}`}>{t.start}</a>
          </div>
        </div>
        <div className={s.band} aria-hidden="true">
          <div className={s.bandInner}>
            <div className={`${s.bandGridL} ${s.grid}`} />
            <div className={`${s.bandGridR} ${s.grid}`} />
            <div className={s.bandTri} />
            <div className={s.bandPhoto}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/team.webp" alt="" width={1200} height={900} />
            </div>
            <div className={s.bandCard}>{t.bandCard}</div>
            <div className={s.bandStat}><b>3,650+</b><span>{t.bandStat}</span></div>
            <div className={s.bandCol}><i /><i /></div>
          </div>
        </div>
      </section>

      {/* trusted by */}
      <div className={s.trusted}>
        <div className={s.trustedIn} style={{ maxWidth: 1440, margin: "0 auto" }}>
          <span className={s.mono}>{t.trusted}</span>
          {LOGOS.map(([name, src]) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={name} src={src} alt={name} title={name} />
          ))}
          <b>CarCompraCorp</b>
        </div>
      </div>

      {/* difference */}
      <section className={`${s.wrap} ${s.sectionFirst}`}>
        <div className={s.head}>
          <h2 className={s.h2}>{t.diffH2}</h2>
          <p className={s.sub}>{t.diffSub}</p>
        </div>
        <div className={s.cards3}>
          <div className={`${s.diff} ${s.diffInk}`}><span className={s.mono}>{t.diff[0][0]}</span><span className={s.big}>{t.diff[0][1]}</span><p>{t.diff[0][2]}</p><Link href="/services">{t.learnHow}</Link></div>
          <div className={`${s.diff} ${s.diffLime}`}><span className={s.mono}>{t.diff[1][0]}</span><span className={s.big}>{t.diff[1][1]}</span><p>{t.diff[1][2]}</p><Link href="/work">{t.learnHow}</Link></div>
          <div className={`${s.diff} ${s.diffGrid} ${s.grid}`}><span className={`${s.mono} ${s.onWhite}`}>{t.diff[2][0]}</span><span className={`${s.big} ${s.onWhite}`}>{t.diff[2][1]}</span><p className={s.onWhite}>{t.diff[2][2]}</p><Link href="/work">{t.learnHow}</Link></div>
        </div>
      </section>

      {/* why */}
      <section className={`${s.wrap} ${s.section} ${s.why}`}>
        <div>
          <h2 className={s.h2}>{t.whyH2}</h2>
          <p className={s.sub}>{t.whySub}</p>
          {t.why.map(([title, body, cta], i) => {
            const on = i === why;
            return (
              <div
                key={title}
                className={`${s.row} ${on ? s.rowOn : ""}`}
                style={on ? { ["--tint" as string]: WHY_TINTS[i][0], background: WHY_TINTS[i][0], borderBottomColor: WHY_TINTS[i][1] } : undefined}
                onMouseEnter={() => activate(i)}
                onClick={() => activate(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(i); } }}
                aria-expanded={on}
              >
                <div className={s.rowTitle}>{title}{i === 2 && <span className={s.rowNew}>{t.pillNew}</span>}</div>
                {on && (
                  <>
                    <p className={s.rowBody}>{body}</p>
                    <Link href={WHY_HREF[i]} className={s.rowCta}>{cta} →</Link>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className={s.panel}>
          <WhyMock key={why} i={why} />
        </div>
      </section>

      {/* services */}
      <section id="services" className={`${s.wrap} ${s.section}`}>
        <div className={s.svcHead}>
          <h2 className={s.h2}>{t.svcH2a}<span style={{ color: "#1F7A4D" }}>{t.svcH2b}</span></h2>
          <p className={s.sub}>{t.svcSub}</p>
        </div>
        <div className={s.cards3}>
          {t.svc.map(([title, body], i) => (
            <div key={title} className={s.svc} style={{ ["--tint" as string]: SVC[i].tint, ["--hot" as string]: SVC[i].hot }}>
              <h3>{title}</h3>
              {i === 0 ? <ArtDiscovery /> : i === 1 ? <ArtApps /> : <ArtAI />}
              <Link href="/services" className={s.svcFoot}><span>{body}</span><span>→</span></Link>
            </div>
          ))}
        </div>
      </section>

      {/* work */}
      <section id="work" className={`${s.wrap} ${s.section}`}>
        <div className={s.head}>
          <span className={s.label}>{t.projectsLbl}</span>
          <h2 className={s.h2}>{t.workH2}</h2>
        </div>
        <div className={s.work}>
          <div className={s.list}>
            {t.work.map(([client, title], i) => (
              <Link key={client} href="/work" className={s.item}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span className={s.itemBody}><span className={s.itemClient}>{client}</span><span className={s.itemTitle}>{title}</span></span>
                <span>→</span>
              </Link>
            ))}
          </div>
          <div className={`${s.feature} ${s.grid}`}>
            <div className={s.featureCircle} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={s.featureImg} src="/art/helixona-hero.webp" alt="Helixona" width={1200} height={675} />
            <span className={s.featureChip}>{t.featChip}</span>
            <p className={s.featureText}>{t.featText}</p>
            <Link href="/work" className={s.featureBtn}>{t.caseStudy}</Link>
          </div>
        </div>
      </section>

      {/* AI office */}
      <section id="office" className={s.office}>
        <div className={s.officeIn}>
          <div className={s.officeHead}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div className={s.officeTag}><span>{t.pillNew}</span>{t.officeTag}</div>
              <h2 className={s.officeH2}>{t.officeH2a}<em>{t.officeH2b}</em></h2>
            </div>
            <div className={s.officeRight}>
              <p>{t.officeP}</p>
              <Link href="/office-demo" className={`${s.btn} ${s.btnLime}`}>{t.officeBtn}</Link>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={s.officePreview} src="/office-demo-preview.webp" alt="AI Management Office" width={2000} height={1125} loading="lazy" />
          <div className={s.roles}>
            {t.roles.map(([name, body]) => (
              <div key={name} className={s.role}><b>{name}</b><span>{body}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* where we work */}
      <section className={`${s.wrap} ${s.section} ${s.where}`}>
        <div className={s.whereL}>
          <span className={s.label}>{t.whereLbl}</span>
          <h2 className={s.h2}>{t.whereH2}</h2>
          <p className={s.sub}>{t.whereSub}</p>
        </div>
        <div className={s.places}>
          <div className={`${s.place} ${s.placeHq}`}><span className={s.mono}>{t.homeBase}</span><b>Ecuador <small>HQ</small></b></div>
          <div className={s.place}><span className={s.mono}>{t.us}</span><span>California<br />Chicago<br />Southwest Florida</span></div>
          <div className={s.place}><span className={s.mono}>{t.eu}</span><span>Netherlands<br />Germany<br />Spain<br />Greece</span></div>
        </div>
      </section>

      {/* cta */}
      <section id="contact" className={`${s.cta} ${s.grid}`}>
        <div className={s.ctaCircle} />
        <div className={s.ctaTri} />
        <div className={s.ctaIn}>
          <h2 className={s.ctaH2}>{t.ctaH2}</h2>
          <p className={s.ctaSub}>{t.ctaSub}</p>
          <a href="mailto:info@mindfultech.ec" className={`${s.btn} ${s.btnInk} ${s.btnInkWhite}`}>{t.ctaBtn}</a>
        </div>
      </section>

      {/* footer */}
      <footer className={s.footer}>
        <div className={s.footerIn} style={{ maxWidth: 1440, margin: "0 auto" }}>
          <div className={s.footerCols}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} style={{ height: 26, width: "auto" }} />
            </div>
            <div className={s.footerCol}><span className={s.mono}>{t.nav[0]}</span>{t.fServices.map((x) => <Link key={x} href="/services">{x}</Link>)}</div>
            <div className={s.footerCol}><span className={s.mono}>{t.nav[1]}</span>{t.fWork.map((x) => <Link key={x} href="/work">{x}</Link>)}</div>
            <div className={s.footerCol}><span className={s.mono}>{t.nav[3]}</span>{t.fCompany.map((x, i) => <Link key={x} href={i === 1 ? "/blog" : "/company"}>{x}</Link>)}</div>
            <div className={s.footerCol}>
              <span className={s.mono}>{lang === "es" ? "Contacto" : "Contact"}</span>
              <a href="mailto:info@mindfultech.ec">info@mindfultech.ec</a>
              <a href="tel:+593958731994">+593 958 73 1994</a>
              <a href="https://wa.me/593958731994" target="_blank" rel="noreferrer">WhatsApp</a>
              <span style={{ color: "#555" }}>Quito · Ecuador</span>
            </div>
          </div>
          <div className={s.footerBottom}>
            <span>{t.rights}</span>
            <div>{t.legal.map((x) => <a key={x} href="#">{x}</a>)}</div>
          </div>
        </div>
      </footer>
      <span className={s.ribbon}>STAGING · {lang === "es" ? "VISTA PREVIA" : "PREVIEW"}</span>
    </div>
  );
}
