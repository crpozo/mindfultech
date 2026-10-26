"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { POSTS } from "@/lib/blog/posts";
import { CASES } from "@/lib/site/cases";
import { SERVICES, SERVICES_ES } from "@/lib/site/serviceDetail";
import { Split, Scramble, Dots, useInView } from "./CerebriumFx";
import { CbPage, CopyEmail, CB } from "./CerebriumParts";
import { openContact } from "@/components/site/Shell";
import s from "./cerebrium.module.css";

/* Inner pages of concept 06. Each opens with a tall banner on the WebGL scene (their use-case and about banners):
   a mono label with a dot, a sans title with one gradient word, and on the right the lead + CTAs. */

function Banner({ label, title, grad, lead, cta, mode }: { label: string; title: string; grad: string; lead?: string; cta?: boolean; mode: "split" | "wide" }) {
  const { lang } = useLang();
  const es = lang === "es";
  const parts = title.split(grad);
  return (
    <section className={`${s.hero} ${mode === "wide" ? s.heroWide : ""}`} data-cb-hero>
      <div className={`${s.heroIn} ${s.bannerIn}`}>
        <div>
          {mode === "wide" && <span className={`${s.mono} ${s.label} ${s.labelLight}`} style={{ marginBottom: 24 }}>{label}</span>}
          <h1 className={s.h1}><Split text={parts[0].trim()} /> <span className={s.grad}><Split text={grad} delay={260} /></span>{parts[1] && <> <Split text={parts[1].trim()} delay={380} /></>}</h1>
        </div>
        {mode === "split" && (
          <div className={s.heroSide}>
            <span className={`${s.mono} ${s.label} ${s.labelLight}`} style={{ marginBottom: 22 }}>{label}</span>
            {lead && <p>{lead}</p>}
            {cta && <div className={s.ctas}><button type="button" onClick={openContact} className={`${s.btn} ${s.btnAcc}`}><Scramble text={es ? "Habla con nosotros" : "Talk to us"} /></button><Link href="/office-demo" className={`${s.btn} ${s.btnSolid}`}><Scramble text="AI Management Office" /></Link></div>}
          </div>
        )}
      </div>
      {mode === "wide" && lead && <div className={s.bannerLead}><span /><p>{lead}</p></div>}
    </section>
  );
}

