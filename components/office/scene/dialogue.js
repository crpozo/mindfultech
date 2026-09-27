// What the team says to each other. Each script is a list of turns: `a` is the
// person who started the encounter, `b` the other. A turn that starts with
// "Jaja" / "Haha" / "lol" or carries 😂 / 😅 / 😆 makes the speaker laugh;
// `{ game: "rps" }` plays rock-paper-scissors before the next turn. Names are
// filled in at run time ({a} / {b}).
//
// The Spanish sets are the originals and keep their names (SCRIPTS, SOLO, …);
// the English sets end in _EN. index.js picks one language with scriptsFor().

export const LAUGH_RE = /^jaja|^haha|^lol\b|😂|😅|😆|🤣/i;

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

// ================================================================ English ====

export const SCRIPTS_EN = {
  coffee: [
    [["a", "Have you tried the new coffee yet?"], ["b", "Yes, it's way better than the old one."], ["a", "Hahaha anything was better."]],
    [["a", "How's the month-end close going?"], ["b", "Almost done, just two invoices left."], ["a", "Great! Let me know if you need anything."]],
    [["a", "I saw engagement went up 23%."], ["b", "Yeah, Tuesday's video took off."], ["a", "Nice! 🎉"]],
    [["a", "Did you watch the game last night?"], ["b", "Hahaha don't remind me, we lost in the last minute."], ["a", "😅 There's always a rematch."]],
    [["a", "Grupo Andino got back to us."], ["b", "And? Did they say yes?"], ["a", "They want the demo on Thursday."], ["b", "Let's go! 💪"]],
    [["a", "I need 5 minutes away from the spreadsheet."], ["b", "I hear you, I'm at 40 tickets today."], ["a", "Unsung heroes. 😂"]],
    [["a", "Is anyone else cold in here?"], ["b", "Always. The AC is in Antarctica mode."], ["a", "Hahaha I'm requesting a company sweater."]],
    [["a", "Want a hand with the deploy?"], ["b", "It's already in staging, just needs your review."], ["a", "I'll look after coffee. ☕"]],
    [["a", "Rock, paper, scissors for the last croissant."], ["b", "You're on. 😏"], { game: "rps" }],
    [["a", "I closed 3 meetings before lunch today."], ["b", "Legend! 🙌"], ["a", "It's all the coffee."]],
    [["a", "How many tickets so far?"], ["b", "127. And it's 11 a.m."], ["a", "😂 Machine."]],
    [["a", "Do you know if {b} is coming to the meeting?"], ["b", "That's me, {a}. 😆"], ["a", "Hahaha sorry, I need more coffee."]],
  ],
  visit: [
    [["a", "Got a minute? Look at this number."], ["b", "Let's see… yes, that lead is hot."], ["a", "I'm calling them right now."]],
    [["a", "Can you review PR #482?"], ["b", "Sure, give me 10 minutes."], ["a", "Thanks!"]],
    [["a", "The report is in the shared folder."], ["b", "Perfect, I'll go through it and get back to you."]],
    [["a", "Coffee later?"], ["b", "Give me 5 and I'm there."]],
    [["a", "Hahaha did you see the meme in the group chat?"], ["b", "😂 The spreadsheet one. Brilliant."]],
    [["a", "The client asked to move the demo date."], ["b", "No problem, I'll update the calendar."], ["a", "You're the best."]],
    [["a", "Did you get the Farmacias Cruz invoice?"], ["b", "Yes, it's already reconciled."], ["a", "Perfect. 👌"]],
    [["a", "Psst… there are croissants in the kitchen."], ["b", "😆 On my way."]],
  ],
  lounge: [
    [["a", "Five-minute break and I'm back at it."], ["b", "Well earned."]],
    [["a", "Did I tell you the client signed?"], ["b", "No! Congratulations! 🎉"], ["a", "We celebrate on Friday."]],
    [["a", "Quick round of rock, paper, scissors?"], ["b", "Sure. 😄"], { game: "rps" }],
    [["a", "How was your weekend?"], ["b", "Short. As always. 😅"], ["a", "Hahaha same here."]],
    [["a", "This sofa is the best thing in the office."], ["b", "After the coffee machine."], ["a", "😂 True."]],
    [["a", "Seen the dashboard? We're on fire."], ["b", "Yep, 99.98% uptime. 💪"]],
  ],
  board: [
    [["a", "This is how the agent flow would look."], ["b", "I like it, but the validation is missing."], ["a", "Good point, adding it."]],
    [["a", "If the lead replies, we book straight away."], ["b", "And if not, follow up in 3 days."], ["a", "Exactly. ✅"]],
    [["a", "Demo on Thursday or Friday?"], ["b", "Thursday. Nobody listens on Fridays. 😆"], ["a", "Hahaha true."]],
  ],
  tv: [
    [["a", "Look, tickets are down 30%."], ["b", "The support bot is paying off."], ["a", "🙌"]],
    [["a", "Is that spike in leads from the campaign?"], ["b", "Yes, Tuesday's reel."], ["a", "We should do it again."]],
  ],
  meeting: [
    [["a", "Let's start. Where are we with Grupo Andino?"], ["b", "Proposal sent, demo on Thursday."], ["c", "I'm preparing the pilot data."], ["a", "Perfect. Next up: support."], ["d", "127 tickets today, 3 escalated. All under control."], ["a", "Great work, team. 👏"]],
    [["a", "Quick sprint review."], ["b", "Checkout is already in staging."], ["c", "The onboarding designs are done."], ["a", "Blockers?"], ["b", "None. Just needs your review."], ["a", "I'll do it today. We're done. ✅"]],
    [["a", "Have you seen the dashboard? We're doing great."], ["b", "Engagement is up 23%."], ["c", "And the pipeline, $18,400."], ["d", "Hahaha the fastest-growing number is coffee consumption."], ["a", "😂 Happy to pay for that one."]],
    [["a", "Topic: the October campaign."], ["b", "I suggest we start on the 3rd."], ["c", "I'll have the landing page ready by the 1st."], ["a", "The 3rd it is. Noted. 📅"]],
  ],
  training: [
    [["a", "Today: how the sales agent qualifies leads."], ["b", "👍"], ["a", "First it checks email, the website and LinkedIn."], ["c", "And if the lead doesn't reply?"], ["a", "Automatic follow-up after 3 days."], ["d", "Nice! 🙌"], ["a", "Questions at the end. Let's continue."]],
    [["a", "Training: escalating a ticket to a human."], ["b", "When do we escalate?"], ["a", "Refunds over $500 or legal matters."], ["c", "Noted. ✍️"], ["a", "And always with a summary and context."], ["d", "Perfect, thanks."]],
    [["a", "Month-end close in 5 steps."], ["b", "Step 1: reconcile the bank."], ["a", "Exactly. Step 2: invoices to the tax office."], ["c", "Hahaha step 3 is coffee."], ["a", "😂 Step 3: review receivables."]],
  ],
  pingpong: [
    [["a", "Quick game?"], ["b", "Get ready to lose. 😏"]],
    [["a", "My serve."], ["b", "Go for it. 🏓"]],
  ],
  lab: [
    [["a", "This is the new agent's flow."], ["b", "I like it. What about validation?"], ["a", "Right here, before sending."], ["b", "Perfect. 👌"]],
    [["a", "Idea: a bot that summarizes every meeting."], ["b", "Yes! With action items and owners."], ["a", "I'll prototype it this week. 🚀"]],
  ],
  water: [
    [["a", "Staying hydrated is important."], ["b", "Says the one on 6 coffees. 😂"], ["a", "Hahaha balance."]],
    [["a", "How's your day going?"], ["b", "Flat out, but good."]],
  ],
};

