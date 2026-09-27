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
  // keep the building centred in the part of the stage the open panels leave uncovered
  React.useEffect(() => {
    if (!ready) return;
    const apply = () => {
      const w = window.innerWidth;
      sceneRef.current?.setLayout(w > 900 ? { left: teamOpen ? 320 : 0, right: panelOpen ? Math.min(556, w - 16) : 0 } : { left: 0, right: panelOpen ? 1 : 0 });
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [ready, panelOpen, teamOpen]);
  const currentRoom = room ? rooms.find((r) => r.id === room) : null;
  const away = BOTS.filter((b) => status[b.id]).length;

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
        <div className={s.tools}>
          <button type="button" className={`${s.tool} ${teamOpen ? s.toolActive : ""}`} onClick={() => setTeamOpen((v) => !v)} aria-expanded={teamOpen}>
            <i>👥</i>Equipo<b>{BOTS.length}</b>
          </button>
          <div className={s.menuWrap} ref={roomsRef}>
            <button type="button" className={`${s.tool} ${roomsOpen ? s.toolActive : ""}`} onClick={() => setRoomsOpen((v) => !v)} aria-expanded={roomsOpen} aria-haspopup="menu">
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
            <button type="button" className={`${s.tool} ${viewOpen || walls !== "full" || hideUpper ? s.toolActive : ""}`} onClick={() => setViewOpen((v) => !v)} aria-expanded={viewOpen} aria-haspopup="menu">
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

      <div className={`${s.hint} ${interacted || !ready ? s.hintHidden : ""}`}>
        Haz clic en una persona o en un objeto con marcador · «Salas» recorre la oficina · arrastra para girar
      </div>

      <aside className={`${s.panel} ${panelOpen ? s.panelOpen : ""}`} style={{ ["--c" as string]: bot?.color ?? hot?.color ?? "#fff" }} aria-hidden={!panelOpen}>
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
