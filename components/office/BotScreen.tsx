"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import type { Bot } from "@/lib/office/bots";
import s from "./screen.module.css";

/**
 * The employee's remote desktop, drawn like the real thing: a macOS-style
 * workstation with a menu bar, a dock, and one real-looking app window per
 * role (Zendesk, HubSpot, Meta Business Suite, VS Code, Google Sheets,
 * WhatsApp Business). The app types, clicks and updates on its own; the
 * cursor moves between real targets. Laid out at 1000×625 and scaled to fit,
 * with an "Ampliar" button that shows it full size.
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

const now = () => new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
const nowS = () => new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
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

function Desktop({ app, appName, doc, dock, children, toast, cursor }: { app: string; appName: string; doc: string; dock: number; children: React.ReactNode; toast?: React.ReactNode; cursor: [number, number][] }) {
  const tick = useTick(1000);
  const DOCK = [
    ["🔵", "Finder", "#3b82f6"],
    ["✉️", "Mail", "#60a5fa"],
    ["🗓", "Calendario", "#ef4444"],
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
        <span>Archivo</span>
        <span>Editar</span>
        <span>Ver</span>
        <span>Ventana</span>
        <span>Ayuda</span>
        <span className={s.right}>
          <span>◔ 92 %</span>
          <span>⌔ Wi-Fi</span>
          <span>{new Date().toLocaleDateString("es-EC", { weekday: "short", day: "numeric", month: "short" })}</span>
          <span>{now()}</span>
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
const TICKETS = [
  { id: "#4821", sub: "No puedo descargar mi factura de agosto", req: "Carolina Ríos", org: "López y Asociados", pri: "Alta", ago: "hace 12 min", st: "Abierto" },
  { id: "#4822", sub: "Cambio de plan mensual a anual", req: "Luis Andrade", org: "Distribuidora Norte", pri: "Normal", ago: "hace 25 min", st: "Abierto" },
  { id: "#4823", sub: "Error al pagar con tarjeta (código 05)", req: "Paula Mena", org: "Hotel Casa Gangotena", pri: "Urgente", ago: "hace 31 min", st: "Abierto" },
  { id: "#4824", sub: "¿Cómo agrego usuarios a mi cuenta?", req: "Diego Salazar", org: "Clínica San Marcos", pri: "Baja", ago: "hace 1 h", st: "Abierto" },
  { id: "#4825", sub: "Reembolso del pedido 1193", req: "Marcela Toro", org: "Coop. 29 de Octubre", pri: "Alta", ago: "hace 2 h", st: "Escalado" },
  { id: "#4826", sub: "La app no carga en Android 14", req: "Andrés Paz", org: "Logística del Pacífico", pri: "Normal", ago: "hace 2 h", st: "Abierto" },
];
const REPLIES = [
  "Hola Carolina,\n\nRevisé tu cuenta: la factura de agosto no se generó por un cambio de RUC el 30/08. Ya la regeneré con los datos correctos; puedes descargarla desde Facturación › Historial o directamente aquí:\nhttps://app.mindfultech.ec/f/8821\n\nQuedo atento por si necesitas algo más.\n\nMateo · Soporte MindfulTech",
  "Hola Luis,\n\nListo: migré tu plan a la modalidad anual. Se aplicó el 15 % de descuento y el próximo cobro será el 12 de octubre de 2027 por $1.020 + IVA. Te envié la factura proforma por correo.\n\n¿Algo más en lo que pueda ayudarte?\n\nMateo · Soporte MindfulTech",
  "Hola Paula,\n\nEl pago fue rechazado por el banco emisor (código 05: no autorizado). Te dejé un enlace de pago alternativo, válido por 24 h:\nhttps://pago.mindfultech.ec/x/7ad2\n\nSi vuelve a fallar, lo escalo con prioridad a nuestro equipo de pagos.\n\nMateo · Soporte MindfulTech",
];
const PRI: Record<string, string> = { Urgente: "#dc2626", Alta: "#ea580c", Normal: "#2563eb", Baja: "#6b7280" };
function Zendesk({ bot }: { bot: Bot }) {
  const { text, index, done } = useTyper(REPLIES, 34, 2600);
  const active = index % 3;
  const t = TICKETS[active];
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
        <div className={s.sideH}>Vistas</div>
        <div className={`${s.sideItem} ${s.on}`}>
          Tus tickets sin resolver <em>{6 - active}</em>
        </div>
        <div className={s.sideItem}>
          Sin asignar <em>2</em>
        </div>
        <div className={s.sideItem}>
          Escalados <em>1</em>
        </div>
        <div className={s.sideItem}>
          Resueltos hoy <em>{127 + active}</em>
        </div>
        <div className={s.sideH} style={{ marginTop: 10 }}>
          Etiquetas
        </div>
        {["facturación", "pagos", "cuenta", "app-android"].map((tg) => (
          <div key={tg} className={s.sideItem}>
            # {tg}
          </div>
        ))}
      </div>
      <div className={s.main}>
        <div className={s.topbar}>
          <h1>Tickets sin resolver</h1>
          <span className={s.tag}>Ordenado por prioridad</span>
          <span className={s.search}>🔍 Buscar tickets, usuarios…</span>
          <Avatar name={bot.name + " " + bot.role} />
        </div>
        <div className={s.body}>
          <div className={s.zdList}>
            {TICKETS.map((tk, i) => {
              const resolved = i < active;
              return (
                <div key={tk.id} className={`${s.ticket} ${i === active ? s.on : ""}`}>
                  <span className={s.st} style={{ background: resolved ? "#22c55e" : tk.st === "Escalado" ? "#f59e0b" : "#ef4444" }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className={s.sub}>
                      {tk.id} · {tk.sub}
                    </div>
                    <div className={s.req}>
                      {tk.req} · {tk.org} · {resolved ? "Resuelto" : tk.ago}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={s.zdThread}>
            <div className={s.zdHead}>
              <h2>
                {t.id} · {t.sub}
              </h2>
              <div className={s.zdMeta}>
                <span className={s.tag} style={{ background: PRI[t.pri] + "22", color: PRI[t.pri] }}>
                  {t.pri}
                </span>
                <span className={s.tag}>{done ? "Resuelto" : "Abierto"}</span>
                <span>Solicitante: {t.req}</span>
                <span>· {t.org}</span>
                <span>· SLA 2 h</span>
              </div>
            </div>
            <div className={s.msg}>
              <Avatar name={t.req} size={30} />
              <div className={s.body2}>
                <span className={s.who}>{t.req}</span>
                <span className={s.when}>{t.ago}</span>
                <div>Hola, {t.sub.toLowerCase()}. ¿Me pueden ayudar, por favor? Lo necesito para cerrar el mes. Gracias.</div>
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
                <span style={{ marginLeft: "auto" }}>Respuesta pública ▾</span>
              </div>
              <div className={s.editorBody}>
                <div className={s.typing}>
                  {text}
                  {!done && <span className={s.caret} />}
                </div>
              </div>
              <div className={s.editorFoot}>
                <span className={s.btn + " " + s.ghost}>Macros ▾</span>
                <span style={{ marginLeft: "auto", color: "#6b7280" }}>{done ? "Enviado · ticket resuelto ✓" : "Borrador guardado"}</span>
                <span className={s.btn} style={{ background: done ? "#16a34a" : "#1f73b7" }}>
                  Enviar como Resuelto ▾
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const STAGES = ["Cita programada", "Presentación", "Propuesta enviada", "Negociación", "Cerrado ganado"];
const DEALS = [
  ["Grupo Andino", 18400, "12 oct", 2],
  ["Farmacias Cruz", 9900, "3 oct", 3],
  ["Coop. 29 de Octubre", 6200, "18 oct", 1],
  ["Logística del Pacífico", 12750, "25 oct", 2],
  ["Hotel Casa Gangotena", 4100, "30 oct", 0],
  ["Clínica San Marcos", 7800, "9 oct", 1],
  ["Distribuidora Norte", 3300, "14 nov", 0],
  ["Universidad del Valle", 15200, "5 nov", 3],
  ["Ferretería Central", 2600, "20 oct", 4],
] as const;
const MAILS = [
  "Hola Diego,\n\nVi que revisaron la propuesta ayer. Te propongo una llamada de 20 minutos el jueves a las 10:00 para resolver dudas sobre la fase de implementación y el cronograma.\n\n¿Te viene bien?\n\nSofía · Ventas MindfulTech",
  "Hola Andrea,\n\nAdjunto la cotización actualizada con el descuento por pago anual (12 %). Incluye onboarding, capacitación y soporte prioritario durante 6 meses.\n\nQuedo atenta,\nSofía",
];
function HubSpot({ bot }: { bot: Bot }) {
  const tick = useTick(3000);
  const { text } = useTyper(MAILS, 30, 2800);
  const moved = tick % DEALS.length; // one deal moves a stage forward
  const fmt = (n: number) => "$" + n.toLocaleString("es-EC");
  return (
    <div className={s.main}>
      <div className={s.hsNav}>
        <b>
          <span style={{ color: "#ff7a59" }}>⬢</span> HubSpot
        </b>
        <span>Contactos</span>
        <span className={s.on}>Negocios</span>
        <span>Conversaciones</span>
        <span>Marketing</span>
        <span>Informes</span>
        <span style={{ marginLeft: "auto" }}>🔍</span>
        <Avatar name={bot.name + " V"} size={24} />
      </div>
      <div className={s.topbar} style={{ background: "#f5f8fa" }}>
        <h1>Pipeline de ventas · Q4</h1>
        <span className={s.tag}>Tablero</span>
        <span className={s.tag} style={{ background: "#fff" }}>
          Lista
        </span>
        <span className={s.btn} style={{ marginLeft: "auto", background: "#ff7a59" }}>
          Crear negocio
        </span>
      </div>
      <div className={s.body}>
        <div className={s.board}>
          {STAGES.map((st, si) => {
            const items = DEALS.map((d, i) => ({ d, i, stage: Math.min(4, d[3] + (i === moved ? 1 : 0)) })).filter((x) => x.stage === si);
            const total = items.reduce((a, x) => a + x.d[1], 0);
            return (
              <div key={st} className={s.stage}>
                <div className={s.stageH}>
                  {st}
                  <small>
                    {items.length} negocios · {fmt(total)}
                  </small>
                </div>
                {items.map(({ d, i }) => (
                  <div key={d[0]} className={`${s.deal} ${i === moved ? s.hot : ""}`}>
                    <b>{d[0]}</b>
                    <span>
                      {fmt(d[1])} · cierre {d[2]}
                    </span>
                    <span>Propietaria: {bot.name}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div className={s.composer} style={{ width: 260 }}>
          <div className={s.topbar} style={{ height: 40 }}>
            <h1 style={{ fontSize: 13 }}>Correo · {DEALS[moved][0]}</h1>
          </div>
          <div style={{ padding: "10px 12px", fontSize: 12, color: "#516f90" }}>
            Para: <b style={{ color: "#33475b" }}>contacto@{DEALS[moved][0].toLowerCase().replace(/[^a-z]/g, "")}.ec</b>
          </div>
          <div style={{ padding: "0 12px" }} className={s.typing}>
            {text}
            <span className={s.caret} />
          </div>
          <div className={s.editorFoot} style={{ marginTop: "auto" }}>
            <span className={s.btn} style={{ background: "#ff7a59" }}>
              Enviar
            </span>
            <span style={{ color: "#7c98b6" }}>Secuencia: seguimiento 3 días</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const POSTS = [
  "🚀 Lanzamos la nueva versión de la app con reportes en tiempo real. Menos hojas de cálculo, más decisiones. Link en bio 👇 #producto #ecuador #pymes",
  "¿Sabías que el 63 % de los clientes prefiere resolver dudas por chat? Así atendemos nosotros, 24/7 y en menos de un minuto ✨ #atencionalcliente",
  "Detrás de cámaras: cómo nuestro equipo de IA prepara el contenido de la semana en 2 horas. Hilo 🧵👇",
];
const NET = { ig: ["#e1306c", "IG"], fb: ["#1877f2", "FB"], li: ["#0a66c2", "IN"], tt: ["#111", "TT"] } as const;
const PLANNED: [number, number, keyof typeof NET, string][] = [
  [0, 1, "ig", "Lanzamiento app"], [0, 6, "li", "Caso Grupo Andino"], [1, 3, "tt", "Reel: 24/7"], [2, 1, "ig", "Carrusel checkout"], [3, 5, "li", "Webinar jueves"], [4, 2, "ig", "Detrás de cámaras"], [4, 7, "fb", "Promo octubre"], [5, 3, "ig", "Testimonio"],
];
function MetaSuite({ bot }: { bot: Bot }) {
  const { text, index } = useTyper(POSTS, 28, 2800);
  const days = ["Lun 29", "Mar 30", "Mié 1", "Jue 2", "Vie 3", "Sáb 4", "Dom 5"];
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
  const nets = ["ig", "li", "tt"] as const;
  return (
    <>
      <div className={s.side} style={{ width: 190, background: "#f9fafb" }}>
        <div style={{ fontWeight: 700, fontSize: 14, padding: "4px 8px 12px", color: "#1877f2" }}>Meta Business Suite</div>
        {["Inicio", "Notificaciones", "Planificador", "Contenido", "Bandeja de entrada", "Insights", "Anuncios", "Configuración"].map((it, i) => (
          <div key={it} className={`${s.sideItem} ${i === 2 ? s.on : ""}`}>
            {it}
            {i === 4 && <em>7</em>}
          </div>
        ))}
      </div>
      <div className={s.main}>
        <div className={s.topbar}>
          <h1>Planificador · esta semana</h1>
          <span className={s.tag}>Instagram</span>
          <span className={s.tag}>Facebook</span>
          <span className={s.tag}>LinkedIn</span>
          <span className={s.tag}>TikTok</span>
          <span className={s.btn} style={{ marginLeft: "auto", background: "#1877f2" }}>
            + Crear publicación
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
                          {NET[p[2]][1]} · {p[3]}
                        </div>
                      )}
                      {draft && (
                        <div className={s.post} style={{ background: "#fff", color: "#1877f2", border: "1px dashed #1877f2" }}>
                          {NET[nets[index % 3]][1]} · Borrador…
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
              <h1 style={{ fontSize: 13 }}>Nueva publicación · {NET[nets[index % 3]][1] === "IG" ? "Instagram" : NET[nets[index % 3]][1] === "IN" ? "LinkedIn" : "TikTok"}</h1>
            </div>
            <div className={s.media} style={{ background: ["linear-gradient(135deg,#667eea,#764ba2)", "linear-gradient(135deg,#f093fb,#f5576c)", "linear-gradient(135deg,#43e97b,#38f9d7)"][index % 3] }}>
              {["Nueva app", "Chat 24/7", "Backstage"][index % 3]}
            </div>
            <div style={{ padding: "10px 12px" }} className={s.typing}>
              {text}
              <span className={s.caret} />
            </div>
            <div style={{ padding: "0 12px", fontSize: 11, color: "#6b7280" }}>{text.length}/2200 · 4 hashtags</div>
            <div className={s.editorFoot} style={{ marginTop: "auto" }}>
              <span className={s.btn + " " + s.ghost}>Vista previa</span>
              <span className={s.btn} style={{ marginLeft: "auto", background: "#1877f2" }}>
                Programar · mié 12:00
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
function VSCode() {
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
          <div style={{ fontWeight: 700, fontSize: 11, color: "#bbb" }}>EXPLORADOR · SHOP</div>
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
function Sheets() {
  const tick = useTick(1200);
  const n = tick % (ROWS.length + 4);
  const total = ROWS.slice(0, Math.min(n, ROWS.length)).reduce((a, r) => a + r[2], 0);
  const money = (v: number) => v.toLocaleString("es-EC", { minimumFractionDigits: 2 });
  return (
    <div className={s.sh}>
      <div className={s.shTop}>
        <span className={s.shLogo}>≣</span>
        <div>
          <div className={s.shTitle}>Conciliación bancaria · septiembre 2026 ☆ ⛭</div>
          <div className={s.shMenu}>
            {["Archivo", "Editar", "Ver", "Insertar", "Formato", "Datos", "Herramientas", "Extensiones", "Ayuda"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
        <span className={s.tag} style={{ marginLeft: "auto", background: "#e6f4ea", color: "#137333" }}>
          ● Guardado en Drive
        </span>
        <span className={s.btn} style={{ background: "#c2e7ff", color: "#001d35" }}>
          Compartir
        </span>
      </div>
      <div className={s.shTools}>
        <span>↶ ↷ 🖨</span>
        <span>100 % ▾</span>
        <span>$ % .0 .00 123</span>
        <span>Arial ▾</span>
        <span>10 ▾</span>
        <span>B I S A</span>
        <span>⊞ ⊟</span>
      </div>
      <div className={s.shFormula}>
        <span className={s.cell}>F{Math.min(n, ROWS.length) + 1}</span>
        <span className={s.fx}>fx =SI(CONTAR.SI(Banco!C:C;C{Math.min(n, ROWS.length) + 1})&gt;0;"Conciliado";"Revisar")</span>
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
            {["Factura", "Cliente", "Monto", "Banco", "Fecha", "Estado"].map((h) => (
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
              <td>{i <= n ? r[4] : ""}</td>
              <td className={`${i === n ? s.sel : ""} ${i < n ? s.ok : i === n ? s.warn : ""}`}>{i < n ? "Conciliado" : i === n ? "Revisar…" : ""}</td>
            </tr>
          ))}
          <tr>
            <th>{ROWS.length + 2}</th>
            <td />
            <td style={{ fontWeight: 600 }}>Total conciliado</td>
            <td className={s.num} style={{ fontWeight: 600 }}>
              {money(total)}
            </td>
            <td colSpan={3} />
          </tr>
        </tbody>
      </table>
      <div className={s.shTabs}>
        <div>+ ≡</div>
        <div className={s.on}>Septiembre</div>
        <div>Octubre</div>
        <div>Banco</div>
        <div>Resumen</div>
      </div>
    </div>
  );
}

const CHATS = [
  ["Gabriela Mora", "16:30 por favor", "10:42", 0],
  ["Luis Vega", "¿Pueden mover mi cita al viernes?", "10:31", 2],
  ["Proveedor Andina", "Pedido #7731 despachado ✅", "09:58", 0],
  ["Dra. Paredes", "Confirmado, gracias", "09:40", 0],
  ["María José R.", "Hola, ¿tienen turno hoy?", "09:12", 1],
  ["Carlos Enríquez", "Ok perfecto", "ayer", 0],
] as const;
const WA: [string, string][] = [
  ["in", "Hola, ¿tienen turno mañana en la tarde?"],
  ["out", "¡Hola Gabriela! Sí, tengo 15:00 y 16:30 disponibles con la Dra. Paredes. ¿Cuál prefieres?"],
  ["in", "16:30 por favor"],
  ["out", "Listo ✅ Cita confirmada para mañana 16:30. Te envío un recordatorio 2 h antes. Dirección: Av. República 234, piso 3."],
  ["in", "¡Gracias!"],
  ["out", "¡A ti! Que tengas buen día 🙌"],
];
function WhatsApp({ bot }: { bot: Bot }) {
  const tick = useTick(1600);
  const n = tick % (WA.length + 3);
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
            🔍 Buscar un chat
          </span>
        </div>
        {CHATS.map((c, i) => (
          <div key={c[0]} className={`${s.waChat} ${i === 0 ? s.on : ""}`}>
            <Avatar name={c[0]} size={40} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex" }}>
                <b>{c[0]}</b>
                <span className={s.time}>{c[2]}</span>
              </div>
              <div className={s.last}>{i === 0 ? WA[Math.min(n, WA.length) - 1]?.[1] ?? c[1] : c[1]}</div>
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
            <div style={{ fontSize: 11, color: "#54656f" }}>{n < WA.length && WA[n][0] === "in" ? "escribiendo…" : "en línea"}</div>
          </div>
          <span style={{ marginLeft: "auto", color: "#54656f" }}>📞 🎥 ⋮</span>
        </div>
        <div className={s.waMsgs}>
          <div className={s.tag} style={{ alignSelf: "center", background: "#fff" }}>
            HOY
          </div>
          {WA.slice(0, n).map(([d, t], i) => (
            <div key={i} className={`${s.bubble} ${d === "out" ? s.out : ""}`}>
              {t}
              <span className={s.meta}>
                {now()}
                {d === "out" && <b>✓✓</b>}
              </span>
            </div>
          ))}
          {n < WA.length && WA[n][0] === "out" && (
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
          <span className={s.field}>{n < WA.length && WA[n][0] === "out" ? WA[n][1].slice(0, Math.max(0, Math.floor((Date.now() / 60) % WA[n][1].length))) : "Escribe un mensaje"}</span>
          <span>🎤</span>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ activity log ----
const LOG_POOL: Record<Bot["screen"], string[]> = {
  sales: ["Lead calificado: Hotel Casa Gangotena (score 74)", "Email de seguimiento enviado a Grupo Andino", "Reunión agendada: jueves 10:00", "Pipeline actualizado en HubSpot", "Lead duplicado fusionado", "Propuesta generada (PDF, 6 págs.)", "Llamada resumida y guardada en el CRM"],
  support: ["Ticket #4821 resuelto en 38 s", "Artículo de ayuda actualizado", "Ticket #4825 escalado a humano", "CSAT recibido: 5/5", "Respuesta enviada por WhatsApp", "Reembolso de $42 procesado", "Ticket #4826 asignado"],
  social: ["Post programado: Instagram · mañana 09:00", "63 comentarios respondidos", "Carrusel exportado (5 slides)", "Reporte de campaña actualizado", "Hashtags optimizados (+12 % alcance est.)", "Mención en LinkedIn respondida", "Reel subido a borradores"],
  dev: ["Tests: 248 passed", "PR #482 abierto para revisión", "Deploy a staging completado (41 s)", "Dependencia actualizada: next 15.5.20", "Lint sin errores", "Alerta de seguridad cerrada (CVE-2026-1183)", "Índice de base de datos creado"],
  finance: ["Factura F-001-2292 conciliada", "Factura electrónica autorizada por el SRI", "Recordatorio de cobro enviado (F-001-2280)", "Pago a proveedor programado: viernes", "Flujo de caja recalculado", "Gasto categorizado: software ($129)", "Reporte mensual exportado a PDF"],
  ops: ["Cita confirmada: G. Mora · mañana 16:30", "Pedido de insumos enviado al proveedor", "Inventario actualizado (98 %)", "Reunión mensual agendada", "Recordatorio enviado a 12 clientes", "Reprogramación gestionada: L. Vega", "Contrato de limpieza marcado para revisión"],
};
function ActivityLog({ bot }: { bot: Bot }) {
  const [lines, setLines] = React.useState<{ t: string; m: string }[]>([]);
  React.useEffect(() => {
    const pool = LOG_POOL[bot.screen];
    let i = 0;
    setLines([{ t: nowS(), m: `Sesión iniciada · ${bot.name.toLowerCase()}-ws-01` }]);
    const push = () => setLines((l) => [{ t: nowS(), m: pool[i++ % pool.length] }, ...l].slice(0, 12));
    const id = window.setInterval(push, 3200 + Math.random() * 1500);
    const first = window.setTimeout(push, 900);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, [bot]);
  return (
    <div className={s.log}>
      <div className={s.logH}>Registro de actividad</div>
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
const APP: Record<Bot["screen"], { name: string; doc: string; dock: number; letter: string; cursor: [number, number][]; toast?: [string, string, string] }> = {
  support: { name: "Zendesk", doc: "mindfultech.zendesk.com/agent/tickets", dock: 4, letter: "Z", cursor: [[430, 300], [700, 420], [820, 505], [300, 180]], toast: ["#03363d", "Zendesk", "Nuevo ticket asignado · #4827"] },
  sales: { name: "HubSpot", doc: "app.hubspot.com/sales/deals/board", dock: 4, letter: "H", cursor: [[300, 240], [520, 260], [860, 400], [890, 505]], toast: ["#ff7a59", "HubSpot", "Grupo Andino abrió tu correo"] },
  social: { name: "Meta Business Suite", doc: "business.facebook.com/latest/planner", dock: 4, letter: "M", cursor: [[520, 300], [800, 380], [880, 505], [640, 200]], toast: ["#1877f2", "Instagram", "63 comentarios nuevos en tu reel"] },
  dev: { name: "Visual Studio Code", doc: "shop — coupon.ts", dock: 6, letter: "</>", cursor: [[500, 200], [560, 260], [420, 470], [720, 480]], toast: ["#24292f", "GitHub", "CI verde en PR #482 ✓"] },
  finance: { name: "Google Sheets", doc: "docs.google.com/spreadsheets/d/1kX…/edit", dock: 5, letter: "≣", cursor: [[760, 290], [780, 330], [420, 200], [760, 420]], toast: ["#0f9d58", "Google Sheets", "Camila editó 6 celdas"] },
  ops: { name: "WhatsApp Business", doc: "web.whatsapp.com", dock: 3, letter: "W", cursor: [[640, 500], [560, 380], [200, 300], [840, 500]], toast: ["#25d366", "WhatsApp", "Luis Vega: ¿Pueden mover mi cita?"] },
};

function Screen({ bot, big }: { bot: Bot; big?: boolean }) {
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
    bot.screen === "support" ? <Zendesk bot={bot} /> : bot.screen === "sales" ? <HubSpot bot={bot} /> : bot.screen === "social" ? <MetaSuite bot={bot} /> : bot.screen === "dev" ? <VSCode /> : bot.screen === "finance" ? <Sheets /> : <WhatsApp bot={bot} />;
  return (
    <div className={s.viewport} ref={ref} style={big ? { borderRadius: 12 } : undefined}>
      <div className={s.desktop} style={{ transform: `scale(${scale})` }}>
        <Desktop
          app={app.letter}
          appName={app.name}
          doc={app.doc}
          dock={app.dock}
          cursor={app.cursor}
          toast={
            showToast && app.toast ? (
              <div className={s.toast}>
                <span className={s.ico} style={{ background: app.toast[0] }}>
                  {app.toast[1][0]}
                </span>
                <div>
                  <b>{app.toast[1]}</b>
                  <span>{app.toast[2]}</span>
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

export function BotScreen({ bot }: { bot: Bot }) {
  const tick = useTick(1000);
  const [big, setBig] = React.useState(false);
  const ms = 9 + ((tick * 7) % 9);
  const bar = (
    <div className={s.bar}>
      <span className={s.live} />
      <span>VNC · {bot.name.toLowerCase()}-ws-01</span>
      <span style={{ color: "#5b6270" }}>1440×900 · 60 fps</span>
      <em>{ms} ms · cifrado</em>
      <button type="button" className={s.expand} onClick={() => setBig((b) => !b)}>
        {big ? "Cerrar" : "Ampliar ⤢"}
      </button>
    </div>
  );
  return (
    <div className={s.wrap}>
      <div className={s.frame}>
        {bar}
        <Screen bot={bot} />
      </div>
      <ActivityLog bot={bot} />
      {big &&
        createPortal(
          <div className={s.modal} onClick={() => setBig(false)}>
            <div className={s.modalInner} onClick={(e) => e.stopPropagation()}>
              <button type="button" className={s.modalClose} onClick={() => setBig(false)}>
                Cerrar ×
              </button>
              <div className={s.frame}>
                {bar}
                <Screen bot={bot} big />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
