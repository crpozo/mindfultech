"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUp, MapPin, MessagesSquare } from "lucide-react";
import { useLang } from "@/components/i18n";
import { CONTACT, WEB3FORMS_KEY } from "@/components/site/Shell";
import s from "./spark.module.css";

export type Bi = { en: string; es: string };
/** The one primary action of the site. It keeps this name everywhere. */
export const TALK: Bi = { en: "Talk to us", es: "Hablemos" };

export const NAV: { key: string; href: string; label: Bi }[] = [
  { key: "services", href: "/services/", label: { en: "Services", es: "Servicios" } },
  { key: "work", href: "/work/", label: { en: "Work", es: "Casos" } },
  { key: "office", href: "/office-demo/", label: { en: "AI Office", es: "Oficina IA" } },
  { key: "company", href: "/company/", label: { en: "Company", es: "Empresa" } },
  { key: "blog", href: "/blog/", label: { en: "Blog", es: "Blog" } },
];
export const SERVICE_LINKS: { slug: string; label: Bi }[] = [
  { slug: "ai", label: { en: "AI and automation", es: "IA y automatización" } },
  { slug: "custom", label: { en: "Custom software", es: "Software a medida" } },
  { slug: "security", label: { en: "Cybersecurity", es: "Ciberseguridad" } },
  { slug: "discovery", label: { en: "Workshops and requirements", es: "Workshops y requerimientos" } },
];

export function Arrow() {
  return <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />;
}

export function Linkedin() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zM8.7 17H6.4V9.7h2.3zM7.5 8.7a1.3 1.3 0 110-2.7 1.3 1.3 0 010 2.7zM17.7 17h-2.3v-3.6c0-.9 0-2-1.2-2s-1.4 1-1.4 1.9V17h-2.3V9.7h2.2v1c.3-.6 1-1.2 2.2-1.2 2.3 0 2.8 1.5 2.8 3.5z" /></svg>
  );
}

