"use client";

import * as React from "react";
import type { Bot } from "@/lib/office/bots";
import s from "./office.module.css";

/**
 * The "remote desktop" of a bot: a fake VNC frame with a role-specific app
 * that types, clicks and updates on its own, plus an activity log underneath.
 * Everything is a timer — the demo only has to look alive.
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
function useTyper(scripts: string[], cps = 28, pause = 2200) {
  const [i, setI] = React.useState(0);
  const [n, setN] = React.useState(0);
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    setI(0);
    setN(0);
    setDone(false);
  }, [scripts]);
  React.useEffect(() => {
    const text = scripts[i % scripts.length] ?? "";
    if (n < text.length) {
      const id = window.setTimeout(() => setN(n + 1), 1000 / cps + (text[n] === " " ? 20 : 0));
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

const now = () => new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

function Cursor() {
  const tick = useTick(1700);
  const pos = React.useMemo(() => ({ left: 15 + Math.random() * 70, top: 15 + Math.random() * 65 }), [tick]);
  return (
    <svg className={s.cursor} style={{ left: `${pos.left}%`, top: `${pos.top}%` }} viewBox="0 0 12 16" aria-hidden>
      <path d="M1 1 L1 12.5 L4 9.8 L6.2 14.6 L8.4 13.6 L6.3 9 L10.5 9 Z" fill="#fff" stroke="#111" strokeWidth="1" />
    </svg>
  );
}

function Window({ title, app, children, accent }: { title: string; app: string; children: React.ReactNode; accent: string }) {
  return (
    <div className={s.win}>
      <div className={s.winBar}>
        <i style={{ background: "#ff5f57" }} />
        <i style={{ background: "#febc2e" }} />
        <i style={{ background: "#28c840" }} />
        <b>{app}</b>
        <span style={{ color: "#6b7280" }}>· {title}</span>
        <span className={`${s.tag} ${s.tagAcc}`} style={{ marginLeft: "auto", ["--c" as string]: accent }}>
          agente activo
        </span>
      </div>
      <div className={s.winBody}>{children}</div>
    </div>
  );
}

// ------------------------------------------------------------------ apps ----
const SALES_DEALS = [
  ["Grupo Andino", "Propuesta", "$18.400"],
  ["Farmacias Cruz", "Negociación", "$9.900"],
  ["Coop. 29 de Octubre", "Calificado", "$6.200"],
  ["Logística del Pacífico", "Propuesta", "$12.750"],
  ["Hotel Casa Gangotena", "Nuevo", "$4.100"],
  ["Clínica San Marcos", "Calificado", "$7.800"],
  ["Distribuidora Norte", "Nuevo", "$3.300"],
];
const SALES_MAILS = [
  "Hola Diego,\n\nVi que revisaron la propuesta ayer. Te propongo una llamada de 20 minutos el jueves a las 10:00 para resolver dudas sobre la fase de implementación.\n\n¿Te viene bien?\n\nSofía · Ventas",
  "Hola Andrea,\n\nAdjunto la cotización actualizada con el descuento por pago anual (12 %). Incluye onboarding y soporte prioritario.\n\nQuedo atenta,\nSofía",
  "Hola Marcelo,\n\nGracias por tu tiempo hoy. Resumen: 3 sucursales, integración con el ERP y arranque en noviembre. Te envío la propuesta formal mañana antes del mediodía.\n\nSofía",
];
function SalesApp({ bot }: { bot: Bot }) {
  const tick = useTick(2600);
  const { text } = useTyper(SALES_MAILS, 30, 2600);
  const active = tick % SALES_DEALS.length;
  return (
    <Window app="HubSpot" title="Pipeline · Q4" accent={bot.accent}>
      <div className={`${s.col} ${s.colSide}`}>
        <div className={s.h}>Negocios abiertos</div>
        {SALES_DEALS.map(([n, st, v], i) => (
          <div key={n} className={`${s.row} ${i === active ? s.rowActive : ""}`}>
            <span style={{ fontWeight: 500 }}>{n}</span>
            <span className={`${s.tag} ${st === "Negociación" ? s.tagWarn : st === "Nuevo" ? "" : s.tagOk}`}>{st}</span>
            <small>{v}</small>
          </div>
        ))}
      </div>
      <div className={s.col}>
        <div className={s.h}>Redactando seguimiento · {SALES_DEALS[active][0]}</div>
        <div className={s.typing}>
          {text}
          <span className={s.caret} />
        </div>
      </div>
    </Window>
  );
}

const TICKETS = [
  ["#4821", "No puedo descargar mi factura", "Abierto"],
  ["#4822", "Cambio de plan a anual", "Abierto"],
  ["#4823", "Error al pagar con tarjeta", "Abierto"],
  ["#4824", "¿Cómo agrego usuarios?", "Abierto"],
  ["#4825", "Reembolso pedido 1193", "Escalado"],
  ["#4826", "La app no carga en Android", "Abierto"],
];
const REPLIES = [
  "Hola Carolina,\n\nYa revisé tu cuenta: la factura de agosto no se generó por un cambio de RUC. La regeneré y la puedes descargar aquí: mindful.app/f/8821\n\nQuedo atento,\nMateo · Soporte",
  "Hola Luis,\n\nListo, migré tu plan a anual. Se aplicó el descuento del 15 % y el próximo cobro es el 12 de octubre de 2027.\n\n¿Algo más en lo que pueda ayudarte?\nMateo",
  "Hola Paula,\n\nEl pago fue rechazado por el banco emisor (código 05). Te dejé un enlace de pago alternativo válido por 24 h. Si vuelve a fallar, lo escalo con prioridad.\n\nMateo",
];
function SupportApp({ bot }: { bot: Bot }) {
  const { text, index, done } = useTyper(REPLIES, 32, 2400);
  const active = index % TICKETS.length;
  return (
    <Window app="Zendesk" title="Bandeja de soporte" accent={bot.accent}>
      <div className={`${s.col} ${s.colSide}`}>
        <div className={s.h}>Tickets · {TICKETS.length - (index % TICKETS.length)} abiertos</div>
        {TICKETS.map(([id, t, st], i) => {
          const resolved = i < active;
          return (
            <div key={id} className={`${s.row} ${i === active ? s.rowActive : ""}`}>
              <span style={{ color: "#6b7280" }}>{id}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t}</span>
              <span className={`${s.tag} ${resolved ? s.tagOk : st === "Escalado" ? s.tagWarn : ""}`}>{resolved ? "Resuelto" : st}</span>
            </div>
          );
        })}
      </div>
      <div className={s.col}>
        <div className={s.h}>
          {TICKETS[active][0]} · {TICKETS[active][1]}
        </div>
        <div className={s.typing}>
          {text}
          {!done && <span className={s.caret} />}
        </div>
        {done && (
          <div style={{ marginTop: 6 }}>
            <span className={`${s.tag} ${s.tagOk}`}>✓ Enviado · ticket resuelto</span>
          </div>
        )}
      </div>
    </Window>
  );
}

const POSTS = [
  "🚀 Lanzamos la nueva versión de la app con reportes en tiempo real. Menos hojas de cálculo, más decisiones. Link en bio 👇 #producto #ecuador",
  "¿Sabías que el 63 % de los clientes prefiere resolver dudas por chat? Así atendemos nosotros 24/7 ✨ #atencionalcliente",
  "Detrás de cámaras: cómo nuestro equipo de IA prepara el contenido de la semana en 2 horas. Hilo 🧵",
];
function SocialApp({ bot }: { bot: Bot }) {
  const { text, index } = useTyper(POSTS, 26, 2600);
  const tick = useTick(1200);
  const bars = React.useMemo(() => Array.from({ length: 12 }, (_, i) => 30 + ((i * 37 + tick * 11) % 60)), [tick]);
  const nets = ["Instagram", "LinkedIn", "TikTok"];
  return (
    <Window app="Buffer" title="Calendario de contenido" accent={bot.accent}>
      <div className={`${s.col} ${s.colSide}`}>
        <div className={s.h}>Programados esta semana</div>
        {["Lun 09:00 · Instagram", "Lun 17:30 · LinkedIn", "Mar 12:00 · TikTok", "Mié 09:00 · Instagram", "Jue 18:00 · LinkedIn", "Vie 11:00 · Instagram"].map((p, i) => (
          <div key={p} className={`${s.row} ${i === index % 6 ? s.rowActive : ""}`}>
            <span>{p}</span>
            <span className={`${s.tag} ${i < index % 6 ? s.tagOk : ""}`}>{i < index % 6 ? "Listo" : "Borrador"}</span>
          </div>
        ))}
        <div className={s.h} style={{ marginTop: 6 }}>
          Alcance · 7 días
        </div>
        <div className={s.bars}>
          {bars.map((h, i) => (
            <i key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className={s.col}>
        <div className={s.h}>Nuevo post · {nets[index % 3]}</div>
        <div className={s.postCard}>
          <div className={s.postImg} />
          <div className={s.typing}>
            {text}
            <span className={s.caret} />
          </div>
        </div>
        <span className={s.tag}>Programar · mañana 09:00</span>
      </div>
    </Window>
  );
}

const CODE: [string, string][] = [
  ["m", "$ git checkout -b fix/checkout-coupon-case"],
  ["b", "src/checkout/coupon.ts"],
  ["", "  const code = input.trim().toUpperCase();"],
  ["", "  const coupon = await repo.findByCode(code);"],
  ["", "  if (!coupon || coupon.expiresAt < now()) return null;"],
  ["g", "+ test('applies coupon regardless of case', ...)"],
  ["m", "$ npm test -- checkout"],
  ["g", "  ✓ applies coupon regardless of case (18 ms)"],
  ["g", "  ✓ rejects expired coupon (4 ms)"],
  ["g", "  ✓ computes total with discount (7 ms)"],
  ["y", "  Tests: 248 passed, 248 total"],
  ["m", "$ git commit -m 'checkout: coupons are case-insensitive'"],
  ["m", "$ gh pr create --title 'Fix coupon case' --base main"],
  ["b", "  https://github.com/mindfultech/shop/pull/482"],
  ["m", "$ npm run deploy:staging"],
  ["g", "  ✓ deployed to staging in 41 s"],
];
function DevApp({ bot }: { bot: Bot }) {
  const tick = useTick(750);
  const n = (tick % (CODE.length + 4)) + 1;
  return (
    <Window app="VS Code" title="shop · fix/checkout-coupon-case" accent={bot.accent}>
      <div className={s.term}>
        {CODE.slice(0, n).map(([c, l], i) => (
          <div key={i} className={c ? s[c] : undefined}>
            {l}
          </div>
        ))}
        <span className={s.caret} style={{ background: "#d1d5db" }} />
      </div>
    </Window>
  );
}

const ROWS = [
  ["F-001-2291", "Grupo Andino", "2.480,00", "Pichincha"],
  ["F-001-2292", "Farmacias Cruz", "1.190,00", "Produbanco"],
  ["F-001-2293", "Hotel Casa Gangotena", "860,00", "Pichincha"],
  ["F-001-2294", "Clínica San Marcos", "3.250,00", "Guayaquil"],
  ["F-001-2295", "Distribuidora Norte", "540,00", "Pichincha"],
  ["F-001-2296", "Logística del Pacífico", "2.900,00", "Produbanco"],
  ["F-001-2297", "Coop. 29 de Octubre", "1.260,00", "Pichincha"],
];
function FinanceApp({ bot }: { bot: Bot }) {
  const tick = useTick(1100);
  const n = tick % (ROWS.length + 3);
  const total = ROWS.slice(0, n).reduce((a, r) => a + parseFloat(r[2].replace(".", "").replace(",", ".")), 0);
  return (
    <Window app="Google Sheets" title="Conciliación bancaria · septiembre" accent={bot.accent}>
      <div className={s.col}>
        <table className={s.sheet}>
          <thead>
            <tr>
              <th>Factura</th>
              <th>Cliente</th>
              <th className={s.num}>Monto</th>
              <th>Banco</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={r[0]} style={{ background: i === n ? `color-mix(in srgb, ${bot.accent} 18%, #fff)` : undefined }}>
                <td>{r[0]}</td>
                <td>{r[1]}</td>
                <td className={s.num}>${r[2]}</td>
                <td>{i <= n ? r[3] : ""}</td>
                <td>{i < n ? <span className={`${s.tag} ${s.tagOk}`}>Conciliado</span> : i === n ? <span className={`${s.tag} ${s.tagWarn}`}>Revisando…</span> : ""}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={2}>
                <b>Total conciliado</b>
              </td>
              <td className={s.num}>
                <b>${total.toLocaleString("es-EC", { minimumFractionDigits: 2 })}</b>
              </td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
    </Window>
  );
}

const WA = [
  ["in", "Hola, ¿tienen turno mañana en la tarde?"],
  ["out", "¡Hola Gabriela! Sí, tengo 15:00 y 16:30 disponibles. ¿Cuál prefieres?"],
  ["in", "16:30 por favor"],
  ["out", "Listo ✅ Cita confirmada para mañana 16:30 con la Dra. Paredes. Te envío recordatorio 2 h antes."],
  ["in", "Gracias!"],
  ["out", "¡A ti! Que tengas buen día 🙌"],
];
function OpsApp({ bot }: { bot: Bot }) {
  const tick = useTick(1500);
  const n = tick % (WA.length + 3);
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie"];
  return (
    <Window app="WhatsApp Business" title="Agenda y confirmaciones" accent={bot.accent}>
      <div className={`${s.col} ${s.colSide}`}>
        <div className={s.h}>Gabriela Mora · +593 99 ···</div>
        {WA.slice(0, n).map(([d, t], i) => (
          <div key={i} className={`${s.bubble} ${d === "out" ? s.bubbleOut : ""}`}>
            {t}
          </div>
        ))}
        {n < WA.length && WA[n][0] === "out" && (
          <div className={s.dots} style={{ marginLeft: "auto" }}>
            <i />
            <i />
            <i />
          </div>
        )}
      </div>
      <div className={s.col}>
        <div className={s.h}>Google Calendar · esta semana</div>
        <div className={s.cal}>
          {days.map((d, di) => (
            <div key={d} className={s.day}>
              <b>{d}</b>
              {[0, 1, 2].slice(0, 2 + (di % 2)).map((e) => {
                const hi = (di * 3 + e) === tick % 14;
                return (
                  <div key={e} className={`${s.ev} ${hi ? s.evAcc : ""}`}>
                    {["09:00 Grupo Andino", "11:30 Revisión", "15:00 Demo", "16:30 G. Mora"][(di + e) % 4]}
                  </div>
                );
              })}
              {di === 3 && n >= 4 && <div className={`${s.ev} ${s.evAcc}`}>16:30 G. Mora ✓</div>}
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

const APPS: Record<Bot["screen"], (p: { bot: Bot }) => React.JSX.Element> = {
  sales: SalesApp,
  support: SupportApp,
  social: SocialApp,
  dev: DevApp,
  finance: FinanceApp,
  ops: OpsApp,
};

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
    setLines([{ t: now(), m: `Sesión iniciada · ${bot.name.toLowerCase()}-ws-01` }]);
    const push = () => {
      setLines((l) => [{ t: now(), m: pool[i++ % pool.length] }, ...l].slice(0, 12));
    };
    const id = window.setInterval(push, 3200 + Math.random() * 1500);
    const first = window.setTimeout(push, 900);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, [bot]);
  return (
    <div className={s.log}>
      <div className={s.h}>Registro de actividad</div>
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
export function BotScreen({ bot }: { bot: Bot }) {
  const App = APPS[bot.screen];
  const tick = useTick(1000);
  const ms = 9 + ((tick * 7) % 9);
  const clock = new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={s.screenWrap} style={{ ["--c" as string]: bot.accent }}>
      <div className={s.vnc}>
        <div className={s.vncBar}>
          <span className={s.live} />
          <span>VNC · {bot.name.toLowerCase()}-ws-01</span>
          <span style={{ color: "#5b6270" }}>1440×900</span>
          <em>{ms} ms · cifrado</em>
        </div>
        <div className={s.desktop}>
          <App bot={bot} />
          <Cursor />
          <div className={s.taskbar}>
            <i />
            <i />
            <i />
            <i />
            <em>{clock}</em>
          </div>
        </div>
      </div>
      <ActivityLog bot={bot} />
    </div>
  );
}
