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
    learn: "Open the demo →",
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
    projectsLbl: "Projects",
    workH2: "Built by MindfulTech",
    work: [
      ["Helixona", "An AI agent that runs medical billing"],
      ["USFQ", "EventFlow, shipped on the App Store"],
      ["Western Fence Supply", "Excel → Odoo, with delivery routes"],
      ["ThemedMotion / Netherlands", "An immersive 3D portfolio for an animatronics studio"],
      ["PARC Home Care", "PARC Connect, home care in your pocket"],
      ["The Internet Coaches / California", "AI dashboard for car dealerships"],
    ],
    feat: [
      ["Healthcare / AI agent / 24/7", "Claims, coding and follow-ups handled end to end inside the clinic's tools. A person signs off only where it matters."],
      ["Education / iOS app / App Store", "Event check-in, agendas and certificates for a university of 10,000 students, shipped on the App Store."],
      ["Industry / Odoo / logistics", "Quotes, inventory and delivery routes moved from spreadsheets into Odoo, with drivers on their phones."],
      ["Entertainment / 3D web / Netherlands", "A real-time 3D portfolio that lets visitors walk around the studio's animatronics."],
      ["Home care / mobile app / 2 stores", "PARC Connect puts schedules, visits and care notes in families' pockets, on iOS and Android."],
      ["Automotive / AI dashboard / California", "One dashboard that reads every dealership's numbers and answers questions in plain language."],
    ],
    caseStudy: "Case study →",
    officeTag: "AI as a service / our new product",
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
    whereLbl: "Where we work",
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
    learn: "Abrir la demo →",
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
    projectsLbl: "Proyectos",
    workH2: "Construido por MindfulTech",
    work: [
      ["Helixona", "Un agente de IA que lleva la facturación médica"],
      ["USFQ", "EventFlow, publicada en el App Store"],
      ["Western Fence Supply", "De Excel a Odoo, con rutas de entrega"],
      ["ThemedMotion / Países Bajos", "Un portafolio 3D inmersivo para un estudio de animatrónica"],
      ["PARC Home Care", "PARC Connect, cuidado en casa en tu bolsillo"],
      ["The Internet Coaches / California", "Dashboard de IA para concesionarios"],
    ],
    feat: [
      ["Salud / agente de IA / 24/7", "Reclamos, codificación y seguimientos resueltos de punta a punta dentro de las herramientas de la clínica. Una persona aprueba solo donde importa."],
      ["Educación / app iOS / App Store", "Registro a eventos, agendas y certificados para una universidad de 10.000 estudiantes, publicada en el App Store."],
      ["Industria / Odoo / logística", "Cotizaciones, inventario y rutas de entrega pasaron de hojas de cálculo a Odoo, con los choferes en su celular."],
      ["Entretenimiento / web 3D / Países Bajos", "Un portafolio 3D en tiempo real para recorrer la animatrónica del estudio."],
      ["Cuidado en casa / app móvil / 2 tiendas", "PARC Connect pone horarios, visitas y notas de cuidado en el bolsillo de las familias, en iOS y Android."],
      ["Automotriz / dashboard de IA / California", "Un solo tablero que lee los números de cada concesionario y responde preguntas en lenguaje natural."],
    ],
    caseStudy: "Caso de estudio →",
    officeTag: "IA como servicio / nuestro nuevo producto",
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
    whereLbl: "Dónde trabajamos",
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
const FEAT_IMG = ["/art/helixona-hero.webp", "/art/eventflow-login-wide.webp", "/art/wfs-hero.webp", "/art/themedmotion-wide.webp", "/art/parc-login.webp", "/art/internet-coaches.webp"];
const LOGOS: [string, string][] = [
  ["USFQ", "/logo-usfq.svg"],
  ["ThemedMotion", "/portfolio/themedmotion-logo-m.webp"],
  ["Helixona", "/helixona-logo-m.webp"],
  ["Western Fence Supply", "/wfs-logo.svg"],
  ["PARC Home Care", "/parc-logo-m.webp"],
];

/* ------------------------------------------------- why: the four mocks ---- */
const Lbl = ({ children, color = "#555" }: { children: React.ReactNode; color?: string }) => <span className={s.mockLbl} style={{ color }}>{children}</span>;

