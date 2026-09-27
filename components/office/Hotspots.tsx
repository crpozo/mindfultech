"use client";

import * as React from "react";
import { BOTS, BOT_BY_ID } from "@/lib/office/bots";
import s from "./office.module.css";
import { dailySeries, hourlyToday, lastDays, dayLabel, weekdayShort, isWeekend, sum, avg, fmtInt, fmtK, fmtMoney, Delta, Spark, LineChart, BarChart, Donut, Legend, ChartCard } from "./charts";

type Range = "hoy" | "7d" | "30d";
const RANGE_LABEL: Record<Range, string> = { hoy: "Hoy", "7d": "7 días", "30d": "30 días" };
function RangeToggle({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <div className={s.range} role="tablist">
      {(["hoy", "7d", "30d"] as Range[]).map((r) => (
        <button key={r} type="button" role="tab" aria-selected={value === r} className={value === r ? s.on : ""} onClick={() => onChange(r)}>
          {RANGE_LABEL[r]}
        </button>
      ))}
    </div>
  );
}
const hourLabels = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}h`);
const AREA_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#14b8a6"];
const AREAS = ["Ventas", "Soporte", "Finanzas", "Marketing", "Operaciones"];

/** An event reported by the scene (see scene/index.js `emit`). */
export type OfficeEvent = {
  t: number;
  type: "line" | "coffee" | "break" | "back" | "game" | "pingpong" | "print" | "visit" | "meeting" | "task" | "call";
  bot?: string;
  to?: string;
  host?: string;
  place?: string;
  text?: string;
  winner?: string;
  loser?: string;
  score?: string;
  bots?: string[];
  game?: string;
};

export const HOTSPOT_META: Record<string, { icon: string; title: string; subtitle: string; color: string }> = {
  board: { icon: "📋", title: "Tablero de tareas", subtitle: "Qué está haciendo cada empleado IA", color: "#d9f2e6" },
  tv: { icon: "📺", title: "Dashboard de operaciones", subtitle: "Métricas del equipo en vivo", color: "#d6e6ff" },
  coffee: { icon: "☕", title: "Cafetera", subtitle: "Consumo del equipo hoy", color: "#ffe3c2" },
  printer: { icon: "🖨️", title: "Impresora", subtitle: "Documentos generados por los bots", color: "#e3e0f7" },
  shelf: { icon: "📚", title: "Base de conocimiento", subtitle: "Lo que el equipo ha aprendido", color: "#f9d5e5" },
  water: { icon: "💬", title: "Radio pasillo", subtitle: "Conversaciones entre los bots", color: "#a9dcd3" },
  clock: { icon: "🕒", title: "Línea de tiempo", subtitle: "Todo lo que pasó hoy en la oficina", color: "#f7c4b6" },
  servers: { icon: "🖥️", title: "Estado de sistemas", subtitle: "Infraestructura de los agentes", color: "#b9d7f2" },
  pingpong: { icon: "🏓", title: "Marcador de ping-pong", subtitle: "Ranking del equipo", color: "#c9e8b2" },
  reception: { icon: "🛎️", title: "Recepción", subtitle: "Visitas y agenda del día", color: "#ffe3c2" },
  meeting: { icon: "📅", title: "Agenda de reuniones", subtitle: "Sala Andes y Sala Chimborazo", color: "#d9c6f2" },
  lounge: { icon: "🛋️", title: "Rendimiento de los agentes", subtitle: "Carga de trabajo, tokens y costo", color: "#f4d98a" },
};

const PLACE_ES: Record<string, string> = {
  coffee: "la cafetera", kitchen: "la cafetería", meeting: "la Sala Andes", meeting2: "la Sala Chimborazo", training: "la capacitación",
  booth: "una cabina", printer: "la impresora", water: "el dispensador", servers: "la sala de servidores", pingpong: "el ping-pong",
  tv: "la pantalla", lounge: "el lounge", beanbag: "el puf", labBoard: "la pizarra del lab", visit: "un escritorio",
};
const name = (id?: string) => (id && BOT_BY_ID[id] ? BOT_BY_ID[id].name : "");
const hhmm = (t: number) => new Date(t).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  return m < 1 ? "hace un momento" : m === 1 ? "hace 1 min" : `hace ${m} min`;
};

function Avatar({ id, size = 26 }: { id: string; size?: number }) {
  const b = BOT_BY_ID[id];
  if (!b) return null;
  return (
    <span className={s.miniAvatar} style={{ background: b.color, width: size, height: size, fontSize: size * 0.45 }} title={b.name}>
      {b.name[0]}
    </span>
  );
}

function useTick(ms: number) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return tick;
}

// ------------------------------------------------------------- panels ----
type PanelProps = { events: OfficeEvent[]; status: Record<string, string | null>; onOpenBot: (id: string) => void };

/** Kanban of what everybody is on; a bot's card moves to "Hecho" each time it finishes a work cycle. */
function BoardPanel({ events, status, onOpenBot }: PanelProps) {
  const done = React.useMemo(() => {
    const out: { bot: string; text: string; t: number }[] = [];
    const idx: Record<string, number> = {};
    for (const e of [...events].reverse())
      if (e.type === "task" && e.bot) {
        const b = BOT_BY_ID[e.bot];
        idx[e.bot] = (idx[e.bot] ?? 0) + 1;
        out.unshift({ bot: e.bot, text: b.working[idx[e.bot] % b.working.length], t: e.t });
      }
    return out.slice(0, 14);
  }, [events]);
  const doing = BOTS.map((b) => ({ bot: b.id, text: status[b.id] ?? b.working[0], busy: status[b.id] == null }));
  const todo = BOTS.flatMap((b) => b.working.slice(1, 3).map((t) => ({ bot: b.id, text: t })));
  const col = (title: string, items: { bot: string; text: string; t?: number; busy?: boolean }[], tone: string) => (
    <div className={s.kanbanCol}>
      <div className={s.kanbanHead}>
        <span className={s.kanbanDot} style={{ background: tone }} />
        {title}
        <b>{items.length}</b>
      </div>
      {items.map((it, i) => (
        <button key={i} type="button" className={s.kanbanCard} onClick={() => onOpenBot(it.bot)}>
          <Avatar id={it.bot} size={20} />
          <span>
            {it.text}
            {it.t && <small>{ago(it.t)}</small>}
            {it.busy === false && <small>en pausa</small>}
          </span>
        </button>
      ))}
    </div>
  );
  return (
    <div className={s.kanban}>
      {col("Por hacer", todo.slice(0, 12), "#9ca3af")}
      {col("En curso", doing, "#3b82f6")}
      {col("Hecho hoy", done, "#22c55e")}
    </div>
  );
}

type Metric = {
  key: string;
  label: string;
  color: string;
  seed: number;
  opts: Parameters<typeof dailySeries>[2];
  agg: "sum" | "avg";
  fmt: (v: number) => string;
  target?: number;
  unit: string;
};
const METRICS: Metric[] = [
  { key: "leads", label: "Leads calificados", color: "#3b82f6", seed: 11, opts: { start: 26, drift: 0.008, vol: 0.1, min: 12, max: 80, weekend: 0.72 }, agg: "sum", fmt: fmtInt, target: 35, unit: "leads" },
  { key: "tickets", label: "Tickets resueltos", color: "#22c55e", seed: 12, opts: { start: 98, drift: 0.006, vol: 0.07, min: 60, max: 220, weekend: 0.78 }, agg: "sum", fmt: fmtInt, target: 120, unit: "tickets" },
  { key: "revenue", label: "Cobrado", color: "#f59e0b", seed: 13, opts: { start: 9200, drift: 0.007, vol: 0.16, min: 4000, max: 28000, weekend: 0.7, round: -2 }, agg: "sum", fmt: fmtMoney, unit: "USD" },
  { key: "reach", label: "Alcance en redes", color: "#8b5cf6", seed: 14, opts: { start: 36000, drift: 0.008, vol: 0.09, min: 20000, max: 110000, weekend: 0.95, round: -2 }, agg: "avg", fmt: fmtK, unit: "personas/día" },
];
const DEALS = [
  { company: "Grupo Andino", stage: "Cerrado ganado", amount: 18400, owner: "sofia", daysAgo: 0 },
  { company: "Farmacias Cruz", stage: "Negociación", amount: 9900, owner: "sofia", daysAgo: 1 },
  { company: "Hotel Casa Gangotena", stage: "Propuesta enviada", amount: 4100, owner: "sofia", daysAgo: 1 },
  { company: "Coop. 29 de Octubre", stage: "Cerrado ganado", amount: 6200, owner: "mateo", daysAgo: 2 },
  { company: "Logística del Pacífico", stage: "Cerrado ganado", amount: 12750, owner: "sofia", daysAgo: 4 },
  { company: "Universidad del Valle", stage: "Presentación", amount: 15200, owner: "sofia", daysAgo: 6 },
];

/** Operations dashboard: KPIs vs. the previous period, a metric over time, work by area, lead sources and recent deals. */
function TvPanel({ events, onOpenBot }: PanelProps) {
  const [range, setRange] = React.useState<Range>("30d");
  const [metricKey, setMetricKey] = React.useState("leads");
  const data = React.useMemo(
    () =>
      METRICS.map((m) => {
        const d60 = dailySeries(m.seed, 60, m.opts);
        const hours = hourlyToday(m.seed + 100, d60[59]);
        return { ...m, d60, hours };
      }),
    []
  );
  const days = React.useMemo(() => lastDays(30), []);
  const nowH = new Date().getHours();
  const view = (m: (typeof data)[number]) => {
    if (range === "hoy") {
      const cur = m.hours.slice(0, nowH + 1);
      const value = m.agg === "sum" ? sum(cur) : m.d60[59];
      // today vs. the same weekday last week, scaled to the hours elapsed
      const prevValue = m.agg === "sum" ? m.d60[52] * ((nowH + 1) / 24) * 1.15 : m.d60[52];
      return { cur, prev: null as number[] | null, value, prevValue, labels: hourLabels.slice(0, nowH + 1), weekend: undefined as boolean[] | undefined };
    }
    const n = range === "7d" ? 7 : 30;
    const cur = m.d60.slice(60 - n), prev = m.d60.slice(60 - 2 * n, 60 - n);
    const value = m.agg === "sum" ? sum(cur) : avg(cur);
    const prevValue = m.agg === "sum" ? sum(prev) : avg(prev);
    const ds = days.slice(30 - n);
    return { cur, prev, value, prevValue, labels: ds.map(dayLabel), weekend: ds.map(isWeekend) };
  };
  const sel = data.find((m) => m.key === metricKey) ?? data[0];
  const sv = view(sel);
  const areaWeek = React.useMemo(() => {
    const per = AREAS.map((_, k) => dailySeries(41 + k, 7, { start: 14 + k * 3, vol: 0.25, min: 3, max: 40, weekend: 0.6 }));
    return lastDays(7).map((d, i) => ({ label: weekdayShort(d), values: per.map((p) => p[i]) }));
  }, []);
  const sources = [
    { label: "WhatsApp", value: 412, color: "#25d366" },
    { label: "Sitio web", value: 293, color: "#3b82f6" },
    { label: "Email", value: 206, color: "#f59e0b" },
    { label: "Referidos", value: 119, color: "#8b5cf6" },
    { label: "Eventos", value: 54, color: "#14b8a6" },
  ];
  const done = BOTS.map((b) => ({ id: b.id, n: events.filter((e) => e.type === "task" && e.bot === b.id).length }));
  const max = Math.max(1, ...done.map((d) => d.n));
  return (
    <div className={s.dash}>
      <div className={s.chartHead}>
        <div>
          <div className={s.chartTitle}>Resumen · {RANGE_LABEL[range].toLowerCase()}</div>
          <div className={s.chartSub}>Comparado con el periodo anterior · toca una métrica para verla en el gráfico</div>
        </div>
        <RangeToggle value={range} onChange={setRange} />
      </div>
      <div className={s.dashGrid}>
        {data.map((m) => {
          const v = view(m);
          return (
            <button key={m.key} type="button" className={`${s.tile} ${metricKey === m.key ? s.tileOn : ""}`} onClick={() => setMetricKey(m.key)}>
              <span className={s.tileTop}>
                {m.label}
                <Delta now={v.value} prev={v.prevValue} />
              </span>
              <b>{m.fmt(v.value)}</b>
              <small>{m.agg === "avg" ? "promedio diario" : range === "hoy" ? "hasta ahora" : "en el periodo"}</small>
              <Spark data={v.cur.length > 1 ? v.cur : [0, ...v.cur]} color={m.color} />
            </button>
          );
        })}
      </div>
      <ChartCard
        title={`${sel.label} · ${range === "hoy" ? "por hora" : "por día"}`}
        sub={range === "hoy" ? "hoy, hasta la hora actual" : `${sel.unit} · los fines de semana en gris`}
        right={<Legend items={[{ label: sel.label, color: sel.color }, ...(sv.prev ? [{ label: "Periodo anterior", color: "#9ca3af" }] : [])]} />}
      >
        <LineChart
          series={[{ name: sel.label, color: sel.color, data: sv.cur }, ...(sv.prev ? [{ name: "Periodo anterior", color: "#9ca3af", data: sv.prev, dashed: true, area: false }] : [])]}
          labels={sv.labels}
          weekend={sv.weekend}
          yFormat={sel.key === "revenue" ? fmtK : sel.key === "reach" ? fmtK : fmtInt}
          target={sel.target && range !== "hoy" ? { value: sel.target, label: `meta ${sel.target}/día` } : undefined}
        />
      </ChartCard>
      <div className={s.grid2}>
        <ChartCard title="Tareas completadas por área" sub="últimos 7 días" right={undefined}>
          <BarChart groups={areaWeek} colors={AREA_COLORS} every={1} height={160} />
          <div style={{ marginTop: 6 }}>
            <Legend items={AREAS.map((a, k) => ({ label: a, color: AREA_COLORS[k] }))} />
          </div>
        </ChartCard>
        <ChartCard title="Origen de los leads" sub="últimos 30 días">
          <Donut parts={sources} size={112} />
        </ChartCard>
      </div>
      <ChartCard title="Últimos negocios" sub="pipeline de ventas · HubSpot">
        <table className={s.tbl}>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Etapa</th>
              <th className={s.num}>Monto</th>
              <th>Responsable</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {DEALS.map((d) => (
              <tr key={d.company} className={s.rowBtn} onClick={() => onOpenBot(d.owner)}>
                <td>{d.company}</td>
                <td>
                  <span className={`${s.tag} ${d.stage === "Cerrado ganado" ? s.tagOk : d.stage === "Negociación" ? s.tagWarn : ""}`}>{d.stage}</span>
                </td>
                <td className={s.num}>{fmtMoney(d.amount)}</td>
                <td>{name(d.owner)}</td>
                <td>{d.daysAgo === 0 ? "hoy" : d.daysAgo === 1 ? "ayer" : dayLabel(new Date(Date.now() - d.daysAgo * 86400000))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ChartCard>
      <div className={s.h}>En vivo · ciclos de trabajo completados por empleado</div>
      <div className={s.bars2}>
        {done.map((d) => (
          <button key={d.id} type="button" className={s.bar2} onClick={() => onOpenBot(d.id)}>
            <Avatar id={d.id} size={22} />
            <i style={{ width: `${(d.n / max) * 100}%`, background: BOT_BY_ID[d.id].accent }} />
            <b>{d.n}</b>
          </button>
        ))}
      </div>
    </div>
  );
}

function CoffeePanel({ events, onOpenBot }: PanelProps) {
  const cups = events.filter((e) => e.type === "coffee");
  const nowH = new Date().getHours();
  const hours = React.useMemo(() => hourlyToday(21, 27, 9.5, 15), []);
  const liveByHour = hours.map((v, h) => Math.round(v) + cups.filter((c) => new Date(c.t).getHours() === h).length);
  const today = sum(liveByHour);
  // the cups poured before you arrived, spread over the team
  const seeded = Math.round(sum(hours.map((v) => Math.round(v))));
  const byBot = BOTS.map((b, i) => ({ id: b.id, n: Math.floor((seeded * (((i * 7) % 11) + 3)) / 72) + cups.filter((c) => c.bot === b.id).length })).sort((a, b) => b.n - a.n);
  const last = cups[0];
  const twoWeeks = React.useMemo(() => dailySeries(22, 14, { start: 26, vol: 0.18, min: 6, max: 45, weekend: 0.6 }), []);
  const beans = Math.max(8, 78 - today * 1.2);
  return (
    <div className={s.dash}>
      <div className={s.kpis}>
        <div className={s.kpi}>
          <b>{today}</b>
          <span>
            cafés hoy <Delta now={today} prev={twoWeeks[6] * ((nowH + 1) / 20)} />
          </span>
        </div>
        <div className={s.kpi}>
          <b>{Math.round(beans)}%</b>
          <span>granos</span>
        </div>
        <div className={s.kpi}>
          <b>{last ? name(last.bot) : "—"}</b>
          <span>{last ? `último, ${ago(last.t)}` : "aún nadie"}</span>
        </div>
      </div>
      <ChartCard title="Cafés por hora" sub="hoy · el pico de media mañana y el de después del almuerzo">
        <BarChart groups={liveByHour.slice(6, Math.max(8, nowH + 1)).map((v, i) => ({ label: hourLabels[i + 6], values: [v] }))} colors={["#c47a58"]} every={2} height={140} />
      </ChartCard>
      <ChartCard title="Cafés por día" sub="últimas dos semanas" right={<Delta now={sum(twoWeeks.slice(7))} prev={sum(twoWeeks.slice(0, 7))} />}>
        <Spark data={twoWeeks} color="#c47a58" h={48} />
      </ChartCard>
      <div className={s.h}>Ranking de cafeteros · en vivo</div>
      <div className={s.list}>
        {byBot.slice(0, 6).map((b, i) => (
          <button key={b.id} type="button" className={s.row2} onClick={() => onOpenBot(b.id)}>
            <span className={s.rank}>{i + 1}</span>
            <Avatar id={b.id} />
            <span className={s.grow}>{name(b.id)}</span>
            <span className={s.cups}>{"☕".repeat(Math.min(6, b.n)) || "·"}</span>
            <b>{b.n}</b>
          </button>
        ))}
      </div>
      <div className={s.note}>Máquina lista · agua OK · descalcificación en 12 días · 1.240 cafés este mes</div>
    </div>
  );
}

const DOC_TITLES: Record<string, string[]> = {
  sales: ["Propuesta comercial · Grupo Andino.pdf", "Pipeline semanal.pdf"],
  support: ["Resumen de tickets escalados.pdf", "CSAT del mes.pdf"],
  social: ["Calendario de contenido · octubre.pdf", "Reporte de campaña.pdf"],
  dev: ["Notas de despliegue v2.4.pdf", "Reporte de incidentes.pdf"],
  finance: ["Conciliación bancaria · septiembre.pdf", "Flujo de caja 30 días.pdf"],
  ops: ["Pedido de insumos.pdf", "Agenda de la semana.pdf"],
};
function PrinterPanel({ events, onOpenBot }: PanelProps) {
  const prints = events.filter((e) => e.type === "print");
  const seed = [
    { bot: "camila", title: "Conciliación bancaria · septiembre.pdf", t: Date.now() - 32 * 60000 },
    { bot: "sofia", title: "Propuesta comercial · Grupo Andino.pdf", t: Date.now() - 58 * 60000 },
  ];
  const docs = [...prints.map((p, i) => ({ bot: p.bot!, title: DOC_TITLES[BOT_BY_ID[p.bot!].screen][i % 2], t: p.t })), ...seed];
  return (
    <div className={s.stack}>
      <div className={s.kpis}>
        <div className={s.kpi}>
          <b>{docs.length}</b>
          <span>documentos hoy</span>
        </div>
        <div className={s.kpi}>
          <b>{docs.length * 7 + 3}</b>
          <span>páginas</span>
        </div>
        <div className={s.kpi}>
          <b>OK</b>
          <span>tóner 64 %</span>
        </div>
      </div>
      <div className={s.h}>Cola de impresión</div>
      <div className={s.list}>
        {docs.map((d, i) => (
          <button key={i} type="button" className={s.row2} onClick={() => onOpenBot(d.bot)}>
            <span className={s.docIcon}>PDF</span>
            <span className={s.grow}>
              {d.title}
              <small>
                {name(d.bot)} · {hhmm(d.t)}
              </small>
            </span>
            <Avatar id={d.bot} size={22} />
          </button>
        ))}
      </div>
    </div>
  );
}

const KB = [
  { title: "Manual de atención al cliente", tags: ["soporte", "tono"], by: "mateo", pages: 24 },
  { title: "Política de reembolsos", tags: ["soporte", "finanzas"], by: "camila", pages: 6 },
  { title: "Guion de calificación de leads", tags: ["ventas"], by: "sofia", pages: 9 },
  { title: "Guía de marca y voz", tags: ["marketing", "diseño"], by: "valentina", pages: 31 },
  { title: "Runbook de despliegues", tags: ["desarrollo"], by: "nicolas", pages: 14 },
  { title: "Catálogo de productos 2026", tags: ["ventas", "soporte"], by: "sofia", pages: 42 },
  { title: "Proveedores y contactos", tags: ["operaciones"], by: "andres", pages: 11 },
  { title: "Plantillas de contratos", tags: ["legal"], by: "emma", pages: 18 },
  { title: "Diccionario de datos", tags: ["datos", "desarrollo"], by: "tomas", pages: 27 },
  { title: "Proceso de onboarding", tags: ["talento"], by: "lucia", pages: 8 },
  { title: "Protocolo de visitas", tags: ["recepción"], by: "ana", pages: 4 },
];
function ShelfPanel({ onOpenBot }: PanelProps) {
  const [q, setQ] = React.useState("");
  const list = KB.filter((d) => !q || (d.title + d.tags.join(" ")).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className={s.stack}>
      <input className={s.search} placeholder="Buscar en la base de conocimiento…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className={s.note}>
        {KB.length} documentos · {KB.reduce((a, d) => a + d.pages, 0)} páginas aprendidas por el equipo
      </div>
      <div className={s.list}>
        {list.map((d) => (
          <button key={d.title} type="button" className={s.row2} onClick={() => onOpenBot(d.by)}>
            <span className={s.docIcon} style={{ background: "#eef2ff", color: "#4338ca" }}>
              DOC
            </span>
            <span className={s.grow}>
              {d.title}
              <small>
                {d.tags.map((t) => `#${t}`).join(" ")} · {d.pages} págs. · aprendido por {name(d.by)}
              </small>
            </span>
            <Avatar id={d.by} size={22} />
          </button>
        ))}
        {!list.length && <div className={s.note}>Sin resultados para “{q}”.</div>}
      </div>
    </div>
  );
}

