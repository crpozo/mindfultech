"use client";

import * as React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { FooterLinks, DarkCTA } from "@/components/internal/Shared";
import { BRAND_GREEN } from "@/components/Logo";
import { useLang } from "@/components/i18n";

const MONO = "var(--mono)";

type Bi = { en: string; es: string };

type BiOr = string | Bi;

type Case = {
  id: string;
  brand: string;
  imageFirst: boolean;
  tag: Bi;
  title: Bi;
  body: Bi;
  stats: [BiOr, Bi][];
  live?: { href: string };
  image?: string;
  caption: Bi; // mono caption, bottom-right of the polaroid
  tilt: number;
  gallery?: { src: string; label: Bi }[];
};

const CASES: Case[] = [
  {
    id: "themedmotion",
    brand: "ThemedMotion",
    imageFirst: false,
    tag: { en: "WEB · 3D · ANIMATRONICS", es: "WEB · 3D · ANIMATRÓNICOS" },
    title: {
      en: "An immersive site for a Dutch animatronics studio",
      es: "Un sitio inmersivo para un estudio de animatrónicos en Países Bajos",
    },
    body: {
      en: "ThemedMotion (by P&P Projects, Netherlands) designs and builds animatronics for theme parks worldwide. Scroll-driven storytelling across their 7-step process, an interactive 3D figure, and a 60-second brief flow.",
      es: "ThemedMotion (de P&P Projects, Países Bajos) diseña y construye animatrónicos para parques temáticos de todo el mundo. Narrativa guiada por scroll a través de su proceso de 7 pasos, una figura 3D interactiva y un flujo de brief de 60 segundos.",
    },
    stats: [
      ["3D", { en: "FIGURE VIEWER", es: "VISOR DE FIGURA" }],
      ["07", { en: "CHAPTERS", es: "CAPÍTULOS" }],
      ["60s", { en: "BRIEF FLOW", es: "FLUJO DE BRIEF" }],
    ],
    live: { href: "https://crpozo.github.io/themed-motion/" },
    image: "/portfolio/tm-site-hero.webp",
    caption: { en: "● scroll-driven storytelling", es: "● narrativa por scroll" },
    tilt: 2,
    gallery: [
      { src: "/portfolio/tm-site-work.webp", label: { en: "PROJECT GALLERY", es: "GALERÍA DE PROYECTOS" } },
      { src: "/portfolio/tm-site-design.webp", label: { en: "DESIGN CHAPTER", es: "CAPÍTULO DE DISEÑO" } },
      { src: "/portfolio/tm-site-finish.webp", label: { en: "FINISHING", es: "ACABADOS" } },
    ],
  },
  {
    id: "usfq",
    brand: "USFQ",
    imageFirst: true,
    tag: { en: "EDUCATION · PORTAL · AI ASSIST", es: "EDUCACIÓN · PORTAL · ASISTENTE IA" },
    title: {
      en: "A campus portal 12,000 students actually use",
      es: "Un portal de campus que 12.000 estudiantes sí usan",
    },
    body: {
      en: "Field studies with 200+ students reshaped onboarding around real course-planning behavior. An AI assistant grounded in the university catalog answers 2,400 questions a week — with human review built in.",
      es: "Estudios de campo con 200+ estudiantes rediseñaron el onboarding según el comportamiento real de planificación de cursos. Un asistente de IA con grounding en el catálogo universitario responde 2.400 preguntas por semana — con revisión humana integrada.",
    },
    stats: [
      ["3×", { en: "ADOPTION", es: "ADOPCIÓN" }],
      [{ en: "2,400", es: "2.400" }, { en: "ANSWERS / WEEK", es: "RESPUESTAS / SEMANA" }],
      [{ en: "4.8/5", es: "4,8/5" }, { en: "SATISFACTION", es: "SATISFACCIÓN" }],
    ],
    caption: { en: "CAMPUS PORTAL · 2025", es: "PORTAL DE CAMPUS · 2025" },
    tilt: -2,
  },
  {
    id: "helixona",
    brand: "Helixona",
    imageFirst: false,
    tag: { en: "E-COMMERCE · AUTOMATION", es: "E-COMMERCE · AUTOMATIZACIÓN" },
    title: {
      en: "Order processing, from hours to minutes",
      es: "Procesamiento de pedidos: de horas a minutos",
    },
    body: {
      en: "AI-checked workflows now route, validate, and confirm orders automatically across Helixona’s storefront and fulfillment — with every exception escalated to a human.",
      es: "Flujos verificados por IA ahora enrutan, validan y confirman pedidos automáticamente en la tienda y logística de Helixona — con cada excepción escalada a un humano.",
    },
    stats: [
      ["80%", { en: "LESS MANUAL WORK", es: "MENOS TRABAJO MANUAL" }],
      ["12 min", { en: "PER ORDER", es: "POR PEDIDO" }],
    ],
    caption: { en: "AUTOMATION · 2024", es: "AUTOMATIZACIÓN · 2024" },
    tilt: 1.6,
  },
  {
    id: "kruger",
    brand: "KrugerLabs",
    imageFirst: true,
    tag: { en: "DESIGN SYSTEMS · ENGINEERING", es: "DESIGN SYSTEMS · INGENIERÍA" },
    title: {
      en: "One design system, three platforms",
      es: "Un design system, tres plataformas",
    },
    body: {
      en: "A shared component library now powers KrugerLabs’ web, mobile, and internal tools — one codebase to maintain, one visual language for every user.",
      es: "Una librería de componentes compartida ahora impulsa la web, el móvil y las herramientas internas de KrugerLabs — un solo código que mantener, un solo lenguaje visual para cada usuario.",
    },
    stats: [
      ["3×", { en: "PLATFORMS", es: "PLATAFORMAS" }],
      ["-40%", { en: "UI MAINTENANCE", es: "MANTENIMIENTO UI" }],
    ],
    caption: { en: "DESIGN SYSTEM · 2023", es: "DESIGN SYSTEM · 2023" },
    tilt: -1.6,
  },
];

