/**
 * The USFQ office: the university's leadership from the 2026 organisation
 * chart as AI agents, one per desk. Alejandro Andrade (USFQ NEXT) presents the
 * donations dashboard. Same shape as lib/office/bots.ts; the copy is Spanish
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
    id: "zambrano", name: "César Zambrano", role: T("VP Académico", "Academic VP"), title: T("Vicerrector · agente académico", "Vice-rector · academic agent"),
    color: "#f4d98a", accent: "#e0a83a",
    look: { skin: "#e7b48f", hair: "#4a3a30", hairStyle: "short", eyes: "brown", shirt: "#f7f7f8", shirtStyle: "collar", sleeves: "long", jacket: DARK, pants: DARK, shoes: "#111114", shoeStyle: "flats", tie: "#7a1f24" },
    screen: "finance",
    working: [T("Revisando la carga académica del semestre", "Reviewing the semester's teaching load"), T("Consolidando indicadores de los colegios", "Consolidating the colleges' indicators"), T("Preparando el comité académico", "Preparing the academic committee")],
    kpis: [{ label: T("Colegios", "Colleges"), value: "11" }, { label: T("Programas activos", "Active programs"), value: "148" }, { label: T("Estudiantes", "Students"), value: "10,000+" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Estoy consolidando los indicadores académicos de los once colegios para el comité de mañana: carga docente, retención y resultados por programa.", "I am consolidating the academic indicators of the eleven colleges for tomorrow's committee: teaching load, retention and results per program.")],
      [["resumen", "hoy", "summary", "today"], T("Hoy: 148 programas activos, retención del 91% en primer año y 12 nuevas contrataciones docentes en revisión.", "Today: 148 active programs, 91% first-year retention and 12 new faculty hires under review.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente del Vicerrectorado Académico. Sigo programas, colegios y decanatos. ¿Qué necesitas?", "Hello, I am the Academic Vice-rectorate's agent. I track programs, colleges and deaneries. What do you need?")],
      [[], T("Anotado. Lo coordino con el decanato correspondiente y te confirmo.", "Noted. I will coordinate it with the relevant deanery and confirm.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("Dame un resumen de hoy", "Give me today's summary")],
  },
  {
    id: "mena", name: "Carlos Mena", role: T("VP Investigación", "Research VP"), title: T("Decano de Investigación · agente de investigación", "Dean of Research · research agent"),
    color: "#b9d7f2", accent: "#3f7fc2",
    look: { skin: "#d9a98a", hair: "#1a1412", hairStyle: "short", eyes: "dark", shirt: "#cfe3f5", shirtStyle: "collar", sleeves: "long", jacket: "#2a2d3a", pants: "#2a2d3a", shoes: "#26262c", shoeStyle: "flats", beard: true },
    screen: "dev",
    working: [T("Cruzando datos de las estaciones Galápagos y Tiputini", "Cross-checking data from the Galápagos and Tiputini stations"), T("Revisando convocatorias de fondos de investigación", "Reviewing research grant calls"), T("Actualizando el repositorio de publicaciones", "Updating the publications repository")],
    kpis: [{ label: T("Publicaciones 2026", "Publications 2026"), value: "412" }, { label: T("Proyectos vigentes", "Active projects"), value: "86" }, { label: T("Estaciones", "Stations"), value: "4" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Estoy cruzando los datos de monitoreo de Tiputini y el Galapagos Science Center para el reporte anual, y revisando tres convocatorias que cierran este mes.", "I am cross-checking monitoring data from Tiputini and the Galapagos Science Center for the annual report, and reviewing three grant calls closing this month.")],
      [["estaci", "galapagos", "tiputini", "tandayapa"], T("Las cuatro estaciones (Galápagos, Tiputini, Tandayapa y la sede Galápagos) reportan 7.300 contribuciones científicas acumuladas; Tandayapa recibió la donación más grande del periodo.", "The four stations (Galápagos, Tiputini, Tandayapa and the Galápagos campus) account for 7,300 scientific contributions; Tandayapa received the largest donation of the period.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente del Decanato de Investigación. Estaciones, institutos, publicaciones y fondos: pregúntame.", "Hello, I am the Research Deanery's agent. Stations, institutes, publications and funding: ask me.")],
      [[], T("Lo reviso con el instituto a cargo y te traigo la cifra.", "I will check it with the institute in charge and bring you the figure.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Cómo van las estaciones?", "How are the stations doing?")],
  },
  {
    id: "velasco", name: "Alexandra Velasco", role: T("VP Comercial y Desarrollo", "Commercial & Development VP"), title: T("Agente de desarrollo institucional", "Institutional development agent"),
    color: "#f7c4b6", accent: RED,
    look: { skin: "#f3cdb0", hair: "#d9b46a", hairStyle: "long", eyes: "blue", lips: "#c0443f", shirt: "#f7f7f8", shirtStyle: "blouse", sleeves: "long", jacket: DARK, pants: DARK, shoes: "#111114", shoeStyle: "heels" },
    screen: "sales",
    working: [T("Siguiendo a los aliados corporativos del trimestre", "Following up on this quarter's corporate allies"), T("Preparando la propuesta para una fundación internacional", "Preparing a proposal for an international foundation"), T("Revisando el pipeline de convenios", "Reviewing the agreements pipeline")],
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
    id: "cepeda", name: "Mauricio Cepeda", role: T("VP Administrativo", "Administrative VP"), title: T("Agente administrativo", "Administrative agent"),
    color: "#d9c6f2", accent: "#7a5ab8",
    look: { skin: "#e7b48f", hair: "#3b2a22", hairStyle: "short", eyes: "brown", shirt: "#f7f7f8", shirtStyle: "collar", sleeves: "long", jacket: "#232326", pants: "#232326", shoes: "#111114", shoeStyle: "flats", tie: "#2d3a6a", glasses: true },
    screen: "procurement",
    working: [T("Revisando las órdenes de compra de infraestructura", "Reviewing infrastructure purchase orders"), T("Conciliando el presupuesto de operaciones", "Reconciling the operations budget"), T("Siguiendo los proyectos de sostenibilidad del campus", "Following the campus sustainability projects")],
    kpis: [{ label: T("Órdenes abiertas", "Open orders"), value: "37" }, { label: T("Ejecución presupuestaria", "Budget execution"), value: "68%" }, { label: T("Proveedores activos", "Active suppliers"), value: "212" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Estoy revisando 37 órdenes de compra abiertas y conciliando la ejecución presupuestaria del trimestre con Finanzas, TI, Infraestructura y Operaciones.", "I am reviewing 37 open purchase orders and reconciling the quarter's budget execution with Finance, IT, Infrastructure and Operations.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente de la Vicepresidencia Administrativa: finanzas, TI, recursos humanos, infraestructura, operaciones y gestión ambiental.", "Hello, I am the Administrative Vice-presidency's agent: finance, IT, human resources, infrastructure, operations and environmental management.")],
      [[], T("Lo paso a la dirección responsable y te aviso cuando esté aprobado.", "I will route it to the responsible office and let you know when it is approved.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Cómo va el presupuesto?", "How is the budget going?")],
  },
  {
    id: "ramia", name: "Damián Ramia", role: T("VP Experiencia Estudiantil", "Student Experience VP"), title: T("Agente de vida estudiantil", "Student life agent"),
    color: "#c9e8b2", accent: "#4f9a3e",
    look: { skin: "#f1c9a5", hair: "#2a1a14", hairStyle: "swept", eyes: "hazel", shirt: "#3b6fd6", shirtStyle: "collar", sleeves: "long", pants: "#2b2d3a", shoes: "#26262c", shoeStyle: "flats", lanyard: RED },
    screen: "ops",
    working: [T("Respondiendo a estudiantes por WhatsApp", "Answering students on WhatsApp"), T("Coordinando el Dragon Gym y las selecciones", "Coordinating the Dragon Gym and the teams"), T("Revisando los casos de CORA de la semana", "Reviewing this week's CORA cases")],
    kpis: [{ label: T("Mensajes hoy", "Messages today"), value: "214" }, { label: T("Casos CORA abiertos", "Open CORA cases"), value: "18" }, { label: T("Eventos esta semana", "Events this week"), value: "7" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Estoy respondiendo consultas de estudiantes por WhatsApp (214 hoy) y coordinando con CORA, el Decanato de Estudiantes y USFQ PATH los casos de acompañamiento de la semana.", "I am answering student queries on WhatsApp (214 today) and coordinating this week's support cases with CORA, the Dean of Students and USFQ PATH.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente de Experiencia Estudiantil: CORA, Decanato de Estudiantes, USFQ PATH, selecciones deportivas, fútbol y Dragon Gym.", "Hello, I am the Student Experience agent: CORA, Dean of Students, USFQ PATH, sports teams, football and the Dragon Gym.")],
      [[], T("Lo registro y le doy seguimiento con el área indicada.", "I will log it and follow up with the right area.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Qué eventos hay esta semana?", "What events are there this week?")],
  },
  {
    id: "calderon", name: "Cristina Calderón", role: T("Comunicación", "Communications"), title: T("Coordinadora · agente de comunicación", "Coordinator · communications agent"),
    color: "#ffd0d6", accent: "#d64c6a",
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
    id: "quiroga", name: "Diego Quiroga", role: T("Rector", "Rector"), title: T("Rectorado · agente del rector", "Rector's office · the rector's agent"),
    color: "#e9e4d6", accent: "#8a7a5a",
    look: { skin: "#f1cdb5", hair: "#9a9aa0", hairStyle: "short", eyes: "blue", shirt: "#f7f7f8", shirtStyle: "collar", sleeves: "long", jacket: "#1b1b1f", pants: "#1b1b1f", shoes: "#111114", shoeStyle: "flats", glasses: true },
    screen: "finance",
    working: [T("Leyendo el tablero institucional", "Reading the institutional dashboard"), T("Preparando el consejo universitario", "Preparing the university council"), T("Revisando los indicadores de las cinco vicepresidencias", "Reviewing the five vice-presidencies' indicators")],
    kpis: [{ label: T("Vicepresidencias", "Vice-presidencies"), value: "5" }, { label: T("Profesores", "Faculty"), value: "800+" }, { label: T("Alumni", "Alumni"), value: "30,000+" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Estoy revisando el tablero institucional con los indicadores de las cinco vicepresidencias antes del consejo universitario de la tarde.", "I am reviewing the institutional dashboard with the five vice-presidencies' indicators before this afternoon's university council.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente del Rectorado. Consolido lo que reportan las vicepresidencias, Legal y el Ombudsman.", "Hello, I am the Rector's office agent. I consolidate what the vice-presidencies, Legal and the Ombudsman report.")],
      [[], T("Lo elevo a la vicepresidencia que corresponde y te confirmo.", "I will raise it with the relevant vice-presidency and confirm.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("Dame un resumen institucional", "Give me an institutional summary")],
  },
  {
    id: "paz", name: "Ana María Paz", role: T("Legal", "Legal"), title: T("Directora · agente legal", "Director · legal agent"),
    color: "#d6e6ff", accent: "#4f5fb8",
    look: { skin: "#f1c9a5", hair: "#2a1a14", hairStyle: "ponytail", eyes: "brown", lips: "#c0443f", shirt: "#f7f7f8", shirtStyle: "collar", sleeves: "long", jacket: "#232326", pants: "#232326", shoes: "#111114", shoeStyle: "heels", glasses: true },
    screen: "support",
    working: [T("Revisando el convenio con la fundación internacional", "Reviewing the agreement with the international foundation"), T("Respondiendo consultas contractuales de los colegios", "Answering the colleges' contract queries"), T("Actualizando las políticas de donaciones", "Updating the donation policies")],
    kpis: [{ label: T("Convenios en revisión", "Agreements under review"), value: "11" }, { label: T("Consultas abiertas", "Open queries"), value: "23" }, { label: T("Tiempo de respuesta", "Response time"), value: "1.8 d" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Estoy revisando once convenios, entre ellos el de la fundación que financiará becas, y respondiendo 23 consultas contractuales de los colegios.", "I am reviewing eleven agreements, including the foundation that will fund scholarships, and answering 23 contract queries from the colleges.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente de la Dirección Legal. Convenios, contratos y políticas.", "Hello, I am the Legal Office's agent. Agreements, contracts and policies.")],
      [[], T("Lo reviso y te devuelvo la observación legal por escrito.", "I will review it and return the legal observation in writing.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Qué convenios están en revisión?", "Which agreements are under review?")],
  },
  {
    id: "bustamante", name: "Irene Bustamante", role: T("Ombudsman", "Ombudsman"), title: T("Agente de la Defensoría", "Ombudsman's agent"),
    color: "#f4d98a", accent: "#c98a2a",
    look: { skin: "#efc3a4", hair: "#3b2418", hairStyle: "bun", eyes: "hazel", lips: "#c0443f", shirt: "#3d4a7a", shirtStyle: "blouse", sleeves: "long", pants: "#1f1f24", shoes: "#111114", shoeStyle: "flats" },
    screen: "support",
    working: [T("Atendiendo casos de la comunidad universitaria", "Attending to cases from the university community"), T("Dando seguimiento a una mediación", "Following up on a mediation"), T("Preparando el informe trimestral", "Preparing the quarterly report")],
    kpis: [{ label: T("Casos abiertos", "Open cases"), value: "9" }, { label: T("Resueltos este mes", "Resolved this month"), value: "14" }, { label: T("Satisfacción", "Satisfaction"), value: "4.7 / 5" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Atiendo nueve casos abiertos de estudiantes y personal, con una mediación en curso, y preparo el informe trimestral para el Rectorado.", "I am handling nine open cases from students and staff, with one mediation under way, and preparing the quarterly report for the Rector's office.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente de la Defensoría (Ombudsman). Escucho, medio y doy seguimiento con confidencialidad.", "Hello, I am the Ombudsman's agent. I listen, mediate and follow up confidentially.")],
      [[], T("Queda registrado de forma confidencial; te contacto para los siguientes pasos.", "It is logged confidentially; I will contact you about the next steps.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Cuántos casos hay abiertos?", "How many cases are open?")],
  },
  {
    id: "coello", name: "Diana Coello", role: T("Vinculación con la Comunidad", "Community Engagement"), title: T("Coordinadora · agente de vinculación", "Coordinator · engagement agent"),
    color: "#a9dcd3", accent: "#2f8f80",
    look: { skin: "#d9a98a", hair: "#2a1a12", hairStyle: "curly", eyes: "dark", lips: "#b5443c", shirt: "#e9c46a", shirtStyle: "sweater", sleeves: "long", pants: "#2b2d3a", shoes: "#f1f1f1", shoeStyle: "sneakers" },
    screen: "ops",
    working: [T("Coordinando los proyectos Vecinos USFQ", "Coordinating the Vecinos USFQ projects"), T("Confirmando voluntarios por WhatsApp", "Confirming volunteers on WhatsApp"), T("Evaluando qué proyectos pueden recibir donaciones", "Assessing which projects can take donations")],
    kpis: [{ label: T("Proyectos 2026", "Projects 2026"), value: "53" }, { label: T("En ejecución", "In progress"), value: "52" }, { label: T("Con potencial de donación", "With donation potential"), value: "53" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Coordino 53 proyectos de vinculación de 2026 (Cumbayá, Tiputini, Tandayapa, Galápagos y zonas rurales) y marco cuáles tienen potencial para recibir donaciones: todos lo tienen, 36 con impacto alto.", "I coordinate 53 engagement projects for 2026 (Cumbayá, Tiputini, Tandayapa, Galápagos and rural areas) and flag which can take donations: all of them, 36 with high impact.")],
      [["hola", "buen", "hello", "hi"], T("Hola, soy el agente de Vinculación con la Comunidad: proyectos Vecinos USFQ, voluntariado e impacto.", "Hello, I am the Community Engagement agent: Vecinos USFQ projects, volunteering and impact.")],
      [[], T("Lo comparto con el líder del proyecto y te cuento qué dice.", "I will share it with the project lead and tell you what they say.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Qué proyectos tienen más potencial?", "Which projects have the most potential?")],
  },
  {
    id: "pons", name: "Michelle Pons", role: T("Admisiones", "Admissions"), title: T("Directora · agente de admisiones (recepción)", "Director · admissions agent (reception)"),
    color: "#ffe3c2", accent: "#e08a3c",
    look: { skin: "#f6dcc6", hair: "#c9a25a", hairStyle: "bun", eyes: "blue", lips: "#c9605a", shirt: "#f7f7f8", shirtStyle: "blouse", sleeves: "long", jacket: "#3a3a44", pants: "#1e1e24", skirt: true, shoes: "#111114", shoeStyle: "heels" },
    screen: "ops",
    working: [T("Recibiendo a familias en campus", "Welcoming families on campus"), T("Confirmando entrevistas de admisión", "Confirming admission interviews"), T("Respondiendo aspirantes por WhatsApp", "Answering applicants on WhatsApp")],
    kpis: [{ label: T("Aspirantes hoy", "Applicants today"), value: "63" }, { label: T("Entrevistas", "Interviews"), value: "12" }, { label: T("Tiempo de respuesta", "Response time"), value: "4 min" }],
    replies: [
      [["hac", "ahora", "trabaj", "doing"], T("Recibo a las familias que llegan a campus, confirmo las 12 entrevistas de admisión de hoy y respondo a 63 aspirantes por WhatsApp.", "I welcome the families arriving on campus, confirm today's 12 admission interviews and answer 63 applicants on WhatsApp.")],
      [["hola", "buen", "hello", "hi"], T("¡Bienvenido a USFQ! Soy el agente de Admisiones y la recepción. ¿A quién buscas?", "Welcome to USFQ! I am the Admissions and reception agent. Who are you looking for?")],
      [[], T("Claro, te anuncio y te acompaño.", "Of course, I will announce you and show you the way.")],
    ],
    quick: [T("¿Qué estás haciendo ahora?", "What are you doing right now?"), T("¿Cuántas entrevistas hay hoy?", "How many interviews are there today?")],
  },
  {
    id: "andrade", name: "Alejandro Andrade", role: T("USFQ NEXT", "USFQ NEXT"), title: T("Director · agente de donaciones y filantropía", "Director · donations & philanthropy agent"),
    color: "#ffd0d6", accent: RED,
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

/** The twelve agents of the USFQ office, localized. */
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
    working: b.working.map(L),
    kpis: b.kpis.map((k) => ({ label: L(k.label), value: k.value })),
    replies: b.replies.map(([k, r]) => [k, L(r)] as [string[], string]),
    quick: b.quick.map(L),
  }));
}

