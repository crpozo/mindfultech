"use client";

import * as React from "react";
import { NEXT } from "@/lib/office/usfqNext";
import { botById } from "@/lib/office/bots";
import { tx, LOCALE, type Lang } from "@/lib/office/i18n";
import { AgentFace, type FaceMood } from "./AgentFace";
import { LineChart, BarChart, Donut, ChartCard } from "./charts";
import { DemoNote } from "./OfficeFile";
import type { NextProject, NextDonor } from "@/lib/office/usfqNext";
import s from "./office.module.css";

const VCOLORS = ["#4f5fb8", "#d64c6a", "#2f8f80", "#e08a3c", "#7a5ab8", "#c98a2a"];
const VSHORT: Record<string, { es: string; en: string }> = {
  "Academic Excellence & Research": { es: "Academia e investigación", en: "Academic & research" },
  "Art, Culture & Community": { es: "Arte, cultura y comunidad", en: "Art, culture & community" },
  "Sustainability & Environment": { es: "Sostenibilidad y ambiente", en: "Sustainability & environment" },
  "Health & Wellbeing": { es: "Salud y bienestar", en: "Health & wellbeing" },
  "Business, Society & Innovation": { es: "Empresa, sociedad e innovación", en: "Business, society & innovation" },
  "Social Initiatives": { es: "Iniciativas sociales", en: "Social initiatives" },
};
const MONTHS: Record<Lang, string[]> = { es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"], en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] };
const monthLabel = (m: { y: number; m: number }, lang: Lang) => `${MONTHS[lang][m.m - 1]} ${String(m.y).slice(2)}`;
const money0 = (v: number, lang: Lang) => new Intl.NumberFormat(LOCALE[lang], { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const ymLabel = (ym: number, lang: Lang) => monthLabel({ y: Math.floor(ym / 100), m: ym % 100 }, lang);
const ymIndex = (ym: number) => NEXT.months.findIndex((m) => m.y * 100 + m.m === ym);
const monthsBetween = (a: number, b: number) => ymIndex(b) - ymIndex(a) + 1;
const vshort = (i: number, lang: Lang) => VSHORT[NEXT.verticals[i].name]?.[lang] ?? NEXT.verticals[i].name;
/** Execution per project is SIMULATED: the spreadsheets carry inflows only. Deterministic per project so the demo is stable. */
const execRatio = (i: number) => 0.55 + ((i * 37) % 30) / 100;
function simulatedSpend(p: NextProject, i: number): number[] {
  const inflow = NEXT.months.map((m) => p.months.find((x) => x.y === m.y && x.m === m.m)?.v ?? 0);
  const r = execRatio(i);
  const out = NEXT.months.map(() => 0);
  inflow.forEach((v, k) => {
    if (v <= 0) return;
    // spent over the following four months
    [0.1, 0.35, 0.35, 0.2].forEach((w, j) => { if (k + 1 + j < out.length) out[k + 1 + j] += v * r * w; });
  });
  return out;
}

type Vert = (typeof NEXT.verticals)[number];
const sortedVerticals = () => [...NEXT.verticals].map((v, i) => ({ ...v, color: VCOLORS[i], idx: i })).sort((a, b) => b.amount - a.amount);

/* ------------------------------------------------------------- analyst ---- */
const norm = (q: string) => q.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const has = (q: string, ...w: string[]) => w.some((x) => q.includes(x));

export function answerNext(q0: string, lang: Lang): string {
  const t = tx(lang);
  const q = norm(q0);
  const vs = sortedVerticals();
  const total = NEXT.total;
  const vName = (v: Vert) => VSHORT[v.name]?.[lang] ?? v.name;
  // a specific vertical
  const askedV = vs.find((v) => {
    const n = norm(v.name) + " " + norm(vName(v));
    return ["academ", "research", "investig", "art", "cultur", "sosten", "sustain", "ambient", "environment", "salud", "health", "bienestar", "wellbeing", "empresa", "business", "innov", "social"].some((k) => q.includes(k) && n.includes(k));
  });
  if (askedV && has(q, "vertical", "paraguas", "cuanto", "how much", "recib", "recaud", "raised", "area", "fund")) {
    const top = askedV.projects.slice(0, 3).map((i) => `${NEXT.projects[i].name} (${money0(NEXT.projects[i].amount, lang)})`).join(", ");
    return t(`${vName(askedV)}: ${money0(askedV.amount, lang)}, el ${pct(askedV.amount, total)}% del total, ${askedV.projects.length} proyectos y ${askedV.donors} donantes. Proyectos principales: ${top || "—"}.`, `${vName(askedV)}: ${money0(askedV.amount, lang)}, ${pct(askedV.amount, total)}% of the total, ${askedV.projects.length} projects and ${askedV.donors} donors. Main projects: ${top || "—"}.`);
  }
  if (has(q, "vertical", "paraguas", "area", "distribu", "reparto", "split", "por ")) {
    const list = vs.map((v) => `${vName(v)} ${pct(v.amount, total)}%`).join(", ");
    return t(`Por vertical: ${list}. ${vName(vs[0])} lidera con ${money0(vs[0].amount, lang)}, casi todo por el convenio Tandayapa-LCAOF.`, `By vertical: ${list}. ${vName(vs[0])} leads with ${money0(vs[0].amount, lang)}, almost all of it from the Tandayapa-LCAOF agreement.`);
  }
  if (has(q, "donante", "donor", "quien", "who", "empresa", "compan", "persona", "individual", "fundac", "foundation")) {
    const top = NEXT.topDonors.slice(0, 5).map((d) => `${d.name} (${money0(d.amount, lang)})`).join(", ");
    const org = NEXT.categories.find((c) => c.name.startsWith("Empresas")), per = NEXT.categories.find((c) => c.name === "Personas");
    return t(`${NEXT.donorCount} donantes: ${org?.donors} empresas y organizaciones aportan ${money0(org?.amount ?? 0, lang)} (${pct(org?.amount ?? 0, total)}%) y ${per?.donors} personas ${money0(per?.amount ?? 0, lang)}. Los mayores: ${top}.`, `${NEXT.donorCount} donors: ${org?.donors} organisations give ${money0(org?.amount ?? 0, lang)} (${pct(org?.amount ?? 0, total)}%) and ${per?.donors} individuals ${money0(per?.amount ?? 0, lang)}. The largest: ${top}.`);
  }
  if (has(q, "mes", "month", "mejor", "best", "peor", "worst", "tendencia", "trend", "cuando", "when", "pico", "peak")) {
    const ms = [...NEXT.months];
    const best = ms.reduce((a, b) => (b.v > a.v ? b : a)), worst = ms.reduce((a, b) => (b.v < a.v ? b : a));
    const y = (yy: number) => ms.filter((m) => m.y === yy).reduce((a, m) => a + m.v, 0);
    return t(`El mejor mes fue ${monthLabel(best, lang)} con ${money0(best.v, lang)} (Tandayapa) y el más bajo ${monthLabel(worst, lang)} con ${money0(worst.v, lang)}. Por año: 2024 (sep–dic) ${money0(y(2024), lang)}, 2025 ${money0(y(2025), lang)}, 2026 (ene–ago) ${money0(y(2026), lang)}. Las entradas grandes llegan en picos; el flujo base ronda los ${money0(20000, lang)}–${money0(40000, lang)} al mes.`, `The best month was ${monthLabel(best, lang)} with ${money0(best.v, lang)} (Tandayapa) and the lowest ${monthLabel(worst, lang)} with ${money0(worst.v, lang)}. By year: 2024 (Sep–Dec) ${money0(y(2024), lang)}, 2025 ${money0(y(2025), lang)}, 2026 (Jan–Aug) ${money0(y(2026), lang)}. Large gifts arrive in spikes; the base flow is around ${money0(20000, lang)}–${money0(40000, lang)} a month.`);
  }
  if (has(q, "vinculac", "engagement", "proyecto", "project", "potencial", "potential", "cumbaya", "tiputini", "tandayapa", "galapagos", "rural")) {
    const o = NEXT.outreach;
    const named = o.find((p) => q.includes(norm(p.name).slice(0, 12)));
    if (named) return t(`${named.name}: ${named.where}, lidera ${named.lead}. Estado ${named.status.toLowerCase()}, financiamiento ${named.funding.toLowerCase()}, impacto ${named.impact.toLowerCase()}, atractivo para donantes ${named.appeal.toLowerCase()}.`, `${named.name}: ${named.where}, led by ${named.lead}. Status ${named.status.toLowerCase()}, funding ${named.funding.toLowerCase()}, impact ${named.impact.toLowerCase()}, donor appeal ${named.appeal.toLowerCase()}.`);
    const where = ["cumbaya", "tiputini", "tandayapa", "galapagos", "rural"].find((w) => q.includes(w));
    const sub = where ? o.filter((p) => norm(p.where).includes(where)) : o;
    const high = sub.filter((p) => p.impact === "Alto" && p.appeal === "Alto");
    const grants = sub.filter((p) => p.funding.startsWith("Grants")).length;
    return t(`${sub.length} proyectos de vinculación${where ? ` en ${where}` : ""}, ${high.length} con impacto y atractivo altos; ${grants} con Grants USFQ y ${sub.length - grants} autofinanciados o sin fondos (los primeros candidatos para donantes). Ejemplos: ${high.slice(0, 3).map((p) => p.name).join("; ")}.`, `${sub.length} engagement projects${where ? ` in ${where}` : ""}, ${high.length} with high impact and appeal; ${grants} on USFQ grants and ${sub.length - grants} self-funded or unfunded (the first candidates for donors). Examples: ${high.slice(0, 3).map((p) => p.name).join("; ")}.`);
  }
  // a specific project or donor by name
  const words = q.split(/[^a-z0-9]+/).filter((w) => w.length > 3);
  const score = (name: string) => words.filter((w) => norm(name).includes(w)).length;
  const bestP = NEXT.projects.map((p, i) => ({ p, i, sc: score(p.name) })).filter((x) => x.sc >= Math.min(2, words.length) && x.sc > 0).sort((a, b) => b.sc - a.sc)[0];
  const bestD = NEXT.donors.map((d, i) => ({ d, i, sc: score(d.name) })).filter((x) => x.sc >= Math.min(2, words.length) && x.sc > 0).sort((a, b) => b.sc - a.sc)[0];
  if (bestP && (!bestD || bestP.sc >= bestD.sc)) {
    const p = bestP.p;
    const top = p.donors.slice(0, 3).map((d) => `${NEXT.donors[d.d].name} (${money0(d.amount, lang)})`).join(", ");
    return t(`${p.name} (${p.area}, ${vshort(p.vertical, lang)}): ${money0(p.amount, lang)} en ${p.movements} movimientos de ${p.donors.length} donante${p.donors.length === 1 ? "" : "s"}, entre ${ymLabel(p.first, lang)} y ${ymLabel(p.last, lang)}. Principales: ${top}. La ejecución del gasto es simulada en el tablero: los archivos solo traen ingresos.`, `${p.name} (${p.area}, ${vshort(p.vertical, lang)}): ${money0(p.amount, lang)} across ${p.movements} movements from ${p.donors.length} donor${p.donors.length === 1 ? "" : "s"}, between ${ymLabel(p.first, lang)} and ${ymLabel(p.last, lang)}. Main: ${top}. Spending in the dashboard is simulated: the files only carry inflows.`);
  }
  if (bestD) {
    const d = bestD.d;
    const ps = d.projects.map((x) => `${NEXT.projects[x.p].name} (${money0(x.amount, lang)})`).join(", ");
    return t(`${d.name} (${d.category === "Personas" ? "persona" : "organización"}): ${money0(d.amount, lang)} en ${d.movements} movimientos, entre ${ymLabel(d.first, lang)} y ${ymLabel(d.last, lang)}. Destino: ${ps}.`, `${d.name} (${d.category === "Personas" ? "individual" : "organisation"}): ${money0(d.amount, lang)} across ${d.movements} movements, between ${ymLabel(d.first, lang)} and ${ymLabel(d.last, lang)}. Destination: ${ps}.`);
  }
  // total / summary
  const biggest = NEXT.topProjects[0];
  return t(`Recaudado 2024–2026: ${money0(total, lang)} de ${NEXT.donorCount} donantes en ${NEXT.movementCount} movimientos. ${vName(vs[0])} concentra el ${pct(vs[0].amount, total)}% y el mayor proyecto es ${biggest.name} (${money0(biggest.amount, lang)}). Puedo detallar por vertical, donantes, meses o proyectos de vinculación.`, `Raised 2024–2026: ${money0(total, lang)} from ${NEXT.donorCount} donors in ${NEXT.movementCount} movements. ${vName(vs[0])} holds ${pct(vs[0].amount, total)}% and the largest project is ${biggest.name} (${money0(biggest.amount, lang)}). I can break it down by vertical, donors, months or engagement projects.`);
}

/* ---------------------------------------------------------------- chat ---- */
function NextChat({ lang, analyst }: { lang: Lang; analyst: string }) {
  const t = tx(lang);
  const bot = botById(lang, analyst);
  const [msgs, setMsgs] = React.useState<{ from: "bot" | "user"; text: string }[]>([]);
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
    const reply = answerNext(q, lang);
    timers.current.push(window.setTimeout(() => setMood("typing"), 500));
    timers.current.push(
      window.setTimeout(() => {
        setMsgs((m) => [...m, { from: "bot", text: reply }]);
        setMood("talking");
        timers.current.push(window.setTimeout(() => setMood("idle"), 1500));
      }, 900 + Math.min(1400, reply.length * 5))
    );
  };
  const quick = [t("¿Cuánto hemos recaudado?", "How much have we raised?"), t("¿Cómo se reparte por vertical?", "How is it split by vertical?"), t("¿Quiénes son los mayores donantes?", "Who are the biggest donors?"), t("¿Cuál fue el mejor mes?", "Which was the best month?"), t("¿Qué pasa con el convenio Tandayapa?", "What about the Tandayapa agreement?")];
  const caption = mood === "thinking" ? t("revisando los datos…", "checking the numbers…") : mood === "typing" ? t("escribiendo…", "typing…") : t("pregúntale sobre donaciones, donantes y proyectos", "ask about donations, donors and projects");
  return (
    <div className={s.dashChat}>
      <div className={s.chatFace}>
        {bot && <AgentFace id={bot.id} look={bot.look} mood={mood} size={40} />}
        <span>
          <b>{t("Pregúntale a", "Ask")} {bot?.name ?? "USFQ NEXT"}</b> · {caption}
        </span>
      </div>
      <div className={`${s.messages} ${s.dashMessages}`} ref={listRef} hidden={msgs.length === 0 && !busy}>
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
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("Pregunta sobre USFQ NEXT…", "Ask about USFQ NEXT…")} aria-label={t("Pregunta", "Question")} />
        <button className={s.send} type="submit" disabled={!input.trim() || busy} aria-label={t("Enviar", "Send")}>
          ➜
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------- pieces ---- */
type Metric = "v" | "n" | "d";
type Sel = number | "all";

function VerticalTiles({ lang, sel, onSel }: { lang: Lang; sel: Sel; onSel: (v: Sel) => void }) {
  const t = tx(lang);
  const vs = sortedVerticals();
  return (
    <div className={s.nxVerts} role="tablist">
      <button type="button" role="tab" aria-selected={sel === "all"} className={`${s.nxVert} ${sel === "all" ? s.nxVertOn : ""}`} onClick={() => onSel("all")} style={{ ["--vc" as string]: "#0e0d12" }}>
        <span className={s.nxVertName}>{t("Todas las verticales", "All verticals")}</span>
        <b>{money0(NEXT.total, lang)}</b>
        <small>{NEXT.projectCount} {t("proyectos", "projects")} · {NEXT.donorCount} {t("donantes", "donors")}</small>
        <i style={{ width: "100%" }} />
      </button>
      {vs.map((v) => (
        <button key={v.name} type="button" role="tab" aria-selected={sel === v.idx} className={`${s.nxVert} ${sel === v.idx ? s.nxVertOn : ""}`} onClick={() => onSel(sel === v.idx ? "all" : v.idx)} style={{ ["--vc" as string]: v.color }}>
          <span className={s.nxVertName}>{VSHORT[v.name]?.[lang] ?? v.name}</span>
          <b>{money0(v.amount, lang)}</b>
          <small>{v.projects.length} {t("proy.", "proj.")} · {v.donors} {t("donantes", "donors")} · {pct(v.amount, NEXT.total)}%</small>
          <i style={{ width: `${Math.max(2, (v.amount / vs[0].amount) * 100)}%` }} />
        </button>
      ))}
    </div>
  );
}

function MonthlyChart({ lang, height = 190, sel = "all", metric = "v" }: { lang: Lang; height?: number; sel?: Sel; metric?: Metric }) {
  const ms = sel === "all" ? NEXT.months : NEXT.verticals[sel].months;
  const name = metric === "v" ? (lang === "es" ? "Recaudado" : "Raised") : metric === "n" ? (lang === "es" ? "Donaciones" : "Gifts") : lang === "es" ? "Donantes" : "Donors";
  const data = ms.map((m) => (metric === "v" ? m.v : metric === "n" ? m.n ?? 0 : m.d ?? 0));
  const color = sel === "all" ? "#e11b22" : VCOLORS[sel];
  return <LineChart series={[{ name, color, data }]} labels={ms.map((m) => monthLabel(m, lang))} every={3} height={height} yFormat={(v) => (metric === "v" ? (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`) : String(Math.round(v)))} lang={lang} />;
}

function Share({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <span className={s.nxShare}>
      <i style={{ width: `${Math.max(1.5, (value / max) * 100)}%`, background: color }} />
    </span>
  );
}

/** One project: where the money came from, when, and a simulated execution against it. */
function ProjectDetail({ idx, lang, onClose, onDonor }: { idx: number; lang: Lang; onClose: () => void; onDonor: (d: number) => void }) {
  const t = tx(lang);
  const p = NEXT.projects[idx];
  const color = VCOLORS[p.vertical];
  const spend = simulatedSpend(p, idx);
  const spent = spend.reduce((a, b) => a + b, 0);
  const inflow = NEXT.months.map((m) => p.months.find((x) => x.y === m.y && x.m === m.m)?.v ?? 0);
  const from = ymIndex(p.first), to = Math.min(NEXT.months.length - 1, ymIndex(p.last) + 4);
  const groups = NEXT.months.slice(from, to + 1).map((m, k) => ({ label: monthLabel(m, lang), values: [inflow[from + k], spend[from + k]] }));
  const active = p.last >= 202605;
  const orgs = p.donors.filter((d) => NEXT.donors[d.d].category !== "Personas").length;
  const outreach = NEXT.outreach.filter((o) => o.vertical === p.vertical && o.potential).slice(0, 3);
  return (
    <ChartCard
      title={p.name}
      sub={`${p.area} · ${p.college} · ${vshort(p.vertical, lang)}`}
      right={
        <button type="button" className={s.nxClose} onClick={onClose} aria-label={t("Cerrar", "Close")}>
          ×
        </button>
      }
    >
      <div className={s.nxDetail}>
        <div className={s.nxDetailKpis}>
          <div className={s.nxKpi}><b>{money0(p.amount, lang)}</b><span>{t("recaudado", "raised")} · {p.movements} {t("movimientos", "movements")}</span></div>
          <div className={s.nxKpi}><b>{p.donors.length}</b><span>{t("donantes", "donors")} · {orgs} {t("organizaciones", "organisations")}, {p.donors.length - orgs} {t("personas", "individuals")}</span></div>
          <div className={s.nxKpi}><b>{ymLabel(p.first, lang)} → {ymLabel(p.last, lang)}</b><span>{t("primer y último ingreso", "first and last inflow")} · {monthsBetween(p.first, p.last)} {t("meses", "months")} · {active ? t("activo", "active") : t("sin ingresos desde entonces", "no inflows since")}</span></div>
          <div className={`${s.nxKpi} ${s.nxKpiSim}`}><b>{money0(spent, lang)}</b><span>{t("ejecutado · simulado", "spent · simulated")} ({Math.round(execRatio(idx) * 100)}%) · {t("saldo", "balance")} {money0(p.amount - spent, lang)}</span></div>
        </div>
        <div className={s.nxDetailGrid}>
          <div>
            <div className={s.nxSubTitle}>{t("Cuándo entra y cuándo se invierte", "When money comes in and when it is spent")} <em>{t("· gasto simulado, los archivos solo traen ingresos", "· spending simulated, the files only carry inflows")}</em></div>
            <BarChart groups={groups} colors={[color, "#c9ccd3"]} stacked={false} height={170} every={groups.length > 14 ? 2 : 1} yFormat={(v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`)} lang={lang} />
            <div className={s.legend}><span><i style={{ background: color }} />{t("ingresos", "inflows")}</span><span><i style={{ background: "#c9ccd3" }} />{t("ejecución simulada", "simulated spend")}</span></div>
          </div>
          <div>
            <div className={s.nxSubTitle}>{t("Donantes de este proyecto", "This project's donors")}</div>
            <table className={`${s.tbl} ${s.nxTbl}`}>
              <tbody>
                {p.donors.slice(0, 8).map((d) => (
                  <tr key={d.d} className={s.rowBtn} onClick={() => onDonor(d.d)}>
                    <td title={NEXT.donors[d.d].name}>
                      <span className={s.nxCell}>{NEXT.donors[d.d].name}</span>
                      <Share value={d.amount} max={p.donors[0].amount} color={color} />
                    </td>
                    <td className={s.num}>{money0(d.amount, lang)}<small style={{ display: "block", color: "#6b7280" }}>{pct(d.amount, p.amount)}%</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {p.donors.length > 8 && <div className={s.nxMore}>+{p.donors.length - 8} {t("donantes más", "more donors")}</div>}
            {outreach.length > 0 && (
              <>
                <div className={s.nxSubTitle} style={{ marginTop: 10 }}>{t("Vinculación afín con potencial de donación", "Related engagement projects with donation potential")}</div>
                <ul className={s.mgList}>{outreach.map((o) => <li key={o.id}><b>{o.name}</b> · {o.lead} · {o.funding.startsWith("Grants") ? "Grants USFQ" : t("sin fondos", "unfunded")}</li>)}</ul>
              </>
            )}
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

/** One donor: what they fund, in which verticals, and when. */
function DonorDetail({ idx, lang, onClose, onProject }: { idx: number; lang: Lang; onClose: () => void; onProject: (p: number) => void }) {
  const t = tx(lang);
  const d = NEXT.donors[idx];
  const verts = [...new Set(d.projects.map((x) => NEXT.projects[x.p].vertical))];
  return (
    <ChartCard
      title={d.name}
      sub={`${d.category === "Personas" ? t("Persona", "Individual") : t("Organización", "Organisation")} · ${money0(d.amount, lang)} · ${ymLabel(d.first, lang)} → ${ymLabel(d.last, lang)}`}
      right={
        <button type="button" className={s.nxClose} onClick={onClose} aria-label={t("Cerrar", "Close")}>
          ×
        </button>
      }
    >
      <div className={s.nxDetail}>
        <div className={s.nxDetailKpis}>
          <div className={s.nxKpi}><b>{money0(d.amount, lang)}</b><span>{t("donado", "given")} · {d.movements} {t("movimientos", "movements")}</span></div>
          <div className={s.nxKpi}><b>{d.projects.length}</b><span>{t("proyectos financiados", "projects funded")}</span></div>
          <div className={s.nxKpi}><b>{verts.map((v) => vshort(v, lang)).join(" · ")}</b><span>{t("verticales", "verticals")}</span></div>
          <div className={s.nxKpi}><b>{pct(d.amount, NEXT.total)}%</b><span>{t("del total recaudado", "of everything raised")}</span></div>
        </div>
        <table className={`${s.tbl} ${s.nxTbl}`}>
          <thead><tr><th>{t("Proyecto", "Project")}</th><th>{t("Vertical", "Vertical")}</th><th className={s.num}>{t("Monto", "Amount")}</th></tr></thead>
          <tbody>
            {d.projects.map((x) => (
              <tr key={x.p} className={s.rowBtn} onClick={() => onProject(x.p)}>
                <td title={NEXT.projects[x.p].name}><span className={s.nxCell}>{NEXT.projects[x.p].name}</span><small>{NEXT.projects[x.p].area}</small></td>
                <td><small><i style={{ background: VCOLORS[NEXT.projects[x.p].vertical] }} />{vshort(NEXT.projects[x.p].vertical, lang)}</small></td>
                <td className={s.num}>{money0(x.amount, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

/** The hotspot panel: KPIs, the analyst, verticals → projects → donors, months, outreach. */
export function NextPanel({ lang, analyst = "andrade" }: { lang: Lang; analyst?: string }) {
  const t = tx(lang);
  const [sel, setSel] = React.useState<Sel>("all");
  const [metric, setMetric] = React.useState<Metric>("v");
  const [openP, setOpenP] = React.useState<number | null>(null);
  const [openD, setOpenD] = React.useState<number | null>(null);
  const [where, setWhere] = React.useState<string>("all");
  const [list, setList] = React.useState<"projects" | "donors">("projects");
  const [query, setQuery] = React.useState("");
  const detailRef = React.useRef<HTMLDivElement>(null);
  const showP = (i: number) => { setOpenD(null); setOpenP(i); };
  const showD = (i: number) => { setOpenP(null); setOpenD(i); };
  React.useEffect(() => {
    // the narrow panel shows the detail on its own: start at its top; side by side it is already in view
    const el = detailRef.current;
    if (!el || (openP === null && openD === null)) return;
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.6) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [openP, openD]);

  const projects = NEXT.projects.map((p, i) => ({ ...p, i })).filter((p) => sel === "all" || p.vertical === sel);
  const donorIds = new Set(projects.flatMap((p) => p.donors.map((d) => d.d)));
  const donors = NEXT.donors.map((d, i) => ({ ...d, i, inSel: sel === "all" ? d.amount : d.projects.filter((x) => NEXT.projects[x.p].vertical === sel).reduce((a, x) => a + x.amount, 0) })).filter((d) => donorIds.has(d.i)).sort((a, b) => b.inSel - a.inSel);
  const q = norm(query.trim());
  const matchP = (p: (typeof projects)[number]) => !q || norm(p.name + " " + p.area + " " + p.donors.map((d) => NEXT.donors[d.d].name).join(" ")).includes(q);
  const matchD = (d: (typeof donors)[number]) => !q || norm(d.name + " " + d.projects.map((x) => NEXT.projects[x.p].name).join(" ")).includes(q);
  const shownP = projects.filter(matchP), shownD = donors.filter(matchD);
  // side by side, the detail always shows something: the first project of the selection
  const effP = openP ?? (openD === null ? shownP[0]?.i ?? null : null);
  const total = sel === "all" ? NEXT.total : NEXT.verticals[sel].amount;
  const orgAmt = donors.filter((d) => d.category !== "Personas").reduce((a, d) => a + d.inSel, 0);
  const perAmt = donors.filter((d) => d.category === "Personas").reduce((a, d) => a + d.inSel, 0);
  const perCount = donors.filter((d) => d.category === "Personas").length;
  const outreach = NEXT.outreach.filter((p) => (sel === "all" || p.vertical === sel) && (where === "all" || norm(p.where).includes(where)));
  const high = outreach.filter((p) => p.impact === "Alto" && p.appeal === "Alto").length;
  const selName = sel === "all" ? t("todas las verticales", "all verticals") : vshort(sel, lang);
  const selColor = sel === "all" ? "#e11b22" : VCOLORS[sel];
  const places = [["all", t("Todos", "All")], ["cumbaya", "Cumbayá"], ["tiputini", "Tiputini"], ["tandayapa", "Tandayapa"], ["galapagos", "Galápagos"], ["rural", t("Rurales", "Rural")]] as const;
  const badge = (v: string) => <span className={`${s.tag} ${v === "Alto" ? s.tagOk : v === "Medio" ? s.tagWarn : ""}`}>{v}</span>;
  return (
    <div className={s.nx}>
      <div className={`${s.nx12} ${s.nxKpis}`}>
        <div className={s.nxKpi}><b>{money0(total, lang)}</b><span>{t("recaudado · sep 2024 – ago 2026", "raised · Sep 2024 – Aug 2026")}{sel !== "all" ? ` · ${pct(total, NEXT.total)}%` : ""}</span></div>
        <div className={s.nxKpi}><b>{donors.length}</b><span>{t("donantes", "donors")} · {donors.length - perCount} {t("organizaciones", "organisations")}, {perCount} {t("personas", "individuals")}</span></div>
        <div className={s.nxKpi}><b>{projects.length}</b><span>{t("proyectos que reciben fondos", "projects receiving funds")} · {pct(orgAmt, total)}% {t("de organizaciones", "from organisations")}</span></div>
        <div className={s.nxKpi}><b>{outreach.length}</b><span>{t("proyectos de vinculación con potencial", "engagement projects with potential")} · {high} {t("de impacto alto", "high impact")}</span></div>
      </div>

      <div className={`${s.nx12} ${s.nxAsk}`}>
        <NextChat lang={lang} analyst={analyst} />
      </div>

      <div className={s.nx12}>
        <VerticalTiles lang={lang} sel={sel} onSel={(v) => { setSel(v); setOpenP(null); setOpenD(null); }} />
      </div>

      <div className={s.nx7}>
        <ChartCard
          title={t(`Por mes · ${selName}`, `By month · ${selName}`)}
          sub={t("los picos son convenios y fondos grandes", "spikes are agreements and large funds")}
          right={
            <div className={s.range} role="tablist">
              {([["v", t("Monto", "Amount")], ["n", t("Donaciones", "Gifts")], ["d", t("Donantes", "Donors")]] as [Metric, string][]).map(([k, l]) => (
                <button key={k} type="button" role="tab" aria-selected={metric === k} className={metric === k ? s.on : ""} onClick={() => setMetric(k)}>{l}</button>
              ))}
            </div>
          }
        >
          <MonthlyChart lang={lang} height={176} sel={sel} metric={metric} />
        </ChartCard>
      </div>
      <div className={s.nx5}>
        <ChartCard title={t("Tipo de donante", "Donor type")} sub={t(`monto neto · ${selName}`, `net amount · ${selName}`)}>
          <div className={s.nxDonut}>
            <Donut parts={[{ label: t("Organizaciones", "Organisations"), value: orgAmt, color: selColor }, { label: t("Personas", "Individuals"), value: perAmt, color: "#2a2d3a" }]} size={104} format={(v) => money0(v, lang)} centerLabel={total >= 1e6 ? `$${(total / 1e6).toFixed(2)}M` : `$${Math.round(total / 1000)}k`} lang={lang} />
            <div className={s.nxDonutNote}>{t("Donación media por persona", "Average gift per individual")}: <b>{money0(perAmt / Math.max(1, perCount), lang)}</b></div>
          </div>
        </ChartCard>
      </div>

      {/* explorer: list on the left, detail pinned on the right (the narrow panel shows one at a time) */}
      <div className={`${s.nx12} ${s.nxExplorer}`}>
        <div className={`${s.chartCard} ${s.nxListCard}`}>
          <div className={s.nxListHead}>
            <div className={s.range} role="tablist">
              <button type="button" role="tab" aria-selected={list === "projects"} className={list === "projects" ? s.on : ""} onClick={() => setList("projects")}>{t("Proyectos", "Projects")} {shownP.length}</button>
              <button type="button" role="tab" aria-selected={list === "donors"} className={list === "donors" ? s.on : ""} onClick={() => setList("donors")}>{t("Donantes", "Donors")} {shownD.length}</button>
            </div>
            <input className={s.nxSearch} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Buscar proyecto o donante…", "Search project or donor…")} aria-label={t("Buscar", "Search")} />
          </div>
          <div className={s.nxList}>
            {list === "projects" ? (
              <table className={`${s.tbl} ${s.nxTbl} ${s.nxProjects}`}>
                <thead><tr><th>{t("Proyecto", "Project")}</th><th className={s.num}>{t("Don.", "Don.")}</th><th>{t("Período", "Period")}</th><th className={s.num}>{t("Recaudado", "Raised")}</th></tr></thead>
                <tbody>
                  {shownP.map((p) => (
                    <tr key={p.i} className={`${s.rowBtn} ${effP === p.i && openD === null ? s.rowOn : ""}`} onClick={() => showP(p.i)}>
                      <td title={`${p.name} · ${p.area}`}>
                        <span className={s.nxCell}>{p.name}</span>
                        <small><i style={{ background: VCOLORS[p.vertical] }} />{vshort(p.vertical, lang)}{p.area !== p.name ? ` · ${p.area}` : ""}</small>
                      </td>
                      <td className={s.num}>{p.donors.length}</td>
                      <td><small>{ymLabel(p.first, lang)}{p.first !== p.last ? ` → ${ymLabel(p.last, lang)}` : ""}</small></td>
                      <td className={s.num}>{money0(p.amount, lang)}<Share value={p.amount} max={projects[0].amount} color={VCOLORS[p.vertical]} /></td>
                    </tr>
                  ))}
                  {shownP.length === 0 && <tr><td colSpan={4}><small>{t("Sin resultados", "No results")}</small></td></tr>}
                </tbody>
              </table>
            ) : (
              <table className={`${s.tbl} ${s.nxTbl}`}>
                <thead><tr><th>{t("Donante", "Donor")}</th><th className={s.num}>{t("Monto", "Amount")}</th></tr></thead>
                <tbody>
                  {shownD.map((d) => (
                    <tr key={d.i} className={`${s.rowBtn} ${openD === d.i ? s.rowOn : ""}`} onClick={() => showD(d.i)}>
                      <td title={d.name}>
                        <span className={s.nxCell}>{d.name}</span>
                        <small>{d.category === "Personas" ? t("Persona", "Individual") : t("Organización", "Organisation")} · {d.projects.filter((x) => sel === "all" || NEXT.projects[x.p].vertical === sel).length} {t("proy.", "proj.")} · {ymLabel(d.first, lang)}{d.first !== d.last ? ` → ${ymLabel(d.last, lang)}` : ""}</small>
                      </td>
                      <td className={s.num}>{money0(d.inSel, lang)}</td>
                    </tr>
                  ))}
                  {shownD.length === 0 && <tr><td colSpan={2}><small>{t("Sin resultados", "No results")}</small></td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className={`${s.nxDetailCol} ${openP !== null || openD !== null ? s.nxDetailOpen : ""}`} ref={detailRef}>
          {openD !== null ? (
            <DonorDetail idx={openD} lang={lang} onClose={() => setOpenD(null)} onProject={showP} />
          ) : effP !== null ? (
            <ProjectDetail idx={effP} lang={lang} onClose={() => setOpenP(null)} onDonor={showD} />
          ) : null}
        </div>
      </div>

      <div className={s.nx12}>
        <ChartCard
          title={t(`Proyectos de vinculación 2026 · ${selName}`, `2026 engagement projects · ${selName}`)}
          sub={t(`${outreach.length} candidatos para donantes`, `${outreach.length} candidates for donors`)}
          right={
            <div className={s.range} role="tablist">
              {places.map(([k, label]) => (
                <button key={k} type="button" role="tab" aria-selected={where === k} className={where === k ? s.on : ""} onClick={() => setWhere(k)}>{label}</button>
              ))}
            </div>
          }
        >
          <div className={s.nxScroll}>
            <table className={`${s.tbl} ${s.nxTbl}`}>
              <thead><tr><th>{t("Proyecto", "Project")}</th><th>{t("Vertical", "Vertical")}</th><th>{t("Sede", "Site")}</th><th>{t("Fondos", "Funding")}</th><th>{t("Impacto", "Impact")}</th></tr></thead>
              <tbody>
                {outreach.map((p) => (
                  <tr key={p.id}>
                    <td title={p.name}><span className={s.nxCell}>{p.name}</span><small>{p.lead}</small></td>
                    <td><small><i style={{ background: VCOLORS[p.vertical] }} />{vshort(p.vertical, lang)}</small></td>
                    <td>{p.where.replace("Participación abierta en cualquiera de los proyectos Vecinos", t("Abierto", "Open")).replace("No; sin embargo, se desarrolla en zonas rurales", t("Rural", "Rural")).replace("Vecinos ", "")}</td>
                    <td>{p.funding.startsWith("Grants") ? "Grants USFQ" : t("Sin fondos", "Unfunded")}</td>
                    <td>{badge(p.impact)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
      <div className={`${s.nx12} ${s.nxSource}`}>{t("Fuente: ", "Source: ")}{NEXT.generatedFrom}. {t("La ejecución por proyecto es simulada (los archivos no traen egresos); la vertical de cada destino se asigna por palabras clave.", "Per-project spending is simulated (the files carry no outflows); each destination's vertical is assigned by keyword.")}</div>
    </div>
  );
}

/** The agent's live screen: the dashboard inside the desktop frame (1000 px canvas). */
export function NextScreen({ lang }: { lang: Lang }) {
  const t = tx(lang);
  const vs = sortedVerticals();
  return (
    <div style={{ padding: 18, background: "#f6f7f9", height: "100%", fontFamily: "inherit", color: "#1a1a22" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/usfq/usfq-logo.svg" alt="USFQ" width={76} height={24} />
        <b style={{ fontSize: 15 }}>USFQ NEXT · {t("Tablero de donaciones", "Donations dashboard")}</b>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#6b7280" }}>sep 2024 – ago 2026</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 }}>
        {[[money0(NEXT.total, lang), t("recaudado", "raised")], [String(NEXT.donorCount), t("donantes", "donors")], [String(NEXT.outreach.length), t("proyectos con potencial", "projects with potential")]].map(([v, l]) => (
          <div key={l} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{v}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{t("Por vertical", "By vertical")}</div>
          {vs.map((v) => (
            <div key={v.name} style={{ display: "grid", gridTemplateColumns: "150px 1fr 70px", alignItems: "center", gap: 8, fontSize: 11, marginBottom: 6 }}>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{VSHORT[v.name]?.[lang]}</span>
              <span style={{ height: 8, borderRadius: 4, background: "#eef0f3", overflow: "hidden" }}>
                <i style={{ display: "block", height: "100%", width: `${(v.amount / vs[0].amount) * 100}%`, background: v.color }} />
              </span>
              <b style={{ textAlign: "right" }}>{money0(v.amount, lang)}</b>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{t("Donaciones por mes", "Donations by month")}</div>
          <MonthlyChart lang={lang} height={150} />
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1px solid #e5e7eb", marginTop: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{t("Mayores donantes", "Top donors")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {NEXT.topDonors.slice(0, 5).map((d) => (
            <div key={d.name} style={{ fontSize: 11 }}>
              <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={d.name}>{d.name}</div>
              <div style={{ color: "#6b7280" }}>{money0(d.amount, lang)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
