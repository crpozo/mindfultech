"use client";

import * as React from "react";
import { useLang } from "../i18n";
import {
  type TasksState,
  type Task,
  type Person,
  type Project,
  type Status,
  STATUSES,
  PROJECT_COLORS,
  uid,
  seedState,
  loadState,
  saveState,
  isUnlocked,
  setUnlocked,
  exportState,
  parseImport,
  sweepDone,
  ICON_IDS,
  type IconId,
} from "@/lib/tasks/store";
import { LockScreen } from "./LockScreen";
import { SHAPES } from "@/lib/tasks/icon-shapes";

const MONO = "var(--mono)";

/**
 * Brand colours are kept exactly as the owner set them, but a very light one
 * (a neon yellow, say) is invisible drawn on a white chip. `inkable` darkens
 * such a colour just for rendering on light surfaces; `fgOn` picks a readable
 * foreground for a filled swatch. Neither changes the stored value.
 */
function inkable(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (lum <= 0.62) return hex;
  const k = 0.62 / lum;
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return "#" + [c(r), c(g), c(b)].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function fgOn(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#fff";
  const n = parseInt(m[1], 16);
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return lum > 0.6 ? "#14131a" : "#fff";
}

/** Project icon — stroke drawing on a 24x24 grid, tinted with the project colour. */
function ProjectIcon({
  id,
  size = 16,
  color = "currentColor",
}: {
  id?: IconId;
  size?: number;
  color?: string;
}) {
  const shapes = id ? SHAPES[id] : undefined;
  if (!shapes)
    return (
      <span
        style={{
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: "50%",
          background: color,
          flex: "none",
          display: "inline-block",
        }}
      />
    );
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "none", display: "block" }}
      aria-hidden
    >
      {shapes.map((sh, i) =>
        sh.t === "p" ? (
          <path key={i} d={sh.d} />
        ) : sh.t === "c" ? (
          <circle key={i} cx={sh.cx} cy={sh.cy} r={sh.r} />
        ) : (
          <rect key={i} x={sh.x} y={sh.y} width={sh.w} height={sh.h} rx={sh.rx} />
        )
      )}
    </svg>
  );
}

