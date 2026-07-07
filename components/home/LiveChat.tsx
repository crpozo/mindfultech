"use client";

import * as React from "react";
import { Logo } from "../Logo";

type Msg = { text: string; who: "bot" | "user" };

const GREETING =
  "¡Hola! Soy el asistente de MindfulTech. Cuéntame qué quieres construir y te oriento al instante.";

const REPLY =
  "¡Gracias! Un humano del lab te responde enseguida. Para una respuesta inmediata escríbenos por WhatsApp: +593 958 73 1994 — o usa el botón “Start a project”.";

export function LiveChat() {
  const [open, setOpen] = React.useState(false);
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [value, setValue] = React.useState("");
  const logRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open && msgs.length === 0) setMsgs([{ text: GREETING, who: "bot" }]);
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open, msgs.length]);

  React.useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    setValue("");
    setMsgs((m) => [...m, { text, who: "user" }, { text: "…", who: "bot" }]);
    setTimeout(() => {
      setMsgs((m) => {
        const copy = m.slice();
        copy[copy.length - 1] = { text: REPLY, who: "bot" };
        return copy;
      });
    }, 650);
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 22,
        bottom: 22,
        zIndex: 590,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 12,
      }}
    >
      {open && (
        <div
          style={{
            width: "min(350px,calc(100vw - 44px))",
            height: 460,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 30px 80px -24px rgba(10,10,12,.45)",
            border: "1px solid rgba(14,13,18,.08)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11, background: "#0e0d12", padding: "14px 16px" }}>
            <Logo size={24} stroke="var(--accent)" dot="#fff" />
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>MindfulTech</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#9a97a8" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />
                Online · respondemos en minutos
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{
                border: "none",
                cursor: "pointer",
                background: "rgba(255,255,255,.12)",
                width: 30,
                height: 30,
                borderRadius: 7,
                color: "#fff",
                fontSize: 13,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          <div
            ref={logRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 9,
              background: "#f7f7f9",
            }}
          >
            {msgs.map((m, i) => (
              <div
                key={i}
                style={
                  m.who === "user"
                    ? {
                        alignSelf: "flex-end",
                        maxWidth: "82%",
                        background: "#0e0d12",
                        color: "#fff",
                        borderRadius: "12px 12px 3px 12px",
                        padding: "10px 13px",
                        fontSize: 13.5,
                        lineHeight: 1.45,
                      }
                    : {
                        alignSelf: "flex-start",
                        maxWidth: "82%",
                        background: "#fff",
                        color: "#1a1820",
                        border: "1px solid rgba(14,13,18,.08)",
                        borderRadius: "12px 12px 12px 3px",
                        padding: "10px 13px",
                        fontSize: 13.5,
                        lineHeight: 1.45,
                        boxShadow: "0 6px 16px -10px rgba(14,13,18,.2)",
                      }
                }
              >
                {m.text}
              </div>
            ))}
          </div>

          <form
            onSubmit={send}
            style={{
              display: "flex",
              gap: 8,
              padding: 12,
              borderTop: "1px solid rgba(14,13,18,.08)",
              background: "#fff",
            }}
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Escribe tu mensaje…"
              autoComplete="off"
              style={{
                flex: 1,
                border: "1px solid rgba(14,13,18,.16)",
                borderRadius: 9,
                padding: "11px 12px",
                fontFamily: "var(--font-outfit),sans-serif",
                fontSize: 14,
                color: "var(--ink)",
                outlineColor: "var(--accent)",
              }}
            />
            <button
              type="submit"
              style={{
                border: "none",
                cursor: "pointer",
                background: "#0e0d12",
                color: "#fff",
                borderRadius: 9,
                width: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              →
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Live chat"
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "#0e0d12",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 18px 40px -14px rgba(10,10,12,.55)",
          position: "relative",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 01-9 8.4 8.5 8.5 0 01-3.5-.8L3 20l1-4.5a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 018.5-8.5 8.38 8.38 0 019.4 8.3z" />
        </svg>
        <span
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 13,
            height: 13,
            borderRadius: "50%",
            background: "#4ade80",
            border: "2.5px solid #0e0d12",
          }}
        />
      </button>
    </div>
  );
}
