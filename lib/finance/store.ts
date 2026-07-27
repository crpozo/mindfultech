/**
 * Almacén local del dashboard de finanzas — todo vive en el navegador, igual
 * que /tasks. Sin servidor, sin red, sin cuenta que crear.
 *
 * Es deliberado: la entrada es manual por ahora, y para eso un backend solo
 * agrega piezas que se pueden romper. Cuando llegue el momento de leer el
 * correo solo, el stack está escrito en `infra/finance/` esperando; el formato
 * de datos de aquí es el mismo que usa, así que migrar es subir el JSON.
 *
 * La contraseña es una compuerta suave (SHA-256 con sal): mantiene el tablero
 * privado de una mirada casual, no cifra nada. Por eso resetearla nunca pierde
 * datos — y por eso el botón de exportar importa: esto vive en un navegador, y
 * un navegador se borra.
 */

export type Kind = "expense" | "income";

export interface Txn {
  id: string;
  /** ISO 8601 con hora local de Ecuador. */
  date: string;
  amount: number;
  kind: Kind;
  category: string;
  merchant: string;
  notes: string;
  /** Fuera de los totales sin borrarlo: reembolsos, gastos de un tercero. */
  excluded: boolean;
  card?: string;
}

export interface Account {
  id: string;
  name: string;
  /** `investment` no cuenta para el runway: no es dinero disponible mañana. */
  kind: "cash" | "bank" | "investment";
  balance: number;
}

export interface Debt {
  id: string;
  name: string;
  balance: number;
  monthlyPayment: number;
}

export interface Receivable {
  id: string;
  client: string;
  amount: number;
  status: "pending" | "paid";
  note?: string;
}

export interface Settings {
  currency: string;
  monthlyIncomeGoal: number;
  savingsRateGoal: number;
  emergencyFundGoal: number;
  /**
   * Gasto mensual declarado. Solo se usa como referencia mientras no haya
   * meses cerrados con movimientos: los presupuestos por rubro cubren una
   * parte del gasto, no todo, y tomarlos como total infla el runway.
   */
  monthlyExpenseEstimate: number;
  budgets: Record<string, number>;
  /** Lo que los números no dicen. Viaja con los datos al analizarlos. */
  profile: string;
}

export interface FinanceState {
  version: number;
  transactions: Txn[];
  accounts: Account[];
  debts: Debt[];
  receivables: Receivable[];
  settings: Settings;
}

export const STATE_VERSION = 1;
export const STATE_KEY = "mt_fin_state_v1";
export const AUTH_KEY = "mt_fin_auth_v1";
export const UNLOCK_KEY = "mt_fin_unlocked_v1"; // sessionStorage

export const EXPENSE_CATEGORIES = [
  "comida",
  "supermercado",
  "transporte",
  "combustible",
  "suscripciones",
  "servicios",
  "salud",
  "hogar",
  "educacion",
  "entretenimiento",
  "ropa",
  "viajes",
  "negocio",
  "impuestos",
  "financiero",
  "otros",
] as const;

export const INCOME_CATEGORIES = [
  "clientes",
  "salario",
  "inversiones",
  "reembolso",
  "otros_ingresos",
] as const;

