"use client";

/**
 * /jev — a SIMULATED demo of TypeSafe's Jev next to a general LLM.
 *
 * Nothing here calls an API: the site is a static export and any key shipped
 * to the browser would be public. Answers are recorded, and the timings are
 * the typical ones: a general LLM streams a paragraph in 2.5–3.5 s, Jev
 * returns typed judgments in ~150 ms. The page says so on screen.
 */

import * as React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useLang } from "@/components/i18n";
import { Pill } from "@/components/internal/Shared";

const MONO = "var(--mono)";
type Bi = { en: string; es: string };

type Sample = {
  id: string;
  from: Bi;
  text: Bi;
  llm: Bi;
  jev: {
    urgent: number;                                   // noul
    intent: { label: Bi; p: number }[];               // choice distribution
    team: "sales" | "support" | "finance" | "reception";
    teamP: number;
    churn: number;                                    // score 0..1
  };
};

const TEAMS: Record<Sample["jev"]["team"], Bi> = {
  sales: { en: "Sales", es: "Ventas" },
  support: { en: "Support", es: "Soporte" },
  finance: { en: "Finance", es: "Finanzas" },
  reception: { en: "Reception", es: "Recepción" },
};

const SAMPLES: Sample[] = [
  {
    id: "payouts",
    from: { en: "Gabriela · WhatsApp", es: "Gabriela · WhatsApp" },
    text: { en: "Hi, my payouts have been failing for 3 days and I have payroll on Friday. Nobody answers the ticket I opened.", es: "Hola, mis pagos llevan 3 días fallando y el viernes tengo nómina. Nadie responde el ticket que abrí." },
    llm: {
      en: "I'm sorry to hear your payouts have been failing. That sounds stressful, especially with payroll coming up on Friday. There are several possible causes, such as a bank verification issue, a limit on your account, or a temporary problem on our side. I recommend checking your account settings, confirming your bank details are up to date, and, if the problem persists, contacting support with the ticket number so they can prioritize it. In the meantime, you might consider an alternative payment method for payroll.",
      es: "Lamento que tus pagos estén fallando. Suena estresante, sobre todo con la nómina el viernes. Puede haber varias causas, como una verificación bancaria pendiente, un límite en la cuenta o un problema temporal de nuestro lado. Te recomiendo revisar la configuración de la cuenta, confirmar que los datos bancarios estén actualizados y, si persiste, contactar a soporte con el número de ticket para que lo prioricen. Mientras tanto, podrías considerar un método de pago alternativo para la nómina.",
    },
    jev: { urgent: 0.94, intent: [{ label: { en: "Report a problem", es: "Reportar un problema" }, p: 0.86 }, { label: { en: "Ask for a refund", es: "Pedir reembolso" }, p: 0.06 }, { label: { en: "Buy or upgrade", es: "Comprar o ampliar" }, p: 0.02 }, { label: { en: "Other", es: "Otro" }, p: 0.06 }], team: "support", teamP: 0.9, churn: 0.71 },
  },
  {
    id: "quote",
    from: { en: "Luis · Contact form", es: "Luis · Formulario" },
    text: { en: "We run 4 dental clinics in Guayaquil. Could you send pricing for the billing agent? We'd like to start next month.", es: "Tenemos 4 clínicas dentales en Guayaquil. ¿Me pasan precios del agente de facturación? Quisiéramos empezar el próximo mes." },
    llm: {
      en: "Thank you for your interest in our billing agent! It's great to hear that you run four dental clinics in Guayaquil. Our pricing depends on the number of locations, monthly claim volume and the systems you use today. Typically, teams your size see a return within the first quarter. I'd be happy to schedule a call to understand your workflow and prepare a tailored proposal. Would sometime next week work for you?",
      es: "¡Gracias por tu interés en nuestro agente de facturación! Qué bueno saber que tienen cuatro clínicas dentales en Guayaquil. El precio depende del número de sedes, el volumen mensual de reclamos y los sistemas que usan hoy. Equipos de su tamaño suelen ver retorno en el primer trimestre. Con gusto agendamos una llamada para entender su flujo y preparar una propuesta a medida. ¿Les viene bien la próxima semana?",
    },
    jev: { urgent: 0.31, intent: [{ label: { en: "Buy or upgrade", es: "Comprar o ampliar" }, p: 0.91 }, { label: { en: "Ask a question", es: "Hacer una pregunta" }, p: 0.06 }, { label: { en: "Report a problem", es: "Reportar un problema" }, p: 0.01 }, { label: { en: "Other", es: "Otro" }, p: 0.02 }], team: "sales", teamP: 0.95, churn: 0.05 },
  },
  {
    id: "invoice",
    from: { en: "Andrea · Email", es: "Andrea · Correo" },
    text: { en: "Invoice #7731 shows 15% VAT but we are VAT-exempt as a foundation. Please reissue it, accounting won't pay it as is.", es: "La factura #7731 tiene IVA del 15 % pero somos fundación exenta. Por favor reemítanla, contabilidad no la pagará así." },
    llm: {
      en: "Thanks for flagging this. If your organization is VAT-exempt, the invoice should indeed reflect that. To reissue invoice #7731, we will need your exemption certificate or tax ID on file, after which the finance team can void the current invoice and issue a corrected one. This usually takes one to two business days. Please reply with the documentation and I'll make sure it gets handled.",
      es: "Gracias por avisar. Si su organización está exenta de IVA, la factura debería reflejarlo. Para reemitir la factura #7731 necesitaremos el certificado de exención o el RUC en el expediente; después el equipo de finanzas anulará la factura actual y emitirá una corregida. Suele tomar uno o dos días hábiles. Respondan con la documentación y me aseguro de que se atienda.",
    },
    jev: { urgent: 0.58, intent: [{ label: { en: "Fix a billing document", es: "Corregir un documento" }, p: 0.88 }, { label: { en: "Report a problem", es: "Reportar un problema" }, p: 0.08 }, { label: { en: "Ask for a refund", es: "Pedir reembolso" }, p: 0.02 }, { label: { en: "Other", es: "Otro" }, p: 0.02 }], team: "finance", teamP: 0.93, churn: 0.22 },
  },
  {
    id: "hours",
    from: { en: "Marco · WhatsApp", es: "Marco · WhatsApp" },
    text: { en: "hey are you open on saturday? need to drop by to sign the contract", es: "hola, abren el sábado? necesito pasar a firmar el contrato" },
    llm: {
      en: "Hello! Thanks for reaching out. Our regular office hours are Monday to Friday, 9:00 to 18:00. We are usually closed on Saturdays, but for signing a contract we may be able to arrange a time. Could you let me know which Saturday and roughly what time you have in mind? I'll check with the team and confirm.",
      es: "¡Hola! Gracias por escribir. Nuestro horario habitual es de lunes a viernes, de 9:00 a 18:00. Los sábados normalmente cerramos, pero para firmar un contrato podríamos coordinar una hora. ¿Me indicas qué sábado y a qué hora aproximada? Lo consulto con el equipo y te confirmo.",
    },
    jev: { urgent: 0.22, intent: [{ label: { en: "Ask a question", es: "Hacer una pregunta" }, p: 0.79 }, { label: { en: "Book an appointment", es: "Agendar una cita" }, p: 0.17 }, { label: { en: "Buy or upgrade", es: "Comprar o ampliar" }, p: 0.02 }, { label: { en: "Other", es: "Otro" }, p: 0.02 }], team: "reception", teamP: 0.84, churn: 0.03 },
  },
  {
    id: "cancel",
    from: { en: "Paula · Email", es: "Paula · Correo" },
    text: { en: "Honestly, after the last outage we are evaluating other vendors. What would it take to keep us? Our renewal is in two weeks.", es: "Honestamente, después de la última caída estamos evaluando otros proveedores. ¿Qué harían para retenernos? Renovamos en dos semanas." },
    llm: {
      en: "I completely understand your concern, and I appreciate you being candid with us. Reliability is a priority and the recent outage fell short of what you should expect. I'd like to connect you with your account manager to discuss what happened, the measures we've taken since, and options for your renewal, including service credits and a dedicated support channel. Would you be available for a call this week?",
      es: "Entiendo perfectamente su preocupación y agradezco la franqueza. La confiabilidad es prioridad y la última caída no estuvo a la altura. Me gustaría conectarla con su ejecutiva de cuenta para revisar qué pasó, las medidas tomadas desde entonces y opciones para la renovación, incluidos créditos de servicio y un canal de soporte dedicado. ¿Tendría disponibilidad para una llamada esta semana?",
    },
    jev: { urgent: 0.77, intent: [{ label: { en: "Negotiate a renewal", es: "Negociar renovación" }, p: 0.72 }, { label: { en: "Cancel", es: "Cancelar" }, p: 0.19 }, { label: { en: "Report a problem", es: "Reportar un problema" }, p: 0.07 }, { label: { en: "Other", es: "Otro" }, p: 0.02 }], team: "sales", teamP: 0.61, churn: 0.88 },
  },
  {
    id: "spam",
    from: { en: "Unknown · Contact form", es: "Desconocido · Formulario" },
    text: { en: "Boost your Google ranking with our SEO packages!!! Limited offer, reply now for 70% OFF", es: "¡¡¡Sube tu posición en Google con nuestros paquetes SEO!!! Oferta limitada, responde ya con 70% OFF" },
    llm: {
      en: "Thank you for your message. At the moment we are not looking for SEO services, but we appreciate you reaching out. If our needs change in the future, we will keep your offer in mind. Have a great day!",
      es: "Gracias por tu mensaje. Por el momento no buscamos servicios de SEO, pero agradecemos el contacto. Si nuestras necesidades cambian, tendremos en cuenta la oferta. ¡Que tengas un buen día!",
    },
    jev: { urgent: 0.03, intent: [{ label: { en: "Unsolicited offer (spam)", es: "Oferta no solicitada (spam)" }, p: 0.97 }, { label: { en: "Buy or upgrade", es: "Comprar o ampliar" }, p: 0.01 }, { label: { en: "Ask a question", es: "Hacer una pregunta" }, p: 0.01 }, { label: { en: "Other", es: "Otro" }, p: 0.01 }], team: "reception", teamP: 0.52, churn: 0.0 },
  },
];

