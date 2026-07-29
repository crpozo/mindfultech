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
  atDay,
  dayKey,
  DV,
  FAMILIES,
  exportFit,
  lastNDays,
  microCoverage,
  statsByDay,
  streakDays,
} from "@/lib/fitness/model";
import { LOG, PROFILE, RESEARCH, STACK, TIPS } from "@/lib/fitness/data";
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
  const [range, setRange] = React.useState(14);
  const [menuOpen, setMenuOpen] = React.useState(false);

  // the log ships with the site — nothing to load, nothing to sync
  const state = LOG;

  React.useEffect(() => {
    setUnlockedS(isUnlocked());
    setReady(true);
  }, []);

  const lock = () => {
    setUnlocked(false);
    setUnlockedS(false);
    setMenuOpen(false);
  };

  // The log is written from chat, so its clock may be a few hours off this
  // device's (a UTC-stamped entry looks like "tomorrow" in Ecuador). End the
  // window on the newest entry when it is ahead of today, so a timezone skew
  // never hides the data.
  const lastAt = React.useMemo(() => {
    let m = "";
    for (const e of [...state.food, ...state.workouts, ...state.body]) if (e.at > m) m = e.at;
    return m;
  }, [state]);

  const endDate = React.useMemo(() => {
    const today = new Date();
    if (lastAt) {
      const [y, mo, d] = lastAt.slice(0, 10).split("-").map(Number);
      const last = new Date(y, mo - 1, d);
      if (last > today) return last;
    }
    return today;
  }, [lastAt]);

  const days = React.useMemo(() => lastNDays(range, endDate), [range, endDate]);
  const stats = React.useMemo(() => statsByDay(state, days), [state, days]);
  const today = stats[stats.length - 1];
  const isToday = today?.day === dayKey(new Date());
  const dayFoods = React.useMemo(
    () => state.food.filter((f) => atDay(f.at) === today?.day),
    [state.food, today?.day]
  );
  const daySet = React.useMemo(() => new Set(days), [days]);
  const micros = React.useMemo(() => microCoverage(state, daySet), [state, daySet]);
  const streak = React.useMemo(() => streakDays(state), [state]);

  if (!ready) return <div style={{ minHeight: "100vh", background: "#eef2f9" }} />;
  if (!unlocked) return <FitLock onUnlock={() => setUnlockedS(true)} />;

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
                  <button onClick={() => { exportFit(state); setMenuOpen(false); }}>Descargar datos</button>
                  <div className="sep" />
                  <button style={{ color: C_BAD }} onClick={lock}>Bloquear</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="fit-wrap" style={{ padding: "20px 20px 80px" }}>
        <Progress state={state} />
        <TodayCard today={today} targets={state.targets} isToday={isToday} foods={dayFoods} />

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

        <Tips />
        <Stack />
        <Research micros={micros} range={range} />
        <Insights state={state} stats={stats} />
        <Log state={state} />

        <p className="fit-howto">
          Para registrar algo nuevo, escríbeselo a Claude en el chat —
          &ldquo;hoy comí…&rdquo;, &ldquo;entrené…&rdquo;, &ldquo;peso…&rdquo; — y aparece acá analizado.
        </p>
      </main>
    </div>
  );
}

/* --------------------------------------------------------------- progress card */