/* Reference-style drop-zone stand-in for cases awaiting a real photo. */
function PolaroidWell({ brand, es }: { brand: string; es: boolean }) {
  return (
    <div
      style={{
        aspectRatio: "16/10",
        borderRadius: 10,
        background: "#f2f3f7",
        border: "1.5px dashed rgba(14,13,18,.16)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        textAlign: "center",
        padding: 16,
      }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(14,13,18,.38)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      <span style={{ fontSize: 13.5, fontWeight: 500, color: "#55525e" }}>
        {es ? `Foto del proyecto ${brand}` : `${brand} project photo`}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".12em", color: "#8b8896" }}>
        {es ? "PRÓXIMAMENTE" : "COMING SOON"}
      </span>
    </div>
  );
}

export function WorkBody() {
  const { lang } = useLang();
  const es = lang === "es";
  const meta = `0${CASES.length} ${es ? "CASOS DE ESTUDIO" : "CASE STUDIES"} · 2023—2026`;

  return (
    <div style={{ position: "relative", width: "100%", overflow: "clip", background: "#fff" }}>
      <SiteHeader active="work" megaMenus />

      {/* page header — reference: bold title left, mono meta right */}
      <section style={{ background: "#fff", padding: "84px 0 30px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
            <h1
              style={{
                fontWeight: 700,
                fontSize: "clamp(40px,4.6vw,64px)",
                lineHeight: 1.02,
                letterSpacing: "-.03em",
                margin: 0,
                color: "var(--ink)",
              }}
            >
              {es ? "Entregado con clientes" : "Shipped with clients"}
              <span style={{ color: BRAND_GREEN }}>.</span>
            </h1>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: "#8b8896", paddingTop: 18, whiteSpace: "nowrap" }}>
              {meta}
            </span>
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: "#6b6875", maxWidth: 540, margin: "20px 0 0" }}>
            {es
              ? "Una década de productos en producción — de portales universitarios a comercio automatizado."
              : "A decade of products in production — from university portals to automated commerce."}
          </p>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "40px 0 20px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          {CASES.map((c, i) => {
            const num = String(i + 1).padStart(2, "0");
            const kicker = `${num} — ${c.brand.toUpperCase()} · ${c.tag[lang]}`;

            const text = (
              <div className="case-text" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: ".14em", color: "var(--accent-deep)" }}>
                  {kicker}
                </span>
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: "clamp(28px,2.8vw,40px)",
                    lineHeight: 1.1,
                    letterSpacing: "-.025em",
                    margin: "16px 0 14px",
                    maxWidth: 520,
                  }}
                >
                  {c.title[lang]}
                </h2>
                <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#55525e", margin: "0 0 26px", maxWidth: 500 }}>{c.body[lang]}</p>

                {/* stat strip with hairline dividers */}
                <div className="stat-strip" style={{ display: "flex", flexWrap: "wrap", rowGap: 16 }}>
                  {c.stats.map(([v, l], si) => (
                    <div
                      key={l.en}
                      className="stat-cell"
                      style={{
                        paddingRight: 24,
                        paddingLeft: si === 0 ? 0 : 24,
                        borderLeft: si === 0 ? "none" : "1px solid rgba(14,13,18,.12)",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "clamp(24px,2.2vw,32px)", letterSpacing: "-.02em", color: BRAND_GREEN }}>
                        {typeof v === "string" ? v : v[lang]}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".12em", color: "#8b8896", marginTop: 4 }}>
                        {l[lang]}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 30 }}>
                  {c.live ? (
                    <>
                      <a
                        href={c.live.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-dark"
                        style={{
                          textDecoration: "none",
                          fontSize: 14.5,
                          fontWeight: 600,
                          letterSpacing: "-.01em",
                          background: "#0e0d12",
                          color: "#fff",
                          padding: "14px 24px",
                          borderRadius: 999,
                        }}
                      >
                        {es ? "Ver sitio en vivo →" : "Visit live site →"}
                      </a>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 11.5, letterSpacing: ".08em", color: "#55525e" }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3fbf7f" }} />
                        {es ? "en vivo" : "live"}
                      </span>
                    </>
                  ) : (
                    <a
                      href={`mailto:info@mindfultech.ec?subject=${encodeURIComponent(es ? `Caso de estudio ${c.brand}` : `Case study ${c.brand}`)}`}
                      className="btn-soft"
                      style={{
                        textDecoration: "none",
                        fontSize: 14.5,
                        fontWeight: 600,
                        letterSpacing: "-.01em",
                        background: "#fff",
                        color: "var(--ink)",
                        padding: "13px 24px",
                        borderRadius: 999,
                        border: "1px solid rgba(14,13,18,.18)",
                      }}
                    >
                      {es ? "Solicitar caso de estudio →" : "Request case study →"}
                    </a>
                  )}
                </div>
              </div>
            );

            const media = (
              <div className="case-media" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 0" }}>
                <div
                  className="polaroid"
                  style={{
                    width: "min(560px,100%)",
                    background: "#fff",
                    borderRadius: 18,
                    padding: 14,
                    border: "1px solid rgba(14,13,18,.07)",
                    boxShadow: "0 34px 80px -34px rgba(14,13,18,.4), 0 8px 22px -12px rgba(14,13,18,.16)",
                    transform: `rotate(${c.tilt}deg)`,
                  }}
                >
                  {c.image ? (
                    <div style={{ aspectRatio: "16/10", borderRadius: 10, overflow: "hidden", background: "#000", position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.image}
                        alt={es ? `Proyecto ${c.brand}` : `${c.brand} project`}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <PolaroidWell brand={c.brand} es={es} />
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, padding: "0 2px 2px" }}>
                    <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-.01em", color: "var(--ink)" }}>{c.brand}</span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        letterSpacing: ".1em",
                        color: c.live ? "var(--accent-deep)" : "#8b8896",
                      }}
                    >
                      {c.caption[lang]}
                    </span>
                  </div>
                </div>
              </div>
            );

            return (
              <React.Fragment key={c.id}>
                {i > 0 && (
                  <div style={{ position: "relative", height: 1, background: "rgba(14,13,18,.1)", margin: "64px 0" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%,-50%)",
                        background: "#fff",
                        padding: "0 14px",
                        color: BRAND_GREEN,
                        fontSize: 12,
                        lineHeight: 1,
                      }}
                    >
                      ✦
                    </span>
                  </div>
                )}
                <div id={c.id} style={{ scrollMarginTop: 130 }}>
                  <div
                    className={`stack-2 case-grid${c.imageFirst ? " case-rev" : ""}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1.05fr",
                      gap: "clamp(28px,4vw,64px)",
                      alignItems: "center",
                    }}
                  >
                    {text}
                    {media}
                  </div>

                  {c.gallery && (
                    <div
                      className="stack-3"
                      style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(16px,2vw,28px)", marginTop: 54 }}
                    >
                      {c.gallery.map((g, gi) => (
                        <div
                          key={g.src}
                          className="polaroid"
                          style={{
                            background: "#fff",
                            borderRadius: 14,
                            padding: 10,
                            border: "1px solid rgba(14,13,18,.07)",
                            boxShadow: "0 22px 50px -26px rgba(14,13,18,.35)",
                            transform: `rotate(${[-1.2, 1, -0.8][gi % 3]}deg)`,
                          }}
                        >
                          <div style={{ aspectRatio: "16/10", borderRadius: 8, overflow: "hidden", background: "#000", position: "relative" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={g.src}
                              alt={g.label[lang]}
                              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".12em", color: "#8b8896", marginTop: 9, paddingLeft: 2 }}>
                            {g.label[lang]}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </section>

      <section style={{ background: "#fff", padding: "90px 0 90px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <DarkCTA
            title={es ? "Tu producto puede ser el próximo" : "Your product could be next"}
            subtitle={es ? "Cuéntanos dónde duele — te mostramos lo que es posible." : "Tell us where it hurts — we’ll show you what’s possible."}
            primary={{ label: es ? "INICIAR PROYECTO" : "START A PROJECT", href: "mailto:info@mindfultech.ec" }}
          />
          <FooterLinks
            links={[
              { label: es ? "Inicio" : "Home", href: "/" },
              { label: es ? "Servicios" : "Services", href: "/services" },
              { label: "Blog", href: "/blog" },
              { label: es ? "Compañía" : "Company", href: "/company" },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
