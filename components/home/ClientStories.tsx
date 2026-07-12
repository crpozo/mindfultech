"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "../i18n";
import { ImagePlaceholder } from "../ImagePlaceholder";

const MONO = "var(--mono)";

const overlay =
  "linear-gradient(180deg,rgba(10,8,16,.28) 0%,transparent 30%,transparent 45%,rgba(10,8,16,.72) 100%)";

export function ClientStories() {
  const { lang } = useLang();
  const es = lang === "es";
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
          {es ? "Equipos que construyen con MindfulTech" : "Teams build with MindfulTech"}
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
          {es ? "Mira cómo nuestros clientes lanzan productos centrados en personas con el lab." : "See how our clients ship people-first products with the lab."}
        </p>

        <div
          className="stack-3"
          style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr 1fr", gap: 22 }}
        >
          {/* USFQ — wide */}
          <StoryCard bg="linear-gradient(150deg,#2a2736,#141126)" brandName="USFQ" label={es ? "FOTO DEL EQUIPO / CLIENTE" : "TEAM / CLIENT PHOTO"}>
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
              {es ? "Cómo USFQ se alió con MindfulTech para servir a 12.000 estudiantes en tiempo real" : "How USFQ partnered with MindfulTech to serve 12,000 students in real time"}
            </div>
            <div style={metaLine}>{es ? "PORTAL · ASISTENTE IA · ENTERPRISE" : "PORTAL · AI ASSIST · ENTERPRISE"}</div>
          </StoryCard>

          {/* Waku */}
          <StoryCard bg="linear-gradient(150deg,#39323f,#191521)" brandName="Helixona" label={es ? "FOTO DEL CLIENTE" : "CLIENT PHOTO"}>
            <div style={bigStat}>80%</div>
            <div style={metaLine}>{es ? "MENOS PROCESAMIENTO MANUAL" : "LESS MANUAL ORDER PROCESSING"}</div>
          </StoryCard>

          {/* KrugerLabs */}
          <StoryCard bg="linear-gradient(150deg,#2c3340,#151a24)" brandName="KrugerLabs" label={es ? "FOTO DEL CLIENTE" : "CLIENT PHOTO"}>
            <div style={bigStat}>3×</div>
            <div style={metaLine}>{es ? "PLATAFORMAS, UN DESIGN SYSTEM" : "PLATFORMS, ONE DESIGN SYSTEM"}</div>
          </StoryCard>
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
            {es ? "VER TODOS LOS CASOS" : "VIEW ALL STORIES"}
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

function StoryCard({
  bg,
  brandName,
  label,
  children,
}: {
  bg: string;
  brandName: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="story-card"
      style={{
        position: "relative",
        borderRadius: 10,
        overflow: "hidden",
        minHeight: 420,
      }}
    >
      {/* zooming media layer (image + gradient) */}
      <div className="story-media" style={{ position: "absolute", inset: 0, background: bg }}>
        <ImagePlaceholder label={label} onDark />
      </div>
      <div style={{ position: "absolute", inset: 0, background: overlay, pointerEvents: "none", zIndex: 1 }} />
      <span style={brand}>{brandName}</span>
      <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, pointerEvents: "none", zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}

const brand: React.CSSProperties = {
  position: "absolute",
  left: 20,
  top: 18,
  fontWeight: 600,
  fontSize: 19,
  color: "#fff",
  letterSpacing: ".01em",
  zIndex: 2,
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
