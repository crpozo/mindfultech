"use client";

import * as React from "react";

/* Three Dots (the cute MicroDuck-like agents from the AI journey) at work: Fin handles a claim, Sopo answers a
   ticket, Sal books a meeting. Documents travel between desks on a small conveyor, a person's hand stamps the
   one that needs a signature. Pure SVG + CSS animation, so it costs nothing on phones. */

const GREEN = "#3DBE7D", LIME = "#BFF5CF", INK = "#0E1013";

type Kind = "blue" | "green" | "yellow" | "pink";
const PAL: Record<Kind, [string, string, string]> = { blue: ["#7CC4FF", "#2E8BEA", "#1A5FB8"], green: ["#C8F57A", "#7ED321", "#4E9A12"], yellow: ["#FFE07A", "#F5B400", "#C98A00"], pink: ["#FF8BD6", "#F04FB3", "#B8277F"] };
function Dot({ x, y, name, kind, delay }: { x: number; y: number; name: string; kind: Kind; delay: number }) {
  // After the OpenAI Dots: soft plush blobs, each with its own shape, colour and one accessory.
  const [hi, mid, lo] = PAL[kind];
  const gid = `awB-${kind}`;
  const body = {
    blue: "M-30 20 C-34 -2 -26 -18 -14 -24 C-8 -34 6 -36 14 -28 C26 -24 32 -8 30 10 C28 24 16 30 0 30 C-14 30 -28 28 -30 20Z",
    green: "M-28 22 C-32 2 -22 -20 -6 -28 C8 -34 24 -24 28 -8 C32 8 26 26 10 30 C-6 32 -24 30 -28 22Z",
    yellow: "M-30 26 C-30 6 -18 -14 -4 -30 C2 -36 6 -34 10 -28 C22 -12 32 6 30 26 C30 30 26 32 20 32 L-20 32 C-26 32 -30 30 -30 26Z",
    pink: "M-30 2 C-32 -16 -16 -30 0 -18 C16 -30 32 -16 30 2 C28 18 12 30 0 32 C-12 30 -28 18 -30 2Z",
  }[kind];
  return (
    <g transform={`translate(${x},${y})`}>
      <defs><radialGradient id={gid} cx="0.35" cy="0.25" r="0.95"><stop offset="0" stopColor={hi} /><stop offset="0.5" stopColor={mid} /><stop offset="1" stopColor={lo} /></radialGradient></defs>
      <ellipse cx="0" cy="36" rx="24" ry="4.5" fill="#000" opacity="0.32" />
      <g className="aw-bob" style={{ animationDelay: `${delay}s` }}>
        <path d={body} fill={`url(#${gid})`} />
        <path d={body} fill="url(#awSheen)" opacity="0.5" />
        {kind === "blue" && <>
          <path d="M-22 -22 C-26 -36 -2 -42 10 -36 C16 -33 14 -26 6 -26 C-6 -24 -14 -22 -22 -22Z" fill="#2B2B33" /><ellipse cx="-4" cy="-30" rx="18" ry="7" fill="#3A3A44" /><circle cx="2" cy="-39" r="3" fill="#2B2B33" />
          <rect x="-10" y="2" width="4" height="8" rx="2" fill="#0E1013" /><rect x="6" y="2" width="4" height="8" rx="2" fill="#0E1013" />
        </>}
        {kind === "green" && <>
          <circle cx="-9" cy="-24" r="8" fill="#fff" /><circle cx="9" cy="-24" r="8" fill="#fff" /><circle cx="-8" cy="-23" r="3.6" fill="#0E1013" className="aw-eye" style={{ animationDelay: `${delay}s` }} /><circle cx="10" cy="-23" r="3.6" fill="#0E1013" className="aw-eye" style={{ animationDelay: `${delay}s` }} />
          <path d="M-6 8 q6 4 12 0" fill="none" stroke="#0E1013" strokeWidth="2" strokeLinecap="round" />
        </>}
        {kind === "yellow" && <>
          <circle cx="-9" cy="2" r="8" fill="none" stroke="#0E1013" strokeWidth="2.4" /><circle cx="9" cy="2" r="8" fill="none" stroke="#0E1013" strokeWidth="2.4" /><path d="M-1 2 h2" stroke="#0E1013" strokeWidth="2.4" />
          <path d="M-13 2 q4 -5 8 0 M5 2 q4 -5 8 0" fill="none" stroke="#0E1013" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M-5 14 q5 4 10 0" fill="none" stroke="#0E1013" strokeWidth="2" strokeLinecap="round" />
        </>}
        {kind === "pink" && <>
          <ellipse cx="-10" cy="0" rx="9" ry="7" fill="#0E1013" /><ellipse cx="10" cy="0" rx="9" ry="7" fill="#0E1013" /><path d="M-1 0 h2" stroke="#0E1013" strokeWidth="2.4" /><circle cx="-13" cy="-2" r="2" fill="#fff" opacity="0.6" /><circle cx="7" cy="-2" r="2" fill="#fff" opacity="0.6" />
          <path d="M-4 14 q4 3 8 0" fill="none" stroke="#0E1013" strokeWidth="2" strokeLinecap="round" />
        </>}
      </g>
      <text x="0" y="54" textAnchor="middle" fill="#C9D1CE" fontSize="9" fontFamily="var(--font-jbmono), monospace" letterSpacing="1.5">{name}</text>
    </g>
  );
}

