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
  region: "latam" | "us" | "eu";
  /** home base — gets the badge in the list */
  base?: boolean;
};

// These are the places our clients are, not offices — the copy says
// "clients" everywhere so nobody reads seven rows as seven branches.
const REGIONS: { id: Site["region"]; label: Bi }[] = [
  { id: "latam", label: { en: "Home base", es: "Base de operaciones" } },
  { id: "us", label: { en: "United States", es: "Estados Unidos" } },
  { id: "eu", label: { en: "Europe", es: "Europa" } },
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
    region: "latam",
    base: true,
  },
  {
    id: "california",
    lat: 36.8,
    lon: -119.4,
    place: { en: "California", es: "California" },
    country: { en: "United States", es: "Estados Unidos" },
    region: "us",
  },
  {
    id: "chicago",
    lat: 41.88,
    lon: -87.63,
    place: { en: "Chicago", es: "Chicago" },
    country: { en: "United States", es: "Estados Unidos" },
    region: "us",
  },
  {
    id: "florida",
    lat: 26.64,
    lon: -81.87,
    place: { en: "Southwest Florida", es: "Suroeste de Florida" },
    country: { en: "United States", es: "Estados Unidos" },
    region: "us",
  },
  {
    id: "netherlands",
    lat: 52.1,
    lon: 5.3,
    place: { en: "Netherlands", es: "Países Bajos" },
    country: { en: "Netherlands", es: "Países Bajos" },
    region: "eu",
  },
  {
    id: "germany",
    lat: 51.1,
    lon: 10.45,
    place: { en: "Germany", es: "Alemania" },
    country: { en: "Germany", es: "Alemania" },
    region: "eu",
  },
  {
    id: "spain",
    lat: 40.3,
    lon: -3.7,
    place: { en: "Spain", es: "España" },
    country: { en: "Spain", es: "España" },
    region: "eu",
  },
  {
    id: "greece",
    lat: 37.98,
    lon: 23.73,
    place: { en: "Greece", es: "Grecia" },
    country: { en: "Greece", es: "Grecia" },
    region: "eu",
  },
];

/**
 * One line drawing per place, instead of eight identical dots. Kept in this
 * file rather than a module of its own: a new client component imported by an
 * existing one trips the React Client Manifest bug this repo has hit before.
 *
 * Drawn for a 24×24 box in the site's usual stroke style, and read at ~17px —
 * so each is a silhouette, not a portrait. Landmarks beat flags here: the
 * strip is monochrome, and a flag without its colours says nothing.
 */
const PLACE_ICONS: Record<string, React.ReactNode> = {
  // the equator itself — the country is named after it
  ecuador: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.6 2.4 4 5.3 4 8.5s-1.4 6.1-4 8.5c-2.6-2.4-4-5.3-4-8.5s1.4-6.1 4-8.5z" />
    </>
  ),
  // palm
  california: (
    <>
      <path d="M12 21V10" />
      <path d="M12 10c-2.4-2.3-5-2.6-7 0M12 10c2.4-2.3 5-2.6 7 0M12 10c-1-3 .3-5.6 3-6.6M12 10c-1.6-2.7-4.2-3.6-6.8-2.3" />
    </>
  ),
  // skyline with the antenna
  chicago: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V13h4v8M11 21V7h4v14M17 21v-6h3v6" />
      <path d="M13 7V3.5" />
    </>
  ),
  // sun over water
  florida: (
    <>
      <circle cx="12" cy="9" r="3.5" />
      <path d="M12 2v1.6M12 14.4V16M5 9H3.4M20.6 9H19M7 4l1.2 1.2M15.8 12.8L17 14M17 4l-1.2 1.2M8.2 12.8L7 14" />
      <path d="M3 19c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0" />
    </>
  ),
  // windmill
  netherlands: (
    <>
      <path d="M9 21h6l-1.2-9h-3.6L9 21z" />
      <path d="M12 12L5.6 5.6M12 12l6.4-6.4M12 12l-6.4 6.4M12 12l6.4 6.4" />
      <circle cx="12" cy="12" r="1.4" />
    </>
  ),
  // Brandenburg gate
  germany: (
    <>
      <path d="M2.5 20.5h19" />
      <path d="M4 20.5V9M8.5 20.5V9M13 20.5V9M17.5 20.5V9" />
      <path d="M2 9h19.5V6.5H2z" />
      <path d="M9.5 6.5V4.5h5v2" />
    </>
  ),
  // Sagrada Família spires
  spain: (
    <>
      <path d="M2.5 21h19" />
      <path d="M7 21V11c0-2.6.7-4.6 1.6-6 .9 1.4 1.6 3.4 1.6 6v10" />
      <path d="M13.5 21V8.5c0-3 .8-5.2 1.8-6.8 1 1.6 1.8 3.8 1.8 6.8V21" />
      <path d="M2.8 21v-6c0-1.7.5-3 1.1-4 .6 1 1.1 2.3 1.1 4v6" />
    </>
  ),
  // Doric column
  greece: (
    <>
      <path d="M4 21h16" />
      <path d="M6.5 21v-2h11v2" />
      <path d="M8 19V7M12 19V7M16 19V7" />
      <path d="M5.5 7h13V4.5h-13z" />
    </>
  ),
};

const project = (lat: number, lon: number) => ({
  x: ((lon - MAP_VIEW.lon0) / (MAP_VIEW.lon1 - MAP_VIEW.lon0)) * MAP_VIEW.w,
  y: ((MAP_VIEW.lat1 - lat) / (MAP_VIEW.lat1 - MAP_VIEW.lat0)) * MAP_VIEW.h,
});

