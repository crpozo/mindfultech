"use client";

import * as React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Pill, DarkCTA } from "@/components/internal/Shared";
import { useLang } from "@/components/i18n";

const MONO = "var(--mono)";

type Service = {
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

const SERVICES: Record<string, Service> = {
  ux: {
    name: "UX Design",
    tag: "UX DESIGN",
    title: "Products people understand at first tap",
    subtitle:
      "Research-driven design that turns real user behavior into interfaces people love — before a single line of production code.",
    specs: [
      ["METHOD", "Field research & prototyping"],
      ["BEST FOR", "New products, redesigns"],
      ["TIMELINE", "From 3 weeks"],
    ],
    why: [
      { title: "Research first", desc: "Decisions grounded in field studies with your real users — not boardroom assumptions." },
      { title: "Prototype fast", desc: "Clickable prototypes in front of users every week, long before engineering starts." },
      { title: "Systems that scale", desc: "Every screen ships into a design system your team keeps reusing after launch." },
    ],
    highlight: {
      stat: "3×",
      label: "ADOPTION",
      title: "Research-led design pays for itself",
      desc: "When we rebuilt a university portal around real course-planning behavior — 200+ student field studies — adoption tripled after relaunch.",
      caseHref: "/work#usfq",
    },
    steps: [
      { title: "Discover", desc: "Stakeholder interviews and field research with the people who will use the product." },
      { title: "Map", desc: "Journeys, priorities, and success metrics — agreed before any pixels." },
      { title: "Prototype", desc: "Clickable flows tested with users weekly; we iterate on evidence." },
      { title: "Hand off", desc: "A design system with tokens, specs, and documentation engineering can build from." },
    ],
    engage: [
      {
        title: "Design Sprint",
        forLabel: "FOR VALIDATING AN IDEA",
        bullets: [
          "One critical flow, prototyped end to end",
          "User testing with 5–8 real users",
          "Findings report with clear next steps",
          "2–3 weeks, fixed scope",
        ],
      },
      {
        title: "Embedded Design",
        forLabel: "FOR PRODUCT TEAMS",
        bullets: [
          "Continuous research and usability testing",
          "Design system built and maintained",
          "Weekly demos alongside your roadmap",
          "Monthly engagement, cancel anytime",
        ],
      },
    ],
    includes: [
      { title: "Field Research", desc: "Interviews and studies with your real users — decisions built on evidence, not opinions." },
      { title: "Journey Mapping", desc: "Every step your users take, mapped and measured, so we fix the moments that matter." },
      { title: "Rapid Prototyping", desc: "Clickable prototypes tested with users weekly, long before engineering starts." },
      { title: "Design Systems", desc: "Tokens and components that keep every screen consistent — and every future build faster." },
      { title: "Interface Design", desc: "Accessible, WCAG-AA interfaces with the craft your brand deserves." },
      { title: "Usability Testing", desc: "Structured tests that tell you what works, what confuses, and what to change." },
    ],
    tools: ["FIGMA", "FIGJAM", "MAZE", "TOKENS", "WCAG AA"],
  },
  apps: {
    name: "Web & Mobile Apps",
    tag: "WEB & MOBILE APPS",
    title: "Scalable platforms, built for the long run",
    subtitle:
      "Tailor-made web and mobile applications on modern stacks — aligned to your processes and maintained well beyond launch.",
    specs: [
      ["STACK", "React, Next.js, React Native"],
      ["BEST FOR", "Platforms, portals, e-commerce"],
      ["TIMELINE", "From 8 weeks"],
    ],
    why: [
      { title: "Modern stack", desc: "React, Next.js, and React Native — web and mobile from one codebase, one team." },
      { title: "Production-grade", desc: "CI/CD, observability, and AWS architectures wired in from the first sprint." },
      { title: "Built to last", desc: "We stay accountable after launch: monitoring, updates, and a real maintenance path." },
    ],
    highlight: {
      stat: "99.9%",
      label: "UPTIME TARGET",
      title: "Reliability is a feature",
      desc: "Our platforms ship with automated tests, staged deploys, and observability — so launch day is calm and year two is calmer.",
    },
    steps: [
      { title: "Scope", desc: "Workflows, architecture, and milestones agreed up front — no scope drift." },
      { title: "Build", desc: "Weekly demos of working software, on a stack your team can own." },
      { title: "Harden", desc: "Tests, performance passes, and security review before anything ships." },
      { title: "Launch & operate", desc: "CI/CD, monitoring, and support — we operate what we build." },
    ],
    engage: [
      {
        title: "Product Build",
        forLabel: "FOR A NEW PLATFORM",
        bullets: [
          "Fixed-scope MVP to v1, from 8 weeks",
          "Weekly demos and transparent reporting",
          "Design, engineering, and QA included",
          "You own every repo and account",
        ],
      },
      {
        title: "Managed Delivery",
        forLabel: "FOR ONGOING PRODUCTS",
        bullets: [
          "A senior product team on demand",
          "CI/CD and observability pre-configured",
          "SLAs on uptime and response",
          "Flexible monthly engagement",
        ],
      },
    ],
    includes: [
      { title: "Web Applications", desc: "Fast, reliable platforms and portals your team and customers use every day." },
      { title: "Mobile Apps", desc: "iOS and Android from one codebase — native feel, single maintenance path." },
      { title: "E-commerce", desc: "Storefronts and checkout flows built to convert, integrate, and scale." },
      { title: "APIs & Integrations", desc: "Clean connections to the systems you already run — ERPs, CRMs, payments." },
      { title: "Performance", desc: "Core Web Vitals in the green: fast loads that keep users and rankings." },
      { title: "Care & Maintenance", desc: "Monitoring, updates, and a team that stays accountable after launch." },
    ],
    tools: ["REACT", "NEXT.JS", "REACT NATIVE", "NODE", "AWS", "POSTGRES"],
  },
  custom: {
    name: "Custom Software",
    tag: "CUSTOM SOFTWARE",
    title: "Software shaped around your workflows",
    subtitle:
      "Internal tools and operational systems built for how your team actually works — not the other way around.",
    specs: [
      ["METHOD", "Built around your workflows"],
      ["BEST FOR", "Operations, internal tools"],
      ["TIMELINE", "From 10 weeks"],
    ],
    why: [
      { title: "Fits your workflow", desc: "We shadow your team first — the tool adapts to the process, not the reverse." },
      { title: "Plays well with legacy", desc: "New software that talks to the ERPs and systems you can't replace yet." },
      { title: "Owned by your team", desc: "Documentation, training, and handover so the tool sticks — with or without us." },
    ],
    highlight: {
      stat: "80%",
      label: "LESS MANUAL WORK",
      title: "Operations, minus the spreadsheet glue",
      desc: "Automating order processing for an e-commerce operation cut manual work by 80% — from hours to a 12-minute turnaround.",
      caseHref: "/work#helixona",
    },
    steps: [
      { title: "Shadow the team", desc: "We watch the real workflow — the bottlenecks live in the details." },
      { title: "Design the tool", desc: "Screens and flows mapped to each role, validated with the people who'll use them." },
      { title: "Integrate", desc: "Connected to your existing systems: ERP, CRM, accounting, whatever runs today." },
      { title: "Train & hand over", desc: "Onboarding, documentation, and admin controls — your team runs it." },
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
      { title: "Process Discovery", desc: "We sit with your team first — the tool gets designed around the real workflow." },
      { title: "Internal Tools", desc: "Admin panels and back-office systems that remove the spreadsheet glue." },
      { title: "Operations Dashboards", desc: "Live visibility over the numbers your team checks every morning." },
      { title: "Legacy Integration", desc: "New software that talks to the systems you can't (yet) replace." },
      { title: "Roles & Permissions", desc: "The right access for every team member, auditable from day one." },
      { title: "Training & Handover", desc: "Documentation and onboarding so the tool sticks — with or without us." },
    ],
    tools: ["NODE", "POSTGRES", "AWS", "REST APIS", "SSO"],
  },
  ai: {
    name: "AI & Automation",
    tag: "AI & AUTOMATION",
    title: "AI your users can actually trust",
    subtitle:
      "Grounded assistants, copilots, and automated workflows — with human review built in from day one.",
    specs: [
      ["METHOD", "Grounded, human-reviewed AI"],
      ["BEST FOR", "Assistants, workflows, search"],
      ["TIMELINE", "From 4 weeks"],
    ],
    why: [
      { title: "Grounded, not guessing", desc: "Assistants answer from your own knowledge base, with sources — no invented facts." },
      { title: "Human in the loop", desc: "Review gates where judgment matters; exceptions escalate to people, automatically." },
      { title: "Measured in production", desc: "Evals, guardrails, and monitoring — the AI keeps earning trust after launch." },
    ],
    highlight: {
      stat: "2,400",
      label: "QUESTIONS / WEEK",
      title: "Grounded AI, working at scale",
      desc: "A course-planning assistant grounded in a university's own catalog answers 2,400 student questions a week — with human review built in.",
      caseHref: "/work#usfq",
    },
    steps: [
      { title: "Identify the workflow", desc: "We pick the highest-value, lowest-risk place for AI to start earning trust." },
      { title: "Ground the model", desc: "Your documents and data become the source of truth — RAG with citations." },
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
      { title: "AI Assistants", desc: "Chat and voice assistants grounded in your own knowledge base — no invented answers." },
      { title: "Workflow Automation", desc: "AI-checked pipelines that clear the repetitive work and escalate exceptions to humans." },
      { title: "Intelligent Search", desc: "Answers from your documents and data, cited and verifiable." },
      { title: "Human-in-the-loop", desc: "Review steps where judgment matters — automation with accountability." },
      { title: "LLM Integration", desc: "Claude and other frontier models wired into your product, safely and observably." },
      { title: "Evaluation & Monitoring", desc: "Quality metrics and guardrails so the AI keeps earning trust in production." },
    ],
    tools: ["CLAUDE", "RAG", "LANGCHAIN", "AWS BEDROCK", "EVALS"],
  },
};

const SERVICES_ES: Record<string, Service> = {
  ux: {
    name: "Diseño UX",
    tag: "DISEÑO UX",
    title: "Productos que la gente entiende al primer tap",
    subtitle:
      "Diseño basado en investigación que convierte el comportamiento real de tus usuarios en interfaces que la gente ama — antes de una sola línea de código.",
    specs: [
      ["MÉTODO", "Investigación de campo y prototipado"],
      ["IDEAL PARA", "Productos nuevos, rediseños"],
      ["TIEMPO", "Desde 3 semanas"],
    ],
    why: [
      { title: "Investigación primero", desc: "Decisiones basadas en estudios de campo con tus usuarios reales — no en suposiciones de sala de juntas." },
      { title: "Prototipos rápidos", desc: "Prototipos clickeables frente a usuarios cada semana, mucho antes de que empiece la ingeniería." },
      { title: "Sistemas que escalan", desc: "Cada pantalla se integra a un design system que tu equipo sigue reutilizando después del launch." },
    ],
    highlight: {
      stat: "3×",
      label: "ADOPCIÓN",
      title: "El diseño con investigación se paga solo",
      desc: "Cuando rediseñamos un portal universitario según el comportamiento real — 200+ estudios de campo con estudiantes — la adopción se triplicó tras el relanzamiento.",
      caseHref: "/work#usfq",
    },
    steps: [
      { title: "Descubrir", desc: "Entrevistas con stakeholders e investigación de campo con quienes usarán el producto." },
      { title: "Mapear", desc: "Journeys, prioridades y métricas de éxito — acordadas antes de cualquier pixel." },
      { title: "Prototipar", desc: "Flujos clickeables probados con usuarios cada semana; iteramos con evidencia." },
      { title: "Entregar", desc: "Un design system con tokens, specs y documentación lista para construir." },
    ],
    engage: [
      {
        title: "Design Sprint",
        forLabel: "PARA VALIDAR UNA IDEA",
        bullets: [
          "Un flujo crítico, prototipado de inicio a fin",
          "Pruebas con 5–8 usuarios reales",
          "Reporte de hallazgos con siguientes pasos",
          "2–3 semanas, alcance fijo",
        ],
      },
      {
        title: "Diseño Embebido",
        forLabel: "PARA EQUIPOS DE PRODUCTO",
        bullets: [
          "Investigación y pruebas de usabilidad continuas",
          "Design system construido y mantenido",
          "Demos semanales junto a tu roadmap",
          "Mensual, cancela cuando quieras",
        ],
      },
    ],
    includes: [
      { title: "Investigación de Campo", desc: "Entrevistas y estudios con tus usuarios reales — decisiones con evidencia, no opiniones." },
      { title: "Journey Mapping", desc: "Cada paso de tus usuarios, mapeado y medido, para arreglar los momentos que importan." },
      { title: "Prototipado Rápido", desc: "Prototipos clickeables probados con usuarios semanalmente, antes de la ingeniería." },
      { title: "Design Systems", desc: "Tokens y componentes que mantienen cada pantalla consistente — y aceleran lo que viene." },
      { title: "Diseño de Interfaz", desc: "Interfaces accesibles (WCAG AA) con el nivel de detalle que tu marca merece." },
      { title: "Pruebas de Usabilidad", desc: "Tests estructurados que te dicen qué funciona, qué confunde y qué cambiar." },
    ],
    tools: ["FIGMA", "FIGJAM", "MAZE", "TOKENS", "WCAG AA"],
  },
  apps: {
    name: "Apps Web y Móviles",
    tag: "APPS WEB Y MÓVILES",
    title: "Plataformas escalables, hechas para durar",
    subtitle:
      "Aplicaciones web y móviles a la medida sobre stacks modernos — alineadas a tus procesos y mantenidas mucho después del launch.",
    specs: [
      ["STACK", "React, Next.js, React Native"],
      ["IDEAL PARA", "Plataformas, portales, e-commerce"],
      ["TIEMPO", "Desde 8 semanas"],
    ],
    why: [
      { title: "Stack moderno", desc: "React, Next.js y React Native — web y móvil desde un solo código, un solo equipo." },
      { title: "Grado producción", desc: "CI/CD, observabilidad y arquitecturas AWS conectadas desde el primer sprint." },
      { title: "Hechas para durar", desc: "Seguimos siendo responsables después del launch: monitoreo, updates y mantenimiento real." },
    ],
    highlight: {
      stat: "99.9%",
      label: "OBJETIVO DE UPTIME",
      title: "La confiabilidad es un feature",
      desc: "Nuestras plataformas salen con pruebas automatizadas, deploys por etapas y observabilidad — el día del launch es tranquilo y el año dos, más.",
    },
    steps: [
      { title: "Alcance", desc: "Flujos, arquitectura e hitos acordados desde el inicio — sin sorpresas." },
      { title: "Construcción", desc: "Demos semanales de software funcionando, en un stack que tu equipo puede poseer." },
      { title: "Endurecimiento", desc: "Pruebas, performance y revisión de seguridad antes de publicar." },
      { title: "Launch y operación", desc: "CI/CD, monitoreo y soporte — operamos lo que construimos." },
    ],
    engage: [
      {
        title: "Product Build",
        forLabel: "PARA UNA PLATAFORMA NUEVA",
        bullets: [
          "MVP a v1 con alcance fijo, desde 8 semanas",
          "Demos semanales y reportes transparentes",
          "Diseño, ingeniería y QA incluidos",
          "Cada repo y cuenta son tuyos",
        ],
      },
      {
        title: "Delivery Gestionado",
        forLabel: "PARA PRODUCTOS EN MARCHA",
        bullets: [
          "Un equipo senior de producto on demand",
          "CI/CD y observabilidad pre-configurados",
          "SLAs de uptime y respuesta",
          "Mensualidad flexible",
        ],
      },
    ],
    includes: [
      { title: "Aplicaciones Web", desc: "Plataformas y portales rápidos y confiables que tu equipo y clientes usan a diario." },
      { title: "Apps Móviles", desc: "iOS y Android desde un solo código — sensación nativa, un solo mantenimiento." },
      { title: "E-commerce", desc: "Tiendas y checkouts hechos para convertir, integrarse y escalar." },
      { title: "APIs e Integraciones", desc: "Conexiones limpias con los sistemas que ya usas — ERPs, CRMs, pagos." },
      { title: "Performance", desc: "Core Web Vitals en verde: cargas rápidas que retienen usuarios y rankings." },
      { title: "Cuidado y Mantenimiento", desc: "Monitoreo, updates y un equipo que sigue siendo responsable tras el launch." },
    ],
    tools: ["REACT", "NEXT.JS", "REACT NATIVE", "NODE", "AWS", "POSTGRES"],
  },
  custom: {
    name: "Software a Medida",
    tag: "SOFTWARE A MEDIDA",
    title: "Software con la forma de tus procesos",
    subtitle:
      "Herramientas internas y sistemas operativos construidos para cómo trabaja tu equipo realmente — no al revés.",
    specs: [
      ["MÉTODO", "Construido alrededor de tus procesos"],
      ["IDEAL PARA", "Operaciones, herramientas internas"],
      ["TIEMPO", "Desde 10 semanas"],
    ],
    why: [
      { title: "Se adapta a tu flujo", desc: "Primero acompañamos a tu equipo — la herramienta se adapta al proceso, no al revés." },
      { title: "Convive con lo legado", desc: "Software nuevo que habla con los ERPs y sistemas que aún no puedes reemplazar." },
      { title: "Propiedad de tu equipo", desc: "Documentación, capacitación y handover para que la herramienta perdure — contigo o sin nosotros." },
    ],
    highlight: {
      stat: "80%",
      label: "MENOS TRABAJO MANUAL",
      title: "Operaciones, sin el pegamento de hojas de cálculo",
      desc: "Automatizar el procesamiento de pedidos de una operación e-commerce redujo el trabajo manual en 80% — de horas a 12 minutos.",
      caseHref: "/work#helixona",
    },
    steps: [
      { title: "Acompañar al equipo", desc: "Observamos el flujo real — los cuellos de botella viven en los detalles." },
      { title: "Diseñar la herramienta", desc: "Pantallas y flujos por rol, validados con quienes los usarán." },
      { title: "Integrar", desc: "Conectado a tus sistemas actuales: ERP, CRM, contabilidad, lo que corra hoy." },
      { title: "Capacitar y entregar", desc: "Onboarding, documentación y controles de admin — tu equipo lo opera." },
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
      { title: "Descubrimiento de Procesos", desc: "Nos sentamos con tu equipo primero — la herramienta se diseña alrededor del flujo real." },
      { title: "Herramientas Internas", desc: "Paneles y sistemas back-office que eliminan el pegamento de hojas de cálculo." },
      { title: "Dashboards Operativos", desc: "Visibilidad en vivo de los números que tu equipo revisa cada mañana." },
      { title: "Integración con Legacy", desc: "Software nuevo que conversa con los sistemas que aún no puedes reemplazar." },
      { title: "Roles y Permisos", desc: "El acceso correcto para cada miembro del equipo, auditable desde el día uno." },
      { title: "Capacitación y Entrega", desc: "Documentación y onboarding para que la herramienta perdure — contigo o sin nosotros." },
    ],
    tools: ["NODE", "POSTGRES", "AWS", "REST APIS", "SSO"],
  },
  ai: {
    name: "IA y Automatización",
    tag: "IA Y AUTOMATIZACIÓN",
    title: "IA en la que tus usuarios sí pueden confiar",
    subtitle:
      "Asistentes con grounding, copilotos y flujos automatizados — con revisión humana integrada desde el día uno.",
    specs: [
      ["MÉTODO", "IA con grounding y revisión humana"],
      ["IDEAL PARA", "Asistentes, flujos, búsqueda"],
      ["TIEMPO", "Desde 4 semanas"],
    ],
    why: [
      { title: "Con grounding, sin inventos", desc: "Los asistentes responden desde tu propia base de conocimiento, con fuentes — sin datos inventados." },
      { title: "Humano en el circuito", desc: "Compuertas de revisión donde importa el criterio; las excepciones escalan a personas, automáticamente." },
      { title: "Medida en producción", desc: "Evals, guardrails y monitoreo — la IA sigue ganándose la confianza después del launch." },
    ],
    highlight: {
      stat: "2,400",
      label: "PREGUNTAS / SEMANA",
      title: "IA con grounding, trabajando a escala",
      desc: "Un asistente de planificación académica con grounding en el catálogo de la universidad responde 2.400 preguntas por semana — con revisión humana integrada.",
      caseHref: "/work#usfq",
    },
    steps: [
      { title: "Identificar el flujo", desc: "Elegimos el punto de mayor valor y menor riesgo para que la IA empiece a ganarse la confianza." },
      { title: "Dar grounding al modelo", desc: "Tus documentos y datos se vuelven la fuente de verdad — RAG con citas." },
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
      { title: "Asistentes de IA", desc: "Asistentes de chat y voz con grounding en tu propio conocimiento — sin respuestas inventadas." },
      { title: "Automatización de Flujos", desc: "Pipelines verificados por IA que despejan lo repetitivo y escalan excepciones a humanos." },
      { title: "Búsqueda Inteligente", desc: "Respuestas desde tus documentos y datos, citadas y verificables." },
      { title: "Humano en el Circuito", desc: "Pasos de revisión donde importa el criterio — automatización con responsabilidad." },
      { title: "Integración de LLMs", desc: "Claude y otros modelos frontera conectados a tu producto, de forma segura y observable." },
      { title: "Evaluación y Monitoreo", desc: "Métricas de calidad y guardrails para que la IA siga ganándose la confianza en producción." },
    ],
    tools: ["CLAUDE", "RAG", "LANGCHAIN", "AWS BEDROCK", "EVALS"],
  },
};

const WHY_COLORS: [string, string][] = [
  ["#bdd9f0", "#2c3a4a"],
  ["#f2cfe3", "#4a3040"],
  ["#f8d9c3", "#4c3628"],
];



export function ServiceDetail({ slug }: { slug: string }) {
  const { lang } = useLang();
  const s = (lang === "es" ? SERVICES_ES : SERVICES)[slug];
  const es = lang === "es";
  if (!s) return null;

  return (
    <div style={{ position: "relative", width: "100%", overflow: "clip", background: "#fff" }}>
      <SiteHeader active="services" megaMenus />

      {/* HERO */}
      <section style={{ background: "linear-gradient(180deg,#ffffff,#f4f7fc)", padding: "90px 0 70px", textAlign: "center" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 40px" }}>
          <Pill>{s.tag}</Pill>
          <h1
            style={{
              fontWeight: 500,
              fontSize: "clamp(38px,4.4vw,68px)",
              lineHeight: 1.04,
              letterSpacing: "-.025em",
              margin: "26px 0 0",
              color: "var(--ink)",
            }}
          >
            {s.title}
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.55, color: "#6b6875", maxWidth: 620, margin: "22px auto 0" }}>
            {s.subtitle}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 34, flexWrap: "wrap" }}>
            <a href="mailto:info@mindfultech.ec" className="btn-dark" style={btnDark}>
              {es ? "INICIAR PROYECTO" : "START A PROJECT"}
            </a>
            <Link href="/services" className="btn-light" style={btnLight}>
              {es ? "TODOS LOS SERVICIOS" : "ALL SERVICES"}
            </Link>
          </div>
        </div>

        {/* specs strip */}
        <div style={{ maxWidth: 980, margin: "56px auto 0", padding: "0 40px" }}>
          <div className="stack-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {s.specs.map(([k, v]) => (
              <div
                key={k}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(14,13,18,.09)",
                  borderRadius: 12,
                  padding: "20px 22px",
                  textAlign: "left",
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: "#8b8896" }}>{k}</div>
                <div style={{ fontWeight: 600, fontSize: 17.5, marginTop: 7 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section style={{ background: "#fff", padding: "100px 0 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <h2 style={h2Center}>{es ? `Por qué MindfulTech para ${s.name}` : `Why MindfulTech for ${s.name}`}</h2>
          <p style={subCenter}>{es ? "Oficio de nivel industrial, hecho a la medida de tu producto." : "Industrial-grade craft, custom-built for your product."}</p>
          <div className="stack-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 26 }}>
            {s.why.map((w, i) => (
              <div
                key={w.title}
                style={{
                  position: "relative",
                  background: WHY_COLORS[i][0],
                  borderRadius: 8,
                  padding: 24,
                  minHeight: 210,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontWeight: 500, fontSize: 21, letterSpacing: "-.01em" }}>{w.title}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: WHY_COLORS[i][1] }}>{w.desc}</div>
                {i < 2 && (
                  <span
                    style={{
                      position: "absolute",
                      right: -19,
                      top: "50%",
                      width: 12,
                      height: 5,
                      background: "var(--accent-light)",
                      zIndex: 2,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHT (dark stat band) */}
      <section style={{ background: "#fff", padding: "90px 0 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div
            className="stack-2"
            style={{
              background: "#0d0a1f",
              borderRadius: 16,
              padding: "clamp(36px,4.6vw,64px)",
              display: "grid",
              gridTemplateColumns: "1.25fr 1fr",
              gap: "clamp(28px,4vw,56px)",
              alignItems: "center",
            }}
          >
            <div>
              <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: ".14em", color: "var(--accent)" }}>
                {es ? "PROBADO EN PRODUCCIÓN" : "PROVEN IN PRODUCTION"}
              </span>
              <h2 style={{ fontWeight: 500, fontSize: "clamp(26px,2.8vw,42px)", letterSpacing: "-.02em", lineHeight: 1.1, margin: "14px 0 12px", color: "#fff" }}>
                {s.highlight.title}
              </h2>
              <p style={{ fontSize: 16.5, lineHeight: 1.6, color: "#8f8ba4", margin: 0, maxWidth: 520 }}>{s.highlight.desc}</p>
              {s.highlight.caseHref && (
                <Link
                  href={s.highlight.caseHref}
                  className="btn-white"
                  style={{
                    display: "inline-block",
                    textDecoration: "none",
                    fontFamily: MONO,
                    fontSize: 11.5,
                    fontWeight: 500,
                    letterSpacing: ".12em",
                    background: "#fff",
                    color: "#0d0a1f",
                    padding: "13px 20px",
                    borderRadius: 6,
                    marginTop: 24,
                  }}
                >
                  {es ? "VER CASO DE ESTUDIO →" : "VIEW CASE STUDY →"}
                </Link>
              )}
            </div>
            <div
              style={{
                background: "#16132b",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 12,
                padding: "clamp(26px,3vw,40px)",
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", color: "#8f8ba4" }}>
                {s.highlight.label}
              </div>
              <div style={{ fontWeight: 500, fontSize: "clamp(56px,6vw,92px)", letterSpacing: "-.03em", lineHeight: 1, color: "#fff", margin: "14px 0 10px" }}>
                {s.highlight.stat}
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,.08)", overflow: "hidden", marginTop: 18 }}>
                <div style={{ width: "82%", height: "100%", background: "linear-gradient(90deg,var(--accent-light),var(--accent))" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section style={{ background: "#fff", padding: "100px 0 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <h2 style={h2Center}>{es ? "Cómo trabajamos" : "How we work"}</h2>
          <p style={subCenter}>{es ? "Un camino claro de la primera conversación a producción." : "A clear path from first conversation to production."}</p>
          <div className="stack-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 26 }}>
            {s.steps.map((st, i) => (
              <div key={st.title} style={{ borderTop: "2px solid rgba(14,13,18,.14)", paddingTop: 18 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".12em", color: "var(--accent-deep)" }}>
                  {String(i + 1).padStart(2, "0")} / {String(s.steps.length).padStart(2, "0")}
                </div>
                <div style={{ fontWeight: 600, fontSize: 19, letterSpacing: "-.01em", margin: "10px 0 8px" }}>{st.title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.55, color: "#6b6875" }}>{st.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENGAGEMENT MODELS */}
      <section style={{ background: "linear-gradient(180deg,#ffffff,#f4f6fb 40%,#eef1f8)", padding: "100px 0 100px", marginTop: 90 }}>
        <div
          className="stack-2"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 40px",
            display: "grid",
            gridTemplateColumns: "0.9fr 1.4fr",
            gap: "clamp(28px,4vw,64px)",
            alignItems: "start",
          }}
        >
          <div>
            <h2 style={{ fontWeight: 500, fontSize: "clamp(28px,3vw,44px)", letterSpacing: "-.02em", lineHeight: 1.08, margin: 0 }}>
              {es ? "Dos formas de trabajar juntos" : "Two ways to work together"}
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "#6b6875", margin: "16px 0 0", maxWidth: 380 }}>
              {es ? "Empieza pequeño o ve de inicio a fin — ambas vienen con gente senior y reportes honestos." : "Start small or go end to end — both come with senior people and honest reporting."}
            </p>
          </div>
          <div className="stack-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {s.engage.map((e) => (
              <div
                key={e.title}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(14,13,18,.08)",
                  borderRadius: 14,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 20px 50px -40px rgba(14,13,18,.4)",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 20, letterSpacing: "-.01em" }}>{e.title}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".12em", color: "#8b8896", margin: "8px 0 16px" }}>
                  {e.forLabel}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 22 }}>
                  {e.bullets.map((b) => (
                    <div key={b} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-deep)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 3 }}>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "#44424d" }}>{b}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="mailto:info@mindfultech.ec"
                  className="btn-dark"
                  style={{
                    marginTop: "auto",
                    textAlign: "center",
                    textDecoration: "none",
                    fontFamily: MONO,
                    fontSize: 11.5,
                    fontWeight: 500,
                    letterSpacing: ".12em",
                    background: "#0e0d12",
                    color: "#fff",
                    padding: "14px 18px",
                    borderRadius: 6,
                  }}
                >
                  {es ? "EMPEZAR" : "GET STARTED"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section style={{ background: "#fff", padding: "100px 0 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <h2 style={h2Center}>{es ? "Qué incluye" : "What's included"}</h2>
          <p style={subCenter}>{es ? "Todo se entrega con investigación, documentación y un equipo que responde." : "Everything ships with research, documentation, and a team that stays accountable."}</p>
          <div className="stack-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {s.includes.map((it) => (
              <div
                key={it.title}
                style={{
                  border: "1px solid rgba(14,13,18,.1)",
                  borderRadius: 12,
                  padding: 22,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "var(--accent-tint)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-deep)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <div style={{ fontWeight: 600, fontSize: 17.5, letterSpacing: "-.01em" }}>{it.title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.55, color: "#6b6875" }}>{it.desc}</div>
              </div>
            ))}
          </div>

          {/* tools */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 56 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", color: "#8b8896", marginRight: 6 }}>
              {es ? "CONSTRUIMOS CON" : "WE SHIP WITH"}
            </span>
            {s.tools.map((t) => (
              <span
                key={t}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: ".08em",
                  color: "#eceaf4",
                  background: "#17151f",
                  border: "1px solid rgba(255,255,255,.14)",
                  borderRadius: 7,
                  padding: "9px 13px",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + footer */}
      <section style={{ background: "#fff", padding: "70px 0 90px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <DarkCTA
            title={es ? `Inicia tu proyecto de ${s.name}` : `Start your ${s.name} project`}
            subtitle={es ? "Cuéntanos qué estás construyendo — respondemos en un día hábil." : "Tell us what you’re building — we’ll reply within one business day."}
            primary={{ label: es ? "EMPIEZA AHORA" : "GET STARTED NOW", href: "#contact" }}
            secondary={{ label: "WHATSAPP →", href: "https://api.whatsapp.com/send?phone=593958731994" }}
          />
        </div>
      </section>
    </div>
  );
}

const btnDark: React.CSSProperties = {
  textDecoration: "none",
  fontFamily: MONO,
  fontSize: 12.5,
  fontWeight: 500,
  letterSpacing: ".12em",
  background: "#0e0d12",
  color: "#fff",
  padding: "16px 26px",
  borderRadius: 6,
};

const btnLight: React.CSSProperties = {
  textDecoration: "none",
  fontFamily: MONO,
  fontSize: 12.5,
  fontWeight: 500,
  letterSpacing: ".12em",
  background: "#e9eaef",
  color: "var(--ink)",
  padding: "16px 26px",
  borderRadius: 6,
};

const h2Center: React.CSSProperties = {
  textAlign: "center",
  fontWeight: 500,
  fontSize: "clamp(30px,3.2vw,48px)",
  letterSpacing: "-.02em",
  margin: 0,
};

const subCenter: React.CSSProperties = {
  textAlign: "center",
  fontSize: 18,
  color: "#8b8896",
  maxWidth: 600,
  margin: "16px auto 48px",
};
