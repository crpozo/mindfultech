"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { SERVICES, SERVICES_ES } from "@/lib/site/serviceDetail";
import { Shell, CtaBand, PageHero, SectionHead, CONTACT } from "./Shell";
import s from "./site.module.css";

const TINT: Record<string, string> = { ux: "#EEEDFB", apps: "#E6F7EC", custom: "#F4F5F3", ai: "#E3F1FB" };
const ACCENT: Record<string, string> = { ux: "#C9C4F2", apps: "#3DBE7D", custom: "#0E1013", ai: "#85BFE9" };
const title = (t: string) => t.charAt(0) + t.slice(1).toLowerCase();

export function ServiceDetailPage({ slug }: { slug: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const d = (es ? SERVICES_ES : SERVICES)[slug];
  if (!d) return null;
  const tint = TINT[slug] ?? "#F4F5F3", accent = ACCENT[slug] ?? "#0E1013";
  return (
    <Shell active="services">
      <PageHero label={title(d.tag)} title={d.title} lead={d.subtitle} tint={tint}>
        <a href={`mailto:${CONTACT.email}`} className={`${s.btn} ${s.btnInk}`}>{es ? "Iniciar proyecto" : "Start a project"}</a>
        <Link href="/services" className={`${s.btn} ${s.btnOutline}`}>{es ? "Todos los servicios" : "All services"}</Link>
      </PageHero>

      {/* specs + hero image */}
      <section className={`${s.wrap} ${s.sectionFirst}`}>
        <div className={s.statRow} style={{ marginBottom: 12 }}>
          {d.specs.map(([k, v]) => (
            <div key={k} className={s.stat} style={{ background: "#fff", border: "1px solid var(--line)", minHeight: 120 }}>
              <small className={s.mono} style={{ color: "#555" }}>{k}</small>
              <span style={{ fontFamily: "var(--serif)", fontSize: 26, lineHeight: 1.05 }}>{v}</span>
            </div>
          ))}
        </div>
        <div className={s.photo} style={{ boxShadow: `12px 12px 0 ${accent}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/services/hero-${slug}.webp`} alt="" width={1600} height={610} style={{ aspectRatio: "21 / 8" }} />
        </div>
      </section>

      {/* why */}
      <section className={`${s.wrap} ${s.section}`}>
        <SectionHead title={es ? `Por qué MindfulTech para ${d.name}` : `Why MindfulTech for ${d.name}`} sub={es ? "Oficio de nivel industrial, hecho a la medida de tu producto." : "Industrial-grade craft, custom-built for your product."} />
        <div className={s.cards3}>
          {d.why.map((w, i) => (
            <div key={w.title} className={s.value} style={{ background: i === 0 ? "#0E1013" : i === 1 ? tint : "#fff", color: i === 0 ? "#fff" : "#0E1013", border: i === 2 ? "1px solid var(--line)" : undefined }}>
              <b>{w.title}</b>
              <p style={i === 0 ? { color: "#AEB4BE" } : undefined}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* highlight */}
      <section className={s.section}>
        <div className={s.darkBand}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <span className={s.label} style={{ color: "var(--lime)" }}>{es ? "Probado en producción" : "Proven in production"}</span>
            <h2>{d.highlight.title}</h2>
            <p>{d.highlight.desc}</p>
            {d.highlight.caseHref && <Link href={d.highlight.caseHref} className={`${s.btn} ${s.btnLime}`} style={{ alignSelf: "flex-start" }}>{es ? "Ver caso de estudio →" : "View case study →"}</Link>}
          </div>
          <div className={s.darkStat}><small>{d.highlight.label}</small><b>{d.highlight.stat}</b></div>
        </div>
      </section>

      {/* how we work */}
      <section className={`${s.wrap} ${s.section}`}>
        <SectionHead title={es ? "Cómo trabajamos" : "How we work"} sub={es ? "Un camino claro de la primera conversación a producción." : "A clear path from first conversation to production."} />
        <div className={s.steps}>
          {d.steps.map((st, i) => (
            <div key={st.title} className={s.step4} style={{ borderTopColor: i === d.steps.length - 1 ? accent : undefined }}>
              <small>{String(i + 1).padStart(2, "0")} / {String(d.steps.length).padStart(2, "0")}</small>
              <b>{st.title}</b>
              <p>{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* engagement */}
      <section className={`${s.wrap} ${s.section}`}>
        <div className={s.split} style={{ alignItems: "start" }}>
          <div className={s.caseText}>
            <h2 className={s.h2}>{es ? "Dos formas de trabajar juntos" : "Two ways to work together"}</h2>
            <p>{es ? "Empieza pequeño o ve de inicio a fin: ambas vienen con gente senior y reportes honestos." : "Start small or go end to end: both come with senior people and honest reporting."}</p>
          </div>
          <div className={s.cards2}>
            {d.engage.map((e, i) => (
              <div key={e.title} className={s.tile} style={{ background: i === 0 ? "#fff" : tint, border: i === 0 ? "1px solid var(--line)" : 0 }}>
                <span className={s.mono} style={{ color: "#555" }}>{e.forLabel}</span>
                <h3>{e.title}</h3>
                <div className={s.checks}>{e.bullets.map((b) => <span key={b}><i />{b}</span>)}</div>
                <a href={`mailto:${CONTACT.email}`} className={s.tileLink}>{es ? "Empezar →" : "Get started →"}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* included */}
      <section className={`${s.wrap} ${s.section}`}>
        <SectionHead title={es ? "Qué incluye" : "What's included"} sub={es ? "Todo se entrega con investigación, documentación y un equipo que responde." : "Everything ships with research, documentation, and a team that stays accountable."} />
        <div className={s.cards3}>
          {d.includes.map((it) => (
            <div key={it.title} className={s.tile} style={{ minHeight: 180 }}>
              <h3 style={{ fontSize: 28 }}>{it.title}</h3>
              <p>{it.desc}</p>
            </div>
          ))}
        </div>
        <div className={s.pills} style={{ marginTop: 28, alignItems: "center" }}>
          <span className={s.mono} style={{ border: 0, padding: "8px 0", color: "#555" }}>{es ? "Construimos con" : "We ship with"}</span>
          {d.tools.map((t) => <span key={t}>{t}</span>)}
        </div>
      </section>

      <div style={{ height: 140 }} />
      <CtaBand />
    </Shell>
  );
}
