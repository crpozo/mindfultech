// The office demo scene. OfficeDemo.tsx imports this lazily so three.js and
// the addons stay out of the page's first-load bundle.
//
// createOffice() builds the diorama (room.js), one character per employee
// (character.js) and runs a small life simulation: everyone works at their
// desk most of the time (typing, thinking, stretching, sipping coffee), and
// every so often somebody takes a break — coffee bar, lounge sofa, whiteboard,
// TV wall, water cooler, printer, window, a colleague's desk, or a round of
// rock-paper-scissors. Two people at the same place chat (speech bubbles in
// the DOM overlay), laugh, and go back to work. Walking follows the nav grid.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { NavGrid } from "./nav.js";
import { buildRoom, ROOM } from "./room.js";
import { buildCharacter, POSES, HIP_SIT, HIP_SOFA } from "./character.js";
import { SCRIPTS, SOLO, RPS, COFFEE_SOLO, LAUGH_RE, fill } from "./dialogue.js";
import { blob as blobTexture } from "./textures.js";

const PI = Math.PI;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function angleDiff(a, b) {
  let d = ((b - a + PI) % (PI * 2)) - PI;
  if (d < -PI) d += PI * 2;
  return d;
}
const angleLerp = (a, b, t) => a + angleDiff(a, b) * t;

const MAX_AWAY = 3;
const WALK = 1.15;
const PLACE_LABEL = {
  coffee: "la cafetera",
  lounge: "el lounge",
  board: "la pizarra",
  tv: "la pantalla",
  water: "el dispensador",
  printer: "la impresora",
  window: "la ventana",
  game: "jugar un rato",
};
const OUTINGS = (typeof window !== "undefined" && window.__OFFICE_DEBUG && window.__OFFICE_DEBUG.outings) || [
  ["coffee", 30], ["visit", 16], ["lounge", 14], ["game", 12], ["board", 10], ["tv", 8], ["water", 5], ["printer", 3], ["window", 2],
];
const DWELL = { coffee: [9, 16], lounge: [10, 18], board: [8, 14], tv: [6, 10], water: [5, 8], printer: [4, 6], window: [5, 8], game: [3, 5], visit: [3, 5] };

