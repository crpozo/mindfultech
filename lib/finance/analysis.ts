/**
 * Cálculos derivados: resumen por mes, patrimonio y el diagnóstico.
 *
 * El diagnóstico se computa aquí, en el navegador, con reglas explícitas. No es
 * un modelo: es aritmética con criterio, y tiene la ventaja de que siempre da
 * el mismo resultado con los mismos números y se puede auditar leyendo esta
 * función. Para la lectura de un modelo está `claudePrompt`, que arma el
 * paquete listo para pegar en Claude.
 */

import type { Debt, FinanceState, Receivable, Txn } from "./store";

export interface MonthSummary {
  month: string;
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
  count: number;
  byCategory: Record<string, number>;
  topMerchants: Record<string, number>;
}

export interface NetWorth {
  liquid: number;
  invested: number;
  assets: number;
  debt: number;
  monthlyDebtPayment: number;
  /** Obligaciones fijas recurrentes que no son deuda (IESS, seguros). */
  monthlyCommitments: number;
  netWorth: number;
  receivablesPending: number;
  netWorthWithReceivables: number;
  runwayMonths: number;
}

export interface PlanStep {
  title: string;
  detail: string;
  /** USD a destinar ahora; 0 cuando el paso no es un movimiento de dinero. */
  amount: number;
  when: "ahora" | "despues" | "listo";
}

export interface CapitalPlan {
  steps: PlanStep[];
  /** La simulación que responde “¿y si abono a la deuda hoy?”. */
  tradeoff: string;
}

export interface Finding {
  tone: "good" | "warn" | "risk";
  title: string;
  detail: string;
}