/* ---------------------------------------------------------------- services ---- */
export function CbServices() {
  const { lang } = useLang();
  const es = lang === "es";
  const data = es ? SERVICES_ES : SERVICES;
  const ids = ["ux", "apps", "custom", "ai"] as const;
  const [cur, setCur] = React.useState<string>("ux");
  const refs = React.useRef<Record<string, HTMLDivElement | null>>({});
  React.useEffect(() => {
    const obs = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) setCur((e.target as HTMLElement).id); }, { rootMargin: "-35% 0px -50% 0px" });
    Object.values(refs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return (
    <CbPage mode="globe" active="services">
      <Banner mode="split" label={es ? "Servicios" : "Services"} title={es ? "Investigación, software y agentes de IA" : "Research, software and AI agents"} grad={es ? "agentes de IA" : "AI agents"} lead={es ? "Cuatro servicios, un solo equipo. Cada uno llega con investigación, documentación y gente que responde después del lanzamiento." : "Four services, one team. Each ships with research, documentation and people who answer after launch."} cta />
      <section className={s.light}>
        <div className={s.wrap}>
          <div className={s.why} style={{ paddingTop: 96 }}>
            <div className={s.whyList}>
              <span className={`${s.mono} ${s.label}`} style={{ marginBottom: 12 }}>{es ? "Qué construimos" : "What we build"}</span>
              {ids.map((id) => <button key={id} type="button" className={cur === id ? s.on : ""} onClick={() => refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" })}>{data[id].name}</button>)}
            </div>
            <div className={s.cards}>
              {ids.map((id) => { const sv = data[id]; return (
                <div key={id} id={id} className={s.card} ref={(el) => { refs.current[id] = el; }} style={{ scrollMarginTop: 100 }}>
                  <div className={s.stage}>
                    <span className={`${s.chip} ${s.mono}`}>{sv.tag}</span>
                    <div className={s.specGrid}>{sv.specs.map(([k, v]) => <div key={k}><span className={s.mono}>{k}</span><b>{v}</b></div>)}</div>
                    <div className={s.stat}><b>{sv.highlight.stat}</b><span className={s.mono}>{sv.highlight.label}</span><p>{sv.highlight.title}</p></div>
                  </div>
                  <h3>{sv.title}</h3>
                  <p>{sv.subtitle}</p>
                  <div className={s.whyRow}>{sv.why.map((w) => <div key={w.title}><b>{w.title}</b><span>{w.desc}</span></div>)}</div>
                  <div className={s.ctas} style={{ marginTop: 18 }}><Link href={`/services/${id}`} className={`${s.btn} ${s.btnDark}`}><Scramble text={es ? "Ver el servicio" : "See the service"} /></Link></div>
                </div>
              ); })}
            </div>
          </div>
        </div>
      </section>
      <section className={`${s.dark} ${s.darkClear}`} data-cb-dark>
        <Dots className={s.dots} />
        <div className={`${s.wrap} ${s.section}`} style={{ position: "relative", zIndex: 1 }}>
          <span className={`${s.mono} ${s.label}`} style={{ color: "#c9cbd6" }}>{es ? "Cómo trabajamos" : "How we work"}</span>
          <h2 className={s.h2} style={{ margin: "18px 0 40px" }}><Split text={es ? "Del primer taller" : "From the first workshop"} /><br /><span className={s.grad}><Split text={es ? "al agente en producción" : "to the agent in production"} delay={260} /></span></h2>
          <div className={s.steps}>{data.ai.steps.map((st, i) => <div key={st.title} className={s.step}><span className={s.mono}>0{i + 1}</span><b>{st.title}</b><p>{st.desc}</p></div>)}</div>
        </div>
      </section>
    </CbPage>
  );
}

/* ---------------------------------------------------------------- work ---- */
export function CbWork() {
  const { lang } = useLang();
  const es = lang === "es";
  const list = CASES;
  return (
    <CbPage mode="bands" active="work">
      <Banner mode="split" label={es ? "Proyectos" : "Work"} title={es ? "Entregado con clientes en tres continentes" : "Shipped with clients on three continents"} grad={es ? "tres continentes" : "three continents"} lead={es ? "Una década de productos en producción, de portales universitarios a comercio automatizado y agentes que facturan." : "A decade of products in production, from university portals to automated commerce and agents that bill."} cta />
      <section className={s.light}>
        <div className={`${s.wrap} ${s.section}`}>
          <div className={s.secHead}>
            <h2 className={s.h2}><Split text={es ? "Casos de estudio" : "Case studies"} /></h2>
          </div>
          <div className={s.cases}>
            {list.map((c) => (
              <Link key={c.id} href={`/work/${c.id}`} className={s.caseCard}>
                <div className={s.thumb} style={{ aspectRatio: "16 / 9", borderRadius: 8, overflow: "hidden", background: "#0f0f1c" }}>{c.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.image} alt="" width={1200} height={675} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}</div>
                <div className={s.tags}>{c.tag[lang].split(" · ").slice(0, 2).map((t) => <span key={t}>{t}</span>)}</div>
                <b>{c.title[lang]}</b>
                <div className={s.caseStats}>{c.stats.slice(0, 3).map(([v, l]) => <div key={l.en}><b>{typeof v === "string" ? v : v[lang]}</b><small>{l[lang]}</small></div>)}</div>
                <span style={{ color: "#1f7a4d", fontSize: 14 }}>{es ? "Leer el caso →" : "Read case study →"}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </CbPage>
  );
}

/* ---------------------------------------------------------------- company ---- */
export function CbCompany() {
  const { lang } = useLang();
  const es = lang === "es";
  const [ref, on] = useInView<HTMLDivElement>();
  const values = es
    ? [["Las personas primero", "Cada proyecto empieza con los humanos que usarán el producto, no con el stack."], ["Oficio sobre volumen", "Un equipo senior pequeño que entrega menos cosas, mejor hechas, y responde después del launch."], ["IA con criterio", "Automatizamos lo repetitivo y dejamos a humanos todo lo que requiere cuidado."]]
    : [["People first", "Every engagement starts with the humans who will use the product, not the tech stack."], ["Craft over volume", "A small senior team that ships fewer, better things, and stays accountable after launch."], ["AI with judgment", "We automate the repetitive and keep humans on everything that requires care."]];
  const years = es
    ? [["2016", "Nace MindfulTech en Quito: diseño UX e ingeniería para equipos de Ecuador."], ["2019", "Primeros clientes en Estados Unidos y Europa; apps en las dos tiendas."], ["2023", "IA aplicada entra al laboratorio: asistentes con grounding y automatización."], ["2026", "Lanzamos el AI Management Office: una oficina donde cada empleado es un agente."]]
    : [["2016", "MindfulTech starts in Quito: UX design and engineering for teams in Ecuador."], ["2019", "First clients in the United States and Europe; apps in both stores."], ["2023", "Applied AI joins the lab: grounded assistants and workflow automation."], ["2026", "We launch the AI Management Office: an office where every employee is an agent."]];
  return (
    <CbPage mode="columns" active="company">
      <Banner mode="wide" label={es ? "Empresa" : "Company"} title={es ? "Ayudamos a empresas a construir software con IA que la gente quiere" : "Enabling companies to build AI software people love"} grad={es ? "software con IA" : "build AI"} lead={es ? "En MindfulTech creemos que la IA va a cambiar cómo operan los negocios. Construimos el software y los agentes que hacen posible ese cambio, con investigación primero y una persona que firma donde importa. Somos un equipo pequeño y senior en Quito, trabajando para clientes de América y Europa desde 2016." : "At MindfulTech we believe AI will change how businesses operate. We build the software and the agents that make that shift possible, research first and with a person signing off where it matters. We're a small senior team in Quito, working for clients across the Americas and Europe since 2016."} />
      <section className={s.light}>
        <div className={`${s.wrap} ${s.section}`}>
          <span className={`${s.mono} ${s.label}`}>{es ? "Sobre MindfulTech" : "About MindfulTech"}</span>
          <div className={s.about}>
            <h2 className={s.h2}><Split text={es ? "Un laboratorio construido para la próxima generación de productos con IA." : "A lab built for the next generation of AI products."} /></h2>
            <div>
              <p>{es ? "De portales universitarios a agentes que facturan, hacemos radicalmente más fácil que un equipo investigue, construya y opere software con IA sin montar un departamento nuevo." : "From university portals to agents that bill, we make it radically easier for a team to research, build and operate AI software without standing up a new department."}</p>
              <p>{es ? "No empezamos ajustando lo que ya existía. Rehicimos el proceso: investigación de campo, prototipos probados, ingeniería de producción y agentes por rol en un mismo roadmap. Fundada en Quito en 2016, MindfulTech hoy acompaña a equipos como USFQ, Helixona, ThemedMotion y PARC." : "We didn't start by tweaking what existed. We rebuilt the process: field research, tested prototypes, production engineering and agents per role on one roadmap. Founded in Quito in 2016, MindfulTech today supports teams like USFQ, Helixona, ThemedMotion and PARC."}</p>
            </div>
          </div>
          <div className={`${s.statRow} ${on ? s.barsOn : ""}`} ref={ref}>
            {[["10", es ? "años lanzando" : "years shipping"], ["3", es ? "continentes con clientes" : "continents with clients"], ["1", es ? "semana al primer agente" : "week to the first agent"], ["24/7", es ? "agentes en producción" : "agents in production"]].map(([v, l]) => <div key={l}><b>{v}</b><span className={s.mono}>{l}</span></div>)}
          </div>
        </div>
      </section>
      <section className={`${s.dark} ${s.darkClear}`} data-cb-dark>
        <Dots className={s.dots} />
        <div className={`${s.wrap} ${s.section}`} style={{ position: "relative", zIndex: 1 }}>
          <div className={s.spark}>
            <h2 className={s.h2}><Split text={es ? "La chispa detrás de" : "The spark behind"} /><br /><Split text="MindfulTech" delay={240} /></h2>
            <div>
              <p>{es ? "Empezamos MindfulTech después de vivir lo difícil que era lanzar buen software en equipos pequeños de Ecuador: herramientas fragmentadas, proveedores que desaparecían, diseño como un extra. Así que armamos un solo laboratorio de punta a punta." : "We started MindfulTech after living how hard it was to ship good software in small teams in Ecuador: fragmented tooling, vendors who disappeared, design as an afterthought. So we built one lab, end to end."}</p>
              <p>{es ? "Es un lugar para gente a la que le importa lo que construye, cómo lo construye y con quién. Valoramos claridad, velocidad y oficio, y damos responsabilidad completa sobre cada proyecto." : "This is a place for people who care about what they build, how they build it, and who they build it with. We value clarity, speed and craft, and give end-to-end ownership of every project."}</p>
              <a href="mailto:carlos@mindfultech.ec?subject=Portfolio" className={`${s.btn} ${s.btnAcc}`}><Scramble text={es ? "Únete al equipo" : "Join the team"} /></a>
            </div>
          </div>
          <div className={s.values}>{values.map(([t, d]) => <div key={t}><b>{t}</b><p>{d}</p></div>)}</div>
          <div className={s.timeline}>{years.map(([y, t]) => <div key={y}><b>{y}</b><p>{t}</p></div>)}</div>
        </div>
      </section>
      <section className={s.light}>
        <div className={`${s.wrap} ${s.section}`}>
          <div className={s.contactGrid}>
            <CopyEmail label={es ? "Consultas generales" : "General inquiries"} email="info@mindfultech.ec" />
            <CopyEmail label={es ? "Prensa" : "Media / press"} email="carlos@mindfultech.ec" />
            <div className={s.copyRow}><span className={s.mono}>WhatsApp</span><a href="https://wa.me/593958731994" target="_blank" rel="noreferrer">+593 958 73 1994</a><a href="https://wa.me/593958731994" target="_blank" rel="noreferrer" className={`${s.btn} ${s.btnGhost}`}>{es ? "Escribir" : "Message"}</a></div>
          </div>
        </div>
      </section>
    </CbPage>
  );
}

/* ---------------------------------------------------------------- blog ---- */
export function CbBlog() {
  const { lang } = useLang();
  const es = lang === "es";
  const tags = React.useMemo(() => { const seen = new Map<string, string>(); for (const p of POSTS) seen.set(p.tag.en, p.tag[lang]); return [...seen.entries()]; }, [lang]);
  const [tag, setTag] = React.useState("all");
  const list = tag === "all" ? POSTS : POSTS.filter((p) => p.tag.en === tag);
  const feat = POSTS[0];
  return (
    <CbPage mode="bands" active="blog">
      <section className={s.hero} data-cb-hero style={{ minHeight: 0, paddingTop: 110, paddingBottom: 40 }}>
        <div className={s.wrap}><h1 className={s.h1} style={{ fontSize: "clamp(36px,4vw,56px)" }}><Split text={es ? "Notas desde el laboratorio" : "Notes from the lab"} /></h1></div>
      </section>
      <section className={s.light}>
        <div className={`${s.wrap} ${s.section}`} style={{ paddingTop: 56 }}>
          <Link href={`/blog/${feat.slug}`} className={s.featPost}>
            <div className={s.featPostBg} style={{ background: feat.bg }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={feat.cover} alt="" width={800} height={500} /></div>
            <div className={s.featPostText}><span className={s.mono}>{feat.dateLabel[lang]} / {feat.tag[lang]}</span><h2 className={s.h2} style={{ fontSize: "clamp(28px,3vw,44px)" }}>{feat.title[lang]}</h2></div>
          </Link>
          <div className={s.pillTabs} style={{ margin: "40px 0 24px", flexWrap: "wrap" }}><button type="button" className={tag === "all" ? s.on : ""} onClick={() => setTag("all")}>{es ? "Todos" : "All articles"}</button>{tags.map(([k, l]) => <button key={k} type="button" className={tag === k ? s.on : ""} onClick={() => setTag(k)}>{l}</button>)}</div>
          <div className={s.posts}>{list.map((p) => <Link key={p.slug} href={`/blog/${p.slug}`} className={`${s.post} ${s.postLight}`}><div className={s.thumb} style={{ aspectRatio: "16 / 9", borderRadius: 8, overflow: "hidden", background: p.bg }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.coverCard ?? p.cover} alt="" width={800} height={450} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /></div><span className={s.mono}>{p.dateLabel[lang]} / {p.tag[lang]}</span><b>{p.title[lang]}</b><span style={{ fontSize: 14, color: "#3b3f55" }}>{p.excerpt[lang]}</span></Link>)}</div>
        </div>
      </section>
    </CbPage>
  );
}
