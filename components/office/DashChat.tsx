"use client";

import * as React from "react";
import { botById } from "@/lib/office/bots";
import { tx, type Lang } from "@/lib/office/i18n";
import { AgentFace, type FaceMood } from "./AgentFace";
import s from "./office.module.css";

/** Everything the dashboard shows, handed to the analyst so every answer is computed from the same numbers. */
export type DashFacts = {
  rangeDays: number;
  metrics: { key: string; label: string; unit: string; agg: "sum" | "avg"; cur: number[]; prev: number[]; labels: string[]; value: number; prevValue: number; target?: number; fmt: (v: number) => string }[];
  deals: { company: string; stage: string; won: boolean; open: boolean; amount: number; owner: string; daysAgo: number }[];
  sources: { label: string; value: number }[];
  cycles: { name: string; n: number }[];
  fmtMoney: (v: number) => string;
  fmtInt: (v: number) => string;
};

type Msg = { from: "bot" | "user"; text: string };

const norm = (q: string) => q.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));
const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);
const argMax = (arr: number[]) => arr.reduce((bi, v, i) => (v > arr[bi] ? i : bi), 0);
const argMin = (arr: number[]) => arr.reduce((bi, v, i) => (v < arr[bi] ? i : bi), 0);

/** The analyst: picks the metric, the question kind, and answers from the numbers. */
export function answer(q0: string, f: DashFacts, lang: Lang): string {
  const t = tx(lang);
  const q = norm(q0);
  const m =
    f.metrics.find((x) => has(q, "ticket", "soporte", "support")) && f.metrics.find((x) => x.key === "tickets")
      ? f.metrics.find((x) => x.key === "tickets")!
      : has(q, "cobr", "collect", "revenue", "ingreso", "dinero", "money", "factur", "$", "usd", "venta", "sales")
      ? f.metrics.find((x) => x.key === "revenue")!
      : has(q, "alcance", "reach", "redes", "social", "instagram", "seguidores")
      ? f.metrics.find((x) => x.key === "reach")!
      : f.metrics.find((x) => x.key === "leads")!;
  const sign = (v: number) => `${v >= 0 ? "▲" : "▼"} ${Math.abs(v).toFixed(1)}%`;
  const delta = pct(m.value, m.prevValue);
  const period = f.rangeDays === 1 ? t("hoy", "today") : t(`los últimos ${f.rangeDays} días`, `the last ${f.rangeDays} days`);
  const prevName = f.rangeDays === 1 ? t("el mismo día de la semana pasada", "the same weekday last week") : t("el periodo anterior", "the previous period");

  // deals and pipeline
  if (has(q, "deal", "negocio", "pipeline", "cerr", "won", "ganad", "propuesta", "proposal", "negociac", "cliente", "client", "hubspot", "andino", "farmacias", "hotel", "coop", "logistica", "universidad")) {
    const named = f.deals.find((d) => q.includes(norm(d.company).split(" ")[0]) || (norm(d.company).split(" ")[1] && q.includes(norm(d.company).split(" ")[1])));
    if (named) {
      const when = named.daysAgo === 0 ? t("hoy", "today") : named.daysAgo === 1 ? t("ayer", "yesterday") : t(`hace ${named.daysAgo} días`, `${named.daysAgo} days ago`);
      return t(
        `${named.company}: ${named.stage.toLowerCase()}, ${f.fmtMoney(named.amount)}, lo lleva ${named.owner}, última actividad ${when}.${named.open ? " Sigue abierto en el pipeline." : named.won ? " Ya está cerrado y cobrado." : ""}`,
        `${named.company}: ${named.stage.toLowerCase()}, ${f.fmtMoney(named.amount)}, owned by ${named.owner}, last activity ${when}.${named.open ? " Still open in the pipeline." : named.won ? " Closed and collected." : ""}`
      );
    }
    const won = f.deals.filter((d) => d.won), open = f.deals.filter((d) => d.open);
    const wonSum = won.reduce((a, d) => a + d.amount, 0), openSum = open.reduce((a, d) => a + d.amount, 0);
    const byOwner = new Map<string, number>();
    for (const d of won) byOwner.set(d.owner, (byOwner.get(d.owner) || 0) + d.amount);
    const top = [...byOwner.entries()].sort((a, b) => b[1] - a[1])[0];
    const biggest = open.sort((a, b) => b.amount - a.amount)[0];
    return t(
      `Pipeline reciente: ${won.length} negocios cerrados por ${f.fmtMoney(wonSum)} y ${open.length} abiertos por ${f.fmtMoney(openSum)}. ${top ? `${top[0]} cerró lo más (${f.fmtMoney(top[1])}).` : ""} ${biggest ? `El abierto más grande es ${biggest.company} (${f.fmtMoney(biggest.amount)}, ${biggest.stage.toLowerCase()}).` : ""}`,
      `Recent pipeline: ${won.length} deals closed for ${f.fmtMoney(wonSum)} and ${open.length} open for ${f.fmtMoney(openSum)}. ${top ? `${top[0]} closed the most (${f.fmtMoney(top[1])}).` : ""} ${biggest ? `The biggest open one is ${biggest.company} (${f.fmtMoney(biggest.amount)}, ${biggest.stage.toLowerCase()}).` : ""}`
    );
  }
  // lead sources
  if (has(q, "fuente", "source", "canal", "channel", "whatsapp", "de donde", "where do", "referid", "referral", "web")) {
    const total = f.sources.reduce((a, x) => a + x.value, 0);
    const sorted = [...f.sources].sort((a, b) => b.value - a.value);
    const list = sorted.map((x) => `${x.label} ${Math.round((x.value / total) * 100)}%`).join(", ");
    return t(`De ${f.fmtInt(total)} leads en 30 días, el canal principal es ${sorted[0].label} (${f.fmtInt(sorted[0].value)}). Reparto: ${list}.`, `Of ${f.fmtInt(total)} leads in 30 days the main channel is ${sorted[0].label} (${f.fmtInt(sorted[0].value)}). Split: ${list}.`);
  }
  // who worked the most (live cycles)
  if (has(q, "quien", "who", "empleado", "employee", "equipo", "team", "ciclo", "cycle", "productiv", "trabaj", "work")) {
    const sorted = [...f.cycles].sort((a, b) => b.n - a.n);
    const total = f.cycles.reduce((a, x) => a + x.n, 0);
    return total === 0
      ? t("Todavía no hay ciclos completados desde que abriste la oficina; en unos minutos verás quién va adelante.", "No work cycles completed since you opened the office yet; give it a few minutes and you will see who leads.")
      : t(`En lo que llevas viendo la oficina se completaron ${total} ciclos. ${sorted[0].name} va adelante con ${sorted[0].n}${sorted[1] ? `, luego ${sorted[1].name} con ${sorted[1].n}` : ""}.`, `Since you opened the office ${total} work cycles were completed. ${sorted[0].name} leads with ${sorted[0].n}${sorted[1] ? `, then ${sorted[1].name} with ${sorted[1].n}` : ""}.`);
  }
  // best / worst day
  if (has(q, "mejor", "best", "pico", "peak", "maxim", "highest", "record")) {
    const i = argMax(m.cur);
    return t(`El mejor ${f.rangeDays === 1 ? "momento" : "día"} de ${m.label.toLowerCase()} fue ${m.labels[i]} con ${m.fmt(m.cur[i])}${m.target ? ` (meta ${m.target}/día)` : ""}.`, `The best ${f.rangeDays === 1 ? "hour" : "day"} for ${m.label.toLowerCase()} was ${m.labels[i]} with ${m.fmt(m.cur[i])}${m.target ? ` (target ${m.target}/day)` : ""}.`);
  }
  if (has(q, "peor", "worst", "bajo", "lowest", "minim", "cayo", "drop", "caida")) {
    const i = argMin(m.cur);
    return t(`El punto más bajo de ${m.label.toLowerCase()} fue ${m.labels[i]} con ${m.fmt(m.cur[i])}.`, `The lowest point for ${m.label.toLowerCase()} was ${m.labels[i]} with ${m.fmt(m.cur[i])}.`);
  }
  // target
  if (has(q, "meta", "target", "objetivo", "goal", "cumpl")) {
    if (!m.target) return t(`${m.label} no tiene una meta diaria definida; leads y tickets sí.`, `${m.label} has no daily target; leads and tickets do.`);
    const hit = m.cur.filter((v) => v >= m.target!).length;
    return t(`${m.label}: la meta es ${m.target}/día y se cumplió ${hit} de ${m.cur.length} días (${Math.round((hit / m.cur.length) * 100)}%). Promedio del periodo: ${m.fmt(m.cur.reduce((a, b) => a + b, 0) / m.cur.length)}/día.`, `${m.label}: the target is ${m.target}/day and it was met on ${hit} of ${m.cur.length} days (${Math.round((hit / m.cur.length) * 100)}%). Period average: ${m.fmt(m.cur.reduce((a, b) => a + b, 0) / m.cur.length)}/day.`);
  }
  // trend / comparison
  if (has(q, "tendencia", "trend", "sub", "baj", "crec", "grow", "compar", "anterior", "previous", "por que", "why", "mes", "month", "semana", "week")) {
    const half = Math.max(1, Math.floor(m.cur.length / 2));
    const a = m.cur.slice(0, half).reduce((x, y) => x + y, 0) / half, b = m.cur.slice(-half).reduce((x, y) => x + y, 0) / half;
    const slope = pct(b, a);
    return t(
      `${m.label} ${period}: ${m.fmt(m.value)}, ${sign(delta)} frente a ${prevName} (${m.fmt(m.prevValue)}). Dentro del periodo la segunda mitad va ${slope >= 0 ? "arriba" : "abajo"} ${Math.abs(slope).toFixed(1)}% respecto a la primera${m.unit === "leads" ? "; los fines de semana bajan como siempre" : ""}.`,
      `${m.label} ${period}: ${m.fmt(m.value)}, ${sign(delta)} vs ${prevName} (${m.fmt(m.prevValue)}). Within the period the second half runs ${slope >= 0 ? "above" : "below"} the first by ${Math.abs(slope).toFixed(1)}%${m.unit === "leads" ? "; weekends dip as usual" : ""}.`
    );
  }
  // a plain total / summary
  if (has(q, "resumen", "summary", "todo", "overview", "como va", "how are", "general", "estado", "status")) {
    const parts = f.metrics.map((x) => `${x.label.toLowerCase()} ${x.fmt(x.value)} (${sign(pct(x.value, x.prevValue))})`);
    const worst = f.metrics.reduce((w, x) => (pct(x.value, x.prevValue) < pct(w.value, w.prevValue) ? x : w), f.metrics[0]);
    return t(`Resumen ${period}: ${parts.join(", ")}. Lo que pide atención: ${worst.label.toLowerCase()}.`, `Summary for ${period}: ${parts.join(", ")}. What needs attention: ${worst.label.toLowerCase()}.`);
  }
  return t(
    `${m.label} ${period}: ${m.fmt(m.value)}, ${sign(delta)} frente a ${prevName}. Puedo decirte el mejor día, la meta, la tendencia, las fuentes de leads, los negocios o quién completó más trabajo.`,
    `${m.label} ${period}: ${m.fmt(m.value)}, ${sign(delta)} vs ${prevName}. I can tell you the best day, the target, the trend, lead sources, the deals or who completed the most work.`
  );
}

