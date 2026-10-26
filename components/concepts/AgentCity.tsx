"use client";

import * as React from "react";

/* An agentized city, isometric. A 3x3 grid of avenues, the MindfulTech office in the centre block, client sites in
   the corner blocks (clinic, university, store, warehouse), filler buildings, trees and a park in the edge blocks.
   Small robots travel the avenues carrying work; data pulses run the same routes; windows light up through the
   night. SVG + SMIL/CSS, no WebGL. */

const CX = 300, CY = 40, SX = 0.866 * 27, SY = 13.5;
const iso = (ix: number, iy: number, z = 0) => [CX + (ix - iy) * SX, CY + (ix + iy) * SY - z] as const;
const pt = (ix: number, iy: number, z = 0) => iso(ix, iy, z).join(",");

function Box({ ix, iy, w, d, h, top = "#2A3146", left = "#1B2030", right = "#222838", children }: { ix: number; iy: number; w: number; d: number; h: number; top?: string; left?: string; right?: string; children?: React.ReactNode }) {
  return (
    <g>
      <polygon points={`${pt(ix, iy + d)} ${pt(ix, iy + d, h)} ${pt(ix + w, iy + d, h)} ${pt(ix + w, iy + d)}`} fill={left} />
      <polygon points={`${pt(ix + w, iy + d)} ${pt(ix + w, iy + d, h)} ${pt(ix + w, iy, h)} ${pt(ix + w, iy)}`} fill={right} />
      <polygon points={`${pt(ix, iy, h)} ${pt(ix + w, iy, h)} ${pt(ix + w, iy + d, h)} ${pt(ix, iy + d, h)}`} fill={top} />
      {children}
    </g>
  );
}
function Windows({ ix, iy, w, d, h, rows, seed, lit = "#BFF5CF" }: { ix: number; iy: number; w: number; d: number; h: number; rows: number; seed: number; lit?: string }) {
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const z = 6 + r * ((h - 12) / Math.max(1, rows - 1));
    for (let c = 0; c < Math.round(w * 2) - 1; c++) { const [x, y] = iso(ix + 0.3 + c * 0.5, iy + d, z); out.push(<rect key={`l${r}${c}`} x={x} y={y - 3} width="3.4" height="3.4" fill={lit} className="ac-win" style={{ animationDelay: `${((seed + r * 3 + c * 7) % 11) * 0.8}s` }} />); }
    for (let c = 0; c < Math.round(d * 2) - 1; c++) { const [x, y] = iso(ix + w, iy + d - 0.3 - c * 0.5, z); out.push(<rect key={`r${r}${c}`} x={x - 3.4} y={y - 3} width="3.4" height="3.4" fill={lit} className="ac-win" style={{ animationDelay: `${((seed + r * 5 + c * 3) % 13) * 0.7}s` }} />); }
  }
  return <>{out}</>;
}
function RoadX({ iy, from, to }: { iy: number; from: number; to: number }) {
  return <g><polygon points={`${pt(from, iy - 0.32)} ${pt(to, iy - 0.32)} ${pt(to, iy + 0.32)} ${pt(from, iy + 0.32)}`} fill="#1A1E2C" /><line x1={iso(from, iy)[0]} y1={iso(from, iy)[1]} x2={iso(to, iy)[0]} y2={iso(to, iy)[1]} stroke="#2A3042" strokeWidth="0.8" strokeDasharray="4 5" /></g>;
}
function RoadY({ ix, from, to }: { ix: number; from: number; to: number }) {
  return <g><polygon points={`${pt(ix - 0.32, from)} ${pt(ix + 0.32, from)} ${pt(ix + 0.32, to)} ${pt(ix - 0.32, to)}`} fill="#1A1E2C" /><line x1={iso(ix, from)[0]} y1={iso(ix, from)[1]} x2={iso(ix, to)[0]} y2={iso(ix, to)[1]} stroke="#2A3042" strokeWidth="0.8" strokeDasharray="4 5" /></g>;
}
function Tree({ ix, iy, s = 1 }: { ix: number; iy: number; s?: number }) {
  const [x, y] = iso(ix, iy);
  return <g transform={`translate(${x},${y})`}><ellipse cx="0" cy="1" rx={4 * s} ry={1.6 * s} fill="#000" opacity="0.3" /><rect x={-0.8 * s} y={-6 * s} width={1.6 * s} height={6 * s} fill="#3B2F26" /><circle cx="0" cy={-8 * s} r={4.2 * s} fill="#1F6B47" /><circle cx={-1.2 * s} cy={-9.5 * s} r={2 * s} fill="#2A9A62" opacity="0.8" /></g>;
}
function Robot({ color, path, dur, delay }: { color: string; path: string; dur: number; delay: number }) {
  return (
    <g>
      <g className="ac-bot">
        <ellipse cx="0" cy="6" rx="7" ry="2.2" fill="#000" opacity="0.35" />
        {/* treads */}
        <rect x="-7" y="2" width="14" height="4.5" rx="2.2" fill="#2B2F3A" /><rect x="-5.5" y="3" width="11" height="2.4" rx="1.2" fill="#444A58" />
        {/* body */}
        <rect x="-5.5" y="-7" width="11" height="10" rx="2" fill={color} /><rect x="-5.5" y="-7" width="11" height="3" rx="2" fill="#fff" opacity="0.5" />
        <rect x="-2" y="-4" width="4" height="1.4" rx="0.7" fill="#3DBE7D" /><rect x="-2" y="-1.5" width="4" height="1.4" rx="0.7" fill="#9AA3A1" opacity="0.6" />
        {/* arms */}
        <rect x="-8.5" y="-5" width="2.6" height="7" rx="1.3" fill={color} className="ac-arm" /><rect x="5.9" y="-5" width="2.6" height="7" rx="1.3" fill={color} className="ac-arm2" />
        {/* head */}
        <rect x="-6" y="-17" width="12" height="9" rx="2.5" fill={color} /><rect x="-6" y="-17" width="12" height="3" rx="2.5" fill="#fff" opacity="0.5" />
        <rect x="-4.5" y="-15" width="9" height="4.6" rx="1.2" fill="#0E1013" />
        <circle cx="-2" cy="-12.7" r="1.1" fill="#BFF5CF" className="ac-eye" /><circle cx="2" cy="-12.7" r="1.1" fill="#BFF5CF" className="ac-eye" />
        <line x1="0" y1="-17" x2="0" y2="-21" stroke="#0E1013" strokeWidth="1" /><circle cx="0" cy="-22" r="1.4" fill="#BFF5CF" className="ac-beacon" />
        {/* the document it carries */}
        <g transform="translate(9,-9)"><rect x="-3" y="-4" width="6" height="7.5" rx="0.8" fill="#fff" /><rect x="-1.8" y="-2.4" width="3.6" height="0.8" fill="#9AA3A1" /><rect x="-1.8" y="-0.8" width="2.6" height="0.8" fill="#9AA3A1" /></g>
        <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${delay}s`} path={path} />
      </g>
    </g>
  );
}

export function AgentCity({ es }: { es: boolean }) {
  const poly = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${iso(x, y)[0]},${iso(x, y)[1]}`).join(" ");
  const back = (pts: [number, number][]) => poly([...pts, ...[...pts].reverse().slice(1)]);
  const R = {
    clinic: [[5.5, 7.5], [3.5, 7.5], [3.5, 3.5], [1.9, 3.5]] as [number, number][],
    uni: [[5.5, 3.5], [7.5, 3.5], [9.2, 3.5]] as [number, number][],
    store: [[3.5, 5.5], [3.5, 7.5], [1.9, 7.5]] as [number, number][],
    wh: [[7.5, 5.5], [7.5, 7.5], [9.2, 7.5]] as [number, number][],
  };
  const lbl = (ix: number, iy: number, t: string, c = "#8A9A92") => { const [x, y] = iso(ix, iy); return <text x={x} y={y} textAnchor="middle" fill={c} fontSize="7.5" fontFamily="var(--font-jbmono), monospace" letterSpacing="1.4">{t}</text>; };
  return (
    <svg viewBox="0 0 600 380" className="ac" role="img" aria-label={es ? "Una ciudad isométrica con robots agentes" : "An isometric city with agent robots"}>
      <defs>
        <linearGradient id="acSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b0e1a" /><stop offset="1" stopColor="#111828" /></linearGradient>
        <radialGradient id="acGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#3dbe7d" stopOpacity="0.5" /><stop offset="1" stopColor="#3dbe7d" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="600" height="380" fill="url(#acSky)" />
      {/* ground + blocks */}
      <polygon points={`${pt(-0.5, -0.5)} ${pt(11.5, -0.5)} ${pt(11.5, 11.5)} ${pt(-0.5, 11.5)}`} fill="#131726" />
      {[0, 3.8, 7.8].map((bx) => [0, 3.8, 7.8].map((by) => <polygon key={`${bx}${by}`} points={`${pt(bx, by)} ${pt(bx + 3.2, by)} ${pt(bx + 3.2, by + 3.2)} ${pt(bx, by + 3.2)}`} fill={bx === 3.8 && by === 7.8 ? "#172A22" : "#171B2B"} />))}
      {/* avenues */}
      <RoadX iy={3.5} from={-0.5} to={11.5} /><RoadX iy={7.5} from={-0.5} to={11.5} /><RoadY ix={3.5} from={-0.5} to={11.5} /><RoadY ix={7.5} from={-0.5} to={11.5} />
      {/* pulses */}
      {Object.values(R).map((r, i) => <circle key={i} r="2.2" fill="#BFF5CF" className="ac-pulse"><animateMotion dur="2.8s" repeatCount="indefinite" begin={`${i * 0.7}s`} path={poly(r)} /></circle>)}
      {/* ---- back row (small iy) ---- */}
      <Box ix={0.5} iy={0.5} w={1.9} d={1.9} h={30}><Windows ix={0.5} iy={0.5} w={1.9} d={1.9} h={30} rows={3} seed={1} /></Box>
      <g transform={`translate(${iso(1.45, 1.45, 30)[0]},${iso(1.45, 1.45, 30)[1]})`}><rect x="-6" y="-2" width="12" height="4" rx="1" fill="#F26D6D" /><rect x="-2" y="-6" width="4" height="12" rx="1" fill="#F26D6D" /></g>
      <Box ix={2.5} iy={0.6} w={0.7} d={1.8} h={14}><Windows ix={2.5} iy={0.6} w={0.7} d={1.8} h={14} rows={1} seed={3} /></Box>
      <Box ix={4.3} iy={0.6} w={1} d={1} h={18}><Windows ix={4.3} iy={0.6} w={1} d={1} h={18} rows={2} seed={5} lit="#F4D98A" /></Box>
      <Box ix={5.7} iy={0.8} w={1.2} d={1} h={24}><Windows ix={5.7} iy={0.8} w={1.2} d={1} h={24} rows={2} seed={6} /></Box>
      <Tree ix={4.4} iy={2.4} /><Tree ix={5.2} iy={2.6} s={0.8} /><Tree ix={6.6} iy={2.5} />
      <Box ix={8.2} iy={0.5} w={1} d={1} h={42} top="#2F3650"><Windows ix={8.2} iy={0.5} w={1} d={1} h={42} rows={4} seed={8} /></Box>
      <Box ix={9.4} iy={0.6} w={1.5} d={1.5} h={26}><Windows ix={9.4} iy={0.6} w={1.5} d={1.5} h={26} rows={2} seed={9} /></Box>
      <Box ix={8.2} iy={1.9} w={1} d={1.1} h={20}><Windows ix={8.2} iy={1.9} w={1} d={1.1} h={20} rows={2} seed={10} lit="#F4D98A" /></Box>
      {/* ---- middle row ---- */}
      <Box ix={0.6} iy={4.3} w={1} d={1.2} h={16}><Windows ix={0.6} iy={4.3} w={1} d={1.2} h={16} rows={1} seed={11} /></Box>
      <Box ix={1.9} iy={5.6} w={1} d={1} h={22}><Windows ix={1.9} iy={5.6} w={1} d={1} h={22} rows={2} seed={12} lit="#F4D98A" /></Box>
      <Tree ix={0.9} iy={6.4} s={0.9} />
      {/* hub */}
      <circle cx={iso(5.4, 5.4)[0]} cy={iso(5.4, 5.4)[1]} r="58" fill="url(#acGlow)" />
      <Box ix={4.4} iy={4.4} w={2} d={2} h={34} top="#3DBE7D" left="#1F7A4D" right="#2A9A62"><Windows ix={4.4} iy={4.4} w={2} d={2} h={34} rows={3} seed={2} lit="#E8FFF2" /></Box>
      <g transform={`translate(${iso(5.4, 5.4, 34)[0]},${iso(5.4, 5.4, 34)[1]})`}><line x1="0" y1="0" x2="0" y2="-14" stroke="#BFF5CF" strokeWidth="1.4" /><circle cx="0" cy="-16" r="2.4" fill="#BFF5CF" className="ac-beacon" /></g>
      <Box ix={8.3} iy={4.4} w={1} d={1} h={24}><Windows ix={8.3} iy={4.4} w={1} d={1} h={24} rows={2} seed={13} /></Box>
      <Box ix={9.6} iy={5.5} w={1.2} d={1.3} h={14}><Windows ix={9.6} iy={5.5} w={1.2} d={1.3} h={14} rows={1} seed={14} lit="#F4D98A" /></Box>
      <Tree ix={8.5} iy={6.5} /><Tree ix={9.2} iy={6.8} s={0.8} />
      {/* ---- front row ---- */}
      <Box ix={0.5} iy={8.2} w={2.6} d={1.5} h={12}><Windows ix={0.5} iy={8.2} w={2.6} d={1.5} h={12} rows={1} seed={15} lit="#F4D98A" /></Box>
      <polygon points={`${pt(0.5, 9.7, 8)} ${pt(3.1, 9.7, 8)} ${pt(3.1, 10.05, 6)} ${pt(0.5, 10.05, 6)}`} fill="#F4C542" />
      {[0.9, 1.6, 2.3].map((x) => <polygon key={x} points={`${pt(x, 10.4)} ${pt(x + 0.4, 10.4)} ${pt(x + 0.4, 10.9)} ${pt(x, 10.9)}`} fill="#1E2434" />)}
      {/* park */}
      <Tree ix={4.5} iy={8.6} /><Tree ix={5.4} iy={9.4} s={1.1} /><Tree ix={6.4} iy={8.5} s={0.9} /><Tree ix={6.2} iy={10.2} /><Tree ix={4.3} iy={10.3} s={0.8} />
      <Box ix={8.1} iy={8.1} w={2.7} d={2.6} h={15} top="#2C3348"><Windows ix={8.1} iy={8.1} w={2.7} d={2.6} h={15} rows={1} seed={16} /></Box>
      {[0.5, 1.1, 1.7, 2.3].map((o) => <line key={o} x1={iso(8.1 + o, 8.1, 15)[0]} y1={iso(8.1 + o, 8.1, 15)[1]} x2={iso(8.1 + o, 10.7, 15)[0]} y2={iso(8.1 + o, 10.7, 15)[1]} stroke="#3A4258" strokeWidth="0.8" />)}
      {/* robots */}
      <Robot color="#E6E9F0" path={back(R.clinic)} dur={9} delay={0} />
      <Robot color="#E6E9F0" path={back(R.uni)} dur={6.5} delay={1.2} />
      <Robot color="#E6E9F0" path={back(R.store)} dur={6} delay={0.6} />
      <Robot color="#E6E9F0" path={back(R.wh)} dur={6.8} delay={2} />
      {/* labels */}
      {lbl(1.5, 3.1, es ? "CLÍNICA" : "CLINIC")}{lbl(10.9, 2.4, es ? "UNIVERSIDAD" : "UNIVERSITY")}{lbl(1.8, 11.4, es ? "TIENDA" : "STORE")}{lbl(9.5, 11.6, es ? "BODEGA" : "WAREHOUSE")}{lbl(5.4, 7.2, "MINDFULTECH", "#BFF5CF")}
      {/* ticker */}
      {[[0, es ? "03:12 · RECLAMO #4821 REENVIADO" : "03:12 · CLAIM #4821 RESUBMITTED"], [4, es ? "03:14 · LEAD CALIFICADO · REUNIÓN" : "03:14 · LEAD QUALIFIED · MEETING SET"], [8, es ? "03:19 · TICKET → PERSONA (FIRMA)" : "03:19 · TICKET → PERSON (SIGN-OFF)"]].map(([d, t], i) => (
        <g key={i} className="ac-tick" style={{ animationDelay: `${d}s` }}><rect x="14" y="350" width="200" height="16" rx="8" fill="#16271F" stroke="#3DBE7D" strokeWidth="0.6" /><text x="24" y="361" fill="#BFF5CF" fontSize="7.5" fontFamily="var(--font-jbmono), monospace" letterSpacing="0.8">{t}</text></g>
      ))}
      <text x="586" y="24" textAnchor="end" fill="#6B7280" fontSize="7.5" fontFamily="var(--font-jbmono), monospace" letterSpacing="1.2">{es ? "24/7 · SIN PAUSAS" : "24/7 · NO BREAKS"}</text>
      <style>{`
        .ac { width: 100%; height: auto; display: block; }
        .ac-win { opacity: 0.1; animation: acWin 10s ease-in-out infinite; }
        @keyframes acWin { 0%,100% { opacity: 0.1 } 30%,60% { opacity: 0.85 } }
        .ac-pulse { opacity: 0.9; filter: drop-shadow(0 0 3px #BFF5CF); }
        .ac-beacon { animation: acBeacon 1.4s ease-in-out infinite; }
        @keyframes acBeacon { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
        .ac-bot { animation: acHop 0.45s ease-in-out infinite; }
        @keyframes acHop { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-1px) } }
        .ac-arm { transform-origin: -7px -4px; animation: acArm 0.45s ease-in-out infinite; }
        .ac-arm2 { transform-origin: 7px -4px; animation: acArm 0.45s ease-in-out infinite reverse; }
        @keyframes acArm { 0%,100% { transform: rotate(-12deg) } 50% { transform: rotate(12deg) } }
        .ac-eye { animation: acEye 3.8s infinite; }
        @keyframes acEye { 0%,92%,100% { opacity: 1 } 95% { opacity: 0.1 } }
        .ac-tick { opacity: 0; animation: acTick 12s linear infinite; }
        @keyframes acTick { 0%,2% { opacity: 0; transform: translateY(4px) } 6%,28% { opacity: 1; transform: translateY(0) } 32%,100% { opacity: 0 } }
        @media (prefers-reduced-motion: reduce) { .ac * { animation: none !important } }
      `}</style>
    </svg>
  );
}
