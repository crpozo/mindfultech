"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import type { Bot } from "@/lib/office/bots";
import { LOCALE, tx, type Lang } from "@/lib/office/i18n";
import s from "./screen.module.css";

/**
 * The employee's remote desktop, drawn like the real thing: a macOS-style
 * workstation with a menu bar, a dock, and one real-looking app window per
 * role (Zendesk, HubSpot, Meta Business Suite, VS Code, Google Sheets,
 * WhatsApp Business). The app types, clicks and updates on its own; the
 * cursor moves between real targets. Laid out at 1000×625 and scaled to fit,
 * with an "Expand" button that shows it full size.
 *
 * Every visible string exists in Spanish and English; `lang` picks one.
 */

// ---------------------------------------------------------------- helpers ----
function useTick(ms: number) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return tick;
}

/** Types a list of texts one after another, pausing between them, forever. */
function useTyper(scripts: string[], cps = 30, pause = 2400) {
  const [i, setI] = React.useState(0);
  const [n, setN] = React.useState(0);
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    const text = scripts[i % scripts.length] ?? "";
    if (n < text.length) {
      const id = window.setTimeout(() => setN(n + 1), 1000 / cps + (text[n] === " " ? 20 : 0) + (text[n] === "\n" ? 260 : 0));
      return () => window.clearTimeout(id);
    }
    setDone(true);
    const id = window.setTimeout(() => {
      setDone(false);
      setN(0);
      setI(i + 1);
    }, pause);
    return () => window.clearTimeout(id);
  }, [scripts, i, n, cps, pause]);
  const text = scripts[i % scripts.length] ?? "";
  return { text: text.slice(0, n), index: i, done };
}

/** A pair of strings resolved by language. */
type Pair = { es: string; en: string };
const pick = (lang: Lang, p: Pair) => p[lang];

