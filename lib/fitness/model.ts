// Fitness log — plain data model, lenient parser for what Claude returns, and
// the aggregations the dashboard reads. No JSX, no network: everything lives in
// the browser's localStorage, same as /tasks.

export const FIT_KEY = "mt_fit_state_v1";
export const FIT_VERSION = 1;

export type Meal = "breakfast" | "lunch" | "dinner" | "snack";
export type WorkoutType = "strength" | "cardio" | "mobility" | "sport";

export interface Micro {
  amount: number;
  unit: string;
  dv_pct?: number;
}

export interface FoodEntry {
  id: string;
  at: string; // ISO-ish local datetime "2026-07-29T13:20"
  meal: Meal;
  name: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  micros?: Record<string, Micro>;
  supplements?: string[];
  notes?: string;
  confidence?: number;
  source: "claude" | "manual";
}

export interface WorkoutSet {
  exercise: string;
  weight_kg?: number;
  reps?: number;
  sets?: number;
}

export interface WorkoutEntry {
  id: string;
  at: string;
  type: WorkoutType;
  name: string;
  duration_min: number;
  kcal?: number;
  distance_km?: number;
  avg_hr?: number;
  rpe?: number;
  sets?: WorkoutSet[];
  notes?: string;
  source: "claude" | "manual";
}

export interface BodyEntry {
  id: string;
  at: string;
  weight_kg?: number;
  bodyfat_pct?: number;
  waist_cm?: number;
  sleep_h?: number;
  steps?: number;
  resting_hr?: number;
  water_ml?: number;
  notes?: string;
  source: "claude" | "manual";
}

export interface Insight {
  id: string;
  at: string;
  title: string;
  body: string;
  tags?: string[];
}

export interface Targets {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  steps: number;
  sleep_h: number;
}

export interface FitState {
  version: number;
  targets: Targets;
  food: FoodEntry[];
  workouts: WorkoutEntry[];
  body: BodyEntry[];
  insights: Insight[];
}

export const DEFAULT_TARGETS: Targets = {
  kcal: 2400,
  protein_g: 160,
  carbs_g: 250,
  fat_g: 75,
  steps: 8000,
  sleep_h: 7.5,
};

export function emptyState(): FitState {
  return { version: FIT_VERSION, targets: { ...DEFAULT_TARGETS }, food: [], workouts: [], body: [], insights: [] };
}

export function uid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* noop */
  }
  return "f-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

/* ---------------------------------------------------------------- micronutrients */

// Canonical micronutrient list with adult daily values, used to turn whatever
// Claude reports into a comparable "% of daily value".
export type MicroFamily = "lipo" | "hidro" | "mineral" | "grasa";

/** Nutrient groups — the colour in the panel comes from the group, the shade
 *  from the nutrient's place in it. Hues are the validated categorical slots. */
export const FAMILIES: { key: MicroFamily; label: string; color: string }[] = [
  { key: "lipo", label: "Vitaminas liposolubles", color: "#eb6834" },
  { key: "hidro", label: "Vitaminas hidrosolubles", color: "#2a78d6" },
  { key: "mineral", label: "Minerales", color: "#1baf7a" },
  { key: "grasa", label: "Grasas esenciales", color: "#4a3aa7" },
];