const T = {
  en: {
    kicker: "JEV · DEMO",
    title: "A super fast AI model",
    sub: "Typed answers in about 150 ms. Try it.",
    tabs: ["LLM vs Jev", "Lead router"],
    pick: "Pick a message",
    run: "SEND TO BOTH",
    running: "RUNNING…",
    llmCol: "General LLM",
    llmHint: "Free text. A person has to read it.",
    jevCol: "Jev",
    jevHint: "Typed answers. Code can act on them.",
    waitingLlm: "Waiting for the first token…",
    q: { urgent: "Is this urgent?", intent: "What does the sender want?", team: "Which team should own it?", churn: "Risk of losing the customer" },
    yes: "yes", route: "Route to", escalate: "Escalate to a person",
    latency: "Latency", tokens: "Output", tokensLlm: "≈ {n} words to read", tokensJev: "4 typed answers",
    routerTitle: "The same judgments, running a queue",
    routerSub: "Messages arrive every few seconds. Jev scores each one; the code decides where it goes. Move the threshold: the policy changes without calling the model again.",
    threshold: "Minimum confidence to auto-route",
    human: "Needs a person",
    start: "START THE QUEUE", stop: "PAUSE", clear: "CLEAR",
    conf: "confidence",
    footer: "Built by MindfulTech with TypeSafe's Jev. Simulated for the web; the production version runs the same questions against the live model.",
  },
  es: {
    kicker: "JEV · DEMO",
    title: "Un modelo de IA superrápido",
    sub: "Respuestas tipadas en unos 150 ms. Pruébalo.",
    tabs: ["LLM vs Jev", "Router de leads"],
    pick: "Elige un mensaje",
    run: "ENVIAR A LOS DOS",
    running: "CORRIENDO…",
    llmCol: "LLM general",
    llmHint: "Texto libre. Alguien tiene que leerlo.",
    jevCol: "Jev",
    jevHint: "Respuestas tipadas. El código puede actuar.",
    waitingLlm: "Esperando el primer token…",
    q: { urgent: "¿Es urgente?", intent: "¿Qué quiere quien escribe?", team: "¿Qué equipo debe atenderlo?", churn: "Riesgo de perder al cliente" },
    yes: "sí", route: "Enviar a", escalate: "Escalar a una persona",
    latency: "Latencia", tokens: "Salida", tokensLlm: "≈ {n} palabras por leer", tokensJev: "4 respuestas tipadas",
    routerTitle: "Los mismos juicios, atendiendo una cola",
    routerSub: "Llegan mensajes cada pocos segundos. Jev puntúa cada uno; el código decide a dónde va. Mueve el umbral: la política cambia sin volver a llamar al modelo.",
    threshold: "Confianza mínima para enrutar solo",
    human: "Necesita una persona",
    start: "ARRANCAR LA COLA", stop: "PAUSAR", clear: "LIMPIAR",
    conf: "confianza",
    footer: "Hecho por MindfulTech con Jev de TypeSafe. Simulada para la web; la versión de producción corre las mismas preguntas contra el modelo en vivo.",
  },
};

