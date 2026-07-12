"use client";

import * as React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Pill, FooterLinks, DarkCTA } from "@/components/internal/Shared";
import { useLang, type Lang } from "@/components/i18n";

const MONO = "var(--mono)";

type Bi = { en: string; es: string };

type Case = {
  id: string;
  brand: string;
  imageFirst: boolean;
  imageBg: string;
  image?: string;
  imageFit?: "cover" | "contain";
  link?: { label: Bi; href: string };
  gallery?: { src: string; alt: string }[];
  tag: Bi;
  title: Bi;
  body: Bi;
  stats: [string, Bi][];
};

const CASES: Case[] = [
  {
    id: "themedmotion",
    brand: "ThemedMotion",
    imageFirst: true,
    imageBg: "#000",
    image: "/portfolio/tm-site-hero.webp",
    imageFit: "contain",
    link: { label: { en: "VISIT LIVE SITE →", es: "VER SITIO EN VIVO →" }, href: "https://crpozo.github.io/themed-motion/" },
    gallery: [
      { src: "/portfolio/tm-site-design.webp", alt: "ThemedMotion site — concept design chapter" },
      { src: "/portfolio/tm-site-eng.webp", alt: "ThemedMotion site — interactive 3D engineering viewer" },
      { src: "/portfolio/tm-site-finish.webp", alt: "ThemedMotion site — finishing and textures chapter" },
    ],
    tag: { en: "WEB · 3D · ANIMATRONICS", es: "WEB · 3D · ANIMATRÓNICOS" },
    title: {
      en: "An immersive site for a Dutch animatronics studio",
      es: "Un sitio inmersivo para un estudio de animatrónicos en Países Bajos",
    },
    body: {
      en: "ThemedMotion (by P&P Projects, Netherlands) designs and builds animatronics for theme parks worldwide. We crafted their web experience: scroll-driven storytelling across their 7-step process, an interactive drag-to-rotate 3D figure, and a 60-second brief flow.",
      es: "ThemedMotion (de P&P Projects, Países Bajos) diseña y construye animatrónicos para parques temáticos de todo el mundo. Creamos su experiencia web: narrativa guiada por scroll a través de su proceso de 7 pasos, una figura 3D interactiva para rotar, y un flujo de brief de 60 segundos.",
    },
    stats: [
      ["3D", { en: "interactive figure viewer", es: "visor interactivo de figura" }],
      ["07", { en: "scroll-driven chapters", es: "capítulos guiados por scroll" }],
      ["60s", { en: "project brief flow", es: "flujo de brief de proyecto" }],
    ],
  },
  {
    id: "usfq",
    brand: "USFQ",
    imageFirst: false,
    imageBg: "linear-gradient(150deg,#2a2736,#141126)",
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
      ["3x", { en: "adoption after relaunch", es: "adopción tras el relanzamiento" }],
      ["2,400", { en: "questions answered weekly", es: "preguntas respondidas por semana" }],
      ["4.8/5", { en: "student satisfaction", es: "satisfacción estudiantil" }],
    ],
  },
  {
    id: "helixona",
    brand: "Helixona",
    imageFirst: true,
    imageBg: "linear-gradient(150deg,#39323f,#191521)",
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
      ["80%", { en: "less manual processing", es: "menos procesamiento manual" }],
      ["12 min", { en: "average order turnaround", es: "tiempo promedio por pedido" }],
    ],
  },
  {
    id: "kruger",
    brand: "KrugerLabs",
    imageFirst: false,
    imageBg: "linear-gradient(150deg,#2c3340,#151a24)",
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
      ["3×", { en: "platforms, one system", es: "plataformas, un sistema" }],
      ["-40%", { en: "UI maintenance time", es: "tiempo de mantenimiento de UI" }],
    ],
  },
];

