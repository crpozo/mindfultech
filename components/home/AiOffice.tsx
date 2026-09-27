"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "../i18n";

const MONO = "var(--mono)";

/**
 * Homepage section for the AI Management Office: a team of AI employees that
 * runs a company's routine work (sales follow-up, support, finance, ops…)
 * and that the client can watch, question and audit in a live 3D office.
 * Links to the interactive demo at /office-demo.
 */
const T = {
  en: {
    tag: "AI MANAGEMENT OFFICE",
    title: "An office of AI employees, working for you around the clock",
    sub: "We hire, train and manage a team of AI agents for your company. Each one owns a role, uses your real tools, and you can see exactly what it is doing at any moment.",
    cta: "OPEN THE LIVE DEMO",
    cta2: "TALK ABOUT YOUR OFFICE",
    hint: "Interactive 3D demo · click any employee to see their screen and chat with them",
    roles: [
      { icon: "📈", title: "Sales", desc: "Qualifies leads, sends follow-ups and books meetings in your CRM." },
      { icon: "🎧", title: "Support", desc: "Answers tickets and WhatsApp 24/7 and escalates to a human when it matters." },
      { icon: "🧾", title: "Finance", desc: "Issues invoices, reconciles the bank and chases receivables." },
      { icon: "📣", title: "Marketing", desc: "Plans, publishes and reports on social campaigns every week." },
      { icon: "⚙️", title: "Operations", desc: "Orders supplies, coordinates the calendar and keeps inventory in check." },
      { icon: "🛎️", title: "Reception", desc: "Confirms appointments, welcomes visitors and routes every request." },
    ],
    how: [
      { n: "01", title: "Map the work", desc: "We list the routine tasks of your team and pick the ones an agent can own end to end." },
      { n: "02", title: "Hire the agents", desc: "Each role gets its own agent, connected to your tools: CRM, help desk, accounting, messaging." },
      { n: "03", title: "Watch it run", desc: "The office shows what each agent is doing in real time; a human approves whatever needs a signature." },
    ],
  },
  es: {
    tag: "OFICINA DE GESTIÓN CON IA",
    title: "Una oficina de empleados IA trabajando para ti las 24 horas",
    sub: "Contratamos, entrenamos y administramos un equipo de agentes de IA para tu empresa. Cada uno tiene un rol, usa tus herramientas reales y puedes ver exactamente qué está haciendo en cada momento.",
    cta: "ABRIR LA DEMO EN VIVO",
    cta2: "HABLEMOS DE TU OFICINA",
    hint: "Demo 3D interactiva · haz clic en cualquier empleado para ver su pantalla y chatear",
    roles: [
      { icon: "📈", title: "Ventas", desc: "Califica leads, envía seguimientos y agenda reuniones en tu CRM." },
      { icon: "🎧", title: "Soporte", desc: "Responde tickets y WhatsApp 24/7 y escala a un humano cuando importa." },
      { icon: "🧾", title: "Finanzas", desc: "Emite facturas, concilia el banco y da seguimiento a las cuentas por cobrar." },
      { icon: "📣", title: "Marketing", desc: "Planifica, publica y reporta las campañas en redes cada semana." },
      { icon: "⚙️", title: "Operaciones", desc: "Pide insumos, coordina la agenda y mantiene el inventario al día." },
      { icon: "🛎️", title: "Recepción", desc: "Confirma citas, recibe visitantes y dirige cada solicitud." },
    ],
    how: [
      { n: "01", title: "Mapeamos el trabajo", desc: "Listamos las tareas rutinarias de tu equipo y elegimos las que un agente puede asumir de punta a punta." },
      { n: "02", title: "Contratamos los agentes", desc: "Cada rol recibe su propio agente, conectado a tus herramientas: CRM, mesa de ayuda, contabilidad, mensajería." },
      { n: "03", title: "Lo ves funcionar", desc: "La oficina muestra qué hace cada agente en tiempo real; un humano aprueba lo que necesita firma." },
    ],
  },
};