export function categoriesFor(kind: Kind): readonly string[] {
  return kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

// ---------------------------------------------------------------- semilla --

/**
 * Punto de partida con las cifras reales al 26 de julio de 2026. Solo se usa
 * la primera vez; después manda lo que haya en localStorage.
 */
export function seedState(): FinanceState {
  return {
    version: STATE_VERSION,
    transactions: [],
    accounts: [
      { id: "paypal", name: "PayPal", kind: "bank", balance: 4500 },
      { id: "wise", name: "Wise", kind: "bank", balance: 3600 },
      { id: "procredit", name: "ProCredit", kind: "bank", balance: 3000 },
      { id: "pichincha", name: "Pichincha", kind: "bank", balance: 2500 },
      {
        id: "ibkr",
        name: "Interactive Brokers",
        kind: "investment",
        balance: 2000,
      },
    ],
    debts: [
      {
        id: "auto",
        name: "Préstamo vehículo",
        balance: 12800,
        monthlyPayment: 520,
      },
    ],
    receivables: [
      { id: "helixona", client: "Helixona", amount: 3800, status: "pending" },
      { id: "wfs-1", client: "WFS", amount: 1500, status: "pending" },
      { id: "wfs-2", client: "WFS", amount: 3200, status: "pending" },
      {
        id: "theme-motion",
        client: "Theme Motion",
        amount: 1000,
        status: "pending",
      },
      { id: "betan", client: "Betan", amount: 400, status: "pending" },
      { id: "andrew", client: "Andrew", amount: 500, status: "pending" },
      { id: "scott", client: "Scott", amount: 525, status: "pending" },
    ],
    settings: {
      currency: "USD",
      monthlyIncomeGoal: 5000,
      savingsRateGoal: 30,
      // Seis meses de gasto: el colchón estándar, y más necesario todavía
      // cuando el ingreso llega por proyecto.
      emergencyFundGoal: 18000,
      monthlyExpenseEstimate: 3000,
      budgets: { hogar: 550, suscripciones: 200, financiero: 700 },
      profile: DEFAULT_PROFILE,
    },
  };
}

export const DEFAULT_PROFILE = `Carlos Pozo — Quito, Ecuador. Dueño de MindfulTech.

Ingreso: freelance por proyectos de software, en dólares y en escalada. No hay sueldo fijo, así que los meses son irregulares por naturaleza. Helixona es el cliente más recurrente, con un promedio cercano a 3.000 USD al mes, pero no está garantizado. Sigo buscando proyectos nuevos.

Gastos: alrededor de 3.000 al mes en total, incluidos arriendo (550) y cuota del vehículo (520). Seguros y afines suman unos 700. Claude: 200.

Metas:
1. Aumentar patrimonio y tener estabilidad, no solo rotar dinero.
2. Afiliarme al IESS y aportar el mínimo de forma continua. Es requisito de entrada: el BIESS pide entre dos y tres años de aportaciones para dar un crédito hipotecario decente, así que cada mes sin aportar corre la fecha en que puedo comprar departamento.
3. Comprar departamento cuando el historial de aportaciones lo permita.

Riesgos a vigilar: concentración de ingreso en pocos clientes, cartera por cobrar creciendo más rápido de lo que se cobra, y meses sin proyecto nuevo.`;

// ------------------------------------------------------------ persistencia --

export function uid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID)
      return crypto.randomUUID();
  } catch {
    /* noop */
  }
  return (
    "id-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

export function loadState(): FinanceState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as FinanceState;
    return normalize(parsed);
  } catch {
    // almacenamiento bloqueado o JSON corrupto — arrancar limpio antes que
    // dejar la pantalla en blanco
    return seedState();
  }
}

