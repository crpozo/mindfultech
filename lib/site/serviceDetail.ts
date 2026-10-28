// Service detail content for /services/[slug] (moved out of the old ServiceDetail on 2026-10-24).
export type Service = {
  name: string;
  tag: string;
  title: string;
  subtitle: string;
  specs: [string, string][];
  why: { title: string; desc: string }[];
  highlight: { stat: string; label: string; title: string; desc: string; caseHref?: string };
  steps: { title: string; desc: string }[];
  engage: { title: string; forLabel: string; bullets: string[] }[];
  includes: { title: string; desc: string }[];
  tools: string[];
};

export const SERVICES: Record<string, Service> = {
  discovery: {
    name: "Workshops & Requirements Mapping",
    tag: "WORKSHOPS",
    title: "Know what to build before you build it",
    subtitle:
      "Facilitated workshops with your team that turn a vague need into mapped processes, prioritized requirements and a plan engineering can quote.",
    specs: [
      ["METHOD", "Facilitated workshops & process mapping"],
      ["BEST FOR", "New systems, AI initiatives, legacy replacements"],
      ["TIMELINE", "From 1 week"],
    ],
    why: [
      { title: "Everyone in one room", desc: "Operations, management and IT map the process together, so the requirements reflect how work actually happens." },
      { title: "Requirements you can build from", desc: "You leave with user stories, acceptance criteria and priorities, not a wish list: any team can quote and build from them." },
      { title: "Risk surfaced early", desc: "Integrations, data gaps and security constraints come up in the workshop, not in month three of the build." },
    ],
    highlight: {
      stat: "3×",
      label: "ADOPTION",
      title: "Mapping the real workflow pays for itself",
      desc: "When we rebuilt a university portal around how students actually plan their courses, mapped with 200+ field studies, adoption tripled after relaunch.",
      caseHref: "/work#usfq",
    },
    steps: [
      { title: "Kick-off", desc: "Goals, constraints and who needs to be in the room, agreed before the first session." },
      { title: "Map", desc: "Workshops that draw the current process end to end: roles, systems, hand-offs and where it breaks." },
      { title: "Prioritize", desc: "Requirements written as user stories, scored by value and effort, with the first release drawn around them." },
      { title: "Hand off", desc: "A requirements document, roadmap and estimate your team can act on, with us or with anyone else." },
    ],
    engage: [
      {
        title: "Discovery Workshop",
        forLabel: "FOR ONE DECISION",
        bullets: [
          "Two to three facilitated sessions with your team",
          "Current process mapped, pain points ranked",
          "Recommendation with options and rough costs",
          "1–2 weeks, fixed scope",
        ],
      },
      {
        title: "Requirements Mapping",
        forLabel: "FOR A SYSTEM YOU WILL BUILD",
        bullets: [
          "Full process and data mapping across roles",
          "Prioritized backlog with acceptance criteria",
          "Clickable sketches of the key screens",
          "Roadmap and estimate, 3–4 weeks",
        ],
      },
    ],
    includes: [
      { title: "Stakeholder Workshops", desc: "Facilitated sessions that get operations, management and IT to agree on what the system must do." },
      { title: "Process Mapping", desc: "The current workflow drawn end to end: roles, systems, hand-offs and the places it breaks." },
      { title: "Requirements Backlog", desc: "User stories with acceptance criteria, prioritized by value and effort, ready to build or quote." },
      { title: "Prototype Sketches", desc: "Low-fidelity screens of the key flows, validated with the people who will use them." },
      { title: "Roadmap & Estimate", desc: "Releases, dependencies and a cost range you can take to a budget meeting." },
      { title: "AI Readiness", desc: "Which steps an agent can take over safely, what data it needs, and where a person must sign off." },
    ],
    tools: ["MIRO", "FIGJAM", "BPMN", "USER STORIES", "JIRA"],
  },
  custom: {
    name: "Custom Software",
    tag: "CUSTOM SOFTWARE",
    title: "Software shaped around your workflows",
    subtitle:
      "Internal tools and operational systems built for how your team actually works, not the other way around.",
    specs: [
      ["METHOD", "Built around your workflows"],
      ["BEST FOR", "Operations, internal tools"],
      ["TIMELINE", "From 10 weeks"],
    ],
    why: [
      { title: "Fits your workflow", desc: "We shadow your team first: the tool adapts to the process, not the reverse." },
      { title: "Plays well with legacy", desc: "New software that talks to the ERPs and systems you can't replace yet." },
      { title: "Owned by your team", desc: "Documentation, training, and handover so the tool sticks, with or without us." },
    ],
    highlight: {
      stat: "80%",
      label: "LESS MANUAL WORK",
      title: "Operations, minus the spreadsheet glue",
      desc: "Automating order processing for an e-commerce operation cut manual work by 80%, from hours to a 12-minute turnaround.",
      caseHref: "/work#helixona",
    },
    steps: [
      { title: "Shadow the team", desc: "We watch the real workflow: the bottlenecks live in the details." },
      { title: "Design the tool", desc: "Screens and flows mapped to each role, validated with the people who'll use them." },
      { title: "Integrate", desc: "Connected to your existing systems: ERP, CRM, accounting, whatever runs today." },
      { title: "Train & hand over", desc: "Onboarding, documentation, and admin controls: your team runs it." },
    ],
    engage: [
      {
        title: "Internal Tool",
        forLabel: "FOR ONE PAINFUL PROCESS",
        bullets: [
          "One workflow, digitized end to end",
          "Role-based access from day one",
          "Integrated with your current systems",
          "From 10 weeks, fixed scope",
        ],
      },
      {
        title: "Operations Platform",
        forLabel: "FOR THE WHOLE OPERATION",
        bullets: [
          "Multiple workflows, one platform",
          "Dashboards over your live numbers",
          "Phased rollout, team by team",
          "Quarterly roadmap together",
        ],
      },
    ],
    includes: [
      { title: "Process Discovery", desc: "We sit with your team first: the tool gets designed around the real workflow." },
      { title: "Internal Tools", desc: "Admin panels and back-office systems that remove the spreadsheet glue." },
      { title: "Operations Dashboards", desc: "Live visibility over the numbers your team checks every morning." },
      { title: "Legacy Integration", desc: "New software that talks to the systems you can't (yet) replace." },
      { title: "Roles & Permissions", desc: "The right access for every team member, auditable from day one." },
      { title: "Training & Handover", desc: "Documentation and onboarding so the tool sticks, with or without us." },
    ],
    tools: ["NODE", "POSTGRES", "AWS", "REST APIS", "SSO"],
  },
  ai: {
    name: "AI & Automation",
    tag: "AI & AUTOMATION",
    title: "AI your users can actually trust",
    subtitle:
      "Grounded assistants, copilots, and automated workflows, with human review built in from day one.",
    specs: [
      ["METHOD", "Grounded, human-reviewed AI"],
      ["BEST FOR", "Assistants, workflows, search"],
      ["TIMELINE", "From 4 weeks"],
    ],
    why: [
      { title: "Grounded, not guessing", desc: "Assistants answer from your own knowledge base, with sources, no invented facts." },
      { title: "Human in the loop", desc: "Review gates where judgment matters; exceptions escalate to people, automatically." },
      { title: "Measured in production", desc: "Evals, guardrails, and monitoring: the AI keeps earning trust after launch." },
    ],
    highlight: {
      stat: "2,400",
      label: "QUESTIONS / WEEK",
      title: "Grounded AI, working at scale",
      desc: "A course-planning assistant grounded in a university's own catalog answers 2,400 student questions a week, with human review built in.",
      caseHref: "/work#usfq",
    },
    steps: [
      { title: "Identify the workflow", desc: "We pick the highest-value, lowest-risk place for AI to start earning trust." },
      { title: "Ground the model", desc: "Your documents and data become the source of truth: RAG with citations." },
      { title: "Add review gates", desc: "Humans approve where it matters; the AI handles the repetitive rest." },
      { title: "Evaluate & scale", desc: "Quality metrics in production, then expand to the next workflow." },
    ],
    engage: [
      {
        title: "AI Assistant",
        forLabel: "FOR ANSWERING AT SCALE",
        bullets: [
          "Grounded chat over your knowledge base",
          "Cited answers, human escalation",
          "Web, WhatsApp, or in-product",
          "From 4 weeks to production",
        ],
      },
      {
        title: "Workflow Automation",
        forLabel: "FOR REPETITIVE OPERATIONS",
        bullets: [
          "AI-checked pipelines for orders, docs, intake",
          "Every exception escalated to a human",
          "Audit trail of every decision",
          "Measured ROI from week one",
        ],
      },
    ],
    includes: [
      { title: "AI Assistants", desc: "Chat and voice assistants grounded in your own knowledge base, no invented answers." },
      { title: "Workflow Automation", desc: "AI-checked pipelines that clear the repetitive work and escalate exceptions to humans." },
      { title: "Intelligent Search", desc: "Answers from your documents and data, cited and verifiable." },
      { title: "Human-in-the-loop", desc: "Review steps where judgment matters: automation with accountability." },
      { title: "LLM Integration", desc: "Claude and other frontier models wired into your product, safely and observably." },
      { title: "Evaluation & Monitoring", desc: "Quality metrics and guardrails so the AI keeps earning trust in production." },
    ],
    tools: ["CLAUDE", "RAG", "LANGCHAIN", "AWS BEDROCK", "EVALS"],
  },
  security: {
    name: "Cybersecurity",
    tag: "CYBERSECURITY",
    title: "Security built into what you ship",
    subtitle:
      "Assessments, hardening and monitoring for your applications, cloud and AI systems, with findings your team can actually act on.",
    specs: [
      ["METHOD", "Assess, harden, monitor"],
      ["BEST FOR", "Apps, cloud, AI systems, compliance"],
      ["TIMELINE", "From 2 weeks"],
    ],
    why: [
      { title: "Builders, not just auditors", desc: "We write production software every day, so every finding comes with a fix your engineers can ship, not a PDF to decode." },
      { title: "AI systems included", desc: "Assistants and agents bring new risks: prompt injection, data leakage, over-permissioned tools. We test for them, aligned to the OWASP Top 10 for LLM applications." },
      { title: "Compliance without the theatre", desc: "Controls mapped to ISO 27001, SOC 2 and Ecuador's data protection law (LOPDP), with evidence collected as you work." },
    ],
    highlight: {
      stat: "100%",
      label: "BUILDS REVIEWED",
      title: "Every platform we ship passes a security review first",
      desc: "Hardening is a fixed step in how we build: dependency audits, access review and a pass over the OWASP Top 10 before launch. The same practice is now available for systems we didn't build.",
    },
    steps: [
      { title: "Scope", desc: "Assets, threat model and rules of engagement agreed in writing before anything is touched." },
      { title: "Assess", desc: "Application and cloud testing, code review and configuration audit, prioritized by real impact." },
      { title: "Harden", desc: "We fix with your team or hand over patches and configuration changes, verified with a re-test." },
      { title: "Monitor", desc: "Alerting, logging and a response plan, so the next incident is handled in minutes, not days." },
    ],
    engage: [
      {
        title: "Security Assessment",
        forLabel: "FOR A CLEAR PICTURE",
        bullets: [
          "Web, mobile and API penetration testing",
          "Cloud configuration audit (AWS, GCP, Azure)",
          "Findings ranked by exploitability and impact",
          "2–4 weeks, fixed scope, re-test included",
        ],
      },
      {
        title: "Managed Security",
        forLabel: "FOR ONGOING PEACE OF MIND",
        bullets: [
          "Monitoring, alerting and patch management",
          "Secure code review on every release",
          "Compliance evidence kept current",
          "Monthly engagement, incident response on call",
        ],
      },
    ],
    includes: [
      { title: "Penetration Testing", desc: "Manual testing of web, mobile and API surfaces, beyond what a scanner finds." },
      { title: "Cloud Hardening", desc: "IAM, network, secrets and backup configuration reviewed and locked down on AWS, GCP or Azure." },
      { title: "Secure Development", desc: "Code review, dependency audits and CI checks so vulnerabilities are caught before they ship." },
      { title: "AI & LLM Security", desc: "Prompt injection, data leakage and tool-permission testing for assistants and agents, with guardrails that hold." },
      { title: "Compliance Readiness", desc: "Gap analysis and controls for ISO 27001, SOC 2 and LOPDP, with evidence your auditor accepts." },
      { title: "Incident Response", desc: "A tested playbook, logging that answers questions, and people who pick up when something goes wrong." },
    ],
    tools: ["OWASP", "BURP SUITE", "SEMGREP", "AWS IAM", "ISO 27001", "LOPDP"],
  },
};

