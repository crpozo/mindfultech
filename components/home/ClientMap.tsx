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
};

// Real coordinates — pin positions are computed from these, so the map stays
// truthful even though the dotted basemap is a stylisation.
const SITES: Site[] = [
  {
    id: "quito",
    lat: -0.18,
    lon: -78.47,
    place: { en: "Quito", es: "Quito" },
    country: { en: "Ecuador", es: "Ecuador" },
    label: "left",
  },
  {
    id: "california",
    lat: 36.8,
    lon: -119.4,
    place: { en: "California", es: "California" },
    country: { en: "United States", es: "Estados Unidos" },
    label: "right",
  },
  {
    id: "chicago",
    lat: 41.88,
    lon: -87.63,
    place: { en: "Chicago", es: "Chicago" },
    country: { en: "United States", es: "Estados Unidos" },
    label: "top",
  },
  {
    id: "florida",
    lat: 26.64,
    lon: -81.87,
    place: { en: "Southwest Florida", es: "Suroeste de Florida" },
    country: { en: "United States", es: "Estados Unidos" },
    label: "right",
  },
  {
    id: "netherlands",
    lat: 52.1,
    lon: 5.3,
    place: { en: "Netherlands", es: "Países Bajos" },
    country: { en: "Netherlands", es: "Países Bajos" },
    label: "top",
  },
  {
    id: "germany",
    lat: 51.1,
    lon: 10.45,
    place: { en: "Germany", es: "Alemania" },
    country: { en: "Germany", es: "Alemania" },
    label: "bottom",
  },
  {
    id: "spain",
    lat: 40.3,
    lon: -3.7,
    place: { en: "Spain", es: "España" },
    country: { en: "Spain", es: "España" },
    label: "left",
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
  const countries = new Set(SITES.map((s) => s.country.en)).size;

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
              color: "var(--accent-deep)",
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
            {es ? `Proyectos en ${countries} países` : `Projects in ${countries} countries`}
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: "#6b6875", margin: "14px 0 0" }}>
            {es
              ? "Desde Quito, para equipos en América y Europa."
              : "From Quito, for teams across the Americas and Europe."}
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
                stroke="#8d9db8"
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
                    {on && <circle cx={x} cy={y} r={24} fill="var(--accent)" opacity={0.2} />}
                    <circle cx={x} cy={y} r={on ? 12 : 9} fill="var(--accent-deep)" opacity={0.2} />
                    <circle
                      cx={x}
                      cy={y}
                      r={on ? 7.5 : 6}
                      fill="var(--accent-deep)"
                      stroke="#fff"
                      strokeWidth={2.5}
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

          {/* the list doubles as the map legend and as the mobile view */}
          <ul className="map-list">
            {SITES.map((s) => {
              const on = s.id === active;
              const sameName = s.place.en === s.country.en;
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
                    <span className="map-row-head">
                      <span className="map-dot" aria-hidden />
                      <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-.01em" }}>
                        {s.place[lang]}
                      </span>
                      {!sameName && (
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 10.5,
                            letterSpacing: ".12em",
                            color: "#8b8896",
                            marginLeft: "auto",
                          }}
                        >
                          {s.country[lang].toUpperCase()}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
