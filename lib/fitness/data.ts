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

/**
 * Nutrientes y suplementos con respaldo en la literatura, graduados por fuerza
 * de la evidencia y aterrizados en los datos de Carlos. Información general de
 * consenso científico — no reemplaza una analítica ni a un médico.
 */
export const RESEARCH: {
  id: string;
  name: string;
  evidence: "fuerte" | "moderada" | "condicional";
  /** id in the DV table, when the nutrient is one the log can measure — lets
   *  the panel show live coverage next to the research instead of a flat list */
  micro?: string;
  what: string;
  dose: string;
  sources: string;
  caution?: string;
  yours?: string;
}[] = [
  {
    id: "r-creatina",
    name: "Creatina monohidrato",
    evidence: "fuerte",
    what:
      "El suplemento deportivo más estudiado que existe: cientos de ensayos controlados y una posición formal de la ISSN respaldándolo. Satura la fosfocreatina del músculo, lo que te da un par de repeticiones más en las series pesadas y, con el tiempo, más masa magra a igualdad de entrenamiento.",
    dose: "3–5 g diarios, todos los días. No hace falta fase de carga ni ciclarla.",
    sources: "Carne roja y pescado dan ~1–2 g al día; el suplemento es la vía práctica.",
    caution:
      "Retiene algo de agua dentro del músculo: puede subirte ~1 kg en la báscula las primeras semanas. No es grasa.",
    yours: "Ya la tomas — sostenla también los días que no entrenas: funciona por saturación, no por el estímulo del día.",
  },
  {
    id: "r-proteina",
    name: "Proteína",
    evidence: "fuerte",
    what:
      "En déficit calórico es la variable que decide si lo que pierdes es grasa o músculo. Los metaanálisis convergen en 1,6–2,2 g por kg de peso para maximizar la retención de masa magra mientras bajas.",
    dose: "Para tus 84 kg: 135–185 g al día. Tu objetivo está fijado en 170 g.",
    sources: "Huevo, pollo, pescado, lácteos y legumbre. El whey es solo conveniencia, no magia.",
    yours: "Hoy llegaste a 150 g (88 % del objetivo).",
  },
  {
    id: "r-omega3",
    name: "Omega-3 (EPA y DHA)",
    evidence: "fuerte",
    micro: "omega3",
    what:
      "Reduce triglicéridos y modula la inflamación; la evidencia también apunta a mejor recuperación articular y un aporte modesto a la síntesis proteica muscular.",
    dose: "1–2 g diarios sumando EPA + DHA.",
    sources: "Sardina, salmón, atún. La chía y la linaza aportan ALA, que el cuerpo convierte con muy poca eficiencia.",
    yours: "88 % del valor diario hoy gracias a las sardinas. Con dos latas por semana lo tienes cubierto.",
  },
  {
    id: "r-vitd",
    name: "Vitamina D3",
    evidence: "fuerte",
    micro: "vit_d",
    what:
      "Regula la absorción de calcio y sostiene hueso, función muscular e inmunidad. El déficit es sorprendentemente común incluso en países soleados, porque vivimos en interiores.",
    dose: "1 000–2 000 UI diarias de mantenimiento. Dosis mayores solo con analítica de 25-OH-D.",
    sources: "Sol directo sobre la piel, pescado graso y yema de huevo.",
    caution: "Es liposoluble y se acumula: no la subas a ciegas.",
    yours:
      "Hoy cubriste 35 % vía sardinas. En Quito el índice UV es alto todo el año — 15–20 min de sol al mediodía te rinden más que cualquier cápsula.",
  },
  {
    id: "r-cafeina",
    name: "Cafeína",
    evidence: "fuerte",
    what:
      "Junto con la creatina es el ergogénico mejor documentado: más fuerza y resistencia, y sobre todo menor percepción del esfuerzo, que es lo que te deja completar la serie.",
    dose: "3–6 mg por kg unos 30–60 min antes de entrenar: 250–500 mg para ti.",
    caution:
      "Su vida media ronda las 5 h. Después de las 15:00 te come el sueño, y el sueño es donde realmente se recupera el músculo.",
    sources: "Café, té, o cápsulas si quieres dosificar exacto.",
  },
  {
    id: "r-fibra",
    name: "Fibra",
    evidence: "fuerte",
    what:
      "De lo más consistente en epidemiología nutricional: ingestas de 25–30 g diarios se asocian a menor riesgo cardiovascular y metabólico. Además sacia, que en déficit vale oro.",
    dose: "25–35 g al día.",
    sources: "Legumbre, avena, fruta con cáscara, verdura, frutos secos.",
    yours: "Hoy sumaste ~24 g. Estás casi en el rango, sostenlo.",
  },
  {
    id: "r-magnesio",
    name: "Magnesio",
    evidence: "moderada",
    micro: "magnesium",
    what:
      "Cofactor de más de 300 reacciones enzimáticas: contracción muscular, metabolismo energético y calidad del sueño. La ingesta media de la población suele quedar por debajo de la recomendación.",
    dose: "200–400 mg al día. El glicinato y el citrato se absorben bastante mejor que el óxido.",
    sources: "Almendra, espinaca, cacao puro, legumbre y aguacate.",
    yours: "45 % del valor diario hoy — uno de tus dos huecos junto al potasio.",
  },
  {
    id: "r-potasio",
    name: "Potasio",
    evidence: "moderada",
    micro: "potassium",
    what:
      "Contrapesa al sodio en la regulación de la presión arterial y participa en la contracción muscular. Casi nadie alcanza los 4 700 mg recomendados.",
    dose: "4 700 mg al día, idealmente desde comida.",
    sources: "Plátano, papa con cáscara, aguacate, fréjol y agua de coco — todo barato y local.",
    yours: "19 % hoy: es tu mayor hueco, y encima el día vino cargado de sodio (2 450 mg).",
  },
  {
    id: "r-betaalanina",
    name: "Beta-alanina",
    evidence: "moderada",
    what:
      "Eleva la carnosina muscular, que tampona la acidez. El beneficio es real pero acotado: esfuerzos de 1 a 4 minutos — series largas, intervalos, fallo muscular.",
    dose: "3–6 g diarios repartidos; el efecto aparece tras semanas de acumulación.",
    sources: "Carne y pescado en cantidades pequeñas; el efecto requiere suplemento.",
    caution: "Puede dar hormigueo pasajero en cara y manos. Es inofensivo.",
  },
  {
    id: "r-probioticos",
    name: "Probióticos (kéfir)",
    evidence: "moderada",
    what:
      "La evidencia es sólida para cepas concretas en indicaciones concretas, no para el genérico 'probiótico'. Los fermentados enteros como el kéfir tienen mejor respaldo que la mayoría de cápsulas.",
    dose: "Un vaso diario de kéfir o yogur con cultivos vivos.",
    sources: "Kéfir, yogur natural, chucrut, kimchi.",
    yours: "Ya lo estás haciendo con el kéfir deslactosado.",
  },
  {
    id: "r-hierro",
    name: "Hierro",
    evidence: "condicional",
    micro: "iron",
    what:
      "Transporta el oxígeno en sangre: con déficit aparece fatiga y cae el rendimiento. Pero suplementar sin déficit no aporta nada y el exceso sí hace daño.",
    dose: "Solo si la ferritina y el hemograma salen bajos, y con indicación médica.",
    sources: "Carne roja magra, lenteja, espinaca. Acompáñalo de vitamina C (tu kiwi o mandarina) y la absorción se multiplica.",
    caution: "El hierro se acumula y en exceso es hepatotóxico. Nunca a ciegas.",
    yours:
      "44 % hoy. Además vives a 2 850 m: a esa altura la demanda de hierro para fabricar hemoglobina es mayor que a nivel del mar.",
  },
  {
    id: "r-zinc",
    name: "Zinc",
    evidence: "condicional",
    micro: "zinc",
    what:
      "Interviene en inmunidad, cicatrización, síntesis proteica y producción de testosterona — pero corrige solo si partías de un déficit. En gente con niveles normales no sube nada.",
    dose: "8–11 mg al día desde la dieta. Suplementos por debajo de 25 mg y no de forma crónica.",
    sources: "Ostras, carne, semilla de calabaza y garbanzo.",
    caution: "El exceso sostenido desplaza al cobre y puede provocar su déficit.",
  },
  {
    id: "r-vitc",
    name: "Vitamina C",
    evidence: "condicional",
    micro: "vit_c",
    what:
      "Antioxidante, necesaria para el colágeno y potenciadora de la absorción del hierro vegetal. Lo interesante: las megadosis alrededor del entrenamiento podrían embotar parte de la adaptación al ejercicio, porque el estrés oxidativo es parte de la señal.",
    dose: "90 mg al día. Desde comida, sin cápsulas.",
    sources: "Kiwi, mandarina, guayaba, pimiento, brócoli.",
    yours: "210 % hoy solo con fruta. No necesitas suplementarla, y no conviene.",
  },

  // ---- lo que todavía no aparece en tu registro ----------------------------
  // Nutrientes con respaldo científico que ninguna comida registrada cubre (o
  // cubre a medias). Son los huecos reales, no los que ya llevas bien.
  {
    id: "r-calcio",
    name: "Calcio",
    evidence: "fuerte",
    micro: "calcium",
    what:
      "Estructura del hueso y contracción muscular. En hombres que entrenan fuerza importa por la carga sobre el esqueleto: la densidad ósea responde al estímulo solo si hay material con qué construirla. No trabaja solo — necesita vitamina D para absorberse y K2 para depositarse donde toca.",
    dose: "1 000–1 300 mg al día, repartidos: el intestino absorbe mal más de ~500 mg de golpe.",
    sources: "Lácteos y kéfir, sardina con espina (la tuya ya cuenta), almendra, brócoli, tofu.",
    yours:
      "131 % del valor diario — no es un hueco tuyo. Lo cubren las sardinas con espina, el kéfir y los batidos. El detalle a vigilar es que sin vitamina D y K2 suficientes, ese calcio se aprovecha peor.",
  },
  {
    id: "r-vita",
    name: "Vitamina A",
    evidence: "moderada",
    micro: "vit_a",
    what:
      "Visión nocturna, renovación de la piel y epitelios, y respuesta inmune. El betacaroteno de las plantas es la vía segura: el cuerpo convierte solo lo que necesita.",
    dose: "900 µg de equivalentes de retinol al día.",
    sources: "Zanahoria, camote, zapallo, espinaca, hígado y yema de huevo.",
    caution:
      "El retinol preformado (hígado, cápsulas de vitamina A) sí se acumula y en exceso es tóxico. El betacaroteno no.",
    yours:
      "Apenas aparece en tu registro. Un camote o una taza de zanahoria al día lo resuelve sin pensar en suplementos.",
  },
  {
    id: "r-vite",
    name: "Vitamina E",
    evidence: "moderada",
    micro: "vit_e",
    what:
      "Antioxidante liposoluble que protege las membranas celulares de la oxidación. Su papel es preventivo y de fondo; no vas a notarlo en una sesión de gimnasio.",
    dose: "15 mg al día.",
    sources: "Almendra (un puñado ya cubre la mitad), semilla de girasol, aceite de oliva, aguacate, palta.",
    caution:
      "Los ensayos con dosis altas en cápsula no mostraron beneficio y algunos apuntaron a más riesgo. Desde comida, siempre.",
    yours: "Cero en tu registro. Un puñado de almendras al día la cubre y de paso te suma magnesio.",
  },
  {
    id: "r-complejob",
    name: "Vitaminas del grupo B (B1, B2, B3, B6)",
    evidence: "moderada",
    micro: "b6",
    what:
      "Son las coenzimas que convierten la comida en energía utilizable. No dan energía por sí mismas — esa es la promesa de marketing —, pero un déficit sí frena el metabolismo y aparece como fatiga.",
    dose: "B1 1,2 mg · B2 1,3 mg · B3 16 mg · B6 1,7 mg al día. Una dieta variada las cubre sin esfuerzo.",
    sources: "Cereal integral, legumbre, huevo, carne, lácteo, frutos secos y plátano.",
    caution: "La B6 en dosis altas y sostenidas (>100 mg/día) puede causar neuropatía. Es la única del grupo que preocupa.",
    yours:
      "No aparecen en tu registro, casi seguro porque no se anotaron y no porque falten: tu día ya trae huevo, lácteo, pescado y fruta.",
  },
  {
    id: "r-folato",
    name: "Folato (B9)",
    evidence: "fuerte",
    micro: "b9",
    what:
      "Síntesis de ADN y división celular — todo tejido que se renueva depende de él, incluido el músculo. Junto con B12 mantiene bajos los niveles de homocisteína.",
    dose: "400 µg al día.",
    sources: "Legumbre, espinaca, espárrago, aguacate, brócoli y cítricos.",
    yours: "15 % hoy. Una taza de lenteja o de espinaca al día lo endereza.",
  },
  {
    id: "r-b12",
    name: "Vitamina B12",
    evidence: "fuerte",
    micro: "b12",
    what:
      "Formación de glóbulos rojos y mantenimiento del sistema nervioso. Solo está en alimento animal, y su déficit tarda años en manifestarse pero deja daño neurológico que puede no revertir.",
    dose: "2,4 µg al día. Suplementar solo si eres vegetariano estricto, tomas metformina o tienes más de 60 años.",
    sources: "Sardina, carne, huevo, lácteo. Tu lata de sardinas sola ya multiplica la recomendación.",
    yours: "Muy por encima del valor diario. Este no es un hueco tuyo: mantenlo así.",
  },
  {
    id: "r-selenio",
    name: "Selenio",
    evidence: "moderada",
    micro: "selenium",
    what:
      "Cofactor de las enzimas antioxidantes y de la conversión de hormona tiroidea. El margen entre lo suficiente y lo excesivo es estrecho comparado con otros minerales.",
    dose: "55 µg al día. Dos nueces de Brasil ya lo cubren de sobra.",
    sources: "Nuez de Brasil, pescado, huevo y marisco.",
    caution: "Por encima de 400 µg diarios es tóxico. Con nueces de Brasil, dos al día es el techo sensato.",
    yours: "Bien cubierto por las sardinas. No lo suplementes.",
  },
  {
    id: "r-yodo",
    name: "Yodo",
    evidence: "fuerte",
    what:
      "Materia prima de la hormona tiroidea, que fija tu tasa metabólica basal. Sin yodo suficiente, la tiroides baja el ritmo y con ella el gasto energético diario.",
    dose: "150 µg al día.",
    sources: "Sal yodada, pescado de mar, lácteo y algas.",
    caution: "El exceso también altera la tiroides — las algas en cantidad pueden pasarse fácil de 1 000 µg.",
    yours:
      "No lo estás midiendo. En Ecuador la sal está yodada por ley desde los 90, así que lo más probable es que estés cubierto; solo tenlo presente si algún día bajas mucho la sal.",
  },
  {
    id: "r-colina",
    name: "Colina",
    evidence: "moderada",
    what:
      "Nutriente esencial reconocido apenas en 1998 y por eso poco conocido: forma las membranas celulares y la acetilcolina, el neurotransmisor de la contracción muscular y la memoria. Los estudios de población muestran que la enorme mayoría no llega a la recomendación.",
    dose: "550 mg al día para un hombre adulto.",
    sources: "Yema de huevo (dos yemas ≈ 300 mg), hígado, soya, quinua y salmón.",
    yours:
      "No aparece en tu registro y probablemente sea tu hueco más silencioso. Dos huevos enteros al día resuelven más de la mitad.",
  },
  {
    id: "r-k2",
    name: "Vitamina K2",
    evidence: "moderada",
    what:
      "La K1 de la hoja verde sirve para coagular; la K2 activa las proteínas que llevan el calcio al hueso y lo mantienen fuera de la pared arterial. Es la pieza que suele faltar cuando alguien suplementa calcio y vitamina D sin más.",
    dose: "90–120 µg al día entre K1 y K2.",
    sources: "Natto, quesos curados y fermentados, yema de huevo, mantequilla de pasto.",
    caution: "Si tomas anticoagulantes tipo warfarina, cualquier cambio en vitamina K se consulta con tu médico primero.",
    yours: "Tu vitamina K registrada viene del kiwi, que es K1. La K2 sigue sin aparecer: el queso curado es la vía más simple.",
  },
  {
    id: "r-nitratos",
    name: "Nitratos dietéticos (remolacha)",
    evidence: "condicional",
    what:
      "El nitrato de la remolacha se convierte en óxido nítrico, que dilata el vaso sanguíneo y mejora la eficiencia del músculo. El efecto sobre resistencia está bien documentado; sobre fuerza pura es discreto y más útil en series largas.",
    dose: "300–600 mg de nitrato (≈ 500 ml de jugo de remolacha) unas 2–3 h antes de entrenar.",
    sources: "Remolacha, rúcula, espinaca y apio.",
    caution: "Tiñe la orina de rojo. Es inofensivo, pero conviene saberlo antes de asustarse.",
    yours:
      "Vives a 2 850 m, donde hay menos oxígeno disponible: es justo el escenario donde esta vía tiene más sentido. Barato de probar dos semanas y ver si notas algo.",
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
