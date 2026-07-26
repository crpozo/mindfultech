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
  order: number;
}

export interface TasksState {
  version: number;
  projects: Project[];
  tasks: Task[];
}

export const STATE_KEY = "mt_tasks_state_v1";
export const AUTH_KEY = "mt_tasks_auth_v1";
export const UNLOCK_KEY = "mt_tasks_unlocked_v1"; // sessionStorage

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

export const STATE_VERSION = 2;

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

  return { ...s, version: STATE_VERSION, projects };
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

// ---- passcode (soft gate) --------------------------------------------------

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
        order: typeof t.order === "number" ? t.order : i,
      }));
    return { version: STATE_VERSION, projects, tasks };
  } catch {
    return null;
  }
}
