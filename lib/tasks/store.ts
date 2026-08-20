// Local-only task store for /tasks — everything lives in the browser's
// localStorage. No server, no network. The passcode is a soft gate (a salted
// SHA-256 hash) that keeps the board private from a casual onlooker; the data
// itself is stored in plain text, so a passcode reset never loses tasks.

export type Status = "todo" | "doing" | "done";

export interface Project {
  id: string;
  name: string;
  color: string;
  icon?: IconId;
}

// Icon ids live here (plain data) so the store can validate them; the drawings
// live in components/tasks/icons.tsx.
export const ICON_IDS = [
  "robot",
  "dna",
  "home-heart",
  "ticket",
  "fence",
  "car",
  "kanban",
  "credit-card",
  "rocket",
  "code",
  "chart",
  "cloud",
  "cart",
  "message",
  "camera",
  "flask",
  "shield",
  "sparkle",
] as const;
export type IconId = (typeof ICON_IDS)[number];
const ICON_SET = new Set<string>(ICON_IDS);

export interface Task {
  id: string;
  projectId: string | null;
  title: string;
  notes: string;
  status: Status;
  createdAt: number;
  /** stamped when the task moves to done — drives the weekly sweep */
  completedAt?: number;
  order: number;
}

export interface TasksState {
  version: number;
  projects: Project[];
  tasks: Task[];
  /** the last weekly sweep, kept so it can be undone */
  lastSweep?: { at: number; tasks: Task[] };
}

export const STATE_KEY = "mt_tasks_state_v1";

export const STATUSES: { id: Status; en: string; es: string }[] = [
  { id: "todo", en: "To do", es: "Por hacer" },
  { id: "doing", en: "In progress", es: "En progreso" },
  { id: "done", en: "Done", es: "Hecho" },
];

// Seed the user's real portfolio as project categories; all editable/deletable.
// Brand colours and icons are also applied to an existing board by MIGRATIONS
// below, so a device that already has the old seed picks them up.
const SEED_PROJECTS: Omit<Project, "id">[] = [
  { name: "Helixona", color: "#D6B981", icon: "dna" },
  { name: "Western Fence Supply", color: "#3a74cd", icon: "fence" },
  { name: "CarCompraCorp", color: "#e0913a", icon: "car" },
  { name: "USFQ · EventFlow", color: "#c0392b", icon: "ticket" },
  { name: "PARC Home Care", color: "#78B5EC", icon: "home-heart" },
  { name: "ThemedMotion", color: "#F26B1F", icon: "robot" },
  { name: "CarCompra CRM", color: "#d081c0", icon: "kanban" },
  { name: "Creditazo", color: "#FFFF0C", icon: "credit-card" },
];

export const PROJECT_COLORS = [
  "#4FAE87",
  "#3a74cd",
  "#e0913a",
  "#c0392b",
  "#8e44ad",
  "#16a085",
  "#d081c0",
  "#e05a7d",
  "#5b7cff",
  "#2fb0c9",
];

export function uid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* noop */
  }
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

export const STATE_VERSION = 4;

/**
 * Tareas dictadas por chat. Mismo criterio que el tablero de finanzas: cada
 * fila lleva `sinceVersion` y solo entra si el tablero guardado es más viejo,
 * con doble filtro por id. Así una tarea que él ya borró no resucita cuando
 * publique la siguiente, y añadir una nueva es ponerla acá y subir
 * STATE_VERSION.
 *
 * `createdAt` va fijo, no Date.now(): si se recalculara en cada carga, el
 * orden de las tarjetas bailaría solo.
 */
