"use client";

import * as React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Pill } from "@/components/internal/Shared";
import { useLang } from "@/components/i18n";

const MONO = "var(--mono)";

type Bi = { en: string; es: string };

const POSTS: { href: string; img: string; bg: string; onDark: boolean; tag: Bi; title: Bi; body: Bi }[] = [
  {
    href: "/work#usfq",
    img: "/art/eventflow.webp",
    bg: "linear-gradient(140deg,#141126,color-mix(in srgb,var(--accent) 55%,#141126))",
    onDark: true,
    tag: { en: "CASE STUDY", es: "CASO DE ESTUDIO" },
    title: {
      en: "EventFlow: the iOS app behind USFQ campus events",
      es: "EventFlow: la app iOS detrás de los eventos de USFQ",
    },
    body: {
      en: "Published in the App Store, with an AI-powered survey module…",
      es: "Publicada en el App Store, con un módulo de encuestas potenciado por IA…",
    },
  },
  {
    href: "/work#healthcare",
    img: "/art/healthcare.webp",
    bg: "linear-gradient(140deg,color-mix(in srgb,var(--accent) 40%,#f0e8ee),#f6f1f5)",
    onDark: false,
    tag: { en: "ENGINEERING", es: "INGENIERÍA" },
    title: {
      en: "Inside the AI agent that runs a US clinic's medical billing",
      es: "Así opera el agente de IA que factura para Helixona",
    },
    body: {
      en: "Claims in eClinicalWorks, Blue Shield submissions, and document pipelines — end to end…",
      es: "Reclamos en eClinicalWorks, envíos a Blue Shield y pipelines de documentos…",
    },
  },
  {
    href: "mailto:info@mindfultech.ec?subject=Playbook",
    img: "/art/research.webp",
    bg: "linear-gradient(140deg,#dfe6f2,#c9d4e8)",
    onDark: false,
    tag: { en: "RESEARCH", es: "INVESTIGACIÓN" },
    title: {
      en: "Designing AI features people trust",
      es: "Diseñando funciones de IA en las que la gente confía",
    },
    body: {
      en: "Our playbook for grounding, transparency, and human review in production AI…",
      es: "Nuestro playbook de grounding, transparencia y revisión humana en IA de producción…",
    },
  },
];

export function BlogBody() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <div style={{ position: "relative", width: "100%", overflow: "clip", background: "#fff" }}>
      <SiteHeader active="blog" megaMenus />

      <section style={{ background: "linear-gradient(180deg,#ffffff,#f4f7fc)", padding: "80px 0 50px", textAlign: "center" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 40px" }}>
          <Pill>BLOG</Pill>
          <h1
            style={{
              fontWeight: 500,
              fontSize: "clamp(38px,4.4vw,68px)",
              lineHeight: 1.04,
              letterSpacing: "-.025em",
              margin: "24px 0 0",
              color: "var(--ink)",
            }}
          >
            {es ? "Novedades en MindfulTech" : "What's new at MindfulTech"}
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: "#6b6875", maxWidth: 520, margin: "20px auto 0" }}>
            {es
              ? "Notas sobre investigación, ingeniería y cómo construir IA confiable."
              : "Notes on research, engineering, and building AI people can trust."}
          </p>
        </div>
      </section>

      <section id="featured" style={{ background: "#fff", padding: "50px 0 90px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div
            className="stack-2"
            style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "clamp(30px,4vw,64px)", alignItems: "start" }}
          >
            {/* featured */}
            <a href="mailto:info@mindfultech.ec?subject=Blog" style={{ textDecoration: "none", color: "var(--ink)", display: "block" }}>
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/art/ailab.webp" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
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
                {es ? "COMPAÑÍA" : "COMPANY"}
              </span>
              <h2 style={{ fontWeight: 500, fontSize: "clamp(24px,2.4vw,34px)", lineHeight: 1.2, letterSpacing: "-.015em", margin: "14px 0 10px" }}>
                {es ? "MindfulTech ahora es un laboratorio de software AI-first" : "MindfulTech is now an AI-first software lab"}
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.55, color: "#6b6875", margin: 0, maxWidth: 560 }}>
                {es
                  ? "Diez años de software centrado en personas, ahora con IA aplicada en cada proyecto. Esto es lo que cambia — y lo que nunca cambiará."
                  : "Ten years of human-centered software, now with applied AI in every engagement. Here's what changes — and what never will."}
              </p>
            </a>

            {/* list */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {POSTS.map((p, i) => {
                const isExternal = p.href.startsWith("mailto:");
                const content = (
                  <>
                    <div style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "4/3", position: "relative", background: p.bg }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
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
                        {p.tag[lang]}
                      </span>
                      <h3 style={{ fontWeight: 500, fontSize: 21, lineHeight: 1.25, letterSpacing: "-.01em", margin: "10px 0 6px" }}>
                        {p.title[lang]}
                      </h3>
                      <p style={{ fontSize: 14, lineHeight: 1.5, color: "#6b6875", margin: 0 }}>{p.body[lang]}</p>
                    </div>
                  </>
                );
                const style: React.CSSProperties = {
                  textDecoration: "none",
                  color: "var(--ink)",
                  display: "grid",
                  gridTemplateColumns: "150px 1fr",
                  gap: 20,
                  padding: i === 0 ? "0 0 26px" : i === POSTS.length - 1 ? "26px 0 0" : "26px 0",
                  borderBottom: i < POSTS.length - 1 ? "1px solid rgba(14,13,18,.1)" : "none",
                };
                return isExternal ? (
                  <a key={p.title.en} href={p.href} className="blog-link" style={style}>
                    {content}
                  </a>
                ) : (
                  <Link key={p.title.en} href={p.href} className="blog-link" style={style}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
