"use client";

import * as React from "react";
import { useLang, LangToggle } from "../i18n";
import { SignIn } from "./SignIn";
import { TrendChart, CategoryBars, HealthGauge, SERIES } from "./charts";
import { api, ApiError, type Insight, type Status, type Summary, type Transaction } from "@/lib/finance/api";
import { completeSignIn, isSignedIn, signIn, signOut, userEmail } from "@/lib/finance/auth";
import { isConfigured, loadConfig } from "@/lib/finance/config";
import {
  catLabel,
  currentMonthKey,
  fmtDate,
  fmtDateTime,
  fmtMonth,
  fmtMoney,
  fmtPct,
  timeAgo,
} from "@/lib/finance/format";

const MONO = "var(--mono)";
const INK = "var(--ink)";
const MUTED = "#8b8896";
const HAIRLINE = "1px solid rgba(14,13,18,.08)";

type Tab = "resumen" | "movimientos" | "ajustes";

// ------------------------------------------------------------ primitivas ---

function Card({
  title,
  subtitle,
  right,
  children,
  pad = 20,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  pad?: number;
}) {
  return (
    <section
      style={{
        background: "#fff",
        border: HAIRLINE,
        borderRadius: 16,
        padding: pad,
        boxShadow: "0 18px 40px -32px rgba(14,13,18,.5)",
      }}
    >
      {(title || right) && (
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            {title && (
              <h2 style={{ fontSize: 15, fontWeight: 500, color: INK, margin: 0, letterSpacing: "-.005em" }}>{title}</h2>
            )}
            {subtitle && <p style={{ fontSize: 12.5, color: MUTED, margin: "3px 0 0" }}>{subtitle}</p>}
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
  lang: "es" | "en";
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
      {hasDelta && (
        <div style={{ fontSize: 12, color: good ? "#006300" : "#c2410c", marginTop: 5 }}>
          {/* flecha + texto: el color nunca es la única señal */}
          {up ? "▲" : "▼"} {fmtMoney(Math.abs(delta as number), lang)}{" "}
          <span style={{ color: MUTED }}>{lang === "es" ? "vs mes anterior" : "vs last month"}</span>
        </div>
      )}
      {!hasDelta && hint && <div style={{ fontSize: 12, color: MUTED, marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "soft",
  disabled,
  small,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "dark" | "soft" | "ghost";
  disabled?: boolean;
  small?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    dark: { background: "#0e0d12", color: "#fff", border: "none" },
    soft: { background: "#f1f2f6", color: INK, border: "none" },
    ghost: { background: "transparent", color: MUTED, border: HAIRLINE },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={variant === "dark" ? "btn-dark" : variant === "soft" ? "btn-soft" : undefined}
      style={{
        ...styles[variant],
        borderRadius: 9,
        padding: small ? "7px 12px" : "10px 16px",
        fontSize: small ? 12.5 : 14,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
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

function Banner({ tone, children }: { tone: "warn" | "info" | "error"; children: React.ReactNode }) {
  const tones = {
    warn: { bg: "#fff7ed", border: "#fed7aa", fg: "#9a3412" },
    info: { bg: "#eef8f6", border: "#c3e7e0", fg: "#2c5c55" },
    error: { bg: "#fef2f2", border: "#fecaca", fg: "#991b1b" },
  }[tone];
  return (
    <div
      style={{
        background: tones.bg,
        border: `1px solid ${tones.border}`,
        color: tones.fg,
        borderRadius: 12,
        padding: "12px 15px",
        fontSize: 13,
        lineHeight: 1.55,
      }}
    >
      {children}
    </div>
  );
}

// ------------------------------------------------------------------- app ---

export function FinanceApp() {
  const { lang } = useLang();
  const es = lang === "es";

  const [booting, setBooting] = React.useState(true);
  const [authed, setAuthed] = React.useState(false);
  const [configured, setConfigured] = React.useState(true);
  const [authError, setAuthError] = React.useState("");

  const [tab, setTab] = React.useState<Tab>("resumen");
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [insight, setInsight] = React.useState<Insight | null>(null);
  const [status, setStatus] = React.useState<Status | null>(null);
  const [month, setMonth] = React.useState(currentMonthKey());
  const [txns, setTxns] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [busy, setBusy] = React.useState("");
  const [error, setError] = React.useState("");
  const [toast, setToast] = React.useState("");

  const notify = React.useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3500);
  }, []);

  // --- arranque: ¿venimos del Hosted UI? ¿hay sesión? -----------------------
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const cfg = await loadConfig();
      if (cancelled) return;
      setConfigured(isConfigured(cfg));
      if (!isConfigured(cfg)) {
        setBooting(false);
        return;
      }
      try {
        const ok = await completeSignIn();
        if (!cancelled) setAuthed(ok || isSignedIn());
      } catch (e) {
        if (!cancelled) setAuthError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleApiError = React.useCallback((e: unknown) => {
    if (e instanceof ApiError && e.status === 401) {
      setAuthed(false);
      setError(es ? "Tu sesión expiró. Vuelve a entrar." : "Session expired. Sign in again.");
      return;
    }
    setError(e instanceof Error ? e.message : String(e));
  }, [es]);

  const loadAll = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [s, i, st] = await Promise.all([api.summary(6), api.insights(), api.status()]);
      setSummary(s);
      setInsight(i.insight);
      setStatus(st);
    } catch (e) {
      handleApiError(e);
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const loadMonth = React.useCallback(
    async (key: string) => {
      try {
        const r = await api.transactions(key);
        setTxns(r.transactions);
      } catch (e) {
        handleApiError(e);
      }
    },
    [handleApiError]
  );

  React.useEffect(() => {
    if (authed) void loadAll();
  }, [authed, loadAll]);

  React.useEffect(() => {
    if (authed) void loadMonth(month);
  }, [authed, month, loadMonth]);

  // --- acciones -------------------------------------------------------------

  const sync = async (days?: number) => {
    setBusy("sync");
    try {
      await api.sync(days);
      notify(es ? "Sincronizando tu correo…" : "Syncing your inbox…");
      // La ingesta corre en otra lambda; recargamos cuando ya debería haber
      // terminado de escribir.
      window.setTimeout(() => {
        void loadAll();
        void loadMonth(month);
      }, 9000);
    } catch (e) {
      handleApiError(e);
    } finally {
      setBusy("");
    }
  };

  const refreshInsight = async () => {
    setBusy("insight");
    try {
      await api.refreshInsights();
      notify(es ? "Analizando con IA…" : "Running the AI analysis…");
      window.setTimeout(() => void loadAll(), 30000);
    } catch (e) {
      handleApiError(e);
    } finally {
      setBusy("");
    }
  };

  const connectOutlook = async () => {
    setBusy("outlook");
    try {
      const { url } = await api.connectOutlook();
      window.location.assign(url);
    } catch (e) {
      handleApiError(e);
      setBusy("");
    }
  };

  const patchTxn = async (t: Transaction, changes: Record<string, unknown>) => {
    const before = txns;
    setTxns((cur) => cur.map((x) => (x.sk === t.sk ? { ...x, ...changes } : x)));
    try {
      await api.updateTransaction(t.month, t.sk, { ...changes, kind: t.kind });
      void loadAll();
    } catch (e) {
      setTxns(before); // revertir el optimismo
      handleApiError(e);
    }
  };

  const removeTxn = async (t: Transaction) => {
    if (!window.confirm(es ? `¿Borrar “${t.merchant}”?` : `Delete “${t.merchant}”?`)) return;
    const before = txns;
    setTxns((cur) => cur.filter((x) => x.sk !== t.sk));
    try {
      await api.deleteTransaction(t.month, t.sk);
      void loadAll();
    } catch (e) {
      setTxns(before);
      handleApiError(e);
    }
  };

  // --- render ---------------------------------------------------------------

  if (booting) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7f8fb" }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: MUTED }}>
          {es ? "CARGANDO…" : "LOADING…"}
        </span>
      </div>
    );
  }

  if (!authed) {
    return <SignIn onSignIn={() => void signIn()} error={authError} configured={configured} />;
  }

  const cur = summary?.current ?? null;
  const currency = summary?.settings.currency ?? "USD";
  const months = summary?.months ?? [];
  const monthOptions = months.map((m) => m.month);
  if (!monthOptions.includes(month)) monthOptions.push(month);

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fb", paddingBottom: 60 }}>
      {/* ------------------------------------------------------- cabecera -- */}
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
            <div style={{ fontSize: 15, fontWeight: 500, color: INK, lineHeight: 1.1 }}>
              {es ? "Finanzas" : "Finances"}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", color: MUTED, textTransform: "uppercase" }}>
              {userEmail() || "MindfulTech"}
            </div>
          </div>

          <nav style={{ display: "flex", gap: 2, background: "#eef0f5", padding: 3, borderRadius: 9 }}>
            {(
              [
                ["resumen", es ? "Resumen" : "Overview"],
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
          <Button variant="ghost" small onClick={() => void signOut()}>
            {es ? "Salir" : "Sign out"}
          </Button>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "22px 22px 0", display: "grid", gap: 18 }}>
        {error && <Banner tone="error">{error}</Banner>}

        {status && !status.outlookConnected && (
          <Banner tone="warn">
            <strong>{es ? "Outlook no está conectado." : "Outlook isn't connected."}</strong>{" "}
            {es
              ? "Mientras tanto puedes registrar movimientos a mano. Conéctalo en Ajustes para que los consumos de Diners entren solos."
              : "You can still add transactions by hand. Connect it in Settings so your Diners charges flow in automatically."}
          </Banner>
        )}

        {tab === "resumen" && (
          <>
            {/* --------------------------------------------------- KPIs --- */}
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
              <Kpi
                lang={lang}
                accent={SERIES.income}
                label={es ? "Ingresos del mes" : "Income this month"}
                value={fmtMoney(cur?.income ?? 0, lang, currency)}
                delta={summary?.deltas.income}
                deltaGoodWhen="up"
                hint={es ? "Registra tus ingresos para ver la tasa de ahorro" : "Add income to see your savings rate"}
              />
              <Kpi
                lang={lang}
                accent={SERIES.expense}
                label={es ? "Gastos del mes" : "Expenses this month"}
                value={fmtMoney(cur?.expense ?? 0, lang, currency)}
                delta={summary?.deltas.expense}
                deltaGoodWhen="down"
                hint={
                  summary && summary.projectedExpense > 0
                    ? `${es ? "Proyección" : "Projected"} ${fmtMoney(summary.projectedExpense, lang, currency)}`
                    : undefined
                }
              />
              <Kpi
                lang={lang}
                accent={SERIES.net}
                label={es ? "Neto" : "Net"}
                value={fmtMoney(cur?.net ?? 0, lang, currency)}
                delta={summary?.deltas.net}
                deltaGoodWhen="up"
              />
              <Kpi
                lang={lang}
                label={es ? "Tasa de ahorro" : "Savings rate"}
                value={fmtPct(cur?.savingsRate ?? 0)}
                hint={
                  summary
                    ? `${es ? "Meta" : "Goal"} ${fmtPct(summary.settings.savingsRateGoal)}`
                    : undefined
                }
              />
            </div>

            {/* ------------------------------------------------ tendencia -- */}
            <Card
              title={es ? "Ingresos, gastos y neto" : "Income, expenses and net"}
              subtitle={es ? "Últimos 6 meses" : "Last 6 months"}
              right={
                <Button variant="soft" small onClick={() => void sync()} disabled={busy === "sync"}>
                  {busy === "sync" ? (es ? "…" : "…") : es ? "Sincronizar" : "Sync now"}
                </Button>
              }
            >
              {months.length ? (
                <TrendChart months={months} lang={lang} />
              ) : (
                <p style={{ fontSize: 13.5, color: MUTED, margin: 0 }}>
                  {loading
                    ? es
                      ? "Cargando…"
                      : "Loading…"
                    : es
                      ? "Todavía no hay datos. Conecta Outlook o agrega un movimiento."
                      : "No data yet. Connect Outlook or add a transaction."}
                </p>
              )}
            </Card>

            {/* ------------------------------------------------ IA + rubros */}
            {/* auto-fit en vez de dos columnas fijas: en móvil se apila solo,
                sin necesidad de media queries (los estilos van inline). */}
            <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))" }}>
              <Card
                title={es ? "Diagnóstico con IA" : "AI diagnosis"}
                subtitle={
                  insight
                    ? `${es ? "Actualizado" : "Updated"} ${timeAgo(insight.createdAt, lang)}`
                    : es
                      ? "Sin análisis todavía"
                      : "No analysis yet"
                }
                right={
                  <Button variant="soft" small onClick={() => void refreshInsight()} disabled={busy === "insight"}>
                    {es ? "Analizar" : "Analyze"}
                  </Button>
                }
              >
                {insight ? (
                  <>
                    <HealthGauge score={insight.healthScore} verdict={insight.verdict} lang={lang} />
                    <p style={{ fontSize: 16, color: INK, margin: "18px 0 6px", lineHeight: 1.45, letterSpacing: "-.005em" }}>
                      {insight.headline}
                    </p>
                    <p style={{ fontSize: 13.5, color: "#52514e", margin: "0 0 16px", lineHeight: 1.6 }}>
                      {insight.summary}
                    </p>

                    {insight.actions.length > 0 && (
                      <>
                        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".18em", color: MUTED, textTransform: "uppercase", marginBottom: 9 }}>
                          {es ? "Qué corregir" : "What to fix"}
                        </div>
                        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                          {insight.actions.map((a, i) => (
                            <li
                              key={i}
                              style={{
                                border: HAIRLINE,
                                borderRadius: 11,
                                padding: "11px 13px",
                                display: "flex",
                                gap: 12,
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: MONO,
                                  fontSize: 11,
                                  color: MUTED,
                                  minWidth: 16,
                                  paddingTop: 2,
                                }}
                              >
                                {i + 1}
                              </span>
                              <span style={{ flex: 1 }}>
                                <span style={{ fontSize: 13.5, color: INK, display: "block" }}>{a.title}</span>
                                <span style={{ fontSize: 12.5, color: MUTED, display: "block", marginTop: 3, lineHeight: 1.5 }}>
                                  {a.why}
                                </span>
                              </span>
                              {a.impactMonthly > 0 && (
                                <span
                                  style={{
                                    fontSize: 12.5,
                                    color: "#006300",
                                    fontVariantNumeric: "tabular-nums",
                                    whiteSpace: "nowrap",
                                    paddingTop: 1,
                                  }}
                                >
                                  +{fmtMoney(a.impactMonthly, lang, currency)}
                                </span>
                              )}
                            </li>
                          ))}
                        </ol>
                      </>
                    )}

                    {(insight.wins.length > 0 || insight.risks.length > 0) && (
                      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", marginTop: 18 }}>
                        <div>
                          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".18em", color: MUTED, textTransform: "uppercase", marginBottom: 7 }}>
                            {es ? "A favor" : "Working"}
                          </div>
                          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: "#52514e", lineHeight: 1.6 }}>
                            {insight.wins.map((wn, i) => (
                              <li key={i}>{wn}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".18em", color: MUTED, textTransform: "uppercase", marginBottom: 7 }}>
                            {es ? "En contra" : "Risks"}
                          </div>
                          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: "#52514e", lineHeight: 1.6 }}>
                            {insight.risks.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <p style={{ fontSize: 11, color: "#9a97a6", margin: "18px 0 0", lineHeight: 1.5 }}>
                      {es
                        ? "Análisis generado por Claude sobre tus datos. Es orientación de gasto y ahorro, no asesoría de inversión."
                        : "Generated by Claude from your data. Spending and saving guidance, not investment advice."}
                    </p>
                  </>
                ) : (
                  <p style={{ fontSize: 13.5, color: MUTED, margin: 0, lineHeight: 1.6 }}>
                    {es
                      ? "El análisis corre solo cada mañana. Presiona “Analizar” para generarlo ahora — tarda menos de un minuto."
                      : "The analysis runs automatically each morning. Hit “Analyze” to generate it now — it takes under a minute."}
                  </p>
                )}
              </Card>

              <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
                <Card
                  title={es ? "Gastos por rubro" : "Spending by category"}
                  subtitle={cur ? fmtMonth(cur.month, lang) : ""}
                >
                  <CategoryBars byCategory={cur?.byCategory ?? {}} lang={lang} currency={currency} />
                </Card>

                {summary && summary.budgets.length > 0 && (
                  <Card title={es ? "Presupuestos" : "Budgets"}>
                    <div style={{ display: "grid", gap: 11 }}>
                      {summary.budgets.map((b) => {
                        const over = b.pct > 100;
                        const near = b.pct > 85 && !over;
                        const color = over ? "#d03b3b" : near ? "#fab219" : "#0ca30c";
                        return (
                          <div key={b.category}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                              <span style={{ color: "#52514e" }}>
                                {catLabel(b.category, lang)}
                                {over && (
                                  <span style={{ color: "#d03b3b", marginLeft: 6 }}>
                                    ⚠ {es ? "excedido" : "over"}
                                  </span>
                                )}
                              </span>
                              <span style={{ color: INK, fontVariantNumeric: "tabular-nums" }}>
                                {fmtMoney(b.spent, lang, currency)} / {fmtMoney(b.limit, lang, currency)}
                              </span>
                            </div>
                            <div style={{ height: 8, background: "#f1f2f6", borderRadius: 4, overflow: "hidden" }}>
                              <div style={{ width: `${Math.min(100, b.pct)}%`, height: "100%", background: color, borderRadius: 4 }} />
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

        {tab === "movimientos" && (
          <TransactionsTab
            lang={lang}
            month={month}
            months={monthOptions}
            txns={txns}
            categories={summary?.categories ?? { expense: [], income: [] }}
            currency={currency}
            onMonth={setMonth}
            onPatch={patchTxn}
            onDelete={removeTxn}
            onCreated={() => {
              void loadMonth(month);
              void loadAll();
            }}
            onError={handleApiError}
          />
        )}

        {tab === "ajustes" && (
          <SettingsTab
            lang={lang}
            summary={summary}
            status={status}
            busy={busy}
            onConnectOutlook={connectOutlook}
            onSync={sync}
            onSaved={() => void loadAll()}
            onError={handleApiError}
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

// -------------------------------------------------------- movimientos ------

function TransactionsTab({
  lang,
  month,
  months,
  txns,
  categories,
  currency,
  onMonth,
  onPatch,
  onDelete,
  onCreated,
  onError,
}: {
  lang: "es" | "en";
  month: string;
  months: string[];
  txns: Transaction[];
  categories: { expense: string[]; income: string[] };
  currency: string;
  onMonth: (m: string) => void;
  onPatch: (t: Transaction, changes: Record<string, unknown>) => void;
  onDelete: (t: Transaction) => void;
  onCreated: () => void;
  onError: (e: unknown) => void;
}) {
  const es = lang === "es";
  const [q, setQ] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const filtered = txns.filter((t) =>
    q ? `${t.merchant} ${t.category} ${t.notes ?? ""}`.toLowerCase().includes(q.toLowerCase()) : true
  );

  return (
    <Card
      title={es ? "Movimientos" : "Transactions"}
      subtitle={`${filtered.length} ${es ? "registros" : "records"}`}
      right={
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={month} onChange={(e) => onMonth(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "7px 10px", fontSize: 12.5 }}>
            {[...new Set(months)].sort().reverse().map((m) => (
              <option key={m} value={m}>
                {fmtMonth(m, lang)}
              </option>
            ))}
          </select>
          <Button small variant="dark" onClick={() => setAdding((v) => !v)}>
            {adding ? (es ? "Cancelar" : "Cancel") : es ? "+ Agregar" : "+ Add"}
          </Button>
        </div>
      }
    >
      {adding && (
        <ManualForm
          lang={lang}
          categories={categories}
          onError={onError}
          onDone={() => {
            setAdding(false);
            onCreated();
          }}
        />
      )}

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={es ? "Buscar comercio, categoría o nota…" : "Search merchant, category or note…"}
        style={{ ...inputStyle, marginBottom: 12 }}
      />

      {filtered.length === 0 ? (
        <p style={{ fontSize: 13.5, color: MUTED, margin: 0 }}>
          {es ? "Nada en este mes." : "Nothing in this month."}
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: MUTED, fontFamily: MONO, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" }}>
                <th style={{ padding: "0 8px 8px 0", fontWeight: 400 }}>{es ? "Fecha" : "Date"}</th>
                <th style={{ padding: "0 8px 8px 0", fontWeight: 400 }}>{es ? "Comercio" : "Merchant"}</th>
                <th style={{ padding: "0 8px 8px 0", fontWeight: 400 }}>{es ? "Categoría" : "Category"}</th>
                <th style={{ padding: "0 8px 8px 0", fontWeight: 400, textAlign: "right" }}>{es ? "Monto" : "Amount"}</th>
                <th style={{ padding: "0 0 8px 0", fontWeight: 400 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.sk} style={{ borderTop: HAIRLINE, opacity: t.excluded ? 0.45 : 1 }}>
                  <td style={{ padding: "10px 8px 10px 0", color: MUTED, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {fmtDate(t.date, lang)}
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", color: INK, minWidth: 170 }}>
                    {t.merchant}
                    <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>
                      {t.source === "manual" ? (es ? "manual" : "manual") : `Diners ····${t.card || "—"}`}
                      {t.source === "email-ai" && " · IA"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px 10px 0" }}>
                    <select
                      value={t.category}
                      onChange={(e) => onPatch(t, { category: e.target.value })}
                      style={{ ...inputStyle, width: "auto", padding: "5px 8px", fontSize: 12.5 }}
                    >
                      {(t.kind === "income" ? categories.income : categories.expense).map((c) => (
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
                    {fmtMoney(t.amount, lang, t.currency || currency)}
                  </td>
                  <td style={{ padding: "10px 0", textAlign: "right", whiteSpace: "nowrap" }}>
                    <button
                      onClick={() => onPatch(t, { excluded: !t.excluded })}
                      title={es ? "Excluir de los totales" : "Exclude from totals"}
                      style={{ border: "none", background: "transparent", cursor: "pointer", color: MUTED, fontSize: 12, padding: "4px 6px" }}
                    >
                      {t.excluded ? (es ? "incluir" : "include") : es ? "excluir" : "exclude"}
                    </button>
                    <button
                      onClick={() => onDelete(t)}
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

function ManualForm({
  lang,
  categories,
  onDone,
  onError,
}: {
  lang: "es" | "en";
  categories: { expense: string[]; income: string[] };
  onDone: () => void;
  onError: (e: unknown) => void;
}) {
  const es = lang === "es";
  const [kind, setKind] = React.useState<"expense" | "income">("expense");
  const [merchant, setMerchant] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = React.useState("otros");
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const pool = kind === "income" ? categories.income : categories.expense;
  React.useEffect(() => {
    if (!pool.includes(category)) setCategory(pool[0] ?? "otros");
  }, [kind, pool, category]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount.replace(",", "."));
    if (!merchant.trim() || !Number.isFinite(value) || value <= 0) return;
    setSaving(true);
    try {
      await api.createTransaction({
        kind,
        merchant: merchant.trim(),
        amount: value,
        date: new Date(`${date}T12:00:00`).toISOString(),
        category,
        notes,
      });
      setMerchant("");
      setAmount("");
      setNotes("");
      onDone();
    } catch (err) {
      onError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      style={{
        border: HAIRLINE,
        borderRadius: 12,
        padding: 14,
        marginBottom: 14,
        background: "#fbfbfd",
        display: "grid",
        gap: 10,
        gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
        alignItems: "end",
      }}
    >
      <Field label={es ? "Tipo" : "Type"}>
        <select value={kind} onChange={(e) => setKind(e.target.value as "expense" | "income")} style={inputStyle}>
          <option value="expense">{es ? "Gasto" : "Expense"}</option>
          <option value="income">{es ? "Ingreso" : "Income"}</option>
        </select>
      </Field>
      <Field label={es ? "Descripción" : "Description"}>
        <input value={merchant} onChange={(e) => setMerchant(e.target.value)} style={inputStyle} required />
      </Field>
      <Field label={es ? "Monto (USD)" : "Amount (USD)"}>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" style={inputStyle} required />
      </Field>
      <Field label={es ? "Fecha" : "Date"}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
      </Field>
      <Field label={es ? "Categoría" : "Category"}>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
          {pool.map((c) => (
            <option key={c} value={c}>
              {catLabel(c, lang)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={es ? "Nota" : "Note"}>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} style={inputStyle} />
      </Field>
      <Button variant="dark" disabled={saving}>
        {saving ? (es ? "Guardando…" : "Saving…") : es ? "Guardar" : "Save"}
      </Button>
    </form>
  );
}

// ------------------------------------------------------------- ajustes -----

function SettingsTab({
  lang,
  summary,
  status,
  busy,
  onConnectOutlook,
  onSync,
  onSaved,
  onError,
  notify,
}: {
  lang: "es" | "en";
  summary: Summary | null;
  status: Status | null;
  busy: string;
  onConnectOutlook: () => void;
  onSync: (days?: number) => void;
  onSaved: () => void;
  onError: (e: unknown) => void;
  notify: (m: string) => void;
}) {
  const es = lang === "es";
  const s = summary?.settings;
  const [incomeGoal, setIncomeGoal] = React.useState("");
  const [rateGoal, setRateGoal] = React.useState("");
  const [fundGoal, setFundGoal] = React.useState("");
  const [budgets, setBudgets] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!s) return;
    setIncomeGoal(String(s.monthlyIncomeGoal ?? 0));
    setRateGoal(String(s.savingsRateGoal ?? 20));
    setFundGoal(String(s.emergencyFundGoal ?? 0));
    setBudgets(Object.fromEntries(Object.entries(s.budgets ?? {}).map(([k, v]) => [k, String(v)])));
  }, [s]);

  const save = async () => {
    setSaving(true);
    try {
      await api.saveSettings({
        monthlyIncomeGoal: Number(incomeGoal) || 0,
        savingsRateGoal: Number(rateGoal) || 0,
        emergencyFundGoal: Number(fundGoal) || 0,
        budgets: Object.fromEntries(
          Object.entries(budgets)
            .map(([k, v]) => [k, Number(v) || 0])
            .filter(([, v]) => (v as number) > 0)
        ),
      });
      notify(es ? "Guardado." : "Saved.");
      onSaved();
    } catch (e) {
      onError(e);
    } finally {
      setSaving(false);
    }
  };

  const categories = summary?.categories.expense ?? [];

  return (
    <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
      <Card title={es ? "Conexión con tu correo" : "Mailbox connection"}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: status?.outlookConnected ? "#0ca30c" : "#d03b3b",
                flex: "none",
              }}
            />
            <span style={{ color: INK }}>
              {status?.outlookConnected
                ? es
                  ? "Conectado"
                  : "Connected"
                : es
                  ? "No conectado"
                  : "Not connected"}
            </span>
            {status?.mailbox && <span style={{ color: MUTED }}>· {status.mailbox}</span>}
          </div>

          <p style={{ fontSize: 12.5, color: MUTED, margin: 0, lineHeight: 1.6 }}>
            {es
              ? "Se leen solo los correos de los remitentes configurados, en modo lectura. Nunca se envía ni se borra nada de tu buzón."
              : "Only mail from the configured senders is read, read-only. Nothing is ever sent or deleted from your mailbox."}
          </p>

          {status?.senders && status.senders.length > 0 && (
            <div style={{ fontFamily: MONO, fontSize: 11, color: MUTED, lineHeight: 1.7, wordBreak: "break-all" }}>
              {status.senders.join(", ")}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button variant="dark" small onClick={onConnectOutlook} disabled={busy === "outlook"}>
              {status?.outlookConnected
                ? es
                  ? "Reconectar"
                  : "Reconnect"
                : es
                  ? "Conectar Outlook"
                  : "Connect Outlook"}
            </Button>
            <Button variant="soft" small onClick={() => onSync()} disabled={busy === "sync"}>
              {es ? "Sincronizar ahora" : "Sync now"}
            </Button>
            <Button variant="ghost" small onClick={() => onSync(180)} disabled={busy === "sync"}>
              {es ? "Importar 6 meses" : "Import 6 months"}
            </Button>
          </div>

          <div style={{ fontSize: 12, color: MUTED, borderTop: HAIRLINE, paddingTop: 11, lineHeight: 1.7 }}>
            <div>
              {es ? "Última sincronización" : "Last sync"}: {timeAgo(status?.lastSyncAt ?? "", lang)}
            </div>
            <div>
              {es ? "Último correo leído" : "Latest mail read"}:{" "}
              {status?.lastMessageAt ? fmtDateTime(status.lastMessageAt, lang) : "—"}
            </div>
            {status?.model && <div>{es ? "Modelo" : "Model"}: {status.model}</div>}
          </div>
        </div>
      </Card>

      <Card title={es ? "Metas" : "Goals"}>
        <div style={{ display: "grid", gap: 12 }}>
          <Field label={es ? "Ingreso mensual objetivo (USD)" : "Monthly income goal (USD)"}>
            <input value={incomeGoal} onChange={(e) => setIncomeGoal(e.target.value)} inputMode="decimal" style={inputStyle} />
          </Field>
          <Field label={es ? "Tasa de ahorro objetivo (%)" : "Savings rate goal (%)"}>
            <input value={rateGoal} onChange={(e) => setRateGoal(e.target.value)} inputMode="decimal" style={inputStyle} />
          </Field>
          <Field label={es ? "Fondo de emergencia objetivo (USD)" : "Emergency fund goal (USD)"}>
            <input value={fundGoal} onChange={(e) => setFundGoal(e.target.value)} inputMode="decimal" style={inputStyle} />
          </Field>
          <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.55 }}>
            {es
              ? "La IA usa estas metas como referencia al evaluar si vas bien o mal."
              : "The AI uses these goals as the yardstick when judging how you're doing."}
          </p>
        </div>
      </Card>

      <Card title={es ? "Presupuesto por rubro" : "Budget by category"} subtitle={es ? "Deja en blanco para no controlar ese rubro" : "Leave blank to skip a category"}>
        <div style={{ display: "grid", gap: 9, gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
          {categories.map((c) => (
            <Field key={c} label={catLabel(c, lang)}>
              <input
                value={budgets[c] ?? ""}
                onChange={(e) => setBudgets((b) => ({ ...b, [c]: e.target.value }))}
                inputMode="decimal"
                placeholder="—"
                style={inputStyle}
              />
            </Field>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <Button variant="dark" onClick={() => void save()} disabled={saving}>
            {saving ? (es ? "Guardando…" : "Saving…") : es ? "Guardar ajustes" : "Save settings"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
