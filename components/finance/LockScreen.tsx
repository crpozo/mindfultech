"use client";

import * as React from "react";
import {
  ensureDefaultPasscode,
  hasPasscode,
  setPasscode,
  verifyPasscode,
  setUnlocked,
} from "@/lib/finance/store";

const MONO = "var(--mono)";

/**
 * Compuerta suave para /finance. No es cifrado — mantiene el tablero privado de
 * una mirada casual, y por eso resetear el código nunca pierde datos.
 */
export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
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
        setErr("Usa al menos 4 caracteres.");
        return;
      }
      if (pass !== confirm) {
        setErr("Los códigos no coinciden.");
        return;
      }
      setBusy(true);
      const ok = await setPasscode(pass);
      if (!ok) {
        setBusy(false);
        setErr(
          "No se pudo guardar el código en este navegador (¿modo privado?).",
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
      setErr("Código incorrecto.");
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

  if (!ready)
    return <div style={{ minHeight: "100vh", background: "#eef2f9" }} />;

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
        <img
          src="/brand/logo-mark.webp"
          alt=""
          width={46}
          height={46}
          style={{ margin: "0 auto 14px" }}
        />
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
        <h1
          style={{
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "-.01em",
            margin: "10px 0 4px",
            color: "var(--ink)",
          }}
        >
          {creating ? "Crea tu código" : "Abre tu tablero"}
        </h1>
        <p
          style={{
            fontSize: 13.5,
            color: "#6c6a75",
            margin: "0 0 20px",
            lineHeight: 1.5,
          }}
        >
          {creating
            ? "Un código simple para mantener tus finanzas privadas en este dispositivo."
            : "Ingresa tu código para ver tus números."}
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
            placeholder={"repite el código"}
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
          {creating ? "Guardar" : "Entrar"}
        </button>

        {err && (
          <p style={{ fontSize: 12.5, color: "#c2410c", margin: "12px 0 0" }}>
            {err}
          </p>
        )}

        <p
          style={{
            fontSize: 11.5,
            color: "#9a97a6",
            margin: "18px 0 0",
            lineHeight: 1.5,
          }}
        >
          {
            "Tus datos viven solo en este navegador. Exporta un respaldo de vez en cuando."
          }
        </p>
        <p
          style={{
            fontSize: 11.5,
            color: "#9a97a6",
            margin: "8px 0 0",
            lineHeight: 1.5,
          }}
        >
          {"Puedes cambiar el código desde Ajustes cuando quieras."}
        </p>
      </form>
    </div>
  );
}
