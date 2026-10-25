"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import s from "./fauna.module.css";

/* Concept 03, "Fauna" (Oct 2026): warm, friendly and product-first, after faunarobotics.com.
   The AI Management Office is presented the way Fauna presents its robot: capable, safe, fun. */

const LOGOS: [string, string][] = [["USFQ", "/logo-usfq.svg"], ["ThemedMotion", "/portfolio/themedmotion-logo-m.webp"], ["Helixona", "/helixona-logo-m.webp"], ["Western Fence Supply", "/wfs-logo.svg"], ["PARC Home Care", "/parc-logo-m.webp"]];

function Shape({ kind, color }: { kind: "circle" | "arch" | "tri" | "square" | "half" | "ring"; color: string }) {
  const c = { background: color };
  if (kind === "circle") return <span className={s.shape}><i style={{ ...c, position: "absolute", inset: 0, borderRadius: "50%" }} /></span>;
  if (kind === "arch") return <span className={s.shape}><i style={{ ...c, position: "absolute", inset: 0, borderRadius: "50% 50% 0 0" }} /></span>;
  if (kind === "tri") return <span className={s.shape}><i style={{ ...c, position: "absolute", inset: 0, clipPath: "polygon(50% 0,100% 100%,0 100%)" }} /></span>;
  if (kind === "half") return <span className={s.shape}><i style={{ ...c, position: "absolute", inset: 0, borderRadius: "0 0 999px 999px" }} /><i style={{ position: "absolute", left: "35%", top: "-20%", width: "30%", height: "30%", borderRadius: "50%", background: "#c9b5e3" }} /></span>;
  if (kind === "ring") return <span className={s.shape}><i style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `14px solid ${color}`, boxSizing: "border-box" }} /></span>;
  return <span className={s.shape}><i style={{ ...c, position: "absolute", inset: 0, borderRadius: 14 }} /></span>;
}

