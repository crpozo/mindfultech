/**
 * Login contra Cognito Hosted UI con Authorization Code + PKCE.
 *
 * PKCE existe justamente para este caso: una app que corre entera en el
 * navegador y por lo tanto no puede guardar un client secret. El `code_verifier`
 * se genera aquí, nunca viaja en la primera petición, y sin él el `code` que
 * vuelve por la URL no sirve para nada.
 *
 * Los tokens viven en sessionStorage — al cerrar la pestaña desaparecen. El
 * costo es tener que reautenticar cada sesión; como Cognito mantiene su propia
 * cookie, en la práctica es un redirect que ni se ve.
 */

import { loadConfig, redirectUri, type FinanceConfig } from "./config";

const VERIFIER_KEY = "mt_fin_pkce_v1";
const TOKENS_KEY = "mt_fin_tokens_v1";
const STATE_KEY = "mt_fin_state_v1";

interface Tokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
}

// -------------------------------------------------------------- utilidades --

function ss(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null; // modo privado o cookies bloqueadas
  }
}

function randomString(bytes = 48): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return base64url(a);
}

function base64url(bytes: Uint8Array | ArrayBuffer): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function challenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64url(digest);
}

function readTokens(): Tokens | null {
  const raw = ss()?.getItem(TOKENS_KEY);
  if (!raw) return null;
  try {
    const t = JSON.parse(raw) as Tokens;
    return t.idToken ? t : null;
  } catch {
    return null;
  }
}

function writeTokens(t: Tokens | null) {
  const store = ss();
  if (!store) return;
  if (t) store.setItem(TOKENS_KEY, JSON.stringify(t));
  else store.removeItem(TOKENS_KEY);
}

function toTokens(json: Record<string, unknown>, fallbackRefresh = ""): Tokens {
  const expiresIn = Number(json.expires_in ?? 3600);
  return {
    idToken: String(json.id_token ?? ""),
    accessToken: String(json.access_token ?? ""),
    refreshToken: String(json.refresh_token ?? fallbackRefresh),
    // 60 s de colchón para no mandar un token que caduque en vuelo.
    expiresAt: Date.now() + (expiresIn - 60) * 1000,
  };
}

async function tokenRequest(cfg: FinanceConfig, body: Record<string, string>) {
  const res = await fetch(`${cfg.cognitoDomain}/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });
  if (!res.ok) throw new Error(`token ${res.status}: ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

// ----------------------------------------------------------------- público --

export function isSignedIn(): boolean {
  return readTokens() !== null;
}

export function userEmail(): string {
  const t = readTokens();
  if (!t) return "";
  try {
    const payload = JSON.parse(atob(t.idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return String(payload.email ?? "");
  } catch {
    return "";
  }
}

/** Manda al usuario al Hosted UI. */
export async function signIn(): Promise<void> {
  const cfg = await loadConfig();
  const verifier = randomString();
  const state = randomString(16);
  ss()?.setItem(VERIFIER_KEY, verifier);
  ss()?.setItem(STATE_KEY, state);
  const qs = new URLSearchParams({
    response_type: "code",
    client_id: cfg.clientId,
    redirect_uri: redirectUri(),
    scope: "openid email profile",
    state,
    code_challenge: await challenge(verifier),
    code_challenge_method: "S256",
  });
  window.location.assign(`${cfg.cognitoDomain}/oauth2/authorize?${qs}`);
}

export async function signOut(): Promise<void> {
  const cfg = await loadConfig();
  writeTokens(null);
  const qs = new URLSearchParams({ client_id: cfg.clientId, logout_uri: redirectUri() });
  window.location.assign(`${cfg.cognitoDomain}/logout?${qs}`);
}

/**
 * Si volvimos del Hosted UI con `?code=`, lo canjea por tokens y limpia la URL.
 * Devuelve true si acabó habiendo sesión.
 */
export async function completeSignIn(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    cleanUrl();
    throw new Error(url.searchParams.get("error_description") || error);
  }
  if (!code) return isSignedIn();

  const expected = ss()?.getItem(STATE_KEY);
  const verifier = ss()?.getItem(VERIFIER_KEY);
  cleanUrl();
  if (!verifier || !state || state !== expected) {
    // `state` distinto = la respuesta no corresponde a la petición que hicimos.
    throw new Error("La respuesta de Cognito no coincide con esta sesión.");
  }
  ss()?.removeItem(VERIFIER_KEY);
  ss()?.removeItem(STATE_KEY);

  const cfg = await loadConfig();
  const json = await tokenRequest(cfg, {
    grant_type: "authorization_code",
    client_id: cfg.clientId,
    code,
    redirect_uri: redirectUri(),
    code_verifier: verifier,
  });
  writeTokens(toTokens(json));
  return true;
}

function cleanUrl() {
  const clean = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, "", clean);
}

/** Token vigente para llamar al API; refresca solo si hace falta. */
export async function bearerToken(): Promise<string | null> {
  const t = readTokens();
  if (!t) return null;
  if (Date.now() < t.expiresAt) return t.idToken;
  if (!t.refreshToken) {
    writeTokens(null);
    return null;
  }
  try {
    const cfg = await loadConfig();
    const json = await tokenRequest(cfg, {
      grant_type: "refresh_token",
      client_id: cfg.clientId,
      refresh_token: t.refreshToken,
    });
    const next = toTokens(json, t.refreshToken);
    writeTokens(next);
    return next.idToken;
  } catch {
    writeTokens(null);
    return null;
  }
}
