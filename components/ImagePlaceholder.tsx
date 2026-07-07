import * as React from "react";

/**
 * Static stand-in for the prototype's drag-to-fill <image-slot>. It sits over a
 * parent gradient and shows a muted icon + caption so the layout reads as an
 * intentional image well rather than a blank box.
 */
export function ImagePlaceholder({
  label = "Image",
  onDark = false,
}: {
  label?: string;
  onDark?: boolean;
}) {
  const fg = onDark ? "rgba(255,255,255,.62)" : "rgba(14,13,18,.42)";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        textAlign: "center",
        padding: 16,
      }}
    >
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke={fg}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10.5,
          letterSpacing: ".12em",
          color: fg,
          maxWidth: "88%",
        }}
      >
        {label}
      </span>
    </div>
  );
}
