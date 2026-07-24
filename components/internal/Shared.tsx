"use client";

import * as React from "react";
import Link from "next/link";

const MONO = "var(--mono)";

/**
 * Numbered section kicker — a small "02 — PROCESS" eyebrow above a section
 * heading so it's obvious you've moved into a new section of the page.
 */
export function SectionKicker({
  n,
  label,
  align = "left",
  onDark = false,
}: {
  n: string;
  label: string;
  align?: "left" | "center";
  onDark?: boolean;
}) {
  const num = onDark ? "var(--accent-light)" : "var(--accent-deep)";
  const line = onDark ? "rgba(255,255,255,.28)" : "rgba(14,13,18,.2)";
  const text = onDark ? "rgba(255,255,255,.72)" : "#54525c";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        justifyContent: align === "center" ? "center" : "flex-start",
        marginBottom: 18,
      }}
    >
      <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 600, letterSpacing: ".14em", color: num }}>{n}</span>
      <span style={{ width: 26, height: 1, background: line }} />
      <span
        style={{
          fontFamily: MONO,
          fontSize: 12.5,
          fontWeight: 600,
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: text,
        }}
      >
        {label}
      </span>
    </div>
  );
}

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