export function AiOffice() {
  const { lang } = useLang();
  const t = T[lang];
  return (
    <section id="ai-office" style={{ position: "relative", background: "#f4efe3", padding: "var(--section-y) 0" }}>
      <div style={{ maxWidth: 1560, margin: "0 auto", padding: "0 48px" }}>
        <div className="aio-top" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 720 }}>
            <span style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 500, letterSpacing: ".16em", color: "#6b6fae" }}>{t.tag}</span>
            <h2
              style={{
                fontWeight: 500,
                fontSize: "clamp(36px,3.8vw,60px)",
                letterSpacing: "-.02em",
                lineHeight: 1.04,
                margin: "14px 0 0",
                color: "var(--ink)",
              }}
            >
              {t.title}
            </h2>
            <p style={{ fontSize: 19, lineHeight: 1.5, color: "#4c4a55", margin: "18px 0 0", maxWidth: 640 }}>{t.sub}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <Link
              href="/office-demo/"
              className="btn-dark"
              style={{
                textDecoration: "none",
                fontFamily: MONO,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: ".12em",
                background: "#0e0d12",
                color: "#fff",
                padding: "16px 26px",
                borderRadius: 6,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,.25)" }} />
              {t.cta}
            </Link>
            <span style={{ fontSize: 12.5, color: "#6b6880", maxWidth: 320, lineHeight: 1.45 }}>{t.hint}</span>
          </div>
        </div>

        {/* the office, as a card that opens the demo */}
        <Link
          href="/office-demo/"
          aria-label={t.cta}
          className="aio-card"
          style={{
            display: "block",
            position: "relative",
            marginTop: 40,
            borderRadius: 22,
            overflow: "hidden",
            background: "radial-gradient(120% 90% at 50% 32%, #d8caab 0%, #cbbc9d 48%, #b7a583 100%)",
            border: "1px solid rgba(14,13,18,.08)",
            boxShadow: "0 30px 70px -40px rgba(14,13,18,.45)",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/office-demo-preview.webp"
            alt={lang === "es" ? "Vista de la oficina 3D con los empleados IA" : "The 3D office with the AI employees"}
            width={1600}
            height={950}
            loading="lazy"
            decoding="async"
            style={{ display: "block", width: "100%", height: "auto" }}
          />
          <div
            style={{
              position: "absolute",
              left: 20,
              bottom: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,.9)",
              backdropFilter: "blur(10px)",
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: ".12em",
              color: "#0e0d12",
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
            {lang === "es" ? "11 EMPLEADOS IA EN LÍNEA" : "11 AI EMPLOYEES ONLINE"}
          </div>
        </Link>

        {/* roles */}
        <div className="aio-roles" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginTop: 40 }}>
          {t.roles.map((r) => (
            <div key={r.title} style={{ background: "#fff", border: "1px solid rgba(14,13,18,.08)", borderRadius: 16, padding: "18px 18px 20px" }}>
              <div style={{ fontSize: 24 }}>{r.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 17, marginTop: 10, color: "var(--ink)" }}>{r.title}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#5c5967", marginTop: 6 }}>{r.desc}</div>
            </div>
          ))}
        </div>

        {/* how it works */}
        <div className="aio-how" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28, marginTop: 56 }}>
          {t.how.map((h) => (
            <div key={h.n} style={{ borderTop: "1.5px solid rgba(14,13,18,.14)", paddingTop: 18 }}>
              <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", color: "#6b6fae" }}>{h.n}</span>
              <div style={{ fontWeight: 600, fontSize: 19, marginTop: 8, color: "var(--ink)" }}>{h.title}</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.6, color: "#5c5967", marginTop: 8 }}>{h.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 14, marginTop: 44, flexWrap: "wrap" }}>
          <Link href="/office-demo/" className="btn-dark" style={{ textDecoration: "none", fontFamily: MONO, fontSize: 13, fontWeight: 500, letterSpacing: ".12em", background: "#0e0d12", color: "#fff", padding: "16px 26px", borderRadius: 6 }}>
            {t.cta}
          </Link>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("mt:open-form"));
            }}
            className="btn-light"
            style={{
              textDecoration: "none",
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: ".12em",
              background: "#fff",
              color: "var(--ink)",
              border: "1.5px solid rgba(14,13,18,.28)",
              padding: "14.5px 26px",
              borderRadius: 6,
            }}
          >
            {t.cta2}
          </a>
        </div>
      </div>
    </section>
  );
}