export const DV: { id: string; label: string; unit: string; dv: number; family: MicroFamily }[] = [
  { id: "vit_a", label: "Vitamina A", unit: "µg", dv: 900 , family: "lipo" },
  { id: "vit_c", label: "Vitamina C", unit: "mg", dv: 90 , family: "hidro" },
  { id: "vit_d", label: "Vitamina D", unit: "µg", dv: 20 , family: "lipo" },
  { id: "vit_e", label: "Vitamina E", unit: "mg", dv: 15 , family: "lipo" },
  { id: "vit_k", label: "Vitamina K", unit: "µg", dv: 120 , family: "lipo" },
  { id: "b1", label: "Tiamina (B1)", unit: "mg", dv: 1.2 , family: "hidro" },
  { id: "b2", label: "Riboflavina (B2)", unit: "mg", dv: 1.3 , family: "hidro" },
  { id: "b3", label: "Niacina (B3)", unit: "mg", dv: 16 , family: "hidro" },
  { id: "b6", label: "Vitamina B6", unit: "mg", dv: 1.7 , family: "hidro" },
  { id: "b9", label: "Folato (B9)", unit: "µg", dv: 400 , family: "hidro" },
  { id: "b12", label: "Vitamina B12", unit: "µg", dv: 2.4 , family: "hidro" },
  { id: "choline", label: "Colina", unit: "mg", dv: 550 , family: "hidro" },
  { id: "calcium", label: "Calcio", unit: "mg", dv: 1300 , family: "mineral" },
  { id: "iron", label: "Hierro", unit: "mg", dv: 18 , family: "mineral" },
  { id: "magnesium", label: "Magnesio", unit: "mg", dv: 420 , family: "mineral" },
  { id: "zinc", label: "Zinc", unit: "mg", dv: 11 , family: "mineral" },
  { id: "potassium", label: "Potasio", unit: "mg", dv: 4700 , family: "mineral" },
  { id: "phosphorus", label: "Fósforo", unit: "mg", dv: 1250 , family: "mineral" },
  { id: "selenium", label: "Selenio", unit: "µg", dv: 55 , family: "mineral" },
  { id: "omega3", label: "Omega-3", unit: "mg", dv: 1600 , family: "grasa" },
  { id: "sodium", label: "Sodio", unit: "mg", dv: 2300 , family: "mineral" },
];

const DV_BY_ID = new Map(DV.map((d) => [d.id, d]));

// Aliases so "vitamina c", "Vitamin C", "ascorbic acid" all land on vit_c.
const ALIASES: Record<string, string> = {
  "vitamina a": "vit_a", "vitamin a": "vit_a", retinol: "vit_a",
  "vitamina c": "vit_c", "vitamin c": "vit_c", "acido ascorbico": "vit_c", "ascorbic acid": "vit_c",
  "vitamina d": "vit_d", "vitamin d": "vit_d", "vitamina d3": "vit_d", "vitamin d3": "vit_d",
  "vitamina e": "vit_e", "vitamin e": "vit_e",
  "vitamina k": "vit_k", "vitamin k": "vit_k",
  tiamina: "b1", thiamin: "b1", thiamine: "b1", "vitamina b1": "b1", "vitamin b1": "b1",
  riboflavina: "b2", riboflavin: "b2", "vitamina b2": "b2", "vitamin b2": "b2",
  niacina: "b3", niacin: "b3", "vitamina b3": "b3", "vitamin b3": "b3",
  "vitamina b6": "b6", "vitamin b6": "b6", piridoxina: "b6", pyridoxine: "b6",
  folato: "b9", folate: "b9", "acido folico": "b9", "folic acid": "b9", "vitamina b9": "b9",
  "vitamina b12": "b12", "vitamin b12": "b12", cobalamina: "b12", cobalamin: "b12",
  colina: "choline", choline: "choline",
  calcio: "calcium", calcium: "calcium",
  hierro: "iron", iron: "iron",
  magnesio: "magnesium", magnesium: "magnesium",
  zinc: "zinc", zink: "zinc",
  potasio: "potassium", potassium: "potassium",
  fosforo: "phosphorus", phosphorus: "phosphorus",
  selenio: "selenium", selenium: "selenium",
  "omega 3": "omega3", "omega-3": "omega3", omega3: "omega3", epa: "omega3", dha: "omega3",
  sodio: "sodium", sodium: "sodium", sal: "sodium",
};

const deaccent = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export function canonicalMicro(key: string): string | null {
  const k = deaccent(key).replace(/[()]/g, "").replace(/\s+/g, " ");
  if (DV_BY_ID.has(k)) return k;
  if (ALIASES[k]) return ALIASES[k];
  // "vitamina c (ascorbico)" → try the leading words
  for (const alias of Object.keys(ALIASES)) if (k.startsWith(alias)) return ALIASES[alias];
  return null;
}

// Convert an amount to the DV's unit where the conversion is unambiguous.
function toDVUnit(amount: number, unit: string, target: string): number | null {
  const u = deaccent(unit).replace("mcg", "µg").replace("ug", "µg");
  const t = deaccent(target).replace("mcg", "µg").replace("ug", "µg");
  if (!u || u === t) return amount;
  const scale: Record<string, number> = { g: 1e6, mg: 1e3, "µg": 1 }; // to µg
  if (scale[u] && scale[t]) return (amount * scale[u]) / scale[t];
  return null; // IU and friends — can't convert safely
}

