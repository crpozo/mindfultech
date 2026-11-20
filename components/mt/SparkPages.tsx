"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { Linkedin } from "./SparkChrome";
import { POSTS, getPost, relatedPosts } from "@/lib/blog/posts";
import { CASES } from "@/lib/site/cases";
import { SERVICES, SERVICES_ES } from "@/lib/site/serviceDetail";
import { SparkPage, Banner, TalkBand, ContactBlock, Arrow, TALK } from "./SparkChrome";
import s from "./spark.module.css";

const SERVICE_ORDER = ["ai", "custom", "security", "discovery"];
/** The data files keep labels in capitals for the old design; show them in sentence case. */
const sentence = (v: string) => (v === v.toUpperCase() && /[A-ZÁÉÍÓÚÑ]{2}/.test(v) ? v.charAt(0) + v.slice(1).toLowerCase() : v);
const internal = (href: string) => href.replace(/^\/work#(.+)$/, "/work/$1/").replace("/work/helixona/", "/work/healthcare/");

/* ------------------------------------------------------------- services */
export function SpServices() {
  const { lang } = useLang();
  const es = lang === "es";
  const data = es ? SERVICES_ES : SERVICES;
  return (
    <SparkPage active="services">
      <Banner
        title={es ? "Cuatro servicios, un solo equipo." : "Four services, one team."}
        lead={es ? "Entendemos tu operación, construimos el software, lo protegemos y lo automatizamos con agentes. Puedes contratar un servicio o el recorrido completo." : "We learn how you operate, build the software, secure it and automate it with agents. Hire one service or the whole path."}
        crumbs={[[es ? "Servicios" : "Services"]]}
      />
      <section className={`${s.wrap} ${s.section}`}>
        <ul className={s.svcList}>
          {SERVICE_ORDER.map((slug, i) => {
            const v = data[slug];
            return (
              <li key={slug} className={s.svcRow} data-dark={i === 0}>
                <div>
                  <h2 className={s.h2}>{v.name}</h2>
                  <p className={s.sub}>{v.subtitle}</p>
                  <Link href={`/services/${slug}/`} className={`${s.pill} ${i === 0 ? s.pillSage : s.pillInk}`}>{es ? "Ver el servicio" : "See the service"}</Link>
                </div>
                <div className={s.svcCols}>
                  <div>
                    <h3>{es ? "Qué resuelve" : "What it solves"}</h3>
                    <ul>{v.why.map((w) => <li key={w.title}>{w.title}</li>)}</ul>
                  </div>
                  <div>
                    <h3>{es ? "Cómo se entrega" : "How we deliver it"}</h3>
                    <ol>{v.steps.map((w) => <li key={w.title}>{w.title}</li>)}</ol>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      <TalkBand />
    </SparkPage>
  );
}

export function SpService({ slug }: { slug: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const v = (es ? SERVICES_ES : SERVICES)[slug];
  if (!v) return <SpNotFound />;
  return (
    <SparkPage active="services">
      <Banner title={v.title} lead={v.subtitle} art="b" crumbs={[[es ? "Servicios" : "Services", "/services/"], [v.name]]} />
      <section className={s.wrap}>
        <dl className={s.specs}>
          {v.specs.map(([k, val]) => (
            <div key={k}><dt>{sentence(k)}</dt><dd>{val}</dd></div>
          ))}
        </dl>
      </section>

      <section className={`${s.wrap} ${s.section}`}>
        <h2 className={s.h2}>{es ? "Qué resuelve" : "What it solves"}</h2>
        <ul className={s.cards3}>
          {v.why.map((w) => (
            <li key={w.title} className={s.card}><h3>{w.title}</h3><p>{w.desc}</p></li>
          ))}
        </ul>
      </section>

      <section className={`${s.night} ${s.section}`}>
        <div className={`${s.wrap} ${s.highlight}`}>
          <p className={s.bigStat}>{v.highlight.stat}</p>
          <div>
            <h2 className={s.h2}>{v.highlight.title}</h2>
            <p className={s.sub}>{v.highlight.desc}</p>
            {v.highlight.caseHref && <Link href={internal(v.highlight.caseHref)} className={`${s.pill} ${s.pillSage}`}>{es ? "Leer el caso" : "Read the case"}</Link>}
          </div>
        </div>
      </section>

      <section className={`${s.wrap} ${s.section}`}>
        <h2 className={s.h2}>{es ? "Cómo se entrega" : "How we deliver it"}</h2>
        <ol className={s.steps}>
          {v.steps.map((w, i) => (
            <li key={w.title}><span>{i + 1}</span><div><h3>{w.title}</h3><p>{w.desc}</p></div></li>
          ))}
        </ol>
      </section>

      <section className={`${s.wrap} ${s.sectionFlush}`}>
        <h2 className={s.h2}>{es ? "Qué incluye" : "What is included"}</h2>
        <ul className={s.cards3}>
          {v.includes.map((w) => (
            <li key={w.title} className={s.card}><h3>{w.title}</h3><p>{w.desc}</p></li>
          ))}
        </ul>
      </section>

      <section className={`${s.wrap} ${s.section}`}>
        <h2 className={s.h2}>{es ? "Formas de trabajar con nosotros" : "Ways to work with us"}</h2>
        <ul className={s.cards3}>
          {v.engage.map((w) => (
            <li key={w.title} className={s.card}>
              <h3>{w.title}</h3>
              <p>{sentence(w.forLabel)}</p>
              <ul className={s.dots}>{w.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
            </li>
          ))}
        </ul>
        <p className={s.tools}>{es ? "Herramientas: " : "Tools: "}{v.tools.map(sentence).join(", ")}.</p>
      </section>
      <TalkBand />
    </SparkPage>
  );
}

/* ----------------------------------------------------------------- work */
export function SpWork() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <SparkPage active="work">
      <Banner
        title={es ? "Trabajo que podemos mostrarte." : "Work we can show you."}
        lead={es ? "Clientes con nombre, el problema que tenían y lo que construimos para resolverlo." : "Named clients, the problem they had and what we built to solve it."}
        crumbs={[[es ? "Casos" : "Work"]]}
      >
        <Link href="/contact/" className={`${s.pill} ${s.pillSage}`}>{TALK[lang]}<Arrow /></Link>
        <Link href="/services/" className={`${s.pill} ${s.pillWhite}`}>{es ? "Ver los servicios" : "See the services"}</Link>
      </Banner>
      <section className={`${s.wrap} ${s.section}`}>
        <ul className={s.workList}>
          {CASES.map((c, i) => (
            <li key={c.id} className={s.workRow} data-flip={i % 2 === 1}>
              <Link href={`/work/${c.id}/`} className={s.workImg} tabIndex={-1} aria-hidden="true">
                {c.image && <img src={c.image} alt="" loading="lazy" />}
              </Link>
              <div>
                <p className={s.client}>{c.brand[lang]}</p>
                <h2 className={s.h3}>{c.title[lang]}</h2>
                <p className={s.sub}>{c.body[lang]}</p>
                <Link href={`/work/${c.id}/`} className={`${s.pill} ${s.pillInk} ${s.pillSmall}`}>{es ? "Leer el caso" : "Read the case"}</Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <TalkBand />
    </SparkPage>
  );
}

export function SpCase({ slug }: { slug: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const i = CASES.findIndex((c) => c.id === slug);
  const c = CASES[i];
  if (!c) return <SpNotFound />;
  const next = CASES[(i + 1) % CASES.length];
  return (
    <SparkPage active="work">
      <Banner title={c.title[lang]} lead={c.brand[lang]} art="b" crumbs={[[es ? "Casos" : "Work", "/work/"], [c.brand[lang]]]}>
        {c.live && <a href={c.live.href} target="_blank" rel="noreferrer" className={`${s.pill} ${s.pillSage}`}>{es ? "Abrir el sitio" : "Open the site"}<Arrow /></a>}
        <Link href="/contact/" className={`${s.pill} ${s.pillWhite}`}>{TALK[lang]}</Link>
      </Banner>
      {c.image && <div className={`${s.wrap} ${s.caseHero}`}><img src={c.image} alt="" /></div>}
      <section className={`${s.wrap} ${s.section} ${s.caseBody}`}>
        <div>
          <h2 className={s.h3}>{es ? "Qué hicimos" : "What we did"}</h2>
          <p className={s.prose}>{c.body[lang]}</p>
        </div>
        <dl className={s.caseFacts}>
          {c.stats.map(([v, l]) => (
            <div key={l.en}><dt>{sentence(l[lang])}</dt><dd>{typeof v === "string" ? v : v[lang]}</dd></div>
          ))}
        </dl>
      </section>
      {c.gallery && (
        <section className={`${s.wrap} ${s.sectionFlush}`}>
          <ul className={s.gallery}>
            {c.gallery.map((g) => (
              <li key={g.src}><img src={g.src} alt={sentence(g.label[lang])} loading="lazy" /><p>{sentence(g.label[lang])}</p></li>
            ))}
          </ul>
        </section>
      )}
      <section className={`${s.wrap} ${s.sectionFlush} ${s.nextCase}`}>
        <p>{es ? "Siguiente caso" : "Next case"}</p>
        <Link href={`/work/${next.id}/`}><span>{next.brand[lang]}: {next.title[lang]}</span><Arrow /></Link>
      </section>
      <div style={{ marginTop: "var(--space)" }}><TalkBand /></div>
    </SparkPage>
  );
}

/* -------------------------------------------------------------- company */
const TIMELINE: [string, string, string][] = [
  ["2016", "MindfulTech starts in Quito: UX design and engineering for teams in Ecuador.", "Nace MindfulTech en Quito: diseño UX e ingeniería para equipos de Ecuador."],
  ["2019", "First clients in the United States and Europe; apps in both stores.", "Primeros clientes en Estados Unidos y Europa; apps en las dos tiendas."],
  ["2023", "Applied AI joins the lab: grounded assistants and workflow automation.", "IA aplicada entra al laboratorio: asistentes con grounding y automatización."],
  ["2026", "We launch the AI Management Office: an office where every employee is an agent.", "Lanzamos el AI Management Office: una oficina donde cada empleado es un agente."],
];
const HOW: [string, string, string, string][] = [
  ["We learn the business", "Workshops with the people who do the work, until we can draw the process.", "Entendemos el negocio", "Workshops con quienes hacen el trabajo, hasta poder dibujar el proceso."],
  ["We connect the systems", "Your tools and data joined in one platform, so nothing is typed twice.", "Conectamos los sistemas", "Tus herramientas y datos unidos en una plataforma, para no digitar nada dos veces."],
  ["We automate with agents", "One agent per job, with a person approving what matters.", "Automatizamos con agentes", "Un agente por tarea, con una persona que aprueba lo importante."],
  ["We stay", "The same team maintains and improves it after launch.", "Nos quedamos", "El mismo equipo lo mantiene y lo mejora después del lanzamiento."],
];
const VALUES: [string, string, string, string][] = [
  ["People first", "Every engagement starts with the humans who will use the product, not the tech stack.", "Las personas primero", "Cada proyecto empieza con los humanos que usarán el producto, no con el stack."],
  ["Craft over volume", "A small senior team that ships fewer, better things, and stays accountable after launch.", "Oficio sobre volumen", "Un equipo senior pequeño que entrega menos cosas, mejor hechas, y responde después del launch."],
  ["AI with judgment", "We automate the repetitive and keep humans on everything that requires care.", "IA con criterio", "Automatizamos lo repetitivo y dejamos a humanos todo lo que requiere cuidado."],
];

export function SpCompany() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <SparkPage active="company">
      <Banner
        title={es ? "Sobre nosotros" : "About us"}
        lead={es ? "Un equipo pequeño y senior en Quito que diseña, construye y opera software con IA para empresas de América y Europa desde 2016." : "A small senior team in Quito that designs, builds and runs AI software for companies across the Americas and Europe since 2016."}
        crumbs={[[es ? "Empresa" : "Company"]]}
      >
        <Link href="/services/" className={`${s.pill} ${s.pillSage}`}>{es ? "Cómo trabajamos" : "How we work"}<Arrow /></Link>
        <Link href="/contact/" className={`${s.pill} ${s.pillWhite}`}>{TALK[lang]}</Link>
      </Banner>

      <div className={s.oneView}>
        <section className={`${s.wrap} ${s.split}`}>
          <div className={`${s.splitMedia} ${s.splitPhoto}`}>
            <img src="/office-demo-preview.webp" alt={es ? "La AI Management Office, la oficina 3D de MindfulTech" : "The AI Management Office, MindfulTech's 3D office"} width={2000} height={1125} loading="lazy" />
            <span className={`${s.chip} ${s.chipA}`}>Quito, Ecuador</span>
            <span className={`${s.chip} ${s.chipB}`}>{es ? "Desde 2016" : "Since 2016"}</span>
            <span className={`${s.chip} ${s.chipC}`}>AI Software Lab</span>
          </div>
          <div>
            <p className={s.eyebrow}>{es ? "Conoce a MindfulTech" : "Meet MindfulTech"}</p>
            <h2 className={s.h2}>{es ? "Un laboratorio de software con IA, de punta a punta." : "An AI software lab, end to end."}</h2>
            <p className={s.strong}>{es ? "Construimos el software y los agentes que cambian cómo opera un negocio, con una persona que firma donde importa." : "We build the software and the agents that change how a business operates, with a person signing off where it matters."}</p>
            <p className={s.sub}>{es ? "Empezamos MindfulTech después de vivir lo difícil que era lanzar buen software en equipos pequeños de Ecuador: herramientas fragmentadas, proveedores que desaparecían, diseño como un extra. Así que armamos un solo laboratorio." : "We started MindfulTech after living how hard it was to ship good software in small teams in Ecuador: fragmented tooling, vendors who disappeared, design as an afterthought. So we built one lab."}</p>
            <div className={s.btnRow}>
              <Link href="/work/" className={`${s.pill} ${s.pillSage}`}>{es ? "Ver nuestro trabajo" : "See our work"}<Arrow /></Link>
              <Link href="/contact/" className={`${s.pill} ${s.pillLine}`}>{TALK[lang]}</Link>
            </div>
            <ul className={s.checks}>
              {VALUES.map(([a, , c]) => <li key={a}>{es ? c : a}</li>)}
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
      </div>

      <section className={`${s.wrap} ${s.section} ${s.member}`}>
        <div className={s.portrait}>
          <div className={s.todo}>{es ? "TODO: foto real de Carlos Pozo" : "TODO: real photo of Carlos Pozo"}</div>
        </div>
        <div>
          <h2 className={s.h2}>Carlos Pozo</h2>
          <p className={s.role}>{es ? "Fundador" : "Founder"}</p>
          <p className={s.strong}>{es ? "Le puse MindfulTech porque la tecnología debería hacerse con intención: pensada y aplicada con criterio, no por moda." : "I named it MindfulTech because technology should be built with intention: considered and applied with judgment, not because it is fashionable."}</p>
          <p className={s.sub}>{es ? "Primero entendemos tu negocio y los sistemas que ya usas, después integramos, y solo entonces aplicamos IA de forma deliberada, donde de verdad mejora la eficiencia." : "First we understand your business and the systems you already run, then we integrate, and only then do we apply AI deliberately, where it genuinely improves efficiency."}</p>
          <div className={s.memberSocial}>
            <a href="https://www.linkedin.com/company/mindfultech" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin /></a>
          </div>
          <dl className={s.memberFacts}>
            <div><dt>{es ? "Rol" : "Responsibility"}</dt><dd>{es ? "Fundador" : "Founder"}</dd></div>
            <div><dt>{es ? "En MindfulTech" : "At MindfulTech"}</dt><dd>{es ? "Desde 2016" : "Since 2016"}</dd></div>
            <div><dt>Email</dt><dd><a href="mailto:info@mindfultech.ec">info@mindfultech.ec</a></dd></div>
          </dl>
        </div>
      </section>

      <section className={`${s.night} ${s.section}`}>
        <div className={s.wrap}>
          <h2 className={s.h2}>{es ? "Cómo trabajamos." : "How we work."}</h2>
          <ol className={`${s.steps} ${s.stepsNight}`}>
            {HOW.map(([a, b, c, d], i) => (
              <li key={a}><span>{i + 1}</span><div><h3>{es ? c : a}</h3><p>{es ? d : b}</p></div></li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${s.wrap} ${s.section}`}>
        <h2 className={s.h2}>{es ? "Lo que nos guía." : "What guides us."}</h2>
        <ul className={s.cards3}>
          {VALUES.map(([a, b, c, d]) => (
            <li key={a} className={s.card}><h3>{es ? c : a}</h3><p>{es ? d : b}</p></li>
          ))}
        </ul>
      </section>

      <section className={`${s.wrap} ${s.sectionFlush}`}>
        <h2 className={s.h2}>{es ? "Diez años, en cuatro fechas." : "Ten years, in four dates."}</h2>
        <ol className={s.timeline}>
          {TIMELINE.map(([y, en, sp]) => (
            <li key={y}><b>{y}</b><p>{es ? sp : en}</p></li>
          ))}
        </ol>
      </section>

      <section className={`${s.wrap} ${s.section}`}>
        <h2 className={s.h2}>{es ? "El equipo." : "The team."}</h2>
        <p className={s.sub} style={{ marginTop: "1rem" }}>{es ? "Equipo en Quito. Clientes en Estados Unidos, Europa y Latinoamérica." : "Team in Quito. Clients in the United States, Europe and Latin America."}</p>
        <div className={s.todo}>{es ? "TODO: fotos reales del equipo, con nombre y rol" : "TODO: real photos of the team, with name and role"}</div>
        <div className={s.join}>
          <p>{es ? "Buscamos gente a la que le importa lo que construye, cómo lo construye y con quién." : "We look for people who care about what they build, how they build it, and who they build it with."}</p>
          <Link href="/contact/" className={`${s.pill} ${s.pillLine}`}>{es ? "Escríbenos para unirte" : "Write to us about joining"}</Link>
        </div>
      </section>
      <TalkBand />
    </SparkPage>
  );
}

/* ----------------------------------------------------------------- blog */
export function SpBlog() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <SparkPage active="blog">
      <Banner
        title={es ? "Ideas y aprendizajes sobre IA aplicada." : "Ideas and lessons on applied AI."}
        lead={es ? "Notas sobre agentes, ingeniería y cómo construimos software en el que la gente confía." : "Notes on agents, engineering and how we build software people trust."}
        crumbs={[["Blog"]]}
      />
      <section className={`${s.wrap} ${s.section}`}>
        {POSTS.length ? (
          <ul className={s.posts}>
            {POSTS.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}/`}>
                  <img src={p.coverCard || p.cover} alt="" loading="lazy" />
                  <h3>{p.title[lang]}</h3>
                  <p>{p.excerpt[lang]}</p>
                  <time>{p.dateLabel[lang]}</time>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={s.sub}>{es ? "Todavía no hay artículos. Vuelve pronto o escríbenos con tu pregunta." : "No articles yet. Come back soon or write to us with your question."}</p>
        )}
      </section>
      <TalkBand />
    </SparkPage>
  );
}

export function SpArticle({ slug }: { slug: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const p = getPost(slug);
  if (!p) return <SpNotFound />;
  const more = relatedPosts(slug, 2);
  return (
    <SparkPage active="blog">
      <Banner title={p.title[lang]} lead={`${p.dateLabel[lang]}. ${p.readMins} ${es ? "min de lectura" : "min read"}. ${p.author[lang].replace(" · ", ", ")}`} art="b" crumbs={[["Blog", "/blog/"], [es ? "Artículo" : "Article"]]}>
        <Link href="/blog/" className={`${s.pill} ${s.pillWhite}`}>{es ? "Todos los artículos" : "All articles"}</Link>
      </Banner>
      <article className={s.article}>
        <p className={`${s.wrap} ${s.standfirst}`}>{p.excerpt[lang]}</p>
        <div className={`${s.heroWrap} ${s.articleCover}`}><img src={p.cover} alt="" /></div>
        <div className={`${s.wrap} ${s.articleBody}`}>
          {p.body.map((b, i) =>
            b.t === "h2" ? <h2 key={i}>{b[lang]}</h2>
            : b.t === "quote" ? <blockquote key={i}>{b[lang]}</blockquote>
            : b.t === "ul" ? <ul key={i}>{b[lang].map((x) => <li key={x}>{x}</li>)}</ul>
            : <p key={i}>{b[lang]}</p>
          )}
        </div>
      </article>
      {more.length > 0 && (
        <section className={`${s.wrap} ${s.section}`}>
          <h2 className={s.h2}>{es ? "Sigue leyendo." : "Keep reading."}</h2>
          <ul className={`${s.posts} ${s.posts2}`}>
            {more.map((m) => (
              <li key={m.slug}>
                <Link href={`/blog/${m.slug}/`}>
                  <img src={m.coverCard || m.cover} alt="" loading="lazy" />
                  <h3>{m.title[lang]}</h3>
                  <time>{m.dateLabel[lang]}</time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <TalkBand />
    </SparkPage>
  );
}

/* -------------------------------------------------------- contact + 404 */
export function SpContact() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <SparkPage>
      <Banner title={es ? "Contacto" : "Contact us"} lead={es ? "Cuéntanos qué quieres automatizar. Te responde una persona del equipo." : "Tell us what you want to automate. A person on the team replies."} crumbs={[[es ? "Contacto" : "Contact"]]}>
        <a href="https://wa.me/593958731994" target="_blank" rel="noreferrer" className={`${s.pill} ${s.pillSage}`}>{es ? "Escribir por WhatsApp" : "Chat on WhatsApp"}<Arrow /></a>
        <a href="mailto:info@mindfultech.ec" className={`${s.pill} ${s.pillWhite}`}>{es ? "Enviar un correo" : "Send an email"}</a>
      </Banner>
      <div style={{ paddingTop: "var(--space)" }}><ContactBlock /></div>
      <div style={{ height: "var(--gutter)" }} />
    </SparkPage>
  );
}

export function SpNotFound() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <SparkPage>
      <Banner
        title={es ? "Esta página no existe." : "This page doesn't exist."}
        lead={es ? "El enlace puede estar mal escrito o la página se movió. Desde aquí puedes seguir." : "The link may be mistyped or the page has moved. You can carry on from here."}
        crumbs={[["404"]]}
      >
        <Link href="/" className={`${s.pill} ${s.pillSage}`}>{es ? "Ir al inicio" : "Go to the home page"}<Arrow /></Link>
        <Link href="/work/" className={`${s.pill} ${s.pillWhite}`}>{es ? "Ver los casos" : "See our work"}</Link>
      </Banner>
      <div style={{ height: "var(--space)" }} />
    </SparkPage>
  );
}