/** Ask the dashboard: Tomás (Data) answers from the numbers on screen. */
export function DashChat({ facts, lang }: { facts: DashFacts; lang: Lang }) {
  const t = tx(lang);
  const bot = botById(lang, "tomas");
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [mood, setMood] = React.useState<FaceMood>("idle");
  const listRef = React.useRef<HTMLDivElement>(null);
  const timers = React.useRef<number[]>([]);
  React.useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);
  React.useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, mood]);
  const busy = mood === "thinking" || mood === "typing";
  const ask = (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { from: "user", text: q }]);
    setMood("thinking");
    const reply = answer(q, facts, lang);
    timers.current.push(window.setTimeout(() => setMood("typing"), 500));
    timers.current.push(
      window.setTimeout(() => {
        setMsgs((m) => [...m, { from: "bot", text: reply }]);
        setMood("talking");
        timers.current.push(window.setTimeout(() => setMood("idle"), 1500));
      }, 900 + Math.min(1400, reply.length * 6))
    );
  };
  const quick = [
    t("¿Cómo vamos este mes?", "How are we doing this month?"),
    t("¿Cuál fue el mejor día de leads?", "Best day for leads?"),
    t("¿Por qué bajaron los tickets?", "Why did tickets drop?"),
    t("¿Qué negocios están abiertos?", "Which deals are open?"),
    t("¿De dónde vienen los leads?", "Where do leads come from?"),
  ];
  const caption = mood === "thinking" ? t("revisando los datos…", "checking the numbers…") : mood === "typing" ? t("escribiendo…", "typing…") : t("pregúntale lo que quieras sobre este tablero", "ask anything about this dashboard");
  return (
    <div className={s.dashChat}>
      <div className={s.chatFace}>
        {bot && <AgentFace id={bot.id} look={bot.look} mood={mood} size={44} />}
        <span>
          <b>{bot?.name ?? "Tomás"}</b> · {t("Datos", "Data")} · {caption}
        </span>
      </div>
      <div className={`${s.messages} ${s.dashMessages}`} ref={listRef}>
        {msgs.length === 0 && <div className={s.dashHint}>{t("Respondo con los números de esta pantalla: totales, tendencias, metas, negocios, fuentes y quién trabajó más.", "I answer from the numbers on this screen: totals, trends, targets, deals, sources and who worked the most.")}</div>}
        {msgs.map((m, i) => (
          <div key={i} className={`${s.msg} ${m.from === "bot" ? s.msgBot : s.msgUser}`}>
            {m.text}
          </div>
        ))}
        {busy && (
          <div className={`${s.msg} ${s.msgBot}`} role="status">
            <span className={s.dots}>
              <i />
              <i />
              <i />
            </span>
          </div>
        )}
      </div>
      <div className={s.quick}>
        {quick.map((q) => (
          <button key={q} type="button" onClick={() => ask(q)} disabled={busy}>
            {q}
          </button>
        ))}
      </div>
      <form
        className={s.composer}
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("Pregunta sobre el tablero…", "Ask about the dashboard…")} aria-label={t("Pregunta", "Question")} />
        <button className={s.send} type="submit" disabled={!input.trim() || busy} aria-label={t("Enviar", "Send")}>
          ➜
        </button>
      </form>
    </div>
  );
}