export function microPct(key: string, m: Micro): { id: string; label: string; pct: number } | null {
  const id = canonicalMicro(key);
  if (!id) return null;
  const def = DV_BY_ID.get(id)!;
  if (typeof m.dv_pct === "number" && isFinite(m.dv_pct)) {
    return { id, label: def.label, pct: Math.max(0, m.dv_pct) };
  }
  const amt = toDVUnit(m.amount, m.unit || def.unit, def.unit);
  if (amt == null || !isFinite(amt)) return null;
  return { id, label: def.label, pct: (amt / def.dv) * 100 };
}

/* --------------------------------------------------------------------- parsing */

const num = (v: unknown): number | undefined => {
  const n = typeof v === "string" ? parseFloat(v.replace(",", ".")) : (v as number);
  return typeof n === "number" && isFinite(n) ? n : undefined;
};

/** Local "YYYY-MM-DD" for a date (never UTC — a 9pm meal must stay on its day). */
export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function nowLocalISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dayKey(d)}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Accepts "2026-07-29T13:20", "2026-07-29 13:20", "2026-07-29" or nothing. */
function normAt(v: unknown): string {
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v.trim())) {
    const s = v.trim().replace(" ", "T");
    return s.length === 10 ? s + "T12:00" : s.slice(0, 16);
  }
  return nowLocalISO();
}

export function atDay(at: string): string {
  return at.slice(0, 10);
}

const MEALS: Meal[] = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_ALIAS: Record<string, Meal> = {
  desayuno: "breakfast", almuerzo: "lunch", comida: "lunch", cena: "dinner",
  merienda: "snack", snack: "snack", colacion: "snack",
};
const W_TYPES: WorkoutType[] = ["strength", "cardio", "mobility", "sport"];
const W_ALIAS: Record<string, WorkoutType> = {
  fuerza: "strength", pesas: "strength", gym: "strength", gimnasio: "strength",
  cardio: "cardio", correr: "cardio", running: "cardio", bici: "cardio", ciclismo: "cardio",
  movilidad: "mobility", estiramiento: "mobility", yoga: "mobility", stretch: "mobility",
  deporte: "sport", futbol: "sport", tenis: "sport", basket: "sport",
};

/** Pull every JSON object/array out of a blob of text (fences, prose, several blocks). */
function extractJson(text: string): unknown[] {
  const out: unknown[] = [];
  const src = text.trim();
  if (!src) return out;
  // try the whole thing first
  try {
    out.push(JSON.parse(src));
    return out;
  } catch {
    /* keep scanning */
  }
  let depth = 0;
  let start = -1;
  let inStr = false;
  let esc = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{" || c === "[") {
      if (depth === 0) start = i;
      depth++;
    } else if (c === "}" || c === "]") {
      depth--;
      if (depth === 0 && start >= 0) {
        try {
          out.push(JSON.parse(src.slice(start, i + 1)));
        } catch {
          /* not valid — skip */
        }
        start = -1;
      }
      if (depth < 0) depth = 0;
    }
  }
  return out;
}

export interface ParsedBatch {
  food: FoodEntry[];
  workouts: WorkoutEntry[];
  body: BodyEntry[];
  insights: Insight[];
}

const emptyBatch = (): ParsedBatch => ({ food: [], workouts: [], body: [], insights: [] });

