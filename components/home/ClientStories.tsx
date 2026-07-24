"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "../i18n";

const MONO = "var(--mono)";

const overlay =
  "linear-gradient(180deg,rgba(10,8,16,.28) 0%,transparent 30%,transparent 45%,rgba(10,8,16,.72) 100%)";

type Bi = { en: string; es: string };
type Project = {
  span: "pf-4" | "pf-3" | "pf-2";
  tall?: boolean;
  brand: string;
  img: string;
  href: string;
  stat?: string;
  title?: Bi;
  meta: Bi;
};

// A bento grid over the 6-column track: row 1 = 4+2, row 2 = 2+2+2, row 3 = 3+3.
const PROJECTS: Project[] = [
  {
    span: "pf-4",
    tall: true,
    brand: "USFQ",
    img: "/portfolio/eventflow-banner.webp",
    href: "/work#usfq",
    title: { en: "How USFQ shipped EventFlow on the App Store", es: "Cómo USFQ lanzó EventFlow en el App Store" },
    meta: { en: "EVENTS · iOS · AI SURVEYS", es: "EVENTOS · iOS · ENCUESTAS IA" },
  },
  {
    span: "pf-2",
    tall: true,
    brand: "Helixona",
    img: "/art/helixona-tall.webp",
    href: "/work#healthcare",
    stat: "24/7",
    meta: { en: "AI MEDICAL-BILLING AGENT", es: "AGENTE DE FACTURACIÓN IA" },
  },
  {
    span: "pf-2",
    brand: "Western Fence Supply",
    img: "/art/product.webp",
    href: "/work#fence",
    stat: "Excel → Odoo",
    meta: { en: "CRM + DELIVERY ROUTES", es: "CRM + RUTAS DE ENTREGA" },
  },
  {
    span: "pf-2",
    brand: "CarCompraCorp",
    img: "/art/leads.webp",
    href: "/work#carcompra",
    title: { en: "Leads from Meta, answered by AI", es: "Leads de Meta, respondidos por IA" },
    meta: { en: "WHATSAPP · INSTAGRAM · AI", es: "WHATSAPP · INSTAGRAM · IA" },
  },
  {
    span: "pf-2",
    brand: "PARC Home Care",
    img: "/art/parc-login.webp",
    href: "/work#parc",
    title: { en: "PARC Connect home-care app", es: "App de cuidado PARC Connect" },
    meta: { en: "FLUTTER · iOS + ANDROID", es: "FLUTTER · iOS + ANDROID" },
  },
  {
    span: "pf-3",
    brand: "ThemedMotion",
    img: "/portfolio/tm-site-hero.webp",
    href: "/work#themedmotion",
    title: { en: "An interactive 3D portfolio on the web", es: "Un portafolio 3D interactivo en la web" },
    meta: { en: "WEBGL · THREE.JS", es: "WEBGL · THREE.JS" },
  },
  {
    span: "pf-3",
    brand: "CarCompra",
    img: "/art/carcrm.webp",
    href: "/work#carcompra-crm",
    title: { en: "A seller CRM wired to Meta & ads", es: "Un CRM de vendedores conectado a Meta y pautas" },
    meta: { en: "CUSTOM CRM · AWS", es: "CRM A MEDIDA · AWS" },
  },
];

export function ClientStories() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section id="stories" style={{ position: "relative", background: "#fff", padding: "110px 0 0" }}>
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
          {es ? "Equipos que construyen con MindfulTech" : "Teams build with MindfulTech"}
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
          {es ? "Mira cómo nuestros clientes lanzan productos centrados en personas con el lab." : "See how our clients ship people-first products with the lab."}
        </p>

        <div className="pf-grid">
          {PROJECTS.map((p) => (
            <StoryCard key={p.href} project={p} lang={lang} />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", margin: "48px 0 0" }}>
          <Link
            href="/work"
            className="btn-dark"
            style={{
              textDecoration: "none",
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: ".12em",
              background: "#0e0d12",
              color: "#fff",
              padding: "15px 24px",
              borderRadius: 6,
            }}
          >
            {es ? "VER TODOS LOS CASOS" : "VIEW ALL WORK"}
          </Link>
        </div>
      </div>
    </section>
  );
}

function StoryCard({ project: p, lang }: { project: Project; lang: "en" | "es" }) {
  return (
    <Link
      href={p.href}
      className={`story-card pf-card ${p.span}${p.tall ? " pf-tall" : ""}`}
      style={{
        position: "relative",
        display: "block",
        textDecoration: "none",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* zooming media layer (image + gradient) */}
      <div className="story-media" style={{ position: "absolute", inset: 0, background: "#141126" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.img} alt={p.brand} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: overlay, pointerEvents: "none", zIndex: 1 }} />
      <span style={brand}>{p.brand}</span>
      <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, pointerEvents: "none", zIndex: 2 }}>
        {p.stat ? (
          <div style={bigStat}>{p.stat}</div>
        ) : (
          <div
            style={{
              color: "#fff",
              fontWeight: 500,
              fontSize: "clamp(17px,1.5vw,22px)",
              lineHeight: 1.3,
              letterSpacing: "-.01em",
              maxWidth: 420,
            }}
          >
            {p.title?.[lang]}
          </div>
        )}
        <div style={metaLine}>{p.meta[lang]}</div>
      </div>
    </Link>
  );
}

const brand: React.CSSProperties = {
  position: "absolute",
  left: 20,
  top: 18,
  fontWeight: 600,
  fontSize: 18,
  color: "#fff",
  letterSpacing: ".01em",
  zIndex: 2,
};

const metaLine: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10.5,
  letterSpacing: ".12em",
  color: "rgba(255,255,255,.75)",
  marginTop: 10,
};

const bigStat: React.CSSProperties = {
  color: "#fff",
  fontWeight: 500,
  fontSize: "clamp(26px,2vw,38px)",
  letterSpacing: "-.02em",
  lineHeight: 1,
};
