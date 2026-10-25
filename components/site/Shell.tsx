"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import s from "./site.module.css";

/* Shared chrome of the redesigned site (Oct 2026): tokens root, sticky nav,
   call-to-action band and footer. Pages render <Shell> around their body;
   SiteChrome appends <SiteFooter /> on every public route. */

export type NavKey = "home" | "services" | "work" | "blog" | "company";

const NAV: { key: NavKey; href: string; en: string; es: string }[] = [
  { key: "services", href: "/services", en: "Services", es: "Servicios" },
  { key: "work", href: "/work", en: "Work", es: "Proyectos" },
  { key: "blog", href: "/blog", en: "Blog", es: "Blog" },
  { key: "company", href: "/company", en: "Company", es: "Empresa" },
];

export const CONTACT = { email: "info@mindfultech.ec", phone: "+593 958 73 1994", tel: "tel:+593958731994", wa: "https://wa.me/593958731994" };

export function SiteNav({ active }: { active?: NavKey }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = React.useState(false);
  return (
    <div className={s.nav}>
      <div className={s.navIn}>
        <Link href="/" className={s.navLogo} aria-label="MindfulTech">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} />
        </Link>
        <div className={s.navLinks}>
          {NAV.map((n) => (
            <Link key={n.key} href={n.href} className={active === n.key ? s.navOn : ""}>{lang === "es" ? n.es : n.en}</Link>
          ))}
        </div>
        <div className={s.navRight}>
          <button type="button" className={lang === "en" ? s.on : ""} onClick={() => setLang("en")}>EN</button>
          <button type="button" className={lang === "es" ? s.on : ""} onClick={() => setLang("es")}>ES</button>
          <a href={`mailto:${CONTACT.email}`} className={s.navCta}>{lang === "es" ? "Empieza un proyecto" : "Start a project"}</a>
          <button type="button" className={s.navBurger} aria-label="Menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <i /><i /><i />
          </button>
        </div>
      </div>
      {open && (
        <div className={s.navSheet}>
          {NAV.map((n) => (
            <Link key={n.key} href={n.href} onClick={() => setOpen(false)}>{lang === "es" ? n.es : n.en}</Link>
          ))}
          <Link href="/office-demo" onClick={() => setOpen(false)}>AI Management Office</Link>
        </div>
      )}
    </div>
  );
}

/** Page wrapper: the design tokens, the nav and a bottom padding before the footer. */
export function Shell({ active, children }: { active?: NavKey; children: React.ReactNode }) {
  return (
    <div className={s.root}>
      <SiteNav active={active} />
      {children}
    </div>
  );
}

