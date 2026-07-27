"use client";

import * as React from "react";
import { useLang } from "../i18n";
import { ensureDefaultPasscode, hasPasscode, setPasscode, verifyPasscode, setUnlocked } from "@/lib/finance/store";

const MONO = "var(--mono)";

/**
 * Compuerta suave para /finance. La primera vez pide crear un código; después
 * pide desbloquear. No es cifrado — mantiene el tablero privado de una mirada
 * casual, y por eso resetear el código nunca pierde datos.
 */
export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { lang } = useLang();
  const es = lang === "es";
  const [creating, setCreating] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [pass, setPass] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let alive = true;
    void (async () => {
      // El código por defecto se siembra solo: nadie debería toparse con una
      // pantalla de configuración antes de ver sus números.
      await ensureDefaultPasscode();
      if (!alive) return;
      setCreating(!hasPasscode());
      setReady(true);
      setTimeout(() => inputRef.current?.focus(), 60);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (creating) {
      if (pass.length < 4) {
        setErr(es ? "Usa al menos 4 caracteres." : "Use at least 4 characters.");
        return;
      }
      if (pass !== confirm) {
        setErr(es ? "Los códigos no coinciden." : "The codes don't match.");
        return;
      }
      setBusy(true);
      const ok = await setPasscode(pass);
      if (!ok) {
        setBusy(false);
        setErr(
          es
            ? "No se pudo guardar el código en este navegador (¿modo privado?)."
            : "Couldn't save the passcode in this browser (private mode?)."
        );
        return;
      }
      setUnlocked(true);
      onUnlock();
      return;
    }
    setBusy(true);
    const ok = await verifyPasscode(pass);
    setBusy(false);
    if (!ok) {
      setErr(es ? "Código incorrecto." : "Wrong passcode.");
      setPass("");
      inputRef.current?.focus();
      return;
    }
    setUnlocked(true);
    onUnlock();
  };

  const input: React.CSSProperties = {
    width: "100%",
    border: "1px solid rgba(14,13,18,.12)",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 15,
    textAlign: "center",
    letterSpacing: ".2em",
    fontFamily: MONO,
    marginBottom: 10,
  };

  if (!ready) return <div style={{ minHeight: "100vh", background: "#eef2f9" }} />;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "linear-gradient(180deg,#eef2fa 0%,#e5ebf6 100%)",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          borderRadius: 18,
          border: "1px solid rgba(14,13,18,.08)",
          boxShadow: "0 30px 70px -34px rgba(14,13,18,.4)",
          padding: "34px 30px",
          textAlign: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-mark.webp" alt="" width={46} height={46} style={{ margin: "0 auto 14px" }} />
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: ".22em",
            color: "#8b8896",
            textTransform: "uppercase",
          }}
        >
          MindfulTech · Finanzas
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-.01em", margin: "10px 0 4px", color: "var(--ink)" }}>
          {creating
            ? es
              ? "Crea tu código"
              : "Create your passcode"
            : es
              ? "Abre tu tablero"
              : "Open your board"}
        </h1>
        <p style={{ fontSize: 13.5, color: "#6c6a75", margin: "0 0 20px", lineHeight: 1.5 }}>
          {creating
            ? es
              ? "Un código simple para mantener tus finanzas privadas en este dispositivo."
              : "A simple code to keep your finances private on this device."
            : es
              ? "Ingresa tu código para ver tus números."
              : "Enter your code to see your numbers."}
        </p>

        <input
          ref={inputRef}
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="••••"
          autoComplete={creating ? "new-password" : "current-password"}
          style={input}
        />
        {creating && (
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={es ? "repite el código" : "repeat the code"}
            autoComplete="new-password"
            style={input}
          />
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-dark"
          style={{
            width: "100%",
            background: "#0e0d12",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 18px",
            fontSize: 15,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {creating ? (es ? "Guardar" : "Save") : es ? "Entrar" : "Unlock"}
        </button>

        {err && <p style={{ fontSize: 12.5, color: "#c2410c", margin: "12px 0 0" }}>{err}</p>}

        <p style={{ fontSize: 11.5, color: "#9a97a6", margin: "18px 0 0", lineHeight: 1.5 }}>
          {es
            ? "Tus datos viven solo en este navegador. Exporta un respaldo de vez en cuando."
            : "Your data lives only in this browser. Export a backup once in a while."}
        </p>
        <p style={{ fontSize: 11.5, color: "#9a97a6", margin: "8px 0 0", lineHeight: 1.5 }}>
          {es
            ? "Puedes cambiar el código desde Ajustes cuando quieras."
            : "You can change the passcode from Settings whenever you like."}
        </p>
      </form>
    </div>
  );
}
