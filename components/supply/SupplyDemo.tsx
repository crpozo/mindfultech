"use client";

import * as React from "react";
import { useLang, type Lang } from "@/components/i18n";
import { SUPPLIERS } from "./scene";
import s from "./supply.module.css";

type Licence = { key: string; days: number };
type Delivery = {
  id: string;
  si: number;
  dest: string;
  km: number;
  driver: string;
  plate: string;
  pallets: number;
  weight: number;
  state: "scheduled" | "inbound" | "gate" | "held" | "toDock" | "loading" | "leaving" | "transit" | "delivered";
  progress: number;
  dock: number;
  licences: Licence[];
};
type Snapshot = { deliveredToday: number; deliveries: Delivery[] };
type Ev = { kind: string; id: string; supplier: string; at: number; licence?: string; days?: number; dock?: number; pallets?: number; dest?: string };

const T = {
  en: {
    live: "Live",
    yard: "Main distribution centre, Quito",
    kActive: "Active deliveries",
    kOnTime: "On-time rate",
    kLic: "Licences valid",
    kHeld: "Held at gate",
    kToday: "delivered today",
    kLast30: "last 30 days",
    kDocs: "documents checked",
    kNone: "all clear",
    kAction: "needs action",
    tabDeliveries: "Deliveries",
    tabLicences: "Licences",
    detail: "Delivery",
    supplier: "Supplier",
    cargo: "Cargo",
    driver: "Driver",
    plate: "Plate",
    dest: "Destination",
    load: "Load",
    pallets: "pallets",
    licences: "Licences and permits",
    feed: "Activity",
    hint: "Drag to rotate, scroll to zoom, click a truck",
    built: "Demo built by MindfulTech",
    valid: "Valid",
    expiring: "Expiring",
    expired: "Expired",
    days: (n: number) => (n < 0 ? `expired ${-n} d ago` : n > 364 ? "renewed today" : `${n} days left`),
    steps: ["Gate check", "Loading", "In transit", "Delivered"],
    state: {
      scheduled: "Scheduled",
      inbound: "Arriving",
      gate: "Licence check",
      held: "Held at gate",
      toDock: "Cleared, to dock",
      loading: "Loading",
      leaving: "Departing",
      transit: "In transit",
      delivered: "Delivered",
    },
    lic: {
      transport: "Transport permit",
      insurance: "Cargo insurance",
      driver: "Driver licence",
      sanitary: "Sanitary certificate",
      coldchain: "Cold-chain certificate",
      health: "Health registry",
      hazmat: "Hazmat permit",
      oversize: "Oversize load permit",
      excise: "Excise stamp",
    },
    cargoName: { produce: "Fresh produce", seafood: "Frozen seafood", pharma: "Pharmaceuticals", solvents: "Industrial solvents", construction: "Construction materials", beverages: "Bottled beverages" },
    ev: {
      arrive: () => "arrived at the licence gate",
      cleared: () => "all licences verified, cleared to dock",
      warn: (e: Ev, l: string) => `cleared, but ${l.toLowerCase()} expires in ${e.days} days`,
      held: (e: Ev, l: string) => `held: ${l.toLowerCase()} expired ${e.days} d ago`,
      renewed: () => "permit renewed online, released from the bay",
      dock: (e: Ev) => `docked at bay ${e.dock}, loading started`,
      loaded: (e: Ev) => `${e.pallets} pallets loaded, left for ${e.dest}`,
      delivered: (e: Ev) => `delivered in ${e.dest}, proof of delivery signed`,
    },
  },
  es: {
    live: "En vivo",
    yard: "Centro de distribución principal, Quito",
    kActive: "Entregas activas",
    kOnTime: "Puntualidad",
    kLic: "Licencias vigentes",
    kHeld: "Retenidos en garita",
    kToday: "entregadas hoy",
    kLast30: "últimos 30 días",
    kDocs: "documentos revisados",
    kNone: "todo en orden",
    kAction: "requiere acción",
    tabDeliveries: "Entregas",
    tabLicences: "Licencias",
    detail: "Entrega",
    supplier: "Proveedor",
    cargo: "Carga",
    driver: "Conductor",
    plate: "Placa",
    dest: "Destino",
    load: "Carga",
    pallets: "pallets",
    licences: "Licencias y permisos",
    feed: "Actividad",
    hint: "Arrastra para rotar, rueda para acercar, clic en un camión",
    built: "Demo hecho por MindfulTech",
    valid: "Vigente",
    expiring: "Por vencer",
    expired: "Vencida",
    days: (n: number) => (n < 0 ? `venció hace ${-n} d` : n > 364 ? "renovada hoy" : `quedan ${n} días`),
    steps: ["Garita", "Carga", "En tránsito", "Entregado"],
    state: {
      scheduled: "Programada",
      inbound: "Llegando",
      gate: "Revisión de licencias",
      held: "Retenido en garita",
      toDock: "Aprobado, al muelle",
      loading: "Cargando",
      leaving: "Saliendo",
      transit: "En tránsito",
      delivered: "Entregado",
    },
    lic: {
      transport: "Permiso de transporte",
      insurance: "Seguro de carga",
      driver: "Licencia del conductor",
      sanitary: "Certificado sanitario",
      coldchain: "Certificado de cadena de frío",
      health: "Registro sanitario",
      hazmat: "Permiso de materiales peligrosos",
      oversize: "Permiso de carga sobredimensionada",
      excise: "Sello fiscal",
    },
    cargoName: { produce: "Productos frescos", seafood: "Mariscos congelados", pharma: "Farmacéuticos", solvents: "Solventes industriales", construction: "Materiales de construcción", beverages: "Bebidas embotelladas" },
    ev: {
      arrive: () => "llegó a la garita de licencias",
      cleared: () => "licencias verificadas, aprobado al muelle",
      warn: (e: Ev, l: string) => `aprobado, pero ${l.toLowerCase()} vence en ${e.days} días`,
      held: (e: Ev, l: string) => `retenido: ${l.toLowerCase()} venció hace ${e.days} d`,
      renewed: () => "permiso renovado en línea, liberado",
      dock: (e: Ev) => `en el muelle ${e.dock}, inició la carga`,
      loaded: (e: Ev) => `${e.pallets} pallets cargados, salió a ${e.dest}`,
      delivered: (e: Ev) => `entregado en ${e.dest}, recepción firmada`,
    },
  },
} as const;

