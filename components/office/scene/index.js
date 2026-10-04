// The office demo scene. OfficeDemo.tsx imports this lazily so three.js and
// the addons stay out of the page's first-load bundle.
//
// createOffice() builds the two-storey building (room.js), one character per
// employee (character.js) and runs a life simulation: people work at their
// stations most of the time and take breaks — coffee, the kitchen table, the
// meeting rooms, a training session, phone booths, printer, water cooler, the
// server room, ping-pong, the lounge sofa, bean bags, the lab whiteboard, a
// colleague's desk. Two or more people at the same place talk (speech
// bubbles in the DOM overlay), laugh, play, and go back to work. Walking
// follows per-floor nav grids joined by the staircase. Clickable hotspots and
// a room navigator are exposed to the React shell.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildRoom, roomsFor, roomNamesFor, STAIRS, UPPER_Y, roomAt, underDeck } from "./room.js";
import { buildCharacter, POSES, HIP_CHAIR, HIP_SOFA } from "./character.js";
import { loadAvatars, buildGlbCharacter } from "./rigGlb.js";
import { buildCampus } from "./campus.js";
import { iconSvg } from "../icons.js";
import { scriptsFor, LAUGH_RE, fill } from "./dialogue.js";
import { textsFor, langOf } from "./i18n.js";
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

const MAX_AWAY = 5;
const WALK = 1.15;
// place labels ("la cafetera" / "the coffee machine") live in i18n.js → place
const DWELL = {
  coffee: [9, 16], kitchen: [8, 14], meeting: [20, 30], meeting2: [18, 28], training: [26, 36], booth: [10, 16], printer: [4, 6], water: [5, 8],
  servers: [8, 12], pingpong: [6, 9], tv: [6, 10], lounge: [12, 20], beanbag: [10, 16], nook: [12, 18], visit: [3, 5],
};
// outing kinds → [weight, party size (0 = solo, n = organiser + up to n-1 mates)]
const OUTINGS = (typeof window !== "undefined" && window.__OFFICE_DEBUG && window.__OFFICE_DEBUG.outings) || [
  ["coffee", 22, 2], ["visit", 12, 0], ["meeting", 9, 4], ["lounge", 9, 2], ["pingpong", 8, 2], ["meeting2", 7, 3], ["training", 6, 4],
  ["booth", 6, 0], ["kitchen", 7, 2], ["nook", 6, 2], ["tv", 4, 2], ["printer", 4, 0], ["water", 4, 0], ["servers", 4, 0], ["beanbag", 4, 0],
];
const CONTEXT = { coffee: "coffee", kitchen: "coffee", meeting: "meeting", meeting2: "meeting", training: "training", lounge: "lounge", nook: "lounge", tv: "tv", water: "water", pingpong: "pingpong" };

/**
 * @param lang "es" | "en" — every text the scene renders (signs, hotspot markers,
 *   speech bubbles) or emits (statuses, event lines, room names) is built in
 *   this language. Bot names and roles come already localized in `bots`.
 */