export function Fauna() {
  const { lang, setLang } = useLang();
  const es = lang === "es";
  const aud: [string, string, "circle" | "arch" | "tri", string][] = es
    ? [["Para operaciones", "Un agente por rol dentro de tu CRM, correo y banco, con una persona firmando donde importa.", "circle", "#e4674a"], ["Para producto", "Investigación, diseño y desarrollo a medida: web, móvil y herramientas internas en AWS.", "arch", "#d4ab4a"], ["Para universidades", "Plataformas y agentes para admisiones, eventos y donaciones, como EventFlow y USFQ NEXT.", "tri", "#6f9fb8"]]
    : [["For operations", "One agent per role inside your CRM, inbox and bank, with a person signing off where it matters.", "circle", "#e4674a"], ["For product teams", "Research, design and custom development: web, mobile and internal tools on AWS.", "arch", "#d4ab4a"], ["For universities", "Platforms and agents for admissions, events and donations, like EventFlow and USFQ NEXT.", "tri", "#6f9fb8"]];
  const feats: [string, string, "square" | "half" | "ring" | "circle" | "arch", string][] = es
    ? [["Investigación antes del código", "Entrevistas de campo y prototipos probados con usuarios reales.", "half", "#e4674a"], ["Dentro de tus herramientas", "CRM, correo, banco, calendario, Odoo, eClinicalWorks.", "ring", "#d4ab4a"], ["Revisión humana", "Compuertas de aprobación donde importa el criterio.", "circle", "#7f9b7e"], ["Mantenido a largo plazo", "CI, pruebas, monitoreo y un equipo que responde.", "square", "#c9b5e3"], ["Listo en semanas", "Un agente en producción en seis semanas.", "arch", "#6f9fb8"]]
    : [["Research before code", "Field interviews and prototypes tested with real users.", "half", "#e4674a"], ["Inside your tools", "CRM, inbox, bank, calendar, Odoo, eClinicalWorks.", "ring", "#d4ab4a"], ["Human review", "Approval gates where judgment matters.", "circle", "#7f9b7e"], ["Maintained for the long run", "CI, tests, monitoring and a team that answers.", "square", "#c9b5e3"], ["Ready in weeks", "An agent in production in six weeks.", "arch", "#6f9fb8"]];
  const sectors: [string, string, string, string, boolean][] = es
    ? [["Salud", "Un agente lleva la facturación médica de Helixona: reclamos, codificación y seguimientos, 24/7, con la clínica firmando las excepciones.", "#6f9fb8", "/work#healthcare", false], ["Distribución", "Western Fence Supply pasó de Excel a Odoo, con asignación automática de leads y rutas de entrega multi-parada.", "#d4ab4a", "/work#fence", true], ["Educación", "EventFlow para la USFQ en el App Store, y USFQ NEXT con un agente que presenta el tablero de donaciones.", "#9c5a56", "/work#usfq", false], ["Entretenimiento y cuidado", "Un portafolio 3D para ThemedMotion y PARC Connect en las dos tiendas para una agencia de cuidado en casa.", "#7f9b7e", "/work#themedmotion", false]]
    : [["Healthcare", "An agent runs Helixona's medical billing: claims, coding and follow-ups, 24/7, with the clinic signing the exceptions.", "#6f9fb8", "/work#healthcare", false], ["Distribution", "Western Fence Supply moved from Excel to Odoo, with automatic lead routing and multi-stop delivery routes.", "#d4ab4a", "/work#fence", true], ["Education", "EventFlow for USFQ on the App Store, and USFQ NEXT with an agent presenting the donations dashboard.", "#9c5a56", "/work#usfq", false], ["Entertainment & care", "A 3D portfolio for ThemedMotion and PARC Connect in both stores for a home-care agency.", "#7f9b7e", "/work#themedmotion", false]];
  return (
    <div className={s.root}>
      <div className={s.nav}>
        <Link href="/" className={s.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} />
          <em>{es ? "Concepto 03 / Fauna" : "Concept 03 / Fauna"}</em>
        </Link>
        <div className={s.navRight}>
          <button type="button" className={lang === "en" ? s.on : ""} onClick={() => setLang("en")}>EN</button>
          <button type="button" className={lang === "es" ? s.on : ""} onClick={() => setLang("es")}>ES</button>
          <Link href="/concept" className={`${s.pill} ${s.pillSoft}`}>{es ? "Conceptos" : "Concepts"}</Link>
          <a href="mailto:info@mindfultech.ec" className={s.pill}>{es ? "Hablemos" : "Talk to us"}</a>
        </div>
      </div>

      <div className={s.wrap}>
        <section className={s.hero}>
          <h1 className={`${s.h1} ${s.center}`}>{es ? <>Capaz, seguro, amable.<br />Software con IA para todos.</> : <>Capable, safe, friendly.<br />AI software for everyone.</>}</h1>
          <div className={s.heroMedia}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/office-demo-preview.webp" alt="AI Management Office" width={2000} height={1125} />
            <span className={s.heroBadge}>{es ? "AI Management Office, en vivo" : "AI Management Office, live"}</span>
          </div>
          <div className={s.trusted}>
            <span>{es ? "Confían en nosotros" : "Trusted by"}</span>
            {LOGOS.map(([n, src]) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={n} src={src} alt={n} title={n} />
            ))}
            <b>CarCompraCorp</b>
          </div>
        </section>

        <section className={s.sec}>
          <h2 className={`${s.h2} ${s.center}`}>{es ? <>Crea nuevas formas de trabajar.<br />En producción hoy.</> : <>Create new ways of working.<br />Shipping today.</>}</h2>
          <div className={s.aud}>
            {aud.map(([t, d, k, c]) => <div key={t}><Shape kind={k} color={c} /><h3 className={s.h3}>{t}</h3><p>{d}</p></div>)}
          </div>
        </section>

        <section className={s.sec}>
          <h2 className={`${s.h2} ${s.center}`}>{es ? "Un laboratorio moderno para construir con IA" : "A modern lab for building with AI"}</h2>
          <div className={s.grid}>
            {feats.slice(0, 2).map(([t, d, k, c]) => <div key={t} className={s.card}><Shape kind={k} color={c} /><b>{t}</b><span>{d}</span></div>)}
            <div className={`${s.card} ${s.cardPhoto} ${s.cardTall}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/team.webp" alt="" width={1200} height={900} loading="lazy" />
              <i>{es ? "Equipo en Quito" : "Team in Quito"}</i>
            </div>
            {feats.slice(2).map(([t, d, k, c]) => <div key={t} className={s.card}><Shape kind={k} color={c} /><b>{t}</b><span>{d}</span></div>)}
            <div className={`${s.card} ${s.cardPhoto}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/helixona-hero.webp" alt="" width={1200} height={675} loading="lazy" />
              <i>{es ? "Helixona, agente en producción" : "Helixona, agent in production"}</i>
            </div>
          </div>
        </section>

        <section className={s.sec}>
          <div className={s.sectors}>
            {sectors.map(([t, d, c, href, circle]) => (
              <div key={t} className={`${s.sector} ${circle ? s.sectorCircle : ""}`} style={{ background: c }}><b>{t}</b><p>{d}</p><Link href={href} className={s.sectorLink}>{es ? "Ver el caso" : "See the case"}</Link></div>
            ))}
          </div>
        </section>

        <div className={s.band}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 className={s.h2}>{es ? "Construyendo un mundo donde los agentes trabajan donde trabaja la gente" : "Building a world where agents work everywhere people do"}</h2>
            <p>{es ? "Diseñado en Quito. Clientes en Ecuador, Estados Unidos y Europa." : "Designed in Quito. Clients in Ecuador, the United States and Europe."}</p>
            <Link href="/company" className={`${s.pill} ${s.pillSoft}`} style={{ alignSelf: "flex-start" }}>{es ? "Más sobre nosotros" : "More about us"}</Link>
          </div>
          <div className={s.stats}>
            <div><b>3,650+</b><span>{es ? "días lanzando productos" : "days shipping products"}</span></div>
            <div><b>24/7</b><span>{es ? "agente en facturación médica" : "agent on medical billing"}</span></div>
            <div><b>8</b><span>{es ? "países con clientes" : "countries with clients"}</span></div>
          </div>
        </div>

        <section className={s.demo}>
          <div className={s.demoMedia}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/office-demo-preview.webp" alt="" width={2000} height={1125} loading="lazy" />
          </div>
          <div className={s.demoText}>
            <h2 className={s.h2}>{es ? "Agentes reales, trabajo real" : "Real agents, real work"}</h2>
            <p>{es ? "Abre la oficina, mira qué hace cada agente, pregúntale y aprueba lo que necesite una persona. Un agente por rol, conectado a lo que ya usas." : "Open the office, watch what each agent does, ask it questions and approve whatever needs a person. One agent per role, connected to what you already use."}</p>
            <div className={s.roles}>{(es ? ["Ventas", "Soporte", "Finanzas", "Marketing", "Operaciones", "Recepción"] : ["Sales", "Support", "Finance", "Marketing", "Operations", "Reception"]).map((r) => <span key={r}>{r}</span>)}</div>
            <Link href="/office-demo" className={s.pill} style={{ alignSelf: "flex-start" }}>{es ? "Abrir la demo" : "Open the demo"}</Link>
          </div>
        </section>

        <section className={s.cta}>
          <h2 className={s.h2}>{es ? "Hazlo tuyo" : "Make it yours"}</h2>
          <small>{es ? "Investigación, diseño, desarrollo y agentes incluidos" : "Research, design, development and agents included"}</small>
          <a href="mailto:info@mindfultech.ec" className={s.pill}>{es ? "Empieza un proyecto" : "Start a project"}</a>
        </section>

        <footer className={s.foot}>
          <span>© 2026 MindfulTech · Quito, Ecuador</span>
          <span><a href="mailto:info@mindfultech.ec">info@mindfultech.ec</a> · <a href="https://wa.me/593958731994" target="_blank" rel="noreferrer">WhatsApp</a> · <Link href="/work">{es ? "Proyectos" : "Work"}</Link> · <Link href="/services">{es ? "Servicios" : "Services"}</Link></span>
        </footer>
      </div>
    </div>
  );
}
