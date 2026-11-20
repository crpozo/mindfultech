"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { POSTS } from "@/lib/blog/posts";
import { MtPage, TalkButton, pick, type Bi } from "./Chrome";
import s from "./mt.module.css";

const COPY = {
  h1a: { en: "We connect your systems.", es: "Conectamos tus sistemas." },
  h1b: { en: "Agents do the work.", es: "Los agentes hacen el trabajo." },
  lead: {
    en: "MindfulTech is an AI software lab. We learn how your business runs, join your data and tools in one platform, and automate the routine with agents built for each job.",
    es: "MindfulTech es un laboratorio de software con IA. Entendemos cómo opera tu negocio, unimos tus datos y herramientas en una sola plataforma y automatizamos la rutina con agentes hechos para cada tarea.",
  },
  heroCap: {
    en: "Recorded from the AI Management Office, our own product. Each person is an agent at work.",
    es: "Grabado en la AI Management Office, nuestro producto. Cada persona es un agente trabajando.",
  },
  logos: { en: "Companies we work with", es: "Empresas con las que trabajamos" },
  officeTitle: { en: "AI Management Office", es: "AI Management Office" },
  officeLead: {
    en: "A 3D office where every agent has a desk. Watch each screen live, chat with any of them, and approve what needs your sign-off.",
    es: "Una oficina 3D donde cada agente tiene su escritorio. Mira cada pantalla en vivo, conversa con cualquiera y aprueba lo que necesita tu firma.",
  },
  officeBtn: { en: "Open the AI Office", es: "Abrir la Oficina IA" },
  casesTitle: { en: "Work we can show you", es: "Trabajo que podemos mostrarte" },
  casesAll: { en: "See all work", es: "Ver todos los casos" },
  readCase: { en: "Read the case", es: "Leer el caso" },
  trustTitle: { en: "You stay in control", es: "El control sigue siendo tuyo" },
  trustLead: {
    en: "Automation only helps if you can trust it. These four rules are part of every project.",
    es: "Automatizar solo sirve si puedes confiar en ello. Estas cuatro reglas van en cada proyecto.",
  },
  blogTitle: { en: "From the lab", es: "Desde el laboratorio" },
  blogAll: { en: "Read all articles", es: "Leer todos los artículos" },
  close: { en: "Tell us what you want to automate.", es: "Cuéntanos qué quieres automatizar." },
};

type Row = { title: Bi; text: Bi; img?: string; w?: number; h?: number; alt?: Bi; cap?: Bi; portrait?: boolean; todo?: Bi };
const ROWS: Row[] = [
  {
    title: { en: "One platform instead of five tabs", es: "Una plataforma en lugar de cinco pestañas" },
    text: {
      en: "We join the systems you already pay for, so a sale, a ticket and an invoice share the same record.",
      es: "Unimos los sistemas que ya pagas, para que una venta, un ticket y una factura compartan el mismo registro.",
    },
    img: "/art/internet-coaches.webp", w: 1400, h: 788,
    alt: { en: "Dashboard with tasks and results for several locations", es: "Panel con tareas y resultados de varias sedes" },
    cap: { en: "The Internet Coaches: one dashboard for every location.", es: "The Internet Coaches: un panel para todas las sedes." },
  },
  {
    title: { en: "Agents that do the routine", es: "Agentes que hacen la rutina" },
    text: {
      en: "Each agent has one job, works inside your real tools, and asks a person before anything that needs a signature.",
      es: "Cada agente tiene una tarea, trabaja dentro de tus herramientas reales y consulta a una persona antes de lo que necesita firma.",
    },
    img: "/mt/agent-panel.webp", w: 540, h: 680, portrait: true,
    alt: { en: "An agent's live screen scheduling a social media post, with its activity log", es: "Pantalla en vivo de un agente programando una publicación, con su registro de actividad" },
    cap: { en: "A marketing agent scheduling posts, with its live screen and activity log.", es: "Un agente de marketing programando publicaciones, con su pantalla en vivo y su registro." },
  },
  {
    title: { en: "Software your team opens every day", es: "Software que tu equipo abre todos los días" },
    text: {
      en: "Web and mobile apps built around how your people already work, published and maintained by us.",
      es: "Aplicaciones web y móviles hechas alrededor de cómo ya trabaja tu gente, publicadas y mantenidas por nosotros.",
    },
    img: "/art/eventflow-login-wide.webp", w: 1400, h: 787,
    alt: { en: "EventFlow sign-in screen for Universidad San Francisco de Quito", es: "Pantalla de ingreso de EventFlow para la Universidad San Francisco de Quito" },
    cap: { en: "EventFlow for USFQ: event management on the web and in the App Store.", es: "EventFlow para la USFQ: gestión de eventos en la web y en el App Store." },
  },
  {
    title: { en: "The same team after launch", es: "El mismo equipo después del lanzamiento" },
    text: {
      en: "A small senior team in Quito that stays on once the project is live, for clients in the US, Europe and Latin America.",
      es: "Un equipo senior y pequeño en Quito que sigue contigo cuando el proyecto ya está en producción, para clientes en EE. UU., Europa y Latinoamérica.",
    },
    todo: { en: "TODO: real photo of the team at work", es: "TODO: foto real del equipo trabajando" },
  },
];

