"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { CASES } from "@/lib/site/cases";
import { SERVICES, SERVICES_ES } from "@/lib/site/serviceDetail";
import { POSTS, getPost, type Block } from "@/lib/blog/posts";
import { openContact } from "@/components/site/Shell";
import { Split, Scramble, Dots } from "./CerebriumFx";
import { CbPage } from "./CerebriumParts";
import s from "./cerebrium.module.css";

/* Detail pages on the new system: project, service and article. Dark banner on the scene, light body, dark closing block. */

function DetailBanner({ label, title, grad, lead, primary, secondary }: { label: string; title: string; grad?: string; lead?: string; primary?: React.ReactNode; secondary?: React.ReactNode }) {
  const parts = grad && title.includes(grad) ? title.split(grad) : [title];
  return (
    <section className={`${s.hero} ${s.heroWide}`} data-cb-hero style={{ minHeight: "78vh" }}>
      <div className={`${s.heroIn} ${s.bannerIn}`} style={{ paddingBottom: 56 }}>
        <div>
          <span className={`${s.mono} ${s.label} ${s.labelLight}`} style={{ marginBottom: 24 }}>{label}</span>
          <h1 className={s.h1} style={{ fontSize: "clamp(38px, 4.8vw, 72px)" }}>
            <Split text={parts[0].trim()} />{grad && parts.length > 1 && <> <span className={s.grad}><Split text={grad} delay={240} /></span>{parts[1].trim() && <> <Split text={parts[1].trim()} delay={360} /></>}</>}
          </h1>
        </div>
      </div>
      {(lead || primary) && <div className={s.bannerLead} style={{ paddingBottom: 80 }}><span /><div>{lead && <p>{lead}</p>}{(primary || secondary) && <div className={s.ctas} style={{ marginTop: 26 }}>{primary}{secondary}</div>}</div></div>}
    </section>
  );
}

/* ---------------------------------------------------------------- project ---- */
export function CbCase({ slug }: { slug: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const i = CASES.findIndex((c) => c.id === slug);
  const c = CASES[i];
  if (!c) return null;
  const others = CASES.filter((x) => x.id !== slug).slice(0, 3);
  const host = c.live?.href ? c.live.href.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : c.brand.en.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".com";
  return (
    <CbPage mode={i % 2 ? "columns" : "bands"} active="work">
      <DetailBanner label={`${c.brand[lang]} / ${c.tag[lang].replace(/ · /g, " / ")}`} title={c.title[lang]} lead={c.body[lang]}
        primary={c.live ? <a href={c.live.href} target="_blank" rel="noopener noreferrer" className={`${s.btn} ${s.btnAcc}`}><Scramble text={es ? "Ver sitio en vivo" : "Visit live site"} /></a> : <button type="button" onClick={openContact} className={`${s.btn} ${s.btnAcc}`}><Scramble text={es ? "Solicitar caso de estudio" : "Request case study"} /></button>}
        secondary={<Link href="/work" className={`${s.btn} ${s.btnSolid}`}><Scramble text={es ? "Todos los proyectos" : "All projects"} /></Link>} />
      <section className={s.light}>
        <div className={`${s.wrap} ${s.section}`}>
          <div className={s.card} style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className={`${s.mockThumb}`} style={{ ["--tint" as string]: ["#2a1a3a", "#1a2a3a", "#1f2d1a", "#3a2a1a", "#1a1f3a", "#2a1a1a", "#1a2f2a"][i % 7], borderRadius: 12 }}>
              <span className={s.win} style={{ width: "88%" }}><i /><i /><i /><span className={s.mono} style={{ position: "absolute", top: 5, left: 0, right: 0, textAlign: "center", color: "#8a8fa6", fontSize: 10 }}>{host}</span>
                {c.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.image} alt={c.brand[lang]} width={1200} height={675} /> : <div style={{ aspectRatio: "16/9", display: "grid", placeItems: "center", background: "#1b1b2a", color: "#8a8fa6", fontFamily: "var(--font-jbmono), monospace", fontSize: 11, letterSpacing: "0.12em" }}>{es ? "FOTO PRÓXIMAMENTE" : "PHOTO COMING SOON"}</div>}
              </span>
            </div>
            <div className={s.statRow} style={{ marginTop: 22 }}>
              {c.stats.map(([v, l]) => <div key={l.en}><b style={{ fontSize: 40 }}>{typeof v === "string" ? v : v[lang]}</b><span className={s.mono}>{l[lang]}</span></div>)}
              <div><b style={{ fontSize: 16, fontFamily: "var(--font-jbmono), monospace", fontWeight: 400, lineHeight: 1.5 }}>{c.caption[lang].replace(/ · /g, " / ")}</b><span className={s.mono}>Stack</span></div>
            </div>
          </div>
          {c.gallery && (
            <div style={{ marginTop: 56 }}>
              <h2 className={s.h2} style={{ marginBottom: 28, fontSize: "clamp(28px, 3vw, 44px)" }}><Split text={es ? "Dentro del proyecto" : "Inside the project"} /></h2>
              <div className={s.built}>{c.gallery.map((g) => <div key={g.src} className={s.builtCard}><div className={s.thumb}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={g.src} alt={g.label[lang]} width={1200} height={675} loading="lazy" style={{ objectFit: "contain", background: "#0f0f1c" }} /></div><span className={s.mono} style={{ color: "#3b3f55" }}>{g.label[lang]}</span></div>)}</div>
            </div>
          )}
        </div>
      </section>
      <section className={`${s.dark} ${s.darkClear}`} data-cb-dark>
        <Dots className={s.dots} />
        <div className={`${s.wrap} ${s.section}`} style={{ position: "relative", zIndex: 1 }}>
          <h2 className={s.h2} style={{ marginBottom: 32 }}><Split text={es ? "Más proyectos" : "More projects"} /></h2>
          <div className={s.built}>{others.map((o) => <Link key={o.id} href={`/work/${o.id}`} className={`${s.builtCard} ${s.builtDark}`}><div className={s.thumb}>{o.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={o.image} alt="" width={1200} height={675} loading="lazy" />}</div><b>{o.title[lang]}</b><span>{o.brand[lang]}</span></Link>)}</div>
        </div>
      </section>
    </CbPage>
  );
}

