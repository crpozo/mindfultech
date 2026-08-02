"use client";

import * as React from "react";
import { useLang } from "../i18n";
import { LAND_PATH, MAP_VIEW } from "@/lib/map/land";

const MONO = "var(--mono)";

type Bi = { en: string; es: string };
type Site = {
  id: string;
  lat: number;
  lon: number;
  place: Bi;
  country: Bi;
  /** where the label sits relative to the pin, so none of them collide */
  label: "left" | "right" | "top" | "bottom";
  region: "latam" | "us" | "eu";
  /** home base — gets the badge in the list */
  base?: boolean;
};

// These are the places our clients are, not offices — the copy says
// "clients" everywhere so nobody reads seven rows as seven branches.
const REGIONS: { id: Site["region"]; label: Bi }[] = [
  { id: "latam", label: { en: "Home base", es: "Base de operaciones" } },
  { id: "us", label: { en: "Clients · United States", es: "Clientes · Estados Unidos" } },
  { id: "eu", label: { en: "Clients · Europe", es: "Clientes · Europa" } },
];

// Real coordinates — pin positions are computed from these, so the map stays
// truthful even though the dotted basemap is a stylisation.
const SITES: Site[] = [
  {
    id: "ecuador",
    lat: -0.18,
    lon: -78.47,
    place: { en: "Ecuador", es: "Ecuador" },
    country: { en: "Ecuador", es: "Ecuador" },
    label: "left",
    region: "latam",
    base: true,
  },
  {
    id: "california",
    lat: 36.8,
    lon: -119.4,
    place: { en: "California", es: "California" },
    country: { en: "United States", es: "Estados Unidos" },
    label: "right",
    region: "us",
  },
  {
    id: "chicago",
    lat: 41.88,
    lon: -87.63,
    place: { en: "Chicago", es: "Chicago" },
    country: { en: "United States", es: "Estados Unidos" },
    label: "top",
    region: "us",
  },
  {
    id: "florida",
    lat: 26.64,
    lon: -81.87,
    place: { en: "Southwest Florida", es: "Suroeste de Florida" },
    country: { en: "United States", es: "Estados Unidos" },
    label: "right",
    region: "us",
  },
  {
    id: "netherlands",
    lat: 52.1,
    lon: 5.3,
    place: { en: "Netherlands", es: "Países Bajos" },
    country: { en: "Netherlands", es: "Países Bajos" },
    label: "top",
    region: "eu",
  },
  {
    id: "germany",
    lat: 51.1,
    lon: 10.45,
    place: { en: "Germany", es: "Alemania" },
    country: { en: "Germany", es: "Alemania" },
    label: "bottom",
    region: "eu",
  },
  {
    id: "spain",
    lat: 40.3,
    lon: -3.7,
    place: { en: "Spain", es: "España" },
    country: { en: "Spain", es: "España" },
    label: "left",
    region: "eu",
  },
  {
    id: "greece",
    lat: 37.98,
    lon: 23.73,
    place: { en: "Greece", es: "Grecia" },
    country: { en: "Greece", es: "Grecia" },
    // Athens sits ~15px from the map's right edge — only a left label fits
    label: "left",
    region: "eu",
  },
];

const project = (lat: number, lon: number) => ({
  x: ((lon - MAP_VIEW.lon0) / (MAP_VIEW.lon1 - MAP_VIEW.lon0)) * MAP_VIEW.w,
  y: ((MAP_VIEW.lat1 - lat) / (MAP_VIEW.lat1 - MAP_VIEW.lat0)) * MAP_VIEW.h,
});

/** Label offset + anchor for each placement. */
const LABEL = {
  left: { dx: -18, dy: 5, anchor: "end" as const },
  right: { dx: 18, dy: 5, anchor: "start" as const },
  top: { dx: 0, dy: -20, anchor: "middle" as const },
  bottom: { dx: 0, dy: 30, anchor: "middle" as const },
};

const FONT = 15;
const CHAR = FONT * 0.6 + 1.4; // monospace advance + letter-spacing
const PAD = 9;

/** Plate behind a label, so it stays legible over the dot grid. */
function labelPlate(text: string, x: number, anchor: "start" | "middle" | "end") {
  const w = text.length * CHAR + PAD * 2;
  const left = anchor === "start" ? x - PAD : anchor === "end" ? x - w + PAD : x - w / 2;
  return { x: left, w };
}

