"use client";

import * as React from "react";
import { useLang } from "@/components/i18n";
import { Shell, CtaBand, PageHero, SectionHead, CONTACT } from "./Shell";
import s from "./site.module.css";

export function CompanyPage() {
  const { lang } = useLang();
  const es = lang === "es";
  const values: [string, string, string][] = es
    ? [
        ["#C9C4F2", "Las personas primero", "Cada proyecto empieza con los humanos que usarán el producto, no con el stack tecnológico."],
        ["#BFF5CF", "Oficio sobre volumen", "Un equipo senior pequeño que entrega menos cosas, mejor hechas, y responde después del launch."],
        ["#85BFE9", "IA con criterio", "Automatizamos lo repetitivo y dejamos a humanos todo lo que requiere cuidado."],
      ]
    : [
        ["#C9C4F2", "People first", "Every engagement starts with the humans who will use the product, not the tech stack."],
        ["#BFF5CF", "Craft over volume", "A small senior team that ships fewer, better things, and stays accountable after launch."],
        ["#85BFE9", "AI with judgment", "We automate the repetitive and keep humans on everything that requires care."],
      ];
  const years: [string, string][] = es
    ? [["2016", "Nace MindfulTech en Quito: diseño UX e ingeniería para equipos de Ecuador."], ["2019", "Primeros clientes en Estados Unidos y Europa; apps en las dos tiendas."], ["2023", "IA aplicada entra al laboratorio: asistentes con grounding y automatización de flujos."], ["2026", "Lanzamos el AI Management Office: una oficina donde cada empleado es un agente de IA."]]
    : [["2016", "MindfulTech starts in Quito: UX design and engineering for teams in Ecuador."], ["2019", "First clients in the United States and Europe; apps in both stores."], ["2023", "Applied AI joins the lab: grounded assistants and workflow automation."], ["2026", "We launch the AI Management Office: an office where every employee is an AI agent."]];
  return (
    <Shell active="company">
      <PageHero
        label={es ? "Empresa" : "Company"}
        title={es ? "Un laboratorio de software enfocado en personas" : "A software lab focused on people"}
        lead={es ? "Desde 2016 diseñamos y construimos productos digitales desde Quito para equipos de Ecuador y más allá, con investigación, oficio y ahora IA aplicada en el centro." : "Since 2016 we've designed and engineered digital products from Quito for teams across Ecuador and beyond, with research, craft, and now applied AI at the core."}
      />

      <section id="about" className={`${s.wrap} ${s.sectionFirst}`} style={{ scrollMarginTop: 110 }}>
        <div className={s.statRow}>
          <div className={s.stat} style={{ background: "#0E1013", color: "#BFF5CF" }}><b>3,650+</b><span style={{ color: "#fff" }}>{es ? "días lanzando productos" : "days shipping products"}</span></div>
          <div className={s.stat} style={{ background: "#BFF5CF" }}><b>48</b><span>{es ? "productos en producción" : "products in production"}</span></div>
          <div className={s.stat} style={{ background: "#C9C4F2" }}><b>3</b><span>{es ? "continentes con clientes" : "continents with clients"}</span></div>
          <div className={s.stat} style={{ background: "#fff", border: "1px solid var(--line)" }}><b>1</b><span>{es ? "equipo, de la investigación al agente en producción" : "team, from research to the agent in production"}</span></div>
        </div>
      </section>

      <section className={`${s.wrap} ${s.section}`}>
        <SectionHead title={es ? "Lo que nos guía" : "What guides us"} />
        <div className={s.values}>
          {values.map(([bg, title, body]) => (
            <div key={title} className={s.value} style={{ background: bg }}><b>{title}</b><p>{body}</p></div>
          ))}
        </div>
      </section>

      <section className={`${s.wrap} ${s.section}`}>
        <SectionHead title={es ? "Diez años en cuatro líneas" : "Ten years in four lines"} />
        <div className={s.timeline}>
          {years.map(([y, t]) => <div key={y} className={s.year}><b>{y}</b><span>{t}</span></div>)}
        </div>
      </section>

      <section id="careers" className={`${s.wrap} ${s.section}`} style={{ scrollMarginTop: 110 }}>
        <div className={s.split}>
          <div className={s.caseText}>
            <span className={s.label}>{es ? "Carreras" : "Careers"}</span>
            <h2 className={s.h2}>{es ? "Únete a la misión" : "Join our mission"}</h2>
            <p>{es ? "Contratamos diseñadores e ingenieros que se preocupan por las personas. No hay vacantes abiertas ahora, pero siempre leemos portafolios de gente que construye con intención." : "We hire designers and engineers who care about people. No open reqs right now, but we always read portfolios from folks who build with intention."}</p>
            <a href={`mailto:${CONTACT.email}?subject=Portfolio`} className={`${s.btn} ${s.btnInk}`} style={{ alignSelf: "flex-start" }}>{es ? "Envía tu portafolio" : "Send your portfolio"}</a>
          </div>
          <div className={s.photo} style={{ boxShadow: "12px 12px 0 #BFF5CF" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/team.webp" alt="" width={1200} height={900} loading="lazy" />
          </div>
        </div>
      </section>

      <section id="press" className={s.section} style={{ scrollMarginTop: 110 }}>
        <div className={s.darkBand}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <span className={s.label} style={{ color: "var(--lime)" }}>{es ? "Prensa" : "Press"}</span>
            <h2>{es ? "MindfulTech en los medios" : "MindfulTech in the news"}</h2>
            <p>{es ? "Para entrevistas, charlas o material de marca, escribe a nuestro estudio: respondemos en un día hábil." : "For interviews, speaking, or brand assets, write to our studio. We answer within one business day."}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {([[es ? "Prensa" : "Press", CONTACT.email, `mailto:${CONTACT.email}?subject=Press`], [es ? "Teléfono" : "Phone", CONTACT.phone, CONTACT.tel], [es ? "Estudio" : "Studio", "Quito, Ecuador", ""]] as [string, string, string][]).map(([k, v, href]) => {
              const inner = <><span className={s.mono} style={{ color: "#aeb4be" }}>{k}</span><span style={{ fontSize: 17, fontWeight: 500 }}>{v}</span></>;
              const st: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "16px 18px", background: "#1c2028", border: "1px solid #2a2f37", color: "#fff" };
              return href ? <a key={k} href={href} style={st}>{inner}</a> : <div key={k} style={st}>{inner}</div>;
            })}
          </div>
        </div>
      </section>

      <div style={{ height: 140 }} />
      <CtaBand />
    </Shell>
  );
}
