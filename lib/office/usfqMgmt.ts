// Simulated office-management data for the USFQ office (Vicepresidencia Comercial y Desarrollo).
// Source: usfq_office_management_datos_simulados.json (Carlos, 2026-10-13). 100% simulation: every screen shows a demo notice.
import raw from "./usfqMgmt.json";
import type { Lang } from "./i18n";

export type MgmtKpi = { nombre: string; valor_actual: number; meta_anual: number; unidad: string; descripcion: string; cumplimiento_porcentaje: number };
export type MgmtProject = { id: string; nombre: string; estado: string; avance_porcentaje: number; costo_operativo_estimado_usd: number; proximo_hito: string; fecha_proximo_hito: string; resultado_esperado: string };
export type MgmtTask = { titulo: string; fecha_limite: string; prioridad: string; responsable_rol: string; estado: string };
export type MgmtOffice = {
  id: string; nombre: string; id_oficina_superior: string; nivel: string; responsable: string | null; nota_responsable: string | null; estado_semaforo: string;
  descripcion_funcional: string; que_hace: string[]; servicios_principales: string[]; usuarios_o_publicos: string[];
  equipo: { personas_adscritas_directamente: number; perfiles_referenciales: string[] };
  finanzas: { presupuesto_operativo_2026_usd: number; gasto_acumulado_2026_usd: number; saldo_operativo_usd: number; ejecucion_presupuestaria_porcentaje: number; indicadores_financieros_especificos: Record<string, number | string> };
  kpis: MgmtKpi[]; proyectos: MgmtProject[];
  solicitudes: { abiertas: number; de_las_abiertas_vencidas: number; resueltas_en_octubre: number };
  alertas: { nivel: string; descripcion: string }[]; tareas_proximas: MgmtTask[]; decisiones_pendientes: string[]; consultas_ia_sugeridas: string[];
};
export type MgmtVp = {
  id: string; nombre: string; responsable: string; resumen: string; oficinas_principales: number; subunidades: number; colaboradores_simulados_total: number;
  presupuesto_operativo_anual_usd: number; gasto_operativo_acumulado_usd: number; saldo_operativo_usd: number; ejecucion_presupuestaria_porcentaje: number;
  solicitudes_abiertas_consolidadas: number; ingresos_operacionales_registrados_simulados_usd: number; donaciones_monetarias_recibidas_simuladas_usd: number; nota_consolidacion: string;
};

export const MGMT = raw as unknown as { dataset: string; version: string; fecha_corte: string; moneda: string; naturaleza: string; vicepresidencia: MgmtVp; oficinas: MgmtOffice[] };
/** IDEA and Educación Continua are left out of this office (Carlos, 2026-10-13), so the consolidated figures are recomputed from the offices kept. */
const EXCLUDED = new Set(["IDEA-001", "EDC-001"]);
export const OFFICES = MGMT.oficinas.filter((o) => !EXCLUDED.has(o.id));
const principals = OFFICES.filter((o) => o.id_oficina_superior === MGMT.vicepresidencia.id);
const sumP = (f: (o: MgmtOffice) => number) => principals.reduce((a, o) => a + f(o), 0);
const vpBudget = sumP((o) => o.finanzas.presupuesto_operativo_2026_usd), vpSpent = sumP((o) => o.finanzas.gasto_acumulado_2026_usd);
export const VP: MgmtVp = {
  ...MGMT.vicepresidencia,
  oficinas_principales: principals.length,
  subunidades: OFFICES.length - principals.length,
  colaboradores_simulados_total: OFFICES.reduce((a, o) => a + o.equipo.personas_adscritas_directamente, 0),
  presupuesto_operativo_anual_usd: vpBudget,
  gasto_operativo_acumulado_usd: vpSpent,
  saldo_operativo_usd: vpBudget - vpSpent,
  ejecucion_presupuestaria_porcentaje: Math.round((vpSpent / vpBudget) * 1000) / 10,
  solicitudes_abiertas_consolidadas: OFFICES.reduce((a, o) => a + o.solicitudes.abiertas, 0),
  ingresos_operacionales_registrados_simulados_usd: principals.reduce((a, o) => a + (Number(o.finanzas.indicadores_financieros_especificos.ingresos_operacionales_simulados_usd) || 0), 0),
};
export const officeById = (id: string) => OFFICES.find((o) => o.id === id);
/** The offices that report straight to the vice-presidency (their budgets already include their sub-units). */
export const principalOffices = () => OFFICES.filter((o) => o.id_oficina_superior === VP.id);
export const subUnitsOf = (id: string) => OFFICES.filter((o) => o.id_oficina_superior === id);