const FONT = 15;
const CHAR = FONT * 0.6 + 1.4; // monospace advance + letter-spacing
const PAD = 11;
const PLATE_H = FONT + 12;
/** gap between the pin and the callout's notch tip */
const NOTCH = 15;

/**
 * The callout always sits directly above its pin. Four placements used to be
 * needed to keep eight permanent labels apart; now only the active one shows,
 * so one consistent position beats four — and in this frame every pin has room
 * above it (the highest, the Netherlands, still clears the top edge by 70px).
 */
function callout(text: string, x: number, y: number) {
  const w = text.length * CHAR + PAD * 2;
  const top = y - NOTCH - PLATE_H;
  return { x: x - w / 2, y: top, w, h: PLATE_H, baseline: top + PLATE_H - 7 };
}

/**
 * A bowed line from home base to a client. It carries the section's own claim
 * — work leaves Ecuador and lands in eight places — which a field of unrelated
 * dots never says out loud. Curvature scales with distance so short hops stay
 * shallow instead of looping.
 */
function reach(ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);
  // perpendicular to the chord, always bowing toward the top of the frame
  const nx = -dy / (dist || 1);
  const ny = dx / (dist || 1);
  const lift = dist * 0.17 * (ny > 0 ? -1 : 1);
  return `M${ax.toFixed(1)} ${ay.toFixed(1)}Q${(ax + dx / 2 + nx * lift).toFixed(1)} ${(ay + dy / 2 + ny * lift).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
}

export function ClientMap() {
  const { lang } = useLang();
  const es = lang === "es";
  const [active, setActive] = React.useState<string | null>(null);

  /**
   * Hover, but only for pointers that really hover. A tap makes Chrome
   * synthesise mouseenter → click → mouseleave, and that trailing leave was
   * switching the pin straight back off; touch is handled by the click alone.
   */
  const hover = (id: string) => ({
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType !== "touch") setActive(id);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType !== "touch") setActive(null);
    },
  });

  return (
    <section
      id="map"
      style={{
        position: "relative",
        background: "linear-gradient(180deg,#ffffff,#f4f7fc 40%,#eef2f9)",
        padding: "100px 0 96px",
      }}
    >
      <div className="pad-x" style={{ maxWidth: 1460, margin: "0 auto", padding: "0 48px" }}>
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
                strokeWidth={4.6}
                strokeLinecap="round"
                fill="none"
              />
              {/* reach arcs, drawn under every pin so no line crosses a marker */}
              {(() => {
                const home = SITES.find((v) => v.base);
                if (!home) return null;
                const h = project(home.lat, home.lon);
                return SITES.filter((v) => !v.base).map((v) => {
                  const p = project(v.lat, v.lon);
                  return (
                    <path
                      key={"reach-" + v.id}
                      className={`map-reach${v.id === active ? " on" : ""}`}
                      d={reach(h.x, h.y, p.x, p.y)}
                      fill="none"
                    />
                  );
                });
              })()}
              {SITES.map((s) => {
                const { x, y } = project(s.lat, s.lon);
                const on = s.id === active;
                return (
                  <g
                    key={s.id}
                    className="map-pin"
                    {...hover(s.id)}
                    onClick={() => setActive(s.id)}
                  >
                    <circle className="map-pin-halo" cx={x} cy={y} r={on ? 15 : 10.5} fill="var(--accent)" opacity={on ? 0.34 : 0.24} />
                    {/* home base wears a second ring, the map's echo of the HQ badge */}
                    {s.base && (
                      <circle cx={x} cy={y} r={on ? 10.5 : 9} fill="none" stroke="#2f7d71" strokeWidth={1.3} opacity={0.55} />
                    )}
                    <circle
                      className="map-pin-dot"
                      cx={x}
                      cy={y}
                      r={on ? 7 : 6.2}
                      fill={on ? "#1c6459" : "#2f7d71"}
                      stroke="#fff"
                      strokeWidth={3}
                    />
                    {/* Only the active pin is named. On a whole-world frame
                        the Netherlands and Germany pins land 14px apart and
                        their plates are ~130px wide, so eight permanent
                        labels would be an unreadable pile; the list beside
                        the map is the always-on index. */}
                    {on &&
                    (() => {
                      const text = s.place[lang].toUpperCase();
                      const c = callout(text, x, y);
                      return (
                        <g className="map-callout" style={{ transformOrigin: `${x}px ${y}px` }}>
                          <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={7} fill="#fff" />
                          {/* notch: ties the plate to its pin instead of
                              leaving it floating over the dot grid */}
                          <path d={`M${x - 6} ${c.y + c.h}L${x} ${c.y + c.h + 7}L${x + 6} ${c.y + c.h}Z`} fill="#fff" />
                          <text
                            x={x}
                            y={c.baseline}
                            textAnchor="middle"
                            fontFamily="var(--mono)"
                            fontSize={FONT}
                            letterSpacing="1.4"
                            fontWeight={500}
                            fill="#16233a"
                          >
                            {text}
                          </text>
                        </g>
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
                            {...hover(s.id)}
                            onFocus={() => setActive(s.id)}
                            onBlur={() => setActive(null)}
                            /* Touch has no hover, so a tap is the only way to
                               light a pin on a phone. Not a toggle: the
                               synthetic mouseenter a tap fires would already
                               have set it, and toggling would switch it back
                               off in the same gesture. */
                            onClick={() => setActive(s.id)}
                            aria-pressed={on}
                          >
                            <svg
                              className="map-ico"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              {PLACE_ICONS[s.id]}
                            </svg>
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