export function AgentsAtWork({ es }: { es: boolean }) {
  const desk = (x: number, label: string) => (
    <g key={label}>
      <rect x={x - 54} y="180" width="108" height="6" rx="3" fill="#232733" />
      <text x={x} y="212" textAnchor="middle" fill="#6B7280" fontSize="7.5" fontFamily="var(--font-jbmono), monospace" letterSpacing="1.5">{label}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 600 230" className="aw" role="img" aria-label={es ? "Tres agentes trabajando" : "Three agents at work"}>
      <defs><linearGradient id="awFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f0f1c" /><stop offset="1" stopColor="#151826" /></linearGradient><radialGradient id="awBody" cx="0.35" cy="0.3" r="0.9"><stop offset="0" stopColor="#8FE3B4" /><stop offset="0.55" stopColor="#3DBE7D" /><stop offset="1" stopColor="#1F7A4D" /></radialGradient><linearGradient id="awSheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.35" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
      <rect width="600" height="230" fill="url(#awFloor)" />
      {/* conveyor */}
      <rect x="40" y="26" width="520" height="4" rx="2" fill="#232733" />
      <g className="aw-belt">{Array.from({ length: 14 }, (_, i) => <rect key={i} x={40 + i * 40} y="26" width="12" height="4" rx="2" fill="#3A3F4A" />)}</g>
      {/* travelling documents */}
      {[0, 1, 2].map((i) => (
        <g key={i} className="aw-doc" style={{ animationDelay: `${i * 2.4}s` }}>
          <rect x="-9" y="-12" width="18" height="22" rx="2" fill="#fff" stroke={INK} strokeWidth="0.8" />
          <rect x="-6" y="-7" width="12" height="2" fill="#9AA3A1" /><rect x="-6" y="-3" width="9" height="2" fill="#9AA3A1" /><rect x="-6" y="1" width="11" height="2" fill="#9AA3A1" />
          <g className="aw-check"><circle cx="7" cy="-9" r="5" fill={GREEN} /><path d="M4.5 -9 l2 2 l3.5 -4" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" /></g>
        </g>
      ))}
      {/* the human stamp on the one that needs a signature */}
      <g className="aw-stamp" transform="translate(556,8)">
        <rect x="-16" y="-30" width="32" height="26" rx="4" fill="#E9D8C5" stroke={INK} strokeWidth="1" />
        <rect x="-10" y="-4" width="20" height="8" rx="2" fill="#1F7A4D" />
        <text x="0" y="-15" textAnchor="middle" fontSize="7" fontFamily="var(--font-jbmono), monospace" fill={INK}>OK</text>
      </g>
      <text x="556" y="44" textAnchor="middle" fill={LIME} fontSize="6.5" fontFamily="var(--font-jbmono), monospace" letterSpacing="1.2">{es ? "FIRMA HUMANA" : "HUMAN SIGN-OFF"}</text>
      {desk(110, es ? "FACTURACIÓN" : "BILLING")}{desk(300, es ? "SOPORTE" : "SUPPORT")}{desk(490, es ? "VENTAS" : "SALES")}
      <Dot x={110} y={146} name="FIN" kind="yellow" delay={0} />
      <Dot x={300} y={146} name="SOPO" kind="green" delay={0.5} />
      <Dot x={490} y={146} name="SAL" kind="pink" delay={1} />
      <g transform="translate(0,0) scale(0.7)" style={{ transformOrigin: "590px 180px" }}><Dot x={590} y={178} name="" kind="blue" delay={1.4} /></g>
      {/* status pills */}
      {[[110, es ? "RECLAMO #4821 ✓" : "CLAIM #4821 ✓"], [300, es ? "3 TICKETS ✓ / 1 → PERSONA" : "3 TICKETS ✓ / 1 → PERSON"], [490, es ? "REUNIÓN AGENDADA" : "MEETING BOOKED"]].map(([x, t], i) => (
        <g key={i} className="aw-pill" style={{ animationDelay: `${i * 1.3}s` }}><rect x={Number(x) - (i === 1 ? 78 : 56)} y="54" width={i === 1 ? 156 : 112} height="14" rx="7" fill="#16271F" stroke={GREEN} strokeWidth="0.6" /><text x={x} y="64" textAnchor="middle" fill={LIME} fontSize="7" fontFamily="var(--font-jbmono), monospace" letterSpacing="0.8">{t}</text></g>
      ))}
      <style>{`
        .aw { width: 100%; height: auto; display: block; }
        .aw-bob { animation: awBob 3.2s ease-in-out infinite; transform-origin: 0 28px; }
        @keyframes awBob { 0%,100% { transform: translateY(0) scale(1, 1) } 50% { transform: translateY(-3px) scale(1.02, 0.98) } }
        .aw-eye { transform-origin: center; animation: awEye 4.2s infinite; }
        @keyframes awEye { 0%,92%,100% { transform: scaleY(1) } 95% { transform: scaleY(0.1) } }
        .aw-belt { animation: awBelt 1.6s linear infinite; }
        @keyframes awBelt { to { transform: translateX(40px) } }
        .aw-doc { animation: awDoc 7.2s linear infinite; }
        @keyframes awDoc { 0% { transform: translate(60px, 22px); opacity: 0 } 5% { opacity: 1 } 95% { opacity: 1 } 100% { transform: translate(540px, 22px); opacity: 0 } }
        .aw-check { opacity: 0; animation: awCheck 7.2s linear infinite; }
        @keyframes awCheck { 0%,35% { opacity: 0 } 42%,100% { opacity: 1 } }
        .aw-stamp { animation: awStamp 7.2s ease-in-out infinite; transform-origin: 556px 8px; }
        @keyframes awStamp { 0%,84% { transform: translateY(-6px) } 88% { transform: translateY(10px) } 92%,100% { transform: translateY(-6px) } }
        .aw-pill { animation: awPill 3.9s ease-in-out infinite; }
        @keyframes awPill { 0%,20% { opacity: 0; transform: translateY(4px) } 30%,90% { opacity: 1; transform: translateY(0) } 100% { opacity: 0 } }
        @media (prefers-reduced-motion: reduce) { .aw * { animation: none !important } }
      `}</style>
    </svg>
  );
}
