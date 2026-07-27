/** Cliente tipado del API de finanzas. */

import { bearerToken } from "./auth";
import { loadConfig } from "./config";

export interface Transaction {
  sk: string;
  id: string;
  month: string;
  date: string;
  amount: number;
  currency: string;
  merchant: string;
  card: string;
  kind: "expense" | "income";
  category: string;
  source: "email" | "email-ai" | "manual";
  bank?: string;
  subject?: string;
  notes?: string;
  excluded?: boolean;
}

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

export interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  pct: number;
}

export interface Settings {
  currency: string;
  monthlyIncomeGoal: number;
  savingsRateGoal: number;
  emergencyFundGoal: number;
  budgets: Record<string, number>;
}

export interface Summary {
  months: MonthSummary[];
  current: MonthSummary | null;
  previous: MonthSummary | null;
  deltas: { income: number; expense: number; net: number };
  averages: { expense: number; income: number };
  projectedExpense: number;
  budgets: BudgetStatus[];
  settings: Settings;
  categories: { expense: string[]; income: string[] };
  generatedAt: string;
}

export interface Insight {
  createdAt: string;
  model: string;
  healthScore: number;
  verdict: "excelente" | "bien" | "atencion" | "riesgo";
  headline: string;
  summary: string;
  wins: string[];
  risks: string[];
  actions: { title: string; why: string; impactMonthly: number; effort: string }[];
  forecast: { nextMonthExpense: number; savingsRate: number; runwayMonths: number };
}

export interface Status {
  outlookConnected: boolean;
  mailbox: string;
  senders: string[];
  lastSyncAt: string;
  lastMessageAt: string;
  model: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cfg = await loadConfig();
  if (!cfg.apiBase) throw new ApiError("El dashboard todavía no está configurado.", 0);
  const token = await bearerToken();
  if (!token) throw new ApiError("Sesión expirada.", 401);

  const res = await fetch(`${cfg.apiBase}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (res.status === 204) return {} as T;
  const text = await res.text();
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!res.ok) throw new ApiError(String(data.error ?? `Error ${res.status}`), res.status);
  return data as T;
}

export const api = {
  summary: (months = 6) => request<Summary>(`/summary?months=${months}`),
  transactions: (month: string) =>
    request<{ month: string; transactions: Transaction[] }>(`/transactions?month=${month}`),
  createTransaction: (body: Partial<Transaction>) =>
    request<{ transaction: Transaction }>("/transactions", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateTransaction: (month: string, sk: string, body: Record<string, unknown>) =>
    request<{ transaction: Transaction }>(
      `/transactions/${encodeURIComponent(month)}/${encodeURIComponent(sk)}`,
      { method: "PATCH", body: JSON.stringify(body) }
    ),
  deleteTransaction: (month: string, sk: string) =>
    request<{ ok: boolean }>(
      `/transactions/${encodeURIComponent(month)}/${encodeURIComponent(sk)}`,
      { method: "DELETE" }
    ),
  insights: () => request<{ insight: Insight | null }>("/insights"),
  refreshInsights: () => request<{ queued: boolean }>("/insights/refresh", { method: "POST" }),
  settings: () => request<{ settings: Settings }>("/settings"),
  saveSettings: (body: Partial<Settings>) =>
    request<{ settings: Settings }>("/settings", { method: "POST", body: JSON.stringify(body) }),
  sync: (days?: number) =>
    request<{ queued: boolean }>("/sync", {
      method: "POST",
      body: JSON.stringify(days ? { days } : {}),
    }),
  status: () => request<Status>("/status"),
  connectOutlook: () => request<{ url: string }>("/oauth/url", { method: "POST" }),
};