const CASES: { id: string; client: string; title: Bi; text: Bi }[] = [
  {
    id: "usfq", client: "USFQ",
    title: { en: "EventFlow: campus events, with an app in the App Store", es: "EventFlow: eventos del campus, con app en el App Store" },
    text: {
      en: "An event platform for Universidad San Francisco de Quito, with a published iOS app and an AI survey module.",
      es: "Una plataforma de eventos para la Universidad San Francisco de Quito, con app iOS publicada y un módulo de encuestas con IA.",
    },
  },
  {
    id: "healthcare", client: "Helixona",
    title: { en: "An agent that runs medical billing end to end", es: "Un agente que lleva la facturación médica de punta a punta" },
    text: {
      en: "For a functional-medicine clinic in the US, the agent processes insurance claims and keeps the paperwork moving.",
      es: "Para una clínica de medicina funcional en EE. UU., el agente procesa reclamos de seguros y mantiene la documentación en movimiento.",
    },
  },
  {
    id: "fence", client: "Western Fence Supply",
    title: { en: "From Excel to a CRM that routes its own leads", es: "De Excel a un CRM que reparte sus propios leads" },
    text: {
      en: "A full move from spreadsheets to Odoo, with leads assigned by each rep's language and a delivery module for multi-stop routes.",
      es: "Migración completa de hojas de cálculo a Odoo, con leads asignados según el idioma de cada vendedor y un módulo de entregas con varias paradas.",
    },
  },
];

const TRUST: { t: Bi; d: Bi }[] = [
  {
    t: { en: "A person approves", es: "Una persona aprueba" },
    d: { en: "Agents draft and prepare. A person signs off on payments, messages to customers and anything that cannot be undone.", es: "Los agentes preparan. Una persona aprueba pagos, mensajes a clientes y todo lo que no se puede deshacer." },
  },
  {
    t: { en: "Data stays in your region", es: "Los datos se quedan en tu región" },
    d: { en: "Your data lives in the cloud region you choose, inside your own accounts.", es: "Tus datos viven en la región de nube que elijas, dentro de tus propias cuentas." },
  },
  {
    t: { en: "Least privilege", es: "Mínimo privilegio" },
    d: { en: "Each agent gets only the access its job needs, with its own credentials.", es: "Cada agente recibe solo el acceso que su tarea necesita, con credenciales propias." },
  },
  {
    t: { en: "An audit trail you can export", es: "Auditoría que puedes exportar" },
    d: { en: "Every action is logged with who, what and when. Export it whenever you need it.", es: "Cada acción queda registrada con quién, qué y cuándo. Expórtala cuando la necesites." },
  },
];

const LOGOS: { src: string; alt: string; h: string }[] = [
  { src: "/logo-usfq.svg", alt: "USFQ", h: "2.5rem" },
  { src: "/helixona-logo.webp", alt: "Helixona", h: "1.75rem" },
  { src: "/wfs-logo.svg", alt: "Western Fence Supply", h: "2.5rem" },
  { src: "/parc-logo.webp", alt: "PARC Home Care", h: "2.5rem" },
  { src: "/portfolio/themedmotion-logo.webp", alt: "ThemedMotion", h: "2.25rem" },
];
const LOGO_TODO = ["CarCompraCorp", "The Internet Coaches"];

function HeroLoop({ caption }: { caption: string }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  // The only motion on the page. People who ask for less motion get the still.
  React.useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => {});
  }, []);
  return (
    <figure>
      <div className={s.heroMedia}>
        <video ref={ref} muted loop playsInline preload="metadata" poster="/mt/office-poster.webp" aria-label={caption}>
          <source src="/mt/office-loop.mp4" type="video/mp4" />
        </video>
      </div>
      <figcaption className={`${s.wrap} ${s.caption}`}>{caption}</figcaption>
    </figure>
  );
}

