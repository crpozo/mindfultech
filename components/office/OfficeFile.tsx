"use client";

import * as React from "react";
import { botById } from "@/lib/office/bots";
import { tx, type Lang } from "@/lib/office/i18n";
import { MGMT, VP, OFFICES, officeById, principalOffices, subUnitsOf, answerOffice, stateLabel, levelLabel, LIGHT_LABEL, LIGHT_COLOR, daysUntil, fmtUsd, fmtNum, kpiValue, kpiTarget, type MgmtOffice } from "@/lib/office/usfqMgmt";
import { AgentFace, type FaceMood } from "./AgentFace";
import s from "./office.module.css";

/** Which agent's face answers for each office. */
const FACE: Record<string, string> = { "COM-001": "borja", "ADM-001": "pons", "REL-001": "borja", "NEXT-001": "andrade", "COMMS-001": "calderon", "INTL-001": "guerra", [VP.id]: "velasco" };
const fmtDate = (iso: string, lang: Lang) => new Date(iso + "T12:00:00").toLocaleDateString(lang === "es" ? "es-EC" : "en-US", { day: "numeric", month: "short" });
const pctColor = (p: number) => (p >= 100 ? "#16a34a" : p >= 85 ? "#d97706" : "#dc2626");

export function DemoNote({ lang }: { lang: Lang }) {
  const t = tx(lang);
  return (
    <div className={s.demoNote} role="note">
      <b>{t("Datos de demostración", "Demo data")}</b> · {t(`simulación al ${fmtDate(MGMT.fecha_corte, lang)} ${MGMT.fecha_corte.slice(0, 4)}; no son registros reales de la USFQ`, `simulation as of ${fmtDate(MGMT.fecha_corte, lang)} ${MGMT.fecha_corte.slice(0, 4)}; not USFQ's real records`)}
    </div>
  );
}

function Light({ state, lang }: { state: string; lang: Lang }) {
  return (
    <span className={s.light} style={{ ["--lc" as string]: LIGHT_COLOR[state] ?? "#9ca3af" }}>
      <i />
      {LIGHT_LABEL[state]?.[lang] ?? state}
    </span>
  );
}

function Bar({ value, color, max = 100 }: { value: number; color: string; max?: number }) {
  return (
    <span className={s.mgBar}>
      <i style={{ width: `${Math.max(1, Math.min(100, (value / max) * 100))}%`, background: color }} />
    </span>
  );
}

