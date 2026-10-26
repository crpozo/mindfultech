"use client";

import * as React from "react";

/* Three Dots (the cute MicroDuck-like agents from the AI journey) at work: Fin handles a claim, Sopo answers a
   ticket, Sal books a meeting. Documents travel between desks on a small conveyor, a person's hand stamps the
   one that needs a signature. Pure SVG + CSS animation, so it costs nothing on phones. */

const GREEN = "#3DBE7D", LIME = "#BFF5CF", INK = "#0E1013";

function Dot({ x, y, name, role, delay, shape }: { x: number; y: number; name: string; role: "doc" | "headset" | "chat"; delay: number; shape: 0 | 1 | 2 }) {
  // Minimal, OpenAI-like: a soft rounded blob with a quiet gradient, two dot eyes, a faint glow. The role is a thin line icon.
  const bodies = [
    "M-26 -6 C-26 -28 -12 -36 0 -36 C14 -36 26 -26 26 -4 C26 16 16 28 0 28 C-16 28 -26 14 -26 -6Z",
    "M-28 2 C-30 -22 -14 -34 2 -34 C20 -34 30 -20 28 0 C26 18 14 28 -2 28 C-18 28 -26 18 -28 2Z",
    "M-24 -10 C-22 -30 -8 -36 4 -36 C20 -36 28 -22 26 -6 C24 12 18 28 0 28 C-14 28 -26 16 -24 -10Z",
  ];
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="34" rx="20" ry="4" fill="#000" opacity="0.3" />
      <g className="aw-bob" style={{ animationDelay: `${delay}s` }}>
        <path d={bodies[shape]} fill="url(#awBody)" />
        <path d={bodies[shape]} fill="url(#awSheen)" opacity="0.55" />
        <circle cx="-7" cy="-6" r="2.6" fill="#0E1013" className="aw-eye" style={{ animationDelay: `${delay * 1.7}s` }} />
        <circle cx="7" cy="-6" r="2.6" fill="#0E1013" className="aw-eye" style={{ animationDelay: `${delay * 1.7}s` }} />
        {role === "doc" && <g transform="translate(22,-30)" stroke="#E8FFF2" strokeWidth="1.4" fill="none" strokeLinecap="round"><rect x="-6" y="-8" width="12" height="15" rx="2" /><path d="M-3 -3h6M-3 1h6M-3 5h4" /></g>}
        {role === "headset" && <g stroke="#E8FFF2" strokeWidth="2.2" fill="none" strokeLinecap="round"><path d="M-22 -8 a22 22 0 0 1 44 0" /><rect x="-26" y="-10" width="6" height="11" rx="3" fill="#E8FFF2" stroke="none" /><rect x="20" y="-10" width="6" height="11" rx="3" fill="#E8FFF2" stroke="none" /></g>}
        {role === "chat" && <g transform="translate(24,-30)"><path d="M-9 -8 h18 a4 4 0 0 1 4 4 v8 a4 4 0 0 1 -4 4 h-9 l-5 5 v-5 h-4 a4 4 0 0 1 -4 -4 v-8 a4 4 0 0 1 4 -4z" fill="#E8FFF2" />{[-4, 0, 4].map((cx) => <circle key={cx} cx={cx} cy="0" r="1.3" fill="#1F7A4D" />)}</g>}
      </g>
      <text x="0" y="52" textAnchor="middle" fill="#C9D1CE" fontSize="9" fontFamily="var(--font-jbmono), monospace" letterSpacing="1.5">{name}</text>
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
      {desk(120, es ? "FACTURACIÓN" : "BILLING")}{desk(300, es ? "SOPORTE" : "SUPPORT")}{desk(480, es ? "VENTAS" : "SALES")}
      <Dot x={120} y={146} name="FIN" role="doc" delay={0} shape={0} />
      <Dot x={300} y={146} name="SOPO" role="headset" delay={0.5} shape={1} />
      <Dot x={480} y={146} name="SAL" role="chat" delay={1} shape={2} />
      {/* status pills */}
      {[[120, es ? "RECLAMO #4821 ✓" : "CLAIM #4821 ✓"], [300, es ? "3 TICKETS ✓ / 1 → PERSONA" : "3 TICKETS ✓ / 1 → PERSON"], [480, es ? "REUNIÓN AGENDADA" : "MEETING BOOKED"]].map(([x, t], i) => (
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
