"use client";

import * as React from "react";
import s from "./office.module.css";
import { LOCALE, type Lang } from "@/lib/office/i18n";

/**
 * Small, dependency-free charting kit for the office dashboards: seeded data
 * generators (so the demo shows the same believable history on every visit,
 * with weekends, trends and noise) and SVG line, bar, donut and sparkline
 * charts that scale with their container.
 */

// ------------------------------------------------------------- data ----
/** Deterministic PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The last `n` calendar days, oldest first, ending today. */
export function lastDays(n: number): Date[] {
  const out: Date[] = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) out.push(new Date(today.getTime() - i * 86400000));
  return out;
}
const MONTHS: Record<Lang, string[]> = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
/** "27 sep" in Spanish, "Sep 27" in English. */
export const dayLabel = (d: Date, lang: Lang = "es") => (lang === "es" ? `${d.getDate()} ${MONTHS.es[d.getMonth()]}` : `${MONTHS.en[d.getMonth()]} ${d.getDate()}`);
const WEEKDAYS: Record<Lang, string[]> = { es: ["D", "L", "M", "X", "J", "V", "S"], en: ["S", "M", "T", "W", "T", "F", "S"] };
export const weekdayShort = (d: Date, lang: Lang = "es") => WEEKDAYS[lang][d.getDay()];
export const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

export type SeriesOpts = {
  start: number;
  /** drift per step, as a fraction of `start` */
  drift?: number;
  /** noise per step, as a fraction of `start` */
  vol?: number;
  min?: number;
  max?: number;
  /** multiplier applied on Saturdays and Sundays (1 = no weekly pattern) */
  weekend?: number;
  /** decimals to round to */
  round?: number;
};

/** A daily series with trend, noise and a weekly pattern: `n` values ending today. */
export function dailySeries(seed: number, n: number, o: SeriesOpts): number[] {
  const r = rng(seed);
  const days = lastDays(n);
  const out: number[] = [];
  let level = o.start;
  const drift = (o.drift ?? 0) * o.start, vol = (o.vol ?? 0.1) * o.start;
  for (let i = 0; i < n; i++) {
    level += drift + (r() - 0.5) * 2 * vol;
    if (o.min !== undefined) level = Math.max(o.min, level);
    if (o.max !== undefined) level = Math.min(o.max, level);
    let v = level * (isWeekend(days[i]) ? o.weekend ?? 1 : 1) * (0.94 + r() * 0.12);
    const k = Math.pow(10, o.round ?? 0);
    v = Math.round(v * k) / k;
    out.push(v);
  }
  return out;
}

/** Today's hourly profile (24 values, 0 after the current hour) that adds up to about `total`. */
export function hourlyToday(seed: number, total: number, peak = 10.5, peak2 = 15.5): number[] {
  const r = rng(seed);
  const now = new Date().getHours();
  const shape = Array.from({ length: 24 }, (_, h) => Math.exp(-(((h - peak) / 2.4) ** 2)) + 0.85 * Math.exp(-(((h - peak2) / 2.6) ** 2)) + 0.03);
  const sum = shape.reduce((a, b) => a + b, 0);
  return shape.map((v, h) => (h > now ? 0 : Math.round(((v / sum) * total * (0.8 + r() * 0.4)) * 10) / 10));
}

export const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
export const avg = (a: number[]) => (a.length ? sum(a) / a.length : 0);
export const fmtInt = (v: number, lang: Lang = "es") => Math.round(v).toLocaleString(LOCALE[lang]);
export const fmtK = (v: number, lang: Lang = "es") => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : fmtInt(v, lang));
/** "$18.400" in Spanish, "$18,400" in English. */
export const fmtMoney = (v: number, lang: Lang = "es") => `$${Math.round(v).toLocaleString(LOCALE[lang])}`;
/** "5,3 %" in Spanish, "5.3%" in English. */
export const fmtPct = (v: number, lang: Lang = "es") => (lang === "es" ? `${v.toFixed(1).replace(".", ",")} %` : `${v.toFixed(1)}%`);

// ------------------------------------------------------------ pieces ----
/** Change versus the previous period, as a coloured chip. */
export function Delta({ now, prev, invert = false, lang = "es" }: { now: number; prev: number; invert?: boolean; lang?: Lang }) {
  if (!prev) return null;
  const pct = ((now - prev) / prev) * 100;
  const good = invert ? pct <= 0 : pct >= 0;
  return (
    <span className={`${s.delta} ${good ? s.deltaUp : s.deltaDown}`} title={lang === "es" ? "vs. periodo anterior" : "vs. previous period"}>
      {pct >= 0 ? "▲" : "▼"} {fmtPct(Math.abs(pct), lang)}
    </span>
  );
}

