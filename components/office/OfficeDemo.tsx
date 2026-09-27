"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BOTS, BOT_BY_ID, PLACE_LABEL, type Bot } from "@/lib/office/bots";
import { BotScreen } from "./BotScreen";
import { BotChat } from "./BotChat";
import s from "./office.module.css";

type Scene = {
  setSelected: (id: string | null) => void;
  placeOf: (id: string) => string | undefined;
  dispose: () => void;
};

/**
 * /office-demo — the 3D office of AI employees. The scene (officeScene.js)
 * owns the bots and the camera; this component draws the HUD (brand, live
 * stats, roster with each bot's current activity) and the side panel with the
 * bot's remote screen and chat when one is clicked.
 */
export function OfficeDemo() {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<Scene | null>(null);
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<"screen" | "chat">("screen");
  const [places, setPlaces] = React.useState<Record<string, string>>({});
  const [taskIdx, setTaskIdx] = React.useState(0);
  const [clock, setClock] = React.useState("");
  const [interacted, setInteracted] = React.useState(false);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    (async () => {
      try {
        const { createOffice } = await import("./officeScene.js");
        if (disposed || !mountRef.current) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const scene: Scene = createOffice({
          mount,
          bots: BOTS,
          reduced,
          onSelect: (id: string | null) => {
            setSelected(id);
            setInteracted(true);
          },
          onHover: () => {},
          onStatus: (id: string, place: string) => setPlaces((p) => (p[id] === place ? p : { ...p, [id]: place })),
        });
        sceneRef.current = scene;
        setReady(true);
      } catch (e) {
        console.error(e);
        setFailed(true);
      }
    })();
    return () => {
      disposed = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    sceneRef.current?.setSelected(selected);
  }, [selected]);

  // the roster's "what am I doing" rotates while a bot is at its desk
  React.useEffect(() => {
    const id = window.setInterval(() => setTaskIdx((i) => i + 1), 7000);
    return () => window.clearInterval(id);
  }, []);
  React.useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const statusOf = (b: Bot, i: number) => {
    const place = places[b.id] ?? "desk";
    if (place === "desk") return b.working[(taskIdx + i) % b.working.length];
    return PLACE_LABEL[place] ?? PLACE_LABEL.walk;
  };

  const bot = selected ? BOT_BY_ID[selected] : null;

  return (
    <div className={s.root}>
      <div className={s.stage} ref={mountRef} />

      {failed ? (
        <div className={s.fallback}>
          Tu navegador no pudo iniciar WebGL. Abre la demo en Chrome, Edge o Safari actualizados para ver la oficina 3D.
        </div>
      ) : (
        <div className={`${s.loading} ${ready ? s.loadingHidden : ""}`}>
          <div className={s.loadingInner}>
            <div className={s.spinner} />
            Preparando la oficina…
          </div>
        </div>
      )}

      <header className={s.top}>
        <Link href="/" className={s.brand}>
          <Logo size={22} />
          <strong>MindfulTech</strong>
          <span>Oficina de empleados IA · demo</span>
        </Link>
        <div className={s.stats}>
          <div className={s.stat}>
            <span className={s.dot} />
            <b>{BOTS.length}</b> empleados en línea
          </div>
          <div className={s.stat}>
            <b>24/7</b> sin pausas
          </div>
          <div className={`${s.stat} ${s.clock}`}>{clock}</div>
        </div>
      </header>

      <div className={`${s.hint} ${interacted || !ready ? s.hintHidden : ""}`}>
        Haz clic en un empleado para hablar con él y ver su pantalla · arrastra para girar la cámara
      </div>

      <div className={s.roster}>
        {BOTS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            className={`${s.card} ${selected === b.id ? s.cardActive : ""}`}
            style={{ ["--c" as string]: b.suit }}
            onClick={() => {
              setSelected(selected === b.id ? null : b.id);
              setInteracted(true);
            }}
          >
            <span className={s.avatar}>{b.name[0]}</span>
            <span>
              <span className={s.cardName}>{b.name}</span>
              <span className={s.cardRole}> · {b.role}</span>
              <div className={s.cardStatus}>{statusOf(b, i)}</div>
            </span>
          </button>
        ))}
      </div>

      <aside className={`${s.panel} ${bot ? s.panelOpen : ""}`} style={{ ["--c" as string]: bot?.suit ?? "#fff" }} aria-hidden={!bot}>
        {bot && (
          <>
            <div className={s.panelHead}>
              <span className={s.avatar}>{bot.name[0]}</span>
              <div className={s.panelTitle}>
                <strong>{bot.name}</strong>
                <span>
                  {bot.title} · {bot.role}
                </span>
              </div>
              <span className={s.pill}>
                <span className={s.dot} />
                {places[bot.id] && places[bot.id] !== "desk" ? PLACE_LABEL[places[bot.id]] : "Trabajando"}
              </span>
              <button type="button" className={s.close} onClick={() => setSelected(null)} aria-label="Cerrar">
                ×
              </button>
            </div>
            <div className={s.tabs}>
              <button type="button" className={`${s.tab} ${tab === "screen" ? s.tabActive : ""}`} onClick={() => setTab("screen")}>
                <span className={s.live} /> Su pantalla en vivo
              </button>
              <button type="button" className={`${s.tab} ${tab === "chat" ? s.tabActive : ""}`} onClick={() => setTab("chat")}>
                Chat con {bot.name}
              </button>
            </div>
            <div className={s.panelBody}>
              <div className={s.kpis}>
                {bot.kpis.map((k) => (
                  <div key={k.label} className={s.kpi}>
                    <b>{k.value}</b>
                    <span>{k.label}</span>
                  </div>
                ))}
              </div>
              {tab === "screen" ? <BotScreen key={bot.id} bot={bot} /> : <BotChat key={bot.id} bot={bot} />}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
