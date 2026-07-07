import * as React from "react";
import Link from "next/link";
import { ImagePlaceholder } from "../ImagePlaceholder";

const MONO = "var(--mono)";

const overlay =
  "linear-gradient(180deg,rgba(10,8,16,.28) 0%,transparent 30%,transparent 45%,rgba(10,8,16,.72) 100%)";

export function ClientStories() {
  return (
    <section id="stories" style={{ position: "relative", background: "#fff", padding: "110px 0 0" }}>
      <div style={{ maxWidth: 1560, margin: "0 auto", padding: "0 48px" }}>
        <h2
          style={{
            textAlign: "center",
            fontWeight: 500,
            fontSize: "clamp(34px,3.6vw,56px)",
            letterSpacing: "-.02em",
            lineHeight: 1.05,
            margin: 0,
            color: "var(--ink)",
          }}
        >
          Teams build with MindfulTech
        </h2>
        <p
          style={{
            textAlign: "center",
            fontSize: 19,
            lineHeight: 1.5,
            color: "#8b8896",
            fontWeight: 400,
            maxWidth: 620,
            margin: "18px auto 54px",
          }}
        >
          See how our clients ship people-first products with the lab.
        </p>

        <div
          className="stack-3"
          style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr 1fr", gap: 22 }}
        >
          {/* USFQ — wide */}
          <div style={card("linear-gradient(150deg,#2a2736,#141126)")}>
            <div style={{ position: "absolute", inset: 0 }}>
              <ImagePlaceholder label="TEAM / CLIENT PHOTO" onDark />
            </div>
            <div style={{ position: "absolute", inset: 0, background: overlay, pointerEvents: "none" }} />
            <span style={brand}>USFQ</span>
            <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, pointerEvents: "none" }}>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 500,
                  fontSize: "clamp(20px,1.8vw,26px)",
                  lineHeight: 1.3,
                  letterSpacing: "-.01em",
                  maxWidth: 420,
                }}
              >
                How USFQ partnered with MindfulTech to serve 12,000 students in
                real time
              </div>
              <div style={metaLine}>PORTAL · AI ASSIST · ENTERPRISE</div>
            </div>
          </div>

          {/* Waku */}
          <div style={card("linear-gradient(150deg,#39323f,#191521)")}>
            <div style={{ position: "absolute", inset: 0 }}>
              <ImagePlaceholder label="CLIENT PHOTO" onDark />
            </div>
            <div style={{ position: "absolute", inset: 0, background: overlay, pointerEvents: "none" }} />
            <span style={brand}>Waku Inc.</span>
            <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, pointerEvents: "none" }}>
              <div style={bigStat}>80%</div>
              <div style={metaLine}>LESS MANUAL ORDER PROCESSING</div>
            </div>
          </div>

          {/* KrugerLabs */}
          <div style={card("linear-gradient(150deg,#2c3340,#151a24)")}>
            <div style={{ position: "absolute", inset: 0 }}>
              <ImagePlaceholder label="CLIENT PHOTO" onDark />
            </div>
            <div style={{ position: "absolute", inset: 0, background: overlay, pointerEvents: "none" }} />
            <span style={brand}>KrugerLabs</span>
            <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, pointerEvents: "none" }}>
              <div style={bigStat}>3×</div>
              <div style={metaLine}>PLATFORMS, ONE DESIGN SYSTEM</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 44 }}>
          <Link
            href="/work"
            className="btn-dark"
            style={{
              textDecoration: "none",
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: ".12em",
              background: "#0e0d12",
              color: "#fff",
              padding: "15px 24px",
              borderRadius: 6,
            }}
          >
            VIEW ALL STORIES
          </Link>
        </div>

        <div
          className="stack-4"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 26,
            marginTop: 96,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{ borderTop: "1px solid rgba(14,13,18,.16)" }} />
          ))}
        </div>
      </div>
    </section>
  );
}

function card(bg: string): React.CSSProperties {
  return {
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
    minHeight: 420,
    background: bg,
  };
}

const brand: React.CSSProperties = {
  position: "absolute",
  left: 20,
  top: 18,
  fontWeight: 600,
  fontSize: 19,
  color: "#fff",
  letterSpacing: ".01em",
  zIndex: 1,
};

const metaLine: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10.5,
  letterSpacing: ".12em",
  color: "rgba(255,255,255,.75)",
  marginTop: 12,
};

const bigStat: React.CSSProperties = {
  color: "#fff",
  fontWeight: 500,
  fontSize: "clamp(34px,2.6vw,44px)",
  letterSpacing: "-.02em",
  lineHeight: 1,
};
