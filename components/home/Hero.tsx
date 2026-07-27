"use client";

import * as React from "react";
import { useLang } from "../i18n";
import { Brain3D } from "./Brain3D";

const MONO = "var(--mono)";

function openForm(e: React.MouseEvent) {
  e.preventDefault();
  window.dispatchEvent(new CustomEvent("mt:open-form"));
}

// Every client logo renders at this exact height for a uniform logo wall.
const LOGO_H = 30;
const MARQUEE: { name: string; img?: string; h?: number }[] = [
  { name: "USFQ", img: "/logo-usfq.svg", h: LOGO_H },
  { name: "ThemedMotion", img: "/portfolio/themedmotion-logo.webp", h: LOGO_H },
  { name: "Helixona", img: "/helixona-logo.png", h: LOGO_H },
  { name: "Western Fence Supply", img: "/wfs-logo.svg", h: LOGO_H },
  { name: "CarCompraCorp" },
  { name: "PARC Home Care", img: "/parc-logo.png", h: LOGO_H },
];

// Discipline chips floating around the 3D brain (percent coords of the stage).
// `key` matches BRAIN_REGIONS — clicking one flies the brain to that region
// and opens the note underneath.
const CHIPS: {
  key: string;
  label: { en: string; es: string };
  x: number;
  y: number;
  note: { en: string; es: string };
}[] = [
  {
    key: "ux",
    label: { en: "UX RESEARCH", es: "UX RESEARCH" },
    x: 15,
    y: 27,
    note: {
      en: "We listen first: goals, users and constraints. Research-driven prototypes get tested with real people before a line of production code is written.",
      es: "Primero escuchamos: objetivos, usuarios y restricciones. Los prototipos nacen de investigación y se prueban con personas reales antes de escribir código de producción.",
    },
  },
  {
    key: "agents",
    label: { en: "AI AGENTS", es: "AGENTES DE IA" },
    x: 85,
    y: 24,
    note: {
      en: "Agents that do real work in production — like the one running a US clinic's billing cycle end to end, with a human check where it counts.",
      es: "Agentes que hacen trabajo real en producción — como el que corre el ciclo de facturación de una clínica en EE. UU. de inicio a fin, con revisión humana donde importa.",
    },
  },
  {
    key: "cloud",
    label: { en: "AWS CLOUD", es: "AWS CLOUD" },
    x: 88,
    y: 60,
    note: {
      en: "Serverless on AWS: the infrastructure behind custom CRMs, transactional email and integrations — monitored and accounted for after launch.",
      es: "Serverless sobre AWS: la infraestructura detrás de CRMs a medida, email transaccional e integraciones — monitoreada y con responsabilidad después del launch.",
    },
  },
  {
    key: "code",
    label: { en: "FULL-STACK CODE", es: "CÓDIGO FULL-STACK" },
    x: 15,
    y: 66,
    note: {
      en: "Next.js, Python and Odoo, shipped weekly as working software. Automated tests, QA and a security review before every release.",
      es: "Next.js, Python y Odoo, entregados semanalmente como software funcionando. Pruebas automatizadas, QA y revisión de seguridad antes de cada release.",
    },
  },
  {
    key: "mobile",
    label: { en: "MOBILE APPS", es: "APPS MÓVILES" },
    x: 50,
    y: 88,
    note: {
      en: "Apps that reach the stores: EventFlow on the App Store for USFQ, PARC Connect on both stores from a single Flutter codebase.",
      es: "Apps que llegan a las tiendas: EventFlow en el App Store para la USFQ, y PARC Connect en ambas tiendas desde un solo código Flutter.",
    },
  },
];

