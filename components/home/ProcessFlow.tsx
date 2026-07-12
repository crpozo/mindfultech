"use client";

import * as React from "react";
import { useLang } from "@/components/i18n";

const MONO = "var(--mono)";

const T = {
  en: {
    title: "How projects run at MindfulTech",
    sub: "From requirements to continuous improvement — one accountable team, end to end.",
    workingWith: "WORKING WITH",
    steps: [
      { title: "Requirements", desc: "We listen first: goals, users, constraints, and what success looks like." },
      { title: "Kick-off", desc: "Roadmap, milestones, and a dedicated senior team — aligned in one session." },
      { title: "UX/UI Design", desc: "Research-driven prototypes, tested with real users before we build." },
      { title: "Implementation", desc: "Weekly demos of working software on a modern, maintainable stack." },
      { title: "Testing", desc: "Automated tests, QA, and security review before every release." },
      { title: "Continuous Improvement", desc: "Monitoring, metrics, and iteration — we stay accountable after launch." },
    ],
  },
  es: {
    title: "Así corren los proyectos en MindfulTech",
    sub: "De los requerimientos a la mejora continua — un solo equipo responsable, de inicio a fin.",
    workingWith: "TRABAJAMOS CON",
    steps: [
      { title: "Requerimientos", desc: "Primero escuchamos: objetivos, usuarios, restricciones y cómo se ve el éxito." },
      { title: "Kick-off", desc: "Roadmap, hitos y un equipo senior dedicado — alineados en una sola sesión." },
      { title: "Diseño UX/UI", desc: "Prototipos basados en investigación, probados con usuarios reales antes de construir." },
      { title: "Implementación", desc: "Demos semanales de software funcionando, sobre un stack moderno y mantenible." },
      { title: "Testing", desc: "Pruebas automatizadas, QA y revisión de seguridad antes de cada release." },
      { title: "Mejora Continua", desc: "Monitoreo, métricas e iteración — seguimos siendo responsables después del launch." },
    ],
  },
};

const WORKING_WITH = ["Claude", "OpenAI", "AWS", "Next.js", "LangChain", "Vercel"];

function StepText({ s }: { s: { title: string; desc: string } }) {
  return (
    <div>
      <div style={{ color: "#fff", fontWeight: 600, fontSize: 18, letterSpacing: "-.01em", lineHeight: 1.25 }}>{s.title}</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "#8f8ba4", marginTop: 8, maxWidth: 250, marginLeft: "auto", marginRight: "auto" }}>
        {s.desc}
      </div>
    </div>
  );
}

export function ProcessFlow() {
  const { lang } = useLang();
  const t = T[lang];
  return (
    <section id="research" style={{ position: "relative", background: "#0d0a1f", padding: "110px 0 90px" }}>
      <div style={{ maxWidth: 1560, margin: "0 auto", padding: "0 48px" }}>
        <h2
          style={{
            fontWeight: 500,
            fontSize: "clamp(36px,3.8vw,60px)",
            letterSpacing: "-.02em",
            lineHeight: 1.04,
            margin: 0,
            color: "#fff",
          }}
        >
          {t.title}
        </h2>
        <p style={{ fontSize: 19, color: "#8f8ba4", fontWeight: 400, margin: "16px 0 0", maxWidth: 620 }}>{t.sub}</p>

        {/* pipeline — desktop: nodes riding a dashed wave, text alternating above/below */}
        <div className="flow-wave" style={{ position: "relative", marginTop: 30 }}>
          {/* texts for the HIGH steps (02 · 04 · 06) sit above the wave */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 18 }}>
            {t.steps.map((s, i) => (
              <div
                key={s.title}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  textAlign: "center",
                  padding: "0 6px",
                }}
              >
                {i % 2 === 1 && <StepText s={s} />}
              </div>
            ))}
          </div>

          {/* the wave band */}
          <div style={{ position: "relative", height: 220 }}>
            <svg
              viewBox="0 0 1200 220"
              preserveAspectRatio="none"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
              aria-hidden
            >
              <path
                d="M100 158 C190 158 210 62 300 62 C390 62 410 158 500 158 C590 158 610 62 700 62 C790 62 810 158 900 158 C990 158 1010 62 1100 62"
                fill="none"
                stroke="rgba(255,255,255,.3)"
                strokeWidth="1.6"
                strokeDasharray="5 8"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {t.steps.map((s, i) => (
              <div
                key={s.title}
                style={{
                  position: "absolute",
                  left: `${((i + 0.5) * 100) / 6}%`,
                  top: i % 2 === 1 ? 62 : 158,
                  transform: "translate(-50%,-50%)",
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#131024",
                  border: "1.5px solid color-mix(in srgb,var(--accent) 55%,transparent)",
                  boxShadow:
                    "0 0 0 6px #0d0a1f, 0 0 26px 4px color-mix(in srgb,var(--accent) 26%,transparent), inset 0 0 14px color-mix(in srgb,var(--accent) 14%,transparent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: MONO,
                  fontSize: 13,
                  letterSpacing: ".08em",
                  color: "var(--accent)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
            ))}
          </div>

          {/* texts for the LOW steps (01 · 03 · 05) sit below the wave */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 18 }}>
            {t.steps.map((s, i) => (
              <div key={s.title} style={{ textAlign: "center", padding: "0 6px" }}>
                {i % 2 === 0 && <StepText s={s} />}
              </div>
            ))}
          </div>
        </div>

        {/* pipeline — narrow screens: simple stacked grid */}
        <div className="flow-grid flow-stack" style={{ marginTop: 64 }}>
          {t.steps.map((s, i) => (
            <div key={s.title} style={{ position: "relative" }}>
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "block",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  boxShadow: "0 0 0 4px #0d0a1f, 0 0 14px 2px color-mix(in srgb,var(--accent) 55%,transparent)",
                }}
              />
              <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", color: "var(--accent)", margin: "18px 0 8px" }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 18.5, letterSpacing: "-.01em", lineHeight: 1.25 }}>
                {s.title}
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "#8f8ba4", marginTop: 8 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 34, marginTop: 80, flexWrap: "wrap" }}>
          <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".16em", color: "#6f6b86" }}>{t.workingWith}</span>
          {WORKING_WITH.map((n, i) => (
            <React.Fragment key={n}>
              <span style={{ fontWeight: 600, fontSize: 17, color: "#8f8ba4" }}>{n}</span>
              {i < WORKING_WITH.length - 1 && <span style={{ color: "#332e4e" }}>|</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
