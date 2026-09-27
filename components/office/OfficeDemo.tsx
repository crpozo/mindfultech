"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BOTS, BOT_BY_ID, type Bot } from "@/lib/office/bots";
import { BotScreen } from "./BotScreen";
import { BotChat } from "./BotChat";
import { HotspotPanel, HOTSPOT_META, type OfficeEvent } from "./Hotspots";
import s from "./office.module.css";

type Room = { id: string; name: string; floor: number };
type WallMode = "full" | "low" | "none";
type Scene = {
  setSelected: (id: string | null) => void;
  focusRoom: (id: string | null) => void;
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

export function OfficeDemo() {
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
  }, []);

  React.useEffect(() => {
    sceneRef.current?.setSelected(selected);
    if (selected) setRoom(null);
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
    if (!roomsOpen && !viewOpen) return;
    const onDown = (e: PointerEvent) => {
      if (roomsRef.current && !roomsRef.current.contains(e.target as Node)) setRoomsOpen(false);
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) setViewOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [roomsOpen, viewOpen]);
  React.useEffect(() => {
    if (!ready) return;
    sceneRef.current?.setWalls(walls);
    sceneRef.current?.setFloorLock(hideUpper);
  }, [ready, walls, hideUpper]);

  const WA = "https://wa.me/593958731994?text=" + encodeURIComponent("Hola, vi la demo de la oficina de gestión con IA y quiero saber más.");
  const TOUR: { title: string; text: string; target?: "team" | "rooms" | "view"; enter: () => void }[] = [
    {
      title: "Bienvenido a tu oficina de gestión con IA",
      text: "Cada persona que ves es un empleado de IA con un rol real: ventas, soporte, finanzas, marketing, operaciones. Trabajan las 24 horas con tus herramientas y aquí puedes ver, preguntar y auditar todo lo que hacen. Este tour te muestra cómo funciona.",
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
      title: "El equipo",
      text: "«Equipo» muestra a los 11 agentes, qué está haciendo cada uno en este momento y en qué sala está. Un clic sobre cualquiera lo selecciona.",
      target: "team",
      enter: () => {
        setSelected(null);
        setHotspot(null);
        setTeamOpen(true);
      },
    },
    {
      title: "La pantalla en vivo de un agente",
      text: "Seleccionamos a Mateo, de Soporte. Su panel muestra sus indicadores y su escritorio real en vivo: aquí está respondiendo tickets en Zendesk. Es como conectarte a su computador y mirar por encima de su hombro.",
      enter: () => {
        if (window.innerWidth < 1280) setTeamOpen(false);
        setHotspot(null);
        setTab("screen");
        setSelected("mateo");
      },
    },
    {
      title: "Chatea con él",
      text: "En la pestaña «Chat» puedes preguntarle qué hizo hoy, cómo va un cliente o pedirle un resumen. Responde con el contexto de su propio trabajo.",
      enter: () => {
        setHotspot(null);
        setSelected("mateo");
        setTab("chat");
      },
    },
    {
      title: "Una oficina viva",
      text: "Los agentes no se cansan, pero la oficina se comporta como una real: se reúnen, se capacitan, toman café y hasta juegan ping-pong. Cada pausa representa una coordinación entre agentes. Vamos a la cafetería.",
      enter: () => {
        setTeamOpen(false);
        goRoom("cafe");
      },
    },
    {
      title: "Dashboards con datos",
      text: "Los objetos con marcador abren paneles. La pantalla de la cafetería es el dashboard de operaciones: leads, tickets, cobros y alcance, con tendencias de 30 días y comparativas contra el periodo anterior.",
      enter: () => {
        setSelected(null);
        setHotspot("tv");
      },
    },
    {
      title: "Rendimiento y costo",
      text: "El sofá del lounge abre el rendimiento de los agentes: cuánto trabajan, cuántos tokens consumen y cuánto cuestan por área. Un humano aprueba lo que necesita firma.",
      enter: () => {
        goRoom("lounge");
        setHotspot("lounge");
      },
    },
    {
      title: "Mira dentro de cada sala",
      text: "Con «Vista» bajas las paredes o quitas el piso 1, como en Los Sims, para ver las salas de abajo. Con «Salas» recorres la oficina, y puedes arrastrar para girar la cámara y usar la rueda para acercarte.",
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
      title: "Así funciona",
      text: "Empleados digitales con roles reales, visibles y auditables, trabajando en tus herramientas las 24 horas. Podemos montar una oficina así para tu empresa: mapeamos las tareas, contratamos los agentes y tú los ves trabajar.",
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
    if (!ready) return;
    let seen = false;
    try {
      seen = !!window.localStorage.getItem("mt-office-tour");
    } catch {
      /* storage blocked */
    }
    if (seen) return;
    const id = window.setTimeout(() => setTourStep(0), 1800);
    return () => window.clearTimeout(id);
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
  const bot = selected ? BOT_BY_ID[selected] : null;
  const hot = hotspot ? HOTSPOT_META[hotspot] : null;
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
        <div className={s.tools}>
          <button type="button" className={`${s.tool} ${teamOpen ? s.toolActive : ""} ${tour?.target === "team" ? s.tourGlow : ""}`} onClick={() => setTeamOpen((v) => !v)} aria-expanded={teamOpen}>
            <i>👥</i>Equipo<b>{BOTS.length}</b>
          </button>
          <div className={s.menuWrap} ref={roomsRef}>
            <button type="button" className={`${s.tool} ${roomsOpen ? s.toolActive : ""} ${tour?.target === "rooms" ? s.tourGlow : ""}`} onClick={() => setRoomsOpen((v) => !v)} aria-expanded={roomsOpen} aria-haspopup="menu">
              <i>{currentRoom ? ROOM_ICONS[currentRoom.id] ?? "•" : "🏢"}</i>
              <span className={s.toolLabel}>{currentRoom ? currentRoom.name : "Salas"}</span>
              <em>▾</em>
            </button>
            {roomsOpen && rooms.length > 0 && (
              <div className={s.menu} role="menu" aria-label="Salas">
                <button type="button" role="menuitem" className={`${s.menuItem} ${room === null ? s.menuItemActive : ""}`} onClick={() => goRoom(null)}>
                  <i>🏢</i>Todo el edificio
                </button>
                {[0, 1].map((floor) => (
                  <React.Fragment key={floor}>
                    <div className={s.menuFloor}>{floor ? "Piso 1" : "Planta baja"}</div>
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
          <div className={s.menuWrap} ref={viewRef}>
            <button type="button" className={`${s.tool} ${viewOpen || walls !== "full" || hideUpper ? s.toolActive : ""} ${tour?.target === "view" ? s.tourGlow : ""}`} onClick={() => setViewOpen((v) => !v)} aria-expanded={viewOpen} aria-haspopup="menu">
              <i>👁️</i>
              <span className={s.toolLabel}>Vista</span>
              <em>▾</em>
            </button>
            {viewOpen && (
              <div className={s.menu} role="menu" aria-label="Vista">
                <div className={s.menuFloor}>Paredes</div>
                <div className={s.seg}>
                  {(["full", "low", "none"] as WallMode[]).map((m) => (
                    <button key={m} type="button" className={`${s.segBtn} ${walls === m ? s.segActive : ""}`} onClick={() => setWalls(m)}>
                      {m === "full" ? "Completas" : m === "low" ? "Bajas" : "Sin paredes"}
                    </button>
                  ))}
                </div>
                <div className={s.menuFloor}>Piso 1</div>
                <div className={s.seg}>
                  <button type="button" className={`${s.segBtn} ${!hideUpper ? s.segActive : ""}`} onClick={() => setHideUpper(false)}>
                    Visible
                  </button>
                  <button type="button" className={`${s.segBtn} ${hideUpper ? s.segActive : ""}`} onClick={() => setHideUpper(true)}>
                    Oculto
                  </button>
                </div>
                <div className={s.menuNote}>Como en Los Sims: baja o quita las paredes para ver dentro de cada sala.</div>
              </div>
            )}
          </div>
          <button type="button" className={`${s.tool} ${tourStep !== null ? s.toolActive : ""}`} onClick={() => setTourStep(0)} title="Tour guiado">
            <i>🎓</i>
            <span className={s.toolLabel}>Tour</span>
          </button>
          {fsOk && (
            <button type="button" className={`${s.tool} ${s.toolIcon} ${fullscreen ? s.toolActive : ""}`} onClick={toggleFullscreen} title={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"} aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>
              <IconFs on={fullscreen} />
            </button>
          )}
        </div>
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

      {teamOpen && (
      <aside className={s.team} aria-label="Equipo">
        <div className={s.teamHead}>
          <span className={s.dot} />
          <strong>Equipo</strong>
          <span>
            {BOTS.length - away} en su puesto · {away} en movimiento
          </span>
          <button type="button" className={s.teamClose} onClick={() => setTeamOpen(false)} aria-label="Cerrar">
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
                <span className={s.avatar}>{b.name[0]}</span>
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
        <div className={`${s.tour} ${panelOpen && !panelMax ? s.tourShift : ""}`} role="dialog" aria-label="Tour guiado">
          <div className={s.tourHead}>
            <span className={s.tourStep}>
              Paso {tourStep + 1} de {TOUR.length}
            </span>
            <button type="button" className={s.tourSkip} onClick={() => endTour(false)}>
              Saltar tour
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
              Atrás
            </button>
            {tourStep < TOUR.length - 1 ? (
              <button type="button" className={`${s.tourBtn} ${s.tourPrimary}`} onClick={() => setTourStep(tourStep + 1)}>
                Siguiente
              </button>
            ) : (
              <>
                <a className={s.tourBtn} href={WA} target="_blank" rel="noreferrer">
                  Hablemos
                </a>
                <button type="button" className={`${s.tourBtn} ${s.tourPrimary}`} onClick={() => endTour(true)}>
                  Finalizar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className={`${s.hint} ${interacted || !ready || tourStep !== null ? s.hintHidden : ""}`}>
        Haz clic en una persona o en un objeto con marcador · «Salas» recorre la oficina · arrastra para girar
      </div>

      <aside className={`${s.panel} ${panelOpen ? s.panelOpen : ""} ${panelMax ? s.panelMax : ""}`} style={{ ["--c" as string]: bot?.color ?? hot?.color ?? "#fff" }} aria-hidden={!panelOpen}>
        {bot && (
          <>
            <div className={s.panelHead}>
              <span className={s.avatar}>{bot.name[0]}</span>
              <div className={s.panelTitle}>
                <strong>{bot.name}</strong>
                <span>
                  {bot.title} · {bot.role}
                  {roomOf[bot.id] && roomNames[roomOf[bot.id]] ? ` · ${roomNames[roomOf[bot.id]]}` : ""}
                </span>
              </div>
              <span className={s.pill}>
                <span className={s.dot} />
                {status[bot.id] ?? "Trabajando"}
              </span>
              <button type="button" className={`${s.close} ${s.maxBtn}`} onClick={() => setPanelMax((v) => !v)} aria-label={panelMax ? "Restaurar tamaño" : "Ampliar panel"} title={panelMax ? "Restaurar tamaño" : "Pantalla completa"}>
                <IconMax back={panelMax} />
              </button>
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
        {hot && hotspot && (
          <>
            <div className={s.panelHead}>
              <span className={s.avatar} style={{ fontSize: 20 }}>
                {hot.icon}
              </span>
              <div className={s.panelTitle}>
                <strong>{hot.title}</strong>
                <span>{hot.subtitle}</span>
              </div>
              <button type="button" className={`${s.close} ${s.maxBtn}`} onClick={() => setPanelMax((v) => !v)} aria-label={panelMax ? "Restaurar tamaño" : "Ampliar panel"} title={panelMax ? "Restaurar tamaño" : "Pantalla completa"}>
                <IconMax back={panelMax} />
              </button>
              <button type="button" className={s.close} onClick={() => setHotspot(null)} aria-label="Cerrar">
                ×
              </button>
            </div>
            <div className={s.panelBody}>
              <HotspotPanel id={hotspot} events={events} status={status} onOpenBot={(id) => setSelected(id)} />
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
