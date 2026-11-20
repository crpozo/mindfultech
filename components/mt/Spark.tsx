"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { POSTS } from "@/lib/blog/posts";
import { SparkPage, ContactBlock, Arrow, TALK, type Bi } from "./SparkChrome";
import s from "./spark.module.css";

const LOGOS = [
  { src: "/logo-usfq.svg", alt: "USFQ", h: "2.5rem" },
  { src: "/helixona-logo.webp", alt: "Helixona", h: "1.6rem" },
  { src: "/wfs-logo.svg", alt: "Western Fence Supply", h: "2.4rem" },
  { src: "/parc-logo.webp", alt: "PARC Home Care", h: "2.4rem" },
  { src: "/portfolio/themedmotion-logo.webp", alt: "ThemedMotion", h: "2.1rem" },
];

const SERVICES: { href: string; img?: string; title: Bi; text: Bi }[] = [
  {
    href: "/services/ai/",
    title: { en: "AI and automation", es: "IA y automatización" },
    text: {
      en: "Agents built for one job each, working inside your real tools, with a person approving what matters.",
      es: "Agentes hechos para una tarea cada uno, dentro de tus herramientas reales, con una persona que aprueba lo importante.",
    },
  },
  {
    href: "/services/custom/", img: "/art/product.webp",
    title: { en: "Custom software", es: "Software a medida" },
    text: { en: "Web and mobile apps built around how your team already works.", es: "Aplicaciones web y móviles hechas alrededor de cómo ya trabaja tu equipo." },
  },
  {
    href: "/services/security/", img: "/art/research.webp",
    title: { en: "Cybersecurity", es: "Ciberseguridad" },
    text: { en: "We assess, harden and monitor your apps, cloud and AI systems.", es: "Evaluamos, reforzamos y monitoreamos tus apps, tu nube y tus sistemas de IA." },
  },
  {
    href: "/services/discovery/", img: "/art/team.webp",
    title: { en: "Workshops and requirements", es: "Workshops y requerimientos" },
    text: { en: "Facilitated sessions that turn how you operate into a clear build plan.", es: "Sesiones facilitadas que convierten tu operación en un plan claro de construcción." },
  },
  {
    href: "/work/", img: "/art/leads.webp",
    title: { en: "Systems integration", es: "Integración de sistemas" },
    text: { en: "Your CRM, billing, channels and data joined so one record follows the customer.", es: "Tu CRM, facturación, canales y datos unidos para que un solo registro siga al cliente." },
  },
  {
    href: "/office-demo/", img: "/art/ailab.webp",
    title: { en: "AI Management Office", es: "AI Management Office" },
    text: { en: "A 3D office where you watch every agent work and sign off on its decisions.", es: "Una oficina 3D donde ves trabajar a cada agente y apruebas sus decisiones." },
  },
];

const CONTROL: { t: Bi; d: Bi }[] = [
  { t: { en: "A person approves", es: "Una persona aprueba" }, d: { en: "Agents prepare. A person signs off on payments, customer messages and anything that cannot be undone.", es: "Los agentes preparan. Una persona aprueba pagos, mensajes a clientes y lo que no se puede deshacer." } },
  { t: { en: "Data stays in your region", es: "Los datos se quedan en tu región" }, d: { en: "Your data lives in the cloud region you choose, inside your own accounts.", es: "Tus datos viven en la región de nube que elijas, dentro de tus cuentas." } },
  { t: { en: "Least privilege", es: "Mínimo privilegio" }, d: { en: "Each agent gets only the access its job needs, with its own credentials.", es: "Cada agente recibe solo el acceso que su tarea necesita, con credenciales propias." } },
  { t: { en: "An audit trail you can export", es: "Auditoría que puedes exportar" }, d: { en: "Every action is logged with who, what and when.", es: "Cada acción queda registrada con quién, qué y cuándo." } },
];

