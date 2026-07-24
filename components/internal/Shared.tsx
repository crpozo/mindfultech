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