const TONE: Record<string, "ok" | "warn" | "bad" | "info"> = {
  arrive: "info", cleared: "ok", warn: "warn", held: "bad", renewed: "ok", dock: "info", loaded: "info", delivered: "ok",
};
const STATE_TONE: Record<Delivery["state"], "ok" | "warn" | "bad" | "info" | "idle"> = {
  scheduled: "idle", inbound: "info", gate: "warn", held: "bad", toDock: "info", loading: "info", leaving: "info", transit: "info", delivered: "ok",
};
const ORDER: Delivery["state"][] = ["held", "gate", "loading", "toDock", "inbound", "leaving", "transit", "delivered", "scheduled"];
const licTone = (days: number) => (days < 0 ? "bad" : days <= 30 ? "warn" : "ok");
const hex = (n: number) => `#${n.toString(16).padStart(6, "0")}`;
const stepOf = (d: Delivery) =>
  d.state === "delivered" ? 4 : d.state === "transit" ? 2 : d.state === "loading" || d.state === "leaving" ? 1 : d.state === "scheduled" ? -1 : 0;

function Mark() {
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" aria-hidden>
      <rect width="28" height="28" rx="8" fill="#2f6bff" />
      <path d="M8 9.5 13.5 14 8 18.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 18.5H20" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function SupplyDemo() {
  const { lang, setLang } = useLang();
  const t = T[lang as Lang];
  const stageRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const labelsRef = React.useRef<HTMLDivElement>(null);
  const apiRef = React.useRef<{ select: (id: string | null) => void; dispose: () => void } | null>(null);
  const [snap, setSnap] = React.useState<Snapshot | null>(null);
  const [events, setEvents] = React.useState<Ev[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<"deliveries" | "licences">("deliveries");
  const [clock, setClock] = React.useState("");

  React.useEffect(() => {
    let dead = false;
    let api: { select: (id: string | null) => void; dispose: () => void } | null = null;
    import("./scene").then(({ createSupplyScene }) => {
      if (dead || !stageRef.current || !canvasRef.current || !labelsRef.current) return;
      api = createSupplyScene(stageRef.current, canvasRef.current, labelsRef.current, {
        onSnapshot: (v: Snapshot) => setSnap(v),
        onEvent: (e: Ev) => setEvents((list) => [e, ...list].slice(0, 30)),
        onSelect: (id: string) => setSelected(id),
      });
      apiRef.current = api;
    });
    return () => {
      dead = true;
      api?.dispose();
      apiRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString(lang === "es" ? "es-EC" : "en-US", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 20000);
    return () => window.clearInterval(id);
  }, [lang]);

  const list = React.useMemo(
    () => (snap ? [...snap.deliveries].sort((a, b) => ORDER.indexOf(a.state) - ORDER.indexOf(b.state) || a.id.localeCompare(b.id)) : []),
    [snap]
  );
  // always keep something selected: prefer what the visitor can see in the yard
  React.useEffect(() => {
    if (!list.length) return;
    if (selected && list.some((d) => d.id === selected)) return;
    const first = list.find((d) => d.state !== "scheduled") || list[0];
    setSelected(first.id);
    apiRef.current?.select(first.id);
  }, [list, selected]);

  const choose = (id: string) => {
    setSelected(id);
    apiRef.current?.select(id);
  };

  const active = list.filter((d) => d.state !== "scheduled" && d.state !== "delivered");
  const held = list.filter((d) => d.state === "held").length;
  const lics = list.filter((d) => d.state !== "scheduled").flatMap((d) => d.licences.map((l) => ({ ...l, d })));
  const licOk = lics.length ? Math.round((lics.filter((l) => l.days >= 0).length / lics.length) * 100) : 100;
  const sel = list.find((d) => d.id === selected) || null;
  const licName = (k: string) => (t.lic as Record<string, string>)[k] || k;
  const evText = (e: Ev) => (t.ev as Record<string, (e: Ev, l: string) => string>)[e.kind]?.(e, licName(e.licence || "")) || e.kind;
  const time = (at: number) => new Date(at).toLocaleTimeString(lang === "es" ? "es-EC" : "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <main className={s.root}>
      <header className={s.top}>
        <div className={s.brand}>
          <Mark />
          <span>
            Command<b>Instinct</b>
          </span>
        </div>
        <div className={s.site}>
          <i className={s.pulse} />
          {t.live}
          <em>{t.yard}</em>
        </div>
        <div className={s.topRight}>
          <span className={s.clock}>{clock}</span>
          <div className={s.lang} role="group" aria-label="Language">
            {(["en", "es"] as const).map((l) => (
              <button key={l} type="button" data-on={lang === l} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={s.stage} ref={stageRef}>
        <canvas ref={canvasRef} />
        <div className={s.labels} ref={labelsRef} />
        <p className={s.hint}>{t.hint}</p>
      </div>

      <aside className={s.left}>
        <div className={s.kpis}>
          <div className={s.kpi}>
            <small>{t.kActive}</small>
            <strong>{active.length}</strong>
            <span>
              {snap?.deliveredToday ?? 128} {t.kToday}
            </span>
          </div>
          <div className={s.kpi}>
            <small>{t.kOnTime}</small>
            <strong>
              97.2<u>%</u>
            </strong>
            <span>{t.kLast30}</span>
          </div>
          <div className={s.kpi} data-tone={licOk < 100 ? "warn" : "ok"}>
            <small>{t.kLic}</small>
            <strong>
              {licOk}
              <u>%</u>
            </strong>
            <span>
              {lics.length} {t.kDocs}
            </span>
          </div>
          <div className={s.kpi} data-tone={held ? "bad" : "ok"}>
            <small>{t.kHeld}</small>
            <strong>{held}</strong>
            <span>{held ? t.kAction : t.kNone}</span>
          </div>
        </div>

        <section className={s.card}>
          <div className={s.tabs}>
            <button type="button" data-on={tab === "deliveries"} onClick={() => setTab("deliveries")}>
              {t.tabDeliveries}
            </button>
            <button type="button" data-on={tab === "licences"} onClick={() => setTab("licences")}>
              {t.tabLicences}
            </button>
          </div>
          {tab === "deliveries" ? (
            <ul className={s.rows}>
              {list.map((d) => (
                <li key={d.id}>
                  <button type="button" className={s.row} data-on={d.id === selected} onClick={() => choose(d.id)}>
                    <i style={{ background: hex(SUPPLIERS[d.si].color) }} />
                    <span className={s.rowMain}>
                      <b>{d.id}</b>
                      <em>
                        {SUPPLIERS[d.si].name} → {d.dest}
                      </em>
                      {(d.state === "loading" || d.state === "transit") && (
                        <span className={s.bar}>
                          <span style={{ width: `${Math.round(d.progress * 100)}%` }} />
                        </span>
                      )}
                    </span>
                    <span className={s.pill} data-tone={STATE_TONE[d.state]}>
                      {t.state[d.state]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className={s.rows}>
              {[...lics]
                .sort((a, b) => a.days - b.days)
                .slice(0, 14)
                .map((l) => (
                  <li key={l.d.id + l.key}>
                    <button type="button" className={s.row} data-on={l.d.id === selected} onClick={() => choose(l.d.id)}>
                      <i style={{ background: hex(SUPPLIERS[l.d.si].color) }} />
                      <span className={s.rowMain}>
                        <b>{licName(l.key)}</b>
                        <em>
                          {l.d.id} · {SUPPLIERS[l.d.si].name}
                        </em>
                      </span>
                      <span className={s.pill} data-tone={licTone(l.days)}>
                        {t.days(l.days)}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </aside>

      <aside className={s.right}>
        {sel && (
          <section className={s.card}>
            <div className={s.detailHead}>
              <div>
                <small>{t.detail}</small>
                <h2>{sel.id}</h2>
              </div>
              <span className={s.pill} data-tone={STATE_TONE[sel.state]}>
                {t.state[sel.state]}
                {sel.state === "loading" && sel.dock >= 0 ? ` · ${sel.dock + 1}` : ""}
              </span>
            </div>
            <ol className={s.steps}>
              {t.steps.map((name, i) => {
                const at = stepOf(sel);
                return (
                  <li key={name} data-s={at > i ? "done" : at === i ? (sel.state === "held" ? "bad" : "now") : "next"}>
                    <i />
                    <span>{name}</span>
                  </li>
                );
              })}
            </ol>
            {(sel.state === "loading" || sel.state === "transit") && (
              <div className={s.progress}>
                <span style={{ width: `${Math.round(sel.progress * 100)}%` }} />
                <b>
                  {sel.state === "transit"
                    ? `${Math.round(sel.progress * sel.km)} / ${sel.km} km`
                    : `${Math.round(sel.progress * sel.pallets)} / ${sel.pallets} ${t.pallets}`}
                </b>
              </div>
            )}
            <dl className={s.facts}>
              <div>
                <dt>{t.supplier}</dt>
                <dd>{SUPPLIERS[sel.si].name}</dd>
              </div>
              <div>
                <dt>{t.cargo}</dt>
                <dd>{(t.cargoName as Record<string, string>)[SUPPLIERS[sel.si].cargo]}</dd>
              </div>
              <div>
                <dt>{t.dest}</dt>
                <dd>
                  {sel.dest}, {sel.km} km
                </dd>
              </div>
              <div>
                <dt>{t.load}</dt>
                <dd>
                  {sel.pallets} {t.pallets}, {sel.weight.toLocaleString(lang === "es" ? "es-EC" : "en-US")} kg
                </dd>
              </div>
              <div>
                <dt>{t.driver}</dt>
                <dd>{sel.driver}</dd>
              </div>
              <div>
                <dt>{t.plate}</dt>
                <dd>{sel.plate}</dd>
              </div>
            </dl>
            <h3 className={s.sub}>{t.licences}</h3>
            <ul className={s.lics}>
              {sel.licences.map((l) => (
                <li key={l.key} data-tone={licTone(l.days)}>
                  <i />
                  <span>
                    <b>{licName(l.key)}</b>
                    <em>{t.days(l.days)}</em>
                  </span>
                  <span className={s.pill} data-tone={licTone(l.days)}>
                    {l.days < 0 ? t.expired : l.days <= 30 ? t.expiring : t.valid}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={`${s.card} ${s.feed}`}>
          <h3 className={s.sub}>{t.feed}</h3>
          <ul>
            {events.slice(0, 9).map((e) => (
              <li key={e.at + e.id + e.kind} data-tone={TONE[e.kind]}>
                <i />
                <span>
                  <b>{e.id}</b> {evText(e)}
                </span>
                <time>{time(e.at)}</time>
              </li>
            ))}
            {!events.length && <li className={s.quiet}>…</li>}
          </ul>
        </section>
      </aside>

      <a className={s.credit} href="/" target="_blank" rel="noreferrer">
        {t.built}
      </a>
    </main>
  );
}