function toFood(o: Record<string, unknown>): FoodEntry | null {
  const name = typeof o.name === "string" ? o.name : typeof o.food === "string" ? (o.food as string) : "";
  const kcal = num(o.kcal ?? o.calories ?? o.calorias);
  if (!name && kcal == null) return null;
  const mealRaw = deaccent(String(o.meal ?? o.comida ?? ""));
  const meal = (MEALS.includes(mealRaw as Meal) ? mealRaw : MEAL_ALIAS[mealRaw]) as Meal | undefined;
  const micros: Record<string, Micro> = {};
  const rawMicros = (o.micros ?? o.micronutrients ?? o.micronutrientes) as Record<string, unknown> | undefined;
  if (rawMicros && typeof rawMicros === "object") {
    for (const [k, v] of Object.entries(rawMicros)) {
      if (v && typeof v === "object") {
        const mv = v as Record<string, unknown>;
        const amount = num(mv.amount ?? mv.cantidad ?? mv.value);
        if (amount == null) continue;
        micros[k] = { amount, unit: String(mv.unit ?? mv.unidad ?? ""), dv_pct: num(mv.dv_pct ?? mv.dv ?? mv.percent_dv) };
      } else {
        const amount = num(v);
        if (amount != null) micros[k] = { amount, unit: "" };
      }
    }
  }
  const sup = o.supplements ?? o.suplementos;
  return {
    id: uid(),
    at: normAt(o.at ?? o.datetime ?? o.date ?? o.fecha),
    meal: meal ?? "snack",
    name: name || "Comida",
    kcal: kcal ?? 0,
    protein_g: num(o.protein_g ?? o.protein ?? o.proteina ?? o.proteinas) ?? 0,
    carbs_g: num(o.carbs_g ?? o.carbs ?? o.carbohidratos) ?? 0,
    fat_g: num(o.fat_g ?? o.fat ?? o.grasa ?? o.grasas) ?? 0,
    fiber_g: num(o.fiber_g ?? o.fiber ?? o.fibra),
    sugar_g: num(o.sugar_g ?? o.sugar ?? o.azucar),
    sodium_mg: num(o.sodium_mg ?? o.sodium ?? o.sodio),
    micros: Object.keys(micros).length ? micros : undefined,
    supplements: Array.isArray(sup) ? sup.map(String) : undefined,
    notes: typeof o.notes === "string" ? o.notes : typeof o.notas === "string" ? (o.notas as string) : undefined,
    confidence: num(o.confidence ?? o.confianza),
    source: "claude",
  };
}

function toWorkout(o: Record<string, unknown>): WorkoutEntry | null {
  const name = typeof o.name === "string" ? o.name : typeof o.workout === "string" ? (o.workout as string) : "";
  const dur = num(o.duration_min ?? o.duration ?? o.minutos ?? o.duracion_min);
  if (!name && dur == null) return null;
  const tRaw = deaccent(String(o.type ?? o.tipo ?? ""));
  const type = (W_TYPES.includes(tRaw as WorkoutType) ? tRaw : W_ALIAS[tRaw]) as WorkoutType | undefined;
  const rawSets = o.sets ?? o.series;
  const sets: WorkoutSet[] = Array.isArray(rawSets)
    ? (rawSets as Record<string, unknown>[])
        .filter((s) => s && typeof s === "object")
        .map((s) => ({
          exercise: String(s.exercise ?? s.ejercicio ?? ""),
          weight_kg: num(s.weight_kg ?? s.weight ?? s.peso),
          reps: num(s.reps ?? s.repeticiones),
          sets: num(s.sets ?? s.series),
        }))
        .filter((s) => s.exercise)
    : [];
  return {
    id: uid(),
    at: normAt(o.at ?? o.datetime ?? o.date ?? o.fecha),
    type: type ?? "strength",
    name: name || "Entrenamiento",
    duration_min: dur ?? 0,
    kcal: num(o.kcal ?? o.calories ?? o.calorias),
    distance_km: num(o.distance_km ?? o.distancia_km ?? o.distance),
    avg_hr: num(o.avg_hr ?? o.hr ?? o.pulso),
    rpe: num(o.rpe),
    sets: sets.length ? sets : undefined,
    notes: typeof o.notes === "string" ? o.notes : undefined,
    source: "claude",
  };
}

function toBody(o: Record<string, unknown>): BodyEntry | null {
  const e: BodyEntry = {
    id: uid(),
    at: normAt(o.at ?? o.datetime ?? o.date ?? o.fecha),
    weight_kg: num(o.weight_kg ?? o.weight ?? o.peso ?? o.peso_kg),
    bodyfat_pct: num(o.bodyfat_pct ?? o.bodyfat ?? o.grasa_corporal),
    waist_cm: num(o.waist_cm ?? o.cintura_cm ?? o.cintura),
    sleep_h: num(o.sleep_h ?? o.sleep ?? o.sueno_h ?? o.sueno ?? o.dormido_h),
    steps: num(o.steps ?? o.pasos),
    resting_hr: num(o.resting_hr ?? o.rhr ?? o.pulso_reposo),
    water_ml: num(o.water_ml ?? o.agua_ml ?? o.agua),
    notes: typeof o.notes === "string" ? o.notes : undefined,
    source: "claude",
  };
  const hasAny =
    e.weight_kg != null || e.bodyfat_pct != null || e.waist_cm != null || e.sleep_h != null ||
    e.steps != null || e.resting_hr != null || e.water_ml != null;
  return hasAny ? e : null;
}