/** Things people say to themselves at the desk. */
export const SOLO_EN = ["💡", "✅ Done", "Hmm… 🤔", "☕ I need coffee", "🎯", "📞 Calling…", "🔥 On a roll", "✔ Sent", "🧮", "🚀 Deployed"];

/** Lines for rock-paper-scissors. */
export const RPS_EN = {
  hands: ["✊", "✋", "✌️"],
  win: ["I won! 🎉", "Take that! 😎", "Yes! 🙌"],
  lose: ["Nooo 😩", "Again… 😅", "Rematch tomorrow 😤"],
  tie: ["Tie 😆", "Again!"],
};

/** What people say into the phone in a booth. */
export const CALL_EN = ["Yes, the demo is Thursday at 10.", "I'll send you the quote today.", "Perfect, that's settled. Thank you!", "Could you confirm your tax ID, please?", "Sure, we'll look into it and get back to you.", "One moment, let me check… done."];

/** Ping-pong table talk. */
export const PP_EN = { point: ["Point!", "Mine!", "Take that!", "Oof, so close."], win: ["I won {s}! 🏓", "Champion! {s} 🏆"], lose: ["Rematch tomorrow… {s}", "Good game. {s} 😅"] };

/** Coffee-machine chatter for whoever is alone there. */
export const COFFEE_SOLO_EN = ["☕ An espresso…", "☕ Double, please", "☕☕"];

/** All the line sets for a language ("es" | "en"); anything else falls back to Spanish. */
export function scriptsFor(lang) {
  return lang === "en"
    ? { SCRIPTS: SCRIPTS_EN, SOLO: SOLO_EN, RPS: RPS_EN, COFFEE_SOLO: COFFEE_SOLO_EN, CALL: CALL_EN, PP: PP_EN }
    : { SCRIPTS, SOLO, RPS, COFFEE_SOLO, CALL, PP };
}

export function fill(text, a, b) {
  return text.replace(/\{a\}/g, a).replace(/\{b\}/g, b);
}
