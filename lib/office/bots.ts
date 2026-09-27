/**
 * The six AI employees of the office demo. Everything here is scripted: the
 * demo shows a client what a team of bots looks like, it does not run one.
 * `color` is the pastel for cards and avatars, `accent` the strong colour for
 * rings, bubbles and screens, and `look` how the 3D character is dressed.
 */
export type ScreenKind = "sales" | "support" | "social" | "dev" | "finance" | "ops";

/** How the character is built (see components/office/scene/character.js). */
export type Look = {
  skin: string;
  hair: string;
  hairStyle: "short" | "side" | "bun" | "ponytail" | "long" | "curly" | "bald";
  shirt: string;
  shirtStyle: "tee" | "collar" | "sweater" | "hoodie" | "blouse";
  sleeves: "long" | "short";
  pants: string;
  skirt?: boolean;
  shoes: string;
  glasses?: boolean;
  beard?: boolean;
  tie?: string;
  lanyard?: boolean;
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

export const BOTS: Bot[] = [
  {
    id: "sofia",
    name: "Sofía",
    role: "Ventas",
    title: "AI Sales Rep",
    color: "#f4d98a",
    accent: "#e0a83a",
    look: { skin: "#f3cdb0", hair: "#3b2418", hairStyle: "long", shirt: "#e9b949", shirtStyle: "sweater", sleeves: "long", pants: "#2b2d42", skirt: true, shoes: "#1c1c22" },
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
    look: { skin: "#d9a274", hair: "#1e1a1a", hairStyle: "short", shirt: "#2a9d8f", shirtStyle: "collar", sleeves: "short", pants: "#c9b48a", shoes: "#f1f1f1", glasses: true, lanyard: true },
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
    look: { skin: "#efc3a4", hair: "#7a3b1e", hairStyle: "bun", shirt: "#9b5de5", shirtStyle: "blouse", sleeves: "long", pants: "#1f1f24", shoes: "#6b3e2e" },
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
    look: { skin: "#c98b64", hair: "#211a17", hairStyle: "curly", shirt: "#457b9d", shirtStyle: "hoodie", sleeves: "long", pants: "#1d3557", shoes: "#8d99ae", beard: true },
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
    look: { skin: "#f6dcc6", hair: "#d9a55a", hairStyle: "ponytail", shirt: "#f4845f", shirtStyle: "blouse", sleeves: "short", pants: "#6c757d", shoes: "#1c1c22", glasses: true },
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
    look: { skin: "#8d5a3b", hair: "#141010", hairStyle: "side", shirt: "#f1faee", shirtStyle: "collar", sleeves: "long", pants: "#1b263b", shoes: "#5a3a28", tie: "#2d6a4f" },
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
];

export const BOT_BY_ID: Record<string, Bot> = Object.fromEntries(BOTS.map((b) => [b.id, b]));

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
