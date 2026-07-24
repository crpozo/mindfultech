"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "../i18n";

const MONO = "var(--mono)";

type Bi = { en: string; es: string };
type Project = {
  brand: string;
  img: string;
  href: string;
  title: Bi;
  meta: Bi;
};

// One full-height panel per project; hovering expands a panel and reveals its
// title while the others recede.
const PROJECTS: Project[] = [
  {
    brand: "USFQ",
    img: "/portfolio/eventflow-banner.webp",
    href: "/work#usfq",
    title: { en: "EventFlow, shipped on the App Store", es: "EventFlow, publicada en el App Store" },
    meta: { en: "EVENTS · iOS · AI SURVEYS", es: "EVENTOS · iOS · ENCUESTAS IA" },
  },
  {
    brand: "Helixona",
    img: "/art/helixona-tall.webp",
    href: "/work#healthcare",
    title: { en: "An AI agent that runs medical billing", es: "Un agente de IA que factura en salud" },
    meta: { en: "HEALTHCARE · AI AGENT", es: "SALUD · AGENTE DE IA" },
  },
  {
    brand: "Western Fence Supply",
    img: "/art/product.webp",
    href: "/work#fence",
    title: { en: "Excel → Odoo, with delivery routes", es: "De Excel a Odoo, con rutas de entrega" },
    meta: { en: "CRM · LOGISTICS", es: "CRM · LOGÍSTICA" },
  },
  {
    brand: "CarCompraCorp",
    img: "/art/leads.webp",
    href: "/work#carcompra",
    title: { en: "Leads from Meta, answered by AI", es: "Leads de Meta, respondidos por IA" },
    meta: { en: "WHATSAPP · INSTAGRAM · AI", es: "WHATSAPP · INSTAGRAM · IA" },
  },
  {
    brand: "PARC Home Care",
    img: "/art/parc-login.webp",
    href: "/work#parc",
    title: { en: "PARC Connect, home care in your pocket", es: "PARC Connect, cuidado en tu bolsillo" },
    meta: { en: "FLUTTER · iOS + ANDROID", es: "FLUTTER · iOS + ANDROID" },
  },
  {
    brand: "ThemedMotion",
    img: "/portfolio/tm-site-hero.webp",
    href: "/work#themedmotion",
    title: { en: "An interactive 3D portfolio on the web", es: "Un portafolio 3D interactivo en la web" },
    meta: { en: "WEBGL · THREE.JS", es: "WEBGL · THREE.JS" },
  },
  {
    brand: "CarCompra",
    img: "/art/carcrm.webp",
    href: "/work#carcompra-crm",
    title: { en: "A seller CRM wired to Meta & ads", es: "Un CRM de vendedores conectado a Meta" },
    meta: { en: "CUSTOM CRM · AWS", es: "CRM A MEDIDA · AWS" },
  },
];

export function ClientStories() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section id="stories" className="pf-section">
      <div className="pf-head">
        <h2
          style={{
            fontWeight: 500,
            fontSize: "clamp(32px,3.4vw,52px)",
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
            fontSize: 18,
            lineHeight: 1.5,
            color: "#8b8896",
            fontWeight: 400,
            maxWidth: 620,
            margin: "14px auto 0",
          }}
        >
          {es
            ? "Siete productos en producción — explóralos uno a uno."
            : "Seven products in production — explore them one by one."}
        </p>
      </div>

      <div className="pf-strip">
        {PROJECTS.map((p) => (
          <Link key={p.href} href={p.href} className="pf-panel" aria-label={`${p.brand} — ${p.title[lang]}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pf-img" src={p.img} alt="" />
            <span className="pf-scrim" aria-hidden />
            <span className="pf-vlabel">{p.brand}</span>
            <div className="pf-reveal">
              <div style={{ fontWeight: 600, fontSize: 15, color: "rgba(255,255,255,.82)", letterSpacing: ".01em" }}>
                {p.brand}
              </div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 500,
                  fontSize: "clamp(19px,1.6vw,26px)",
                  lineHeight: 1.25,
                  letterSpacing: "-.015em",
                  margin: "8px 0 0",
                  maxWidth: 440,
                }}
              >
                {p.title[lang]}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: ".14em",
                  color: "rgba(255,255,255,.72)",
                  marginTop: 10,
                }}
              >
                {p.meta[lang]}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 44 }}>
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
    </section>
  );
}
