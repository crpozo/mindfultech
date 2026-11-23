"use client";

import { Knot3D } from "./Knot3D";
import { Hub3D } from "./Hub3D";
import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { AppWindow, Bot, Building2, FileSearch, Inbox, MousePointerClick, Play, ShieldCheck, UserCheck, Users, Volume2, VolumeX, Workflow, type LucideIcon } from "lucide-react";
import { LAND_PATH, MAP_VIEW } from "@/lib/map/land";
import { SparkPage, ContactBlock, Arrow, TALK, type Bi } from "./SparkChrome";
import s from "./spark.module.css";

const LOGOS = [
  { src: "/logo-usfq.svg", alt: "USFQ", h: "2.5rem" },
  { src: "/helixona-logo.webp", alt: "Helixona", h: "1.6rem" },
  { src: "/wfs-logo.svg", alt: "Western Fence Supply", h: "2.4rem" },
  { src: "/parc-logo.webp", alt: "PARC Home Care", h: "2.4rem" },
  { src: "/portfolio/themedmotion-logo.webp", alt: "ThemedMotion", h: "2.1rem" },
];

const SERVICES: { href: string; icon: LucideIcon; title: Bi; text: Bi }[] = [
  {
    href: "/services/ai/", icon: Bot,
    title: { en: "AI and automation", es: "IA y automatización" },
    text: {
      en: "Agents built for one job each, working inside your real tools, with a person approving what matters.",
      es: "Agentes hechos para una tarea cada uno, dentro de tus herramientas reales, con una persona que aprueba lo importante.",
    },
  },
  {
    href: "/services/custom/", icon: AppWindow,
    title: { en: "Custom software", es: "Software a medida" },
    text: { en: "Web and mobile apps built around how your team already works.", es: "Aplicaciones web y móviles hechas alrededor de cómo ya trabaja tu equipo." },
  },
  {
    href: "/services/", icon: ShieldCheck,
    title: { en: "Cloud and infrastructure", es: "Nube e infraestructura" },
    text: { en: "We set up, migrate and run your cloud: servers, deployments, monitoring and backups.", es: "Montamos, migramos y operamos tu nube: servidores, despliegues, monitoreo y respaldos." },
  },
  {
    href: "/services/", icon: Users,
    title: { en: "Computer vision", es: "Visión por computadora" },
    text: { en: "Cameras that count, measure and flag problems on their own: shelves and footfall in retail, quality on the line.", es: "Cámaras que cuentan, miden y avisan solas: góndolas y afluencia en retail, calidad en la línea de producción." },
  },
  {
    href: "/work/", icon: Workflow,
    title: { en: "Systems integration", es: "Integración de sistemas" },
    text: { en: "Your CRM, billing, channels and data joined so one record follows the customer.", es: "Tu CRM, facturación, canales y datos unidos para que un solo registro siga al cliente." },
  },
  {
    href: "/office-demo/", icon: Building2,
    title: { en: "AI Management Office", es: "AI Management Office" },
    text: { en: "A 3D office where you watch every agent work and sign off on its decisions.", es: "Una oficina 3D donde ves trabajar a cada agente y apruebas sus decisiones." },
  },
];

const CONTROL_ICONS: LucideIcon[] = [Inbox, FileSearch, MousePointerClick, UserCheck];

const CONTROL: { t: Bi; d: Bi }[] = [
  { t: { en: "It receives a task", es: "Recibe una tarea" }, d: { en: "An email, a form, an order or a schedule starts the work. Nobody has to open a chat and ask.", es: "Un correo, un formulario, un pedido o un horario inicia el trabajo. Nadie tiene que abrir un chat y pedirlo." } },
  { t: { en: "It reads what it needs", es: "Lee lo que necesita" }, d: { en: "It looks up your documents, your customer records and the rules of your business before deciding anything.", es: "Consulta tus documentos, los datos de tus clientes y las reglas de tu negocio antes de decidir." } },
  { t: { en: "It works in your tools", es: "Trabaja en tus herramientas" }, d: { en: "It logs into your CRM, your email and your spreadsheets, and does the steps a person would do by hand.", es: "Entra a tu CRM, tu correo y tus hojas de cálculo, y hace los pasos que una persona haría a mano." } },
  { t: { en: "It hands the result to a person", es: "Entrega el resultado a una persona" }, d: { en: "It reports what it did and stops to ask when something is unclear or needs approval.", es: "Informa lo que hizo y se detiene a preguntar cuando algo no está claro o necesita aprobación." } },
];

