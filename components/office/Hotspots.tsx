"use client";

import * as React from "react";
import { BOTS, BOT_BY_ID } from "@/lib/office/bots";
import s from "./office.module.css";

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
  lounge: { icon: "🛋️", title: "Bienestar del equipo", subtitle: "Pausas, ánimo y energía", color: "#f4d98a" },
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

/** Live KPIs with sparklines; per-employee productivity from finished cycles. */
function TvPanel({ events, onOpenBot }: PanelProps) {
  const tick = useTick(2000);
  const series = React.useRef<Record<string, number[]>>({});
  const kpis = [
    ["Leads hoy", 38, 1, "#3b82f6"],
    ["Tickets resueltos", 127, 2, "#22c55e"],
    ["Cobrado ($k)", 12.4, 0.3, "#f59e0b"],
    ["Alcance (k)", 48.2, 0.6, "#8b5cf6"],
  ] as const;
  for (const [label, base, step] of kpis) {
    const arr = (series.current[label] ??= Array.from({ length: 16 }, (_, i) => base - (16 - i) * step * 0.6));
    if (arr.length < 16 + tick) arr.push(arr[arr.length - 1] + step * (0.4 + Math.random() * 0.8));
  }
  const done = BOTS.map((b) => ({ id: b.id, n: events.filter((e) => e.type === "task" && e.bot === b.id).length }));
  const max = Math.max(1, ...done.map((d) => d.n));
  return (
    <div className={s.dash}>
      <div className={s.dashGrid}>
        {kpis.map(([label, , , color]) => {
          const arr = series.current[label].slice(-16);
          const lo = Math.min(...arr), hi = Math.max(...arr);
          const pts = arr.map((v, i) => `${(i / 15) * 100},${36 - ((v - lo) / (hi - lo || 1)) * 30}`).join(" ");
          const v = arr[arr.length - 1];
          return (
            <div key={label} className={s.dashTile}>
              <span>{label}</span>
              <b>{Number.isInteger(v) ? v : v.toFixed(1)}</b>
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
                <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
              </svg>
            </div>
          );
        })}
      </div>
      <div className={s.h}>Ciclos de trabajo completados por empleado</div>
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
  const byBot = BOTS.map((b) => ({ id: b.id, n: cups.filter((c) => c.bot === b.id).length })).sort((a, b) => b.n - a.n);
  const last = cups[0];
  const beans = Math.max(8, 78 - cups.length * 2);
  return (
    <div className={s.stack}>
      <div className={s.kpis}>
        <div className={s.kpi}>
          <b>{cups.length}</b>
          <span>cafés hoy</span>
        </div>
        <div className={s.kpi}>
          <b>{beans}%</b>
          <span>granos</span>
        </div>
        <div className={s.kpi}>
          <b>{last ? name(last.bot) : "—"}</b>
          <span>{last ? `último, ${ago(last.t)}` : "aún nadie"}</span>
        </div>
      </div>
      <div className={s.h}>Ranking de cafeteros</div>
      <div className={s.list}>
        {byBot.map((b, i) => (
          <button key={b.id} type="button" className={s.row2} onClick={() => onOpenBot(b.id)}>
            <span className={s.rank}>{i + 1}</span>
            <Avatar id={b.id} />
            <span className={s.grow}>{name(b.id)}</span>
            <span className={s.cups}>{"☕".repeat(Math.min(6, b.n)) || "·"}</span>
            <b>{b.n}</b>
          </button>
        ))}
      </div>
      <div className={s.note}>Máquina lista · agua OK · descalcificación en 12 días</div>
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
  const load = 22 + Math.round(Math.sin(tick * 0.7) * 6 + (tick % 3) * 2);
  return (
    <div className={s.stack}>
      <div className={s.kpis}>
        <div className={s.kpi}>
          <b>{load}%</b>
          <span>CPU</span>
        </div>
        <div className={s.kpi}>
          <b>{(1840 + (tick * 37) % 120).toLocaleString("es-EC")}</b>
          <span>req/min</span>
        </div>
        <div className={s.kpi}>
          <b>142 ms</b>
          <span>latencia p95</span>
        </div>
      </div>
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
      <div className={s.note}>Sin incidentes en las últimas 72 h · último despliegue hace 41 min (Nicolás)</div>
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
  return (
    <div className={s.stack}>
      <div className={s.kpis}>
        <div className={s.kpi}>
          <b>9</b>
          <span>visitantes hoy</span>
        </div>
        <div className={s.kpi}>
          <b>31</b>
          <span>llamadas</span>
        </div>
        <div className={s.kpi}>
          <b>3</b>
          <span>paquetes</span>
        </div>
      </div>
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
  const breaks = events.filter((e) => e.type === "break");
  const rows = BOTS.map((b, i) => {
    const n = breaks.filter((e) => e.bot === b.id).length;
    const energy = Math.max(35, Math.min(98, 92 - i * 4 - n * 3 + (status[b.id] == null ? 0 : 6)));
    const mood = energy > 80 ? "😄" : energy > 60 ? "🙂" : "😌";
    return { id: b.id, n, energy, mood };
  });
  return (
    <div className={s.stack}>
      <div className={s.kpis}>
        <div className={s.kpi}>
          <b>{breaks.length}</b>
          <span>pausas hoy</span>
        </div>
        <div className={s.kpi}>
          <b>{Math.round(rows.reduce((a, r) => a + r.energy, 0) / rows.length)}%</b>
          <span>energía media</span>
        </div>
        <div className={s.kpi}>
          <b>😄</b>
          <span>ánimo del equipo</span>
        </div>
      </div>
      <div className={s.h}>Energía por persona</div>
      <div className={s.bars2}>
        {rows.map((r) => (
          <button key={r.id} type="button" className={s.bar2} onClick={() => onOpenBot(r.id)}>
            <Avatar id={r.id} size={22} />
            <i style={{ width: `${r.energy}%`, background: r.energy > 70 ? "#22c55e" : "#f59e0b" }} />
            <b>
              {r.mood} {r.n}
            </b>
          </button>
        ))}
      </div>
      <div className={s.note}>Los agentes no se cansan, pero las pausas hacen la oficina más humana. Este panel es parte de la demo.</div>
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
