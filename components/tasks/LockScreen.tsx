"use client";

import * as React from "react";
import { useLang } from "../i18n";
import {
  hasPasscode,
  setPasscode,
  verifyPasscode,
  setUnlocked,
  resetPasscode,
} from "@/lib/tasks/store";

const MONO = "var(--mono)";

/**
 * Soft passcode gate for /tasks. On first use it asks the owner to create a
 * passcode; afterwards it asks to unlock. Not real encryption — it keeps the
 * board private from a casual onlooker.
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
    setCreating(!hasPasscode());
    setReady(true);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
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
      await setPasscode(pass);
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
          MindfulTech · Tasks
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-.01em", margin: "10px 0 4px", color: "var(--ink)" }}>
          {creating
            ? es
              ? "Crea tu código"
              : "Create your passcode"
            : es
              ? "Desbloquea tu tablero"
              : "Unlock your board"}
        </h1>
        <p style={{ fontSize: 13.5, color: "#6c6a75", margin: "0 0 20px", lineHeight: 1.5 }}>
          {creating
            ? es
              ? "Un código simple para mantener tus tareas privadas en este dispositivo."
              : "A simple code to keep your tasks private on this device."
            : es
              ? "Ingresa tu código para ver tus tareas."
              : "Enter your code to see your tasks."}
        </p>

        <input
          ref={inputRef}
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder={es ? "Código" : "Passcode"}
          autoComplete={creating ? "new-password" : "current-password"}
          style={fieldStyle}
        />
        {creating && (
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={es ? "Confirma el código" : "Confirm passcode"}
            autoComplete="new-password"
            style={{ ...fieldStyle, marginTop: 10 }}
          />
        )}

        {err && (
          <div style={{ color: "#c0392b", fontSize: 12.5, marginTop: 10, fontWeight: 500 }}>{err}</div>
        )}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: "100%",
            marginTop: 18,
            fontFamily: MONO,
            fontSize: 12.5,
            fontWeight: 600,
            letterSpacing: ".12em",
            background: "#0e0d12",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "13px 0",
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {creating ? (es ? "CREAR Y ENTRAR" : "CREATE & ENTER") : es ? "DESBLOQUEAR" : "UNLOCK"}
        </button>

        {!creating && (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  es
                    ? "Se creará un código nuevo. Tus tareas NO se borran (siguen en este navegador). ¿Continuar?"
                    : "You'll set a new code. Your tasks are NOT deleted (they stay in this browser). Continue?"
                )
              ) {
                resetPasscode();
                setCreating(true);
                setPass("");
                setConfirm("");
                setErr("");
                setTimeout(() => inputRef.current?.focus(), 40);
              }
            }}
            style={{
              background: "none",
              border: "none",
              color: "#8b8896",
              fontSize: 12,
              textDecoration: "underline",
              cursor: "pointer",
              marginTop: 14,
            }}
          >
            {es ? "¿Olvidaste tu código?" : "Forgot your code?"}
          </button>
        )}

        <p style={{ fontSize: 11, color: "#a2a0ab", margin: "16px 0 0", lineHeight: 1.5 }}>
          {es
            ? "Tus tareas se guardan solo en este navegador. No se envían a ningún servidor."
            : "Your tasks are stored only in this browser. Nothing is sent to a server."}
        </p>
      </form>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: MONO,
  fontSize: 15,
  letterSpacing: ".18em",
  textAlign: "center",
  padding: "13px 14px",
  borderRadius: 9,
  border: "1.5px solid rgba(14,13,18,.16)",
  background: "#fbfbfd",
  outline: "none",
  color: "var(--ink)",
};