/** Which office each agent of the USFQ roster runs. Velasco gets the whole vice-presidency. */
export const OFFICE_OF_BOT: Record<string, string> = { borja: "COM-001", pons: "ADM-001", calderon: "COMMS-001", guerra: "INTL-001", andrade: "NEXT-001", velasco: VP.id };
/** Agents that do not appear in the simulated dataset (Guerrero · Becas) simply have no office tab. */
export const officeOfBot = (botId: string) => OFFICE_OF_BOT[botId];

export const STATE_LABEL: Record<string, { es: string; en: string }> = {
  en_ejecucion: { es: "En ejecución", en: "In progress" }, en_negociacion: { es: "En negociación", en: "In negotiation" }, en_diseno: { es: "En diseño", en: "In design" },
  pendiente: { es: "Pendiente", en: "Pending" }, en_curso: { es: "En curso", en: "Ongoing" }, completado: { es: "Completado", en: "Done" },
};
export const stateLabel = (k: string, lang: Lang) => STATE_LABEL[k]?.[lang] ?? k.replace(/_/g, " ");
export const LEVEL_LABEL: Record<string, { es: string; en: string }> = { alta: { es: "Alta", en: "High" }, media: { es: "Media", en: "Medium" }, baja: { es: "Baja", en: "Low" } };
export const levelLabel = (k: string, lang: Lang) => LEVEL_LABEL[k]?.[lang] ?? k;
export const LIGHT_LABEL: Record<string, { es: string; en: string }> = { verde: { es: "En orden", en: "On track" }, amarillo: { es: "Atención", en: "Attention" }, rojo: { es: "Crítico", en: "Critical" } };
export const LIGHT_COLOR: Record<string, string> = { verde: "#16a34a", amarillo: "#d97706", rojo: "#dc2626" };

const CUTOFF = new Date(MGMT.fecha_corte + "T12:00:00");
export const daysUntil = (iso: string) => Math.round((new Date(iso + "T12:00:00").getTime() - CUTOFF.getTime()) / 86400000);

