"use client";

import * as React from "react";
import type { Look } from "@/lib/office/bots";
import s from "./office.module.css";

export type FaceMood = "working" | "thinking" | "typing" | "talking" | "idle";

const EYE: Record<string, string> = { brown: "#5a3a22", blue: "#3d6a9a", green: "#4a7a55", hazel: "#7a5a2a", dark: "#1c1a1e" };

/** a stable 0…1 from a string, to desynchronise blinks and nods between people */
const phase = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
};

/**
 * A friendly animated face for an agent, drawn from their look: skin, hair
 * style and colour, eyes, glasses, beard, shirt. The mood moves the gaze,
 * brows, mouth and head: working looks down at the screen and nods now and
 * then, thinking looks up with a brow raised, typing bobs with a closed
 * mouth, talking moves the mouth, idle smiles at you. Pure SVG + CSS.
 */
export function AgentFace({ id, look, mood = "idle", size = 44 }: { id: string; look: Look; mood?: FaceMood; size?: number }) {
  const hair = look.hair, skin = look.skin, shirt = look.jacket || look.shirt;
  const dark = darken(skin, 0.72);
  const p = phase(id);
  const style = { ["--blink" as string]: `${4.2 + p * 3.1}s`, ["--delay" as string]: `${-p * 7}s` } as React.CSSProperties;
  const st = look.hairStyle;
  return (
    <svg className={`${s.face} ${s["face_" + mood]}`} viewBox="0 0 100 100" width={size} height={size} style={style} aria-hidden>
      {/* shoulders */}
      <path d="M8 102 C14 80 30 74 50 74 C70 74 86 80 92 102 Z" fill={shirt} />
      {look.tie && <path d="M48 76 L52 76 L53 92 L50 96 L47 92 Z" fill={look.tie} />}
      <rect x="43" y="68" width="14" height="12" fill={dark} />
      <g className={s.faceHead}>
        {/* hair behind the head */}
        {(st === "bob" || st === "long") && <path d={st === "bob" ? "M24 50 L22 84 L34 84 L32 52 Z M76 50 L78 84 L66 84 L68 52 Z" : "M24 50 L21 96 L35 96 L32 52 Z M76 50 L79 96 L65 96 L68 52 Z"} fill={hair} />}
        {st === "ponytail" && <path d="M73 48 C84 54 84 74 78 86 C76 76 74 66 70 58 Z" fill={hair} />}
        {/* ears and head */}
        <circle cx="26" cy="56" r="4.5" fill={skin} />
        <circle cx="74" cy="56" r="4.5" fill={skin} />
        <ellipse cx="50" cy="54" rx="25" ry="29" fill={skin} />
        {look.beard && <path d="M29 58 C32 80 40 86 50 86 C60 86 68 80 71 58 C66 72 58 76 50 76 C42 76 34 72 29 58 Z" fill={hair} opacity="0.9" />}
        {/* hair on top */}
        {st !== "bald" && st !== "curly" && (
          <path d={st === "swept" ? "M25 50 C24 28 36 19 52 20 C66 21 76 30 76 48 C70 38 60 34 50 36 C46 30 40 29 36 34 C32 38 28 44 25 50 Z" : "M25 50 C24 28 36 20 50 20 C64 20 76 28 75 50 C72 38 62 32 50 32 C38 32 28 38 25 50 Z"} fill={hair} />
        )}
        {st === "curly" && (
          <g fill={hair}>
            <path d="M25 50 C24 28 36 20 50 20 C64 20 76 28 75 50 C72 38 62 32 50 32 C38 32 28 38 25 50 Z" />
            {[28, 36, 44, 52, 60, 68, 72].map((x, i) => (
              <circle key={x} cx={x} cy={i % 2 ? 24 : 30} r="6" />
            ))}
          </g>
        )}
        {st === "bun" && <circle cx="50" cy="20" r="9" fill={hair} />}
        {/* brows */}
        <g className={s.faceBrows} stroke={darken(hair, 0.8)} strokeWidth="2.4" strokeLinecap="round" fill="none">
          <path className={s.faceBrowL} d="M34 45 Q40 42 46 44" />
          <path className={s.faceBrowR} d="M54 44 Q60 42 66 45" />
        </g>
        {/* eyes */}
        {[40, 60].map((cx, i) => (
          <g key={cx}>
            <ellipse cx={cx} cy="54" rx="5.2" ry="4.4" fill="#f6f3ee" />
            <g className={s.facePupils}>
              <circle cx={cx} cy="54" r="2.7" fill={EYE[look.eyes] || EYE.dark} />
              <circle cx={cx} cy="54" r="1.3" fill="#120f12" />
              <circle cx={cx + 1} cy="52.8" r="0.7" fill="#fff" />
            </g>
            <ellipse className={s.faceLid} cx={cx} cy="54" rx="5.4" ry="4.6" fill={skin} style={{ animationDelay: `calc(var(--delay) + ${i * 0.02}s)` }} />
          </g>
        ))}
        {look.glasses && (
          <g stroke="#2a2a30" strokeWidth="1.8" fill="none">
            <circle cx="40" cy="54" r="8" />
            <circle cx="60" cy="54" r="8" />
            <path d="M48 54 L52 54 M32 53 L26 51 M68 53 L74 51" />
          </g>
        )}
        {/* nose */}
        <path d="M50 58 L47.5 63.5 L52 63.5" stroke={dark} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* mouth: one shape per mood */}
        <g className={s.faceMouth}>
          {mood === "talking" ? (
            <ellipse className={s.faceTalk} cx="50" cy="70" rx="4.5" ry="3" fill="#5a2a2e" />
          ) : mood === "thinking" ? (
            <path d="M46.5 70 Q50 68 53.5 70" stroke={look.lips || dark} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          ) : mood === "typing" ? (
            <path d="M45 70 L55 70" stroke={look.lips || dark} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          ) : mood === "working" ? (
            <path d="M44.5 69 Q50 72 55.5 69" stroke={look.lips || dark} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M43 68 Q50 75 57 68" stroke={look.lips || dark} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          )}
        </g>
      </g>
    </svg>
  );
}

function darken(hex: string, k: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  if (Number.isNaN(n)) return hex;
  const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k);
  return `rgb(${r},${g},${b})`;
}
