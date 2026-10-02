/**
 * The AI employees of the office demo. Everything here is scripted: the demo
 * shows a client what a team of bots looks like, it does not run one.
 * `color` is the pastel for cards and avatars, `accent` the strong colour for
 * rings, bubbles and screens, and `look` how the 3D character is dressed.
 *
 * The Spanish copy is the base (`BASE`); `EN` overlays the localized text per
 * bot id. Consumers call `botsFor(lang)` / `botById(lang, id)` and get flat,
 * already-localized bots.
 */
import type { Lang } from "./i18n";

export type ScreenKind = "sales" | "support" | "social" | "dev" | "finance" | "ops" | "procurement";

/** How the character is built (see components/office/scene/character.js). */
export type Look = {
  skin: string;
  hair: string;
  hairStyle: "short" | "swept" | "bun" | "ponytail" | "long" | "curly" | "bob" | "bald";
  eyes: "brown" | "blue" | "green" | "hazel" | "dark";
  lips?: string;
  shirt: string;
  shirtStyle: "tee" | "collar" | "sweater" | "hoodie" | "blouse";
  sleeves: "long" | "short";
  /** blazer colour; drawn over the shirt with lapels */
  jacket?: string;
  jacketOpen?: boolean;
  pants: string;
  skirt?: boolean;
  shoes: string;
  shoeStyle?: "flats" | "sneakers" | "boots" | "heels";
  glasses?: boolean;
  beard?: boolean;
  tie?: string;
  /** lanyard with an ID badge; a colour string picks the strap colour */
  lanyard?: boolean | string;
};

export type Bot = {
  id: string;
  name: string;
  role: string;
  title: string;
  /** pastel for avatars and cards */
  color: string;
  accent: string;
  look: Look;
  screen: ScreenKind;
  /** what the roster shows while the bot is at its desk */
  working: string[];
  kpis: { label: string; value: string }[];
  /** [keywords, reply] — first match wins; the last entry (no keywords) is the fallback */
  replies: [string[], string][];
  quick: string[];
};

/** The localized part of a bot; everything else (id, name, title, colours, look) is shared. */
type BotText = Pick<Bot, "role" | "working" | "kpis" | "replies" | "quick">;