export function ContactCard() {
  const { lang } = useLang();
  const es = lang === "es";
  const [f, setF] = React.useState({ name: "", email: "", company: "", phone: "", service: "", msg: "" });
  const [state, setState] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((v) => ({ ...v, [k]: e.target.value }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    const subject = `mindfultech.ec: ${f.name}`;
    const payload = { type: "project", name: f.name, email: f.email, company: f.company, phone: f.phone, service: f.service, message: f.msg };
    try {
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), 8000);
      const r = WEB3FORMS_KEY
        ? await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal: ctrl.signal, body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject, from_name: "mindfultech.ec", replyto: f.email, ...payload }) })
        : await fetch(`https://formsubmit.co/ajax/${CONTACT.formTo}`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal: ctrl.signal, body: JSON.stringify({ ...payload, _subject: subject, _template: "table", _captcha: "false", _replyto: f.email }) });
      window.clearTimeout(timer);
      if (!r.ok) throw new Error(String(r.status));
      setState("sent");
      setF({ name: "", email: "", company: "", phone: "", service: "", msg: "" });
    } catch {
      // the form service did not answer: hand the same message to the visitor's mail app
      setState("error");
      const body = [`${es ? "Nombre" : "Name"}: ${f.name}`, `Email: ${f.email}`, `${es ? "Empresa" : "Company"}: ${f.company}`, `${es ? "Teléfono" : "Phone"}: ${f.phone}`, `${es ? "Servicio" : "Service"}: ${f.service}`, "", f.msg].join("\n");
      window.location.href = `mailto:${CONTACT.formTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };
  return (
    <form className={s.form} onSubmit={submit}>
      <h3>{es ? "Escríbenos" : "Get in touch"}</h3>
      <p className={s.formLead}>{es ? "Llena el formulario y una persona del equipo te responde por correo." : "Fill out the form and a person on the team replies by email."}</p>
      <label>
        <span>{es ? "Tu nombre" : "Your name"}</span>
        <input required value={f.name} onChange={set("name")} autoComplete="name" placeholder={es ? "Tu nombre" : "Your name"} />
      </label>
      <label>
        <span>Email</span>
        <input required type="email" value={f.email} onChange={set("email")} autoComplete="email" placeholder={es ? "Correo electrónico" : "Email address"} />
      </label>
      <label>
        <span>{es ? "Empresa" : "Company"}</span>
        <input value={f.company} onChange={set("company")} autoComplete="organization" placeholder={es ? "Empresa" : "Company name"} />
      </label>
      <label>
        <span>{es ? "Teléfono" : "Phone"}</span>
        <input type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder={es ? "Teléfono" : "Phone number"} />
      </label>
      <label className={s.full}>
        <span>{es ? "Servicio" : "Service"}</span>
        <select value={f.service} onChange={set("service")}>
          <option value="">{es ? "Qué servicio te interesa" : "Which service you need"}</option>
          {SERVICE_LINKS.map((v) => <option key={v.slug} value={v.label.en}>{v.label[lang]}</option>)}
          <option value="AI Management Office">AI Management Office</option>
        </select>
      </label>
      <label className={s.full}>
        <span>{es ? "Qué quieres automatizar" : "What you want to automate"}</span>
        <textarea required value={f.msg} onChange={set("msg")} placeholder={es ? "Cuéntanos qué quieres automatizar" : "Tell us what you want to automate"} />
      </label>
      <button type="submit" className={`${s.pill} ${s.pillInk}`} disabled={state === "sending"}>
        {state === "sending" ? (es ? "Enviando mensaje" : "Sending message") : es ? "Enviar mensaje" : "Send message"}
        <Arrow />
      </button>
      {state === "sent" && <p className={s.formNote} role="status">{es ? "Mensaje enviado. Te respondemos por correo." : "Message sent. We will reply by email."}</p>}
      {state === "error" && <p className={s.formNote} role="status">{es ? "No se pudo enviar desde aquí. Se abrió tu correo con el mensaje listo." : "It could not be sent from here. Your mail app opened with the message ready."}</p>}
    </form>
  );
}

/** Dark block with the contact options and the form. Used on the home and on /contact. */
export function ContactBlock({ id, h1 = false }: { id?: string; h1?: boolean }) {
  const { lang } = useLang();
  const es = lang === "es";
  const H = h1 ? "h1" : "h2";
  return (
    <section id={id} className={`${s.night} ${s.section} ${s.stepped}`}>
      <div className={`${s.wrap} ${s.contact}`}>
        <div>
          <p className={s.kicker}>{es ? "Estamos para responder tus preguntas" : "We are here to answer your questions"}</p>
          <H className={s.h2} style={{ maxWidth: "14ch" }}>{es ? "Cuéntanos qué quieres automatizar." : "Tell us what you want to automate."}</H>
          <p className={s.contactLead}>{es ? "Escríbenos por el formulario, por WhatsApp o por correo. Te responde una persona del equipo, no un bot." : "Write through the form, WhatsApp or email. A person on the team replies, not a bot."}</p>
          <div className={s.btnRow}>
            <a href={CONTACT.wa} target="_blank" rel="noreferrer" className={`${s.pill} ${s.pillWhite}`}>{es ? "Escribir por WhatsApp" : "Chat on WhatsApp"}<Arrow /></a>
            <a href={`mailto:${CONTACT.email}`} className={`${s.pill} ${s.pillLine}`}>{es ? "Enviar un correo" : "Send an email"}</a>
          </div>
          <ul className={s.ways}>
            <li>
              <MessagesSquare size={38} strokeWidth={1.3} aria-hidden="true" />
              <div><b>{es ? "Primero entendemos tu operación" : "We start by understanding how you operate"}</b><p>{es ? "La primera conversación es para conocer tu proceso, no para venderte una herramienta." : "The first conversation is about your process, not about selling you a tool."}</p></div>
            </li>
            <li>
              <MapPin size={38} strokeWidth={1.3} aria-hidden="true" />
              <div><b>{es ? "Equipo en Quito, Ecuador" : "A team in Quito, Ecuador"}</b><p>{CONTACT.phone}. {CONTACT.email}</p></div>
            </li>
          </ul>
        </div>
        <ContactCard />
      </div>
    </section>
  );
}

/** Closing line used at the bottom of the inner pages. */
export function TalkBand() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section className={`${s.night} ${s.talkBand}`}>
      <h2 className={s.h2}>{es ? "Cuéntanos qué quieres automatizar." : "Tell us what you want to automate."}</h2>
      <Link href="/contact/" className={`${s.pill} ${s.pillSage}`}>{TALK[lang]}</Link>
    </section>
  );
}

/**
 * Banner of every inner page: a 3D render edge to edge with the menu laid over
 * it, the title, one line, two actions, and the breadcrumb in a tab cut into
 * its bottom edge. `crumbs` are the steps after Home; the last one is this page.
 */
export function Banner({ title, lead, crumbs, art = "a", children }: { title: string; lead?: string; crumbs: [string, string?][]; art?: "a" | "b"; children?: React.ReactNode }) {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section className={`${s.heroWrap} ${s.pageBanner}`} style={{ backgroundImage: `url(${art === "a" ? "/mt/hero-3d.webp" : "/mt/hero-3d-b.webp"})` }}>
      <div className={s.pageBannerIn}>
        <h1>{title}</h1>
        {lead && <p>{lead}</p>}
        <div className={s.btnRow}>
          {children || (
            <>
              <Link href="/contact/" className={`${s.pill} ${s.pillSage}`}>{TALK[lang]}<Arrow /></Link>
              <Link href="/work/" className={`${s.pill} ${s.pillWhite}`}>{es ? "Ver nuestro trabajo" : "See our work"}</Link>
            </>
          )}
        </div>
      </div>
      <nav className={s.crumbs} aria-label={es ? "Ruta" : "Breadcrumb"}>
        <ol>
          <li><Link href="/">{es ? "Inicio" : "Home"}</Link></li>
          {crumbs.map(([label, href], i) => (
            <li key={label} aria-current={i === crumbs.length - 1 ? "page" : undefined}>
              {href && i < crumbs.length - 1 ? <Link href={href}>{label}</Link> : label}
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}

/** `over` lays the menu on top of the page banner (every inner page); the home keeps it on white. */
export function SparkPage({ active, over = true, children }: { active?: string; over?: boolean; children: React.ReactNode }) {
  const { lang, setLang } = useLang();
  const es = lang === "es";
  const [open, setOpen] = React.useState(false);
  const [stuck, setStuck] = React.useState(false);
  React.useEffect(() => {
    const on = () => setStuck(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div className={s.page} id="top" data-over={over} data-stuck={stuck || open}>
      <header className={`${s.heroWrap} ${s.header}`}>
        <Link href="/" className={s.logo} aria-label="MindfulTech">
          <img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} />
        </Link>
        <nav id="sp-nav" className={s.nav} data-open={open} aria-label={es ? "Principal" : "Main"}>
          <Link href="/" aria-current={active === "home" ? "page" : undefined}>{es ? "Inicio" : "Home"}</Link>
          {NAV.map((n) => (
            <Link key={n.key} href={n.href} aria-current={active === n.key ? "page" : undefined}>{n.label[lang]}</Link>
          ))}
        </nav>
        <button type="button" className={`${s.pill} ${s.pillLine} ${s.pillSmall} ${s.menuBtn}`} aria-expanded={open} aria-controls="sp-nav" onClick={() => setOpen((v) => !v)}>
          {open ? (es ? "Cerrar" : "Close") : es ? "Menú" : "Menu"}
        </button>
        <Link href="/contact/" className={`${s.pill} ${s.pillInk} ${s.pillSmall}`}>{TALK[lang]}</Link>
      </header>

      <main>{children}</main>

      <footer className={s.footer}>
        <i className={`${s.bite} ${s.biteTL}`} /><i className={`${s.bite} ${s.biteTR}`} /><i className={`${s.bite} ${s.biteBL}`} /><i className={`${s.bite} ${s.biteBR}`} />
        <div className={s.footIn}>
          <div className={s.footGrid}>
            <div className={s.footBrand}>
              <span className={s.footLogo}><img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} loading="lazy" /></span>
              <p>AI Software Lab. {es ? "Diseñamos, construimos y operamos software con IA." : "We design, build and run AI software."}</p>
              <a href={`mailto:${CONTACT.email}`} className={s.footMail}>{CONTACT.email}</a>
              <a href={CONTACT.tel}>{CONTACT.phone}</a>
            </div>
            <div>
              <h2>{es ? "Empresa" : "Company"}</h2>
              <ul>
                <li><Link href="/company/">{es ? "Sobre nosotros" : "About us"}</Link></li>
                <li><Link href="/work/">{es ? "Casos" : "Case studies"}</Link></li>
                <li><Link href="/office-demo/">{es ? "Oficina IA" : "AI Office"}</Link></li>
                <li><Link href="/contact/">{es ? "Contacto" : "Contact us"}</Link></li>
              </ul>
            </div>
            <div>
              <h2>{es ? "Servicios" : "Services"}</h2>
              <ul>
                {SERVICE_LINKS.map((v) => (
                  <li key={v.slug}><Link href={`/services/${v.slug}/`}>{v.label[lang]}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h2>{es ? "Recursos" : "Resources"}</h2>
              <ul>
                <li><Link href="/blog/">Blog</Link></li>
                <li><Link href="/services/">{es ? "Cómo trabajamos" : "How it works"}</Link></li>
              </ul>
            </div>
            <div className={s.footTalk}>
              <h2>{es ? "Empecemos" : "Start a project"}</h2>
              <p>{es ? "Cuéntanos qué quieres automatizar y te respondemos por correo." : "Tell us what you want to automate and we reply by email."}</p>
              <Link href="/contact/" className={s.footField}><span>{TALK[lang]}</span><i><Arrow /></i></Link>
              <div className={s.social}>
                <a href="https://www.linkedin.com/company/mindfultech" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <Linkedin />
                </a>
                <a href="https://github.com/crpozo" target="_blank" rel="noreferrer" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.2-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.4.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0012 2z" /></svg>
                </a>
              </div>
            </div>
          </div>
          <div className={s.footBase}>
            <span>© 2026 MindfulTech. {es ? "Todos los derechos reservados." : "All rights reserved."}</span>
            <div className={s.lang} role="group" aria-label={es ? "Idioma" : "Language"}>
              <button type="button" aria-pressed={!es} onClick={() => setLang("en")}>English</button>
              <button type="button" aria-pressed={es} onClick={() => setLang("es")}>Español</button>
            </div>
          </div>
        </div>
        <a href="#top" className={s.toTop} aria-label={es ? "Volver arriba" : "Back to top"}>
          <ArrowUp size={19} strokeWidth={1.8} aria-hidden="true" />
        </a>
      </footer>
    </div>
  );
}
