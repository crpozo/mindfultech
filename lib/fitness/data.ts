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

/** Consejos accionables, revisados cada vez que llegan datos nuevos. */
export const TIPS: {
  id: string;
  priority: "alta" | "media" | "baja";
  tag: string;
  title: string;
  body: string;
}[] = [
  {
    id: "t-01",
    priority: "alta",
    tag: "Medición",
    title: "Mídete el % de grasa antes de sacar conclusiones",
    body:
      "El 13,0 % que ves es una estimación que asume que conservaste tus 73,1 kg de masa magra. Si perdiste músculo, bajaste menos grasa de la que crees. Una bioimpedancia o un plicómetro cada 4 semanas —mismo día, en ayunas— convierte esa suposición en un dato.",
  },
  {
    id: "t-02",
    priority: "alta",
    tag: "Entrenamiento",
    title: "Anota peso × reps × series",
    body:
      "Sin cargas no hay progresión que medir: podrías estar entrenando 6 meses sin subir un kilo en banca y el panel no lo notaría. Con esos números te grafico el tonelaje semanal, que es la señal real de si estás ganando fuerza mientras bajas grasa.",
  },
  {
    id: "t-03",
    priority: "alta",
    tag: "Micronutrientes",
    title: "Sube hierro y potasio — son tus dos huecos",
    body:
      "Hoy quedaste en 44 % de hierro y 19 % de potasio. Lenteja, espinaca y carne roja magra 1–2 veces por semana cubren el hierro (acompáñalo con tu kiwi o mandarina: la vitamina C multiplica la absorción). Para potasio: plátano, papa con cáscara, aguacate y agua de coco — baratos y de aquí.",
  },
  {
    id: "t-04",
    priority: "media",
    tag: "Nutrición",
    title: "Reparte la proteína, no la concentres en la cena",
    body:
      "Llegaste a 150 g, pero 40 vinieron de la pizza a las 20:00 y el bloque de la tarde fue solo fruta. Apunta a 35–40 g en cada comida principal: el músculo se sintetiza mejor en pulsos repartidos que en un pico nocturno.",
  },
  {
    id: "t-05",
    priority: "media",
    tag: "Entrenamiento",
    title: "Tres o cuatro sesiones de fuerza por semana",
    body:
      "Hoy fue pecho y tríceps. Con tu objetivo de recomposición, agenda pierna y espalda esta semana: los grupos grandes son los que más masa magra sostienen y más gasto generan, que es justo lo que protege el déficit.",
  },
  {
    id: "t-06",
    priority: "media",
    tag: "Nutrición",
    title: "El sodio del día vino casi todo de un plato",
    body:
      "2 450 mg en total y 1 800 salieron de la pizza. No es dañino de forma aislada, pero explica la retención de líquido del día siguiente — y por eso la báscula miente si te pesas justo después. Usa el promedio semanal, nunca el dato de un día.",
  },
  {
    id: "t-07",
    priority: "baja",
    tag: "Suplementos",
    title: "La creatina también los días que no entrenas",
    body:
      "5 g diarios sin saltarte los días de descanso: funciona por saturación del músculo, no por el estímulo del día. Lo que ya haces está bien, solo mantenlo constante.",
  },
];

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
      id: "f-2026-07-28-01",
      at: "2026-07-28T08:00",
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
      id: "f-2026-07-28-02",
      at: "2026-07-28T08:15",
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
      id: "f-2026-07-28-03",
      at: "2026-07-28T11:30",
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
      id: "f-2026-07-28-04",
      at: "2026-07-28T16:00",
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
      id: "f-2026-07-28-05",
      at: "2026-07-28T20:00",
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
      id: "f-2026-07-28-06",
      at: "2026-07-28T21:30",
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
      id: "f-2026-07-28-07",
      at: "2026-07-28T21:45",
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

  workouts: [
    {
      id: "w-2026-07-28-01",
      at: "2026-07-28T18:30",
      type: "strength",
      name: "Pecho y tríceps",
      // no cargas ni series todavía — duración y gasto estimados a partir de
      // 7 ejercicios de fuerza para 84 kg (≈4,5 MET)
      duration_min: 60,
      kcal: 380,
      notes: "4 ejercicios de pecho, 2 de tríceps y 1 de abdomen en máquina.",
      source: "claude",
    },
  ],

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
      id: "b-2026-07-28",
      at: "2026-07-28T07:00",
      weight_kg: 84,
      source: "manual",
    },
  ],

  insights: [
    {
      id: "i-2026-07-28-01",
      at: "2026-07-28T22:00",
      title: "Día redondo en proteína, la pizza se comió el margen",
      body:
        "2 313 kcal y 150 g de proteína: casi clavado a tu objetivo. La pizza sola aportó 950 kcal (41 % del día) y 1 800 mg de sodio. No es un problema una vez por semana; si se repite, cámbiala por media pizza + ensalada y recuperas ~450 kcal.",
      tags: ["nutricion"],
    },
    {
      id: "i-2026-07-28-02",
      at: "2026-07-28T22:00",
      title: "Micronutrientes: fuerte en C, B12 y omega-3",
      body:
        "Las sardinas te dieron omega-3, vitamina D y B12 de golpe, y la fruta disparó la vitamina C a ~210 % del valor diario. Lo más flojo del día fue el hierro (~44 %) y el potasio (~19 %): más hoja verde y legumbre lo arreglan.",
      tags: ["micronutrientes"],
    },
    {
      id: "i-2026-07-28-03",
      at: "2026-07-28T22:00",
      title: "Pecho y tríceps: el día cierra en déficit",
      body:
        "60 min de fuerza (~380 kcal) contra 2 313 comidas deja un neto de ~1 933 kcal, unas 470 por debajo de tu objetivo. Con 150 g de proteína encima, es justo el escenario donde se pierde grasa sin tocar músculo.",
      tags: ["entrenamiento"],
    },
    {
      id: "i-2026-07-28-04",
      at: "2026-07-28T22:05",
      title: "Falta el volumen para poder medir progreso",
      body:
        "Registré la sesión, pero sin cargas ni repeticiones no puedo seguir tu progresión. Pásame peso × reps × series de los ejercicios principales (banca, inclinado, fondos…) y empiezo a graficar el tonelaje semana a semana.",
      tags: ["entrenamiento"],
    },
  ],
};
