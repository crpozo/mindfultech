"use client";

/**
 * Third tab of /jev: semantic search over a gallery, simulated. Each tile is
 * an illustrated card; each query carries a recorded per-tile probability (a
 * Noul "does this image match the request?"). Free text is matched by
 * keyword to the closest recorded query, so the page never calls a model.
 */

import * as React from "react";

type Bi = { en: string; es: string };
type Tile = { id: string; emoji: string; bg: string; name: Bi };
type Query = { id: string; text: Bi; keys: string[]; p: Record<string, number> };

const TILES: Tile[] = [
  { id: "croissant", emoji: "🥐", bg: "#fdf1dc", name: { en: "Croissant", es: "Croissant" } },
  { id: "coffee", emoji: "☕", bg: "#f3e6da", name: { en: "Coffee", es: "Café" } },
  { id: "avocado", emoji: "🥑", bg: "#e6f3e1", name: { en: "Avocado toast", es: "Tostada de aguacate" } },
  { id: "sushi", emoji: "🍣", bg: "#fbe6e6", name: { en: "Sushi", es: "Sushi" } },
  { id: "pizza", emoji: "🍕", bg: "#fde9d9", name: { en: "Pizza", es: "Pizza" } },
  { id: "salad", emoji: "🥗", bg: "#e3f2e4", name: { en: "Salad", es: "Ensalada" } },
  { id: "bike", emoji: "🚲", bg: "#e4eefb", name: { en: "Bicycle", es: "Bicicleta" } },
  { id: "ev", emoji: "🚗", bg: "#e8ecf7", name: { en: "Electric car", es: "Auto eléctrico" } },
  { id: "plane", emoji: "✈️", bg: "#e6f0fa", name: { en: "Airplane", es: "Avión" } },
  { id: "train", emoji: "🚆", bg: "#e9eaf5", name: { en: "Train", es: "Tren" } },
  { id: "kayak", emoji: "🛶", bg: "#e0f1f4", name: { en: "Kayak", es: "Kayak" } },
  { id: "dog", emoji: "🐕", bg: "#f6ecdf", name: { en: "Dog", es: "Perro" } },
  { id: "cat", emoji: "🐈", bg: "#f2ecea", name: { en: "Cat", es: "Gato" } },
  { id: "parrot", emoji: "🦜", bg: "#e6f4e6", name: { en: "Parrot", es: "Loro" } },
  { id: "whale", emoji: "🐋", bg: "#e0eef8", name: { en: "Whale", es: "Ballena" } },
  { id: "llama", emoji: "🦙", bg: "#f6efe3", name: { en: "Llama", es: "Llama" } },
  { id: "beach", emoji: "🏖️", bg: "#fdf3dd", name: { en: "Beach", es: "Playa" } },
  { id: "volcano", emoji: "🌋", bg: "#f8e3dc", name: { en: "Volcano", es: "Volcán" } },
  { id: "snow", emoji: "🏔️", bg: "#e8f0f7", name: { en: "Snowy peak", es: "Nevado" } },
  { id: "forest", emoji: "🌲", bg: "#e2efe3", name: { en: "Forest", es: "Bosque" } },
  { id: "city", emoji: "🌆", bg: "#ece7f5", name: { en: "City skyline", es: "Ciudad" } },
  { id: "laptop", emoji: "💻", bg: "#e9ecf1", name: { en: "Laptop", es: "Laptop" } },
  { id: "guitar", emoji: "🎸", bg: "#f7e7e0", name: { en: "Guitar", es: "Guitarra" } },
  { id: "book", emoji: "📚", bg: "#f2ecdf", name: { en: "Books", es: "Libros" } },
  { id: "soccer", emoji: "⚽", bg: "#e6f1e7", name: { en: "Soccer ball", es: "Balón" } },
  { id: "camera", emoji: "📷", bg: "#ebebee", name: { en: "Camera", es: "Cámara" } },
  { id: "cake", emoji: "🎂", bg: "#fbe8ef", name: { en: "Birthday cake", es: "Pastel" } },
  { id: "umbrella", emoji: "☔", bg: "#e5ecf6", name: { en: "Rain", es: "Lluvia" } },
];

