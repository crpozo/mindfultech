// What the team says to each other. Each script is a list of turns: `a` is the
// person who started the encounter, `b` the other. A turn that starts with
// "Jaja" or carries 😂 / 😅 / 😆 makes the speaker laugh; `{ game: "rps" }`
// plays rock-paper-scissors before the next turn. Names are filled in at run
// time ({a} / {b}).

export const LAUGH_RE = /^jaja|😂|😅|😆|🤣/i;

export const SCRIPTS = {
  coffee: [
    [["a", "¿Ya probaste el café nuevo?"], ["b", "Sí, está mucho mejor que el anterior."], ["a", "Jajaja cualquier cosa era mejor."]],
    [["a", "¿Cómo va el cierre de mes?"], ["b", "Casi listo, solo faltan dos facturas."], ["a", "¡Genial! Avísame si necesitas algo."]],
    [["a", "Vi que subió el engagement 23 %."], ["b", "Sí, el video del martes se disparó."], ["a", "¡Qué buena! 🎉"]],
    [["a", "¿Viste el partido de anoche?"], ["b", "Jajaja no me hables, perdimos en el último minuto."], ["a", "😅 Ya habrá revancha."]],
    [["a", "Grupo Andino ya respondió."], ["b", "¿Y? ¿Aceptaron?"], ["a", "Quieren la demo el jueves."], ["b", "¡Vamos! 💪"]],
    [["a", "Necesito 5 minutos lejos de la hoja de cálculo."], ["b", "Te entiendo, yo llevo 40 tickets hoy."], ["a", "Somos héroes anónimos. 😂"]],
    [["a", "¿Alguien más tiene frío aquí?"], ["b", "Siempre. El aire está en modo Antártida."], ["a", "Jajaja voy a pedir un suéter corporativo."]],
    [["a", "¿Te ayudo con el deploy?"], ["b", "Ya está en staging, solo falta tu revisión."], ["a", "Lo veo después del café. ☕"]],
    [["a", "Piedra, papel o tijera por el último croissant."], ["b", "Acepto. 😏"], { game: "rps" }],
    [["a", "Hoy cerré 3 reuniones antes del almuerzo."], ["b", "¡Crack! 🙌"], ["a", "Todo es el café."]],
    [["a", "¿Cuántos tickets llevas?"], ["b", "127. Y son las 11."], ["a", "😂 Máquina."]],
    [["a", "¿Sabes si {b} viene a la reunión?"], ["b", "Soy yo, {a}. 😆"], ["a", "Jajaja perdón, necesito más café."]],
  ],
  visit: [
    [["a", "¿Tienes un minuto? Mira este dato."], ["b", "A ver… sí, ese lead está caliente."], ["a", "Lo llamo ahora mismo."]],
    [["a", "¿Me revisas el PR #482?"], ["b", "Claro, dame 10 minutos."], ["a", "¡Gracias!"]],
    [["a", "El reporte quedó en la carpeta compartida."], ["b", "Perfecto, lo reviso y te comento."]],
    [["a", "¿Vamos por un café después?"], ["b", "Dame 5 y voy."]],
    [["a", "Jajaja ¿viste el meme del grupo?"], ["b", "😂 El de la hoja de cálculo. Genial."]],
    [["a", "El cliente pidió cambiar la fecha de la demo."], ["b", "Sin problema, muevo la agenda."], ["a", "Eres el mejor."]],
    [["a", "¿Te llegó la factura de Farmacias Cruz?"], ["b", "Sí, ya está conciliada."], ["a", "Perfecto. 👌"]],
    [["a", "Psst… hay croissants en la cocina."], ["b", "😆 Voy corriendo."]],
  ],
  lounge: [
    [["a", "Cinco minutos de pausa y sigo."], ["b", "Bien merecidos."]],
    [["a", "¿Te dije que el cliente firmó?"], ["b", "¡No! ¡Felicitaciones! 🎉"], ["a", "Celebramos el viernes."]],
    [["a", "¿Una rápida de piedra, papel o tijera?"], ["b", "Dale. 😄"], { game: "rps" }],
    [["a", "¿Qué tal el fin de semana?"], ["b", "Corto. Como siempre. 😅"], ["a", "Jajaja igual el mío."]],
    [["a", "Este sofá es lo mejor de la oficina."], ["b", "Después de la cafetera."], ["a", "😂 Cierto."]],
    [["a", "¿Ya viste el dashboard? Vamos a tope."], ["b", "Sí, 99,98 % de uptime. 💪"]],
  ],
  board: [
    [["a", "Así quedaría el flujo del agente."], ["b", "Me gusta, pero falta la validación."], ["a", "Buen punto, lo agrego."]],
    [["a", "Si el lead responde, agendamos directo."], ["b", "Y si no, seguimiento a los 3 días."], ["a", "Exacto. ✅"]],
    [["a", "¿Ponemos la demo el jueves o el viernes?"], ["b", "Jueves. El viernes nadie escucha. 😆"], ["a", "Jajaja verdad."]],
  ],
  tv: [
    [["a", "Mira, los tickets bajaron un 30 %."], ["b", "El bot de soporte está rindiendo."], ["a", "🙌"]],
    [["a", "¿Ese pico de leads es de la campaña?"], ["b", "Sí, el reel del martes."], ["a", "Hay que repetirlo."]],
  ],
  meeting: [
    [["a", "Empecemos. ¿Cómo vamos con Grupo Andino?"], ["b", "Propuesta enviada, demo el jueves."], ["c", "Yo preparo los datos del piloto."], ["a", "Perfecto. Siguiente punto: soporte."], ["d", "127 tickets hoy, 3 escalados. Todo bajo control."], ["a", "Gran trabajo, equipo. 👏"]],
    [["a", "Revisión rápida del sprint."], ["b", "El checkout ya está en staging."], ["c", "Los diseños del onboarding, listos."], ["a", "¿Bloqueos?"], ["b", "Ninguno. Solo falta tu revisión."], ["a", "La hago hoy. Cerramos. ✅"]],
    [["a", "¿Vieron el dashboard? Vamos muy bien."], ["b", "El engagement subió 23 %."], ["c", "Y el pipeline, $18.400."], ["d", "Jajaja el que más sube es el consumo de café."], ["a", "😂 Eso lo pagamos con gusto."]],
    [["a", "Tema: la campaña de octubre."], ["b", "Propongo empezar el 3."], ["c", "Yo tengo la landing lista para el 1."], ["a", "Entonces el 3. Anotado. 📅"]],
  ],
  training: [
    [["a", "Hoy: cómo califica leads el agente de ventas."], ["b", "👍"], ["a", "Primero mira el correo, la web y LinkedIn."], ["c", "¿Y si el lead no responde?"], ["a", "Seguimiento automático a los 3 días."], ["d", "¡Qué bueno! 🙌"], ["a", "Preguntas al final. Sigamos."]],
    [["a", "Capacitación: escalar un ticket a humano."], ["b", "¿Cuándo se escala?"], ["a", "Reembolsos mayores a $500 o temas legales."], ["c", "Anotado. ✍️"], ["a", "Y siempre con resumen y contexto."], ["d", "Perfecto, gracias."]],
    [["a", "Cierre de mes en 5 pasos."], ["b", "Paso 1: conciliar el banco."], ["a", "Exacto. Paso 2: facturas al SRI."], ["c", "Jajaja el paso 3 es café."], ["a", "😂 Paso 3: revisar por cobrar."]],
  ],
  pingpong: [
    [["a", "¿Una partida rápida?"], ["b", "Prepárate para perder. 😏"]],
    [["a", "Saco yo."], ["b", "Dale. 🏓"]],
  ],
  lab: [
    [["a", "Este es el flujo del nuevo agente."], ["b", "Me gusta, ¿y la validación?"], ["a", "Aquí, antes de enviar."], ["b", "Perfecto. 👌"]],
    [["a", "Idea: un bot que resuma cada reunión."], ["b", "¡Sí! Con acciones y responsables."], ["a", "Lo prototipo esta semana. 🚀"]],
  ],
  water: [
    [["a", "Hidratarse es importante."], ["b", "Dice el que toma 6 cafés. 😂"], ["a", "Jajaja equilibrio."]],
    [["a", "¿Cómo va tu día?"], ["b", "A tope, pero bien."]],
  ],
};