export interface Diagnosis {
  score: number;
  verdict: "excelente" | "bien" | "atencion" | "riesgo";
  headline: string;
  findings: Finding[];
  actions: { title: string; why: string }[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Mes calendario en hora de Ecuador (UTC-5, sin horario de verano). */
export function monthOf(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 7);
  const ec = new Date(d.getTime() - 5 * 3600 * 1000);
  return `${ec.getUTCFullYear()}-${String(ec.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function currentMonth(): string {
  return monthOf(new Date().toISOString());
}

export function lastMonths(count: number, end = currentMonth()): string[] {
  const [y0, m0] = end.split("-").map(Number);
  const out: string[] = [];
  let y = y0;
  let m = m0;
  for (let i = 0; i < count; i++) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m -= 1;
    if (m === 0) {
      y -= 1;
      m = 12;
    }
  }
  return out.reverse();
}

export function summarizeMonth(month: string, txns: Txn[]): MonthSummary {
  let income = 0;
  let expense = 0;
  let count = 0;
  const byCategory: Record<string, number> = {};
  const byMerchant: Record<string, number> = {};

  for (const t of txns) {
    if (t.excluded || monthOf(t.date) !== month) continue;
    count++;
    if (t.kind === "income") {
      income += t.amount;
      continue;
    }
    expense += t.amount;
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
    byMerchant[t.merchant] = (byMerchant[t.merchant] ?? 0) + t.amount;
  }

  const net = income - expense;
  return {
    month,
    income: round2(income),
    expense: round2(expense),
    net: round2(net),
    savingsRate: income > 0 ? round2((net / income) * 100) : 0,
    count,
    byCategory: Object.fromEntries(
      Object.entries(byCategory)
        .map(([k, v]) => [k, round2(v)])
        .sort((a, b) => (b[1] as number) - (a[1] as number)),
    ),
    topMerchants: Object.fromEntries(
      Object.entries(byMerchant)
        .map(([k, v]) => [k, round2(v)])
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 10),
    ),
  };
}

export function summarize(state: FinanceState, months = 6): MonthSummary[] {
  return lastMonths(months).map((m) => summarizeMonth(m, state.transactions));
}

/**
 * Gasto mensual de referencia — el denominador del runway, así que equivocarlo
 * distorsiona el número más importante del tablero.
 *
 * Manda el promedio de meses cerrados con movimientos. Sin historial vale más
 * el gasto que el dueño declara que la suma de los presupuestos por rubro:
 * esos cubren una parte del gasto, no todo, y usarlos como total infla el
 * runway. La suma presupuesto + cuota de deuda queda como último recurso.
 *
 * Los compromisos fijos se suman solo a las estimaciones declaradas, nunca al
 * promedio medido: ahí ya vienen dentro de los movimientos del mes, y contarlos
 * otra vez encogería el runway con un gasto que no existe.
 */
export function baselineExpense(
  state: FinanceState,
  summaries: MonthSummary[],
): number {
  const commitments = state.commitments.reduce((s, c) => s + c.amount, 0);
  const closed = summaries.slice(0, -1).filter((m) => m.count > 0);
  if (closed.length)
    return round2(closed.reduce((s, m) => s + m.expense, 0) / closed.length);
  if (state.settings.monthlyExpenseEstimate > 0)
    return round2(state.settings.monthlyExpenseEstimate + commitments);
  const current = summaries[summaries.length - 1];
  if (current && current.expense > 0) return current.expense;
  const budget = Object.values(state.settings.budgets).reduce(
    (s, v) => s + v,
    0,
  );
  const debt = state.debts.reduce((s, d) => s + d.monthlyPayment, 0);
  return round2(budget + debt + commitments) || 0;
}

export function netWorth(state: FinanceState, baseline: number): NetWorth {
  const liquid = state.accounts
    .filter((a) => a.kind !== "investment")
    .reduce((s, a) => s + a.balance, 0);
  const invested = state.accounts
    .filter((a) => a.kind === "investment")
    .reduce((s, a) => s + a.balance, 0);
  const debt = state.debts.reduce((s, d) => s + d.balance, 0);
  const monthlyDebtPayment = state.debts.reduce(
    (s, d) => s + d.monthlyPayment,
    0,
  );
  const monthlyCommitments = state.commitments.reduce(
    (s, c) => s + c.amount,
    0,
  );
  const pending = state.receivables
    .filter((r) => r.status !== "paid")
    .reduce((s, r) => s + r.amount, 0);
  const assets = liquid + invested;
  return {
    liquid: round2(liquid),
    invested: round2(invested),
    assets: round2(assets),
    debt: round2(debt),
    monthlyDebtPayment: round2(monthlyDebtPayment),
    monthlyCommitments: round2(monthlyCommitments),
    netWorth: round2(assets - debt),
    receivablesPending: round2(pending),
    netWorthWithReceivables: round2(assets - debt + pending),
    runwayMonths: baseline > 0 ? round2(liquid / baseline) : 0,
  };
}

// ------------------------------------------------------------ diagnóstico ---

/**
 * Reglas, en orden de lo que más pesa para alguien que factura por proyecto:
 * cuánto aguanta el efectivo, cuánto depende de un solo cliente, y si la
 * cartera por cobrar crece más rápido de lo que se cobra.
 */
export function diagnose(
  state: FinanceState,
  summaries: MonthSummary[],
): Diagnosis {
  const m = (v: number) => money(v);
  const baseline = baselineExpense(state, summaries);
  const nw = netWorth(state, baseline);
  const findings: Finding[] = [];
  const actions: { title: string; why: string }[] = [];
  let score = 60;

  // 1. Runway — el número más honesto sin sueldo fijo.
  const rw = nw.runwayMonths.toFixed(1);
  if (nw.runwayMonths >= 6) {
    score += 18;
    findings.push({
      tone: "good",
      title: `Runway de ${rw} meses`,
      detail:
        "Tu efectivo aguanta medio año sin un solo cobro nuevo. Ese es el colchón que da estabilidad real.",
    });
  } else if (nw.runwayMonths >= 3) {
    score += 6;
    findings.push({
      tone: "warn",
      title: `Runway de ${rw} meses`,
      detail: `Aguantas ${rw} meses gastando ${m(baseline)} al mes. Con ingreso por proyecto, la meta razonable son 6.`,
    });
    actions.push({
      title: `Llevar el colchón a ${m(baseline * 6)}`,
      why: `Seis meses de gasto. Hoy te faltan ${m(Math.max(0, baseline * 6 - nw.liquid))} para llegar.`,
    });
  } else if (nw.runwayMonths > 0) {
    score -= 20;
    findings.push({
      tone: "risk",
      title: `Runway de solo ${rw} meses`,
      detail:
        "Un mes sin proyecto nuevo te deja contra la pared. Esto es lo primero que hay que corregir.",
    });
    actions.push({
      title: "Reconstruir el colchón antes que cualquier otra cosa",
      why: "Por debajo de 3 meses, cualquier retraso de un cliente se convierte en un problema de caja.",
    });
  }

  // 2. Cartera por cobrar frente al patrimonio real.
  if (nw.receivablesPending > 0) {
    const ratio =
      nw.netWorth > 0 ? nw.receivablesPending / nw.netWorth : Infinity;
    const top = [...state.receivables]
      .filter((r) => r.status !== "paid")
      .sort((a, b) => b.amount - a.amount)[0];
    if (ratio > 1.5) {
      score -= 12;
      findings.push({
        tone: "risk",
        title: `${m(nw.receivablesPending)} por cobrar contra ${m(nw.netWorth)} de patrimonio`,
        detail:
          "Casi todo tu patrimonio está en facturas que otros todavía no pagan. No es problema de ingresos: es de cobranza.",
      });
      if (top) {
        actions.push({
          title: `Cobrar ${top.client} (${m(top.amount)})`,
          why: "Es tu factura más grande pendiente. Cobrarla mueve el runway más que cualquier recorte de gasto.",
        });
      }
    } else {
      findings.push({
        tone: "warn",
        title: `${m(nw.receivablesPending)} facturados sin cobrar`,
        detail:
          "Dinero ganado que todavía no es tuyo. Revísalo cada semana, no cada mes.",
      });
    }
  }

  // 3. Concentración de clientes.
  const byClient = new Map<string, number>();
  for (const r of state.receivables.filter((x) => x.status !== "paid")) {
    byClient.set(r.client, (byClient.get(r.client) ?? 0) + r.amount);
  }
  for (const tx of state.transactions.filter(
    (x) => x.kind === "income" && !x.excluded,
  )) {
    byClient.set(tx.merchant, (byClient.get(tx.merchant) ?? 0) + tx.amount);
  }
  const clientTotal = [...byClient.values()].reduce((s, v) => s + v, 0);
  const biggest = [...byClient.entries()].sort((a, b) => b[1] - a[1])[0];
  if (biggest && clientTotal > 0 && biggest[1] / clientTotal > 0.4) {
    score -= 8;
    const pct = Math.round((biggest[1] / clientTotal) * 100);
    findings.push({
      tone: "warn",
      title: `${biggest[0]} pesa ${pct}% de tu facturación`,
      detail:
        "Un cliente que se enfría te mueve el piso. Diversificar vale tanto como vender más.",
    });
  }

  // 4. Carga de deuda sobre ingreso.
  const incomeMonths = summaries.filter((x) => x.income > 0);
  const avgIncome = incomeMonths.length
    ? incomeMonths.reduce((s, x) => s + x.income, 0) / incomeMonths.length
    : state.settings.monthlyIncomeGoal;
  if (nw.monthlyDebtPayment > 0 && avgIncome > 0) {
    const load = Math.round((nw.monthlyDebtPayment / avgIncome) * 100);
    if (load > 25) {
      score -= 10;
      findings.push({
        tone: "risk",
        title: `Las cuotas se llevan ${load}% de tu ingreso`,
        detail: `${m(nw.monthlyDebtPayment)} al mes en deuda. Sobre 25% del ingreso empieza a comerse la capacidad de ahorrar.`,
      });
    } else {
      score += 5;
      findings.push({
        tone: "good",
        title: `Deuda bajo control (${load}% del ingreso)`,
        detail: `${m(nw.debt)} ${"de saldo"}, ${m(nw.monthlyDebtPayment)}/${"mes"}.`,
      });
    }
  }

  // 5. Tasa de ahorro del mes en curso.
  const current = summaries[summaries.length - 1];
  if (current && current.income > 0) {
    const goal = state.settings.savingsRateGoal;
    const rate = current.savingsRate.toFixed(0);
    if (current.savingsRate >= goal) {
      score += 10;
      findings.push({
        tone: "good",
        title: `Ahorro de ${rate}% este mes`,
        detail: `Por encima de tu meta de ${goal}%.`,
      });
    } else if (current.savingsRate < 0) {
      score -= 12;
      findings.push({
        tone: "risk",
        title: "Este mes gastaste más de lo que entró",
        detail: `Neto de ${m(current.net)}. Si se repite, sale del colchón.`,
      });
    } else {
      const gap = (current.income * goal) / 100 - current.net;
      findings.push({
        tone: "warn",
        title: `Ahorro de ${rate}%, meta ${goal}%`,
        detail: `Te faltan ${m(gap)} para llegar a la meta este mes.`,
      });
    }
  }

  // 6. Presupuestos excedidos.
  if (current) {
    for (const [cat, limit] of Object.entries(state.settings.budgets)) {
      const spent = current.byCategory[cat] ?? 0;
      if (limit > 0 && spent > limit) {
        score -= 3;
        findings.push({
          tone: "warn",
          title: `${cat}: ${m(spent)} sobre un presupuesto de ${m(limit)}`,
          detail: `Excedido en ${m(spent - limit)}.`,
        });
      }
    }
  }

  // 7. El IESS: no es un gasto, es un reloj que corre.
  if (/iess/i.test(state.settings.profile)) {
    const aportando = state.transactions.some((x) => /iess/i.test(x.merchant));
    if (!aportando) {
      actions.push({
        title: "Afiliarte al IESS y registrar la aportación mensual",
        why: "El BIESS pide 2-3 años de aportaciones continuas para un crédito hipotecario. Cada mes sin aportar corre la fecha en que puedes comprar departamento, el monto importa menos que arrancar el reloj.",
      });
      findings.push({
        tone: "warn",
        title: "Sin aportaciones al IESS registradas",
        detail:
          "Es el requisito de entrada para el crédito de vivienda que quieres. No aparece todavía en tus movimientos.",
      });
    }
  }

  // 8. Sin movimientos todavía.
  if (state.transactions.length === 0) {
    findings.push({
      tone: "warn",
      title: "Todavía no hay movimientos cargados",
      detail:
        "El patrimonio ya se lee, pero las tendencias y la tasa de ahorro necesitan que registres ingresos y gastos.",
    });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const verdict: Diagnosis["verdict"] =
    score >= 81
      ? "excelente"
      : score >= 61
        ? "bien"
        : score >= 41
          ? "atencion"
          : "riesgo";

  const headline =
    nw.runwayMonths > 0 && nw.runwayMonths < 3
      ? "Tu colchón es corto: prioriza caja sobre cualquier otra cosa."
      : nw.receivablesPending > nw.netWorth && nw.netWorth > 0
        ? "Ganas bien, pero tu patrimonio está atrapado en facturas sin cobrar."
        : nw.runwayMonths >= 6
          ? "Base sólida: el colchón aguanta y la deuda no aprieta."
          : "Vas encaminado; el siguiente salto está en el colchón y la cobranza.";

  return { score, verdict, headline, findings, actions };
}

function money(v: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(v) ? v : 0);
}

// ------------------------------------------------- qué hacer con el dinero --

/**
 * Orden de asignación del efectivo disponible.
 *
 * La regla de fondo: para quien factura por proyecto, el colchón se construye
 * ANTES de abonar a una deuda amortizada. Prepagar un préstamo de auto no baja
 * la cuota — acorta el plazo — así que el gasto mensual sigue igual y el
 * colchón queda a la mitad. Es cambiar liquidez, que es lo que protege de un
 * mes sin proyecto, por un ahorro de intereses que llega mucho después.
 */
export function capitalPlan(
  state: FinanceState,
  summaries: MonthSummary[],
): CapitalPlan {
  const baseline = baselineExpense(state, summaries);
  const nw = netWorth(state, baseline);
  const m = (v: number) => money(v);

  const target = round2(baseline * 6);
  const gap = round2(Math.max(0, target - nw.liquid));
  const surplus = round2(Math.max(0, nw.liquid - target));
  const steps: PlanStep[] = [];

  // 1. Colchón de seis meses.
  if (gap > 0) {
    steps.push({
      title: `Completar el colchón hasta ${m(target)}`,
      detail: `Seis meses de tu gasto (${m(baseline)} al mes). Tienes ${m(nw.liquid)} disponibles: te faltan ${m(gap)}. Mientras esto no esté, cualquier otro destino del dinero compite con tu tranquilidad.`,
      amount: gap,
      when: "ahora",
    });
  } else {
    steps.push({
      title: "Colchón de seis meses: listo",
      detail: `${m(nw.liquid)} disponibles contra ${m(target)} de meta.`,
      amount: 0,
      when: "listo",
    });
  }

  // 2. El IESS: el reloj corre aunque el monto sea chico.
  const contributing = state.transactions.some((x) => /iess/i.test(x.merchant));
  if (/iess/i.test(state.settings.profile) && !contributing) {
    steps.push({
      title: "Empezar a aportar al IESS este mes",
      detail:
        "No compite con el colchón: la aportación mínima es un gasto mensual pequeño, y lo que compra es tiempo. El BIESS cuenta meses de aportación continua, no montos, así que empezar hoy adelanta la fecha en que calificas para el crédito de vivienda. Registra el pago aquí cada mes para que el conteo quede a la vista.",
      amount: 0,
      when: "ahora",
    });
  }

  // 3. Deuda: solo con el excedente sobre el colchón.
  if (nw.debt > 0) {
    if (surplus > 0) {
      const pay = round2(Math.min(surplus, nw.debt));
      steps.push({
        title: `Abonar ${m(pay)} al capital de la deuda`,
        detail:
          "Ya tienes el colchón completo, así que este excedente sí puede ir a la deuda. Pide que el abono se aplique a capital y que reduzca el plazo o la cuota, dilo explícitamente, porque por defecto muchos bancos lo aplican a cuotas futuras y no cambia nada.",
        amount: pay,
        when: "ahora",
      });
    } else {
      steps.push({
        title: "Abonar a la deuda: todavía no",
        detail: `Con ${m(nw.liquid)} en caja, cada dólar que abones sale del colchón. El disparador es claro: cuando tu efectivo pase de ${m(target)}, lo que sobre va al capital de la deuda.`,
        amount: 0,
        when: "despues",
      });
    }
  }

  // 4. Cobrar: la palanca más grande cuando la cartera pesa.
  if (nw.receivablesPending > 0) {
    const after = round2(nw.liquid + nw.receivablesPending);
    steps.push({
      title: `Cobrar los ${m(nw.receivablesPending)} pendientes`,
      detail: `Es la palanca más grande que tienes hoy: si entra todo, tu efectivo pasa a ${m(after)} y el runway a ${(after / (baseline || 1)).toFixed(1)} meses. Ningún recorte de gasto se le acerca.`,
      amount: nw.receivablesPending,
      when: "ahora",
    });
  }

  // 5. El trade-off explícito de prepagar hoy.
  let tradeoff = "";
  if (nw.debt > 0 && baseline > 0) {
    const half = round2(nw.debt / 2);
    const afterRunway = round2(Math.max(0, nw.liquid - half) / baseline);
    tradeoff = `Si abonaras hoy la mitad de la deuda (${m(half)}), tu runway pasaría de ${nw.runwayMonths.toFixed(1)} a ${afterRunway.toFixed(1)} meses y la cuota seguiría en ${m(nw.monthlyDebtPayment)}: en un préstamo amortizado el abono acorta el plazo, no el pago mensual. Cambiarías la liquidez que te protege de un mes sin proyecto por un ahorro de intereses que recién se siente al final del crédito.`;
  }

  return { steps, tradeoff };
}

// ------------------------------------------------- paquete para el modelo ---

/**
 * Arma el prompt con los datos ya agregados para pegarlo en Claude. Se mandan
 * agregados y los movimientos más grandes, no el listado completo: es lo que
 * hace falta para opinar, y evita pegar cientos de líneas.
 */
export function claudePrompt(
  state: FinanceState,
  summaries: MonthSummary[],
): string {
  const baseline = baselineExpense(state, summaries);
  const nw = netWorth(state, baseline);
  const biggest = [...state.transactions]
    .filter((t) => !t.excluded && t.kind === "expense")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 20)
    .map((t) => ({
      fecha: t.date.slice(0, 10),
      comercio: t.merchant,
      monto: t.amount,
      rubro: t.category,
    }));

  const payload = {
    perfil: state.settings.profile,
    metas: {
      ingresoMensualObjetivo: state.settings.monthlyIncomeGoal,
      tasaAhorroObjetivo: state.settings.savingsRateGoal,
      fondoEmergenciaObjetivo: state.settings.emergencyFundGoal,
    },
    patrimonio: nw,
    gastoMensualDeReferencia: baseline,
    cuentas: state.accounts,
    deudas: state.debts,
    compromisosFijosMensuales: state.commitments,
    porCobrar: state.receivables.filter((r) => r.status !== "paid"),
    meses: summaries.map((m) => ({
      mes: m.month,
      ingresos: m.income,
      gastos: m.expense,
      neto: m.net,
      tasaAhorro: m.savingsRate,
      porRubro: m.byCategory,
    })),
    presupuestos: state.settings.budgets,
    mayoresGastos: biggest,
  };

  return `Eres mi analista financiero personal. Analiza estos datos reales y dime, sin rodeos, qué debo corregir.

Contexto que importa:
- Mi ingreso es freelance por proyectos: irregular por naturaleza. No leas un mes flojo como deterioro ni uno bueno como tendencia.
- Lo que está en "porCobrar" es dinero facturado y no cobrado: no cuenta como patrimonio hasta que entra.
- El runway (meses que aguanta el efectivo sin cobros nuevos) me importa más que la foto de un mes.
- "compromisosFijosMensuales" son obligaciones que se pagan cada mes y no negocio: el aporte al IESS entra ahí porque cortarlo reinicia el historial de aportaciones que el BIESS pide para el crédito hipotecario. No lo propongas como recorte.
- No busco recomendaciones de instrumentos de inversión. Háblame de gasto, ahorro, flujo de caja, deuda y hábitos.

Dame: un veredicto de salud financiera de 0 a 100 con su justificación, lo que está a favor, lo que está en contra, y una lista de acciones concretas ordenadas por cuántos dólares al mes liberan. Si algo en los datos no alcanza para concluir, dilo en vez de estirarlo.

Datos (USD):
${JSON.stringify(payload, null, 1)}`;
}
