"use client";

import * as React from "react";
import { useLang } from "../i18n";

const MONO = "var(--mono)";

/**
 * Puerta de entrada. El login real ocurre en el Hosted UI de Cognito — esta
 * pantalla solo lo lanza, así que la contraseña nunca pasa por este código.
 */
export function SignIn({
  onSignIn,
  error,
  configured,
}: {
  onSignIn: () => void;
  error?: string;
  configured: boolean;
}) {
  const { lang } = useLang();
  const es = lang === "es";

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
      <div
        style={{
          width: "100%",
          maxWidth: 400,
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
        <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-.01em", margin: "10px 0 6px", color: "var(--ink)" }}>
          {es ? "Tus finanzas, en un lugar" : "Your finances, in one place"}
        </h1>
        <p style={{ fontSize: 13.5, color: "#6c6a75", margin: "0 0 22px", lineHeight: 1.55 }}>
          {es
            ? "Ingresos, gastos, tendencias y un diagnóstico con IA. Los consumos de tu Diners entran solos desde tu correo."
            : "Income, expenses, trends and an AI diagnosis. Your Diners charges flow in from your inbox automatically."}
        </p>

        {!configured ? (
          <div
            style={{
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 13,
              color: "#9a3412",
              lineHeight: 1.5,
              textAlign: "left",
            }}
          >
            {es
              ? "Falta configurar el backend. Despliega el stack de infra/finance y llena public/finance/config.json con los outputs."
              : "Backend not configured yet. Deploy the infra/finance stack and fill public/finance/config.json with its outputs."}
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="btn-dark"
            style={{
              width: "100%",
              background: "#0e0d12",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "13px 18px",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {es ? "Entrar" : "Sign in"}
          </button>
        )}

        {error && (
          <p style={{ fontSize: 12.5, color: "#c2410c", margin: "14px 0 0", lineHeight: 1.5 }}>{error}</p>
        )}

        <p style={{ fontSize: 11.5, color: "#9a97a6", margin: "18px 0 0", lineHeight: 1.5 }}>
          {es
            ? "Solo el dueño de la cuenta puede entrar. Esta página es privada aunque su dirección sea pública."
            : "Only the account owner can sign in. This page is private even though its address is public."}
        </p>
      </div>
    </div>
  );
}