export function MtHome() {
  const { lang } = useLang();
  const t = (v: Bi) => pick(lang, v);
  return (
    <MtPage>
      <section className={s.hero}>
        <div className={s.wrap}>
          <h1 className={s.heroTitle}>
            <span>{t(COPY.h1a)}</span>
            <span>{t(COPY.h1b)}</span>
          </h1>
          <p className={`${s.lead} ${s.heroLead}`}>{t(COPY.lead)}</p>
          <div className={s.heroCta}>
            <TalkButton />
          </div>
        </div>
        <HeroLoop caption={t(COPY.heroCap)} />
      </section>

      <section className={s.sectionTight} aria-labelledby="mt-logos">
        <div className={s.wrap}>
          <h2 id="mt-logos" className={s.logosTitle}>{t(COPY.logos)}</h2>
          <ul className={s.logos}>
            {LOGOS.map((l) => (
              <li key={l.alt}>
                <img src={l.src} alt={l.alt} style={{ "--h": l.h } as React.CSSProperties} loading="lazy" />
              </li>
            ))}
            {LOGO_TODO.map((n) => (
              <li key={n} className={s.todo}>TODO: logo {n}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={s.section}>
        <div className={`${s.wrap} ${s.rows}`}>
          {ROWS.map((r, i) => (
            <article key={r.title.en} className={s.rowItem} data-flip={i % 2 === 1} data-narrow={!!r.portrait}>
              <div className={s.rowText}>
                <h3>{t(r.title)}</h3>
                <p>{t(r.text)}</p>
              </div>
              <figure className={s.shot} data-portrait={!!r.portrait}>
                {r.img ? (
                  <>
                    <img src={r.img} alt={r.alt ? t(r.alt) : ""} width={r.w} height={r.h} loading="lazy" />
                    {r.cap && <figcaption className={s.caption}>{t(r.cap)}</figcaption>}
                  </>
                ) : (
                  <div className={s.todo}>{r.todo ? t(r.todo) : "TODO"}</div>
                )}
              </figure>
            </article>
          ))}
        </div>
      </section>

      <section className={`${s.section} ${s.office}`}>
        <div className={s.wrap}>
          <div className={s.officeHead}>
            <h2 className={s.title}>{t(COPY.officeTitle)}</h2>
            <div>
              <p className={s.lead}>{t(COPY.officeLead)}</p>
              <Link href="/office-demo/" className={s.btn}>{t(COPY.officeBtn)}</Link>
            </div>
          </div>
          <div className={s.officeShot}>
            <img src="/office-demo-preview.webp" alt={lang === "es" ? "Vista de la oficina 3D con los agentes en sus escritorios" : "View of the 3D office with agents at their desks"} width={2000} height={1125} loading="lazy" />
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.wrap}>
          <div className={s.sectionHead}>
            <h2 className={s.title}>{t(COPY.casesTitle)}</h2>
            <Link href="/work/" className={s.link}>{t(COPY.casesAll)}</Link>
          </div>
          <ul className={s.cases}>
            {CASES.map((c) => (
              <li key={c.id}>
                <p className={s.caseClient}>{c.client}</p>
                <div className={s.caseBody}>
                  <h3>{t(c.title)}</h3>
                  <p>{t(c.text)}</p>
                  <Link href={`/work/${c.id}/`} className={s.link}>{t(COPY.readCase)}</Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={s.section} style={{ paddingTop: 0 }}>
        <div className={`${s.wrap} ${s.trust}`}>
          <div>
            <h2 className={s.title}>{t(COPY.trustTitle)}</h2>
            <p className={`${s.lead} ${s.titleGap}`}>{t(COPY.trustLead)}</p>
          </div>
          <dl className={s.trustGrid}>
            {TRUST.map((x) => (
              <div key={x.t.en}>
                <dt>{t(x.t)}</dt>
                <dd>{t(x.d)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={s.section} style={{ paddingTop: 0 }}>
        <div className={s.wrap}>
          <div className={s.sectionHead}>
            <h2 className={s.title}>{t(COPY.blogTitle)}</h2>
            <Link href="/blog/" className={s.link}>{t(COPY.blogAll)}</Link>
          </div>
          <ul className={s.posts}>
            {POSTS.slice(0, 3).map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}/`}>
                  <time>{t(p.dateLabel)}</time>
                  <span>{t(p.title)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={s.section} style={{ paddingTop: 0 }}>
        <div className={`${s.wrap} ${s.close}`}>
          <h2>{t(COPY.close)}</h2>
          <TalkButton />
        </div>
      </section>
    </MtPage>
  );
}
