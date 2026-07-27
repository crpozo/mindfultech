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
  clients: { name: string; what: Bi }[];
  /** nudges the label off the pin so labels never sit on top of each other */
  label: "left" | "right";
};

// Real coordinates — the pin positions are computed from these, so the map
// stays honest even though the basemap coastlines are stylised.
const SITES: Site[] = [
  {
    id: "quito",
    lat: -0.18,
    lon: -78.47,
    place: { en: "Quito", es: "Quito" },
    country: { en: "Ecuador", es: "Ecuador" },
    label: "left",
    clients: [
      { name: "USFQ", what: { en: "Campus events, iOS + AI surveys", es: "Eventos de campus, iOS + encuestas IA" } },
      { name: "CarCompra", what: { en: "Seller CRM wired to Meta & ads", es: "CRM de vendedores conectado a Meta" } },
      { name: "CarCompraCorp", what: { en: "Leads from Meta, answered by AI", es: "Leads de Meta, respondidos por IA" } },
    ],
  },
  {
    id: "california",
    lat: 36.8,
    lon: -119.4,
    place: { en: "California", es: "California" },
    country: { en: "United States", es: "Estados Unidos" },
    label: "right",
    clients: [
      { name: "Helixona", what: { en: "AI agent running medical billing", es: "Agente de IA que factura en salud" } },
    ],
  },
  {
    id: "florida",
    lat: 26.64,
    lon: -81.87,
    place: { en: "Southwest Florida", es: "Suroeste de Florida" },
    country: { en: "United States", es: "Estados Unidos" },
    label: "right",
    clients: [
      { name: "Western Fence Supply", what: { en: "Excel → Odoo, with delivery routes", es: "De Excel a Odoo, con rutas de entrega" } },
    ],
  },
  {
    id: "netherlands",
    lat: 51.65,
    lon: 5.3,
    place: { en: "Netherlands", es: "Países Bajos" },
    country: { en: "Europe", es: "Europa" },
    label: "left",
    clients: [
      { name: "ThemedMotion", what: { en: "Interactive 3D portfolio on the web", es: "Portafolio 3D interactivo en la web" } },
    ],
  },
];

const project = (lat: number, lon: number) => ({
  x: ((lon - MAP_VIEW.lon0) / (MAP_VIEW.lon1 - MAP_VIEW.lon0)) * MAP_VIEW.w,
  y: ((MAP_VIEW.lat1 - lat) / (MAP_VIEW.lat1 - MAP_VIEW.lat0)) * MAP_VIEW.h,
});

export function ClientMap() {
  const { lang } = useLang();
  const es = lang === "es";
  const [active, setActive] = React.useState<string>(SITES[0].id);
  const site = SITES.find((s) => s.id === active) ?? SITES[0];
  const clientCount = SITES.reduce((n, s) => n + s.clients.length, 0);

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
            {es ? "Clientes en tres países" : "Clients in three countries"}
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: "#6b6875", margin: "14px 0 0" }}>
            {es
              ? `Desde Quito construimos para ${clientCount} equipos en Ecuador, Estados Unidos y Europa.`
              : `From Quito we build for ${clientCount} teams across Ecuador, the United States and Europe.`}
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
                  ? "Mapa con las ubicaciones de nuestros clientes"
                  : "Map showing our client locations"
              }
              style={{ display: "block", overflow: "visible" }}
            >
              {/* basemap: one path, each zero-length segment a round dot */}
              <path
                d={LAND_PATH}
                stroke="#b4c0d4"
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
              />
              {SITES.map((s) => {
                const { x, y } = project(s.lat, s.lon);
                const on = s.id === active;
                return (
                  <g key={s.id} className="map-pin" onMouseEnter={() => setActive(s.id)}>
                    {on && <circle cx={x} cy={y} r={26} fill="var(--accent)" opacity={0.16} />}
                    <circle cx={x} cy={y} r={on ? 13 : 9} fill="var(--accent-deep)" opacity={0.18} />
                    <circle
                      cx={x}
                      cy={y}
                      r={on ? 7.5 : 5.5}
                      fill={on ? "var(--accent-deep)" : "var(--accent)"}
                      stroke="#fff"
                      strokeWidth={2.5}
                    />
                    <text
                      x={s.label === "left" ? x - 18 : x + 18}
                      y={y + 4.5}
                      textAnchor={s.label === "left" ? "end" : "start"}
                      fontFamily="var(--mono)"
                      fontSize={17}
                      letterSpacing="1.6"
                      fill={on ? "#24344E" : "#7c8598"}
                      style={{ transition: "fill .2s ease" }}
                    >
                      {s.place[lang].toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* the list doubles as the map legend and as the mobile view */}
          <ul className="map-list">
            {SITES.map((s) => {
              const on = s.id === active;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`map-row${on ? " on" : ""}`}
                    onMouseEnter={() => setActive(s.id)}
                    onFocus={() => setActive(s.id)}
                    onClick={() => setActive(s.id)}
                    aria-pressed={on}
                  >
                    <span className="map-row-head">
                      <span className="map-dot" aria-hidden />
                      <span style={{ fontWeight: 600, fontSize: 16.5, letterSpacing: "-.01em" }}>
                        {s.place[lang]}
                      </span>
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
                    </span>
                    <span className="map-clients">
                      {s.clients.map((c) => (
                        <span key={c.name} className="map-client">
                          <b>{c.name}</b>
                          <span>{c.what[lang]}</span>
                        </span>
                      ))}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <p
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: ".1em",
            color: "#9a97a6",
            textAlign: "center",
            margin: "34px 0 0",
          }}
        >
          {es ? `${site.place.es.toUpperCase()} · ${site.clients.length} PROYECTO${site.clients.length > 1 ? "S" : ""}` : `${site.place.en.toUpperCase()} · ${site.clients.length} PROJECT${site.clients.length > 1 ? "S" : ""}`}
        </p>
      </div>
    </section>
  );
}
