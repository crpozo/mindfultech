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

/* one icon per pipeline step (indexes match t.steps) */
const STEP_ICONS: React.ReactNode[] = [
  // requirements — clipboard list
  <>
    <rect x="8" y="3" width="8" height="4" rx="1" />
    <path d="M16 5h2a1 1 0 011 1v14a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h2M9 11h6M9 15h4" />
  </>,
  // kick-off — rocket
  <>
    <path d="M12 15c5-4 6.5-8.5 6-12-3.5-.5-8 1-12 6l-2.5 3L8 16.5z" />
    <path d="M9 12l3 3M5 16c-1.5 1-2 3.5-2 5 1.5 0 4-.5 5-2M15 6.5a1.5 1.5 0 100 .01" />
  </>,
  // ux/ui — pen tool
  <>
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.6 7.6" />
    <circle cx="11" cy="11" r="2" />
  </>,
  // implementation — code
  <>
    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
  </>,
  // testing — shield check
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </>,
  // continuous improvement — refresh cycle
  <>
    <path d="M23 4v6h-6M1 20v-6h6" />
    <path d="M3.5 9a9 9 0 0114.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0020.5 15" />
  </>,
];

function StepText({ s, hot }: { s: { title: string; desc: string }; hot: boolean }) {
  return (
    <div>
      <div
        style={{
          color: hot ? "var(--accent)" : "#fff",
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: "-.01em",
          lineHeight: 1.25,
          transition: "color .25s ease",
        }}
      >
        {s.title}
      </div>
      <div
        style={{
          fontSize: 13.5,
          lineHeight: 1.6,
          color: hot ? "#b9b5cd" : "#8f8ba4",
          marginTop: 8,
          maxWidth: 250,
          marginLeft: "auto",
          marginRight: "auto",
          transition: "color .25s ease",
        }}
      >
        {s.desc}
      </div>
    </div>
  );
}

export function ProcessFlow() {
  const { lang } = useLang();
  const t = T[lang];
  const [hot, setHot] = React.useState<number | null>(null);
  const hoverProps = (i: number) => ({
    onMouseEnter: () => setHot(i),
    onMouseLeave: () => setHot(null),
  });
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
                {...(i % 2 === 1 ? hoverProps(i) : {})}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  textAlign: "center",
                  padding: "0 6px",
                }}
              >
                {i % 2 === 1 && <StepText s={s} hot={hot === i} />}
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
                {...hoverProps(i)}
                style={{
                  position: "absolute",
                  left: `${((i + 0.5) * 100) / 6}%`,
                  top: i % 2 === 1 ? 62 : 158,
                  transform: `translate(-50%,-50%) scale(${hot === i ? 1.12 : 1})`,
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: hot === i ? "#182138" : "#131024",
                  border: `1.5px solid color-mix(in srgb,var(--accent) ${hot === i ? 100 : 55}%,transparent)`,
                  boxShadow:
                    hot === i
                      ? "0 0 0 6px #0d0a1f, 0 0 42px 12px color-mix(in srgb,var(--accent) 50%,transparent), inset 0 0 18px color-mix(in srgb,var(--accent) 28%,transparent)"
                      : "0 0 0 6px #0d0a1f, 0 0 26px 4px color-mix(in srgb,var(--accent) 26%,transparent), inset 0 0 14px color-mix(in srgb,var(--accent) 14%,transparent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent)",
                  transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease, background .25s ease",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {STEP_ICONS[i]}
                </svg>
              </div>
            ))}
          </div>

          {/* texts for the LOW steps (01 · 03 · 05) sit below the wave */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 18 }}>
            {t.steps.map((s, i) => (
              <div key={s.title} {...(i % 2 === 0 ? hoverProps(i) : {})} style={{ textAlign: "center", padding: "0 6px" }}>
                {i % 2 === 0 && <StepText s={s} hot={hot === i} />}
              </div>
            ))}
          </div>
        </div>

        {/* pipeline — narrow screens: simple stacked grid */}
        <div className="flow-grid flow-stack" style={{ marginTop: 64 }}>
          {t.steps.map((s, i) => (
            <div key={s.title} {...hoverProps(i)} style={{ position: "relative" }}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: hot === i ? "#182138" : "#131024",
                  border: `1.5px solid color-mix(in srgb,var(--accent) ${hot === i ? 100 : 55}%,transparent)`,
                  boxShadow:
                    hot === i
                      ? "0 0 26px 6px color-mix(in srgb,var(--accent) 45%,transparent)"
                      : "0 0 14px 2px color-mix(in srgb,var(--accent) 28%,transparent)",
                  color: "var(--accent)",
                  transition: "box-shadow .25s ease, border-color .25s ease, background .25s ease",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {STEP_ICONS[i]}
                </svg>
              </span>
              <div
                style={{
                  color: hot === i ? "var(--accent)" : "#fff",
                  fontWeight: 600,
                  fontSize: 18.5,
                  letterSpacing: "-.01em",
                  lineHeight: 1.25,
                  marginTop: 16,
                  transition: "color .25s ease",
                }}
              >
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
