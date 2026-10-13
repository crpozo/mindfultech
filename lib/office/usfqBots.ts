/**
 * The USFQ office: the Commercial & Development vice-presidency from the 2026
 * organisation chart as AI agents (Alexandra Velasco and her eight directors).
 * Alejandro Andrade (USFQ NEXT) presents the donations dashboard. Same shape as lib/office/bots.ts; the copy is Spanish
 * with an English overlay.
 */
import type { Lang } from "./i18n";
import type { Bot, Look } from "./bots";

type Txt = { es: string; en: string };
const T = (es: string, en: string): Txt => ({ es, en });

type Seed = {
  id: string;
  name: string;
  role: Txt;
  title: Txt;
  color: string;
  accent: string;
  look: Look;
  screen: Bot["screen"];
  lead?: boolean;
  seat?: number;
  working: Txt[];
  kpis: { label: Txt; value: string }[];
  replies: [string[], Txt][];
  quick: Txt[];
};

const DARK = "#1e1e24";
const RED = "#e11b22";

// desk order: 0–5 open workspace, 6–7 hall, 8–9 studio, 10 reception, 11 studio (the dashboard desk)
const SEEDS: Seed[] = [
  {
    id: "borja", name: "Martín Borja", role: T("Dirección Comercial", "Commercial Office"), title: T("Director · agente comercial", "Director · commercial agent"),
    color: "#d6e6ff", accent: "#3f7fc2", seat: 0,
    look: { skin: "#e7b48f", hair: "#2a1a14", hairStyle: "short", eyes: "brown", shirt: "#f7f7f8", shirtStyle: "collar", sleeves: "long", jacket: "#1e1e24", pants: "#1e1e24", shoes: "#111114", shoeStyle: "flats" },
    screen: "sales",
    working: [T("Siguiendo las matrículas del próximo semestre", "Following next semester's enrolments"), T("Revisando el pipeline de admisiones por colegio", "Reviewing the admissions pipeline by college"), T("Preparando la campaña de pregrado", "Preparing the undergraduate campaign")],
    kpis: [{ label: T("Aspirantes activos", "Active applicants"), value: "1,240" }, { label: T("Conversión", "Conversion"), value: "34%" }, { label: T("Meta del semestre", "Semester target"), value: "92%" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Sigo 1.240 aspirantes activos por colegio y la conversión va en 34%; con Admisiones y Becas ajustamos la campaña de pregrado de la próxima semana.", "I am tracking 1,240 active applicants by college; conversion is at 34%, and with Admissions and Financial Aid we are adjusting next week's undergraduate campaign.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente de la Dirección Comercial: matrículas, campañas y el embudo de admisión.", "Hello, I am the Commercial Office's agent: enrolments, campaigns and the admissions funnel.")],
      [[], T("Lo reviso con Admisiones y te paso la cifra actualizada.", "I will check it with Admissions and send you the updated figure.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Cómo va la matrícula?", "How are enrolments going?")],
  },
  {
    id: "guerrero", name: "Yuvinne Guerrero", role: T("Asistencia Financiera y Becas", "Financial Aid & Scholarships"), title: T("Director · agente de becas", "Director · scholarships agent"),
    color: "#d9c6f2", accent: "#7a5ab8", seat: 1,
    look: { skin: "#d9a98a", hair: "#1a1412", hairStyle: "short", eyes: "dark", shirt: "#cfe3f5", shirtStyle: "collar", sleeves: "long", pants: "#1d3557", shoes: "#5a3a28", shoeStyle: "flats", glasses: true },
    screen: "finance",
    working: [T("Evaluando solicitudes de beca", "Assessing scholarship applications"), T("Conciliando el fondo Waters-Freire", "Reconciling the Waters-Freire fund"), T("Respondiendo a familias sobre financiamiento", "Answering families about financing")],
    kpis: [{ label: T("Solicitudes en revisión", "Applications under review"), value: "318" }, { label: T("Becas otorgadas 2026", "Scholarships granted 2026"), value: "742" }, { label: T("Fondos donados a becas", "Donated scholarship funds"), value: "$201k" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Evalúo 318 solicitudes de beca y concilio el fondo Waters-Freire, que USFQ NEXT alimenta con donaciones: $197.277 acumulados.", "I am assessing 318 scholarship applications and reconciling the Waters-Freire fund, which USFQ NEXT feeds with donations: $197,277 to date.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente de Asistencia Financiera y Becas. Solicitudes, fondos y planes de pago.", "Hello, I am the Financial Aid & Scholarships agent. Applications, funds and payment plans.")],
      [[], T("Lo registro y te confirmo con el comité de becas.", "I will log it and confirm with the scholarships committee.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Cuántas becas hay este año?", "How many scholarships this year?")],
  },
  {
    id: "calderon", name: "Cristina Calderón", role: T("Comunicación", "Communications"), title: T("Coordinadora · agente de comunicación", "Coordinator · communications agent"),
    color: "#ffd0d6", accent: "#d64c6a", seat: 2,
    look: { skin: "#f6dcc6", hair: "#141010", hairStyle: "bob", eyes: "brown", lips: "#b8544f", shirt: "#1f1f24", shirtStyle: "tee", sleeves: "short", pants: "#f1efe9", shoes: "#111114", shoeStyle: "boots" },
    screen: "social",
    working: [T("Programando la semana en redes de USFQ", "Scheduling USFQ's week on social media"), T("Preparando la nota de prensa del convenio", "Preparing the agreement's press release"), T("Midiendo el alcance de la campaña de admisiones", "Measuring the admissions campaign reach")],
    kpis: [{ label: T("Alcance semanal", "Weekly reach"), value: "1.2M" }, { label: T("Publicaciones", "Posts"), value: "46" }, { label: T("Notas de prensa", "Press releases"), value: "5" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Estoy programando 46 publicaciones de la semana y preparando la nota de prensa del nuevo convenio internacional; la campaña de admisiones lleva 1,2 millones de alcance.", "I am scheduling the week's 46 posts and preparing the press release for the new international agreement; the admissions campaign has reached 1.2 million people.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente de Comunicación de USFQ. Redes, prensa y campañas.", "Hello, I am USFQ's Communications agent. Social media, press and campaigns.")],
      [[], T("Lo tomo en cuenta para el calendario editorial.", "I will add it to the editorial calendar.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Cómo va la campaña?", "How is the campaign going?")],
  },
  {
    id: "gabela", name: "Diego Gabela", role: T("Educación Continua", "Continuing Education"), title: T("Director · agente de educación continua", "Director · continuing education agent"),
    color: "#c9e8b2", accent: "#4f9a3e", seat: 3,
    look: { skin: "#f1c9a5", hair: "#3b2a22", hairStyle: "swept", eyes: "hazel", shirt: "#3b6fd6", shirtStyle: "collar", sleeves: "long", pants: "#2b2d3a", shoes: "#26262c", shoeStyle: "flats", lanyard: RED },
    screen: "support",
    working: [T("Atendiendo consultas de cursos y diplomados", "Answering course and diploma enquiries"), T("Abriendo la cohorte de octubre", "Opening the October cohort"), T("Coordinando docentes para el programa ejecutivo", "Coordinating faculty for the executive program")],
    kpis: [{ label: T("Programas abiertos", "Open programs"), value: "46" }, { label: T("Inscritos este mes", "Enrolled this month"), value: "612" }, { label: T("Satisfacción", "Satisfaction"), value: "4.6 / 5" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Respondo consultas de 46 programas abiertos y abro la cohorte de octubre; van 612 inscritos este mes.", "I am answering enquiries about 46 open programs and opening the October cohort; 612 enrolled this month.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente de Educación Continua: cursos, diplomados y programas ejecutivos.", "Hello, I am the Continuing Education agent: courses, diplomas and executive programs.")],
      [[], T("Te paso la ficha del programa y las fechas de inicio.", "I will send you the program sheet and start dates.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Qué programas abren pronto?", "Which programs open soon?")],
  },
  {
    id: "merino", name: "Isabel Merino", role: T("IDEA", "IDEA"), title: T("Directora · agente de emprendimiento e innovación", "Director · entrepreneurship & innovation agent"),
    color: "#f4d98a", accent: "#e0a83a", seat: 4,
    look: { skin: "#f6dcc6", hair: "#c9a25a", hairStyle: "bun", eyes: "blue", lips: "#c9605a", shirt: "#f7f7f8", shirtStyle: "tee", sleeves: "short", pants: "#1f1f24", shoes: "#f1f1f1", shoeStyle: "sneakers" },
    screen: "sales",
    working: [T("Revisando el pipeline de startups de Nest.Lab", "Reviewing Nest.Lab's startup pipeline"), T("Preparando el demo day", "Preparing the demo day"), T("Conectando emprendedores con mentores", "Connecting founders with mentors")],
    kpis: [{ label: T("Startups incubadas", "Startups incubated"), value: "27" }, { label: T("Mentores activos", "Active mentors"), value: "58" }, { label: T("Capital levantado", "Capital raised"), value: "$1.4M" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Reviso el pipeline de 27 startups de Nest.Lab y preparo el demo day con 58 mentores; las que mejor avanzan levantaron $1,4M en conjunto.", "I am reviewing Nest.Lab's pipeline of 27 startups and preparing the demo day with 58 mentors; the best-performing ones raised $1.4M together.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente de IDEA: emprendimiento, incubación e innovación.", "Hello, I am IDEA's agent: entrepreneurship, incubation and innovation.")],
      [[], T("Lo agendo con el equipo de IDEA y te aviso.", "I will schedule it with the IDEA team and let you know.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Cómo van las startups?", "How are the startups doing?")],
  },
  {
    id: "guerra", name: "Kiara Guerra", role: T("Programas Internacionales", "International Programs"), title: T("Directora · agente de programas internacionales", "Director · international programs agent"),
    color: "#a9dcd3", accent: "#2f8f80", seat: 5,
    look: { skin: "#efc3a4", hair: "#3b2418", hairStyle: "ponytail", eyes: "hazel", lips: "#c0443f", shirt: "#3d4a7a", shirtStyle: "blouse", sleeves: "long", pants: "#1f1f24", shoes: "#111114", shoeStyle: "flats" },
    screen: "ops",
    working: [T("Confirmando intercambios del próximo semestre", "Confirming next semester's exchanges"), T("Respondiendo a estudiantes internacionales por WhatsApp", "Answering international students on WhatsApp"), T("Renovando convenios con universidades socias", "Renewing agreements with partner universities")],
    kpis: [{ label: T("Convenios activos", "Active agreements"), value: "200+" }, { label: T("Estudiantes de intercambio", "Exchange students"), value: "386" }, { label: T("Países", "Countries"), value: "32" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Confirmo 386 intercambios del próximo semestre con más de 200 universidades socias en 32 países, y respondo a los estudiantes por WhatsApp.", "I am confirming 386 exchanges for next semester with 200+ partner universities in 32 countries, and answering students on WhatsApp.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente de Programas Internacionales: intercambios, convenios y estudiantes visitantes.", "Hello, I am the International Programs agent: exchanges, agreements and visiting students.")],
      [[], T("Lo reviso con la universidad socia y te confirmo.", "I will check it with the partner university and confirm.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Cuántos intercambios hay?", "How many exchanges are there?")],
  },
  {
    id: "velasco", name: "Alexandra Velasco", role: T("VP Comercial y Desarrollo", "Commercial & Development VP"), title: T("Agente de desarrollo institucional", "Institutional development agent"),
    color: "#f7c4b6", accent: RED, lead: true, seat: 8,
    look: { skin: "#f3cdb0", hair: "#d9b46a", hairStyle: "long", eyes: "blue", lips: "#c0443f", shirt: "#f7f7f8", shirtStyle: "blouse", sleeves: "long", jacket: DARK, pants: DARK, shoes: "#111114", shoeStyle: "heels" },
    screen: "sales",
    working: [T("En llamada con un aliado corporativo", "On a call with a corporate ally"), T("Siguiendo a los aliados corporativos del trimestre", "Following up on this quarter's corporate allies"), T("Preparando la propuesta para una fundación internacional", "Preparing a proposal for an international foundation"), T("Revisando el pipeline de convenios", "Reviewing the agreements pipeline")],
    kpis: [{ label: T("Convenios activos", "Active agreements"), value: "200+" }, { label: T("Aliados nuevos 2026", "New allies 2026"), value: "14" }, { label: T("Reuniones esta semana", "Meetings this week"), value: "9" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Estoy dando seguimiento a cuatro aliados corporativos y preparando la propuesta para una fundación que quiere financiar becas; USFQ NEXT me pasa los proyectos con mayor potencial.", "I am following up on four corporate allies and preparing a proposal for a foundation that wants to fund scholarships; USFQ NEXT hands me the projects with the most potential.")],
      [["donac", "next", "fondos", "donor"], T("Las donaciones las lleva Alejandro Andrade en USFQ NEXT; yo trabajo la relación con empresas y fundaciones. Pregúntale a él por los montos, a mí por los aliados.", "Donations are run by Alejandro Andrade at USFQ NEXT; I work the relationship with companies and foundations. Ask him for the amounts, me for the allies.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente de la Vicepresidencia Comercial y de Desarrollo: admisiones, comunicación, educación continua, programas internacionales, IDEA y USFQ NEXT.", "Hello, I am the Commercial & Development Vice-presidency's agent: admissions, communications, continuing education, international programs, IDEA and USFQ NEXT.")],
      [[], T("Perfecto, lo agendo y te confirmo con la dirección correspondiente.", "Perfect, I will schedule it and confirm with the relevant office.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Qué aliados tenemos?", "Which allies do we have?")],
  },
  {
    id: "pons", name: "Michelle Pons", role: T("Admisiones", "Admissions"), title: T("Directora · agente de admisiones", "Director · admissions agent"),
    color: "#ffe3c2", accent: "#e08a3c", seat: 9,
    look: { skin: "#f6dcc6", hair: "#c9a25a", hairStyle: "bun", eyes: "blue", lips: "#c9605a", shirt: "#f7f7f8", shirtStyle: "blouse", sleeves: "long", jacket: "#3a3a44", pants: "#1e1e24", skirt: true, shoes: "#111114", shoeStyle: "heels" },
    screen: "ops",
    working: [T("Recibiendo a familias en campus", "Welcoming families on campus"), T("Confirmando entrevistas de admisión", "Confirming admission interviews"), T("Respondiendo aspirantes por WhatsApp", "Answering applicants on WhatsApp")],
    kpis: [{ label: T("Aspirantes hoy", "Applicants today"), value: "63" }, { label: T("Entrevistas", "Interviews"), value: "12" }, { label: T("Tiempo de respuesta", "Response time"), value: "4 min" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Recibo a las familias que llegan a campus, confirmo las 12 entrevistas de admisión de hoy y respondo a 63 aspirantes por WhatsApp.", "I welcome the families arriving on campus, confirm today's 12 admission interviews and answer 63 applicants on WhatsApp.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente de Admisiones: aspirantes, requisitos y fechas de ingreso.", "Hello, I am the Admissions agent: applicants, requirements and intake dates.")],
      [[], T("Claro, te anuncio y te acompaño.", "Of course, I will announce you and show you the way.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Cuántas entrevistas hay hoy?", "How many interviews are there today?")],
  },
  {
    id: "andrade", name: "Alejandro Andrade", role: T("USFQ NEXT", "USFQ NEXT"), title: T("Director · agente de donaciones y filantropía", "Director · donations & philanthropy agent"),
    color: "#ffd0d6", accent: RED, seat: 11,
    look: { skin: "#e7b48f", hair: "#2a1a12", hairStyle: "swept", eyes: "brown", shirt: "#f7f7f8", shirtStyle: "collar", sleeves: "long", jacket: DARK, pants: DARK, shoes: "#111114", shoeStyle: "flats", lanyard: RED },
    screen: "next",
    working: [T("Actualizando el tablero de donaciones", "Updating the donations dashboard"), T("Clasificando donantes por vertical", "Classifying donors by vertical"), T("Preparando el reporte de fin de año para donantes", "Preparing the year-end donor report"), T("Cruzando proyectos de vinculación con donantes potenciales", "Matching engagement projects with potential donors")],
    kpis: [{ label: T("Recaudado 2024–2026", "Raised 2024–2026"), value: "$1.09M" }, { label: T("Donantes", "Donors"), value: "137" }, { label: T("Verticales", "Verticals"), value: "6" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Estoy actualizando el tablero de USFQ NEXT: $1.086.054 recaudados de 137 donantes entre septiembre de 2024 y agosto de 2026, clasificados en las seis verticales. Ábrelo desde Dashboards o en mi pantalla.", "I am updating the USFQ NEXT dashboard: $1,086,054 raised from 137 donors between September 2024 and August 2026, classified into the six verticals. Open it from Dashboards or on my screen.")],
      [["vertical", "paraguas", "area", "área"], T("Las seis verticales son Academic Excellence & Research, Art, Culture & Community, Sustainability & Environment, Health & Wellbeing, Business, Society & Innovation y Social Initiatives. Sostenibilidad lidera por el convenio Tandayapa-LCAOF ($496.100).", "The six verticals are Academic Excellence & Research, Art, Culture & Community, Sustainability & Environment, Health & Wellbeing, Business, Society & Innovation and Social Initiatives. Sustainability leads thanks to the Tandayapa-LCAOF agreement ($496,100).")],
      [["donante", "donor", "mayor", "top", "quien"], T("Los mayores donantes: Liz Claiborne Art Ortenberg Foundation ($496.100), Wilma Freire ($180.000, fondo Waters-Freire), Worldwide Veterinary Service ($69.276), DYVENPRO ($58.800) y Synopsys Chile ($56.100). 49 empresas aportan el 81% y 88 personas el 19%.", "Top donors: Liz Claiborne Art Ortenberg Foundation ($496,100), Wilma Freire ($180,000, Waters-Freire fund), Worldwide Veterinary Service ($69,276), DYVENPRO ($58,800) and Synopsys Chile ($56,100). 49 organisations give 81% and 88 individuals 19%.")],
      [["vinculac", "proyecto", "potencial", "project"], T("Hay 53 proyectos de vinculación 2026 con potencial de recibir donaciones; 36 con impacto alto. Los de Cumbayá son la mayoría; Tiputini, Tandayapa, Galápagos y zonas rurales completan el mapa.", "There are 53 engagement projects in 2026 with donation potential; 36 with high impact. Most are in Cumbayá; Tiputini, Tandayapa, Galápagos and rural areas complete the map.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy Alejandro, el agente de USFQ NEXT. Llevo el tablero de donaciones por vertical, donantes y proyectos. Pregúntame lo que quieras sobre los fondos.", "Hello, I am Alejandro, the USFQ NEXT agent. I run the donations dashboard by vertical, donors and projects. Ask me anything about the funds.")],
      [[], T("Lo anoto. Si es sobre montos o donantes, el tablero tiene la respuesta exacta; lo abro contigo cuando quieras.", "Noted. If it is about amounts or donors, the dashboard has the exact answer; I can open it with you whenever you like.")],
    ],
    quick: [T("¿Cuánto hemos recaudado?", "How much have we raised?"), T("¿Qué vertical recibe más?", "Which vertical receives the most?"), T("¿Quiénes son los mayores donantes?", "Who are the biggest donors?")],
  },
];

/** The agents of the USFQ office, localized. */
export function usfqBotsFor(lang: Lang): Bot[] {
  const L = (x: Txt) => x[lang];
  return SEEDS.map((b) => ({
    id: b.id,
    name: b.name,
    role: L(b.role),
    title: L(b.title),
    color: b.color,
    accent: b.accent,
    look: b.look,
    screen: b.screen,
    lead: b.lead,
    seat: b.seat,
    working: b.working.map(L),
    kpis: b.kpis.map((k) => ({ label: L(k.label), value: k.value })),
    replies: b.replies.map(([k, r]) => [k, L(r)] as [string[], string]),
    quick: b.quick.map(L),
  }));
}