function WhyMock({ i }: { i: number }) {
  if (i === 0)
    return (
      <>
        <div className={s.mock} style={{ left: "5%", top: "6%", width: "54%", background: "#EEEDFB", boxShadow: "8px 8px 0 #C9C4F2", gap: 12 }}>
          <div className={s.mockHead}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}><span className={s.avatar} style={{ background: "#C9C4F2" }}>MR</span>Interview #14 <small style={{ fontWeight: 400, color: "#555" }}>/ 46 min</small></span>
            <Lbl>CLINIC / QUITO</Lbl>
          </div>
          <div className={s.transcript}>
            <p><b>Q</b> What happens when a claim comes back rejected?</p>
            <p><b>A</b> “I print it, mark it in a notebook and re-type it on Friday. Some weeks there are forty.”</p>
            <p><b>Q</b> Who sees the notebook?</p>
            <p><b>A</b> “Only me. If I'm sick, nobody.”</p>
          </div>
          <div className={s.tags}><span>PAIN / BILLING</span><span>WORKAROUND</span><span>SINGLE POINT OF FAILURE</span><span className={s.outline}>QUOTE</span></div>
          <div className={s.mockFoot}><span>Tagged by Lucía</span><span>Session 14 of 22</span></div>
        </div>
        <div className={s.mock} style={{ right: "4%", top: "56%", width: "50%", gap: 10 }}>
          <div className={s.mockHead} style={{ fontSize: 15 }}>Journey map <Lbl>DAY 1 → DAY 30</Lbl></div>
          <div className={s.journey}>
            {[["D1", 35, "intake"], ["D4", 55, "codes"], ["D8", 70, "submit"], ["D12", 100, "rejected"], ["D18", 60, "re-type"], ["D24", 45, "resubmit"], ["D30", 25, "paid"]].map(([d, h, l]) => (
              <div key={d as string} className={s.jcol}><i style={{ height: `${h}%`, background: h === 100 ? "#0E1013" : "#C9C4F2" }} /><small>{d}</small><em>{l}</em></div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Peak friction: claim rejections on day 12</span>
            <span className={s.pillTiny} style={{ background: "#C9C4F2" }}>3 of 5 clinics</span>
          </div>
        </div>
        <div className={s.sticky} style={{ left: "68%", top: "10%", transform: "rotate(4deg)" }}>Nobody owns the rejected pile.</div>
      </>
    );
  if (i === 1)
    return (
      <>
        <div className={s.mock} style={{ left: "6%", top: "10%", width: "62%", background: "#E6F7EC", boxShadow: "8px 8px 0 #3DBE7D", padding: 0, gap: 0 }}>
          <div className={s.mockHead} style={{ padding: "12px 16px", borderBottom: "2px solid #0E1013" }}>
            <span>Deploy <small style={{ fontWeight: 400, color: "#555" }}>main / a41f9c2</small></span>
            <Lbl color="#1F7A4D">● LIVE</Lbl>
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 9 }}>
            {[["lint + typecheck", "✓ 18s", 100], ["tests / 318 passed", "✓ 42s", 100], ["build / next export", "✓ 1m 02s", 100], ["deploy / aws · us-east-1", "✓ 1m 08s", 100], ["smoke / 12 routes", "✓ 9s", 100]].map(([k, v, w]) => (
              <div key={k as string} className={s.step}><span>{k}</span><i><b style={{ width: `${w}%` }} /></i><em>{v}</em></div>
            ))}
          </div>
          <div className={s.log}><span>14:02:11</span> migrations: 2 applied · <span>14:02:14</span> cache warmed · <span>14:02:19</span> healthcheck 200 · <span>14:02:19</span> traffic shifted 100%</div>
        </div>
        <div className={s.mock} style={{ right: "5%", top: "50%", width: "46%", padding: 16, gap: 8 }}>
          <Lbl>UPTIME / 90 DAYS</Lbl>
          <span className={s.uptime}>99.98%</span>
          <div className={s.seg}>{Array.from({ length: 30 }, (_, k) => <i key={k} style={{ background: k === 11 ? "#F4C542" : "#3DBE7D" }} />)}</div>
          <div className={s.mockFoot}><span>1 incident / 9 min</span><span>p95 210 ms</span></div>
        </div>
        <div className={s.sticky} style={{ left: "72%", top: "14%", transform: "rotate(-3deg)", background: "#BFF5CF" }}>Monitored since day one.</div>
      </>
    );
  if (i === 2)
    return (
      <>
        <div className={s.mock} style={{ left: "6%", top: "8%", width: "58%", background: "#E3F1FB", padding: 0, gap: 0 }}>
          <div className={s.mockHead} style={{ padding: "12px 16px", borderBottom: "2px solid #0E1013" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}><span className={s.avatar} style={{ background: "#85BFE9" }}>F</span>Finance agent <small style={{ fontWeight: 400, color: "#555" }}>/ today</small></span>
            <Lbl color="#1F7A4D">● WORKING</Lbl>
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div className={s.fin}><span>Invoices issued</span><b>37</b></div>
            <div className={s.fin}><span>Bank reconciled</span><b>✓ 212 / 212</b></div>
            <div className={s.fin}><span>Receivables chased</span><b>14</b></div>
            <div className={`${s.fin} ${s.finHot}`}><span>Needs your signature</span><b>2</b></div>
          </div>
          <div className={s.mockFoot} style={{ padding: "0 16px 12px" }}><span>QuickBooks / Pichincha / Gmail</span><span>Last run 09:40</span></div>
        </div>
        <div className={s.mock} style={{ right: "5%", top: "46%", width: "50%", boxShadow: "8px 8px 0 #85BFE9", padding: 16, gap: 12 }}>
          {[["09:41", "Approved the two receivables over $5k. Follow-ups sent to the rest."], ["09:38", "Invoice #1187 matched to a transfer of $2,350. Reconciled."], ["09:35", "Draft reminder for Clínica Norte (31 days). Waiting for your OK."]].map(([t, m]) => (
            <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#85BFE9", display: "block", marginTop: 6, flexShrink: 0 }} />
              <span style={{ fontSize: 14, lineHeight: 1.45 }}><small style={{ color: "#777", fontFamily: "var(--mono)", fontSize: 10.5, marginRight: 6 }}>{t}</small>{m}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8 }}><span className={s.pillTiny} style={{ background: "#0E1013", color: "#fff" }}>Approve</span><span className={s.pillTiny} style={{ border: "1.5px solid #0E1013" }}>Edit</span></div>
          <div className={s.reply}>Reply to Finance agent<span>→</span></div>
        </div>
      </>
    );
  return (
    <>
      <div className={s.mock} style={{ left: "5%", right: "5%", top: "6%", padding: 20, gap: 14 }}>
        <div className={s.mockLbl} style={{ display: "flex", justifyContent: "space-between" }}><span>ONE TEAM / ONE ROADMAP</span><span>WEEK 1 → 12</span></div>
        <div className={s.weeks}>{Array.from({ length: 12 }, (_, k) => <span key={k}>{k + 1}</span>)}</div>
        <div className={s.roadmap}>
          <span style={{ gridColumn: "1/4", background: "#C9C4F2" }}>Research <small>22 interviews</small></span>
          <span style={{ gridColumn: "3/8", background: "#BFF5CF" }}>Design + build <small>weekly demos</small></span>
          <span style={{ gridColumn: "7/11", background: "#85BFE9" }}>AI agents <small>in the clinic's tools</small></span>
          <span style={{ gridColumn: "10/13", background: "#0E1013", color: "#fff" }}>Launch <small style={{ color: "#AEB4BE" }}>+ support</small></span>
        </div>
        <div className={s.milestones}><span>◆ Problem statement</span><span>◆ Clickable prototype</span><span>◆ First claim filed by the agent</span><span>◆ Go-live</span></div>
        <div className={s.team}>
          {[["LC", "research", "#C9C4F2"], ["CP", "product", "#BFF5CF"], ["DM", "engineering", "#85BFE9"], ["AI", "agents", "#0E1013"]].map(([ini, role, bg]) => (
            <span key={ini}><i className={s.avatar} style={{ background: bg, color: bg === "#0E1013" ? "#fff" : "#0E1013" }}>{ini}</i>{role}</span>
          ))}
          <span style={{ marginLeft: "auto", color: "#555" }}>No hand-offs · one Slack channel</span>
        </div>
      </div>
      <div className={s.quote} style={{ position: "absolute", right: "6%", bottom: "5%", border: "2px solid #0E1013", maxWidth: 330 }}>
        “They sat in our clinic for two weeks before writing code.”
        <small>Operations lead, Helixona</small>
      </div>
    </>
  );
}

/* ------------------------------------------- services: CSS illustrations ---- */
function ArtDiscovery() {
  const doc = (l: string, t: string, w: number, h: number, delay: number, lines: number[]) => (
    <div className={s.doc} style={{ left: l, top: t, width: w, height: h, animationDelay: `${delay}s` }}>{lines.map((x, k) => <i key={k} style={{ width: `${x}%` }} />)}</div>
  );
  return (
    <div className={s.art} style={{ ["--gl" as string]: "#C9C4F2" }}>
      {doc("8%", "16%", 128, 136, 0, [82, 60, 74, 40])}
      {doc("36%", "40%", 136, 118, 1.2, [70, 88, 52])}
      <div className={s.note} style={{ left: "60%", top: "12%", transform: "rotate(5deg)", animationDelay: "0.6s" }}>“forty a week”</div>
      <div className={s.note} style={{ left: "70%", top: "58%", transform: "rotate(-4deg)", background: "#BFF5CF", animationDelay: "1.8s" }}>day 12 ↑</div>
      <div className={s.miniChart} style={{ left: "66%", top: "34%" }}><i style={{ height: "40%" }} /><i style={{ height: "65%" }} /><i style={{ height: "100%", background: "#0E1013" }} /><i style={{ height: "55%" }} /><i style={{ height: "30%" }} /></div>
      <div style={{ left: "30%", top: "76%", width: 22, height: 22, background: "#3DBE7D", clipPath: "polygon(0 0,100% 40%,45% 55%,30% 100%)", animation: "mtDrift 4s ease-in-out infinite" }} />
      <div style={{ left: "88%", top: "20%", width: 36, height: 36, background: "#C9C4F2", clipPath: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)", animation: "mtSpin 12s linear infinite" }} />
      <div style={{ left: "10%", top: "74%", width: 16, height: 16, border: "3px solid #0E1013", transform: "rotate(45deg)" }} />
      <div className={s.artLabel} style={{ left: "8%", bottom: "8%" }}>22 interviews · 5 clinics · 1 problem</div>
    </div>
  );
}
function ArtApps() {
  const node = (l: string, t: string, delay: number, title: string, lines: number[]) => (
    <div className={s.node} style={{ left: l, top: t, animationDelay: `${delay}s` }}><em>{title}</em>{lines.map((x, k) => <i key={k} style={{ width: `${x}%` }} />)}</div>
  );
  return (
    <div className={s.art} style={{ ["--gl" as string]: "#9FDDBB" }}>
      {node("6%", "18%", 0, "web / Next.js", [78, 50])}
      {node("38%", "48%", 1.5, "api / Node", [64, 82])}
      {node("70%", "14%", 0.8, "db / Postgres", [70, 44])}
      <div style={{ left: "calc(6% + 130px)", top: "calc(18% + 34px)", width: "calc(32% - 130px + 4px)", height: 3, background: "#0E1013" }} />
      <div style={{ left: "calc(38% + 60px)", top: "calc(18% + 34px)", width: 3, height: "calc(30% - 34px)", background: "#0E1013" }} />
      <div style={{ left: "calc(38% + 130px)", top: "calc(48% + 34px)", width: "calc(32% - 130px + 4px)", height: 3, background: "#0E1013" }} />
      <div style={{ left: "calc(70% + 60px)", top: "calc(14% + 70px)", width: 3, height: "calc(34% - 34px)", background: "#0E1013" }} />
      <div style={{ left: "calc(6% + 130px)", top: "calc(18% + 27px)", width: 16, height: 16, borderRadius: "50%", background: "#3DBE7D", animation: "mtFlowX 2.4s ease-in-out infinite" }} />
      <div className={s.badge} style={{ left: "8%", top: "62%" }}>✓ CI 42s</div>
      <div className={s.badge} style={{ left: "8%", top: "78%", animationDelay: "0.7s" }}>✓ 318 tests</div>
      <div className={s.badge} style={{ left: "72%", top: "70%", animationDelay: "1.3s" }}>uptime 99.98%</div>
      <div style={{ left: "60%", top: "8%", width: 44, height: 44, borderRadius: "50%", background: "#1F7A4D", animation: "mtPulse 3s ease-in-out infinite" }} />
      <div style={{ left: "88%", top: "56%", width: 50, height: 44, background: "#3DBE7D", clipPath: "polygon(50% 0,100% 100%,0 100%)", animation: "mtDrift 5s ease-in-out .8s infinite" }} />
      <div className={s.artLabel} style={{ right: "6%", bottom: "8%" }}>AWS · CI · tests · monitoring</div>
    </div>
  );
}
function ArtAI() {
  return (
    <div className={s.art} style={{ ["--gl" as string]: "#9CCBEF" }}>
      <div style={{ left: "38%", top: "50%", width: 64, height: 64, marginLeft: -32, marginTop: -32, background: "#85BFE9", clipPath: "polygon(50% 0,100% 50%,50% 100%,0 50%)", animation: "mtPulse 2.5s ease-in-out infinite" }} />
      {[[0, 14], [60, 18], [120, 22]].map(([rot, dur]) => (
        <div key={rot} className={s.ring} style={{ left: "38%", ["--rot" as string]: `${rot}deg`, animationName: "mtSpinFrom", animationDuration: `${dur}s` }} />
      ))}
      {[["CRM", "12%", "22%"], ["Email", "10%", "68%"], ["WhatsApp", "56%", "76%"], ["ERP", "58%", "16%"]].map(([n, l, t]) => (
        <div key={n} className={s.tool} style={{ left: l, top: t }}>{n}</div>
      ))}
      <div className={s.bubble} style={{ left: "58%", top: "34%" }}>
        <em>Support agent</em>
        Your order ships Tuesday. Want the tracking link?
        <small>escalates to a person if unsure</small>
      </div>
      <div style={{ left: "84%", top: "12%", width: 40, height: 34, background: "#1F3A8A", clipPath: "polygon(0 0,100% 50%,0 100%)", animation: "mtDrift 5s ease-in-out infinite" }} />
      <div style={{ left: "80%", top: "80%", width: 24, height: 24, background: "#1F3A8A", transform: "rotate(45deg)", animation: "mtFloat 4s ease-in-out 1s infinite" }} />
      <div style={{ left: "24%", top: "40%", width: 10, height: 10, borderRadius: "50%", background: "#0E1013" }} />
      <div className={s.artLabel} style={{ left: "8%", bottom: "8%" }}>one agent per role · human sign-off</div>
    </div>
  );
}

/* ------------------------------------------------------------------ page ---- */
export function StagingHome() {
  const { lang, setLang } = useLang();
  const t = T[lang as Lang];
  const [why, setWhy] = React.useState(0);
  const [proj, setProj] = React.useState(0);
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
            <Link href="/office-demo">{t.learn}</Link>
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
              <Link key={client} href="/work" className={`${s.item} ${proj === i ? s.itemOn : ""}`} onMouseEnter={() => setProj(i)} onFocus={() => setProj(i)}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span className={s.itemBody}><span className={s.itemClient}>{client}</span><span className={s.itemTitle}>{title}</span></span>
                <span>→</span>
              </Link>
            ))}
          </div>
          <div className={`${s.feature} ${s.grid}`} key={proj}>
            <div className={s.featureCircle} />
            <div className={s.featureFrame}>
              <span className={s.featureBar}><i /><i /><i /><em>{t.work[proj][0].split(" / ")[0].toLowerCase().replace(/\s+/g, "")}.com</em></span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={s.featureImg} src={FEAT_IMG[proj]} alt={t.work[proj][0]} width={1200} height={675} />
            </div>
            <span className={s.featureChip}>{t.feat[proj][0]}</span>
            <p className={s.featureText}>{t.feat[proj][1]}</p>
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
              <span style={{ color: "#555" }}>Quito, Ecuador</span>
            </div>
          </div>
          <div className={s.footerBottom}>
            <span>{t.rights}</span>
            <div>{t.legal.map((x) => <a key={x} href="#">{x}</a>)}</div>
          </div>
        </div>
      </footer>
      <span className={s.ribbon}>STAGING / {lang === "es" ? "VISTA PREVIA" : "PREVIEW"}</span>
    </div>
  );
}
