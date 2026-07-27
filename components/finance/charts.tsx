"use client";

/**
 * Gráficos en SVG puro — sin librería de charts.
 *
 * Paleta: slots 3 / 2 / 1 del sistema de datos (aqua, naranja, azul). Se validó
 * el trío completo (todos los pares, modo claro, superficie #ffffff): separación
 * CVD ΔE 9.2 en el peor par y 24.0 en visión normal. El aqua queda en 2.8:1 de
 * contraste contra el blanco, por debajo de 3:1, así que la regla de relieve
 * obliga a que la identidad nunca dependa solo del color: hay leyenda con texto,
 * etiquetas directas sobre el último mes y la tabla de movimientos debajo.
 */

import * as React from "react";
import { fmtMoney, fmtMonth, fmtShort, catLabel } from "@/lib/finance/format";
import type { Lang } from "@/components/i18n";
import type { MonthSummary } from "@/lib/finance/analysis";

export const SERIES = {
  income: "#1baf7a", // slot 3 — aqua
  expense: "#eb6834", // slot 2 — naranja
  net: "#2a78d6", // slot 1 — azul
} as const;

const INK = "#0b0b0b";
const MUTED = "#898781";
const GRID = "#e1e0d9";
const AXIS = "#c3c2b7";
const SURFACE = "#ffffff";

