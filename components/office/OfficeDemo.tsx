"use client";

import * as React from "react";
import { iconSvg } from "@/components/office/icons";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { botsFor, botById, type Bot } from "@/lib/office/bots";
import { useLang, type Lang } from "@/components/i18n";
import { tx, LOCALE } from "@/lib/office/i18n";
import { BotScreen } from "./BotScreen";
import { BotChat } from "./BotChat";
import { HotspotPanel, hotspotMeta, type OfficeEvent } from "./Hotspots";
import { AgentFace } from "./AgentFace";
import s from "./office.module.css";

type Room = { id: string; name: string; floor: number };
type WallMode = "full" | "low" | "none";
type Scene = {
  setSelected: (id: string | null) => void;
  focusRoom: (id: string | null) => void;
  whenReady?: Promise<unknown>;
  setFloorView: (mode: "all" | "ground" | "upper") => void;
  setLayout: (insets: { left?: number; right?: number }) => void;
  setWalls: (mode: WallMode) => void;
  setFloorLock: (locked: boolean) => void;
  rooms: Room[];
  roomNames: Record<string, string>;
  dispose: () => void;
};

const ROOM_ICONS: Record<string, string> = {
  reception: "🛎️", hall: "🏓", open: "💻", nook: "📖", meeting: "📅", meeting2: "🗣️", utility: "🖨️", servers: "🖥️",
  lounge: "🛋️", training: "🎓", studio: "✏️", booth: "📞", cafe: "☕", stairs: "🪜",
};

/**
 * /office-demo — the 3D office of AI employees. The scene (scene/index.js)
 * owns the building, the people and the camera and reports what each person
 * is doing, where they are, and office events; this component draws the HUD
 * (brand, the team panel with every agent's live status and room, the room
 * navigator) and the side panel: an employee's remote screen and chat, or a
 * clicked object's dashboard.
 */