function toInsight(o: Record<string, unknown>): Insight | null {
  const title = typeof o.title === "string" ? o.title : typeof o.titulo === "string" ? (o.titulo as string) : "";
  const body = typeof o.body === "string" ? o.body : typeof o.texto === "string" ? (o.texto as string) : "";
  if (!title && !body) return null;
  return {
    id: uid(),
    at: normAt(o.at ?? o.date ?? o.fecha),
    title: title || "Insight",
    body,
    tags: Array.isArray(o.tags) ? (o.tags as unknown[]).map(String) : undefined,
  };
}

/**
 * Turn whatever Claude sent back into entries. Accepts the documented
 * {food,workouts,body,insights} envelope, a bare array, a single entry, JSON in
 * ``` fences, or several blocks pasted together.
 */
export function parseClaude(text: string): ParsedBatch {
  const batch = emptyBatch();
  const blobs = extractJson(text);

  const takeArray = (arr: unknown, kind: keyof ParsedBatch) => {
    if (!Array.isArray(arr)) return;
    for (const it of arr) {
      if (!it || typeof it !== "object") continue;
      const o = it as Record<string, unknown>;
      if (kind === "food") { const e = toFood(o); if (e) batch.food.push(e); }
      else if (kind === "workouts") { const e = toWorkout(o); if (e) batch.workouts.push(e); }
      else if (kind === "body") { const e = toBody(o); if (e) batch.body.push(e); }
      else { const e = toInsight(o); if (e) batch.insights.push(e); }
    }
  };

  const handleObject = (o: Record<string, unknown>) => {
    const keyed =
      "food" in o || "comidas" in o || "workouts" in o || "entrenamientos" in o ||
      "body" in o || "cuerpo" in o || "insights" in o;
    if (keyed) {
      takeArray(o.food ?? o.comidas, "food");
      takeArray(o.workouts ?? o.entrenamientos, "workouts");
      takeArray(o.body ?? o.cuerpo, "body");
      takeArray(o.insights, "insights");
      return;
    }
    // a lone entry — infer which kind it is from its fields
    if ("duration_min" in o || "duration" in o || "sets" in o || "series" in o || "rpe" in o) {
      const e = toWorkout(o); if (e) batch.workouts.push(e); return;
    }
    if ("title" in o || "titulo" in o) { const e = toInsight(o); if (e) batch.insights.push(e); return; }
    if (
      !("kcal" in o) && !("calories" in o) && !("name" in o) &&
      ("weight_kg" in o || "peso" in o || "steps" in o || "pasos" in o || "sleep_h" in o)
    ) {
      const e = toBody(o); if (e) batch.body.push(e); return;
    }
    const e = toFood(o); if (e) batch.food.push(e);
  };

  for (const blob of blobs) {
    if (Array.isArray(blob)) {
      for (const it of blob) if (it && typeof it === "object") handleObject(it as Record<string, unknown>);
    } else if (blob && typeof blob === "object") {
      handleObject(blob as Record<string, unknown>);
    }
  }
  return batch;
}

export function batchCount(b: ParsedBatch): number {
  return b.food.length + b.workouts.length + b.body.length + b.insights.length;
}

/* ----------------------------------------------------------------- aggregation */

export interface DayStats {
  day: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  workoutMin: number;
  workoutKcal: number;
  weight_kg?: number;
  steps?: number;
  sleep_h?: number;
  meals: number;
}

export function lastNDays(n: number, end = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    out.push(dayKey(d));
  }
  return out;
}

