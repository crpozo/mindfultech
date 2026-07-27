"use client";

import * as React from "react";
import { useLang, LangToggle, type Lang } from "../i18n";
import { LockScreen } from "./LockScreen";
import { Patrimonio } from "./Patrimonio";
import { TrendChart, CategoryBars, HealthGauge, SERIES } from "./charts";
import {
  baselineExpense,
  capitalPlan,
  claudePrompt,
  currentMonth,
  diagnose,
  monthOf,
  netWorth,
  summarize,
  type MonthSummary,
} from "@/lib/finance/analysis";
import {
  categoriesFor,
  DEFAULT_PASSCODE,
  exportState,
  isUnlocked,
  loadState,
  parseImport,
  saveState,
  setPasscode,
  seedState,
  setUnlocked,
  uid,
  type FinanceState,
  type Kind,
  type Txn,
} from "@/lib/finance/store";
import { catLabel, fmtDate, fmtMonth, fmtMoney } from "@/lib/finance/format";

const MONO = "var(--mono)";
const INK = "var(--ink)";
const MUTED = "#8b8896";
const HAIRLINE = "1px solid rgba(14,13,18,.08)";

type Tab = "resumen" | "patrimonio" | "movimientos" | "ajustes";

// ------------------------------------------------------------ primitivas ---