export const fmtUsd = (v: number, lang: Lang) => new Intl.NumberFormat(lang === "es" ? "es-EC" : "en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
export const fmtNum = (v: number, lang: Lang) => new Intl.NumberFormat(lang === "es" ? "es-EC" : "en-US", { maximumFractionDigits: 1 }).format(v);
export const kpiValue = (k: MgmtKpi, lang: Lang) => (k.unidad === "USD" ? fmtUsd(k.valor_actual, lang) : k.unidad === "porcentaje" ? `${fmtNum(k.valor_actual, lang)}%` : fmtNum(k.valor_actual, lang));
export const kpiTarget = (k: MgmtKpi, lang: Lang) => (k.unidad === "USD" ? fmtUsd(k.meta_anual, lang) : k.unidad === "porcentaje" ? `${fmtNum(k.meta_anual, lang)}%` : fmtNum(k.meta_anual, lang));

/* ------------------------------------------------------ the office analyst ---- */
const norm = (q: string) => q.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const has = (q: string, ...w: string[]) => w.some((x) => q.includes(x));
const fmtDate = (iso: string, lang: Lang) => new Date(iso + "T12:00:00").toLocaleDateString(lang === "es" ? "es-EC" : "en-US", { day: "numeric", month: "short" });

/** Answers only from the dataset, never inventing figures; always says the data is a simulation when asked about its nature. */
export function answerOffice(q0: string, officeId: string, lang: Lang): string {
  const es = lang === "es";
  const q = norm(q0);
  if (officeId === VP.id) return answerVp(q, lang);
  const o = officeById(officeId);
  if (!o) return es ? "No tengo datos de esa oficina." : "I have no data for that office.";
  const f = o.finanzas;
  if (has(q, "simul", "real", "fuente", "source", "de donde", "where do")) return es ? `Todo lo que muestro de ${o.nombre} es una simulación de demostración (corte ${MGMT.fecha_corte}); no son registros institucionales de la USFQ.` : `Everything I show for ${o.nombre} is demo simulation data (cut-off ${MGMT.fecha_corte}); these are not USFQ's institutional records.`;
  if (has(q, "que hace", "what does", "atiende", "serve", "publico", "audience", "funcion", "function", "para que")) return es ? `${o.nombre}: ${o.descripcion_funcional} Atiende a ${o.usuarios_o_publicos.join(", ").toLowerCase()}. Sus frentes: ${o.que_hace.map((x) => x.replace(/\.$/, "")).join("; ")}.` : `${o.nombre}: ${o.descripcion_funcional} It serves ${o.usuarios_o_publicos.join(", ").toLowerCase()}. Its fronts: ${o.que_hace.map((x) => x.replace(/\.$/, "")).join("; ")}.`;
  if (has(q, "indicador", "kpi", "meta", "target", "debajo", "below", "cumpl", "avance de")) {
    const low = o.kpis.filter((k) => k.cumplimiento_porcentaje < 100).sort((a, b) => a.cumplimiento_porcentaje - b.cumplimiento_porcentaje);
    const list = low.map((k) => `${k.nombre} ${kpiValue(k, lang)} de ${kpiTarget(k, lang)} (${fmtNum(k.cumplimiento_porcentaje, lang)}%)`).join("; ");
    const ok = o.kpis.filter((k) => k.cumplimiento_porcentaje >= 100).map((k) => k.nombre);
    return es ? `${low.length} de ${o.kpis.length} indicadores están por debajo de la meta anual: ${list}.${ok.length ? ` Ya cumplidos: ${ok.join(", ")}.` : ""}` : `${low.length} of ${o.kpis.length} indicators are below the annual target: ${list.replace(/ de /g, " of ")}.${ok.length ? ` Already met: ${ok.join(", ")}.` : ""}`;
  }
  if (has(q, "alerta", "alert", "tarea", "task", "vence", "due", "pendiente", "pending", "riesgo", "risk", "urgente", "urgent")) {
    const tasks = [...o.tareas_proximas].sort((a, b) => a.fecha_limite.localeCompare(b.fecha_limite));
    const overdue = o.solicitudes.de_las_abiertas_vencidas;
    const tl = tasks.map((t) => `${t.titulo} (${fmtDate(t.fecha_limite, lang)}, ${levelLabel(t.prioridad, lang).toLowerCase()})`).join("; ");
    const al = o.alertas.map((a) => `${levelLabel(a.nivel, lang).toLowerCase()}: ${a.descripcion.replace(/\.$/, "")}`).join("; ");
    return es ? `Primero lo que vence: ${overdue} solicitudes abiertas ya están vencidas y las tareas próximas son ${tl}. Alertas: ${al}. Decisión pendiente: ${o.decisiones_pendientes.join(" ")}` : `Due items first: ${overdue} open requests are already overdue and the upcoming tasks are ${tl}. Alerts: ${al}. Pending decision: ${o.decisiones_pendientes.join(" ")}`;
  }
  if (has(q, "presupuesto", "budget", "gasto", "spend", "financ", "saldo", "balance", "ejecucion", "execution", "dinero", "money", "ingreso", "revenue")) {
    const extra = Object.entries(f.indicadores_financieros_especificos).filter(([k, v]) => typeof v === "number").map(([k, v]) => `${k.replace(/_usd$/, "").replace(/_/g, " ")} ${fmtUsd(v as number, lang)}`).join(", ");
    const note = typeof f.indicadores_financieros_especificos.observacion === "string" ? ` ${f.indicadores_financieros_especificos.observacion}` : typeof f.indicadores_financieros_especificos.importante === "string" ? ` ${f.indicadores_financieros_especificos.importante}` : "";
    return es ? `Presupuesto operativo 2026 de ${fmtUsd(f.presupuesto_operativo_2026_usd, lang)}, gastados ${fmtUsd(f.gasto_acumulado_2026_usd, lang)} (${fmtNum(f.ejecucion_presupuestaria_porcentaje, lang)}% de ejecución) y un saldo de ${fmtUsd(f.saldo_operativo_usd, lang)}.${extra ? ` Detalle: ${extra}.` : ""}${note}` : `2026 operating budget of ${fmtUsd(f.presupuesto_operativo_2026_usd, lang)}, ${fmtUsd(f.gasto_acumulado_2026_usd, lang)} spent (${fmtNum(f.ejecucion_presupuestaria_porcentaje, lang)}% executed) and a balance of ${fmtUsd(f.saldo_operativo_usd, lang)}.${extra ? ` Detail: ${extra}.` : ""}${note}`;
  }
  if (has(q, "proyecto", "project", "hito", "milestone", "iniciativa", "initiative")) {
    const pl = o.proyectos.map((p) => `${p.nombre} (${stateLabel(p.estado, lang).toLowerCase()}, ${p.avance_porcentaje}%, ${fmtUsd(p.costo_operativo_estimado_usd, lang)}; ${es ? "próximo hito" : "next milestone"} ${fmtDate(p.fecha_proximo_hito, lang)}: ${p.proximo_hito.replace(/\.$/, "")})`).join(". ");
    return es ? `${o.proyectos.length} proyectos: ${pl}.` : `${o.proyectos.length} projects: ${pl}.`;
  }
  if (has(q, "solicitud", "request", "ticket", "sla")) return es ? `${o.solicitudes.abiertas} solicitudes abiertas, ${o.solicitudes.de_las_abiertas_vencidas} vencidas, y ${o.solicitudes.resueltas_en_octubre} resueltas en octubre.` : `${o.solicitudes.abiertas} open requests, ${o.solicitudes.de_las_abiertas_vencidas} overdue, and ${o.solicitudes.resueltas_en_octubre} resolved in October.`;
  if (has(q, "equipo", "team", "personas", "people", "gente", "staff")) return es ? `${o.equipo.personas_adscritas_directamente} personas adscritas directamente, con perfiles de ${o.equipo.perfiles_referenciales.join(", ")}.` : `${o.equipo.personas_adscritas_directamente} people directly assigned, with ${o.equipo.perfiles_referenciales.join(", ")} profiles.`;
  // summary
  const low = o.kpis.filter((k) => k.cumplimiento_porcentaje < 100).length;
  return es
    ? `${o.nombre} (${LIGHT_LABEL[o.estado_semaforo]?.es.toLowerCase()}): ${o.equipo.personas_adscritas_directamente} personas, presupuesto ${fmtUsd(f.presupuesto_operativo_2026_usd, lang)} con ${fmtNum(f.ejecucion_presupuestaria_porcentaje, lang)}% ejecutado, ${low} de ${o.kpis.length} indicadores bajo la meta, ${o.proyectos.length} proyectos y ${o.solicitudes.abiertas} solicitudes abiertas (${o.solicitudes.de_las_abiertas_vencidas} vencidas). Pregúntame por indicadores, finanzas, proyectos, alertas o solicitudes.`
    : `${o.nombre} (${LIGHT_LABEL[o.estado_semaforo]?.en.toLowerCase()}): ${o.equipo.personas_adscritas_directamente} people, budget ${fmtUsd(f.presupuesto_operativo_2026_usd, lang)} with ${fmtNum(f.ejecucion_presupuestaria_porcentaje, lang)}% executed, ${low} of ${o.kpis.length} indicators below target, ${o.proyectos.length} projects and ${o.solicitudes.abiertas} open requests (${o.solicitudes.de_las_abiertas_vencidas} overdue). Ask me about indicators, finances, projects, alerts or requests.`;
}

function answerVp(q: string, lang: Lang): string {
  const es = lang === "es";
  const offs = principalOffices();
  if (has(q, "simul", "real", "fuente", "source")) return es ? `Son datos de demostración (corte ${MGMT.fecha_corte}), no registros reales de la USFQ.` : `This is demo data (cut-off ${MGMT.fecha_corte}), not USFQ's real records.`;
  if (has(q, "alerta", "alert", "vencid", "overdue", "riesgo", "risk", "atencion", "attention", "semaforo", "urgente")) {
    const over = offs.map((o) => [o.nombre, o.solicitudes.de_las_abiertas_vencidas] as const).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
    const high = offs.flatMap((o) => o.alertas.filter((a) => a.nivel === "alta").map((a) => `${o.nombre}: ${a.descripcion.replace(/\.$/, "")}`));
    return es ? `Solicitudes vencidas por oficina: ${over.map(([n, c]) => `${n} ${c}`).join(", ")}. Alertas altas: ${high.join("; ")}.` : `Overdue requests by office: ${over.map(([n, c]) => `${n} ${c}`).join(", ")}. High alerts: ${high.join("; ")}.`;
  }
  if (has(q, "presupuesto", "budget", "gasto", "spend", "ejecucion", "execution", "saldo", "financ")) {
    const l = [...offs].sort((a, b) => b.finanzas.presupuesto_operativo_2026_usd - a.finanzas.presupuesto_operativo_2026_usd).map((o) => `${o.nombre} ${fmtUsd(o.finanzas.presupuesto_operativo_2026_usd, lang)} (${fmtNum(o.finanzas.ejecucion_presupuestaria_porcentaje, lang)}%)`).join(", ");
    return es ? `Presupuesto operativo anual ${fmtUsd(VP.presupuesto_operativo_anual_usd, lang)}, gastados ${fmtUsd(VP.gasto_operativo_acumulado_usd, lang)} (${fmtNum(VP.ejecucion_presupuestaria_porcentaje, lang)}%), saldo ${fmtUsd(VP.saldo_operativo_usd, lang)}. Por oficina: ${l}. ${VP.nota_consolidacion}` : `Annual operating budget ${fmtUsd(VP.presupuesto_operativo_anual_usd, lang)}, ${fmtUsd(VP.gasto_operativo_acumulado_usd, lang)} spent (${fmtNum(VP.ejecucion_presupuestaria_porcentaje, lang)}%), balance ${fmtUsd(VP.saldo_operativo_usd, lang)}. By office: ${l}.`;
  }
  if (has(q, "indicador", "kpi", "meta", "debajo", "below")) {
    const low = offs.flatMap((o) => o.kpis.filter((k) => k.cumplimiento_porcentaje < 85).map((k) => `${o.nombre}: ${k.nombre} ${fmtNum(k.cumplimiento_porcentaje, lang)}%`));
    return es ? `Indicadores con menos del 85% de cumplimiento: ${low.join("; ")}.` : `Indicators under 85% of target: ${low.join("; ")}.`;
  }
  if (has(q, "donac", "donation", "next", "pipeline")) return es ? `USFQ NEXT lleva ${fmtUsd(VP.donaciones_monetarias_recibidas_simuladas_usd, lang)} en donaciones monetarias (simuladas) y un pipeline potencial de ${fmtUsd(1450000, lang)}; esto no se suma a los ingresos operacionales.` : `USFQ NEXT has ${fmtUsd(VP.donaciones_monetarias_recibidas_simuladas_usd, lang)} in (simulated) monetary donations and a potential pipeline of ${fmtUsd(1450000, lang)}; this is kept apart from operating revenue.`;
  if (has(q, "proyecto", "project")) {
    const ps = offs.flatMap((o) => o.proyectos.map((p) => ({ ...p, office: o.nombre }))).sort((a, b) => a.fecha_proximo_hito.localeCompare(b.fecha_proximo_hito));
    return es ? `${ps.length} proyectos en las seis oficinas. Los hitos más próximos: ${ps.slice(0, 4).map((p) => `${p.nombre} (${p.office}, ${fmtDate(p.fecha_proximo_hito, lang)})`).join("; ")}.` : `${ps.length} projects across the six offices. Nearest milestones: ${ps.slice(0, 4).map((p) => `${p.nombre} (${p.office}, ${fmtDate(p.fecha_proximo_hito, lang)})`).join("; ")}.`;
  }
  const att = offs.filter((o) => o.estado_semaforo !== "verde").map((o) => o.nombre);
  return es
    ? `${VP.nombre}: ${VP.oficinas_principales} oficinas y ${VP.subunidades} subunidades, ${VP.colaboradores_simulados_total} colaboradores. Presupuesto ${fmtUsd(VP.presupuesto_operativo_anual_usd, lang)} con ${fmtNum(VP.ejecucion_presupuestaria_porcentaje, lang)}% ejecutado, ${VP.solicitudes_abiertas_consolidadas} solicitudes abiertas. En atención: ${att.join(", ")}. Pregúntame por alertas, presupuesto, indicadores o proyectos.`
    : `${VP.nombre}: ${VP.oficinas_principales} offices and ${VP.subunidades} sub-units, ${VP.colaboradores_simulados_total} staff. Budget ${fmtUsd(VP.presupuesto_operativo_anual_usd, lang)} with ${fmtNum(VP.ejecucion_presupuestaria_porcentaje, lang)}% executed, ${VP.solicitudes_abiertas_consolidadas} open requests. Needing attention: ${att.join(", ")}. Ask me about alerts, budget, indicators or projects.`;
}
