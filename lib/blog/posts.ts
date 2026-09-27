// Blog content source — shared by the blog index, the home news grid, and the
// individual article pages. Plain data (no "use client") so the server route
// can read it for generateStaticParams / metadata and the client renderer can
// read it for the body. Bilingual throughout.

export type Bi = { en: string; es: string };
export type BiList = { en: string[]; es: string[] };

export type Block =
  | { t: "h2"; en: string; es: string }
  | { t: "p"; en: string; es: string }
  | { t: "quote"; en: string; es: string }
  | { t: "ul"; en: string[]; es: string[] };

export interface Post {
  slug: string;
  tag: Bi;
  title: Bi;
  excerpt: Bi;
  cover: string;
  /** optional right-sized copy (800×450) for small cards; falls back to `cover` */
  coverCard?: string;
  bg: string;
  onDark: boolean;
  dateLabel: Bi;
  readMins: number;
  author: Bi;
  body: Block[];
}

export const POSTS: Post[] = [
  {
    slug: "ai-management-office",
    tag: { en: "AI OFFICE", es: "OFICINA IA" },
    title: {
      en: "Inside the AI Management Office: a company run by AI employees you can watch",
      es: "Dentro de la Oficina de Gestión con IA: una empresa operada por empleados IA que puedes ver",
    },
    excerpt: {
      en: "One AI agent per role, working inside your real tools, with a 3D office where you can see every screen, chat with each agent, and approve what needs a signature.",
      es: "Un agente de IA por rol, trabajando dentro de tus herramientas reales, con una oficina 3D donde ves cada pantalla, chateas con cada agente y apruebas lo que necesita firma.",
    },
    cover: "/office-demo-preview.webp",
    bg: "#e8dfc9",
    onDark: false,
    dateLabel: { en: "September 27, 2026", es: "27 de septiembre de 2026" },
    readMins: 5,
    author: { en: "Carlos Pozo · Founder", es: "Carlos Pozo · Fundador" },
    body: [
      {
        t: "p",
        en: "Most companies don't have an AI problem. They have a routine-work problem: the same invoices to chase, the same support tickets to triage, the same leads to qualify, week after week. The AI Management Office is our answer to that. It's not a chatbot and it's not a dashboard bolted onto one. It's a small team of AI employees, one per role, doing that routine work inside the tools your company already uses.",
        es: "La mayoría de las empresas no tiene un problema de IA. Tiene un problema de trabajo rutinario: las mismas facturas por cobrar, los mismos tickets de soporte por clasificar, los mismos leads por calificar, semana tras semana. La Oficina de Gestión con IA es nuestra respuesta a eso. No es un chatbot ni un dashboard pegado a uno. Es un equipo pequeño de empleados IA, uno por rol, que hace ese trabajo rutinario dentro de las herramientas que tu empresa ya usa.",
      },
      {
        t: "h2",
        en: "One agent per role",
        es: "Un agente por rol",
      },
      {
        t: "p",
        en: "Each agent owns a job the way a person would: sales qualifies and follows up on leads, support answers and escalates tickets, finance reconciles and chases invoices, marketing drafts and schedules, operations keeps the queue moving, and reception routes whatever comes in the front door. They don't live in a separate app. They log into your CRM, your inbox, your accounting system and your calendar, with their own credentials and least-privilege access, and leave a trail you can audit.",
        es: "Cada agente es dueño de un trabajo como lo sería una persona: ventas califica y hace seguimiento de leads, soporte responde y escala tickets, finanzas concilia y cobra facturas, marketing redacta y programa, operaciones mantiene la cola en movimiento y recepción enruta todo lo que entra por la puerta. No viven en una app aparte. Entran a tu CRM, tu correo, tu sistema contable y tu calendario, con sus propias credenciales y acceso de privilegios mínimos, y dejan un rastro que puedes auditar.",
      },
      {
        t: "h2",
        en: "Why a 3D office",
        es: "Por qué una oficina 3D",
      },
      {
        t: "p",
        en: "The honest reason is visibility. The hardest part of handing work to software isn't the software, it's not knowing what it's doing. So we built the office you would actually walk through if these were people. Every agent has a desk and a live screen. You can watch the finance agent work through a reconciliation, open the support agent's queue, or click on any of them and ask what they're doing and why.",
        es: "La razón honesta es visibilidad. Lo más difícil de delegarle trabajo al software no es el software, es no saber qué está haciendo. Así que construimos la oficina por la que caminarías si fueran personas. Cada agente tiene un escritorio y una pantalla en vivo. Puedes ver al agente de finanzas conciliar, abrir la cola del agente de soporte, o hacer clic en cualquiera y preguntarle qué está haciendo y por qué.",
      },
      {
        t: "ul",
        en: [
          "Live screens: what each agent is working on right now, not a summary written afterward.",
          "Chat with any agent, in plain language, and get an answer grounded in its actual records.",
          "Dashboards per area with 30-day trends, so you see the direction, not just today's number.",
          "Cost per area, so you know exactly what each function is spending.",
          "An approval queue: anything that needs a signature waits for a human, with the context attached.",
        ],
        es: [
          "Pantallas en vivo: en qué está trabajando cada agente ahora mismo, no un resumen escrito después.",
          "Chatea con cualquier agente, en lenguaje natural, y recibe una respuesta anclada en sus registros reales.",
          "Dashboards por área con tendencias a 30 días, para ver la dirección y no solo el número de hoy.",
          "Costo por área, para saber exactamente cuánto gasta cada función.",
          "Una cola de aprobaciones: todo lo que necesita firma espera a una persona, con el contexto adjunto.",
        ],
      },
      {
        t: "quote",
        en: "If you can't see what an agent is doing, you won't trust it with anything that matters. The office is the trust layer.",
        es: "Si no puedes ver lo que hace un agente, no le vas a confiar nada que importe. La oficina es la capa de confianza.",
      },
      {
        t: "h2",
        en: "How an engagement works",
        es: "Cómo funciona un proyecto",
      },
      {
        t: "p",
        en: "We start by mapping the routine work: two or three weeks shadowing the roles, listing the tasks that repeat, the tools they touch and the decisions that must stay human. Then you hire the agents you need, one role at a time. We connect them to your systems, set the approval rules, and run them alongside your team. From there you watch it run in the office, adjust what needs adjusting, and add roles as the first ones earn their place.",
        es: "Empezamos mapeando el trabajo rutinario: dos o tres semanas acompañando a los roles, listando las tareas que se repiten, las herramientas que tocan y las decisiones que deben seguir siendo humanas. Luego contratas los agentes que necesitas, un rol a la vez. Los conectamos a tus sistemas, definimos las reglas de aprobación y los ponemos a trabajar junto a tu equipo. Desde ahí ves cómo funciona en la oficina, ajustas lo que haga falta y sumas roles a medida que los primeros se ganan su lugar.",
      },
      {
        t: "h2",
        en: "What it costs",
        es: "Qué cuesta",
      },
      {
        t: "p",
        en: "An agent runs for a fraction of what the equivalent headcount costs, and it works the night shift without being asked. We won't put a universal number on it because it depends on your volume and the tools involved, but the cost-per-area view in the office shows you the real figure every day, next to the work it produced. The point isn't to replace your team. It's to give the people you have their week back.",
        es: "Un agente cuesta una fracción de lo que costaría el puesto equivalente, y trabaja el turno de noche sin que nadie se lo pida. No vamos a poner un número universal porque depende de tu volumen y de las herramientas involucradas, pero la vista de costo por área en la oficina te muestra la cifra real cada día, junto al trabajo que produjo. La idea no es reemplazar a tu equipo. Es devolverle a la gente que ya tienes su semana.",
      },
      {
        t: "h2",
        en: "See it running",
        es: "Míralo funcionando",
      },
      {
        t: "p",
        en: "The office is live at /office-demo/ with real agents, real dashboards and a guided tour that walks you desk by desk. Open it, click on an agent, and ask it what it's doing. If it feels like a team you'd want, that's the conversation we'd like to have next.",
        es: "La oficina está en vivo en /office-demo/ con agentes reales, dashboards reales y un recorrido guiado que te lleva escritorio por escritorio. Ábrela, haz clic en un agente y pregúntale qué está haciendo. Si se siente como un equipo que querrías tener, esa es la conversación que nos gustaría tener después.",
      },
    ],
  },
  {
    slug: "ai-first-software-lab",
    tag: { en: "COMPANY", es: "COMPAÑÍA" },
    title: {
      en: "MindfulTech is now an AI-first software lab",
      es: "MindfulTech ahora es un laboratorio de software AI-first",
    },
    excerpt: {
      en: "Ten years of human-centered software, now with applied AI in every engagement. Here's what changes, and what never will.",
      es: "Diez años de software centrado en personas, ahora con IA aplicada en cada proyecto. Esto es lo que cambia, y lo que nunca cambiará.",
    },
    cover: "/blog/ai-first-software-lab.webp",
    coverCard: "/blog/ai-first-software-lab-card.webp",
    bg: "#0e0d12",
    onDark: true,
    dateLabel: { en: "July 15, 2026", es: "15 de julio de 2026" },
    readMins: 4,
    author: { en: "Carlos Pozo · Founder", es: "Carlos Pozo · Fundador" },
    body: [
      {
        t: "p",
        en: "For a decade we've built products the same way: start with the people who'll use them, ship something real, and improve it with evidence. Today we're changing how we build, not why.",
        es: "Durante una década construimos productos de la misma forma: empezar por las personas que los van a usar, lanzar algo real y mejorarlo con evidencia. Hoy cambiamos cómo construimos, no por qué.",
      },
      {
        t: "h2",
        en: "What \"AI-first\" means for us",
        es: "Qué significa \"AI-first\" para nosotros",
      },
      {
        t: "p",
        en: "AI-first doesn't mean AI-only. It means every engagement now starts by asking where a model can remove real work (drafting, extracting, classifying, routing) and where a human still has to stay in the loop. The interesting products live on that boundary.",
        es: "AI-first no significa solo IA. Significa que cada proyecto empieza preguntando dónde un modelo puede quitar trabajo real (redactar, extraer, clasificar, enrutar) y dónde una persona todavía tiene que quedarse en el circuito. Los productos interesantes viven en ese límite.",
      },
      {
        t: "p",
        en: "You can see the pattern across our recent work: an agent that runs a US clinic's medical billing end to end, an iOS events platform with an AI survey module, a seller CRM that reads Meta leads and drafts replies. Different industries, same idea: automate the busywork, keep the judgment human.",
        es: "El patrón se ve en nuestro trabajo reciente: un agente que factura de punta a punta para una clínica en EE.UU., una plataforma de eventos en iOS con un módulo de encuestas con IA, un CRM de vendedores que lee leads de Meta y redacta respuestas. Distintas industrias, la misma idea: automatizar lo repetitivo y dejar el criterio en manos humanas.",
      },
      {
        t: "h2",
        en: "What never changes",
        es: "Lo que nunca cambia",
      },
      {
        t: "ul",
        en: [
          "Research before code: we still start with the people who'll use it.",
          "Ship to production: a demo isn't a product.",
          "Human review where it matters: especially in healthcare and money.",
          "Own the whole stack: design, build, deploy, and stay.",
        ],
        es: [
          "Investigación antes que código: seguimos empezando por quienes lo van a usar.",
          "Llegar a producción, un demo no es un producto.",
          "Revisión humana donde importa: sobre todo en salud y en dinero.",
          "Dueños de todo el stack: diseñar, construir, desplegar y quedarnos.",
        ],
      },
      {
        t: "h2",
        en: "Why now",
        es: "Por qué ahora",
      },
      {
        t: "p",
        en: "The models finally crossed the line from \"impressive demo\" to \"dependable teammate\" for a narrow, well-defined job. The hard part was never the model, it's the plumbing around it: grounding it in real data, giving it tools, and designing the moments where a person checks its work. That's the work we've spent ten years getting good at.",
        es: "Los modelos por fin cruzaron la línea de \"demo impresionante\" a \"colega confiable\" para una tarea acotada y bien definida. La parte difícil nunca fue el modelo, es la fontanería alrededor: anclarlo en datos reales, darle herramientas y diseñar los momentos en que una persona revisa su trabajo. En eso llevamos diez años volviéndonos buenos.",
      },
      {
        t: "quote",
        en: "The model is the easy part. Trust is the product.",
        es: "El modelo es la parte fácil. La confianza es el producto.",
      },
      {
        t: "p",
        en: "If you're weighing where AI actually fits in your product, that's exactly the conversation we like to have.",
        es: "Si estás pensando dónde encaja de verdad la IA en tu producto, esa es justamente la conversación que nos gusta tener.",
      },
    ],
  },
  {
    slug: "eventflow-usfq",
    tag: { en: "CASE STUDY", es: "CASO DE ESTUDIO" },
    title: {
      en: "EventFlow: the iOS app behind USFQ campus events",
      es: "EventFlow: la app iOS detrás de los eventos de la USFQ",
    },
    excerpt: {
      en: "Published in the App Store, with an AI survey module that turns open feedback into themes.",
      es: "Publicada en el App Store, con un módulo de encuestas con IA que convierte los comentarios en temas.",
    },
    cover: "/blog/eventflow-usfq.webp",
    coverCard: "/blog/eventflow-usfq-card.webp",
    bg: "#0e0d12",
    onDark: true,
    dateLabel: { en: "June 20, 2026", es: "20 de junio de 2026" },
    readMins: 5,
    author: { en: "MindfulTech", es: "MindfulTech" },
    body: [
      {
        t: "p",
        en: "USFQ runs hundreds of campus events a year: talks, fairs, ceremonies, workshops. The people organizing them were living in spreadsheets, WhatsApp threads, and paper check-in lists. EventFlow replaced all of it with one iOS app.",
        es: "La USFQ organiza cientos de eventos al año: charlas, ferias, ceremonias, talleres. Quienes los coordinaban vivían entre hojas de cálculo, chats de WhatsApp y listas de asistencia en papel. EventFlow reemplazó todo eso con una sola app en iOS.",
      },
      {
        t: "h2",
        en: "The problem",
        es: "El problema",
      },
      {
        t: "p",
        en: "Every event repeated the same manual loop: build a registration form, publish it somewhere, collect responses, print a list, check people in at the door by hand, and (if anyone remembered) send a survey afterward. Nothing connected to anything else.",
        es: "Cada evento repetía el mismo ciclo manual: armar un formulario de registro, publicarlo en algún lado, recibir respuestas, imprimir una lista, hacer el check-in a mano en la puerta y (si alguien se acordaba) enviar una encuesta después. Nada estaba conectado.",
      },
      {
        t: "h2",
        en: "What we built",
        es: "Qué construimos",
      },
      {
        t: "ul",
        en: [
          "Event creation with custom registration pages.",
          "A published iOS app for organizers and attendees.",
          "On-device ticket scanning for fast door check-in.",
          "Real-time dashboards for turnout and registrations.",
          "An AI survey module that turns open-ended feedback into themes.",
        ],
        es: [
          "Creación de eventos con páginas de registro personalizadas.",
          "Una app iOS publicada para organizadores y asistentes.",
          "Escaneo de tickets en el dispositivo para un check-in rápido.",
          "Dashboards en tiempo real de asistencia y registros.",
          "Un módulo de encuestas con IA que convierte los comentarios abiertos en temas.",
        ],
      },
      {
        t: "p",
        en: "The survey module is the part organizers didn't expect to love. Instead of reading hundreds of free-text answers, they get the recurring themes surfaced automatically, with the raw responses one tap away when they want the detail.",
        es: "El módulo de encuestas es lo que los organizadores no esperaban querer tanto. En vez de leer cientos de respuestas de texto libre, reciben los temas recurrentes de forma automática, con las respuestas originales a un toque de distancia cuando quieren el detalle.",
      },
      {
        t: "h2",
        en: "Human-centered, then shipped",
        es: "Centrado en las personas, y luego lanzado",
      },
      {
        t: "p",
        en: "We started with the organizers, not the feature list: shadowing a real event day to see where the time actually went. Then we built, tested on live events, and published to the App Store.",
        es: "Empezamos por los organizadores, no por la lista de funciones: acompañando un día de evento real para ver a dónde se iba el tiempo. Luego construimos, probamos en eventos reales y publicamos en el App Store.",
      },
      {
        t: "quote",
        en: "The goal was never \"an app.\" It was giving organizers their event day back.",
        es: "La meta nunca fue \"una app\". Era devolverles a los organizadores su día de evento.",
      },
    ],
  },
  {
    slug: "helixona-billing-agent",
    tag: { en: "ENGINEERING", es: "INGENIERÍA" },
    title: {
      en: "Inside the AI agent that runs a US clinic's medical billing",
      es: "Así opera el agente de IA que factura para Helixona",
    },
    excerpt: {
      en: "Reading the practice's records, preparing claims, and handling payer submissions: end to end, with a human check where it counts.",
      es: "Leyendo los registros de la clínica, preparando reclamos y gestionando envíos a las aseguradoras, de punta a punta, con revisión humana donde importa.",
    },
    cover: "/blog/helixona-billing-agent.webp",
    coverCard: "/blog/helixona-billing-agent-card.webp",
    bg: "#f4efe3",
    onDark: false,
    dateLabel: { en: "May 28, 2026", es: "28 de mayo de 2026" },
    readMins: 6,
    author: { en: "MindfulTech Engineering", es: "Ingeniería de MindfulTech" },
    body: [
      {
        t: "p",
        en: "Medical billing is where a lot of a US clinic's revenue quietly leaks. It's repetitive, rules-heavy, and unforgiving of small mistakes. For Helixona we built an AI agent that handles the repetitive parts end to end, and knows exactly when to stop and ask a human.",
        es: "La facturación médica es donde se fuga en silencio buena parte de los ingresos de una clínica en EE.UU. Es repetitiva, llena de reglas e implacable con los errores pequeños. Para Helixona construimos un agente de IA que se encarga de las partes repetitivas de punta a punta, y sabe exactamente cuándo detenerse y preguntarle a una persona.",
      },
      {
        t: "h2",
        en: "The shape of the problem",
        es: "La forma del problema",
      },
      {
        t: "p",
        en: "A claim touches many systems: the record where the visit is documented, payer portals with their own rules, coding references, and document stores. A biller spends the day moving information between them and catching the cases that don't fit the template.",
        es: "Un reclamo toca muchos sistemas: el registro donde se documenta la visita, los portales de las aseguradoras con sus propias reglas, las referencias de codificación y los repositorios de documentos. Un facturador pasa el día moviendo información entre ellos y atrapando los casos que no encajan en la plantilla.",
      },
      {
        t: "h2",
        en: "How the agent works",
        es: "Cómo funciona el agente",
      },
      {
        t: "ul",
        en: [
          "It reads structured and unstructured data from the practice's systems.",
          "It assembles and validates claims against payer rules.",
          "It prepares submissions and tracks their status.",
          "It routes anything ambiguous to a human, with the context attached.",
        ],
        es: [
          "Lee datos estructurados y no estructurados de los sistemas de la clínica.",
          "Arma y valida los reclamos contra las reglas de cada aseguradora.",
          "Prepara los envíos y hace seguimiento de su estado.",
          "Deriva cualquier caso ambiguo a una persona, con el contexto adjunto.",
        ],
      },
      {
        t: "p",
        en: "The design principle is boring on purpose: the agent should be confidently right or clearly unsure, never confidently wrong. Every action is grounded in real records, and the moments that touch money or care get reviewed.",
        es: "El principio de diseño es aburrido a propósito: el agente debe estar seguro y en lo correcto, o claramente en duda, nunca seguro y equivocado. Cada acción está anclada en registros reales, y los momentos que tocan dinero o atención se revisan.",
      },
      {
        t: "h2",
        en: "Why an agent, not a script",
        es: "Por qué un agente y no un script",
      },
      {
        t: "p",
        en: "The rules change, the edge cases are endless, and the documents are messy. A rigid script breaks on the first exception; an agent with tools and guardrails handles the long tail and escalates the rest.",
        es: "Las reglas cambian, los casos borde son infinitos y los documentos son desordenados. Un script rígido se rompe con la primera excepción; un agente con herramientas y barreras de seguridad maneja la cola larga y escala el resto.",
      },
      {
        t: "quote",
        en: "In healthcare and in money, \"mostly right\" isn't a spec. The review step is the feature.",
        es: "En salud y en dinero, \"casi siempre bien\" no es una especificación. El paso de revisión es la función.",
      },
      {
        t: "p",
        en: "We treat protected health information with the care it demands: least-privilege access, data that stays in the systems it belongs in, and a human on anything consequential.",
        es: "Tratamos la información médica protegida con el cuidado que exige: acceso con privilegios mínimos, datos que se quedan en los sistemas a los que pertenecen y una persona en todo lo que tenga consecuencias.",
      },
    ],
  },
  {
    slug: "designing-ai-people-trust",
    tag: { en: "RESEARCH", es: "INVESTIGACIÓN" },
    title: {
      en: "Designing AI features people trust",
      es: "Diseñando funciones de IA en las que la gente confía",
    },
    excerpt: {
      en: "Our playbook for grounding, transparency, and human review in production AI.",
      es: "Nuestro playbook de grounding, transparencia y revisión humana en IA de producción.",
    },
    cover: "/blog/designing-ai-people-trust.webp",
    coverCard: "/blog/designing-ai-people-trust-card.webp",
    bg: "#f4efe3",
    onDark: false,
    dateLabel: { en: "May 10, 2026", es: "10 de mayo de 2026" },
    readMins: 5,
    author: { en: "MindfulTech Research", es: "Investigación de MindfulTech" },
    body: [
      {
        t: "p",
        en: "Shipping an AI feature is easy. Shipping one people actually rely on is not. After building agents for healthcare, sales, and events, we've converged on a short playbook.",
        es: "Lanzar una función de IA es fácil. Lanzar una en la que la gente de verdad confíe, no. Después de construir agentes para salud, ventas y eventos, llegamos a un playbook corto.",
      },
      {
        t: "h2",
        en: "1. Ground everything",
        es: "1. Ancla todo en datos reales",
      },
      {
        t: "p",
        en: "A feature that answers from the model's memory will eventually make something up. One that answers from your data, with a link back to the source, won't. Retrieval isn't a nice-to-have, it's the difference between a toy and a tool.",
        es: "Una función que responde desde la memoria del modelo tarde o temprano inventará algo. Una que responde desde tus datos, con un enlace a la fuente, no. El retrieval no es un lujo, es la diferencia entre un juguete y una herramienta.",
      },
      {
        t: "h2",
        en: "2. Show your work",
        es: "2. Muestra el trabajo",
      },
      {
        t: "p",
        en: "Users trust what they can inspect. Every AI output should carry its evidence one tap away: the record it came from, its confidence, its reasoning. Transparency turns \"magic\" into \"I can check this.\"",
        es: "La gente confía en lo que puede inspeccionar. Cada salida de IA debe llevar su evidencia a un toque de distancia, el registro del que vino, su confianza, su razonamiento. La transparencia convierte la \"magia\" en \"esto lo puedo verificar\".",
      },
      {
        t: "h2",
        en: "3. Design the human moment",
        es: "3. Diseña el momento humano",
      },
      {
        t: "p",
        en: "The question isn't \"human or AI?\" It's where the human belongs. We map every flow for the moments that touch money, health, or reputation, and put a person there, with the context already assembled so the review takes seconds, not minutes.",
        es: "La pregunta no es \"¿humano o IA?\". Es dónde va la persona. Mapeamos cada flujo buscando los momentos que tocan dinero, salud o reputación, y ponemos ahí a una persona, con el contexto ya armado para que la revisión tome segundos, no minutos.",
      },
      {
        t: "h2",
        en: "4. Fail loudly, not silently",
        es: "4. Falla en voz alta, no en silencio",
      },
      {
        t: "ul",
        en: [
          "Say \"I'm not sure\" instead of guessing.",
          "Escalate with context, not a dead end.",
          "Make the safe path the easy path.",
        ],
        es: [
          "Decir \"no estoy seguro\" en vez de adivinar.",
          "Escalar con contexto, no con un callejón sin salida.",
          "Que el camino seguro sea el camino fácil.",
        ],
      },
      {
        t: "quote",
        en: "The best AI feature feels less like magic and more like a very fast, very careful colleague.",
        es: "La mejor función de IA se siente menos como magia y más como un colega muy rápido y muy cuidadoso.",
      },
      {
        t: "p",
        en: "That's the bar we build to, and the conversation we're always happy to have.",
        es: "Ese es el estándar con el que construimos, y la conversación que siempre nos alegra tener.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

// Same-tag posts first, then the newest of the rest; never the post itself.
export function relatedPosts(slug: string, n = 2): Post[] {
  const current = getPost(slug);
  const others = POSTS.filter((p) => p.slug !== slug);
  if (!current) return others.slice(0, n);
  const same = others.filter((p) => p.tag.en === current.tag.en);
  const rest = others.filter((p) => p.tag.en !== current.tag.en);
  return [...same, ...rest].slice(0, n);
}
