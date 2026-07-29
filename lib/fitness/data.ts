// The fitness log itself. Carlos writes what he ate / trained in chat, Claude
// analyses it and appends it here — so the data ships with the site and reads
// the same on the phone and on the laptop, instead of living in one browser.

import type { FitState } from "./model";

export const PROFILE = {
  height_cm: 181,
  age: 31,
  country: "Ecuador",
  /** the measured starting point every comparison is made against */
  baseline: { at: "2026-01-15", weight_kg: 86.8, bodyfat_pct: 15.8 },
};

export const LOG: FitState = {
  version: 1,
  targets: {
    // ~2 400 kcal: Mifflin-St Jeor puts maintenance near 2 500–2 800 for
    // 84 kg / 1,81 m / 31 a, so this is a mild deficit with protein high
    // enough (2 g/kg) to hold muscle while the fat comes off.
    kcal: 2400,
    protein_g: 170,
    carbs_g: 230,
    fat_g: 75,
    steps: 8000,
    sleep_h: 7.5,
  },

  food: [
    {
      id: "f-2026-07-29-01",
      at: "2026-07-29T08:00",
      meal: "breakfast",
      name: "Pancake de proteína",
      kcal: 220,
      protein_g: 22,
      carbs_g: 22,
      fat_g: 5,
      fiber_g: 2,
      micros: {
        Calcio: { amount: 150, unit: "mg" },
        Hierro: { amount: 1.5, unit: "mg" },
      },
      confidence: 0.7,
      source: "claude",
    },
    {
      id: "f-2026-07-29-02",
      at: "2026-07-29T08:15",
      meal: "breakfast",
      name: "Shake de proteína",
      kcal: 120,
      protein_g: 25,
      carbs_g: 3,
      fat_g: 1.5,
      micros: {
        Calcio: { amount: 150, unit: "mg" },
        "Vitamina B12": { amount: 0.6, unit: "µg" },
      },
      supplements: ["Creatina 5 g"],
      confidence: 0.8,
      source: "claude",
    },
    {
      id: "f-2026-07-29-03",
      at: "2026-07-29T11:30",
      meal: "snack",
      name: "Sardinas con crackers",
      kcal: 320,
      protein_g: 26,
      carbs_g: 20,
      fat_g: 14,
      fiber_g: 1,
      sodium_mg: 650,
      micros: {
        "Omega-3": { amount: 1400, unit: "mg" },
        "Vitamina D": { amount: 7, unit: "µg" },
        "Vitamina B12": { amount: 8, unit: "µg" },
        Calcio: { amount: 350, unit: "mg" },
        Selenio: { amount: 45, unit: "µg" },
        Hierro: { amount: 2.5, unit: "mg" },
        Fósforo: { amount: 300, unit: "mg" },
        Magnesio: { amount: 40, unit: "mg" },
      },
      notes: "Lata de sardinas escurrida + ~6 crackers.",
      confidence: 0.7,
      source: "claude",
    },
    {
      id: "f-2026-07-29-04",
      at: "2026-07-29T16:00",
      meal: "snack",
      name: "2 mandarinas, 2 kiwis y 1 manzana",
      kcal: 273,
      protein_g: 3.5,
      carbs_g: 69,
      fat_g: 1.6,
      fiber_g: 12,
      sugar_g: 52,
      micros: {
        "Vitamina C": { amount: 189, unit: "mg" },
        Potasio: { amount: 900, unit: "mg" },
        "Vitamina K": { amount: 60, unit: "µg" },
        "Folato (B9)": { amount: 60, unit: "µg" },
        Magnesio: { amount: 60, unit: "mg" },
      },
      confidence: 0.85,
      source: "claude",
    },
    {
      id: "f-2026-07-29-05",
      at: "2026-07-29T20:00",
      meal: "dinner",
      name: "Pizza capricciosa — Via Partenope",
      kcal: 950,
      protein_g: 40,
      carbs_g: 100,
      fat_g: 40,
      fiber_g: 5,
      sodium_mg: 1800,
      micros: {
        Calcio: { amount: 450, unit: "mg" },
        Hierro: { amount: 4, unit: "mg" },
        Selenio: { amount: 25, unit: "µg" },
        "Vitamina A": { amount: 180, unit: "µg" },
        Magnesio: { amount: 60, unit: "mg" },
        Sodio: { amount: 1800, unit: "mg" },
      },
      notes: "Napolitana entera: jamón, champiñones, alcachofa, aceituna y mozzarella.",
      confidence: 0.6,
      source: "claude",
    },
    {
      id: "f-2026-07-29-06",
      at: "2026-07-29T21:30",
      meal: "snack",
      name: "Vaso de kéfir deslactosado",
      kcal: 110,
      protein_g: 9,
      carbs_g: 10,
      fat_g: 4,
      micros: {
        Calcio: { amount: 300, unit: "mg" },
        "Vitamina B12": { amount: 0.7, unit: "µg" },
        Fósforo: { amount: 230, unit: "mg" },
      },
      confidence: 0.8,
      source: "claude",
    },
    {
      id: "f-2026-07-29-07",
      at: "2026-07-29T21:45",
      meal: "snack",
      name: "Helado de proteína",
      kcal: 320,
      protein_g: 24,
      carbs_g: 36,
      fat_g: 8,
      fiber_g: 4,
      micros: {
        Calcio: { amount: 300, unit: "mg" },
        Magnesio: { amount: 30, unit: "mg" },
      },
      notes: "Estimado como envase pequeño completo — dime la marca y lo afino.",
      confidence: 0.55,
      source: "claude",
    },
  ],

  workouts: [],

  body: [
    {
      id: "b-2026-01-15",
      at: "2026-01-15T07:00",
      weight_kg: 86.8,
      bodyfat_pct: 15.8,
      notes: "Medición de referencia (enero).",
      source: "manual",
    },
    {
      id: "b-2026-07-29",
      at: "2026-07-29T07:00",
      weight_kg: 84,
      source: "manual",
    },
  ],

  insights: [
    {
      id: "i-2026-07-29-01",
      at: "2026-07-29T22:00",
      title: "Día redondo en proteína, la pizza se comió el margen",
      body:
        "2 313 kcal y 150 g de proteína: casi clavado a tu objetivo. La pizza sola aportó 950 kcal (41 % del día) y 1 800 mg de sodio. No es un problema una vez por semana; si se repite, cámbiala por media pizza + ensalada y recuperas ~450 kcal.",
      tags: ["nutricion"],
    },
    {
      id: "i-2026-07-29-02",
      at: "2026-07-29T22:00",
      title: "Micronutrientes: fuerte en C, B12 y omega-3",
      body:
        "Las sardinas te dieron omega-3, vitamina D y B12 de golpe, y la fruta disparó la vitamina C a ~210 % del valor diario. Lo más flojo del día fue el hierro (~44 %) y el potasio (~19 %): más hoja verde y legumbre lo arreglan.",
      tags: ["micronutrientes"],
    },
    {
      id: "i-2026-07-29-03",
      at: "2026-07-29T22:00",
      title: "Hoy no registraste entrenamiento",
      body:
        "Con 2 313 kcal y sin gasto de ejercicio, el día queda cerca de mantenimiento. Si el objetivo es seguir bajando grasa, mete 3–4 sesiones de fuerza por semana y me las cuentas.",
      tags: ["entrenamiento"],
    },
  ],
};
