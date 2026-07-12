"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "../i18n";

const MONO = "var(--mono)";

const TAB_COLORS = [
  {
    fill: "color-mix(in srgb, var(--accent) 82%, #fff)",
    base: "color-mix(in srgb, var(--accent) 18%, #fff)",
  },
  { fill: "#85bfe9", base: "#e7f1f9" },
  { fill: "#f5bd90", base: "#fcf1e7" },
];

const TABS = { en: ["UX Design", "Engineering", "AI & Cloud"], es: ["Diseño UX", "Ingeniería", "IA y Cloud"] };

type Panel = {
  icon: React.ReactNode;
  title: { en: string; es: string };
  body: { en: string; es: string };
  rows: { icon: React.ReactNode; label: { en: string; es: string } }[];
};

const PANELS: Panel[] = [
  {
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6" />
      </>
    ),
    title: { en: "Product Discovery", es: "Descubrimiento de Producto" },
    body: { en: "Field research, journey mapping, and prototypes tested with real users — before a single line of production code.", es: "Investigación de campo, journey mapping y prototipos probados con usuarios reales — antes de una sola línea de código." },
    rows: [
      {
        icon: (
          <>
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M3 9h18M9 21V9" />
          </>
        ),
        label: { en: "Design Systems", es: "Design Systems" },
      },
      {
        icon: (
          <>
            <rect x="4" y="4" width="16" height="12" rx="2" />
            <path d="M8 20h8" />
          </>
        ),
        label: { en: "Interface Design", es: "Diseño de Interfaz" },
      },
      {
        icon: (
          <>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </>
        ),
        label: { en: "Usability Testing", es: "Pruebas de Usabilidad" },
      },
    ],
  },
  {
    icon: <path d="M14 4l-4 16M18 8l4 4-4 4M6 16l-4-4 4-4" />,
    title: { en: "Web Applications", es: "Aplicaciones Web" },
    body: { en: "Scalable, tailor-made platforms aligned to your processes and goals. Modern stacks, maintained for the long run.", es: "Plataformas escalables a tu medida, alineadas a tus procesos y objetivos. Stacks modernos, mantenidos a largo plazo." },
    rows: [
      {
        icon: (
          <>
            <rect x="7" y="2" width="10" height="20" rx="2" />
            <path d="M11 18h2" />
          </>
        ),
        label: { en: "Mobile Apps", es: "Apps Móviles" },
      },
      {
        icon: <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2zM12 11v9M4 6.5l8 4.5 8-4.5" />,
        label: { en: "Custom Software", es: "Software a Medida" },
      },
      {
        icon: (
          <>
            <circle cx="9" cy="20" r="1.6" />
            <circle cx="18" cy="20" r="1.6" />
            <path d="M2 3h3l2.8 12.5h11L21 7H6" />
          </>
        ),
        label: { en: "E-commerce", es: "E-commerce" },
      },
    ],
  },
  {
    icon: (
      <>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
        <circle cx="12" cy="12" r="3.4" />
      </>
    ),
    title: { en: "AI Integration", es: "Integración de IA" },
    body: { en: "LLM-powered features designed responsibly — assistants, copilots, and intelligent search your users can trust.", es: "Funciones con LLMs diseñadas con responsabilidad — asistentes, copilotos y búsqueda inteligente en la que tus usuarios confían." },
    rows: [
      {
        icon: <path d="M4 17V7l8 10V7M16 12h6M19 9v6" />,
        label: { en: "Workflow Automation", es: "Automatización de Flujos" },
      },
      {
        icon: <path d="M18 10h1a4 4 0 010 8H6a5 5 0 01-1-9.9A6 6 0 0118 10z" />,
        label: { en: "AWS Architecture", es: "Arquitectura AWS" },
      },
      {
        icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
        label: { en: "Data & Analytics", es: "Datos y Analítica" },
      },
    ],
  },
];

