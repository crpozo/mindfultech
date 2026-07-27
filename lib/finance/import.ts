/**
 * Entrada de movimientos: pegar lo que Claude devuelve.
 *
 * No hay formulario de alta uno por uno. El flujo real es: le cuentas a Claude
 * tus gastos (o le pegas los correos de Diners), te devuelve JSON, y ese JSON
 * entra aquí. Por eso el parser es deliberadamente tolerante — un modelo puede
 * envolver el array en un objeto, escribir la categoría con tilde, mandar el
 * monto como texto o rodear todo con ```json. Nada de eso debería costarte una
 * ronda de corrección.
 */

import { CATEGORY_LABELS } from "./format";
import {
  categoriesFor,
  uid,
  type FinanceState,
  type Kind,
  type Txn,
} from "./store";

export interface ImportResult {
  added: Txn[];
  duplicates: number;
  skipped: string[];
}

function strip(s: string): string {
  let out = (s ?? "").toLowerCase().trim();
  for (const [a, b] of [
    ["á", "a"],
    ["é", "e"],
    ["í", "i"],
    ["ó", "o"],
    ["ú", "u"],
    ["ñ", "n"],
    ["ü", "u"],
  ]) {
    out = out.split(a).join(b);
  }
  return out.replace(/\s+/g, " ");
}

/** Acepta el id de la categoría o su etiqueta en español o inglés. */
function resolveCategory(raw: unknown, kind: Kind): string {
  const pool = categoriesFor(kind);
  const fallback = kind === "income" ? "otros_ingresos" : "otros";
  const value = strip(String(raw ?? ""));
  if (!value) return fallback;
  if (pool.includes(value)) return value;
  for (const id of pool) {
    const label = CATEGORY_LABELS[id];
    if (!label) continue;
    if (strip(label.es) === value || strip(label.en) === value) return id;
  }
  // Sinónimos que un modelo puede elegir sin estar equivocado.
  const aliases: Record<string, string> = {
    alimentacion: "comida",
    restaurante: "comida",
    restaurantes: "comida",
    mercado: "supermercado",
    groceries: "supermercado",
    gasolina: "combustible",
    nafta: "combustible",
    suscripcion: "suscripciones",
    software: "suscripciones",
    internet: "servicios",
    telefono: "servicios",
    luz: "servicios",
    agua: "servicios",
    arriendo: "hogar",
    alquiler: "hogar",
    renta: "hogar",
    medico: "salud",
    farmacia: "salud",
    banco: "financiero",
    interes: "financiero",
    intereses: "financiero",
    comision: "financiero",
    seguro: "financiero",
    seguros: "financiero",
    impuesto: "impuestos",
    cliente: "clientes",
    honorarios: "clientes",
    factura: "clientes",
    sueldo: "salario",
  };
  const alias = aliases[value];
  if (alias && pool.includes(alias)) return alias;
  return fallback;
}

function resolveKind(row: Record<string, unknown>): Kind {
  const raw = strip(String(row.kind ?? row.tipo ?? row.type ?? ""));
  if (
    ["income", "ingreso", "ingresos", "cobro", "credito", "abono"].includes(raw)
  )
    return "income";
  if (
    [
      "expense",
      "gasto",
      "gastos",
      "egreso",
      "debito",
      "compra",
      "consumo",
    ].includes(raw)
  )
    return "expense";
  // Sin campo explícito, asumimos gasto: es lo que domina en volumen, y
  // marcar un ingreso como gasto se ve al instante en el neto del mes.
  return "expense";
}

function resolveAmount(row: Record<string, unknown>): number {
  const raw = row.amount ?? row.monto ?? row.valor ?? row.value;
  if (typeof raw === "number") return Math.abs(raw);
  const cleaned = String(raw ?? "").replace(/[^\d.,-]/g, "");
  if (!cleaned) return 0;
  const lastDot = cleaned.lastIndexOf(".");
  const lastComma = cleaned.lastIndexOf(",");
  let normalized = cleaned;
  if (lastDot > lastComma) normalized = cleaned.replace(/,/g, "");
  else if (lastComma > lastDot)
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  else normalized = cleaned.replace(/,/g, "");
  return Math.abs(Number(normalized) || 0);
}