const CASES: { id: string; client: string; where: Bi; title: Bi; text?: Bi }[] = [
  {
    id: "healthcare", client: "Helixona", where: { en: "Functional-medicine clinic, United States", es: "Clínica de medicina funcional, Estados Unidos" },
    title: { en: "An agent that runs medical billing end to end.", es: "Un agente que lleva la facturación médica de punta a punta." },
    text: { en: "It processes insurance claims, handles payer submissions and keeps the paperwork moving, with a human check where it counts.", es: "Procesa reclamos de seguros, gestiona los envíos a aseguradoras y mantiene la documentación en movimiento, con revisión humana donde importa." },
  },
  {
    id: "usfq", client: "USFQ", where: { en: "Universidad San Francisco de Quito", es: "Universidad San Francisco de Quito" },
    title: { en: "EventFlow: campus events with an app in the App Store.", es: "EventFlow: eventos del campus con app en el App Store." },
  },
  {
    id: "fence", client: "Western Fence Supply", where: { en: "Fence distributor, United States", es: "Distribuidor de cercas, Estados Unidos" },
    title: { en: "From Excel to a CRM that routes its own leads.", es: "De Excel a un CRM que reparte sus propios leads." },
    text: { en: "A full move to Odoo, with leads assigned by each rep's language and a delivery module for multi-stop truck routes.", es: "Migración completa a Odoo, con leads asignados según el idioma de cada vendedor y un módulo de entregas con varias paradas." },
  },
  {
    id: "carcompra-crm", client: "CarCompra", where: { en: "Car dealership, Ecuador", es: "Concesionaria, Ecuador" },
    title: { en: "A custom CRM that sells cars with AI and Meta ads.", es: "Un CRM a medida que vende autos con IA y pautas de Meta." },
    text: { en: "Every campaign lead from WhatsApp and Instagram lands in one pipeline for the sales team.", es: "Cada lead de campaña desde WhatsApp e Instagram llega a un solo pipeline para el equipo de ventas." },
  },
  {
    id: "parc", client: "PARC Home Care", where: { en: "Home-care agency, United States", es: "Agencia de cuidado en casa, Estados Unidos" },
    title: { en: "PARC Connect, a client portal in both app stores.", es: "PARC Connect, un portal de clientes en ambas tiendas de apps." },
  },
  {
    id: "themedmotion", client: "ThemedMotion", where: { en: "Animatronics studio, Netherlands", es: "Estudio de animatrónicos, Países Bajos" },
    title: { en: "An immersive 3D portfolio for a studio that builds theme-park figures.", es: "Un portafolio 3D inmersivo para un estudio que construye figuras de parques temáticos." },
    text: { en: "Interactive 3D figure viewer and scroll storytelling across their seven-step process.", es: "Visor 3D interactivo y narrativa con scroll a lo largo de su proceso de siete pasos." },
  },
];

const SLIDES: { video?: string; img: string; alt: Bi }[] = [
  { video: "/mt/office-loop.mp4", img: "/mt/office-poster.webp", alt: { en: "Recording of the AI Management Office with agents at work", es: "Grabación de la AI Management Office con agentes trabajando" } },
  { img: "/office-demo-preview.webp", alt: { en: "The 3D office seen from above, with every agent at a desk", es: "La oficina 3D vista desde arriba, con cada agente en su escritorio" } },
  { img: "/art/internet-coaches.webp", alt: { en: "Dashboard with tasks and results for several locations", es: "Panel con tareas y resultados de varias sedes" } },
];

const STRIP = ["/art/internet-coaches.webp", "/art/eventflow-login-wide.webp", "/art/helixona-hero.webp", "/art/wfs-hero.webp", "/art/themedmotion-wide.webp"];