function Card({
  title,
  subtitle,
  right,
  children,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "#fff",
        border: HAIRLINE,
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 18px 40px -32px rgba(14,13,18,.5)",
      }}
    >
      {(title || right) && (
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            {title && <h2 style={{ fontSize: 15, fontWeight: 500, color: INK, margin: 0 }}>{title}</h2>}
            {subtitle && <p style={{ fontSize: 12.5, color: MUTED, margin: "3px 0 0", lineHeight: 1.5 }}>{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

function Kpi({
  label,
  value,
  delta,
  deltaGoodWhen = "up",
  hint,
  accent,
  lang,
}: {
  label: string;
  value: string;
  delta?: number;
  deltaGoodWhen?: "up" | "down";
  hint?: string;
  accent?: string;
  lang: Lang;
}) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta) && Math.abs(delta) > 0.004;
  const up = (delta ?? 0) > 0;
  const good = deltaGoodWhen === "up" ? up : !up;
  return (
    <div style={{ background: "#fff", border: HAIRLINE, borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        {accent && <span style={{ width: 8, height: 8, borderRadius: 2, background: accent, flex: "none" }} />}
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".18em", color: MUTED, textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 25, fontWeight: 500, color: INK, marginTop: 8, letterSpacing: "-.02em" }}>{value}</div>
      {hasDelta ? (
        <div style={{ fontSize: 12, color: good ? "#006300" : "#c2410c", marginTop: 5 }}>
          {/* flecha + texto: el color nunca es la única señal */}
          {up ? "▲" : "▼"} {fmtMoney(Math.abs(delta as number), lang)}{" "}
          <span style={{ color: MUTED }}>{lang === "es" ? "vs mes anterior" : "vs last month"}</span>
        </div>
      ) : (
        hint && <div style={{ fontSize: 12, color: MUTED, marginTop: 5 }}>{hint}</div>
      )}
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "soft",
  small,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "dark" | "soft" | "ghost";
  small?: boolean;
  type?: "button" | "submit";
}) {
  const styles: Record<string, React.CSSProperties> = {
    dark: { background: "#0e0d12", color: "#fff", border: "none" },
    soft: { background: "#f1f2f6", color: INK, border: "none" },
    ghost: { background: "transparent", color: MUTED, border: HAIRLINE },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={variant === "dark" ? "btn-dark" : variant === "soft" ? "btn-soft" : undefined}
      style={{
        ...styles[variant],
        borderRadius: 9,
        padding: small ? "7px 12px" : "10px 16px",
        fontSize: small ? 12.5 : 14,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: HAIRLINE,
  borderRadius: 9,
  padding: "9px 11px",
  fontSize: 13.5,
  color: INK,
  background: "#fff",
  fontFamily: "inherit",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 11.5, color: MUTED, marginBottom: 5 }}>{label}</span>
      {children}
    </label>
  );
}

// -------------------------------------------------------------- alta rápida --

/**
 * La entrada es manual, así que registrar tiene que costar menos que no
 * hacerlo: una sola fila, sin abrir nada, y al guardar el foco vuelve al monto
 * para poder encadenar varios seguidos.
 */
function QuickAdd({
  lang,
  merchants,
  onAdd,
}: {
  lang: Lang;
  merchants: string[];
  onAdd: (t: Omit<Txn, "id">) => void;
}) {
  const es = lang === "es";
  const [kind, setKind] = React.useState<Kind>("expense");
  const [amount, setAmount] = React.useState("");
  const [merchant, setMerchant] = React.useState("");
  const [category, setCategory] = React.useState("otros");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const amountRef = React.useRef<HTMLInputElement>(null);

  const pool = categoriesFor(kind);
  React.useEffect(() => {
    if (!pool.includes(category)) setCategory(pool[0]);
  }, [kind, pool, category]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0 || !merchant.trim()) return;
    onAdd({
      date: new Date(`${date}T12:00:00`).toISOString(),
      amount: value,
      kind,
      category,
      merchant: merchant.trim(),
      notes: "",
      excluded: false,
    });
    setAmount("");
    setMerchant("");
    amountRef.current?.focus();
  };

  return (
    <form
      onSubmit={submit}
      style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", alignItems: "end" }}
    >
      <Field label={es ? "Tipo" : "Type"}>
        <select value={kind} onChange={(e) => setKind(e.target.value as Kind)} style={inputStyle}>
          <option value="expense">{es ? "Gasto" : "Expense"}</option>
          <option value="income">{es ? "Ingreso" : "Income"}</option>
        </select>
      </Field>
      <Field label={es ? "Monto (USD)" : "Amount (USD)"}>
        <input
          ref={amountRef}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="0,00"
          style={{ ...inputStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
        />
      </Field>
      <Field label={es ? "Descripción" : "Description"}>
        <input
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          list="mt-fin-merchants"
          placeholder={es ? "Supermaxi, Helixona…" : "Store, client…"}
          style={inputStyle}
        />
        <datalist id="mt-fin-merchants">
          {merchants.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </Field>
      <Field label={es ? "Rubro" : "Category"}>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
          {pool.map((c) => (
            <option key={c} value={c}>
              {catLabel(c, lang)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={es ? "Fecha" : "Date"}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
      </Field>
      <Button variant="dark" type="submit">
        {es ? "Registrar" : "Log it"}
      </Button>
    </form>
  );
}

// ------------------------------------------------------------------- app ---

export function FinanceApp() {
  const { lang } = useLang();
  const es = lang === "es";

  const [ready, setReady] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState<FinanceState | null>(null);
  const [tab, setTab] = React.useState<Tab>("resumen");
  const [month, setMonth] = React.useState(currentMonth());
  const [toast, setToast] = React.useState("");

  React.useEffect(() => {
    const unlocked = isUnlocked();
    setOpen(unlocked);
    if (unlocked) setState(loadState());
    setReady(true);
  }, []);

  const notify = React.useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3000);
  }, []);

  /** Toda mutación pasa por aquí: un único punto donde se persiste. */
  const update = React.useCallback(
    (fn: (s: FinanceState) => FinanceState) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = fn(prev);
        if (!saveState(next)) {
          notify(es ? "No se pudo guardar en este navegador." : "Couldn't save in this browser.");
        }
        return next;
      });
    },
    [es, notify]
  );

  const summaries: MonthSummary[] = React.useMemo(() => (state ? summarize(state, 6) : []), [state]);
  const baseline = React.useMemo(() => (state ? baselineExpense(state, summaries) : 0), [state, summaries]);
  const nw = React.useMemo(() => (state ? netWorth(state, baseline) : null), [state, baseline]);
  const diag = React.useMemo(() => (state ? diagnose(state, summaries, lang) : null), [state, summaries, lang]);
  const plan = React.useMemo(() => (state ? capitalPlan(state, summaries, lang) : null), [state, summaries, lang]);
  const merchants = React.useMemo(
    () => [...new Set((state?.transactions ?? []).map((t) => t.merchant))].sort(),
    [state]
  );

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7f8fb" }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: MUTED }}>
          {es ? "CARGANDO…" : "LOADING…"}
        </span>
      </div>
    );
  }

  if (!open || !state || !nw || !diag) {
    return (
      <LockScreen
        onUnlock={() => {
          setState(loadState());
          setOpen(true);
        }}
      />
    );
  }

  const currency = state.settings.currency;
  const cur = summaries[summaries.length - 1];
  const prev = summaries[summaries.length - 2];
  const deltas = {
    income: cur && prev ? cur.income - prev.income : 0,
    expense: cur && prev ? cur.expense - prev.expense : 0,
  };
  const monthTxns = state.transactions
    .filter((t) => monthOf(t.date) === month)
    .sort((a, b) => b.date.localeCompare(a.date));
  const monthOptions = [...new Set([...summaries.map((m) => m.month), month])].sort().reverse();

  const addTxn = (t: Omit<Txn, "id">) => {
    update((s) => ({ ...s, transactions: [...s.transactions, { ...t, id: uid() }] }));
    notify(es ? "Registrado." : "Logged.");
  };

  const copyForClaude = async () => {
    try {
      await navigator.clipboard.writeText(claudePrompt(state, summaries));
      notify(es ? "Copiado. Pégalo en Claude." : "Copied. Paste it into Claude.");
    } catch {
      notify(es ? "El navegador bloqueó el portapapeles." : "The browser blocked the clipboard.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fb", paddingBottom: 60 }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          background: "rgba(247,248,251,.9)",
          backdropFilter: "blur(10px)",
          borderBottom: HAIRLINE,
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "14px 22px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-mark.webp" alt="" width={26} height={26} />
          <div style={{ marginRight: "auto" }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: INK, lineHeight: 1.1 }}>{es ? "Finanzas" : "Finances"}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", color: MUTED, textTransform: "uppercase" }}>
              MindfulTech
            </div>
          </div>

          <nav style={{ display: "flex", gap: 2, background: "#eef0f5", padding: 3, borderRadius: 9, flexWrap: "wrap" }}>
            {(
              [
                ["resumen", es ? "Resumen" : "Overview"],
                ["patrimonio", es ? "Patrimonio" : "Net worth"],
                ["movimientos", es ? "Movimientos" : "Transactions"],
                ["ajustes", es ? "Ajustes" : "Settings"],
              ] as [Tab, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-current={tab === id}
                style={{
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 7,
                  padding: "7px 12px",
                  fontSize: 12.5,
                  background: tab === id ? "#0e0d12" : "transparent",
                  color: tab === id ? "#fff" : "#6c6a75",
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          <LangToggle />
          <Button
            variant="ghost"
            small
            onClick={() => {
              setUnlocked(false);
              setOpen(false);
            }}
          >
            {es ? "Bloquear" : "Lock"}
          </Button>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "22px 22px 0", display: "grid", gap: 18 }}>
        {tab === "resumen" && (
          <>
            <Card title={es ? "Registrar movimiento" : "Log a transaction"}>
              <QuickAdd lang={lang} merchants={merchants} onAdd={addTxn} />
            </Card>

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
              <Kpi
                lang={lang}
                accent={SERIES.income}
                label={es ? "Ingresos del mes" : "Income this month"}
                value={fmtMoney(cur?.income ?? 0, lang, currency)}
                delta={deltas.income}
                hint={es ? "registra tus cobros para ver la tendencia" : "log payments to see the trend"}
              />
              <Kpi
                lang={lang}
                accent={SERIES.expense}
                label={es ? "Gastos del mes" : "Expenses this month"}
                value={fmtMoney(cur?.expense ?? 0, lang, currency)}
                delta={deltas.expense}
                deltaGoodWhen="down"
                hint={`${es ? "referencia" : "baseline"} ${fmtMoney(baseline, lang, currency)}`}
              />
              <Kpi
                lang={lang}
                label={es ? "Patrimonio neto" : "Net worth"}
                value={fmtMoney(nw.netWorth, lang, currency)}
                hint={`${es ? "por cobrar" : "receivables"} ${fmtMoney(nw.receivablesPending, lang, currency)}`}
              />
              <Kpi
                lang={lang}
                label="Runway"
                value={`${nw.runwayMonths.toFixed(1)} ${es ? "meses" : "months"}`}
                hint={es ? "efectivo / gasto de referencia" : "cash / baseline burn"}
              />
            </div>

            <Card title={es ? "Ingresos, gastos y neto" : "Income, expenses and net"} subtitle={es ? "Últimos 6 meses" : "Last 6 months"}>
              {summaries.some((m) => m.count > 0) ? (
                <TrendChart months={summaries} lang={lang} />
              ) : (
                <p style={{ fontSize: 13.5, color: MUTED, margin: 0, lineHeight: 1.6 }}>
                  {es
                    ? "Aún no hay movimientos. Registra el primero arriba y el gráfico aparece solo."
                    : "No transactions yet. Log the first one above and the chart shows up."}
                </p>
              )}
            </Card>

            {plan && (
              <Card
                title={es ? "Qué hacer con el dinero" : "What to do with the money"}
                subtitle={
                  es
                    ? "Orden de asignación de tu efectivo, calculado con tus saldos y tu gasto."
                    : "Where your cash should go, in order, from your balances and your burn."
                }
              >
                <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 11 }}>
                  {plan.steps.map((step, i) => {
                    const tone =
                      step.when === "listo" ? "#0ca30c" : step.when === "despues" ? "#8b8896" : "#69c7b9";
                    const badge =
                      step.when === "listo"
                        ? es
                          ? "listo"
                          : "done"
                        : step.when === "despues"
                          ? es
                            ? "después"
                            : "later"
                          : es
                            ? "ahora"
                            : "now";
                    return (
                      <li
                        key={i}
                        style={{
                          border: HAIRLINE,
                          borderLeft: `3px solid ${tone}`,
                          borderRadius: 11,
                          padding: "12px 14px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, color: INK }}>{step.title}</span>
                          <span
                            style={{
                              fontFamily: MONO,
                              fontSize: 9.5,
                              letterSpacing: ".14em",
                              textTransform: "uppercase",
                              color: tone,
                              border: `1px solid ${tone}`,
                              borderRadius: 5,
                              padding: "2px 6px",
                            }}
                          >
                            {badge}
                          </span>
                          {step.amount > 0 && (
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: 14,
                                color: INK,
                                fontVariantNumeric: "tabular-nums",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {fmtMoney(step.amount, lang, currency)}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 12.5, color: MUTED, margin: "6px 0 0", lineHeight: 1.6 }}>{step.detail}</p>
                      </li>
                    );
                  })}
                </ol>
                {plan.tradeoff && (
                  <div
                    style={{
                      marginTop: 14,
                      background: "#fff7ed",
                      border: "1px solid #fed7aa",
                      borderRadius: 11,
                      padding: "12px 14px",
                      fontSize: 12.5,
                      color: "#9a3412",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong>{es ? "Si abonas a la deuda hoy" : "If you prepay the loan today"}</strong>
                    <br />
                    {plan.tradeoff}
                  </div>
                )}
              </Card>
            )}

            <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))" }}>
              <Card
                title={es ? "Diagnóstico" : "Diagnosis"}
                subtitle={
                  es
                    ? "Calculado aquí mismo con tus números; nada sale del navegador."
                    : "Computed right here from your numbers — nothing leaves the browser."
                }
                right={
                  <Button variant="soft" small onClick={() => void copyForClaude()}>
                    {es ? "Copiar para Claude" : "Copy for Claude"}
                  </Button>
                }
              >
                <HealthGauge score={diag.score} verdict={diag.verdict} lang={lang} />
                <p style={{ fontSize: 16, color: INK, margin: "18px 0 14px", lineHeight: 1.45 }}>{diag.headline}</p>

                <div style={{ display: "grid", gap: 9 }}>
                  {diag.findings.map((f, i) => {
                    const tone = { good: "#0ca30c", warn: "#fab219", risk: "#d03b3b" }[f.tone];
                    const mark = { good: "✓", warn: "!", risk: "▲" }[f.tone];
                    return (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        {/* marca + texto: el color acompaña, nunca informa solo */}
                        <span style={{ color: tone, fontSize: 12, lineHeight: "18px", width: 14, textAlign: "center", flex: "none" }}>
                          {mark}
                        </span>
                        <span>
                          <span style={{ fontSize: 13.5, color: INK, display: "block" }}>{f.title}</span>
                          <span style={{ fontSize: 12.5, color: MUTED, display: "block", marginTop: 2, lineHeight: 1.55 }}>
                            {f.detail}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>

                {diag.actions.length > 0 && (
                  <>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        letterSpacing: ".18em",
                        color: MUTED,
                        textTransform: "uppercase",
                        margin: "20px 0 9px",
                      }}
                    >
                      {es ? "Qué corregir" : "What to fix"}
                    </div>
                    <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                      {diag.actions.map((a, i) => (
                        <li key={i} style={{ border: HAIRLINE, borderRadius: 11, padding: "11px 13px", display: "flex", gap: 12 }}>
                          <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED, minWidth: 14, paddingTop: 2 }}>{i + 1}</span>
                          <span>
                            <span style={{ fontSize: 13.5, color: INK, display: "block" }}>{a.title}</span>
                            <span style={{ fontSize: 12.5, color: MUTED, display: "block", marginTop: 3, lineHeight: 1.55 }}>
                              {a.why}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </>
                )}

                <p style={{ fontSize: 11, color: "#9a97a6", margin: "18px 0 0", lineHeight: 1.5 }}>
                  {es
                    ? "Reglas de gasto, ahorro y flujo de caja aplicadas a tus cifras. No es asesoría de inversión."
                    : "Spending, saving and cash-flow rules applied to your figures. Not investment advice."}
                </p>
              </Card>

              <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
                <Card title={es ? "Gastos por rubro" : "Spending by category"} subtitle={cur ? fmtMonth(cur.month, lang) : ""}>
                  <CategoryBars byCategory={cur?.byCategory ?? {}} lang={lang} currency={currency} />
                </Card>

                {Object.keys(state.settings.budgets).length > 0 && cur && (
                  <Card title={es ? "Presupuestos" : "Budgets"}>
                    <div style={{ display: "grid", gap: 11 }}>
                      {Object.entries(state.settings.budgets).map(([category, limit]) => {
                        const spent = cur.byCategory[category] ?? 0;
                        const pct = limit > 0 ? (spent / limit) * 100 : 0;
                        const over = pct > 100;
                        const near = pct > 85 && !over;
                        const color = over ? "#d03b3b" : near ? "#fab219" : "#0ca30c";
                        return (
                          <div key={category}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                              <span style={{ color: "#52514e" }}>
                                {catLabel(category, lang)}
                                {over && <span style={{ color: "#d03b3b", marginLeft: 6 }}>⚠ {es ? "excedido" : "over"}</span>}
                              </span>
                              <span style={{ color: INK, fontVariantNumeric: "tabular-nums" }}>
                                {fmtMoney(spent, lang, currency)} / {fmtMoney(limit, lang, currency)}
                              </span>
                            </div>
                            <div style={{ height: 8, background: "#f1f2f6", borderRadius: 4, overflow: "hidden" }}>
                              <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: color, borderRadius: 4 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {cur && Object.keys(cur.topMerchants).length > 0 && (
                  <Card title={es ? "Dónde más gastaste" : "Top merchants"}>
                    <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 7 }}>
                      {Object.entries(cur.topMerchants)
                        .slice(0, 6)
                        .map(([m, v]) => (
                          <li key={m} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
                            <span style={{ color: "#52514e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {m}
                            </span>
                            <span style={{ color: INK, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                              {fmtMoney(v, lang, currency)}
                            </span>
                          </li>
                        ))}
                    </ol>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "patrimonio" && <Patrimonio lang={lang} state={state} nw={nw} baseline={baseline} update={update} />}

        {tab === "movimientos" && (
          <>
            <Card title={es ? "Registrar movimiento" : "Log a transaction"}>
              <QuickAdd lang={lang} merchants={merchants} onAdd={addTxn} />
            </Card>
            <Movimientos
              lang={lang}
              month={month}
              months={monthOptions}
              txns={monthTxns}
              currency={currency}
              onMonth={setMonth}
              onPatch={(id, changes) =>
                update((s) => ({ ...s, transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...changes } : t)) }))
              }
              onDelete={(id) => update((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }))}
            />
          </>
        )}

        {tab === "ajustes" && <Ajustes lang={lang} state={state} update={update} setState={setState} notify={notify} />}
      </main>

      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 26,
            transform: "translateX(-50%)",
            background: "#0e0d12",
            color: "#fff",
            borderRadius: 10,
            padding: "11px 18px",
            fontSize: 13,
            zIndex: 20,
            boxShadow: "0 20px 40px -20px rgba(14,13,18,.7)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------- movimientos ------

function Movimientos({
  lang,
  month,
  months,
  txns,
  currency,
  onMonth,
  onPatch,
  onDelete,
}: {
  lang: Lang;
  month: string;
  months: string[];
  txns: Txn[];
  currency: string;
  onMonth: (m: string) => void;
  onPatch: (id: string, changes: Partial<Txn>) => void;
  onDelete: (id: string) => void;
}) {
  const es = lang === "es";
  const [q, setQ] = React.useState("");
  const filtered = txns.filter((t) =>
    q ? `${t.merchant} ${t.category} ${t.notes}`.toLowerCase().includes(q.toLowerCase()) : true
  );

  return (
    <Card
      title={es ? "Movimientos" : "Transactions"}
      subtitle={`${filtered.length} ${es ? "registros" : "records"}`}
      right={
        <select
          value={month}
          onChange={(e) => onMonth(e.target.value)}
          style={{ ...inputStyle, width: "auto", padding: "7px 10px", fontSize: 12.5 }}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {fmtMonth(m, lang)}
            </option>
          ))}
        </select>
      }
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={es ? "Buscar comercio, rubro o nota…" : "Search merchant, category or note…"}
        style={{ ...inputStyle, marginBottom: 12 }}
      />

      {filtered.length === 0 ? (
        <p style={{ fontSize: 13.5, color: MUTED, margin: 0 }}>{es ? "Nada en este mes." : "Nothing this month."}</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  textAlign: "left",
                  color: MUTED,
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                }}
              >
                <th style={{ padding: "0 8px 8px 0", fontWeight: 400 }}>{es ? "Fecha" : "Date"}</th>
                <th style={{ padding: "0 8px 8px 0", fontWeight: 400 }}>{es ? "Descripción" : "Description"}</th>
                <th style={{ padding: "0 8px 8px 0", fontWeight: 400 }}>{es ? "Rubro" : "Category"}</th>
                <th style={{ padding: "0 8px 8px 0", fontWeight: 400, textAlign: "right" }}>{es ? "Monto" : "Amount"}</th>
                <th style={{ padding: "0 0 8px 0", fontWeight: 400 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} style={{ borderTop: HAIRLINE, opacity: t.excluded ? 0.45 : 1 }}>
                  <td style={{ padding: "10px 8px 10px 0", color: MUTED, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {fmtDate(t.date, lang)}
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", color: INK, minWidth: 160 }}>{t.merchant}</td>
                  <td style={{ padding: "10px 8px 10px 0" }}>
                    <select
                      value={t.category}
                      onChange={(e) => onPatch(t.id, { category: e.target.value })}
                      style={{ ...inputStyle, width: "auto", padding: "5px 8px", fontSize: 12.5 }}
                    >
                      {categoriesFor(t.kind).map((c) => (
                        <option key={c} value={c}>
                          {catLabel(c, lang)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td
                    style={{
                      padding: "10px 8px 10px 0",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                      color: t.kind === "income" ? "#006300" : INK,
                    }}
                  >
                    {t.kind === "income" ? "+" : "−"}
                    {fmtMoney(t.amount, lang, currency)}
                  </td>
                  <td style={{ padding: "10px 0", textAlign: "right", whiteSpace: "nowrap" }}>
                    <button
                      onClick={() => onPatch(t.id, { excluded: !t.excluded })}
                      title={es ? "Excluir de los totales" : "Exclude from totals"}
                      style={{ border: "none", background: "transparent", cursor: "pointer", color: MUTED, fontSize: 12, padding: "4px 6px" }}
                    >
                      {t.excluded ? (es ? "incluir" : "include") : es ? "excluir" : "exclude"}
                    </button>
                    <button
                      onClick={() => onDelete(t.id)}
                      title={es ? "Borrar" : "Delete"}
                      style={{ border: "none", background: "transparent", cursor: "pointer", color: "#c2410c", fontSize: 12, padding: "4px 6px" }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/**
 * Cambiar el código. El de fábrica (2201) está en el código fuente de un repo
 * público a propósito — no protege datos remotos, porque no hay ninguno; lo que
 * detiene es a quien pase frente a esta pantalla. Aquí se cambia por uno que
 * solo existe en este navegador, guardado como hash con sal.
 */
function ChangePasscode({ lang, notify }: { lang: Lang; notify: (m: string) => void }) {
  const es = lang === "es";
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [err, setErr] = React.useState("");

  if (!open) {
    return (
      <div style={{ marginTop: 14, borderTop: HAIRLINE, paddingTop: 14 }}>
        <Button variant="ghost" small onClick={() => setOpen(true)}>
          {es ? "Cambiar código de acceso" : "Change passcode"}
        </Button>
        <p style={{ fontSize: 11.5, color: MUTED, margin: "9px 0 0", lineHeight: 1.55 }}>
          {es
            ? `El código de fábrica es ${DEFAULT_PASSCODE} y está a la vista en el código del sitio. Cámbialo por uno tuyo: el nuevo se guarda solo en este navegador.`
            : `The factory code is ${DEFAULT_PASSCODE} and it's visible in the site's source. Set your own: the new one is stored only in this browser.`}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        if (value.length < 4) {
          setErr(es ? "Usa al menos 4 caracteres." : "Use at least 4 characters.");
          return;
        }
        if (value !== confirm) {
          setErr(es ? "Los códigos no coinciden." : "The codes don't match.");
          return;
        }
        const ok = await setPasscode(value);
        if (!ok) {
          setErr(es ? "No se pudo guardar en este navegador." : "Couldn't save in this browser.");
          return;
        }
        setOpen(false);
        setValue("");
        setConfirm("");
        notify(es ? "Código actualizado." : "Passcode updated.");
      }}
      style={{ marginTop: 14, borderTop: HAIRLINE, paddingTop: 14, display: "grid", gap: 9 }}
    >
      <Field label={es ? "Nuevo código" : "New passcode"}>
        <input type="password" value={value} onChange={(e) => setValue(e.target.value)} style={inputStyle} autoFocus />
      </Field>
      <Field label={es ? "Repite el código" : "Repeat it"}>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} />
      </Field>
      {err && <span style={{ fontSize: 12, color: "#c2410c" }}>{err}</span>}
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="dark" small type="submit">
          {es ? "Guardar" : "Save"}
        </Button>
        <Button variant="ghost" small onClick={() => setOpen(false)}>
          {es ? "Cancelar" : "Cancel"}
        </Button>
      </div>
    </form>
  );
}

// ------------------------------------------------------------- ajustes -----

function Ajustes({
  lang,
  state,
  update,
  setState,
  notify,
}: {
  lang: Lang;
  state: FinanceState;
  update: (fn: (s: FinanceState) => FinanceState) => void;
  setState: (s: FinanceState) => void;
  notify: (m: string) => void;
}) {
  const es = lang === "es";
  const fileRef = React.useRef<HTMLInputElement>(null);
  const set = (patch: Partial<FinanceState["settings"]>) =>
    update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  const num = (v: string) => Number(String(v).replace(",", ".")) || 0;

  const doImport = async (file: File) => {
    const parsed = parseImport(await file.text());
    if (!parsed) {
      notify(es ? "Ese archivo no se pudo leer." : "Couldn't read that file.");
      return;
    }
    saveState(parsed);
    setState(parsed);
    notify(es ? "Respaldo restaurado." : "Backup restored.");
  };

  return (
    <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
      <Card
        title={es ? "Respaldo" : "Backup"}
        subtitle={
          es
            ? "Tus datos viven solo en este navegador. Si lo borras o cambias de equipo, se van con él."
            : "Your data lives only in this browser. Clear it or switch machines and it goes with it."
        }
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button variant="dark" onClick={() => exportState(state)}>
            {es ? "Exportar JSON" : "Export JSON"}
          </Button>
          <Button variant="soft" onClick={() => fileRef.current?.click()}>
            {es ? "Importar respaldo" : "Import backup"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void doImport(f);
              e.target.value = "";
            }}
          />
        </div>
        <ChangePasscode lang={lang} notify={notify} />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14, borderTop: HAIRLINE, paddingTop: 14 }}>
          <Button
            variant="ghost"
            small
            onClick={() => {
              if (
                window.confirm(
                  es
                    ? "Esto borra todos tus movimientos y vuelve a los saldos iniciales. ¿Seguro?"
                    : "This wipes every transaction and restores the starting balances. Sure?"
                )
              ) {
                const fresh = seedState();
                saveState(fresh);
                setState(fresh);
                notify(es ? "Restablecido." : "Reset.");
              }
            }}
          >
            {es ? "Restablecer datos" : "Reset data"}
          </Button>
        </div>
      </Card>

      <Card title={es ? "Metas" : "Goals"}>
        <div style={{ display: "grid", gap: 12 }}>
          <Field label={es ? "Ingreso mensual objetivo (USD)" : "Monthly income goal (USD)"}>
            <input
              defaultValue={String(state.settings.monthlyIncomeGoal)}
              inputMode="decimal"
              onBlur={(e) => set({ monthlyIncomeGoal: num(e.target.value) })}
              style={inputStyle}
            />
          </Field>
          <Field label={es ? "Tasa de ahorro objetivo (%)" : "Savings rate goal (%)"}>
            <input
              defaultValue={String(state.settings.savingsRateGoal)}
              inputMode="decimal"
              onBlur={(e) => set({ savingsRateGoal: num(e.target.value) })}
              style={inputStyle}
            />
          </Field>
          <Field label={es ? "Fondo de emergencia objetivo (USD)" : "Emergency fund goal (USD)"}>
            <input
              defaultValue={String(state.settings.emergencyFundGoal)}
              inputMode="decimal"
              onBlur={(e) => set({ emergencyFundGoal: num(e.target.value) })}
              style={inputStyle}
            />
          </Field>
          <Field label={es ? "Gasto mensual estimado (USD)" : "Estimated monthly spend (USD)"}>
            <input
              defaultValue={String(state.settings.monthlyExpenseEstimate)}
              inputMode="decimal"
              onBlur={(e) => set({ monthlyExpenseEstimate: num(e.target.value) })}
              style={inputStyle}
            />
            <span style={{ display: "block", fontSize: 11.5, color: MUTED, marginTop: 5, lineHeight: 1.5 }}>
              {es
                ? "Es el denominador del runway mientras no tengas meses completos registrados. En cuanto haya historial real, manda el promedio medido."
                : "It's the runway denominator until you have full months logged. Once real history exists, the measured average wins."}
            </span>
          </Field>
        </div>
      </Card>

      <Card
        title={es ? "Contexto para el análisis" : "Context for the analysis"}
        subtitle={
          es
            ? "Lo que los números no dicen. Viaja con tus cifras cuando copias el paquete para Claude."
            : "What the numbers don't say. Travels with your figures when you copy the package for Claude."
        }
      >
        <textarea
          defaultValue={state.settings.profile}
          onBlur={(e) => set({ profile: e.target.value })}
          rows={12}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6, fontSize: 13 }}
        />
      </Card>

      <Card
        title={es ? "Presupuesto por rubro" : "Budget by category"}
        subtitle={es ? "Deja en blanco los rubros que no quieras controlar." : "Leave blank to skip a category."}
      >
        <div style={{ display: "grid", gap: 9, gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
          {categoriesFor("expense").map((c) => (
            <Field key={c} label={catLabel(c, lang)}>
              <input
                defaultValue={state.settings.budgets[c] ? String(state.settings.budgets[c]) : ""}
                inputMode="decimal"
                placeholder="—"
                onBlur={(e) => {
                  const v = num(e.target.value);
                  update((s) => {
                    const budgets = { ...s.settings.budgets };
                    if (v > 0) budgets[c] = v;
                    else delete budgets[c];
                    return { ...s, settings: { ...s.settings, budgets } };
                  });
                }}
                style={inputStyle}
              />
            </Field>
          ))}
        </div>
      </Card>
    </div>
  );
}