const now = (lang: Lang) => new Date().toLocaleTimeString(LOCALE[lang], { hour: "2-digit", minute: "2-digit" });
const nowS = (lang: Lang) => new Date().toLocaleTimeString(LOCALE[lang], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const initials = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("");
const AV = ["#2563eb", "#7c3aed", "#db2777", "#059669", "#d97706", "#0891b2", "#dc2626"];
const avatarColor = (n: string) => AV[n.charCodeAt(0) % AV.length];

function Avatar({ name, size = 26 }: { name: string; size?: number }) {
  return (
    <span className={s.avatar} style={{ background: avatarColor(name), width: size, height: size, fontSize: size * 0.42 }}>
      {initials(name)}
    </span>
  );
}

/** The cursor walks through a few screen targets so it looks purposeful. */
function Cursor({ targets, period = 2600 }: { targets: [number, number][]; period?: number }) {
  const tick = useTick(period);
  const [x, y] = targets[tick % targets.length];
  return (
    <svg className={s.cursor} style={{ left: x, top: y }} viewBox="0 0 14 20" aria-hidden>
      <path d="M1 1 L1 15.5 L4.6 12.2 L7.2 18.4 L9.9 17.2 L7.3 11.2 L12.4 11.2 Z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function Desktop({ app, appName, doc, dock, children, toast, cursor, lang }: { app: string; appName: string; doc: string; dock: number; children: React.ReactNode; toast?: React.ReactNode; cursor: [number, number][]; lang: Lang }) {
  const tick = useTick(1000);
  const t = tx(lang);
  const DOCK = [
    ["🔵", "Finder", "#3b82f6"],
    ["✉️", "Mail", "#60a5fa"],
    ["🗓", t("Calendario", "Calendar"), "#ef4444"],
    ["💬", "Slack", "#4a154b"],
    ["🌐", "Chrome", "#f59e0b"],
    ["📊", "Sheets", "#0f9d58"],
    ["⌨️", "VS Code", "#007acc"],
    ["📁", "Drive", "#fbbc04"],
  ] as const;
  void tick;
  return (
    <div className={s.desktop}>
      <div className={s.menubar}>
        <span>●</span>
        <b>{appName}</b>
        <span>{t("Archivo", "File")}</span>
        <span>{t("Editar", "Edit")}</span>
        <span>{t("Ver", "View")}</span>
        <span>{t("Ventana", "Window")}</span>
        <span>{t("Ayuda", "Help")}</span>
        <span className={s.right}>
          <span>{t("◔ 92 %", "◔ 92%")}</span>
          <span>⌔ Wi-Fi</span>
          <span>{new Date().toLocaleDateString(LOCALE[lang], { weekday: "short", day: "numeric", month: "short" })}</span>
          <span>{now(lang)}</span>
        </span>
      </div>
      <div className={s.window}>
        <div className={s.titlebar}>
          <span className={s.lights}>
            <i style={{ background: "#ff5f57" }} />
            <i style={{ background: "#febc2e" }} />
            <i style={{ background: "#28c840" }} />
          </span>
          <span>‹ ›</span>
          <span className={s.url}>🔒 {doc}</span>
          <span>⇪ ⊕</span>
        </div>
        <div className={s.body}>{children}</div>
      </div>
      {toast}
      <Cursor targets={cursor} />
      <div className={s.dock}>
        {DOCK.map(([ico, name, color], i) => (
          <span key={name} className={`${s.dockIcon} ${i === dock ? s.on : ""}`} style={{ background: color }} title={name}>
            {ico}
          </span>
        ))}
        <span className={`${s.dockIcon} ${s.on}`} style={{ background: "#111827" }}>
          {app}
        </span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ apps ----
type Priority = "urgent" | "high" | "normal" | "low";
type Ticket = { id: string; sub: Pair; req: string; org: string; pri: Priority; ago: Pair; escalated?: boolean };
const TICKETS: Ticket[] = [
  { id: "#4821", sub: { es: "No puedo descargar mi factura de agosto", en: "Can't download my August invoice" }, req: "Carolina Ríos", org: "López y Asociados", pri: "high", ago: { es: "hace 12 min", en: "12 min ago" } },
  { id: "#4822", sub: { es: "Cambio de plan mensual a anual", en: "Switch from monthly to annual plan" }, req: "Luis Andrade", org: "Distribuidora Norte", pri: "normal", ago: { es: "hace 25 min", en: "25 min ago" } },
  { id: "#4823", sub: { es: "Error al pagar con tarjeta (código 05)", en: "Card payment error (code 05)" }, req: "Paula Mena", org: "Hotel Casa Gangotena", pri: "urgent", ago: { es: "hace 31 min", en: "31 min ago" } },
  { id: "#4824", sub: { es: "¿Cómo agrego usuarios a mi cuenta?", en: "How do I add users to my account?" }, req: "Diego Salazar", org: "Clínica San Marcos", pri: "low", ago: { es: "hace 1 h", en: "1 h ago" } },
  { id: "#4825", sub: { es: "Reembolso del pedido 1193", en: "Refund for order 1193" }, req: "Marcela Toro", org: "Coop. 29 de Octubre", pri: "high", ago: { es: "hace 2 h", en: "2 h ago" }, escalated: true },
  { id: "#4826", sub: { es: "La app no carga en Android 14", en: "App won't load on Android 14" }, req: "Andrés Paz", org: "Logística del Pacífico", pri: "normal", ago: { es: "hace 2 h", en: "2 h ago" } },
];
const PRI: Record<Priority, { color: string; label: Pair }> = {
  urgent: { color: "#dc2626", label: { es: "Urgente", en: "Urgent" } },
  high: { color: "#ea580c", label: { es: "Alta", en: "High" } },
  normal: { color: "#2563eb", label: { es: "Normal", en: "Normal" } },
  low: { color: "#6b7280", label: { es: "Baja", en: "Low" } },
};
const REPLIES: Pair[] = [
  {
    es: "Hola Carolina,\n\nRevisé tu cuenta: la factura de agosto no se generó por un cambio de RUC el 30/08. Ya la regeneré con los datos correctos; puedes descargarla desde Facturación › Historial o directamente aquí:\nhttps://app.mindfultech.ec/f/8821\n\nQuedo atento por si necesitas algo más.\n\nMateo · Soporte MindfulTech",
    en: "Hi Carolina,\n\nI checked your account: the August invoice wasn't generated because of a tax ID (RUC) change on 08/30. I've regenerated it with the correct details; you can download it from Billing › History or directly here:\nhttps://app.mindfultech.ec/f/8821\n\nLet me know if you need anything else.\n\nMateo · MindfulTech Support",
  },
  {
    es: "Hola Luis,\n\nListo: migré tu plan a la modalidad anual. Se aplicó el 15 % de descuento y el próximo cobro será el 12 de octubre de 2027 por $1.020 + IVA. Te envié la factura proforma por correo.\n\n¿Algo más en lo que pueda ayudarte?\n\nMateo · Soporte MindfulTech",
    en: "Hi Luis,\n\nDone: I moved your plan to annual billing. The 15% discount has been applied and your next charge will be on October 12, 2027 for $1,020 + VAT. I've emailed you the pro forma invoice.\n\nAnything else I can help you with?\n\nMateo · MindfulTech Support",
  },
  {
    es: "Hola Paula,\n\nEl pago fue rechazado por el banco emisor (código 05: no autorizado). Te dejé un enlace de pago alternativo, válido por 24 h:\nhttps://pago.mindfultech.ec/x/7ad2\n\nSi vuelve a fallar, lo escalo con prioridad a nuestro equipo de pagos.\n\nMateo · Soporte MindfulTech",
    en: "Hi Paula,\n\nThe payment was declined by the issuing bank (code 05: not authorized). I've sent you an alternative payment link, valid for 24 hours:\nhttps://pago.mindfultech.ec/x/7ad2\n\nIf it fails again, I'll escalate it to our payments team as a priority.\n\nMateo · MindfulTech Support",
  },
];
function Zendesk({ bot, lang }: { bot: Bot; lang: Lang }) {
  const t = tx(lang);
  const replies = React.useMemo(() => REPLIES.map((r) => pick(lang, r)), [lang]);
  const { text, index, done } = useTyper(replies, 34, 2600);
  const active = index % 3;
  const tk0 = TICKETS[active];
  const sub = pick(lang, tk0.sub);
  const tags = lang === "es" ? ["facturación", "pagos", "cuenta", "app-android"] : ["billing", "payments", "account", "app-android"];
  return (
    <>
      <div className={s.rail}>
        <span className={s.railLogo} style={{ background: "#03363d" }}>
          Z
        </span>
        {["⌂", "▤", "✉", "◔", "◷", "⚙"].map((ic, i) => (
          <span key={i} className={`${s.railBtn} ${i === 1 ? s.on : ""}`}>
            {ic}
          </span>
        ))}
      </div>
      <div className={s.side}>
        <div className={s.sideH}>{t("Vistas", "Views")}</div>
        <div className={`${s.sideItem} ${s.on}`}>
          {t("Tus tickets sin resolver", "Your unsolved tickets")} <em>{6 - active}</em>
        </div>
        <div className={s.sideItem}>
          {t("Sin asignar", "Unassigned")} <em>2</em>
        </div>
        <div className={s.sideItem}>
          {t("Escalados", "Escalated")} <em>1</em>
        </div>
        <div className={s.sideItem}>
          {t("Resueltos hoy", "Solved today")} <em>{127 + active}</em>
        </div>
        <div className={s.sideH} style={{ marginTop: 10 }}>
          {t("Etiquetas", "Tags")}
        </div>
        {tags.map((tg) => (
          <div key={tg} className={s.sideItem}>
            # {tg}
          </div>
        ))}
      </div>
      <div className={s.main}>
        <div className={s.topbar}>
          <h1>{t("Tickets sin resolver", "Unsolved tickets")}</h1>
          <span className={s.tag}>{t("Ordenado por prioridad", "Sorted by priority")}</span>
          <span className={s.search}>🔍 {t("Buscar tickets, usuarios…", "Search tickets, users…")}</span>
          <Avatar name={bot.name + " " + bot.role} />
        </div>
        <div className={s.body}>
          <div className={s.zdList}>
            {TICKETS.map((tk, i) => {
              const resolved = i < active;
              return (
                <div key={tk.id} className={`${s.ticket} ${i === active ? s.on : ""}`}>
                  <span className={s.st} style={{ background: resolved ? "#22c55e" : tk.escalated ? "#f59e0b" : "#ef4444" }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className={s.sub}>
                      {tk.id} · {pick(lang, tk.sub)}
                    </div>
                    <div className={s.req}>
                      {tk.req} · {tk.org} · {resolved ? t("Resuelto", "Solved") : pick(lang, tk.ago)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={s.zdThread}>
            <div className={s.zdHead}>
              <h2>
                {tk0.id} · {sub}
              </h2>
              <div className={s.zdMeta}>
                <span className={s.tag} style={{ background: PRI[tk0.pri].color + "22", color: PRI[tk0.pri].color }}>
                  {pick(lang, PRI[tk0.pri].label)}
                </span>
                <span className={s.tag}>{done ? t("Resuelto", "Solved") : t("Abierto", "Open")}</span>
                <span>
                  {t("Solicitante", "Requester")}: {tk0.req}
                </span>
                <span>· {tk0.org}</span>
                <span>· SLA 2 h</span>
              </div>
            </div>
            <div className={s.msg}>
              <Avatar name={tk0.req} size={30} />
              <div className={s.body2}>
                <span className={s.who}>{tk0.req}</span>
                <span className={s.when}>{pick(lang, tk0.ago)}</span>
                <div>
                  {lang === "es"
                    ? `Hola, ${sub.toLowerCase()}. ¿Me pueden ayudar, por favor? Lo necesito para cerrar el mes. Gracias.`
                    : `Hi, ${sub.charAt(0).toLowerCase() + sub.slice(1)}. Could you help me, please? I need it to close out the month. Thanks.`}
                </div>
              </div>
            </div>
            <div className={s.editor}>
              <div className={s.toolbar}>
                <i className={s.on}>B</i>
                <i>I</i>
                <i>U</i>
                <i>🔗</i>
                <i>📎</i>
                <i>≡</i>
                <span style={{ marginLeft: "auto" }}>{t("Respuesta pública", "Public reply")} ▾</span>
              </div>
              <div className={s.editorBody}>
                <div className={s.typing}>
                  {text}
                  {!done && <span className={s.caret} />}
                </div>
              </div>
              <div className={s.editorFoot}>
                <span className={s.btn + " " + s.ghost}>Macros ▾</span>
                <span style={{ marginLeft: "auto", color: "#6b7280" }}>{done ? t("Enviado · ticket resuelto ✓", "Sent · ticket solved ✓") : t("Borrador guardado", "Draft saved")}</span>
                <span className={s.btn} style={{ background: done ? "#16a34a" : "#1f73b7" }}>
                  {t("Enviar como Resuelto", "Submit as Solved")} ▾
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const STAGES: Pair[] = [
  { es: "Cita programada", en: "Appointment scheduled" },
  { es: "Presentación", en: "Presentation" },
  { es: "Propuesta enviada", en: "Proposal sent" },
  { es: "Negociación", en: "Negotiation" },
  { es: "Cerrado ganado", en: "Closed won" },
];
/** [company, amount, close date (es), close date (en), stage index] */
const DEALS = [
  ["Grupo Andino", 18400, "12 oct", "Oct 12", 2],
  ["Farmacias Cruz", 9900, "3 oct", "Oct 3", 3],
  ["Coop. 29 de Octubre", 6200, "18 oct", "Oct 18", 1],
  ["Logística del Pacífico", 12750, "25 oct", "Oct 25", 2],
  ["Hotel Casa Gangotena", 4100, "30 oct", "Oct 30", 0],
  ["Clínica San Marcos", 7800, "9 oct", "Oct 9", 1],
  ["Distribuidora Norte", 3300, "14 nov", "Nov 14", 0],
  ["Universidad del Valle", 15200, "5 nov", "Nov 5", 3],
  ["Ferretería Central", 2600, "20 oct", "Oct 20", 4],
] as const;
const MAILS: Pair[] = [
  {
    es: "Hola Diego,\n\nVi que revisaron la propuesta ayer. Te propongo una llamada de 20 minutos el jueves a las 10:00 para resolver dudas sobre la fase de implementación y el cronograma.\n\n¿Te viene bien?\n\nSofía · Ventas MindfulTech",
    en: "Hi Diego,\n\nI saw your team reviewed the proposal yesterday. How about a 20-minute call on Thursday at 10:00 to go over any questions on the implementation phase and timeline?\n\nDoes that work for you?\n\nSofía · MindfulTech Sales",
  },
  {
    es: "Hola Andrea,\n\nAdjunto la cotización actualizada con el descuento por pago anual (12 %). Incluye onboarding, capacitación y soporte prioritario durante 6 meses.\n\nQuedo atenta,\nSofía",
    en: "Hi Andrea,\n\nAttached is the updated quote with the annual payment discount (12%). It includes onboarding, training and priority support for 6 months.\n\nBest regards,\nSofía",
  },
];
function HubSpot({ bot, lang }: { bot: Bot; lang: Lang }) {
  const t = tx(lang);
  const tick = useTick(3000);
  const mails = React.useMemo(() => MAILS.map((m) => pick(lang, m)), [lang]);
  const { text } = useTyper(mails, 30, 2800);
  const moved = tick % DEALS.length; // one deal moves a stage forward
  const fmt = (n: number) => "$" + n.toLocaleString(LOCALE[lang]);
  return (
    <div className={s.main}>
      <div className={s.hsNav}>
        <b>
          <span style={{ color: "#ff7a59" }}>⬢</span> HubSpot
        </b>
        <span>{t("Contactos", "Contacts")}</span>
        <span className={s.on}>{t("Negocios", "Deals")}</span>
        <span>{t("Conversaciones", "Conversations")}</span>
        <span>Marketing</span>
        <span>{t("Informes", "Reports")}</span>
        <span style={{ marginLeft: "auto" }}>🔍</span>
        <Avatar name={bot.name + " V"} size={24} />
      </div>
      <div className={s.topbar} style={{ background: "#f5f8fa" }}>
        <h1>{t("Pipeline de ventas · Q4", "Sales pipeline · Q4")}</h1>
        <span className={s.tag}>{t("Tablero", "Board")}</span>
        <span className={s.tag} style={{ background: "#fff" }}>
          {t("Lista", "List")}
        </span>
        <span className={s.btn} style={{ marginLeft: "auto", background: "#ff7a59" }}>
          {t("Crear negocio", "Create deal")}
        </span>
      </div>
      <div className={s.body}>
        <div className={s.board}>
          {STAGES.map((st, si) => {
            const items = DEALS.map((d, i) => ({ d, i, stage: Math.min(4, d[4] + (i === moved ? 1 : 0)) })).filter((x) => x.stage === si);
            const total = items.reduce((a, x) => a + x.d[1], 0);
            return (
              <div key={st.en} className={s.stage}>
                <div className={s.stageH}>
                  {pick(lang, st)}
                  <small>
                    {items.length} {t("negocios", items.length === 1 ? "deal" : "deals")} · {fmt(total)}
                  </small>
                </div>
                {items.map(({ d, i }) => (
                  <div key={d[0]} className={`${s.deal} ${i === moved ? s.hot : ""}`}>
                    <b>{d[0]}</b>
                    <span>
                      {fmt(d[1])} · {t("cierre", "close")} {lang === "es" ? d[2] : d[3]}
                    </span>
                    <span>
                      {t("Propietaria", "Owner")}: {bot.name}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div className={s.composer} style={{ width: 260 }}>
          <div className={s.topbar} style={{ height: 40 }}>
            <h1 style={{ fontSize: 13 }}>
              {t("Correo", "Email")} · {DEALS[moved][0]}
            </h1>
          </div>
          <div style={{ padding: "10px 12px", fontSize: 12, color: "#516f90" }}>
            {t("Para", "To")}: <b style={{ color: "#33475b" }}>{t("contacto", "contact")}@{DEALS[moved][0].toLowerCase().replace(/[^a-z]/g, "")}.ec</b>
          </div>
          <div style={{ padding: "0 12px" }} className={s.typing}>
            {text}
            <span className={s.caret} />
          </div>
          <div className={s.editorFoot} style={{ marginTop: "auto" }}>
            <span className={s.btn} style={{ background: "#ff7a59" }}>
              {t("Enviar", "Send")}
            </span>
            <span style={{ color: "#7c98b6" }}>{t("Secuencia: seguimiento 3 días", "Sequence: 3-day follow-up")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const POSTS: Pair[] = [
  {
    es: "🚀 Lanzamos la nueva versión de la app con reportes en tiempo real. Menos hojas de cálculo, más decisiones. Link en bio 👇 #producto #ecuador #pymes",
    en: "🚀 We just launched the new version of the app with real-time reports. Fewer spreadsheets, better decisions. Link in bio 👇 #product #ecuador #smb",
  },
  {
    es: "¿Sabías que el 63 % de los clientes prefiere resolver dudas por chat? Así atendemos nosotros, 24/7 y en menos de un minuto ✨ #atencionalcliente",
    en: "Did you know 63% of customers prefer to get their questions answered over chat? That's how we do support: 24/7 and in under a minute ✨ #customerservice",
  },
  {
    es: "Detrás de cámaras: cómo nuestro equipo de IA prepara el contenido de la semana en 2 horas. Hilo 🧵👇",
    en: "Behind the scenes: how our AI team gets the week's content ready in 2 hours. Thread 🧵👇",
  },
];
const NET = { ig: ["#e1306c", "IG"], fb: ["#1877f2", "FB"], li: ["#0a66c2", "IN"], tt: ["#111", "TT"] } as const;
const PLANNED: [number, number, keyof typeof NET, Pair][] = [
  [0, 1, "ig", { es: "Lanzamiento app", en: "App launch" }],
  [0, 6, "li", { es: "Caso Grupo Andino", en: "Grupo Andino case study" }],
  [1, 3, "tt", { es: "Reel: 24/7", en: "Reel: 24/7" }],
  [2, 1, "ig", { es: "Carrusel checkout", en: "Checkout carousel" }],
  [3, 5, "li", { es: "Webinar jueves", en: "Thursday webinar" }],
  [4, 2, "ig", { es: "Detrás de cámaras", en: "Behind the scenes" }],
  [4, 7, "fb", { es: "Promo octubre", en: "October promo" }],
  [5, 3, "ig", { es: "Testimonio", en: "Testimonial" }],
];
function MetaSuite({ bot, lang }: { bot: Bot; lang: Lang }) {
  void bot;
  const t = tx(lang);
  const posts = React.useMemo(() => POSTS.map((p) => pick(lang, p)), [lang]);
  const { text, index } = useTyper(posts, 28, 2800);
  const days = lang === "es" ? ["Lun 29", "Mar 30", "Mié 1", "Jue 2", "Vie 3", "Sáb 4", "Dom 5"] : ["Mon 29", "Tue 30", "Wed 1", "Thu 2", "Fri 3", "Sat 4", "Sun 5"];
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
  const nets = ["ig", "li", "tt"] as const;
  const menu = lang === "es" ? ["Inicio", "Notificaciones", "Planificador", "Contenido", "Bandeja de entrada", "Insights", "Anuncios", "Configuración"] : ["Home", "Notifications", "Planner", "Content", "Inbox", "Insights", "Ads", "Settings"];
  const media = lang === "es" ? ["Nueva app", "Chat 24/7", "Backstage"] : ["New app", "Chat 24/7", "Backstage"];
  return (
    <>
      <div className={s.side} style={{ width: 190, background: "#f9fafb" }}>
        <div style={{ fontWeight: 700, fontSize: 14, padding: "4px 8px 12px", color: "#1877f2" }}>Meta Business Suite</div>
        {menu.map((it, i) => (
          <div key={it} className={`${s.sideItem} ${i === 2 ? s.on : ""}`}>
            {it}
            {i === 4 && <em>7</em>}
          </div>
        ))}
      </div>
      <div className={s.main}>
        <div className={s.topbar}>
          <h1>{t("Planificador · esta semana", "Planner · this week")}</h1>
          <span className={s.tag}>Instagram</span>
          <span className={s.tag}>Facebook</span>
          <span className={s.tag}>LinkedIn</span>
          <span className={s.tag}>TikTok</span>
          <span className={s.btn} style={{ marginLeft: "auto", background: "#1877f2" }}>
            + {t("Crear publicación", "Create post")}
          </span>
        </div>
        <div className={s.body}>
          <div className={s.planner}>
            <div className={s.dayH} />
            {days.map((d) => (
              <div key={d} className={s.dayH}>
                {d}
              </div>
            ))}
            {hours.map((h, hi) => (
              <React.Fragment key={h}>
                <div className={s.hour}>{h}</div>
                {days.map((_, di) => {
                  const p = PLANNED.find((x) => x[0] === di && x[1] === hi);
                  const draft = di === 2 && hi === 4;
                  return (
                    <div key={di}>
                      {p && (
                        <div className={s.post} style={{ background: NET[p[2]][0] }}>
                          {NET[p[2]][1]} · {pick(lang, p[3])}
                        </div>
                      )}
                      {draft && (
                        <div className={s.post} style={{ background: "#fff", color: "#1877f2", border: "1px dashed #1877f2" }}>
                          {NET[nets[index % 3]][1]} · {t("Borrador…", "Draft…")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className={s.composer}>
            <div className={s.topbar} style={{ height: 40 }}>
              <h1 style={{ fontSize: 13 }}>
                {t("Nueva publicación", "New post")} · {NET[nets[index % 3]][1] === "IG" ? "Instagram" : NET[nets[index % 3]][1] === "IN" ? "LinkedIn" : "TikTok"}
              </h1>
            </div>
            <div className={s.media} style={{ background: ["linear-gradient(135deg,#667eea,#764ba2)", "linear-gradient(135deg,#f093fb,#f5576c)", "linear-gradient(135deg,#43e97b,#38f9d7)"][index % 3] }}>
              {media[index % 3]}
            </div>
            <div style={{ padding: "10px 12px" }} className={s.typing}>
              {text}
              <span className={s.caret} />
            </div>
            <div style={{ padding: "0 12px", fontSize: 11, color: "#6b7280" }}>{text.length}/2200 · 4 hashtags</div>
            <div className={s.editorFoot} style={{ marginTop: "auto" }}>
              <span className={s.btn + " " + s.ghost}>{t("Vista previa", "Preview")}</span>
              <span className={s.btn} style={{ marginLeft: "auto", background: "#1877f2" }}>
                {t("Programar · mié 12:00", "Schedule · Wed 12:00")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const CODE: React.ReactNode[] = [
  <><span className={s.kw}>import</span> {"{"} <span className={s.va}>Coupon</span>, <span className={s.va}>CouponRepo</span> {"}"} <span className={s.kw}>from</span> <span className={s.str}>"./repo"</span>;</>,
  <><span className={s.kw}>import</span> {"{"} <span className={s.va}>now</span> {"}"} <span className={s.kw}>from</span> <span className={s.str}>"../time"</span>;</>,
  <></>,
  <><span className={s.cm}>{"// Coupons are case-insensitive: \"VERANO20\" and \"verano20\" are the same code."}</span></>,
  <><span className={s.kw}>export async function</span> <span className={s.fn}>applyCoupon</span>(<span className={s.va}>input</span>: <span className={s.ty}>string</span>, <span className={s.va}>repo</span>: <span className={s.ty}>CouponRepo</span>): <span className={s.ty}>Promise</span>{"<"}<span className={s.ty}>Coupon</span> | <span className={s.kw}>null</span>{">"} {"{"}</>,
  <>{"  "}<span className={s.kw}>const</span> <span className={s.va}>code</span> = <span className={s.va}>input</span>.<span className={s.fn}>trim</span>().<span className={s.fn}>toUpperCase</span>();</>,
  <>{"  "}<span className={s.kw}>const</span> <span className={s.va}>coupon</span> = <span className={s.kw}>await</span> <span className={s.va}>repo</span>.<span className={s.fn}>findByCode</span>(<span className={s.va}>code</span>);</>,
  <>{"  "}<span className={s.kw}>if</span> (!<span className={s.va}>coupon</span> || <span className={s.va}>coupon</span>.<span className={s.va}>expiresAt</span> {"<"} <span className={s.fn}>now</span>()) <span className={s.kw}>return null</span>;</>,
  <>{"  "}<span className={s.kw}>if</span> (<span className={s.va}>coupon</span>.<span className={s.va}>usesLeft</span> {"<="} <span className={s.str}>0</span>) <span className={s.kw}>return null</span>;</>,
  <>{"  "}<span className={s.kw}>return</span> <span className={s.va}>coupon</span>;</>,
  <>{"}"}</>,
  <></>,
  <><span className={s.kw}>export function</span> <span className={s.fn}>discountedTotal</span>(<span className={s.va}>total</span>: <span className={s.ty}>number</span>, <span className={s.va}>coupon</span>: <span className={s.ty}>Coupon</span> | <span className={s.kw}>null</span>) {"{"}</>,
  <>{"  "}<span className={s.kw}>if</span> (!<span className={s.va}>coupon</span>) <span className={s.kw}>return</span> <span className={s.va}>total</span>;</>,
  <>{"  "}<span className={s.kw}>const</span> <span className={s.va}>pct</span> = <span className={s.va}>coupon</span>.<span className={s.va}>percent</span> / <span className={s.str}>100</span>;</>,
  <>{"  "}<span className={s.kw}>return</span> <span className={s.ty}>Math</span>.<span className={s.fn}>round</span>(<span className={s.va}>total</span> * (<span className={s.str}>1</span> - <span className={s.va}>pct</span>) * <span className={s.str}>100</span>) / <span className={s.str}>100</span>;</>,
  <>{"}"}</>,
];
const TERM: [string, string][] = [
  ["dim", "$ npm test -- checkout"],
  ["", ""],
  ["", " PASS  src/checkout/coupon.test.ts"],
  ["ok", "   ✓ applies coupon regardless of case (18 ms)"],
  ["ok", "   ✓ rejects expired coupon (4 ms)"],
  ["ok", "   ✓ rejects exhausted coupon (3 ms)"],
  ["ok", "   ✓ computes total with discount (7 ms)"],
  ["", ""],
  ["warn", "Test Suites: 31 passed, 31 total"],
  ["warn", "Tests:       248 passed, 248 total"],
  ["dim", "Time:        6.41 s"],
  ["dim", "$ git commit -m 'checkout: coupons are case-insensitive'"],
  ["", "[fix/checkout-coupon-case 4f2a9c1] checkout: coupons are case-insensitive"],
  ["dim", "$ gh pr create --fill --base main"],
  ["", "https://github.com/mindfultech/shop/pull/482"],
];
function VSCode({ lang }: { lang: Lang }) {
  const t = tx(lang);
  const tick = useTick(900);
  const n = tick % (TERM.length + 6);
  const codeN = Math.min(CODE.length, 4 + Math.floor(tick / 2));
  return (
    <div className={s.vsc}>
      <div className={s.vscTop}>
        <div className={s.vscAct}>
          <span className={s.on}>⧉</span>
          <span>🔍</span>
          <span>⑂</span>
          <span>▷</span>
          <span>⊞</span>
        </div>
        <div className={s.vscExp}>
          <div style={{ fontWeight: 700, fontSize: 11, color: "#bbb" }}>{t("EXPLORADOR", "EXPLORER")} · SHOP</div>
          <div>▾ src</div>
          <div>{"  "}▾ checkout</div>
          <div className={s.on}>{"    "}coupon.ts</div>
          <div>{"    "}coupon.test.ts</div>
          <div>{"    "}cart.ts</div>
          <div>{"    "}total.ts</div>
          <div>{"  "}▸ api</div>
          <div>{"  "}▸ components</div>
          <div>{"  "}time.ts</div>
          <div>▸ tests</div>
          <div>package.json</div>
          <div>README.md</div>
        </div>
        <div className={s.vscEd}>
          <div className={s.vscTabs}>
            <div className={s.on}>coupon.ts ●</div>
            <div>coupon.test.ts</div>
            <div>cart.ts</div>
          </div>
          <div className={s.code}>
            {CODE.slice(0, codeN).map((l, i) => (
              <div key={i} className={s.line}>
                <span className={s.n}>{i + 1}</span>
                <span>{l}</span>
              </div>
            ))}
            <div className={s.line}>
              <span className={s.n}>{codeN + 1}</span>
              <span className={s.caret} style={{ background: "#d4d4d4" }} />
            </div>
          </div>
          <div className={s.term}>
            <div className={s.dim}>TERMINAL · zsh · shop</div>
            {TERM.slice(0, n).map(([c, l], i) => (
              <div key={i} className={c ? s[c] : undefined}>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={s.vscStatus}>
        <span>⑂ fix/checkout-coupon-case</span>
        <span>⟳</span>
        <span>⊗ 0 ⚠ 0</span>
        <span className={s.r}>
          <span>Ln {codeN}, Col 18</span>
          <span>UTF-8</span>
          <span>TypeScript</span>
          <span>✓ Prettier</span>
        </span>
      </div>
    </div>
  );
}

/** [invoice, customer, amount, bank, date as dd/mm] */
const ROWS = [
  ["F-001-2291", "Grupo Andino", 2480, "Pichincha", "02/09"],
  ["F-001-2292", "Farmacias Cruz", 1190, "Produbanco", "03/09"],
  ["F-001-2293", "Hotel Casa Gangotena", 860, "Pichincha", "05/09"],
  ["F-001-2294", "Clínica San Marcos", 3250, "Guayaquil", "08/09"],
  ["F-001-2295", "Distribuidora Norte", 540, "Pichincha", "09/09"],
  ["F-001-2296", "Logística del Pacífico", 2900, "Produbanco", "12/09"],
  ["F-001-2297", "Coop. 29 de Octubre", 1260, "Pichincha", "15/09"],
  ["F-001-2298", "Universidad del Valle", 4100, "Guayaquil", "17/09"],
  ["F-001-2299", "Ferretería Central", 640, "Pichincha", "19/09"],
  ["F-001-2300", "Panadería La Espiga", 315, "Produbanco", "22/09"],
] as const;
function Sheets({ lang }: { lang: Lang }) {
  const t = tx(lang);
  const tick = useTick(1200);
  const n = tick % (ROWS.length + 4);
  const total = ROWS.slice(0, Math.min(n, ROWS.length)).reduce((a, r) => a + r[2], 0);
  const money = (v: number) => v.toLocaleString(LOCALE[lang], { minimumFractionDigits: 2 });
  // Stored as dd/mm; US English reads mm/dd.
  const date = (d: string) => (lang === "es" ? d : d.split("/").reverse().join("/"));
  const cell = Math.min(n, ROWS.length) + 1;
  const menu = lang === "es" ? ["Archivo", "Editar", "Ver", "Insertar", "Formato", "Datos", "Herramientas", "Extensiones", "Ayuda"] : ["File", "Edit", "View", "Insert", "Format", "Data", "Tools", "Extensions", "Help"];
  const headers = lang === "es" ? ["Factura", "Cliente", "Monto", "Banco", "Fecha", "Estado"] : ["Invoice", "Customer", "Amount", "Bank", "Date", "Status"];
  const formula = lang === "es" ? `fx =SI(CONTAR.SI(Banco!C:C;C${cell})>0;"Conciliado";"Revisar")` : `fx =IF(COUNTIF(Bank!C:C,C${cell})>0,"Reconciled","Review")`;
  return (
    <div className={s.sh}>
      <div className={s.shTop}>
        <span className={s.shLogo}>≣</span>
        <div>
          <div className={s.shTitle}>{t("Conciliación bancaria · septiembre 2026", "Bank reconciliation · September 2026")} ☆ ⛭</div>
          <div className={s.shMenu}>
            {menu.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
        <span className={s.tag} style={{ marginLeft: "auto", background: "#e6f4ea", color: "#137333" }}>
          ● {t("Guardado en Drive", "Saved to Drive")}
        </span>
        <span className={s.btn} style={{ background: "#c2e7ff", color: "#001d35" }}>
          {t("Compartir", "Share")}
        </span>
      </div>
      <div className={s.shTools}>
        <span>↶ ↷ 🖨</span>
        <span>{t("100 %", "100%")} ▾</span>
        <span>$ % .0 .00 123</span>
        <span>Arial ▾</span>
        <span>10 ▾</span>
        <span>B I S A</span>
        <span>⊞ ⊟</span>
      </div>
      <div className={s.shFormula}>
        <span className={s.cell}>F{cell}</span>
        <span className={s.fx}>{formula}</span>
      </div>
      <table className={s.grid}>
        <thead>
          <tr>
            <th style={{ width: 34 }} />
            {["A", "B", "C", "D", "E", "F"].map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>1</th>
            {headers.map((h) => (
              <td key={h} style={{ fontWeight: 600, background: "#f1f3f4" }}>
                {h}
              </td>
            ))}
          </tr>
          {ROWS.map((r, i) => (
            <tr key={r[0]}>
              <th>{i + 2}</th>
              <td>{r[0]}</td>
              <td>{r[1]}</td>
              <td className={s.num}>{money(r[2])}</td>
              <td>{i <= n ? r[3] : ""}</td>
              <td>{i <= n ? date(r[4]) : ""}</td>
              <td className={`${i === n ? s.sel : ""} ${i < n ? s.ok : i === n ? s.warn : ""}`}>{i < n ? t("Conciliado", "Reconciled") : i === n ? t("Revisar…", "Review…") : ""}</td>
            </tr>
          ))}
          <tr>
            <th>{ROWS.length + 2}</th>
            <td />
            <td style={{ fontWeight: 600 }}>{t("Total conciliado", "Total reconciled")}</td>
            <td className={s.num} style={{ fontWeight: 600 }}>
              {money(total)}
            </td>
            <td colSpan={3} />
          </tr>
        </tbody>
      </table>
      <div className={s.shTabs}>
        <div>+ ≡</div>
        <div className={s.on}>{t("Septiembre", "September")}</div>
        <div>{t("Octubre", "October")}</div>
        <div>{t("Banco", "Bank")}</div>
        <div>{t("Resumen", "Summary")}</div>
      </div>
    </div>
  );
}

/** [name, last message, time, unread] */
type Chat = [string, Pair, Pair, number];
const CHATS: Chat[] = [
  ["Gabriela Mora", { es: "16:30 por favor", en: "4:30 pm please" }, { es: "10:42", en: "10:42" }, 0],
  ["Luis Vega", { es: "¿Pueden mover mi cita al viernes?", en: "Can you move my appointment to Friday?" }, { es: "10:31", en: "10:31" }, 2],
  ["Proveedor Andina", { es: "Pedido #7731 despachado ✅", en: "Order #7731 shipped ✅" }, { es: "09:58", en: "09:58" }, 0],
  ["Dra. Paredes", { es: "Confirmado, gracias", en: "Confirmed, thanks" }, { es: "09:40", en: "09:40" }, 0],
  ["María José R.", { es: "Hola, ¿tienen turno hoy?", en: "Hi, do you have any openings today?" }, { es: "09:12", en: "09:12" }, 1],
  ["Carlos Enríquez", { es: "Ok perfecto", en: "Ok perfect" }, { es: "ayer", en: "yesterday" }, 0],
];
const WA: [string, Pair][] = [
  ["in", { es: "Hola, ¿tienen turno mañana en la tarde?", en: "Hi, do you have any openings tomorrow afternoon?" }],
  ["out", { es: "¡Hola Gabriela! Sí, tengo 15:00 y 16:30 disponibles con la Dra. Paredes. ¿Cuál prefieres?", en: "Hi Gabriela! Yes, I have 3:00 pm and 4:30 pm available with Dr. Paredes. Which would you prefer?" }],
  ["in", { es: "16:30 por favor", en: "4:30 pm please" }],
  ["out", { es: "Listo ✅ Cita confirmada para mañana 16:30. Te envío un recordatorio 2 h antes. Dirección: Av. República 234, piso 3.", en: "Done ✅ Appointment confirmed for tomorrow at 4:30 pm. I'll send you a reminder 2 hours before. Address: Av. República 234, 3rd floor." }],
  ["in", { es: "¡Gracias!", en: "Thank you!" }],
  ["out", { es: "¡A ti! Que tengas buen día 🙌", en: "You're welcome! Have a great day 🙌" }],
];
function WhatsApp({ bot, lang }: { bot: Bot; lang: Lang }) {
  const t = tx(lang);
  const tick = useTick(1600);
  const n = tick % (WA.length + 3);
  const wa = React.useMemo(() => WA.map(([d, m]) => [d, pick(lang, m)] as [string, string]), [lang]);
  return (
    <div className={s.wa}>
      <div className={s.waList}>
        <div className={s.waHead}>
          <Avatar name={bot.name + " W"} size={34} />
          <b>WhatsApp Business</b>
          <span style={{ marginLeft: "auto", color: "#54656f" }}>⊕ ⋮</span>
        </div>
        <div style={{ padding: "8px 12px" }}>
          <span className={s.search} style={{ width: "100%", marginLeft: 0 }}>
            🔍 {t("Buscar un chat", "Search or start a new chat")}
          </span>
        </div>
        {CHATS.map((c, i) => (
          <div key={c[0]} className={`${s.waChat} ${i === 0 ? s.on : ""}`}>
            <Avatar name={c[0]} size={40} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex" }}>
                <b>{c[0]}</b>
                <span className={s.time}>{pick(lang, c[2])}</span>
              </div>
              <div className={s.last}>{i === 0 ? wa[Math.min(n, wa.length) - 1]?.[1] ?? pick(lang, c[1]) : pick(lang, c[1])}</div>
            </div>
            {c[3] > 0 && <span className={s.unread}>{c[3]}</span>}
          </div>
        ))}
      </div>
      <div className={s.waConv}>
        <div className={s.waHead}>
          <Avatar name="Gabriela Mora" size={34} />
          <div>
            <b>Gabriela Mora</b>
            <div style={{ fontSize: 11, color: "#54656f" }}>{n < wa.length && wa[n][0] === "in" ? t("escribiendo…", "typing…") : t("en línea", "online")}</div>
          </div>
          <span style={{ marginLeft: "auto", color: "#54656f" }}>📞 🎥 ⋮</span>
        </div>
        <div className={s.waMsgs}>
          <div className={s.tag} style={{ alignSelf: "center", background: "#fff" }}>
            {t("HOY", "TODAY")}
          </div>
          {wa.slice(0, n).map(([d, m], i) => (
            <div key={i} className={`${s.bubble} ${d === "out" ? s.out : ""}`}>
              {m}
              <span className={s.meta}>
                {now(lang)}
                {d === "out" && <b>✓✓</b>}
              </span>
            </div>
          ))}
          {n < wa.length && wa[n][0] === "out" && (
            <div className={`${s.bubble} ${s.out}`} style={{ padding: "6px 10px" }}>
              <span className={s.dots}>
                <i />
                <i />
                <i />
              </span>
            </div>
          )}
        </div>
        <div className={s.waInput}>
          <span>😊</span>
          <span>📎</span>
          <span className={s.field}>{n < wa.length && wa[n][0] === "out" ? wa[n][1].slice(0, Math.max(0, Math.floor((Date.now() / 60) % wa[n][1].length))) : t("Escribe un mensaje", "Type a message")}</span>
          <span>🎤</span>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ activity log ----
/** Seguimiento Proveedores.xlsx (Jabonería Wilson), a handful of real rows:
    order date, receipt date, PO, description, pending qty, lead time (days),
    status, days late (negative = still ahead of the receipt date). */
const PROC_ROWS: [string, string, string, string, number, number, "ATRASADO" | "EN TRANSITO", number][] = [
  ["06/07/2026", "24/07/2026", "OC070129", "TARRINA PRINT LAVAX ROSADO 235 G", 10000, 60, "ATRASADO", 63],
  ["17/08/2026", "07/09/2026", "OC071363", "CAJA INSECTICIDA SAPOLIO PACK 360 ML", 4000, 10, "ATRASADO", 18],
  ["21/09/2026", "21/09/2026", "OC072540", "MATERIAL BRANDING TH", 1, 0, "ATRASADO", 4],
  ["02/11/2026", "02/11/2026", "OC072592", "TAPA ROJA P/A CLO-AZU SUPER/AK", 12000, 31, "EN TRANSITO", -38],
  ["05/11/2026", "05/11/2026", "OC072588", "LAMINA LAVAVAJILLA LIQUIDO LAVA GRANADA", 300, 30, "EN TRANSITO", -41],
  ["12/11/2026", "12/11/2026", "OC072584", "LAMINA BARRA DIAMANTE 250 G", 300, 33, "EN TRANSITO", -48],
  ["16/11/2026", "16/11/2026", "OC071994", "LAM PD GOL FLORAL CON ENZ 500 G", 4000, 48, "EN TRANSITO", -52],
  ["23/11/2026", "23/11/2026", "OC072442", "LAMINA SUAVIZANTE GOL PRIMAVERAL 450 ML", 700, 33, "EN TRANSITO", -59],
  ["27/11/2026", "27/11/2026", "OC071068", "ENVASE PLAST CAFE JAB ESPUM MISTY 250", 10000, 120, "EN TRANSITO", -63],
  ["14/12/2026", "14/12/2026", "OC071602", "TAPA DOSIFICADOR D28 CAFE 175 MM", 20000, 105, "EN TRANSITO", -80],
];
function Procurement({ lang }: { lang: Lang }) {
  const t = tx(lang);
  const tick = useTick(1300);
  const n = tick % (PROC_ROWS.length + 4);
  const cell = Math.min(n, PROC_ROWS.length) + 1;
  const date = (d: string) => (lang === "es" ? d : d.split("/").reverse().join("/"));
  const menu = lang === "es" ? ["Archivo", "Inicio", "Insertar", "Fórmulas", "Datos", "Revisar", "Vista", "Automatizar"] : ["File", "Home", "Insert", "Formulas", "Data", "Review", "View", "Automate"];
  const headers = lang === "es" ? ["FECHA_PEDIDO", "FECHA_RECEPCIÓN", "OC", "DESCRIPCIÓN", "CANT. PEND.", "LEAD TIME", "ESTATUS", "DÍAS", "SEGUIMIENTO"] : ["ORDER_DATE", "RECEIPT_DATE", "PO", "DESCRIPTION", "PENDING", "LEAD TIME", "STATUS", "DAYS", "FOLLOW-UP"];
  const formula = lang === "es" ? `fx =SI(HOY()>B${cell};"ATRASADO";"EN TRANSITO")` : `fx =IF(TODAY()>B${cell},"LATE","IN TRANSIT")`;
  const follow = (r: (typeof PROC_ROWS)[number], i: number) => {
    if (i > n) return "";
    if (i === n) return t("Enviando recordatorio…", "Sending reminder…");
    return r[6] === "ATRASADO" ? t("Recordatorio enviado · mar/jue", "Reminder sent · Tue/Thu") : t("Esperando confirmación", "Awaiting confirmation");
  };
  const status = (st: string) => (lang === "es" ? st : st === "ATRASADO" ? "LATE" : "IN TRANSIT");
  return (
    <div className={s.sh}>
      <div className={s.shTop}>
        <span className={s.shLogo} style={{ background: "#217346" }}>X</span>
        <div>
          <div className={s.shTitle}>Seguimiento Proveedores.xlsx · Jabonería Wilson ☆</div>
          <div className={s.shMenu}>
            {menu.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
        <span className={s.tag} style={{ marginLeft: "auto", background: "#e6f4ea", color: "#137333" }}>
          ● {t("Guardado · OneDrive", "Saved · OneDrive")}
        </span>
        <span className={s.btn} style={{ background: "#217346", color: "#fff" }}>
          {t("Compartir", "Share")}
        </span>
      </div>
      <div className={s.shTools}>
        <span>↶ ↷</span>
        <span>Calibri ▾</span>
        <span>11 ▾</span>
        <span>B I S</span>
        <span>{t("Formato condicional ▾", "Conditional formatting ▾")}</span>
        <span>{t("Filtro", "Filter")} ⏷</span>
      </div>
      <div className={s.shFormula}>
        <span className={s.cell}>G{cell}</span>
        <span className={s.fx}>{formula}</span>
      </div>
      <table className={s.grid}>
        <thead>
          <tr>
            <th style={{ width: 34 }} />
            {["A", "B", "C", "D", "E", "F", "G", "H", "I"].map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>1</th>
            {headers.map((h) => (
              <td key={h} style={{ fontWeight: 600, background: "#f1f3f4", whiteSpace: "nowrap" }}>
                {h}
              </td>
            ))}
          </tr>
          {PROC_ROWS.map((r, i) => (
            <tr key={r[2]}>
              <th>{i + 2}</th>
              <td>{date(r[0])}</td>
              <td style={{ fontWeight: 600 }}>{date(r[1])}</td>
              <td>{r[2]}</td>
              <td style={{ maxWidth: 230, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r[3]}</td>
              <td className={s.num}>{r[4].toLocaleString(LOCALE[lang])}</td>
              <td className={s.num}>{r[5]}</td>
              <td className={r[6] === "ATRASADO" ? s.warn : s.ok}>{status(r[6])}</td>
              <td className={s.num}>{r[7]}</td>
              <td className={i === n ? s.sel : ""}>{follow(r, i)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const LOG_POOL: Record<Bot["screen"], Pair[]> = {
  sales: [
    { es: "Lead calificado: Hotel Casa Gangotena (score 74)", en: "Lead qualified: Hotel Casa Gangotena (score 74)" },
    { es: "Email de seguimiento enviado a Grupo Andino", en: "Follow-up email sent to Grupo Andino" },
    { es: "Reunión agendada: jueves 10:00", en: "Meeting booked: Thursday 10:00" },
    { es: "Pipeline actualizado en HubSpot", en: "Pipeline updated in HubSpot" },
    { es: "Lead duplicado fusionado", en: "Duplicate lead merged" },
    { es: "Propuesta generada (PDF, 6 págs.)", en: "Proposal generated (PDF, 6 pages)" },
    { es: "Llamada resumida y guardada en el CRM", en: "Call summarized and saved to the CRM" },
  ],
  support: [
    { es: "Ticket #4821 resuelto en 38 s", en: "Ticket #4821 solved in 38 s" },
    { es: "Artículo de ayuda actualizado", en: "Help center article updated" },
    { es: "Ticket #4825 escalado a humano", en: "Ticket #4825 escalated to a human" },
    { es: "CSAT recibido: 5/5", en: "CSAT received: 5/5" },
    { es: "Respuesta enviada por WhatsApp", en: "Reply sent via WhatsApp" },
    { es: "Reembolso de $42 procesado", en: "$42 refund processed" },
    { es: "Ticket #4826 asignado", en: "Ticket #4826 assigned" },
  ],
  social: [
    { es: "Post programado: Instagram · mañana 09:00", en: "Post scheduled: Instagram · tomorrow 09:00" },
    { es: "63 comentarios respondidos", en: "63 comments replied to" },
    { es: "Carrusel exportado (5 slides)", en: "Carousel exported (5 slides)" },
    { es: "Reporte de campaña actualizado", en: "Campaign report updated" },
    { es: "Hashtags optimizados (+12 % alcance est.)", en: "Hashtags optimized (+12% est. reach)" },
    { es: "Mención en LinkedIn respondida", en: "LinkedIn mention replied to" },
    { es: "Reel subido a borradores", en: "Reel uploaded to drafts" },
  ],
  dev: [
    { es: "Tests: 248 passed", en: "Tests: 248 passed" },
    { es: "PR #482 abierto para revisión", en: "PR #482 opened for review" },
    { es: "Deploy a staging completado (41 s)", en: "Deploy to staging complete (41 s)" },
    { es: "Dependencia actualizada: next 15.5.20", en: "Dependency updated: next 15.5.20" },
    { es: "Lint sin errores", en: "Lint clean, no errors" },
    { es: "Alerta de seguridad cerrada (CVE-2026-1183)", en: "Security alert closed (CVE-2026-1183)" },
    { es: "Índice de base de datos creado", en: "Database index created" },
  ],
  finance: [
    { es: "Factura F-001-2292 conciliada", en: "Invoice F-001-2292 reconciled" },
    { es: "Factura electrónica autorizada por el SRI", en: "E-invoice authorized by the SRI" },
    { es: "Recordatorio de cobro enviado (F-001-2280)", en: "Payment reminder sent (F-001-2280)" },
    { es: "Pago a proveedor programado: viernes", en: "Supplier payment scheduled: Friday" },
    { es: "Flujo de caja recalculado", en: "Cash flow recalculated" },
    { es: "Gasto categorizado: software ($129)", en: "Expense categorized: software ($129)" },
    { es: "Reporte mensual exportado a PDF", en: "Monthly report exported to PDF" },
  ],
  procurement: [
    { es: "Hoja leída: 1.377 líneas · 692 OC abiertas", en: "Sheet read: 1,377 lines · 692 open POs" },
    { es: "Recordatorio enviado · OC070129 (63 días)", en: "Reminder sent · PO070129 (63 days late)" },
    { es: "Recordatorio enviado · OC071363 (18 días)", en: "Reminder sent · PO071363 (18 days late)" },
    { es: "Proveedor confirmó nueva fecha · OC072592", en: "Supplier confirmed new date · PO072592" },
    { es: "Fecha de recepción actualizada en la hoja", en: "Receipt date updated in the sheet" },
    { es: "ERP: 6 OC vencidas siguen en tránsito · escalado", en: "ERP: 6 overdue POs still in transit · escalated" },
    { es: "Próximo recordatorio: jueves 08:00", en: "Next reminder: Thursday 08:00" },
  ],
  ops: [
    { es: "Cita confirmada: G. Mora · mañana 16:30", en: "Appointment confirmed: G. Mora · tomorrow 4:30 pm" },
    { es: "Pedido de insumos enviado al proveedor", en: "Supply order sent to the vendor" },
    { es: "Inventario actualizado (98 %)", en: "Inventory updated (98%)" },
    { es: "Reunión mensual agendada", en: "Monthly meeting scheduled" },
    { es: "Recordatorio enviado a 12 clientes", en: "Reminder sent to 12 customers" },
    { es: "Reprogramación gestionada: L. Vega", en: "Reschedule handled: L. Vega" },
    { es: "Contrato de limpieza marcado para revisión", en: "Cleaning contract flagged for review" },
  ],
};
function ActivityLog({ bot, lang }: { bot: Bot; lang: Lang }) {
  const t = tx(lang);
  const [lines, setLines] = React.useState<{ t: string; m: string }[]>([]);
  React.useEffect(() => {
    const pool = LOG_POOL[bot.screen].map((p) => pick(lang, p));
    const started = lang === "es" ? "Sesión iniciada" : "Session started";
    let i = 0;
    setLines([{ t: nowS(lang), m: `${started} · ${bot.name.toLowerCase()}-ws-01` }]);
    const push = () => setLines((l) => [{ t: nowS(lang), m: pool[i++ % pool.length] }, ...l].slice(0, 12));
    const id = window.setInterval(push, 3200 + Math.random() * 1500);
    const first = window.setTimeout(push, 900);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, [bot, lang]);
  return (
    <div className={s.log}>
      <div className={s.logH}>{t("Registro de actividad", "Activity log")}</div>
      {lines.map((l, i) => (
        <div key={l.t + i} className={s.logLine}>
          <time>{l.t}</time>
          <span>{l.m}</span>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ frame ----
const APP: Record<Bot["screen"], { name: string; doc: string; dock: number; letter: string; cursor: [number, number][]; toast?: [string, string, Pair] }> = {
  support: { name: "Zendesk", doc: "mindfultech.zendesk.com/agent/tickets", dock: 4, letter: "Z", cursor: [[430, 300], [700, 420], [820, 505], [300, 180]], toast: ["#03363d", "Zendesk", { es: "Nuevo ticket asignado · #4827", en: "New ticket assigned · #4827" }] },
  sales: { name: "HubSpot", doc: "app.hubspot.com/sales/deals/board", dock: 4, letter: "H", cursor: [[300, 240], [520, 260], [860, 400], [890, 505]], toast: ["#ff7a59", "HubSpot", { es: "Grupo Andino abrió tu correo", en: "Grupo Andino opened your email" }] },
  social: { name: "Meta Business Suite", doc: "business.facebook.com/latest/planner", dock: 4, letter: "M", cursor: [[520, 300], [800, 380], [880, 505], [640, 200]], toast: ["#1877f2", "Instagram", { es: "63 comentarios nuevos en tu reel", en: "63 new comments on your reel" }] },
  dev: { name: "Visual Studio Code", doc: "shop — coupon.ts", dock: 6, letter: "</>", cursor: [[500, 200], [560, 260], [420, 470], [720, 480]], toast: ["#24292f", "GitHub", { es: "CI verde en PR #482 ✓", en: "CI green on PR #482 ✓" }] },
  finance: { name: "Google Sheets", doc: "docs.google.com/spreadsheets/d/1kX…/edit", dock: 5, letter: "≣", cursor: [[760, 290], [780, 330], [420, 200], [760, 420]], toast: ["#0f9d58", "Google Sheets", { es: "Camila editó 6 celdas", en: "Camila edited 6 cells" }] },
  procurement: { name: "Microsoft Excel", doc: "Seguimiento Proveedores.xlsx", dock: 5, letter: "X", cursor: [[760, 300], [860, 340], [420, 220], [860, 460]], toast: ["#217346", "Outlook", { es: "Proveedor respondió: OC072592 confirmada", en: "Supplier replied: PO072592 confirmed" }] },
  ops: { name: "WhatsApp Business", doc: "web.whatsapp.com", dock: 3, letter: "W", cursor: [[640, 500], [560, 380], [200, 300], [840, 500]], toast: ["#25d366", "WhatsApp", { es: "Luis Vega: ¿Pueden mover mi cita?", en: "Luis Vega: Can you move my appointment?" }] },
};

function Screen({ bot, lang, big }: { bot: Bot; lang: Lang; big?: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0.44);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 1000));
    ro.observe(el);
    setScale(el.clientWidth / 1000);
    return () => ro.disconnect();
  }, []);
  const tick = useTick(9000);
  const app = APP[bot.screen];
  const showToast = tick % 3 === 1;
  const body =
    bot.screen === "support" ? (
      <Zendesk bot={bot} lang={lang} />
    ) : bot.screen === "sales" ? (
      <HubSpot bot={bot} lang={lang} />
    ) : bot.screen === "social" ? (
      <MetaSuite bot={bot} lang={lang} />
    ) : bot.screen === "dev" ? (
      <VSCode lang={lang} />
    ) : bot.screen === "finance" ? (
      <Sheets lang={lang} />
    ) : bot.screen === "procurement" ? (
      <Procurement lang={lang} />
    ) : (
      <WhatsApp bot={bot} lang={lang} />
    );
  return (
    <div className={s.viewport} ref={ref} style={big ? { borderRadius: 12 } : undefined}>
      <div className={s.desktop} style={{ transform: `scale(${scale})` }}>
        <Desktop
          app={app.letter}
          appName={app.name}
          doc={app.doc}
          dock={app.dock}
          cursor={app.cursor}
          lang={lang}
          toast={
            showToast && app.toast ? (
              <div className={s.toast}>
                <span className={s.ico} style={{ background: app.toast[0] }}>
                  {app.toast[1][0]}
                </span>
                <div>
                  <b>{app.toast[1]}</b>
                  <span>{pick(lang, app.toast[2])}</span>
                </div>
              </div>
            ) : null
          }
        >
          {body}
        </Desktop>
      </div>
    </div>
  );
}

export function BotScreen({ bot, lang }: { bot: Bot; lang: Lang }) {
  const t = tx(lang);
  const tick = useTick(1000);
  const [big, setBig] = React.useState(false);
  const ms = 9 + ((tick * 7) % 9);
  const bar = (
    <div className={s.bar}>
      <span className={s.live} />
      <span>VNC · {bot.name.toLowerCase()}-ws-01</span>
      <span style={{ color: "#5b6270" }}>1440×900 · 60 fps</span>
      <em>
        {ms} ms · {t("cifrado", "encrypted")}
      </em>
      <button type="button" className={s.expand} onClick={() => setBig((b) => !b)}>
        {big ? t("Cerrar", "Close") : t("Ampliar ⤢", "Expand ⤢")}
      </button>
    </div>
  );
  return (
    <div className={s.wrap}>
      <div className={s.frame}>
        {bar}
        <Screen bot={bot} lang={lang} />
      </div>
      <ActivityLog bot={bot} lang={lang} />
      {big &&
        createPortal(
          <div className={s.modal} onClick={() => setBig(false)}>
            <div className={s.modalInner} onClick={(e) => e.stopPropagation()}>
              <button type="button" className={s.modalClose} onClick={() => setBig(false)}>
                {t("Cerrar", "Close")} ×
              </button>
              <div className={s.frame}>
                {bar}
                <Screen bot={bot} lang={lang} big />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
