"use client";

import * as React from "react";

/* Three Dots (the cute MicroDuck-like agents from the AI journey) at work: Fin handles a claim, Sopo answers a
   ticket, Sal books a meeting. Documents travel between desks on a small conveyor, a person's hand stamps the
   one that needs a signature. Pure SVG + CSS animation, so it costs nothing on phones. */

const GREEN = "#3DBE7D", LIME = "#BFF5CF", INK = "#0E1013";

function Dot({ x, y, name, acc, delay }: { x: number; y: number; name: string; acc: "visor" | "headset" | "bubble"; delay: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="27" rx="17" ry="5" fill="#000" opacity="0.35" />
      <g className="aw-bob" style={{ animationDelay: `${delay}s` }}>
        <ellipse cx="-8" cy="25" rx="7" ry="3.2" fill="#F2A33C" /><ellipse cx="8" cy="25" rx="7" ry="3.2" fill="#F2A33C" />
        <ellipse cx="0" cy="2" rx="22" ry="24" fill={GREEN} />
        <ellipse cx="0" cy="10" rx="13" ry="11" fill={LIME} opacity="0.55" />
        <circle cx="-9" cy="-11" r="6" fill="#fff" opacity="0.28" />
        <g className="aw-arm" style={{ animationDelay: `${delay + 0.3}s` }}><ellipse cx="-21" cy="8" rx="4.5" ry="7" fill={GREEN} transform="rotate(18 -21 8)" /></g>
        <g className="aw-arm2" style={{ animationDelay: `${delay}s` }}><ellipse cx="21" cy="8" rx="4.5" ry="7" fill={GREEN} transform="rotate(-18 21 8)" /></g>
        <path d="M0 -22 q2 -8 6 -12" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="6.5" cy="-35" r="3.2" fill={LIME} stroke={INK} strokeWidth="1.2" className="aw-glow" style={{ animationDelay: `${delay}s` }} />
        {[-7.5, 7.5].map((ex) => (
          <g key={ex}>
            <circle cx={ex} cy="-4" r="7.2" fill="#fff" stroke={INK} strokeWidth="1.2" />
            <circle cx={ex} cy="-3" r="3.6" fill={INK} />
            <circle cx={ex + 1.6} cy="-5.2" r="1.4" fill="#fff" />
            <rect x={ex - 7.6} y="-11.6" width="15.2" height="15.2" rx="7.6" fill={GREEN} className="aw-blink" style={{ animationDelay: `${delay * 1.7}s` }} />
          </g>
        ))}
        <ellipse cx="-13" cy="3" rx="3.6" ry="2" fill="#FF9BB0" opacity="0.8" /><ellipse cx="13" cy="3" rx="3.6" ry="2" fill="#FF9BB0" opacity="0.8" />
        <path d="M-4 4 q4 3 8 0 q-4 5 -8 0z" fill="#F2A33C" stroke={INK} strokeWidth="0.8" />
        {acc === "visor" && <><path d="M-21 -16 h42 l5 7 h-52z" fill="#1F7A4D" /><rect x="-18" y="-15" width="36" height="3" fill="#fff" opacity="0.6" /></>}
        {acc === "headset" && <><path d="M-23 -6 a23 23 0 0 1 46 0" fill="none" stroke="#fff" strokeWidth="3" /><rect x="-27" y="-9" width="6" height="12" rx="3" fill="#fff" /><rect x="21" y="-9" width="6" height="12" rx="3" fill="#fff" /></>}
        {acc === "bubble" && <><path d="M12 -48 h22 a5 5 0 0 1 5 5 v10 a5 5 0 0 1 -5 5 h-12 l-6 6 v-6 h-4 a5 5 0 0 1 -5 -5 v-10 a5 5 0 0 1 5 -5z" fill="#fff" />{[19, 25, 31].map((cx) => <circle key={cx} cx={cx} cy="-38" r="1.6" fill={INK} />)}</>}
      </g>
      <text x="0" y="46" textAnchor="middle" fill="#9AA3A1" fontSize="9" fontFamily="var(--font-jbmono), monospace" letterSpacing="1">{name}</text>
    </g>
  );
}