export function createOffice({ mount, overlay, classes, bots, onSelect, onHover, onStatus, onEvent, onHotspot, onRoom, lang = "es" }) {
  // --------------------------------------------------------------- text ----
  lang = langOf(lang);
  const L = textsFor(lang);
  const S = L.status;
  const { SCRIPTS, SOLO, RPS, COFFEE_SOLO, CALL, PP } = scriptsFor(lang);
  /** "a la cafetera" / "to the coffee machine" */
  const to = (kind) => L.to(kind);
  const rooms = roomsFor(lang);
  const roomNames = roomNamesFor(lang);

  // ------------------------------------------------------------ renderer ----
  // Never below 1.75: on a 1× monitor the mullions, railings and chair legs
  // are thinner than a pixel at this distance and shimmer as the camera
  // damps; rendering at 1.75× (then downsampled) steadies them. The adaptive
  // loop below still drops it on slow machines.
  const maxDpr = Math.min(Math.max(window.devicePixelRatio || 1, 1.75), 2);
  let dpr = maxDpr;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor("#e3e9ed", 1); // the fog colour; the sky dome paints over it
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  // near=2: the orbit never gets closer than 4 units, and a longer near plane
  // is what the depth buffer needs to stop wall decals fighting their walls
  const camera = new THREE.PerspectiveCamera(30, 1, 2, 360); // far enough for the campus blocks and the sky
  // seen from the front-left corner, like the reference
  const REST_TARGET = new THREE.Vector3(0.3, 1.4, 1.4);
  // a touch flatter and further than before, so the campus and the blocks
  // behind the back wall are in the frame while the floors stay readable
  const REST_DIR = new THREE.Vector3(-1, 0.82, 1).normalize();
  const REST_DIST = 43;
  camera.position.copy(REST_TARGET).addScaledVector(REST_DIR, REST_DIST);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(REST_TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 4;
  controls.maxDistance = 48;
  controls.minPolarAngle = 0.3;
  controls.maxPolarAngle = 1.35;
  controls.minAzimuthAngle = -PI / 4 - 1.2;
  controls.maxAzimuthAngle = -PI / 4 + 1.2;
  controls.enablePan = false;
  controls.update();

  // ------------------------------------------------------------- lights ----
  const sun = new THREE.DirectionalLight("#fff1d6", 2.4);
  sun.position.set(-10, 18, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 60;
  sun.shadow.camera.left = -17;
  sun.shadow.camera.right = 17;
  sun.shadow.camera.top = 17;
  sun.shadow.camera.bottom = -17;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.05;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight("#dbe7ff", "#7a6a55", 0.9));
  const fillLight = new THREE.DirectionalLight("#ffffff", 0.45);
  fillLight.position.set(-12, 8, 14);
  scene.add(fillLight);

  // --------------------------------------------------------------- room ----
  const room = buildRoom(scene, bots, lang);
  buildCampus(scene, room.materials);
  const { stations, spots, hotspots, nav0, nav1, upper, dyn } = room;
  const navOf = (floor) => (floor ? nav1 : nav0);
  const floorY = (floor) => (floor ? UPPER_Y : 0);
  /** height of a body on the stairs at x: the tread top, rising to the next one over the last 40% of each tread */
  const stairY = (x) => {
    const sd = (STAIRS.x1 - STAIRS.x0) / 20, sr = UPPER_Y / 20;
    const u = (x - STAIRS.x0) / sd;
    if (u <= -1) return 0;
    if (u >= 20) return UPPER_Y;
    const k = Math.floor(u), f = u - k;
    const t = f < 0.6 ? 0 : (f - 0.6) / 0.4;
    return Math.min(UPPER_Y, sr * (k + 1 + t * t * (3 - 2 * t)));
  };

  // hotspot pick boxes (invisible) + DOM markers
  const pickables = [];
  const hotMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
  for (const h of hotspots) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(h.w, h.h, h.d), hotMat);
    m.position.set(h.x, h.y, h.z);
    m.userData.hotspot = h.id;
    (h.floor ? upper : scene).add(m);
    pickables.push(m);
    const el = document.createElement("button");
    el.type = "button";
    el.className = classes.marker;
    el.innerHTML = `<span class="${classes.markerIcon}">${iconSvg(h.id)}</span><span class="${classes.markerName}">${h.name}</span>`;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onHotspot && onHotspot(h.id);
    });
    overlay.appendChild(el);
    h.el = el;
    h.anchor = new THREE.Vector3(h.x, h.y + h.h / 2 + 0.2, h.z);
  }
  // desks are hotspots too: clicking one opens its employee
  for (const st of stations) {
    const f = new THREE.Vector3(Math.sin(st.seat.yaw), 0, Math.cos(st.seat.yaw));
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.8), hotMat);
    m.position.set(st.seat.x + f.x * 0.65, st.seat.y + 0.6, st.seat.z + f.z * 0.65);
    m.rotation.y = st.seat.yaw;
    m.userData.bot = st.bot.id;
    (st.floor ? upper : scene).add(m);
    pickables.push(m);
  }

  // --------------------------------------------------------- characters ----
  const blobTex = blobTexture();
  const actors = [];
  const makeActor = (bot, i, templates) => {
    const rig = templates ? buildGlbCharacter(bot, templates, i) : buildCharacter(bot);
    const st = stations[i];
    rig.root.position.set(st.seat.x, st.seat.y, st.seat.z);
    rig.root.rotation.y = st.seat.yaw;
    scene.add(rig.root);
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.35 }));
    blob.rotation.x = -PI / 2;
    blob.renderOrder = 1;
    scene.add(blob);
    const a = {
      bot, rig, st, idx: i, blob, floor: st.floor,
      state: "work", sub: "type", subUntil: rnd(4, 12),
      breakAt: rnd(8, 45), until: 0, arrivedAt: 0,
      path: [], dest: null, place: "desk", spot: null, partner: null, conv: null,
      yaw: st.seat.yaw, targetYaw: st.seat.yaw, walkT: 0, phase: Math.random() * 20,
      mug: false, laughUntil: 0, mouthOpen: false, hostReq: null, invite: null, visitorPending: null,
      status: undefined, headLook: 0, bubble: null, soloAt: rnd(15, 40), label: null, lw: 0, lh: 0, sx: undefined, sy: 0, ly: undefined,
      leaveVia: null,
    };
    const el = document.createElement("div");
    el.className = classes.label;
    el.innerHTML = `<i style="background:${bot.accent}"></i><b>${bot.name}</b><span>${bot.role}</span>`;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onSelect && onSelect(bot.id);
    });
    overlay.appendChild(el);
    a.label = el;
    pickables.push(...rig.meshes);
    actors.push(a);
    return a;
  };
  // the people: Ready Player Me bodies once their files arrive, the built-in rig if they never do
  const peopleReady = loadAvatars().then(
    (templates) => bots.forEach((bot, i) => makeActor(bot, i, templates)),
    (err) => {
      console.warn("office: avatars unavailable, using the built-in people", err);
      bots.forEach((bot, i) => makeActor(bot, i, null));
    }
  );

  const setStatus = (a, text) => {
    if (a.status === text) return;
    a.status = text;
    onStatus && onStatus(a.bot.id, text);
  };
  const emit = (evt) => onEvent && onEvent({ t: Date.now(), ...evt });
  const awayCount = () => actors.filter((o) => o.state !== "work" && o.state !== "host").length;

  // ------------------------------------------------------------ bubbles ----
  const say = (a, text, dur, log) => {
    if (a.bubble) a.bubble.el.remove();
    const el = document.createElement("div");
    const emojiOnly = !/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(text);
    el.className = classes.bubble + (emojiOnly ? " " + classes.bubbleEmoji : "");
    el.style.setProperty("--c", a.bot.accent);
    el.textContent = text;
    overlay.appendChild(el);
    a.bubble = { el, until: simT + dur, born: simT, w: el.offsetWidth, h: el.offsetHeight };
    if (log) emit({ type: "line", bot: a.bot.id, to: log.to, place: log.place, text });
  };
  const hush = (a) => {
    if (a.bubble) a.bubble.el.remove();
    a.bubble = null;
  };
  const laugh = (a, dur = 1.6) => {
    a.laughUntil = simT + dur;
  };

  // ----------------------------------------------------------- routing ----
  /** path of {x, z, y} points from the actor to (x, z) on `floor`, via the stairs when needed */
  const route = (a, x, z, floor) => {
    const p = a.rig.root.position;
    const from = a.floor;
    const pts = [];
    // leaving a seat: step back to the approach point first (behind the chair)
    let sx = p.x, sz = p.z;
    if (a.leaveVia) {
      pts.push({ x: a.leaveVia.x, z: a.leaveVia.z, y: floorY(from) });
      sx = a.leaveVia.x;
      sz = a.leaveVia.z;
      a.leaveVia = null;
    }
    if (from === floor) {
      for (const [px, pz] of navOf(floor).findPath(sx, sz, x, z)) pts.push({ x: px, z: pz, y: floorY(floor) });
      return pts;
    }
    const [p0x, p0z] = STAIRS.portal0, [p1x, p1z] = STAIRS.portal1;
    if (from === 0) {
      for (const [px, pz] of nav0.findPath(sx, sz, p0x, p0z)) pts.push({ x: px, z: pz, y: 0 });
      pts.push({ x: STAIRS.bottom[0], z: STAIRS.bottom[1], y: 0 }, { x: STAIRS.top[0], z: STAIRS.top[1], y: UPPER_Y }, { x: p1x, z: p1z, y: UPPER_Y });
      for (const [px, pz] of nav1.findPath(p1x, p1z, x, z)) pts.push({ x: px, z: pz, y: UPPER_Y });
    } else {
      for (const [px, pz] of nav1.findPath(sx, sz, p1x, p1z)) pts.push({ x: px, z: pz, y: UPPER_Y });
      pts.push({ x: STAIRS.top[0], z: STAIRS.top[1], y: UPPER_Y }, { x: STAIRS.bottom[0], z: STAIRS.bottom[1], y: 0 }, { x: p0x, z: p0z, y: 0 });
      for (const [px, pz] of nav0.findPath(p0x, p0z, x, z)) pts.push({ x: px, z: pz, y: 0 });
    }
    return pts;
  };
  /** walk to (x, z) on `floor`; `final` is a last straight step into a seat from its approach point */
  const goTo = (a, x, z, floor, dest, final) => {
    a.path = route(a, x, z, floor);
    if (final) a.path.push({ x: final.x, z: final.z, y: floorY(floor) });
    a.dest = dest;
    a.state = "walk";
  };
  const leaveSpot = (a) => {
    if (a.spot) a.spot.taken = null;
    a.spot = null;
  };
  const goHome = (a) => {
    if (a.spot && a.spot.approach) a.leaveVia = a.spot.approach;
    leaveSpot(a);
    a.place = "walk";
    goTo(a, a.st.approach.x, a.st.approach.z, a.st.floor, { kind: "desk" }, a.st.seat);
    setStatus(a, a.st.floor !== a.floor ? (a.st.floor ? S.upToDesk : S.downToDesk) : S.backToDesk);
  };
  const standUp = (a, then) => {
    a.leaveVia = a.st.approach;
    a.state = "standup";
    a.until = simT + (a.st.kind === "stand" ? 0.2 : 0.55);
    a.then = then;
  };

  // ----------------------------------------------------------- outings ----
  const pickMates = (a, n, slack = 0) => {
    const c = actors.filter((o) => o !== a && o.state === "work" && !o.invite && !o.hostReq && !o.visitorPending && o.bot.id !== "ana");
    const out = [];
    while (c.length && out.length < n && awayCount() + out.length + 2 <= MAX_AWAY + slack) out.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]);
    return out;
  };
  const chooseOuting = (a) => {
    const total = OUTINGS.reduce((s, o) => s + o[1], 0);
    let r = Math.random() * total, start = 0;
    for (let i = 0; i < OUTINGS.length; i++) {
      r -= OUTINGS[i][1];
      if (r <= 0) {
        start = i;
        break;
      }
    }
    const order = [...OUTINGS].sort(() => Math.random() - 0.5);
    const tries = [OUTINGS[start], ...order];
    for (const [kind, , party] of tries) {
      if (a.bot.id === "ana" && kind !== "coffee" && kind !== "water" && kind !== "printer" && kind !== "visit") continue; // the front desk stays close
      if (kind === "servers" && !["nicolas", "tomas", "andres"].includes(a.bot.id) && Math.random() < 0.7) continue;
      if (kind === "visit") {
        const hosts = actors.filter((o) => o !== a && o.state === "work" && !o.visitorPending && !o.hostReq && o.breakAt - simT > 10 && o.st.visit.length);
        if (!hosts.length) continue;
        const host = pick(hosts);
        host.visitorPending = a;
        host.breakAt += 30;
        const p = a.rig.root.position;
        const v = host.st.visit.reduce((best, c) => (Math.hypot(c.x - p.x, c.z - p.z) < Math.hypot(best.x - p.x, best.z - p.z) ? c : best));
        a.pending = { kind: "visit", host, spot: v };
        return true;
      }
      const list = kind === "training" ? [...spots.trainer, ...spots.trainee] : spots[kind];
      if (!list) continue;
      const free = list.filter((s) => !s.taken);
      if (kind === "training" && free[0] !== spots.trainer[0]) continue; // the trainer's spot must be free
      if (!free.length) continue;
      if (party >= 2) {
        const group = kind === "training" || kind === "meeting" || kind === "meeting2";
        const need = kind === "pingpong" ? 1 : group ? Math.min(free.length - 1, 2 + Math.floor(Math.random() * 2)) : Math.min(free.length - 1, Math.random() < 0.65 ? 1 : 0);
        if (free.length < need + 1) continue;
        const mates = need ? pickMates(a, need, kind === "pingpong" ? 1 : 0) : [];
        if (mates.length < (kind === "pingpong" || group ? 1 : 0)) continue;
        // organiser takes the first spot (trainer / head of table), mates follow
        free[0].taken = a;
        a.pending = { kind, spot: free[0] };
        mates.forEach((m, k) => {
          free[k + 1].taken = m;
          m.invite = { kind, spot: free[k + 1], at: simT + rnd(2, 7) };
        });
        return true;
      }
      free[0].taken = a;
      a.pending = { kind, spot: free[0] };
      return true;
    }
    return false;
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
        goTo(a, p.spot.x, p.spot.z, p.spot.floor, { kind: "visit", host: p.host, spot: p.spot });
        setStatus(a, S.goingToDeskOf(p.host.bot.name));
      } else {
        a.spot = p.spot;
        a.place = p.kind;
        const via = p.spot.approach;
        goTo(a, via ? via.x : p.spot.x, via ? via.z : p.spot.z, p.spot.floor, { kind: "spot", place: p.kind, spot: p.spot }, via ? p.spot : null);
        const up = p.spot.floor !== a.floor;
        setStatus(a, up ? (p.spot.floor ? S.upTo(to(p.kind)) : S.downTo(to(p.kind))) : S.walkingTo(to(p.kind)));
      }
    });
  };

  // ------------------------------------------------------ conversations ----
  const convs = [];
  const startConv = (list, context, script) => {
    const people = list.filter((x) => !x.conv);
    if (people.length < 2) return;
    const pool = SCRIPTS[context] || SCRIPTS.coffee;
    const s = script || pick(pool.filter((x) => !people.some((p) => p.lastScript === x))) || pick(pool);
    for (const p of people) p.lastScript = s;
    const conv = { people, a: people[0], b: people[1], context, script: s, i: -1, stepUntil: simT + 0.5, game: null, speaker: null };
    for (const p of people) p.conv = conv;
    convs.push(conv);
    const names = (x) => people.filter((p) => p !== x).map((p) => p.bot.name).join(", ");
    for (const p of people) setStatus(p, context === "meeting" ? S.inMeetingWith(names(p)) : context === "training" ? (p === people[0] ? S.givingTraining : S.inTraining) : S.chattingWith(names(p)));
    if (people.length > 2) emit({ type: "meeting", place: people[0].place, bots: people.map((p) => p.bot.id) });
  };
  const endConv = (conv) => {
    for (const x of conv.people) {
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
    if (conv.game && conv.game.kind === "pingpong") {
      room.pingpong.ball.visible = false;
      for (const x of conv.people) x.rig.hold(null);
    }
    convs.splice(convs.indexOf(conv), 1);
  };
  const stepConv = (conv) => {
    const { people } = conv;
    if (people.some((p) => p.state === "walk" || p.state === "standup")) return;
    if (simT < conv.stepUntil) return;
    if (conv.game) return stepGame(conv);
    conv.i++;
    if (conv.i >= conv.script.length) return endConv(conv);
    const step = conv.script[conv.i];
    if (step.game) {
      startGame(conv, step.game);
      return;
    }
    const [who, raw] = step;
    const idx = { a: 0, b: 1, c: 2, d: 3 }[who] % people.length;
    const speaker = people[idx];
    const listener = people[(idx + 1) % people.length];
    const text = fill(raw, conv.a.bot.name, conv.b.bot.name);
    const dur = 1.7 + text.length * 0.05;
    say(speaker, text, dur, { to: listener.bot.id, place: speaker.place });
    conv.speaker = speaker;
    if (LAUGH_RE.test(text)) {
      laugh(speaker, Math.min(dur, 2.4));
      if (people.length === 2) setStatus(speaker, S.laughingWith(listener.bot.name));
      for (const o of people) if (o !== speaker && Math.random() < 0.6) laugh(o, 1.6);
    }
    conv.stepUntil = simT + dur + 0.35;
  };

  // ---- games: rock-paper-scissors and ping-pong ----
  const startGame = (conv, kind) => {
    const { a, b } = conv;
    if (kind === "rps") {
      conv.game = { kind, phase: "pump" };
      a.gamePose = b.gamePose = "pump";
      say(a, L.bubble.rock, 1.0);
      say(b, L.bubble.paper, 1.6);
      setStatus(a, S.playingRpsWith(b.bot.name));
      setStatus(b, S.playingRpsWith(a.bot.name));
      conv.stepUntil = simT + 1.7;
    } else {
      conv.game = { kind: "pingpong", phase: "rally", hits: 0, hitsToPoint: 3 + Math.floor(Math.random() * 4), toward: 1, hitAt: simT, score: [0, 0], swing: [0, 0] };
      a.rig.hold("paddle");
      b.rig.hold("paddle");
      room.pingpong.ball.visible = true;
      setStatus(a, S.playingPingpongWith(b.bot.name));
      setStatus(b, S.playingPingpongWith(a.bot.name));
      conv.stepUntil = simT;
    }
  };
  const stepGame = (conv) => {
    const g = conv.game, { a, b } = conv;
    if (g.kind === "rps") {
      if (g.phase === "pump") {
        g.phase = "reveal";
        g.ha = Math.floor(Math.random() * 3);
        g.hb = Math.floor(Math.random() * 3);
        say(a, RPS.hands[g.ha], 2.6);
        say(b, RPS.hands[g.hb], 2.6);
        a.gamePose = b.gamePose = "reveal";
        conv.stepUntil = simT + 1.1;
      } else if (g.phase === "reveal") {
        g.phase = "result";
        const d = (g.ha - g.hb + 3) % 3;
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
          setStatus(w, S.beat(l.bot.name));
          setStatus(l, S.lostTo(w.bot.name));
          emit({ type: "game", game: "rps", winner: w.bot.id, loser: l.bot.id });
        }
        conv.stepUntil = simT + 2.5;
      } else {
        conv.game = null;
        a.gamePose = b.gamePose = null;
        a.mouthOpen = b.mouthOpen = false;
        if (conv.i + 1 >= conv.script.length) endConv(conv);
        else conv.stepUntil = simT;
      }
      return;
    }
    // ping-pong: the ball goes back and forth; every few hits somebody scores; first to 3 wins
    const flight = 0.75;
    if (g.phase === "rally") {
      if (simT - g.hitAt >= flight) {
        g.hitAt = simT;
        g.hits++;
        g.toward = -g.toward;
        g.swing[g.toward === 1 ? 0 : 1] = simT; // the receiver swings when the ball arrives
        if (g.hits >= g.hitsToPoint) {
          const scorer = Math.random() < 0.5 ? 0 : 1;
          g.score[scorer]++;
          say(conv.people[scorer], `${pick(PP.point)} ${g.score.join(" – ")}`, 1.8);
          conv.people[1 - scorer].gamePose = "miss";
          g.phase = "point";
          g.pointAt = simT;
          g.hits = 0;
          g.hitsToPoint = 3 + Math.floor(Math.random() * 4);
        }
      }
    } else if (g.phase === "point") {
      if (simT - g.pointAt > 1.6) {
        conv.people[0].gamePose = conv.people[1].gamePose = null;
        if (Math.max(...g.score) >= 3) {
          const wi = g.score[0] > g.score[1] ? 0 : 1;
          const w = conv.people[wi], l = conv.people[1 - wi];
          const s = `${g.score[wi]}–${g.score[1 - wi]}`;
          say(w, pick(PP.win).replace("{s}", s), 2.6);
          say(l, pick(PP.lose).replace("{s}", s), 2.6);
          w.gamePose = "cheer";
          l.gamePose = "slump";
          w.mouthOpen = true;
          setStatus(w, S.wonPingpong(s, l.bot.name));
          setStatus(l, S.lostPingpong(s, w.bot.name));
          emit({ type: "pingpong", winner: w.bot.id, loser: l.bot.id, score: s });
          room.pingpong.ball.visible = false;
          g.phase = "over";
          g.overAt = simT;
        } else {
          g.phase = "rally";
          g.hitAt = simT;
        }
      }
    } else if (g.phase === "over" && simT - g.overAt > 2.6) {
      conv.people[0].gamePose = conv.people[1].gamePose = null;
      conv.people[0].mouthOpen = conv.people[1].mouthOpen = false;
      endConv(conv);
    }
  };
  const _h1 = new THREE.Vector3(), _h2 = new THREE.Vector3();
  const updateBall = () => {
    for (const c of convs) {
      const g = c.game;
      if (!g || g.kind !== "pingpong" || g.phase !== "rally") continue;
      const from = g.toward === 1 ? c.people[0] : c.people[1], to = g.toward === 1 ? c.people[1] : c.people[0];
      from.rig.parts.elR.getWorldPosition(_h1);
      to.rig.parts.elR.getWorldPosition(_h2);
      const k = clamp((simT - g.hitAt) / 0.75, 0, 1);
      const ball = room.pingpong.ball;
      ball.position.lerpVectors(_h1, _h2, k);
      ball.position.y = lerp(_h1.y, _h2.y, k) + Math.sin(k * PI) * 0.35 - 0.15;
    }
  };

  // people at the same place who are not busy start talking (3+ = a group)
  let encounterAt = 0;
  const spotsOf = (place) => (place === "training" ? [...spots.trainer, ...spots.trainee] : spots[place] || []);
  const checkEncounters = () => {
    for (const place of ["coffee", "kitchen", "tv", "lounge", "nook", "water", "meeting", "meeting2", "training"]) {
      const here = actors.filter((o) => o.state === "away" && o.place === place && !o.conv && simT > o.arrivedAt + 0.9);
      if (here.length >= 2 && Math.random() < 0.9) {
        const order = spotsOf(place);
        here.sort((p, q) => order.indexOf(p.spot) - order.indexOf(q.spot)); // the organiser speaks first
        startConv(here, CONTEXT[place] || "coffee");
      }
    }
    const pp = actors.filter((o) => o.state === "away" && o.place === "pingpong" && !o.conv);
    if (pp.length >= 2) startConv(pp, "pingpong", [...pick(SCRIPTS.pingpong), { game: "pingpong" }]);
  };

  // ------------------------------------------------------ per-frame step ----
  const stepActor = (a, dt) => {
    const r = a.rig, root = r.root, t = simT, p = a.phase;
    a.floor = root.position.y > 1.8 ? 1 : 0;
    if (a.state === "work") {
      if (a.hostReq && a.hostReq.state === "away") {
        a.state = "host";
        a.partner = a.hostReq;
        setStatus(a, S.hosting(a.partner.bot.name));
        startConv([a.hostReq, a], "visit");
      } else {
        if (t > a.subUntil) nextSub(a);
        const wantBreak =
          (a.invite && t > a.invite.at) ||
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
        const d = a.dest;
        if (d.kind === "desk") {
          a.state = "sitdown";
          a.until = t + (a.st.kind === "stand" ? 0.2 : 0.6);
          a.targetYaw = a.st.seat.yaw;
          a.place = "desk";
          r.hold(null);
          a.mug = false;
          emit({ type: "back", bot: a.bot.id });
        } else if (d.kind === "visit") {
          a.state = "away";
          a.place = "visit";
          a.arrivedAt = t;
          a.targetYaw = d.spot.yaw;
          a.until = t + 30;
          setStatus(a, S.visiting(d.host.bot.name));
          emit({ type: "visit", bot: a.bot.id, host: d.host.bot.id });
          if (d.host.state === "work") d.host.hostReq = a;
          else a.until = t + rnd(1, 2);
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
          emit({ type: "break", bot: a.bot.id, place: d.place });
          if (d.place === "printer") emit({ type: "print", bot: a.bot.id });
        }
      } else {
        // speed: slower with a mug or on the stairs; give way to somebody right ahead
        const dx0 = next.x - root.position.x, dz0 = next.z - root.position.z;
        const dist0 = Math.hypot(dx0, dz0) || 0.001;
        const onStairs0 = Math.abs(next.y - root.position.y) > 0.01;
        let speed = a.mug ? WALK * 0.8 : onStairs0 ? WALK * 0.7 : WALK;
        for (const o of actors) {
          if (o === a || o.state === "work" || o.state === "host") continue;
          const ox = o.rig.root.position.x - root.position.x, oz = o.rig.root.position.z - root.position.z;
          const od = Math.hypot(ox, oz);
          if (od < 0.75 && od > 0.001 && Math.abs(o.rig.root.position.y - root.position.y) < 1 && (ox * dx0 + oz * dz0) / (od * dist0) > 0.6 && o.idx < a.idx) speed *= 0.25;
        }
        a.walkSpeed = speed;
        // consume the whole step, across several waypoints if the frame is long
        let remaining = speed * dt;
        while (remaining > 0 && a.path.length) {
          const n = a.path[0];
          const dx = n.x - root.position.x, dz = n.z - root.position.z;
          const dist = Math.hypot(dx, dz);
          const onStairs = Math.abs(n.y - root.position.y) > 0.01;
          if (dist <= remaining) {
            root.position.set(n.x, n.y, n.z);
            remaining -= dist;
            a.path.shift();
          } else {
            const k = remaining / dist;
            root.position.x += dx * k;
            root.position.z += dz * k;
            if (onStairs) root.position.y = stairY(root.position.x);
            a.targetYaw = Math.atan2(dx, dz);
            remaining = 0;
          }
        }
        a.walkT += dt * 7.0 * (speed / WALK);
      }
    } else if (a.state === "sitdown") {
      if (t > a.until) {
        a.state = "work";
        a.sub = "type";
        a.subUntil = t + rnd(8, 16);
        a.breakAt = t + rnd(30, 75);
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
        if (a.place === "booth") emit({ type: "call", bot: a.bot.id });
        goHome(a);
      }
    }

    // ---- facing ----
    if (a.conv && (a.state === "away" || a.state === "host")) {
      const others = a.conv.people.filter((o) => o !== a);
      const target = a.conv.speaker && a.conv.speaker !== a ? a.conv.speaker : others[0];
      const dx = target.rig.root.position.x - root.position.x, dz = target.rig.root.position.z - root.position.z;
      const want = Math.atan2(dx, dz);
      const seated = a.state === "host" ? a.st.kind !== "stand" : !!(a.spot && a.spot.sit);
      if (seated) a.headLook = clamp(angleDiff(a.yaw, want), -1.1, 1.1);
      else if (a.place === "pingpong") a.headLook = 0;
      else {
        a.targetYaw = want;
        a.headLook = 0;
      }
    } else if (a.state === "host" && a.partner) {
      const dx = a.partner.rig.root.position.x - root.position.x, dz = a.partner.rig.root.position.z - root.position.z;
      const want = Math.atan2(dx, dz);
      if (a.st.kind === "stand") a.targetYaw = want;
      else a.headLook = clamp(angleDiff(a.yaw, want), -1.1, 1.1);
    } else a.headLook = 0;
    a.yaw = angleLerp(a.yaw, a.targetYaw, Math.min(1, 7 * dt));
    root.rotation.y = a.yaw;

    // ---- pose ----
    posture(a, t, p);
    const laughing = t < a.laughUntil;
    r.mouth(laughing || a.mouthOpen ? "open" : "smile");
    // the motion-capture bodies play a clip under the pose: walking, talking (the speaker, standing) or idling
    if (r.motion) r.motion(a.state === "walk" ? "walk" : a.conv && a.conv.speaker === a && !laughing ? "talk" : "idle", a.state === "walk" ? (a.walkSpeed || WALK) / WALK : 1);
    r.update(dt, t, a.state === "walk" ? 16 : 9);
    const hips = r.parts.hips;
    a.blob.position.set(root.position.x + Math.sin(a.yaw) * hips.position.z, root.position.y + 0.04, root.position.z + Math.cos(a.yaw) * hips.position.z);

    if (a.state === "work" && a.sub === "type" && t > a.soloAt) {
      a.soloAt = t + rnd(30, 70);
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
      emit({ type: "task", bot: a.bot.id });
      return;
    }
    const r = Math.random();
    if (r < 0.3) {
      a.sub = "think";
      a.subUntil = t + rnd(3, 5);
      setStatus(a, S.thinking);
    } else if (r < 0.5) {
      a.sub = "sip";
      a.subUntil = t + rnd(2, 3);
      setStatus(a, S.sip);
    } else if (r < 0.62) {
      a.sub = "stretch";
      a.subUntil = t + 2.6;
      setStatus(a, S.stretch);
    } else if (r < 0.75) {
      a.sub = "phone";
      a.subUntil = t + rnd(4, 6);
      setStatus(a, S.phone);
    } else if (r < 0.88) {
      a.sub = "lean";
      a.subUntil = t + rnd(3, 4);
      setStatus(a, S.breather);
    } else {
      a.subUntil = t + rnd(8, 18);
      say(a, pick(SOLO), 2.2);
    }
  };

  const placeStatus = (a) => {
    switch (a.place) {
      case "coffee": return a.stage >= 2 ? S.drinkingCoffee : S.makingCoffee;
      case "kitchen": return S.kitchen;
      case "meeting": return S.meeting;
      case "meeting2": return S.meeting2;
      case "training": return a.spot === spots.trainer[0] ? S.preparingTraining : S.inTraining;
      case "booth": return S.booth;
      case "printer": return S.printer;
      case "water": return S.water;
      case "servers": return S.servers;
      case "pingpong": return S.pingpong;
      case "tv": return S.tv;
      case "lounge": return S.lounge;
      case "beanbag": return S.beanbag;
      case "nook": return S.nook;
      default: return S.pause;
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
        emit({ type: "coffee", bot: a.bot.id });
        if (!a.conv) {
          setStatus(a, S.drinkingCoffee);
          a.targetYaw = a.spot === spots.coffee[0] ? PI / 2 : -PI / 2;
        }
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
    } else if (a.place === "lounge" || a.place === "beanbag" || a.place === "nook") {
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
    } else if (a.place === "booth") {
      if (a.stageDur === undefined) a.stageDur = rnd(2, 4);
      if (t > a.stageAt + a.stageDur) {
        a.stageAt = t;
        a.stageDur = rnd(3, 5);
        say(a, pick(CALL), 2.4);
      }
    } else if (a.place === "servers") {
      if (a.stage === 0 && t > a.stageAt + 1.5) {
        a.stage = 1;
        a.rig.hold("phone");
        say(a, L.bubble.allGreen, 2);
      }
    }
  };

  /** choose the pose for this frame */
  const posture = (a, t, p) => {
    const r = a.rig;
    const laughing = t < a.laughUntil;
    const standing = a.st.kind === "stand";
    if (a.state === "standup") return POSES.stand(r, t, p);
    if (a.state === "walk") return POSES.walk(r, t, p, a.walkT, a.mug);
    if (a.state === "sitdown") return standing ? POSES.stand(r, t, p) : POSES.sitIdle(r, t, p);
    if (a.state === "host") {
      if (standing) return laughing ? POSES.laugh(r, t, p) : POSES.listen(r, t, p);
      return laughing ? POSES.sitLaugh(r, t, p) : POSES.sitHost(r, t, p, a.headLook);
    }
    if (a.state === "work") {
      if (standing) {
        switch (a.sub) {
          case "think": return POSES.standThink(r, t, p);
          case "sip": return POSES.sipStand(r, t, p);
          case "stretch": POSES.stand(r, t, p); return r.set({ shLx: -2.8, shRx: -2.8, shLz: -0.35, shRz: 0.35, elLx: -0.2, elRx: -0.2, torsoRx: -0.15, headRx: -0.3 });
          case "phone": return POSES.standPhone(r, t, p);
          case "lean": return POSES.crossed(r, t, p);
          default: return POSES.standType(r, t, p);
        }
      }
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
    const sitBack = a.spot && a.spot.sit;
    if (sitBack) {
      const sofa = a.place === "lounge" || a.place === "nook";
      if (a.spot.low) POSES.sitLow(r, t, p, 0.55, -a.spot.sit);
      else if (sofa) {
        POSES.sitSofa(r, t, p);
        r.set({ hipsZ: -a.spot.sit });
      } else POSES.sitIdle(r, t, p, HIP_CHAIR, -a.spot.sit);
      r.set({ headRy: a.headLook });
      const seatY = a.spot.low ? 0.55 : sofa ? HIP_SOFA : HIP_CHAIR;
      if (a.gamePose === "pump") r.set({ shRx: -0.9 + Math.sin(t * 9) * 0.35, elRx: -1.4, shRz: 0.3 });
      else if (a.gamePose === "reveal") r.set({ shRx: -1.1, elRx: -1.0, shRz: 0.3 });
      else if (a.gamePose === "cheer") r.set({ shLx: -2.8, shRx: -2.8, elLx: -0.3, elRx: -0.3, torsoRx: -0.2, headRx: -0.3 });
      else if (a.gamePose === "slump") r.set({ torsoRx: 0.35, headRx: 0.4 });
      else if (laughing) {
        const b = Math.abs(Math.sin(t * 13 + p));
        r.set({ hipsY: seatY + b * 0.015, torsoRx: -0.25 + b * 0.05, headRx: -0.3, shLx: -0.6, shRx: -0.6, elLx: -1.7, elRx: -1.7 });
      } else if (a.conv && a.conv.speaker === a) {
        const g = Math.sin(t * 5.5 + p);
        r.set({ shRx: -0.7 + g * 0.25, elRx: -1.35 + Math.cos(t * 4 + p) * 0.25, shRz: 0.35, shRy: -0.3, headRx: 0.03, torsoRx: 0.05 });
      } else if (a.conv) r.set({ headRx: 0.05 + Math.max(0, Math.sin(t * 2.4 + p)) * 0.08 });
      else if (a.stage === 1 && (sofa || a.place === "beanbag")) r.set({ shRx: -0.85, elRx: -1.95, shRz: 0.2, shRy: -0.25, headRx: 0.4 });
      return;
    }
    if (a.gamePose === "pump") return POSES.pump(r, t, p);
    if (a.gamePose === "reveal") return POSES.reveal(r, t, p);
    if (a.gamePose === "cheer") return POSES.cheer(r, t, p);
    if (a.gamePose === "slump") return POSES.slump(r, t, p);
    if (a.gamePose === "miss") {
      POSES.ready(r, t, p);
      return r.set({ headRx: 0.4, torsoRx: 0.25 });
    }
    if (a.conv && a.conv.game && a.conv.game.kind === "pingpong" && a.conv.game.phase !== "over") {
      const g = a.conv.game, k = clamp((t - g.swing[a.conv.people.indexOf(a)]) / 0.45, 0, 1);
      return k < 1 ? POSES.swing(r, t, p, k) : POSES.ready(r, t, p);
    }
    if (laughing) return POSES.laugh(r, t, p);
    if (a.conv) {
      const trainer = a.place === "training" && a.spot === spots.trainer[0];
      if (a.conv.speaker === a) {
        if (trainer && Math.sin(t * 0.7) > 0) return POSES.write(r, t, p);
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
      case "training":
        return POSES.write(r, t, p);
      case "printer":
        return POSES.printer(r, t, p);
      case "booth":
        return POSES.call(r, t, p);
      case "servers":
        return a.stage ? POSES.standPhone(r, t, p) : POSES.crossed(r, t, p);
      case "pingpong":
        return POSES.ready(r, t, p);
      case "tv":
      case "kitchen":
        return a.mug ? POSES.holdMug(r, t, p) : POSES.crossed(r, t, p);
      default:
        return a.mug ? POSES.holdMug(r, t, p) : POSES.stand(r, t, p);
    }
  };

  // ------------------------------------------------------------ picking ----
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hoverId = null, hoverHot = null, selectedId = null, downAt = null;
  const pickAt = (ev) => {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    for (const h of hits) {
      if (!h.object.visible || !h.object.parent.visible) continue;
      if (h.object.userData.bot) return { bot: h.object.userData.bot };
      if (h.object.userData.hotspot) return { hotspot: h.object.userData.hotspot };
    }
    return null;
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
    const hit = pickAt(ev);
    if (hit && hit.hotspot) onHotspot && onHotspot(hit.hotspot);
    else onSelect && onSelect(hit ? hit.bot : null);
  };
  renderer.domElement.addEventListener("pointermove", onMove);
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointerup", onUp);
  renderer.domElement.style.cursor = "grab";

  // ------------------------------------------------------- camera focus ----
  const focusTarget = REST_TARGET.clone();
  let focusActor = null, focusPoint = null;
  let wantDistance = null;
  let floorLock = false; // HUD "Piso 1: oculto"
  // camera angles to glide to: rooms under the mezzanine are looked at from the front and from higher up
  const REST_AZ = -PI / 4, REST_POLAR = Math.atan2(Math.SQRT2, 0.95);
  let wantAngles = null;
  const _sph = new THREE.Spherical();
  let floorView = "all";
  const applyFloor = () => {
    const showUpper = !floorLock && floorView !== "ground";
    upper.visible = showUpper;
    for (const h of hotspots) if (h.floor === 1) h.el.style.display = showUpper ? "" : "none";
  };
  const setFloorView = (mode) => {
    floorView = mode;
    applyFloor();
  };
  const setFloorLock = (locked) => {
    floorLock = !!locked;
    applyFloor();
  };
  /** Sims-style wall filter: "full", "low" (cut at a metre) or "none" */
  const setWalls = (mode) => {
    const { W0, W1, WI0, WI1 } = room.walls;
    const s = mode === "low" ? 0.3 : 1;
    W0.visible = W1.visible = mode !== "none";
    WI0.visible = WI1.visible = mode === "full";
    W0.scale.y = s;
    W1.scale.y = s;
    W1.position.y = UPPER_Y * (1 - s);
  };
  const restDistance = () => {
    const aspect = camera.aspect || 1.6;
    return aspect < 1.5 ? REST_DIST * Math.min(1.7, 1.5 / aspect) : REST_DIST;
  };
  // a wheel zoom or a drag by the user cancels any glide in progress, so the
  // camera never snaps back to where it was heading
  controls.addEventListener("start", () => {
    wantDistance = null;
    wantAngles = null;
  });
  const setSelected = (id) => {
    selectedId = id;
    focusActor = actors.find((a) => a.bot.id === id) || null;
    focusPoint = null;
    wantDistance = focusActor ? 7.5 : restDistance();
    // a person is framed from a bit higher up (keeping the current azimuth)
    // so walls and shelves between the camera and the desk do not hide them
    if (focusActor) {
      const cur = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      wantAngles = { az: cur.theta, polar: Math.min(cur.phi, 0.7) };
    } else wantAngles = { az: REST_AZ, polar: REST_POLAR };
    for (const a of actors) a.label.classList.toggle(classes.labelActive, a.bot.id === id);
    if (!focusActor) setFloorView("all");
  };
  const focusRoom = (id) => {
    const rm = rooms.find((r) => r.id === id);
    focusActor = null;
    if (!rm) {
      focusPoint = null;
      wantDistance = restDistance();
      wantAngles = { az: REST_AZ, polar: REST_POLAR };
      setFloorView("all");
      return;
    }
    focusPoint = new THREE.Vector3(rm.center[0], rm.center[1] + 1.0, rm.center[2]);
    wantDistance = rm.dist;
    wantAngles = { az: rm.azimuth ?? REST_AZ, polar: rm.polar ?? REST_POLAR };
    setFloorView(rm.under ? "ground" : "all");
  };

  // ------------------------------------------------------------- resize ----
  // HUD insets (team panel on the left, side panel on the right): the view is
  // shifted so the building stays centred in the uncovered part of the stage
  const insets = { left: 0, right: 0 };
  const resize = () => {
    const w = mount.clientWidth || 1, h = mount.clientHeight || 1;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    // portrait phones: the orbit's longest distance cannot fit the building in a
    // narrow frame, so the lens widens instead (13 m half-width at 48 m)
    camera.fov = aspect < 1 ? Math.min(62, THREE.MathUtils.radToDeg(2 * Math.atan(13 / (48 * aspect)))) : 30;
    if (w > 900) camera.setViewOffset(w, h, (insets.right - insets.left) / 2, 24, w, h);
    // small screens: with the bottom sheet open the subject rises into the strip
    // left above it; otherwise the building sits a little lower, clear of the HUD rows
    else camera.setViewOffset(w, h, 0, insets.right ? Math.round(h * 0.34) : -Math.round(h * (aspect < 1 ? 0.03 : 0.05)), w, h);
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(mount);

  // --------------------------------------------------------------- loop ----
  let simT = 0, last = performance.now(), raf = 0, disposed = false;
  let screenTick = 0, tvTick = 0, clockTick = 0, ledTick = 0, measureTick = 0;
  let frames = 0, frameMs = 0;
  const tmp = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const M = room.materials;

  const frame = () => {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    const nowMs = performance.now();
    const rawDt = (nowMs - last) / 1000;
    last = nowMs;
    if (document.hidden) return;
    // clamped so a stalled tab never teleports anyone; window.__OFFICE_TIME_SCALE is a test hook
    const dt = Math.min(rawDt, window.__OFFICE_MAX_DT || 0.1) * (window.__OFFICE_TIME_SCALE || 1);
    simT += dt;
    // frame-rate independent smoothing factors for the camera
    const k6 = 1 - Math.exp(-3.7 * rawDt), k5 = 1 - Math.exp(-3.1 * rawDt), k40 = 1 - Math.exp(-30 * rawDt);

    for (const a of actors) {
      stepActor(a, dt);
      const rm = roomAt(a.rig.root.position.x, a.rig.root.position.z, a.rig.root.position.y);
      if (rm !== a.room) {
        a.room = rm;
        onRoom && onRoom(a.bot.id, rm);
      }
    }
    for (const c of [...convs]) stepConv(c);
    updateBall();
    if (simT > encounterAt) {
      encounterAt = simT + 0.5;
      checkEncounters();
    }

    // rings + hover/selection emphasis; people on a hidden floor are hidden too
    for (const a of actors) {
      const sel = a.bot.id === selectedId, hov = a.bot.id === hoverId;
      const want = sel ? 0.8 + Math.sin(simT * 4) * 0.15 : hov ? 0.45 : 0;
      a.rig.ring.material.opacity = lerp(a.rig.ring.material.opacity, want, 0.15);
      a.rig.ring.position.set(0, 0.045, a.rig.parts.hips.position.z);
      a.rig.shirtMat.emissive.set(a.bot.accent);
      a.rig.shirtMat.emissiveIntensity = lerp(a.rig.shirtMat.emissiveIntensity, sel ? 0.12 : hov ? 0.08 : 0, 0.15);
      const hidden = !upper.visible && a.floor === 1;
      a.rig.root.visible = !hidden;
      a.blob.visible = !hidden;
    }

    // camera glides to the selected person / room and back
    if (focusActor) {
      focusActor.rig.head.getWorldPosition(tmp);
      tmp.y -= 0.25;
      focusTarget.lerp(tmp, k6);
      const under = focusActor.floor === 0 && underDeck(focusActor.rig.root.position.x, focusActor.rig.root.position.z);
      if (under !== (floorView === "ground")) setFloorView(under ? "ground" : "all");
    } else if (focusPoint) focusTarget.lerp(focusPoint, k6);
    else focusTarget.lerp(REST_TARGET, k5);
    controls.target.lerp(focusTarget, k40);
    if (wantDistance !== null) {
      const d = camera.position.distanceTo(controls.target);
      const nd = lerp(d, wantDistance, k5);
      tmp.subVectors(camera.position, controls.target).setLength(nd);
      camera.position.copy(controls.target).add(tmp);
      if (Math.abs(nd - wantDistance) < 0.05) wantDistance = null;
    }
    if (wantAngles) {
      _sph.setFromVector3(tmp.subVectors(camera.position, controls.target));
      _sph.theta = angleLerp(_sph.theta, wantAngles.az, k5);
      _sph.phi = lerp(_sph.phi, wantAngles.polar, k5);
      camera.position.copy(controls.target).add(tmp.setFromSpherical(_sph));
      if (Math.abs(angleDiff(_sph.theta, wantAngles.az)) < 0.01 && Math.abs(_sph.phi - wantAngles.polar) < 0.01) wantAngles = null;
    }
    controls.update();

    // hover (raycast at most once per frame)
    if (moveEv) {
      const hit = pickAt(moveEv);
      moveEv = null;
      const id = hit && hit.bot ? hit.bot : null, hot = hit && hit.hotspot ? hit.hotspot : null;
      if (id !== hoverId || hot !== hoverHot) {
        hoverId = id;
        if (hoverHot !== hot) {
          for (const h of hotspots) h.el.classList.toggle(classes.markerActive, h.id === hot);
          hoverHot = hot;
        }
        renderer.domElement.style.cursor = id || hot ? "pointer" : "grab";
        onHover && onHover(id || hot);
      }
    }

    // live surfaces
    screenTick += dt;
    if (screenTick > 0.3) {
      screenTick = 0;
      for (const s of dyn.screens) s.draw();
    }
    tvTick += dt;
    if (tvTick > 2) {
      tvTick = 0;
      for (const tv of dyn.tvs) tv.draw();
    }
    clockTick += dt;
    if (clockTick > 1 && dyn.clock) {
      clockTick = 0;
      const d = new Date();
      dyn.clock.hour.rotation.z = -((d.getHours() % 12) + d.getMinutes() / 60) * (PI / 6);
      dyn.clock.minute.rotation.z = -(d.getMinutes() + d.getSeconds() / 60) * (PI / 30);
    }
    ledTick += dt;
    if (ledTick > 0.35) {
      ledTick = 0;
      for (const led of dyn.leds) if (Math.random() < 0.15) led.material = led.material === M.ledOff ? (Math.random() < 0.3 ? M.ledBlue : M.ledOn) : M.ledOff;
    }

    renderer.render(scene, camera);

    // ---- DOM overlay: labels, bubbles and hotspot markers; stacked so nothing overlaps ----
    const w = mount.clientWidth, h = mount.clientHeight;
    measureTick += dt;
    const measure = measureTick > 1;
    if (measure) measureTick = 0;
    const items = [];
    for (const a of actors) {
      a.rig.head.getWorldPosition(projected);
      projected.y += 0.32;
      projected.project(camera);
      const behind = projected.z > 1 || !a.rig.root.visible;
      const tx = ((projected.x + 1) / 2) * w, ty = ((1 - projected.y) / 2) * h;
      if (a.sx === undefined || behind) {
        a.sx = tx;
        a.sy = ty;
      } else {
        a.sx += (tx - a.sx) * 0.55;
        a.sy += (ty - a.sy) * 0.55;
      }
      a.behind = behind;
      if (!a.lw || measure) {
        a.lw = a.label.offsetWidth;
        a.lh = a.label.offsetHeight;
      }
      const bw = a.bubble ? a.bubble.w : 0, bh = a.bubble ? a.bubble.h + 10 : 0;
      const iw = Math.max(a.lw, bw);
      items.push({ a, x: a.sx - iw / 2, y: a.sy - a.lh - bh, w: iw, h: a.lh + bh });
    }
    items.sort((p, q) => p.y - q.y);
    for (let pass = 0; pass < 2; pass++)
      for (let j = 1; j < items.length; j++)
        for (let i = 0; i < j; i++) {
          const A = items[i], Bn = items[j];
          if (A.a.behind || Bn.a.behind) continue;
          const ox = Math.min(A.x + A.w, Bn.x + Bn.w) - Math.max(A.x, Bn.x);
          const oy = Math.min(A.y + A.h, Bn.y + Bn.h) - Math.max(A.y, Bn.y);
          if (ox > 0 && oy > 0) Bn.y = A.y - Bn.h - 6;
        }
    for (const it of items) {
      const a = it.a;
      const labelTop = it.y + it.h - a.lh;
      a.ly = a.ly === undefined ? labelTop : a.ly + (labelTop - a.ly) * 0.6;
      // people under the deck read as "behind" the upper floor: dim their labels while it is shown
      const tucked = upper.visible && a.floor === 0 && underDeck(a.rig.root.position.x, a.rig.root.position.z) && a.bot.id !== selectedId;
      a.label.style.transform = `translate(${(a.sx - a.lw / 2).toFixed(1)}px, ${a.ly.toFixed(1)}px)`;
      a.label.style.opacity = a.behind ? "0" : tucked ? "0.45" : "1";
      a.label.style.pointerEvents = a.behind ? "none" : "";
      if (a.bubble) {
        const age = simT - a.bubble.born, left = a.bubble.until - simT;
        const s = Math.min(1, age / 0.18) * (left < 0.2 ? Math.max(0, left / 0.2) : 1);
        a.bubble.el.style.transform = `translate(${a.sx.toFixed(1)}px, ${(a.ly - 8).toFixed(1)}px) translate(-50%, -100%) scale(${s.toFixed(3)})`;
        a.bubble.el.style.opacity = a.behind ? "0" : String(tucked ? s * 0.55 : s);
      }
    }
    for (const hs of hotspots) {
      if (hs.floor === 1 && !upper.visible) continue;
      projected.copy(hs.anchor).project(camera);
      const behind = projected.z > 1;
      const x = ((projected.x + 1) / 2) * w, y = ((1 - projected.y) / 2) * h;
      const tucked = upper.visible && hs.floor === 0 && underDeck(hs.x, hs.z);
      hs.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
      hs.el.style.opacity = behind || tucked ? "0" : "";
      hs.el.style.pointerEvents = behind || tucked ? "none" : "";
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
        // resizing clears the drawing buffer: draw again now, or the page shows a blank frame
        renderer.render(scene, camera);
      }
    }
  };
  frame();
  if (window.__OFFICE_DEBUG) {
    window.__OFFICE_DEBUG.info = renderer.info;
    window.__OFFICE_DEBUG.actors = actors;
    window.__OFFICE_DEBUG.nav = { nav0, nav1 };
  }

  return {
    /** resolves once the people are in the scene (their bodies load after the room) */
    whenReady: peopleReady,
    setSelected,
    focusRoom,
    setFloorView,
    setFloorLock,
    setWalls,
    /** widths of the HUD panels covering the stage's left and right edges */
    setLayout: ({ left = 0, right = 0 }) => {
      insets.left = left;
      insets.right = right;
      resize();
    },
    /** camera stops and room names, in the scene's language */
    rooms,
    roomNames,
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
      for (const hs of hotspots) hs.el.remove();
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
