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
    href: "/services/ai/", img: "/art/healthcare.webp",
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

const SLIDES: { img: string; alt: Bi }[] = [
  { img: "/mt/hero-a.webp", alt: { en: "The 3D AI Management Office, with one agent's live screen beside it", es: "La AI Management Office en 3D, con la pantalla en vivo de un agente al lado" } },
  { img: "/mt/hero-b.webp", alt: { en: "A dashboard that joins results from every location", es: "Un panel que une los resultados de todas las sedes" } },
  { img: "/mt/hero-c.webp", alt: { en: "An agent's panel: watch its screen, chat with it, approve its work", es: "El panel de un agente: mira su pantalla, conversa y aprueba su trabajo" } },
];

const STRIP = ["/art/leads.webp", "/art/product.webp", "/art/ailab.webp", "/art/homecare.webp", "/art/healthcare.webp"];

export function SparkHome() {
  const { lang } = useLang();
  const es = lang === "es";
  const t = (v: Bi) => v[lang];
  const [slide, setSlide] = React.useState(0);
  const go = (d: number) => setSlide((v) => (v + d + SLIDES.length) % SLIDES.length);
  const rail = React.useRef<HTMLUListElement>(null);
  const slidePosts = (d: number) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: d * ((card?.clientWidth || 320) + 24), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const band = es ? "Conectamos tus sistemas. Los agentes hacen el trabajo. " : "We connect your systems. Agents do the work. ";

  return (
    <SparkPage active="home">
        <section className={`${s.heroWrap} ${s.hero}`}>
          <div className={s.heroPanel}>
            <h1>{es ? "Conectamos tus sistemas. Los agentes hacen el trabajo." : "We connect your systems. Agents do the work."}</h1>
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
            {SLIDES.map((sl, i) => (
              <img key={sl.img} src={sl.img} alt={i === slide ? t(sl.alt) : ""} data-on={i === slide} loading={i === 0 ? "eager" : "lazy"} />
            ))}
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
                <Link href={v.href} className={`${s.svc} ${i === 0 ? s.svcDark : ""}`}>
                  <h3>{t(v.title)}</h3>
                  {v.img && <img src={v.img} alt="" loading="lazy" />}
                  <p>{t(v.text)}</p>
                  <span className={`${s.pill} ${s.pillSmall} ${i === 0 ? s.pillWhite : s.pillInk}`}>
                    {es ? "Ver más" : "Explore more"}
                    <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className={s.svcFoot}>
            <p>{es ? "Cada proyecto empieza entendiendo tu operación, no eligiendo una herramienta." : "Every project starts by understanding how you operate, not by picking a tool."}</p>
            <Link href="/services/" className={`${s.pill} ${s.pillInk}`}>{es ? "Ver todos los servicios" : "See all services"}</Link>
          </div>
        </section>

        <section className={`${s.night} ${s.notched} ${s.controlBlock}`}>
          <div className={`${s.wrap} ${s.center}`}>
            <p className={s.kicker}>{es ? "Cuatro reglas que van en cada proyecto que entregamos" : "Four rules that are part of every project we deliver"}</p>
            <h2 className={s.h2}>{es ? "Automatización que te mantiene en control." : "Automation that keeps you in control."}</h2>
          </div>
          <div className={`${s.wrap} ${s.control}`}>
            <div className={s.mark} aria-hidden="true"><img src="/brand/logo-mark.webp" alt="" width={220} height={220} loading="lazy" /></div>
            {CONTROL.map((c, i) => (
              <div key={c.t.en} className={s.glass}>
                <svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {i === 0 && <><circle cx="13" cy="11" r="5" /><path d="M4 27c0-5 4-8 9-8 2 0 3.8.5 5.2 1.3M20 24l3 3 6-7" /></>}
                  {i === 1 && <><path d="M16 29s9-8.5 9-15a9 9 0 10-18 0c0 6.500 9 15 9 15z" /><circle cx="16" cy="14" r="3.5" /></>}
                  {i === 2 && <><circle cx="11" cy="20" r="6" /><path d="M15.5 15.5L27 4M22 9l4 4M18.5 12.5l3 3" /></>}
                  {i === 3 && <><rect x="6" y="4" width="20" height="24" rx="3" /><path d="M11 11h10M11 16h10M11 21h6" /></>}
                </svg>
                <div><h3>{t(c.t)}</h3><p>{t(c.d)}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className={`${s.wrap} ${s.section} ${s.split}`}>
          <div className={s.splitMedia}>
            <img src="/mt/agent-panel.webp" alt={es ? "Pantalla en vivo de un agente programando una publicación, con su registro de actividad" : "An agent's live screen scheduling a post, with its activity log"} width={540} height={680} loading="lazy" />
            <span className={`${s.chip} ${s.chipA}`}>{es ? "Mira cada pantalla en vivo" : "Watch every screen live"}</span>
            <span className={`${s.chip} ${s.chipB}`}>{es ? "Conversa con el agente" : "Chat with the agent"}</span>
            <span className={`${s.chip} ${s.chipC}`}>{es ? "Aprueba lo importante" : "Approve what matters"}</span>
          </div>
          <div>
            <p className={s.eyebrow}>{es ? "Conoce la AI Management Office de MindfulTech" : "Meet the AI Management Office by MindfulTech"}</p>
            <h2 className={s.h2}>{es ? "Mira, conversa y aprueba el trabajo de tu equipo de IA." : "Watch, chat with and approve the work of your AI team."}</h2>
            <p className={s.strong}>{es ? "Cada agente tiene un rol y un escritorio. Abres su pantalla, le escribes y decides lo que necesita tu firma." : "Every agent has a role and a desk. You open its screen, write to it, and decide what needs your sign-off."}</p>
            <p className={s.sub}>{es ? "Los agentes trabajan dentro de tus herramientas reales, y cada acción queda registrada." : "Agents work inside your real tools, and every action is logged."}</p>
            <div className={s.btnRow}>
              <Link href="/office-demo/" className={`${s.pill} ${s.pillSage}`}>{es ? "Abrir la Oficina IA" : "Open the AI Office"}<Arrow /></Link>
              <a href="#contact" className={`${s.pill} ${s.pillLine}`}>{t(TALK)}</a>
            </div>
            <ul className={s.checks}>
              <li>{es ? "La pantalla de cada agente, en vivo" : "Every agent's screen, live"}</li>
              <li>{es ? "Chat directo con cualquier agente" : "Direct chat with any agent"}</li>
              <li>{es ? "Registro de cada acción, listo para auditar" : "A log of every action, ready to audit"}</li>
            </ul>
          </div>
        </section>

        <section className={s.wrap}>
          <dl className={s.stats}>
            <div><dt>10</dt><dd>{es ? "años construyendo software centrado en las personas" : "years building human-centered software"}</dd></div>
            <div><dt>3</dt><dd>{es ? "continentes con clientes activos" : "continents with active clients"}</dd></div>
            <div><dt>24/7</dt><dd>{es ? "un agente de facturación en producción para Helixona" : "a billing agent in production for Helixona"}</dd></div>
          </dl>
        </section>

        <div className={s.bands} aria-hidden="true">
          <div className={`${s.band} ${s.bandA}`}><span>{band.repeat(4)}</span><span>{band.repeat(4)}</span></div>
          <div className={`${s.band} ${s.bandB}`}><span>{band.repeat(4)}</span><span>{band.repeat(4)}</span></div>
        </div>

        <section className={`${s.night} ${s.section} ${s.officeBlock}`}>
          <div className={s.wrap}>
            <p className={s.kicker}>{es ? "La AI Management Office, nuestro producto" : "The AI Management Office, our own product"}</p>
            <h2 className={`${s.h2} ${s.officeHead}`}>{es ? "Una oficina donde ves trabajar a tu IA." : "An office where you can see your AI at work."}</h2>
            <Link href="/office-demo/" className={s.officeShot}>
              <img src="/office-demo-preview.webp" alt={es ? "Vista de la oficina 3D con los agentes en sus escritorios" : "View of the 3D office with agents at their desks"} width={2000} height={1125} loading="lazy" />
              <span className={s.officeCard}>
                <span className={s.tags}><i>{es ? "Demo en vivo" : "Live demo"}</i><i>{es ? "12 agentes" : "12 agents"}</i></span>
                <b>{es ? "Entra, abre la pantalla de cualquier agente y conversa con él." : "Step in, open any agent's screen and chat with it."}</b>
              </span>
            </Link>
            <div className={s.officeFoot}>
              <p>{es ? "Agentes con roles de ventas, soporte, finanzas, marketing y operaciones, trabajando dentro de herramientas reales." : "Agents in sales, support, finance, marketing and operations roles, working inside real tools."}</p>
              <Link href="/office-demo/" className={`${s.pill} ${s.pillSage}`}>{es ? "Abrir la Oficina IA" : "Open the AI Office"}<Arrow /></Link>
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
                  <span className={s.wallGo}><Arrow /></span>
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
            <div>
              <p className={s.eyebrow}>{es ? "Lo último del laboratorio" : "The latest from the lab"}</p>
              <h2 className={s.h2}>{es ? "Ideas y aprendizajes sobre IA aplicada." : "Ideas and lessons on applied AI."}</h2>
            </div>
            <div className={s.railBtns}>
              <button type="button" onClick={() => slidePosts(-1)} aria-label={es ? "Artículos anteriores" : "Previous articles"}>
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" onClick={() => slidePosts(1)} aria-label={es ? "Artículos siguientes" : "Next articles"}>
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
          <ul className={s.postRail} ref={rail}>
            {POSTS.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}/`} className={s.post}>
                  <span className={s.postImg}>
                    <img src={p.coverCard || p.cover} alt="" />
                    <span className={s.postTag}><i>{p.tag[lang].charAt(0) + p.tag[lang].slice(1).toLowerCase()}</i></span>
                  </span>
                  <span className={s.postBody}>
                    <b>{t(p.title)}</b>
                    <span>{t(p.excerpt)}</span>
                    <small>{p.author[lang].split(" · ")[0]}<i />{t(p.dateLabel)}</small>
                    <span className={s.postGo}><Arrow /></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className={s.allPosts}><Link href="/blog/">{es ? "Ver todos los artículos" : "Check all posts"}<Arrow /></Link></p>
        </section>
    </SparkPage>
  );
}
