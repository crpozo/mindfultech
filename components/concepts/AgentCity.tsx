"use client";

import * as React from "react";

/* An agentized city: isometric blocks for the client sites (clinic, university, store, warehouse) around the
   MindfulTech office. Small Dots travel the streets carrying work, data pulses run along the links, windows
   light up through the night. SVG + SMIL/CSS, no WebGL. */

const CX = 300, CY = 70; // iso origin on screen
const K = 0.5; // iso slope
function iso(ix: number, iy: number, z = 0) { return [CX + (ix - iy) * 0.866 * 21, CY + (ix + iy) * K * 20 - z] as const; }
function Box({ ix, iy, w, d, h, top, left, right, children }: { ix: number; iy: number; w: number; d: number; h: number; top: string; left: string; right: string; children?: React.ReactNode }) {
  const p = (x: number, y: number, z = 0) => iso(x, y, z).join(",");
  return (
    <g>
      <polygon points={`${p(ix, iy + d)} ${p(ix, iy + d, h)} ${p(ix + w, iy + d, h)} ${p(ix + w, iy + d)}`} fill={left} />
      <polygon points={`${p(ix + w, iy + d)} ${p(ix + w, iy + d, h)} ${p(ix + w, iy, h)} ${p(ix + w, iy)}`} fill={right} />
      <polygon points={`${p(ix, iy, h)} ${p(ix + w, iy, h)} ${p(ix + w, iy + d, h)} ${p(ix, iy + d, h)}`} fill={top} />
      {children}
    </g>
  );
}
function Windows({ ix, iy, w, d, h, rows, seed }: { ix: number; iy: number; w: number; d: number; h: number; rows: number; seed: number }) {
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const z = 8 + r * ((h - 14) / Math.max(1, rows - 1));
    for (let c = 0; c < w * 2 - 1; c++) { const [x, y] = iso(ix + 0.3 + c * 0.5, iy + d, z); out.push(<rect key={`l${r}${c}`} x={x} y={y - 3} width="4" height="4" fill="#BFF5CF" className="ac-win" style={{ animationDelay: `${((seed + r * 3 + c * 7) % 11) * 0.7}s` }} />); }
    for (let c = 0; c < d * 2 - 1; c++) { const [x, y] = iso(ix + w, iy + d - 0.3 - c * 0.5, z); out.push(<rect key={`r${r}${c}`} x={x - 4} y={y - 3} width="4" height="4" fill="#BFF5CF" className="ac-win" style={{ animationDelay: `${((seed + r * 5 + c * 3) % 13) * 0.6}s` }} />); }
  }
  return <>{out}</>;
}
function MiniDot({ color, path, dur, delay }: { color: string; path: string; dur: number; delay: number }) {
  return (
    <g>
      <g className="ac-dot">
        <ellipse cx="0" cy="7" rx="6" ry="2" fill="#000" opacity="0.35" />
        <path d="M-7 4 C-8 -6 -3 -10 0 -10 C3 -10 8 -6 7 4 C6 8 -6 8 -7 4Z" fill={color} />
        <circle cx="-2.4" cy="-2" r="1.1" fill="#0E1013" /><circle cx="2.4" cy="-2" r="1.1" fill="#0E1013" />
        <rect x="-3" y="-14" width="6" height="5" rx="1" fill="#fff" opacity="0.95" />
        <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${delay}s`} path={path} />
      </g>
    </g>
  );
}

export function AgentCity({ es }: { es: boolean }) {
  const road = (a: readonly [number, number], b: readonly [number, number]) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#1E2230" strokeWidth="7" strokeLinecap="round" />;
  const hub = iso(5.5, 5.5), clinic = iso(1.5, 1.5), uni = iso(9.5, 1.5), store = iso(1.5, 9.5), wh = iso(9.5, 9.5);
  const seg = (a: readonly [number, number], b: readonly [number, number]) => `M${a[0]},${a[1]} L${b[0]},${b[1]}`;
  const loop = (a: readonly [number, number], b: readonly [number, number]) => `${seg(a, b)} ${seg(b, a)}`;
  const label = (p: readonly [number, number], t: string, dy = 26) => <text x={p[0]} y={p[1] + dy} textAnchor="middle" fill="#8A9A92" fontSize="7.5" fontFamily="var(--font-jbmono), monospace" letterSpacing="1.4">{t}</text>;
  return (
    <svg viewBox="0 0 600 320" className="ac" role="img" aria-label={es ? "Una ciudad con agentes trabajando" : "A city with agents at work"}>
      <defs>
        <linearGradient id="acSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c0f1c" /><stop offset="1" stopColor="#11182a" /></linearGradient>
        <radialGradient id="acGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#3dbe7d" stopOpacity="0.55" /><stop offset="1" stopColor="#3dbe7d" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="600" height="320" fill="url(#acSky)" />
      {/* ground */}
      <polygon points={`${iso(-1, -1).join(",")} ${iso(13, -1).join(",")} ${iso(13, 13).join(",")} ${iso(-1, 13).join(",")}`} fill="#121626" />
      {Array.from({ length: 15 }, (_, i) => <g key={i} stroke="#1A1F30" strokeWidth="0.6"><line x1={iso(i - 1, -1)[0]} y1={iso(i - 1, -1)[1]} x2={iso(i - 1, 13)[0]} y2={iso(i - 1, 13)[1]} /><line x1={iso(-1, i - 1)[0]} y1={iso(-1, i - 1)[1]} x2={iso(13, i - 1)[0]} y2={iso(13, i - 1)[1]} /></g>)}
      {/* roads hub <-> sites */}
      {road(hub, clinic)}{road(hub, uni)}{road(hub, store)}{road(hub, wh)}
      {/* data pulses */}
      {[[clinic, 0], [uni, 1.1], [store, 0.5], [wh, 1.7]].map(([p, d], i) => (
        <circle key={i} r="2.4" fill="#BFF5CF" className="ac-pulse"><animateMotion dur="2.6s" repeatCount="indefinite" begin={`${d}s`} path={seg(p as readonly [number, number], hub)} /></circle>
      ))}
      {/* buildings: back row first */}
      <Box ix={0.5} iy={0.5} w={2} d={2} h={34} top="#2A3146" left="#1C2233" right="#232A3E"><Windows ix={0.5} iy={0.5} w={2} d={2} h={34} rows={3} seed={1} /></Box>
      <g transform={`translate(${iso(1.5, 1.5, 34)[0]},${iso(1.5, 1.5, 34)[1]})`}><rect x="-6" y="-2" width="12" height="4" rx="1" fill="#F26D6D" /><rect x="-2" y="-6" width="4" height="12" rx="1" fill="#F26D6D" /></g>
      <Box ix={8.5} iy={0.5} w={2} d={2} h={26} top="#2A3146" left="#1C2233" right="#232A3E"><Windows ix={8.5} iy={0.5} w={2} d={2} h={26} rows={2} seed={4} /></Box>
      <Box ix={9} iy={0.2} w={1} d={0.6} h={40} top="#2F3650" left="#1C2233" right="#232A3E" />
      <Box ix={0.5} iy={8.5} w={2} d={2} h={18} top="#2A3146" left="#1C2233" right="#232A3E"><Windows ix={0.5} iy={8.5} w={2} d={2} h={18} rows={1} seed={7} /></Box>
      <g transform={`translate(${iso(1.5, 10.5, 12)[0]},${iso(1.5, 10.5, 12)[1]})`}><rect x="-22" y="-5" width="30" height="7" rx="1" fill="#F4C542" transform="skewY(26.6)" /></g>
      <Box ix={8.5} iy={8.5} w={2.5} d={2} h={14} top="#2A3146" left="#1C2233" right="#232A3E"><Windows ix={8.5} iy={8.5} w={2.5} d={2} h={14} rows={1} seed={9} /></Box>
      {/* hub: the MindfulTech office, lit */}
      <circle cx={hub[0]} cy={hub[1]} r="46" fill="url(#acGlow)" />
      <Box ix={4.5} iy={4.5} w={2} d={2} h={30} top="#3DBE7D" left="#1F7A4D" right="#2A9A62"><Windows ix={4.5} iy={4.5} w={2} d={2} h={30} rows={3} seed={2} /></Box>
      <g transform={`translate(${iso(5.5, 5.5, 30)[0]},${iso(5.5, 5.5, 30)[1]})`}><line x1="0" y1="0" x2="0" y2="-16" stroke="#BFF5CF" strokeWidth="1.4" /><circle cx="0" cy="-18" r="2.6" fill="#BFF5CF" className="ac-beacon" /></g>
      {/* travelling dots */}
      <MiniDot color="#F5B400" path={loop(hub, clinic)} dur={7} delay={0} />
      <MiniDot color="#7ED321" path={loop(hub, uni)} dur={8} delay={1.5} />
      <MiniDot color="#F04FB3" path={loop(hub, store)} dur={6.5} delay={0.8} />
      <MiniDot color="#2E8BEA" path={loop(hub, wh)} dur={7.5} delay={2.2} />
      {/* labels */}
      {label(iso(1.5, 2.9), es ? "CLÍNICA" : "CLINIC", 8)}{label(iso(10.6, 1.4), es ? "UNIVERSIDAD" : "UNIVERSITY", 8)}{label(iso(1.5, 11.2), es ? "TIENDA" : "STORE", 8)}{label(iso(9.8, 11.2), es ? "BODEGA" : "WAREHOUSE", 8)}
      <text x={hub[0]} y={hub[1] + 34} textAnchor="middle" fill="#BFF5CF" fontSize="7.5" fontFamily="var(--font-jbmono), monospace" letterSpacing="1.6">MINDFULTECH</text>
      {/* status ticker */}
      <g className="ac-tick"><rect x="14" y="290" width="190" height="16" rx="8" fill="#16271F" stroke="#3DBE7D" strokeWidth="0.6" /><text x="24" y="301" fill="#BFF5CF" fontSize="7.5" fontFamily="var(--font-jbmono), monospace" letterSpacing="0.8">{es ? "03:12 · RECLAMO #4821 ENVIADO" : "03:12 · CLAIM #4821 RESUBMITTED"}</text></g>
      <g className="ac-tick" style={{ animationDelay: "4s" }}><rect x="14" y="290" width="190" height="16" rx="8" fill="#16271F" stroke="#3DBE7D" strokeWidth="0.6" /><text x="24" y="301" fill="#BFF5CF" fontSize="7.5" fontFamily="var(--font-jbmono), monospace" letterSpacing="0.8">{es ? "03:14 · LEAD CALIFICADO · REUNIÓN" : "03:14 · LEAD QUALIFIED · MEETING SET"}</text></g>
      <g className="ac-tick" style={{ animationDelay: "8s" }}><rect x="14" y="290" width="190" height="16" rx="8" fill="#16271F" stroke="#3DBE7D" strokeWidth="0.6" /><text x="24" y="301" fill="#BFF5CF" fontSize="7.5" fontFamily="var(--font-jbmono), monospace" letterSpacing="0.8">{es ? "03:19 · TICKET → PERSONA (FIRMA)" : "03:19 · TICKET → PERSON (SIGN-OFF)"}</text></g>
      <text x="586" y="26" textAnchor="end" fill="#6B7280" fontSize="7.5" fontFamily="var(--font-jbmono), monospace" letterSpacing="1.2">{es ? "24/7 · SIN PAUSAS" : "24/7 · NO BREAKS"}</text>
      <style>{`
        .ac { width: 100%; height: auto; display: block; }
        .ac-win { opacity: 0.12; animation: acWin 9s ease-in-out infinite; }
        @keyframes acWin { 0%,100% { opacity: 0.12 } 30%,60% { opacity: 0.9 } }
        .ac-pulse { opacity: 0.9; filter: drop-shadow(0 0 3px #BFF5CF); }
        .ac-beacon { animation: acBeacon 1.4s ease-in-out infinite; }
        @keyframes acBeacon { 0%,100% { opacity: 1; r: 2.6 } 50% { opacity: 0.4; r: 3.4 } }
        .ac-dot { animation: acHop 0.5s ease-in-out infinite; }
        @keyframes acHop { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-1.5px) } }
        .ac-tick { opacity: 0; animation: acTick 12s linear infinite; }
        @keyframes acTick { 0%,2% { opacity: 0; transform: translateY(4px) } 6%,28% { opacity: 1; transform: translateY(0) } 32%,100% { opacity: 0 } }
        @media (prefers-reduced-motion: reduce) { .ac * { animation: none !important } }
      `}</style>
    </svg>
  );
}