function resolveDate(row: Record<string, unknown>): string | null {
  const raw = String(row.date ?? row.fecha ?? "").trim();
  if (!raw) return new Date().toISOString();
  // YYYY-MM-DD (con o sin hora) — el formato que pedimos.
  const iso = /^(\d{4})-(\d{2})-(\d{2})([ T](\d{2}):(\d{2}))?/.exec(raw);
  if (iso) {
    const [, y, mo, d, , h = "12", mi = "00"] = iso;
    return new Date(`${y}-${mo}-${d}T${h}:${mi}:00`).toISOString();
  }
  // DD/MM/YYYY, la forma en que se escribe una fecha en Ecuador.
  const local = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/.exec(raw);
  if (local) {
    const [, d, mo, y] = local;
    return new Date(
      `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T12:00:00`,
    ).toISOString();
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** Misma fecha, mismo monto y mismo comercio = el mismo movimiento. */
function fingerprint(t: {
  date: string;
  amount: number;
  merchant: string;
}): string {
  return `${t.date.slice(0, 10)}|${t.amount.toFixed(2)}|${strip(t.merchant)}`;
}

/** Saca el JSON de una respuesta que puede venir con prosa o cercas de código. */
function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(trimmed);
  const candidates = [fenced?.[1], trimmed].filter(Boolean) as string[];
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // El modelo pudo dejar una frase antes o después del array/objeto.
      const start = candidate.search(/[[{]/);
      const end = Math.max(
        candidate.lastIndexOf("]"),
        candidate.lastIndexOf("}"),
      );
      if (start >= 0 && end > start) {
        try {
          return JSON.parse(candidate.slice(start, end + 1));
        } catch {
          /* siguiente candidato */
        }
      }
    }
  }
  return null;
}

export function parseTransactions(
  text: string,
  existing: Txn[],
): ImportResult | null {
  const data = extractJson(text);
  if (!data) return null;

  const rows: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray((data as Record<string, unknown>).transactions)
      ? ((data as Record<string, unknown>).transactions as unknown[])
      : Array.isArray((data as Record<string, unknown>).movimientos)
        ? ((data as Record<string, unknown>).movimientos as unknown[])
        : [];
  if (!rows.length) return null;

  const seen = new Set(existing.map(fingerprint));
  const added: Txn[] = [];
  const skipped: string[] = [];
  let duplicates = 0;

  for (const entry of rows) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const merchant = String(
      row.merchant ?? row.comercio ?? row.descripcion ?? row.description ?? "",
    ).trim();
    const amount = resolveAmount(row);
    const date = resolveDate(row);

    if (!merchant || amount <= 0 || !date) {
      skipped.push(merchant || JSON.stringify(row).slice(0, 40));
      continue;
    }

    const kind = resolveKind(row);
    const candidate: Txn = {
      id: uid(),
      date,
      amount,
      kind,
      category: resolveCategory(
        row.category ?? row.rubro ?? row.categoria,
        kind,
      ),
      merchant: merchant.slice(0, 80),
      notes: String(row.notes ?? row.nota ?? "").slice(0, 400),
      excluded: false,
      card: row.card ? String(row.card).slice(0, 4) : undefined,
    };

    const key = fingerprint(candidate);
    if (seen.has(key)) {
      duplicates++;
      continue;
    }
    seen.add(key);
    added.push(candidate);
  }

  return { added, duplicates, skipped };
}

/**
 * Instrucciones para pegar en Claude. Le damos el esquema exacto y la lista de
 * categorías válidas para que lo que devuelva entre sin tocar nada.
 */
export function importPrompt(state: FinanceState): string {
  const today = new Date().toISOString().slice(0, 10);
  const known = [...new Set(state.transactions.map((t) => t.merchant))].slice(
    0,
    25,
  );

  return `Te voy a dar mis movimientos (escritos, o pegados de los correos de mi banco). Conviértelos en JSON para mi dashboard de finanzas.

Responde SOLO con un array JSON — sin explicación y sin cerca de código. Un objeto por movimiento:

{"date":"YYYY-MM-DD","amount":12.34,"kind":"expense","category":"comida","merchant":"Supermaxi","notes":""}

Reglas:
- "amount" siempre positivo. "kind" es "expense" o "income".
- "category" para gastos, exactamente una de: ${categoriesFor("expense").join(", ")}
- "category" para ingresos, exactamente una de: ${categoriesFor("income").join(", ")}
- Si falta la fecha, usa ${today}.
- Los montos ecuatorianos usan coma decimal: "3,50" son 3.50 dólares.
- No inventes movimientos, montos ni fechas. Si algo no está claro, déjalo fuera y me lo dices al final, después del JSON.
${known.length ? `- Comercios que ya uso, respeta la misma escritura: ${known.join(", ")}` : ""}

Mis movimientos:
`;
}
