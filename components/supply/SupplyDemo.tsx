"use client";

import * as React from "react";
import { ORIGIN_NAME, OWNER_NAME, PAYMENT_NAME, SHIPPER_NAME, VENUE_NAME } from "./engine";
import s from "./supply.module.css";

type Scenario = {
  license: string;
  origin: keyof typeof ORIGIN_NAME;
  owner: keyof typeof OWNER_NAME;
  diluent: "yes" | "no";
  payment: keyof typeof PAYMENT_NAME;
  shipper: keyof typeof SHIPPER_NAME;
  venue: keyof typeof VENUE_NAME;
  jv: "yes" | "no";
  cargo: string;
  shipper_co: string;
  dist: string;
  to: string;
};
type State = "scheduled" | "inbound" | "gate" | "held" | "toDock" | "loading" | "leaving" | "transit" | "delivered";
type Shipment = {
  id: string;
  sc: Scenario;
  gl: string;
  china: "categorical" | "nexus" | "none";
  scope: string;
  checks: [string, string, string][] | null;
  fail: boolean | null;
  option: [string, string, string] | null;
  rerouted: boolean;
  carrier: string;
  plate: string;
  units: number;
  tokens: number;
  wh: number;
  peakW: number;
  state: State;
  progress: number;
  dock: number;
};
type Snapshot = { verdictsToday: number; clearedToday: number; whToday: number; deliveries: Shipment[] };
type Ev = { kind: string; id: string; gl: string; at: number; why?: string; option?: string; dock?: number; units?: number; dest?: string };
type Tone = "ok" | "warn" | "bad" | "info" | "idle";

const STATE: Record<State, string> = {
  scheduled: "Scheduled",
  inbound: "Approaching node",
  gate: "Evaluating",
  held: "Blocked, resolving",
  toDock: "Cleared to dock",
  loading: "Transloading",
  leaving: "Departing node",
  transit: "In transit",
  delivered: "Landed",
};
const ORDER: State[] = ["held", "gate", "loading", "toDock", "inbound", "leaving", "transit", "delivered", "scheduled"];
const tone = (d: Shipment): Tone =>
  d.state === "scheduled" ? "idle" : d.fail === null ? "warn" : d.state === "held" ? "bad" : d.rerouted ? "info" : "ok";
const verdictOf = (d: Shipment) =>
  d.fail === null ? "PENDING" : d.state === "held" ? "FAIL" : d.rerouted ? "REROUTED" : "PASS";
const EV: Record<string, { tone: Tone; text: (e: Ev) => string }> = {
  arrive: { tone: "warn", text: (e) => `at the verdict gate, resolving against ${e.gl}` },
  cleared: { tone: "ok", text: (e) => `PASS under ${e.gl}, cleared to dock` },
  note: { tone: "ok", text: (e) => `PASS under ${e.gl}. ${e.why}: origin is not the trigger` },
  blocked: { tone: "bad", text: (e) => `FAIL under ${e.gl}: ${e.why?.toLowerCase()}` },
  rerouted: { tone: "info", text: (e) => `substitute moves instead: ${e.option?.toLowerCase()}` },
  dock: { tone: "idle", text: (e) => `at dock ${e.dock}, transloading` },
  loaded: { tone: "idle", text: (e) => `${e.units} units loaded, left for ${e.dest}` },
  delivered: { tone: "ok", text: (e) => `landed at ${e.dest}, audit memo filed` },
};
const DELTAS = [
  { gl: "GL 46E", from: "46D → 46E", tag: "SUP", text: "Supersedes GL 46D. Venezuelan-origin oil and petrochemical products into the U.S. Nexus PRC bar retained at (b)(3).", effect: "Nexus set re-points 46D to 46E; no logic rewrite" },
  { gl: "GL 48D", from: "48C → 48D", tag: "SUP", text: "Supply of goods and services for O&G, petrochem and electricity. Categorical CN/RU/IR/KP/CU bar at (b)(2); diluents barred at (b)(6).", effect: "Categorical set updated 48C to 48D" },
  { gl: "GL 49B", from: "Sep 28 2026", tag: "NEW", text: "Negotiations of and entry into contingent contracts for certain investment in Venezuela.", effect: "Contingent path now selectable in the routing engine" },
  { gl: "Established U.S. entity", from: "46E Note 1", tag: "CHG", text: "46E authorizes only a U.S. entity organized on or before January 29, 2025.", effect: "Gate on the shipper, not the shipment" },
  { gl: "No new JVs", from: "48D (b)(5)", tag: "CHG", text: "48D does not authorize forming new joint ventures in Venezuela for O&G, petrochem or electricity.", effect: "Contract screen at the node" },
];
const stepOf = (d: Shipment) =>
  d.state === "delivered" ? 4 : d.state === "transit" ? 2 : d.state === "loading" || d.state === "leaving" ? 1 : d.state === "scheduled" ? -1 : 0;