/** Spanish base (production copy). */
const BASE: Bot[] = [
  {
    id: "sofia",
    name: "Sofía",
    role: "Ventas",
    title: "AI Sales Rep",
    color: "#f4d98a",
    accent: "#e0a83a",
    look: { skin: "#f3cdb0", hair: "#3b2418", hairStyle: "long", eyes: "hazel", lips: "#c0443f", shirt: "#f7f7f8", shirtStyle: "collar", sleeves: "long", jacket: "#1e1e24", pants: "#1e1e24", shoes: "#111114", shoeStyle: "heels" },
    screen: "sales",
    working: [
      "Calificando leads de HubSpot",
      "Escribiendo seguimiento a Grupo Andino",
      "Actualizando el pipeline",
      "Preparando la propuesta para Farmacias Cruz",
    ],
    kpis: [
      { label: "Leads hoy", value: "38" },
      { label: "Reuniones agendadas", value: "6" },
      { label: "Tasa de respuesta", value: "41%" },
    ],
    replies: [
      [["hac", "ahora", "trabaj"], "Ahora mismo estoy calificando los 38 leads que entraron desde la web y LinkedIn. Ya agendé 6 reuniones para esta semana y estoy redactando el seguimiento para Grupo Andino, que abrió la propuesta dos veces ayer."],
      [["resumen", "hoy", "reporte"], "Resumen de hoy: 38 leads nuevos, 22 calificados, 6 reuniones agendadas y 2 propuestas enviadas (Farmacias Cruz y Logística del Pacífico). El pipeline subió $18.400 respecto a ayer."],
      [["pendiente", "falta", "siguiente"], "Pendiente: enviar la cotización revisada a Farmacias Cruz antes de las 17:00, confirmar la demo del jueves con Grupo Andino y limpiar 14 leads duplicados en el CRM."],
      [["lead", "cliente", "prospect"], "Los leads más calientes ahora son Grupo Andino (score 92), Farmacias Cruz (88) y Cooperativa 29 de Octubre (81). ¿Quieres que priorice alguno?"],
      [["hola", "buen"], "¡Hola! Soy Sofía, tu representante de ventas. Trabajo 24/7 sobre el CRM: califico leads, escribo seguimientos y agendo reuniones. ¿En qué te ayudo?"],
      [[], "Anotado. Lo agrego a mi lista y te aviso en cuanto lo tenga. Mientras tanto sigo con el pipeline de esta semana."],
    ],
    quick: ["¿Qué estás haciendo ahora?", "Dame un resumen de hoy", "¿Qué tienes pendiente?"],
  },
  {
    id: "mateo",
    name: "Mateo",
    role: "Soporte",
    title: "AI Customer Support",
    color: "#a9dcd3",
    accent: "#3aa392",
    look: { skin: "#e7b48f", hair: "#3b2a22", hairStyle: "swept", eyes: "brown", shirt: "#3b6fd6", shirtStyle: "collar", sleeves: "long", pants: "#2b2d3a", shoes: "#26262c", shoeStyle: "flats", tie: "#f4f4f4", lanyard: "#f2c14e" },
    screen: "support",
    working: [
      "Respondiendo tickets de Zendesk",
      "Resolviendo un reclamo de facturación",
      "Actualizando la base de conocimiento",
      "Escalando un caso a humano",
    ],
    kpis: [
      { label: "Tickets resueltos", value: "127" },
      { label: "Tiempo de respuesta", value: "42 s" },
      { label: "Satisfacción (CSAT)", value: "4,8 / 5" },
    ],
    replies: [
      [["hac", "ahora", "trabaj"], "Estoy en la bandeja de soporte: 127 tickets resueltos hoy, 9 abiertos. Ahora mismo respondo a un cliente que no puede descargar su factura de agosto; ya encontré la causa y le estoy enviando el enlace corregido."],
      [["resumen", "hoy", "reporte"], "Hoy: 136 tickets recibidos, 127 resueltos sin intervención humana, 3 escalados a tu equipo. Tiempo medio de primera respuesta: 42 segundos. CSAT del día: 4,8 sobre 5."],
      [["pendiente", "falta", "siguiente"], "Quedan 9 tickets abiertos. Tres esperan al cliente, cinco los resuelvo en la próxima hora y uno (reembolso mayor a $500) necesita tu aprobación."],
      [["escal", "human", "urgente"], "Escalé 3 casos hoy: un reembolso de $640, una queja en redes de un cliente enterprise y una solicitud legal. Los tres tienen resumen y contexto en tu bandeja."],
      [["hola", "buen"], "¡Hola! Soy Mateo, atiendo el soporte al cliente por correo, chat y WhatsApp las 24 horas. Pregúntame por cualquier ticket."],
      [[], "Perfecto, lo reviso ahora mismo y te respondo con el detalle en un momento. Sigo atendiendo la bandeja mientras tanto."],
    ],
    quick: ["¿Qué estás haciendo ahora?", "¿Qué casos escalaste?", "Dame un resumen de hoy"],
  },
  {
    id: "valentina",
    name: "Valentina",
    role: "Marketing",
    title: "AI Social Media Manager",
    color: "#d9c6f2",
    accent: "#8a63d2",
    look: { skin: "#f1cdb5", hair: "#d9b46a", hairStyle: "bun", eyes: "blue", lips: "#c9605a", shirt: "#f7f7f8", shirtStyle: "tee", sleeves: "short", pants: "#1f1f24", shoes: "#f1f1f1", shoeStyle: "sneakers", glasses: true },
    screen: "social",
    working: [
      "Programando posts de la semana",
      "Diseñando el carrusel de Instagram",
      "Respondiendo comentarios en LinkedIn",
      "Analizando la campaña de septiembre",
    ],
    kpis: [
      { label: "Posts programados", value: "14" },
      { label: "Alcance semanal", value: "48,2 k" },
      { label: "Engagement", value: "+23%" },
    ],
    replies: [
      [["hac", "ahora", "trabaj"], "Estoy armando el calendario de contenido de la próxima semana: 14 posts entre Instagram, LinkedIn y TikTok. Ahora mismo redacto el carrusel sobre el lanzamiento de octubre y respondo comentarios de la publicación de ayer."],
      [["resumen", "hoy", "reporte"], "Hoy publiqué 4 piezas, respondí 63 comentarios y mensajes, y el alcance semanal va en 48,2 k (+23 % de engagement vs. la semana pasada). El video corto del martes es el mejor contenido del mes."],
      [["pendiente", "falta", "siguiente"], "Pendiente: tu aprobación para los 3 posts del lanzamiento, cerrar el reporte de la campaña de septiembre y preparar 5 ideas de reels para la semana que viene."],
      [["campa", "anuncio", "ads"], "La campaña de septiembre lleva $1.240 invertidos, 312 leads y un costo por lead de $3,97, un 18 % mejor que agosto. Recomiendo mover presupuesto de Facebook a Instagram Reels."],
      [["hola", "buen"], "¡Hola! Soy Valentina, manejo las redes y el contenido. Escribo, diseño, programo y respondo a la comunidad. ¿Qué necesitas?"],
      [[], "¡Me encanta! Lo incorporo en el calendario de contenido y te muestro un borrador en unos minutos."],
    ],
    quick: ["¿Qué estás haciendo ahora?", "¿Cómo va la campaña?", "¿Qué tienes pendiente?"],
  },
  {
    id: "nicolas",
    name: "Nicolás",
    role: "Desarrollo",
    title: "AI Software Engineer",
    color: "#b9d7f2",
    accent: "#3f86d6",
    look: { skin: "#c98b64", hair: "#211a17", hairStyle: "swept", eyes: "dark", lips: "#9c6a58", shirt: "#6b6e75", shirtStyle: "hoodie", sleeves: "long", pants: "#2a2b2f", shoes: "#5a1f28", shoeStyle: "sneakers", beard: true },
    screen: "dev",
    working: [
      "Corrigiendo un bug del checkout",
      "Corriendo la suite de pruebas",
      "Revisando un pull request",
      "Desplegando a staging",
    ],
    kpis: [
      { label: "PRs hoy", value: "5" },
      { label: "Pruebas", value: "248 ✓" },
      { label: "Uptime", value: "99,98%" },
    ],
    replies: [
      [["hac", "ahora", "trabaj"], "Estoy corrigiendo un bug en el checkout: el descuento no se aplicaba con cupones en mayúsculas. Ya tengo la corrección con pruebas (248 pasando) y la estoy desplegando a staging para que la revises."],
      [["resumen", "hoy", "reporte"], "Hoy: 5 pull requests, 2 desplegados a producción, 0 incidentes. Reduje el tiempo de carga del catálogo de 2,4 s a 0,9 s y documenté el endpoint de pedidos."],
      [["pendiente", "falta", "siguiente"], "Pendiente: tu revisión del PR #482 (checkout), migrar la base de datos de staging esta noche y actualizar las dependencias con alertas de seguridad."],
      [["bug", "error", "falla", "caído"], "El único bug abierto es el del checkout, ya corregido y en pruebas. Producción está estable: uptime del mes 99,98 %, sin errores 5xx en las últimas 6 horas."],
      [["hola", "buen"], "¡Hola! Soy Nicolás, el ingeniero de software del equipo. Escribo código, pruebas y despliegues. Pregúntame por cualquier tarea técnica."],
      [[], "Entendido. Creo la tarea, estimo el esfuerzo y te propongo un plan en el próximo PR."],
    ],
    quick: ["¿Qué estás haciendo ahora?", "¿Hay algún bug?", "Dame un resumen de hoy"],
  },
  {
    id: "camila",
    name: "Camila",
    role: "Finanzas",
    title: "AI Finance Analyst",
    color: "#f7c4b6",
    accent: "#e2694f",
    look: { skin: "#f6dcc6", hair: "#141010", hairStyle: "bob", eyes: "brown", lips: "#b8544f", shirt: "#1f1f24", shirtStyle: "tee", sleeves: "short", pants: "#f1efe9", shoes: "#111114", shoeStyle: "boots" },
    screen: "finance",
    working: [
      "Conciliando pagos del banco",
      "Emitiendo facturas electrónicas",
      "Preparando el flujo de caja",
      "Revisando gastos de septiembre",
    ],
    kpis: [
      { label: "Facturas emitidas", value: "42" },
      { label: "Cobrado hoy", value: "$12.480" },
      { label: "Por cobrar", value: "$31.200" },
    ],
    replies: [
      [["hac", "ahora", "trabaj"], "Estoy conciliando los pagos del Banco Pichincha con las facturas del SRI: 42 facturas emitidas hoy, 39 ya cobradas. Ahora mismo cruzo 3 transferencias sin referencia contra el listado de clientes."],
      [["resumen", "hoy", "reporte"], "Hoy: $12.480 cobrados, $31.200 por cobrar (4 facturas vencidas), 42 facturas emitidas al SRI sin rechazos. El flujo de caja proyectado a 30 días cierra en positivo con $58.900."],
      [["pendiente", "falta", "siguiente"], "Pendiente: recordatorio de cobro a las 4 facturas vencidas, declarar el IVA antes del 20 y tu aprobación para el pago a proveedores del viernes ($8.350)."],
      [["caja", "flujo", "dinero", "cobr"], "Flujo de caja: saldo actual $74.300, ingresos previstos 30 días $61.200, egresos $76.600. Cierra en $58.900. Ninguna alerta de liquidez."],
      [["hola", "buen"], "¡Hola! Soy Camila, me encargo de facturación, cobranza y reportes financieros. ¿Qué número necesitas?"],
      [[], "Lo reviso contra los registros contables y te envío el detalle en una hoja de cálculo en unos minutos."],
    ],
    quick: ["¿Qué estás haciendo ahora?", "¿Cómo va el flujo de caja?", "¿Qué tienes pendiente?"],
  },
  {
    id: "andres",
    name: "Andrés",
    role: "Operaciones",
    title: "AI Operations Assistant",
    color: "#c9e8b2",
    accent: "#5fa54a",
    look: { skin: "#8d5a3b", hair: "#141010", hairStyle: "short", eyes: "dark", lips: "#7a4a3c", shirt: "#f7f7f8", shirtStyle: "collar", sleeves: "long", jacket: "#1b263b", pants: "#1b263b", shoes: "#3a2418", shoeStyle: "flats", tie: "#2d6a4f" },
    screen: "ops",
    working: [
      "Coordinando la agenda del equipo",
      "Confirmando citas por WhatsApp",
      "Pidiendo insumos al proveedor",
      "Actualizando el inventario",
    ],
    kpis: [
      { label: "Citas confirmadas", value: "23" },
      { label: "Pedidos en curso", value: "7" },
      { label: "Inventario OK", value: "98%" },
    ],
    replies: [
      [["hac", "ahora", "trabaj"], "Estoy confirmando las citas de mañana por WhatsApp: 23 confirmadas, 2 reprogramadas. Ahora mismo pido al proveedor los insumos que bajaron del mínimo de inventario."],
      [["resumen", "hoy", "reporte"], "Hoy: 23 citas confirmadas, 2 reprogramaciones, 7 pedidos a proveedores en curso y el inventario al 98 %. Cero clientes sin confirmar."],
      [["pendiente", "falta", "siguiente"], "Pendiente: recibir el pedido de insumos el jueves, agendar la reunión mensual con el equipo y tu visto bueno para renovar el contrato de limpieza."],
      [["agenda", "cita", "reuni", "calend"], "Mañana tienes 3 reuniones: 9:00 con Grupo Andino, 11:30 revisión interna y 15:00 demo con Farmacias Cruz. Te dejé 45 minutos libres al mediodía."],
      [["hola", "buen"], "¡Hola! Soy Andrés, coordino agenda, proveedores e inventario. Dime qué necesitas organizar."],
      [[], "Listo, lo coordino. Te confirmo por aquí en cuanto esté resuelto."],
    ],
    quick: ["¿Qué estás haciendo ahora?", "¿Cómo está la agenda?", "Dame un resumen de hoy"],
  },
  {
    id: "lucia",
    name: "Lucía",
    role: "Talento",
    title: "AI HR Partner",
    color: "#f9d5e5",
    accent: "#d64f8a",
    look: { skin: "#f1c9a5", hair: "#2a1a14", hairStyle: "ponytail", eyes: "brown", lips: "#c0443f", shirt: "#f7f7f8", shirtStyle: "collar", sleeves: "long", jacket: "#232326", pants: "#232326", shoes: "#111114", shoeStyle: "heels", glasses: true },
    screen: "ops",
    working: ["Revisando candidatos", "Agendando entrevistas", "Preparando el onboarding", "Actualizando la nómina"],
    kpis: [
      { label: "Candidatos", value: "24" },
      { label: "Entrevistas", value: "5" },
      { label: "Onboardings", value: "2" },
    ],
    replies: [
      [["hac", "ahora", "trabaj"], "Estoy revisando 24 candidatos para el puesto de soporte y agendando 5 entrevistas para esta semana. Ahora preparo el onboarding de los dos nuevos ingresos."],
      [["resumen", "hoy", "reporte"], "Hoy: 24 candidatos filtrados, 5 entrevistas agendadas, 2 onboardings listos y la nómina de septiembre revisada sin diferencias."],
      [["pendiente", "falta", "siguiente"], "Pendiente: tu aprobación de la oferta para el puesto de ventas y confirmar la fecha de la capacitación mensual."],
      [["hola", "buen"], "¡Hola! Soy Lucía, me encargo de talento: reclutamiento, onboarding y clima del equipo."],
      [[], "Lo anoto y lo coordino con el equipo. Te confirmo por aquí."],
    ],
    quick: ["¿Qué estás haciendo ahora?", "Dame un resumen de hoy", "¿Qué tienes pendiente?"],
  },
  {
    id: "diego",
    name: "Diego",
    role: "Diseño",
    title: "AI Product Designer",
    color: "#d6e6ff",
    accent: "#3b6fd6",
    look: { skin: "#e6bc9c", hair: "#4a2e1f", hairStyle: "curly", eyes: "green", lips: "#b07a6a", shirt: "#e9c46a", shirtStyle: "sweater", sleeves: "long", pants: "#2b2d3a", shoes: "#f1f1f1", shoeStyle: "sneakers" },
    screen: "social",
    working: ["Diseñando la pantalla de checkout", "Ajustando el sistema de diseño", "Preparando el prototipo", "Revisando accesibilidad"],
    kpis: [
      { label: "Pantallas", value: "12" },
      { label: "Prototipos", value: "3" },
      { label: "Tests de usuario", value: "4" },
    ],
    replies: [
      [["hac", "ahora", "trabaj"], "Estoy diseñando la nueva pantalla de checkout: 12 pantallas listas y un prototipo navegable para la demo del jueves."],
      [["resumen", "hoy", "reporte"], "Hoy: 12 pantallas, 3 prototipos y 4 tests de usuario. El botón de pago nuevo mejoró la conversión un 9 % en la prueba."],
      [["pendiente", "falta", "siguiente"], "Pendiente: tu feedback sobre la paleta de colores y exportar los íconos para Nicolás."],
      [["hola", "buen"], "¡Hola! Soy Diego, diseño producto: interfaces, prototipos y pruebas con usuarios."],
      [[], "Buena idea, lo pruebo en el prototipo y te muestro dos opciones."],
    ],
    quick: ["¿Qué estás haciendo ahora?", "Dame un resumen de hoy", "¿Qué tienes pendiente?"],
  },
  {
    id: "emma",
    name: "Emma",
    role: "Legal",
    title: "AI Legal Analyst",
    color: "#e3e0f7",
    accent: "#5d4fb3",
    look: { skin: "#f6dcc6", hair: "#c9a25a", hairStyle: "bun", eyes: "blue", lips: "#c9605a", shirt: "#f7f7f8", shirtStyle: "blouse", sleeves: "long", jacket: "#3a3a44", pants: "#1e1e24", skirt: true, shoes: "#111114", shoeStyle: "heels", glasses: true },
    screen: "finance",
    working: ["Revisando el contrato de Grupo Andino", "Actualizando la política de datos", "Preparando el acuerdo de confidencialidad", "Revisando términos de servicio"],
    kpis: [
      { label: "Contratos", value: "7" },
      { label: "Revisiones", value: "15" },
      { label: "Riesgos abiertos", value: "1" },
    ],
    replies: [
      [["hac", "ahora", "trabaj"], "Estoy revisando el contrato de Grupo Andino: 7 contratos en curso, 15 cláusulas revisadas hoy y un solo riesgo abierto (plazo de pago a 90 días)."],
      [["resumen", "hoy", "reporte"], "Hoy: 7 contratos revisados, la política de datos actualizada y el acuerdo de confidencialidad de Farmacias Cruz listo para firma."],
      [["pendiente", "falta", "siguiente"], "Pendiente: tu decisión sobre el plazo de pago de Grupo Andino y firmar el NDA de Farmacias Cruz."],
      [["hola", "buen"], "¡Hola! Soy Emma, reviso contratos, políticas y cumplimiento."],
      [[], "Lo reviso desde el punto de vista legal y te envío un resumen con los riesgos."],
    ],
    quick: ["¿Qué estás haciendo ahora?", "Dame un resumen de hoy", "¿Qué tienes pendiente?"],
  },
  {
    id: "tomas",
    name: "Tomás",
    role: "Datos",
    title: "AI Data Analyst",
    color: "#d9f2e6",
    accent: "#1f9d6a",
    look: { skin: "#c98b64", hair: "#1a1412", hairStyle: "short", eyes: "brown", lips: "#9c6a58", shirt: "#cfe3f5", shirtStyle: "collar", sleeves: "long", pants: "#1d3557", shoes: "#5a3a28", shoeStyle: "flats", glasses: true },
    screen: "dev",
    working: ["Entrenando el modelo de churn", "Limpiando datos de ventas", "Construyendo el dashboard", "Analizando la campaña"],
    kpis: [
      { label: "Modelos", value: "3" },
      { label: "Precisión", value: "94%" },
      { label: "Reportes", value: "8" },
    ],
    replies: [
      [["hac", "ahora", "trabaj"], "Estoy entrenando el modelo de churn con los datos de septiembre: 94 % de precisión. También limpio los datos de ventas para el dashboard."],
      [["resumen", "hoy", "reporte"], "Hoy: 3 modelos actualizados, 8 reportes generados y el dashboard de operaciones con datos en tiempo real."],
      [["pendiente", "falta", "siguiente"], "Pendiente: validar el modelo con Sofía y publicar el reporte semanal el viernes."],
      [["hola", "buen"], "¡Hola! Soy Tomás, analizo datos y entreno modelos para el equipo."],
      [[], "Lo consulto en los datos y te traigo la cifra exacta en un momento."],
    ],
    quick: ["¿Qué estás haciendo ahora?", "Dame un resumen de hoy", "¿Qué tienes pendiente?"],
  },
  {
    id: "ana",
    name: "Ana",
    role: "Recepción",
    title: "AI Front Desk",
    color: "#ffe3c2",
    accent: "#e07a2f",
    look: { skin: "#efc3a4", hair: "#3b2418", hairStyle: "ponytail", eyes: "hazel", lips: "#c0443f", shirt: "#3d4a7a", shirtStyle: "blouse", sleeves: "long", pants: "#1f1f24", shoes: "#111114", shoeStyle: "flats", lanyard: true },
    screen: "support",
    working: ["Recibiendo visitantes", "Confirmando citas del día", "Gestionando paquetería", "Atendiendo llamadas"],
    kpis: [
      { label: "Visitantes hoy", value: "9" },
      { label: "Llamadas", value: "31" },
      { label: "Citas", value: "6" },
    ],
    replies: [
      [["hac", "ahora", "trabaj"], "Estoy en recepción: 9 visitantes registrados hoy, 31 llamadas atendidas y 6 citas confirmadas. Ahora mismo espero al equipo de Grupo Andino."],
      [["resumen", "hoy", "reporte"], "Hoy: 9 visitantes, 31 llamadas, 6 citas y 3 paquetes recibidos. Ninguna visita sin registrar."],
      [["pendiente", "falta", "siguiente"], "Pendiente: la visita de Grupo Andino a las 15:00 y confirmar el catering del viernes."],
      [["hola", "buen"], "¡Bienvenido! Soy Ana, atiendo la recepción: visitas, llamadas y agenda."],
      [[], "Con gusto, lo gestiono ahora mismo."],
    ],
    quick: ["¿Qué estás haciendo ahora?", "¿Quién viene hoy?", "Dame un resumen de hoy"],
  },
  {
    // Compras: la agente que revisa "Seguimiento Proveedores.xlsx" para
    // Jabonería Wilson. Va al final a propósito: la recepción es bots[10] por
    // índice en room.js, y este escritorio es el 11.
    id: "renata",
    name: "Renata",
    role: "Compras",
    title: "AI Procurement Agent",
    color: "#cdd6f4",
    accent: "#4f5fb8",
    look: { skin: "#d9a98a", hair: "#2a1a12", hairStyle: "bob", eyes: "dark", lips: "#b5443c", shirt: "#f4f4f6", shirtStyle: "blouse", sleeves: "long", jacket: "#2f3a7a", pants: "#23242e", shoes: "#111114", shoeStyle: "flats", glasses: true, lanyard: "#4f5fb8" },
    screen: "procurement",
    working: [
      "Revisando Seguimiento Proveedores.xlsx",
      "Enviando recordatorios del martes a proveedores",
      "Cruzando fechas de recepción con el ERP",
      "Esperando confirmación de 14 proveedores",
    ],
    kpis: [
      { label: "OC abiertas", value: "692" },
      { label: "Líneas atrasadas", value: "1.077" },
      { label: "Recordatorios hoy", value: "14" },
    ],
    replies: [
      [["hac", "ahora", "trabaj"], "Estoy revisando Seguimiento Proveedores.xlsx: 692 órdenes de compra abiertas, 1.077 líneas atrasadas y 300 en tránsito. Hoy es día de recordatorio (martes y jueves): ya envié 14 correos a proveedores con la OC, el código del artículo y la fecha de recepción comprometida, y estoy esperando sus confirmaciones."],
      [["resumen", "hoy", "reporte"], "Resumen: la columna de fecha de recepción manda. 1.077 líneas pasaron esa fecha sin material; la mediana de atraso es de 98 días y la peor OC lleva 862. Lo más crítico es material de empaque: 278 líneas, varias de tarrinas y tapas con 10.000 a 20.000 unidades pendientes."],
      [["pendiente", "falta", "siguiente"], "Pendiente: 9 proveedores no han respondido al recordatorio de la semana pasada; el jueves les escribo de nuevo y, si siguen sin confirmar, te lo escalo con la lista. También tengo 6 OC con fecha de recepción ya vencida que el ERP sigue marcando en tránsito: necesito que alguien confirme si llegaron."],
      [["proveedor", "oc", "orden", "atras"], "Puedo darte el detalle por OC o por proveedor: qué se pidió, cuántas unidades faltan, el lead time acordado y cuántos días lleva de atraso. Dime el número de OC o el nombre del proveedor."],
      [["correo", "whatsapp", "notific", "aviso"], "Los recordatorios salen por correo martes y jueves, con copia a Compras. Cuando el proveedor responde, registro la nueva fecha prometida en la hoja y te aviso solo si cambia más de una semana."],
      [["hola", "buen"], "¡Hola! Soy Renata, llevo el seguimiento de proveedores de Jabonería Wilson: reviso la hoja de órdenes de compra, recuerdo a los proveedores dos veces por semana y registro sus confirmaciones. ¿Qué quieres saber?"],
      [[], "Anotado. Lo reviso contra la hoja de seguimiento y te confirmo en cuanto tenga la respuesta del proveedor."],
    ],
    quick: ["¿Qué estás haciendo ahora?", "¿Qué OC están más atrasadas?", "¿Quién no ha confirmado?"],
  },
];

