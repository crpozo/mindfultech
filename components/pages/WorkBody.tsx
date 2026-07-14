"use client";

import * as React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BRAND_GREEN } from "@/components/Logo";
import { useLang } from "@/components/i18n";

const MONO = "var(--mono)";

type Bi = { en: string; es: string };

type BiOr = string | Bi;

type Case = {
  id: string;
  brand: Bi;
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
    brand: { en: "ThemedMotion", es: "ThemedMotion" },
    imageFirst: false,
    tag: { en: "WEB · 3D · ANIMATRONICS", es: "WEB · 3D · ANIMATRÓNICOS" },
    title: {
      en: "An immersive 3D portfolio for a Dutch animatronics studio",
      es: "Un portafolio 3D inmersivo para un estudio de animatrónicos en Países Bajos",
    },
    body: {
      en: "ThemedMotion (by P&P Projects, Netherlands) builds animatronics for theme parks worldwide. We built their site with React Three Fiber and Spline for the interactive 3D figure, GSAP-driven scroll storytelling across their 7-step process, and a 60-second brief flow.",
      es: "ThemedMotion (de P&P Projects, Países Bajos) construye animatrónicos para parques temáticos de todo el mundo. Hicimos su sitio con React Three Fiber y Spline para la figura 3D interactiva, narrativa por scroll con GSAP a través de su proceso de 7 pasos, y un flujo de brief de 60 segundos.",
    },
    stats: [
      ["3D", { en: "FIGURE VIEWER", es: "VISOR DE FIGURA" }],
      ["07", { en: "CHAPTERS", es: "CAPÍTULOS" }],
      ["60s", { en: "BRIEF FLOW", es: "FLUJO DE BRIEF" }],
    ],
    live: { href: "https://crpozo.github.io/themed-motion/" },
    image: "/portfolio/tm-site-hero.webp",
    caption: { en: "REACT · R3F · SPLINE · GSAP", es: "REACT · R3F · SPLINE · GSAP" },
    tilt: 2,
    gallery: [
      { src: "/portfolio/tm-site-work.webp", label: { en: "PROJECT GALLERY", es: "GALERÍA DE PROYECTOS" } },
      { src: "/portfolio/tm-site-design.webp", label: { en: "DESIGN CHAPTER", es: "CAPÍTULO DE DISEÑO" } },
      { src: "/portfolio/tm-site-finish.webp", label: { en: "FINISHING", es: "ACABADOS" } },
    ],
  },
  {
    // Client under NDA — presented anonymously (US functional-medicine clinic)
    id: "healthcare",
    brand: { en: "US Clinic", es: "Clínica EE. UU." },
    imageFirst: true,
    tag: { en: "HEALTHCARE · AI AGENT · US", es: "SALUD · AGENTE IA · EE. UU." },
    title: {
      en: "An AI agent that runs medical billing end to end",
      es: "Un agente de IA que opera la facturación médica de punta a punta",
    },
    body: {
      en: "For a functional-medicine clinic in the US, our agent in production handles the full billing cycle: processing insurance claims in eClinicalWorks, navigating Blue Shield submissions, and keeping documentation pipelines moving. Its companion tool, Plan Profile, analyzes policy documents (EOC/SPD) and builds medical-condition pages for the clinic's site.",
      es: "Para una clínica de medicina funcional en EE. UU., nuestro agente en producción maneja el ciclo completo de facturación: procesa reclamos de seguros en eClinicalWorks, navega los envíos a Blue Shield y mantiene los pipelines de documentación en movimiento. Su herramienta complementaria, Plan Profile, analiza documentos de pólizas (EOC/SPD) y construye páginas de condiciones médicas para el sitio de la clínica.",
    },
    stats: [
      ["24/7", { en: "AGENT IN PRODUCTION", es: "AGENTE EN PRODUCCIÓN" }],
      [{ en: "End-to-end", es: "Punta a punta" }, { en: "BILLING CYCLE", es: "CICLO DE FACTURACIÓN" }],
      ["EOC/SPD", { en: "POLICY ANALYSIS", es: "ANÁLISIS DE PÓLIZAS" }],
    ],
    image: "/art/healthcare.webp",
    caption: { en: "PYTHON · PLAYWRIGHT · LLMs", es: "PYTHON · PLAYWRIGHT · LLMs" },
    tilt: -2,
  },
  {
    id: "fence",
    brand: { en: "Western Fence Supply", es: "Western Fence Supply" },
    imageFirst: false,
    tag: { en: "DISTRIBUTION · ODOO · US", es: "DISTRIBUCIÓN · ODOO · EE. UU." },
    title: {
      en: "From Excel to a CRM that routes itself",
      es: "De Excel a un CRM que se enruta solo",
    },
    body: {
      en: "Full CRM migration from spreadsheets to Odoo, with round-robin lead routing and automatic assignment by each rep's language. We also built a custom delivery module for multi-stop truck routes on Odoo.sh, ran end-to-end QA on the WordPress site, and shipped the internal Training Companion plugin.",
      es: "Migración completa del CRM de hojas de cálculo a Odoo, con enrutamiento round-robin de leads y asignación automática según el idioma de cada representante. También construimos un módulo custom de entregas para rutas de camiones multi-parada sobre Odoo.sh, hicimos QA integral del sitio WordPress y entregamos el plugin interno Training Companion.",
    },
    stats: [
      [{ en: "Excel → Odoo", es: "Excel → Odoo" }, { en: "CRM MIGRATION", es: "MIGRACIÓN DE CRM" }],
      [{ en: "Round-robin", es: "Round-robin" }, { en: "LEAD ROUTING", es: "RUTEO DE LEADS" }],
      [{ en: "Multi-stop", es: "Multi-parada" }, { en: "TRUCK ROUTES", es: "RUTAS DE CAMIÓN" }],
    ],
    image: "/art/product.webp",
    caption: { en: "ODOO.SH · PYTHON · WORDPRESS", es: "ODOO.SH · PYTHON · WORDPRESS" },
    tilt: 1.6,
  },
  {
    id: "usfq",
    brand: { en: "USFQ", es: "USFQ" },
    imageFirst: true,
    tag: { en: "EDUCATION · EVENTS · iOS", es: "EDUCACIÓN · EVENTOS · iOS" },
    title: {
      en: "EventFlow: campus events, with an app in the App Store",
      es: "EventFlow: eventos del campus, con app en el App Store",
    },
    body: {
      en: "An event-management platform for Universidad San Francisco de Quito, with a published iOS app and an AI-powered survey module — delivered in a two-week sprint.",
      es: "Una plataforma de gestión de eventos para la Universidad San Francisco de Quito, con app iOS publicada y un módulo de encuestas potenciado por IA — entregada en un sprint de dos semanas.",
    },
    stats: [
      ["iOS", { en: "IN THE APP STORE", es: "EN EL APP STORE" }],
      [{ en: "2 weeks", es: "2 semanas" }, { en: "SPRINT TO DELIVERY", es: "SPRINT DE ENTREGA" }],
      ["AI", { en: "SURVEY MODULE", es: "MÓDULO DE ENCUESTAS" }],
    ],
    image: "/art/eventflow.webp",
    caption: { en: "EVENTFLOW · iOS · AI", es: "EVENTFLOW · iOS · IA" },
    tilt: -2,
  },
  {
    id: "carcompra",
    brand: { en: "CarCompraCorp", es: "CarCompraCorp" },
    imageFirst: false,
    tag: { en: "AUTOMOTIVE · LEADS", es: "AUTOMOTRIZ · LEADS" },
    title: {
      en: "WhatsApp and Instagram leads, routed automatically",
      es: "Leads de WhatsApp e Instagram, distribuidos automáticamente",
    },
    body: {
      en: "Lead capture and automatic distribution from WhatsApp and Instagram to the sales team, built on Meta's WhatsApp Cloud API and AWS serverless — shipped to production in one week.",
      es: "Captura y distribución automática de leads desde WhatsApp e Instagram hacia el equipo de ventas, sobre la Cloud API de WhatsApp de Meta y AWS serverless — lanzado a producción en una semana.",
    },
    stats: [
      [{ en: "1 week", es: "1 semana" }, { en: "TO PRODUCTION", es: "A PRODUCCIÓN" }],
      ["2", { en: "LEAD CHANNELS", es: "CANALES DE LEADS" }],
    ],
    image: "/art/leads.webp",
    caption: { en: "META CLOUD API · AWS", es: "META CLOUD API · AWS" },
    tilt: 1.8,
  },
  {
    id: "parc",
    brand: { en: "PARC Home Care", es: "PARC Home Care" },
    imageFirst: true,
    tag: { en: "HOME CARE · MOBILE · US", es: "HOME CARE · MÓVIL · EE. UU." },
    title: {
      en: "PARC Connect, in both app stores",
      es: "PARC Connect, en las dos tiendas de apps",
    },
    body: {
      en: "A client-portal mobile app for a US home-care agency, published on the App Store and Google Play, alongside the corporate website — including transactional email setup and fixing Google indexing issues.",
      es: "Una app móvil de portal para una agencia de cuidado en el hogar en EE. UU., publicada en App Store y Google Play, junto con el sitio web corporativo — incluyendo la configuración de email transaccional y la resolución de problemas de indexación en Google.",
    },
    stats: [
      ["2", { en: "APP STORES", es: "TIENDAS DE APPS" }],
      ["Flutter", { en: "ONE CODEBASE", es: "UN SOLO CÓDIGO" }],
    ],
    image: "/art/homecare.webp",
    caption: { en: "FLUTTER · WORDPRESS · SES", es: "FLUTTER · WORDPRESS · SES" },
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

  return (
    <div style={{ position: "relative", width: "100%", overflow: "clip", background: "#fff" }}>
      <SiteHeader active="work" megaMenus />

      {/* page header — reference: bold title left, mono meta right */}
      <section style={{ background: "#fff", padding: "84px 0 30px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div>
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
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: "#6b6875", maxWidth: 540, margin: "20px 0 0" }}>
            {es
              ? "Una década de productos en producción — de portales universitarios a comercio automatizado."
              : "A decade of products in production — from university portals to automated commerce."}
          </p>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "40px 0 90px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          {CASES.map((c, i) => {
            const num = String(i + 1).padStart(2, "0");
            const kicker = `${num} — ${c.brand[lang].toUpperCase()} · ${c.tag[lang]}`;

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
                <div style={{ overflow: "hidden" }}>
                <div className="stat-strip" style={{ display: "flex", flexWrap: "wrap", rowGap: 16, marginLeft: -25 }}>
                  {c.stats.map(([v, l]) => (
                    <div
                      key={l.en}
                      className="stat-cell"
                      style={{
                        paddingRight: 24,
                        paddingLeft: 24,
                        borderLeft: "1px solid rgba(14,13,18,.12)",
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
                    <div style={{ aspectRatio: "16/9", borderRadius: 10, overflow: "hidden", background: "#000", position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.image}
                        alt={es ? `Proyecto ${c.brand.es}` : `${c.brand.en} project`}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <PolaroidWell brand={c.brand[lang]} es={es} />
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, padding: "0 2px 2px" }}>
                    <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-.01em", color: "var(--ink)" }}>{c.brand[lang]}</span>
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
                          <div style={{ aspectRatio: "16/9", borderRadius: 8, overflow: "hidden", background: "#000", position: "relative" }}>
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

    </div>
  );
}
