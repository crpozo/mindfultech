"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { SERVICE_CARDS } from "@/lib/site/services";
import { Shell, CtaBand, PageHero, SectionHead, CONTACT } from "./Shell";
import s from "./site.module.css";

const TINTS = [
  { tint: "#EEEDFB", hot: "#BDB5FA" },
  { tint: "#E6F7EC", hot: "#8EF2B4" },
  { tint: "#E3F1FB", hot: "#8ED0FF" },
  { tint: "#F4F5F3", hot: "#E3E6E1" },
  { tint: "#FBEDED", hot: "#F5B5B5" },
];

export function ServicesPage() {
  const { lang } = useLang();
  const es = lang === "es";
  const why: [string, string, string][] = es
    ? [
        ["#0E1013", "Entrega e iteración más rápidas", "Design systems reutilizables e ingeniería asistida por IA acortan el tiempo de construcción, sin recortar calidad."],
        ["#BFF5CF", "Alcance y presupuesto predecibles", "Investigar antes de construir significa menos sorpresas. Hitos fijos, reportes transparentes, sin desvíos."],
        ["#C9C4F2", "Confiabilidad y seguridad de producción", "Arquitecturas AWS con observabilidad, respaldos y cifrado en tránsito y reposo, desde el día uno."],
      ]
    : [
        ["#0E1013", "Faster delivery & iteration", "Reusable design systems and AI-assisted engineering cut build time, without cutting corners on quality."],
        ["#BFF5CF", "Predictable scope & budget", "Research before build means fewer surprises. Fixed milestones, transparent reporting, no scope drift."],
        ["#C9C4F2", "Production reliability & security", "AWS architectures with observability, backups, and encryption in transit and at rest, from day one."],
      ];
  const managed: string[] = es
    ? ["Demos semanales de software funcionando", "CI/CD y observabilidad pre-configurados", "Modelos de colaboración flexibles", "Infraestructura auto-reparable", "Soporte humano, sin muros de tickets"]
    : ["Weekly demos of working software", "CI/CD and observability pre-configured", "Flexible engagement models", "Self-healing infrastructure", "Human support, no ticket walls"];
  return (
    <Shell active="services">
      <PageHero
        label={es ? "Servicios full-stack" : "Full-stack services"}
        title={es ? "Software impulsado por personas, para personas y empresas" : "Human-driven software for humans and enterprises"}
        tint="#e6f7ec"
        mark={es ? "humanos" : "humans"}
        lead={es ? "Diseña, construye y automatiza con un solo lab: alcance flexible, confiabilidad de producción e investigación incluida." : "Design, engineer, and automate with one lab: flexible scope, production reliability, and research built in."}
      >
        <a href="#build" className={`${s.btn} ${s.btnInk}`}>{es ? "Ver servicios" : "Explore services"}</a>
        <a href={`mailto:${CONTACT.email}`} className={`${s.btn} ${s.btnOutline}`}>{es ? "Hablemos" : "Contact sales"}</a>
      </PageHero>

      {/* what we build */}
      <section id="build" className={`${s.wrap} ${s.sectionFirst}`}>
        <SectionHead title={es ? "Qué construimos" : "What we build"} sub={es ? "Cuatro servicios, un solo equipo. Cada uno llega con investigación, documentación y gente que responde." : "Four services, one team. Each ships with research, documentation and people who answer."} />
        <div className={s.cards4}>
          {SERVICE_CARDS.map((c, i) => (
            <Link key={c.id} href={`/services/${c.id}`} className={`${s.tile} ${s.tileTint}`} style={{ background: TINTS[i].tint, ["--hot" as string]: TINTS[i].hot }}>
              <span className={s.label} style={{ color: "#555" }}>0{i + 1}</span>
              <h3>{c.title[lang]}</h3>
              <div className={s.specs}>
                {c.rows.map(([k, v]) => (
                  <div key={k.en}><small>{k[lang]}</small><b>{v[lang]}</b></div>
                ))}
              </div>
              <span className={s.tileLink}>{es ? "Ver más →" : "Learn more →"}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* why */}
      <section className={`${s.wrap} ${s.section}`}>
        <SectionHead title={es ? "¿Por qué MindfulTech?" : "Why MindfulTech?"} sub={es ? "Diseño guiado por investigación, ingeniería de producción y confiabilidad enterprise: a cualquier escala." : "Research-led design, production-grade engineering, and enterprise reliability: at any scale."} />
        <div className={s.cards3}>
          {why.map(([bg, title, body], i) => (
            <div key={title} className={s.value} style={{ background: bg, color: i === 0 ? "#fff" : "#0E1013" }}>
              <b>{title}</b>
              <p style={i === 0 ? { color: "#AEB4BE" } : undefined}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* managed delivery */}
      <section className={`${s.wrap} ${s.section}`}>
        <div className={s.split}>
          <div className={s.caseText}>
            <span className={s.label}>{es ? "Delivery gestionado" : "Managed delivery"}</span>
            <h2 className={s.h2}>{es ? "Lanza a producción sin armar un equipo primero" : "Ship to production without building a team first"}</h2>
            <p>{es ? "Diseño, ingeniería, QA y operaciones cloud llegan pre-configurados: tú mantienes la propiedad de cada repo y cuenta." : "Design, engineering, QA, and cloud operations arrive pre-configured, you keep ownership of every repo and account."}</p>
            <div className={s.checks}>{managed.map((m) => <span key={m}><i />{m}</span>)}</div>
            <a href={`mailto:${CONTACT.email}`} className={`${s.btn} ${s.btnGreen}`} style={{ alignSelf: "flex-start" }}>{es ? "Habla con el equipo" : "Talk to the team"}</a>
          </div>
          <div className={s.photo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/product.webp" alt="" width={1200} height={900} loading="lazy" />
          </div>
        </div>
      </section>

      <div style={{ height: 140 }} />
      <CtaBand />
    </Shell>
  );
}