/** Ancho real del contenedor, para dibujar el SVG a medida (nada de escalar texto). */
function useWidth<T extends HTMLElement>(): [
  React.RefObject<T | null>,
  number,
] {
  const ref = React.useRef<T>(null);
  const [w, setW] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setW(Math.round(e.contentRect.width));
    });
    ro.observe(el);
    setW(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function niceMax(v: number): number {
  if (v <= 0) return 100;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  for (const step of [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10]) {
    if (v <= step * mag) return step * mag;
  }
  return 10 * mag;
}

/** Rectángulo con las esquinas superiores redondeadas y la base anclada al eje. */
function barPath(x: number, y: number, w: number, h: number, r = 4): string {
  const rr = Math.max(0, Math.min(r, w / 2, Math.abs(h)));
  if (h <= 0) return "";
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
}

interface Hover {
  x: number;
  y: number;
  title: string;
  rows: { label: string; value: string; color?: string }[];
}

function Tooltip({ hover, width }: { hover: Hover; width: number }) {
  const w = 190;
  const left = Math.max(6, Math.min(width - w - 6, hover.x - w / 2));
  return (
    <div
      role="tooltip"
      style={{
        position: "absolute",
        left,
        // Se dibuja hacia abajo desde el borde superior del área de trazado: si
        // saliera hacia arriba quedaría fuera de la tarjeta y no se vería.
        top: hover.y + 6,
        width: w,
        background: SURFACE,
        border: "1px solid rgba(11,11,11,.12)",
        borderRadius: 10,
        boxShadow: "0 12px 30px -14px rgba(11,11,11,.45)",
        padding: "9px 11px",
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: MUTED,
          fontFamily: "var(--mono)",
          letterSpacing: ".06em",
          textTransform: "uppercase",
        }}
      >
        {hover.title}
      </div>
      {hover.rows.map((r) => (
        <div
          key={r.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginTop: 5,
          }}
        >
          {r.color && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: r.color,
                flex: "none",
              }}
            />
          )}
          <span style={{ fontSize: 12.5, color: "#52514e", flex: 1 }}>
            {r.label}
          </span>
          <span
            style={{
              fontSize: 12.5,
              color: INK,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Legend({
  items,
}: {
  items: { label: string; color: string; line?: boolean }[];
}) {
  return (
    <div
      style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 10 }}
    >
      {items.map((it) => (
        <span
          key={it.label}
          style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
        >
          <span
            style={{
              width: it.line ? 14 : 9,
              height: it.line ? 2 : 9,
              borderRadius: it.line ? 1 : 2,
              background: it.color,
              flex: "none",
            }}
          />
          <span style={{ fontSize: 12.5, color: "#52514e" }}>{it.label}</span>
        </span>
      ))}
    </div>
  );
}

// ------------------------------------------------------ ingresos vs gastos --

/**
 * Barras agrupadas de ingreso y gasto, más la línea de neto. Las tres series
 * comparten el mismo eje en dólares: un solo eje, nunca dos escalas.
 */
export function TrendChart({
  months,
  lang,
}: {
  months: MonthSummary[];
  lang: Lang;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = React.useState<Hover | null>(null);

  const H = 240;
  const pad = { top: 22, right: 12, bottom: 26, left: 46 };
  const w = Math.max(width, 280);
  const plotW = w - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const data = months.length ? months : [];
  const maxVal = niceMax(
    Math.max(1, ...data.flatMap((m) => [m.income, m.expense, m.net])),
  );
  const minNet = Math.min(0, ...data.map((m) => m.net));
  const minVal = minNet < 0 ? -niceMax(Math.abs(minNet)) : 0;
  const span = maxVal - minVal || 1;
  const y = (v: number) => pad.top + plotH - ((v - minVal) / span) * plotH;
  const zeroY = y(0);

  const slot = data.length ? plotW / data.length : plotW;
  const barW = Math.max(6, Math.min(22, slot * 0.28));
  const gap = 2; // separación de 2px entre barras contiguas

  // El cero siempre lleva marca: es la línea contra la que se lee si el mes
  // cerró en positivo o en negativo. Los demás candidatos se descartan si su
  // etiqueta chocaría con una ya colocada (un mínimo negativo pequeño cae casi
  // encima del cero).
  const ticks = (
    minVal < 0 ? [0, maxVal, minVal] : [0, maxVal, maxVal / 2]
  ).reduce<number[]>(
    (kept, t) =>
      kept.some((k) => Math.abs(y(k) - y(t)) < 16) ? kept : [...kept, t],
    [],
  );
  const netPoints = data.map(
    (m, i) => [pad.left + slot * (i + 0.5), y(m.net)] as const,
  );

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <Legend
        items={[
          {
            label: lang === "es" ? "Ingresos" : "Income",
            color: SERIES.income,
          },
          {
            label: lang === "es" ? "Gastos" : "Expenses",
            color: SERIES.expense,
          },
          {
            label: lang === "es" ? "Neto" : "Net",
            color: SERIES.net,
            line: true,
          },
        ]}
      />
      {width > 0 && (
        <svg
          width={w}
          height={H}
          role="img"
          aria-label={
            lang === "es"
              ? "Ingresos, gastos y neto por mes"
              : "Income, expenses and net by month"
          }
          style={{ display: "block", overflow: "visible" }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={pad.left}
                x2={w - pad.right}
                y1={y(t)}
                y2={y(t)}
                stroke={t === 0 ? AXIS : GRID}
                strokeWidth={1}
              />
              <text
                x={pad.left - 8}
                y={y(t) + 4}
                textAnchor="end"
                fontSize={10.5}
                fill={MUTED}
                fontFamily="var(--mono)"
              >
                {fmtShort(t)}
              </text>
            </g>
          ))}

          {data.map((m, i) => {
            const cx = pad.left + slot * (i + 0.5);
            const last = i === data.length - 1;
            const incH = Math.abs(zeroY - y(m.income));
            const expH = Math.abs(zeroY - y(m.expense));
            return (
              <g key={m.month}>
                <path
                  d={barPath(cx - barW - gap / 2, y(m.income), barW, incH)}
                  fill={SERIES.income}
                />
                <path
                  d={barPath(cx + gap / 2, y(m.expense), barW, expH)}
                  fill={SERIES.expense}
                />
                {/* Etiqueta directa solo en el mes más reciente: es la lectura que
                    importa, y cumple la regla de relieve para el aqua. */}
                {last && m.income > 0 && (
                  <text
                    x={cx - barW / 2 - gap / 2}
                    y={y(m.income) - 6}
                    textAnchor="middle"
                    fontSize={10.5}
                    fill={INK}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {fmtShort(m.income)}
                  </text>
                )}
                {last && m.expense > 0 && (
                  <text
                    x={cx + barW / 2 + gap / 2}
                    y={y(m.expense) - 6}
                    textAnchor="middle"
                    fontSize={10.5}
                    fill={INK}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {fmtShort(m.expense)}
                  </text>
                )}
                <text
                  x={cx}
                  y={H - 8}
                  textAnchor="middle"
                  fontSize={10.5}
                  fill={MUTED}
                  fontFamily="var(--mono)"
                >
                  {fmtMonth(m.month, lang)}
                </text>
              </g>
            );
          })}

          {netPoints.length > 1 && (
            <polyline
              points={netPoints.map(([px, py]) => `${px},${py}`).join(" ")}
              fill="none"
              stroke={SERIES.net}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {netPoints.map(([px, py], i) => (
            // anillo de 2px del color de la superficie: la línea no se confunde
            // con las barras que cruza
            <circle
              key={i}
              cx={px}
              cy={py}
              r={4}
              fill={SERIES.net}
              stroke={SURFACE}
              strokeWidth={2}
            />
          ))}

          {/* zonas de hover: más anchas que las barras, para que apuntar sea fácil */}
          {data.map((m, i) => {
            const cx = pad.left + slot * (i + 0.5);
            return (
              <rect
                key={`hit-${m.month}`}
                x={cx - slot / 2}
                y={pad.top}
                width={slot}
                height={plotH}
                fill="transparent"
                onMouseEnter={() =>
                  setHover({
                    x: cx,
                    y: pad.top,
                    title: fmtMonth(m.month, lang),
                    rows: [
                      {
                        label: lang === "es" ? "Ingresos" : "Income",
                        value: fmtMoney(m.income, lang),
                        color: SERIES.income,
                      },
                      {
                        label: lang === "es" ? "Gastos" : "Expenses",
                        value: fmtMoney(m.expense, lang),
                        color: SERIES.expense,
                      },
                      {
                        label: lang === "es" ? "Neto" : "Net",
                        value: fmtMoney(m.net, lang),
                        color: SERIES.net,
                      },
                    ],
                  })
                }
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </svg>
      )}
      {hover && <Tooltip hover={hover} width={w} />}
    </div>
  );
}

// -------------------------------------------------------- gastos por rubro --

/**
 * Barras horizontales de una sola serie, ordenadas de mayor a menor. Un solo
 * color (el azul secuencial por defecto): la identidad la lleva la etiqueta de
 * texto, no el matiz. "Otros" va en gris para que no compita con lo accionable.
 */
export function CategoryBars({
  byCategory,
  lang,
  currency = "USD",
  limit = 8,
}: {
  byCategory: Record<string, number>;
  lang: Lang;
  currency?: string;
  limit?: number;
}) {
  const entries = Object.entries(byCategory)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  const head = entries.slice(0, limit);
  const tail = entries.slice(limit);
  const rest = tail.reduce((s, [, v]) => s + v, 0);
  const rows =
    rest > 0 ? [...head, ["__rest__", rest] as [string, number]] : head;
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const max = Math.max(1, ...rows.map(([, v]) => v));

  if (!rows.length) {
    return (
      <p style={{ fontSize: 13.5, color: MUTED, margin: "8px 0 0" }}>
        {lang === "es"
          ? "Sin gastos registrados este mes."
          : "No expenses recorded this month."}
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gap: 9 }}>
      {rows.map(([cat, value]) => {
        const isRest = cat === "__rest__";
        const label = isRest
          ? lang === "es"
            ? `Otros (${tail.length})`
            : `Other (${tail.length})`
          : catLabel(cat, lang);
        const pct = total > 0 ? (value / total) * 100 : 0;
        return (
          <div key={cat} title={`${label} · ${pct.toFixed(1)}%`}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 13, color: "#52514e" }}>{label}</span>
              <span
                style={{
                  fontSize: 12.5,
                  color: INK,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmtMoney(value, lang, currency)}
                <span style={{ color: MUTED, marginLeft: 6 }}>
                  {pct.toFixed(0)}%
                </span>
              </span>
            </div>
            <div
              style={{
                height: 8,
                background: "#f1f2f6",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.max(2, (value / max) * 100)}%`,
                  height: "100%",
                  borderRadius: 4,
                  background: isRest ? "#c3c2b7" : SERIES.net,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -------------------------------------------------------------- indicador ---

/** Medidor 0-100 de salud financiera. El color acompaña; el número manda. */
export function HealthGauge({
  score,
  verdict,
  lang,
}: {
  score: number;
  verdict: string;
  lang: Lang;
}) {
  const pct = Math.max(0, Math.min(100, score));
  const size = 108;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  // Colores de estado — reservados, nunca reutilizados como color de serie.
  const color =
    pct >= 81
      ? "#0ca30c"
      : pct >= 61
        ? "#69c7b9"
        : pct >= 41
          ? "#fab219"
          : "#d03b3b";
  const labels: Record<string, { es: string; en: string }> = {
    excelente: { es: "Excelente", en: "Excellent" },
    bien: { es: "Bien", en: "Good" },
    atencion: { es: "Atención", en: "Watch" },
    riesgo: { es: "Riesgo", en: "At risk" },
  };
  const text = labels[verdict]
    ? lang === "es"
      ? labels[verdict].es
      : labels[verdict].en
    : verdict;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg
        width={size}
        height={size}
        role="img"
        aria-label={`${score} / 100 — ${text}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f1f2f6"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2}
          y={size / 2 + 2}
          textAnchor="middle"
          fontSize={26}
          fill={INK}
          fontWeight={500}
        >
          {Math.round(score)}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 20}
          textAnchor="middle"
          fontSize={10}
          fill={MUTED}
          fontFamily="var(--mono)"
        >
          / 100
        </text>
      </svg>
      <div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10.5,
            letterSpacing: ".2em",
            color: MUTED,
            textTransform: "uppercase",
          }}
        >
          {lang === "es" ? "Salud financiera" : "Financial health"}
        </div>
        <div
          style={{ fontSize: 20, fontWeight: 500, color: INK, marginTop: 4 }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
