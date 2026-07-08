"use client";

import * as React from "react";
import Link from "next/link";

const MONO = "var(--mono)";

const TAB_COLORS = [
  {
    fill: "color-mix(in srgb, var(--accent) 82%, #fff)",
    base: "color-mix(in srgb, var(--accent) 18%, #fff)",
  },
  { fill: "#85bfe9", base: "#e7f1f9" },
  { fill: "#f5bd90", base: "#fcf1e7" },
];

const TABS = ["UX Design", "Engineering", "AI & Cloud"];

type Panel = {
  icon: React.ReactNode;
  title: string;
  body: string;
  rows: { icon: React.ReactNode; label: string }[];
};

const PANELS: Panel[] = [
  {
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6" />
      </>
    ),
    title: "Product Discovery",
    body: "Field research, journey mapping, and prototypes tested with real users — before a single line of production code.",
    rows: [
      {
        icon: (
          <>
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M3 9h18M9 21V9" />
          </>
        ),
        label: "Design Systems",
      },
      {
        icon: (
          <>
            <rect x="4" y="4" width="16" height="12" rx="2" />
            <path d="M8 20h8" />
          </>
        ),
        label: "Interface Design",
      },
      {
        icon: (
          <>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </>
        ),
        label: "Usability Testing",
      },
    ],
  },
  {
    icon: <path d="M14 4l-4 16M18 8l4 4-4 4M6 16l-4-4 4-4" />,
    title: "Web Applications",
    body: "Scalable, tailor-made platforms aligned to your processes and goals. Modern stacks, maintained for the long run.",
    rows: [
      {
        icon: (
          <>
            <rect x="7" y="2" width="10" height="20" rx="2" />
            <path d="M11 18h2" />
          </>
        ),
        label: "Mobile Apps",
      },
      {
        icon: <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2zM12 11v9M4 6.5l8 4.5 8-4.5" />,
        label: "Custom Software",
      },
      {
        icon: (
          <>
            <circle cx="9" cy="20" r="1.6" />
            <circle cx="18" cy="20" r="1.6" />
            <path d="M2 3h3l2.8 12.5h11L21 7H6" />
          </>
        ),
        label: "E-commerce",
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
    title: "AI Integration",
    body: "LLM-powered features designed responsibly — assistants, copilots, and intelligent search your users can trust.",
    rows: [
      {
        icon: <path d="M4 17V7l8 10V7M16 12h6M19 9v6" />,
        label: "Workflow Automation",
      },
      {
        icon: <path d="M18 10h1a4 4 0 010 8H6a5 5 0 01-1-9.9A6 6 0 0118 10z" />,
        label: "AWS Architecture",
      },
      {
        icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
        label: "Data & Analytics",
      },
    ],
  },
];

export function FullStackLab() {
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
        setCur((c) => (c + 1) % TABS.length);
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
          Full-stack lab
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
          Powering every step of the product journey — from first research
          session to production AI.
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
          {TABS.map((label, j) => (
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
              <div key={p.title} style={{ display: i === cur ? "block" : "none" }}>
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
                    {p.title}
                  </h3>
                </div>
                <p style={{ fontSize: 16.5, lineHeight: 1.6, color: "#55525e", margin: "18px 0 22px" }}>
                  {p.body}
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
                  LEARN MORE
                </Link>
                <div style={{ borderTop: "1px solid rgba(14,13,18,.08)", marginTop: 28 }}>
                  {p.rows.map((r, ri) => (
                    <div
                      key={r.label}
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
                      <span style={{ fontWeight: 500, fontSize: 19 }}>{r.label}</span>
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

const KW = "#ef6a4e";
const STR = "#6fd3b8";
const FN = "#9db4ff";
const NUM = "#ffb38a";
const LN = "#55536a";

type Visual = {
  breadcrumb: string;
  title: string;
  chips: { t: string; accent?: boolean }[];
  desc: string;
  runLabel: string;
  langs: string[];
  code: React.ReactNode;
};

// Generic, product-agnostic content — one per tab, no named client project.
const VISUALS: Visual[] = [
  {
    breadcrumb: "DESIGN › DISCOVERY",
    title: "Design System",
    chips: [{ t: "FIGMA" }, { t: "TOKENS" }, { t: "WCAG AA", accent: true }],
    desc: "Research-led components and accessible design tokens, tested with real users before a line of production code.",
    runLabel: "◆ tokens.json",
    langs: ["JSON", "CSS", "Figma"],
    code: (
      <>
        <L n="01" />
        <span style={{ color: "#eceaf4" }}>{"{"}</span>{"\n"}
        <L n="02" />
        {"  "}<span style={{ color: FN }}>&quot;color&quot;</span>: {"{"}{"\n"}
        <L n="03" />
        {"    "}<span style={{ color: FN }}>&quot;accent&quot;</span>:{" "}
        <span style={{ color: STR }}>&quot;#69c7b9&quot;</span>,{"\n"}
        <L n="04" />
        {"    "}<span style={{ color: FN }}>&quot;ink&quot;</span>:{"    "}
        <span style={{ color: STR }}>&quot;#0e0d12&quot;</span>{"\n"}
        <L n="05" />
        {"  "}{"},"}{"\n"}
        <L n="06" />
        {"  "}<span style={{ color: FN }}>&quot;radius&quot;</span>: {"{ "}
        <span style={{ color: FN }}>&quot;md&quot;</span>:{" "}
        <span style={{ color: NUM }}>10</span>,{" "}
        <span style={{ color: FN }}>&quot;lg&quot;</span>:{" "}
        <span style={{ color: NUM }}>16</span>{" }"},{"\n"}
        <L n="07" />
        {"  "}<span style={{ color: FN }}>&quot;type&quot;</span>:{"   "}
        <span style={{ color: STR }}>&quot;Outfit, sans-serif&quot;</span>{"\n"}
        <L n="08" />
        <span style={{ color: "#eceaf4" }}>{"}"}</span>
      </>
    ),
  },
  {
    breadcrumb: "BUILD › PLATFORM",
    title: "Web Platform",
    chips: [{ t: "REACT" }, { t: "NEXT.JS" }, { t: "AWS", accent: true }],
    desc: "Scalable, tailor-made platforms on a modern stack — with observability and CI/CD wired in from day one.",
    runLabel: "↑ Deploy app",
    langs: ["TypeScript", "Node", "cURL"],
    code: (
      <>
        <L n="01" />
        <span style={{ color: KW }}>import</span> {"{ createApp } "}
        <span style={{ color: KW }}>from</span>{" "}
        <span style={{ color: STR }}>&quot;@mindfultech/core&quot;</span>;{"\n"}
        <L n="02" />{"\n"}
        <L n="03" />
        <span style={{ color: KW }}>const</span> app ={" "}
        <span style={{ color: FN }}>createApp</span>({"{"}{"\n"}
        <L n="04" />
        {"  "}router: <span style={{ color: FN }}>fileRouter</span>(),{"\n"}
        <L n="05" />
        {"  "}auth:{"   "}<span style={{ color: STR }}>&quot;session&quot;</span>,{"\n"}
        <L n="06" />
        {"});"}{"\n"}
        <L n="07" />{"\n"}
        <L n="08" />
        app.<span style={{ color: FN }}>listen</span>(
        <span style={{ color: NUM }}>3000</span>);{" "}
        <span style={{ color: "#6a6880" }}>// ci: build ✓ · deploy aws</span>
      </>
    ),
  },
  {
    breadcrumb: "AI › ASSISTANT",
    title: "AI Assistant",
    chips: [{ t: "CLAUDE" }, { t: "RAG" }, { t: "GROUNDED", accent: true }],
    desc: "Grounded assistants with human review — copilots and intelligent search your users can trust.",
    runLabel: "↑ Run assistant",
    langs: ["TypeScript", "Python", "cURL"],
    code: (
      <>
        <L n="01" />
        <span style={{ color: KW }}>import</span> {"{ Assistant } "}
        <span style={{ color: KW }}>from</span>{" "}
        <span style={{ color: STR }}>&quot;@mindfultech/ai&quot;</span>;{"\n"}
        <L n="02" />{"\n"}
        <L n="03" />
        <span style={{ color: KW }}>const</span> guide ={" "}
        <span style={{ color: KW }}>new</span>{" "}
        <span style={{ color: FN }}>Assistant</span>({"{"}{"\n"}
        <L n="04" />
        {"  "}grounding:{" "}
        <span style={{ color: STR }}>&quot;knowledge-base&quot;</span>,{"\n"}
        <L n="05" />
        {"  "}review:{"    "}
        <span style={{ color: STR }}>&quot;human-in-the-loop&quot;</span>,{"\n"}
        <L n="06" />
        {"});"}{"\n"}
        <L n="07" />{"\n"}
        <L n="08" />
        <span style={{ color: KW }}>await</span> guide.
        <span style={{ color: FN }}>answer</span>(
        <span style={{ color: STR }}>&quot;How do I get started?&quot;</span>);
      </>
    ),
  },
];

function L({ n }: { n: string }) {
  return <span style={{ color: LN }}>{n + "  "}</span>;
}

function LabVisual({ active }: { active: number }) {
  const v = VISUALS[active] || VISUALS[0];
  return (
    <div style={{ position: "relative", minHeight: 520 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 14,
          background:
            "linear-gradient(135deg,color-mix(in srgb,var(--accent) 30%,#bfe3ea),#dff0f2 45%,color-mix(in srgb,var(--accent) 24%,#fff) 90%)",
          overflow: "hidden",
        }}
      >
        <div
          key={"card-" + active}
          style={{
            position: "absolute",
            left: "7%",
            right: "-4%",
            top: "7%",
            bottom: "-6%",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 30px 80px -30px rgba(14,13,18,.45)",
            overflow: "hidden",
            animation: "mtfade .4s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "13px 18px",
              borderBottom: "1px solid rgba(14,13,18,.07)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <circle
                  cx="16"
                  cy="16"
                  r="11"
                  stroke="url(#mt-mark)"
                  strokeWidth="4.4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="53.5 15.6"
                  transform="rotate(-52 16 16)"
                />
                <circle cx="16" cy="16" r="3.9" fill="#0e0d12" />
              </svg>
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>mindfultech</span>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 12.5, fontWeight: 500, color: "#6b6875" }}>
              <span style={{ color: "var(--accent)" }}>Projects</span>
              <span>Playbooks</span>
              <span>Reports</span>
              <span>Team</span>
            </div>
          </div>
          <div style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 12, color: "#8b8896", fontFamily: MONO }}>{v.breadcrumb}</div>
            <div style={{ fontWeight: 500, fontSize: 19, marginTop: 6 }}>{v.title}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {v.chips.map((chip) => (
                <span
                  key={chip.t}
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: ".06em",
                    background: chip.accent ? "var(--accent-tint)" : "#f1f2f6",
                    padding: "5px 9px",
                    borderRadius: 4,
                    color: chip.accent ? "var(--accent)" : "#44424d",
                  }}
                >
                  {chip.t}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.55, color: "#55525e", maxWidth: 420 }}>
              {v.desc}
            </div>
          </div>
        </div>

        {/* code window */}
        <div
          key={"code-" + active}
          style={{
            position: "absolute",
            left: "3%",
            bottom: "6%",
            width: "74%",
            background: "#17151f",
            borderRadius: 10,
            boxShadow: "0 30px 70px -24px rgba(10,8,16,.7)",
            overflow: "hidden",
            animation: "mtfade .4s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "11px 14px",
              borderBottom: "1px solid rgba(255,255,255,.08)",
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: "#b9b6c6" }}>{v.runLabel}</span>
            <div style={{ display: "flex", gap: 4 }}>
              {v.langs.map((lang, i) => (
                <span
                  key={lang}
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    color: i === 0 ? "#ffb38a" : "#8f8c9e",
                    borderBottom: i === 0 ? "1px solid #ffb38a" : "none",
                    padding: "3px 7px",
                  }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
          <pre
            style={{
              margin: 0,
              padding: "14px 16px",
              fontFamily: MONO,
              fontSize: 12.5,
              lineHeight: 1.75,
              color: "#eceaf4",
              whiteSpace: "pre",
              overflowX: "auto",
            }}
          >
            {v.code}
          </pre>
        </div>
      </div>
    </div>
  );
}
