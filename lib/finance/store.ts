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

/**
 * Obligación fija que se repite cada mes y no es deuda: no tiene saldo que
 * amortizar, se paga mientras siga vigente. El aporte al IESS es el caso
 * exacto — dejar de pagarlo no libera un saldo, corre la fecha en que el
 * BIESS presta.
 */
export interface Commitment {
  id: string;
  name: string;
  /** Cuánto se paga cada mes. */
  amount: number;
  /** Rubro de EXPENSE_CATEGORIES, para que cuadre con los movimientos. */
  category: string;
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
  commitments: Commitment[];
  settings: Settings;
}

export const STATE_VERSION = 22;
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
 * El coworking se paga una vez al año ($876), pero el tablero razona en meses
 * — runway, gasto mensual, presupuestos. Se registra prorrateado a $73/mes
 * (876 ÷ 12 exacto) para que ningún mes mienta: ni el once que se verían
 * baratos ni el uno que se vería carísimo. Vive en una constante porque
 * también lo inyecta la migración a v2 en tableros ya guardados.
 */
const COWORKING_COMMITMENT: Commitment & { sinceVersion: number } = {
  id: "coworking",
  sinceVersion: 2,
  name: "Coworking (anual)",
  amount: 73,
  category: "negocio",
  note: "Se paga $876 una vez al año; acá va prorrateado a $73/mes para que el gasto mensual y el runway lo cuenten sin picos.",
};

/**
 * Movimientos dictados por chat. Cada uno lleva `sinceVersion`: la migración
 * inyecta solo los que superan la versión guardada del tablero, así que para
 * añadir uno nuevo basta con ponerlo aquí y subir STATE_VERSION — no hace
 * falta tocar la migración, y los que el dueño ya borró a mano no vuelven.
 *
 * La fecha lleva el desfase de Ecuador escrito (`-05:00`) a propósito: sin él,
 * un movimiento de la noche se guarda como el día siguiente en UTC y cae en el
 * mes equivocado cuando el mes cambia de página.
 */
const SEEDED_TXNS: (Txn & { sinceVersion: number })[] = [
  {
    id: "txn-2026-07-29-carcompra-500",
    sinceVersion: 3,
    date: "2026-07-29T22:00:00-05:00",
    amount: 500,
    kind: "income",
    category: "clientes",
    merchant: "CarCompra: Alex",
    notes: "Cobro recibido.",
    excluded: false,
  },
  {
    id: "txn-2026-08-01-audifonos",
    sinceVersion: 4,
    date: "2026-08-01T19:00:00-05:00",
    amount: 300,
    kind: "expense",
    category: "salud",
    merchant: "Audífonos deportivos",
    notes: "Para nadar y trotar. Categoría salud por ser equipo de entrenamiento, cámbiala si prefieres otra.",
    excluded: false,
  },
  {
    id: "txn-2026-08-01-cremas",
    sinceVersion: 5,
    // $310 la compra completa menos los $300 de los audífonos
    date: "2026-08-01T19:00:00-05:00",
    amount: 10,
    kind: "expense",
    category: "salud",
    merchant: "Cremas hidratantes faciales (2)",
    notes: "Misma compra que los audífonos.",
    excluded: false,
  },
  {
    id: "txn-2026-08-05-titanium",
    sinceVersion: 13,
    date: "2026-08-05T15:00:00-05:00",
    amount: 2118.67,
    kind: "expense",
    category: "otros",
    merchant: "Tarjeta Titanium: consumo del mes",
    notes:
      "Estado de cuenta agregado, no un solo consumo: entra en 'otros' porque cubre varios rubros a la vez. El promedio declarado es ~$3 000; este mes cerró más bajo. Pagado con $2 000 movidos desde PayPal y $118,67 de Pichincha.",
    excluded: false,
  },
  {
    id: "txn-2026-08-07-andrew",
    sinceVersion: 19,
    date: "2026-08-07T12:00:00-05:00",
    amount: 498.3,
    kind: "income",
    category: "clientes",
    merchant: "Andrew Sam Binno",
    notes:
      "Depósito recibido en Wise el viernes 7 de agosto. La cuenta por cobrar decía $500: la diferencia de $1,70 es comisión de la transferencia.",
    excluded: false,
  },
  {
    id: "txn-2026-08-12-reembolso-500",
    sinceVersion: 21,
    date: "2026-08-12T12:00:00-05:00",
    amount: 500,
    kind: "income",
    category: "reembolso",
    merchant: "Devolución: trabajo no ejecutado",
    notes:
      "Plata que salió y volvió, no trabajo cobrado. Queda excluida de los totales porque el pago original nunca se registró acá: contarla como ingreso inflaría el mes en $500 sin que haya un gasto que compense. El saldo de PayPal sí la refleja.",
    excluded: true,
  },
  {
    id: "txn-2026-08-12-ropa",
    sinceVersion: 22,
    date: "2026-08-12T12:00:00-05:00",
    amount: 190,
    kind: "expense",
    category: "ropa",
    merchant: "Ropa",
    notes:
      "Si fue con la Titanium, ya está contada acá: cuando llegue el estado de cuenta de agosto hay que restarla del total agregado para no cobrarla dos veces.",
    excluded: false,
  },
];

