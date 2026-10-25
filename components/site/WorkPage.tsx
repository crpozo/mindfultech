"use client";

import * as React from "react";
import { useLang } from "@/components/i18n";
import { CASES } from "@/lib/site/cases";
import { Shell, CtaBand, PageHero, CONTACT } from "./Shell";
import s from "./site.module.css";

const SHAPES = ["#BFF5CF", "#C9C4F2", "#85BFE9", "#3DBE7D", "#F4C542", "#BFF5CF", "#C9C4F2"];

export function WorkPage() {
  const { lang } = useLang();
  const es = lang === "es";
  const host = (brand: string) => brand.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".com";
  return (
    <Shell active="work">
      <PageHero
        label={es ? "Proyectos" : "Work"}
        title={es ? "Entregado con clientes" : "Shipped with clients"}
        lead={es ? "Una década de productos en producción, de portales universitarios a comercio automatizado." : "A decade of products in production, from university portals to automated commerce."}
      />
      <section className={`${s.wrap}`} style={{ paddingTop: 24 }}>
        {CASES.map((c, i) => {
          const num = String(i + 1).padStart(2, "0");
          const media = (
            <div className={s.caseMedia}>
              <div className={s.featureCircle} style={{ background: SHAPES[(i + 1) % SHAPES.length] }} />
              <div className={s.caseShape} style={{ background: SHAPES[i % SHAPES.length] }} />
              <div className={s.featureFrame} style={{ position: "relative", zIndex: 1 }}>
                <span className={s.featureBar}><i /><i /><i /><em>{host(c.brand.en)}</em></span>
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={s.featureImg} src={c.image} alt={c.brand[lang]} width={1200} height={675} loading={i > 0 ? "lazy" : undefined} />
                ) : (
                  <div className={s.featureImg} style={{ display: "grid", placeItems: "center", background: "repeating-linear-gradient(135deg,#D9DDD6 0 10px,#E8EBE6 10px 20px)", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.12em" }}>{es ? "FOTO PRÓXIMAMENTE" : "PHOTO COMING SOON"}</div>
                )}
              </div>
            </div>
          );
          const text = (
            <div className={s.caseText} id={c.id} style={{ scrollMarginTop: 110 }}>
              <span className={s.label}>{num} / {c.brand[lang]} / {c.tag[lang].replace(/ · /g, " / ")}</span>
              <h2>{c.title[lang]}</h2>
              <p>{c.body[lang]}</p>
              <div className={s.caseStats}>
                {c.stats.map(([v, l]) => (
                  <div key={l.en}><b>{typeof v === "string" ? v : v[lang]}</b><small>{l[lang]}</small></div>
                ))}
              </div>
              <div className={s.ctas} style={{ justifyContent: "flex-start", alignItems: "center" }}>
                {c.live ? (
                  <a href={c.live.href} target="_blank" rel="noopener noreferrer" className={`${s.btn} ${s.btnInk}`}>{es ? "Ver sitio en vivo →" : "Visit live site →"}</a>
                ) : (
                  <a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(es ? `Caso de estudio ${c.brand.es}` : `Case study ${c.brand.en}`)}`} className={`${s.btn} ${s.btnOutline}`}>{es ? "Solicitar caso de estudio →" : "Request case study →"}</a>
                )}
                <span className={s.mono} style={{ color: "#555" }}>{c.caption[lang].replace(/ · /g, " / ")}</span>
              </div>
            </div>
          );
          return (
            <React.Fragment key={c.id}>
              <div className={s.caseRow} style={i === 0 ? { borderTop: 0 } : undefined}>
                {c.imageFirst ? <>{media}{text}</> : <>{text}{media}</>}
              </div>
              {c.gallery && (
                <div className={s.gallery} style={{ marginTop: -24, marginBottom: 40 }}>
                  {c.gallery.map((g) => (
                    <figure key={g.src}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.src} alt={g.label[lang]} width={1200} height={675} loading="lazy" />
                      <figcaption>{g.label[lang]}</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </section>
      <div style={{ height: 100 }} />
      <CtaBand title={es ? "¿Tu proyecto es el siguiente?" : "Is your project next?"} />
    </Shell>
  );
}
