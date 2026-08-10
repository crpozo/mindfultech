"use client";

/**
 * Patrimonio: cuentas, deudas y cuentas por cobrar.
 *
 * Los movimientos cuentan el flujo (cuánto entra y sale); esto cuenta el stock
 * (cuánto hay). Con ingreso por proyectos el stock es lo que dice si hay
 * estabilidad — un mes bueno o malo no dice casi nada.
 *
 * Lo facturado y no cobrado se muestra aparte del patrimonio a propósito:
 * hasta que el cliente pague, no es dinero.
 */

import * as React from "react";
import type { Lang } from "@/components/i18n";
import { fmtMoney } from "@/lib/finance/format";
import type { NetWorth } from "@/lib/finance/analysis";
import {
  uid,
  type Account,
  type Commitment,
  type Debt,
  type FinanceState,
  type Receivable,
} from "@/lib/finance/store";

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
const numInput: React.CSSProperties = {
  ...inputStyle,
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
};

const toNum = (v: string) => Number(String(v).replace(",", ".")) || 0;

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
    <section
      style={{
        background: "#fff",
        border: HAIRLINE,
        borderRadius: 16,
        padding: 20,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 500, color: INK, margin: 0 }}>
            {title}
          </h2>
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
        {total && (
          <span
            style={{
              fontSize: 17,
              color: INK,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            {total}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}

function Row({
  children,
  onDelete,
  label,
}: {
  children: React.ReactNode;
  onDelete: () => void;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        borderTop: HAIRLINE,
        paddingTop: 10,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
        }}
      >
        {children}
      </div>
      <button
        onClick={onDelete}
        aria-label={label}
        title={label}
        style={{
          border: "none",
          background: "transparent",
          color: "#c2410c",
          cursor: "pointer",
          fontSize: 13,
          padding: "8px 4px",
        }}
      >
        ✕
      </button>
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
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!values[first]?.trim()) return;
        onAdd(values);
        setValues({});
      }}
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        borderTop: HAIRLINE,
        paddingTop: 10,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
        }}
      >
        {fields.map((f) => (
          <input
            key={f.key}
            value={values[f.key] ?? ""}
            placeholder={f.placeholder}
            inputMode={f.numeric ? "decimal" : undefined}
            onChange={(e) =>
              setValues((v) => ({ ...v, [f.key]: e.target.value }))
            }
            style={f.numeric ? numInput : inputStyle}
          />
        ))}
      </div>
      <button
        type="submit"
        style={{
          border: "none",
          background: "#f1f2f6",
          color: INK,
          borderRadius: 9,
          padding: "8px 14px",
          fontSize: 12.5,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {"Agregar"}
      </button>
    </form>
  );
}

