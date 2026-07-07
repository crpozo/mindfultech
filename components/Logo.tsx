import * as React from "react";

/**
 * The MindfulTech ensō mark — an open magenta/teal circle with a centered dot
 * (the person at the center of the process). The gradient itself lives once per
 * page in <MarkDefs/>; every mark just references url(#mt-mark).
 */
export function MarkDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <defs>
        <linearGradient id="mt-mark" x1="4" y1="4" x2="28" y2="28">
          <stop stopColor="var(--accent-light)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({
  size = 28,
  dot = "#0e0d12",
  stroke = "url(#mt-mark)",
}: {
  size?: number;
  dot?: string;
  stroke?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle
        cx="16"
        cy="16"
        r="11"
        stroke={stroke}
        strokeWidth="4.4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="53.5 15.6"
        transform="rotate(-52 16 16)"
      />
      <circle cx="16" cy="16" r="3.9" fill={dot} />
    </svg>
  );
}
