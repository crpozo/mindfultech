import * as React from "react";

/**
 * The MindfulTech mark — a network brain in left profile: connected green
 * nodes tracing the outline, a few inner branches, free "synapse" dots, and
 * a stem hanging below. Traced from the brand logo.
 */
export const BRAND_GREEN = "#4FAE87";
export const BRAND_NAVY = "#24344E";

export function Logo({
  size = 28,
  color = BRAND_GREEN,
}: {
  size?: number;
  color?: string;
}) {
  const w = Math.round((size * 96) / 88);
  return (
    <svg width={w} height={size} viewBox="0 0 96 88" fill="none" aria-hidden>
      {/* perimeter — P8 dangles on purpose: the rear fold */}
      <line x1="9" y1="47" x2="15" y2="30" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="15" y1="30" x2="29" y2="16" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="29" y1="16" x2="47" y2="11" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="47" y1="11" x2="63" y2="17" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="63" y1="17" x2="77" y2="28" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="77" y1="28" x2="84" y2="43" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="84" y1="43" x2="75" y2="57" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="60" y1="66" x2="43" y2="69" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="43" y1="69" x2="27" y2="64" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="27" y1="64" x2="16" y2="56" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="16" y1="56" x2="9" y2="47" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      {/* branches + stem */}
      <line x1="29" y1="16" x2="33" y2="33" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="47" y1="11" x2="52" y2="28" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="52" y1="28" x2="43" y2="48" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="43" y1="48" x2="43" y2="69" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="77" y1="28" x2="65" y2="42" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="65" y1="42" x2="60" y2="66" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="43" y1="69" x2="40" y2="81" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      {/* joints */}
      <circle cx="9" cy="47" r="3.4" fill={color} />
      <circle cx="15" cy="30" r="3" fill={color} />
      <circle cx="29" cy="16" r="3.4" fill={color} />
      <circle cx="47" cy="11" r="3" fill={color} />
      <circle cx="63" cy="17" r="3.4" fill={color} />
      <circle cx="77" cy="28" r="3" fill={color} />
      <circle cx="84" cy="43" r="3.4" fill={color} />
      <circle cx="75" cy="57" r="3" fill={color} />
      <circle cx="60" cy="66" r="3.4" fill={color} />
      <circle cx="43" cy="69" r="3" fill={color} />
      <circle cx="27" cy="64" r="3.4" fill={color} />
      <circle cx="16" cy="56" r="2.6" fill={color} />
      <circle cx="33" cy="33" r="2.8" fill={color} />
      <circle cx="52" cy="28" r="2.8" fill={color} />
      <circle cx="43" cy="48" r="3" fill={color} />
      <circle cx="65" cy="42" r="2.8" fill={color} />
      <circle cx="40" cy="81" r="3" fill={color} />
      {/* synapse dots */}
      <circle cx="23" cy="23" r="1.7" fill={color} />
      <circle cx="41" cy="22" r="1.5" fill={color} />
      <circle cx="57" cy="25" r="1.7" fill={color} />
      <circle cx="72" cy="38" r="1.5" fill={color} />
      <circle cx="20" cy="41" r="1.5" fill={color} />
      <circle cx="31" cy="44" r="1.7" fill={color} />
      <circle cx="56" cy="52" r="1.5" fill={color} />
      <circle cx="31" cy="57" r="1.7" fill={color} />
      <circle cx="52" cy="57" r="1.5" fill={color} />
      <circle cx="24" cy="50" r="1.3" fill={color} />
      <circle cx="61" cy="32" r="1.3" fill={color} />
      <circle cx="37" cy="27" r="1.3" fill={color} />
    </svg>
  );
}
