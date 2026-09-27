"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BOTS, BOT_BY_ID, type Bot } from "@/lib/office/bots";
import { BotScreen } from "./BotScreen";
import { BotChat } from "./BotChat";
import s from "./office.module.css";

type Scene = {
  setSelected: (id: string | null) => void;
  dispose: () => void;
};

/**
 * /office-demo — the 3D office of AI employees. The scene (scene/index.js)
 * owns the room, the people and the camera and reports what each person is
 * doing; this component draws the HUD (brand, live stats, roster with each
 * bot's current activity) and the side panel with the bot's remote screen
 * and chat when one is clicked. Speech bubbles and name labels live in the
 * overlay div, positioned by the scene every frame.
 */
export function OfficeDemo() {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<Scene | null>(null);
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<"screen" | "chat">("screen");
  // what each person is doing right now; null = typing at the desk (the
  // roster then rotates through the role's tasks)
  const [status, setStatus] = React.useState<Record<string, string | null>>({});
  const [taskIdx, setTaskIdx] = React.useState(0);
  const [clock, setClock] = React.useState("");
  const [interacted, setInteracted] = React.useState(false);

  React.useEffect(() => {
    const mount = mountRef.current, overlay = overlayRef.current;
    if (!mount || !overlay) return;
    let disposed = false;
    (async () => {
      try {
        const { createOffice } = await import("./scene/index.js");
        if (disposed || !mountRef.current) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const scene: Scene = createOffice({
          mount,
          overlay,
          classes: { label: s.label, labelActive: s.labelActive, bubble: s.bubble, bubbleEmoji: s.bubbleEmoji },
          bots: BOTS,
          reduced,
          onSelect: (id: string | null) => {
            setSelected(id);
            setInteracted(true);
          },
          onHover: () => {},
          onStatus: (id: string, text: string | null) => setStatus((p) => (p[id] === text ? p : { ...p, [id]: text })),
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

  const statusOf = (b: Bot, i: number) => status[b.id] ?? b.working[(taskIdx + i) % b.working.length];
  const bot = selected ? BOT_BY_ID[selected] : null;

  return (
    <div className={s.root}>
      <div className={s.stage} ref={mountRef} />
      <div className={s.overlay} ref={overlayRef} />
      <div className={s.vignette} />

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
        Haz clic en un empleado para hablar con él y ver su pantalla · arrastra para girar la oficina
      </div>

      <div className={s.roster}>
        {BOTS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            className={`${s.card} ${selected === b.id ? s.cardActive : ""}`}
            style={{ ["--c" as string]: b.color }}
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

      <aside className={`${s.panel} ${bot ? s.panelOpen : ""}`} style={{ ["--c" as string]: bot?.color ?? "#fff" }} aria-hidden={!bot}>
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
                {status[bot.id] ?? "Trabajando"}
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
