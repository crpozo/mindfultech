"use client";

import * as React from "react";
import Link from "next/link";
import { useLang, type Lang } from "@/components/i18n";
import { CONTACT, openContact } from "@/components/site/Shell";
import s from "./mt.module.css";

export type Bi = { en: string; es: string };
export const pick = (lang: Lang, v: Bi) => v[lang];

/** The one primary action of the site. It keeps this name everywhere. */
export const TALK: Bi = { en: "Talk to us", es: "Hablemos" };

const NAV: { href: string; key: string; label: Bi }[] = [
  { href: "/services/", key: "services", label: { en: "Services", es: "Servicios" } },
  { href: "/work/", key: "work", label: { en: "Work", es: "Casos" } },
  { href: "/office-demo/", key: "office", label: { en: "AI Office", es: "Oficina IA" } },
  { href: "/company/", key: "company", label: { en: "Company", es: "Empresa" } },
  { href: "/blog/", key: "blog", label: { en: "Blog", es: "Blog" } },
];

export function TalkButton({ small = false }: { small?: boolean }) {
  const { lang } = useLang();
  return (
    <button type="button" className={`${s.btn} ${small ? s.btnSmall : ""}`} onClick={() => openContact()}>
      {pick(lang, TALK)}
    </button>
  );
}

export function MtHeader({ active }: { active?: string }) {
  const { lang } = useLang();
  const [open, setOpen] = React.useState(false);
  return (
    <header className={`${s.wrap} ${s.header}`}>
      <Link href="/" className={s.logo} aria-label="MindfulTech">
        <img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} />
      </Link>
      <button type="button" className={s.menuBtn} aria-expanded={open} aria-controls="mt-nav" onClick={() => setOpen((v) => !v)}>
        {open ? (lang === "es" ? "Cerrar" : "Close") : lang === "es" ? "Menú" : "Menu"}
      </button>
      <nav id="mt-nav" className={s.nav} data-open={open} aria-label={lang === "es" ? "Principal" : "Main"}>
        {NAV.map((n) => (
          <Link key={n.key} href={n.href} aria-current={active === n.key ? "page" : undefined}>
            {pick(lang, n.label)}
          </Link>
        ))}
      </nav>
      <TalkButton small />
    </header>
  );
}

export function MtFooter() {
  const { lang, setLang } = useLang();
  const es = lang === "es";
  return (
    <footer className={s.footer}>
      <div className={s.wrap}>
        <div className={s.footGrid}>
          <div className={s.footBrand}>
            <img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} loading="lazy" />
            <p>AI Software Lab</p>
          </div>
          <div>
            <h2>{es ? "Servicios" : "Services"}</h2>
            <ul>
              <li><Link href="/services/custom/">{es ? "Software a medida" : "Custom software"}</Link></li>
              <li><Link href="/services/ai/">{es ? "IA y automatización" : "AI and automation"}</Link></li>
              <li><Link href="/services/security/">{es ? "Ciberseguridad" : "Cybersecurity"}</Link></li>
              <li><Link href="/services/discovery/">{es ? "Workshops y requerimientos" : "Workshops and requirements"}</Link></li>
            </ul>
          </div>
          <div>
            <h2>{es ? "Empresa" : "Company"}</h2>
            <ul>
              {NAV.slice(1).map((n) => (
                <li key={n.key}><Link href={n.href}>{pick(lang, n.label)}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{es ? "Contacto" : "Contact"}</h2>
            <ul>
              <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li><a href={CONTACT.wa} target="_blank" rel="noreferrer">WhatsApp {CONTACT.phone}</a></li>
              <li>Quito, Ecuador</li>
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
  );
}

export function MtPage({ active, children }: { active?: string; children: React.ReactNode }) {
  return (
    <div className={s.page}>
      <MtHeader active={active} />
      <main>{children}</main>
      <MtFooter />
    </div>
  );
}
