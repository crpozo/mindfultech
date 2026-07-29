"use client";

import * as React from "react";
import {
  type FitState,
  type FoodEntry,
  type WorkoutEntry,
  type BodyEntry,
  type Insight,
  type Targets,
  type DayStats,
  CLAUDE_PROMPT,
  DEFAULT_TARGETS,
  atDay,
  batchCount,
  dayKey,
  emptyState,
  exportFit,
  lastNDays,
  loadFit,
  microCoverage,
  parseClaude,
  parseFitBackup,
  saveFit,
  statsByDay,
  streakDays,
} from "@/lib/fitness/model";
import {
  hasPasscode,
  isUnlocked,
  resetPasscode,
  setPasscode,
  setUnlocked,
  verifyPasscode,
} from "@/lib/private/passcode";

const MONO = "var(--mono)";

/* Data colours — the validated categorical slots (blue / orange / aqua). The
   aqua sits under 3:1 on white, so every macro mark carries a visible label. */
const C_PROTEIN = "#2a78d6";
const C_CARBS = "#eb6834";
const C_FAT = "#1baf7a";
const C_GOOD = "#0ca30c";
const C_WARN = "#fab219";
const C_BAD = "#d03b3b";
const INK = "#0e0d12";
const MUTED = "#6b6875";

const fmt = (n: number, d = 0) =>
  n.toLocaleString("es-EC", { minimumFractionDigits: d, maximumFractionDigits: d });

