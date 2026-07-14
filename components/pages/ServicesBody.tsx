"use client";

import * as React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Logo } from "@/components/Logo";
import { Pill } from "@/components/internal/Shared";
import { useLang } from "@/components/i18n";

const MONO = "var(--mono)";

const SERVICE_CARDS = [
  {
    id: "ux",
    title: { en: "UX Design", es: "Diseño UX" },
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6" />
      </>
    ),
    rows: [
      [{ en: "METHOD", es: "MÉTODO" }, { en: "Field research & prototyping", es: "Investigación de campo y prototipado" }],
      [{ en: "BEST FOR", es: "IDEAL PARA" }, { en: "New products, redesigns", es: "Productos nuevos, rediseños" }],
      [{ en: "TIMELINE", es: "TIEMPO" }, { en: "From 3 weeks", es: "Desde 3 semanas" }],
    ],
  },
  {
    id: "apps",
    title: { en: "Web & Mobile Apps", es: "Apps Web y Móviles" },
    icon: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </>
    ),
    rows: [
      [{ en: "STACK", es: "STACK" }, { en: "React, Next.js, React Native", es: "React, Next.js, React Native" }],
      [{ en: "BEST FOR", es: "IDEAL PARA" }, { en: "Platforms, portals, e-commerce", es: "Plataformas, portales, e-commerce" }],
      [{ en: "TIMELINE", es: "TIEMPO" }, { en: "From 8 weeks", es: "Desde 8 semanas" }],
    ],
  },
  {
    id: "custom",
    title: { en: "Custom Software", es: "Software a Medida" },
    icon: <path d="M14 4l-4 16M18 8l4 4-4 4M6 16l-4-4 4-4" />,
    rows: [
      [{ en: "METHOD", es: "MÉTODO" }, { en: "Built around your workflows", es: "Alrededor de tus procesos" }],
      [{ en: "BEST FOR", es: "IDEAL PARA" }, { en: "Operations, internal tools", es: "Operaciones, herramientas internas" }],
      [{ en: "TIMELINE", es: "TIEMPO" }, { en: "From 10 weeks", es: "Desde 10 semanas" }],
    ],
  },
  {
    id: "ai",
    title: { en: "AI & Automation", es: "IA y Automatización" },
    icon: (
      <>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
        <circle cx="12" cy="12" r="3.4" />
      </>
    ),
    rows: [
      [{ en: "METHOD", es: "MÉTODO" }, { en: "Grounded, human-reviewed AI", es: "IA con grounding y revisión humana" }],
      [{ en: "BEST FOR", es: "IDEAL PARA" }, { en: "Assistants, workflows, search", es: "Asistentes, flujos, búsqueda" }],
      [{ en: "TIMELINE", es: "TIEMPO" }, { en: "From 4 weeks", es: "Desde 4 semanas" }],
    ],
  },
];

