"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "../i18n";

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
  const [idx, setIdx] = React.useState(0);
  // how much of the strip is in view and where — drives the progress bar
  const [prog, setProg] = React.useState({ start: 0, size: 1 });

  const sync = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
    // which card is under the left edge — drives the dots on phones
    const card = el.querySelector<HTMLElement>(".pf-panel");
    const w = card ? card.offsetWidth + GAP : el.clientWidth;
    setIdx(Math.min(PROJECTS.length - 1, Math.max(0, Math.round(el.scrollLeft / w))));
    setProg({ start: el.scrollLeft / el.scrollWidth, size: el.clientWidth / el.scrollWidth });
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

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".pf-panel");
    el.scrollTo({ left: i * ((card?.offsetWidth ?? el.clientWidth) + GAP), behavior: "smooth" });
  };

  return (
    <section id="stories" className="pf-section">
      <div className="pf-inner">
        <div className="pf-copy">
          <span className="pf-kicker">{es ? "PROYECTOS" : "WORK"}</span>
          <h2 className="pf-title">
            {es ? "Proyectos construidos por MindfulTech" : "Projects built by MindfulTech"}
          </h2>
          <p className="pf-sub">
            {es
              ? "Siete productos en producción: explóralos uno a uno."
              : "Seven products in production: explore them one by one."}
          </p>
        </div>

        {/* controls live in the header on desktop and drop under the strip on
            phones (CSS order), so there is one set of arrows, not two */}
        <div className="pf-tools">
          <div className="pf-progress" aria-hidden>
            <span style={{ left: `${prog.start * 100}%`, width: `${prog.size * 100}%` }} />
          </div>
          <div className="pf-arrows">
            <button
              type="button"
              className="pf-nav"
              onClick={() => step(-1)}
              disabled={atStart}
              aria-label={es ? "Proyectos anteriores" : "Previous projects"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            {/* phone-only position indicator — CSS hides it on wider screens.
                role="group", not tablist: the buttons scroll a carousel, they
                don't control tab panels */}
            <div className="pf-dots" role="group" aria-label={es ? "Proyecto" : "Project"}>
              {PROJECTS.map((p, i) => (
                <button
                  key={p.href}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === idx}
                  aria-label={p.brand}
                />
              ))}
            </div>
            <button
              type="button"
              className="pf-nav"
              onClick={() => step(1)}
              disabled={atEnd}
              aria-label={es ? "Siguientes proyectos" : "Next projects"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <Link href="/work" className="pf-all btn-white">
            {es ? "VER TODOS LOS CASOS" : "VIEW ALL WORK"}
          </Link>
        </div>

        <div className="pf-carousel">
          <div className="pf-strip" ref={trackRef}>
            {PROJECTS.map((p, i) => (
              <Link
                key={p.href}
                href={p.href}
                /* seven cards, one destination: without this Next prefetches the
                   same /work payload once per card, mid-scroll */
                prefetch={false}
                className="pf-panel"
                /* no aria-label — the visible content (brand, title, meta, CTA)
                   already names the link */
                style={{ "--pf": p.accent } as React.CSSProperties}
              >
                <span className="pf-media" aria-hidden>
                  <span className="pf-index">{String(i + 1).padStart(2, "0")}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    decoding="async"
                    loading="lazy"
                    width={760}
                    height={1351}
                    className="pf-img"
                    src={p.img}
                    alt=""
                  />
                </span>
                <div className="pf-reveal">
                  <div className="pf-eyebrow">{p.brand}</div>
                  <div className="pf-card-title">{p.title[lang]}</div>
                  <div className="pf-meta">{p.meta[lang]}</div>
                  {/* not an <a> — the whole card is already the link */}
                  <span className="pf-cta">
                    {es ? "VER EL CASO" : "VIEW CASE STUDY"}
                    <span className="pf-cta-arrow" aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
