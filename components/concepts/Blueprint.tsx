"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import s from "./blueprint.module.css";

/* Concept 02, "Blueprint" (Oct 2026): a technical-editorial take after heronaiapp.com.
   Warm paper, rulers and crosshairs, condensed uppercase display, mono labels, one accent,
   line drawings of the AI Management Office. All copy is MindfulTech's real content. */

type Lang = "en" | "es";
const LOGOS: [string, string][] = [["USFQ", "/logo-usfq.svg"], ["ThemedMotion", "/portfolio/themedmotion-logo-m.webp"], ["Helixona", "/helixona-logo-m.webp"], ["Western Fence Supply", "/wfs-logo.svg"], ["PARC Home Care", "/parc-logo-m.webp"]];
const BOOT = {
  en: ["INITIALIZE RESEARCH", "LOAD 22 FIELD INTERVIEWS", "MAP THE JOURNEY", "PROTOTYPE WITH USERS", "WIRE CI, TESTS, MONITORING", "DEPLOY TO AWS", "CONNECT CRM / INBOX / BANK", "HIRE ONE AGENT PER ROLE", "ADD HUMAN SIGN-OFF", "OPEN THE OFFICE"],
  es: ["INICIAR INVESTIGACIÓN", "CARGAR 22 ENTREVISTAS", "MAPEAR EL RECORRIDO", "PROTOTIPAR CON USUARIOS", "CONECTAR CI, PRUEBAS, MONITOREO", "DESPLEGAR EN AWS", "CONECTAR CRM / CORREO / BANCO", "CONTRATAR UN AGENTE POR ROL", "AÑADIR FIRMA HUMANA", "ABRIR LA OFICINA"],
};

/* isometric line drawing of the office: the same desk layout the Dots use, drawn as a plan */
const DESKS: [string, number, number][] = [["SALES", 330, 255], ["SUPPORT", 420, 210], ["FINANCE", 560, 300], ["MARKETING", 480, 165], ["OPERATIONS", 640, 250], ["RECEPTION", 500, 360]];
function OfficeDrawing({ highlight, labels = true }: { highlight?: number; labels?: boolean }) {
  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" className={s.drawing} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.9">
        <path d="M500 95 905 300 500 505 95 300Z" />
        <path d="M95 300 500 95 500 20 95 225Z" /><path d="M905 300 500 95 500 20 905 225Z" />
        <g strokeDasharray="3 5" opacity="0.6"><path d="M297 197 702 402M702 197 297 402M399 146 804 351M601 146 196 351M196 249 601 454M804 249 399 454" /></g>
        {DESKS.map(([n, x, y], i) => (
          <g key={n} strokeWidth={highlight === i ? 2 : 1} stroke={highlight === i ? "var(--acc)" : "currentColor"}>
            <path d={`M${x - 42} ${y} ${x} ${y + 21} ${x} ${y + 40} ${x - 42} ${y + 19}Z`} />
            <path d={`M${x} ${y + 21} ${x + 42} ${y} ${x + 42} ${y + 19} ${x} ${y + 40}Z`} />
            <path d={`M${x - 42} ${y} ${x} ${y - 21} ${x + 42} ${y} ${x} ${y + 21}Z`} fill={highlight === i ? "rgba(61,190,125,0.18)" : "none"} />
            <path d={`M${x - 10} ${y - 14} ${x + 10} ${y - 24} ${x + 10} ${y - 6} ${x - 10} ${y + 4}Z`} />
          </g>
        ))}
        <circle cx="470" cy="80" r="18" /><path d="M470 80V70M470 80h8" />
        <path d="M250 130h70v90h-70z" transform="skewY(-26.6)" /><path d="M620 60h90v70h-90z" transform="skewY(26.6)" />
        <path d="M60 300h870" strokeDasharray="2 6" opacity="0.5" />
      </g>
      {labels && DESKS.map(([n, x, y]) => <text key={n} x={x} y={y + 58} textAnchor="middle">{n}</text>)}
      <text x="60" y="560">PLAN 01 / AI MANAGEMENT OFFICE / 6 DESKS / 1:100</text>
      <text x="940" y="560" textAnchor="end">QUITO / 00°10′S 78°28′W</text>
    </svg>
  );
}