export function ServicesBody() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <div style={{ position: "relative", width: "100%", overflow: "clip", background: "#fff" }}>
      <SiteHeader active="services" megaMenus />

      {/* HERO */}
      <section
        style={{
          position: "relative",
          background: "linear-gradient(180deg,#ffffff,#f4f7fc)",
          padding: "90px 0 70px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 40px" }}>
          <Pill>{es ? "SERVICIOS FULL-STACK" : "FULL-STACK SERVICES"}</Pill>
          <h1
            style={{
              fontWeight: 500,
              fontSize: "clamp(40px,4.6vw,72px)",
              lineHeight: 1.04,
              letterSpacing: "-.025em",
              margin: "26px 0 0",
              color: "var(--ink)",
            }}
          >
            {es ? "Software guiado por UX para humanos y empresas" : "UX-driven software for humans and enterprises"}
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.55, color: "#6b6875", maxWidth: 640, margin: "22px auto 0" }}>
            {es ? "Diseña, construye y automatiza con un solo lab — alcance flexible, confiabilidad de producción e investigación incluida." : "Design, engineer, and automate with one lab — flexible scope, production reliability, and research built in."}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 34, flexWrap: "wrap" }}>
            <a href="#ux" className="btn-dark" style={heroBtnDark}>
              {es ? "EXPLORAR SERVICIOS" : "EXPLORE SERVICES"}
            </a>
            <a href="mailto:info@mindfultech.ec" className="btn-light" style={heroBtnLight}>
              {es ? "HABLEMOS" : "CONTACT SALES"}
            </a>
          </div>
        </div>

        {/* product panel */}
        <div style={{ maxWidth: 1280, margin: "56px auto 0", padding: "0 40px" }}>
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              background:
                "linear-gradient(135deg,color-mix(in srgb,var(--accent) 34%,#9cc4ea),#dff0f2 50%,color-mix(in srgb,var(--accent) 26%,#fff))",
              padding: "clamp(24px,4vw,64px)",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 30px 80px -30px rgba(14,13,18,.45)",
                overflow: "hidden",
                textAlign: "left",
                maxWidth: 1020,
                margin: "0 auto",
                border: "1px solid rgba(14,13,18,.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 18px",
                  borderBottom: "1px solid rgba(14,13,18,.07)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Logo size={17} />
                  <span style={{ fontWeight: 600, fontSize: 13.5, color: "#24344E" }}>MindfulTech</span>
                </div>
                <div style={{ display: "flex", gap: 14, fontSize: 12.5, fontWeight: 500, color: "#6b6875" }}>
                  <span style={{ color: "var(--accent)" }}>Delivery</span>
                  <span>Roadmap</span>
                  <span>Reports</span>
                  <span>Team</span>
                </div>
              </div>
              <div className="stack-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ padding: 22, borderRight: "1px solid rgba(14,13,18,.06)" }}>
                  <div style={{ fontSize: 12, color: "#8b8896", fontFamily: MONO }}>DELIVERY › SPRINT 14</div>
                  <div style={{ fontWeight: 500, fontSize: 19, marginTop: 6 }}>{es ? "Un equipo, cuatro disciplinas" : "One team, four disciplines"}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
                    {[
                      ["Research & design", "var(--accent)", "ON TRACK", "#1f9d6b"],
                      ["Engineering", "#2c2833", "ON TRACK", "#1f9d6b"],
                      ["AI & automation", "#8b8896", "IN REVIEW", "#8b8896"],
                    ].map(([label, dot, status, sc]) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "11px 13px",
                          border: "1px solid rgba(14,13,18,.07)",
                          borderRadius: 10,
                        }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
                        <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{label}</span>
                        <span style={{ fontFamily: MONO, fontSize: 11, color: sc }}>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: 22 }}>
                  <div style={{ fontSize: 12, color: "#8b8896", fontFamily: MONO }}>OUTCOMES › THIS QUARTER</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                    {[
                      ["Release confidence", "92%", 92],
                      ["Automation coverage", "74%", 74],
                      ["User satisfaction", "4.8/5", 96],
                    ].map(([name, val, pct]) => (
                      <div key={name as string}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
                          <span>{name}</span>
                          <span style={{ color: "var(--accent)" }}>{val}</span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 3,
                            background: "var(--accent-tint)",
                            marginTop: 6,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              background: "linear-gradient(90deg,var(--accent-light),var(--accent))",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section style={{ background: "#fff", padding: "100px 0 20px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <h2 style={centerH2}>{es ? "¿Por qué MindfulTech?" : "Why MindfulTech?"}</h2>
          <p style={centerSub}>
            {es ? "Diseño guiado por investigación, ingeniería de producción y confiabilidad enterprise — a cualquier escala." : "Research-led design, production-grade engineering, and enterprise reliability — at any scale."}
          </p>
          <div className="stack-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 26 }}>
            {[
              ["#bdd9f0", "#2c3a4a", es ? "Entrega e iteración más rápidas" : "Faster delivery & iteration", es ? "Design systems reutilizables e ingeniería asistida por IA acortan el tiempo de construcción — sin recortar calidad." : "Reusable design systems and AI-assisted engineering cut build time — without cutting corners on quality."],
              ["#f2cfe3", "#4a3040", es ? "Alcance y presupuesto predecibles" : "Predictable scope & budget", es ? "Investigar antes de construir significa menos sorpresas. Hitos fijos, reportes transparentes, sin desvíos." : "Research before build means fewer surprises. Fixed milestones, transparent reporting, no scope drift."],
              ["#f8d9c3", "#4c3628", es ? "Confiabilidad y seguridad de producción" : "Production reliability & security", es ? "Arquitecturas AWS con observabilidad, respaldos y cifrado en tránsito y reposo — desde el día uno." : "AWS architectures with observability, backups, and encryption in transit and at rest — from day one."],
            ].map(([bg, tc, title, body]) => (
              <div
                key={title}
                style={{
                  background: bg,
                  borderRadius: 8,
                  padding: 24,
                  minHeight: 220,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontWeight: 500, fontSize: 21, letterSpacing: "-.01em" }}>{title}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: tc }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE CARDS */}
      <section style={{ background: "#fff", padding: "90px 0 30px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <h2 style={{ ...centerH2, marginBottom: 48 }}>{es ? "Qué construimos" : "What we build"}</h2>
          <div className="stack-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {SERVICE_CARDS.map((c) => (
              <div
                key={c.id}
                id={c.id}
                style={{
                  border: "1px solid rgba(14,13,18,.1)",
                  borderRadius: 10,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  scrollMarginTop: 120,
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 9,
                    background: "var(--accent-tint)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0e0d12" strokeWidth="1.7" strokeLinecap="round">
                    {c.icon}
                  </svg>
                </span>
                <div style={{ fontWeight: 600, fontSize: 18.5, letterSpacing: "-.01em" }}>{c.title[lang]}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  {c.rows.map(([k, v]) => (
                    <div key={k.en}>
                      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: "#8b8896" }}>{k[lang]}</div>
                      <div style={{ fontWeight: 500, marginTop: 2 }}>{v[lang]}</div>
                    </div>
                  ))}
                </div>
                <Link href={`/services/${c.id}`} className="btn-dark" style={cardBtn}>
                  {es ? "VER MÁS" : "LEARN MORE"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MANAGED DELIVERY */}
      <section style={{ background: "#fff", padding: "90px 0 40px" }}>
        <div
          className="stack-2"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 40px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 56,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  background: "var(--accent-tint)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0e0d12" strokeWidth="1.7">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M3 9h18" />
                </svg>
              </span>
              <span style={{ fontWeight: 600, fontSize: 20 }}>{es ? "Delivery gestionado" : "Managed delivery"}</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
              {["✓ WEEKLY DEMOS", "✓ CI/CD PRE-CONFIGURED", "✓ OBSERVABILITY"].map((t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: ".08em",
                    border: "1px solid rgba(14,13,18,.14)",
                    borderRadius: 5,
                    padding: "7px 10px",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#55525e", margin: "18px 0 22px", maxWidth: 460 }}>
              {es ? "Lanza cargas de producción sin armar un equipo primero. Diseño, ingeniería, QA y operaciones cloud llegan pre-configurados — tú mantienes la propiedad de cada repo y cuenta." : "Ship production workloads without building a team first. Design, engineering, QA, and cloud operations arrive pre-configured — you keep ownership of every repo and account."}
            </p>
            <a href="mailto:info@mindfultech.ec" className="btn-dark" style={{ ...cardBtn, marginTop: 0 }}>
              {es ? "HABLA CON EL EQUIPO" : "TALK TO THE TEAM"}
            </a>
            <div style={{ borderTop: "1px solid rgba(14,13,18,.1)", marginTop: 28 }}>
              {[
                ["⇄", es ? "Modelos de colaboración flexibles" : "Flexible engagement models"],
                ["✓", es ? "Infraestructura auto-reparable" : "Self-healing infrastructure"],
                ["♡", es ? "Soporte humano, sin muros de tickets" : "Human support, no ticket walls"],
              ].map(([ic, label], i) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "16px 0",
                    borderBottom: i < 2 ? "1px solid rgba(14,13,18,.08)" : "none",
                    fontWeight: 500,
                    fontSize: 16.5,
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: "#f1f2f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                    }}
                  >
                    {ic}
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              background:
                "linear-gradient(135deg,color-mix(in srgb,var(--accent) 30%,#9cc4ea),#dff0f2 55%,color-mix(in srgb,var(--accent) 22%,#fff))",
              aspectRatio: "4 / 3.4",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/product.webp" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </section>

      {/* CTA + footer */}
    </div>
  );
}

const heroBtnDark: React.CSSProperties = {
  textDecoration: "none",
  fontFamily: MONO,
  fontSize: 12.5,
  fontWeight: 500,
  letterSpacing: ".12em",
  background: "#0e0d12",
  color: "#fff",
  padding: "16px 26px",
  borderRadius: 6,
};
const heroBtnLight: React.CSSProperties = {
  textDecoration: "none",
  fontFamily: MONO,
  fontSize: 12.5,
  fontWeight: 500,
  letterSpacing: ".12em",
  background: "#e9eaef",
  color: "var(--ink)",
  padding: "16px 26px",
  borderRadius: 6,
};
const cardBtn: React.CSSProperties = {
  textDecoration: "none",
  fontFamily: MONO,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: ".12em",
  background: "#0e0d12",
  color: "#fff",
  padding: "11px 16px",
  borderRadius: 5,
  alignSelf: "flex-start",
  marginTop: "auto",
};
const centerH2: React.CSSProperties = {
  textAlign: "center",
  fontWeight: 500,
  fontSize: "clamp(30px,3.2vw,48px)",
  letterSpacing: "-.02em",
  margin: 0,
};
const centerSub: React.CSSProperties = {
  textAlign: "center",
  fontSize: 18,
  color: "#8b8896",
  maxWidth: 600,
  margin: "16px auto 48px",
};