export const SERVICES_ES: Record<string, Service> = {
  discovery: {
    name: "Workshops y Mapeo de Requerimientos",
    tag: "WORKSHOPS",
    title: "Saber qué construir antes de construirlo",
    subtitle:
      "Workshops facilitados con tu equipo que convierten una necesidad difusa en procesos mapeados, requerimientos priorizados y un plan que ingeniería puede cotizar.",
    specs: [
      ["MÉTODO", "Workshops facilitados y mapeo de procesos"],
      ["IDEAL PARA", "Sistemas nuevos, iniciativas de IA, reemplazo de legacy"],
      ["TIEMPO", "Desde 1 semana"],
    ],
    why: [
      { title: "Todos en la misma sala", desc: "Operaciones, gerencia y TI mapean el proceso juntos, así los requerimientos reflejan cómo se trabaja de verdad." },
      { title: "Requerimientos para construir", desc: "Sales con historias de usuario, criterios de aceptación y prioridades, no una lista de deseos: cualquier equipo puede cotizar y construir desde ahí." },
      { title: "Riesgos a la vista temprano", desc: "Integraciones, vacíos de datos y restricciones de seguridad salen en el workshop, no en el mes tres del desarrollo." },
    ],
    highlight: {
      stat: "3×",
      label: "ADOPCIÓN",
      title: "Mapear el flujo real se paga solo",
      desc: "Cuando rediseñamos un portal universitario alrededor de cómo los estudiantes planifican sus cursos, mapeado con 200+ estudios de campo, la adopción se triplicó tras el relanzamiento.",
      caseHref: "/work#usfq",
    },
    steps: [
      { title: "Kick-off", desc: "Objetivos, restricciones y quién debe estar en la sala, acordados antes de la primera sesión." },
      { title: "Mapear", desc: "Workshops que dibujan el proceso actual de punta a punta: roles, sistemas, traspasos y dónde se rompe." },
      { title: "Priorizar", desc: "Requerimientos escritos como historias de usuario, puntuados por valor y esfuerzo, con el primer release definido alrededor." },
      { title: "Entregar", desc: "Un documento de requerimientos, roadmap y estimación con los que tu equipo puede actuar, con nosotros o con quien sea." },
    ],
    engage: [
      {
        title: "Workshop de Descubrimiento",
        forLabel: "PARA UNA DECISIÓN",
        bullets: [
          "Dos o tres sesiones facilitadas con tu equipo",
          "Proceso actual mapeado, dolores priorizados",
          "Recomendación con opciones y costos aproximados",
          "1–2 semanas, alcance fijo",
        ],
      },
      {
        title: "Mapeo de Requerimientos",
        forLabel: "PARA UN SISTEMA QUE VAS A CONSTRUIR",
        bullets: [
          "Mapeo completo de procesos y datos por rol",
          "Backlog priorizado con criterios de aceptación",
          "Bocetos clickeables de las pantallas clave",
          "Roadmap y estimación, 3–4 semanas",
        ],
      },
    ],
    includes: [
      { title: "Workshops con Stakeholders", desc: "Sesiones facilitadas para que operaciones, gerencia y TI acuerden qué debe hacer el sistema." },
      { title: "Mapeo de Procesos", desc: "El flujo actual dibujado de punta a punta: roles, sistemas, traspasos y los puntos donde se rompe." },
      { title: "Backlog de Requerimientos", desc: "Historias de usuario con criterios de aceptación, priorizadas por valor y esfuerzo, listas para construir o cotizar." },
      { title: "Bocetos de Prototipo", desc: "Pantallas de baja fidelidad de los flujos clave, validadas con quienes las usarán." },
      { title: "Roadmap y Estimación", desc: "Releases, dependencias y un rango de costo que puedes llevar a una reunión de presupuesto." },
      { title: "Preparación para IA", desc: "Qué pasos puede asumir un agente con seguridad, qué datos necesita y dónde debe firmar una persona." },
    ],
    tools: ["MIRO", "FIGJAM", "BPMN", "HISTORIAS DE USUARIO", "JIRA"],
  },
  custom: {
    name: "Software a Medida",
    tag: "SOFTWARE A MEDIDA",
    title: "Software con la forma de tus procesos",
    subtitle:
      "Herramientas internas y sistemas operativos construidos para cómo trabaja tu equipo realmente, no al revés.",
    specs: [
      ["MÉTODO", "Construido alrededor de tus procesos"],
      ["IDEAL PARA", "Operaciones, herramientas internas"],
      ["TIEMPO", "Desde 10 semanas"],
    ],
    why: [
      { title: "Se adapta a tu flujo", desc: "Primero acompañamos a tu equipo: la herramienta se adapta al proceso, no al revés." },
      { title: "Convive con lo legado", desc: "Software nuevo que habla con los ERPs y sistemas que aún no puedes reemplazar." },
      { title: "Propiedad de tu equipo", desc: "Documentación, capacitación y handover para que la herramienta perdure: contigo o sin nosotros." },
    ],
    highlight: {
      stat: "80%",
      label: "MENOS TRABAJO MANUAL",
      title: "Operaciones, sin el pegamento de hojas de cálculo",
      desc: "Automatizar el procesamiento de pedidos de una operación e-commerce redujo el trabajo manual en 80%, de horas a 12 minutos.",
      caseHref: "/work#helixona",
    },
    steps: [
      { title: "Acompañar al equipo", desc: "Observamos el flujo real: los cuellos de botella viven en los detalles." },
      { title: "Diseñar la herramienta", desc: "Pantallas y flujos por rol, validados con quienes los usarán." },
      { title: "Integrar", desc: "Conectado a tus sistemas actuales: ERP, CRM, contabilidad, lo que corra hoy." },
      { title: "Capacitar y entregar", desc: "Onboarding, documentación y controles de admin: tu equipo lo opera." },
    ],
    engage: [
      {
        title: "Herramienta Interna",
        forLabel: "PARA UN PROCESO DOLOROSO",
        bullets: [
          "Un flujo, digitalizado de inicio a fin",
          "Accesos por rol desde el día uno",
          "Integrada con tus sistemas actuales",
          "Desde 10 semanas, alcance fijo",
        ],
      },
      {
        title: "Plataforma de Operaciones",
        forLabel: "PARA TODA LA OPERACIÓN",
        bullets: [
          "Múltiples flujos, una plataforma",
          "Dashboards sobre tus números en vivo",
          "Rollout por fases, equipo por equipo",
          "Roadmap trimestral en conjunto",
        ],
      },
    ],
    includes: [
      { title: "Descubrimiento de Procesos", desc: "Nos sentamos con tu equipo primero: la herramienta se diseña alrededor del flujo real." },
      { title: "Herramientas Internas", desc: "Paneles y sistemas back-office que eliminan el pegamento de hojas de cálculo." },
      { title: "Dashboards Operativos", desc: "Visibilidad en vivo de los números que tu equipo revisa cada mañana." },
      { title: "Integración con Legacy", desc: "Software nuevo que conversa con los sistemas que aún no puedes reemplazar." },
      { title: "Roles y Permisos", desc: "El acceso correcto para cada miembro del equipo, auditable desde el día uno." },
      { title: "Capacitación y Entrega", desc: "Documentación y onboarding para que la herramienta perdure: contigo o sin nosotros." },
    ],
    tools: ["NODE", "POSTGRES", "AWS", "REST APIS", "SSO"],
  },
  ai: {
    name: "IA y Automatización",
    tag: "IA Y AUTOMATIZACIÓN",
    title: "IA en la que tus usuarios sí pueden confiar",
    subtitle:
      "Asistentes con grounding, copilotos y flujos automatizados, con revisión humana integrada desde el día uno.",
    specs: [
      ["MÉTODO", "IA con grounding y revisión humana"],
      ["IDEAL PARA", "Asistentes, flujos, búsqueda"],
      ["TIEMPO", "Desde 4 semanas"],
    ],
    why: [
      { title: "Con grounding, sin inventos", desc: "Los asistentes responden desde tu propia base de conocimiento, con fuentes, sin datos inventados." },
      { title: "Humano en el circuito", desc: "Compuertas de revisión donde importa el criterio; las excepciones escalan a personas, automáticamente." },
      { title: "Medida en producción", desc: "Evals, guardrails y monitoreo: la IA sigue ganándose la confianza después del launch." },
    ],
    highlight: {
      stat: "2,400",
      label: "PREGUNTAS / SEMANA",
      title: "IA con grounding, trabajando a escala",
      desc: "Un asistente de planificación académica con grounding en el catálogo de la universidad responde 2.400 preguntas por semana, con revisión humana integrada.",
      caseHref: "/work#usfq",
    },
    steps: [
      { title: "Identificar el flujo", desc: "Elegimos el punto de mayor valor y menor riesgo para que la IA empiece a ganarse la confianza." },
      { title: "Dar grounding al modelo", desc: "Tus documentos y datos se vuelven la fuente de verdad: RAG con citas." },
      { title: "Agregar revisión", desc: "Humanos aprueban donde importa; la IA se encarga de lo repetitivo." },
      { title: "Evaluar y escalar", desc: "Métricas de calidad en producción, y luego el siguiente flujo." },
    ],
    engage: [
      {
        title: "Asistente de IA",
        forLabel: "PARA RESPONDER A ESCALA",
        bullets: [
          "Chat con grounding sobre tu base de conocimiento",
          "Respuestas citadas, escalamiento humano",
          "Web, WhatsApp o dentro de tu producto",
          "De 4 semanas a producción",
        ],
      },
      {
        title: "Automatización de Flujos",
        forLabel: "PARA OPERACIONES REPETITIVAS",
        bullets: [
          "Pipelines verificados por IA: pedidos, docs, intake",
          "Cada excepción escala a un humano",
          "Registro auditable de cada decisión",
          "ROI medido desde la semana uno",
        ],
      },
    ],
    includes: [
      { title: "Asistentes de IA", desc: "Asistentes de chat y voz con grounding en tu propio conocimiento, sin respuestas inventadas." },
      { title: "Automatización de Flujos", desc: "Pipelines verificados por IA que despejan lo repetitivo y escalan excepciones a humanos." },
      { title: "Búsqueda Inteligente", desc: "Respuestas desde tus documentos y datos, citadas y verificables." },
      { title: "Humano en el Circuito", desc: "Pasos de revisión donde importa el criterio: automatización con responsabilidad." },
      { title: "Integración de LLMs", desc: "Claude y otros modelos frontera conectados a tu producto, de forma segura y observable." },
      { title: "Evaluación y Monitoreo", desc: "Métricas de calidad y guardrails para que la IA siga ganándose la confianza en producción." },
    ],
    tools: ["CLAUDE", "RAG", "LANGCHAIN", "AWS BEDROCK", "EVALS"],
  },
  security: {
    name: "Ciberseguridad",
    tag: "CIBERSEGURIDAD",
    title: "Seguridad integrada en lo que publicas",
    subtitle:
      "Evaluaciones, endurecimiento y monitoreo para tus aplicaciones, nube y sistemas de IA, con hallazgos que tu equipo sí puede resolver.",
    specs: [
      ["MÉTODO", "Evaluar, endurecer, monitorear"],
      ["IDEAL PARA", "Apps, nube, sistemas de IA, cumplimiento"],
      ["TIEMPO", "Desde 2 semanas"],
    ],
    why: [
      { title: "Constructores, no solo auditores", desc: "Escribimos software en producción todos los días, así que cada hallazgo llega con una solución que tus ingenieros pueden publicar, no un PDF por descifrar." },
      { title: "Sistemas de IA incluidos", desc: "Asistentes y agentes traen riesgos nuevos: prompt injection, fuga de datos, herramientas con permisos de más. Los probamos, alineados al OWASP Top 10 para aplicaciones con LLM." },
      { title: "Cumplimiento sin teatro", desc: "Controles mapeados a ISO 27001, SOC 2 y la Ley Orgánica de Protección de Datos Personales (LOPDP), con evidencia recogida mientras trabajas." },
    ],
    highlight: {
      stat: "100%",
      label: "BUILDS REVISADOS",
      title: "Cada plataforma que publicamos pasa antes por una revisión de seguridad",
      desc: "El endurecimiento es un paso fijo de cómo construimos: auditoría de dependencias, revisión de accesos y una pasada por el OWASP Top 10 antes del launch. La misma práctica ahora está disponible para sistemas que no construimos nosotros.",
    },
    steps: [
      { title: "Alcance", desc: "Activos, modelo de amenazas y reglas de trabajo acordados por escrito antes de tocar nada." },
      { title: "Evaluar", desc: "Pruebas de aplicaciones y nube, revisión de código y auditoría de configuración, priorizadas por impacto real." },
      { title: "Endurecer", desc: "Corregimos con tu equipo o entregamos parches y cambios de configuración, verificados con un re-test." },
      { title: "Monitorear", desc: "Alertas, logs y un plan de respuesta, para que el siguiente incidente se resuelva en minutos, no en días." },
    ],
    engage: [
      {
        title: "Evaluación de Seguridad",
        forLabel: "PARA TENER UNA FOTO CLARA",
        bullets: [
          "Pentesting de web, móvil y APIs",
          "Auditoría de configuración en la nube (AWS, GCP, Azure)",
          "Hallazgos priorizados por explotabilidad e impacto",
          "2–4 semanas, alcance fijo, re-test incluido",
        ],
      },
      {
        title: "Seguridad Gestionada",
        forLabel: "PARA TRANQUILIDAD CONTINUA",
        bullets: [
          "Monitoreo, alertas y gestión de parches",
          "Revisión de código seguro en cada release",
          "Evidencia de cumplimiento siempre al día",
          "Mensual, con respuesta a incidentes de guardia",
        ],
      },
    ],
    includes: [
      { title: "Pentesting", desc: "Pruebas manuales sobre web, móvil y APIs, más allá de lo que encuentra un escáner." },
      { title: "Endurecimiento en la Nube", desc: "IAM, red, secretos y respaldos revisados y asegurados en AWS, GCP o Azure." },
      { title: "Desarrollo Seguro", desc: "Revisión de código, auditoría de dependencias y chequeos en CI para atrapar vulnerabilidades antes de publicar." },
      { title: "Seguridad de IA y LLMs", desc: "Pruebas de prompt injection, fuga de datos y permisos de herramientas en asistentes y agentes, con guardrails que aguantan." },
      { title: "Preparación para Cumplimiento", desc: "Análisis de brechas y controles para ISO 27001, SOC 2 y LOPDP, con evidencia que tu auditor acepta." },
      { title: "Respuesta a Incidentes", desc: "Un playbook probado, logs que responden preguntas y gente que contesta cuando algo sale mal." },
    ],
    tools: ["OWASP", "BURP SUITE", "SEMGREP", "AWS IAM", "ISO 27001", "LOPDP"],
  },
};
