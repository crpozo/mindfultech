"use client";

import * as React from "react";
import { NEXT } from "@/lib/office/usfqNext";
import { botById } from "@/lib/office/bots";
import { tx, LOCALE, type Lang } from "@/lib/office/i18n";
import { AgentFace, type FaceMood } from "./AgentFace";
import { LineChart, Donut, ChartCard, fmtMoney, fmtInt } from "./charts";
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
    const top = NEXT.topProjects.filter((p) => p.vertical === askedV.idx).slice(0, 3).map((p) => `${p.name} (${money0(p.amount, lang)})`).join(", ");
    return t(`${vName(askedV)}: ${money0(askedV.amount, lang)}, el ${pct(askedV.amount, total)}% del total en ${askedV.movements} movimientos. Proyectos principales: ${top || "—"}.`, `${vName(askedV)}: ${money0(askedV.amount, lang)}, ${pct(askedV.amount, total)}% of the total across ${askedV.movements} movements. Main projects: ${top || "—"}.`);
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
  const quick = [t("¿Cuánto hemos recaudado?", "How much have we raised?"), t("¿Cómo se reparte por vertical?", "How is it split by vertical?"), t("¿Quiénes son los mayores donantes?", "Who are the biggest donors?"), t("¿Cuál fue el mejor mes?", "Which was the best month?"), t("¿Qué proyectos de vinculación tienen potencial?", "Which engagement projects have potential?")];
  const caption = mood === "thinking" ? t("revisando los datos…", "checking the numbers…") : mood === "typing" ? t("escribiendo…", "typing…") : t("pregúntale sobre donaciones, donantes y proyectos", "ask about donations, donors and projects");
  return (
    <div className={s.dashChat}>
      <div className={s.chatFace}>
        {bot && <AgentFace id={bot.id} look={bot.look} mood={mood} size={44} />}
        <span>
          <b>{bot?.name ?? "USFQ NEXT"}</b> · USFQ NEXT · {caption}
        </span>
      </div>
      <div className={`${s.messages} ${s.dashMessages}`} ref={listRef}>
        {msgs.length === 0 && <div className={s.dashHint}>{t("Respondo con los datos consolidados de donaciones 2024–2026 y el reporte de proyectos de vinculación.", "I answer from the consolidated 2024–2026 donation data and the engagement projects report.")}</div>}
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
function VerticalBars({ lang }: { lang: Lang }) {
  const vs = sortedVerticals();
  const max = vs[0].amount;
  return (
    <div className={s.bars2}>
      {vs.map((v) => (
        <div key={v.name} className={s.bar2} style={{ cursor: "default" }} title={`${v.movements} ${lang === "es" ? "movimientos" : "movements"}`}>
          <span style={{ width: 150, fontSize: 12, color: "#3b3f4a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{VSHORT[v.name]?.[lang] ?? v.name}</span>
          <i style={{ width: `${(v.amount / max) * 100}%`, background: v.color }} />
          <b style={{ minWidth: 70, textAlign: "right" }}>{money0(v.amount, lang)}</b>
        </div>
      ))}
    </div>
  );
}

function MonthlyChart({ lang, height = 190 }: { lang: Lang; height?: number }) {
  const ms = NEXT.months;
  return <LineChart series={[{ name: lang === "es" ? "Donaciones" : "Donations", color: "#e11b22", data: ms.map((m) => m.v) }]} labels={ms.map((m) => monthLabel(m, lang))} every={3} height={height} yFormat={(v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`)} lang={lang} />;
}

/** The hotspot panel: KPIs, verticals, months, donors, projects, outreach and the analyst chat. */
export function NextPanel({ lang, analyst = "andrade" }: { lang: Lang; analyst?: string }) {
  const t = tx(lang);
  const vs = sortedVerticals();
  const org = NEXT.categories.find((c) => c.name.startsWith("Empresas")), per = NEXT.categories.find((c) => c.name === "Personas");
  const [where, setWhere] = React.useState<string>("all");
  const places = [
    ["all", t("Todos", "All")],
    ["cumbaya", "Cumbayá"],
    ["tiputini", "Tiputini"],
    ["tandayapa", "Tandayapa"],
    ["galapagos", "Galápagos"],
    ["rural", t("Zonas rurales", "Rural areas")],
  ] as const;
  const outreach = NEXT.outreach.filter((p) => where === "all" || norm(p.where).includes(where));
  const high = NEXT.outreach.filter((p) => p.impact === "Alto" && p.appeal === "Alto").length;
  const badge = (v: string) => <span className={`${s.tag} ${v === "Alto" ? s.tagOk : v === "Medio" ? s.tagWarn : ""}`}>{v}</span>;
  return (
    <div className={s.dash}>
      <ChartCard title={t("Pregúntale a USFQ NEXT", "Ask USFQ NEXT")} sub={t("Alejandro responde con los datos del tablero", "Alejandro answers from the dashboard's data")}>
        <NextChat lang={lang} analyst={analyst} />
      </ChartCard>

      <div className={s.kpis}>
        <div className={s.kpi}>
          <b>{money0(NEXT.total, lang)}</b>
          <span>{t("recaudado · sep 2024 – ago 2026", "raised · Sep 2024 – Aug 2026")}</span>
        </div>
        <div className={s.kpi}>
          <b>{NEXT.donorCount}</b>
          <span>{t("donantes", "donors")} · {org?.donors} {t("organizaciones", "organisations")} · {per?.donors} {t("personas", "individuals")}</span>
        </div>
        <div className={s.kpi}>
          <b>{NEXT.outreach.length}</b>
          <span>{t("proyectos de vinculación con potencial", "engagement projects with potential")} · {high} {t("de impacto alto", "high impact")}</span>
        </div>
      </div>

      <div className={s.dashGrid}>
        <ChartCard title={t("Por vertical", "By vertical")} sub={t("las seis verticales de donación de USFQ NEXT", "USFQ NEXT's six giving verticals")}>
          <VerticalBars lang={lang} />
        </ChartCard>
        <ChartCard title={t("Organizaciones vs. personas", "Organisations vs. individuals")} sub={t("monto neto por tipo de donante", "net amount by donor type")}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <Donut parts={[{ label: t("Organizaciones", "Organisations"), value: org?.amount ?? 0, color: "#e11b22" }, { label: t("Personas", "Individuals"), value: per?.amount ?? 0, color: "#2a2d3a" }]} size={112} format={(v) => money0(v, lang)} lang={lang} />
            <div style={{ fontSize: 13, color: "#3b3f4a", lineHeight: 1.6, minWidth: 0, flex: "1 1 160px" }}>
              <div>
                <b>{pct(org?.amount ?? 0, NEXT.total)}%</b> {t("empresas y fundaciones", "companies and foundations")}
              </div>
              <div>
                <b>{pct(per?.amount ?? 0, NEXT.total)}%</b> {t("personas", "individuals")}
              </div>
              <div style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>{t("Donación media por persona", "Average gift per individual")}: {money0((per?.amount ?? 0) / Math.max(1, per?.donors ?? 1), lang)}</div>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className={s.dashSpan}>
        <ChartCard title={t("Donaciones por mes", "Donations by month")} sub={t("valor neto registrado · los picos son convenios y fondos grandes", "net value recorded · spikes are agreements and large funds")}>
          <MonthlyChart lang={lang} />
        </ChartCard>
      </div>

      <div className={s.dashGrid}>
        <ChartCard title={t("Mayores donantes", "Top donors")} sub={t("neto acumulado 2024–2026", "net total 2024–2026")}>
          <table className={s.tbl}>
            <thead>
              <tr>
                <th>{t("Donante", "Donor")}</th>
                <th>{t("Tipo", "Type")}</th>
                <th className={s.num}>{t("Monto", "Amount")}</th>
              </tr>
            </thead>
            <tbody>
              {NEXT.topDonors.slice(0, 10).map((d) => (
                <tr key={d.name}>
                  <td title={d.name}>{d.name.length > 34 ? d.name.slice(0, 32) + "…" : d.name}</td>
                  <td>
                    <span className={s.tag}>{d.category === "Personas" ? t("Persona", "Individual") : t("Organización", "Organisation")}</span>
                  </td>
                  <td className={s.num}>{money0(d.amount, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>
        <ChartCard title={t("Proyectos que más reciben", "Projects receiving the most")} sub={t("destino registrado · vertical", "registered destination · vertical")}>
          <table className={s.tbl}>
            <thead>
              <tr>
                <th>{t("Proyecto", "Project")}</th>
                <th>{t("Vertical", "Vertical")}</th>
                <th className={s.num}>{t("Monto", "Amount")}</th>
              </tr>
            </thead>
            <tbody>
              {NEXT.topProjects.slice(0, 10).map((p) => (
                <tr key={p.name}>
                  <td title={`${p.name} · ${p.area}`}>{p.name.length > 30 ? p.name.slice(0, 28) + "…" : p.name}</td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5 }}>
                      <i style={{ width: 8, height: 8, borderRadius: 2, background: VCOLORS[p.vertical] }} />
                      {VSHORT[NEXT.verticals[p.vertical].name]?.[lang]}
                    </span>
                  </td>
                  <td className={s.num}>{money0(p.amount, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>
      </div>

      <div className={s.dashSpan}>
      <ChartCard
        title={t("Proyectos de vinculación 2026", "2026 engagement projects")}
        sub={t("Vecinos USFQ y zonas rurales · candidatos para donantes", "Vecinos USFQ and rural areas · candidates for donors")}
        right={
          <div className={s.range} role="tablist">
            {places.map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={where === k} className={where === k ? s.on : ""} onClick={() => setWhere(k)}>
                {label}
              </button>
            ))}
          </div>
        }
      >
        <div className={s.dashScroll}>
        <table className={s.tbl}>
          <thead>
            <tr>
              <th>{t("Proyecto", "Project")}</th>
              <th>{t("Sede", "Site")}</th>
              <th>{t("Líder", "Lead")}</th>
              <th>{t("Fondos", "Funding")}</th>
              <th>{t("Impacto", "Impact")}</th>
              <th>{t("Atractivo", "Appeal")}</th>
            </tr>
          </thead>
          <tbody>
            {outreach.slice(0, 24).map((p) => (
              <tr key={p.name}>
                <td title={p.name}>{p.name.length > 46 ? p.name.slice(0, 44) + "…" : p.name}</td>
                <td>{p.where.replace("Participación abierta en cualquiera de los proyectos Vecinos", t("Abierto", "Open")).replace("No; sin embargo, se desarrolla en zonas rurales", t("Rural", "Rural")).replace("Vecinos ", "")}</td>
                <td>{p.lead}</td>
                <td>{p.funding.startsWith("Grants") ? "Grants USFQ" : t("Sin fondos", "Unfunded")}</td>
                <td>{badge(p.impact)}</td>
                <td>{badge(p.appeal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {outreach.length > 24 && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>{t(`y ${outreach.length - 24} más`, `and ${outreach.length - 24} more`)}</div>}
      </ChartCard>
      </div>
      <div style={{ fontSize: 11.5, color: "#8b8896", padding: "0 4px 8px" }}>{t("Fuente: ", "Source: ")}{NEXT.generatedFrom}.</div>
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
