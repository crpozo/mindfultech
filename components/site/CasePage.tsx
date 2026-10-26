"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { CASES } from "@/lib/site/cases";
import { Shell, CtaBand, PageHero, SectionHead, CONTACT } from "./Shell";
import s from "./site.module.css";

const TINTS = ["#eeedfb", "#e6f7ec", "#fdebd3", "#e3f1fb", "#f7f1d6", "#eeedfb", "#e6f7ec"];

/** One project on its own page: banner, framed screenshot, stats, gallery, the other projects. */
export function CasePage({ slug }: { slug: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const i = CASES.findIndex((c) => c.id === slug);
  const c = CASES[i];
  if (!c) return null;
  const host = c.live?.href ? c.live.href.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : c.brand.en.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".com";
  const others = CASES.filter((x) => x.id !== slug).slice(0, 3);
  return (
    <Shell active="work">
      <PageHero label={`${c.brand[lang]} / ${c.tag[lang].replace(/ · /g, " / ")}`} title={c.title[lang]} tint={TINTS[i % TINTS.length]} lead={c.body[lang]}>
        {c.live ? (
          <a href={c.live.href} target="_blank" rel="noopener noreferrer" className={`${s.btn} ${s.btnInk}`}>{es ? "Ver sitio en vivo →" : "Visit live site →"}</a>
        ) : (
          <a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(es ? `Caso de estudio ${c.brand.es}` : `Case study ${c.brand.en}`)}`} className={`${s.btn} ${s.btnInk}`}>{es ? "Solicitar caso de estudio →" : "Request case study →"}</a>
        )}
        <Link href="/work" className={`${s.btn} ${s.btnOutline}`}>{es ? "Todos los proyectos" : "All projects"}</Link>
      </PageHero>

      <section className={`${s.wrap} ${s.sectionFirst}`}>
        <div className={s.featureFrame} style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
          <span className={s.featureBar}><i /><i /><i /><em>{host}</em></span>
          {c.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={s.featureImg} src={c.image} alt={c.brand[lang]} width={1200} height={675} />
          ) : (
            <div className={s.featureImg} style={{ display: "grid", placeItems: "center", background: "repeating-linear-gradient(135deg,#D9DDD6 0 10px,#E8EBE6 10px 20px)", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.12em" }}>{es ? "FOTO PRÓXIMAMENTE" : "PHOTO COMING SOON"}</div>
          )}
        </div>
        <div className={s.caseStats} style={{ justifyContent: "center", marginTop: 28 }}>
          {c.stats.map(([v, l]) => (
            <div key={l.en}><b>{typeof v === "string" ? v : v[lang]}</b><small>{l[lang]}</small></div>
          ))}
          <div><b style={{ fontSize: 14, fontFamily: "var(--mono)", paddingTop: 6 }}>{c.caption[lang].replace(/ · /g, " / ")}</b><small>{es ? "Stack" : "Stack"}</small></div>
        </div>
      </section>

      {c.gallery && (
        <section className={`${s.wrap} ${s.section}`}>
          <SectionHead title={es ? "Dentro del proyecto" : "Inside the project"} />
          <div className={s.gallery}>
            {c.gallery.map((g) => (
              <figure key={g.src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.src} alt={g.label[lang]} width={1200} height={675} loading="lazy" />
                <figcaption>{g.label[lang]}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className={`${s.wrap} ${s.section}`}>
        <SectionHead title={es ? "Más proyectos" : "More projects"} />
        <div className={s.cards3}>
          {others.map((o) => (
            <Link key={o.id} href={`/work/${o.id}`} className={s.moreCase}>
              <span className={s.mono}>{o.brand[lang]}</span>
              <b>{o.title[lang]}</b>
              <span className={s.mono}>{es ? "Ver proyecto →" : "View project →"}</span>
            </Link>
          ))}
        </div>
      </section>

      <div style={{ height: 100 }} />
      <CtaBand title={es ? "¿Tu proyecto es el siguiente?" : "Is your project next?"} />
    </Shell>
  );
}
