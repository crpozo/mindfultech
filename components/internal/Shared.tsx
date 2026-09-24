"use client";

import * as React from "react";
import Link from "next/link";


/** Kicker above a page title — the same .kicker the home sections use. */
export function Pill({ children }: { children: React.ReactNode }) {
  return <span className="kicker">{children}</span>;
}