const pct = (p: number) => `${Math.round(p * 100)}%`;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/* ------------------------------------------------------------- tab 1 -- */
function Compare({ lang }: { lang: "en" | "es" }) {
  const t = T[lang];
  const [sel, setSel] = React.useState(SAMPLES[0]);
  const [phase, setPhase] = React.useState<"idle" | "running" | "done">("idle");
  const [llmText, setLlmText] = React.useState("");
  const [llmMs, setLlmMs] = React.useState<number | null>(null);
  const [jevMs, setJevMs] = React.useState<number | null>(null);
  const [jevOn, setJevOn] = React.useState(false);
  const timers = React.useRef<number[]>([]);
  const stop = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  React.useEffect(() => stop, []);

  const run = () => {
    stop(); setPhase("running"); setLlmText(""); setLlmMs(null); setJevMs(null); setJevOn(false);
    const t0 = performance.now();
    // Jev: one round trip, ~150 ms
    const jevAt = rnd(130, 190);
    timers.current.push(window.setTimeout(() => { setJevOn(true); setJevMs(Math.round(performance.now() - t0)); }, jevAt));
    // LLM: time to first token, then a steady stream over 2.5–3.5 s total
    const full = sel.llm[lang]; const ttft = rnd(550, 900); const total = rnd(2500, 3500);
    const steps = Math.max(20, Math.floor(full.length / 3));
    for (let i = 1; i <= steps; i++) {
      const at = ttft + ((total - ttft) * i) / steps;
      const cut = Math.round((full.length * i) / steps);
      timers.current.push(window.setTimeout(() => {
        setLlmText(full.slice(0, cut));
        if (i === steps) { setLlmMs(Math.round(performance.now() - t0)); setPhase("done"); }
      }, at));
    }
  };

  const words = sel.llm[lang].split(/\s+/).length;
  const top = [...sel.jev.intent].sort((a, b) => b.p - a.p);
  return (
    <div>
      <div className="jev-picker" role="group" aria-label={t.pick}>
        <span className="jev-label">{t.pick}</span>
        {SAMPLES.map((s) => (
          <button key={s.id} type="button" className={`jev-chip${sel.id === s.id ? " on" : ""}`} onClick={() => { stop(); setSel(s); setPhase("idle"); setLlmText(""); setJevOn(false); setLlmMs(null); setJevMs(null); }}>
            {s.from[lang]}
          </button>
        ))}
      </div>
      <div className="jev-msg">
        <span className="jev-from">{sel.from[lang]}</span>
        <p>{sel.text[lang]}</p>
        <button type="button" className="btn-dark jev-run" onClick={run} disabled={phase === "running"}>{phase === "running" ? t.running : t.run}</button>
      </div>

      <div className="jev-cols">
        <div className="jev-col">
          <div className="jev-colhead"><strong>{t.llmCol}</strong><span>{t.llmHint}</span></div>
          <div className="jev-stream">{llmText || (phase === "running" ? <em>{t.waitingLlm}</em> : <em>—</em>)}{phase === "running" && llmText && <span className="jev-caret" />}</div>
          <div className="jev-meta">
            <span>{t.latency}: <b>{llmMs != null ? `${(llmMs / 1000).toFixed(2)} s` : phase === "running" ? "…" : "—"}</b></span>
            <span>{t.tokens}: <b>{t.tokensLlm.replace("{n}", String(words))}</b></span>
          </div>
        </div>
        <div className="jev-col jev-col-jev">
          <div className="jev-colhead"><strong>{t.jevCol}</strong><span>{t.jevHint}</span></div>
          <div className={`jev-answers${jevOn ? " on" : ""}`}>
            <div className="jev-row"><span className="jev-q">{t.q.urgent}</span><span className="jev-a"><Bar p={sel.jev.urgent} /> <b>{pct(sel.jev.urgent)}</b> {t.yes}</span></div>
            <div className="jev-row"><span className="jev-q">{t.q.intent}</span><span className="jev-a jev-dist">{top.map((o) => <span key={o.label.en}><Bar p={o.p} /> <b>{pct(o.p)}</b> {o.label[lang]}</span>)}</span></div>
            <div className="jev-row"><span className="jev-q">{t.q.team}</span><span className="jev-a"><b>{TEAMS[sel.jev.team][lang]}</b> · {pct(sel.jev.teamP)} {t.conf}</span></div>
            <div className="jev-row"><span className="jev-q">{t.q.churn}</span><span className="jev-a"><Bar p={sel.jev.churn} warm /> <b>{pct(sel.jev.churn)}</b></span></div>
            <div className="jev-decision">{sel.jev.teamP >= 0.7 ? `${t.route}: ${TEAMS[sel.jev.team][lang]}` : t.escalate}</div>
          </div>
          <div className="jev-meta">
            <span>{t.latency}: <b>{jevMs != null ? `${jevMs} ms` : phase === "running" ? "…" : "—"}</b></span>
            <span>{t.tokens}: <b>{t.tokensJev}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bar({ p, warm = false }: { p: number; warm?: boolean }) {
  return <span className={`jev-bar${warm ? " warm" : ""}`} aria-hidden><span style={{ width: `${Math.round(p * 100)}%` }} /></span>;
}

/* ------------------------------------------------------------- tab 2 -- */
type Item = { key: number; s: Sample; ms: number };
function Router({ lang }: { lang: "en" | "es" }) {
  const t = T[lang];
  const [items, setItems] = React.useState<Item[]>([]);
  const [on, setOn] = React.useState(false);
  const [thr, setThr] = React.useState(0.7);
  const n = React.useRef(0);
  React.useEffect(() => {
    if (!on) return;
    const tick = () => {
      const s = SAMPLES[n.current % SAMPLES.length]; n.current += 1;
      setItems((cur) => [{ key: n.current, s, ms: Math.round(rnd(130, 190)) }, ...cur].slice(0, 18));
    };
    tick();
    const id = window.setInterval(tick, 2600);
    return () => clearInterval(id);
  }, [on]);
  const lanes: (Sample["jev"]["team"] | "human")[] = ["sales", "support", "finance", "reception", "human"];
  const laneOf = (it: Item) => (it.s.jev.teamP >= thr ? it.s.jev.team : "human");
  return (
    <div>
      <div className="jev-routerbar">
        <button type="button" className="btn-dark jev-run" onClick={() => setOn((v) => !v)}>{on ? t.stop : t.start}</button>
        <button type="button" className="jev-chip" onClick={() => { setOn(false); setItems([]); }}>{t.clear}</button>
        <label className="jev-thr">
          <span>{t.threshold}: <b>{pct(thr)}</b></span>
          <input type="range" min={0.4} max={0.95} step={0.01} value={thr} onChange={(e) => setThr(Number(e.target.value))} />
        </label>
      </div>
      <div className="jev-lanes">
        {lanes.map((lane) => (
          <div key={lane} className={`jev-lane${lane === "human" ? " human" : ""}`}>
            <div className="jev-lanehead">{lane === "human" ? t.human : TEAMS[lane][lang]} <span>{items.filter((i) => laneOf(i) === lane).length}</span></div>
            {items.filter((i) => laneOf(i) === lane).map((i) => (
              <div key={i.key} className="jev-card">
                <div className="jev-from">{i.s.from[lang]} · <span className="jev-ms">{i.ms} ms</span></div>
                <div className="jev-cardtext">{i.s.text[lang]}</div>
                <div className="jev-cardmeta"><span>{TEAMS[i.s.jev.team][lang]} {pct(i.s.jev.teamP)}</span><span>{t.q.urgent} {pct(i.s.jev.urgent)}</span></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- page -- */
export function JevDemo() {
  const { lang } = useLang();
  const t = T[lang];
  const [tab, setTab] = React.useState(0);
  return (
    <div style={{ position: "relative", width: "100%", overflow: "clip", background: "#fff" }}>
      <SiteHeader active="work" megaMenus />
      <main className="jev">
        <section className="jev-hero">
          <div className="jev-wrap">
            <Pill>{t.kicker}</Pill>
            <h1>{t.title}</h1>
            <p className="jev-sub">{t.sub}</p>
          </div>
        </section>
        <section className="jev-body">
          <div className="jev-wrap">
            <div className="jev-tabs" role="tablist">
              {t.tabs.map((label, i) => (
                <button key={label} role="tab" aria-selected={tab === i} type="button" className={`jev-tab${tab === i ? " on" : ""}`} onClick={() => setTab(i)}>{label}</button>
              ))}
            </div>
            {tab === 0 ? <Compare lang={lang} /> : (
              <div>
                <h2 className="jev-h2">{t.routerTitle}</h2>
                <p className="jev-sub" style={{ marginBottom: 22 }}>{t.routerSub}</p>
                <Router lang={lang} />
              </div>
            )}
            <p className="jev-footer" style={{ fontFamily: MONO }}>{t.footer}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
