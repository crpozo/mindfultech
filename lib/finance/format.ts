/** Formato de dinero/fechas y etiquetas bilingües de categorías. */

import type { Lang } from "@/components/i18n";

export function fmtMoney(v: number, lang: Lang = "es", currency = "USD"): string {
  return new Intl.NumberFormat(lang === "es" ? "es-EC" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(v) ? v : 0);
}

/** Versión corta para ejes y etiquetas dentro de una barra: $1,2k */
export function fmtShort(v: number): string {
  const n = Math.abs(v);
  if (n >= 1000) return `$${(v / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `$${Math.round(v)}`;
}

export function fmtPct(v: number): string {
  return `${(Number.isFinite(v) ? v : 0).toFixed(1)}%`;
}

const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTHS_EN = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "2026-07" → "jul 26" */
export function fmtMonth(key: string, lang: Lang = "es"): string {
  const [y, m] = key.split("-");
  const idx = Math.max(0, Math.min(11, Number(m) - 1));
  const name = (lang === "es" ? MONTHS_ES : MONTHS_EN)[idx];
  return `${name} ${y.slice(2)}`;
}

export function fmtDate(iso: string, lang: Lang = "es"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return new Intl.DateTimeFormat(lang === "es" ? "es-EC" : "en-US", {
    day: "2-digit",
    month: "short",
  }).format(d);
}

export function fmtDateTime(iso: string, lang: Lang = "es"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(lang === "es" ? "es-EC" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Cuánto hace que pasó algo, en palabras. */
export function timeAgo(iso: string, lang: Lang = "es"): string {
  if (!iso) return lang === "es" ? "nunca" : "never";
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff) || diff < 0) return lang === "es" ? "recién" : "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return lang === "es" ? "recién" : "just now";
  if (mins < 60) return lang === "es" ? `hace ${mins} min` : `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return lang === "es" ? `hace ${hours} h` : `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return lang === "es" ? `hace ${days} d` : `${days} d ago`;
}

export const CATEGORY_LABELS: Record<string, { es: string; en: string }> = {
  comida: { es: "Comida", en: "Food" },
  supermercado: { es: "Supermercado", en: "Groceries" },
  transporte: { es: "Transporte", en: "Transport" },
  combustible: { es: "Combustible", en: "Fuel" },
  suscripciones: { es: "Suscripciones", en: "Subscriptions" },
  servicios: { es: "Servicios básicos", en: "Utilities" },
  salud: { es: "Salud", en: "Health" },
  hogar: { es: "Hogar", en: "Home" },
  educacion: { es: "Educación", en: "Education" },
  entretenimiento: { es: "Entretenimiento", en: "Entertainment" },
  ropa: { es: "Ropa", en: "Clothing" },
  viajes: { es: "Viajes", en: "Travel" },
  negocio: { es: "Negocio", en: "Business" },
  impuestos: { es: "Impuestos", en: "Taxes" },
  financiero: { es: "Financiero", en: "Financial" },
  otros: { es: "Otros", en: "Other" },
  salario: { es: "Salario", en: "Salary" },
  clientes: { es: "Clientes", en: "Clients" },
  inversiones: { es: "Inversiones", en: "Investments" },
  reembolso: { es: "Reembolso", en: "Refund" },
  otros_ingresos: { es: "Otros ingresos", en: "Other income" },
};

export function catLabel(id: string, lang: Lang = "es"): string {
  const entry = CATEGORY_LABELS[id];
  if (!entry) return id;
  return lang === "es" ? entry.es : entry.en;
}

export function currentMonthKey(): string {
  // El backend trabaja en hora de Ecuador (UTC-5); replicamos el mismo corte
  // para que "mes actual" signifique lo mismo en los dos lados.
  const now = new Date(Date.now() - 5 * 3600 * 1000);
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}