/**
 * Cuentas por cobrar dictadas por chat. Un proyecto cerrado todavía no es
 * dinero en la cuenta, así que entra aquí y no como ingreso: el runway no debe
 * contar con lo que aún no llegó.
 *
 * A diferencia de los movimientos, aquí la migración hace upsert: subir el
 * `sinceVersion` de una fila que ya existe reescribe sus campos. Es la única
 * forma de corregir un dato publicado antes (un monto mal entendido, una fecha
 * que llegó después), y solo ocurre cuando publico una versión nueva.
 */
const SEEDED_RECEIVABLES: (Receivable & { sinceVersion: number })[] = [
  {
    id: "usfq-familias",
    sinceVersion: 7,
    client: "USFQ · Familias",
    amount: 5150,
    status: "pending",
    note: "Valor neto del proyecto, cerrado el 4 ago 2026. Cobro en dos tramos: el 15 de septiembre y las horas en diciembre (reparto por confirmar). Pagador institucional, riesgo de impago bajo.",
  },
  {
    id: "andrew",
    sinceVersion: 19,
    client: "Andrew Sam Binno",
    amount: 498.3,
    status: "paid",
    note: "Cobrado el 7 ago 2026. Estaba anotado en $500; llegaron $498,30 y la diferencia es comisión de transferencia, así que se cierra por lo que entró de verdad.",
  },
  {
    // Confirmado por él y con fecha, pero todavía no está en la cuenta: va
    // como cuenta por cobrar, no como ingreso. El runway no debe contar plata
    // que aún no llegó, por segura que sea — mismo criterio que la USFQ.
    id: "andrew-2",
    sinceVersion: 19,
    client: "Andrew Sam Binno (2.º pago)",
    amount: 498,
    status: "pending",
    note: "Se deposita en Wise el viernes 14 ago 2026, igual que el primero. Él lo da por confirmado al 100% y el dinero ya salió. Pasa a ingreso, y sube el saldo de Wise, cuando aparezca en la cuenta.",
  },
];

/** Sin `sinceVersion`, que no es parte del modelo guardado. */
const seedTxn = ({ sinceVersion: _v, ...t }: Txn & { sinceVersion: number }): Txn => t;
const seedRcv = ({ sinceVersion: _v, ...r }: Receivable & { sinceVersion: number }): Receivable => r;

/** Saldos dictados por chat. Mismo upsert: solo se reescribe la cuenta cuyo
    `sinceVersion` supera al del tablero, o sea cuando él acaba de darme la
    cifra. Un saldo que ajuste a mano después es suyo hasta la próxima. */
const SEEDED_ACCOUNTS: (Account & { sinceVersion: number })[] = [
  // 4 118,54 era el saldo antes del 7 de agosto; el depósito de Andrew cayó
  // aquí, así que se suma: 4 118,54 + 498,30. El segundo pago no está incluido
  // — sube este número recién cuando aparezca en la cuenta.
  { id: "wise", sinceVersion: 20, name: "Wise", kind: "bank", balance: 4616.84 },
  // Los $2 000 eran el traslado, no el saldo: PayPal tenía más y quedó en
  // 4 500 - 2 000 = 2 500. Ese 2 500 era deducido, no dictado, y el saldo que
  // él reporta ahora lo confirma: 2 500 + los 500 devueltos dan justo 3 000.
  { id: "paypal", sinceVersion: 21, name: "PayPal", kind: "bank", balance: 3000 },
  // Saldo dictado el 12 de agosto. Reemplaza al 2 381,33, que era deducido
  // (2 500 menos los 118,67 con que cerró el estado de cuenta): entre medio
  // hubo gasto corriente que no está anotado movimiento por movimiento.
  { id: "pichincha", sinceVersion: 21, name: "Pichincha", kind: "bank", balance: 1750 },
  { id: "procredit", sinceVersion: 21, name: "ProCredit", kind: "bank", balance: 3714 },
];
const seedAcc = ({ sinceVersion: _v, ...a }: Account & { sinceVersion: number }): Account => a;