/** Things people say to themselves at the desk. */
export const SOLO = ["💡", "✅ Listo", "Hmm… 🤔", "☕ Necesito café", "🎯", "📞 Llamando…", "🔥 A tope", "✔ Enviado", "🧮", "🚀 Desplegado"];

/** Lines for rock-paper-scissors. */
export const RPS = {
  hands: ["✊", "✋", "✌️"],
  win: ["¡Gané! 🎉", "¡Toma! 😎", "¡Sí! 🙌"],
  lose: ["Nooo 😩", "Otra vez… 😅", "Revancha mañana 😤"],
  tie: ["Empate 😆", "¡Otra!"],
};

/** What people say into the phone in a booth. */
export const CALL = ["Sí, la demo es el jueves a las 10.", "Le envío la cotización hoy mismo.", "Perfecto, quedamos así. ¡Gracias!", "¿Me confirma el RUC, por favor?", "Claro, lo revisamos y le aviso.", "Un momento, lo verifico… listo."];

/** Ping-pong table talk. */
export const PP = { point: ["¡Punto!", "¡Mía!", "¡Toma!", "Uff, casi."], win: ["¡Gané {s}! 🏓", "¡Campeón! {s} 🏆"], lose: ["Revancha mañana… {s}", "Buena partida. {s} 😅"] };

/** Coffee-machine chatter for whoever is alone there. */
export const COFFEE_SOLO = ["☕ Un espresso…", "☕ Doble, por favor", "☕☕"];

export function fill(text, a, b) {
  return text.replace(/\{a\}/g, a).replace(/\{b\}/g, b);
}
