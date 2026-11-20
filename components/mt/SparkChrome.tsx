"use client";

import * as React from "react";
import Link from "next/link";
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
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ContactCard() {
  const { lang } = useLang();
  const es = lang === "es";
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

/** Dark block with the contact options and the form. Used on the home and on /contact. */
export function ContactBlock({ id, h1 = false }: { id?: string; h1?: boolean }) {
  const { lang } = useLang();
  const es = lang === "es";
  const H = h1 ? "h1" : "h2";
  return (
    <section id={id} className={`${s.night} ${s.section}`}>
      <div className={`${s.wrap} ${s.contact}`}>
        <div>
          <H className={s.h2} style={{ maxWidth: "14ch" }}>{es ? "Cuéntanos qué quieres automatizar." : "Tell us what you want to automate."}</H>
          <p className={s.sub}>{es ? "Escríbenos por el formulario, por WhatsApp o por correo. Te responde una persona del equipo." : "Write through the form, WhatsApp or email. A person on the team replies."}</p>
          <ul className={s.ways}>
            <li><b>WhatsApp</b><a href={CONTACT.wa} target="_blank" rel="noreferrer">{CONTACT.phone}</a></li>
            <li><b>Email</b><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            <li><b>{es ? "Oficina" : "Office"}</b><span>Quito, Ecuador</span></li>
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

/** Page banner: the grey panel with one cut corner, alone or beside an image. */
export function Banner({ title, lead, img, alt, children }: { title: string; lead?: string; img?: string; alt?: string; children?: React.ReactNode }) {
  return (
    <section className={`${s.heroWrap} ${s.hero} ${s.banner}`} data-solo={!img}>
      <div className={s.heroPanel}>
        <h1>{title}</h1>
        {lead && <p>{lead}</p>}
        {children}
      </div>
      {img && (
        <div className={s.heroMedia}>
          <img src={img} alt={alt || ""} />
        </div>
      )}
    </section>
  );
}

export function SparkPage({ active, children }: { active?: string; children: React.ReactNode }) {
  const { lang, setLang } = useLang();
  const es = lang === "es";
  const [open, setOpen] = React.useState(false);
  return (
    <div className={s.page}>
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
        <div className={s.wrap}>
          <div className={s.footGrid}>
            <div className={s.footBrand}>
              <span className={s.footLogo}><img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} loading="lazy" /></span>
              <p>AI Software Lab. Quito, Ecuador.</p>
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
              <h2>{es ? "Empresa" : "Company"}</h2>
              <ul>
                {NAV.slice(1).map((n) => (
                  <li key={n.key}><Link href={n.href}>{n.label[lang]}</Link></li>
                ))}
                <li><Link href="/contact/">{es ? "Contacto" : "Contact"}</Link></li>
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
