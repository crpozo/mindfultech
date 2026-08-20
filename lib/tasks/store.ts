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

export const STATE_VERSION = 3;

export function seedState(): TasksState {
  return {
    version: STATE_VERSION,
    projects: SEED_PROJECTS.map((p) => ({ ...p, id: uid() })),
    tasks: [],
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