export function Blueprint() {
  const { lang, setLang } = useLang();
  const es = lang === "es";
  const L = lang as Lang;
  const [booting, setBooting] = React.useState(true);
  const [pct, setPct] = React.useState(0);
  const [coords, setCoords] = React.useState("X:0000 Y:0000");
  const [step, setStep] = React.useState(0);
  const stepRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    let p = 0; const id = window.setInterval(() => { p = Math.min(100, p + 2 + Math.random() * 4); setPct(Math.round(p)); if (p >= 100) { window.clearInterval(id); window.setTimeout(() => setBooting(false), 350); } }, 70);
    return () => window.clearInterval(id);
  }, []);
  React.useEffect(() => {
    const onMove = (e: PointerEvent) => setCoords(`X:${String(Math.round(e.clientX)).padStart(4, "0")} Y:${String(Math.round(e.clientY)).padStart(4, "0")}`);
    window.addEventListener("pointermove", onMove, { passive: true });
    const onScroll = () => { const line = window.innerHeight * 0.55; let k = 0; stepRefs.current.forEach((el, i) => { if (el && el.getBoundingClientRect().top <= line) k = i; }); setStep(k); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("scroll", onScroll); };
  }, []);

  const problems: [string, string, string][] = es
    ? [["Manual", "Cada cambio depende de una persona", "Facturas, reclamos, seguimientos y reportes se hacen a mano, uno por uno, aunque se hayan hecho cien veces."], ["Desconectado", "La IA vive fuera de tus herramientas", "Un chat genérico no ve tu CRM ni tu banco, así que copias, pegas y vuelves a explicar el contexto."], ["A ciegas", "Nadie vigila los problemas", "Un reclamo rechazado, un lead frío o una factura sin pagar esperan a que alguien los note."], ["Lento", "Las tareas pequeñas se comen la semana", "El trabajo repetitivo que llena tus días es exactamente el que el software debería hacer por ti."]]
    : [["Manual", "Every change is on a person", "Invoices, claims, follow-ups and reports are done by hand, one at a time, even the ones done a hundred times before."], ["Disjointed", "AI help sits outside your tools", "A generic chat can't see your CRM or your bank, so you keep copying, pasting and re-explaining the context."], ["Blind", "Nothing watches for problems", "A rejected claim, a cold lead or an unpaid invoice waits until someone happens to notice."], ["Slow", "Small tasks pile up into lost weeks", "The repetitive work that fills your days is exactly the work software should be doing for you."]];
  const steps: [string, string, string][] = es
    ? [["Introducción", "Los equipos pasan horas en facturación, seguimiento y reportes, trabajo que los aleja de lo que de verdad importa.", "Baja para continuar"], ["", "La mayoría es repetitivo y basado en reglas: el tipo de tarea que no debería necesitar a una persona cada vez.", "Baja para continuar"], ["", "MindfulTech lo investiga primero, lo construye sobre tus herramientas y pone un agente por rol, con una persona firmando solo donde importa.", "Baja para continuar"], ["Hallazgo", "En Helixona, un agente procesa reclamos en eClinicalWorks y navega los envíos a Blue Shield las 24 horas. La clínica firma dos excepciones al día.", "Caso real"]]
    : [["Introduction", "Teams spend hours on billing, follow-ups and reporting, work that pulls focus away from what actually matters.", "Scroll to continue"], ["", "Most of it is repetitive and rule-based: the kind of task that shouldn't need a person doing it by hand every time.", "Scroll to continue"], ["", "MindfulTech researches it first, builds on your tools and puts one agent per role, with a person signing off only where it matters.", "Scroll to continue"], ["Finding", "At Helixona an agent processes claims in eClinicalWorks and navigates Blue Shield submissions around the clock. The clinic signs two exceptions a day.", "Real case"]];
  const findings: [string, string][] = es
    ? [["Entrevista 14 / clínica", "“Imprimo el reclamo, lo anoto en un cuaderno y lo vuelvo a escribir el viernes.”"], ["Mapa de recorrido / día 12", "Pico de fricción: reclamos rechazados. Nadie es dueño de la pila."], ["Diseño / regla", "Un agente por rol. Compuerta de revisión humana donde importa el criterio."], ["Producción / 24/7", "Reclamos, codificación y seguimientos resueltos dentro de las herramientas de la clínica."]]
    : [["Interview 14 / clinic", "“I print the claim, mark it in a notebook and re-type it on Friday.”"], ["Journey map / day 12", "Peak friction: rejected claims. Nobody owns the pile."], ["Design / rule", "One agent per role. A human review gate where judgment matters."], ["Production / 24/7", "Claims, coding and follow-ups handled inside the clinic's tools."]];
  const verbs: [string, string, string][] = es
    ? [["01", "Investigar", "Entrevistas de campo, mapas de recorrido y prototipos probados con usuarios reales antes de una línea de código."], ["02", "Construir", "Web, móvil y software a medida en AWS, con CI, pruebas y monitoreo desde el primer sprint."], ["03", "Automatizar", "Un agente por rol dentro de las herramientas que ya usas: CRM, correo, banco, calendario."], ["04", "Operar", "Mantenemos lo que construimos: evals, guardrails y un equipo que responde después del launch."]]
    : [["01", "Research", "Field interviews, journey maps and prototypes tested with real users before a line of code."], ["02", "Build", "Web, mobile and custom software on AWS, with CI, tests and monitoring from the first sprint."], ["03", "Automate", "One agent per role inside the tools you already use: CRM, inbox, bank, calendar."], ["04", "Operate", "We maintain what we build: evals, guardrails and a team that answers after launch."]];
  const cases: [string, string, string][] = es
    ? [["Salud", "Helixona", "/work#healthcare"], ["Educación", "USFQ", "/work#usfq"], ["Distribución", "Western Fence Supply", "/work#fence"], ["Automotriz", "CarCompra", "/work#carcompra-crm"], ["Cuidado en casa", "PARC", "/work#parc"], ["Entretenimiento", "ThemedMotion", "/work#themedmotion"], ["Universidades", "USFQ NEXT", "/office-usfq"], ["Agencias", "The Internet Coaches", "/work"]]
    : [["Healthcare", "Helixona", "/work#healthcare"], ["Education", "USFQ", "/work#usfq"], ["Distribution", "Western Fence Supply", "/work#fence"], ["Automotive", "CarCompra", "/work#carcompra-crm"], ["Home care", "PARC", "/work#parc"], ["Entertainment", "ThemedMotion", "/work#themedmotion"], ["Universities", "USFQ NEXT", "/office-usfq"], ["Agencies", "The Internet Coaches", "/work"]];
  const marq = es ? ["Menos trabajo manual", "Menos errores", "Más tiempo para el producto", "Una persona firma donde importa"] : ["Less busywork", "Fewer mistakes", "More time for the product", "A person signs off where it matters"];
  const lit = Math.min(BOOT[L].length, Math.ceil((pct / 100) * BOOT[L].length));

  return (
    <div className={s.root}>
      {/* preloader */}
      <div className={`${s.boot} ${booting ? "" : s.bootOff}`} aria-hidden={!booting}>
        <div className={s.bootTop}>
          <div className={s.bootTitle}>{es ? <>Software con IA,<br />construido desde la investigación,<br />desde Quito</> : <>AI software,<br />built from research,<br />from Quito</>}</div>
          <span className={s.bootPct}>{pct}%</span>
        </div>
        <div>
          <div className={s.bootBar}><i style={{ width: `${pct}%` }} /></div>
          <div className={s.bootGrid}>
            <div className={s.ficha}>
              <b>{es ? "Bienvenido a" : "Welcome to"}</b><span /> <span style={{ color: "var(--ink)" }}>MindfulTech</span>
              <b>{es ? "Tipo" : "Type"}</b><span>:</span><span>{es ? "Laboratorio de software full-stack e IA" : "Full-stack software & AI lab"}</span>
              <b>{es ? "Fundado" : "Founded"}</b><span>:</span><span>2016</span>
              <b>{es ? "Foco" : "Focus"}</b><span>:</span><span>{es ? "Investigación UX, ingeniería y agentes de IA (AI Management Office)" : "UX research, engineering and AI agents (AI Management Office)"}</span>
              <b>{es ? "Ubicación" : "Location"}</b><span>:</span><span>Quito, Ecuador / {es ? "clientes en EE. UU. y Europa" : "clients in the US and Europe"}</span>
            </div>
            <div className={s.bootLines}>
              {BOOT[L].map((l, i) => <span key={l} className={i < lit ? "on" : ""}><em>{String(i + 1).padStart(3, "0")}</em>{l}</span>)}
            </div>
          </div>
        </div>
        <button type="button" className={s.bootSkip} onClick={() => setBooting(false)}>{es ? "Saltar →" : "Skip →"}</button>
      </div>

      <span className={s.coords}>{coords}</span>

      {/* nav */}
      <div className={s.nav}>
        <div className={s.navIn}>
          <Link href="/" className={s.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} />
            <em>{es ? "Concepto 02 / Blueprint" : "Concept 02 / Blueprint"}</em>
          </Link>
          <div className={s.navLinks}>
            <Link href="/services">{es ? "Servicios" : "Services"}</Link><Link href="/work">{es ? "Proyectos" : "Work"}</Link><Link href="/office-demo">AI Office</Link><Link href="/company">{es ? "Empresa" : "Company"}</Link><Link href="/concepts">{es ? "Concepto 01 →" : "Concept 01 →"}</Link>
          </div>
          <div className={s.navRight}>
            <button type="button" className={lang === "en" ? s.on : ""} onClick={() => setLang("en")}>EN</button>
            <button type="button" className={lang === "es" ? s.on : ""} onClick={() => setLang("es")}>ES</button>
            <a href="mailto:info@mindfultech.ec" className={s.navCta}>{es ? "Contacto" : "Contact us"}</a>
          </div>
        </div>
      </div>

      <div className={s.frame}>
        <span className={`${s.ruler} ${s.rulerL}`} /><span className={`${s.ruler} ${s.rulerR}`} />

        {/* hero */}
        <section className={`${s.hero} ${s.cross}`}>
          <div className={s.heroL}>
            <div>
              <span className={s.mono} style={{ color: "var(--acc)" }}>{es ? "Laboratorio de software e IA / Quito" : "Software & AI lab / Quito"}</span>
              <h1 className={s.h1} style={{ marginTop: 18 }}>{es ? <>Pon software<br />con IA a trabajar<br /><em>para tu negocio</em></> : <>Put AI software<br />to work<br /><em>for your business</em></>}</h1>
            </div>
            <div className={s.heroFoot}>
              <p className={s.lead}>{es ? "Investigación UX, ingeniería e IA aplicada en un solo laboratorio: del descubrimiento al agente corriendo en producción." : "UX research, engineering and applied AI in one lab: from discovery to the agent running in production."}</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href="#intro" className={s.btn}>{es ? "Descubrir más ↓" : "Discover more ↓"}</a>
                <Link href="/office-demo" className={`${s.btn} ${s.btnGhost}`}>{es ? "Ver el AI Office" : "See the AI Office"}</Link>
              </div>
            </div>
          </div>
          <div className={s.heroR}>
            <OfficeDrawing />
            <div className={`${s.heroMeta} ${s.mono}`}><span>{es ? "Fig. 01 / planta de la oficina de agentes" : "Fig. 01 / plan of the agent office"}</span><span>{es ? "6 escritorios / 1 persona firma" : "6 desks / 1 person signs"}</span></div>
          </div>
        </section>

        {/* marquee */}
        <div className={s.marq}>
          <div className={s.marqTrack}>
            {[0, 1].map((k) => (
              <div key={k} className={s.marqGroup} aria-hidden={k === 1}>{marq.map((m) => <span key={m}><i>/ </i>{m}</span>)}</div>
            ))}
          </div>
        </div>

        {/* clients */}
        <div className={s.strip}>{es ? "Confían en nosotros / trabajamos dentro de las herramientas que ya usas: CRM, correo, banco, calendario, eClinicalWorks, Odoo." : "Trusted by / we work inside the tools you already use: CRM, inbox, bank, calendar, eClinicalWorks, Odoo."}</div>
        <div className={s.clients}>
          {LOGOS.map(([n, src]) => (
            // eslint-disable-next-line @next/next/no-img-element
            <div key={n}><img src={src} alt={n} title={n} /></div>
          ))}
          <div><b>CarCompraCorp</b></div>
        </div>

        {/* problems */}
        <section className={`${s.sec} ${s.cross}`}>
          <div className={s.secHead}>
            <span className={s.mono}>{es ? "Problemas" : "Problems"}</span>
            <div>
              <h2 className={s.h2}>{es ? "Tu software hace lo que le dices. Nada más." : "Your software does what you tell it. Nothing more."}</h2>
              <p className={s.sub}>{es ? "Las herramientas son potentes pero pasivas: esperan cada instrucción, no avisan y no actúan solas, así que todo el trabajo repetitivo sigue sobre tu equipo." : "Tools are powerful but passive: they wait for every instruction, give no advice and can't act on their own, so all the repetitive work stays on your team."}</p>
            </div>
          </div>
          <div className={s.problems}>
            {problems.map(([tag, h, p], i) => (
              <div key={tag} className={s.problem}><span className={s.tag}>{tag}</span><span className={s.num}>[0{i + 1}]</span><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </section>

        {/* pinned intro */}
        <section id="intro" className={s.pin}>
          <div className={s.pinL} style={{ color: "var(--ink)" }}>
            <OfficeDrawing highlight={step === 3 ? 2 : step === 2 ? 1 : undefined} />
            {findings.map(([b, t], i) => (
              <div key={b} className={`${s.finding} ${step === i ? "" : s.findingOff}`} style={{ left: `${12 + i * 6}%`, top: `${18 + i * 14}%` }}><b>{b}</b>{t}</div>
            ))}
          </div>
          <div className={s.pinR}>
            {steps.map(([k, p, hint], i) => (
              <div key={i} className={s.pinStep} ref={(el) => { stepRefs.current[i] = el; }}>
                {k && <span className={s.mono}>{k}</span>}
                <p>{p}</p>
                <small>[{hint}]</small>
              </div>
            ))}
          </div>
        </section>

        {/* products */}
        <section className={`${s.sec} ${s.cross}`}>
          <div className={s.secHead}>
            <span className={s.mono}>{es ? "Tu operación. Tus herramientas. Conectadas." : "Your operation. Your tools. Connected."}</span>
            <div>
              <h2 className={s.h2}>{es ? "Un agente por rol, dentro de lo que ya usas" : "One agent per role, inside what you already use"}</h2>
              <p className={s.sub}>{es ? "El AI Management Office es nuestro producto: abres la oficina, ves qué hace cada agente, le preguntas y apruebas lo que necesite una persona. Y si lo que necesitas es software a medida, lo construye el mismo laboratorio." : "The AI Management Office is our product: you open the office, watch what each agent is doing, ask it questions and sign off on whatever needs a person. And if what you need is custom software, the same lab builds it."}</p>
              <div className={s.bullets} style={{ marginTop: 22 }}>
                {(es ? ["Ventas, Soporte, Finanzas, Marketing, Operaciones, Recepción", "Lee tu CRM, tu correo y tu banco con sus propias credenciales", "Cada acción queda registrada y auditable", "Una persona aprueba solo donde importa"] : ["Sales, Support, Finance, Marketing, Operations, Reception", "Reads your CRM, inbox and bank with its own credentials", "Every action is logged and auditable", "A person approves only where it matters"]).map((b, i) => <span key={b}><i>0{i + 1}</i>{b}</span>)}
              </div>
            </div>
          </div>
          <div className={s.products}>
            <div className={s.product}>
              <span className={s.num}>[01]</span>
              <h3>AI Management Office</h3>
              <p>{es ? "Una oficina 3D donde cada empleado es un agente de IA. Pantallas en vivo, chat con cada agente, dashboards por área y una cola de aprobaciones." : "A 3D office where every employee is an AI agent. Live screens, chat with each agent, dashboards per area and an approval queue."}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/office-demo-preview.webp" alt="AI Management Office" width={2000} height={1125} loading="lazy" />
              <Link href="/office-demo" className={s.btn}>{es ? "Abrir la demo" : "Open the demo"}</Link>
            </div>
            <div className={s.product}>
              <span className={s.num}>[02]</span>
              <h3>{es ? "Software a medida y apps" : "Custom software & apps"}</h3>
              <p>{es ? "Plataformas web y móviles, herramientas internas e integraciones con tus sistemas, mantenidas a largo plazo. Del CRM en Odoo de Western Fence Supply a EventFlow en el App Store." : "Web and mobile platforms, internal tools and integrations with your systems, maintained for the long run. From Western Fence Supply's Odoo CRM to EventFlow on the App Store."}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/wfs-hero.webp" alt="Western Fence Supply" width={1200} height={675} loading="lazy" />
              <Link href="/services" className={s.btn}>{es ? "Ver servicios" : "See services"}</Link>
            </div>
          </div>
        </section>

        {/* why */}
        <section className={`${s.sec} ${s.cross}`}>
          <div className={s.secHead}>
            <span className={s.mono}>{es ? "Por qué nosotros" : "Why us"}</span>
            <div>
              <h2 className={s.h2}>{es ? "Hecho para trabajar como trabajas tú" : "Built to work the way you do"}</h2>
              <p className={s.sub}>{es ? "Nos sentamos con tu equipo antes de escribir código, construimos sobre lo que ya usas y seguimos respondiendo después del launch." : "We sit with your team before writing code, build on what you already use and keep answering after launch."}</p>
            </div>
          </div>
          <div className={s.verbs}>
            {verbs.map(([n, v, d]) => <div key={v} className={s.verb}><i>{n}</i><b>{v}</b><span>{d}</span></div>)}
          </div>
        </section>

        {/* use cases */}
        <section className={`${s.sec} ${s.cross}`}>
          <div className={s.secHead}>
            <span className={s.mono}>{es ? "Casos de uso" : "Use cases"}</span>
            <h2 className={s.h2}>{es ? "Hecho para la gente que opera" : "Made for the people who run the operation"}</h2>
          </div>
          <div className={s.cases}>
            {cases.map(([sector, client, href]) => <Link key={sector} href={href}><span>{sector}</span><small>{client}</small></Link>)}
          </div>
        </section>

        {/* cta */}
        <section className={`${s.cta} ${s.cross}`}>
          <span className={s.mono} style={{ color: "var(--acc)" }}>{es ? "Siguiente paso" : "Next step"}</span>
          <h2 className={s.h2}>{es ? "Míralo trabajando sobre tu propio proceso" : "See it working on your own process"}</h2>
          <p>{es ? "Agenda una demo y te mostramos un agente corriendo sobre uno de tus flujos reales, no sobre un ejemplo." : "Book a demo and we'll show an agent running on one of your real workflows, not an example."}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="mailto:info@mindfultech.ec" className={s.btn}>{es ? "Escríbenos" : "Contact us"}</a>
            <a href="https://wa.me/593958731994" target="_blank" rel="noreferrer" className={`${s.btn} ${s.btnGhost}`}>WhatsApp</a>
          </div>
        </section>

        {/* footer */}
        <footer>
          <div className={s.foot}>
            <div><span className={s.mono}>{es ? "Empresa" : "Company"}</span><Link href="/company">{es ? "Nosotros" : "About us"}</Link><Link href="/blog">Blog</Link><Link href="/company#careers">{es ? "Carreras" : "Careers"}</Link></div>
            <div><span className={s.mono}>{es ? "Producto" : "Product"}</span><Link href="/office-demo">AI Management Office</Link><Link href="/office-usfq">USFQ NEXT</Link><Link href="/services">{es ? "Servicios" : "Services"}</Link></div>
            <div><span className={s.mono}>{es ? "Proyectos" : "Work"}</span><Link href="/work#healthcare">Helixona</Link><Link href="/work#usfq">USFQ EventFlow</Link><Link href="/work#fence">Western Fence Supply</Link></div>
            <div><span className={s.mono}>{es ? "Dirección" : "Address"}</span>Quito, Ecuador<br />{es ? "Clientes en EE. UU. y Europa" : "Clients in the US and Europe"}</div>
            <div><span className={s.mono}>{es ? "Contacto" : "Contact"}</span><a href="mailto:info@mindfultech.ec">info@mindfultech.ec</a><a href="tel:+593958731994">+593 958 73 1994</a><a href="https://wa.me/593958731994" target="_blank" rel="noreferrer">WhatsApp</a></div>
          </div>
          <div className={s.footBottom}><span>© 2026 MindfulTech. {es ? "Todos los derechos reservados." : "All rights reserved."}</span><span>{es ? "Concepto 02 / Blueprint" : "Concept 02 / Blueprint"}</span></div>
        </footer>
      </div>
    </div>
  );
}