export function FullStackLab() {
  const { lang } = useLang();
  const es = lang === "es";
  const [cur, setCur] = React.useState(0);
  const [prog, setProg] = React.useState(0);
  const curRef = React.useRef(0);
  curRef.current = cur;

  React.useEffect(() => {
    const DUR = 5000;
    let last = performance.now();
    let raf = 0;
    let p = 0;
    const step = (n: number) => {
      const dt = Math.min(120, n - last);
      last = n;
      p += dt / DUR;
      if (p >= 1) {
        p = 0;
        setCur((c) => (c + 1) % 3);
      }
      setProg(p);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const select = (i: number) => {
    setCur(i);
    setProg(0);
  };

  return (
    <section
      id="stack"
      style={{
        position: "relative",
        background: "linear-gradient(180deg,#ffffff,#f4f6fb 30%,#eef1f8)",
        padding: "110px 0 120px",
      }}
    >
      <div style={{ maxWidth: 1560, margin: "0 auto", padding: "0 48px" }}>
        <h2
          style={{
            textAlign: "center",
            fontWeight: 500,
            fontSize: "clamp(38px,4vw,64px)",
            letterSpacing: "-.02em",
            lineHeight: 1.05,
            margin: 0,
            color: "var(--ink)",
          }}
        >
          {es ? "Laboratorio full-stack" : "Full-stack lab"}
        </h2>
        <p
          style={{
            textAlign: "center",
            fontSize: 20,
            lineHeight: 1.5,
            color: "#8b8896",
            fontWeight: 400,
            maxWidth: 640,
            margin: "20px auto 56px",
          }}
        >
          {es ? "Impulsamos cada paso del viaje del producto — de la primera sesión de investigación a la IA en producción." : "Powering every step of the product journey — from first research session to production AI."}
        </p>

        {/* tabs */}
        <div
          className="stack-3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {TABS[lang].map((label, j) => (
            <button
              key={label}
              onClick={() => select(j)}
              style={{
                position: "relative",
                overflow: "hidden",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-outfit),sans-serif",
                fontWeight: 500,
                fontSize: "clamp(20px,1.8vw,27px)",
                letterSpacing: "-.01em",
                color: "var(--ink)",
                padding: "26px 20px",
                borderRadius: 8,
                background: "#fff",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  background: TAB_COLORS[j].base,
                  opacity: j === cur ? 1 : 0,
                  transition: "opacity .25s",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: j === cur ? `${(prog * 100).toFixed(2)}%` : "0%",
                  background: TAB_COLORS[j].fill,
                }}
              />
              <span style={{ position: "relative" }}>{label}</span>
            </button>
          ))}
        </div>

        {/* panel + visual */}
        <div
          className="stack-2"
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "clamp(28px,3.4vw,56px)",
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr",
            gap: "clamp(28px,4vw,64px)",
            alignItems: "start",
            boxShadow: "0 30px 70px -50px rgba(14,13,18,.35)",
          }}
        >
          <div>
            {PANELS.map((p, i) => (
              <div key={p.title.en} style={{ display: i === cur ? "block" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: "var(--accent-tint)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0e0d12"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    >
                      {p.icon}
                    </svg>
                  </span>
                  <h3
                    style={{
                      fontWeight: 500,
                      fontSize: 24,
                      letterSpacing: "-.01em",
                      margin: 0,
                    }}
                  >
                    {p.title[lang]}
                  </h3>
                </div>
                <p style={{ fontSize: 16.5, lineHeight: 1.6, color: "#55525e", margin: "18px 0 22px" }}>
                  {p.body[lang]}
                </p>
                <Link
                  href="/services"
                  className="btn-dark"
                  style={{
                    textDecoration: "none",
                    display: "inline-block",
                    fontFamily: MONO,
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: ".12em",
                    background: "#0e0d12",
                    color: "#fff",
                    padding: "14px 22px",
                    borderRadius: 6,
                  }}
                >
                  {es ? "VER MÁS" : "LEARN MORE"}
                </Link>
                <div style={{ borderTop: "1px solid rgba(14,13,18,.08)", marginTop: 28 }}>
                  {p.rows.map((r, ri) => (
                    <div
                      key={r.label.en}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "20px 0",
                        borderBottom:
                          ri < p.rows.length - 1
                            ? "1px solid rgba(14,13,18,.08)"
                            : "none",
                      }}
                    >
                      <span
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 9,
                          background: "#f1f2f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#0e0d12"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        >
                          {r.icon}
                        </svg>
                      </span>
                      <span style={{ fontWeight: 500, fontSize: 19 }}>{r.label[lang]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <LabVisual active={cur} />
        </div>
      </div>
    </section>
  );
}

/* ---------- per-tab visuals (each a distinct concept) ---------- */

const KW = "#ef6a4e";
const STR = "#6fd3b8";
const FN = "#9db4ff";
const LN = "#55536a";
const NUM = "#ffb38a";

function Frame({ grad, children }: { grad: string; children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", minHeight: 520 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: grad, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

function Dots() {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
      ))}
    </div>
  );
}

const mlabel: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: ".14em",
  color: "#8b8896",
};

/* ---- UX Design: a design-tool canvas (palette + components + tokens) ---- */
function UXVisual() {
  const swatches = ["var(--accent)", "var(--accent-light)", "#85bfe9", "#f5bd90", "#0e0d12"];
  const tokens = [
    { dot: "var(--accent)", name: "color / accent", val: "#69C7B9" },
    { dot: "#85bfe9", name: "color / sky", val: "#85BFE9" },
    { dot: "#0e0d12", name: "color / ink", val: "#0E0D12" },
  ];
  return (
    <Frame grad="linear-gradient(135deg,color-mix(in srgb,var(--accent) 30%,#bfe3ea),#dff0f2 45%,color-mix(in srgb,var(--accent) 24%,#fff) 90%)">
      {/* design canvas */}
      <div
        style={{
          position: "absolute",
          left: "6%",
          right: "-3%",
          top: "7%",
          bottom: "-5%",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 30px 80px -30px rgba(14,13,18,.45)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(14,13,18,.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Dots />
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: "#8b8896" }}>
              Design <span style={{ color: "#0e0d12" }}>· Prototype</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              <><path d="M4 4h16v16H4z" /><path d="M4 10h16M10 4v16" /></>,
              <><circle cx="12" cy="12" r="8" /></>,
              <><path d="M4 16l5-5 4 4 7-8" /></>,
            ].map((ic, i) => (
              <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9a97a8" strokeWidth="1.6" strokeLinecap="round">{ic}</svg>
            ))}
          </div>
        </div>

        <div style={{ padding: "18px 20px" }}>
          <div style={mlabel}>COLOR STYLES</div>
          <div style={{ display: "flex", gap: 9, marginTop: 9 }}>
            {swatches.map((c, i) => (
              <span key={i} style={{ width: 34, height: 34, borderRadius: 9, background: c, boxShadow: "inset 0 0 0 1px rgba(14,13,18,.08)" }} />
            ))}
          </div>

          <div style={{ ...mlabel, marginTop: 18 }}>COMPONENTS</div>
          <div style={{ display: "flex", gap: 14, marginTop: 10, alignItems: "center" }}>
            {/* primary button with selection handles */}
            <div style={{ position: "relative" }}>
              <div style={{ background: "var(--accent)", color: "#0e0d12", fontWeight: 600, fontSize: 13, padding: "10px 16px", borderRadius: 8 }}>
                Get started
              </div>
              <div style={{ position: "absolute", inset: -5, border: "1.5px solid var(--accent)", borderRadius: 11 }} />
              {[
                { left: -8, top: -8 },
                { right: -8, top: -8 },
                { left: -8, bottom: -8 },
                { right: -8, bottom: -8 },
              ].map((p, i) => (
                <span key={i} style={{ position: "absolute", width: 7, height: 7, background: "#fff", border: "1.5px solid var(--accent)", ...p }} />
              ))}
            </div>
            {/* input preview */}
            <div style={{ flex: 1, border: "1px solid rgba(14,13,18,.16)", borderRadius: 8, padding: "11px 12px" }}>
              <span style={{ display: "block", width: "55%", height: 7, borderRadius: 4, background: "#d8d7de" }} />
            </div>
          </div>

          {/* card preview */}
          <div style={{ marginTop: 14, border: "1px solid rgba(14,13,18,.09)", borderRadius: 10, padding: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ width: 40, height: 40, borderRadius: 9, background: "var(--accent-tint)" }} />
            <div style={{ flex: 1 }}>
              <span style={{ display: "block", width: "62%", height: 8, borderRadius: 4, background: "#e4e3ea" }} />
              <span style={{ display: "block", width: "40%", height: 7, borderRadius: 4, background: "#eeedf2", marginTop: 7 }} />
            </div>
            <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".08em", color: "var(--accent)", background: "var(--accent-tint)", padding: "5px 8px", borderRadius: 4 }}>CARD</span>
          </div>
        </div>

        {/* design cursor tag */}
        <div style={{ position: "absolute", right: "16%", top: "52%" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#0e0d12"><path d="M4 2l16 8-7 2-2 7-7-17z" /></svg>
          <span style={{ position: "absolute", left: 14, top: 12, fontFamily: MONO, fontSize: 9.5, color: "#fff", background: "#0e0d12", padding: "3px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>MT · editing</span>
        </div>
      </div>

      {/* tokens panel */}
      <div style={{ position: "absolute", left: "3%", bottom: "5%", width: "48%", background: "#fff", border: "1px solid rgba(14,13,18,.08)", borderRadius: 10, boxShadow: "0 24px 50px -24px rgba(14,13,18,.4)", padding: "12px 13px" }}>
        <div style={mlabel}>TOKENS</div>
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          {tokens.map((t) => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: t.dot, boxShadow: "inset 0 0 0 1px rgba(14,13,18,.1)" }} />
              <span style={{ fontSize: 12, color: "#44424d", flex: 1 }}>{t.name}</span>
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: "#8b8896" }}>{t.val}</span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ---- Engineering: CI pipeline + code editor ---- */
function EngVisual() {
  const steps: [string, string][] = [
    ["Build", "12s"],
    ["Tests · 42 / 42", "8s"],
    ["Deploy · AWS", "live"],
  ];
  return (
    <Frame grad="linear-gradient(135deg,#c7d5ec,#dee7f4 45%,#eef2f8)">
      {/* pipeline card */}
      <div
        style={{
          position: "absolute",
          right: "-2%",
          top: "7%",
          width: "70%",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 30px 80px -30px rgba(14,13,18,.45)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(14,13,18,.07)" }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".12em", color: "#8b8896" }}>CI · PIPELINE</span>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: "#0e0d12", background: "#6fd3b8", padding: "5px 9px", borderRadius: 4 }}>✓ PASSED</span>
        </div>
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map(([label, meta]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#e7f7ef", color: "#1f9d6b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{label}</span>
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: "#8b8896" }}>{meta}</span>
            </div>
          ))}
          <div style={{ height: 6, borderRadius: 3, background: "#eef1f6", overflow: "hidden", marginTop: 2 }}>
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg,var(--accent-light),var(--accent))" }} />
          </div>
        </div>
      </div>

      {/* code editor */}
      <div style={{ position: "absolute", left: "3%", bottom: "6%", width: "76%", background: "#17151f", borderRadius: 10, boxShadow: "0 30px 70px -24px rgba(10,8,16,.7)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: "#b9b6c6" }}>↑ Deploy app</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["TypeScript", "Node", "cURL"].map((l, i) => (
              <span key={l} style={{ fontFamily: MONO, fontSize: 10.5, color: i === 0 ? "#ffb38a" : "#8f8c9e", borderBottom: i === 0 ? "1px solid #ffb38a" : "none", padding: "3px 7px" }}>{l}</span>
            ))}
          </div>
        </div>
        <pre style={{ margin: 0, padding: "14px 16px", fontFamily: MONO, fontSize: 12.5, lineHeight: 1.75, color: "#eceaf4", whiteSpace: "pre", overflowX: "auto" }}>
          <L n="01" /><span style={{ color: KW }}>import</span> {"{ createApp } "}<span style={{ color: KW }}>from</span> <span style={{ color: STR }}>&quot;@mindfultech/core&quot;</span>;{"\n"}
          <L n="02" />{"\n"}
          <L n="03" /><span style={{ color: KW }}>const</span> app = <span style={{ color: FN }}>createApp</span>({"{"}{"\n"}
          <L n="04" />{"  "}router: <span style={{ color: FN }}>fileRouter</span>(),{"\n"}
          <L n="05" />{"  "}auth:{"   "}<span style={{ color: STR }}>&quot;session&quot;</span>,{"\n"}
          <L n="06" />{"});"}{"\n"}
          <L n="07" />{"\n"}
          <L n="08" />app.<span style={{ color: FN }}>listen</span>(<span style={{ color: NUM }}>3000</span>);
        </pre>
      </div>
    </Frame>
  );
}

/* ---- AI & Cloud: a live AI workflow graph ---- */
type FNode = { x: number; y: number; label: string; sub: string; icon: React.ReactNode; accent?: boolean };

const AI_NODES: FNode[] = [
  { x: 50, y: 12, label: "Query", sub: "user input", icon: <path d="M21 11.5a8.38 8.38 0 01-9 8.4 8.5 8.5 0 01-3.5-.8L3 20l1-4.5a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 018.5-8.5 8.38 8.38 0 019.4 8.3z" /> },
  { x: 50, y: 31, label: "Router", sub: "classify intent", icon: <><circle cx="6" cy="12" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 12h3l5-5M11 12l5 5" /></> },
  { x: 24, y: 52, label: "Retrieve", sub: "RAG · vectors", icon: <><path d="M6 3h8l5 5v13H6z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></> },
  { x: 76, y: 52, label: "Tools", sub: "search · API", icon: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-3.5-3.5" /></> },
  { x: 50, y: 71, label: "Claude", sub: "LLM · reasoning", accent: true, icon: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /><circle cx="12" cy="12" r="3.4" /></> },
  { x: 50, y: 90, label: "Answer", sub: "grounded reply", icon: <path d="M20 6L9 17l-5-5" /> },
];
const AI_EDGES: [number, number][] = [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5]];

function AIVisual() {
  return (
    <Frame grad="linear-gradient(135deg,color-mix(in srgb,var(--accent) 26%,#bfe3ea),#f3efe6 55%,color-mix(in srgb,var(--accent) 20%,#fff))">
      <div
        style={{
          position: "absolute",
          left: "5%",
          right: "5%",
          top: "6%",
          bottom: "5%",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 30px 80px -30px rgba(14,13,18,.45)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(14,13,18,.07)", flex: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Dots />
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: "#8b8896" }}>
              ai-workflow <span style={{ color: "#0e0d12" }}>/ assistant</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".08em", color: "var(--accent)", background: "var(--accent-tint)", padding: "5px 8px", borderRadius: 4 }}>CLAUDE</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: MONO, fontSize: 9, letterSpacing: ".1em", color: "#8b8896" }}>
              <span className="mt-agent-node" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />RUNNING
            </span>
          </div>
        </div>

        {/* graph canvas */}
        <div
          style={{
            position: "relative",
            flex: 1,
            minHeight: 300,
            backgroundImage: "radial-gradient(circle, rgba(14,13,18,.07) 1px, transparent 1px)",
            backgroundSize: "17px 17px",
          }}
        >
          {/* edges */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {AI_EDGES.map(([a, c], i) => {
              const s = AI_NODES[a];
              const t = AI_NODES[c];
              return (
                <g key={i}>
                  <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="rgba(14,13,18,.1)" strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
                  <line className="mt-edge" x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="var(--accent)" strokeWidth={1.8} strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ animationDelay: `${i * -0.12}s` }} />
                </g>
              );
            })}
          </svg>

          {/* nodes */}
          {AI_NODES.map((n) => (
            <div
              key={n.label}
              className={n.accent ? "mt-agent-node" : undefined}
              style={{
                position: "absolute",
                left: `${n.x}%`,
                top: `${n.y}%`,
                transform: "translate(-50%,-50%)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: n.accent ? "var(--accent)" : "#fff",
                color: "#0e0d12",
                border: n.accent ? "none" : "1px solid rgba(14,13,18,.1)",
                boxShadow: "0 10px 24px -12px rgba(14,13,18,.35)",
                borderRadius: 10,
                padding: "7px 11px 7px 8px",
                whiteSpace: "nowrap",
                zIndex: 2,
              }}
            >
              <span style={{ width: 26, height: 26, borderRadius: 8, background: n.accent ? "rgba(14,13,18,.14)" : "var(--accent-tint)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0e0d12" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  {n.icon}
                </svg>
              </span>
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, fontSize: 12.5 }}>
                  {n.label}
                  {n.accent && (
                    <span className="mt-typing" style={{ display: "inline-flex", gap: 2 }}>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#0e0d12" }} />
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#0e0d12" }} />
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#0e0d12" }} />
                    </span>
                  )}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: ".04em", color: n.accent ? "rgba(14,13,18,.6)" : "#8b8896" }}>{n.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function L({ n }: { n: string }) {
  return <span style={{ color: LN }}>{n + "  "}</span>;
}

function LabVisual({ active }: { active: number }) {
  return (
    <div key={active} style={{ animation: "mtfade .4s ease" }}>
      {active === 0 ? <UXVisual /> : active === 1 ? <EngVisual /> : <AIVisual />}
    </div>
  );
}