const QUERIES: Query[] = [
  { id: "breakfast", text: { en: "something to eat for breakfast", es: "algo para desayunar" }, keys: ["breakfast", "desayun", "morning", "mañana"],
    p: { croissant: 0.96, coffee: 0.9, avocado: 0.93, cake: 0.34, salad: 0.22, pizza: 0.12, sushi: 0.06 } },
  { id: "notdrive", text: { en: "a way to travel without driving", es: "una forma de viajar sin manejar" }, keys: ["travel", "viaj", "driv", "manej", "transport"],
    p: { plane: 0.95, train: 0.96, bike: 0.71, kayak: 0.58, ev: 0.14, city: 0.1 } },
  { id: "pets", text: { en: "an animal you could keep at home", es: "un animal que podrías tener en casa" }, keys: ["animal", "pet", "mascota", "casa", "home"],
    p: { dog: 0.97, cat: 0.98, parrot: 0.84, llama: 0.21, whale: 0.01 } },
  { id: "cold", text: { en: "somewhere cold", es: "un lugar frío" }, keys: ["cold", "frío", "frio", "snow", "nieve", "winter", "invierno"],
    p: { snow: 0.97, forest: 0.46, umbrella: 0.38, whale: 0.3, beach: 0.03, volcano: 0.04 } },
  { id: "ecuador", text: { en: "things you would see in Ecuador", es: "cosas que verías en Ecuador" }, keys: ["ecuador", "andes", "quito", "galápagos", "galapagos"],
    p: { volcano: 0.93, llama: 0.9, beach: 0.74, whale: 0.7, parrot: 0.68, snow: 0.66, forest: 0.55, city: 0.42 } },
  { id: "weekend", text: { en: "a relaxing weekend plan", es: "un plan relajado de fin de semana" }, keys: ["weekend", "fin de semana", "relax", "descans", "plan"],
    p: { beach: 0.9, book: 0.86, kayak: 0.72, guitar: 0.7, forest: 0.68, coffee: 0.6, soccer: 0.44, laptop: 0.08 } },
  { id: "work", text: { en: "tools for working remotely", es: "herramientas para trabajar remoto" }, keys: ["work", "trabaj", "remot", "office", "oficina", "tool", "herramient"],
    p: { laptop: 0.98, coffee: 0.62, book: 0.35, camera: 0.3 } },
];

const T = {
  en: { title: "Semantic image search", sub: "Type what you mean, not a tag. Jev scores every image against the request in one round trip and the gallery reacts.", ph: "e.g. something to eat for breakfast", go: "SEARCH", try: "Try", none: "No recorded query matches that text. Try one of the suggestions.", hits: "{n} of {m} images match above 50% · {ms} ms", clear: "Clear" },
  es: { title: "Búsqueda semántica de imágenes", sub: "Escribe lo que quieres decir, no una etiqueta. Jev puntúa cada imagen contra la consulta en una sola llamada y la galería reacciona.", ph: "p. ej. algo para desayunar", go: "BUSCAR", try: "Prueba", none: "Ninguna consulta grabada coincide con ese texto. Prueba una de las sugerencias.", hits: "{n} de {m} imágenes coinciden sobre 50 % · {ms} ms", clear: "Limpiar" },
};

const pct = (p: number) => `${Math.round(p * 100)}%`;

export function ImageSearch({ lang }: { lang: "en" | "es" }) {
  const t = T[lang];
  const [text, setText] = React.useState("");
  const [active, setActive] = React.useState<Query | null>(null);
  const [ms, setMs] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [miss, setMiss] = React.useState(false);
  const timer = React.useRef<number | null>(null);

  const runQuery = (q: Query | null, label: string) => {
    if (timer.current) clearTimeout(timer.current);
    setText(label); setMiss(!q); setActive(null); setMs(null);
    if (!q) return;
    setBusy(true);
    const t0 = performance.now(); const at = 130 + Math.random() * 60;
    timer.current = window.setTimeout(() => { setActive(q); setMs(Math.round(performance.now() - t0)); setBusy(false); }, at);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = text.toLowerCase();
    const q = QUERIES.find((x) => x.keys.some((k) => s.includes(k))) ?? QUERIES.find((x) => x.text[lang].toLowerCase() === s) ?? null;
    runQuery(q, text);
  };
  const hits = active ? TILES.filter((tile) => (active.p[tile.id] ?? 0) >= 0.5).length : 0;

  return (
    <div>
      <h2 className="jev-h2">{t.title}</h2>
      <p className="jev-sub" style={{ marginBottom: 18 }}>{t.sub}</p>
      <form className="jev-search" onSubmit={submit}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t.ph} aria-label={t.title} />
        <button type="submit" className="btn-dark jev-run">{t.go}</button>
        {active && <button type="button" className="jev-chip" onClick={() => runQuery(null, "")}>{t.clear}</button>}
      </form>
      <div className="jev-picker" style={{ marginBottom: 18 }}>
        <span className="jev-label">{t.try}</span>
        {QUERIES.map((q) => (
          <button key={q.id} type="button" className={`jev-chip${active?.id === q.id ? " on" : ""}`} onClick={() => runQuery(q, q.text[lang])}>{q.text[lang]}</button>
        ))}
      </div>
      <div className="jev-status" aria-live="polite">
        {miss ? t.none : active && ms != null ? t.hits.replace("{n}", String(hits)).replace("{m}", String(TILES.length)).replace("{ms}", String(ms)) : busy ? "…" : " "}
      </div>
      <div className={`jev-gallery${busy ? " busy" : ""}`}>
        {TILES.map((tile) => {
          const p = active ? active.p[tile.id] ?? 0.02 : null;
          const state = p == null ? "" : p >= 0.5 ? " hit" : " miss";
          return (
            <figure key={tile.id} className={`jev-tile${state}`} style={{ background: tile.bg, order: p == null ? 0 : Math.round((1 - p) * 100) }}>
              <span className="jev-tile-art" aria-hidden>{tile.emoji}</span>
              <figcaption>
                <span>{tile.name[lang]}</span>
                {p != null && <b>{pct(p)}</b>}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