/* ---------------------------------------------------------------- service ---- */
export function CbService({ slug }: { slug: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const d = (es ? SERVICES_ES : SERVICES)[slug];
  if (!d) return null;
  const grad = d.title.split(" ").slice(-2).join(" ");
  return (
    <CbPage mode="globe" active="services">
      <DetailBanner label={d.tag} title={d.title} grad={grad} lead={d.subtitle}
        primary={<button type="button" onClick={openContact} className={`${s.btn} ${s.btnAcc}`}><Scramble text={es ? "Habla con nosotros" : "Talk to us"} /></button>}
        secondary={<Link href="/services" className={`${s.btn} ${s.btnSolid}`}><Scramble text={es ? "Todos los servicios" : "All services"} /></Link>} />
      <section className={s.light}>
        <div className={`${s.wrap} ${s.section}`}>
          <div className={s.statRow}>{d.specs.map(([k, v]) => <div key={k}><span className={s.mono}>{k}</span><b style={{ fontSize: 26, fontWeight: 400, marginTop: 6 }}>{v}</b></div>)}</div>
          <div className={s.whyHead} style={{ paddingTop: 72, paddingBottom: 36 }}>
            <span className={`${s.mono} ${s.label}`}>{es ? `Por qué MindfulTech para ${d.name}` : `Why MindfulTech for ${d.name}`}</span>
          </div>
          <div className={s.built}>{d.why.map((w) => <div key={w.title} className={s.builtCard} style={{ minHeight: 0 }}><b>{w.title}</b><span>{w.desc}</span></div>)}</div>
          <div className={s.card} style={{ marginTop: 56, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 32, alignItems: "center" }}>
            <div><span className={`${s.mono} ${s.label}`}>{es ? "Probado en producción" : "Proven in production"}</span><h3 style={{ marginTop: 14 }}>{d.highlight.title}</h3><p>{d.highlight.desc}</p>{d.highlight.caseHref && <Link href={d.highlight.caseHref.replace("/work#", "/work/")} className={`${s.btn} ${s.btnDark}`} style={{ marginTop: 18 }}><Scramble text={es ? "Ver el caso" : "See the case"} /></Link>}</div>
            <div className={s.stage} style={{ marginBottom: 0, minWidth: 220 }}><div className={s.stat} style={{ border: 0, paddingTop: 0 }}><b>{d.highlight.stat}</b><span className={s.mono}>{d.highlight.label}</span></div></div>
          </div>
        </div>
      </section>
      <section className={`${s.dark} ${s.darkClear}`} data-cb-dark>
        <Dots className={s.dots} />
        <div className={`${s.wrap} ${s.section}`} style={{ position: "relative", zIndex: 1 }}>
          <span className={`${s.mono} ${s.label}`} style={{ color: "#c9cbd6" }}>{es ? "Cómo trabajamos" : "How we work"}</span>
          <h2 className={s.h2} style={{ margin: "18px 0 40px" }}><Split text={es ? "Un camino claro" : "A clear path"} /> <span className={s.grad}><Split text={es ? "a producción" : "to production"} delay={240} /></span></h2>
          <div className={s.steps}>{d.steps.map((st, i) => <div key={st.title} className={s.step}><span className={s.mono}>0{i + 1}</span><b>{st.title}</b><p>{st.desc}</p></div>)}</div>
          <div className={s.values} style={{ marginTop: 72 }}>{d.engage.map((e) => <div key={e.title}><b>{e.title}</b><span className={s.mono} style={{ color: "#aeb2c2", display: "block", margin: "6px 0 10px" }}>{e.forLabel}</span><ul style={{ margin: 0, paddingLeft: 18, color: "#c9cbd6", fontSize: 15, lineHeight: 1.6 }}>{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul></div>)}</div>
          <div className={s.timeline} style={{ marginTop: 56 }}>{d.includes.map((it) => <div key={it.title}><b style={{ fontSize: 22, color: "#fff" }}>{it.title}</b><p>{it.desc}</p></div>)}</div>
          <div className={s.cloud} style={{ marginTop: 40 }}>{d.tools.map((t) => <span key={t}>{t}</span>)}</div>
        </div>
      </section>
    </CbPage>
  );
}

/* ---------------------------------------------------------------- article ---- */
const PATH_RE = /(^|[\s(])(\/[a-z0-9\-\/#]+)/g;
function linkify(text: string): React.ReactNode {
  const out: React.ReactNode[] = []; let last = 0; let m: RegExpExecArray | null; PATH_RE.lastIndex = 0;
  while ((m = PATH_RE.exec(text))) { const start = m.index + m[1].length; out.push(text.slice(last, start)); out.push(<Link key={start} href={m[2]} style={{ color: "#1f7a4d", textDecoration: "underline" }}>{m[2]}</Link>); last = start + m[2].length; }
  if (last === 0) return text; if (last < text.length) out.push(text.slice(last)); return out;
}
function BlockView({ block, lang }: { block: Block; lang: "en" | "es" }) {
  if (block.t === "h2") return <h2>{block[lang]}</h2>;
  if (block.t === "quote") return <blockquote>{block[lang]}</blockquote>;
  if (block.t === "ul") return <ul>{block[lang].map((li) => <li key={li}>{linkify(li)}</li>)}</ul>;
  return <p>{linkify(block[lang])}</p>;
}
export function CbArticle({ slug }: { slug: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const post = getPost(slug);
  if (!post) return null;
  const more = POSTS.filter((p) => p.slug !== slug).slice(0, 3);
  return (
    <CbPage mode="bands" active="blog">
      <DetailBanner label={`${post.dateLabel[lang]} / ${post.tag[lang]} / ${post.readMins} ${es ? "min" : "min read"}`} title={post.title[lang]} lead={post.excerpt[lang]} />
      <section className={s.light}>
        <div className={s.wrap} style={{ paddingTop: 0 }}>
          <div className={s.featPostBg} style={{ background: post.bg, borderRadius: 18, overflow: "hidden", marginTop: -40, position: "relative", zIndex: 3, maxHeight: 520 }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={post.cover} alt="" width={1600} height={900} /></div>
          <article className={s.article}>
            <div className={s.articleMeta}><span className={s.mono}>{post.author[lang]}</span><span className={s.mono}>{post.dateLabel[lang]}</span></div>
            {post.body.map((b, i) => <BlockView key={i} block={b} lang={lang} />)}
            <div className={s.ctas} style={{ marginTop: 40 }}><button type="button" onClick={openContact} className={`${s.btn} ${s.btnAcc}`}><Scramble text={es ? "Habla con nosotros" : "Talk to us"} /></button><Link href="/office-demo" className={`${s.btn} ${s.btnDark}`}><Scramble text="AI Management Office" /></Link></div>
          </article>
        </div>
      </section>
      <section className={`${s.dark} ${s.darkClear}`} data-cb-dark>
        <Dots className={s.dots} />
        <div className={`${s.wrap} ${s.section}`} style={{ position: "relative", zIndex: 1 }}>
          <div className={s.secHead}><h2 className={s.h2}><Split text={es ? "Más del laboratorio" : "More from the lab"} /></h2><Link href="/blog" className={`${s.btn} ${s.btnGhost}`}>{es ? "Ver todo" : "See all"}</Link></div>
          <div className={s.posts}>{more.map((p) => <Link key={p.slug} href={`/blog/${p.slug}`} className={s.post}><span className={s.mono}>{p.dateLabel[lang]} / {p.tag[lang]}</span><b>{p.title[lang]}</b><span className={s.mono} style={{ color: "#bff5cf" }}>{es ? "Leer →" : "Read →"}</span></Link>)}</div>
        </div>
      </section>
    </CbPage>
  );
}