function Progress({ state }: { state: FitState }) {
  const base = PROFILE.baseline;
  const weights = [...state.body]
    .filter((b) => b.weight_kg != null)
    .sort((a, b) => a.at.localeCompare(b.at));
  const latest = weights[weights.length - 1];
  if (!latest?.weight_kg) return null;

  const now = latest.weight_kg;
  const dW = now - base.weight_kg;
  const h = PROFILE.height_cm / 100;
  const bmi = now / (h * h);

  // January's composition is the only measured one; hold lean mass constant and
  // the whole difference lands on fat — the optimistic end of the range, so it
  // is labelled as an estimate rather than a reading.
  const baseFat = (base.weight_kg * base.bodyfat_pct) / 100;
  const lean = base.weight_kg - baseFat;
  const fatNow = Math.max(0, now - lean);
  const bfNow = (fatNow / now) * 100;
  const fatLost = baseFat - fatNow;

  const measured = latest.bodyfat_pct != null;

  return (
    <section className="fit-panel">
      <div style={{ display: "flex", gap: 30, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ minWidth: 200 }}>
          <div className="fit-eyebrow">PROGRESO DESDE ENERO</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 44, fontWeight: 500, letterSpacing: "-.03em", lineHeight: 1, color: INK }}>
              {fmt(dW, 1)} kg
            </span>
            <span style={{ fontSize: 14, color: dW < 0 ? C_GOOD : MUTED, fontWeight: 500 }}>
              {dW < 0 ? "↓" : dW > 0 ? "↑" : ""} {fmt(base.weight_kg, 1)} → {fmt(now, 1)} kg
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: MUTED, marginTop: 8, lineHeight: 1.5 }}>
            {PROFILE.height_cm} cm · {PROFILE.age} años · IMC {fmt(bmi, 1)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Stat label="Grasa en enero" value={`${fmt(base.bodyfat_pct, 1)} %`} />
          <Stat
            label={measured ? "Grasa hoy" : "Grasa hoy (est.)"}
            value={`${fmt(measured ? latest.bodyfat_pct! : bfNow, 1)} %`}
          />
          <Stat label="Grasa perdida (est.)" value={`${fmt(fatLost, 1)} kg`} />
          <Stat label="Masa magra (enero)" value={`${fmt(lean, 1)} kg`} />
        </div>
      </div>

      {!measured && (
        <p style={{ fontSize: 12.5, color: MUTED, margin: "16px 0 0", lineHeight: 1.6 }}>
          El % de grasa de hoy es una <strong>estimación</strong>: asume que conservaste la masa magra de enero
          ({fmt(lean, 1)} kg), así que es el escenario optimista. Si perdiste algo de músculo estarás 1–2 puntos por
          encima. Mídete con báscula de bioimpedancia o plicómetro y me pasas el número para fijarlo.
        </p>
      )}
    </section>
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

/* ------------------------------------------------------------------ today card */

type MacroKey = "kcal" | "protein_g" | "carbs_g" | "fat_g";

function TodayCard({
  today,
  targets,
  isToday,
  foods,
}: {
  today: DayStats;
  targets: Targets;
  isToday: boolean;
  foods: FoodEntry[];
}) {
  const [open, setOpen] = React.useState<MacroKey | null>(null);
  const net = today.kcal - today.workoutKcal;
  const pct = targets.kcal ? (today.kcal / targets.kcal) * 100 : 0;
  const tone = pct > 110 ? C_BAD : pct >= 85 ? C_GOOD : C_WARN;
  const toggle = (k: MacroKey) => setOpen((cur) => (cur === k ? null : k));

  return (
    <section className="fit-panel">
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ minWidth: 190 }}>
          <div className="fit-eyebrow">{isToday ? "HOY" : `ÚLTIMO DÍA · ${shortDay(today.day)}`}</div>
          <button
            className="fit-drill"
            onClick={() => toggle("kcal")}
            aria-expanded={open === "kcal"}
            title="Ver de dónde salen"
          >
            <span style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 46, fontWeight: 500, letterSpacing: "-.03em", color: INK, lineHeight: 1 }}>
                {fmt(today.kcal)}
              </span>
              <span style={{ fontSize: 14, color: MUTED }}>/ {fmt(targets.kcal)} kcal</span>
              <Caret on={open === "kcal"} />
            </span>
          </button>
          <div className="fit-track" style={{ marginTop: 12 }}>
            <span style={{ width: `${Math.min(100, pct)}%`, background: tone }} />
          </div>
          <div style={{ fontSize: 12.5, color: MUTED, marginTop: 8 }}>
            {today.workoutKcal > 0 && <>Quemadas {fmt(today.workoutKcal)} · neto {fmt(net)} kcal · </>}
            {today.meals} {today.meals === 1 ? "comida" : "comidas"}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 12 }}>
          <MacroBar label="Proteína" k="protein_g" value={today.protein_g} target={targets.protein_g} color={C_PROTEIN} open={open} onToggle={toggle} />
          <MacroBar label="Carbohidratos" k="carbs_g" value={today.carbs_g} target={targets.carbs_g} color={C_CARBS} open={open} onToggle={toggle} />
          <MacroBar label="Grasa" k="fat_g" value={today.fat_g} target={targets.fat_g} color={C_FAT} open={open} onToggle={toggle} />
        </div>

        <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
          <Stat label="Peso" value={today.weight_kg != null ? `${fmt(today.weight_kg, 1)} kg` : "—"} />
          <Stat label="Pasos" value={today.steps != null ? fmt(today.steps) : "—"} />
          <Stat label="Sueño" value={today.sleep_h != null ? `${fmt(today.sleep_h, 1)} h` : "—"} />
          <Stat label="Ejercicio" value={today.workoutMin ? `${fmt(today.workoutMin)} min` : "—"} />
        </div>
      </div>

      {open && <Breakdown k={open} foods={foods} />}
      {!open && (
        <p style={{ fontSize: 12, color: MUTED, margin: "16px 0 0" }}>
          Toca una cifra para ver de qué comida sale.
        </p>
      )}
    </section>
  );
}

