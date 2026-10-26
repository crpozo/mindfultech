"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";

/* /concept: the menu of design concepts for mindfultech.ec, each a full page with the real content. */
const CONCEPTS: { slug: string; name: string; ref: string; en: string; es: string; bg: string; fg: string; swatch: string[] }[] = [
  { slug: "collage", name: "Serif + Collage", ref: "design handoff", en: "The current site: serif display, flat geometric collage, hard shadows and the full home with the accordion, projects and the map. Lives at /staging.", es: "El sitio actual: serif display, collage geométrico plano, sombras duras y la home completa con el acordeón, los proyectos y el mapa. Vive en /staging.", bg: "#f4f5f3", fg: "#0e1013", swatch: ["#3dbe7d", "#c9c4f2", "#0e1013"] },
  { slug: "ai-journey", name: "AI Journey / The Dots", ref: "cerebrium.ai", en: "Six cute robots automate an office overnight while the real content scrolls beside them.", es: "Seis robots adorables automatizan una oficina de madrugada mientras el contenido real baja a su lado.", bg: "#0e1013", fg: "#f4f5f3", swatch: ["#3dbe7d", "#bff5cf", "#c9c4f2"] },
  { slug: "heron", name: "Blueprint", ref: "heronaiapp.com", en: "Warm paper, rulers and crosshairs, condensed uppercase type and line drawings of the agent office.", es: "Papel cálido, reglas y cruces, tipografía condensada y planos a línea de la oficina de agentes.", bg: "#efeee8", fg: "#141518", swatch: ["#1f7a4d", "#141518", "#c9c8c0"] },
  { slug: "hut8", name: "Hut 8", ref: "hut8.com", en: "Black and lime, a huge headline and a scroll journey through three layers over a white isometric diagram.", es: "Negro y lima, un titular enorme y un recorrido por tres capas sobre un diagrama isométrico blanco.", bg: "#090909", fg: "#f4f4f1", swatch: ["#d4ff3d", "#f4f4f1", "#262626"] },
  { slug: "cerebrium", name: "Cerebrium", ref: "cerebrium.ai", en: "Deep navy with glowing ribbons, a sans headline with one gradient word, a light why-section with a sticky feature list and product cards, a dark governance block, case cards and a feature cloud.", es: "Azul profundo con cintas luminosas, titular sans con una palabra en gradiente, sección clara con lista fija y tarjetas de producto, bloque oscuro de gobernanza, casos y nube de capacidades.", bg: "#0b0b14", fg: "#ffffff", swatch: ["#0b0b14", "#3dbe7d", "#bff5cf", "#f4f5f7"] },
  { slug: "mix", name: "Mix", ref: "the best of all", en: "Preloader card, serif hero with the collage, the Dots beside real chapters, the layer diagram, sector tiles, the map and the green CTA. One home.", es: "Ficha de arranque, hero serif con collage, los Dots junto a capítulos reales, el diagrama por capas, mosaicos por sector, el mapa y el CTA verde. Una sola home.", bg: "#1f7a4d", fg: "#f4f5f3", swatch: ["#bff5cf", "#c9c4f2", "#0e1013"] },
];

export function ConceptIndex() {
  const { lang, setLang } = useLang();
  const es = lang === "es";
  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f3", color: "#0e1013", fontFamily: "var(--font-outfit), system-ui, sans-serif", padding: "32px 24px 64px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 36 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, color: "inherit", textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} style={{ height: 26, width: "auto" }} />
            <span style={{ fontFamily: "var(--font-jbmono), monospace", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555" }}>{es ? "Conceptos de diseño" : "Design concepts"}</span>
          </Link>
          <div style={{ display: "flex", gap: 14, fontSize: 14, fontWeight: 500 }}>
            <button type="button" onClick={() => setLang("en")} style={{ font: "inherit", border: 0, background: "none", cursor: "pointer", color: lang === "en" ? "#0e1013" : "#888" }}>EN</button>
            <button type="button" onClick={() => setLang("es")} style={{ font: "inherit", border: 0, background: "none", cursor: "pointer", color: lang === "es" ? "#0e1013" : "#888" }}>ES</button>
            <Link href="/" style={{ color: "#1f7a4d", textDecoration: "none" }}>{es ? "Sitio actual →" : "Current site →"}</Link>
          </div>
        </div>
        <h1 style={{ margin: "0 0 10px", fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 400, fontSize: "clamp(40px,6vw,80px)", lineHeight: 0.95, letterSpacing: "-0.02em" }}>{es ? "Seis formas de contar MindfulTech" : "Six ways to tell MindfulTech"}</h1>
        <p style={{ margin: "0 0 40px", fontSize: 17, color: "#333", maxWidth: 640, lineHeight: 1.5 }}>{es ? "Cada concepto es una home completa con el contenido real: servicios, proyectos, cifras y el AI Management Office. Mismo contenido, cinco personalidades." : "Each concept is a full home with the real content: services, work, numbers and the AI Management Office. Same content, five personalities."}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {CONCEPTS.map((c, i) => (
            <Link key={c.slug} href={c.slug === "collage" ? "/staging/#office" : `/concept/${c.slug}`} style={{ display: "flex", flexDirection: "column", gap: 14, padding: 26, minHeight: 300, background: c.bg, color: c.fg, textDecoration: "none", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "8px 8px 0 " + c.swatch[0] }}>
              <span style={{ fontFamily: "var(--font-jbmono), monospace", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7 }}>{es ? "Concepto" : "Concept"} 0{i} / {es ? "ref." : "ref."} {c.ref}</span>
              <b style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 400, fontSize: 40, lineHeight: 1 }}>{c.name}</b>
              <span style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.85 }}>{es ? c.es : c.en}</span>
              <span style={{ marginTop: "auto", display: "flex", gap: 6 }}>{c.swatch.map((h) => <i key={h} style={{ width: 22, height: 22, background: h, border: "1px solid rgba(0,0,0,0.15)" }} />)}<span style={{ marginLeft: "auto", fontWeight: 500 }}>{es ? "Abrir →" : "Open →"}</span></span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