export function statsByDay(s: FitState, days: string[]): DayStats[] {
  const map = new Map<string, DayStats>();
  for (const day of days)
    map.set(day, { day, kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, workoutMin: 0, workoutKcal: 0, meals: 0 });

  for (const f of s.food) {
    const d = map.get(atDay(f.at));
    if (!d) continue;
    d.kcal += f.kcal || 0;
    d.protein_g += f.protein_g || 0;
    d.carbs_g += f.carbs_g || 0;
    d.fat_g += f.fat_g || 0;
    d.fiber_g += f.fiber_g || 0;
    d.meals += 1;
  }
  for (const w of s.workouts) {
    const d = map.get(atDay(w.at));
    if (!d) continue;
    d.workoutMin += w.duration_min || 0;
    d.workoutKcal += w.kcal || 0;
  }
  // body readings: last value of the day wins
  const sortedBody = [...s.body].sort((a, b) => a.at.localeCompare(b.at));
  for (const b of sortedBody) {
    const d = map.get(atDay(b.at));
    if (!d) continue;
    if (b.weight_kg != null) d.weight_kg = b.weight_kg;
    if (b.steps != null) d.steps = b.steps;
    if (b.sleep_h != null) d.sleep_h = b.sleep_h;
  }
  return days.map((d) => map.get(d)!);
}

/** Micronutrient coverage (% of DV) for a set of days, averaged per logged day. */
export function microCoverage(s: FitState, days: Set<string>): { id: string; label: string; pct: number }[] {
  const totals = new Map<string, { label: string; pct: number }>();
  const loggedDays = new Set<string>();
  for (const f of s.food) {
    const day = atDay(f.at);
    if (!days.has(day)) continue;
    loggedDays.add(day);
    if (!f.micros) continue;
    for (const [k, m] of Object.entries(f.micros)) {
      const r = microPct(k, m);
      if (!r) continue;
      const cur = totals.get(r.id) ?? { label: r.label, pct: 0 };
      cur.pct += r.pct;
      totals.set(r.id, cur);
    }
  }
  const n = Math.max(1, loggedDays.size);
  return [...totals.entries()]
    .map(([id, v]) => ({ id, label: v.label, pct: v.pct / n }))
    .sort((a, b) => b.pct - a.pct);
}