export function Hero() {
  const { lang } = useLang();
  const es = lang === "es";
  const marqRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState<string | null>(null);
  const chip = CHIPS.find((c) => c.key === active) ?? null;

  React.useEffect(() => {
    // TRUSTED BY marquee — driven here (not CSS) so we can wrap on the exact
    // one-set period and it never runs out of logos on wide screens.
    const marq = marqRef.current;
    if (!marq) return;
    const SET = MARQUEE.length; // logos per repeat
    let marqX = 0;
    let last = performance.now();
    let raf = 0;
    const frame = () => {
      const now = performance.now();
      const dtMs = Math.min(120, now - last);
      last = now;
      marqX -= 42 * (dtMs / 1000);
      const kids = marq.children;
      // exact width of one repeat (incl. gaps) so the seam is invisible
      const period =
        kids.length > SET
          ? (kids[SET] as HTMLElement).offsetLeft -
            (kids[0] as HTMLElement).offsetLeft
          : marq.scrollWidth / 2;
      if (period > 0 && marqX <= -period) marqX += period;
      marq.style.transform = "translate3d(" + marqX.toFixed(1) + "px,0,0)";
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      id="home"
      style={{
        position: "relative",
        flex: "1 0 auto",
        minHeight: 560,
        display: "flex",
        alignItems: "center",
        background:
          "linear-gradient(180deg,#edf2fa 0%,#e7edf8 55%,#e1e8f4 100%)",
        overflow: "hidden",
      }}
    >
      {/* one centered row: copy left, 3D brain right (together.ai layout).
          DOM keeps the stage first; row-reverse puts the copy on the left. */}
      <div
        className="hero-row"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 1360,
          margin: "0 auto",
          // left inset 41 matches the header logo (navrow 18 + nav border 1 +
          // nav padding 22) so the headline lines up with the mark
          padding: "10px 41px 90px",
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
      {/* animation stage — the neural brain in 3D */}
      <div
        className="hero-stage"
        style={{
          flex: "0 1 600px",
          width: "600px",
          minHeight: 520,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(620px,100%)",
            aspectRatio: "640 / 520",
          }}
        >
          <Brain3D focus={active} />
          {CHIPS.map((c, i) => {
            const on = active === c.key;
            return (
              <div
                key={c.key}
                style={{
                  position: "absolute",
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  transform: "translate(-50%,-50%)",
                  zIndex: on ? 3 : 2,
                  opacity: 0,
                  animation: `mtChipIn .6s ease ${900 + i * 150}ms forwards`,
                }}
              >
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(on ? null : c.key)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    background: on ? "#24344E" : "rgba(255,255,255,.9)",
                    border: `1.5px solid ${on ? "#24344E" : "rgba(79,174,135,.35)"}`,
                    borderRadius: 999,
                    padding: "8px 14px",
                    fontFamily: MONO,
                    fontSize: 10.5,
                    fontWeight: 500,
                    letterSpacing: ".14em",
                    color: on ? "#fff" : "#24344E",
                    boxShadow: on
                      ? "0 16px 34px -14px rgba(36,52,78,.55)"
                      : "0 12px 28px -14px rgba(14,13,18,.3)",
                    whiteSpace: "nowrap",
                    transition: "background .25s ease, color .25s ease, border-color .25s ease",
                    /* the bob pauses while open so the note stays put */
                    animation: on
                      ? "none"
                      : `mtChipBob ${3.4 + i * 0.4}s ease-in-out ${-i * 1.1}s infinite`,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: on ? "var(--accent)" : "#4FAE87",
                      flex: "none",
                    }}
                  />
                  {c.label[lang]}
                </button>
              </div>
            );
          })}

          {chip && (
            <div
              key={chip.key}
              style={{
                /* below the stage, not inside it — it would land on the
                   MOBILE APPS chip; absolute so opening shifts no layout.
                   Centering lives here because mtfade animates transform. */
                position: "absolute",
                left: "50%",
                top: "calc(100% + 4px)",
                transform: "translateX(-50%)",
                zIndex: 4,
                width: "min(430px, 92%)",
              }}
            >
            <div
              style={{
                background: "rgba(255,255,255,.95)",
                border: "1px solid rgba(36,52,78,.1)",
                borderRadius: 14,
                padding: "18px 20px 16px",
                boxShadow: "0 24px 60px -28px rgba(14,13,18,.5)",
                animation: "mtfade .35s ease both",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    fontWeight: 500,
                    letterSpacing: ".14em",
                    color: "var(--accent-deep)",
                  }}
                >
                  {chip.label[lang]}
                </span>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  aria-label={es ? "Cerrar" : "Close"}
                  style={{
                    marginLeft: "auto",
                    width: 24,
                    height: 24,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    border: "none",
                    background: "#f1f2f6",
                    color: "#6b6875",
                    cursor: "pointer",
                    fontSize: 14,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.55, color: "#4a4757" }}>
                {chip.note[lang]}
              </p>
            </div>
            </div>
          )}
        </div>
      </div>

      {/* hero copy */}
      <div className="hero-copy" style={{ flex: "0 1 600px", minWidth: 0 }}>
        <div>
          <h1
            style={{
              fontWeight: 500,
              fontSize: "clamp(40px,4.2vw,70px)",
              lineHeight: 1.04,
              letterSpacing: "-.025em",
              margin: 0,
              color: "var(--ink)",
            }}
          >
            {es ? "Construyendo el futuro" : "Building the future"}
            <br />
            <span style={{ color: "#9aa0ad" }}>{es ? "con software de IA" : "with AI software"}</span>
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: 1.5,
              color: "#4c4a55",
              fontWeight: 400,
              margin: "24px 0 0",
              maxWidth: 560,
            }}
          >
            {es ? "Laboratorio de software full-stack, impulsado por investigación UX e IA aplicada." : "Full-stack software lab, powered by UX research and applied AI."}
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
            <a
              href="#contact"
              onClick={openForm}
              className="btn-dark"
              style={ctaDark}
            >
              {es ? "EMPIEZA A CONSTRUIR" : "START BUILDING"}
            </a>
            <a
              href="#contact"
              onClick={openForm}
              className="btn-light"
              style={{
                textDecoration: "none",
                fontFamily: MONO,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: ".12em",
                background: "#fff",
                color: "var(--ink)",
                border: "1.5px solid rgba(14,13,18,.28)",
                padding: "14.5px 26px",
                borderRadius: 6,
                boxShadow: "0 8px 20px -14px rgba(14,13,18,.35)",
                transition: "background .2s",
              }}
            >
              {es ? "HABLEMOS" : "CONTACT SALES"}
            </a>
          </div>
        </div>
      </div>
      </div>

      {/* TRUSTED BY marquee */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          padding: "16px 48px",
          display: "flex",
          alignItems: "center",
          gap: 44,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: ".16em",
            color: "#8b8896",
            flex: "none",
          }}
        >
          {es ? "CONFÍAN EN NOSOTROS" : "TRUSTED BY"}
        </span>
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            WebkitMaskImage:
              "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
            maskImage:
              "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
          }}
        >
          <div
            ref={marqRef}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 72,
              width: "max-content",
              willChange: "transform",
            }}
          >
            {/* Enough copies that the trailing sets always fill the widest
                viewport; the rAF loop wraps on one set's exact width. */}
            {Array.from({ length: 6 }).flatMap((_, s) =>
              MARQUEE.map((m) =>
                m.img ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={s + "-" + m.name}
                    src={m.img}
                    alt={m.name}
                    style={{
                      height: m.h || 26,
                      width: "auto",
                      display: "block",
                      opacity: 0.5,
                      // uniform dark silhouette so every client logo reads the
                      // same on the light strip — incl. Helixona's white mark
                      filter: "brightness(0)",
                    }}
                  />
                ) : (
                  <span
                    key={s + "-" + m.name}
                    style={{
                      fontWeight: 600,
                      fontSize: 19,
                      color: "#0e0d12",
                      opacity: 0.4,
                      letterSpacing: ".02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.name}
                  </span>
                )
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const ctaDark: React.CSSProperties = {
  textDecoration: "none",
  fontFamily: MONO,
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: ".12em",
  background: "#0e0d12",
  color: "#fff",
  padding: "16px 26px",
  borderRadius: 6,
};