/** The green-grid call to action used at the end of every page. */
export function CtaBand({ title, sub, cta }: { title?: string; sub?: string; cta?: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section id="contact" className={`${s.cta} ${s.grid}`}>
      <div className={s.ctaCircle} />
      <div className={s.ctaTri} />
      <div className={s.ctaIn}>
        <h2 className={s.ctaH2}>{title ?? (es ? "Empieza a construir con MindfulTech" : "Start building with MindfulTech")}</h2>
        <p className={s.ctaSub}>{sub ?? (es ? "De la primera sesión de investigación a la IA en producción: un laboratorio, de punta a punta." : "From the first research session to production AI: one lab, end to end.")}</p>
        <div className={s.ctas}>
          <a href={`mailto:${CONTACT.email}`} className={`${s.btn} ${s.btnInk} ${s.btnInkWhite}`}>{cta ?? (es ? "Escríbenos" : "Get started now")}</a>
          <a href={CONTACT.wa} target="_blank" rel="noreferrer" className={`${s.btn} ${s.btnWhite}`}>WhatsApp →</a>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const { lang } = useLang();
  const es = lang === "es";
  const cols: [string, [string, string][]][] = [
    [es ? "Servicios" : "Services", [[es ? "Diseño UX" : "UX Design", "/services/ux"], [es ? "Apps web y móviles" : "Web & Mobile Apps", "/services/apps"], [es ? "Software a medida" : "Custom Software", "/services/custom"], [es ? "IA y automatización" : "AI & Automation", "/services/ai"], ["AI Management Office", "/office-demo"]]],
    [es ? "Proyectos" : "Work", [[es ? "Casos de estudio" : "Case studies", "/work"], ["ThemedMotion 3D", "/work#themedmotion"], [es ? "IA de facturación Helixona" : "Helixona billing AI", "/work#healthcare"], ["USFQ EventFlow", "/work#usfq"], [es ? "CRM Odoo y entregas" : "Odoo CRM & delivery", "/work#fence"]]],
    [es ? "Empresa" : "Company", [[es ? "Nosotros" : "About us", "/company#about"], ["Blog", "/blog"], [es ? "Carreras" : "Careers", "/company#careers"], [es ? "Prensa" : "Press", "/company#press"]]],
  ];
  return (
    <footer className={`${s.root} ${s.footer}`}>
      <div className={s.footerIn}>
        <div className={s.footerCols}>
          <div className={s.footerBrand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} style={{ height: 30, width: "auto" }} />
            <p>{es ? "Laboratorio de software full-stack en Quito. Investigación UX, ingeniería e IA aplicada." : "Full-stack software lab in Quito. UX research, engineering and applied AI."}</p>
          </div>
          {cols.map(([h, links]) => (
            <div key={h} className={s.footerCol}>
              <span className={s.mono}>{h}</span>
              {links.map(([l, href]) => (
                <Link key={l} href={href}>{l}</Link>
              ))}
            </div>
          ))}
          <div className={s.footerCol}>
            <span className={s.mono}>{es ? "Contacto" : "Contact"}</span>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={CONTACT.tel}>{CONTACT.phone}</a>
            <a href={CONTACT.wa} target="_blank" rel="noreferrer">WhatsApp</a>
            <span style={{ color: "#555" }}>Quito, Ecuador</span>
          </div>
        </div>
        <div className={s.footerBottom}>
          <span>© 2026 MindfulTech. {es ? "Todos los derechos reservados." : "All rights reserved."}</span>
          <div>
            <Link href="/company#about">{es ? "Nosotros" : "About"}</Link>
            <Link href="/blog">Blog</Link>
            <a href={`mailto:${CONTACT.email}`}>{es ? "Contacto" : "Contact"}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---- small shared pieces used by the inner pages ---- */

/** Page hero: label, serif H1, lead and optional actions, on the page background. */
/** Page banner: centred on a tinted field with thin column lines and dot patterns; `mark` highlights one word of the title. */
export function PageHero({ label, title, lead, children, tint, mark }: { label?: string; title: React.ReactNode; lead?: string; children?: React.ReactNode; tint?: string; mark?: string }) {
  const marked = typeof title === "string" && mark && title.includes(mark)
    ? title.split(mark).flatMap((part, i, arr) => (i < arr.length - 1 ? [part, <mark key={i} className={s.heroMark}>{mark}</mark>] : [part]))
    : title;
  return (
    <section className={s.pageHero} style={tint ? { ["--tint" as string]: tint } : undefined}>
      <div className={s.heroLines} aria-hidden="true"><i /><i /><i /><i /></div>
      <div className={`${s.heroDots} ${s.heroDotsA}`} aria-hidden="true" />
      <div className={`${s.heroDots} ${s.heroDotsB}`} aria-hidden="true" />
      <div className={s.wrap}>
        {label && <span className={s.heroLabel}>{label}</span>}
        <h1 className={s.h1}>{marked}</h1>
        {lead && <p className={s.heroSub} style={{ maxWidth: 760 }}>{lead}</p>}
        {children && <div className={s.ctas}>{children}</div>}
      </div>
    </section>
  );
}

export function SectionHead({ label, title, sub, right }: { label?: string; title: React.ReactNode; sub?: string; right?: React.ReactNode }) {
  return (
    <div className={s.secHead}>
      <div className={s.head} style={{ marginBottom: 0 }}>
        {label && <span className={s.label}>{label}</span>}
        <h2 className={s.h2}>{title}</h2>
        {sub && <p className={s.sub}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}
