/**
 * Configuración del dashboard de finanzas.
 *
 * El sitio es un export estático, así que no hay servidor donde inyectar
 * variables: la config se lee en tiempo de ejecución desde
 * `public/finance/config.json`. Ventaja concreta — cuando despliegas el stack de
 * AWS y cambian los ids, editas un JSON y haces push; no hay que reconstruir
 * el sitio ni tocar secretos de GitHub Actions.
 *
 * Nada de lo que va aquí es secreto: el client id de Cognito y la URL del API
 * son públicos por diseño (la app es un cliente público con PKCE). Lo que
 * protege los datos es el login, no la ocultación de estos valores.
 */

export interface FinanceConfig {
  /** Base del HTTP API, sin barra final. Ej: https://xxxx.execute-api.us-east-1.amazonaws.com/v1 */
  apiBase: string;
  /** Dominio del Hosted UI de Cognito. Ej: https://mft-finance-123.auth.us-east-1.amazoncognito.com */
  cognitoDomain: string;
  /** App client id (cliente público, sin secreto). */
  clientId: string;
}

const EMPTY: FinanceConfig = { apiBase: "", cognitoDomain: "", clientId: "" };

let cached: FinanceConfig | null = null;

function fromEnv(): FinanceConfig | null {
  const apiBase = process.env.NEXT_PUBLIC_FINANCE_API ?? "";
  const cognitoDomain = process.env.NEXT_PUBLIC_FINANCE_COGNITO_DOMAIN ?? "";
  const clientId = process.env.NEXT_PUBLIC_FINANCE_CLIENT_ID ?? "";
  if (apiBase && cognitoDomain && clientId) return { apiBase, cognitoDomain, clientId };
  return null;
}

/** Lee la config una sola vez por carga de página. */
export async function loadConfig(): Promise<FinanceConfig> {
  if (cached) return cached;
  const env = fromEnv();
  if (env) {
    cached = env;
    return cached;
  }
  try {
    const res = await fetch("/finance/config.json", { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const raw = (await res.json()) as Partial<FinanceConfig>;
    cached = {
      apiBase: (raw.apiBase ?? "").replace(/\/+$/, ""),
      cognitoDomain: (raw.cognitoDomain ?? "").replace(/\/+$/, ""),
      clientId: raw.clientId ?? "",
    };
  } catch {
    cached = EMPTY;
  }
  return cached;
}

export function isConfigured(c: FinanceConfig): boolean {
  return Boolean(c.apiBase && c.cognitoDomain && c.clientId);
}

/** El redirect que Cognito tiene registrado: siempre la propia página. */
export function redirectUri(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/finance/`;
}