const MACRO_META: Record<MacroKey, { label: string; unit: string; color: string }> = {
  kcal: { label: "Calorías", unit: "kcal", color: C_GOOD },
  protein_g: { label: "Proteína", unit: "g", color: C_PROTEIN },
  carbs_g: { label: "Carbohidratos", unit: "g", color: C_CARBS },
  fat_g: { label: "Grasa", unit: "g", color: C_FAT },
};

/** Which foods made up a number, biggest contributor first. */
function Breakdown({ k, foods }: { k: MacroKey; foods: FoodEntry[] }) {
  const meta = MACRO_META[k];
  const rows = foods
    .map((f) => ({ name: f.name, at: f.at, value: (f[k] as number) || 0, confidence: f.confidence }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
  const total = rows.reduce((a, r) => a + r.value, 0);
  if (!rows.length) return <div className="fit-empty">Sin comidas registradas este día.</div>;

  return (
    <div className="fit-break">
      <div className="fit-eyebrow" style={{ marginBottom: 10 }}>
        {meta.label.toUpperCase()} · DE DÓNDE SALE
      </div>
      {rows.map((r) => {
        const share = total ? (r.value / total) * 100 : 0;
        return (
          <div key={r.at + r.name} className="fit-breakrow">
            <span className="fit-breakname">
              {r.name}
              {r.confidence != null && r.confidence < 0.7 && (
                <em title="Estimación con menos certeza — confírmame la porción"> · est.</em>
              )}
            </span>
            <span className="fit-breakbar">
              <span style={{ width: `${share}%`, background: meta.color }} />
            </span>
            <span className="fit-breakval">
              {fmt(r.value)} {meta.unit}
              <em>{fmt(share)}%</em>
            </span>
          </div>
        );
      })}
      <div className="fit-breaktotal">
        Total {fmt(total)} {meta.unit}
      </div>
    </div>
  );
}

function Caret({ on }: { on: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={MUTED}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: on ? "rotate(180deg)" : "none", transition: "transform .2s", flex: "none" }}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
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

function MacroBar({
  label,
  k,
  value,
  target,
  color,
  open,
  onToggle,
}: {
  label: string;
  k: MacroKey;
  value: number;
  target: number;
  color: string;
  open: MacroKey | null;
  onToggle: (k: MacroKey) => void;
}) {
  const pct = target ? (value / target) * 100 : 0;
  return (
    <button className="fit-drill" onClick={() => onToggle(k)} aria-expanded={open === k} style={{ width: "100%" }}>
      <span style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5, alignItems: "center", gap: 8 }}>
        <span style={{ color: INK, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}>
          {label}
          <Caret on={open === k} />
        </span>
        {/* direct label — the aqua slot needs relief on a light surface */}
        <span style={{ color: MUTED, fontFamily: MONO, fontSize: 12 }}>
          {fmt(value)} / {fmt(target)} g · {fmt(pct)}%
        </span>
      </span>
      <span className="fit-track">
        <span style={{ width: `${Math.min(100, pct)}%`, background: color }} />
      </span>
    </button>
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

/** Lighten / darken a hex so each nutrient gets its own shade of the family hue. */
function shade(hex: string, amt: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))))
  );
  return "#" + ch.map((v) => v.toString(16).padStart(2, "0")).join("");
}

const FAM_BY_ID = new Map(DV.map((d) => [d.id, d.family]));