export function WorkBody() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <div style={{ position: "relative", width: "100%", overflow: "clip", background: "#fff" }}>
      <SiteHeader active="work" megaMenus />

      <section style={{ background: "linear-gradient(180deg,#ffffff,#f4f7fc)", padding: "90px 0 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 40px" }}>
          <Pill>{es ? "CASOS DE ESTUDIO" : "CASE STUDIES"}</Pill>
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
            {es ? "Equipos reales, resultados medidos" : "Real teams, measured outcomes"}
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.55, color: "#6b6875", maxWidth: 560, margin: "22px auto 0" }}>
            {es
              ? "Una década de productos en producción — de portales universitarios a comercio automatizado."
              : "A decade of products in production — from university portals to automated commerce."}
          </p>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "60px 0 20px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px", display: "flex", flexDirection: "column", gap: 26 }}>
          {CASES.map((c) => {
            const image = (
              <div style={{ position: "relative", minHeight: 380, background: c.imageBg, overflow: "hidden" }}>
                {c.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={c.image}
                    alt={`${c.brand} project`}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: c.imageFit ?? "cover" }}
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0 }}>
                    <ImagePlaceholder label={es ? `FOTO DEL PROYECTO ${c.brand.toUpperCase()}` : `${c.brand.toUpperCase()} PROJECT PHOTO`} onDark />
                  </div>
                )}
                <span
                  style={{
                    position: "absolute",
                    left: 20,
                    top: 18,
                    fontWeight: 600,
                    fontSize: 19,
                    color: "#fff",
                    zIndex: 1,
                    textShadow: "0 2px 12px rgba(0,0,0,.55)",
                  }}
                >
                  {c.brand}
                </span>
              </div>
            );
            const text = (
              <div style={{ padding: "clamp(28px,3vw,48px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: ".12em",
                    color: "#44424d",
                    background: "#f1f2f6",
                    padding: "6px 10px",
                    borderRadius: 4,
                    alignSelf: "flex-start",
                  }}
                >
                  {c.tag[lang]}
                </span>
                <h2
                  style={{
                    fontWeight: 500,
                    fontSize: "clamp(24px,2.4vw,34px)",
                    lineHeight: 1.15,
                    letterSpacing: "-.015em",
                    margin: "16px 0 12px",
                  }}
                >
                  {c.title[lang]}
                </h2>
                <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#55525e", margin: "0 0 20px" }}>{c.body[lang]}</p>
                <div style={{ display: "flex", gap: 26, flexWrap: "wrap" }}>
                  {c.stats.map(([v, l]) => (
                    <div key={l.en}>
                      <div style={{ fontWeight: 500, fontSize: 26, letterSpacing: "-.02em", color: "var(--accent)" }}>{v}</div>
                      <div style={{ fontSize: 12.5, color: "#8b8896" }}>{l[lang]}</div>
                    </div>
                  ))}
                </div>
                {c.link && (
                  <a
                    href={c.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-dark"
                    style={{
                      textDecoration: "none",
                      alignSelf: "flex-start",
                      fontFamily: MONO,
                      fontSize: 11.5,
                      fontWeight: 500,
                      letterSpacing: ".12em",
                      background: "#0e0d12",
                      color: "#fff",
                      padding: "13px 20px",
                      borderRadius: 6,
                      marginTop: 22,
                    }}
                  >
                    {c.link.label[lang]}
                  </a>
                )}
              </div>
            );
            return (
              <div
                key={c.id}
                id={c.id}
                style={{
                  border: "1px solid rgba(14,13,18,.09)",
                  borderRadius: 16,
                  overflow: "hidden",
                  scrollMarginTop: 120,
                }}
              >
                <div
                  className="stack-2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: c.imageFirst ? "1.1fr 1fr" : "1fr 1.1fr",
                  }}
                >
                  {c.imageFirst ? (
                    <>
                      {image}
                      {text}
                    </>
                  ) : (
                    <>
                      {text}
                      {image}
                    </>
                  )}
                </div>
                {c.gallery && (
                  <div
                    className="stack-3"
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${c.gallery.length},1fr)`,
                      gap: 3,
                      borderTop: "1px solid rgba(14,13,18,.09)",
                      background: "#f4f4f6",
                    }}
                  >
                    {c.gallery.map((g) => (
                      <div key={g.src} className="story-card" style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "#fff" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={g.src}
                          alt={g.alt}
                          className="story-media"
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ background: "#fff", padding: "70px 0 90px" }}>
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
