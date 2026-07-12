"use client";

import * as React from "react";
import Link from "next/link";

const MONO = "var(--mono)";

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: MONO,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: ".14em",
        color: "var(--accent)",
        background: "var(--accent-tint)",
        padding: "8px 14px",
        borderRadius: 5,
      }}
    >
      {children}
    </span>
  );
}

export function FooterLinks({
  links,
}: {
  links: { label: string; href: string }[];
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 14,
        padding: "36px 6px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        {links.map((l) => (
          <Link key={l.label} href={l.href} style={{ textDecoration: "none", fontSize: 13.5, color: "#44424d" }}>
            {l.label}
          </Link>
        ))}
      </div>
      <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: "#8b8896" }}>
        © 2026 MINDFULTECH · QUITO, ECUADOR
      </span>
    </div>
  );
}

export function DarkCTA({
  title,
  subtitle,
  primary,
  secondary,
}: {
  title: string;
  subtitle: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <div
      style={{
        background: "#0d0a1f",
        borderRadius: 16,
        padding: "clamp(40px,5vw,72px)",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontWeight: 500,
          fontSize: "clamp(28px,3vw,44px)",
          letterSpacing: "-.02em",
          margin: 0,
          color: "#fff",
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: 17, color: "#8f8ba4", margin: "14px auto 30px", maxWidth: 520 }}>
        {subtitle}
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <a
          href={primary.href}
          onClick={(e) => {
            // the contact form lives in the shared footer on every page
            if (primary.href === "#contact") {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("mt:open-form"));
            }
          }}
          className="btn-white"
          style={{
            textDecoration: "none",
            fontFamily: MONO,
            fontSize: 12.5,
            fontWeight: 500,
            letterSpacing: ".12em",
            background: "#fff",
            color: "#0d0a1f",
            padding: "16px 26px",
            borderRadius: 6,
          }}
        >
          {primary.label}
        </a>
        {secondary && (
          <a
            href={secondary.href}
            className="btn-ghost"
            style={{
              textDecoration: "none",
              fontFamily: MONO,
              fontSize: 12.5,
              fontWeight: 500,
              letterSpacing: ".12em",
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.3)",
              padding: "15px 26px",
              borderRadius: 6,
            }}
          >
            {secondary.label}
          </a>
        )}
      </div>
    </div>
  );
}
