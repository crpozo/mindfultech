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
  bg: string;
  onDark: boolean;
  dateLabel: Bi;
  readMins: number;
  author: Bi;
  body: Block[];
}

export const POSTS: Post[] = [
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
    cover: "/art/ailab.webp",
    bg: "linear-gradient(140deg,color-mix(in srgb,var(--accent) 18%,#e8e4f4),#efeaf6 55%,color-mix(in srgb,var(--accent) 30%,#fff))",
    onDark: false,
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
    cover: "/portfolio/eventflow-banner.webp",
    bg: "linear-gradient(140deg,#141126,color-mix(in srgb,var(--accent) 55%,#141126))",
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
    cover: "/art/healthcare.webp",
    bg: "linear-gradient(140deg,color-mix(in srgb,var(--accent) 40%,#f0e8ee),#f6f1f5)",
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
    cover: "/art/research.webp",
    bg: "linear-gradient(140deg,#dfe6f2,#c9d4e8)",
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

export function relatedPosts(slug: string, n = 2): Post[] {
  return POSTS.filter((p) => p.slug !== slug).slice(0, n);
}
