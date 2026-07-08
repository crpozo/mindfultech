"use client";

import * as React from "react";
import Link from "next/link";

const MONO = "var(--mono)";

const CARDS = [
  { tag: "UX RESEARCH", title: "Field studies with 200+ students shaped the new USFQ portal", meta: "USFQ · CASE STUDY" },
  { tag: "AUTOMATION", title: "Cutting manual order processing 80% with AI workflows", meta: "WAKU INC. · 2025" },
  { tag: "ENGINEERING", title: "A design system that ships: one codebase, three platforms", meta: "KRUGERLABS · 2026" },
  { tag: "AI", title: "Designing AI features people actually trust", meta: "PLAYBOOK · 2026" },
];

export function ResearchCarousel() {
  const railRef = React.useRef<HTMLDivElement>(null);
  const scrollBy = (dir: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const step = Math.min(420, rail.clientWidth * 0.8);
    rail.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const cardBase: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    flex: "0 0 clamp(280px,23vw,360px)",
    borderRadius: 10,
    background: "#16132b",
    border: "1px solid rgba(255,255,255,.06)",
    minHeight: 420,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    textAlign: "center",
    padding: "26px 26px 30px",
  };

  // Same wash the first (featured) card reveals on hover.
  const hoverBg: React.CSSProperties = {
    position: "absolute",
    inset: -30,
    opacity: 0,
    transition: "opacity .45s ease",
    background:
      "radial-gradient(60% 50% at 70% 30%,rgba(120,150,220,.55),transparent 60%),radial-gradient(50% 45% at 25% 75%,color-mix(in srgb,var(--accent) 50%,transparent),transparent 65%),linear-gradient(140deg,#8d95a8,#b0a3b8 45%,#7d7f9a)",
    filter: "blur(22px)",
  };

  return (
    <section id="research" style={{ position: "relative", background: "#0d0a1f", padding: "110px 0 90px" }}>
      <div style={{ maxWidth: 1560, margin: "0 auto", padding: "0 48px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 30,
            flexWrap: "wrap",
          }}
        >
          <div>
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
              Grounded in a human process
            </h2>
            <p style={{ fontSize: 19, color: "#8f8ba4", fontWeight: 400, margin: "16px 0 0" }}>
              Field research and measured outcomes, for software in production.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => scrollBy(-1)} style={navBtn("#1c1834", "#b9b6c6")}>
              ‹
            </button>
            <button onClick={() => scrollBy(1)} style={navBtn("#2a2547", "#fff")}>
              ›
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          style={{
            display: "flex",
            gap: 18,
            marginTop: 56,
            overflowX: "auto",
            scrollbarWidth: "none",
            paddingBottom: 8,
          }}
        >
          {/* hover card */}
          <div
            className="hover-card"
            style={{
              ...cardBase,
              overflow: "hidden",
              position: "relative",
              justifyContent: "center",
              padding: 28,
            }}
          >
            <div
              className="hover-bg"
              style={{
                position: "absolute",
                inset: -30,
                opacity: 0,
                transition: "opacity .45s ease",
                background:
                  "radial-gradient(60% 50% at 70% 30%,rgba(120,150,220,.55),transparent 60%),radial-gradient(50% 45% at 25% 75%,color-mix(in srgb,var(--accent) 50%,transparent),transparent 65%),linear-gradient(140deg,#8d95a8,#b0a3b8 45%,#7d7f9a)",
                filter: "blur(22px)",
              }}
            />
            <div
              style={{
                position: "relative",
                color: "#fff",
                fontWeight: 500,
                fontSize: 21,
                lineHeight: 1.35,
                letterSpacing: "-.01em",
                maxWidth: 270,
              }}
            >
              MindfulTech at IxDA Quito 2026: human-centered AI in production
            </div>
            <Link
              href="/blog"
              className="read-more"
              style={{
                position: "relative",
                textDecoration: "none",
                fontFamily: MONO,
                fontSize: 11.5,
                letterSpacing: ".12em",
                color: "#fff",
                background: "rgba(20,18,30,.4)",
                border: "1px solid rgba(255,255,255,.3)",
                padding: "12px 18px",
                borderRadius: 6,
                marginTop: 26,
              }}
            >
              READ MORE
            </Link>
          </div>

          {CARDS.map((c) => (
            <div key={c.title} className="hover-card" style={cardBase}>
              <div className="hover-bg" style={hoverBg} />
              <span
                style={{
                  position: "relative",
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: ".12em",
                  color: "#c6c3d6",
                  background: "rgba(255,255,255,.08)",
                  padding: "7px 12px",
                  borderRadius: 4,
                }}
              >
                {c.tag}
              </span>
              <div
                style={{
                  position: "relative",
                  color: "#fff",
                  fontWeight: 500,
                  fontSize: 21.5,
                  lineHeight: 1.35,
                  letterSpacing: "-.01em",
                }}
              >
                {c.title}
              </div>
              <span
                style={{
                  position: "relative",
                  fontFamily: MONO,
                  fontSize: 11.5,
                  letterSpacing: ".1em",
                  color: "#8f8ba4",
                }}
              >
                {c.meta}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 34,
            marginTop: 64,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".16em", color: "#6f6b86" }}>
            WORKING WITH
          </span>
          {["AWS", "React", "Shopify", "WordPress"].map((n, i) => (
            <React.Fragment key={n}>
              <span style={{ fontWeight: 600, fontSize: 17, color: "#8f8ba4" }}>{n}</span>
              {i < 3 && <span style={{ color: "#332e4e" }}>|</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

function navBtn(bg: string, color: string): React.CSSProperties {
  return {
    cursor: "pointer",
    border: "none",
    width: 44,
    height: 44,
    borderRadius: 8,
    background: bg,
    color,
    fontSize: 17,
    transition: "background .2s",
  };
}
