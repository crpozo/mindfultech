"use client";

import * as React from "react";
import { useLang } from "../i18n";
import {
  type TasksState,
  type Task,
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
} from "@/lib/tasks/store";
import { LockScreen } from "./LockScreen";

const MONO = "var(--mono)";

export function TasksApp() {
  const { lang } = useLang();
  const es = lang === "es";
  const [unlocked, setUnlockedS] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [state, setState] = React.useState<TasksState>(() => ({ version: 1, projects: [], tasks: [] }));
  const loadedRef = React.useRef(false);

  // filter, editor, drag, modals
  const [filter, setFilter] = React.useState<string>("all"); // "all" | projectId | "none"
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [manageOpen, setManageOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState<Status | null>(null);

  // ---- boot: unlock + load ----
  React.useEffect(() => {
    setUnlockedS(isUnlocked());
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!unlocked || loadedRef.current) return;
    const s = loadState() ?? seedState();
    setState(s);
    loadedRef.current = true;
  }, [unlocked]);

  React.useEffect(() => {
    if (loadedRef.current) saveState(state);
  }, [state]);

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
    mutate((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

  const deleteTask = (id: string) => {
    mutate((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
    setEditingId((cur) => (cur === id ? null : cur));
  };

  const addProject = (name: string) => {
    const n = name.trim();
    if (!n) return;
    const color = PROJECT_COLORS[state.projects.length % PROJECT_COLORS.length];
    const p: Project = { id: uid(), name: n, color };
    mutate((s) => ({ ...s, projects: [...s.projects, p] }));
    return p.id;
  };

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

  const visible = React.useMemo(() => {
    let ts = state.tasks;
    if (filter === "none") ts = ts.filter((t) => !t.projectId);
    else if (filter !== "all") ts = ts.filter((t) => t.projectId === filter);
    return ts;
  }, [state.tasks, filter]);

  const editing = editingId ? state.tasks.find((t) => t.id === editingId) || null : null;

  if (!ready) return <div style={{ minHeight: "100vh", background: "#eef2f9" }} />;
  if (!unlocked) return <LockScreen onUnlock={() => setUnlockedS(true)} />;

  const defaultProjectForNew = filter !== "all" && filter !== "none" ? filter : null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#eef2fa 0%,#e9eef7 100%)", color: "var(--ink)" }}>
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
        </div>
      </header>

      {/* board */}
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: 20 }}>
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
                  if (dragId) patchTask(dragId, { status: col.id });
                  setDragId(null);
                  setDragOver(null);
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 4px 12px" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "#6c6a75" }}>
                    {es ? col.es : col.en}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: "#a2a0ab" }}>{colTasks.length}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {colTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      project={t.projectId ? projectsById.get(t.projectId) || null : null}
                      showProject={filter === "all" || filter === "none"}
                      onOpen={() => setEditingId(t.id)}
                      onToggle={() => patchTask(t.id, { status: t.status === "done" ? "todo" : "done" })}
                      onDragStart={() => setDragId(t.id)}
                      onDragEnd={() => { setDragId(null); setDragOver(null); }}
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
          es={es}
        />
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
function FilterChip({
  label,
  color,
  active,
  onClick,
  count,
}: {
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
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
      {color && <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flex: "none" }} />}
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 10.5, opacity: active ? 0.7 : 0.5 }}>{count}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ task card */
function TaskCard({
  task,
  project,
  showProject,
  onOpen,
  onToggle,
  onDragStart,
  onDragEnd,
  es,
}: {
  task: Task;
  project: Project | null;
  showProject: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  es: boolean;
}) {
  const done = task.status === "done";
  return (
    <div
      className="tk-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", task.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 9,
        background: "#fff",
        border: "1px solid rgba(14,13,18,.08)",
        borderLeft: `3px solid ${project?.color || "#c8c7cf"}`,
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
      <div style={{ minWidth: 0, flex: 1 }} onClick={onOpen}>
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.35,
            color: done ? "#a2a0ab" : "var(--ink)",
            textDecoration: done ? "line-through" : "none",
            wordBreak: "break-word",
          }}
        >
          {task.title}
        </div>
        {(showProject || task.notes) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
            {showProject && (
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".06em", color: project ? "#6c6a75" : "#a2a0ab" }}>
                {project ? project.name : es ? "Sin proyecto" : "No project"}
              </span>
            )}
            {task.notes && <span style={{ fontSize: 11, color: "#a2a0ab" }}>✎</span>}
          </div>
        )}
      </div>
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
      <span style={{ fontSize: 11, color: "#a2a0ab" }}>{es ? "Enter para añadir" : "Enter to add"}</span>
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
  es,
}: {
  task: Task;
  projects: Project[];
  onPatch: (patch: Partial<Task>) => void;
  onDelete: () => void;
  onClose: () => void;
  es: boolean;
}) {
  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <textarea
          value={task.title}
          onChange={(e) => onPatch({ title: e.target.value })}
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

        <Field label={es ? "Notas" : "Notes"}>
          <textarea
            value={task.notes}
            onChange={(e) => onPatch({ notes: e.target.value })}
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
            onClick={onClose}
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
  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 14px" }}>{es ? "Proyectos" : "Projects"}</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "50vh", overflowY: "auto" }}>
        {projects.map((p) => {
          const count = tasks.filter((t) => t.projectId === p.id).length;
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="color"
                value={p.color}
                onChange={(e) => onPatch(p.id, { color: e.target.value })}
                title={es ? "Color" : "Color"}
                style={{ width: 26, height: 26, padding: 0, border: "none", background: "none", cursor: "pointer", flex: "none" }}
              />
              <input
                value={p.name}
                onChange={(e) => onPatch(p.id, { name: e.target.value })}
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
              <span style={{ fontFamily: MONO, fontSize: 11, color: "#a2a0ab", flex: "none", width: 54, textAlign: "right" }}>
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
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
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
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#fff",
          borderRadius: 16,
          border: "1px solid rgba(14,13,18,.08)",
          boxShadow: "0 40px 90px -40px rgba(14,13,18,.5)",
          padding: 22,
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