export function createOffice({ mount, overlay, classes, bots, onSelect, onHover, onStatus, reduced }) {
  // ------------------------------------------------------------ renderer ----
  const maxDpr = Math.min(window.devicePixelRatio || 1, 2);
  let dpr = maxDpr;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.4;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 120);
  const REST_TARGET = new THREE.Vector3(0.9, 0.4, 0.9);
  const REST_POS = new THREE.Vector3(12.4, 10.6, 12.4);
  camera.position.copy(REST_POS);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(REST_TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 5;
  controls.maxDistance = 26;
  controls.minPolarAngle = 0.32;
  controls.maxPolarAngle = 1.32;
  controls.minAzimuthAngle = PI / 4 - 1.15;
  controls.maxAzimuthAngle = PI / 4 + 1.15;
  controls.enablePan = false;
  controls.update();

  // ------------------------------------------------------------- lights ----
  const sun = new THREE.DirectionalLight("#fff1d6", 2.6);
  sun.position.set(-9, 8, -1.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = -9;
  sun.shadow.camera.right = 9;
  sun.shadow.camera.top = 9;
  sun.shadow.camera.bottom = -9;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight("#dbe7ff", "#7a5a43", 0.85));
  const fillLight = new THREE.DirectionalLight("#ffffff", 0.55);
  fillLight.position.set(8, 6, 9);
  scene.add(fillLight);

  // --------------------------------------------------------------- room ----
  const nav = new NavGrid(ROOM.x0 + 0.15, ROOM.z0 + 0.15, ROOM.x1, ROOM.z1, 0.25);
  const room = buildRoom(scene, nav, bots);
  const { desks, spots, dynamic } = room;

  // dust motes drifting in the sun shafts
  const motes = (() => {
    const n = 160, pos = new Float32Array(n * 3), vel = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = rnd(-5.2, -1.2);
      pos[i * 3 + 1] = rnd(0.1, 2.9);
      pos[i * 3 + 2] = rnd(-3.4, 2.2);
      vel[i] = rnd(0.02, 0.06);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: "#fff2cc", size: 0.035, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
    const pts = new THREE.Points(g, m);
    scene.add(pts);
    return { pts, pos, vel, n };
  })();

  // --------------------------------------------------------- characters ----
  const blobTex = blobTexture();
  const actors = bots.map((bot, i) => {
    const rig = buildCharacter(bot);
    const desk = desks[i];
    rig.root.position.set(desk.seat.x, 0, desk.seat.z);
    rig.root.rotation.y = desk.seat.yaw;
    scene.add(rig.root);
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.6 }));
    blob.rotation.x = -PI / 2;
    blob.position.y = 0.008;
    scene.add(blob);
    const a = {
      bot, rig, desk, idx: i, blob,
      state: "work", sub: "type", subUntil: rnd(4, 12),
      breakAt: rnd(8, 40), until: 0, arrivedAt: 0,
      path: [], dest: null, place: "desk", spot: null, partner: null, conv: null,
      yaw: desk.seat.yaw, targetYaw: desk.seat.yaw, walkT: 0, phase: Math.random() * 20,
      mug: false, laughUntil: 0, mouthOpen: false, hostReq: null, invite: null, visitorPending: null,
      status: undefined, headLook: 0, bubble: null, soloAt: rnd(10, 30),
      label: null, seatY: HIP_SIT,
    };
    // name label in the DOM overlay
    const el = document.createElement("div");
    el.className = classes.label;
    el.innerHTML = `<i style="background:${bot.accent}"></i><b>${bot.name}</b><span>${bot.role}</span>`;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onSelect && onSelect(bot.id);
    });
    overlay.appendChild(el);
    a.label = el;
    return a;
  });
  const allMeshes = actors.flatMap((a) => a.rig.meshes);
  const byId = Object.fromEntries(actors.map((a) => [a.bot.id, a]));

  const setStatus = (a, text) => {
    if (a.status === text) return;
    a.status = text;
    onStatus && onStatus(a.bot.id, text);
  };
  const awayCount = () => actors.filter((o) => o.state !== "work" && o.state !== "host").length;

  // ------------------------------------------------------------ bubbles ----
  const say = (a, text, dur) => {
    if (a.bubble) a.bubble.el.remove();
    const el = document.createElement("div");
    const emojiOnly = /^[\p{Extended_Pictographic}\s️]+$/u.test(text);
    el.className = classes.bubble + (emojiOnly ? " " + classes.bubbleEmoji : "");
    el.style.setProperty("--c", a.bot.accent);
    el.textContent = text;
    overlay.appendChild(el);
    a.bubble = { el, until: simT + dur, born: simT };
  };
  const hush = (a) => {
    if (a.bubble) a.bubble.el.remove();
    a.bubble = null;
  };
  const laugh = (a, dur = 1.6) => {
    a.laughUntil = simT + dur;
  };

  // ----------------------------------------------------------- movement ----
  const goTo = (a, x, z, dest) => {
    const p = a.rig.root.position;
    a.path = nav.findPath(p.x, p.z, x, z);
    a.dest = dest;
    a.state = "walk";
  };
  const leaveSpot = (a) => {
    if (a.spot) a.spot.taken = null;
    a.spot = null;
  };
  const goHome = (a) => {
    leaveSpot(a);
    a.place = "walk";
    goTo(a, a.desk.seat.x, a.desk.seat.z, { kind: "desk" });
    setStatus(a, "Volviendo a su escritorio");
  };
  const standUp = (a, then) => {
    a.state = "standup";
    a.until = simT + 0.55;
    a.then = then;
  };

  /** Pick where to go on a break; returns false when nothing is available. */
  const chooseOuting = (a) => {
    const total = OUTINGS.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    const order = [...OUTINGS].sort(() => Math.random() - 0.5);
    // weighted pick, then fall through the rest if unavailable
    let start = 0;
    for (let i = 0; i < OUTINGS.length; i++) {
      r -= OUTINGS[i][1];
      if (r <= 0) {
        start = i;
        break;
      }
    }
    const tries = [OUTINGS[start][0], ...order.map((o) => o[0])];
    for (const kind of tries) {
      if (kind === "visit") {
        const hosts = actors.filter((o) => o !== a && o.state === "work" && !o.visitorPending && !o.hostReq && o.breakAt - simT > 10 && o.desk.visit.length);
        if (!hosts.length) continue;
        const host = pick(hosts);
        host.visitorPending = a;
        host.breakAt += 25;
        const v = host.desk.visit.reduce((best, c) => (Math.hypot(c.x - a.rig.root.position.x, c.z - a.rig.root.position.z) < Math.hypot(best.x - a.rig.root.position.x, best.z - a.rig.root.position.z) ? c : best));
        a.pending = { kind: "visit", host, spot: v };
        return true;
      }
      const list = spots[kind];
      if (!list) continue;
      const free = list.filter((s) => !s.taken);
      if (!free.length) continue;
      if (kind === "game") {
        if (free.length < 2) continue;
        const mate = pickMate(a, 1);
        if (!mate) continue;
        free[0].taken = a;
        free[1].taken = mate;
        mate.invite = { kind: "game", spot: free[1], at: simT + rnd(1.5, 4) };
        a.pending = { kind, spot: free[0] };
        return true;
      }
      const spot = free[0];
      spot.taken = a;
      a.pending = { kind, spot };
      // often bring a colleague along so there is someone to talk to
      if (free.length > 1 && (kind === "coffee" || kind === "lounge" || kind === "board" || kind === "tv") && Math.random() < 0.65) {
        const mate = pickMate(a);
        if (mate) {
          free[1].taken = mate;
          mate.invite = { kind, spot: free[1], at: simT + rnd(3, 8) };
        }
      }
      return true;
    }
    return false;
  };
  const pickMate = (a, slack = 0) => {
    const c = actors.filter((o) => o !== a && o.state === "work" && !o.invite && !o.hostReq && !o.visitorPending);
    return c.length && awayCount() + 2 <= MAX_AWAY + slack ? pick(c) : null;
  };
  const startOuting = (a) => {
    const p = a.pending;
    a.pending = null;
    a.invite = null;
    if (!p) return;
    standUp(a, () => {
      if (p.kind === "visit") {
        a.partner = p.host;
        a.place = "visit";
        goTo(a, p.spot.x, p.spot.z, { kind: "visit", host: p.host, spot: p.spot });
        setStatus(a, `Yendo al escritorio de ${p.host.bot.name}`);
      } else {
        a.spot = p.spot;
        a.place = p.kind;
        goTo(a, p.spot.x, p.spot.z, { kind: "spot", place: p.kind, spot: p.spot });
        setStatus(a, `Caminando a ${PLACE_LABEL[p.kind]}`);
      }
    });
  };

  // ------------------------------------------------------ conversations ----
  const convs = [];
  const startConv = (a, b, context, script) => {
    if (a.conv || b.conv) return;
    const pool = SCRIPTS[context] || SCRIPTS.coffee;
    const s = script || pick(pool.filter((x) => x !== a.lastScript && x !== b.lastScript)) || pick(pool);
    a.lastScript = b.lastScript = s;
    const conv = { a, b, context, script: s, i: -1, stepUntil: simT + 0.4, game: null, done: false };
    a.conv = b.conv = conv;
    convs.push(conv);
    setStatus(a, `Charlando con ${b.bot.name}`);
    setStatus(b, `Charlando con ${a.bot.name}`);
  };
  const endConv = (conv) => {
    conv.done = true;
    for (const x of [conv.a, conv.b]) {
      x.conv = null;
      x.mouthOpen = false;
      x.gamePose = null;
      hush(x);
      if (x.state === "away") x.until = simT + rnd(0.8, 2.5);
      if (x.state === "host") {
        x.state = "work";
        x.sub = "type";
        x.subUntil = simT + rnd(6, 14);
        x.hostReq = null;
        x.visitorPending = null;
        setStatus(x, null);
      }
    }
    convs.splice(convs.indexOf(conv), 1);
  };
  const stepConv = (conv) => {
    const { a, b } = conv;
    // wait for the visitor / host to be in place
    if (a.state === "walk" || b.state === "walk" || a.state === "standup" || b.state === "standup") return;
    if (simT < conv.stepUntil) return;
    // game phases
    if (conv.game) {
      const g = conv.game;
      if (g.phase === "pump") {
        g.phase = "reveal";
        g.ha = Math.floor(Math.random() * 3);
        g.hb = Math.floor(Math.random() * 3);
        say(a, RPS.hands[g.ha], 2.6);
        say(b, RPS.hands[g.hb], 2.6);
        a.gamePose = b.gamePose = "reveal";
        conv.stepUntil = simT + 1.1;
        return;
      }
      if (g.phase === "reveal") {
        g.phase = "result";
        const d = (g.ha - g.hb + 3) % 3; // 1: a wins, 2: b wins, 0: tie
        if (d === 0) {
          say(a, pick(RPS.tie), 2.2);
          say(b, pick(RPS.tie), 2.2);
          laugh(a, 2);
          laugh(b, 2);
          a.gamePose = b.gamePose = null;
        } else {
          const w = d === 1 ? a : b, l = d === 1 ? b : a;
          say(w, pick(RPS.win), 2.4);
          say(l, pick(RPS.lose), 2.4);
          w.gamePose = "cheer";
          l.gamePose = "slump";
          w.mouthOpen = true;
          setStatus(w, `¡Le ganó a ${l.bot.name}!`);
          setStatus(l, `Perdió contra ${w.bot.name} 😅`);
        }
        conv.stepUntil = simT + 2.5;
        return;
      }
      conv.game = null;
      a.gamePose = b.gamePose = null;
      a.mouthOpen = b.mouthOpen = false;
      if (conv.i + 1 >= conv.script.length) {
        endConv(conv);
        return;
      }
    }
    conv.i++;
    if (conv.i >= conv.script.length) {
      endConv(conv);
      return;
    }
    const step = conv.script[conv.i];
    if (step.game) {
      conv.game = { phase: "pump" };
      a.gamePose = b.gamePose = "pump";
      say(a, "Piedra…", 1.0);
      say(b, "papel…", 1.6);
      setStatus(a, `Jugando piedra, papel o tijera con ${b.bot.name}`);
      setStatus(b, `Jugando piedra, papel o tijera con ${a.bot.name}`);
      conv.stepUntil = simT + 1.7;
      return;
    }
    const [who, raw] = step;
    const speaker = who === "a" ? a : b, listener = who === "a" ? b : a;
    const text = fill(raw, a.bot.name, b.bot.name);
    const dur = 1.7 + text.length * 0.05;
    say(speaker, text, dur);
    conv.speaker = speaker;
    if (LAUGH_RE.test(text)) {
      laugh(speaker, Math.min(dur, 2.4));
      setStatus(speaker, `Riéndose con ${listener.bot.name}`);
      if (Math.random() < 0.65) {
        laugh(listener, 1.6);
        setStatus(listener, `Riéndose con ${speaker.bot.name}`);
      }
    } else {
      setStatus(speaker, `Charlando con ${listener.bot.name}`);
      if (!listener.laughUntil || listener.laughUntil < simT) setStatus(listener, `Escuchando a ${speaker.bot.name}`);
    }
    conv.stepUntil = simT + dur + 0.35;
  };

  // people at the same place who are not busy start talking
  let encounterAt = 0;
  const checkEncounters = () => {
    for (const place of ["coffee", "tv", "board", "lounge", "water"]) {
      const here = actors.filter((o) => o.state === "away" && o.place === place && !o.conv && simT > o.arrivedAt + 0.9);
      if (here.length >= 2 && Math.random() < 0.9) startConv(here[0], here[1], place);
    }
    const gamers = actors.filter((o) => o.state === "away" && o.place === "game" && !o.conv);
    if (gamers.length >= 2) startConv(gamers[0], gamers[1], "game", [["a", "¿Lista? A la de tres. 😄"], { game: "rps" }]);
  };

  // ------------------------------------------------------ per-frame step ----
  const stepActor = (a, dt) => {
    const r = a.rig, root = r.root, t = simT, p = a.phase;
    // ---- state logic ----
    if (a.state === "work") {
      if (a.hostReq && a.hostReq.state === "away") {
        a.state = "host";
        a.partner = a.hostReq;
        setStatus(a, `Atendiendo a ${a.partner.bot.name}`);
        startConv(a.hostReq, a, "visit");
      } else {
        if (t > a.subUntil) nextSub(a);
        const wantBreak =
          (a.invite && t > a.invite.at && (a.invite.kind === "game" || awayCount() < MAX_AWAY)) ||
          (t > a.breakAt && !a.hostReq && !a.visitorPending && awayCount() < MAX_AWAY && Math.random() < 0.5);
        if (wantBreak) {
          if (a.invite) {
            const inv = a.invite;
            a.invite = null;
            if (a.visitorPending || a.hostReq) {
              if (inv.spot.taken === a) inv.spot.taken = null;
            } else if (!inv.spot.taken || inv.spot.taken === a) {
              inv.spot.taken = a;
              a.pending = { kind: inv.kind, spot: inv.spot };
              startOuting(a);
            }
          } else if (chooseOuting(a)) startOuting(a);
          else a.breakAt = t + rnd(8, 15);
        }
      }
    } else if (a.state === "standup") {
      if (t > a.until) {
        const then = a.then;
        a.then = null;
        then && then();
      }
    } else if (a.state === "walk") {
      const next = a.path[0];
      if (!next) {
        // arrived
        const d = a.dest;
        if (d.kind === "desk") {
          a.state = "sitdown";
          a.until = t + 0.6;
          a.targetYaw = a.desk.seat.yaw;
          a.place = "desk";
          r.hold(null);
          a.mug = false;
        } else if (d.kind === "visit") {
          a.state = "away";
          a.place = "visit";
          a.arrivedAt = t;
          a.targetYaw = d.spot.yaw;
          a.until = t + 30; // the conversation decides when to leave
          setStatus(a, `Visitando a ${d.host.bot.name}`);
          if (d.host.state === "work") d.host.hostReq = a;
          else a.until = t + rnd(1, 2); // host got up — head back
        } else {
          a.state = "away";
          a.place = d.place;
          a.arrivedAt = t;
          a.targetYaw = d.spot.yaw;
          a.stage = 0;
          a.stageAt = t;
          a.stageDur = undefined;
          const [lo, hi] = DWELL[d.place] || [5, 8];
          a.until = t + rnd(lo, hi);
          setStatus(a, placeStatus(a));
        }
      } else {
        const dx = next[0] - root.position.x, dz = next[1] - root.position.z;
        const dist = Math.hypot(dx, dz);
        // give way to somebody right ahead
        let speed = a.mug ? WALK * 0.8 : WALK;
        for (const o of actors) {
          if (o === a || o.state === "work" || o.state === "host") continue;
          const ox = o.rig.root.position.x - root.position.x, oz = o.rig.root.position.z - root.position.z;
          const od = Math.hypot(ox, oz);
          if (od < 0.7 && od > 0.001 && (ox * dx + oz * dz) / (od * dist) > 0.6 && o.idx < a.idx) speed *= 0.3;
        }
        const step = speed * dt;
        if (dist <= step) {
          root.position.x = next[0];
          root.position.z = next[1];
          a.path.shift();
        } else {
          root.position.x += (dx / dist) * step;
          root.position.z += (dz / dist) * step;
          a.targetYaw = Math.atan2(dx, dz);
        }
        a.walkT += dt * 8.5 * (speed / WALK);
      }
    } else if (a.state === "sitdown") {
      if (t > a.until) {
        a.state = "work";
        a.sub = "type";
        a.subUntil = t + rnd(8, 16);
        a.breakAt = t + rnd(25, 60);
        a.partner = null;
        setStatus(a, null);
      }
    } else if (a.state === "away") {
      stepPlace(a, dt);
      if (!a.conv && t > a.until) {
        if (a.place === "visit" && a.partner) {
          a.partner.hostReq = null;
          a.partner.visitorPending = null;
        }
        goHome(a);
      }
    } else if (a.state === "host") {
      // nothing to do: the conversation runs; endConv returns us to work
    }

    // ---- facing ----
    if (a.conv && (a.state === "away" || a.state === "host")) {
      const o = a.conv.a === a ? a.conv.b : a.conv.a;
      const dx = o.rig.root.position.x - root.position.x, dz = o.rig.root.position.z - root.position.z;
      const want = Math.atan2(dx, dz);
      const seated = a.state === "host" || a.place === "lounge";
      if (seated) a.headLook = clamp(angleDiff(a.yaw, want), -1.1, 1.1);
      else {
        a.targetYaw = want;
        a.headLook = 0;
      }
    } else a.headLook = 0;
    a.yaw = angleLerp(a.yaw, a.targetYaw, Math.min(1, 7 * dt));
    root.rotation.y = a.yaw;

    // ---- pose ----
    posture(a, t, p);
    const laughing = t < a.laughUntil;
    r.mouth(laughing || a.mouthOpen ? "open" : "smile");
    r.update(dt, t, a.state === "walk" ? 16 : 9);
    // contact blob follows the hips
    const hips = r.parts.hips;
    a.blob.position.set(root.position.x + Math.sin(a.yaw) * hips.position.z, 0.008, root.position.z + Math.cos(a.yaw) * hips.position.z);
    a.blob.material.opacity = 0.35;

    // solo thought bubbles at the desk
    if (a.state === "work" && a.sub === "type" && t > a.soloAt) {
      a.soloAt = t + rnd(25, 60);
      say(a, pick(SOLO), 2.2);
    }
    if (a.bubble && t > a.bubble.until) hush(a);
  };

  const nextSub = (a) => {
    const t = simT;
    if (a.sub !== "type") {
      a.sub = "type";
      a.subUntil = t + rnd(8, 18);
      setStatus(a, null);
      return;
    }
    const r = Math.random();
    if (r < 0.3) {
      a.sub = "think";
      a.subUntil = t + rnd(3, 5);
      setStatus(a, "Pensando en la siguiente tarea");
    } else if (r < 0.5) {
      a.sub = "sip";
      a.subUntil = t + rnd(2, 3);
      setStatus(a, "Un sorbo de café");
    } else if (r < 0.62) {
      a.sub = "stretch";
      a.subUntil = t + 2.6;
      setStatus(a, "Estirando la espalda");
    } else if (r < 0.75) {
      a.sub = "phone";
      a.subUntil = t + rnd(4, 6);
      setStatus(a, "Revisando el celular");
    } else if (r < 0.88) {
      a.sub = "lean";
      a.subUntil = t + rnd(3, 4);
      setStatus(a, "Tomando un respiro");
    } else {
      a.subUntil = t + rnd(8, 18);
      say(a, pick(SOLO), 2.2);
    }
  };

  const placeStatus = (a) => {
    switch (a.place) {
      case "coffee": return a.stage >= 2 ? "Tomando un café" : "Preparando un café";
      case "lounge": return "Descansando en el lounge";
      case "board": return a.spot === spots.board[0] ? "Dibujando en la pizarra" : "Mirando la pizarra";
      case "tv": return "Mirando el dashboard";
      case "water": return "Tomando agua";
      case "printer": return "Recogiendo una impresión";
      case "window": return "Mirando por la ventana";
      case "game": return "Esperando para jugar";
      default: return "En una pausa";
    }
  };

  /** place-specific micro behaviour while standing/sitting somewhere */
  const stepPlace = (a, dt) => {
    const t = simT;
    if (a.place === "coffee") {
      if (a.stage === 0 && t > a.stageAt + 0.4) {
        a.stage = 1;
        a.stageAt = t;
        if (!a.conv && Math.random() < 0.5) say(a, pick(COFFEE_SOLO), 1.8);
      } else if (a.stage === 1 && t > a.stageAt + 1.6) {
        a.stage = 2;
        a.stageAt = t;
        a.rig.hold("mug");
        a.mug = true;
        a.sipAt = t + rnd(1.5, 3);
        setStatus(a, a.conv ? a.status : "Tomando un café");
        if (!a.conv) a.targetYaw = a.spot === spots.coffee[0] ? -PI / 2 : PI / 2; // turn to the room / the other spot
      } else if (a.stage === 2 && t > a.sipAt) {
        a.stage = 3;
        a.stageAt = t;
      } else if (a.stage === 3 && t > a.stageAt + 1.7) {
        a.stage = 2;
        a.sipAt = t + rnd(3, 7);
      }
    } else if (a.place === "water") {
      if (a.stage === 0 && t > a.stageAt + 1.0) {
        a.stage = 1;
        a.rig.hold("mug");
        a.mug = true;
        a.stageAt = t;
      } else if (a.stage === 1 && t > a.stageAt + 2.2) {
        a.stage = 2;
        a.stageAt = t;
      } else if (a.stage === 2 && t > a.stageAt + 2.5) {
        a.stage = 1;
        a.stageAt = t;
      }
    } else if (a.place === "lounge") {
      if (a.stageDur === undefined) a.stageDur = rnd(3, 6);
      if (a.stage === 0 && t > a.stageAt + a.stageDur) {
        a.stage = 1;
        a.stageAt = t;
        a.stageDur = rnd(4, 7);
        a.rig.hold("phone");
      } else if (a.stage === 1 && t > a.stageAt + a.stageDur) {
        a.stage = 0;
        a.stageAt = t;
        a.stageDur = rnd(3, 6);
        a.rig.hold(null);
      }
    }
  };

  /** choose the pose for this frame */
  const posture = (a, t, p) => {
    const r = a.rig;
    const laughing = t < a.laughUntil;
    const seatedChair = a.state === "work" || a.state === "host" || a.state === "sitdown";
    if (a.state === "standup") return POSES.stand(r, t, p);
    if (a.state === "walk") return POSES.walk(r, t, p, a.walkT, a.mug);
    if (a.state === "sitdown") return POSES.sitIdle(r, t, p);
    if (a.state === "host") {
      if (laughing) return POSES.sitLaugh(r, t, p);
      return POSES.sitHost(r, t, p, a.headLook);
    }
    if (a.state === "work") {
      switch (a.sub) {
        case "think": return POSES.sitThink(r, t, p);
        case "sip": return POSES.sitSip(r, t, p);
        case "stretch": return POSES.sitStretch(r, t, p);
        case "phone": return POSES.sitPhone(r, t, p);
        case "lean": return POSES.sitLean(r, t, p);
        default: return POSES.sitType(r, t, p);
      }
    }
    // away
    if (a.place === "lounge") {
      POSES.sitSofa(r, t, p);
      r.set({ hipsZ: -0.6, headRy: a.headLook });
      if (a.gamePose === "pump") r.set({ shRx: -0.9 + Math.sin(t * 9) * 0.35, elRx: -1.4, shRz: 0.3 });
      else if (a.gamePose === "reveal") r.set({ shRx: -1.1, elRx: -1.0, shRz: 0.3 });
      else if (a.gamePose === "cheer") r.set({ shLx: -2.8, shRx: -2.8, elLx: -0.3, elRx: -0.3, torsoRx: -0.2, headRx: -0.3 });
      else if (a.gamePose === "slump") r.set({ torsoRx: 0.35, headRx: 0.4 });
      else if (laughing) {
        const b = Math.abs(Math.sin(t * 13 + p));
        r.set({ hipsY: HIP_SOFA + b * 0.015, torsoRx: -0.25 + b * 0.05, headRx: -0.3, shLx: -0.6, shRx: -0.6, elLx: -1.7, elRx: -1.7 });
      } else if (a.conv && a.conv.speaker === a) {
        const g = Math.sin(t * 5.5 + p);
        r.set({ shRx: -0.7 + g * 0.25, elRx: -1.35 + Math.cos(t * 4 + p) * 0.25, shRz: 0.35, shRy: -0.3, headRx: 0.03 });
      } else if (a.stage === 1 && !a.conv) r.set({ shRx: -0.85, elRx: -1.95, shRz: 0.2, shRy: -0.25, headRx: 0.4 });
      return;
    }
    if (a.gamePose === "pump") return POSES.pump(r, t, p);
    if (a.gamePose === "reveal") return POSES.reveal(r, t, p);
    if (a.gamePose === "cheer") return POSES.cheer(r, t, p);
    if (a.gamePose === "slump") return POSES.slump(r, t, p);
    if (laughing) return POSES.laugh(r, t, p);
    if (a.conv) {
      if (a.conv.speaker === a) {
        POSES.talk(r, t, p);
        if (a.mug) r.set({ shRx: -0.5, elRx: -1.5, shRz: 0.2, shLx: -0.6 + Math.sin(t * 5 + p) * 0.25, elLx: -1.3, shLz: -0.35 });
      } else {
        if (a.mug) POSES.holdMug(r, t, p);
        else POSES.listen(r, t, p);
        r.set({ headRx: 0.05 + Math.max(0, Math.sin(t * 2.4 + p)) * 0.08 });
      }
      return;
    }
    switch (a.place) {
      case "coffee":
        if (a.stage <= 1) return POSES.press(r, t, p);
        if (a.stage === 3) return POSES.sipStand(r, t, p);
        return POSES.holdMug(r, t, p);
      case "water":
        if (a.stage === 0) return POSES.press(r, t, p);
        if (a.stage === 2) return POSES.sipStand(r, t, p);
        return POSES.holdMug(r, t, p);
      case "board":
        return a.spot === spots.board[0] ? POSES.write(r, t, p) : POSES.crossed(r, t, p);
      case "printer":
        return POSES.printer(r, t, p);
      case "tv":
      case "window":
        return POSES.crossed(r, t, p);
      case "visit":
        return a.mug ? POSES.holdMug(r, t, p) : POSES.stand(r, t, p);
      default:
        return a.mug ? POSES.holdMug(r, t, p) : POSES.stand(r, t, p);
    }
  };

  // ------------------------------------------------------------ picking ----
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hoverId = null, selectedId = null, downAt = null;
  const pickAt = (ev) => {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(allMeshes, false)[0];
    return hit ? hit.object.userData.bot : null;
  };
  let moveEv = null;
  const onMove = (ev) => {
    moveEv = ev;
  };
  const onDown = (ev) => {
    downAt = [ev.clientX, ev.clientY];
  };
  const onUp = (ev) => {
    if (!downAt) return;
    const moved = Math.hypot(ev.clientX - downAt[0], ev.clientY - downAt[1]);
    downAt = null;
    if (moved > 6) return;
    onSelect && onSelect(pickAt(ev));
  };
  renderer.domElement.addEventListener("pointermove", onMove);
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointerup", onUp);
  renderer.domElement.style.cursor = "grab";

  // ------------------------------------------------------- camera focus ----
  const focusTarget = REST_TARGET.clone();
  let focusActor = null;
  let wantDistance = null;
  const restDistance = () => {
    const aspect = camera.aspect || 1.6;
    const base = REST_POS.distanceTo(REST_TARGET);
    return aspect < 1.5 ? base * Math.min(1.7, 1.5 / aspect) : base;
  };
  const setSelected = (id) => {
    selectedId = id;
    focusActor = actors.find((a) => a.bot.id === id) || null;
    wantDistance = focusActor ? 6.5 : restDistance();
    for (const a of actors) a.label.classList.toggle(classes.labelActive, a.bot.id === id);
  };

  // ------------------------------------------------------------- resize ----
  const resize = () => {
    const w = mount.clientWidth || 1, h = mount.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!focusActor) wantDistance = restDistance();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(mount);

  // --------------------------------------------------------------- loop ----
  let simT = 0, last = performance.now(), raf = 0, disposed = false;
  let screenTick = 0, tvTick = 0, clockTick = 0;
  let frames = 0, frameMs = 0;
  const tmp = new THREE.Vector3();
  const projected = new THREE.Vector3();

  const frame = () => {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    const nowMs = performance.now();
    const rawDt = (nowMs - last) / 1000;
    last = nowMs;
    if (document.hidden) return;
    // clamped so a stalled tab never teleports anyone; window.__OFFICE_TIME_SCALE is a test hook
    const dt = Math.min(rawDt, 0.1) * (window.__OFFICE_TIME_SCALE || 1);
    simT += dt;

    for (const a of actors) stepActor(a, dt);
    for (const c of [...convs]) stepConv(c);
    if (simT > encounterAt) {
      encounterAt = simT + 0.5;
      checkEncounters();
    }

    // rings + hover/selection emphasis
    for (const a of actors) {
      const sel = a.bot.id === selectedId, hov = a.bot.id === hoverId;
      const want = sel ? 0.8 + Math.sin(simT * 4) * 0.15 : hov ? 0.45 : 0;
      a.rig.ring.material.opacity = lerp(a.rig.ring.material.opacity, want, 0.15);
      a.rig.ring.position.set(0, 0.012, a.rig.parts.hips.position.z);
      a.rig.shirtMat.emissive.set(a.bot.accent);
      a.rig.shirtMat.emissiveIntensity = lerp(a.rig.shirtMat.emissiveIntensity, sel ? 0.12 : hov ? 0.08 : 0, 0.15);
    }

    // camera glides to the selected person and back
    if (focusActor) {
      focusActor.rig.head.getWorldPosition(tmp);
      tmp.y -= 0.35;
      focusTarget.lerp(tmp, 0.06);
    } else focusTarget.lerp(REST_TARGET, 0.05);
    controls.target.lerp(focusTarget, 0.4);
    if (wantDistance !== null) {
      const d = camera.position.distanceTo(controls.target);
      const nd = lerp(d, wantDistance, 0.05);
      tmp.subVectors(camera.position, controls.target).setLength(nd);
      camera.position.copy(controls.target).add(tmp);
      if (Math.abs(nd - wantDistance) < 0.05) wantDistance = null;
    }
    controls.update();

    // hover (raycast at most once per frame)
    if (moveEv) {
      const id = pickAt(moveEv);
      moveEv = null;
      if (id !== hoverId) {
        hoverId = id;
        renderer.domElement.style.cursor = id ? "pointer" : "grab";
        onHover && onHover(id);
      }
    }

    // live surfaces
    screenTick += dt;
    if (screenTick > 0.3) {
      screenTick = 0;
      for (const s of dynamic.screens) s.draw();
    }
    tvTick += dt;
    if (tvTick > 2) {
      tvTick = 0;
      dynamic.tv && dynamic.tv.draw();
    }
    clockTick += dt;
    if (clockTick > 1 && dynamic.clock) {
      clockTick = 0;
      const d = new Date();
      dynamic.clock.hour.rotation.z = -((d.getHours() % 12) + d.getMinutes() / 60) * (PI / 6);
      dynamic.clock.minute.rotation.z = -(d.getMinutes() + d.getSeconds() / 60) * (PI / 30);
    }
    // dust
    for (let i = 0; i < motes.n; i++) {
      motes.pos[i * 3 + 1] -= motes.vel[i] * dt;
      motes.pos[i * 3] += Math.sin(simT * 0.5 + i) * 0.02 * dt;
      if (motes.pos[i * 3 + 1] < 0.05) motes.pos[i * 3 + 1] = 2.9;
    }
    motes.pts.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);

    // DOM overlay: labels + bubbles anchored above each head
    const w = mount.clientWidth, h = mount.clientHeight;
    for (const a of actors) {
      a.rig.head.getWorldPosition(projected);
      projected.y += 0.62;
      projected.project(camera);
      const behind = projected.z > 1;
      const x = ((projected.x + 1) / 2) * w, y = ((1 - projected.y) / 2) * h;
      a.label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
      a.label.style.opacity = behind ? "0" : "1";
      if (a.bubble) {
        const age = simT - a.bubble.born, left = a.bubble.until - simT;
        const s = Math.min(1, age / 0.18) * (left < 0.2 ? Math.max(0, left / 0.2) : 1);
        a.bubble.el.style.transform = `translate(${x.toFixed(1)}px, ${(y - 30).toFixed(1)}px) translate(-50%, -100%) scale(${s.toFixed(3)})`;
        a.bubble.el.style.opacity = behind ? "0" : String(s);
      }
    }

    // adaptive resolution: drop the pixel ratio when frames run long
    frames++;
    frameMs += rawDt * 1000;
    if (frames >= 90) {
      const avg = frameMs / frames;
      frames = 0;
      frameMs = 0;
      if (avg > 26 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.25);
        renderer.setPixelRatio(dpr);
        resize();
      }
    }
  };
  frame();
  if (window.__OFFICE_DEBUG) window.__OFFICE_DEBUG.info = renderer.info;

  return {
    setSelected,
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      controls.dispose();
      pmrem.dispose();
      for (const a of actors) {
        a.label.remove();
        hush(a);
      }
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        for (const m of mats) {
          for (const k of ["map", "emissiveMap", "bumpMap"]) if (m[k]) m[k].dispose();
          m.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    },
  };
}
