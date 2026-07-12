"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "../i18n";
import { ImagePlaceholder } from "../ImagePlaceholder";

const MONO = "var(--mono)";

const SIDE = [
  {
    href: "/work#usfq",
    bg: "linear-gradient(140deg,#141126,color-mix(in srgb,var(--accent) 55%,#141126))",
    tag: { en: "CASE STUDY", es: "CASO DE ESTUDIO" },
    title: { en: "USFQ: a campus portal 12,000 students actually use", es: "USFQ: un portal que 12.000 estudiantes sí usan" },
    body: { en: "Adoption tripled after we rebuilt onboarding around real course-planning behavior…", es: "La adopción se triplicó tras rediseñar el onboarding según el comportamiento real…" },
    onDark: true,
  },
  {
    href: "/work#helixona",
    bg: "linear-gradient(140deg,color-mix(in srgb,var(--accent) 40%,#f0e8ee),#f6f1f5)",
    tag: { en: "ENGINEERING", es: "INGENIERÍA" },
    title: { en: "How we cut Helixona’s fulfillment time with automation", es: "Cómo redujimos los tiempos de Helixona con automatización" },
    body: { en: "Order processing dropped from hours to minutes with AI-checked workflows…", es: "El procesamiento de pedidos pasó de horas a minutos con flujos verificados por IA…" },
    onDark: false,
  },
  {
    href: "/blog",
    bg: "linear-gradient(140deg,#dfe6f2,#c9d4e8)",
    tag: { en: "RESEARCH", es: "INVESTIGACIÓN" },
    title: { en: "Designing AI features people trust", es: "Diseñando funciones de IA en las que la gente confía" },
    body: { en: "Our playbook for grounding, transparency, and human review in production AI…", es: "Nuestro playbook de grounding, transparencia y revisión humana en IA de producción…" },
    onDark: false,
  },
];

export function NewsGrid() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section id="news" style={{ position: "relative", background: "#fff", padding: "110px 0 90px" }}>
      <div style={{ maxWidth: 1560, margin: "0 auto", padding: "0 48px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            marginBottom: 52,
          }}
        >
          <h2
            style={{
              fontWeight: 500,
              fontSize: "clamp(34px,3.6vw,56px)",
              letterSpacing: "-.02em",
              margin: 0,
              color: "var(--ink)",
            }}
          >
            {es ? "Novedades en MindfulTech" : "What's new at MindfulTech"}
          </h2>
          <Link
            href="/blog"
            className="btn-soft"
            style={{
              textDecoration: "none",
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: ".12em",
              background: "#eceded",
              color: "var(--ink)",
              padding: "14px 20px",
              borderRadius: 6,
            }}
          >
            {es ? "TODO EL BLOG" : "ALL BLOG POSTS"}
          </Link>
        </div>

        <div
          className="stack-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 1fr",
            gap: "clamp(30px,4vw,70px)",
            alignItems: "start",
          }}
        >
          {/* featured */}
          <div>
            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                aspectRatio: "16/10",
                position: "relative",
                background:
                  "linear-gradient(140deg,color-mix(in srgb,var(--accent) 18%,#e8e4f4),#efeaf6 55%,color-mix(in srgb,var(--accent) 30%,#fff))",
              }}
            >
              <ImagePlaceholder label="FEATURED IMAGE" />
            </div>
            <span
              style={{
                display: "inline-block",
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: ".12em",
                color: "#44424d",
                background: "#f1f2f6",
                padding: "7px 12px",
                borderRadius: 4,
                marginTop: 22,
              }}
            >
              COMPANY
            </span>
            <h3
              style={{
                fontWeight: 500,
                fontSize: "clamp(24px,2.4vw,34px)",
                lineHeight: 1.2,
                letterSpacing: "-.015em",
                margin: "14px 0 10px",
              }}
            >
              {es ? "MindfulTech ahora es un laboratorio de software AI-first" : "MindfulTech is now an AI-first software lab"}
            </h3>
            <p style={{ fontSize: 16, lineHeight: 1.55, color: "#6b6875", margin: 0, maxWidth: 560 }}>
              {es ? "Diez años de software centrado en personas, ahora con IA aplicada en cada proyecto. Esto es lo que cambia — y lo que nunca cambiará." : "Ten years of human-centered software, now with applied AI in every engagement. Here's what changes — and what never will."}
            </p>
          </div>

          {/* side list */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {SIDE.map((s, i) => (
              <Link
                key={s.title.en}
                href={s.href}
                className="blog-link"
                style={{
                  textDecoration: "none",
                  color: "var(--ink)",
                  display: "grid",
                  gridTemplateColumns: "150px 1fr",
                  gap: 20,
                  padding: i === 0 ? "0 0 26px" : i === SIDE.length - 1 ? "26px 0 0" : "26px 0",
                  borderBottom: i < SIDE.length - 1 ? "1px solid rgba(14,13,18,.1)" : "none",
                }}
              >
                <div
                  style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    aspectRatio: "4/3",
                    position: "relative",
                    background: s.bg,
                  }}
                >
                  <ImagePlaceholder label="THUMB" onDark={s.onDark} />
                </div>
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      fontFamily: MONO,
                      fontSize: 10.5,
                      letterSpacing: ".12em",
                      color: "#44424d",
                      background: "#f1f2f6",
                      padding: "6px 10px",
                      borderRadius: 4,
                    }}
                  >
                    {s.tag[lang]}
                  </span>
                  <h4
                    style={{
                      fontWeight: 500,
                      fontSize: 21,
                      lineHeight: 1.25,
                      letterSpacing: "-.01em",
                      margin: "10px 0 6px",
                    }}
                  >
                    {s.title[lang]}
                  </h4>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: "#6b6875", margin: 0 }}>
                    {s.body[lang]}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