/** The rest of the 2026 organisation chart, by vice-presidency (shown in the Team panel as the directory). */
export const USFQ_DIRECTORY: { group: Txt; head: string; people: { name: string; role: Txt | string }[] }[] = [
  { group: T("Rectorado", "Rector's office"), head: "Diego Quiroga", people: [{ name: "Ana María Paz", role: T("Directora Legal", "Legal Director") }, { name: "Irene Bustamante", role: T("Ombudsman", "Ombudsman") }] },
  {
    group: T("VP Académico", "Academic VP"), head: "César Zambrano",
    people: [
      { name: "Cristina Crespo", role: T("Directora SHIFT", "SHIFT Director") }, { name: "Darío Niebieskikwiat", role: T("Decano Colegio de Posgrados", "Dean, Graduate School") }, { name: "Juan Sosa", role: T("Registrador", "Registrar") },
      { name: "Xavier Palacios", role: T("Director Biblioteca", "Library Director") }, { name: "Andrea Peñaherrera", role: T("Coordinadora Programas Académicos Valencia", "Coordinator, Valencia Academic Programs") }, { name: "Santiago José Gangotena", role: T("Decano Artes Liberales", "Dean, Liberal Arts") },
      { name: "Carlos Mena", role: T("Director Programas Académicos Galápagos", "Director, Galápagos Academic Programs") }, { name: "Dolores Lasso", role: T("Decana de Grado y Asuntos Académicos", "Dean of Undergraduate & Academic Affairs") },
      { name: "Ana María Novillo", role: "CADE" }, { name: "Karina Cazar", role: "CADI" }, { name: "Rafael Villota", role: "CHAT" }, { name: "Carlos Valle", role: "COCIBA" }, { name: "Paolo Moncagatta", role: "COCISOH" }, { name: "Gustavo Cusot", role: "COCOA" },
      { name: "Gabriel Montúfar", role: "COM" }, { name: "Mónica Rojas", role: "ECON" }, { name: "Xavier Andrade", role: T("Jurisprudencia", "Law") }, { name: "Eduardo Alba", role: T("Politécnico", "Polytechnic") },
      { name: "Pablo de la Cerda", role: T("COCSA · Medicina", "COCSA · Medicine") }, { name: "Paulina Aliaga", role: T("COCSA · Odontología", "COCSA · Dentistry") }, { name: "Ximena Garzón", role: T("COCSA · Salud Pública", "COCSA · Public Health") }, { name: "Gabriela Arroyo", role: T("COCSA · Veterinaria", "COCSA · Veterinary") },
    ],
  },
  {
    group: T("VP Investigación y Posicionamiento", "Research & Positioning VP"), head: "Carlos Mena",
    people: [
      { name: "Diana Coello", role: T("Coordinadora Vinculación con la Comunidad", "Coordinator, Community Engagement") }, { name: "Ximena Garzón", role: T("Presidenta CEISH", "CEISH President") }, { name: "Andrea Naranjo", role: T("Directora USFQ PRESS", "USFQ PRESS Director") },
      { name: "Eva Langhtst", role: T("Vicedecana de Investigación", "Vice-dean of Research") }, { name: "Franklin Velasco", role: T("Coordinador Relación con la Empresa", "Coordinator, Business Relations") }, { name: "Karla Díaz", role: T("Directora Instituto de Aprendizaje y Servicio", "Director, Learning & Service Institute") },
      { name: "María Laura Fuenzalida", role: T("Directora Propiedad Intelectual y Tech Transfer", "Director, IP & Tech Transfer") }, { name: "Gonzalo Rivas", role: T("Estación Tiputini", "Tiputini Station") }, { name: "Juan Manuel Guayasamín", role: T("Estación Tandayapa", "Tandayapa Station") },
    ],
  },
  {
    group: T("VP Comercial y Desarrollo", "Commercial & Development VP"), head: "Alexandra Velasco",
    people: [
      { name: "Martín Borja", role: T("Director Dirección Comercial", "Commercial Director") }, { name: "Michelle Pons", role: T("Directora Admisiones", "Admissions Director") }, { name: "Yvonne Guerrero", role: T("Directora Asistencia Financiera y Becas", "Director, Financial Aid & Scholarships") },
      { name: "Alejandro Andrade", role: T("Director USFQ NEXT", "USFQ NEXT Director") }, { name: "Cristina Calderón", role: T("Coordinadora Comunicación", "Communications Coordinator") }, { name: "Kiara Guerra", role: T("Directora Programas Internacionales", "Director, International Programs") },
      { name: "Diego Gabela", role: T("Director Educación Continua", "Director, Continuing Education") }, { name: "Isabel Merino", role: T("Directora IDEA", "IDEA Director") },
    ],
  },
  {
    group: T("VP Administrativo", "Administrative VP"), head: "Mauricio Cepeda",
    people: [
      { name: "Patricia Crespo", role: T("Directora Financiero y Administrativo", "Director, Finance & Administration") }, { name: "Francisco Foyaín", role: T("Director Tecnologías de la Información", "IT Director") }, { name: "Harold Cardona", role: T("Coordinador Infraestructura y Sostenibilidad", "Coordinator, Infrastructure & Sustainability") },
      { name: "Ángela Viteri", role: T("Directora Recursos Humanos", "HR Director") }, { name: "Danny Navarrete", role: T("Director Mejoramiento Continuo", "Director, Continuous Improvement") }, { name: "Vladimir Tejada", role: T("Director Operaciones", "Operations Director") }, { name: "Valeria Ochoa", role: T("Coordinadora Oficina de Gestión Ambiental", "Coordinator, Environmental Management Office") },
    ],
  },
  {
    group: T("VP Experiencia Estudiantil", "Student Experience VP"), head: "Damián Ramia",
    people: [
      { name: "Diego Pérez", role: T("Director CORA", "CORA Director") }, { name: "Felipe Ante", role: T("Director USFQ PATH", "USFQ PATH Director") }, { name: "Nathan Digby", role: T("Decano de Estudiantes", "Dean of Students") },
      { name: "José Llerena", role: T("Coordinador Selecciones Deportivas", "Coordinator, Sports Teams") }, { name: "Pablo Pérez", role: T("Coordinador Fútbol USFQ", "Coordinator, USFQ Football") }, { name: "Carlos Peralta", role: T("Coordinador Dragon Gym", "Coordinator, Dragon Gym") },
    ],
  },
];