export function AgentsAtWork({ es }: { es: boolean }) {
  const desk = (x: number, label: string) => (
    <g key={label}>
      <rect x={x - 46} y="150" width="92" height="8" rx="2" fill="#2A2E37" />
      <rect x={x - 40} y="158" width="6" height="26" fill="#1F232B" /><rect x={x + 34} y="158" width="6" height="26" fill="#1F232B" />
      <rect x={x - 22} y="118" width="44" height="30" rx="3" fill="#15181E" stroke="#3A3F4A" />
      <rect x={x - 18} y="123" width="36" height="3" rx="1" fill={GREEN} opacity="0.8" /><rect x={x - 18} y="129" width="26" height="2" fill="#4A5160" /><rect x={x - 18} y="134" width="30" height="2" fill="#4A5160" /><rect x={x - 18} y="139" width="18" height="2" fill="#4A5160" />
      <text x={x} y="112" textAnchor="middle" fill="#6B7280" fontSize="8" fontFamily="var(--font-jbmono), monospace" letterSpacing="1.2">{label}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 600 230" className="aw" role="img" aria-label={es ? "Tres agentes trabajando" : "Three agents at work"}>
      <defs><linearGradient id="awFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f0f1c" /><stop offset="1" stopColor="#151826" /></linearGradient></defs>
      <rect width="600" height="230" fill="url(#awFloor)" />
      {/* conveyor */}
      <rect x="40" y="96" width="520" height="6" rx="3" fill="#232733" />
      <g className="aw-belt"><rect x="40" y="96" width="520" height="6" rx="3" fill="url(#awFloor)" opacity="0" />{Array.from({ length: 14 }, (_, i) => <rect key={i} x={40 + i * 40} y="97" width="12" height="4" rx="2" fill="#3A3F4A" />)}</g>
      {/* travelling documents */}
      {[0, 1, 2].map((i) => (
        <g key={i} className="aw-doc" style={{ animationDelay: `${i * 2.4}s` }}>
          <rect x="-9" y="-12" width="18" height="22" rx="2" fill="#fff" stroke={INK} strokeWidth="0.8" />
          <rect x="-6" y="-7" width="12" height="2" fill="#9AA3A1" /><rect x="-6" y="-3" width="9" height="2" fill="#9AA3A1" /><rect x="-6" y="1" width="11" height="2" fill="#9AA3A1" />
          <g className="aw-check"><circle cx="7" cy="-9" r="5" fill={GREEN} /><path d="M4.5 -9 l2 2 l3.5 -4" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" /></g>
        </g>
      ))}
      {/* the human stamp on the one that needs a signature */}
      <g className="aw-stamp" transform="translate(470,60)">
        <rect x="-16" y="-30" width="32" height="26" rx="4" fill="#E9D8C5" stroke={INK} strokeWidth="1" />
        <rect x="-10" y="-4" width="20" height="8" rx="2" fill="#1F7A4D" />
        <text x="0" y="-15" textAnchor="middle" fontSize="7" fontFamily="var(--font-jbmono), monospace" fill={INK}>OK</text>
      </g>
      <text x="470" y="34" textAnchor="middle" fill={LIME} fontSize="8" fontFamily="var(--font-jbmono), monospace" letterSpacing="1.2">{es ? "FIRMA HUMANA" : "HUMAN SIGN-OFF"}</text>
      {desk(120, es ? "FACTURACIÓN" : "BILLING")}{desk(300, es ? "SOPORTE" : "SUPPORT")}{desk(480, es ? "VENTAS" : "SALES")}
      <Dot x={120} y={150} name="FIN" acc="visor" delay={0} />
      <Dot x={300} y={150} name="SOPO" acc="headset" delay={0.5} />
      <Dot x={480} y={150} name="SAL" acc="bubble" delay={1} />
      {/* status pills */}
      {[[120, es ? "RECLAMO #4821 ✓" : "CLAIM #4821 ✓"], [300, es ? "3 TICKETS ✓ / 1 → PERSONA" : "3 TICKETS ✓ / 1 → PERSON"], [480, es ? "REUNIÓN AGENDADA" : "MEETING BOOKED"]].map(([x, t], i) => (
        <g key={i} className="aw-pill" style={{ animationDelay: `${i * 1.3}s` }}><rect x={Number(x) - 52} y="208" width="104" height="14" rx="7" fill="#1A2E24" stroke={GREEN} strokeWidth="0.8" /><text x={x} y="218" textAnchor="middle" fill={LIME} fontSize="7" fontFamily="var(--font-jbmono), monospace" letterSpacing="0.8">{t}</text></g>
      ))}
      <style>{`
        .aw { width: 100%; height: auto; display: block; }
        .aw-bob { animation: awBob 2.4s ease-in-out infinite; transform-origin: 0 20px; }
        @keyframes awBob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-2px) } }
        .aw-arm { animation: awArm 0.9s ease-in-out infinite; transform-origin: -21px 2px; }
        .aw-arm2 { animation: awArm2 0.9s ease-in-out infinite; transform-origin: 21px 2px; }
        @keyframes awArm { 0%,100% { transform: rotate(0) } 50% { transform: rotate(-16deg) } }
        @keyframes awArm2 { 0%,100% { transform: rotate(0) } 50% { transform: rotate(16deg) } }
        .aw-blink { transform-origin: center; transform: scaleY(0); animation: awBlink 4s infinite; }
        @keyframes awBlink { 0%,92%,100% { transform: scaleY(0) } 95% { transform: scaleY(1) } }
        .aw-glow { animation: awGlow 1.6s ease-in-out infinite; }
        @keyframes awGlow { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
        .aw-belt { animation: awBelt 1.6s linear infinite; }
        @keyframes awBelt { to { transform: translateX(40px) } }
        .aw-doc { animation: awDoc 7.2s linear infinite; }
        @keyframes awDoc { 0% { transform: translate(60px, 90px); opacity: 0 } 5% { opacity: 1 } 95% { opacity: 1 } 100% { transform: translate(540px, 90px); opacity: 0 } }
        .aw-check { opacity: 0; animation: awCheck 7.2s linear infinite; }
        @keyframes awCheck { 0%,35% { opacity: 0 } 42%,100% { opacity: 1 } }
        .aw-stamp { animation: awStamp 7.2s ease-in-out infinite; transform-origin: 470px 60px; }
        @keyframes awStamp { 0%,70% { transform: translateY(-8px) } 74% { transform: translateY(14px) } 78%,100% { transform: translateY(-8px) } }
        .aw-pill { animation: awPill 3.9s ease-in-out infinite; }
        @keyframes awPill { 0%,20% { opacity: 0; transform: translateY(4px) } 30%,90% { opacity: 1; transform: translateY(0) } 100% { opacity: 0 } }
        @media (prefers-reduced-motion: reduce) { .aw * { animation: none !important } }
      `}</style>
    </svg>
  );
}
