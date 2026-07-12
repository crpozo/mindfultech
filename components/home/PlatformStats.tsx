"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "../i18n";

const MONO = "var(--mono)";

type Card = {
  bg: string;
  hover: string;
  tag: { en: string; es: string };
  value: string;
  caption: { en: string; es: string };
  captionColor: string;
  href: string;
  connector?: boolean;
};

const CARDS: Card[] = [
  {
    bg: "#bdd9f0",
    hover: "#8fc4ec",
    tag: { en: "↑ DAYS SHIPPING", es: "↑ DÍAS ENTREGANDO" },
    value: "3,650+",
    caption: { en: "human-centered products in production.", es: "productos centrados en personas, en producción." },
    captionColor: "#2c3a4a",
    href: "/services",
    connector: true,
  },
  {
    bg: "#f2cfe3",
    hover: "#efa7d2",
    tag: { en: "↓ MANUAL WORK", es: "↓ TRABAJO MANUAL" },
    value: "80%",
    caption: { en: "less order processing after AI workflows at Helixona.", es: "menos procesamiento manual con flujos de IA en Helixona." },
    captionColor: "#4a3040",
    href: "/work#helixona",
    connector: true,
  },
  {
    bg: "#f8d9c3",
    hover: "#f5bd90",
    tag: { en: "↑ ADOPTION", es: "↑ ADOPCIÓN" },
    value: "3x",
    caption: { en: "on the USFQ portal after a research-led rebuild.", es: "de adopción en el portal USFQ tras el rediseño con investigación." },
    captionColor: "#4c3628",
    href: "/work#usfq",
  },
];

export function PlatformStats() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section
      id="platform"
      style={{ position: "relative", background: "#fff", padding: "110px 0 0" }}
    >
      <div style={{ maxWidth: 1560, margin: "0 auto", padding: "0 48px" }}>
        <h2
          style={{
            textAlign: "center",
            fontWeight: 500,
            fontSize: "clamp(34px,3.6vw,56px)",
            letterSpacing: "-.02em",
            lineHeight: 1.05,
            margin: 0,
            color: "var(--ink)",
          }}
        >
          {es ? "La diferencia MindfulTech" : "The MindfulTech difference"}
        </h2>
        <p
          style={{
            textAlign: "center",
            fontSize: 19,
            lineHeight: 1.5,
            color: "#8b8896",
            fontWeight: 400,
            maxWidth: 620,
            margin: "18px auto 54px",
          }}
        >
          {es ? "Resultados medidos en diseño, ingeniería y automatización con IA." : "Measured results across design, engineering, and AI automation."}
        </p>

        <div
          className="stack-3"
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 26 }}
        >
          {CARDS.map((c) => (
            <div
              key={c.value}
              className="stat-card"
              style={
                {
                  position: "relative",
                  background: c.bg,
                  borderRadius: 8,
                  padding: "22px 22px 20px",
                  minHeight: 230,
                  display: "flex",
                  flexDirection: "column",
                  "--hover": c.hover,
                } as React.CSSProperties
              }
            >
              <span
                style={{
                  alignSelf: "flex-start",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontFamily: MONO,
                  fontSize: 10.5,
                  fontWeight: 500,
                  letterSpacing: ".1em",
                  color: "var(--ink)",
                  background: "rgba(255,255,255,.72)",
                  padding: "7px 11px",
                  borderRadius: 4,
                }}
              >
                {c.tag[lang]}
              </span>
              <span
                style={{
                  fontWeight: 500,
                  fontSize: "clamp(48px,4.4vw,74px)",
                  letterSpacing: "-.03em",
                  lineHeight: 1,
                  marginTop: 18,
                  color: "var(--ink)",
                }}
              >
                {c.value}
              </span>
              <span style={{ marginTop: "auto", fontSize: 13.5, color: c.captionColor }}>
                {c.caption[lang]}
              </span>
              <Link
                href={c.href}
                className="stat-more"
                style={{
                  textDecoration: "none",
                  fontFamily: MONO,
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: ".12em",
                  color: "#0e0d12",
                  marginTop: 10,
                  opacity: 0,
                  transform: "translateY(6px)",
                  transition: "opacity .35s ease,transform .35s ease",
                }}
              >
                {es ? "VER CÓMO" : "LEARN HOW"}
              </Link>
              {c.connector && (
                <span
                  style={{
                    position: "absolute",
                    right: -19,
                    top: "50%",
                    width: 12,
                    height: 5,
                    background: "var(--accent-light)",
                    zIndex: 2,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div
          className="stack-4"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 26,
            marginTop: 96,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{ borderTop: "1px solid rgba(14,13,18,.16)" }} />
          ))}
        </div>
      </div>
    </section>
  );
}
