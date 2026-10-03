// Every piece of text the scene renders or emits, per language. createOffice()
// picks one dictionary at creation (`const L = textsFor(lang)`); the React shell
// re-creates the scene when the language changes, so nothing switches at run
// time. Geometry, timing and behaviour never depend on the language.
//
// Conversation scripts live in dialogue.js (see `scriptsFor`); this file holds
// room and hotspot names, wall signs, statuses, place labels and one-off bubbles.

export const T = {
  // ------------------------------------------------------------- Spanish ----
  es: {
    rooms: {
      reception: "Recepción", hall: "Área central", open: "Sala abierta", nook: "Rincón de lectura", meeting: "Sala Andes", meeting2: "Sala Chimborazo",
      utility: "Impresión y casilleros", servers: "Servidores", lounge: "Lounge", training: "Capacitación", studio: "Estudio", cafe: "Cafetería",
      booth: "Cabina", stairs: "Escaleras",
    },
    hotspots: {
      board: "Tablero de tareas", tv: "Dashboard en vivo", coffee: "Cafetera", printer: "Impresora", shelf: "Base de conocimiento", water: "Radio pasillo",
      clock: "Línea de tiempo", servers: "Estado de sistemas", pingpong: "Marcador de ping-pong", reception: "Recepción", meeting: "Agenda de reuniones",
      lounge: "Rendimiento de los agentes",
    },
    /** Wall signs; each entry is the list of lines drawn on one sign (same sign sizes in both languages). */
    signs: {
      logo: ["AI MANAGEMENT OFFICE"],
      future: ["CONSTRUIMOS EL FUTURO", "CON CALMA Y PROPÓSITO"],
      calm: ["PENSAR CON CALMA,", "CREAR CON PROPÓSITO"],
      doNow: ["HAZLO", "AHORA"],
      everyDay: ["CADA DÍA,", "UN POCO MEJOR"],
      intention: ["HAZLO CON", "INTENCIÓN"],
      think: ["PIENSA", "DIFERENTE"],
      chimborazo: ["SALA", "CHIMBORAZO"],
      andes: ["SALA ANDES"],
      servers: ["SERVIDORES"],
    },
    /** Where somebody is heading, as a noun phrase ("la cafetera"). */
    place: {
      coffee: "la cafetera", kitchen: "las mesas de la cafetería", meeting: "la Sala Andes", meeting2: "la Sala Chimborazo", training: "la capacitación",
      booth: "la cabina", printer: "la impresora", water: "el dispensador", servers: "la sala de servidores", pingpong: "jugar ping-pong",
      tv: "la pantalla", lounge: "el lounge", beanbag: "el puf", nook: "el rincón de lectura",
    },
    /** "a la cafetera" / "al lounge" / "a jugar ping-pong" */
    to(kind) {
      const l = this.place[kind] || kind;
      return l.startsWith("el ") ? "al " + l.slice(3) : l.startsWith("jugar") ? "a " + l : "a " + l;
    },
    status: {
      upToDesk: "Subiendo a su puesto",
      downToDesk: "Bajando a su escritorio",
      backToDesk: "Volviendo a su escritorio",
      goingToDeskOf: (name) => `Yendo al escritorio de ${name}`,
      upTo: (dest) => `Subiendo ${dest}`,
      downTo: (dest) => `Bajando ${dest}`,
      walkingTo: (dest) => `Caminando ${dest}`,
      inMeetingWith: (names) => `En reunión con ${names}`,
      givingTraining: "Dando la capacitación",
      inTraining: "En la capacitación",
      chattingWith: (names) => `Charlando con ${names}`,
      laughingWith: (name) => `Riéndose con ${name}`,
      playingRpsWith: (name) => `Jugando piedra, papel o tijera con ${name}`,
      playingPingpongWith: (name) => `Jugando ping-pong con ${name}`,
      beat: (name) => `¡Le ganó a ${name}!`,
      lostTo: (name) => `Perdió contra ${name} 😅`,
      wonPingpong: (score, name) => `Ganó el ping-pong ${score} a ${name} 🏓`,
      lostPingpong: (score, name) => `Perdió el ping-pong ${score} con ${name}`,
      hosting: (name) => `Atendiendo a ${name}`,
      visiting: (name) => `Visitando a ${name}`,
      thinking: "Pensando en la siguiente tarea",
      sip: "Un sorbo de café",
      stretch: "Estirando la espalda",
      phone: "Revisando el celular",
      breather: "Tomando un respiro",
      // place statuses (while somewhere on a break)
      drinkingCoffee: "Tomando un café",
      makingCoffee: "Preparando un café",
      kitchen: "Picando algo en la cafetería",
      meeting: "En la Sala Andes",
      meeting2: "En la Sala Chimborazo",
      preparingTraining: "Preparando la capacitación",
      booth: "En una llamada",
      printer: "Recogiendo una impresión",
      water: "Tomando agua",
      servers: "Revisando los servidores",
      pingpong: "Esperando rival en el ping-pong",
      tv: "Mirando el dashboard",
      lounge: "Descansando en el lounge",
      beanbag: "Leyendo en el puf",
      nook: "Leyendo en el rincón",
      pause: "En una pausa",
    },
    bubble: {
      rock: "Piedra…",
      paper: "papel…",
      allGreen: "✅ Todo en verde",
    },
  },

  // ------------------------------------------------------------- English ----
  en: {
    rooms: {
      reception: "Reception", hall: "Main hall", open: "Open workspace", nook: "Reading nook", meeting: "Andes Room", meeting2: "Chimborazo Room",
      utility: "Print & lockers", servers: "Server room", lounge: "Lounge", training: "Training room", studio: "Studio", cafe: "Cafeteria",
      booth: "Phone booth", stairs: "Stairs",
    },
    hotspots: {
      board: "Task board", tv: "Live dashboard", coffee: "Coffee machine", printer: "Printer", shelf: "Knowledge base", water: "Water cooler chat",
      clock: "Timeline", servers: "System status", pingpong: "Ping-pong scoreboard", reception: "Reception", meeting: "Meeting schedule",
      lounge: "Agent performance",
    },
    signs: {
      logo: ["AI MANAGEMENT OFFICE"],
      future: ["WE BUILD THE FUTURE", "CALMLY, WITH PURPOSE"],
      calm: ["THINK CALMLY,", "CREATE WITH PURPOSE"],
      doNow: ["DO IT", "NOW"],
      everyDay: ["EVERY DAY,", "A BIT BETTER"],
      intention: ["DO IT WITH", "INTENTION"],
      think: ["THINK", "DIFFERENT"],
      chimborazo: ["CHIMBORAZO", "ROOM"],
      andes: ["ANDES ROOM"],
      servers: ["SERVERS"],
    },
    place: {
      coffee: "the coffee machine", kitchen: "the cafeteria tables", meeting: "the Andes Room", meeting2: "the Chimborazo Room", training: "the training session",
      booth: "the phone booth", printer: "the printer", water: "the water cooler", servers: "the server room", pingpong: "play ping-pong",
      tv: "the screen", lounge: "the lounge", beanbag: "the bean bag", nook: "the reading nook",
    },
    /** "to the coffee machine" / "to play ping-pong" */
    to(kind) {
      return "to " + (this.place[kind] || kind);
    },
    status: {
      upToDesk: "Heading upstairs to their station",
      downToDesk: "Heading downstairs to their desk",
      backToDesk: "Heading back to their desk",
      goingToDeskOf: (name) => `Heading to ${name}'s desk`,
      upTo: (dest) => `Heading upstairs ${dest}`,
      downTo: (dest) => `Heading downstairs ${dest}`,
      walkingTo: (dest) => `Walking ${dest}`,
      inMeetingWith: (names) => `In a meeting with ${names}`,
      givingTraining: "Running the training session",
      inTraining: "In the training session",
      chattingWith: (names) => `Chatting with ${names}`,
      laughingWith: (name) => `Laughing with ${name}`,
      playingRpsWith: (name) => `Playing rock-paper-scissors with ${name}`,
      playingPingpongWith: (name) => `Playing ping-pong with ${name}`,
      beat: (name) => `Beat ${name}!`,
      lostTo: (name) => `Lost to ${name} 😅`,
      wonPingpong: (score, name) => `Won at ping-pong ${score} against ${name} 🏓`,
      lostPingpong: (score, name) => `Lost at ping-pong ${score} to ${name}`,
      hosting: (name) => `Helping ${name}`,
      visiting: (name) => `Visiting ${name}`,
      thinking: "Thinking about the next task",
      sip: "A sip of coffee",
      stretch: "Stretching their back",
      phone: "Checking their phone",
      breather: "Taking a breather",
      drinkingCoffee: "Having a coffee",
      makingCoffee: "Making a coffee",
      kitchen: "Grabbing a snack in the cafeteria",
      meeting: "In the Andes Room",
      meeting2: "In the Chimborazo Room",
      preparingTraining: "Setting up the training session",
      booth: "On a call",
      printer: "Picking up a printout",
      water: "Getting some water",
      servers: "Checking the servers",
      pingpong: "Waiting for a ping-pong opponent",
      tv: "Watching the dashboard",
      lounge: "Relaxing in the lounge",
      beanbag: "Reading on the bean bag",
      nook: "Reading in the nook",
      pause: "On a break",
    },
    bubble: {
      rock: "Rock…",
      paper: "paper…",
      allGreen: "✅ All green",
    },
  },
};

/** Normalises an unknown language code to one we have (Spanish is the original copy). */
export const langOf = (lang) => (T[lang] ? lang : "es");

/** The dictionary for a language. */
export const textsFor = (lang) => T[langOf(lang)];