const CASES: { id: string; client: string; where: Bi; title: Bi; text?: Bi }[] = [
  {
    id: "healthcare", client: "Helixona", where: { en: "Health, California", es: "Salud, California" },
    title: { en: "Medical billing run by an agent.", es: "Facturación médica con un agente." },
    text: { en: "The agent logs into the clinical system and the insurer's portal, processes claims and attaches the documentation on its own. The team supervises, the AI executes.", es: "El agente entra al sistema clínico y al portal de la aseguradora, procesa los reclamos y adjunta la documentación por sí solo. El equipo supervisa, la IA ejecuta." },
  },
  {
    id: "usfq", client: "USFQ", where: { en: "Universidad San Francisco de Quito", es: "Universidad San Francisco de Quito" },
    title: { en: "EventFlow, the event management system of Ecuador's top-ranked university.", es: "EventFlow, el sistema de gestión de eventos de la universidad número uno del Ecuador." },
    text: { en: "Registration, check-in and schedules for every campus event, on the web and in an iOS app in the App Store.", es: "Registro, check-in y agenda de cada evento del campus, en la web y en una app de iOS en el App Store." },
  },
  {
    id: "fence", client: "Western Fence Supply", where: { en: "Distribution, Florida", es: "Distribución, Florida" },
    title: { en: "Sales automated with AI.", es: "Ventas automatizadas con IA." },
    text: { en: "Every lead is classified and assigned by language and rep, on an Odoo CRM with 8,500 prospects. Draw My Fence lays out the fence on a 3D satellite map and builds the quote.", es: "Cada lead se clasifica y se asigna solo, por idioma y vendedor, sobre un CRM en Odoo con 8.500 prospectos. Draw My Fence propone la cerca sobre el mapa satelital en 3D y genera la cotización." },
  },
  {
    id: "themedmotion", client: "ThemedMotion", where: { en: "Animatronics studio, Netherlands", es: "Estudio de animatrónicos, Países Bajos" },
    title: { en: "An immersive 3D portfolio for a studio that builds theme-park figures.", es: "Un portafolio 3D inmersivo para un estudio que construye figuras de parques temáticos." },
    text: { en: "Interactive 3D figure viewer and scroll storytelling across their seven-step process.", es: "Visor 3D interactivo y narrativa con scroll a lo largo de su proceso de siete pasos." },
  },
  {
    id: "parc", client: "PARC Home Care", where: { en: "Home health, Chicago", es: "Salud a domicilio, Chicago" },
    title: { en: "Documents that process themselves.", es: "Documentos que se procesan solos." },
    text: { en: "AI reads every incoming fax, classifies it and extracts the medical referral. Agents load it into the clinical system with no typing, and the PARC Connect app links patients and staff.", es: "La IA lee cada fax entrante, lo clasifica y extrae los datos del referido médico. Los agentes cargan la información al sistema clínico sin digitación, y la app PARC Connect conecta a pacientes y personal." },
  },
  {
    id: "carcompra-crm", client: "CarCompra", where: { en: "Car dealership, Ecuador", es: "Concesionaria, Ecuador" },
    title: { en: "A custom CRM that sells cars with AI and Meta ads.", es: "Un CRM a medida que vende autos con IA y pautas de Meta." },
    text: { en: "Every campaign lead from WhatsApp and Instagram lands in one pipeline for the sales team.", es: "Cada lead de campaña desde WhatsApp e Instagram llega a un solo pipeline para el equipo de ventas." },
  },
];

const FILM = {
  src: "/mt/promo.mp4",
  poster: "/mt/promo-poster.webp",
  alt: { en: "MindfulTech film: a person hands her messages, billing and reports to AI agents", es: "Video de MindfulTech: una persona delega sus mensajes, cobros y reportes a agentes de IA" } as Bi,
};

/* Where the work is. Quito is home; every other pin is a client location.
   `at` is nudged so labels do not collide on the small map. */