/** A path through the points; smooth when there are enough of them. */
function pathFor(xs: number[], ys: number[]) {
  if (xs.length < 2) return "";
  let d = `M${xs[0].toFixed(1)},${ys[0].toFixed(1)}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` C${cx.toFixed(1)},${ys[i - 1].toFixed(1)} ${cx.toFixed(1)},${ys[i].toFixed(1)} ${xs[i].toFixed(1)},${ys[i].toFixed(1)}`;
  }
  return d;
}

export function Spark({ data, color, w = 100, h = 34 }: { data: number[]; color: string; w?: number; h?: number }) {
  const lo = Math.min(...data), hi = Math.max(...data);
  const xs = data.map((_, i) => (i / Math.max(1, data.length - 1)) * (w - 2) + 1);
  const ys = data.map((v) => h - 3 - ((v - lo) / (hi - lo || 1)) * (h - 8));
  const d = pathFor(xs, ys);
  const id = React.useId();
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden style={{ width: "100%", height: h, display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${xs[xs.length - 1].toFixed(1)},${h} L${xs[0].toFixed(1)},${h} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="2.6" fill={color} />
    </svg>
  );
}

export type LineSeries = { name: string; color: string; data: number[]; dashed?: boolean; area?: boolean };

/** Line chart with axes, gridlines, weekend shading, an optional target line and end labels. */
export function LineChart({
  series,
  labels,
  weekend,
  height = 190,
  yFormat,
  target,
  every,
  lang = "es",
}: {
  series: LineSeries[];
  labels: string[];
  weekend?: boolean[];
  height?: number;
  yFormat?: (v: number) => string;
  target?: { value: number; label: string };
  /** show every n-th x label */
  every?: number;
  lang?: Lang;
}) {
  const fmt = yFormat ?? ((v: number) => fmtInt(v, lang));
  const W = 560, H = height, L = 44, R = 14, T = 12, B = 26;
  const n = Math.max(...series.map((q) => q.data.length));
  const all = series.flatMap((q) => q.data).concat(target ? [target.value] : []);
  const lo = Math.min(0, ...all), hiRaw = Math.max(...all);
  const hi = hiRaw <= 0 ? 1 : hiRaw * 1.12;
  const x = (i: number) => L + (i / Math.max(1, n - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo || 1)) * (H - T - B);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => lo + (hi - lo) * k);
  const step = every ?? Math.max(1, Math.ceil(n / 7));
  const gid = React.useId();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img">
      <defs>
        {series.map((q, k) => (
          <linearGradient key={k} id={`${gid}-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={q.color} stopOpacity="0.22" />
            <stop offset="1" stopColor={q.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {weekend &&
        weekend.map((w, i) =>
          w ? <rect key={i} x={x(i) - (W - L - R) / Math.max(1, n - 1) / 2} y={T} width={(W - L - R) / Math.max(1, n - 1)} height={H - T - B} fill="#0e0d12" opacity="0.035" /> : null
        )}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#0e0d12" strokeOpacity="0.07" />
          <text x={L - 6} y={y(t) + 3.5} fontSize="10" textAnchor="end" fill="#6b7280">
            {fmt(t)}
          </text>
        </g>
      ))}
      {labels.map((lb, i) =>
        i % step === 0 || i === n - 1 ? (
          <text key={i} x={x(i)} y={H - 8} fontSize="10" textAnchor={i === n - 1 ? "end" : i === 0 ? "start" : "middle"} fill="#6b7280">
            {lb}
          </text>
        ) : null
      )}
      {target && (
        <g>
          <line x1={L} x2={W - R} y1={y(target.value)} y2={y(target.value)} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth="1.2" />
          <text x={W - R} y={y(target.value) - 4} fontSize="9.5" textAnchor="end" fill="#b45309">
            {target.label}
          </text>
        </g>
      )}
      {series.map((q, k) => {
        const xs = q.data.map((_, i) => x(i));
        const ys = q.data.map((v) => y(v));
        const d = pathFor(xs, ys);
        return (
          <g key={k}>
            {q.area !== false && k === 0 && <path d={`${d} L${xs[xs.length - 1]},${y(lo)} L${xs[0]},${y(lo)} Z`} fill={`url(#${gid}-${k})`} />}
            <path d={d} fill="none" stroke={q.color} strokeWidth="2.2" strokeDasharray={q.dashed ? "5 4" : undefined} strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3.5" fill="#fff" stroke={q.color} strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
}

/** Stacked (or grouped) bars with an axis. */
export function BarChart({
  groups,
  colors,
  height = 170,
  yFormat,
  stacked = true,
  every,
  lang = "es",
}: {
  groups: { label: string; values: number[] }[];
  colors: string[];
  height?: number;
  yFormat?: (v: number) => string;
  stacked?: boolean;
  every?: number;
  lang?: Lang;
}) {
  const fmt = yFormat ?? ((v: number) => fmtInt(v, lang));
  const W = 560, H = height, L = 40, R = 10, T = 10, B = 26;
  const n = groups.length, m = colors.length;
  const tops = groups.map((g) => (stacked ? sum(g.values) : Math.max(...g.values)));
  const hi = Math.max(1, ...tops) * 1.1;
  const y = (v: number) => T + (1 - v / hi) * (H - T - B);
  const slot = (W - L - R) / Math.max(1, n);
  const bw = stacked ? slot * 0.62 : (slot * 0.8) / m;
  const step = every ?? Math.max(1, Math.ceil(n / 8));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img">
      {[0, 0.5, 1].map((k, i) => (
        <g key={i}>
          <line x1={L} x2={W - R} y1={y(hi * k)} y2={y(hi * k)} stroke="#0e0d12" strokeOpacity="0.07" />
          <text x={L - 6} y={y(hi * k) + 3.5} fontSize="10" textAnchor="end" fill="#6b7280">
            {fmt(hi * k)}
          </text>
        </g>
      ))}
      {groups.map((g, i) => {
        let acc = 0;
        const cx = L + slot * (i + 0.5);
        return (
          <g key={i}>
            {g.values.map((v, k) => {
              const x0 = stacked ? cx - bw / 2 : cx - (bw * m) / 2 + k * bw;
              const y1 = stacked ? y(acc + v) : y(v), y0 = stacked ? y(acc) : y(0);
              acc += v;
              return <rect key={k} x={x0} y={y1} width={stacked ? bw : bw - 1} height={Math.max(0, y0 - y1)} fill={colors[k]} rx={k === m - 1 || !stacked ? 2 : 0} />;
            })}
            {(i % step === 0 || i === n - 1) && (
              <text x={cx} y={H - 8} fontSize="10" textAnchor="middle" fill="#6b7280">
                {g.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Donut with a legend of shares. */
export function Donut({
  parts,
  size = 120,
  format,
  lang = "es",
}: {
  parts: { label: string; value: number; color: string }[];
  size?: number;
  format?: (v: number) => string;
  lang?: Lang;
}) {
  const fmt = format ?? ((v: number) => fmtInt(v, lang));
  const total = Math.max(1, sum(parts.map((p) => p.value)));
  const r = 44, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className={s.donut}>
      <svg viewBox="0 0 120 120" width={size} height={size} role="img">
        {parts.map((p, i) => {
          const frac = p.value / total;
          const el = (
            <circle
              key={i}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth="16"
              strokeDasharray={`${(frac * c).toFixed(2)} ${(c - frac * c).toFixed(2)}`}
              strokeDashoffset={(-acc * c).toFixed(2)}
              transform="rotate(-90 60 60)"
            />
          );
          acc += frac;
          return el;
        })}
        <text x="60" y="57" fontSize="17" fontWeight="600" textAnchor="middle" fill="#111827">
          {fmt(total)}
        </text>
        <text x="60" y="72" fontSize="9.5" textAnchor="middle" fill="#6b7280">
          total
        </text>
      </svg>
      <div className={s.legendCol}>
        {parts.map((p) => (
          <div key={p.label} className={s.legendRow}>
            <i style={{ background: p.color }} />
            <span>{p.label}</span>
            <b>{lang === "es" ? `${Math.round((p.value / total) * 100)} %` : `${Math.round((p.value / total) * 100)}%`}</b>
            <small>{fmt(p.value)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className={s.legend}>
      {items.map((it) => (
        <span key={it.label}>
          <i style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

export function ChartCard({ title, sub, right, children }: { title: string; sub?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={s.chartCard}>
      <div className={s.chartHead}>
        <div>
          <div className={s.chartTitle}>{title}</div>
          {sub && <div className={s.chartSub}>{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
