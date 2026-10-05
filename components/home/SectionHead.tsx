import * as React from "react";

/**
 * The header every home section opens with: kicker pill, title, one-line
 * subtitle. The inner pages already start with a pill and a title (Pill in
 * components/internal/Shared.tsx); this brings the home in line and pins the
 * title scale, so six sections stop drifting between 49px and 58px on the
 * same screen. `align` keeps each section's existing alignment; `dark` is for
 * the two sections on #0d0a1f.
 */
export function SectionHead({
  kicker,
  title,
  sub,
  align = "center",
  dark = false,
  style,
}: {
  kicker: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "center" | "left";
  dark?: boolean;
  style?: React.CSSProperties;
}) {
  const center = align === "center";
  return (
    <div
      style={{
        textAlign: center ? "center" : "left",
        maxWidth: center ? 760 : 820,
        margin: center ? "0 auto" : 0,
        ...style,
      }}
    >
      <span className={dark ? "kicker kicker-dark" : "kicker"}>{kicker}</span>
      <h2
        style={{
          fontWeight: 500,
          fontSize: "clamp(34px,3.6vw,56px)",
          letterSpacing: "-.02em",
          lineHeight: 1.05,
          margin: "18px 0 0",
          color: dark ? "#fff" : "var(--ink)",
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.5,
            color: dark ? "#8f8ba4" : "#6b6875",
            fontWeight: 400,
            maxWidth: 620,
            margin: center ? "14px auto 0" : "14px 0 0",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