const IconMax = ({ back }: { back?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {back ? <path d="M10 4v6H4M14 20v-6h6M4 4l6 6M20 20l-6-6" /> : <path d="M14 4h6v6M10 20H4v-6M20 4l-6 6M4 20l6-6" />}
  </svg>
);
const IconFs = ({ on }: { on?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {on ? <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" /> : <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />}
  </svg>
);

/** the hotspot panels that are dashboards, in the order the menu lists them */
const DASHBOARDS = ["tv", "board", "servers", "lounge", "reception", "meeting", "clock", "pingpong", "shelf", "coffee"];

export function OfficeDemo() {
  // the demo follows the site language (EN by default) and has its own toggle
  const { lang, setLang } = useLang();
  const t = tx(lang);
  const BOTS = React.useMemo(() => botsFor(lang), [lang]);
  const mountRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<Scene | null>(null);
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [hotspot, setHotspot] = React.useState<string | null>(null);
  const [room, setRoom] = React.useState<string | null>(null);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [roomNames, setRoomNames] = React.useState<Record<string, string>>({});
  const [tab, setTab] = React.useState<"screen" | "chat">("screen");
  // what each person is doing right now; null = working at the desk (the
  // team panel then rotates through the role's tasks)
  const [status, setStatus] = React.useState<Record<string, string | null>>({});
  // which room each person is in
  const [roomOf, setRoomOf] = React.useState<Record<string, string>>({});
  const [events, setEvents] = React.useState<OfficeEvent[]>([]);
  const [taskIdx, setTaskIdx] = React.useState(0);
  const [clock, setClock] = React.useState("");
  const [interacted, setInteracted] = React.useState(false);
  // the HUD stays out of the way: the team list and the room menu open on demand
  const [teamOpen, setTeamOpen] = React.useState(false);
  const [roomsOpen, setRoomsOpen] = React.useState(false);
  const roomsRef = React.useRef<HTMLDivElement>(null);
  const [dashOpen, setDashOpen] = React.useState(false);
  const dashRef = React.useRef<HTMLDivElement>(null);
  // Sims-style view filter: walls full / cut low / hidden, and the mezzanine shown or hidden
  const [viewOpen, setViewOpen] = React.useState(false);
  const viewRef = React.useRef<HTMLDivElement>(null);
  const [walls, setWalls] = React.useState<WallMode>("full");
  const [hideUpper, setHideUpper] = React.useState(false);
  // guided tour: step index, or null when closed
  const [tourStep, setTourStep] = React.useState<number | null>(null);
  // the side panel can grow to cover the whole stage (dashboards get two columns)
  const [panelMax, setPanelMax] = React.useState(false);
  // browser fullscreen of the whole demo, when the browser allows it
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [fsOk, setFsOk] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  React.useEffect(() => {
    setFsOk(!!document.fullscreenEnabled);
    const on = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void rootRef.current?.requestFullscreen?.().catch(() => {});
  };

  React.useEffect(() => {
    const mount = mountRef.current, overlay = overlayRef.current;
    if (!mount || !overlay) return;
    let disposed = false;
    setReady(false);
    setStatus({});
    setRoomOf({});
    setEvents([]);
    (async () => {
      try {
        const { createOffice } = await import("./scene/index.js");
        if (disposed || !mountRef.current) return;
        const scene: Scene = createOffice({
          mount,
          overlay,
          classes: {
            label: s.label,
            labelActive: s.labelActive,
            bubble: s.bubble,
            bubbleEmoji: s.bubbleEmoji,
            marker: s.marker,
            markerIcon: s.markerIcon,
            markerName: s.markerName,
            markerActive: s.markerActive,
          },
          bots: BOTS,
          lang,
          onSelect: (id: string | null) => {
            setSelected(id);
            if (id) setHotspot(null);
            setInteracted(true);
          },
          onHotspot: (id: string) => {
            setHotspot(id);
            setSelected(null);
            setInteracted(true);
          },
          onHover: () => {},
          onStatus: (id: string, text: string | null) => setStatus((p) => (p[id] === text ? p : { ...p, [id]: text })),
          onRoom: (id: string, rm: string) => setRoomOf((p) => (p[id] === rm ? p : { ...p, [id]: rm })),
          onEvent: (e: OfficeEvent) => setEvents((p) => [e, ...p].slice(0, 400)),
        });
        sceneRef.current = scene;
        setRooms(scene.rooms);
        setRoomNames(scene.roomNames);
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
  }, [lang, BOTS]);

  // `ready` is in the deps so the selection (and the room) are re-applied
  // after the scene is rebuilt for a language change
  React.useEffect(() => {
    if (!ready) return;
    sceneRef.current?.setSelected(selected);
    if (selected) setRoom(null);
    else if (room) sceneRef.current?.focusRoom(room);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, ready]);
  React.useEffect(() => {
    const id = window.setInterval(() => setTaskIdx((i) => i + 1), 7000);
    return () => window.clearInterval(id);
  }, []);
  React.useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString(LOCALE[lang], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [lang]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setHotspot(null);
        setPanelMax(false);
        setRoomsOpen(false);
        setTeamOpen(false);
        setViewOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  React.useEffect(() => {
    if (!roomsOpen && !viewOpen && !dashOpen) return;
    const onDown = (e: PointerEvent) => {
      if (roomsRef.current && !roomsRef.current.contains(e.target as Node)) setRoomsOpen(false);
      if (dashRef.current && !dashRef.current.contains(e.target as Node)) setDashOpen(false);
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) setViewOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [roomsOpen, viewOpen, dashOpen]);
  React.useEffect(() => {
    if (!ready) return;
    sceneRef.current?.setWalls(walls);
    sceneRef.current?.setFloorLock(hideUpper);
  }, [ready, walls, hideUpper]);

  const WA =
    "https://wa.me/593958731994?text=" +
    encodeURIComponent(t("Hola, vi la demo de la oficina de gestión con IA y quiero saber más.", "Hi, I saw the AI Management Office demo and I would like to know more."));
  const TOUR: { title: string; text: string; target?: "team" | "rooms" | "view"; enter: () => void }[] = [
    {
      title: t("Bienvenido a tu oficina de gestión con IA", "Welcome to your AI Management Office"),
      text: t(
        "Cada persona que ves es un empleado de IA con un rol real: ventas, soporte, finanzas, marketing, operaciones. Trabajan las 24 horas con tus herramientas y aquí puedes ver, preguntar y auditar todo lo que hacen. Este tour te muestra cómo funciona.",
        "Everyone you see is an AI employee with a real role: sales, support, finance, marketing, operations. They work around the clock inside your tools, and here you can watch, ask and audit everything they do. This tour shows how it works.",
      ),
      enter: () => {
        setSelected(null);
        setHotspot(null);
        setTeamOpen(false);
        setRoomsOpen(false);
        setViewOpen(false);
        setWalls("full");
        setHideUpper(false);
        goRoom(null);
      },
    },
    {
      title: t("El equipo", "The team"),
      text: t(
        "«Equipo» muestra a los 12 agentes, qué está haciendo cada uno en este momento y en qué sala está. Un clic sobre cualquiera lo selecciona.",
        "“Team” lists the 12 agents, what each one is doing right now and which room it is in. Click anyone to select them.",
      ),
      target: "team",
      enter: () => {
        setSelected(null);
        setHotspot(null);
        setTeamOpen(true);
      },
    },
    {
      title: t("La pantalla en vivo de un agente", "An agent's live screen"),
      text: t(
        "Seleccionamos a Mateo, de Soporte. Su panel muestra sus indicadores y su escritorio real en vivo: aquí está respondiendo tickets en Zendesk. Es como conectarte a su computador y mirar por encima de su hombro.",
        "We selected Mateo, from Support. His panel shows his metrics and his real desktop, live: here he is answering tickets in Zendesk. It is like connecting to his computer and looking over his shoulder.",
      ),
      enter: () => {
        if (window.innerWidth < 1280) setTeamOpen(false);
        setHotspot(null);
        setTab("screen");
        setSelected("mateo");
      },
    },
    {
      title: t("Chatea con él", "Chat with him"),
      text: t(
        "En la pestaña «Chat» puedes preguntarle qué hizo hoy, cómo va un cliente o pedirle un resumen. Responde con el contexto de su propio trabajo.",
        "In the “Chat” tab you can ask what he did today, how a client is going, or request a summary. He answers with the context of his own work.",
      ),
      enter: () => {
        setHotspot(null);
        setSelected("mateo");
        setTab("chat");
      },
    },
    {
      title: t("Una oficina viva", "A living office"),
      text: t(
        "Los agentes no se cansan, pero la oficina se comporta como una real: se reúnen, se capacitan, toman café y hasta juegan ping-pong. Cada pausa representa una coordinación entre agentes. Vamos a la cafetería.",
        "The agents never tire, but the office behaves like a real one: they meet, train, grab coffee and even play ping-pong. Every break stands for a hand-off between agents. Let's go to the cafeteria.",
      ),
      enter: () => {
        setTeamOpen(false);
        goRoom("cafe");
      },
    },
    {
      title: t("Dashboards con datos", "Dashboards with data"),
      text: t(
        "Los objetos con marcador abren paneles. La pantalla de la cafetería es el dashboard de operaciones: leads, tickets, cobros y alcance, con tendencias de 30 días y comparativas contra el periodo anterior.",
        "Objects with a marker open panels. The cafeteria screen is the operations dashboard: leads, tickets, collections and reach, with 30-day trends and comparisons against the previous period.",
      ),
      enter: () => {
        setSelected(null);
        setHotspot("tv");
      },
    },
    {
      title: t("Rendimiento y costo", "Performance and cost"),
      text: t(
        "El sofá del lounge abre el rendimiento de los agentes: cuánto trabajan, cuántos tokens consumen y cuánto cuestan por área. Un humano aprueba lo que necesita firma.",
        "The lounge sofa opens agent performance: how much they work, how many tokens they use and what they cost per area. A human approves whatever needs a signature.",
      ),
      enter: () => {
        goRoom("lounge");
        setHotspot("lounge");
      },
    },
    {
      title: t("Mira dentro de cada sala", "Look inside every room"),
      text: t(
        "Con «Vista» bajas las paredes o quitas el piso 1, como en Los Sims, para ver las salas de abajo. Con «Salas» recorres la oficina, y puedes arrastrar para girar la cámara y usar la rueda para acercarte.",
        "With “View” you lower the walls or hide the upper floor, Sims-style, to see the rooms below. “Rooms” takes you around the office; drag to rotate the camera and scroll to zoom in.",
      ),
      target: "view",
      enter: () => {
        setHotspot(null);
        setSelected(null);
        setWalls("low");
        setHideUpper(true);
        goRoom(null);
      },
    },
    {
      title: t("Así funciona", "How it works"),
      text: t(
        "Empleados digitales con roles reales, visibles y auditables, trabajando en tus herramientas las 24 horas. Podemos montar una oficina así para tu empresa: mapeamos las tareas, contratamos los agentes y tú los ves trabajar.",
        "Digital employees with real roles, visible and auditable, working in your tools 24/7. We can set up an office like this for your company: we map the tasks, hire the agents, and you watch them work.",
      ),
      enter: () => {
        setWalls("full");
        setHideUpper(false);
        goRoom(null);
      },
    },
  ];
  const endTour = (finished: boolean) => {
    setTourStep(null);
    setWalls("full");
    setHideUpper(false);
    if (finished) {
      setSelected(null);
      setHotspot(null);
      goRoom(null);
    }
    try {
      window.localStorage.setItem("mt-office-tour", "1");
    } catch {
      /* storage blocked */
    }
  };
  // run each step's scene actions; the first visit starts the tour on its own
  React.useEffect(() => {
    if (tourStep === null) return;
    TOUR[tourStep]?.enter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourStep]);
  React.useEffect(() => {
    if (!ready || tourStep !== null) return;
    let seen = false;
    try {
      seen = !!window.localStorage.getItem("mt-office-tour");
    } catch {
      /* storage blocked */
    }
    if (seen) return;
    const id = window.setTimeout(() => setTourStep(0), 1800);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  React.useEffect(() => {
    if (tourStep === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && tourStep < TOUR.length - 1) setTourStep(tourStep + 1);
      else if (e.key === "ArrowLeft" && tourStep > 0) setTourStep(tourStep - 1);
      else if (e.key === "Escape") endTour(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourStep]);
  const tour = tourStep === null ? null : TOUR[tourStep];

  const goRoom = (id: string | null) => {
    setRoom(id);
    setSelected(null);
    setHotspot(null);
    setRoomsOpen(false);
    sceneRef.current?.focusRoom(id);
    setInteracted(true);
  };
  const pickBot = (id: string) => {
    setSelected(selected === id ? null : id);
    setHotspot(null);
    setInteracted(true);
    // on narrower screens the person's panel needs the room the team list takes
    if (window.innerWidth < 1280) setTeamOpen(false);
  };

  const statusOf = (b: Bot, i: number) => status[b.id] ?? b.working[(taskIdx + i) % b.working.length];
  const bot = selected ? botById(lang, selected) ?? null : null;
  const hot = hotspot ? hotspotMeta(lang)[hotspot] : null;
  const panelOpen = !!bot || !!hot;
  React.useEffect(() => {
    if (!panelOpen) setPanelMax(false);
  }, [panelOpen]);
  // keep the building centred in the part of the stage the open panels leave uncovered
  React.useEffect(() => {
    if (!ready) return;
    const apply = () => {
      const w = window.innerWidth;
      sceneRef.current?.setLayout(w > 900 ? { left: teamOpen ? 320 : 0, right: panelOpen && !panelMax ? Math.min(556, w - 16) : 0 } : { left: 0, right: panelOpen ? 1 : 0 });
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [ready, panelOpen, teamOpen, panelMax]);
  const currentRoom = room ? rooms.find((r) => r.id === room) : null;
  const away = BOTS.filter((b) => status[b.id]).length;

  return (
    <div className={`${s.root} ${panelMax ? s.rootMax : ""}`} ref={rootRef}>
      <div className={s.stage} ref={mountRef} />
      <div className={s.overlay} ref={overlayRef} />
      <div className={s.vignette} />

      {failed ? (
        <div className={s.fallback}>
          {t("Tu navegador no pudo iniciar WebGL. Abre la demo en Chrome, Edge o Safari actualizados para ver la oficina 3D.", "Your browser could not start WebGL. Open the demo in an up-to-date Chrome, Edge or Safari to see the 3D office.")}
        </div>
      ) : (
        <div className={`${s.loading} ${ready ? s.loadingHidden : ""}`}>
          <div className={s.loadingInner}>
            <div className={s.spinner} />
            {t("Preparando la oficina…", "Setting up the office…")}
          </div>
        </div>
      )}

      <header className={s.top}>
        <Link href="/" className={s.brand}>
          {/* white label: no logo, no company name — the product name only */}
          <strong>AI Management Office</strong>
          <span>{t("demo", "demo")}</span>
        </Link>
        <div className={s.tools}>
          <button type="button" className={`${s.tool} ${teamOpen ? s.toolActive : ""} ${tour?.target === "team" ? s.tourGlow : ""}`} onClick={() => setTeamOpen((v) => !v)} aria-expanded={teamOpen}>
            <i>👥</i>
            {t("Equipo", "Team")}
            <b>{BOTS.length}</b>
          </button>
          <div className={s.menuWrap} ref={roomsRef}>
            <button type="button" className={`${s.tool} ${roomsOpen ? s.toolActive : ""} ${tour?.target === "rooms" ? s.tourGlow : ""}`} onClick={() => setRoomsOpen((v) => !v)} aria-expanded={roomsOpen} aria-haspopup="menu">
              <i>{currentRoom ? ROOM_ICONS[currentRoom.id] ?? "•" : "🏢"}</i>
              <span className={s.toolLabel}>{currentRoom ? currentRoom.name : t("Salas", "Rooms")}</span>
              <em>▾</em>
            </button>
            {roomsOpen && rooms.length > 0 && (
              <div className={s.menu} role="menu" aria-label={t("Salas", "Rooms")}>
                <button type="button" role="menuitem" className={`${s.menuItem} ${room === null ? s.menuItemActive : ""}`} onClick={() => goRoom(null)}>
                  <i>🏢</i>
                  {t("Todo el edificio", "Whole building")}
                </button>
                {[0, 1].map((floor) => (
                  <React.Fragment key={floor}>
                    <div className={s.menuFloor}>{floor ? t("Piso 1", "Upper floor") : t("Planta baja", "Ground floor")}</div>
                    {rooms
                      .filter((r) => r.floor === floor)
                      .map((r) => (
                        <button key={r.id} type="button" role="menuitem" className={`${s.menuItem} ${room === r.id ? s.menuItemActive : ""}`} onClick={() => goRoom(r.id)}>
                          <i>{ROOM_ICONS[r.id] ?? "•"}</i>
                          {r.name}
                        </button>
                      ))}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
          <div className={s.menuWrap} ref={dashRef}>
            <button type="button" className={`${s.tool} ${dashOpen || (hotspot && DASHBOARDS.includes(hotspot)) ? s.toolActive : ""}`} onClick={() => setDashOpen((v) => !v)} aria-expanded={dashOpen} aria-haspopup="menu">
              <i>📊</i>
              <span className={s.toolLabel}>Dashboards</span>
              <span className={s.caret}>▾</span>
            </button>
            {dashOpen && (
              <div className={s.menu} role="menu" aria-label="Dashboards">
                <div className={s.menuFloor}>{t("Pantallas con datos del equipo", "Screens with the team's data")}</div>
                {DASHBOARDS.map((id) => {
                  const m = hotspotMeta(lang)[id];
                  return (
                    <button key={id} type="button" role="menuitem" className={`${s.menuItem} ${hotspot === id ? s.menuItemActive : ""}`} onClick={() => { setDashOpen(false); setSelected(null); setHotspot(id); setInteracted(true); }}>
                      <span className={s.menuIcon} dangerouslySetInnerHTML={{ __html: iconSvg(id) }} />
                      <span className={s.menuText}>
                        <b>{m.title}</b>
                        <small>{m.subtitle}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className={s.menuWrap} ref={viewRef}>
            <button type="button" className={`${s.tool} ${viewOpen || walls !== "full" || hideUpper ? s.toolActive : ""} ${tour?.target === "view" ? s.tourGlow : ""}`} onClick={() => setViewOpen((v) => !v)} aria-expanded={viewOpen} aria-haspopup="menu">
              <i>👁️</i>
              <span className={s.toolLabel}>{t("Vista", "View")}</span>
              <em>▾</em>
            </button>
            {viewOpen && (
              <div className={s.menu} role="menu" aria-label={t("Vista", "View")}>
                <div className={s.menuFloor}>{t("Paredes", "Walls")}</div>
                <div className={s.seg}>
                  {(["full", "low", "none"] as WallMode[]).map((m) => (
                    <button key={m} type="button" className={`${s.segBtn} ${walls === m ? s.segActive : ""}`} onClick={() => setWalls(m)}>
                      {m === "full" ? t("Completas", "Full") : m === "low" ? t("Bajas", "Low") : t("Sin paredes", "None")}
                    </button>
                  ))}
                </div>
                <div className={s.menuFloor}>{t("Piso 1", "Upper floor")}</div>
                <div className={s.seg}>
                  <button type="button" className={`${s.segBtn} ${!hideUpper ? s.segActive : ""}`} onClick={() => setHideUpper(false)}>
                    {t("Visible", "Visible")}
                  </button>
                  <button type="button" className={`${s.segBtn} ${hideUpper ? s.segActive : ""}`} onClick={() => setHideUpper(true)}>
                    {t("Oculto", "Hidden")}
                  </button>
                </div>
                <div className={s.menuNote}>{t("Como en Los Sims: baja o quita las paredes para ver dentro de cada sala.", "Like in The Sims: lower or remove the walls to look inside every room.")}</div>
              </div>
            )}
          </div>
          <button type="button" className={`${s.tool} ${tourStep !== null ? s.toolActive : ""}`} onClick={() => setTourStep(0)} title={t("Tour guiado", "Guided tour")}>
            <i>🎓</i>
            <span className={s.toolLabel}>Tour</span>
          </button>
          {fsOk && (
            <button type="button" className={`${s.tool} ${s.toolIcon} ${fullscreen ? s.toolActive : ""}`} onClick={toggleFullscreen} title={fullscreen ? t("Salir de pantalla completa", "Exit full screen") : t("Pantalla completa", "Full screen")} aria-label={fullscreen ? t("Salir de pantalla completa", "Exit full screen") : t("Pantalla completa", "Full screen")}>
              <IconFs on={fullscreen} />
            </button>
          )}
          <div className={s.langSeg} role="group" aria-label={t("Idioma", "Language")}>
            {(["en", "es"] as Lang[]).map((l) => (
              <button key={l} type="button" className={`${s.langBtn} ${lang === l ? s.langOn : ""}`} onClick={() => setLang(l)} aria-pressed={lang === l}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className={s.stats}>
          <div className={s.stat}>
            <span className={s.dot} />
            <b>{BOTS.length}</b> {t("empleados en línea", "employees online")}
          </div>
          <div className={s.stat}>
            <b>24/7</b> {t("sin pausas", "no breaks")}
          </div>
          <div className={`${s.stat} ${s.clock}`}>{clock}</div>
        </div>
      </header>

      {teamOpen && (
      <aside className={s.team} aria-label={t("Equipo", "Team")}>
        <div className={s.teamHead}>
          <span className={s.dot} />
          <strong>{t("Equipo", "Team")}</strong>
          <span>
            {BOTS.length - away} {t("en su puesto", "at their desk")} · {away} {t("en movimiento", "on the move")}
          </span>
          <button type="button" className={s.teamClose} onClick={() => setTeamOpen(false)} aria-label={t("Cerrar", "Close")}>
            ×
          </button>
        </div>
        <div className={s.teamList}>
          {BOTS.map((b, i) => {
            const rm = roomOf[b.id];
            return (
              <button
                key={b.id}
                type="button"
                className={`${s.member} ${selected === b.id ? s.memberActive : ""}`}
                style={{ ["--c" as string]: b.color }}
                onClick={() => pickBot(b.id)}
                title={`${b.name} · ${b.title}`}
              >
                <span className={s.avatar}>
                  <AgentFace id={b.id} look={b.look} mood={status[b.id] ? "idle" : "working"} size={36} />
                </span>
                <span className={s.memberBody}>
                  <span className={s.memberName}>
                    {b.name} <em>{b.role}</em>
                  </span>
                  <span className={s.memberStatus}>{statusOf(b, i)}</span>
                </span>
                {rm && (
                  <span className={s.memberRoom} title={roomNames[rm] ?? rm}>
                    <i>{ROOM_ICONS[rm] ?? "•"}</i>
                    <span>{roomNames[rm] ?? rm}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>
      )}

      {tour && tourStep !== null && (
        <div className={`${s.tour} ${panelOpen && !panelMax ? s.tourShift : ""}`} role="dialog" aria-label={t("Tour guiado", "Guided tour")}>
          <div className={s.tourHead}>
            <span className={s.tourStep}>
              {t("Paso", "Step")} {tourStep + 1} {t("de", "of")} {TOUR.length}
            </span>
            <button type="button" className={s.tourSkip} onClick={() => endTour(false)}>
              {t("Saltar tour", "Skip tour")}
            </button>
          </div>
          <div className={s.tourTitle}>{tour.title}</div>
          <p className={s.tourText}>{tour.text}</p>
          <div className={s.tourNav}>
            <div className={s.tourDots} aria-hidden>
              {TOUR.map((_, i) => (
                <i key={i} className={i === tourStep ? s.on : ""} />
              ))}
            </div>
            <button type="button" className={s.tourBtn} onClick={() => setTourStep(Math.max(0, tourStep - 1))} disabled={tourStep === 0}>
              {t("Atrás", "Back")}
            </button>
            {tourStep < TOUR.length - 1 ? (
              <button type="button" className={`${s.tourBtn} ${s.tourPrimary}`} onClick={() => setTourStep(tourStep + 1)}>
                {t("Siguiente", "Next")}
              </button>
            ) : (
              <>
                <a className={s.tourBtn} href={WA} target="_blank" rel="noreferrer">
                  {t("Hablemos", "Let's talk")}
                </a>
                <button type="button" className={`${s.tourBtn} ${s.tourPrimary}`} onClick={() => endTour(true)}>
                  {t("Finalizar", "Finish")}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className={`${s.hint} ${interacted || !ready || tourStep !== null ? s.hintHidden : ""}`}>
        {t("Haz clic en una persona o en un objeto con marcador · «Salas» recorre la oficina · arrastra para girar", "Click a person or an object with a marker · “Rooms” moves around the office · drag to rotate")}
      </div>

      <aside className={`${s.panel} ${panelOpen ? s.panelOpen : ""} ${panelMax ? s.panelMax : ""}`} style={{ ["--c" as string]: bot?.color ?? hot?.color ?? "#fff" }} aria-hidden={!panelOpen}>
        {bot && (
          <>
            <div className={s.panelHead}>
              <span className={s.avatar}>
                <AgentFace id={bot.id} look={bot.look} mood={tab === "chat" ? "idle" : status[bot.id] ? "idle" : "working"} size={44} />
              </span>
              <div className={s.panelTitle}>
                <strong>{bot.name}</strong>
                <span>
                  {bot.title} · {bot.role}
                  {roomOf[bot.id] && roomNames[roomOf[bot.id]] ? ` · ${roomNames[roomOf[bot.id]]}` : ""}
                </span>
              </div>
              <span className={s.pill}>
                <span className={s.dot} />
                {status[bot.id] ?? t("Trabajando", "Working")}
              </span>
              <button type="button" className={`${s.close} ${s.maxBtn}`} onClick={() => setPanelMax((v) => !v)} aria-label={panelMax ? t("Restaurar tamaño", "Restore size") : t("Ampliar panel", "Expand panel")} title={panelMax ? t("Restaurar tamaño", "Restore size") : t("Pantalla completa", "Full screen")}>
                <IconMax back={panelMax} />
              </button>
              <button type="button" className={s.close} onClick={() => setSelected(null)} aria-label={t("Cerrar", "Close")}>
                ×
              </button>
            </div>
            <div className={s.tabs}>
              <button type="button" className={`${s.tab} ${tab === "screen" ? s.tabActive : ""}`} onClick={() => setTab("screen")}>
                <span className={s.live} /> {t("Su pantalla en vivo", "Live screen")}
              </button>
              <button type="button" className={`${s.tab} ${tab === "chat" ? s.tabActive : ""}`} onClick={() => setTab("chat")}>
                {t("Chat con", "Chat with")} {bot.name}
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
              {tab === "screen" ? <BotScreen key={bot.id} bot={bot} lang={lang} /> : <BotChat key={bot.id} bot={bot} lang={lang} />}
            </div>
          </>
        )}
        {hot && hotspot && (
          <>
            <div className={s.panelHead}>
              <span className={`${s.avatar} ${s.avatarIcon}`} dangerouslySetInnerHTML={{ __html: iconSvg(hotspot) }} />
              <div className={s.panelTitle}>
                <strong>{hot.title}</strong>
                <span>{hot.subtitle}</span>
              </div>
              <button type="button" className={`${s.close} ${s.maxBtn}`} onClick={() => setPanelMax((v) => !v)} aria-label={panelMax ? t("Restaurar tamaño", "Restore size") : t("Ampliar panel", "Expand panel")} title={panelMax ? t("Restaurar tamaño", "Restore size") : t("Pantalla completa", "Full screen")}>
                <IconMax back={panelMax} />
              </button>
              <button type="button" className={s.close} onClick={() => setHotspot(null)} aria-label={t("Cerrar", "Close")}>
                ×
              </button>
            </div>
            <div className={s.panelBody}>
              <HotspotPanel id={hotspot} events={events} status={status} onOpenBot={(id) => setSelected(id)} lang={lang} />
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
