// Soft passcode gate shared by the private tools (/tasks, /fitness). One code
// unlocks them all for the session. Not encryption — it keeps the pages private
// from a casual onlooker; the data itself is stored in plain text so a passcode
// reset never loses anything.

export const AUTH_KEY = "mt_tasks_auth_v1";
export const UNLOCK_KEY = "mt_tasks_unlocked_v1"; // sessionStorage

interface Auth {
  salt: string;
  hash: string;
}

function bytesToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPass(salt: string, pass: string): Promise<string> {
  const data = new TextEncoder().encode(salt + "|" + pass);
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const digest = await crypto.subtle.digest("SHA-256", data);
      return bytesToHex(digest);
    }
  } catch {
    /* fall through */
  }
  // Fallback for the rare no-SubtleCrypto case (still just a soft gate).
  let h = 5381;
  for (let i = 0; i < data.length; i++) h = ((h << 5) + h + data[i]) >>> 0;
  return "djb2-" + h.toString(16);
}

function randomSalt(): string {
  try {
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return bytesToHex(a.buffer);
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export function hasPasscode(): boolean {
  try {
    return !!localStorage.getItem(AUTH_KEY);
  } catch {
    return false;
  }
}

export async function setPasscode(pass: string): Promise<boolean> {
  const salt = randomSalt();
  const hash = await hashPass(salt, pass);
  const auth: Auth = { salt, hash };
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    return true;
  } catch {
    // private mode / quota — let the caller surface a message instead of
    // hanging the lock screen forever
    return false;
  }
}

export async function verifyPasscode(pass: string): Promise<boolean> {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const auth = JSON.parse(raw) as Auth;
    const hash = await hashPass(auth.salt, pass);
    return hash === auth.hash;
  } catch {
    return false;
  }
}

// Reset keeps tasks (data is not encrypted) — avoids the "forgot passcode wipes
// everything" footgun. Removing the auth record forces the create-passcode flow.
export function resetPasscode(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(UNLOCK_KEY);
  } catch {
    /* noop */
  }
}

export function isUnlocked(): boolean {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function setUnlocked(v: boolean): void {
  try {
    if (v) sessionStorage.setItem(UNLOCK_KEY, "1");
    else sessionStorage.removeItem(UNLOCK_KEY);
  } catch {
    /* noop */
  }
}