export function streakDays(s: FitState): number {
  const logged = new Set(s.food.map((f) => atDay(f.at)));
  let n = 0;
  const d = new Date();
  // today doesn't break the streak until it's over
  if (!logged.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (logged.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/* --------------------------------------------------------------------- storage */

function sanitize(s: FitState): FitState {
  return {
    version: FIT_VERSION,
    targets: { ...DEFAULT_TARGETS, ...(s.targets || {}) },
    food: Array.isArray(s.food) ? s.food : [],
    workouts: Array.isArray(s.workouts) ? s.workouts : [],
    body: Array.isArray(s.body) ? s.body : [],
    insights: Array.isArray(s.insights) ? s.insights : [],
  };
}

export function loadFit(): FitState | null {
  try {
    const raw = localStorage.getItem(FIT_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as FitState;
    if (!s || typeof s !== "object") return null;
    return sanitize(s);
  } catch {
    return null;
  }
}

export function saveFit(s: FitState): void {
  try {
    localStorage.setItem(FIT_KEY, JSON.stringify(s));
  } catch {
    /* quota / private mode */
  }
}

export function exportFit(s: FitState): void {
  const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mindfultech-fitness-${dayKey(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseFitBackup(text: string): FitState | null {
  try {
    const s = JSON.parse(text) as FitState;
    if (!s || !Array.isArray(s.food)) return null;
    return sanitize(s);
  } catch {
    return null;
  }
}

/* ------------------------------------------------- the prompt the owner gives Claude */

export const CLAUDE_PROMPT = `Eres mi analista de nutrición y entrenamiento. Te voy a mandar fotos de comida, descripciones de lo que comí, entrenamientos o medidas corporales.

Analiza lo que te mando y respóndeme SIEMPRE con un bloque JSON con esta forma exacta (omite los arreglos que no apliquen). Sé realista con las porciones que ves en la foto y estima con tu mejor criterio.

\`\`\`json
{
  "food": [
    {
      "at": "2026-07-29T13:20",
      "meal": "lunch",
      "name": "Pollo a la plancha con arroz y ensalada",
      "kcal": 620,
      "protein_g": 48,
      "carbs_g": 62,
      "fat_g": 18,
      "fiber_g": 6,
      "sugar_g": 4,
      "sodium_mg": 720,
      "micros": {
        "Vitamina C": { "amount": 32, "unit": "mg" },
        "Hierro": { "amount": 3.1, "unit": "mg" },
        "Magnesio": { "amount": 95, "unit": "mg" }
      },
      "supplements": ["Creatina 5g"],
      "confidence": 0.8,
      "notes": "porción estimada de la foto"
    }
  ],
  "workouts": [
    {
      "at": "2026-07-29T18:00",
      "type": "strength",
      "name": "Push day",
      "duration_min": 55,
      "kcal": 380,
      "rpe": 8,
      "sets": [{ "exercise": "Press banca", "weight_kg": 80, "reps": 8, "sets": 4 }]
    }
  ],
  "body": [
    { "at": "2026-07-29T07:00", "weight_kg": 78.4, "bodyfat_pct": 16.2, "sleep_h": 7.5, "steps": 9200, "resting_hr": 58 }
  ],
  "insights": [
    { "at": "2026-07-29T21:00", "title": "Proteína por debajo del objetivo", "body": "Llevas 3 días bajo 140 g. Sube ~30 g en el desayuno.", "tags": ["nutricion"] }
  ]
}
\`\`\`

Reglas:
- "meal" es breakfast | lunch | dinner | snack. "type" de workout es strength | cardio | mobility | sport.
- Usa la fecha y hora reales; si no las sé, usa la hora actual.
- Los micronutrientes van en mg o µg. Incluye los que puedas estimar (vitaminas y minerales).
- Después del JSON, dame 2–3 líneas en español con tu lectura: qué estuvo bien, qué ajustar.
- No inventes precisión: usa "confidence" entre 0 y 1.`;

/* ------------------------------------------------------------ qué mejorar --
 * Un solo recuadro, calculado del registro. Sustituye a la pila de insights
 * escritos a mano: aquí cada línea nace de un número, así que envejece sola
 * cuando el número cambia, en vez de quedarse contando algo de la semana
 * pasada. Cada punto cita su cifra para que se pueda discutir.
 */
export interface Improvement {
  id: string;
  /** cuánto mueve la aguja, no cuán grave suena */
  priority: "alta" | "media" | "baja";
  tag: string;
  title: string;
  body: string;
  /** la cifra que lo disparó, para el chip de la derecha */
  metric?: string;
}

const PRIO_RANK = { alta: 0, media: 1, baja: 2 };

export function improvements(
  s: FitState,
  stats: DayStats[],
  micros: { id: string; label: string; pct: number }[],
  /** ids del DV que ya cubre un suplemento: no son huecos aunque la comida lo parezca */
  supplemented: Set<string> = new Set()
): Improvement[] {
  const out: Improvement[] = [];
  // Today is still being eaten, so it drags every average down. Averages are
  // taken over completed logged days only; the panel's footnote owns the
  // other half of the caveat (a day logged halfway looks like a deficit).
  const today = dayKey(new Date());
  const logged = stats.filter((d) => d.meals > 0 && d.day !== today);
  const n = logged.length;
  const avg = (f: (d: DayStats) => number) =>
    n ? logged.reduce((a, d) => a + f(d), 0) / n : 0;

  // ---- proteína: la variable que decide si lo que se pierde es grasa o músculo
  if (n >= 1) {
    const p = avg((d) => d.protein_g);
    const target = s.targets.protein_g;
    if (target > 0 && p < target * 0.85) {
      out.push({
        id: "protein",
        priority: "alta",
        tag: "Proteína",
        title: `Te faltan ~${Math.round(target - p)} g de proteína al día`,
        body: `Promedias ${Math.round(p)} g contra un objetivo de ${target} en ${n} ${n === 1 ? "día completo" : "días completos"}. En déficit, la proteína es lo que decide si lo que baja es grasa o músculo. Una lata de atún o un shake extra cierra la diferencia.`,
        metric: `${Math.round(p)}/${target} g`,
      });
    }
  }

  // ---- micronutrientes: los dos más bajos que no cubra ya un suplemento
  const gaps = micros
    .filter((m) => !supplemented.has(m.id) && m.pct < 55)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 2);
  if (gaps.length) {
    const names = gaps.map((g) => `${g.label} (${Math.round(g.pct)} %)`).join(" y ");
    out.push({
      id: "micros",
      priority: "alta",
      tag: "Micronutrientes",
      title: `Tus dos huecos ahora: ${gaps.map((g) => g.label).join(" y ")}`,
      body: `${names} del valor diario en el promedio del rango. Es lo más barato de arreglar: una porción diaria del alimento correcto sube cualquiera de los dos sin tocar tus calorías.`,
      metric: `${Math.round(gaps[0].pct)} %`,
    });
  }

  // ---- frecuencia de fuerza
  const week = stats.slice(-7);
  const sessions = week.filter((d) => d.workoutMin > 0).length;
  const strengthDays = new Set(
    s.workouts.filter((w) => w.type === "strength").map((w) => atDay(w.at))
  );
  const strengthWeek = week.filter((d) => strengthDays.has(d.day)).length;
  if (strengthWeek < 3) {
    out.push({
      id: "training",
      priority: strengthWeek === 0 ? "alta" : "media",
      tag: "Entrenamiento",
      title:
        strengthWeek === 0
          ? "No hay fuerza registrada esta semana"
          : `Solo ${strengthWeek} ${strengthWeek === 1 ? "sesión" : "sesiones"} de fuerza en 7 días`,
      body: `Con recomposición como objetivo, 3–4 sesiones semanales son las que sostienen la masa magra mientras baja el peso. ${sessions > strengthWeek ? "El cardio suma gasto, pero no protege músculo igual." : "Pierna y espalda son las que más rinden por sesión."}`,
      metric: `${strengthWeek}/3 sem.`,
    });
  }

  // ---- sin cargas no hay progresión que graficar
  const recent = s.workouts.filter((w) => w.type === "strength").slice(0, 6);
  if (recent.length && !recent.some((w) => w.sets?.length)) {
    out.push({
      id: "loads",
      priority: "media",
      tag: "Datos",
      title: "Ninguna sesión trae peso × reps × series",
      body: "Sin cargas no puedo graficar tu progresión: podrías pasar meses sin subir un kilo en banca y este tablero no lo notaría. Pásame los números de los ejercicios principales.",
    });
  }

  // ---- composición medida vs estimada
  const measured = [...s.body].some((b) => b.bodyfat_pct != null && b.at.slice(0, 10) > "2026-01-15");
  if (!measured) {
    out.push({
      id: "bodyfat",
      priority: "media",
      tag: "Medición",
      title: "El % de grasa sigue siendo una estimación",
      body: "El número del tablero asume que conservaste toda la masa magra de enero, que es el escenario optimista. Una bioimpedancia o un plicómetro cada 4 semanas, mismo día y en ayunas, lo convierte en dato.",
    });
  }

  // ---- sodio contra potasio: importa más con minoxidil de por medio
  const na = micros.find((m) => m.id === "sodium");
  const k = micros.find((m) => m.id === "potassium");
  if (na && k && na.pct > k.pct * 1.3) {
    out.push({
      id: "sodio",
      priority: "baja",
      tag: "Presión",
      title: "El sodio va por delante del potasio",
      body: `Sodio ${Math.round(na.pct)} % contra potasio ${Math.round(k.pct)} %. Los dos se contrapesan en la regulación de la presión, y el desequilibrio pesa más con un vasodilatador de por medio. Plátano, papa con cáscara y aguacate son la vía corta.`,
      metric: `Na ${Math.round(na.pct)} % · K ${Math.round(k.pct)} %`,
    });
  }

  // ---- calorías muy por debajo del objetivo de forma sostenida
  if (n >= 3) {
    const kcal = avg((d) => d.kcal);
    if (s.targets.kcal > 0 && kcal < s.targets.kcal * 0.7) {
      out.push({
        id: "kcal",
        priority: "media",
        tag: "Calorías",
        title: "Estás comiendo bastante por debajo del objetivo",
        body: `Promedias ${Math.round(kcal)} kcal contra ${s.targets.kcal}. Un déficit muy agresivo acelera la báscula pero se lleva músculo por delante, y es lo que suele romper la adherencia. Si el registro está incompleto, dímelo y lo corrijo.`,
        metric: `${Math.round(kcal)} kcal`,
      });
    }
  }

  return out.sort((a, b) => PRIO_RANK[a.priority] - PRIO_RANK[b.priority]);
}
