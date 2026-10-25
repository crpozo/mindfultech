// Case studies shown on /work (moved out of the old WorkBody on 2026-10-24).
export type Bi = { en: string; es: string };

export type BiOr = string | Bi;

export type Case = {
  id: string;
  brand: Bi;
  imageFirst: boolean;
  tag: Bi;
  title: Bi;
  body: Bi;
  stats: [BiOr, Bi][];
  live?: { href: string };
  image?: string;
  caption: Bi; // mono caption, bottom-right of the polaroid
  tilt: number;
  gallery?: { src: string; label: Bi }[];
};

export const CASES: Case[] = [
  {
    id: "themedmotion",
    brand: { en: "ThemedMotion", es: "ThemedMotion" },
    imageFirst: false,
    tag: { en: "WEB · 3D · ANIMATRONICS", es: "WEB · 3D · ANIMATRÓNICOS" },
    title: {
      en: "An immersive 3D portfolio for a Dutch animatronics studio",
      es: "Un portafolio 3D inmersivo para un estudio de animatrónicos en Países Bajos",
    },
    body: {
      en: "ThemedMotion (by P&P Projects, Netherlands) builds animatronics for theme parks worldwide. We built their site with React Three Fiber and Spline for the interactive 3D figure, GSAP-driven scroll storytelling across their 7-step process, and a 60-second brief flow.",
      es: "ThemedMotion (de P&P Projects, Países Bajos) construye animatrónicos para parques temáticos de todo el mundo. Hicimos su sitio con React Three Fiber y Spline para la figura 3D interactiva, narrativa por scroll con GSAP a través de su proceso de 7 pasos, y un flujo de brief de 60 segundos.",
    },
    stats: [
      ["3D", { en: "FIGURE VIEWER", es: "VISOR DE FIGURA" }],
      ["07", { en: "CHAPTERS", es: "CAPÍTULOS" }],
      ["60s", { en: "BRIEF FLOW", es: "FLUJO DE BRIEF" }],
    ],
    live: { href: "https://crpozo.github.io/themed-motion/" },
    image: "/portfolio/tm-site-hero.webp",
    caption: { en: "REACT · R3F · SPLINE · GSAP", es: "REACT · R3F · SPLINE · GSAP" },
    tilt: 2,
    gallery: [
      { src: "/portfolio/tm-site-work.webp", label: { en: "PROJECT GALLERY", es: "GALERÍA DE PROYECTOS" } },
      { src: "/portfolio/tm-site-design.webp", label: { en: "DESIGN CHAPTER", es: "CAPÍTULO DE DISEÑO" } },
      { src: "/portfolio/tm-site-finish.webp", label: { en: "FINISHING", es: "ACABADOS" } },
    ],
  },
  {
    id: "healthcare",
    brand: { en: "Helixona", es: "Helixona" },
    imageFirst: true,
    tag: { en: "HEALTHCARE · AI AGENT · US", es: "SALUD · AGENTE IA · EE. UU." },
    title: {
      en: "An AI agent that runs medical billing end to end",
      es: "Un agente de IA que opera la facturación médica de punta a punta",
    },
    body: {
      en: "For Helixona, a functional-medicine clinic in the US, our agent in production handles the full billing cycle: processing insurance claims in eClinicalWorks, navigating Blue Shield submissions, and keeping documentation pipelines moving. Its companion tool, Plan Profile, analyzes policy documents (EOC/SPD) and builds medical-condition pages for the clinic's site.",
      es: "Para Helixona, una clínica de medicina funcional en EE. UU., nuestro agente en producción maneja el ciclo completo de facturación: procesa reclamos de seguros en eClinicalWorks, navega los envíos a Blue Shield y mantiene los pipelines de documentación en movimiento. Su herramienta complementaria, Plan Profile, analiza documentos de pólizas (EOC/SPD) y construye páginas de condiciones médicas para el sitio de la clínica.",
    },
    stats: [
      ["24/7", { en: "AGENT IN PRODUCTION", es: "AGENTE EN PRODUCCIÓN" }],
      [{ en: "End-to-end", es: "Punta a punta" }, { en: "BILLING CYCLE", es: "CICLO DE FACTURACIÓN" }],
      ["EOC/SPD", { en: "POLICY ANALYSIS", es: "ANÁLISIS DE PÓLIZAS" }],
    ],
    image: "/art/helixona-hero.webp",
    caption: { en: "PYTHON · PLAYWRIGHT · LLMs", es: "PYTHON · PLAYWRIGHT · LLMs" },
    tilt: -2,
  },
  {
    id: "fence",
    brand: { en: "Western Fence Supply", es: "Western Fence Supply" },
    imageFirst: false,
    tag: { en: "DISTRIBUTION · ODOO · US", es: "DISTRIBUCIÓN · ODOO · EE. UU." },
    title: {
      en: "From Excel to a CRM that routes itself",
      es: "De Excel a un CRM que se enruta solo",
    },
    body: {
      en: "Full CRM migration from spreadsheets to Odoo, with round-robin lead routing and automatic assignment by each rep's language. We also built a custom delivery module for multi-stop truck routes on Odoo.sh, ran end-to-end QA on the WordPress site, and shipped the internal Training Companion plugin.",
      es: "Migración completa del CRM de hojas de cálculo a Odoo, con enrutamiento round-robin de leads y asignación automática según el idioma de cada representante. También construimos un módulo custom de entregas para rutas de camiones multi-parada sobre Odoo.sh, hicimos QA integral del sitio WordPress y entregamos el plugin interno Training Companion.",
    },
    stats: [
      [{ en: "Excel → Odoo", es: "Excel → Odoo" }, { en: "CRM MIGRATION", es: "MIGRACIÓN DE CRM" }],
      [{ en: "Round-robin", es: "Round-robin" }, { en: "LEAD ROUTING", es: "RUTEO DE LEADS" }],
      [{ en: "Multi-stop", es: "Multi-parada" }, { en: "TRUCK ROUTES", es: "RUTAS DE CAMIÓN" }],
    ],
    image: "/art/wfs-hero.webp",
    caption: { en: "ODOO.SH · PYTHON · WORDPRESS", es: "ODOO.SH · PYTHON · WORDPRESS" },
    tilt: 1.6,
  },
  {
    id: "usfq",
    brand: { en: "USFQ", es: "USFQ" },
    imageFirst: true,
    tag: { en: "EDUCATION · EVENTS · iOS", es: "EDUCACIÓN · EVENTOS · iOS" },
    title: {
      en: "EventFlow: campus events, with an app in the App Store",
      es: "EventFlow: eventos del campus, con app en el App Store",
    },
    body: {
      en: "An event-management platform for Universidad San Francisco de Quito, with a published iOS app and an AI-powered survey module.",
      es: "Una plataforma de gestión de eventos para la Universidad San Francisco de Quito, con app iOS publicada y un módulo de encuestas potenciado por IA.",
    },
    stats: [
      ["iOS", { en: "IN THE APP STORE", es: "EN EL APP STORE" }],
      ["AI", { en: "SURVEY MODULE", es: "MÓDULO DE ENCUESTAS" }],
    ],
    image: "/portfolio/eventflow-banner.webp",
    caption: { en: "EVENTFLOW · iOS · AI", es: "EVENTFLOW · iOS · IA" },
    tilt: -2,
  },
  {
    id: "carcompra",
    brand: { en: "CarCompraCorp", es: "CarCompraCorp" },
    imageFirst: false,
    tag: { en: "AUTOMOTIVE · LEADS", es: "AUTOMOTRIZ · LEADS" },
    title: {
      en: "WhatsApp and Instagram leads, routed automatically",
      es: "Leads de WhatsApp e Instagram, distribuidos automáticamente",
    },
    body: {
      en: "Lead capture and automatic distribution from WhatsApp and Instagram to the sales team, built on Meta's WhatsApp Cloud API and AWS serverless.",
      es: "Captura y distribución automática de leads desde WhatsApp e Instagram hacia el equipo de ventas, sobre la Cloud API de WhatsApp de Meta y AWS serverless.",
    },
    stats: [
      ["2", { en: "LEAD CHANNELS", es: "CANALES DE LEADS" }],
      ["AWS", { en: "SERVERLESS BACKEND", es: "BACKEND SERVERLESS" }],
    ],
    image: "/art/leads.webp",
    caption: { en: "META CLOUD API · AWS", es: "META CLOUD API · AWS" },
    tilt: 1.8,
  },
  {
    id: "carcompra-crm",
    brand: { en: "CarCompra", es: "CarCompra" },
    imageFirst: true,
    tag: { en: "AUTOMOTIVE · CRM · ECUADOR", es: "AUTOMOTRIZ · CRM · ECUADOR" },
    title: {
      en: "A custom CRM that sells cars with AI and Meta ads",
      es: "Un CRM a medida que vende autos con IA y pautas de Meta",
    },
    body: {
      en: "CarCompra, an Ecuadorian car dealership, wanted to automate sales with AI working alongside its sellers. We built a custom CRM platform for the sales team (integrated with Meta and its ad campaigns, running on AWS) so every campaign lead lands in a pipeline the team can actually close.",
      es: "CarCompra, un patio de autos en Ecuador, quería automatizar sus ventas con IA trabajando junto a sus vendedores. Construimos una plataforma CRM a medida para el equipo de ventas (integrada con Meta y sus pautas publicitarias, sobre AWS) para que cada lead de campaña caiga en un pipeline que el equipo sí puede cerrar.",
    },
    stats: [
      [{ en: "Meta Ads", es: "Pautas Meta" }, { en: "CAMPAIGN INTEGRATION", es: "INTEGRACIÓN DE PAUTAS" }],
      [{ en: "AI", es: "IA" }, { en: "SALES AUTOMATION", es: "AUTOMATIZACIÓN DE VENTAS" }],
      [{ en: "Custom", es: "A medida" }, { en: "SELLER PLATFORM", es: "PLATAFORMA DE VENDEDORES" }],
    ],
    image: "/art/carcrm.webp",
    caption: { en: "AWS · META · AI", es: "AWS · META · IA" },
    tilt: -1.8,
  },
  {
    id: "parc",
    brand: { en: "PARC Home Care", es: "PARC Home Care" },
    imageFirst: false,
    tag: { en: "HOME CARE · MOBILE · US", es: "HOME CARE · MÓVIL · EE. UU." },
    title: {
      en: "PARC Connect, in both app stores",
      es: "PARC Connect, en las dos tiendas de apps",
    },
    body: {
      en: "A client-portal mobile app for a US home-care agency, published on the App Store and Google Play, alongside the corporate website, including transactional email setup and fixing Google indexing issues.",
      es: "Una app móvil de portal para una agencia de cuidado en el hogar en EE. UU., publicada en App Store y Google Play, junto con el sitio web corporativo, incluyendo la configuración de email transaccional y la resolución de problemas de indexación en Google.",
    },
    stats: [
      ["2", { en: "APP STORES", es: "TIENDAS DE APPS" }],
      ["Flutter", { en: "ONE CODEBASE", es: "UN SOLO CÓDIGO" }],
    ],
    image: "/art/parc-login.webp",
    caption: { en: "FLUTTER · WORDPRESS · SES", es: "FLUTTER · WORDPRESS · SES" },
    tilt: -1.6,
  },
];