/** The bots' own conversations, newest first, grouped by encounter. */
function WaterPanel({ events, onOpenBot }: PanelProps) {
  const lines = events.filter((e) => e.type === "line");
  const groups: { key: string; place: string; lines: OfficeEvent[] }[] = [];
  for (const l of lines) {
    const pair = [l.bot, l.to].sort().join("+") + ":" + l.place;
    const g = groups[groups.length - 1];
    if (g && g.key === pair && g.lines[g.lines.length - 1].t - l.t < 60000) g.lines.push(l);
    else groups.push({ key: pair, place: l.place ?? "", lines: [l] });
  }
  return (
    <div className={s.stack}>
      {!groups.length && <div className={s.note}>Aún no hay conversaciones. Espera a que alguien vaya por un café… ☕</div>}
      <div className={s.feed}>
        {groups.slice(0, 12).map((g, i) => (
          <div key={i} className={s.convo}>
            <div className={s.convoHead}>
              {[...new Set(g.lines.flatMap((l) => [l.bot!, l.to!]))].map((id) => (
                <Avatar key={id} id={id} size={22} />
              ))}
              <span>
                en {PLACE_ES[g.place] ?? g.place} · {hhmm(g.lines[g.lines.length - 1].t)}
              </span>
            </div>
            {[...g.lines].reverse().map((l, k) => (
              <button key={k} type="button" className={s.convoLine} onClick={() => onOpenBot(l.bot!)}>
                <b style={{ color: BOT_BY_ID[l.bot!].accent }}>{name(l.bot)}</b>
                <span>{l.text}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function describe(e: OfficeEvent): string | null {
  switch (e.type) {
    case "coffee": return `${name(e.bot)} se preparó un café`;
    case "break": return e.place === "visit" ? null : `${name(e.bot)} fue a ${PLACE_ES[e.place ?? ""] ?? e.place}`;
    case "back": return `${name(e.bot)} volvió a su puesto`;
    case "game": return `${name(e.winner)} le ganó a ${name(e.loser)} en piedra, papel o tijera`;
    case "pingpong": return `${name(e.winner)} ganó el ping-pong ${e.score} a ${name(e.loser)}`;
    case "print": return `${name(e.bot)} imprimió un documento`;
    case "visit": return `${name(e.bot)} pasó por el escritorio de ${name(e.host)}`;
    case "meeting": return `Reunión en ${PLACE_ES[e.place ?? ""] ?? e.place}: ${e.bots?.map(name).join(", ")}`;
    case "task": return `${name(e.bot)} completó una tarea`;
    case "call": return `${name(e.bot)} terminó una llamada`;
    default: return null;
  }
}
function ClockPanel({ events, onOpenBot }: PanelProps) {
  const items = events.map((e) => ({ e, text: describe(e) })).filter((x) => x.text).slice(0, 60);
  return (
    <div className={s.stack}>
      {!items.length && <div className={s.note}>La jornada acaba de empezar.</div>}
      <div className={s.timeline}>
        {items.map(({ e, text }, i) => (
          <button key={i} type="button" className={s.tlItem} onClick={() => (e.bot || e.winner) && onOpenBot((e.bot || e.winner)!)}>
            <time>{hhmm(e.t)}</time>
            <Avatar id={(e.bot || e.winner || e.bots?.[0]) ?? ""} size={20} />
            <span>{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ServersPanel() {
  const tick = useTick(1500);
  const svc = [
    ["Agente de ventas", "sales-agent", 99.99],
    ["Agente de soporte", "support-agent", 99.98],
    ["Orquestador", "orchestrator", 100],
    ["API de clientes", "customers-api", 99.97],
    ["Base de datos", "postgres-01", 100],
    ["Cola de tareas", "queue", 99.95],
  ] as const;
  const p50 = React.useMemo(() => dailySeries(31, 24, { start: 92, vol: 0.07, min: 70, max: 130 }), []);
  const p95 = React.useMemo(() => p50.map((v, i) => Math.round(v * 1.75 + ((i * 37) % 23))), [p50]);
  const rpm = React.useMemo(() => hourlyToday(32, 42000, 10.5, 16).map((v) => Math.round(v)), []);
  const nowH = new Date().getHours();
  const nodes = [
    { host: "agents-01", cpu: 34, mem: 61 },
    { host: "agents-02", cpu: 29, mem: 58 },
    { host: "api-01", cpu: 18, mem: 44 },
    { host: "postgres-01", cpu: 12, mem: 72 },
  ].map((n, i) => ({ ...n, cpu: Math.max(4, Math.min(96, n.cpu + Math.round(Math.sin(tick * 0.6 + i) * 5))) }));
  const load = Math.round(avg(nodes.map((n) => n.cpu)));
  return (
    <div className={s.dash}>
      <div className={s.kpis}>
        <div className={s.kpi}>
          <b>99,98 %</b>
          <span>uptime 30 días</span>
        </div>
        <div className={s.kpi}>
          <b>{p95[Math.min(23, nowH)]} ms</b>
          <span>latencia p95 ahora</span>
        </div>
        <div className={s.kpi}>
          <b>{load}%</b>
          <span>CPU promedio</span>
        </div>
      </div>
      <ChartCard title="Latencia de los agentes" sub="últimas 24 horas · milisegundos" right={<Legend items={[{ label: "p50", color: "#3b82f6" }, { label: "p95", color: "#f59e0b" }]} />}>
        <LineChart series={[{ name: "p50", color: "#3b82f6", data: p50 }, { name: "p95", color: "#f59e0b", data: p95, area: false }]} labels={hourLabels} every={4} height={160} yFormat={(v) => `${Math.round(v)}`} target={{ value: 250, label: "SLA 250 ms" }} />
      </ChartCard>
      <ChartCard title="Peticiones por hora" sub="hoy">
        <BarChart groups={rpm.slice(0, Math.max(6, nowH + 1)).map((v, i) => ({ label: hourLabels[i], values: [v] }))} colors={["#7cc0ff"]} every={3} height={130} yFormat={fmtK} />
      </ChartCard>
      <ChartCard title="Nodos" sub="carga en vivo">
        <table className={s.tbl}>
          <thead>
            <tr>
              <th>Host</th>
              <th>CPU</th>
              <th>Memoria</th>
              <th className={s.num}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((n) => (
              <tr key={n.host}>
                <td style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{n.host}</td>
                <td>
                  <span className={s.statusLine}>
                    <span className={s.meter}>
                      <i style={{ width: `${n.cpu}%`, background: n.cpu > 80 ? "#ef4444" : "#3b82f6" }} />
                    </span>
                    {n.cpu}%
                  </span>
                </td>
                <td>
                  <span className={s.statusLine}>
                    <span className={s.meter}>
                      <i style={{ width: `${n.mem}%`, background: "#8b5cf6" }} />
                    </span>
                    {n.mem}%
                  </span>
                </td>
                <td className={s.num}>
                  <span className={`${s.tag} ${s.tagOk}`}>OK</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ChartCard>
      <div className={s.h}>Servicios</div>
      <div className={s.list}>
        {svc.map(([label, host, up]) => (
          <div key={host} className={s.row2}>
            <span className={s.ledDot} style={{ background: up === 100 ? "#22c55e" : "#84cc16" }} />
            <span className={s.grow}>
              {label}
              <small>{host}</small>
            </span>
            <b>{up.toFixed(2)} %</b>
          </div>
        ))}
      </div>
      <div className={s.note}>0 incidentes en 30 días · último: hace 23 días, 4 min de degradación · último despliegue hace 41 min (Nicolás)</div>
    </div>
  );
}

function PingpongPanel({ events, onOpenBot }: PanelProps) {
  const games = events.filter((e) => e.type === "pingpong");
  const rps = events.filter((e) => e.type === "game");
  const table = BOTS.map((b) => ({
    id: b.id,
    w: games.filter((g) => g.winner === b.id).length + rps.filter((g) => g.winner === b.id).length,
    l: games.filter((g) => g.loser === b.id).length + rps.filter((g) => g.loser === b.id).length,
  }))
    .filter((r) => r.w + r.l)
    .sort((a, b) => b.w - a.w || a.l - b.l);
  return (
    <div className={s.stack}>
      <div className={s.kpis}>
        <div className={s.kpi}>
          <b>{games.length}</b>
          <span>partidas de ping-pong</span>
        </div>
        <div className={s.kpi}>
          <b>{rps.length}</b>
          <span>piedra, papel o tijera</span>
        </div>
        <div className={s.kpi}>
          <b>{table[0] ? name(table[0].id) : "—"}</b>
          <span>líder</span>
        </div>
      </div>
      <div className={s.h}>Ranking</div>
      <div className={s.list}>
        {!table.length && <div className={s.note}>Todavía no hay partidas. Alguien caerá pronto… 🏓</div>}
        {table.map((r, i) => (
          <button key={r.id} type="button" className={s.row2} onClick={() => onOpenBot(r.id)}>
            <span className={s.rank}>{i + 1}</span>
            <Avatar id={r.id} />
            <span className={s.grow}>{name(r.id)}</span>
            <b>
              {r.w} G · {r.l} P
            </b>
          </button>
        ))}
      </div>
      <div className={s.h}>Últimas partidas</div>
      <div className={s.list}>
        {games.slice(0, 6).map((g, i) => (
          <div key={i} className={s.row2}>
            <Avatar id={g.winner!} size={22} />
            <span className={s.grow}>
              <b>{name(g.winner)}</b> venció a {name(g.loser)} <small>{g.score} · {hhmm(g.t)}</small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReceptionPanel({ onOpenBot }: PanelProps) {
  const now = new Date();
  const h = now.getHours();
  const agenda = [
    { time: "09:00", who: "Grupo Andino", what: "Demo del agente de ventas", host: "sofia" },
    { time: "11:30", who: "Equipo interno", what: "Revisión semanal", host: "andres" },
    { time: "15:00", who: "Farmacias Cruz", what: "Presentación de propuesta", host: "sofia" },
    { time: "16:30", who: "Cooperativa 29 de Octubre", what: "Onboarding", host: "mateo" },
  ];
  const days = React.useMemo(() => lastDays(14), []);
  const visits = React.useMemo(() => dailySeries(51, 14, { start: 8, vol: 0.3, min: 2, max: 18, weekend: 0.5 }), []);
  const calls = React.useMemo(() => dailySeries(52, 14, { start: 29, vol: 0.2, min: 8, max: 55, weekend: 0.55 }), []);
  return (
    <div className={s.dash}>
      <div className={s.kpis}>
        <div className={s.kpi}>
          <b>{visits[13]}</b>
          <span>
            visitantes hoy <Delta now={visits[13]} prev={visits[6]} />
          </span>
        </div>
        <div className={s.kpi}>
          <b>{calls[13]}</b>
          <span>
            llamadas <Delta now={calls[13]} prev={calls[6]} />
          </span>
        </div>
        <div className={s.kpi}>
          <b>3</b>
          <span>paquetes</span>
        </div>
      </div>
      <ChartCard title="Visitas y llamadas por día" sub="últimas dos semanas" right={<Legend items={[{ label: "Visitas", color: "#e08a5c" }, { label: "Llamadas", color: "#3d4a7a" }]} />}>
        <BarChart groups={days.map((d, i) => ({ label: dayLabel(d), values: [visits[i], calls[i]] }))} colors={["#e08a5c", "#3d4a7a"]} stacked={false} every={2} height={150} />
      </ChartCard>
      <div className={s.h}>Agenda de visitas</div>
      <div className={s.list}>
        {agenda.map((a) => {
          const past = parseInt(a.time) < h;
          return (
            <button key={a.time} type="button" className={s.row2} onClick={() => onOpenBot(a.host)} style={{ opacity: past ? 0.55 : 1 }}>
              <time className={s.tlTime}>{a.time}</time>
              <span className={s.grow}>
                {a.who}
                <small>{a.what} · recibe {name(a.host)}</small>
              </span>
              <span className={`${s.tag} ${past ? s.tagOk : s.tagAcc}`}>{past ? "Atendida" : "Confirmada"}</span>
            </button>
          );
        })}
      </div>
      <div className={s.note}>Atiende Ana · registro con cédula · Wi-Fi de invitados: MindfulTech-Guest</div>
    </div>
  );
}

const MEET_HIST = dailySeries(61, 14, { start: 5, vol: 0.35, min: 1, max: 11, weekend: 0.4 });
function MeetingPanel({ events, status, onOpenBot }: PanelProps) {
  const inRoom = BOTS.filter((b) => /Sala Andes|Sala Chimborazo|reunión/.test(status[b.id] ?? ""));
  const meetings = events.filter((e) => e.type === "meeting").slice(0, 6);
  const planned = [
    { time: "10:00", room: "Sala Andes", title: "Sprint review", who: ["nicolas", "diego", "andres"] },
    { time: "12:00", room: "Sala Chimborazo", title: "Pipeline Q4", who: ["sofia", "camila"] },
    { time: "15:00", room: "Sala Andes", title: "Demo Farmacias Cruz", who: ["sofia", "mateo", "emma"] },
    { time: "17:00", room: "Sala Chimborazo", title: "Retro semanal", who: ["lucia", "valentina", "tomas"] },
  ];
  return (
    <div className={s.stack}>
      <div className={s.h}>Ahora en las salas</div>
      {!inRoom.length && <div className={s.note}>Las salas están libres.</div>}
      <div className={s.avatarRow}>
        {inRoom.map((b) => (
          <button key={b.id} type="button" className={s.avatarBtn} onClick={() => onOpenBot(b.id)}>
            <Avatar id={b.id} size={30} />
            <small>{b.name}</small>
          </button>
        ))}
      </div>
      <ChartCard title="Reuniones por día" sub="últimas dos semanas · Sala Andes y Sala Chimborazo">
        <BarChart groups={lastDays(14).map((d, i) => ({ label: dayLabel(d), values: [MEET_HIST[i]] }))} colors={["#6f5a9e"]} every={2} height={120} />
      </ChartCard>
      <div className={s.h}>Reuniones de hoy</div>
      <div className={s.list}>
        {planned.map((m) => (
          <div key={m.time} className={s.row2}>
            <time className={s.tlTime}>{m.time}</time>
            <span className={s.grow}>
              {m.title}
              <small>{m.room}</small>
            </span>
            <span className={s.avatarStack}>
              {m.who.map((id) => (
                <Avatar key={id} id={id} size={20} />
              ))}
            </span>
          </div>
        ))}
      </div>
      {meetings.length > 0 && (
        <>
          <div className={s.h}>Reuniones espontáneas</div>
          <div className={s.list}>
            {meetings.map((m, i) => (
              <div key={i} className={s.row2}>
                <time className={s.tlTime}>{hhmm(m.t)}</time>
                <span className={s.grow}>
                  {m.bots?.map(name).join(", ")}
                  <small>{PLACE_ES[m.place ?? ""]}</small>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function LoungePanel({ events, status, onOpenBot }: PanelProps) {
  // agents do not rest: what matters is their load, what they consume and what they cost
  const tasks = events.filter((e) => e.type === "task");
  const tokens30 = React.useMemo(() => dailySeries(71, 30, { start: 186, drift: 0.004, vol: 0.1, min: 60, max: 420, weekend: 0.72 }), []); // thousands
  const days = React.useMemo(() => lastDays(30), []);
  const perAgent = React.useMemo(() => BOTS.map((b, i) => ({ id: b.id, tokens: Math.round(12 + ((i * 37) % 29) + (i === 1 ? 26 : 0)) })), []);
  const rows = BOTS.map((b, i) => {
    const done = 18 + ((i * 7) % 11) + tasks.filter((e) => e.bot === b.id).length;
    const load = Math.max(22, Math.min(96, 58 + ((i * 13) % 31) + (status[b.id] == null ? 12 : 0)));
    return { id: b.id, done, load };
  });
  const PRICE = 0.0042; // USD per thousand tokens, blended
  const monthTokens = sum(tokens30);
  const cost30 = monthTokens * PRICE;
  const cost30prev = sum(dailySeries(72, 30, { start: 182, drift: 0.002, vol: 0.1, min: 60, max: 400, weekend: 0.72 })) * PRICE;
  const areaCost = [
    { label: "Soporte", value: cost30 * 0.34, color: "#22c55e" },
    { label: "Ventas", value: cost30 * 0.27, color: "#3b82f6" },
    { label: "Marketing", value: cost30 * 0.16, color: "#8b5cf6" },
    { label: "Finanzas", value: cost30 * 0.13, color: "#f59e0b" },
    { label: "Operaciones", value: cost30 * 0.1, color: "#14b8a6" },
  ];
  return (
    <div className={s.dash}>
      <div className={s.kpis}>
        <div className={s.kpi}>
          <b>{rows.reduce((a, r) => a + r.done, 0)}</b>
          <span>tareas hoy</span>
        </div>
        <div className={s.kpi}>
          <b>{fmtInt(tokens30[29])}k</b>
          <span>
            tokens hoy <Delta now={tokens30[29]} prev={tokens30[22]} invert />
          </span>
        </div>
        <div className={s.kpi}>
          <b>{fmtMoney(cost30)}</b>
          <span>
            costo 30 días <Delta now={cost30} prev={cost30prev} invert />
          </span>
        </div>
      </div>
      <ChartCard title="Tokens consumidos por día" sub="últimos 30 días · miles de tokens · los fines de semana en gris">
        <LineChart series={[{ name: "Tokens (k)", color: "#6f5a9e", data: tokens30 }]} labels={days.map(dayLabel)} weekend={days.map(isWeekend)} height={170} yFormat={(v) => `${Math.round(v)}k`} />
      </ChartCard>
      <div className={s.grid2}>
        <ChartCard title="Tokens por agente" sub="hoy · miles">
          <BarChart groups={perAgent.map((a) => ({ label: name(a.id).slice(0, 3), values: [a.tokens] }))} colors={["#6f5a9e"]} every={1} height={150} />
        </ChartCard>
        <ChartCard title="Costo por área" sub="últimos 30 días">
          <Donut parts={areaCost} size={108} format={fmtMoney} />
        </ChartCard>
      </div>
      <div className={s.h}>Carga de trabajo por agente · en vivo</div>
      <div className={s.bars2}>
        {rows.map((r) => (
          <button key={r.id} type="button" className={s.bar2} onClick={() => onOpenBot(r.id)}>
            <Avatar id={r.id} size={22} />
            <i style={{ width: `${r.load}%`, background: r.load > 85 ? "#f59e0b" : "#22c55e" }} />
            <b>
              {r.load}% · {r.done}
            </b>
          </button>
        ))}
      </div>
      <div className={s.note}>Uptime 99,98 % · sin pausas ni vacaciones · un humano aprueba lo que necesita firma · el equivalente humano costaría unas 40 veces más. Cifras simuladas para la demo.</div>
    </div>
  );
}

export function HotspotPanel({ id, ...rest }: { id: string } & PanelProps) {
  switch (id) {
    case "board": return <BoardPanel {...rest} />;
    case "tv": return <TvPanel {...rest} />;
    case "coffee": return <CoffeePanel {...rest} />;
    case "printer": return <PrinterPanel {...rest} />;
    case "shelf": return <ShelfPanel {...rest} />;
    case "water": return <WaterPanel {...rest} />;
    case "clock": return <ClockPanel {...rest} />;
    case "servers": return <ServersPanel />;
    case "pingpong": return <PingpongPanel {...rest} />;
    case "reception": return <ReceptionPanel {...rest} />;
    case "meeting": return <MeetingPanel {...rest} />;
    case "lounge": return <LoungePanel {...rest} />;
    default: return null;
  }
}