/* Shared English keyword stems (matched with lowercase `includes`, see `reply`). */
const K_NOW = ["doing", "now", "working"];
const K_SUMMARY = ["summary", "today", "report"];
const K_PENDING = ["pending", "next", "left"];
const K_HELLO = ["hello", "hi", "hey"];

const Q_NOW = "What are you doing right now?";
const Q_SUMMARY = "Give me today's summary";
const Q_PENDING = "What's still pending?";

/** English overlay, by bot id. */
const EN: Record<string, BotText> = {
  renata: {
    role: "Procurement",
    working: [
      "Reviewing Seguimiento Proveedores.xlsx",
      "Sending Tuesday's reminders to suppliers",
      "Matching receipt dates against the ERP",
      "Waiting on 14 supplier confirmations",
    ],
    kpis: [
      { label: "Open POs", value: "692" },
      { label: "Late lines", value: "1,077" },
      { label: "Reminders today", value: "14" },
    ],
    replies: [
      [K_NOW, "I'm going through Seguimiento Proveedores.xlsx: 692 open purchase orders, 1,077 late lines and 300 in transit. Today is a reminder day (Tuesdays and Thursdays): I've sent 14 emails to suppliers with the PO, the item code and the promised receipt date, and I'm waiting on their confirmations."],
      [K_SUMMARY, "Summary: the receipt-date column rules. 1,077 lines are past that date with no material; the median delay is 98 days and the worst PO is 862 days late. Packaging is the critical group: 278 lines, several of tubs and caps with 10,000 to 20,000 units pending."],
      [K_PENDING, "Pending: 9 suppliers haven't answered last week's reminder; I'll write again on Thursday and escalate the list to you if they still don't confirm. I also have 6 POs past their receipt date that the ERP still shows in transit: someone needs to confirm whether they arrived."],
      [["supplier", "vendor", "po", "order", "late"], "I can give you the detail per PO or per supplier: what was ordered, how many units are missing, the agreed lead time and how many days late it is. Give me the PO number or the supplier's name."],
      [["email", "whatsapp", "notif", "remind"], "Reminders go out by email on Tuesdays and Thursdays, copying Purchasing. When a supplier replies I record the new promised date in the sheet and only ping you if it moves by more than a week."],
      [K_HELLO, "Hi! I'm Renata, I run supplier follow-up for Jabonería Wilson: I review the purchase-order sheet, remind suppliers twice a week and log their confirmations. What would you like to know?"],
      [[], "Noted. I'll check it against the follow-up sheet and confirm as soon as the supplier answers."],
    ],
    quick: ["What are you doing right now?", "Which POs are the most late?", "Who hasn't confirmed?"],
  },
  sofia: {
    role: "Sales",
    working: [
      "Qualifying HubSpot leads",
      "Writing a follow-up to Grupo Andino",
      "Updating the pipeline",
      "Preparing the Farmacias Cruz proposal",
    ],
    kpis: [
      { label: "Leads today", value: "38" },
      { label: "Meetings booked", value: "6" },
      { label: "Response rate", value: "41%" },
    ],
    replies: [
      [K_NOW, "Right now I'm qualifying the 38 leads that came in from the website and LinkedIn. I've already booked 6 meetings for this week and I'm drafting the follow-up for Grupo Andino, who opened the proposal twice yesterday."],
      [K_SUMMARY, "Today's summary: 38 new leads, 22 qualified, 6 meetings booked and 2 proposals sent (Farmacias Cruz and Logística del Pacífico). The pipeline is up $18,400 from yesterday."],
      [K_PENDING, "Pending: send the revised quote to Farmacias Cruz before 5:00 PM, confirm Thursday's demo with Grupo Andino and clean up 14 duplicate leads in the CRM."],
      [["lead", "client", "prospect", "customer"], "The hottest leads right now are Grupo Andino (score 92), Farmacias Cruz (88) and Cooperativa 29 de Octubre (81). Want me to prioritize one of them?"],
      [K_HELLO, "Hi! I'm Sofía, your sales rep. I work 24/7 on the CRM: I qualify leads, write follow-ups and book meetings. How can I help?"],
      [[], "Noted. I'll add it to my list and let you know as soon as it's ready. In the meantime I'll keep working this week's pipeline."],
    ],
    quick: [Q_NOW, Q_SUMMARY, Q_PENDING],
  },
  mateo: {
    role: "Support",
    working: [
      "Answering Zendesk tickets",
      "Resolving a billing complaint",
      "Updating the knowledge base",
      "Escalating a case to a human",
    ],
    kpis: [
      { label: "Tickets resolved", value: "127" },
      { label: "Response time", value: "42 s" },
      { label: "Satisfaction (CSAT)", value: "4.8 / 5" },
    ],
    replies: [
      [K_NOW, "I'm in the support inbox: 127 tickets resolved today, 9 open. Right now I'm replying to a customer who can't download their August invoice; I found the cause and I'm sending them the corrected link."],
      [K_SUMMARY, "Today: 136 tickets received, 127 resolved with no human intervention, 3 escalated to your team. Average first response time: 42 seconds. Today's CSAT: 4.8 out of 5."],
      [K_PENDING, "9 tickets are still open. Three are waiting on the customer, five I'll resolve within the hour, and one (a refund over $500) needs your approval."],
      [["escalat", "human", "urgent"], "I escalated 3 cases today: a $640 refund, a social media complaint from an enterprise customer and a legal request. All three have a summary and context in your inbox."],
      [K_HELLO, "Hi! I'm Mateo. I handle customer support over email, chat and WhatsApp, 24 hours a day. Ask me about any ticket."],
      [[], "Got it, I'll look into it right now and get back to you with the details shortly. I'll keep working the inbox in the meantime."],
    ],
    quick: [Q_NOW, "Which cases did you escalate?", Q_SUMMARY],
  },
  valentina: {
    role: "Marketing",
    working: [
      "Scheduling this week's posts",
      "Designing the Instagram carousel",
      "Replying to LinkedIn comments",
      "Analyzing the September campaign",
    ],
    kpis: [
      { label: "Posts scheduled", value: "14" },
      { label: "Weekly reach", value: "48.2k" },
      { label: "Engagement", value: "+23%" },
    ],
    replies: [
      [K_NOW, "I'm building next week's content calendar: 14 posts across Instagram, LinkedIn and TikTok. Right now I'm writing the carousel for the October launch and replying to comments on yesterday's post."],
      [K_SUMMARY, "Today I published 4 pieces, replied to 63 comments and messages, and weekly reach is at 48.2k (+23% engagement vs. last week). Tuesday's short video is the best-performing content of the month."],
      [K_PENDING, "Pending: your approval on the 3 launch posts, closing out the September campaign report and preparing 5 reel ideas for next week."],
      [["campaign", "ads", "advert"], "The September campaign has $1,240 spent, 312 leads and a $3.97 cost per lead, 18% better than August. I recommend moving budget from Facebook to Instagram Reels."],
      [K_HELLO, "Hi! I'm Valentina. I run social media and content: I write, design, schedule and engage with the community. What do you need?"],
      [[], "Love it! I'll add it to the content calendar and show you a draft in a few minutes."],
    ],
    quick: [Q_NOW, "How's the campaign going?", Q_PENDING],
  },
  nicolas: {
    role: "Engineering",
    working: [
      "Fixing a checkout bug",
      "Running the test suite",
      "Reviewing a pull request",
      "Deploying to staging",
    ],
    kpis: [
      { label: "PRs today", value: "5" },
      { label: "Tests", value: "248 ✓" },
      { label: "Uptime", value: "99.98%" },
    ],
    replies: [
      [K_NOW, "I'm fixing a bug in the checkout: the discount wasn't applied when coupons were typed in uppercase. The fix is ready with tests (248 passing) and I'm deploying it to staging for you to review."],
      [K_SUMMARY, "Today: 5 pull requests, 2 deployed to production, 0 incidents. I cut the catalog load time from 2.4s to 0.9s and documented the orders endpoint."],
      [K_PENDING, "Pending: your review of PR #482 (checkout), migrating the staging database tonight and updating the dependencies with security alerts."],
      [["bug", "error", "fail", "broken", "down"], "The only open bug is the checkout one, already fixed and in testing. Production is stable: 99.98% uptime this month, no 5xx errors in the last 6 hours."],
      [K_HELLO, "Hi! I'm Nicolás, the team's software engineer. I write code, tests and deployments. Ask me about any technical task."],
      [[], "Understood. I'll create the task, estimate the effort and propose a plan in the next PR."],
    ],
    quick: [Q_NOW, "Are there any bugs?", Q_SUMMARY],
  },
  camila: {
    role: "Finance",
    working: [
      "Reconciling bank payments",
      "Issuing electronic invoices",
      "Preparing the cash flow",
      "Reviewing September expenses",
    ],
    kpis: [
      { label: "Invoices issued", value: "42" },
      { label: "Collected today", value: "$12,480" },
      { label: "Receivable", value: "$31,200" },
    ],
    replies: [
      [K_NOW, "I'm reconciling Banco Pichincha payments against the SRI invoices: 42 invoices issued today, 39 already collected. Right now I'm matching 3 unreferenced transfers against the customer list."],
      [K_SUMMARY, "Today: $12,480 collected, $31,200 receivable (4 overdue invoices), 42 invoices issued to the SRI with no rejections. The 30-day projected cash flow closes positive at $58,900."],
      [K_PENDING, "Pending: payment reminders for the 4 overdue invoices, filing VAT before the 20th and your approval for Friday's supplier payment ($8,350)."],
      [["cash", "flow", "money", "collect", "receivable"], "Cash flow: current balance $74,300, expected 30-day income $61,200, outgoings $76,600. Closes at $58,900. No liquidity alerts."],
      [K_HELLO, "Hi! I'm Camila. I handle invoicing, collections and financial reports. Which number do you need?"],
      [[], "I'll check it against the accounting records and send you the details in a spreadsheet in a few minutes."],
    ],
    quick: [Q_NOW, "How's the cash flow?", Q_PENDING],
  },
  andres: {
    role: "Operations",
    working: [
      "Coordinating the team's schedule",
      "Confirming appointments over WhatsApp",
      "Ordering supplies from the vendor",
      "Updating inventory",
    ],
    kpis: [
      { label: "Appointments confirmed", value: "23" },
      { label: "Orders in progress", value: "7" },
      { label: "Inventory OK", value: "98%" },
    ],
    replies: [
      [K_NOW, "I'm confirming tomorrow's appointments over WhatsApp: 23 confirmed, 2 rescheduled. Right now I'm ordering the supplies that dropped below the inventory minimum from the vendor."],
      [K_SUMMARY, "Today: 23 appointments confirmed, 2 reschedules, 7 vendor orders in progress and inventory at 98%. Zero unconfirmed customers."],
      [K_PENDING, "Pending: receiving the supplies order on Thursday, scheduling the monthly team meeting and your sign-off to renew the cleaning contract."],
      [["schedule", "appointment", "meeting", "calendar", "agenda"], "Tomorrow you have 3 meetings: 9:00 AM with Grupo Andino, 11:30 AM internal review and 3:00 PM demo with Farmacias Cruz. I left you 45 minutes free at midday."],
      [K_HELLO, "Hi! I'm Andrés. I coordinate the schedule, vendors and inventory. Tell me what you need organized."],
      [[], "Done, I'll coordinate it. I'll confirm here as soon as it's sorted."],
    ],
    quick: [Q_NOW, "How's the schedule looking?", Q_SUMMARY],
  },
  lucia: {
    role: "People",
    working: ["Screening candidates", "Scheduling interviews", "Preparing onboarding", "Updating payroll"],
    kpis: [
      { label: "Candidates", value: "24" },
      { label: "Interviews", value: "5" },
      { label: "Onboardings", value: "2" },
    ],
    replies: [
      [K_NOW, "I'm screening 24 candidates for the support role and scheduling 5 interviews for this week. Now I'm preparing onboarding for the two new hires."],
      [K_SUMMARY, "Today: 24 candidates screened, 5 interviews scheduled, 2 onboardings ready and September payroll reviewed with no discrepancies."],
      [K_PENDING, "Pending: your approval of the offer for the sales role and confirming the date of the monthly training."],
      [K_HELLO, "Hi! I'm Lucía. I look after people: recruiting, onboarding and team culture."],
      [[], "Noted. I'll coordinate it with the team and confirm here."],
    ],
    quick: [Q_NOW, Q_SUMMARY, Q_PENDING],
  },
  diego: {
    role: "Design",
    working: ["Designing the checkout screen", "Tuning the design system", "Preparing the prototype", "Reviewing accessibility"],
    kpis: [
      { label: "Screens", value: "12" },
      { label: "Prototypes", value: "3" },
      { label: "User tests", value: "4" },
    ],
    replies: [
      [K_NOW, "I'm designing the new checkout screen: 12 screens done and a clickable prototype for Thursday's demo."],
      [K_SUMMARY, "Today: 12 screens, 3 prototypes and 4 user tests. The new pay button lifted conversion 9% in testing."],
      [K_PENDING, "Pending: your feedback on the color palette and exporting the icons for Nicolás."],
      [K_HELLO, "Hi! I'm Diego. I design the product: interfaces, prototypes and user testing."],
      [[], "Good idea. I'll try it in the prototype and show you two options."],
    ],
    quick: [Q_NOW, Q_SUMMARY, Q_PENDING],
  },
  emma: {
    role: "Legal",
    working: ["Reviewing the Grupo Andino contract", "Updating the data policy", "Preparing the NDA", "Reviewing the terms of service"],
    kpis: [
      { label: "Contracts", value: "7" },
      { label: "Reviews", value: "15" },
      { label: "Open risks", value: "1" },
    ],
    replies: [
      [K_NOW, "I'm reviewing the Grupo Andino contract: 7 contracts in progress, 15 clauses reviewed today and a single open risk (90-day payment terms)."],
      [K_SUMMARY, "Today: 7 contracts reviewed, the data policy updated and the Farmacias Cruz NDA ready for signature."],
      [K_PENDING, "Pending: your decision on Grupo Andino's payment terms and signing the Farmacias Cruz NDA."],
      [K_HELLO, "Hi! I'm Emma. I review contracts, policies and compliance."],
      [[], "I'll review it from a legal standpoint and send you a summary of the risks."],
    ],
    quick: [Q_NOW, Q_SUMMARY, Q_PENDING],
  },
  tomas: {
    role: "Data",
    working: ["Training the churn model", "Cleaning sales data", "Building the dashboard", "Analyzing the campaign"],
    kpis: [
      { label: "Models", value: "3" },
      { label: "Accuracy", value: "94%" },
      { label: "Reports", value: "8" },
    ],
    replies: [
      [K_NOW, "I'm training the churn model on September data: 94% accuracy. I'm also cleaning the sales data for the dashboard."],
      [K_SUMMARY, "Today: 3 models updated, 8 reports generated and the operations dashboard running on real-time data."],
      [K_PENDING, "Pending: validating the model with Sofía and publishing the weekly report on Friday."],
      [K_HELLO, "Hi! I'm Tomás. I analyze data and train models for the team."],
      [[], "I'll check the data and bring you the exact figure in a moment."],
    ],
    quick: [Q_NOW, Q_SUMMARY, Q_PENDING],
  },
  ana: {
    role: "Reception",
    working: ["Greeting visitors", "Confirming today's appointments", "Handling packages", "Answering calls"],
    kpis: [
      { label: "Visitors today", value: "9" },
      { label: "Calls", value: "31" },
      { label: "Appointments", value: "6" },
    ],
    replies: [
      [K_NOW, "I'm at the front desk: 9 visitors checked in today, 31 calls answered and 6 appointments confirmed. Right now I'm waiting for the Grupo Andino team."],
      [K_SUMMARY, "Today: 9 visitors, 31 calls, 6 appointments and 3 packages received. No unregistered visits."],
      [K_PENDING, "Pending: the Grupo Andino visit at 3:00 PM and confirming Friday's catering."],
      [K_HELLO, "Welcome! I'm Ana. I run the front desk: visitors, calls and the schedule."],
      [[], "Happy to, I'll take care of it right now."],
    ],
    quick: [Q_NOW, "Who's coming in today?", Q_SUMMARY],
  },
};

const cache = new Map<Lang, Bot[]>();

/** The bots with their text in `lang`. Memoized per language. */
export function botsFor(lang: Lang): Bot[] {
  const hit = cache.get(lang);
  if (hit) return hit;
  const bots = lang === "es" ? BASE : BASE.map((b) => ({ ...b, ...(EN[b.id] ?? {}) }));
  cache.set(lang, bots);
  return bots;
}

export function botById(lang: Lang, id: string): Bot | undefined {
  return botsFor(lang).find((b) => b.id === id);
}

export function reply(bot: Bot, text: string): string {
  const t = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  for (const [keys, ans] of bot.replies) {
    if (keys.length === 0) return ans;
    if (keys.some((k) => t.includes(k))) return ans;
  }
  return bot.replies[bot.replies.length - 1][1];
}
