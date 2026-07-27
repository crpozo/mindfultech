"use client";

import * as React from "react";
import type { Lang } from "../i18n";
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
  type FinanceState,
  type Txn,
} from "@/lib/finance/store";
import { catLabel, fmtDate, fmtMonth, fmtMoney } from "@/lib/finance/format";
import { importPrompt, parseTransactions } from "@/lib/finance/import";

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
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div>
            {title && (
              <h2
                style={{ fontSize: 15, fontWeight: 500, color: INK, margin: 0 }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: 12.5,
                  color: MUTED,
                  margin: "3px 0 0",
                  lineHeight: 1.5,
                }}
              >
                {subtitle}
              </p>
            )}
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
  const hasDelta =
    typeof delta === "number" &&
    Number.isFinite(delta) &&
    Math.abs(delta) > 0.004;
  const up = (delta ?? 0) > 0;
  const good = deltaGoodWhen === "up" ? up : !up;
  return (
    <div
      style={{
        background: "#fff",
        border: HAIRLINE,
        borderRadius: 14,
        padding: "16px 18px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        {accent && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: accent,
              flex: "none",
            }}
          />
        )}
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: ".18em",
            color: MUTED,
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: 25,
          fontWeight: 500,
          color: INK,
          marginTop: 8,
          letterSpacing: "-.02em",
        }}
      >
        {value}
      </div>
      {hasDelta ? (
        <div
          style={{
            fontSize: 12,
            color: good ? "#006300" : "#c2410c",
            marginTop: 5,
          }}
        >
          {/* flecha + texto: el color nunca es la única señal */}
          {up ? "▲" : "▼"} {fmtMoney(Math.abs(delta as number), lang)}{" "}
          <span style={{ color: MUTED }}>{"vs mes anterior"}</span>
        </div>
      ) : (
        hint && (
          <div style={{ fontSize: 12, color: MUTED, marginTop: 5 }}>{hint}</div>
        )
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
      className={
        variant === "dark"
          ? "btn-dark"
          : variant === "soft"
            ? "btn-soft"
            : undefined
      }
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          display: "block",
          fontSize: 11.5,
          color: MUTED,
          marginBottom: 5,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

// ------------------------------------------------------------------- app ---

export function FinanceApp() {
  // El tablero es solo en español. `lang` se conserva porque los helpers de
  // formato y los gráficos lo piden, pero nunca cambia.
  const lang: Lang = "es";

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
          notify("No se pudo guardar en este navegador.");
        }
        return next;
      });
    },
    [notify],
  );

  const summaries: MonthSummary[] = React.useMemo(
    () => (state ? summarize(state, 6) : []),
    [state],
  );
  const baseline = React.useMemo(
    () => (state ? baselineExpense(state, summaries) : 0),
    [state, summaries],
  );
  const nw = React.useMemo(
    () => (state ? netWorth(state, baseline) : null),
    [state, baseline],
  );
  const diag = React.useMemo(
    () => (state ? diagnose(state, summaries) : null),
    [state, summaries],
  );
  const plan = React.useMemo(
    () => (state ? capitalPlan(state, summaries) : null),
    [state, summaries],
  );

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f7f8fb",
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: ".2em",
            color: MUTED,
          }}
        >
          {"CARGANDO…"}
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
  const monthOptions = [...new Set([...summaries.map((m) => m.month), month])]
    .sort()
    .reverse();

  /** Los movimientos entran en lote, desde el JSON que devuelve Claude. */
  const importTxns = (rows: Txn[]) => {
    update((s) => ({ ...s, transactions: [...s.transactions, ...rows] }));
  };

  const copyForClaude = async () => {
    try {
      await navigator.clipboard.writeText(claudePrompt(state, summaries));
      notify("Copiado. Pégalo en Claude.");
    } catch {
      notify("El navegador bloqueó el portapapeles.");
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", background: "#f7f8fb", paddingBottom: 60 }}
    >
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
            <div
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: INK,
                lineHeight: 1.1,
              }}
            >
              {"Finanzas"}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: ".16em",
                color: MUTED,
                textTransform: "uppercase",
              }}
            >
              MindfulTech
            </div>
          </div>

          <nav
            style={{
              display: "flex",
              gap: 2,
              background: "#eef0f5",
              padding: 3,
              borderRadius: 9,
              flexWrap: "wrap",
            }}
          >
            {(
              [
                ["resumen", "Resumen"],
                ["patrimonio", "Patrimonio"],
                ["movimientos", "Movimientos"],
                ["ajustes", "Ajustes"],
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

          <Button
            variant="ghost"
            small
            onClick={() => {
              setUnlocked(false);
              setOpen(false);
            }}
          >
            {"Bloquear"}
          </Button>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "22px 22px 0",
          display: "grid",
          gap: 18,
        }}
      >
        {tab === "resumen" && (
          <>
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              }}
            >
              <Kpi
                lang={lang}
                accent={SERIES.income}
                label={"Ingresos del mes"}
                value={fmtMoney(cur?.income ?? 0, lang, currency)}
                delta={deltas.income}
                hint={"registra tus cobros para ver la tendencia"}
              />
              <Kpi
                lang={lang}
                accent={SERIES.expense}
                label={"Gastos del mes"}
                value={fmtMoney(cur?.expense ?? 0, lang, currency)}
                delta={deltas.expense}
                deltaGoodWhen="down"
                hint={`${"referencia"} ${fmtMoney(baseline, lang, currency)}`}
              />
              <Kpi
                lang={lang}
                label={"Patrimonio neto"}
                value={fmtMoney(nw.netWorth, lang, currency)}
                hint={`${"por cobrar"} ${fmtMoney(nw.receivablesPending, lang, currency)}`}
              />
              <Kpi
                lang={lang}
                label="Runway"
                value={`${nw.runwayMonths.toFixed(1)} ${"meses"}`}
                hint={"efectivo / gasto de referencia"}
              />
            </div>

            <Card
              title={"Ingresos, gastos y neto"}
              subtitle={"Últimos 6 meses"}
            >
              {summaries.some((m) => m.count > 0) ? (
                <TrendChart months={summaries} lang={lang} />
              ) : (
                <p
                  style={{
                    fontSize: 13.5,
                    color: MUTED,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Aún no hay movimientos. Pégalos desde Claude en la pestaña
                  Movimientos y el gráfico aparece solo.
                </p>
              )}
            </Card>

            {plan && (
              <Card
                title={"Qué hacer con el dinero"}
                subtitle={
                  "Orden de asignación de tu efectivo, calculado con tus saldos y tu gasto."
                }
              >
                <ol
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "grid",
                    gap: 11,
                  }}
                >
                  {plan.steps.map((step, i) => {
                    const tone =
                      step.when === "listo"
                        ? "#0ca30c"
                        : step.when === "despues"
                          ? "#8b8896"
                          : "#69c7b9";
                    const badge =
                      step.when === "listo"
                        ? "listo"
                        : step.when === "despues"
                          ? "después"
                          : "ahora";
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
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ fontSize: 14, color: INK }}>
                            {step.title}
                          </span>
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
                        <p
                          style={{
                            fontSize: 12.5,
                            color: MUTED,
                            margin: "6px 0 0",
                            lineHeight: 1.6,
                          }}
                        >
                          {step.detail}
                        </p>
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
                    <strong>{"Si abonas a la deuda hoy"}</strong>
                    <br />
                    {plan.tradeoff}
                  </div>
                )}
              </Card>
            )}

            <div
              style={{
                display: "grid",
                gap: 18,
                gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))",
              }}
            >
              <Card
                title={"Diagnóstico"}
                subtitle={
                  "Calculado aquí mismo con tus números; nada sale del navegador."
                }
                right={
                  <Button
                    variant="soft"
                    small
                    onClick={() => void copyForClaude()}
                  >
                    {"Copiar para Claude"}
                  </Button>
                }
              >
                <HealthGauge
                  score={diag.score}
                  verdict={diag.verdict}
                  lang={lang}
                />
                <p
                  style={{
                    fontSize: 16,
                    color: INK,
                    margin: "18px 0 14px",
                    lineHeight: 1.45,
                  }}
                >
                  {diag.headline}
                </p>

                <div style={{ display: "grid", gap: 9 }}>
                  {diag.findings.map((f, i) => {
                    const tone = {
                      good: "#0ca30c",
                      warn: "#fab219",
                      risk: "#d03b3b",
                    }[f.tone];
                    const mark = { good: "✓", warn: "!", risk: "▲" }[f.tone];
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        {/* marca + texto: el color acompaña, nunca informa solo */}
                        <span
                          style={{
                            color: tone,
                            fontSize: 12,
                            lineHeight: "18px",
                            width: 14,
                            textAlign: "center",
                            flex: "none",
                          }}
                        >
                          {mark}
                        </span>
                        <span>
                          <span
                            style={{
                              fontSize: 13.5,
                              color: INK,
                              display: "block",
                            }}
                          >
                            {f.title}
                          </span>
                          <span
                            style={{
                              fontSize: 12.5,
                              color: MUTED,
                              display: "block",
                              marginTop: 2,
                              lineHeight: 1.55,
                            }}
                          >
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
                      {"Qué corregir"}
                    </div>
                    <ol
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: "none",
                        display: "grid",
                        gap: 10,
                      }}
                    >
                      {diag.actions.map((a, i) => (
                        <li
                          key={i}
                          style={{
                            border: HAIRLINE,
                            borderRadius: 11,
                            padding: "11px 13px",
                            display: "flex",
                            gap: 12,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: MONO,
                              fontSize: 11,
                              color: MUTED,
                              minWidth: 14,
                              paddingTop: 2,
                            }}
                          >
                            {i + 1}
                          </span>
                          <span>
                            <span
                              style={{
                                fontSize: 13.5,
                                color: INK,
                                display: "block",
                              }}
                            >
                              {a.title}
                            </span>
                            <span
                              style={{
                                fontSize: 12.5,
                                color: MUTED,
                                display: "block",
                                marginTop: 3,
                                lineHeight: 1.55,
                              }}
                            >
                              {a.why}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </>
                )}

                <p
                  style={{
                    fontSize: 11,
                    color: "#9a97a6",
                    margin: "18px 0 0",
                    lineHeight: 1.5,
                  }}
                >
                  {
                    "Reglas de gasto, ahorro y flujo de caja aplicadas a tus cifras. No es asesoría de inversión."
                  }
                </p>
              </Card>

              <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
                <Card
                  title={"Gastos por rubro"}
                  subtitle={cur ? fmtMonth(cur.month, lang) : ""}
                >
                  <CategoryBars
                    byCategory={cur?.byCategory ?? {}}
                    lang={lang}
                    currency={currency}
                  />
                </Card>

                {Object.keys(state.settings.budgets).length > 0 && cur && (
                  <Card title={"Presupuestos"}>
                    <div style={{ display: "grid", gap: 11 }}>
                      {Object.entries(state.settings.budgets).map(
                        ([category, limit]) => {
                          const spent = cur.byCategory[category] ?? 0;
                          const pct = limit > 0 ? (spent / limit) * 100 : 0;
                          const over = pct > 100;
                          const near = pct > 85 && !over;
                          const color = over
                            ? "#d03b3b"
                            : near
                              ? "#fab219"
                              : "#0ca30c";
                          return (
                            <div key={category}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: 12.5,
                                  marginBottom: 4,
                                }}
                              >
                                <span style={{ color: "#52514e" }}>
                                  {catLabel(category, lang)}
                                  {over && (
                                    <span
                                      style={{
                                        color: "#d03b3b",
                                        marginLeft: 6,
                                      }}
                                    >
                                      ⚠ {"excedido"}
                                    </span>
                                  )}
                                </span>
                                <span
                                  style={{
                                    color: INK,
                                    fontVariantNumeric: "tabular-nums",
                                  }}
                                >
                                  {fmtMoney(spent, lang, currency)} /{" "}
                                  {fmtMoney(limit, lang, currency)}
                                </span>
                              </div>
                              <div
                                style={{
                                  height: 8,
                                  background: "#f1f2f6",
                                  borderRadius: 4,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${Math.min(100, pct)}%`,
                                    height: "100%",
                                    background: color,
                                    borderRadius: 4,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </Card>
                )}

                {cur && Object.keys(cur.topMerchants).length > 0 && (
                  <Card title={"Dónde más gastaste"}>
                    <ol
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: "none",
                        display: "grid",
                        gap: 7,
                      }}
                    >
                      {Object.entries(cur.topMerchants)
                        .slice(0, 6)
                        .map(([m, v]) => (
                          <li
                            key={m}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                              fontSize: 13,
                            }}
                          >
                            <span
                              style={{
                                color: "#52514e",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {m}
                            </span>
                            <span
                              style={{
                                color: INK,
                                fontVariantNumeric: "tabular-nums",
                                whiteSpace: "nowrap",
                              }}
                            >
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

        {tab === "patrimonio" && (
          <Patrimonio
            lang={lang}
            state={state}
            nw={nw}
            baseline={baseline}
            update={update}
          />
        )}

        {tab === "movimientos" && (
          <>
            <ImportarMovimientos
              state={state}
              onImport={importTxns}
              notify={notify}
            />
            <Movimientos
              lang={lang}
              month={month}
              months={monthOptions}
              txns={monthTxns}
              currency={currency}
              onMonth={setMonth}
              onPatch={(id, changes) =>
                update((s) => ({
                  ...s,
                  transactions: s.transactions.map((t) =>
                    t.id === id ? { ...t, ...changes } : t,
                  ),
                }))
              }
              onDelete={(id) =>
                update((s) => ({
                  ...s,
                  transactions: s.transactions.filter((t) => t.id !== id),
                }))
              }
            />
          </>
        )}

        {tab === "ajustes" && (
          <Ajustes
            lang={lang}
            state={state}
            update={update}
            setState={setState}
            notify={notify}
          />
        )}
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

// ------------------------------------------------ entrada desde Claude -----

/**
 * La única puerta de entrada de movimientos.
 *
 * El flujo es: copias las instrucciones, se las pegas a Claude junto con tus
 * gastos o los correos de Diners, y pegas de vuelta el JSON que devuelve. No
 * hay alta uno por uno a propósito — teclear treinta consumos a mano es
 * exactamente el trabajo que no vale la pena hacer dos veces.
 */
function ImportarMovimientos({
  state,
  onImport,
  notify,
}: {
  state: FinanceState;
  onImport: (rows: Txn[]) => void;
  notify: (m: string) => void;
}) {
  const [text, setText] = React.useState("");
  const [result, setResult] = React.useState("");
  const [error, setError] = React.useState("");

  const copyInstructions = async () => {
    try {
      await navigator.clipboard.writeText(importPrompt(state));
      notify("Instrucciones copiadas. Pégalas en Claude con tus gastos.");
    } catch {
      notify("El navegador bloqueó el portapapeles.");
    }
  };

  const doImport = () => {
    setError("");
    setResult("");
    const parsed = parseTransactions(text, state.transactions);
    if (!parsed) {
      setError(
        "No encontré movimientos en ese texto. Pega el JSON que devolvió Claude: un array de objetos con date, amount, kind, category y merchant.",
      );
      return;
    }
    if (!parsed.added.length) {
      setError(
        parsed.duplicates === 1
          ? "Ese movimiento ya estaba registrado. No dupliqué nada."
          : parsed.duplicates > 1
            ? `Esos ${parsed.duplicates} movimientos ya estaban registrados. No dupliqué nada.`
            : "No había ningún movimiento válido en ese texto.",
      );
      return;
    }
    onImport(parsed.added);
    setText("");
    const plural = (n: number, uno: string, varios: string) =>
      n === 1 ? `1 ${uno}` : `${n} ${varios}`;
    const partes = [
      plural(
        parsed.added.length,
        "movimiento importado",
        "movimientos importados",
      ),
    ];
    if (parsed.duplicates)
      partes.push(
        plural(
          parsed.duplicates,
          "ya estaba y se omitió",
          "ya estaban y se omitieron",
        ),
      );
    if (parsed.skipped.length)
      partes.push(
        plural(
          parsed.skipped.length,
          "sin monto o descripción, fuera",
          "sin monto o descripción, fuera",
        ),
      );
    setResult(partes.join(" · ") + ".");
  };

  return (
    <Card
      title="Movimientos desde Claude"
      subtitle="Cuéntale tus gastos a Claude o pégale los correos de Diners; pega aquí el JSON que te devuelva."
      right={
        <Button variant="soft" small onClick={() => void copyInstructions()}>
          Copiar instrucciones
        </Button>
      }
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={
          '[{"date":"2026-07-24","amount":3.50,"kind":"expense","category":"suscripciones","merchant":"Contrato con Republi"}]'
        }
        style={{
          ...inputStyle,
          resize: "vertical",
          fontFamily: MONO,
          fontSize: 12,
          lineHeight: 1.6,
        }}
      />
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginTop: 10,
          flexWrap: "wrap",
        }}
      >
        <Button variant="dark" onClick={doImport}>
          Importar
        </Button>
        {result && (
          <span style={{ fontSize: 12.5, color: "#006300" }}>{result}</span>
        )}
        {error && (
          <span
            style={{
              fontSize: 12.5,
              color: "#c2410c",
              lineHeight: 1.5,
              flex: 1,
            }}
          >
            {error}
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: 11.5,
          color: MUTED,
          margin: "12px 0 0",
          lineHeight: 1.6,
        }}
      >
        Se omite lo que ya esté registrado: si pegas dos veces el mismo lote, no
        se duplica.
      </p>
    </Card>
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
  const [q, setQ] = React.useState("");
  const filtered = txns.filter((t) =>
    q
      ? `${t.merchant} ${t.category} ${t.notes}`
          .toLowerCase()
          .includes(q.toLowerCase())
      : true,
  );

  return (
    <Card
      title={"Movimientos"}
      subtitle={`${filtered.length} ${"registros"}`}
      right={
        <select
          value={month}
          onChange={(e) => onMonth(e.target.value)}
          style={{
            ...inputStyle,
            width: "auto",
            padding: "7px 10px",
            fontSize: 12.5,
          }}
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
        placeholder={"Buscar comercio, rubro o nota…"}
        style={{ ...inputStyle, marginBottom: 12 }}
      />

      {filtered.length === 0 ? (
        <p style={{ fontSize: 13.5, color: MUTED, margin: 0 }}>
          {"Nada en este mes."}
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
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
                <th style={{ padding: "0 8px 8px 0", fontWeight: 400 }}>
                  {"Fecha"}
                </th>
                <th style={{ padding: "0 8px 8px 0", fontWeight: 400 }}>
                  {"Descripción"}
                </th>
                <th style={{ padding: "0 8px 8px 0", fontWeight: 400 }}>
                  {"Rubro"}
                </th>
                <th
                  style={{
                    padding: "0 8px 8px 0",
                    fontWeight: 400,
                    textAlign: "right",
                  }}
                >
                  {"Monto"}
                </th>
                <th style={{ padding: "0 0 8px 0", fontWeight: 400 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  style={{
                    borderTop: HAIRLINE,
                    opacity: t.excluded ? 0.45 : 1,
                  }}
                >
                  <td
                    style={{
                      padding: "10px 8px 10px 0",
                      color: MUTED,
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fmtDate(t.date, lang)}
                  </td>
                  <td
                    style={{
                      padding: "10px 8px 10px 0",
                      color: INK,
                      minWidth: 160,
                    }}
                  >
                    {t.merchant}
                  </td>
                  <td style={{ padding: "10px 8px 10px 0" }}>
                    <select
                      value={t.category}
                      onChange={(e) =>
                        onPatch(t.id, { category: e.target.value })
                      }
                      style={{
                        ...inputStyle,
                        width: "auto",
                        padding: "5px 8px",
                        fontSize: 12.5,
                      }}
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
                  <td
                    style={{
                      padding: "10px 0",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <button
                      onClick={() => onPatch(t.id, { excluded: !t.excluded })}
                      title={"Excluir de los totales"}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: MUTED,
                        fontSize: 12,
                        padding: "4px 6px",
                      }}
                    >
                      {t.excluded ? "incluir" : "excluir"}
                    </button>
                    <button
                      onClick={() => onDelete(t.id)}
                      title={"Borrar"}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "#c2410c",
                        fontSize: 12,
                        padding: "4px 6px",
                      }}
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
function ChangePasscode({ notify }: { notify: (m: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [err, setErr] = React.useState("");

  if (!open) {
    return (
      <div style={{ marginTop: 14, borderTop: HAIRLINE, paddingTop: 14 }}>
        <Button variant="ghost" small onClick={() => setOpen(true)}>
          {"Cambiar código de acceso"}
        </Button>
        <p
          style={{
            fontSize: 11.5,
            color: MUTED,
            margin: "9px 0 0",
            lineHeight: 1.55,
          }}
        >
          {`El código de fábrica es ${DEFAULT_PASSCODE} y está a la vista en el código del sitio. Cámbialo por uno tuyo: el nuevo se guarda solo en este navegador.`}
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
          setErr("Usa al menos 4 caracteres.");
          return;
        }
        if (value !== confirm) {
          setErr("Los códigos no coinciden.");
          return;
        }
        const ok = await setPasscode(value);
        if (!ok) {
          setErr("No se pudo guardar en este navegador.");
          return;
        }
        setOpen(false);
        setValue("");
        setConfirm("");
        notify("Código actualizado.");
      }}
      style={{
        marginTop: 14,
        borderTop: HAIRLINE,
        paddingTop: 14,
        display: "grid",
        gap: 9,
      }}
    >
      <Field label={"Nuevo código"}>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={inputStyle}
          autoFocus
        />
      </Field>
      <Field label={"Repite el código"}>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={inputStyle}
        />
      </Field>
      {err && <span style={{ fontSize: 12, color: "#c2410c" }}>{err}</span>}
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="dark" small type="submit">
          {"Guardar"}
        </Button>
        <Button variant="ghost" small onClick={() => setOpen(false)}>
          {"Cancelar"}
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
  const fileRef = React.useRef<HTMLInputElement>(null);
  const set = (patch: Partial<FinanceState["settings"]>) =>
    update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  const num = (v: string) => Number(String(v).replace(",", ".")) || 0;

  const doImport = async (file: File) => {
    const parsed = parseImport(await file.text());
    if (!parsed) {
      notify("Ese archivo no se pudo leer.");
      return;
    }
    saveState(parsed);
    setState(parsed);
    notify("Respaldo restaurado.");
  };

  return (
    <div
      style={{
        display: "grid",
        gap: 18,
        gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
      }}
    >
      <Card
        title={"Respaldo"}
        subtitle={
          "Tus datos viven solo en este navegador. Si lo borras o cambias de equipo, se van con él."
        }
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button variant="dark" onClick={() => exportState(state)}>
            {"Exportar JSON"}
          </Button>
          <Button variant="soft" onClick={() => fileRef.current?.click()}>
            {"Importar respaldo"}
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
        <ChangePasscode notify={notify} />

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 14,
            borderTop: HAIRLINE,
            paddingTop: 14,
          }}
        >
          <Button
            variant="ghost"
            small
            onClick={() => {
              if (
                window.confirm(
                  "Esto borra todos tus movimientos y vuelve a los saldos iniciales. ¿Seguro?",
                )
              ) {
                const fresh = seedState();
                saveState(fresh);
                setState(fresh);
                notify("Restablecido.");
              }
            }}
          >
            {"Restablecer datos"}
          </Button>
        </div>
      </Card>

      <Card title={"Metas"}>
        <div style={{ display: "grid", gap: 12 }}>
          <Field label={"Ingreso mensual objetivo (USD)"}>
            <input
              defaultValue={String(state.settings.monthlyIncomeGoal)}
              inputMode="decimal"
              onBlur={(e) => set({ monthlyIncomeGoal: num(e.target.value) })}
              style={inputStyle}
            />
          </Field>
          <Field label={"Tasa de ahorro objetivo (%)"}>
            <input
              defaultValue={String(state.settings.savingsRateGoal)}
              inputMode="decimal"
              onBlur={(e) => set({ savingsRateGoal: num(e.target.value) })}
              style={inputStyle}
            />
          </Field>
          <Field label={"Fondo de emergencia objetivo (USD)"}>
            <input
              defaultValue={String(state.settings.emergencyFundGoal)}
              inputMode="decimal"
              onBlur={(e) => set({ emergencyFundGoal: num(e.target.value) })}
              style={inputStyle}
            />
          </Field>
          <Field label={"Gasto mensual estimado (USD)"}>
            <input
              defaultValue={String(state.settings.monthlyExpenseEstimate)}
              inputMode="decimal"
              onBlur={(e) =>
                set({ monthlyExpenseEstimate: num(e.target.value) })
              }
              style={inputStyle}
            />
            <span
              style={{
                display: "block",
                fontSize: 11.5,
                color: MUTED,
                marginTop: 5,
                lineHeight: 1.5,
              }}
            >
              {
                "Es el denominador del runway mientras no tengas meses completos registrados. En cuanto haya historial real, manda el promedio medido. No incluyas aquí los compromisos fijos de Patrimonio: esos se suman aparte."
              }
            </span>
          </Field>
        </div>
      </Card>

      <Card
        title={"Contexto para el análisis"}
        subtitle={
          "Lo que los números no dicen. Viaja con tus cifras cuando copias el paquete para Claude."
        }
      >
        <textarea
          defaultValue={state.settings.profile}
          onBlur={(e) => set({ profile: e.target.value })}
          rows={12}
          style={{
            ...inputStyle,
            resize: "vertical",
            lineHeight: 1.6,
            fontSize: 13,
          }}
        />
      </Card>

      <Card
        title={"Presupuesto por rubro"}
        subtitle={"Deja en blanco los rubros que no quieras controlar."}
      >
        <div
          style={{
            display: "grid",
            gap: 9,
            gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          }}
        >
          {categoriesFor("expense").map((c) => (
            <Field key={c} label={catLabel(c, lang)}>
              <input
                defaultValue={
                  state.settings.budgets[c]
                    ? String(state.settings.budgets[c])
                    : ""
                }
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