const SEEDED_TASKS: (Omit<Task, "projectId"> & { sinceVersion: number })[] = [
  {
    id: "loan-01-fondear-cuota",
    sinceVersion: 4,
    title: "26 ago · Dejar $400 en la cooperativa para la cuota del 27",
    notes:
      "La cuota de $538,64 se debita sola el 27 y en la cooperativa solo hay $156,30. Transferencia local desde Pichincha, llega el mismo día.\n\nOjo: la captura del crédito decía \"próxima cuota 31/ago\" y tú dices 27. Ten el dinero desde el 26 y quedas cubierto en las dos versiones.",
    status: "todo",
    createdAt: 1755610000000,
    order: 101,
  },
  {
    id: "loan-02-verificar-debito",
    sinceVersion: 4,
    title: "27 ago · Verificar que se debitó la cuota de $538,64",
    notes:
      "Si no se debitó, no sigas con el resto del plan hasta entender por qué: una cuota rebotada te saca del estado AL DIA y puede complicar la precancelación.",
    status: "todo",
    createdAt: 1755610001000,
    order: 102,
  },
  {
    id: "loan-03-mover-internacional",
    sinceVersion: 4,
    title: "27-28 ago · Iniciar transferencias de Wise y PayPal",
    notes:
      "Tardan de uno a dos días hábiles en llegar a Ecuador, por eso se mueven primero.\n\nWise: $5.100 (quedan $14).\nPayPal: $1.020 (quedan $1.980, que son la reserva de la Titanium).\n\nSi Wise no envía directo a la cooperativa, manda a Pichincha y de ahí haces la transferencia local.",
    status: "todo",
    createdAt: 1755610002000,
    order: 103,
  },
  {
    id: "loan-04-mover-local",
    sinceVersion: 4,
    title: "29-31 ago · Transferir ProCredit y Pichincha a la cooperativa",
    notes:
      "Son locales, llegan el mismo día.\n\nProCredit: $5.280. Deben quedar ~$604, porque el 1 de septiembre sale de ahí el arriendo de $571,50.\nPichincha: $1.000 (quedan $350).\n\nMeta: ~$12.400 acreditados en la cooperativa antes del 1 de septiembre.",
    status: "todo",
    createdAt: 1755610003000,
    order: 104,
  },
  {
    id: "loan-05-precancelar",
    sinceVersion: 4,
    title: "1 sep · Enviar el correo de precancelación del préstamo",
    notes:
      "Única ventana: del 1 al 5. Manda el correo solo cuando veas la plata acreditada en la cooperativa, no antes.\n\nSaldo tras la cuota del 27: ~$12.256. Con intereses al 1 de septiembre, presupuesta $12.300-12.400.\n\nPregunta en el mismo correo:\n1. Valor exacto de precancelación al 1 de septiembre.\n2. ¿Hay penalidad por prepago?\n3. Los $156,30 de la cuenta, ¿son míos o son encaje del crédito?",
    status: "todo",
    createdAt: 1755610004000,
    order: 105,
  },
  {
    id: "loan-06-titanium",
    sinceVersion: 4,
    title: "Mediados de sep · Pagar la Titanium (~$2.200) desde PayPal",
    notes:
      "Corte el 4 de septiembre. Es el golpe que llega justo cuando el colchón está más flaco, por eso PayPal queda con $1.980 sin tocar.\n\nEntre hoy y el 4 de septiembre, cada dólar que pases por esa tarjeta lo pagas en el peor momento posible.",
    status: "todo",
    createdAt: 1755610005000,
    order: 106,
  },
  {
    id: "loan-07-redirigir-cuota",
    sinceVersion: 4,
    title: "Tras liquidar · Mandar los $538,64 al fondo de emergencia",
    notes:
      "La cuota liberada desaparece sola si no le pones nombre. Débito automático mensual el día 27, que es cuando tu cuerpo ya espera que salga.\n\nMeta del fondo: $18.000.",
    status: "todo",
    createdAt: 1755610006000,
    order: 107,
  },
];

/** Sin `sinceVersion`, que no es parte del estado guardado. */
const seedTask = ({ sinceVersion: _v, ...t }: Omit<Task, "projectId"> & { sinceVersion: number }): Task => ({
  ...t,
  projectId: null,
});

export function seedState(): TasksState {
  return {
    version: STATE_VERSION,
    projects: SEED_PROJECTS.map((p) => ({ ...p, id: uid() })),
    tasks: SEEDED_TASKS.map(seedTask),
  };
}

/**
 * Bring a board saved by an older version up to date. Runs once — the state is
 * stamped with the new version afterwards, so a colour or icon the owner
 * changes later is never overwritten on a subsequent load.
 */