export function SparkHome() {
  const { lang } = useLang();
  const es = lang === "es";
  const t = (v: Bi) => v[lang];
  const video = React.useRef<HTMLVideoElement>(null);
  const [slide, setSlide] = React.useState(0);
  React.useEffect(() => {
    if (slide !== 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.current?.play().catch(() => {});
  }, [slide]);
  const go = (d: number) => setSlide((v) => (v + d + SLIDES.length) % SLIDES.length);
  const band = es ? "Conectamos tus sistemas. Los agentes hacen el trabajo. " : "We connect your systems. Agents do the work. ";

  return (
    <SparkPage active="home">
        <section className={`${s.heroWrap} ${s.hero}`}>
          <div className={s.heroPanel}>
            <h1>
              <span>{es ? "Conectamos" : "We connect"}</span>
              <span>{es ? "tus sistemas." : "your systems."}</span>
              <span>{es ? "Los agentes trabajan." : "Agents do the work."}</span>
            </h1>
            <p>
              {es
                ? "Entendemos cómo opera tu negocio, unimos tus datos y herramientas en una sola plataforma y automatizamos la rutina con agentes hechos para cada tarea."
                : "We learn how your business runs, join your data and tools in one platform, and automate the routine with agents built for each job."}
            </p>
            <Link href="/services/" className={`${s.pill} ${s.pillSage}`}>
              {es ? "Ver nuestros servicios" : "Explore our services"}
              <Arrow />
            </Link>
          </div>
          <div className={s.heroMedia}>
            {SLIDES[slide].video ? (
              <video key="v" ref={video} muted loop playsInline preload="metadata" poster={SLIDES[slide].img} aria-label={t(SLIDES[slide].alt)}>
                <source src={SLIDES[slide].video} type="video/mp4" />
              </video>
            ) : (
              <img key={SLIDES[slide].img} src={SLIDES[slide].img} alt={t(SLIDES[slide].alt)} />
            )}
            <Link href="/office-demo/" className={s.play} aria-label={es ? "Abrir la Oficina IA en vivo" : "Open the live AI Office"}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 7l8 5-8 5z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
            </Link>
            <div className={s.arrows}>
              <button type="button" onClick={() => go(-1)} aria-label={es ? "Imagen anterior" : "Previous image"}>
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" onClick={() => go(1)} aria-label={es ? "Imagen siguiente" : "Next image"}>
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </section>

        <section className={s.logoRail} aria-label={es ? "Clientes" : "Clients"}>
          <ul className={s.logoTrack}>
            {[0, 1, 2, 3].map((k) =>
              LOGOS.map((l) => (
                <li key={k + l.alt} aria-hidden={k > 0}>
                  <img src={l.src} alt={k === 0 ? l.alt : ""} style={{ "--h": l.h } as React.CSSProperties} />
                </li>
              ))
            )}
          </ul>
        </section>

        <section className={`${s.wrap} ${s.section}`}>
          <h2 className={`${s.h2} ${s.svcHead}`}>{es ? "IA y software para que tu negocio crezca, ahorre tiempo y haga mucho más." : "AI and software to grow your business, save time and get far more done."}</h2>
          <ul className={s.svcGrid}>
            {SERVICES.map((v, i) => (
              <li key={v.href + v.title.en}>
                {i === 0 ? (
                  <div className={`${s.svc} ${s.svcDark}`}>
                    <h3>{t(v.title)}</h3>
                    <p>{t(v.text)}</p>
                    <Link href={v.href} className={`${s.pill} ${s.pillSage} ${s.pillSmall}`}>{es ? "Ver el servicio" : "See the service"}</Link>
                  </div>
                ) : (
                  <Link href={v.href} className={s.svc}>
                    <h3>{t(v.title)}</h3>
                    {v.img && <img src={v.img} alt="" loading="lazy" />}
                    <p>{t(v.text)}</p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className={s.svcFoot}>
            <p>{es ? "Cada proyecto empieza entendiendo tu operación, no eligiendo una herramienta." : "Every project starts by understanding how you operate, not by picking a tool."}</p>
            <Link href="/services/" className={`${s.pill} ${s.pillInk}`}>{es ? "Ver todos los servicios" : "See all services"}</Link>
          </div>
        </section>

        <section className={`${s.night} ${s.section}`}>
          <div className={`${s.wrap} ${s.center}`}>
            <h2 className={s.h2} style={{ maxWidth: "18ch" }}>{es ? "Automatización en la que tú mantienes el control." : "Automation that keeps you in control."}</h2>
            <p className={s.sub} style={{ marginTop: "1.25rem" }}>{es ? "Estas cuatro reglas van en cada proyecto que entregamos." : "These four rules are part of every project we deliver."}</p>
          </div>
          <div className={`${s.wrap} ${s.control}`}>
            <div className={s.controlCol}>
              {CONTROL.slice(0, 2).map((c) => (
                <div key={c.t.en} className={s.glass}><h3>{t(c.t)}</h3><p>{t(c.d)}</p></div>
              ))}
            </div>
            <div className={s.mark}><img src="/brand/logo-mark.webp" alt="" width={220} height={220} loading="lazy" /></div>
            <div className={s.controlCol}>
              {CONTROL.slice(2).map((c) => (
                <div key={c.t.en} className={s.glass}><h3>{t(c.t)}</h3><p>{t(c.d)}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${s.wrap} ${s.section} ${s.split}`}>
          <div className={s.splitMedia}>
            <img src="/mt/agent-panel.webp" alt={es ? "Pantalla en vivo de un agente programando una publicación, con su registro de actividad" : "An agent's live screen scheduling a post, with its activity log"} width={540} height={680} loading="lazy" />
          </div>
          <div>
            <h2 className={s.h2}>{es ? "Mira, conversa y aprueba el trabajo de tu equipo de IA." : "Watch, chat with and approve the work of your AI team."}</h2>
            <p className={s.sub}>{es ? "En la AI Management Office cada agente tiene un rol y un escritorio. Abres su pantalla, le escribes y decides lo que necesita tu firma." : "In the AI Management Office every agent has a role and a desk. You open its screen, write to it, and decide what needs your sign-off."}</p>
            <div className={s.btnRow}>
              <Link href="/office-demo/" className={`${s.pill} ${s.pillSage}`}>{es ? "Abrir la Oficina IA" : "Open the AI Office"}</Link>
              <a href="#contact" className={`${s.pill} ${s.pillLine}`}>{t(TALK)}</a>
            </div>
            <ul className={s.checks}>
              <li>{es ? "La pantalla de cada agente, en vivo." : "Every agent's screen, live."}</li>
              <li>{es ? "Chat directo con cualquier agente." : "Direct chat with any agent."}</li>
              <li>{es ? "Registro de cada acción, listo para auditar." : "A log of every action, ready to audit."}</li>
            </ul>
          </div>
        </section>

        <section className={s.wrap}>
          <dl className={s.stats}>
            <div><dt>10</dt><dd>{es ? "años construyendo software centrado en las personas." : "years building human-centered software."}</dd></div>
            <div><dt>3</dt><dd>{es ? "continentes con clientes activos: América del Norte, Europa y Sudamérica." : "continents with active clients: North America, Europe and South America."}</dd></div>
            <div><dt>24/7</dt><dd>{es ? "un agente de facturación médica en producción para Helixona." : "a medical billing agent in production for Helixona."}</dd></div>
          </dl>
        </section>

        <div className={s.bands} aria-hidden="true">
          <div className={`${s.band} ${s.bandA}`}><span>{band.repeat(4)}</span><span>{band.repeat(4)}</span></div>
          <div className={`${s.band} ${s.bandB}`}><span>{band.repeat(4)}</span><span>{band.repeat(4)}</span></div>
        </div>

        <section className={`${s.night} ${s.section}`}>
          <div className={s.wrap}>
            <h2 className={`${s.h2} ${s.officeHead}`}>{es ? "Una oficina donde ves trabajar a tu IA." : "An office where you can see your AI at work."}</h2>
            <div className={s.officeShot}>
              <img src="/office-demo-preview.webp" alt={es ? "Vista de la oficina 3D con los agentes en sus escritorios" : "View of the 3D office with agents at their desks"} width={2000} height={1125} loading="lazy" />
            </div>
            <div className={s.officeFoot}>
              <p className={s.sub}>{es ? "Doce agentes con roles de ventas, soporte, finanzas, marketing y operaciones. Entra y recórrela." : "Twelve agents in sales, support, finance, marketing and operations roles. Step in and walk around."}</p>
              <Link href="/office-demo/" className={`${s.pill} ${s.pillSage}`}>{es ? "Abrir la Oficina IA" : "Open the AI Office"}</Link>
            </div>
          </div>
        </section>

        <section className={`${s.wrap} ${s.section}`}>
          <div className={s.center}>
            <h2 className={s.h2} style={{ maxWidth: "16ch" }}>{es ? "Lo que construimos para nuestros clientes." : "What we built for our clients."}</h2>
          </div>
          <ul className={s.wall}>
            {CASES.map((c) => (
              <li key={c.id}>
                <Link href={`/work/${c.id}/`}>
                  <p>{t(c.title)}</p>
                  {c.text && <small>{t(c.text)}</small>}
                  <b>{c.client}</b>
                  <em>{t(c.where)}</em>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <ul className={s.strip} aria-hidden="true">
          {STRIP.map((src) => (
            <li key={src}><img src={src} alt="" loading="lazy" /></li>
          ))}
        </ul>

        <div style={{ marginTop: "var(--space)" }}>
          <ContactBlock id="contact" />
        </div>

        <section className={`${s.wrap} ${s.section}`}>
          <div className={s.blogHead}>
            <h2 className={s.h2}>{es ? "Ideas y aprendizajes sobre IA aplicada." : "Ideas and lessons on applied AI."}</h2>
            <Link href="/blog/" className={`${s.pill} ${s.pillLine}`}>{es ? "Leer todos los artículos" : "Read all articles"}</Link>
          </div>
          <ul className={s.posts}>
            {POSTS.slice(0, 3).map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}/`}>
                  <img src={p.coverCard || p.cover} alt="" loading="lazy" />
                  <h3>{t(p.title)}</h3>
                  <p>{t(p.excerpt)}</p>
                  <time>{t(p.dateLabel)}</time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
    </SparkPage>
  );
}
