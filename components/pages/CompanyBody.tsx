"use client";

import * as React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Pill } from "@/components/internal/Shared";
import { useLang } from "@/components/i18n";

const MONO = "var(--mono)";

export function CompanyBody() {
  const { lang } = useLang();
  const es = lang === "es";

  const values: [string, string, string, string][] = es
    ? [
        ["#bdd9f0", "#2c3a4a", "Las personas primero", "Cada proyecto empieza con los humanos que usarán el producto — no con el stack tecnológico."],
        ["#f2cfe3", "#4a3040", "Oficio sobre volumen", "Un equipo senior pequeño que entrega menos cosas, mejor hechas — y responde después del launch."],
        ["#f8d9c3", "#4c3628", "IA con criterio", "Automatizamos lo repetitivo y dejamos a humanos todo lo que requiere cuidado."],
      ]
    : [
        ["#bdd9f0", "#2c3a4a", "People first", "Every engagement starts with the humans who will use the product — not the tech stack."],
        ["#f2cfe3", "#4a3040", "Craft over volume", "A small senior team that ships fewer, better things — and stays accountable after launch."],
        ["#f8d9c3", "#4c3628", "AI with judgment", "We automate the repetitive and keep humans on everything that requires care."],
      ];

  return (
    <div style={{ position: "relative", width: "100%", overflow: "clip", background: "#fff" }}>
      <SiteHeader active="company" megaMenus />

      <section id="about" style={{ background: "linear-gradient(180deg,#ffffff,#f4f7fc)", padding: "90px 0 60px", textAlign: "center", scrollMarginTop: 120 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 40px" }}>
          <Pill>{es ? "COMPAÑÍA" : "COMPANY"}</Pill>
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
            {es ? "Un laboratorio de software enfocado en personas" : "A software lab focused on people"}
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.55, color: "#6b6875", maxWidth: 640, margin: "22px auto 0" }}>
            {es
              ? "Desde 2016 diseñamos y construimos productos digitales desde Quito para equipos de Ecuador y más allá — con investigación, oficio y ahora IA aplicada en el centro."
              : "Since 2016 we've designed and engineered digital products from Quito for teams across Ecuador and beyond — with research, craft, and now applied AI at the core."}
          </p>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "60px 0 20px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div className="stack-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 26 }}>
            {values.map(([bg, tc, title, body]) => (
              <div
                key={title}
                style={{
                  background: bg,
                  borderRadius: 8,
                  padding: 24,
                  minHeight: 210,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontWeight: 500, fontSize: 21 }}>{title}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: tc }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="careers" style={{ background: "#fff", padding: "90px 0 20px", scrollMarginTop: 120 }}>
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
            <Pill>{es ? "CARRERAS" : "CAREERS"}</Pill>
            <h2 style={{ fontWeight: 500, fontSize: "clamp(28px,3.2vw,46px)", letterSpacing: "-.02em", lineHeight: 1.08, margin: "18px 0 14px" }}>
              {es ? "Únete a la misión" : "Join our mission"}
            </h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.6, color: "#55525e", margin: "0 0 22px", maxWidth: 460 }}>
              {es
                ? "Contratamos diseñadores e ingenieros que se preocupan por las personas. No hay vacantes abiertas ahora — pero siempre leemos portafolios de gente que construye con intención."
                : "We hire designers and engineers who care about people. No open reqs right now — but we always read portfolios from folks who build with intention."}
            </p>
            <a href="mailto:info@mindfultech.ec?subject=Portfolio" className="btn-dark" style={darkBtn}>
              {es ? "ENVÍA TU PORTAFOLIO" : "SEND YOUR PORTFOLIO"}
            </a>
          </div>
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              background:
                "linear-gradient(135deg,color-mix(in srgb,var(--accent) 26%,#9cc4ea),#dff0f2 55%,color-mix(in srgb,var(--accent) 20%,#fff))",
              aspectRatio: "4 / 3",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/team.webp" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </section>

      <section id="press" style={{ background: "#fff", padding: "90px 0 90px", scrollMarginTop: 120 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div
            className="stack-2"
            style={{
              background: "#0d0a1f",
              borderRadius: 16,
              padding: "clamp(40px,5vw,72px)",
              display: "grid",
              gridTemplateColumns: "1.3fr 1fr",
              gap: 40,
              alignItems: "center",
            }}
          >
            <div>
              <span style={{ display: "inline-block", fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: ".14em", color: "#ffc2dd" }}>
                {es ? "PRENSA" : "PRESS"}
              </span>
              <h2 style={{ fontWeight: 500, fontSize: "clamp(26px,2.8vw,42px)", letterSpacing: "-.02em", margin: "14px 0 12px", color: "#fff" }}>
                {es ? "MindfulTech en los medios" : "MindfulTech in the news"}
              </h2>
              <p style={{ fontSize: 16, color: "#8f8ba4", margin: 0, maxWidth: 460 }}>
                {es
                  ? "Para entrevistas, charlas o material de marca, escribe a nuestro estudio — respondemos en un día hábil."
                  : "For interviews, speaking, or brand assets, write to our studio — we answer within one business day."}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(
                [
                  [es ? "PRENSA" : "PRESS", "info@mindfultech.ec", "mailto:info@mindfultech.ec?subject=Press"],
                  [es ? "TELÉFONO" : "PHONE", "+593 958 73 1994", "tel:+593958731994"],
                  [es ? "ESTUDIO" : "STUDIO", "Quito · Ecuador", null],
                ] as [string, string, string | null][]
              ).map(([k, v, href]) => {
                const inner = (
                  <>
                    <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".12em", color: "#8f8ba4" }}>{k}</span>
                    <span style={{ fontSize: 15.5, fontWeight: 500 }}>{v}</span>
                  </>
                );
                const rowStyle: React.CSSProperties = {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.14)",
                  color: "#fff",
                  textDecoration: "none",
                };
                return href ? (
                  <a key={k} href={href} className="press-row" style={rowStyle}>
                    {inner}
                  </a>
                ) : (
                  <div key={k} style={rowStyle}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const darkBtn: React.CSSProperties = {
  textDecoration: "none",
  display: "inline-block",
  fontFamily: MONO,
  fontSize: 11.5,
  fontWeight: 500,
  letterSpacing: ".12em",
  background: "#0e0d12",
  color: "#fff",
  padding: "14px 22px",
  borderRadius: 5,
};