export function TasksApp() {
  const { lang } = useLang();
  const es = lang === "es";
  const [unlocked, setUnlockedS] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [state, setState] = React.useState<TasksState>(() => ({ version: 1, projects: [], tasks: [], people: [] }));
  const loadedRef = React.useRef(false);
  const stateRef = React.useRef(state);
  stateRef.current = state;

  // filter, editor, drag, modals
  const [filter, setFilter] = React.useState<string>("all"); // "all" | projectId | "none"
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [manageOpen, setManageOpen] = React.useState(false);
  const [peopleOpen, setPeopleOpen] = React.useState(false);
  const [who, setWho] = React.useState<string>("all"); // "all" | personId | "nobody"
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState<Status | null>(null);
  /** the card the pointer is over while dragging, and whether the drop lands before or after it */
  const [dropAt, setDropAt] = React.useState<{ id: string; after: boolean } | null>(null);

  // ---- boot: unlock + load ----
  React.useEffect(() => {
    setUnlockedS(isUnlocked());
    setReady(true);
  }, []);

  const [sweptCount, setSweptCount] = React.useState(0);

  React.useEffect(() => {
    if (!unlocked || loadedRef.current) return;
    // done tasks are cleared once a week — anything finished before this
    // Monday goes, and stays recoverable until the next sweep
    const { next, swept } = sweepDone(loadState() ?? seedState());
    setState(next);
    setSweptCount(swept.length);
    loadedRef.current = true;
  }, [unlocked]);

  const undoSweep = () => {
    setState((s) => {
      if (!s.lastSweep) return s;
      // re-stamp them as completed now, otherwise the next load sweeps the
      // very tasks the owner just asked to keep
      const now = Date.now();
      const restored = s.lastSweep.tasks.map((t) => ({ ...t, completedAt: now }));
      return { ...s, tasks: [...s.tasks, ...restored], lastSweep: undefined };
    });
    setSweptCount(0);
  };

  // debounce writes so editing a title doesn't hit localStorage every keystroke
  React.useEffect(() => {
    if (!loadedRef.current) return;
    const t = setTimeout(() => saveState(state), 250);
    return () => clearTimeout(t);
  }, [state]);

  // flush the latest state on tab hide / unload so the debounce never drops it
  React.useEffect(() => {
    const flush = () => {
      if (loadedRef.current) saveState(stateRef.current);
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, []);

  // ---- mutations ----
  const mutate = (fn: (s: TasksState) => TasksState) => setState((s) => fn(s));

  const addTask = (status: Status, title: string, projectId: string | null) => {
    const t = title.trim();
    if (!t) return;
    mutate((s) => ({
      ...s,
      tasks: [
        ...s.tasks,
        {
          id: uid(),
          projectId,
          title: t,
          notes: "",
          status,
          createdAt: Date.now(),
          order: s.tasks.length,
        },
      ],
    }));
  };

  const patchTask = (id: string, patch: Partial<Task>) =>
    mutate((s) => ({
      ...s,
      tasks: s.tasks.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...patch };
        if (patch.status && patch.status !== t.status) {
          // the completion time is what the weekly sweep reads
          next.completedAt = patch.status === "done" ? Date.now() : undefined;
        }
        return next;
      }),
    }));

  /** Put task `id` into `status` at `index` (0 = top; omitted = bottom) and renumber that column. */
  const moveTask = (id: string, status: Status, index?: number) =>
    mutate((s) => {
      const moving = s.tasks.find((t) => t.id === id);
      if (!moving) return s;
      const col = s.tasks.filter((t) => t.status === status && t.id !== id).sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
      const at = index === undefined ? col.length : Math.max(0, Math.min(col.length, index));
      const moved: Task = { ...moving, status, completedAt: status !== moving.status ? (status === "done" ? Date.now() : undefined) : moving.completedAt };
      col.splice(at, 0, moved);
      const orders = new Map(col.map((t, i) => [t.id, i]));
      return { ...s, tasks: s.tasks.map((t) => (orders.has(t.id) ? { ...(t.id === id ? moved : t), order: orders.get(t.id)! } : t)) };
    });
  /** one step up or down inside the task's own column */
  const nudgeTask = (id: string, dir: -1 | 1) => {
    const t = stateRef.current.tasks.find((x) => x.id === id);
    if (!t) return;
    const col = stateRef.current.tasks.filter((x) => x.status === t.status).sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
    const i = col.findIndex((x) => x.id === id);
    const j = i + dir;
    if (j < 0 || j >= col.length) return;
    moveTask(id, t.status, j);
  };

  const deleteTask = (id: string) => {
    mutate((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
    setEditingId((cur) => (cur === id ? null : cur));
  };

  const addProject = (name: string) => {
    const n = name.trim();
    if (!n) return;
    const color = PROJECT_COLORS[state.projects.length % PROJECT_COLORS.length];
    const icon = ICON_IDS[state.projects.length % ICON_IDS.length];
    const p: Project = { id: uid(), name: n, color, icon };
    mutate((s) => ({ ...s, projects: [...s.projects, p] }));
    return p.id;
  };

  const people = state.people ?? [];
  const addPerson = (name: string) => {
    const n = name.trim();
    if (!n) return null;
    const color = PROJECT_COLORS[(people.length + 3) % PROJECT_COLORS.length];
    const person: Person = { id: uid(), name: n, color };
    mutate((s) => ({ ...s, people: [...(s.people ?? []), person] }));
    return person.id;
  };
  const patchPerson = (id: string, patch: Partial<Person>) =>
    mutate((s) => ({ ...s, people: (s.people ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const deletePerson = (id: string) =>
    mutate((s) => ({
      ...s,
      people: (s.people ?? []).filter((x) => x.id !== id),
      tasks: s.tasks.map((t) => (t.assigneeId === id ? { ...t, assigneeId: null } : t)),
    }));
  const peopleById = React.useMemo(() => new Map(people.map((x) => [x.id, x])), [people]);

  const patchProject = (id: string, patch: Partial<Project>) =>
    mutate((s) => ({ ...s, projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));

  const deleteProject = (id: string) => {
    // keep the tasks, just unassign them — never lose work silently
    mutate((s) => ({
      ...s,
      projects: s.projects.filter((p) => p.id !== id),
      tasks: s.tasks.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)),
    }));
    setFilter((f) => (f === id ? "all" : f));
  };

  const doImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseImport(String(reader.result || ""));
      if (!parsed) {
        alert(es ? "Archivo de respaldo inválido." : "Invalid backup file.");
        return;
      }
      if (
        !confirm(
          es
            ? "Esto reemplazará tus tareas actuales con las del respaldo. ¿Continuar?"
            : "This will replace your current tasks with the backup. Continue?"
        )
      )
        return;
      setState(parsed);
      loadedRef.current = true;
    };
    reader.readAsText(file);
  };

  const lock = () => {
    setUnlocked(false);
    setUnlockedS(false);
    loadedRef.current = false;
    setMenuOpen(false);
  };

  // ---- derived ----
  const projectsById = React.useMemo(() => {
    const m = new Map<string, Project>();
    state.projects.forEach((p) => m.set(p.id, p));
    return m;
  }, [state.projects]);

  const hasUnassigned = React.useMemo(() => state.tasks.some((t) => !t.projectId), [state.tasks]);

  // the "No project" chip only exists while unassigned tasks do — if the last
  // one is reassigned/deleted, drop back to "All" so the board isn't stranded
  // on an empty, unhighlighted filter
  React.useEffect(() => {
    if (filter === "none" && !hasUnassigned) setFilter("all");
  }, [filter, hasUnassigned]);

  const visible = React.useMemo(() => {
    let ts = state.tasks;
    if (filter === "none") ts = ts.filter((t) => !t.projectId);
    else if (filter !== "all") ts = ts.filter((t) => t.projectId === filter);
    if (who === "nobody") ts = ts.filter((t) => !t.assigneeId);
    else if (who !== "all") ts = ts.filter((t) => t.assigneeId === who);
    return ts;
  }, [state.tasks, filter, who]);
  React.useEffect(() => {
    if (who !== "all" && who !== "nobody" && !peopleById.has(who)) setWho("all");
  }, [who, peopleById]);

  const editing = editingId ? state.tasks.find((t) => t.id === editingId) || null : null;

  if (!ready) return <div style={{ minHeight: "100vh", background: "#eef2f9" }} />;
  if (!unlocked) return <LockScreen onUnlock={() => setUnlockedS(true)} />;

  const defaultProjectForNew = filter !== "all" && filter !== "none" ? filter : null;

  return (
    <div className="tk-app" style={{ minHeight: "100vh", background: "linear-gradient(180deg,#eef2fa 0%,#e9eef7 100%)", color: "var(--ink)" }}>
      {/* top bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(238,242,250,.85)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(14,13,18,.07)",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-mark.webp" alt="" width={26} height={26} />
          <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-.01em" }}>
            Tasks
            <span style={{ fontFamily: MONO, fontSize: 11, color: "#8b8896", fontWeight: 500, letterSpacing: ".12em", marginLeft: 10 }}>
              {state.tasks.filter((t) => t.status !== "done").length} {es ? "PENDIENTES" : "OPEN"}
            </span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
            <button onClick={() => setManageOpen(true)} style={ghostBtn} title={es ? "Proyectos" : "Projects"}>
              {es ? "Proyectos" : "Projects"}
            </button>
            <button onClick={() => setPeopleOpen(true)} style={ghostBtn} title={es ? "Personas" : "People"}>
              {es ? "Personas" : "People"}
            </button>
            <button onClick={() => setMenuOpen((v) => !v)} style={{ ...ghostBtn, padding: "8px 11px" }} aria-label="Menu">
              ⋯
            </button>
            {menuOpen && (
              <>
                <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1 }} />
                <div style={menuStyle}>
                  <button style={menuItem} onClick={() => { exportState(state); setMenuOpen(false); }}>
                    {es ? "Descargar respaldo" : "Download backup"}
                  </button>
                  <label style={{ ...menuItem, display: "block", cursor: "pointer" }}>
                    {es ? "Restaurar respaldo" : "Restore backup"}
                    <input
                      type="file"
                      accept="application/json,.json"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) doImport(f);
                        e.target.value = "";
                        setMenuOpen(false);
                      }}
                    />
                  </label>
                  <div style={{ height: 1, background: "rgba(14,13,18,.08)", margin: "4px 0" }} />
                  <button style={{ ...menuItem, color: "#c0392b" }} onClick={lock}>
                    {es ? "Bloquear" : "Lock"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* project filter chips */}
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px 12px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <FilterChip label={es ? "Todos" : "All"} active={filter === "all"} onClick={() => setFilter("all")} count={state.tasks.length} />
          {state.projects.map((p) => (
            <FilterChip
              key={p.id}
              label={p.name}
              color={p.color}
              icon={p.icon}
              active={filter === p.id}
              onClick={() => setFilter(p.id)}
              count={state.tasks.filter((t) => t.projectId === p.id).length}
            />
          ))}
          {hasUnassigned && (
            <FilterChip
              label={es ? "Sin proyecto" : "No project"}
              active={filter === "none"}
              onClick={() => setFilter("none")}
              count={state.tasks.filter((t) => !t.projectId).length}
            />
          )}
          <button onClick={() => setManageOpen(true)} style={{ ...ghostBtn, padding: "6px 10px", fontSize: 12 }}>
            + {es ? "Proyecto" : "Project"}
          </button>
          {people.length > 0 && (
            <>
              <span style={{ width: 1, height: 22, background: "rgba(14,13,18,.1)", margin: "0 4px" }} />
              <FilterChip label={es ? "Cualquiera" : "Anyone"} active={who === "all"} onClick={() => setWho("all")} />
              {people.map((x) => (
                <FilterChip key={x.id} label={x.name} active={who === x.id} onClick={() => setWho(x.id)} count={state.tasks.filter((t) => t.assigneeId === x.id && t.status !== "done").length} lead={<Avatar person={x} size={16} />} />
              ))}
              {state.tasks.some((t) => !t.assigneeId) && <FilterChip label={es ? "Sin asignar" : "Unassigned"} active={who === "nobody"} onClick={() => setWho("nobody")} />}
            </>
          )}
        </div>
      </header>

      {/* board */}
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: 20 }}>
        {sweptCount > 0 && (
          <div className="tk-sweep" role="status">
            <span>
              {es
                ? `Se limpiaron ${sweptCount} ${sweptCount === 1 ? "tarea completada" : "tareas completadas"} de semanas anteriores.`
                : `Cleared ${sweptCount} completed ${sweptCount === 1 ? "task" : "tasks"} from previous weeks.`}
            </span>
            <button onClick={undoSweep}>{es ? "Deshacer" : "Undo"}</button>
            <button className="x" onClick={() => setSweptCount(0)} aria-label={es ? "Cerrar" : "Dismiss"}>
              ✕
            </button>
          </div>
        )}
        <div className="tk-board">
          {STATUSES.map((col) => {
            const colTasks = visible
              .filter((t) => t.status === col.id)
              .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
            return (
              <section
                key={col.id}
                className={`tk-col${dragOver === col.id ? " tk-col-over" : ""}`}
                onDragOver={(e) => {
                  if (dragId) {
                    e.preventDefault();
                    setDragOver(col.id);
                  }
                }}
                onDragLeave={() => setDragOver((s) => (s === col.id ? null : s))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId) moveTask(dragId, col.id);
                  setDragId(null);
                  setDragOver(null);
                  setDropAt(null);
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 4px 12px" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "#6c6a75" }}>
                    {es ? col.es : col.en}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: "#74727d" }}>{colTasks.length}</span>
                  {col.id === "done" && (
                    <span
                      style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 9.5, letterSpacing: ".08em", color: "#9c9aa5" }}
                      title={es ? "Cada lunes se borran las tareas completadas la semana anterior" : "Every Monday last week's completed tasks are cleared"}
                    >
                      {es ? "SE LIMPIA CADA LUNES" : "CLEARS EACH MONDAY"}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {colTasks.map((t, i) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      project={t.projectId ? projectsById.get(t.projectId) || null : null}
                      assignee={t.assigneeId ? peopleById.get(t.assigneeId) || null : null}
                      showProject={filter === "all" || filter === "none"}
                      onOpen={() => setEditingId(t.id)}
                      onToggle={() => patchTask(t.id, { status: t.status === "done" ? "todo" : "done" })}
                      onDragStart={() => setDragId(t.id)}
                      onDragEnd={() => { setDragId(null); setDragOver(null); setDropAt(null); }}
                      dropHint={dropAt && dropAt.id === t.id && dragId !== t.id ? (dropAt.after ? "after" : "before") : null}
                      onDragOverCard={(after) => { if (dragId && dragId !== t.id) setDropAt({ id: t.id, after }); }}
                      onDropOnCard={(after) => {
                        if (dragId && dragId !== t.id) {
                          // index among the column's cards once the dragged one is taken out
                          const others = colTasks.filter((x) => x.id !== dragId);
                          const k = others.findIndex((x) => x.id === t.id);
                          moveTask(dragId, col.id, k + (after ? 1 : 0));
                        }
                        setDragId(null);
                        setDragOver(null);
                        setDropAt(null);
                      }}
                      es={es}
                    />
                  ))}
                  <QuickAdd onAdd={(title) => addTask(col.id, title, defaultProjectForNew)} es={es} />
                </div>
              </section>
            );
          })}
        </div>

        {state.tasks.length === 0 && (
          <p style={{ textAlign: "center", color: "#8b8896", fontSize: 14, marginTop: 28 }}>
            {es
              ? "Aún no hay tareas. Escribe una arriba en “Por hacer” para empezar."
              : "No tasks yet. Type one under “To do” to get started."}
          </p>
        )}
      </main>

      {editing && (
        <TaskEditor
          task={editing}
          projects={state.projects}
          onPatch={(patch) => patchTask(editing.id, patch)}
          onDelete={() => deleteTask(editing.id)}
          onClose={() => setEditingId(null)}
          onNudge={(d) => nudgeTask(editing.id, d)}
          people={people}
          onAddPerson={addPerson}
          es={es}
        />
      )}

      {peopleOpen && (
        <ManagePeople people={people} tasks={state.tasks} onAdd={addPerson} onPatch={patchPerson} onDelete={deletePerson} onClose={() => setPeopleOpen(false)} es={es} />
      )}

      {manageOpen && (
        <ManageProjects
          projects={state.projects}
          tasks={state.tasks}
          onAdd={addProject}
          onPatch={patchProject}
          onDelete={deleteProject}
          onClose={() => setManageOpen(false)}
          es={es}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- filter chip */
/** Initials in the person's colour. */
function Avatar({ person, size = 24 }: { person: Person; size?: number }) {
  const initials = person.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      aria-hidden
      style={{
        display: "inline-grid",
        placeItems: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: person.color,
        color: fgOn(person.color),
        fontSize: Math.round(size * 0.42),
        fontWeight: 600,
        letterSpacing: ".02em",
        flex: "none",
      }}
    >
      {initials}
    </span>
  );
}

function ManagePeople({
  people,
  tasks,
  onAdd,
  onPatch,
  onDelete,
  onClose,
  es,
}: {
  people: Person[];
  tasks: Task[];
  onAdd: (name: string) => string | null;
  onPatch: (id: string, patch: Partial<Person>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  es: boolean;
}) {
  const [newName, setNewName] = React.useState("");
  const inputStyle: React.CSSProperties = { flex: 1, fontFamily: "inherit", fontSize: 14, padding: "8px 10px", borderRadius: 8, border: "1.5px solid rgba(14,13,18,.12)", outline: "none", color: "var(--ink)" };
  return (
    <Modal onClose={onClose} label={es ? "Personas" : "People"}>
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 4px" }}>{es ? "Personas" : "People"}</h2>
      <p style={{ margin: "0 0 14px", fontSize: 13, color: "#6c6a75" }}>{es ? "A quién se le asignan las tareas. Las tareas de una persona eliminada quedan sin asignar." : "Who tasks get assigned to. A deleted person's tasks become unassigned."}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "50vh", overflowY: "auto" }}>
        {people.map((x) => {
          const count = tasks.filter((t) => t.assigneeId === x.id && t.status !== "done").length;
          return (
            <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar person={x} size={30} />
              <input type="color" value={x.color} onChange={(e) => onPatch(x.id, { color: e.target.value })} aria-label={(es ? "Color de " : "Color for ") + x.name} style={{ width: 26, height: 26, padding: 0, border: "none", background: "none", cursor: "pointer", flex: "none" }} />
              <input value={x.name} onChange={(e) => onPatch(x.id, { name: e.target.value })} onBlur={(e) => { if (!e.target.value.trim()) onPatch(x.id, { name: es ? "Persona" : "Person" }); }} aria-label={es ? "Nombre" : "Name"} style={inputStyle} />
              <span style={{ fontFamily: MONO, fontSize: 11, color: "#74727d", flex: "none", width: 64, textAlign: "right" }}>{count} {es ? "abiertas" : "open"}</span>
              <button onClick={() => { if (confirm(es ? `¿Eliminar a ${x.name}?` : `Delete ${x.name}?`)) onDelete(x.id); }} style={{ background: "none", border: "none", color: "#c0392b", fontSize: 16, cursor: "pointer", flex: "none" }} aria-label={es ? "Eliminar persona" : "Delete person"}>✕</button>
            </div>
          );
        })}
        {people.length === 0 && <p style={{ margin: 0, fontSize: 13, color: "#8b8896" }}>{es ? "Todavía no hay personas." : "No people yet."}</p>}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (onAdd(newName)) setNewName(""); }}
        style={{ display: "flex", gap: 8, marginTop: 14 }}
      >
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={es ? "Nueva persona" : "New person"} aria-label={es ? "Nueva persona" : "New person"} style={inputStyle} />
        <button type="submit" disabled={!newName.trim()} style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", background: "#0e0d12", color: "#fff", border: "none", borderRadius: 8, padding: "0 16px", cursor: "pointer" }}>
          {es ? "AÑADIR" : "ADD"}
        </button>
      </form>
    </Modal>
  );
}