/** Mismo upsert que las cuentas por cobrar: subir el `sinceVersion` de una
    fila existente reescribe sus campos en un tablero ya guardado. */
const SEEDED_COMMITMENTS: (Commitment & { sinceVersion: number })[] = [
  {
    id: "iess",
    sinceVersion: 8,
    name: "IESS: afiliación",
    amount: 180,
    category: "salud",
    note: "Afiliado desde agosto de 2026, $180 al mes. Mantiene corriendo el historial de aportaciones que pide el BIESS para el crédito hipotecario.",
  },
  {
    id: "auto-seguros",
    sinceVersion: 17,
    name: "Auto, celular y seguros",
    amount: 700,
    category: "financiero",
    note: "Paquete fijo: cuota del vehículo, plan celular, seguro del auto y seguro de salud. Los $520 de la cuota también viven en Deudas, donde sirven para calcular el plazo de pago; el gasto mensual los cuenta aquí, no allá.",
  },
  {
    id: "hbomax",
    sinceVersion: 16,
    name: "HBO Max",
    amount: 3.29,
    category: "suscripciones",
    note: "Mensual.",
  },
  {
    id: "arriendo",
    sinceVersion: 9,
    name: "Arriendo",
    amount: 550,
    category: "hogar",
    note: "Fijo mensual. Sale del estimado general y pasa a nombrarse aquí; el gasto total no cambia.",
  },
  COWORKING_COMMITMENT,
];

/**
 * Compromisos que dejaron de existir. Igual que las bajas de cartera: un id por
 * versión, se quita una sola vez, y si él ya lo había borrado a mano esto no
 * hace nada.
 */
const RETIRED_COMMITMENTS: { id: string; sinceVersion: number }[] = [
  // El gimnasio no era "$1 100 cada 15 meses": el estado de cuenta lo muestra
  // como diferido de PHISIQUE WELLNESS CLUB en 12 cuotas de $90,16 — junio
  // salió "(11/12)" y julio "(FINAL)". El plan terminó, así que no hay cuota
  // futura que prorratear.
  { id: "gym", sinceVersion: 18 },
];
const seedCmt = ({ sinceVersion: _v, ...c }: Commitment & { sinceVersion: number }): Commitment => c;

/**
 * Punto de partida con las cifras reales al 26 de julio de 2026. Solo se usa
 * la primera vez; después manda lo que haya en localStorage.
 */
export function seedState(): FinanceState {
  return {
    version: STATE_VERSION,
    transactions: SEEDED_TXNS.map(seedTxn),
    accounts: [
      // Solo lo que no esté ya en SEEDED_ACCOUNTS: PayPal, Pichincha y
      // ProCredit viven allá, y repetirlos acá creaba dos filas con el mismo
      // id en un tablero recién creado (seedState no pasa por normalize).
      ...SEEDED_ACCOUNTS.map(seedAcc),
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
      {
        id: "theme-motion",
        client: "Theme Motion",
        amount: 1000,
        status: "pending",
      },
      { id: "betan", client: "Betan", amount: 400, status: "pending" },
      { id: "scott", client: "Scott", amount: 525, status: "pending" },
      ...SEEDED_RECEIVABLES.map(seedRcv),
    ],
    commitments: SEEDED_COMMITMENTS.map(seedCmt),
    settings: {
      currency: "USD",
      monthlyIncomeGoal: 5000,
      savingsRateGoal: 30,
      // Seis meses de gasto: el colchón estándar, y más necesario todavía
      // cuando el ingreso llega por proyecto.
      emergencyFundGoal: 18000,
      monthlyExpenseEstimate: 2030,
      budgets: { hogar: 550, suscripciones: 200, financiero: 700 },
      profile: DEFAULT_PROFILE,
    },
  };
}