type Place = { id: string; lat: number; lon: number; city: Bi; projects: { name: string; href?: string; what: Bi }[] };
const HOME: Place = {
  id: "quito", lat: -0.18, lon: -78.47, city: { en: "Quito, Ecuador", es: "Quito, Ecuador" },
  projects: [
    { name: "MindfulTech", what: { en: "Where the lab works from", es: "Desde donde trabaja el laboratorio" } },
    { name: "USFQ", href: "/work/usfq/", what: { en: "EventFlow, campus events platform and iOS app", es: "EventFlow, plataforma de eventos y app iOS" } },
    { name: "CarCompra", href: "/work/carcompra-crm/", what: { en: "CRM with AI and Meta ads", es: "CRM con IA y pautas de Meta" } },
  ],
};
const PLACES: Place[] = [
  { id: "us-w", lat: 36.8, lon: -119.8, city: { en: "United States, West", es: "Estados Unidos, oeste" }, projects: [{ name: "Helixona", href: "/work/healthcare/", what: { en: "Medical billing agent", es: "Agente de facturación médica" } }] },
  { id: "us-c", lat: 41.9, lon: -87.6, city: { en: "United States, Midwest", es: "Estados Unidos, medio oeste" }, projects: [{ name: "PARC Home Care", href: "/work/parc/", what: { en: "Client portal in both app stores", es: "Portal de clientes en ambas tiendas" } }] },
  { id: "us-e", lat: 26.6, lon: -81.9, city: { en: "Florida, United States", es: "Florida, Estados Unidos" }, projects: [{ name: "Western Fence Supply", href: "/work/fence/", what: { en: "CRM migration to Odoo", es: "Migración de CRM a Odoo" } }] },
  { id: "nl", lat: 52.4, lon: 4.9, city: { en: "Netherlands", es: "Países Bajos" }, projects: [{ name: "ThemedMotion", href: "/work/themedmotion/", what: { en: "Immersive 3D portfolio", es: "Portafolio 3D inmersivo" } }] },
];
/** Countries with clients we do not name on the site. */
const MORE: { id: string; lat: number; lon: number }[] = [{ id: "de", lat: 51.2, lon: 10.4 }, { id: "es", lat: 40.4, lon: -3.7 }, { id: "gr", lat: 37.98, lon: 23.7 }];
const proj = (lat: number, lon: number) => ({ x: ((lon - MAP_VIEW.lon0) / (MAP_VIEW.lon1 - MAP_VIEW.lon0)) * MAP_VIEW.w, y: ((MAP_VIEW.lat1 - lat) / (MAP_VIEW.lat1 - MAP_VIEW.lat0)) * MAP_VIEW.h });

function WorldMap({ active, onPick }: { active: string | null; onPick: (id: string | null) => void }) {
  const h = proj(HOME.lat, HOME.lon);
  const arc = (lat: number, lon: number, i: number) => {
    const q = proj(lat, lon);
    const dx = q.x - h.x;
    const lift = Math.abs(dx) * 0.16 + 26 + i * 9;
    return `M${h.x},${h.y} C${h.x + dx * 0.25},${Math.min(h.y, q.y) - lift} ${h.x + dx * 0.75},${Math.min(h.y, q.y) - lift} ${q.x},${q.y}`;
  };
  return (
    <svg viewBox={`0 0 ${MAP_VIEW.w} ${MAP_VIEW.h}`} className={s.mapSvg} role="img" aria-label="World map with MindfulTech in Quito and its client locations in the United States and Europe">
      <path d={LAND_PATH} fill="none" stroke="#c3cccb" strokeWidth={3.1} strokeLinecap="round" />
      {MORE.map((m, i) => <path key={m.id} d={arc(m.lat, m.lon, i + 4)} fill="none" stroke="#9fb9b4" strokeWidth={1.2} strokeDasharray="3 5" />)}
      {PLACES.map((pl, i) => <path key={pl.id} d={arc(pl.lat, pl.lon, i)} fill="none" stroke={active === pl.id ? "#1b1b1b" : "#2b6a60"} strokeWidth={active === pl.id ? 2.6 : 1.6} />)}
      {MORE.map((m) => { const q = proj(m.lat, m.lon); return <circle key={m.id} cx={q.x} cy={q.y} r={4.5} fill="#fff" stroke="#2b6a60" strokeWidth={1.6} />; })}
      {PLACES.map((pl) => {
        const q = proj(pl.lat, pl.lon);
        const on = active === pl.id;
        return (
          <g key={pl.id} onMouseEnter={() => onPick(pl.id)} onMouseLeave={() => onPick(null)} style={{ cursor: "pointer" }}>
            <circle cx={q.x} cy={q.y} r={16} fill="transparent" />
            {on && <circle cx={q.x} cy={q.y} r={15} fill="rgba(129,197,185,0.45)" />}
            <circle cx={q.x} cy={q.y} r={7} fill={on ? "#1b1b1b" : "#81c5b9"} stroke="#1b1b1b" strokeWidth={1.6} />
          </g>
        );
      })}
      <g onMouseEnter={() => onPick(HOME.id)} onMouseLeave={() => onPick(null)}>
        <circle cx={h.x} cy={h.y} r={active === HOME.id ? 22 : 17} fill="rgba(27,27,27,0.14)" />
        <circle cx={h.x} cy={h.y} r={9.5} fill="#1b1b1b" />
        <circle cx={h.x} cy={h.y} r={3.5} fill="#81c5b9" />
      </g>
    </svg>
  );
}