export function ClientMap() {
  const { lang } = useLang();
  const es = lang === "es";
  const [active, setActive] = React.useState<string | null>(null);

  return (
    <section
      id="map"
      style={{
        position: "relative",
        background: "linear-gradient(180deg,#ffffff,#f4f7fc 40%,#eef2f9)",
        padding: "100px 0 96px",
      }}
    >
      <div className="pad-x" style={{ maxWidth: 1320, margin: "0 auto", padding: "0 48px" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 46px" }}>
          <span
            style={{
              display: "inline-block",
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: ".16em",
              /* deeper green than --accent-deep — that one is 3.2:1 on the
                 tint, this reads 5.5:1 */
              color: "#2e6e63",
              background: "var(--accent-tint)",
              padding: "7px 13px",
              borderRadius: 999,
            }}
          >
            {es ? "DÓNDE TRABAJAMOS" : "WHERE WE WORK"}
          </span>
          <h2
            style={{
              fontWeight: 500,
              fontSize: "clamp(32px,3.4vw,52px)",
              letterSpacing: "-.02em",
              lineHeight: 1.06,
              margin: "20px 0 0",
              color: "var(--ink)",
            }}
          >
            {es
              ? "MindfulTech ayuda a empresas de todo el mundo"
              : "MindfulTech helps companies worldwide"}
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: "#6b6875", margin: "14px 0 0" }}>
            {es
              ? "Desde Ecuador, para equipos en América y Europa."
              : "From Ecuador, for teams across the Americas and Europe."}
          </p>
        </div>

        <div className="map-grid">
          <div className="map-canvas">
            <svg
              viewBox={`0 0 ${MAP_VIEW.w} ${MAP_VIEW.h}`}
              width="100%"
              role="img"
              aria-label={
                es
                  ? "Mapa con las ubicaciones de nuestros proyectos"
                  : "Map of the places our projects are in"
              }
              style={{ display: "block", overflow: "visible" }}
            >
              {/* basemap: one path, each zero-length segment a round dot */}
              <path
                d={LAND_PATH}
                stroke="#b7c2d4"
                strokeWidth={6.4}
                strokeLinecap="round"
                fill="none"
              />
              {SITES.map((s) => {
                const { x, y } = project(s.lat, s.lon);
                const on = s.id === active;
                const l = LABEL[s.label];
                return (
                  <g
                    key={s.id}
                    className="map-pin"
                    onMouseEnter={() => setActive(s.id)}
                    onMouseLeave={() => setActive(null)}
                  >
                    {on && <circle cx={x} cy={y} r={26} fill="var(--accent)" opacity={0.3} />}
                    <circle cx={x} cy={y} r={on ? 14 : 11} fill="var(--accent)" opacity={0.28} />
                    <circle
                      cx={x}
                      cy={y}
                      r={on ? 8 : 6.5}
                      fill={on ? "#1c6459" : "#2f7d71"}
                      stroke="#fff"
                      strokeWidth={3}
                    />
                    {(() => {
                      const text = s.place[lang].toUpperCase();
                      const plate = labelPlate(text, x + l.dx, l.anchor);
                      return (
                        <>
                          <rect
                            x={plate.x}
                            y={y + l.dy - FONT + 3}
                            width={plate.w}
                            height={FONT + 8}
                            rx={6}
                            fill="#fff"
                            opacity={on ? 1 : 0.88}
                          />
                          <text
                            x={x + l.dx}
                            y={y + l.dy}
                            textAnchor={l.anchor}
                            fontFamily="var(--mono)"
                            fontSize={FONT}
                            letterSpacing="1.4"
                            fontWeight={500}
                            fill={on ? "#16233a" : "#4d5b75"}
                            style={{ transition: "fill .2s ease" }}
                          >
                            {text}
                          </text>
                        </>
                      );
                    })()}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend and mobile view in one. Grouped by region so seven
              near-identical rows read as three places instead of a list. */}
          <div className="map-side">
            {REGIONS.map((r) => {
              const items = SITES.filter((s) => s.region === r.id);
              if (!items.length) return null;
              return (
                <div key={r.id} className="map-group">
                  <div className="map-group-head">{r.label[lang]}</div>
                  <ul className="map-list">
                    {items.map((s) => {
                      const on = s.id === active;
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            className={`map-row${on ? " on" : ""}`}
                            onMouseEnter={() => setActive(s.id)}
                            onMouseLeave={() => setActive(null)}
                            onFocus={() => setActive(s.id)}
                            onBlur={() => setActive(null)}
                            aria-pressed={on}
                          >
                            <span className="map-dot" aria-hidden />
                            <span className="map-place">{s.place[lang]}</span>
                            {s.base && <span className="map-badge">{es ? "BASE" : "HQ"}</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
