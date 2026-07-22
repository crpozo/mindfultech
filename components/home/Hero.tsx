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
const CHIPS: { label: { en: string; es: string }; x: number; y: number }[] = [
  { label: { en: "UX RESEARCH", es: "UX RESEARCH" }, x: 15, y: 27 },
  { label: { en: "AI AGENTS", es: "AGENTES DE IA" }, x: 85, y: 24 },
  { label: { en: "AWS CLOUD", es: "AWS CLOUD" }, x: 88, y: 60 },
  { label: { en: "FULL-STACK CODE", es: "CÓDIGO FULL-STACK" }, x: 15, y: 66 },
  { label: { en: "MOBILE APPS", es: "APPS MÓVILES" }, x: 50, y: 88 },
];

export function Hero() {
  const { lang } = useLang();
  const es = lang === "es";
  const marqRef = React.useRef<HTMLDivElement>(null);

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
          padding: "10px 48px 90px",
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "center",
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
          <Brain3D />
          {CHIPS.map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${c.x}%`,
                top: `${c.y}%`,
                transform: "translate(-50%,-50%)",
                pointerEvents: "none",
                opacity: 0,
                animation: `mtChipIn .6s ease ${900 + i * 150}ms forwards`,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,.9)",
                  border: "1.5px solid rgba(79,174,135,.35)",
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontFamily: MONO,
                  fontSize: 10.5,
                  fontWeight: 500,
                  letterSpacing: ".14em",
                  color: "#24344E",
                  boxShadow: "0 12px 28px -14px rgba(14,13,18,.3)",
                  backdropFilter: "blur(6px)",
                  whiteSpace: "nowrap",
                  animation: `mtChipBob ${3.4 + i * 0.4}s ease-in-out ${-i * 1.1}s infinite`,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#4FAE87",
                    flex: "none",
                  }}
                />
                {c.label[lang]}
              </div>
            </div>
          ))}
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