const STRIP = [1, 2, 3, 4, 5].map((n) => `/mt/strip-${n}.webp`);
/** 3D icon of each service card, in SERVICES order (rendered by scripts/icons3d-*.js). */
const ART = ["ai", "software", "cloud", "vision", "integration", "office"];
/** Country flag of each case card. */
const FLAG: Record<string, { code: string; name: Bi }> = {
  healthcare: { code: "us", name: { en: "United States", es: "Estados Unidos" } },
  usfq: { code: "ec", name: { en: "Ecuador", es: "Ecuador" } },
  fence: { code: "us", name: { en: "United States", es: "Estados Unidos" } },
  "carcompra-crm": { code: "ec", name: { en: "Ecuador", es: "Ecuador" } },
  parc: { code: "us", name: { en: "United States", es: "Estados Unidos" } },
  themedmotion: { code: "nl", name: { en: "Netherlands", es: "Países Bajos" } },
};
const SHOW_MAP = false;

export function SparkHome() {
  const { lang } = useLang();
  const es = lang === "es";
  const t = (v: Bi) => v[lang];
  const loop = React.useRef<HTMLVideoElement>(null);
  const film = React.useRef<HTMLVideoElement>(null);
  const dialog = React.useRef<HTMLDialogElement>(null);
  const [sound, setSound] = React.useState(false);
  const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The banner film starts silent. Visitors who asked for less motion get the
  // still, and can start it themselves with either button.
  React.useEffect(() => {
    if (!calm()) loop.current?.play().catch(() => {});
  }, []);
  const toggleSound = () => {
    const v = loop.current;
    if (!v) return;
    const on = !sound;
    v.muted = !on;
    if (on) v.play().catch(() => {});
    setSound(on);
  };
  // Play opens the film in a lightbox: a large window over the page, with sound,
  // from the start. Not full screen; the page stays visible behind it.
  const openFilm = () => {
    const v = loop.current;
    if (v) {
      v.pause();
      v.muted = true;
    }
    setSound(false);
    dialog.current?.showModal();
    const big = film.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!big) return;
    big.currentTime = 0;
    big.muted = false;
    big.play().catch(() => {});
  };
  const closeFilm = () => {
    film.current?.pause();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (!calm()) loop.current?.play().catch(() => {});
  };
  // leaving full screen (Esc, or the browser's own button) closes the film too
  React.useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement && dialog.current?.open) dialog.current.close();
    };
    const big = film.current;
    const onEnd = () => dialog.current?.open && dialog.current.close();
    document.addEventListener("fullscreenchange", onFs);
    big?.addEventListener("webkitendfullscreen", onEnd);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      big?.removeEventListener("webkitendfullscreen", onEnd);
    };
  }, []);
  const [place, setPlace] = React.useState<string | null>(null);
  const band = es ? "AI Software Lab. Construimos los agentes que hacen el trabajo. " : "AI Software Lab. We build the agents that do the work. ";

  return (
    <SparkPage active="home" over={false}>
        <section className={`${s.heroWrap} ${s.hero}`}>
          <div className={s.heroPanel}>
            <p className={s.heroKicker}>MindfulTech, AI Software Lab</p>
            <h1>{es ? "El laboratorio de software que construye tu IA." : "The software lab that builds your AI."}</h1>
            <p>
              {es
                ? "Diseñamos, construimos y operamos software con IA para tu empresa: agentes que hacen el trabajo rutinario, conectados a los sistemas que ya usas."
                : "We design, build and run AI software for your company: agents that do the routine work, connected to the systems you already use."}
            </p>
            <Link href="/services/" className={`${s.pill} ${s.pillSage}`}>
              {es ? "Ver nuestros servicios" : "Explore our services"}
              <Arrow />
            </Link>
          </div>
          <div className={s.heroMedia}>
            <video ref={loop} muted playsInline preload="metadata" poster={FILM.poster} aria-label={t(FILM.alt)}>
              <source src={FILM.src} type="video/mp4" />
            </video>
            <button type="button" className={s.play} onClick={openFilm} aria-label={es ? "Ver el video a pantalla completa" : "Watch the film full screen"}>
              <Play size={24} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <button type="button" className={s.sound} onClick={toggleSound} aria-pressed={sound}>
              {sound ? <Volume2 size={20} strokeWidth={1.8} aria-hidden="true" /> : <VolumeX size={20} strokeWidth={1.8} aria-hidden="true" />}
              <span>{sound ? (es ? "Silenciar" : "Mute") : es ? "Activar sonido" : "Turn sound on"}</span>
            </button>
          </div>
        </section>

        <dialog ref={dialog} className={s.film} onClose={closeFilm} onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }} aria-label={es ? "Video de MindfulTech" : "MindfulTech film"}>
          <video ref={film} controls playsInline preload="none" poster="/mt/promo-poster.webp">
            <source src="/mt/promo.mp4" type="video/mp4" />
          </video>
          <form method="dialog">
            <button type="submit" className={`${s.pill} ${s.pillWhite} ${s.pillSmall}`}>{es ? "Cerrar video" : "Close film"}</button>
          </form>
        </dialog>

        <section className={s.logoRail} aria-label={es ? "Clientes" : "Clients"}>
          {/* two identical groups, each at least as wide as the screen: when the
              first slides out the second is already in its place, so the rail
              never shows a gap at any width */}
          {[0, 1].map((g) => (
            <ul key={g} className={s.logoTrack} aria-hidden={g === 1}>
              {[0, 1].map((k) =>
                LOGOS.map((l) => (
                  <li key={k + l.alt}>
                    <img src={l.src} alt={g === 0 && k === 0 ? l.alt : ""} style={{ "--h": l.h } as React.CSSProperties} decoding="sync" />
                  </li>
                ))
              )}
            </ul>
          ))}
        </section>

        <section className={`${s.wrap} ${s.section}`}>
          <h2 className={`${s.h2} ${s.svcHead}`}>{es ? "IA y software para que tu negocio crezca, ahorre tiempo y haga mucho más." : "AI and software to grow your business, save time and get far more done."}</h2>
          <ul className={s.svcGrid}>
            {SERVICES.map((v, i) => (
              <li key={v.href + v.title.en}>
                <Link href={v.href} className={`${s.svc} ${i === 0 ? s.svcDark : ""}`}>
                  <h3>{t(v.title)}</h3>
                  <span className={s.svcArt}><img src={`/mt/icon-${ART[i]}.webp`} alt="" width={360} height={360} loading="lazy" /></span>
                  <p>{t(v.text)}</p>
                  <span className={`${s.pill} ${s.pillSmall} ${s.svcBtn}`}>
                    {es ? "Ver más" : "Explore more"}
                    <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${s.night} ${s.notched} ${s.controlBlock}`}>
          <div className={`${s.wrap} ${s.center}`}>
            <p className={s.kicker}>{es ? "Un agente es software que hace un trabajo completo, de principio a fin" : "An agent is software that does a whole job, from start to finish"}</p>
            <h2 className={s.h2}>{es ? "Cómo trabaja un agente de IA." : "How an AI agent works."}</h2>
          </div>
          <div className={`${s.wrap} ${s.control}`}>
            <Knot3D className={s.mark} />
            {CONTROL.map((c, i) => {
              const Icon = CONTROL_ICONS[i];
              return (
                <div key={c.t.en} className={s.glass}>
                  <Icon size={34} strokeWidth={1.4} aria-hidden="true" />
                  <div><h3>{t(c.t)}</h3><p>{t(c.d)}</p></div>
                </div>
              );
            })}
          </div>
        </section>

        <div className={s.oneView}>
        <section className={`${s.wrap} ${s.split}`}>
          <div className={s.splitMedia}>
            <Hub3D className={s.hubArt} alt={es ? "Una plataforma central conectada a los paneles de ventas, contabilidad, inventario y soporte" : "A central platform wired to the sales, accounting, inventory and support dashboards"} />
            <span className={`${s.chip} ${s.chipA}`}>{es ? "Todos tus sistemas conectados" : "All your systems connected"}</span>
            <span className={`${s.chip} ${s.chipB}`}>{es ? "Datos al día" : "Data always up to date"}</span>
          </div>
          <div>
            <p className={s.eyebrow}>{es ? "Integración de sistemas" : "Systems integration"}</p>
            <h2 className={s.h2}>{es ? "Todos tus sistemas, trabajando como uno solo." : "All your systems, working as one."}</h2>
            <p className={s.strong}>{es ? "Conectamos tu CRM, tu contabilidad, tu inventario y las herramientas que tu equipo ya usa. Cada número queda en un solo lugar y nadie vuelve a copiar datos a mano." : "We connect your CRM, your accounting, your inventory and the tools your team already uses. Every number sits in one place and nobody copies data by hand again."}</p>
            <div className={s.btnRow}>
              <Link href="/services/" className={`${s.pill} ${s.pillSage}`}>{es ? "Ver integración de sistemas" : "See systems integration"}<Arrow /></Link>
              <a href="#contact" className={`${s.pill} ${s.pillLine}`}>{t(TALK)}</a>
            </div>
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

        <div className={s.bands} aria-hidden="true">
          <div className={`${s.band} ${s.bandA}`}><span>{band.repeat(4)}</span><span>{band.repeat(4)}</span></div>
          <div className={`${s.band} ${s.bandB}`}><span>{band.repeat(4)}</span><span>{band.repeat(4)}</span></div>
        </div>

        <section className={`${s.wrap} ${s.section}`}>
          <div className={s.center}>
            <h2 className={s.h2} style={{ maxWidth: "16ch" }}>{es ? "Lo que construimos para nuestros clientes." : "What we built for our clients."}</h2>
          </div>
          <ul className={s.wall}>
            {CASES.map((c) => (
              <li key={c.id} data-id={c.id}>
                <div className={s.wallCard}>
                  <p>{t(c.title)}</p>
                  {c.text && <small>{t(c.text)}</small>}
                  <b>{c.client}</b>
                  <em>
                    <img src={`/flags/${FLAG[c.id].code}.webp`} alt={t(FLAG[c.id].name)} width={80} height={53} loading="lazy" />
                    {t(c.where)}
                  </em>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <ul className={s.strip} aria-hidden="true">
          {STRIP.map((src) => (
            <li key={src}><img src={src} alt="" loading="lazy" /></li>
          ))}
        </ul>

        <div style={{ marginTop: "var(--space)" }}>
          <ContactBlock id="contact" />
        </div>

        {/* world map removed from the home at Carlos's request (2026-11-20); kept for reuse */}
        {SHOW_MAP && (
        <section className={`${s.wrap} ${s.section}`}>
          <p className={s.eyebrow}>{es ? "MindfulTech en el mundo" : "MindfulTech around the world"}</p>
          <h2 className={s.h2} style={{ maxWidth: "20ch" }}>{es ? "Un laboratorio en Quito, proyectos en tres continentes." : "One lab in Quito, projects on three continents."}</h2>
          <div className={s.mapBlock}>
            <div className={s.mapPanel}>
              <WorldMap active={place} onPick={setPlace} />
              <p className={s.mapKey}>
                <span><i data-k="home" />{es ? "Laboratorio" : "The lab"}</span>
                <span><i data-k="client" />{es ? "Proyectos con cliente nombrado" : "Projects with a named client"}</span>
                <span><i data-k="more" />{es ? "Otros clientes: Alemania, España y Grecia" : "Other clients: Germany, Spain and Greece"}</span>
              </p>
            </div>
            <ul className={s.places}>
              {[HOME, ...PLACES].map((pl) => (
                <li key={pl.id} data-on={place === pl.id} onMouseEnter={() => setPlace(pl.id)} onMouseLeave={() => setPlace(null)}>
                  <h3>{t(pl.city)}</h3>
                  <ul>
                    {pl.projects.map((pr) => (
                      <li key={pr.name}>
                        {pr.href ? <Link href={pr.href} onFocus={() => setPlace(pl.id)} onBlur={() => setPlace(null)}>{pr.name}</Link> : <b>{pr.name}</b>}
                        <span>{t(pr.what)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>
        )}
    </SparkPage>
  );
}
