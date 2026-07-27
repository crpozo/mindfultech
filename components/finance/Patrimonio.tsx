"use client";

/**
 * Patrimonio: cuentas, deudas y cuentas por cobrar.
 *
 * Los movimientos cuentan el flujo (cuánto entra y sale); esto cuenta el stock
 * (cuánto hay). Con ingreso por proyectos, el stock es lo que dice si hay
 * estabilidad — el runway en meses importa más que un mes bueno o malo.
 *
 * Lo facturado y no cobrado se muestra aparte del patrimonio a propósito: hasta
 * que el cliente pague, no es dinero.
 */

import * as React from "react";
import { api, type Account, type Debt, type Receivable, type Summary } from "@/lib/finance/api";
import { fmtMoney } from "@/lib/finance/format";
import type { Lang } from "@/components/i18n";

const MONO = "var(--mono)";
const INK = "var(--ink)";
const MUTED = "#8b8896";
const HAIRLINE = "1px solid rgba(14,13,18,.08)";

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: HAIRLINE,
  borderRadius: 9,
  padding: "8px 10px",
  fontSize: 13.5,
  color: INK,
  background: "#fff",
  fontFamily: "inherit",
};

function Panel({
  title,
  subtitle,
  total,
  children,
}: {
  title: string;
  subtitle?: string;
  total?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ background: "#fff", border: HAIRLINE, borderRadius: 16, padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 500, color: INK, margin: 0 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 12.5, color: MUTED, margin: "3px 0 0" }}>{subtitle}</p>}
        </div>
        {total && (
          <span style={{ fontSize: 17, color: INK, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            {total}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}

function RowShell({ children, onDelete, label }: { children: React.ReactNode; onDelete: () => void; label: string }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", borderTop: HAIRLINE, paddingTop: 10 }}>
      <div style={{ flex: 1, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))" }}>
        {children}
      </div>
      <button
        onClick={onDelete}
        aria-label={label}
        title={label}
        style={{ border: "none", background: "transparent", color: "#c2410c", cursor: "pointer", fontSize: 13, padding: "8px 4px" }}
      >
        ✕
      </button>
    </div>
  );
}

export function Patrimonio({
  lang,
  summary,
  onChanged,
  onError,
}: {
  lang: Lang;
  summary: Summary | null;
  onChanged: () => void;
  onError: (e: unknown) => void;
}) {
  const es = lang === "es";
  const currency = summary?.settings.currency ?? "USD";
  const nw = summary?.networth;

  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [debts, setDebts] = React.useState<Debt[]>([]);
  const [ars, setArs] = React.useState<Receivable[]>([]);

  React.useEffect(() => {
    setAccounts(summary?.accounts ?? []);
    setDebts(summary?.debts ?? []);
    setArs(summary?.receivables ?? []);
  }, [summary]);

  const save = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      onChanged();
    } catch (e) {
      onError(e);
    }
  };

  const num = (v: string) => Number(String(v).replace(",", ".")) || 0;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {nw && (
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))" }}>
          {[
            { label: es ? "Patrimonio neto" : "Net worth", value: nw.netWorth, hint: es ? "activos − deuda" : "assets − debt" },
            { label: es ? "Disponible" : "Liquid", value: nw.liquid, hint: es ? "sin contar inversiones" : "excludes investments" },
            { label: es ? "Deuda" : "Debt", value: nw.debt, hint: `${fmtMoney(nw.monthlyDebtPayment, lang, currency)}/${es ? "mes" : "mo"}` },
            { label: es ? "Por cobrar" : "Receivables", value: nw.receivablesPending, hint: es ? "facturado, no cobrado" : "invoiced, unpaid" },
          ].map((k) => (
            <div key={k.label} style={{ background: "#fff", border: HAIRLINE, borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".18em", color: MUTED, textTransform: "uppercase" }}>
                {k.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 500, color: INK, marginTop: 8, letterSpacing: "-.02em" }}>
                {fmtMoney(k.value, lang, currency)}
              </div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 5 }}>{k.hint}</div>
            </div>
          ))}
        </div>
      )}

      {nw && nw.runwayMonths > 0 && (
        <div
          style={{
            background: nw.runwayMonths < 3 ? "#fff7ed" : "#eef8f6",
            border: `1px solid ${nw.runwayMonths < 3 ? "#fed7aa" : "#c3e7e0"}`,
            borderRadius: 12,
            padding: "13px 16px",
            fontSize: 13.5,
            color: nw.runwayMonths < 3 ? "#9a3412" : "#2c5c55",
            lineHeight: 1.55,
          }}
        >
          <strong>
            {es ? "Runway" : "Runway"}: {nw.runwayMonths.toFixed(1)} {es ? "meses" : "months"}
          </strong>{" "}
          {es
            ? "— lo que aguanta tu efectivo al ritmo de gasto actual si no entrara un solo cobro nuevo."
            : "— how long your cash lasts at the current burn if no new payment came in."}
        </div>
      )}

      <Panel
        title={es ? "Cuentas" : "Accounts"}
        subtitle={es ? "Saldos actuales. Las inversiones no cuentan para el runway." : "Current balances. Investments don't count toward runway."}
        total={nw ? fmtMoney(nw.assets, lang, currency) : undefined}
      >
        <div style={{ display: "grid", gap: 10 }}>
          {accounts.map((a) => (
            <RowShell key={a.id} label={es ? "Borrar cuenta" : "Delete account"} onDelete={() => void save(() => api.deleteAccount(a.id))}>
              <input
                value={a.name}
                onChange={(e) => setAccounts((cur) => cur.map((x) => (x.id === a.id ? { ...x, name: e.target.value } : x)))}
                onBlur={() => void save(() => api.saveAccount(a))}
                style={inputStyle}
              />
              <select
                value={a.kind}
                onChange={(e) => {
                  const next = { ...a, kind: e.target.value as Account["kind"] };
                  setAccounts((cur) => cur.map((x) => (x.id === a.id ? next : x)));
                  void save(() => api.saveAccount(next));
                }}
                style={inputStyle}
              >
                <option value="bank">{es ? "Banco" : "Bank"}</option>
                <option value="cash">{es ? "Efectivo" : "Cash"}</option>
                <option value="investment">{es ? "Inversión" : "Investment"}</option>
              </select>
              <input
                value={String(a.balance)}
                inputMode="decimal"
                onChange={(e) => setAccounts((cur) => cur.map((x) => (x.id === a.id ? { ...x, balance: e.target.value as unknown as number } : x)))}
                onBlur={(e) => void save(() => api.saveAccount({ ...a, balance: num(e.target.value) }))}
                style={{ ...inputStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
              />
            </RowShell>
          ))}
          <NewRow
            lang={lang}
            fields={[
              { key: "name", placeholder: es ? "Nombre de la cuenta" : "Account name" },
              { key: "balance", placeholder: es ? "Saldo" : "Balance", numeric: true },
            ]}
            onAdd={(v) => void save(() => api.saveAccount({ name: v.name, balance: num(v.balance), kind: "bank" }))}
          />
        </div>
      </Panel>

      <Panel title={es ? "Deudas" : "Debts"} total={nw ? fmtMoney(nw.debt, lang, currency) : undefined}>
        <div style={{ display: "grid", gap: 10 }}>
          {debts.map((d) => (
            <RowShell key={d.id} label={es ? "Borrar deuda" : "Delete debt"} onDelete={() => void save(() => api.deleteDebt(d.id))}>
              <input
                value={d.name}
                onChange={(e) => setDebts((cur) => cur.map((x) => (x.id === d.id ? { ...x, name: e.target.value } : x)))}
                onBlur={() => void save(() => api.saveDebt(d))}
                style={inputStyle}
              />
              <input
                value={String(d.balance)}
                inputMode="decimal"
                title={es ? "Saldo pendiente" : "Outstanding balance"}
                onChange={(e) => setDebts((cur) => cur.map((x) => (x.id === d.id ? { ...x, balance: e.target.value as unknown as number } : x)))}
                onBlur={(e) => void save(() => api.saveDebt({ ...d, balance: num(e.target.value) }))}
                style={{ ...inputStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
              />
              <input
                value={String(d.monthlyPayment)}
                inputMode="decimal"
                title={es ? "Cuota mensual" : "Monthly payment"}
                onChange={(e) => setDebts((cur) => cur.map((x) => (x.id === d.id ? { ...x, monthlyPayment: e.target.value as unknown as number } : x)))}
                onBlur={(e) => void save(() => api.saveDebt({ ...d, monthlyPayment: num(e.target.value) }))}
                style={{ ...inputStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
              />
            </RowShell>
          ))}
          <NewRow
            lang={lang}
            fields={[
              { key: "name", placeholder: es ? "Deuda" : "Debt" },
              { key: "balance", placeholder: es ? "Saldo" : "Balance", numeric: true },
              { key: "monthlyPayment", placeholder: es ? "Cuota" : "Payment", numeric: true },
            ]}
            onAdd={(v) =>
              void save(() =>
                api.saveDebt({ name: v.name, balance: num(v.balance), monthlyPayment: num(v.monthlyPayment), kind: "otro" })
              )
            }
          />
        </div>
      </Panel>

      <Panel
        title={es ? "Por cobrar" : "Receivables"}
        subtitle={es ? "Facturado y no cobrado. No suma al patrimonio hasta que entra." : "Invoiced and unpaid. Not net worth until it lands."}
        total={nw ? fmtMoney(nw.receivablesPending, lang, currency) : undefined}
      >
        <div style={{ display: "grid", gap: 10 }}>
          {ars.map((r) => (
            <RowShell key={r.id} label={es ? "Borrar" : "Delete"} onDelete={() => void save(() => api.deleteReceivable(r.id))}>
              <input
                value={r.client}
                onChange={(e) => setArs((cur) => cur.map((x) => (x.id === r.id ? { ...x, client: e.target.value } : x)))}
                onBlur={() => void save(() => api.saveReceivable(r))}
                style={inputStyle}
              />
              <input
                value={String(r.amount)}
                inputMode="decimal"
                onChange={(e) => setArs((cur) => cur.map((x) => (x.id === r.id ? { ...x, amount: e.target.value as unknown as number } : x)))}
                onBlur={(e) => void save(() => api.saveReceivable({ ...r, amount: num(e.target.value) }))}
                style={{ ...inputStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
              />
              <select
                value={r.status}
                onChange={(e) => {
                  const next = { ...r, status: e.target.value as Receivable["status"] };
                  setArs((cur) => cur.map((x) => (x.id === r.id ? next : x)));
                  void save(() => api.saveReceivable(next));
                }}
                style={inputStyle}
              >
                <option value="pending">{es ? "Pendiente" : "Pending"}</option>
                <option value="paid">{es ? "Cobrado" : "Paid"}</option>
              </select>
            </RowShell>
          ))}
          <NewRow
            lang={lang}
            fields={[
              { key: "client", placeholder: es ? "Cliente" : "Client" },
              { key: "amount", placeholder: es ? "Monto" : "Amount", numeric: true },
            ]}
            onAdd={(v) => void save(() => api.saveReceivable({ client: v.client, amount: num(v.amount), status: "pending" }))}
          />
        </div>
      </Panel>
    </div>
  );
}

function NewRow({
  lang,
  fields,
  onAdd,
}: {
  lang: Lang;
  fields: { key: string; placeholder: string; numeric?: boolean }[];
  onAdd: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = React.useState<Record<string, string>>({});
  const first = fields[0].key;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values[first]?.trim()) return;
    onAdd(values);
    setValues({});
  };
  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8, alignItems: "center", borderTop: HAIRLINE, paddingTop: 10 }}>
      <div style={{ flex: 1, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))" }}>
        {fields.map((f) => (
          <input
            key={f.key}
            value={values[f.key] ?? ""}
            placeholder={f.placeholder}
            inputMode={f.numeric ? "decimal" : undefined}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            style={f.numeric ? { ...inputStyle, textAlign: "right" } : inputStyle}
          />
        ))}
      </div>
      <button
        type="submit"
        style={{ border: "none", background: "#f1f2f6", color: INK, borderRadius: 9, padding: "8px 14px", fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap" }}
      >
        {lang === "es" ? "Agregar" : "Add"}
      </button>
    </form>
  );
}