export function saveState(s: FinanceState): boolean {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

function num(v: unknown, fallback = 0): number {
  const n =
    typeof v === "number" ? v : Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

/** Rellena lo que falte y descarta lo que no encaje, sin perder lo válido. */
function normalize(s: Partial<FinanceState> | null): FinanceState {
  const base = seedState();
  if (!s || typeof s !== "object") return base;
  const seen = new Set<string>();
  const freshId = (id: unknown): string => {
    let v = typeof id === "string" && id ? id : uid();
    while (seen.has(v)) v = uid();
    seen.add(v);
    return v;
  };
  return {
    version: STATE_VERSION,
    transactions: (Array.isArray(s.transactions) ? s.transactions : [])
      .filter((t) => t && typeof t === "object")
      .map((t) => ({
        id: freshId(t.id),
        date: str(t.date, new Date().toISOString()),
        amount: num(t.amount),
        kind: (t.kind === "income" ? "income" : "expense") as Kind,
        category: str(t.category, "otros"),
        merchant: str(t.merchant, "—"),
        notes: str(t.notes),
        excluded: Boolean(t.excluded),
        card: str(t.card) || undefined,
      }))
      .filter((t) => t.amount > 0),
    accounts: (Array.isArray(s.accounts) ? s.accounts : base.accounts)
      .filter((a) => a && typeof a.name === "string")
      .map((a) => ({
        id: freshId(a.id),
        name: a.name,
        kind: a.kind === "cash" || a.kind === "investment" ? a.kind : "bank",
        balance: num(a.balance),
      })),
    debts: (Array.isArray(s.debts) ? s.debts : base.debts)
      .filter((d) => d && typeof d.name === "string")
      .map((d) => ({
        id: freshId(d.id),
        name: d.name,
        balance: num(d.balance),
        monthlyPayment: num(d.monthlyPayment),
      })),
    receivables: (Array.isArray(s.receivables)
      ? s.receivables
      : base.receivables
    )
      .filter((r) => r && typeof r.client === "string")
      .map((r) => ({
        id: freshId(r.id),
        client: r.client,
        amount: num(r.amount),
        status: r.status === "paid" ? "paid" : "pending",
        note: str(r.note) || undefined,
      })),
    settings: {
      currency: str(s.settings?.currency, "USD"),
      monthlyIncomeGoal: num(
        s.settings?.monthlyIncomeGoal,
        base.settings.monthlyIncomeGoal,
      ),
      savingsRateGoal: num(
        s.settings?.savingsRateGoal,
        base.settings.savingsRateGoal,
      ),
      emergencyFundGoal: num(
        s.settings?.emergencyFundGoal,
        base.settings.emergencyFundGoal,
      ),
      monthlyExpenseEstimate: num(
        s.settings?.monthlyExpenseEstimate,
        base.settings.monthlyExpenseEstimate,
      ),
      budgets:
        s.settings?.budgets && typeof s.settings.budgets === "object"
          ? Object.fromEntries(
              Object.entries(s.settings.budgets)
                .map(([k, v]) => [k, num(v)])
                .filter(([, v]) => (v as number) > 0),
            )
          : base.settings.budgets,
      profile: str(s.settings?.profile, base.settings.profile),
    },
  };
}

// ------------------------------------------------------- respaldo y rescate --

export function exportState(s: FinanceState): void {
  const blob = new Blob([JSON.stringify(s, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mindfultech-finanzas-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseImport(text: string): FinanceState | null {
  try {
    const parsed = JSON.parse(text) as Partial<FinanceState>;
    if (!parsed || typeof parsed !== "object") return null;
    return normalize(parsed);
  } catch {
    return null;
  }
}

// -------------------------------------------------------------- compuerta --

interface Auth {
  salt: string;
  hash: string;
}

/**
 * Código por defecto, para que el tablero se abra desde el primer día sin
 * pantalla de configuración.
 *
 * Sí: este repositorio es público y este número se lee en el código. No es
 * descuido — es que aquí no hay nada que proteger del mundo. Los datos no
 * viven en un servidor sino en el localStorage de un navegador concreto, así
 * que quien conozca el código y entre desde otra máquina ve un tablero vacío,
 * no las finanzas de nadie. Lo que esta compuerta detiene es a quien pase por
 * delante de ESTA computadora con la sesión abierta, y para eso un número
 * conocido sirve igual. Cámbialo desde Ajustes y el nuevo queda solo aquí,
 * como hash con sal.
 */
export const DEFAULT_PASSCODE = "2201";

function bytesToHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt(): string {
  try {
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return bytesToHex(a);
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

async function hashPass(salt: string, pass: string): Promise<string> {
  const data = new TextEncoder().encode(salt + "|" + pass);
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      return bytesToHex(await crypto.subtle.digest("SHA-256", data));
    }
  } catch {
    /* sigue al respaldo */
  }
  let h = 5381;
  for (let i = 0; i < data.length; i++) h = ((h << 5) + h + data[i]) >>> 0;
  return "djb2-" + h.toString(16);
}

export function hasPasscode(): boolean {
  try {
    return !!localStorage.getItem(AUTH_KEY);
  } catch {
    return false;
  }
}

/** Deja el código por defecto listo la primera vez, sin pedir nada. */
export async function ensureDefaultPasscode(): Promise<void> {
  if (hasPasscode()) return;
  await setPasscode(DEFAULT_PASSCODE);
}

export async function setPasscode(pass: string): Promise<boolean> {
  const salt = randomSalt();
  const auth: Auth = { salt, hash: await hashPass(salt, pass) };
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    return true;
  } catch {
    return false;
  }
}

export async function verifyPasscode(pass: string): Promise<boolean> {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const auth = JSON.parse(raw) as Auth;
    return (await hashPass(auth.salt, pass)) === auth.hash;
  } catch {
    return false;
  }
}

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