function Micros({ rows }: { rows: { id: string; label: string; pct: number }[] }) {
  // group by family so the colour legend means something, and give each
  // nutrient its own step of the family hue
  const groups = FAMILIES.map((f) => ({
    ...f,
    items: rows.filter((r) => FAM_BY_ID.get(r.id) === f.key).sort((x, y) => y.pct - x.pct),
  })).filter((g) => g.items.length);

  // the track runs 0–200 % with a mark at 100, so adequacy reads by position
  const SCALE = 200;

  return (
    <div>
      <div className="fit-legend">
        {groups.map((g) => (
          <span key={g.key}>
            <i style={{ background: g.color }} />
            {g.label}
          </span>
        ))}
      </div>

      {groups.map((g) => (
        <div key={g.key} style={{ marginTop: 16 }}>
          <div className="fit-eyebrow" style={{ marginBottom: 8 }}>{g.label}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {g.items.map((r, i) => {
              const step = g.items.length > 1 ? (i / (g.items.length - 1)) * 0.42 - 0.14 : 0;
              const color = shade(g.color, step);
              return (
                <div key={r.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                    <span style={{ color: INK, display: "inline-flex", alignItems: "center", gap: 7 }}>
                      <i style={{ width: 9, height: 9, borderRadius: 3, background: color, display: "inline-block", flex: "none" }} />
                      {r.label}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 11.5, color: r.pct >= 100 ? C_GOOD : MUTED }}>
                      {fmt(r.pct)}%
                    </span>
                  </div>
                  <div className="fit-track fit-track-dv" style={{ height: 9 }}>
                    <span style={{ width: `${Math.min(100, (r.pct / SCALE) * 100)}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <p style={{ fontSize: 11.5, color: MUTED, margin: "16px 0 0" }}>
        La línea marca el 100 % del valor diario; la barra llega al final a partir de 200 %.
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------- tips */

function Tips() {
  const tone: Record<string, string> = { alta: C_BAD, media: C_WARN, baja: C_GOOD };
  return (
    <section className="fit-panel">
      <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 600 }}>Consejos para mejorar</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13.5, color: MUTED }}>
        Ordenados por lo que más mueve la aguja con tus datos de hoy.
      </p>
      <div className="fit-tips">
        {TIPS.map((t) => (
          <article key={t.id} className="fit-tip-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="fit-prio" style={{ background: tone[t.priority] }}>
                {t.priority.toUpperCase()}
              </span>
              <span className="fit-eyebrow">{t.tag}</span>
            </div>
            <h3>{t.title}</h3>
            <p>{t.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- stack */

/**
 * Supplements and medication, kept out of the food log because they aren't
 * food — and because a couple of them change how the rest of the board should
 * be read.
 */
function Stack() {
  return (
    <section className="fit-panel">
      <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 600 }}>Tu stack diario</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13.5, color: MUTED }}>
        Lo que tomas todos los días, y qué implica para los números de arriba.
      </p>
      <div className="fit-research">
        {STACK.map((s) => (
          <article key={s.id} className="fit-res-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="fit-prio" style={{ background: s.kind === "medicación" ? "#8a3d8a" : "#0b7a2f" }}>
                {s.kind.toUpperCase()}
              </span>
              <span className="fit-eyebrow">{s.route === "oral" ? "VÍA ORAL" : "TÓPICO"}</span>
            </div>
            <h3>{s.name}</h3>
            <p style={{ fontFamily: MONO, fontSize: 12, color: INK, margin: "0 0 8px" }}>{s.dose}</p>
            <p>{s.why}</p>
            <dl className="fit-res-dl">
              {s.note && (
                <>
                  <dt>En tu tablero</dt>
                  <dd>{s.note}</dd>
                </>
              )}
              {s.caution && (
                <>
                  <dt style={{ color: C_BAD }}>Ojo</dt>
                  <dd>{s.caution}</dd>
                </>
              )}
            </dl>
            {s.confirm && <p className="fit-res-yours fit-res-ask">{s.confirm}</p>}
          </article>
        ))}
      </div>
      <p style={{ fontSize: 11.5, color: MUTED, margin: "16px 0 0", lineHeight: 1.6 }}>
        Nada de esto reemplaza a quien te lo recetó. El minoxidil oral pide control de presión y
        frecuencia cardíaca; si aparece hinchazón en tobillos o palpitaciones, eso se consulta, no se
        anota.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------- research */

const EV_TONE: Record<string, { color: string; label: string }> = {
  fuerte: { color: "#0b7a2f", label: "EVIDENCIA FUERTE" },
  moderada: { color: "#9a6300", label: "EVIDENCIA MODERADA" },
  condicional: { color: "#5d5a68", label: "SOLO SI HAY DÉFICIT" },
};

type Bucket = "gap" | "blind" | "ok";

/**
 * The nutrients with real scientific backing, sorted by what's actually
 * missing from the log rather than alphabetically — a nutrient covered at
 * 19 % deserves the top of the page, one at 200 % does not.
 */
function Research({ micros, range }: { micros: { id: string; pct: number }[]; range: number }) {
  const [all, setAll] = React.useState(false);
  const pctById = React.useMemo(() => new Map(micros.map((m) => [m.id, m.pct])), [micros]);

  const rows = RESEARCH.map((r) => {
    const pct = r.micro ? pctById.get(r.micro) : undefined;
    // anything he already supplements is not a gap, whatever the food says —
    // the log only sees plates. Otherwise: no `micro` → the log can't see it;
    // a `micro` with no data → never recorded, which is a gap worth showing
    const bucket: Bucket = r.supplemented ? "ok" : !r.micro ? "blind" : pct == null || pct < 70 ? "gap" : "ok";
    return { ...r, pct, bucket, tracked: !!r.micro };
  });

  const GROUPS: { key: Bucket; title: string; sub: string }[] = [
    { key: "gap", title: "Te falta", sub: "por debajo del 70 % del valor diario, o sin aparecer en el registro" },
    { key: "blind", title: "Sin medir", sub: "el registro no los captura todavía — vale la pena tenerlos en el radar" },
    { key: "ok", title: "Ya lo llevas bien", sub: "cubiertos por la comida o por tu stack; aquí el trabajo es sostener, no añadir" },
  ];
  const visible = all ? GROUPS : GROUPS.filter((g) => g.key !== "ok");

  return (
    <section className="fit-panel">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 600 }}>Vitaminas, minerales y suplementos con research</h2>
          <p style={{ margin: 0, fontSize: 13.5, color: MUTED }}>
            Lo que la evidencia respalda, cruzado con tu cobertura media de los últimos {range} días.
            Primero lo que te falta.
          </p>
        </div>
        <div className="fit-seg" role="group" aria-label="Filtro">
          <button onClick={() => setAll(false)} aria-pressed={!all} className={!all ? "on" : ""}>
            Lo que falta
          </button>
          <button onClick={() => setAll(true)} aria-pressed={all} className={all ? "on" : ""}>
            Todo
          </button>
        </div>
      </div>

      {visible.map((g) => {
        const items = rows
          .filter((r) => r.bucket === g.key)
          .sort((a, b) => (a.pct ?? -1) - (b.pct ?? -1));
        if (!items.length) return null;
        return (
          <div key={g.key} style={{ marginTop: 20 }}>
            <div className="fit-eyebrow">{g.title.toUpperCase()}</div>
            <p style={{ margin: "3px 0 12px", fontSize: 12.5, color: MUTED }}>{g.sub}</p>
            <div className="fit-research">
              {items.map((r) => {
                const ev = EV_TONE[r.evidence];
                return (
                  <article key={r.id} className="fit-res-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span className="fit-prio" style={{ background: ev.color }}>{ev.label}</span>
                      {r.supplemented && <span className="fit-res-supp">LO SUPLEMENTAS</span>}
                      {r.tracked && (
                        <span
                          className="fit-res-pct"
                          style={{ color: r.pct == null ? C_BAD : r.pct >= 100 ? C_GOOD : r.pct < 70 ? C_BAD : C_WARN }}
                        >
                          {r.pct == null
                            ? "sin registro"
                            : `${fmt(r.pct)} % ${r.supplemented ? "solo desde comida" : "del valor diario"}`}
                        </span>
                      )}
                    </div>
                    <h3>{r.name}</h3>
                    {r.tracked && (
                      <div className="fit-track" style={{ height: 6, margin: "2px 0 10px" }}>
                        <span
                          style={{
                            width: `${Math.min(100, ((r.pct ?? 0) / 200) * 100)}%`,
                            background: r.pct == null ? "transparent" : r.pct >= 100 ? C_GOOD : r.pct < 70 ? C_BAD : C_WARN,
                          }}
                        />
                      </div>
                    )}
                    <p>{r.what}</p>
                    <dl className="fit-res-dl">
                      <dt>Dosis</dt>
                      <dd>{r.dose}</dd>
                      <dt>De dónde</dt>
                      <dd>{r.sources}</dd>
                      {r.caution && (
                        <>
                          <dt style={{ color: C_BAD }}>Ojo</dt>
                          <dd>{r.caution}</dd>
                        </>
                      )}
                    </dl>
                    {r.yours && <p className="fit-res-yours">{r.yours}</p>}
                  </article>
                );
              })}
            </div>
          </div>
        );
      })}

      <p style={{ fontSize: 11.5, color: MUTED, margin: "18px 0 0", lineHeight: 1.6 }}>
        Consenso científico general, no un diagnóstico. Los porcentajes salen de la comida que
        registraste, así que un 0 % puede significar «no lo comiste» o «no se anotó». Antes de
        suplementar hierro, zinc o vitamina D, una analítica cuesta poco y evita corregir algo que
        no estaba roto.
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------- insights */

function Insights({ state, stats }: { state: FitState; stats: DayStats[] }) {
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

function Log({ state }: { state: FitState }) {
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