/* ---------------------------------------------------------------- chat ---- */
function MgmtChat({ lang, officeId, suggestions }: { lang: Lang; officeId: string; suggestions: string[] }) {
  const t = tx(lang);
  const bot = botById(lang, FACE[officeId] ?? "velasco");
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
    const reply = answerOffice(q, officeId, lang);
    timers.current.push(window.setTimeout(() => setMood("typing"), 450));
    timers.current.push(
      window.setTimeout(() => {
        setMsgs((m) => [...m, { from: "bot", text: reply }]);
        setMood("talking");
        timers.current.push(window.setTimeout(() => setMood("idle"), 1500));
      }, 800 + Math.min(1400, reply.length * 4))
    );
  };
  const caption = mood === "thinking" ? t("revisando los datos…", "checking the data…") : mood === "typing" ? t("escribiendo…", "typing…") : t("responde solo con los datos de esta oficina", "answers only from this office's data");
  return (
    <div className={s.dashChat}>
      <div className={s.chatFace}>
        {bot && <AgentFace id={bot.id} look={bot.look} mood={mood} size={40} />}
        <span>
          <b>{t("Pregúntale a", "Ask")} {bot?.name ?? "USFQ"}</b> · {caption}
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
        {suggestions.map((q) => (
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
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("Pregunta sobre esta oficina…", "Ask about this office…")} aria-label={t("Pregunta", "Question")} />
        <button className={s.send} type="submit" disabled={!input.trim() || busy} aria-label={t("Enviar", "Send")}>
          ➜
        </button>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------- the office ---- */
type Tab = "resumen" | "hace" | "kpis" | "finanzas" | "proyectos" | "solicitudes" | "alertas" | "ia";

/** The file of one office: the eight tabs the dataset suggests, with a visible demo notice. */
export function OfficePanel({ officeId, lang, onBack }: { officeId: string; lang: Lang; onBack?: () => void }) {
  const t = tx(lang);
  const o = officeById(officeId);
  const [tab, setTab] = React.useState<Tab>("resumen");
  if (!o) return null;
  const f = o.finanzas;
  const subs = subUnitsOf(o.id);
  const parent = officeById(o.id_oficina_superior);
  const tasks = [...o.tareas_proximas].sort((a, b) => a.fecha_limite.localeCompare(b.fecha_limite));
  const lowKpis = o.kpis.filter((k) => k.cumplimiento_porcentaje < 100).length;
  const tabs: [Tab, string][] = [
    ["resumen", t("Resumen", "Summary")], ["hace", t("Qué hace", "What it does")], ["kpis", t("Indicadores", "Indicators")], ["finanzas", t("Finanzas", "Finances")],
    ["proyectos", t("Proyectos", "Projects")], ["solicitudes", t("Solicitudes", "Requests")], ["alertas", t("Alertas y tareas", "Alerts & tasks")], ["ia", t("Preguntar a la IA", "Ask the AI")],
  ];
  const extras = Object.entries(f.indicadores_financieros_especificos).filter(([, v]) => typeof v === "number") as [string, number][];
  const notes = Object.entries(f.indicadores_financieros_especificos).filter(([, v]) => typeof v === "string") as [string, string][];
  const label = (k: string) => k.replace(/_usd$/, "").replace(/_simulad[oa]s?/, "").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  return (
    <div className={s.mg}>
      <DemoNote lang={lang} />
      <div className={s.mgHead}>
        {onBack && (
          <button type="button" className={s.mgBack} onClick={onBack} aria-label={t("Volver", "Back")}>
            ‹
          </button>
        )}
        <div className={s.mgTitle}>
          <strong>{o.nombre}</strong>
          <span>
            {o.responsable ? `${o.responsable} · ` : ""}
            {o.nivel === "subunidad" ? t(`subunidad de ${parent?.nombre ?? ""}`, `sub-unit of ${parent?.nombre ?? ""}`) : o.nivel === "coordinacion" ? t("coordinación", "coordination") : t("dirección", "office")} · {o.equipo.personas_adscritas_directamente} {t("personas", "people")}
          </span>
        </div>
        <Light state={o.estado_semaforo} lang={lang} />
      </div>
      <div className={s.mgTabs} role="tablist">
        {tabs.map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? s.on : ""} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>

      {tab === "resumen" && (
        <>
          <p className={s.mgLead}>{o.descripcion_funcional}</p>
          <div className={s.mgKpis}>
            <div className={s.nxKpi}><b>{fmtUsd(f.presupuesto_operativo_2026_usd, lang)}</b><span>{t("presupuesto operativo 2026", "2026 operating budget")}</span></div>
            <div className={s.nxKpi}><b>{fmtNum(f.ejecucion_presupuestaria_porcentaje, lang)}%</b><span>{t("ejecutado", "executed")} · {fmtUsd(f.gasto_acumulado_2026_usd, lang)}</span></div>
            <div className={s.nxKpi}><b>{o.solicitudes.abiertas}</b><span>{t("solicitudes abiertas", "open requests")} · <em style={{ color: o.solicitudes.de_las_abiertas_vencidas ? "#dc2626" : undefined, fontStyle: "normal" }}>{o.solicitudes.de_las_abiertas_vencidas} {t("vencidas", "overdue")}</em></span></div>
            <div className={s.nxKpi}><b>{lowKpis}/{o.kpis.length}</b><span>{t("indicadores bajo la meta", "indicators below target")}</span></div>
          </div>
          <div className={s.mgSection}>
            <h4>{t("Lo que vence primero", "Due first")}</h4>
            <ul className={s.mgList}>
              {o.solicitudes.de_las_abiertas_vencidas > 0 && <li className={s.mgDue}><b>{o.solicitudes.de_las_abiertas_vencidas} {t("solicitudes vencidas", "overdue requests")}</b> · {t("ya fuera de plazo", "already past their deadline")}</li>}
              {tasks.map((x) => (
                <li key={x.titulo} className={daysUntil(x.fecha_limite) <= 3 ? s.mgDue : ""}>
                  <b>{x.titulo}</b> · {fmtDate(x.fecha_limite, lang)} ({daysUntil(x.fecha_limite)} {t("días", "days")}) · {levelLabel(x.prioridad, lang).toLowerCase()}
                </li>
              ))}
            </ul>
          </div>
          <div className={s.mgSection}>
            <h4>{t("Alertas", "Alerts")}</h4>
            <ul className={s.mgList}>
              {o.alertas.map((a) => (
                <li key={a.descripcion}><span className={`${s.tag} ${a.nivel === "alta" ? s.tagWarn : ""}`}>{levelLabel(a.nivel, lang)}</span> {a.descripcion}</li>
              ))}
            </ul>
          </div>
          {subs.length > 0 && (
            <div className={s.mgSection}>
              <h4>{t("Subunidades incluidas en su presupuesto", "Sub-units included in its budget")}</h4>
              <ul className={s.mgList}>{subs.map((u) => <li key={u.id}><b>{u.nombre}</b> · {fmtUsd(u.finanzas.presupuesto_operativo_2026_usd, lang)} · {u.solicitudes.abiertas} {t("solicitudes", "requests")} · <Light state={u.estado_semaforo} lang={lang} /></li>)}</ul>
            </div>
          )}
        </>
      )}

      {tab === "hace" && (
        <>
          <p className={s.mgLead}>{o.descripcion_funcional}</p>
          <div className={s.mgSection}><h4>{t("Frentes de trabajo", "Fronts")}</h4><ul className={s.mgList}>{o.que_hace.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div className={s.mgSection}><h4>{t("A quién atiende", "Who it serves")}</h4><div className={s.mgChips}>{o.usuarios_o_publicos.map((x) => <span key={x}>{x}</span>)}</div></div>
          <div className={s.mgSection}><h4>{t("Equipo", "Team")}</h4><p className={s.mgLead}>{o.equipo.personas_adscritas_directamente} {t("personas adscritas directamente · perfiles de", "people directly assigned · profiles:")} {o.equipo.perfiles_referenciales.join(", ")}.</p></div>
        </>
      )}

      {tab === "kpis" && (
        <div className={s.mgRows}>
          {o.kpis.map((k) => (
            <div key={k.nombre} className={s.mgRow}>
              <div className={s.mgRowHead}>
                <b>{k.nombre}</b>
                <span style={{ color: pctColor(k.cumplimiento_porcentaje) }}>{fmtNum(k.cumplimiento_porcentaje, lang)}%</span>
              </div>
              <Bar value={k.cumplimiento_porcentaje} color={pctColor(k.cumplimiento_porcentaje)} />
              <small>{kpiValue(k, lang)} {t("de", "of")} {kpiTarget(k, lang)} {k.unidad !== "USD" && k.unidad !== "porcentaje" ? k.unidad : ""} · {k.descripcion}</small>
            </div>
          ))}
        </div>
      )}

      {tab === "finanzas" && (
        <>
          <div className={s.mgKpis}>
            <div className={s.nxKpi}><b>{fmtUsd(f.presupuesto_operativo_2026_usd, lang)}</b><span>{t("presupuesto operativo 2026", "2026 operating budget")}</span></div>
            <div className={s.nxKpi}><b>{fmtUsd(f.gasto_acumulado_2026_usd, lang)}</b><span>{t("gasto acumulado", "spent to date")}</span></div>
            <div className={s.nxKpi}><b>{fmtUsd(f.saldo_operativo_usd, lang)}</b><span>{t("saldo disponible", "available balance")}</span></div>
            <div className={s.nxKpi}><b>{fmtNum(f.ejecucion_presupuestaria_porcentaje, lang)}%</b><span>{t("ejecución presupuestaria", "budget execution")}</span></div>
          </div>
          <div className={s.mgRow}>
            <div className={s.mgRowHead}><b>{t("Ejecución del presupuesto", "Budget execution")}</b><span>{fmtNum(f.ejecucion_presupuestaria_porcentaje, lang)}%</span></div>
            <Bar value={f.ejecucion_presupuestaria_porcentaje} color={f.ejecucion_presupuestaria_porcentaje > 90 ? "#dc2626" : "#e11b22"} />
            <small>{t("octubre es el mes 10 de 12: una ejecución cercana al 75% va en línea", "October is month 10 of 12: execution near 75% is on pace")}</small>
          </div>
          {extras.length > 0 && (
            <table className={`${s.tbl} ${s.nxTbl}`}>
              <tbody>{extras.map(([k, v]) => <tr key={k}><td><span className={s.nxCell}>{label(k)}</span></td><td className={s.num}>{fmtUsd(v, lang)}</td></tr>)}</tbody>
            </table>
          )}
          {notes.map(([k, v]) => <p key={k} className={s.mgNote}>{v}</p>)}
        </>
      )}

      {tab === "proyectos" && (
        <div className={s.mgRows}>
          {o.proyectos.map((p) => (
            <div key={p.id} className={s.mgCard}>
              <div className={s.mgRowHead}>
                <b>{p.nombre}</b>
                <span className={`${s.tag} ${p.estado === "en_ejecucion" ? s.tagOk : s.tagWarn}`}>{stateLabel(p.estado, lang)}</span>
              </div>
              <Bar value={p.avance_porcentaje} color="#e11b22" />
              <div className={s.mgMeta}>
                <span><b>{p.avance_porcentaje}%</b> {t("avance", "progress")}</span>
                <span><b>{fmtUsd(p.costo_operativo_estimado_usd, lang)}</b> {t("costo estimado", "estimated cost")}</span>
                <span><b>{fmtDate(p.fecha_proximo_hito, lang)}</b> {t("próximo hito", "next milestone")} ({daysUntil(p.fecha_proximo_hito)} {t("días", "days")})</span>
              </div>
              <small><b>{p.proximo_hito}</b> · {p.resultado_esperado}</small>
            </div>
          ))}
        </div>
      )}

      {tab === "solicitudes" && (
        <>
          <div className={s.mgKpis}>
            <div className={s.nxKpi}><b>{o.solicitudes.abiertas}</b><span>{t("abiertas", "open")}</span></div>
            <div className={s.nxKpi}><b style={{ color: o.solicitudes.de_las_abiertas_vencidas ? "#dc2626" : undefined }}>{o.solicitudes.de_las_abiertas_vencidas}</b><span>{t("vencidas", "overdue")}</span></div>
            <div className={s.nxKpi}><b>{o.solicitudes.resueltas_en_octubre}</b><span>{t("resueltas en octubre", "resolved in October")}</span></div>
          </div>
          <div className={s.mgRow}>
            <div className={s.mgRowHead}><b>{t("Abiertas dentro de plazo", "Open and within deadline")}</b><span>{Math.round(((o.solicitudes.abiertas - o.solicitudes.de_las_abiertas_vencidas) / Math.max(1, o.solicitudes.abiertas)) * 100)}%</span></div>
            <Bar value={o.solicitudes.abiertas - o.solicitudes.de_las_abiertas_vencidas} max={o.solicitudes.abiertas} color="#16a34a" />
            <small>{t(`${o.solicitudes.de_las_abiertas_vencidas} solicitudes requieren respuesta inmediata`, `${o.solicitudes.de_las_abiertas_vencidas} requests need an immediate answer`)}</small>
          </div>
        </>
      )}

      {tab === "alertas" && (
        <>
          <div className={s.mgSection}>
            <h4>{t("Tareas próximas", "Upcoming tasks")}</h4>
            <table className={`${s.tbl} ${s.nxTbl}`}>
              <thead><tr><th>{t("Tarea", "Task")}</th><th>{t("Vence", "Due")}</th><th>{t("Prioridad", "Priority")}</th></tr></thead>
              <tbody>
                {tasks.map((x) => (
                  <tr key={x.titulo}>
                    <td><span className={s.nxCell}>{x.titulo}</span><small>{x.responsable_rol} · {stateLabel(x.estado, lang).toLowerCase()}</small></td>
                    <td style={{ color: daysUntil(x.fecha_limite) <= 3 ? "#dc2626" : undefined }}>{fmtDate(x.fecha_limite, lang)}</td>
                    <td><span className={`${s.tag} ${x.prioridad === "alta" ? s.tagWarn : ""}`}>{levelLabel(x.prioridad, lang)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={s.mgSection}>
            <h4>{t("Alertas", "Alerts")}</h4>
            <ul className={s.mgList}>{o.alertas.map((a) => <li key={a.descripcion}><span className={`${s.tag} ${a.nivel === "alta" ? s.tagWarn : ""}`}>{levelLabel(a.nivel, lang)}</span> {a.descripcion}</li>)}</ul>
          </div>
          <div className={s.mgSection}>
            <h4>{t("Decisiones pendientes", "Pending decisions")}</h4>
            <ul className={s.mgList}>{o.decisiones_pendientes.map((d) => <li key={d}>{d}</li>)}</ul>
          </div>
        </>
      )}

      {tab === "ia" && <MgmtChat lang={lang} officeId={o.id} suggestions={o.consultas_ia_sugeridas} />}
    </div>
  );
}

/* ------------------------------------------------- the vice-presidency ---- */
/** Alexandra Velasco's view: the offices side by side, click one to open its file. */
export function VpPanel({ lang }: { lang: Lang }) {
  const t = tx(lang);
  const [open, setOpen] = React.useState<string | null>(null);
  if (open) return <OfficePanel officeId={open} lang={lang} onBack={() => setOpen(null)} />;
  const offs = principalOffices();
  const overdue = OFFICES.reduce((a, o) => a + o.solicitudes.de_las_abiertas_vencidas, 0);
  const lowKpis = OFFICES.flatMap((o) => o.kpis.filter((k) => k.cumplimiento_porcentaje < 85).map((k) => ({ office: o.nombre, ...k }))).sort((a, b) => a.cumplimiento_porcentaje - b.cumplimiento_porcentaje);
  const due = OFFICES.flatMap((o) => o.tareas_proximas.map((x) => ({ office: o.nombre, ...x }))).sort((a, b) => a.fecha_limite.localeCompare(b.fecha_limite)).slice(0, 6);
  const row = (o: MgmtOffice, sub = false) => (
    <tr key={o.id} className={s.rowBtn} onClick={() => setOpen(o.id)}>
      <td>
        <span className={s.nxCell} style={{ paddingLeft: sub ? 14 : 0 }}>{sub ? "↳ " : ""}{o.nombre}</span>
        <small style={{ paddingLeft: sub ? 14 : 0 }}>{o.responsable ?? t("sin responsable asignado", "no lead assigned")} · {o.equipo.personas_adscritas_directamente} {t("pers.", "ppl")}</small>
      </td>
      <td><Light state={o.estado_semaforo} lang={lang} /></td>
      <td className={s.num}>{fmtUsd(o.finanzas.presupuesto_operativo_2026_usd, lang)}</td>
      <td>
        <span className={s.mgCellBar}><Bar value={o.finanzas.ejecucion_presupuestaria_porcentaje} color={o.finanzas.ejecucion_presupuestaria_porcentaje > 90 ? "#dc2626" : "#e11b22"} /><small>{fmtNum(o.finanzas.ejecucion_presupuestaria_porcentaje, lang)}%</small></span>
      </td>
      <td className={s.num}>{o.solicitudes.abiertas} <small style={{ color: o.solicitudes.de_las_abiertas_vencidas ? "#dc2626" : "#6b7280" }}>({o.solicitudes.de_las_abiertas_vencidas})</small></td>
      <td className={s.num}>{o.kpis.filter((k) => k.cumplimiento_porcentaje < 100).length}/{o.kpis.length}</td>
    </tr>
  );
  return (
    <div className={s.mg}>
      <DemoNote lang={lang} />
      <div className={s.mgHead}>
        <div className={s.mgTitle}>
          <strong>{VP.nombre}</strong>
          <span>{VP.responsable} · {VP.oficinas_principales} {t("oficinas", "offices")}, {VP.subunidades} {t("subunidades", "sub-units")}, {VP.colaboradores_simulados_total} {t("colaboradores", "staff")}</span>
        </div>
      </div>
      <div className={s.mgKpis}>
        <div className={s.nxKpi}><b>{fmtUsd(VP.presupuesto_operativo_anual_usd, lang)}</b><span>{t("presupuesto operativo anual", "annual operating budget")}</span></div>
        <div className={s.nxKpi}><b>{fmtNum(VP.ejecucion_presupuestaria_porcentaje, lang)}%</b><span>{t("ejecutado", "executed")} · {fmtUsd(VP.gasto_operativo_acumulado_usd, lang)}</span></div>
        <div className={s.nxKpi}><b>{VP.solicitudes_abiertas_consolidadas}</b><span>{t("solicitudes abiertas", "open requests")} · <em style={{ color: "#dc2626", fontStyle: "normal" }}>{overdue} {t("vencidas", "overdue")}</em></span></div>
        <div className={s.nxKpi}><b>{fmtUsd(VP.donaciones_monetarias_recibidas_simuladas_usd, lang)}</b><span>{t("donaciones monetarias (USFQ NEXT)", "monetary donations (USFQ NEXT)")}</span></div>
      </div>
      <div className={s.mgSection}>
        <h4>{t("Oficinas · haz clic para abrir la ficha", "Offices · click to open the file")}</h4>
        <div className={s.nxScroll}>
          <table className={`${s.tbl} ${s.nxTbl} ${s.mgTable}`}>
            <thead><tr><th>{t("Oficina", "Office")}</th><th>{t("Estado", "Status")}</th><th className={s.num}>{t("Presupuesto", "Budget")}</th><th>{t("Ejecución", "Execution")}</th><th className={s.num}>{t("Abiertas (venc.)", "Open (overdue)")}</th><th className={s.num}>{t("KPI < meta", "KPI < target")}</th></tr></thead>
            <tbody>{offs.flatMap((o) => [row(o), ...subUnitsOf(o.id).map((u) => row(u, true))])}</tbody>
          </table>
        </div>
        <p className={s.mgNote}>{VP.nota_consolidacion}</p>
      </div>
      <div className={s.mgTwo}>
        <div className={s.mgSection}>
          <h4>{t("Lo que vence primero", "Due first")}</h4>
          <ul className={s.mgList}>{due.map((x) => <li key={x.office + x.titulo} className={daysUntil(x.fecha_limite) <= 3 ? s.mgDue : ""}><b>{x.titulo}</b> · {x.office} · {fmtDate(x.fecha_limite, lang)}</li>)}</ul>
        </div>
        <div className={s.mgSection}>
          <h4>{t("Indicadores con menos del 85 %", "Indicators under 85%")}</h4>
          <ul className={s.mgList}>{lowKpis.map((k) => <li key={k.office + k.nombre}><b>{k.nombre}</b> · {k.office} · <span style={{ color: pctColor(k.cumplimiento_porcentaje) }}>{fmtNum(k.cumplimiento_porcentaje, lang)}%</span></li>)}</ul>
        </div>
      </div>
      <MgmtChat lang={lang} officeId={VP.id} suggestions={[t("¿Qué oficinas necesitan atención?", "Which offices need attention?"), t("¿Cómo va el presupuesto?", "How is the budget doing?"), t("¿Qué indicadores están por debajo?", "Which indicators are below target?"), t("¿Qué proyectos tienen hitos cerca?", "Which projects have milestones soon?")]} />
    </div>
  );
}
