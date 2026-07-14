"use client";

import * as React from "react";
import { Logo } from "../Logo";
import { useLang } from "../i18n";

const MONO = "var(--mono)";

function openForm(e: React.MouseEvent) {
  e.preventDefault();
  window.dispatchEvent(new CustomEvent("mt:open-form"));
}

const MARQUEE: { name: string; img?: string; h?: number }[] = [
  { name: "USFQ" },
  { name: "ThemedMotion", img: "/portfolio/themedmotion-logo.png", h: 36 },
  { name: "Western Fence Supply" },
  { name: "CarCompraCorp" },
  { name: "PARC Home Care" },
  { name: "AWS Partner" },
];

export function Hero() {
  const { lang } = useLang();
  const es = lang === "es";
  const stageRef = React.useRef<HTMLDivElement>(null);
  const marqRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const T = 10000;
    const q = <T extends Element>(sel: string) =>
      stage.querySelector(sel) as T | null;
    const wfs = Array.from(stage.querySelectorAll<HTMLElement>("[data-wf]"));
    const codeLines = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-code-line]")
    );
    const codewin = q<HTMLElement>("[data-codewin]");
    const live = q<HTMLElement>("[data-live]");
    const handles = q<HTMLElement>("[data-handles]");
    const chartwrap = q<HTMLElement>("[data-chartwrap]");
    const path = q<SVGPathElement>("[data-chart-path]");
    const up = q<HTMLElement>("[data-stat-uptime]");
    const ad = q<HTMLElement>("[data-stat-adopt]");
    const bub = q<HTMLElement>("[data-bubble0]");

    let pathLen = 300;
    let raf = 0;
    const clamp01 = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x);
    const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
    const t0 = performance.now();

    // TRUSTED BY marquee — driven here (not CSS) so we can wrap on the exact
    // one-set period and it never runs out of logos on wide screens.
    const marq = marqRef.current;
    const SET = MARQUEE.length; // logos per repeat
    let marqX = 0;
    let lastMarq = t0;

    const frame = () => {
      const now = performance.now();
      if (marq) {
        const dtMs = Math.min(120, now - lastMarq);
        lastMarq = now;
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
      }
      const t = (now - t0) % T;
      const seg = (s: number, d: number) => ease((t - s) / d);
      const fac = 1 - seg(9300, 600); // soft outro before the loop restarts
      const setO = (el: HTMLElement | null, v: number, ty?: number) => {
        if (!el) return;
        const o = clamp01(v) * fac;
        el.style.opacity = o.toFixed(2);
        if (ty != null)
          el.style.transform = "translateY(" + ((1 - o) * ty).toFixed(1) + "px)";
      };

      wfs.forEach((el) => {
        const k = parseFloat(el.dataset.wf || "0");
        setO(el, seg(200 + k * 380, 520), 10);
      });
      setO(codewin, seg(1900, 520), 14);
      codeLines.forEach((el) => {
        const k = parseFloat(el.dataset.codeLine || "0");
        el.style.opacity = (seg(2400 + k * 520, 300) * fac * 0.88 + 0.12).toFixed(2);
      });
      const lv = seg(4700, 420);
      setO(live, lv, -4);
      if (handles)
        handles.style.opacity = (Math.max(0, 1 - lv * 1.2) * fac).toFixed(2);
      setO(chartwrap, seg(5300, 520), 10);
      if (path) {
        try {
          pathLen = path.getTotalLength() || pathLen;
        } catch {
          /* noop */
        }
        path.style.strokeDasharray = String(pathLen);
        path.style.strokeDashoffset = String(pathLen * (1 - seg(5500, 1900) * fac));
      }
      if (up) up.textContent = (99.9 * seg(5500, 1700) * fac).toFixed(1) + "%";
      if (ad) ad.textContent = (3 * seg(5500, 1700) * fac).toFixed(1) + "x";
      setO(bub, seg(7700, 460), 8);

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
      {/* one centered row: copy left, product visual right (together.ai layout).
          DOM keeps the stage first; row-reverse puts the copy on the left. */}
      <div
        className="hero-row"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 1560,
          margin: "0 auto",
          padding: "10px 48px 90px",
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 44,
        }}
      >
      {/* animation stage */}
      <div
        ref={stageRef}
        className="hero-stage"
        style={{
          flex: "0 1 46%",
          width: "46%",
          minHeight: 520,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ position: "relative", width: "min(600px,100%)" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 40px 90px -36px rgba(14,13,18,.42)",
              border: "1px solid rgba(14,13,18,.07)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 16px",
                borderBottom: "1px solid rgba(14,13,18,.07)",
                background: "#fbfafc",
              }}
            >
              <span style={dot("#ff5f57")} />
              <span style={dot("#febc2e")} />
              <span style={dot("#28c840")} />
              <span
                style={{
                  marginLeft: 12,
                  fontFamily: MONO,
                  fontSize: 11.5,
                  color: "#8b8896",
                }}
              >
                build.mindfultech / <span style={{ color: "#0e0d12" }}>digital-product</span>
              </span>
            </div>

            <div style={{ position: "relative", height: 380, overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: 22,
                  background: "#fbfbfd",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 10.5,
                      letterSpacing: ".12em",
                      color: "#8b8896",
                    }}
                  >
                    DIGITAL PRODUCT · SPRINT 14
                  </span>
                  <span
                    data-live
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: ".1em",
                      color: "#0e0d12",
                      background: "#6fd3b8",
                      padding: "5px 9px",
                      borderRadius: 4,
                      opacity: 0,
                    }}
                  >
                    ✓ LIVE
                  </span>
                </div>

                {/* wf 0 — navbar mock */}
                <div
                  data-wf="0"
                  style={{
                    marginTop: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    height: 30,
                    background: "#fff",
                    border: "1px solid rgba(14,13,18,.08)",
                    borderRadius: 8,
                    padding: "0 10px",
                    boxShadow: "0 4px 10px -6px rgba(14,13,18,.12)",
                    opacity: 0,
                  }}
                >
                  <Logo size={13} />
                  <span style={bar(34, "#d8d7de")} />
                  <span style={bar(24, "#d8d7de")} />
                  <span
                    style={{
                      marginLeft: "auto",
                      width: 54,
                      height: 16,
                      borderRadius: 5,
                      background: "var(--accent)",
                    }}
                  />
                </div>

                {/* wf 1 — banner + selection handles */}
                <div
                  data-wf="1"
                  style={{
                    position: "relative",
                    marginTop: 12,
                    height: 92,
                    borderRadius: 10,
                    background:
                      "linear-gradient(120deg,color-mix(in srgb,var(--accent) 55%,#bfe0ea),color-mix(in srgb,var(--accent) 22%,#dfe9f6) 55%,#f5efe6)",
                    opacity: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 14,
                      top: 20,
                      width: 150,
                      height: 12,
                      borderRadius: 6,
                      background: "#fff",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 14,
                      top: 40,
                      width: 100,
                      height: 9,
                      borderRadius: 5,
                      background: "rgba(255,255,255,.65)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 14,
                      bottom: 12,
                      width: 74,
                      height: 20,
                      borderRadius: 6,
                      background: "#0e0d12",
                    }}
                  />
                  <div data-handles style={{ position: "absolute", inset: 0, opacity: 1 }}>
                    <div
                      style={{
                        position: "absolute",
                        inset: -5,
                        border: "1.5px solid var(--accent)",
                        borderRadius: 12,
                      }}
                    />
                    {[
                      { left: -8, top: -8 },
                      { right: -8, top: -8 },
                      { left: -8, bottom: -8 },
                      { right: -8, bottom: -8 },
                    ].map((p, i) => (
                      <span
                        key={i}
                        style={{
                          position: "absolute",
                          width: 7,
                          height: 7,
                          background: "#fff",
                          border: "1.5px solid var(--accent)",
                          ...p,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* wf 2 — color cards */}
                <div
                  data-wf="2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 10,
                    marginTop: 14,
                    opacity: 0,
                  }}
                >
                  <MiniCard
                    bg="var(--accent-tint)"
                    border="1px solid color-mix(in srgb,var(--accent) 24%,transparent)"
                    a="color-mix(in srgb,var(--accent) 60%,#fff)"
                    b="color-mix(in srgb,var(--accent) 32%,#fff)"
                  />
                  <MiniCard
                    bg="#e7f1f9"
                    border="1px solid rgba(133,191,233,.5)"
                    a="#85bfe9"
                    b="#bcdaf1"
                  />
                  <MiniCard
                    bg="#fcf1e7"
                    border="1px solid rgba(245,189,144,.55)"
                    a="#f5bd90"
                    b="#f9d9bf"
                  />
                </div>

                {/* agent bubble */}
                <div
                  data-bubble0
                  style={{
                    position: "absolute",
                    right: 22,
                    top: 148,
                    zIndex: 3,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#fff",
                    border: "1px solid rgba(14,13,18,.09)",
                    borderRadius: 10,
                    padding: "9px 12px",
                    fontSize: 12.5,
                    fontWeight: 500,
                    boxShadow: "0 14px 30px -16px rgba(14,13,18,.35)",
                    opacity: 0,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--accent)",
                    }}
                  />
                  MT Agent · 42 tasks automated{" "}
                  <span style={{ color: "#1f9d6b", fontWeight: 700 }}>✓</span>
                </div>

                {/* adoption chart */}
                <div
                  data-chartwrap
                  style={{
                    position: "absolute",
                    left: 22,
                    bottom: 16,
                    width: "40%",
                    opacity: 0,
                  }}
                >
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 9.5,
                      letterSpacing: ".12em",
                      color: "#8b8896",
                    }}
                  >
                    ADOPTION · LIVE
                  </div>
                  <svg
                    viewBox="0 0 200 60"
                    style={{ width: "100%", height: 58, marginTop: 6, display: "block" }}
                    preserveAspectRatio="none"
                  >
                    <line x1="0" y1="52" x2="200" y2="52" stroke="rgba(14,13,18,.08)" strokeWidth="1" />
                    <path
                      data-chart-path
                      d="M0,52 C28,48 46,42 68,38 C98,32 128,22 158,13 C174,9 190,5 200,3"
                      stroke="var(--accent)"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      marginTop: 6,
                      alignItems: "baseline",
                    }}
                  >
                    <span>
                      <span
                        data-stat-uptime
                        style={{ fontWeight: 500, fontSize: 16, letterSpacing: "-.01em", color: "#0e0d12" }}
                      >
                        0%
                      </span>{" "}
                      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".1em", color: "#8b8896" }}>
                        UPTIME
                      </span>
                    </span>
                    <span>
                      <span
                        data-stat-adopt
                        style={{ fontWeight: 500, fontSize: 16, letterSpacing: "-.01em", color: "#0e0d12" }}
                      >
                        0x
                      </span>{" "}
                      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".1em", color: "#8b8896" }}>
                        ADOPTION
                      </span>
                    </span>
                  </div>
                </div>

                {/* code window */}
                <div
                  data-codewin
                  style={{
                    position: "absolute",
                    right: 14,
                    bottom: 14,
                    width: "52%",
                    background: "#17151f",
                    borderRadius: 10,
                    boxShadow: "0 24px 50px -20px rgba(10,8,16,.6)",
                    padding: "11px 13px",
                    fontFamily: MONO,
                    fontSize: 10.5,
                    lineHeight: 1.75,
                    opacity: 0,
                  }}
                >
                  <div data-code-line="0" style={{ color: "#eceaf4", opacity: 0.12 }}>
                    <span style={{ color: "#ef6a4e" }}>const</span> app ={" "}
                    <span style={{ color: "#9db4ff" }}>create</span>(
                    <span style={{ color: "#6fd3b8" }}>&apos;digital-product&apos;</span>);
                  </div>
                  <div data-code-line="1" style={{ color: "#eceaf4", opacity: 0.12 }}>
                    app.<span style={{ color: "#9db4ff" }}>use</span>(designSystem, auth);
                  </div>
                  <div data-code-line="2" style={{ color: "#eceaf4", opacity: 0.12 }}>
                    app.<span style={{ color: "#9db4ff" }}>deploy</span>(
                    <span style={{ color: "#6fd3b8" }}>&apos;aws&apos;</span>);{" "}
                    <span style={{ color: "#6a6880" }}>// tests 42/42 ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* hero copy */}
      <div className="hero-copy" style={{ flex: "0 1 660px", minWidth: 0 }}>
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
                      opacity: 0.55,
                      filter: "grayscale(1)",
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

const dot = (bg: string): React.CSSProperties => ({
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: bg,
});

const bar = (w: number, bg: string): React.CSSProperties => ({
  width: w,
  height: 5,
  borderRadius: 3,
  background: bg,
});

function MiniCard({
  bg,
  border,
  a,
  b,
}: {
  bg: string;
  border: string;
  a: string;
  b: string;
}) {
  return (
    <div style={{ height: 46, borderRadius: 9, background: bg, border, padding: 8 }}>
      <span style={{ display: "block", width: "62%", height: 6, borderRadius: 3, background: a }} />
      <span
        style={{
          display: "block",
          width: "42%",
          height: 6,
          borderRadius: 3,
          background: b,
          marginTop: 7,
        }}
      />
    </div>
  );
}