export const DEFAULT_PROFILE = `Carlos Pozo: Quito, Ecuador. Dueño de MindfulTech.

Ingreso: freelance por proyectos de software, en dólares y en escalada. No hay sueldo fijo, así que los meses son irregulares por naturaleza. Helixona es el cliente más recurrente, con un promedio cercano a 3.000 USD al mes, pero no está garantizado. Sigo buscando proyectos nuevos.

Gastos: la tarjeta Titanium mueve el grueso del gasto variable, unos 2.100 al mes medidos en el estado de cuenta de julio de 2026 (junio cerró en 4.319 por el viaje a Orlando, no es base). Esa tarjeta no lleva arriendo ni cuota del vehículo: van por fuera. Arriendo 550. Auto, celular y seguros, 700 en paquete. IESS 180. Claude/Anthropic ronda los 230-270 al mes con impuestos y va dentro del consumo de la tarjeta.

Metas:
1. Aumentar patrimonio y tener estabilidad, no solo rotar dinero.
2. Sostener la afiliación al IESS sin cortes (afiliado desde agosto de 2026, $180 al mes). Es requisito de entrada: el BIESS pide entre dos y tres años de aportaciones para dar un crédito hipotecario decente, así que cada mes sin aportar corre la fecha en que puedo comprar departamento.
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

  const from = num(s.version, 1) || 1;

  // Bajas dictadas por chat: cuentas por cobrar que resultaron incobrables.
  // Un id por versión — se quita una sola vez; si el dueño la había editado
  // o ya la había borrado él mismo, esto no hace nada.
  const WRITTEN_OFF: { id: string; sinceVersion: number }[] = [
    { id: "wfs-2", sinceVersion: 12 }, // $3 200 de WFS: no se van a cobrar
  ];
  if (Array.isArray(s.receivables)) {
    const drop = new Set(
      WRITTEN_OFF.filter((w) => w.sinceVersion > from).map((w) => w.id)
    );
    if (drop.size) {
      s = { ...s, receivables: s.receivables.filter((r) => !r || !drop.has(r.id)) };
    }
  }

  // El perfil viaja con los datos cuando se analizan, así que una meta ya
  // cumplida ahí adentro sigue sesgando el análisis. Esta es la única frase
  // que reescribo, y solo si sigue literal: el resto del texto es suyo, y si
  // la editó no la toco.
  if (from < 11 && typeof s.settings?.profile === "string") {
    const stale =
      "2. Afiliarme al IESS y aportar el mínimo de forma continua. Es requisito de entrada:";
    const fresh =
      "2. Sostener la afiliación al IESS sin cortes (afiliado desde agosto de 2026, $180 al mes). Es requisito de entrada:";
    if (s.settings.profile.includes(stale)) {
      s = {
        ...s,
        settings: { ...s.settings, profile: s.settings.profile.replace(stale, fresh) },
      };
    }
  }

  // Misma regla que arriba: una sola frase, y solo si sigue literal. La de
  // gastos era la declarada de memoria; los estados de cuenta de junio y julio
  // la reemplazan por lo medido.
  if (from < 18 && typeof s.settings?.profile === "string") {
    const stale =
      "Gastos: alrededor de 3.000 al mes en total, incluidos arriendo (550) y cuota del vehículo (520). Seguros y afines suman unos 700. Claude: 200.";
    const fresh =
      "Gastos: la tarjeta Titanium mueve el grueso del gasto variable, unos 2.100 al mes medidos en el estado de cuenta de julio de 2026 (junio cerró en 4.319 por el viaje a Orlando, no es base). Esa tarjeta no lleva arriendo ni cuota del vehículo: van por fuera. Arriendo 550. Auto, celular y seguros, 700 en paquete. IESS 180. Claude/Anthropic ronda los 230-270 al mes con impuestos y va dentro del consumo de la tarjeta.";
    if (s.settings.profile.includes(stale)) {
      s = {
        ...s,
        settings: { ...s.settings, profile: s.settings.profile.replace(stale, fresh) },
      };
    }
  }

  // Saldos de cuentas dictados por chat.
  {
    const acc = Array.isArray(s.accounts) ? s.accounts : [];
    const fresh = SEEDED_ACCOUNTS.filter((a) => a.sinceVersion > from);
    if (fresh.length) {
      const byId = new Map(fresh.map((a) => [a.id, seedAcc(a)]));
      const merged = acc.map((a) => {
        const patch = a && byId.get(a.id);
        if (!patch) return a;
        byId.delete(a.id);
        return { ...a, ...patch };
      });
      s = { ...s, accounts: [...merged, ...byId.values()] };
    }
  }

  // El arriendo pasó a ser un compromiso con nombre propio, y el burn se
  // calcula como estimado + compromisos: dejar el estimado en 3 000 lo
  // contaría dos veces. Se baja en los mismos $550, así que el total no se
  // mueve. Solo si sigue en el valor que sembré yo: un número que él haya
  // ajustado a mano es suyo y no se toca.
  if (from < 9 && s.settings && num(s.settings.monthlyExpenseEstimate) === 3000) {
    s = { ...s, settings: { ...s.settings, monthlyExpenseEstimate: 2450 } };
  }

  // Misma corrección que el arriendo, ahora con la cuota del vehículo: los
  // $3 000 declarados la incluían explícitamente, y el paquete de $700 la
  // vuelve a traer. Se descuentan sus $520 del estimado para que el total no
  // la cuente dos veces; si él ya ajustó la cifra a mano, es suya.
  if (from < 17 && s.settings && num(s.settings.monthlyExpenseEstimate) === 2450) {
    s = { ...s, settings: { ...s.settings, monthlyExpenseEstimate: 1930 } };
  }

  // Los $1 930 eran un estimado heredado del "unos 3 000 al mes" declarado.
  // El estado de cuenta de julio pone una cifra medida en su lugar: $2 118,67
  // de consumo, sin arriendo ni cuota del auto adentro (van por fuera, ya
  // nombrados como compromisos), menos los $90,16 de la última cuota del
  // gimnasio, que no se repite. Junio no sirve de base: $4 318,99 con ~$1 950
  // del viaje a Orlando.
  if (from < 18 && s.settings && num(s.settings.monthlyExpenseEstimate) === 1930) {
    s = { ...s, settings: { ...s.settings, monthlyExpenseEstimate: 2030 } };
  }

  // Compromisos dados de baja.
  if (Array.isArray(s.commitments)) {
    const drop = new Set(
      RETIRED_COMMITMENTS.filter((c) => c.sinceVersion > from).map((c) => c.id)
    );
    if (drop.size) {
      s = { ...s, commitments: s.commitments.filter((c) => !c || !drop.has(c.id)) };
    }
  }

  // Compromisos fijos: upsert por versión, igual que las cuentas por cobrar.
  // Así una cuota que cambia (el IESS pasó de 176 a 180 al afiliarse) llega a
  // un tablero ya guardado en vez de quedarse solo en el código.
  {
    const cmt = Array.isArray(s.commitments) ? s.commitments : [];
    const fresh = SEEDED_COMMITMENTS.filter((c) => c.sinceVersion > from);
    if (fresh.length) {
      const byId = new Map(fresh.map((c) => [c.id, seedCmt(c)]));
      const merged = cmt.map((c) => {
        const patch = c && byId.get(c.id);
        if (!patch) return c;
        byId.delete(c.id);
        return { ...c, ...patch };
      });
      s = { ...s, commitments: [...merged, ...byId.values()] };
    }
  }

  // Movimientos dictados por chat: entra solo lo publicado después de la
  // versión que tiene guardada este tablero. Doble filtro por id, así que ni
  // se duplican al recargar ni resucita uno borrado a mano.
  {
    const txns = Array.isArray(s.transactions) ? s.transactions : [];
    const have = new Set(txns.map((t) => t && t.id));
    const missing = SEEDED_TXNS.filter((t) => t.sinceVersion > from && !have.has(t.id));
    if (missing.length) {
      s = { ...s, transactions: [...txns, ...missing.map(seedTxn)] };
    }
  }

  // Cuentas por cobrar: upsert, no solo insert. Lo publicado después de la
  // versión guardada entra si falta y reescribe la fila si ya estaba, que es
  // como llega una corrección. Una fila borrada a mano no vuelve mientras no
  // suba su `sinceVersion`.
  {
    const rcv = Array.isArray(s.receivables) ? s.receivables : [];
    const fresh = SEEDED_RECEIVABLES.filter((r) => r.sinceVersion > from);
    if (fresh.length) {
      const byId = new Map(fresh.map((r) => [r.id, seedRcv(r)]));
      const merged = rcv.map((r) => {
        const patch = r && byId.get(r.id);
        if (!patch) return r;
        byId.delete(r.id);
        return { ...r, ...patch };
      });
      s = { ...s, receivables: [...merged, ...byId.values()] };
    }
  }
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
        merchant: str(t.merchant, "Sin nombre"),
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
    // sin la clave (estado guardado antes de que existieran) entra la semilla,
    // así el compromiso aparece sin tener que reimportar nada; una lista vacía
    // sí se respeta, para que borrarlos no los resucite en la próxima carga
    commitments: (Array.isArray(s.commitments)
      ? s.commitments
      : base.commitments
    )
      .filter((c) => c && typeof c.name === "string")
      .map((c) => ({
        id: freshId(c.id),
        name: c.name,
        amount: num(c.amount),
        category: str(c.category, "otros"),
        note: str(c.note) || undefined,
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