const STEPS = ["Verdict gate", "Transload", "In transit", "Landed"];

export function SupplyDemo() {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const labelsRef = React.useRef<HTMLDivElement>(null);
  const apiRef = React.useRef<{ select: (id: string | null) => void; dispose: () => void } | null>(null);
  const [snap, setSnap] = React.useState<Snapshot | null>(null);
  const [events, setEvents] = React.useState<Ev[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<"shipments" | "deltas">("shipments");

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

  const list = React.useMemo(
    () => (snap ? [...snap.deliveries].sort((a, b) => ORDER.indexOf(a.state) - ORDER.indexOf(b.state) || a.id.localeCompare(b.id)) : []),
    [snap]
  );
  // always keep something selected: prefer what the visitor can see at the node
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

  const atNode = list.filter((d) => ["inbound", "gate", "held", "toDock", "loading", "leaving"].includes(d.state)).length;
  const held = list.filter((d) => d.state === "held").length;
  const verdicts = snap?.verdictsToday ?? 212;
  const passRate = snap ? Math.round((snap.clearedToday / snap.verdictsToday) * 100) : 62;
  const avgWh = snap ? snap.whToday / snap.verdictsToday : 0.0145;
  const sel = list.find((d) => d.id === selected) || null;
  const time = (at: number) => new Date(at).toLocaleTimeString("en-US", { hour12: false });

  return (
    <main className={s.root}>
      <header className={s.top}>
        <div className={s.brand}>
          <i />
          COMMAND INSTINCT
        </div>
        <div className={s.site}>
          <span className={s.live}>
            <i /> LIVE
          </span>
          <em>TRANSIT NODE CTG-01 · VENEZUELA PROVING GROUND</em>
        </div>
        <div className={s.feedTag}>OFAC RULEBOOK · AS OF 2026-09-28 · SIMULATED SHIPMENTS</div>
      </header>

      <div className={s.stage} ref={stageRef}>
        <canvas ref={canvasRef} />
        <div className={s.labels} ref={labelsRef} />
        <div className={s.legend}>
          <span data-t="warn">Pending</span>
          <span data-t="ok">Pass</span>
          <span data-t="bad">Fail</span>
          <span data-t="info">Substitute</span>
        </div>
      </div>

      <aside className={s.left}>
        <div className={s.headline}>
          <small>Node-level compliance execution</small>
          <h1>Does this shipment clear this license right now?</h1>
        </div>
        <div className={s.kpis}>
          <div className={s.kpi}>
            <small>At the node</small>
            <strong>{atNode}</strong>
            <span>{held ? `${held} blocked, resolving` : "none blocked"}</span>
          </div>
          <div className={s.kpi}>
            <small>Verdicts today</small>
            <strong>{verdicts}</strong>
            <span>per-license test</span>
          </div>
          <div className={s.kpi}>
            <small>First-pass clear</small>
            <strong>
              {passRate}
              <u>%</u>
            </strong>
            <span>rest rerouted</span>
          </div>
          <div className={s.kpi}>
            <small>Energy / verdict</small>
            <strong>
              {avgWh.toFixed(4)}
              <u>Wh</u>
            </strong>
            <span data-t="sample">sample curve</span>
          </div>
        </div>

        <section className={s.card}>
          <div className={s.tabs}>
            <button type="button" data-on={tab === "shipments"} onClick={() => setTab("shipments")}>
              Shipments
            </button>
            <button type="button" data-on={tab === "deltas"} onClick={() => setTab("deltas")}>
              License deltas <b>5</b>
            </button>
          </div>
          {tab === "shipments" ? (
            <ul className={s.rows}>
              {list.map((d) => (
                <li key={d.id}>
                  <button type="button" className={s.row} data-on={d.id === selected} data-tone={tone(d)} onClick={() => choose(d.id)}>
                    <i />
                    <span className={s.rowMain}>
                      <b>
                        {d.id} <u>{d.gl}</u>
                      </b>
                      <em>
                        {d.sc.cargo} → {d.sc.to}
                      </em>
                      {(d.state === "loading" || d.state === "transit") && (
                        <span className={s.bar}>
                          <span style={{ width: `${Math.round(d.progress * 100)}%` }} />
                        </span>
                      )}
                    </span>
                    <span className={s.pill} data-tone={tone(d)}>
                      {STATE[d.state]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className={s.deltas}>
              {DELTAS.map((x) => (
                <li key={x.gl}>
                  <div>
                    <b>{x.gl}</b>
                    <em>{x.from}</em>
                    <span className={s.tag} data-k={x.tag}>
                      {x.tag}
                    </span>
                  </div>
                  <p>{x.text}</p>
                  <small>{x.effect}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>

      <aside className={s.right}>
        {sel && (
          <section className={`${s.card} ${s.detail}`}>
            <div className={s.detailHead}>
              <div>
                <small>
                  {sel.gl} · {sel.china === "none" ? "no China bar" : `${sel.china} China test`}
                </small>
                <h2>{sel.id}</h2>
              </div>
              <span className={s.verdict} data-tone={tone(sel)}>
                {verdictOf(sel)}
              </span>
            </div>
            <p className={s.scope}>{sel.scope}</p>
            <ol className={s.steps}>
              {STEPS.map((name, i) => {
                const at = stepOf(sel);
                return (
                  <li key={name} data-s={at > i ? "done" : at === i ? (sel.state === "held" ? "bad" : "now") : "next"}>
                    <i />
                    <span>{name}</span>
                  </li>
                );
              })}
            </ol>
            <dl className={s.facts}>
              <div>
                <dt>Cargo</dt>
                <dd>{sel.sc.cargo}</dd>
              </div>
              <div>
                <dt>Component origin</dt>
                <dd>{ORIGIN_NAME[sel.sc.origin]}</dd>
              </div>
              <div>
                <dt>Authorized party</dt>
                <dd>{sel.sc.shipper_co}</dd>
              </div>
              <div>
                <dt>Distributor</dt>
                <dd>{sel.sc.dist}</dd>
              </div>
              <div>
                <dt>Distributor ownership</dt>
                <dd>{OWNER_NAME[sel.sc.owner]}</dd>
              </div>
              <div>
                <dt>Payment channel</dt>
                <dd>{PAYMENT_NAME[sel.sc.payment]}</dd>
              </div>
              <div>
                <dt>Carrier</dt>
                <dd>
                  {sel.carrier} · {sel.plate}
                </dd>
              </div>
              <div>
                <dt>Destination</dt>
                <dd>{sel.sc.to}</dd>
              </div>
            </dl>

            <h3 className={s.sub}>Per-license checks</h3>
            {sel.checks ? (
              <ul className={s.checks}>
                {sel.checks.map(([k, title, text]) => (
                  <li key={title + text} data-k={k}>
                    <i>{k === "ok" ? "✓" : k === "no" ? "✕" : "!"}</i>
                    <span>
                      <b>{title}</b>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={s.wait}>awaiting the verdict gate_</p>
            )}

            {sel.option && sel.fail && (
              <div className={s.option} data-done={sel.rerouted}>
                <small>{sel.rerouted ? "Substitute moved instead" : "Node option A · resolving"}</small>
                <b>{sel.option[0]}</b>
                <p>{sel.option[1]}</p>
                <em>{sel.option[2]}</em>
              </div>
            )}
            {sel.checks && (
              <div className={s.energy}>
                <span>
                  <small>This verdict</small>
                  <b>{sel.wh.toFixed(4)} Wh</b>
                </span>
                <span>
                  <small>Tokens</small>
                  <b>{sel.tokens}</b>
                </span>
                <span>
                  <small>Peak draw</small>
                  <b>{sel.peakW} W</b>
                </span>
                <span>
                  <small>Node</small>
                  <b data-t="sample">Sample</b>
                </span>
              </div>
            )}
          </section>
        )}

        <section className={`${s.card} ${s.feed}`}>
          <h3 className={s.sub}>Node log</h3>
          <ul>
            {events.slice(0, 7).map((e) => (
              <li key={e.at + e.id + e.kind} data-tone={EV[e.kind]?.tone}>
                <time>{time(e.at)}</time>
                <span>
                  <b>{e.id}</b> {EV[e.kind]?.text(e)}
                </span>
              </li>
            ))}
            {!events.length && <li className={s.wait}>awaiting shipment input_</li>}
          </ul>
        </section>
      </aside>

      <p className={s.foot}>
        Prototype demo with simulated shipments. Verdict logic follows the per-license tests published on commandinstinct.com. Decision support, not legal advice.
        <a href="/" target="_blank" rel="noreferrer">
          Built by MindfulTech
        </a>
      </p>
    </main>
  );
}
