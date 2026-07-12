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

        {/* pipeline */}
        <div style={{ position: "relative", marginTop: 64 }}>
          <div
            className="mt-conn flow-line"
            style={{ position: "absolute", left: 6, right: 6, top: 5, height: 2, borderRadius: 2, opacity: 0.6 }}
          />
          <div className="flow-grid">
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
