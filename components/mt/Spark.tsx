"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { POSTS } from "@/lib/blog/posts";
import { CONTACT, WEB3FORMS_KEY } from "@/components/site/Shell";
import s from "./spark.module.css";

type Bi = { en: string; es: string };
const TALK: Bi = { en: "Talk to us", es: "Hablemos" };

const NAV: { href: string; label: Bi }[] = [
  { href: "/services/", label: { en: "Services", es: "Servicios" } },
  { href: "/work/", label: { en: "Work", es: "Casos" } },
  { href: "/office-demo/", label: { en: "AI Office", es: "Oficina IA" } },
  { href: "/company/", label: { en: "Company", es: "Empresa" } },
  { href: "/blog/", label: { en: "Blog", es: "Blog" } },
];

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

const STRIP = ["/art/internet-coaches.webp", "/art/eventflow-login-wide.webp", "/art/helixona-hero.webp", "/art/wfs-hero.webp", "/art/themedmotion-wide.webp"];

function ContactCard({ es }: { es: boolean }) {
  const [f, setF] = React.useState({ name: "", email: "", company: "", msg: "" });
  const [state, setState] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((v) => ({ ...v, [k]: e.target.value }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    const subject = `mindfultech.ec: ${f.name}`;
    const payload = { type: "project", name: f.name, email: f.email, company: f.company, message: f.msg };
    try {
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), 8000);
      const r = WEB3FORMS_KEY
        ? await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal: ctrl.signal, body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject, from_name: "mindfultech.ec", replyto: f.email, ...payload }) })
        : await fetch(`https://formsubmit.co/ajax/${CONTACT.formTo}`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal: ctrl.signal, body: JSON.stringify({ ...payload, _subject: subject, _template: "table", _captcha: "false", _replyto: f.email }) });
      window.clearTimeout(timer);
      if (!r.ok) throw new Error(String(r.status));
      setState("sent");
      setF({ name: "", email: "", company: "", msg: "" });
    } catch {
      // the form service did not answer: hand the same message to the visitor's mail app
      setState("error");
      const body = [`${es ? "Nombre" : "Name"}: ${f.name}`, `Email: ${f.email}`, `${es ? "Empresa" : "Company"}: ${f.company}`, "", f.msg].join("\n");
      window.location.href = `mailto:${CONTACT.formTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };
  return (
    <form className={s.form} onSubmit={submit}>
      <h3>{es ? "Escríbenos" : "Send us a message"}</h3>
      <label>
        {es ? "Nombre" : "Name"}
        <input required value={f.name} onChange={set("name")} autoComplete="name" />
      </label>
      <label>
        Email
        <input required type="email" value={f.email} onChange={set("email")} autoComplete="email" />
      </label>
      <label className={s.full}>
        {es ? "Empresa" : "Company"}
        <input value={f.company} onChange={set("company")} autoComplete="organization" />
      </label>
      <label className={s.full}>
        {es ? "Qué quieres automatizar" : "What you want to automate"}
        <textarea required value={f.msg} onChange={set("msg")} />
      </label>
      <button type="submit" className={`${s.pill} ${s.pillInk}`} disabled={state === "sending"}>
        {state === "sending" ? (es ? "Enviando mensaje" : "Sending message") : es ? "Enviar mensaje" : "Send message"}
      </button>
      {state === "sent" && <p className={s.formNote} role="status">{es ? "Mensaje enviado. Te respondemos por correo." : "Message sent. We will reply by email."}</p>}
      {state === "error" && <p className={s.formNote} role="status">{es ? "No se pudo enviar desde aquí. Se abrió tu correo con el mensaje listo." : "It could not be sent from here. Your mail app opened with the message ready."}</p>}
    </form>
  );
}

export function SparkHome() {
  const { lang, setLang } = useLang();
  const es = lang === "es";
  const t = (v: Bi) => v[lang];
  const [open, setOpen] = React.useState(false);
  const video = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.current?.play().catch(() => {});
  }, []);
  const band = es ? "Conectamos tus sistemas. Los agentes hacen el trabajo. " : "We connect your systems. Agents do the work. ";

  return (
    <div className={s.page}>
      <header className={`${s.wrap} ${s.header}`}>
        <Link href="/" className={s.logo} aria-label="MindfulTech">
          <img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} />
        </Link>
        <nav id="sp-nav" className={s.nav} data-open={open} aria-label={es ? "Principal" : "Main"}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>{t(n.label)}</Link>
          ))}
        </nav>
        <button type="button" className={`${s.pill} ${s.pillLine} ${s.pillSmall} ${s.menuBtn}`} aria-expanded={open} aria-controls="sp-nav" onClick={() => setOpen((v) => !v)}>
          {open ? (es ? "Cerrar" : "Close") : es ? "Menú" : "Menu"}
        </button>
        <a href="#contact" className={`${s.pill} ${s.pillInk} ${s.pillSmall}`}>{t(TALK)}</a>
      </header>

      <main>
        <section className={`${s.wrap} ${s.hero}`}>
          <div>
            <h1>{es ? "Conectamos tus sistemas. Los agentes hacen el trabajo." : "We connect your systems. Agents do the work."}</h1>
            <p>
              {es
                ? "MindfulTech es un laboratorio de software con IA. Entendemos cómo opera tu negocio, unimos tus datos y herramientas en una sola plataforma y automatizamos la rutina con agentes hechos para cada tarea."
                : "MindfulTech is an AI software lab. We learn how your business runs, join your data and tools in one platform, and automate the routine with agents built for each job."}
            </p>
            <a href="#contact" className={`${s.pill} ${s.pillSage}`}>{t(TALK)}</a>
          </div>
          <div className={s.heroMedia}>
            <video ref={video} muted loop playsInline preload="metadata" poster="/mt/office-poster.webp" aria-label={es ? "Grabación de la AI Management Office con agentes trabajando" : "Recording of the AI Management Office with agents at work"}>
              <source src="/mt/office-loop.mp4" type="video/mp4" />
            </video>
          </div>
        </section>

        <section className={s.wrap} aria-label={es ? "Clientes" : "Clients"}>
          <ul className={s.logos}>
            {LOGOS.map((l) => (
              <li key={l.alt}><img src={l.src} alt={l.alt} style={{ "--h": l.h } as React.CSSProperties} loading="lazy" /></li>
            ))}
          </ul>
          <p className={s.logosNote}>{es ? "Empresas en Estados Unidos, Europa y Latinoamérica trabajan con nosotros." : "Companies in the United States, Europe and Latin America work with us."}</p>
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

        <section id="contact" className={`${s.night} ${s.section}`} style={{ marginTop: "var(--space)" }}>
          <div className={`${s.wrap} ${s.contact}`}>
            <div>
              <h2 className={s.h2} style={{ maxWidth: "14ch" }}>{es ? "Cuéntanos qué quieres automatizar." : "Tell us what you want to automate."}</h2>
              <p className={s.sub}>{es ? "Escríbenos por el formulario, por WhatsApp o por correo. Te responde una persona del equipo." : "Write through the form, WhatsApp or email. A person on the team replies."}</p>
              <ul className={s.ways}>
                <li><b>WhatsApp</b><a href={CONTACT.wa} target="_blank" rel="noreferrer">{CONTACT.phone}</a></li>
                <li><b>Email</b><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              </ul>
            </div>
            <ContactCard es={es} />
          </div>
        </section>

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
      </main>

      <footer className={s.footer}>
        <div className={s.wrap}>
          <div className={s.footGrid}>
            <div className={s.footBrand}>
              <span className={s.footLogo}><img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} loading="lazy" /></span>
              <p>AI Software Lab. Quito, Ecuador.</p>
            </div>
            <div>
              <h2>{es ? "Servicios" : "Services"}</h2>
              <ul>
                {SERVICES.slice(0, 4).map((v) => (
                  <li key={v.href}><Link href={v.href}>{t(v.title)}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h2>{es ? "Empresa" : "Company"}</h2>
              <ul>
                {NAV.slice(1).map((n) => (
                  <li key={n.href}><Link href={n.href}>{t(n.label)}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h2>{es ? "Contacto" : "Contact"}</h2>
              <ul>
                <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
                <li><a href={CONTACT.wa} target="_blank" rel="noreferrer">WhatsApp {CONTACT.phone}</a></li>
              </ul>
            </div>
          </div>
          <div className={s.footBase}>
            <span>© 2026 MindfulTech</span>
            <div className={s.lang} role="group" aria-label={es ? "Idioma" : "Language"}>
              <button type="button" aria-pressed={!es} onClick={() => setLang("en")}>English</button>
              <button type="button" aria-pressed={es} onClick={() => setLang("es")}>Español</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