function migrate(s: TasksState): TasksState {
  if ((s.version ?? 1) >= STATE_VERSION) return s;

  const bySeedName = new Map(SEED_PROJECTS.map((p) => [p.name, p]));
  const projects = s.projects.map((p) => {
    const seed = bySeedName.get((p.name || "").trim());
    return seed ? { ...p, color: seed.color, icon: seed.icon } : p;
  });

  // add seeded projects the board doesn't have yet (e.g. a newly added client)
  const have = new Set(projects.map((p) => (p.name || "").trim()));
  for (const seed of SEED_PROJECTS) {
    if (!have.has(seed.name)) projects.push({ ...seed, id: uid() });
  }

  let tasks = s.tasks;
  if ((s.version ?? 1) < 3) {
    // tasks finished before this feature existed have no completion time —
    // stamp them now so the first sweep doesn't take them by surprise
    const now = Date.now();
    tasks = tasks.map((t) => (t.status === "done" && t.completedAt == null ? { ...t, completedAt: now } : t));
  }

  // Tareas dictadas por chat: solo lo publicado después de la versión que
  // tiene guardada este tablero, y solo si el id no está ya. Doble filtro, así
  // que ni se duplican al recargar ni vuelve una que él borró.
  {
    const from = s.version ?? 1;
    const have = new Set(tasks.map((t) => t && t.id));
    const missing = SEEDED_TASKS.filter((t) => t.sinceVersion > from && !have.has(t.id));
    if (missing.length) tasks = [...tasks, ...missing.map(seedTask)];
  }

  return { ...s, version: STATE_VERSION, projects, tasks };
}

/** Local Monday 00:00 of the week containing `d`. */
export function startOfWeek(d: Date = new Date()): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // 0 = Monday
  return x.getTime();
}

/**
 * Clear the tasks finished before this week. Runs on load, so a board opened
 * after a month away still lands on a clean Done column. The swept tasks are
 * kept on the state so the owner can undo it.
 */
export function sweepDone(s: TasksState, now: number = Date.now()): { next: TasksState; swept: Task[] } {
  const cutoff = startOfWeek(new Date(now));
  const swept = s.tasks.filter((t) => t.status === "done" && (t.completedAt ?? 0) < cutoff);
  if (!swept.length) return { next: s, swept };
  const ids = new Set(swept.map((t) => t.id));
  return {
    next: { ...s, tasks: s.tasks.filter((t) => !ids.has(t.id)), lastSweep: { at: now, tasks: swept } },
    swept,
  };
}

export function loadState(): TasksState | null {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as TasksState;
    if (!s || !Array.isArray(s.projects) || !Array.isArray(s.tasks)) return null;
    return migrate(s);
  } catch {
    return null;
  }
}

export function saveState(s: TasksState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(s));
  } catch {
    /* quota / private mode — nothing we can do, keep working in memory */
  }
}

// passcode lives in the shared private module so /tasks and /fitness share one code
export {
  AUTH_KEY,
  UNLOCK_KEY,
  hasPasscode,
  setPasscode,
  verifyPasscode,
  resetPasscode,
  isUnlocked,
  setUnlocked,
} from "@/lib/private/passcode";

// ---- backup ----------------------------------------------------------------

export function exportState(s: TasksState): void {
  const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `mindfultech-tasks-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Only plain hex colors — an imported color is later dropped into a CSS
// `background`, so a value like `url(http://…)` could pull a request off the
// device. Reject anything that isn't a hex literal.
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function parseImport(text: string): TasksState | null {
  try {
    const s = JSON.parse(text) as TasksState;
    if (!s || !Array.isArray(s.projects) || !Array.isArray(s.tasks)) return null;
    // sanitize to the shape we expect, de-duplicating ids as we go
    const seenIds = new Set<string>();
    const freshId = (id: unknown): string => {
      let v = typeof id === "string" && id ? id : uid();
      while (seenIds.has(v)) v = uid();
      seenIds.add(v);
      return v;
    };
    const projects: Project[] = s.projects
      .filter((p) => p && typeof p.name === "string")
      .map((p) => ({
        id: freshId(p.id),
        name: p.name,
        color: typeof p.color === "string" && HEX_COLOR.test(p.color) ? p.color : PROJECT_COLORS[0],
        icon: typeof p.icon === "string" && ICON_SET.has(p.icon) ? (p.icon as IconId) : undefined,
      }));
    const projIds = new Set(projects.map((p) => p.id));
    const tasks: Task[] = s.tasks
      .filter((t) => t && typeof t.title === "string")
      .map((t, i) => ({
        id: freshId(t.id),
        projectId: typeof t.projectId === "string" && projIds.has(t.projectId) ? t.projectId : null,
        title: t.title,
        notes: typeof t.notes === "string" ? t.notes : "",
        status: t.status === "doing" || t.status === "done" ? t.status : "todo",
        createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
        completedAt: typeof t.completedAt === "number" ? t.completedAt : undefined,
        order: typeof t.order === "number" ? t.order : i,
      }));
    return { version: STATE_VERSION, projects, tasks };
  } catch {
    return null;
  }
}