function FilterChip({
  label,
  color,
  icon,
  lead,
  active,
  onClick,
  count,
}: {
  label: string;
  color?: string;
  icon?: IconId;
  /** a ready-made leading element (a person's avatar) instead of the project icon */
  lead?: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        border: active ? "1.5px solid var(--ink)" : "1.5px solid rgba(14,13,18,.14)",
        background: active ? "var(--ink)" : "#fff",
        color: active ? "#fff" : "var(--ink)",
        borderRadius: 999,
        padding: "6px 12px",
        fontSize: 12.5,
        fontWeight: 500,
        cursor: "pointer",
        maxWidth: 200,
      }}
    >
      {lead}
      {color && <ProjectIcon id={icon} size={15} color={active ? "#fff" : inkable(color)} />}
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      {count !== undefined && <span style={{ fontFamily: MONO, fontSize: 10.5, opacity: active ? 0.7 : 0.5 }}>{count}</span>}
    </button>
  );
}

/* ------------------------------------------------------------------ task card */
function TaskCard({
  task,
  project,
  assignee,
  showProject,
  onOpen,
  onToggle,
  onDragStart,
  onDragEnd,
  dropHint,
  onDragOverCard,
  onDropOnCard,
  es,
}: {
  task: Task;
  project: Project | null;
  assignee: Person | null;
  showProject: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  dropHint: "before" | "after" | null;
  onDragOverCard: (after: boolean) => void;
  onDropOnCard: (after: boolean) => void;
  es: boolean;
}) {
  const done = task.status === "done";
  const afterHalf = (e: React.DragEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return e.clientY > r.top + r.height / 2;
  };
  return (
    <div
      className={`tk-card${dropHint ? ` tk-drop-${dropHint}` : ""}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", task.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOverCard(afterHalf(e));
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation(); // the column's drop would append it at the end
        onDropOnCard(afterHalf(e));
      }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 9,
        background: "#fff",
        border: "1px solid rgba(14,13,18,.08)",
        borderLeft: `3px solid ${project ? inkable(project.color) : "#c8c7cf"}`,
        borderRadius: 10,
        padding: "10px 11px",
        boxShadow: "0 2px 6px -4px rgba(14,13,18,.2)",
        cursor: "grab",
      }}
    >
      <button
        onClick={onToggle}
        aria-label={done ? (es ? "Marcar como pendiente" : "Mark as open") : (es ? "Marcar como hecho" : "Mark as done")}
        style={{
          flex: "none",
          width: 18,
          height: 18,
          marginTop: 1,
          borderRadius: 6,
          border: done ? "none" : "1.6px solid rgba(14,13,18,.28)",
          background: done ? "#4FAE87" : "#fff",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          lineHeight: 1,
        }}
      >
        {done ? "✓" : ""}
      </button>
      <div
        style={{ minWidth: 0, flex: 1, cursor: "pointer" }}
        onClick={onOpen}
        role="button"
        tabIndex={0}
        aria-label={(es ? "Editar tarea: " : "Edit task: ") + task.title}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
      >
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.35,
            color: done ? "#74727d" : "var(--ink)",
            textDecoration: done ? "line-through" : "none",
            wordBreak: "break-word",
          }}
        >
          {task.title}
        </div>
        {(showProject || task.notes) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
            {showProject && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                {project && <ProjectIcon id={project.icon} size={13} color={inkable(project.color)} />}
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".06em", color: project ? "#6c6a75" : "#74727d" }}>
                  {project ? project.name : es ? "Sin proyecto" : "No project"}
                </span>
              </span>
            )}
            {task.notes && <span style={{ fontSize: 11, color: "#74727d" }}>✎</span>}
          </div>
        )}
      </div>
      {assignee && (
        <span title={assignee.name} style={{ flex: "none", marginTop: 1 }}>
          <Avatar person={assignee} size={24} />
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ quick add */
function QuickAdd({ onAdd, es }: { onAdd: (title: string) => void; es: boolean }) {
  const [val, setVal] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          textAlign: "left",
          border: "1.5px dashed rgba(14,13,18,.16)",
          background: "transparent",
          color: "#8b8896",
          borderRadius: 10,
          padding: "9px 11px",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        + {es ? "Añadir tarea" : "Add task"}
      </button>
    );

  const commit = () => {
    if (val.trim()) onAdd(val);
    setVal("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <textarea
        ref={ref}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setVal("");
            setOpen(false);
          }
        }}
        onBlur={() => {
          commit();
          setOpen(false);
        }}
        placeholder={es ? "Escribe una tarea…" : "Type a task…"}
        rows={2}
        style={{
          resize: "none",
          fontFamily: "inherit",
          fontSize: 13.5,
          lineHeight: 1.4,
          border: "1.5px solid var(--ink)",
          borderRadius: 10,
          padding: "9px 11px",
          outline: "none",
          color: "var(--ink)",
        }}
      />
      <span style={{ fontSize: 11, color: "#74727d" }}>{es ? "Enter para añadir" : "Enter to add"}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- task editor */
function TaskEditor({
  task,
  projects,
  onPatch,
  onDelete,
  onClose,
  onNudge,
  people,
  onAddPerson,
  es,
}: {
  task: Task;
  projects: Project[];
  onPatch: (patch: Partial<Task>) => void;
  onDelete: () => void;
  onClose: () => void;
  onNudge: (dir: -1 | 1) => void;
  people: Person[];
  onAddPerson: (name: string) => string | null;
  es: boolean;
}) {
  // never leave a blank card behind
  const close = () => {
    if (!task.title.trim()) onPatch({ title: es ? "Sin título" : "Untitled" });
    onClose();
  };
  return (
    <Modal onClose={close} label={es ? "Editar tarea" : "Edit task"}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <textarea
          value={task.title}
          onChange={(e) => onPatch({ title: e.target.value })}
          aria-label={es ? "Título de la tarea" : "Task title"}
          rows={2}
          style={{
            resize: "none",
            fontFamily: "inherit",
            fontSize: 18,
            fontWeight: 500,
            lineHeight: 1.3,
            border: "none",
            borderBottom: "1.5px solid rgba(14,13,18,.1)",
            padding: "4px 2px 10px",
            outline: "none",
            color: "var(--ink)",
          }}
        />

        <Field label={es ? "Estado" : "Status"}>
          <div style={{ display: "flex", gap: 6 }}>
            {STATUSES.map((s) => (
              <button
                key={s.id}
                onClick={() => onPatch({ status: s.id })}
                aria-pressed={task.status === s.id}
                style={{
                  flex: 1,
                  padding: "8px 6px",
                  fontSize: 12,
                  fontWeight: 500,
                  borderRadius: 8,
                  cursor: "pointer",
                  border: task.status === s.id ? "1.5px solid var(--ink)" : "1.5px solid rgba(14,13,18,.14)",
                  background: task.status === s.id ? "var(--ink)" : "#fff",
                  color: task.status === s.id ? "#fff" : "var(--ink)",
                }}
              >
                {es ? s.es : s.en}
              </button>
            ))}
          </div>
        </Field>

        <Field label={es ? "Proyecto" : "Project"}>
          <select
            value={task.projectId ?? ""}
            onChange={(e) => onPatch({ projectId: e.target.value || null })}
            aria-label={es ? "Proyecto" : "Project"}
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: 14,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1.5px solid rgba(14,13,18,.14)",
              background: "#fff",
              color: "var(--ink)",
            }}
          >
            <option value="">{es ? "Sin proyecto" : "No project"}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label={es ? "Asignada a" : "Assigned to"}>
          <select
            value={task.assigneeId ?? ""}
            onChange={(e) => {
              if (e.target.value === "__new__") {
                const name = prompt(es ? "Nombre de la persona" : "Person's name");
                const id = name ? onAddPerson(name) : null;
                if (id) onPatch({ assigneeId: id });
                return;
              }
              onPatch({ assigneeId: e.target.value || null });
            }}
            aria-label={es ? "Asignada a" : "Assigned to"}
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: 14,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1.5px solid rgba(14,13,18,.14)",
              background: "#fff",
              color: "var(--ink)",
            }}
          >
            <option value="">{es ? "Nadie" : "Nobody"}</option>
            {people.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
            <option value="__new__">{es ? "+ Nueva persona…" : "+ New person…"}</option>
          </select>
        </Field>

        <Field label={es ? "Notas" : "Notes"}>
          <textarea
            value={task.notes}
            onChange={(e) => onPatch({ notes: e.target.value })}
            aria-label={es ? "Notas" : "Notes"}
            rows={4}
            placeholder={es ? "Detalles, enlaces, pasos…" : "Details, links, steps…"}
            style={{
              width: "100%",
              boxSizing: "border-box",
              resize: "vertical",
              fontFamily: "inherit",
              fontSize: 13.5,
              lineHeight: 1.5,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1.5px solid rgba(14,13,18,.14)",
              outline: "none",
              color: "var(--ink)",
            }}
          />
        </Field>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#6c6a75" }}>{es ? "Posición en la columna" : "Position in the column"}</span>
          <span style={{ marginLeft: "auto", display: "inline-flex", gap: 6 }}>
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onNudge(d)}
                aria-label={d < 0 ? (es ? "Subir" : "Move up") : es ? "Bajar" : "Move down"}
                style={{ width: 36, height: 32, borderRadius: 8, border: "1.5px solid rgba(14,13,18,.14)", background: "#fff", cursor: "pointer", fontSize: 14 }}
              >
                {d < 0 ? "↑" : "↓"}
              </button>
            ))}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <button
            onClick={() => {
              if (confirm(es ? "¿Eliminar esta tarea?" : "Delete this task?")) onDelete();
            }}
            style={{ background: "none", border: "none", color: "#c0392b", fontSize: 13, cursor: "pointer", fontWeight: 500 }}
          >
            {es ? "Eliminar" : "Delete"}
          </button>
          <button
            onClick={close}
            style={{
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: ".1em",
              background: "#0e0d12",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "11px 20px",
              cursor: "pointer",
            }}
          >
            {es ? "LISTO" : "DONE"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ----------------------------------------------------------- manage projects */
function ManageProjects({
  projects,
  tasks,
  onAdd,
  onPatch,
  onDelete,
  onClose,
  es,
}: {
  projects: Project[];
  tasks: Task[];
  onAdd: (name: string) => void;
  onPatch: (id: string, patch: Partial<Project>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  es: boolean;
}) {
  const [newName, setNewName] = React.useState("");
  const [pickIcon, setPickIcon] = React.useState<string | null>(null);
  return (
    <Modal onClose={onClose} label={es ? "Proyectos" : "Projects"}>
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 14px" }}>{es ? "Proyectos" : "Projects"}</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "50vh", overflowY: "auto" }}>
        {projects.map((p) => {
          const count = tasks.filter((t) => t.projectId === p.id).length;
          return (
            <div key={p.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setPickIcon((cur) => (cur === p.id ? null : p.id))}
                title={es ? "Icono" : "Icon"}
                aria-label={(es ? "Icono de " : "Icon for ") + p.name}
                style={{
                  flex: "none",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: pickIcon === p.id ? "var(--accent-tint)" : "#fff",
                  border: `1.5px solid ${pickIcon === p.id ? "var(--accent)" : "rgba(14,13,18,.12)"}`,
                }}
              >
                <ProjectIcon id={p.icon} size={17} color={inkable(p.color)} />
              </button>
              <input
                type="color"
                value={p.color}
                onChange={(e) => onPatch(p.id, { color: e.target.value })}
                title={es ? "Color" : "Color"}
                aria-label={(es ? "Color de " : "Color for ") + p.name}
                style={{ width: 26, height: 26, padding: 0, border: "none", background: "none", cursor: "pointer", flex: "none" }}
              />
              <input
                value={p.name}
                onChange={(e) => onPatch(p.id, { name: e.target.value })}
                onBlur={(e) => {
                  if (!e.target.value.trim()) onPatch(p.id, { name: es ? "Proyecto" : "Project" });
                }}
                aria-label={es ? "Nombre del proyecto" : "Project name"}
                style={{
                  flex: 1,
                  fontFamily: "inherit",
                  fontSize: 14,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1.5px solid rgba(14,13,18,.12)",
                  outline: "none",
                  color: "var(--ink)",
                }}
              />
              <span style={{ fontFamily: MONO, fontSize: 11, color: "#74727d", flex: "none", width: 54, textAlign: "right" }}>
                {count} {es ? "tareas" : "tasks"}
              </span>
              <button
                onClick={() => {
                  const msg = count
                    ? es
                      ? `Eliminar “${p.name}”. Sus ${count} tareas quedarán sin proyecto. ¿Continuar?`
                      : `Delete “${p.name}”. Its ${count} tasks will become unassigned. Continue?`
                    : es
                      ? `¿Eliminar “${p.name}”?`
                      : `Delete “${p.name}”?`;
                  if (confirm(msg)) onDelete(p.id);
                }}
                style={{ background: "none", border: "none", color: "#c0392b", fontSize: 16, cursor: "pointer", flex: "none" }}
                aria-label={es ? "Eliminar proyecto" : "Delete project"}
              >
                ✕
              </button>
            </div>
            {pickIcon === p.id && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(9,1fr)",
                  gap: 6,
                  padding: "10px 8px",
                  marginTop: 8,
                  borderRadius: 10,
                  background: "#f7f8fb",
                  border: "1px solid rgba(14,13,18,.08)",
                }}
              >
                {ICON_IDS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => {
                      onPatch(p.id, { icon: ic });
                      setPickIcon(null);
                    }}
                    title={ic}
                    aria-label={ic}
                    aria-pressed={p.icon === ic}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 30,
                      borderRadius: 7,
                      cursor: "pointer",
                      background: p.icon === ic ? p.color : "#fff",
                      border: `1px solid ${p.icon === ic ? p.color : "rgba(14,13,18,.12)"}`,
                    }}
                  >
                    <ProjectIcon id={ic} size={16} color={p.icon === ic ? fgOn(p.color) : "#54525c"} />
                  </button>
                ))}
              </div>
            )}
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newName.trim()) {
            onAdd(newName);
            setNewName("");
          }
        }}
        style={{ display: "flex", gap: 8, marginTop: 16, borderTop: "1px solid rgba(14,13,18,.08)", paddingTop: 16 }}
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={es ? "Nuevo proyecto…" : "New project…"}
          aria-label={es ? "Nuevo proyecto" : "New project"}
          style={{
            flex: 1,
            fontFamily: "inherit",
            fontSize: 14,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1.5px solid rgba(14,13,18,.14)",
            outline: "none",
            color: "var(--ink)",
          }}
        />
        <button
          type="submit"
          style={{
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".08em",
            background: "#0e0d12",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "0 16px",
            cursor: "pointer",
          }}
        >
          {es ? "AÑADIR" : "ADD"}
        </button>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ primitives */
function Modal({
  children,
  onClose,
  label,
}: {
  children: React.ReactNode;
  onClose: () => void;
  label?: string;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const openerRef = React.useRef<Element | null>(null);

  const focusables = React.useCallback(
    () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => !el.hasAttribute("disabled")),
    []
  );

  /* Enfocar el diálogo es cosa de una sola vez, al abrirlo. Iba junto al
     listener de teclado en un efecto con `onClose` en las dependencias, y como
     quien nos usa suele pasar una arrow nueva en cada render, el efecto se
     rearmaba con cada tecla: escribir en Notas devolvía el cursor al título a
     la primera letra. Sin dependencias, esto corre al montar y nada más. */
  React.useEffect(() => {
    openerRef.current = document.activeElement;
    (focusables()[0] ?? panelRef.current)?.focus();
    return () => {
      // devolver el foco a lo que abrió el diálogo
      (openerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [focusables]);

  /* El listener sí necesita el `onClose` de ahora, y volver a suscribirlo es
     inofensivo: no mueve el foco. */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const f = focusables();
        if (f.length === 0) return;
        const active = document.activeElement as HTMLElement;
        const idx = f.indexOf(active);
        if (e.shiftKey && idx <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && idx === f.length - 1) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, focusables]);

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(14,13,18,.34)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "8vh 16px 16px",
        overflowY: "auto",
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#fff",
          borderRadius: 16,
          border: "1px solid rgba(14,13,18,.08)",
          boxShadow: "0 40px 90px -40px rgba(14,13,18,.5)",
          padding: 22,
          outline: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  // a plain div, not a <label>: some fields hold multiple controls (the status
  // segmented buttons), and wrapping those in a <label> is invalid and leaks
  // the label text into their accessible names.
  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "#8b8896", marginBottom: 7 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: ".06em",
  background: "#fff",
  color: "var(--ink)",
  border: "1px solid rgba(14,13,18,.12)",
  borderRadius: 8,
  padding: "8px 12px",
  cursor: "pointer",
};

const menuStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 6px)",
  right: 0,
  zIndex: 2,
  minWidth: 190,
  background: "#fff",
  border: "1px solid rgba(14,13,18,.1)",
  borderRadius: 10,
  boxShadow: "0 20px 50px -24px rgba(14,13,18,.4)",
  padding: 6,
};

const menuItem: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  background: "none",
  border: "none",
  fontFamily: "inherit",
  fontSize: 13.5,
  color: "var(--ink)",
  padding: "9px 10px",
  borderRadius: 7,
  cursor: "pointer",
};
