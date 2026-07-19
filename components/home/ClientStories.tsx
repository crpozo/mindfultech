"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "../i18n";

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
          {/* USFQ · EventFlow — wide */}
          <StoryCard bg="linear-gradient(150deg,#2a2736,#141126)" brandName="USFQ" img="/art/eventflow-login.webp" href="/work#usfq">
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
              {es ? "Cómo USFQ lanzó EventFlow: una app iOS en el App Store en un sprint de dos semanas" : "How USFQ shipped EventFlow: an iOS app in the App Store in a two-week sprint"}
            </div>
            <div style={metaLine}>{es ? "EVENTOS · iOS · ENCUESTAS CON IA" : "EVENTS · iOS · AI SURVEYS"}</div>
          </StoryCard>

          {/* Helixona */}
          <StoryCard bg="linear-gradient(150deg,#39323f,#191521)" brandName="Helixona" img="/art/helixona-hero.webp" href="/work#healthcare">
            <div style={bigStat}>24/7</div>
            <div style={metaLine}>{es ? "AGENTE DE FACTURACIÓN MÉDICA CON IA" : "AI MEDICAL-BILLING AGENT"}</div>
          </StoryCard>

          {/* Western Fence Supply */}
          <StoryCard bg="linear-gradient(150deg,#2c3340,#151a24)" brandName="Western Fence Supply" img="/art/product.webp" href="/work#fence">
            <div style={bigStat}>Excel → Odoo</div>
            <div style={metaLine}>{es ? "CRM + RUTAS DE ENTREGA" : "CRM + DELIVERY ROUTES"}</div>
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
  img,
  href,
  children,
}: {
  bg: string;
  brandName: string;
  img: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="story-card"
      style={{
        position: "relative",
        display: "block",
        textDecoration: "none",
        borderRadius: 10,
        overflow: "hidden",
        minHeight: 420,
      }}
    >
      {/* zooming media layer (image + gradient) */}
      <div className="story-media" style={{ position: "absolute", inset: 0, background: bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={brandName} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: overlay, pointerEvents: "none", zIndex: 1 }} />
      <span style={brand}>{brandName}</span>
      <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, pointerEvents: "none", zIndex: 2 }}>
        {children}
      </div>
    </Link>
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
  fontSize: "clamp(28px,2.2vw,40px)",
  letterSpacing: "-.02em",
  lineHeight: 1,
};
