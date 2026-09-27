"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "../i18n";

const MONO = "var(--mono)";

/**
 * Homepage section for the AI Management Office: a company run by AI agents,
 * one per role, that the client can watch, question and audit in a live 3D
 * office. Header, the office itself (a link to /office-demo) and the list of
 * roles; sized to about a viewport and a half.
 */
const T = {
  en: {
    tag: "AI MANAGEMENT OFFICE",
    title: "An office where every employee is an AI agent",
    sub: "We set one up for your company: one agent per role, connected to the tools you already use. You open the office, watch what each agent is doing, ask it questions and sign off on whatever needs a person. The office below is the demo, running.",
    cta: "OPEN THE LIVE DEMO",
    alt: "The 3D office with the AI employees at their desks",
    lead: "One agent per role",
    leadNote: "Each one works inside your tools: CRM, help desk, accounting, WhatsApp, calendar. A person approves what needs a signature.",
    roles: [
      { title: "Sales", desc: "Qualifies leads, follows up and books meetings in your CRM." },
      { title: "Support", desc: "Answers tickets and WhatsApp 24/7, escalates to a person when it matters." },
      { title: "Finance", desc: "Issues invoices, reconciles the bank and chases receivables." },
      { title: "Marketing", desc: "Plans, publishes and reports the week's campaigns." },
      { title: "Operations", desc: "Orders supplies and keeps the calendar and inventory in order." },
      { title: "Reception", desc: "Confirms appointments and routes every request to the right place." },
    ],
  },
  es: {
    tag: "OFICINA DE GESTIÓN CON IA",
    title: "Una oficina donde cada empleado es un agente de IA",
    sub: "La montamos para tu empresa: un agente por rol, conectado a las herramientas que ya usas. Abres la oficina, ves qué está haciendo cada agente, le preguntas y apruebas lo que necesita una persona. La oficina de abajo es la demo, funcionando.",
    cta: "ABRIR LA DEMO EN VIVO",
    alt: "La oficina 3D con los empleados IA en sus escritorios",
    lead: "Un agente por rol",
    leadNote: "Cada uno trabaja dentro de tus herramientas: CRM, mesa de ayuda, contabilidad, WhatsApp, agenda. Una persona aprueba lo que necesita firma.",
    roles: [
      { title: "Ventas", desc: "Califica leads, da seguimiento y agenda reuniones en tu CRM." },
      { title: "Soporte", desc: "Responde tickets y WhatsApp 24/7 y escala a una persona cuando importa." },
      { title: "Finanzas", desc: "Emite facturas, concilia el banco y cobra las cuentas pendientes." },
      { title: "Marketing", desc: "Planifica, publica y reporta las campañas de la semana." },
      { title: "Operaciones", desc: "Pide insumos y mantiene la agenda y el inventario en orden." },
      { title: "Recepción", desc: "Confirma citas y dirige cada solicitud a quien corresponde." },
    ],
  },
};

export function AiOffice() {
  const { lang } = useLang();
  const t = T[lang];
  return (
    <section id="ai-office" style={{ position: "relative", background: "#f4efe3", padding: "var(--section-y) 0" }}>
      <div style={{ maxWidth: 1560, margin: "0 auto", padding: "0 48px" }}>
        <div className="aio-head">
          <div>
            <span style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 500, letterSpacing: ".16em", color: "#6b6fae" }}>{t.tag}</span>
            <h2
              style={{
                fontWeight: 500,
                fontSize: "clamp(34px,3.4vw,54px)",
                letterSpacing: "-.02em",
                lineHeight: 1.06,
                margin: "14px 0 0",
                color: "var(--ink)",
                maxWidth: 640,
              }}
            >
              {t.title}
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 18, lineHeight: 1.55, color: "#4c4a55", margin: 0, maxWidth: 600 }}>{t.sub}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 22, flexWrap: "wrap" }}>
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
                  whiteSpace: "nowrap",
                }}
              >
                {t.cta}
              </Link>
            </div>
          </div>
        </div>

        {/* the office itself; the whole picture opens the demo */}
        <Link
          href="/office-demo/"
          aria-label={t.cta}
          className="aio-card"
          style={{
            marginTop: 36,
            background: "#cbbc9d",
            border: "1px solid rgba(14,13,18,.08)",
            boxShadow: "0 30px 70px -40px rgba(14,13,18,.45)",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/office-demo-preview.webp"
            alt={t.alt}
            width={1800}
            height={760}
            loading="lazy"
            decoding="async"
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 45%" }}
          />
        </Link>

        {/* roles: a lead cell plus six short entries */}
        <div className="aio-roles" style={{ marginTop: 34 }}>
          <div className="aio-lead" style={{ borderTop: "1px solid rgba(14,13,18,.16)", padding: "16px 0 18px", paddingRight: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 19, color: "var(--ink)", letterSpacing: "-.01em" }}>{t.lead}</div>
            <div style={{ fontSize: 14, lineHeight: 1.55, color: "#5c5967", marginTop: 8, maxWidth: 300 }}>{t.leadNote}</div>
          </div>
          {t.roles.map((r) => (
            <div key={r.title} style={{ borderTop: "1px solid rgba(14,13,18,.16)", padding: "16px 0 18px" }}>
              <div style={{ fontWeight: 600, fontSize: 15.5, color: "var(--ink)" }}>{r.title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.5, color: "#5c5967", marginTop: 5 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
