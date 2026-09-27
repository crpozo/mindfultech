"use client";

import * as React from "react";
import { type Bot, reply } from "@/lib/office/bots";
import { type Lang, LOCALE, tx } from "@/lib/office/i18n";
import s from "./office.module.css";

type Msg = { from: "bot" | "user"; text: string; at: string };

const stamp = (lang: Lang) => new Date().toLocaleTimeString(LOCALE[lang], { hour: "2-digit", minute: "2-digit" });

/** Scripted chat with one bot: keyword replies, a typing delay, quick questions. `bot` is already localized. */
export function BotChat({ bot, lang }: { bot: Bot; lang: Lang }) {
  const t = tx(lang);
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const timer = React.useRef<number | null>(null);

  // greeting on open
  React.useEffect(() => {
    setMsgs([]);
    setTyping(true);
    const id = window.setTimeout(() => {
      setTyping(false);
      setMsgs([{ from: "bot", text: reply(bot, lang === "es" ? "hola" : "hello"), at: stamp(lang) }]);
    }, 700);
    return () => {
      window.clearTimeout(id);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [bot, lang]);

  React.useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  const send = (text: string) => {
    const msg = text.trim();
    if (!msg || typing) return;
    setInput("");
    setMsgs((m) => [...m, { from: "user", text: msg, at: stamp(lang) }]);
    setTyping(true);
    timer.current = window.setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "bot", text: reply(bot, msg), at: stamp(lang) }]);
    }, 900 + Math.min(1600, msg.length * 25));
  };

  return (
    <div className={s.chat}>
      <div className={s.messages} ref={listRef}>
        {msgs.map((m, i) => (
          <div key={i} className={`${s.msg} ${m.from === "bot" ? s.msgBot : s.msgUser}`}>
            {m.text}
            <span className={s.msgTime}>
              {m.from === "bot" ? bot.name : t("Tú", "You")} · {m.at}
            </span>
          </div>
        ))}
        {typing && (
          <div className={`${s.msg} ${s.msgBot}`} role="status" aria-label={t("escribiendo…", "typing…")}>
            <span className={s.dots}>
              <i />
              <i />
              <i />
            </span>
          </div>
        )}
      </div>
      <div className={s.quick}>
        {bot.quick.map((q) => (
          <button key={q} type="button" onClick={() => send(q)} disabled={typing}>
            {q}
          </button>
        ))}
      </div>
      <form
        className={s.composer}
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
          inputRef.current?.focus();
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t(`Pregúntale algo a ${bot.name}…`, `Ask ${bot.name} something…`)}
          aria-label={t("Mensaje", "Message")}
        />
        <button className={s.send} type="submit" disabled={!input.trim() || typing} aria-label={t("Enviar", "Send")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
    </div>
  );
}