export function FitnessApp() {
  const [ready, setReady] = React.useState(false);
  const [unlocked, setUnlockedS] = React.useState(false);
  const [state, setState] = React.useState<FitState>(() => emptyState());
  const loadedRef = React.useRef(false);
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const [range, setRange] = React.useState(14);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [targetsOpen, setTargetsOpen] = React.useState(false);
  const [promptOpen, setPromptOpen] = React.useState(false);

  React.useEffect(() => {
    setUnlockedS(isUnlocked());
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!unlocked || loadedRef.current) return;
    setState(loadFit() ?? emptyState());
    loadedRef.current = true;
  }, [unlocked]);

  React.useEffect(() => {
    if (!loadedRef.current) return;
    const t = setTimeout(() => saveFit(state), 250);
    return () => clearTimeout(t);
  }, [state]);

  React.useEffect(() => {
    const flush = () => {
      if (loadedRef.current) saveFit(stateRef.current);
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, []);

  const addBatch = (text: string): number => {
    const b = parseClaude(text);
    const n = batchCount(b);
    if (!n) return 0;
    setState((s) => ({
      ...s,
      food: [...s.food, ...b.food],
      workouts: [...s.workouts, ...b.workouts],
      body: [...s.body, ...b.body],
      insights: [...s.insights, ...b.insights],
    }));
    return n;
  };

  const del = (kind: "food" | "workouts" | "body" | "insights", id: string) =>
    setState((s) => ({ ...s, [kind]: (s[kind] as { id: string }[]).filter((e) => e.id !== id) } as FitState));

  const lock = () => {
    setUnlocked(false);
    setUnlockedS(false);
    loadedRef.current = false;
    setMenuOpen(false);
  };

  const days = React.useMemo(() => lastNDays(range), [range]);
  const stats = React.useMemo(() => statsByDay(state, days), [state, days]);
  const today = stats[stats.length - 1];
  const daySet = React.useMemo(() => new Set(days), [days]);
  const micros = React.useMemo(() => microCoverage(state, daySet), [state, daySet]);
  const streak = React.useMemo(() => streakDays(state), [state]);

  if (!ready) return <div style={{ minHeight: "100vh", background: "#eef2f9" }} />;
  if (!unlocked) return <FitLock onUnlock={() => setUnlockedS(true)} />;

  const hasData = state.food.length + state.workouts.length + state.body.length > 0;

  return (
    <div className="fit-app">
      <header className="fit-head">
        <div className="fit-wrap fit-headrow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-mark.webp" alt="" width={26} height={26} />
          <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-.01em" }}>
            Fitness
            <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED, fontWeight: 500, letterSpacing: ".1em", marginLeft: 10 }}>
              {streak} {streak === 1 ? "DÍA" : "DÍAS"} SEGUIDOS
            </span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", position: "relative" }}>
            <div className="fit-seg" role="group" aria-label="Rango">
              {[7, 14, 30, 90].map((n) => (
                <button key={n} onClick={() => setRange(n)} aria-pressed={range === n} className={range === n ? "on" : ""}>
                  {n}d
                </button>
              ))}
            </div>
            <button className="fit-ghost" onClick={() => setMenuOpen((v) => !v)} aria-label="Menú">
              ⋯
            </button>
            {menuOpen && (
              <>
                <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1 }} />
                <div className="fit-menu">
                  <button onClick={() => { setPromptOpen(true); setMenuOpen(false); }}>Prompt para Claude</button>
                  <button onClick={() => { setTargetsOpen(true); setMenuOpen(false); }}>Objetivos</button>
                  <button onClick={() => { exportFit(state); setMenuOpen(false); }}>Descargar respaldo</button>
                  <label>
                    Restaurar respaldo
                    <input
                      type="file"
                      accept="application/json,.json"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const r = new FileReader();
                          r.onload = () => {
                            const parsed = parseFitBackup(String(r.result || ""));
                            if (!parsed) return alert("Archivo de respaldo inválido.");
                            if (confirm("Esto reemplazará tus datos actuales. ¿Continuar?")) {
                              setState(parsed);
                              loadedRef.current = true;
                            }
                          };
                          r.readAsText(f);
                        }
                        e.target.value = "";
                        setMenuOpen(false);
                      }}
                    />
                  </label>
                  <div className="sep" />
                  <button style={{ color: C_BAD }} onClick={lock}>Bloquear</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="fit-wrap" style={{ padding: "20px 20px 80px" }}>
        <Importer onAdd={addBatch} onPrompt={() => setPromptOpen(true)} empty={!hasData} />

        {hasData && (
          <>
            <TodayCard today={today} targets={state.targets} />

            <div className="fit-grid2">
              <Panel title="Calorías por día" sub={`Objetivo ${fmt(state.targets.kcal)} kcal`}>
                <Bars
                  data={stats.map((d) => ({ key: d.day, value: d.kcal, label: shortDay(d.day) }))}
                  target={state.targets.kcal}
                  color={C_PROTEIN}
                  unit="kcal"
                />
              </Panel>
              <Panel title="Proteína por día" sub={`Objetivo ${fmt(state.targets.protein_g)} g`}>
                <Bars
                  data={stats.map((d) => ({ key: d.day, value: d.protein_g, label: shortDay(d.day) }))}
                  target={state.targets.protein_g}
                  color={C_CARBS}
                  unit="g"
                />
              </Panel>
            </div>

            <div className="fit-grid2">
              <Panel title="Peso" sub="kg">
                <Line points={stats.filter((d) => d.weight_kg != null).map((d) => ({ key: d.day, value: d.weight_kg! }))} unit="kg" />
              </Panel>
              <Panel title="Entrenamiento" sub="minutos por día">
                <Bars
                  data={stats.map((d) => ({ key: d.day, value: d.workoutMin, label: shortDay(d.day) }))}
                  color={C_FAT}
                  unit="min"
                />
              </Panel>
            </div>

            {micros.length > 0 && (
              <Panel title="Micronutrientes" sub={`Cobertura media diaria en ${range} días (% del valor diario)`}>
                <Micros rows={micros} />
              </Panel>
            )}

            <Insights state={state} stats={stats} onDelete={(id) => del("insights", id)} />
            <Log state={state} onDelete={del} />
          </>
        )}
      </main>

      {targetsOpen && (
        <Modal onClose={() => setTargetsOpen(false)} label="Objetivos">
          <TargetsForm
            targets={state.targets}
            onChange={(t) => setState((s) => ({ ...s, targets: t }))}
            onClose={() => setTargetsOpen(false)}
          />
        </Modal>
      )}
      {promptOpen && (
        <Modal onClose={() => setPromptOpen(false)} label="Prompt para Claude">
          <PromptPanel onClose={() => setPromptOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ lock screen */

function FitLock({ onUnlock }: { onUnlock: () => void }) {
  const [creating, setCreating] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [pass, setPass] = React.useState("");
  const [confirmPass, setConfirmPass] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setCreating(!hasPasscode());
    setReady(true);
    const t = setTimeout(() => ref.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (creating) {
      if (pass.length < 4) return setErr("Usa al menos 4 caracteres.");
      if (pass !== confirmPass) return setErr("Los códigos no coinciden.");
      setBusy(true);
      const ok = await setPasscode(pass);
      if (!ok) {
        setBusy(false);
        return setErr("No se pudo guardar el código en este navegador.");
      }
    } else {
      setBusy(true);
      const ok = await verifyPasscode(pass);
      setBusy(false);
      if (!ok) {
        setPass("");
        ref.current?.focus();
        return setErr("Código incorrecto.");
      }
    }
    setUnlocked(true);
    onUnlock();
  };

  if (!ready) return <div style={{ minHeight: "100vh", background: "#eef2f9" }} />;

  return (
    <div className="fit-lock">
      <form onSubmit={submit}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-mark.webp" alt="" width={46} height={46} style={{ margin: "0 auto 14px", display: "block" }} />
        <div className="mono-eyebrow">MindfulTech · Fitness</div>
        <h1>{creating ? "Crea tu código" : "Desbloquea tu panel"}</h1>
        <p>
          {creating
            ? "El mismo código abre tus herramientas privadas en este dispositivo."
            : "Ingresa tu código para ver tus datos."}
        </p>
        <input
          ref={ref}
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Código"
          aria-label="Código"
          autoComplete={creating ? "new-password" : "current-password"}
        />
        {creating && (
          <input
            type="password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            placeholder="Confirma el código"
            aria-label="Confirma el código"
            autoComplete="new-password"
            style={{ marginTop: 10 }}
          />
        )}
        {err && <div role="alert" className="fit-err">{err}</div>}
        <button type="submit" disabled={busy} className="fit-primary" style={{ width: "100%", marginTop: 18 }}>
          {creating ? "CREAR Y ENTRAR" : "DESBLOQUEAR"}
        </button>
        {!creating && (
          <button
            type="button"
            className="fit-link"
            onClick={() => {
              if (window.confirm("Se creará un código nuevo. Tus datos NO se borran. ¿Continuar?")) {
                resetPasscode();
                setCreating(true);
                setPass("");
                setConfirmPass("");
                setErr("");
              }
            }}
          >
            ¿Olvidaste tu código?
          </button>
        )}
        <p className="fit-fine">Tus datos se guardan solo en este navegador. No se envían a ningún servidor.</p>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------- importer */

function Importer({ onAdd, onPrompt, empty }: { onAdd: (t: string) => number; onPrompt: () => void; empty: boolean }) {
  const [text, setText] = React.useState("");
  const [msg, setMsg] = React.useState<{ ok: boolean; text: string } | null>(null);

  const submit = () => {
    const n = onAdd(text);
    if (n) {
      setText("");
      setMsg({ ok: true, text: `${n} ${n === 1 ? "registro añadido" : "registros añadidos"}.` });
    } else {
      setMsg({ ok: false, text: "No encontré datos válidos. Pega el bloque JSON que te devuelve Claude." });
    }
    setTimeout(() => setMsg(null), 5000);
  };

  return (
    <section className="fit-panel" style={{ borderColor: empty ? "var(--accent)" : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Pegar desde Claude</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13.5, color: MUTED }}>
            Manda la foto o la descripción a Claude, copia su respuesta y pégala aquí.
          </p>
        </div>
        <button className="fit-ghost" style={{ marginLeft: "auto" }} onClick={onPrompt}>
          Ver prompt
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Pega aquí la respuesta de Claude (el bloque JSON con "food", "workouts", "body"…)'
        aria-label="Respuesta de Claude"
        rows={empty ? 6 : 3}
        className="fit-paste"
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
        <button className="fit-primary" onClick={submit} disabled={!text.trim()}>
          AÑADIR AL PANEL
        </button>
        {msg && (
          <span role="status" style={{ fontSize: 13.5, fontWeight: 500, color: msg.ok ? C_GOOD : C_BAD }}>
            {msg.text}
          </span>
        )}
      </div>
      {empty && (
        <p style={{ fontSize: 13, color: MUTED, margin: "14px 0 0", lineHeight: 1.6 }}>
          ¿Primera vez? Abre <strong>Ver prompt</strong>, cópialo y pégalo en Claude (o guárdalo como Proyecto).
          Desde ahí solo mandas la foto de tu plato y te devuelve el JSON listo para pegar acá.
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ today card */

function TodayCard({ today, targets }: { today: DayStats; targets: Targets }) {
  const net = today.kcal - today.workoutKcal;
  const pct = targets.kcal ? (today.kcal / targets.kcal) * 100 : 0;
  const tone = pct > 110 ? C_BAD : pct >= 85 ? C_GOOD : C_WARN;
  return (
    <section className="fit-panel">
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ minWidth: 190 }}>
          <div className="fit-eyebrow">HOY</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 46, fontWeight: 500, letterSpacing: "-.03em", color: INK, lineHeight: 1 }}>
              {fmt(today.kcal)}
            </span>
            <span style={{ fontSize: 14, color: MUTED }}>/ {fmt(targets.kcal)} kcal</span>
          </div>
          <div className="fit-track" style={{ marginTop: 12 }}>
            <span style={{ width: `${Math.min(100, pct)}%`, background: tone }} />
          </div>
          <div style={{ fontSize: 12.5, color: MUTED, marginTop: 8 }}>
            {today.workoutKcal > 0 && <>Quemadas {fmt(today.workoutKcal)} · neto {fmt(net)} kcal · </>}
            {today.meals} {today.meals === 1 ? "comida" : "comidas"}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 12 }}>
          <MacroBar label="Proteína" value={today.protein_g} target={targets.protein_g} color={C_PROTEIN} />
          <MacroBar label="Carbohidratos" value={today.carbs_g} target={targets.carbs_g} color={C_CARBS} />
          <MacroBar label="Grasa" value={today.fat_g} target={targets.fat_g} color={C_FAT} />
        </div>

        <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
          <Stat label="Peso" value={today.weight_kg != null ? `${fmt(today.weight_kg, 1)} kg` : "—"} />
          <Stat label="Pasos" value={today.steps != null ? fmt(today.steps) : "—"} />
          <Stat label="Sueño" value={today.sleep_h != null ? `${fmt(today.sleep_h, 1)} h` : "—"} />
          <Stat label="Ejercicio" value={today.workoutMin ? `${fmt(today.workoutMin)} min` : "—"} />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="fit-eyebrow">{label}</div>
      <div style={{ fontSize: 20, fontWeight: 500, color: INK, marginTop: 4, letterSpacing: "-.01em" }}>{value}</div>
    </div>
  );
}

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = target ? (value / target) * 100 : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
        <span style={{ color: INK, fontWeight: 500 }}>{label}</span>
        {/* direct label — the aqua slot needs relief on a light surface */}
        <span style={{ color: MUTED, fontFamily: MONO, fontSize: 12 }}>
          {fmt(value)} / {fmt(target)} g · {fmt(pct)}%
        </span>
      </div>
      <div className="fit-track">
        <span style={{ width: `${Math.min(100, pct)}%`, background: color }} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- charts */

function shortDay(day: string): string {
  const [, m, d] = day.split("-");
  return `${d}/${m}`;
}

function Bars({
  data,
  target,
  color,
  unit,
}: {
  data: { key: string; value: number; label: string }[];
  target?: number;
  color: string;
  unit: string;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const max = Math.max(target ?? 0, ...data.map((d) => d.value), 1) * 1.12;
  const step = Math.max(1, Math.ceil(data.length / 7));
  return (
    <div className="fit-chart">
      <div className="fit-bars" onMouseLeave={() => setHover(null)}>
        {target != null && target > 0 && (
          <span className="fit-targetline" style={{ bottom: `${(target / max) * 100}%` }} aria-hidden />
        )}
        {data.map((d, i) => (
          <div key={d.key} className="fit-barcell" onMouseEnter={() => setHover(i)}>
            <span
              className="fit-bar"
              style={{ height: `${Math.max(d.value > 0 ? 2 : 0, (d.value / max) * 100)}%`, background: color }}
            />
            {hover === i && (
              <div className="fit-tip" role="tooltip">
                <b>{fmt(d.value)}</b> {unit}
                <span>{d.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="fit-axis">
        {data.map((d, i) => (
          <span key={d.key}>{i % step === 0 ? d.label : ""}</span>
        ))}
      </div>
    </div>
  );
}

function Line({ points, unit }: { points: { key: string; value: number }[]; unit: string }) {
  const [hover, setHover] = React.useState<number | null>(null);
  if (points.length === 0)
    return <div className="fit-empty">Sin datos en este rango — pídele a Claude que incluya &quot;body&quot;.</div>;
  if (points.length === 1)
    return (
      <div className="fit-chart" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 172 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-.02em" }}>{fmt(points[0].value, 1)}</div>
          <div className="fit-eyebrow" style={{ marginTop: 4 }}>{unit} · {shortDay(points[0].key)}</div>
        </div>
      </div>
    );

  const W = 700, H = 160, P = 10;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const x = (i: number) => P + (i * (W - P * 2)) / (points.length - 1);
  const y = (v: number) => P + (1 - (v - min) / span) * (H - P * 2);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");

  return (
    <div className="fit-chart" style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 172, display: "block", overflow: "visible" }} role="img">
        <path d={`${d} L${x(points.length - 1)},${H} L${x(0)},${H} Z`} fill={C_PROTEIN} opacity="0.08" />
        <path d={d} fill="none" stroke={C_PROTEIN} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle
            key={p.key}
            cx={x(i)}
            cy={y(p.value)}
            r={hover === i ? 6 : 4}
            fill={C_PROTEIN}
            stroke="#fff"
            strokeWidth="2"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>
      {hover != null && (
        <div className="fit-tip fit-tip-abs" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(points[hover].value) / H) * 100}%` }} role="tooltip">
          <b>{fmt(points[hover].value, 1)}</b> {unit}
          <span>{shortDay(points[hover].key)}</span>
        </div>
      )}
      <div className="fit-axis">
        <span>{shortDay(points[0].key)}</span>
        <span style={{ textAlign: "right" }}>{shortDay(points[points.length - 1].key)}</span>
      </div>
    </div>
  );
}

function Micros({ rows }: { rows: { id: string; label: string; pct: number }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {rows.slice(0, 12).map((r) => {
        const tone = r.pct >= 90 ? C_GOOD : r.pct >= 50 ? C_WARN : C_BAD;
        return (
          <div key={r.id}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
              <span style={{ color: INK }}>{r.label}</span>
              <span style={{ fontFamily: MONO, fontSize: 11.5, color: MUTED }}>{fmt(r.pct)}%</span>
            </div>
            <div className="fit-track" style={{ height: 8 }}>
              <span style={{ width: `${Math.min(100, r.pct)}%`, background: tone }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------- insights */

function Insights({
  state,
  stats,
  onDelete,
}: {
  state: FitState;
  stats: DayStats[];
  onDelete: (id: string) => void;
}) {
  // a few observations computed locally, so the panel is useful even before
  // Claude writes any — clearly marked so they're never confused with its notes
  const auto = React.useMemo(() => {
    const out: { title: string; body: string }[] = [];
    const logged = stats.filter((d) => d.meals > 0);
    if (logged.length >= 3) {
      const avgP = logged.reduce((a, d) => a + d.protein_g, 0) / logged.length;
      const gap = state.targets.protein_g - avgP;
      if (gap > 15)
        out.push({
          title: "Proteína por debajo del objetivo",
          body: `Promedias ${fmt(avgP)} g en los días registrados, ${fmt(gap)} g menos que tu objetivo de ${fmt(state.targets.protein_g)} g.`,
        });
      const avgK = logged.reduce((a, d) => a + d.kcal, 0) / logged.length;
      if (avgK > state.targets.kcal * 1.1)
        out.push({
          title: "Vas por encima en calorías",
          body: `Promedias ${fmt(avgK)} kcal frente a un objetivo de ${fmt(state.targets.kcal)}.`,
        });
      else if (avgK < state.targets.kcal * 0.8)
        out.push({
          title: "Estás comiendo poco",
          body: `Promedias ${fmt(avgK)} kcal, bastante por debajo de ${fmt(state.targets.kcal)}. Revisa si es intencional.`,
        });
    }
    const trained = stats.filter((d) => d.workoutMin > 0).length;
    if (stats.length >= 7)
      out.push({
        title: `${trained} de ${stats.length} días con entrenamiento`,
        body: `Suman ${fmt(stats.reduce((a, d) => a + d.workoutMin, 0))} minutos en el rango.`,
      });
    const weights = stats.filter((d) => d.weight_kg != null);
    if (weights.length >= 2) {
      const diff = weights[weights.length - 1].weight_kg! - weights[0].weight_kg!;
      out.push({
        title: diff === 0 ? "Peso estable" : diff < 0 ? `Bajaste ${fmt(Math.abs(diff), 1)} kg` : `Subiste ${fmt(diff, 1)} kg`,
        body: `Entre ${shortDay(weights[0].day)} y ${shortDay(weights[weights.length - 1].day)}.`,
      });
    }
    return out;
  }, [stats, state.targets]);

  const fromClaude = [...state.insights].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
  if (!auto.length && !fromClaude.length) return null;

  return (
    <section className="fit-panel">
      <h2 style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 600 }}>Insights</h2>
      <div className="fit-insights">
        {fromClaude.map((i: Insight) => (
          <article key={i.id} className="fit-insight">
            <div className="fit-eyebrow" style={{ color: "var(--accent-deep)" }}>CLAUDE · {i.at.slice(0, 10)}</div>
            <h3>{i.title}</h3>
            {i.body && <p>{i.body}</p>}
            <button className="fit-x" onClick={() => onDelete(i.id)} aria-label="Eliminar insight">✕</button>
          </article>
        ))}
        {auto.map((i, n) => (
          <article key={"a" + n} className="fit-insight">
            <div className="fit-eyebrow">CALCULADO</div>
            <h3>{i.title}</h3>
            <p>{i.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- log */

function Log({
  state,
  onDelete,
}: {
  state: FitState;
  onDelete: (kind: "food" | "workouts" | "body" | "insights", id: string) => void;
}) {
  const [tab, setTab] = React.useState<"food" | "workouts" | "body">("food");
  const food = [...state.food].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 40);
  const workouts = [...state.workouts].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 40);
  const body = [...state.body].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 40);

  return (
    <section className="fit-panel">
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {([
          ["food", `Comidas (${state.food.length})`],
          ["workouts", `Entrenamientos (${state.workouts.length})`],
          ["body", `Cuerpo (${state.body.length})`],
        ] as const).map(([k, label]) => (
          <button key={k} className={`fit-tab${tab === k ? " on" : ""}`} onClick={() => setTab(k)} aria-pressed={tab === k}>
            {label}
          </button>
        ))}
      </div>

      <div className="fit-rows">
        {tab === "food" &&
          food.map((f: FoodEntry) => (
            <div key={f.id} className="fit-row">
              <div style={{ minWidth: 0 }}>
                <div className="fit-rowtitle">{f.name}</div>
                <div className="fit-rowmeta">
                  {f.at.replace("T", " ")} · {mealES(f.meal)} · {fmt(f.protein_g)}P / {fmt(f.carbs_g)}C / {fmt(f.fat_g)}G
                  {f.supplements?.length ? ` · ${f.supplements.join(", ")}` : ""}
                </div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 13, whiteSpace: "nowrap" }}>{fmt(f.kcal)} kcal</div>
              <button className="fit-x" onClick={() => onDelete("food", f.id)} aria-label="Eliminar">✕</button>
            </div>
          ))}
        {tab === "workouts" &&
          workouts.map((w: WorkoutEntry) => (
            <div key={w.id} className="fit-row">
              <div style={{ minWidth: 0 }}>
                <div className="fit-rowtitle">{w.name}</div>
                <div className="fit-rowmeta">
                  {w.at.replace("T", " ")} · {w.type}
                  {w.rpe ? ` · RPE ${w.rpe}` : ""}
                  {w.sets?.length ? ` · ${w.sets.length} ejercicios` : ""}
                </div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 13, whiteSpace: "nowrap" }}>
                {fmt(w.duration_min)} min{w.kcal ? ` · ${fmt(w.kcal)} kcal` : ""}
              </div>
              <button className="fit-x" onClick={() => onDelete("workouts", w.id)} aria-label="Eliminar">✕</button>
            </div>
          ))}
        {tab === "body" &&
          body.map((b: BodyEntry) => (
            <div key={b.id} className="fit-row">
              <div style={{ minWidth: 0 }}>
                <div className="fit-rowtitle">
                  {[
                    b.weight_kg != null ? `${fmt(b.weight_kg, 1)} kg` : null,
                    b.bodyfat_pct != null ? `${fmt(b.bodyfat_pct, 1)}% grasa` : null,
                    b.steps != null ? `${fmt(b.steps)} pasos` : null,
                    b.sleep_h != null ? `${fmt(b.sleep_h, 1)} h sueño` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
                <div className="fit-rowmeta">{b.at.replace("T", " ")}</div>
              </div>
              <button className="fit-x" onClick={() => onDelete("body", b.id)} aria-label="Eliminar">✕</button>
            </div>
          ))}
        {((tab === "food" && !food.length) ||
          (tab === "workouts" && !workouts.length) ||
          (tab === "body" && !body.length)) && <div className="fit-empty">Nada registrado todavía.</div>}
      </div>
    </section>
  );
}

const mealES = (m: string) =>
  ({ breakfast: "desayuno", lunch: "almuerzo", dinner: "cena", snack: "snack" }[m] ?? m);

/* ---------------------------------------------------------------------- modals */

function Modal({ children, onClose, label }: { children: React.ReactNode; onClose: () => void; label: string }) {
  const panel = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="fit-modal" onMouseDown={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function TargetsForm({
  targets,
  onChange,
  onClose,
}: {
  targets: Targets;
  onChange: (t: Targets) => void;
  onClose: () => void;
}) {
  const [t, setT] = React.useState<Targets>(targets);
  const field = (k: keyof Targets, label: string, unit: string, step = 1) => (
    <label className="fit-field" key={k}>
      <span>{label}</span>
      <div>
        <input
          type="number"
          step={step}
          value={t[k]}
          onChange={(e) => setT({ ...t, [k]: parseFloat(e.target.value) || 0 })}
          aria-label={label}
        />
        <em>{unit}</em>
      </div>
    </label>
  );
  return (
    <>
      <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 500 }}>Objetivos diarios</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13.5, color: MUTED }}>Se usan como referencia en el panel y los gráficos.</p>
      <div style={{ display: "grid", gap: 10 }}>
        {field("kcal", "Calorías", "kcal", 10)}
        {field("protein_g", "Proteína", "g", 5)}
        {field("carbs_g", "Carbohidratos", "g", 5)}
        {field("fat_g", "Grasa", "g", 5)}
        {field("steps", "Pasos", "pasos", 500)}
        {field("sleep_h", "Sueño", "h", 0.5)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 10 }}>
        <button className="fit-link" onClick={() => setT({ ...DEFAULT_TARGETS })}>Restablecer</button>
        <button
          className="fit-primary"
          onClick={() => {
            onChange(t);
            onClose();
          }}
        >
          GUARDAR
        </button>
      </div>
    </>
  );
}

function PromptPanel({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CLAUDE_PROMPT);
    } catch {
      /* clipboard blocked — the text is selectable below */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  return (
    <>
      <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 500 }}>Prompt para Claude</h2>
      <p style={{ margin: "0 0 14px", fontSize: 13.5, color: MUTED, lineHeight: 1.55 }}>
        Cópialo y pégalo en Claude (idealmente como <strong>Proyecto</strong>, así queda guardado). Después solo
        le mandas la foto del plato o describes lo que comiste, y te responde con el JSON que pegas en el panel.
      </p>
      <textarea readOnly value={CLAUDE_PROMPT} rows={12} className="fit-paste" aria-label="Prompt para Claude" />
      <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "flex-end", alignItems: "center" }}>
        {copied && <span style={{ fontSize: 13, color: C_GOOD, marginRight: "auto" }}>Copiado ✓</span>}
        <button className="fit-ghost" onClick={onClose}>Cerrar</button>
        <button className="fit-primary" onClick={copy}>COPIAR PROMPT</button>
      </div>
    </>
  );
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="fit-panel">
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2>
        {sub && <p style={{ margin: "3px 0 0", fontSize: 12.5, color: MUTED }}>{sub}</p>}
      </div>
      {children}
    </section>
  );
}
