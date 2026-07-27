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
  /* drives the card's tint, ring and CTA — picked from each cover's artwork */
  accent: string;
  title: Bi;
  meta: Bi;
};

// One card per project; hovering expands a card and reveals its story while the
// others recede to a vertical label.
const PROJECTS: Project[] = [
  {
    brand: "USFQ",
    img: "/art/panel-usfq.webp",
    href: "/work#usfq",
    accent: "#e2566b",
    title: { en: "EventFlow, shipped on the App Store", es: "EventFlow, publicada en el App Store" },
    meta: { en: "EVENTS · iOS · AI SURVEYS", es: "EVENTOS · iOS · ENCUESTAS IA" },
  },
  {
    brand: "Helixona",
    img: "/art/panel-helixona.webp",
    href: "/work#healthcare",
    accent: "#dba64a",
    title: { en: "An AI agent that runs medical billing", es: "Un agente de IA que factura en salud" },
    meta: { en: "HEALTHCARE · AI AGENT", es: "SALUD · AGENTE DE IA" },
  },
  {
    brand: "Western Fence Supply",
    img: "/art/panel-wfs.webp",
    href: "/work#fence",
    accent: "#6a9ede",
    title: { en: "Excel → Odoo, with delivery routes", es: "De Excel a Odoo, con rutas de entrega" },
    meta: { en: "CRM · LOGISTICS", es: "CRM · LOGÍSTICA" },
  },
  {
    brand: "CarCompraCorp",
    img: "/art/panel-carcompra.webp",
    href: "/work#carcompra",
    accent: "#52c98d",
    title: { en: "Leads from Meta, answered by AI", es: "Leads de Meta, respondidos por IA" },
    meta: { en: "WHATSAPP · INSTAGRAM · AI", es: "WHATSAPP · INSTAGRAM · IA" },
  },
  {
    brand: "PARC Home Care",
    img: "/art/panel-parc.webp",
    href: "/work#parc",
    accent: "#63aee8",
    title: { en: "PARC Connect, home care in your pocket", es: "PARC Connect, cuidado en tu bolsillo" },
    meta: { en: "FLUTTER · iOS + ANDROID", es: "FLUTTER · iOS + ANDROID" },
  },
  {
    brand: "ThemedMotion",
    img: "/art/panel-themedmotion.webp",
    href: "/work#themedmotion",
    accent: "#e5893f",
    title: { en: "An interactive 3D portfolio on the web", es: "Un portafolio 3D interactivo en la web" },
    meta: { en: "WEBGL · THREE.JS", es: "WEBGL · THREE.JS" },
  },
  {
    brand: "CarCompra",
    img: "/art/panel-carcrm.webp",
    href: "/work#carcompra-crm",
    accent: "#5cc9c2",
    title: { en: "A seller CRM wired to Meta & ads", es: "Un CRM de vendedores conectado a Meta" },
    meta: { en: "CUSTOM CRM · AWS", es: "CRM A MEDIDA · AWS" },
  },
];

/* keep in sync with the .pf-strip gap in globals.css */
const GAP = 14;

export function ClientStories() {
  const { lang } = useLang();
  const es = lang === "es";

  // carousel: four cards per view, arrows step one card at a time
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  const sync = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  React.useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".pf-panel");
    el.scrollBy({ left: dir * (card ? card.offsetWidth + GAP : el.clientWidth / 4), behavior: "smooth" });
  };

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
            color: "#fff",
          }}
        >
          {es ? "Proyectos construidos por MindfulTech" : "Projects built by MindfulTech"}
        </h2>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.5,
            color: "#8f8ba4",
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

      <div className="pf-carousel">
        <div className="pf-strip" ref={trackRef}>
        {PROJECTS.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="pf-panel"
            aria-label={`${p.brand} — ${p.title[lang]}`}
            style={{ "--pf": p.accent } as React.CSSProperties}
          >
            <span className="pf-media" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pf-img" src={p.img} alt="" />
            </span>
            <div className="pf-reveal">
              <div className="pf-eyebrow">{p.brand}</div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 500,
                  fontSize: "clamp(20px,1.45vw,25px)",
                  lineHeight: 1.2,
                  letterSpacing: "-.02em",
                  margin: "13px 0 0",
                }}
              >
                {p.title[lang]}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: ".14em",
                  color: "rgba(255,255,255,.6)",
                  /* the CTA's margin-top:auto collapses to 0 on a full card,
                     so the gap above it lives here */
                  margin: "13px 0 24px",
                }}
              >
                {p.meta[lang]}
              </div>
              {/* not an <a> — the whole card is already the link */}
              <span className="pf-cta">{es ? "VER EL CASO →" : "VIEW CASE STUDY →"}</span>
            </div>
          </Link>
        ))}
        </div>

        <button
          type="button"
          className="pf-nav pf-prev"
          onClick={() => step(-1)}
          disabled={atStart}
          aria-label={es ? "Proyectos anteriores" : "Previous projects"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          className="pf-nav pf-next"
          onClick={() => step(1)}
          disabled={atEnd}
          aria-label={es ? "Siguientes proyectos" : "Next projects"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "44px 24px 0" }}>
        <Link
          href="/work"
          className="btn-white"
          style={{
            textDecoration: "none",
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: ".12em",
            background: "#fff",
            color: "#0d0a1f",
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
