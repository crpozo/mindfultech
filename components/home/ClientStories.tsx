"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "../i18n";

const MONO = "var(--mono)";

type Bi = { en: string; es: string };
type Project = {
  brand: string;
  /** wide cover for the preview */
  img: string;
  href: string;
  /* drives the selected row's rule, the brand colour and the preview glow */
  accent: string;
  title: Bi;
  meta: Bi;
  desc: Bi;
};

// The list on the left, the selected project on the right.
const PROJECTS: Project[] = [
  {
    brand: "Helixona",
    img: "/art/helixona-hero.webp",
    href: "/work#healthcare",
    accent: "#dba64a",
    title: { en: "An AI agent that runs medical billing", es: "Un agente de IA que factura en salud" },
    meta: { en: "HEALTHCARE · AI AGENT · 24/7", es: "SALUD · AGENTE DE IA · 24/7" },
    desc: {
      en: "Claims, coding and follow-ups handled end to end inside the clinic's tools. A person signs off only where it matters.",
      es: "Reclamos, codificación y seguimientos de punta a punta dentro de las herramientas de la clínica. Una persona firma solo donde importa.",
    },
  },
  {
    brand: "USFQ",
    img: "/art/eventflow-login-wide.webp",
    href: "/work#usfq",
    accent: "#e2566b",
    title: { en: "EventFlow, shipped on the App Store", es: "EventFlow, publicada en el App Store" },
    meta: { en: "EVENTS · iOS · AI SURVEYS", es: "EVENTOS · iOS · ENCUESTAS IA" },
    desc: {
      en: "Registration, check-in and AI-read surveys for university events, in one app students actually open.",
      es: "Inscripción, check-in y encuestas leídas por IA para eventos universitarios, en una app que los estudiantes sí abren.",
    },
  },
  {
    brand: "Western Fence Supply",
    img: "/art/wfs-hero.webp",
    href: "/work#fence",
    accent: "#6a9ede",
    title: { en: "Excel → Odoo, with delivery routes", es: "De Excel a Odoo, con rutas de entrega" },
    meta: { en: "CRM · LOGISTICS", es: "CRM · LOGÍSTICA" },
    desc: {
      en: "Quotes, inventory and deliveries moved out of spreadsheets into Odoo, with routes planned for every truck.",
      es: "Cotizaciones, inventario y entregas pasaron de hojas de cálculo a Odoo, con rutas planificadas para cada camión.",
    },
  },
  {
    brand: "CarCompraCorp",
    img: "/art/leads.webp",
    href: "/work#carcompra",
    accent: "#52c98d",
    title: { en: "Leads from Meta, answered by AI", es: "Leads de Meta, respondidos por IA" },
    meta: { en: "WHATSAPP · INSTAGRAM · AI", es: "WHATSAPP · INSTAGRAM · IA" },
    desc: {
      en: "Every ad lead gets an answer on WhatsApp in seconds, qualified and handed to a seller with the context ready.",
      es: "Cada lead de anuncios recibe respuesta por WhatsApp en segundos, calificado y entregado a un vendedor con el contexto listo.",
    },
  },
  {
    brand: "PARC Home Care",
    img: "/art/homecare.webp",
    href: "/work#parc",
    accent: "#63aee8",
    title: { en: "PARC Connect, home care in your pocket", es: "PARC Connect, cuidado en tu bolsillo" },
    meta: { en: "FLUTTER · iOS + ANDROID", es: "FLUTTER · iOS + ANDROID" },
    desc: {
      en: "Families see visits, notes and caregivers in one place; the agency runs scheduling from the same app.",
      es: "Las familias ven visitas, notas y cuidadores en un solo lugar; la agencia programa desde la misma app.",
    },
  },
];
const TOTAL = 7;

export function ClientStories() {
  const { lang } = useLang();
  const es = lang === "es";
  const [sel, setSel] = React.useState(0);
  const p = PROJECTS[sel];
  return (
    <section id="stories" className="pf-section">
      <div className="pj-wrap">
        <div className="pj-head">
          <span className="pj-kicker">{es ? "PROYECTOS" : "PROJECTS"}</span>
          <h2 className="pj-title">{es ? "Construidos por MindfulTech" : "Built by MindfulTech"}</h2>
        </div>
        <div className="pj-grid">
          <div className="pj-list" role="tablist" aria-label={es ? "Proyectos" : "Projects"}>
            {PROJECTS.map((x, i) => (
              <button
                key={x.href}
                type="button"
                role="tab"
                aria-selected={i === sel}
                className={`pj-row ${i === sel ? "pj-row-on" : ""}`}
                style={{ "--pj": x.accent } as React.CSSProperties}
                onClick={() => setSel(i)}
                onMouseEnter={() => setSel(i)}
                onFocus={() => setSel(i)}
              >
                <span className="pj-row-brand">{x.brand.toUpperCase()}</span>
                <span className="pj-row-title">{x.title[lang]}</span>
                <span className="pj-row-n">{String(i + 1).padStart(2, "0")}</span>
              </button>
            ))}
            <Link href="/work" className="pj-all">
              {es ? `TODOS LOS ${TOTAL} PROYECTOS` : `ALL ${TOTAL} PROJECTS`} <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="pj-preview" style={{ "--pj": p.accent } as React.CSSProperties} role="tabpanel">
            <Link href={p.href} prefetch={false} className="pj-media" aria-label={p.title[lang]}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={p.img} className="pj-img" src={p.img} alt="" decoding="async" loading="lazy" width={1200} height={675} />
            </Link>
            <div className="pj-foot">
              <div className="pj-foot-text">
                <div className="pj-meta">{p.meta[lang]}</div>
                <p className="pj-desc">{p.desc[lang]}</p>
              </div>
              <Link href={p.href} prefetch={false} className="pj-cta">
                {es ? "VER EL CASO" : "CASE STUDY"} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