export function Patrimonio({
  lang,
  state,
  nw,
  baseline,
  update,
}: {
  lang: Lang;
  state: FinanceState;
  nw: NetWorth;
  baseline: number;
  update: (fn: (s: FinanceState) => FinanceState) => void;
}) {
  const currency = state.settings.currency;
  const m = (v: number) => fmtMoney(v, lang, currency);

  const setAccounts = (fn: (a: Account[]) => Account[]) =>
    update((s) => ({ ...s, accounts: fn(s.accounts) }));
  const setDebts = (fn: (d: Debt[]) => Debt[]) =>
    update((s) => ({ ...s, debts: fn(s.debts) }));
  const setArs = (fn: (r: Receivable[]) => Receivable[]) =>
    update((s) => ({ ...s, receivables: fn(s.receivables) }));
  const setCommitments = (fn: (c: Commitment[]) => Commitment[]) =>
    update((s) => ({ ...s, commitments: fn(s.commitments) }));

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
        }}
      >
        {[
          {
            label: "Patrimonio neto",
            value: nw.netWorth,
            hint: "activos − deuda",
          },
          {
            label: "Disponible",
            value: nw.liquid,
            hint: "sin contar inversiones",
          },
          {
            label: "Deuda",
            value: nw.debt,
            hint: `${m(nw.monthlyDebtPayment)}/${"mes"}`,
          },
          {
            label: "Fijo al mes",
            // Los compromisos ya absorben la cuota del vehículo (viaja dentro
            // del paquete de auto, celular y seguros), así que sumarle otra
            // vez monthlyDebtPayment la contaba doble. La cuota sigue en
            // Deudas para calcular el plazo de pago, no para el gasto fijo.
            value: nw.monthlyCommitments,
            hint: `compromisos fijos`,
          },
          {
            label: "Por cobrar",
            value: nw.receivablesPending,
            hint: "facturado, no cobrado",
          },
        ].map((k) => (
          <div
            key={k.label}
            style={{
              background: "#fff",
              border: HAIRLINE,
              borderRadius: 14,
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: ".18em",
                color: MUTED,
                textTransform: "uppercase",
              }}
            >
              {k.label}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: INK,
                marginTop: 8,
                letterSpacing: "-.02em",
              }}
            >
              {m(k.value)}
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 5 }}>
              {k.hint}
            </div>
          </div>
        ))}
      </div>

      {/* La aritmética a la vista: un patrimonio neto bajo junto a una cartera
          grande se lee como error si no se muestra de dónde sale. */}
      <div
        style={{
          background: "#fff",
          border: HAIRLINE,
          borderRadius: 14,
          padding: "16px 18px",
          fontSize: 13.5,
          color: "#52514e",
          lineHeight: 1.7,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: ".18em",
            color: MUTED,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          {"De dónde sale el patrimonio neto"}
        </div>
        <div
          style={{
            display: "grid",
            gap: 4,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span>{"Disponible en cuentas"}</span>
            <span style={{ color: INK }}>{m(nw.liquid)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span>+ {"Inversiones"}</span>
            <span style={{ color: INK }}>{m(nw.invested)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span>− {"Deuda pendiente"}</span>
            <span style={{ color: INK }}>{m(nw.debt)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              borderTop: HAIRLINE,
              paddingTop: 6,
              marginTop: 2,
              color: INK,
              fontSize: 15,
            }}
          >
            <span>{"Patrimonio neto"}</span>
            <span>{m(nw.netWorth)}</span>
          </div>
        </div>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 12.5,
            color: MUTED,
            lineHeight: 1.6,
          }}
        >
          {`Los ${m(nw.receivablesPending)} por cobrar no entran en esa cuenta: es dinero que ganaste pero que todavía tiene otro dueño. Si te pagaran todo hoy, tu patrimonio neto sería ${m(nw.netWorthWithReceivables)}: por eso cobrar mueve más la aguja que ahorrar.`}
        </p>
      </div>

      {nw.runwayMonths > 0 && (
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
            Runway: {nw.runwayMonths.toFixed(1)} {"meses"}
          </strong>{" "}
          {`Lo que aguanta tu efectivo gastando ${m(baseline)} al mes, si no entrara un solo cobro nuevo.`}
        </div>
      )}

      <Panel
        title={"Cuentas"}
        subtitle={"Saldos actuales. Las inversiones no cuentan para el runway."}
        total={m(nw.assets)}
      >
        <div style={{ display: "grid", gap: 10 }}>
          {state.accounts.map((a) => (
            <Row
              key={a.id}
              label={"Borrar cuenta"}
              onDelete={() =>
                setAccounts((cur) => cur.filter((x) => x.id !== a.id))
              }
            >
              <input
                value={a.name}
                onChange={(e) =>
                  setAccounts((cur) =>
                    cur.map((x) =>
                      x.id === a.id ? { ...x, name: e.target.value } : x,
                    ),
                  )
                }
                style={inputStyle}
              />
              <select
                value={a.kind}
                onChange={(e) =>
                  setAccounts((cur) =>
                    cur.map((x) =>
                      x.id === a.id
                        ? { ...x, kind: e.target.value as Account["kind"] }
                        : x,
                    ),
                  )
                }
                style={inputStyle}
              >
                <option value="bank">{"Banco"}</option>
                <option value="cash">{"Efectivo"}</option>
                <option value="investment">{"Inversión"}</option>
              </select>
              <input
                defaultValue={String(a.balance)}
                inputMode="decimal"
                onBlur={(e) =>
                  setAccounts((cur) =>
                    cur.map((x) =>
                      x.id === a.id
                        ? { ...x, balance: toNum(e.target.value) }
                        : x,
                    ),
                  )
                }
                style={numInput}
              />
            </Row>
          ))}
          <NewRow
            lang={lang}
            fields={[
              { key: "name", placeholder: "Nombre de la cuenta" },
              { key: "balance", placeholder: "Saldo", numeric: true },
            ]}
            onAdd={(v) =>
              setAccounts((cur) => [
                ...cur,
                {
                  id: uid(),
                  name: v.name.trim(),
                  kind: "bank",
                  balance: toNum(v.balance),
                },
              ])
            }
          />
        </div>
      </Panel>

      <Panel
        title={"Deudas"}
        subtitle={"Saldo pendiente y cuota mensual."}
        total={m(nw.debt)}
      >
        <div style={{ display: "grid", gap: 10 }}>
          {state.debts.map((d) => (
            <Row
              key={d.id}
              label={"Borrar deuda"}
              onDelete={() =>
                setDebts((cur) => cur.filter((x) => x.id !== d.id))
              }
            >
              <input
                value={d.name}
                onChange={(e) =>
                  setDebts((cur) =>
                    cur.map((x) =>
                      x.id === d.id ? { ...x, name: e.target.value } : x,
                    ),
                  )
                }
                style={inputStyle}
              />
              <input
                defaultValue={String(d.balance)}
                inputMode="decimal"
                title={"Saldo pendiente"}
                onBlur={(e) =>
                  setDebts((cur) =>
                    cur.map((x) =>
                      x.id === d.id
                        ? { ...x, balance: toNum(e.target.value) }
                        : x,
                    ),
                  )
                }
                style={numInput}
              />
              <input
                defaultValue={String(d.monthlyPayment)}
                inputMode="decimal"
                title={"Cuota mensual"}
                onBlur={(e) =>
                  setDebts((cur) =>
                    cur.map((x) =>
                      x.id === d.id
                        ? { ...x, monthlyPayment: toNum(e.target.value) }
                        : x,
                    ),
                  )
                }
                style={numInput}
              />
            </Row>
          ))}
          <NewRow
            lang={lang}
            fields={[
              { key: "name", placeholder: "Deuda" },
              { key: "balance", placeholder: "Saldo", numeric: true },
              { key: "monthlyPayment", placeholder: "Cuota", numeric: true },
            ]}
            onAdd={(v) =>
              setDebts((cur) => [
                ...cur,
                {
                  id: uid(),
                  name: v.name.trim(),
                  balance: toNum(v.balance),
                  monthlyPayment: toNum(v.monthlyPayment),
                },
              ])
            }
          />
        </div>
      </Panel>

      <Panel
        title={"Compromisos fijos"}
        subtitle={
          "Se pagan todos los meses y no son deuda: no hay saldo que baje, corren mientras sigan vigentes."
        }
        total={`${m(nw.monthlyCommitments)}/mes`}
      >
        <div style={{ display: "grid", gap: 10 }}>
          {state.commitments.map((c) => (
            <Row
              key={c.id}
              label={"Borrar compromiso"}
              onDelete={() =>
                setCommitments((cur) => cur.filter((x) => x.id !== c.id))
              }
            >
              <input
                value={c.name}
                onChange={(e) =>
                  setCommitments((cur) =>
                    cur.map((x) =>
                      x.id === c.id ? { ...x, name: e.target.value } : x,
                    ),
                  )
                }
                style={inputStyle}
              />
              <input
                defaultValue={String(c.amount)}
                inputMode="decimal"
                title={"Cuánto al mes"}
                onBlur={(e) =>
                  setCommitments((cur) =>
                    cur.map((x) =>
                      x.id === c.id ? { ...x, amount: toNum(e.target.value) } : x,
                    ),
                  )
                }
                style={numInput}
              />
            </Row>
          ))}
          {state.commitments.some((c) => c.note) && (
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 12,
                lineHeight: 1.5,
                color: MUTED,
              }}
            >
              {state.commitments.find((c) => c.note)?.note}
            </p>
          )}
          <NewRow
            lang={lang}
            fields={[
              { key: "name", placeholder: "Compromiso" },
              { key: "amount", placeholder: "Al mes", numeric: true },
            ]}
            onAdd={(v) =>
              setCommitments((cur) => [
                ...cur,
                {
                  id: uid(),
                  name: v.name.trim(),
                  amount: toNum(v.amount),
                  category: "otros",
                },
              ])
            }
          />
        </div>
      </Panel>

      <Panel
        title={"Por cobrar"}
        subtitle={
          "Facturado y no cobrado. No suma al patrimonio hasta que entra."
        }
        total={m(nw.receivablesPending)}
      >
        <div style={{ display: "grid", gap: 10 }}>
          {state.receivables.map((r) => (
            <Row
              key={r.id}
              label={"Borrar"}
              onDelete={() => setArs((cur) => cur.filter((x) => x.id !== r.id))}
            >
              <input
                value={r.client}
                onChange={(e) =>
                  setArs((cur) =>
                    cur.map((x) =>
                      x.id === r.id ? { ...x, client: e.target.value } : x,
                    ),
                  )
                }
                style={inputStyle}
              />
              <input
                defaultValue={String(r.amount)}
                inputMode="decimal"
                onBlur={(e) =>
                  setArs((cur) =>
                    cur.map((x) =>
                      x.id === r.id
                        ? { ...x, amount: toNum(e.target.value) }
                        : x,
                    ),
                  )
                }
                style={numInput}
              />
              <select
                value={r.status}
                onChange={(e) =>
                  setArs((cur) =>
                    cur.map((x) =>
                      x.id === r.id
                        ? {
                            ...x,
                            status: e.target.value as Receivable["status"],
                          }
                        : x,
                    ),
                  )
                }
                style={inputStyle}
              >
                <option value="pending">{"Pendiente"}</option>
                <option value="paid">{"Cobrado"}</option>
              </select>
            </Row>
          ))}
          <NewRow
            lang={lang}
            fields={[
              { key: "client", placeholder: "Cliente" },
              { key: "amount", placeholder: "Monto", numeric: true },
            ]}
            onAdd={(v) =>
              setArs((cur) => [
                ...cur,
                {
                  id: uid(),
                  client: v.client.trim(),
                  amount: toNum(v.amount),
                  status: "pending",
                },
              ])
            }
          />
        </div>
        <p
          style={{
            fontSize: 12,
            color: MUTED,
            margin: "14px 0 0",
            lineHeight: 1.55,
          }}
        >
          {
            "Cuando te paguen, márcalo como cobrado y registra el ingreso en Movimientos: así entra a la tendencia y a la tasa de ahorro."
          }
        </p>
      </Panel>
    </div>
  );
}
