"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "../Logo";

const MONO = "var(--mono)";

const FOOTER_COLS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "SERVICES",
    links: [
      { label: "UX Design", href: "/services/ux" },
      { label: "Web & Mobile Apps", href: "/services/apps" },
      { label: "Custom Software", href: "/services/custom" },
      { label: "AI & Automation", href: "/services/ai" },
      { label: "Cloud Architecture", href: "/services" },
    ],
  },
  {
    heading: "WORK",
    links: [
      { label: "Case studies", href: "/work" },
      { label: "USFQ Portal", href: "/work#usfq" },
      { label: "Waku Automation", href: "/work#waku" },
      { label: "KrugerLabs Systems", href: "/work#kruger" },
    ],
  },
  {
    heading: "COMPANY",
    links: [
      { label: "About us", href: "/company#about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/company#careers" },
      { label: "Press", href: "/company#press" },
    ],
  },
  {
    heading: "CONTACT",
    links: [
      { label: "info@mindfultech.ec", href: "mailto:info@mindfultech.ec" },
      { label: "+593 958 73 1994", href: "tel:+593958731994" },
      { label: "WhatsApp", href: "https://api.whatsapp.com/send?phone=593958731994" },
    ],
  },
];

export function ContactFooter() {
  const [open, setOpen] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [files, setFiles] = React.useState<string[]>([]);
  const [dragOver, setDragOver] = React.useState(false);
  const accRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const scrollToAcc = React.useCallback(() => {
    const acc = accRef.current;
    if (!acc) return;
    const y = acc.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    const handler = () => {
      setSubmitted(false);
      setOpen(true);
      setTimeout(scrollToAcc, 120);
    };
    window.addEventListener("mt:open-form", handler as EventListener);
    return () => window.removeEventListener("mt:open-form", handler as EventListener);
  }, [scrollToAcc]);

  const maxH = open ? (innerRef.current?.scrollHeight || 800) + 60 : 0;

  const items = [0, 1, 2, 3];
  const itemStyle = (i: number): React.CSSProperties => ({
    opacity: open ? 1 : 0,
    transform: open ? "translateY(0px)" : "translateY(12px)",
    transition: open
      ? `opacity .5s ease ${140 + i * 100}ms, transform .6s cubic-bezier(.22,.9,.26,1) ${140 + i * 100}ms`
      : "opacity .2s ease, transform .2s ease",
  });

  return (
    <section
      id="contact"
      style={{
        position: "relative",
        background: "linear-gradient(180deg,#ffffff,#f2f5fa 30%,#e9edf5)",
        padding: "120px 0 60px",
        overflow: "hidden",
      }}
    >
      {/* 3D sculpture backdrop (peeks above the floating footer card) */}
      <FooterSculpture />

      <div style={{ position: "relative", maxWidth: 1560, margin: "0 auto", padding: "0 48px" }}>
        <h2
          style={{
            textAlign: "center",
            fontWeight: 500,
            fontSize: "clamp(32px,3.4vw,52px)",
            letterSpacing: "-.02em",
            lineHeight: 1.05,
            margin: 0,
            color: "var(--ink)",
          }}
        >
          Start building with MindfulTech
        </h2>
        <p
          style={{
            textAlign: "center",
            fontSize: 18,
            lineHeight: 1.5,
            color: "#8b8896",
            fontWeight: 400,
            maxWidth: 560,
            margin: "16px auto 0",
          }}
        >
          From the first research session to production AI — one lab, end to end.
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
          <a
            href="#contact"
            className="btn-dark"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("mt:open-form"));
            }}
            style={{
              textDecoration: "none",
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: ".12em",
              background: "#0e0d12",
              color: "#fff",
              padding: "15px 24px",
              borderRadius: 6,
            }}
          >
            GET STARTED NOW
          </a>
        </div>

        {/* accordion form */}
        <div
          ref={accRef}
          style={{
            overflow: "hidden",
            maxHeight: maxH,
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0px) scale(1)" : "translateY(16px) scale(.97)",
            transition:
              "max-height .75s cubic-bezier(.22,.9,.26,1),opacity .5s ease,transform .75s cubic-bezier(.22,.9,.26,1)",
            margin: "0 auto",
            maxWidth: 580,
          }}
        >
          <div
            ref={innerRef}
            style={{
              background: "#fff",
              border: "1px solid rgba(14,13,18,.08)",
              borderRadius: 16,
              boxShadow: "0 30px 70px -30px rgba(14,13,18,.35)",
              padding: 26,
              marginTop: 28,
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <span style={{ fontWeight: 500, fontSize: 22, letterSpacing: "-.02em", color: "var(--ink)" }}>
                Start a project
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
                  border: "none",
                  cursor: "pointer",
                  background: "#f1f2f6",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  fontSize: 15,
                  color: "#44424d",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {!submitted ? (
              <form
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <div style={itemStyle(0)}>
                  <label style={label}>TEMA</label>
                  <input required placeholder="Ej. App móvil para mi negocio" style={input} />
                </div>
                <div style={itemStyle(1)}>
                  <label style={label}>DESCRIPCIÓN</label>
                  <textarea required rows={4} placeholder="Cuéntanos qué quieres construir…" style={{ ...input, resize: "vertical" }} />
                </div>
                <div style={itemStyle(2)}>
                  <label style={label}>ATTACHMENTS</label>
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const f = Array.from(e.dataTransfer.files).map((x) => x.name);
                      if (f.length) setFiles(f);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      border: dragOver ? "1.5px dashed var(--accent)" : "1.5px dashed rgba(14,13,18,.24)",
                      borderRadius: 10,
                      padding: "20px 14px",
                      cursor: "pointer",
                      textAlign: "center",
                      background: dragOver ? "var(--accent-tint)" : "transparent",
                      transition: "border-color .2s,background .2s",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b8896" strokeWidth="1.7" strokeLinecap="round">
                      <path d="M12 16V4M7 9l5-5 5 5" />
                      <path d="M4 20h16" />
                    </svg>
                    <span style={{ fontSize: 13.5, color: "#6b6875" }}>
                      Arrastra archivos aquí o haz click
                    </span>
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => setFiles(Array.from(e.target.files || []).map((x) => x.name))}
                    />
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {files.map((f) => (
                      <span
                        key={f}
                        style={{
                          fontFamily: MONO,
                          fontSize: 10.5,
                          letterSpacing: ".04em",
                          background: "#f1f2f6",
                          border: "1px solid rgba(14,13,18,.1)",
                          borderRadius: 5,
                          padding: "6px 9px",
                          color: "#44424d",
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  style={{
                    ...itemStyle(3),
                    border: "none",
                    cursor: "pointer",
                    fontFamily: MONO,
                    fontSize: 12.5,
                    fontWeight: 500,
                    letterSpacing: ".12em",
                    background: "#0e0d12",
                    color: "#fff",
                    padding: "16px 24px",
                    borderRadius: 8,
                    marginTop: 2,
                  }}
                >
                  ENVIAR →
                </button>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "30px 10px 22px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    color: "#0e0d12",
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
                <div style={{ fontWeight: 500, fontSize: 22, letterSpacing: "-.01em", marginTop: 16, color: "var(--ink)" }}>
                  ¡Recibido!
                </div>
                <div style={{ fontSize: 15, color: "#6b6875", marginTop: 6 }}>
                  Te respondemos en 1 día hábil.
                  <br />
                  También puedes escribirnos:{" "}
                  <a href="mailto:info@mindfultech.ec" style={{ color: "var(--ink)", fontWeight: 600 }}>
                    info@mindfultech.ec
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* floating footer card */}
        <div
          style={{
            position: "relative",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 40px 100px -40px rgba(14,13,18,.4)",
            border: "1px solid rgba(14,13,18,.05)",
            padding: "clamp(28px,3.4vw,48px)",
            marginTop: 130,
          }}
        >
          <div
            className="footer-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr 1fr 1fr 1fr",
              gap: 34,
              alignItems: "start",
            }}
          >
            <div>
              <Logo size={36} />
            </div>
            {FOOTER_COLS.map((col) => (
              <div key={col.heading}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    fontWeight: 500,
                    letterSpacing: ".14em",
                    color: "#8b8896",
                    borderTop: "1px solid rgba(14,13,18,.14)",
                    paddingTop: 14,
                    marginBottom: 16,
                  }}
                >
                  {col.heading}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {col.links.map((l) => (
                    <FooterLink key={l.label} href={l.href} label={l.label} />
                  ))}
                  {col.heading === "CONTACT" && (
                    <span style={{ fontSize: 14, color: "#8b8896" }}>Quito · Ecuador</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ overflow: "hidden", marginTop: 64 }}>
            <div
              style={{
                textAlign: "center",
                fontWeight: 600,
                fontSize: "clamp(52px,8.6vw,150px)",
                letterSpacing: "-.045em",
                lineHeight: 0.95,
                color: "#e2e0e7",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              mindfultech
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
              marginTop: 44,
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: "#8b8896" }}>
              © 2026 MINDFULTECH.
              <br />
              ALL RIGHTS RESERVED.
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <Link href="#contact" style={legal}>Privacy Policy</Link>
              <Link href="#contact" style={legal}>Terms of service</Link>
              <Link href="#contact" style={legal}>Cookie Policy</Link>
              <div style={{ display: "flex", gap: 14, marginLeft: 10 }}>
                <Social label="X">
                  <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.6 2H8l4.4 5.8L18.9 2zm-1.1 18h1.7L7.1 3.9H5.3L17.8 20z" />
                </Social>
                <Social label="LinkedIn">
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.24 8.25h4.52V23H.24V8.25zM8.34 8.25h4.33v2.01h.06c.6-1.14 2.08-2.34 4.28-2.34 4.58 0 5.42 3.01 5.42 6.92V23h-4.51v-7.15c0-1.71-.03-3.9-2.38-3.9-2.38 0-2.75 1.86-2.75 3.78V23H8.34V8.25z" />
                </Social>
                <Social label="GitHub">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.04 11.04 0 015.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.05.78 2.13v3.16c0 .3.21.67.8.55A11.52 11.52 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
                </Social>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  const style: React.CSSProperties = { textDecoration: "none", fontSize: 14, color: "#44424d" };
  if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("http")) {
    return (
      <a href={href} style={style}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} style={style}>
      {label}
    </Link>
  );
}

function Social({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <a href="#contact" aria-label={label} style={{ textDecoration: "none", color: "#0e0d12", display: "flex" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        {children}
      </svg>
    </a>
  );
}

function FooterSculpture() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 640,
        overflow: "hidden",
        pointerEvents: "none",
        // fade out at the bottom so the band never shows a hard edge when
        // the section grows (e.g. when the contact accordion opens)
        WebkitMaskImage: "linear-gradient(180deg,#000 55%,transparent 97%)",
        maskImage: "linear-gradient(180deg,#000 55%,transparent 97%)",
      }}
    >
      <svg
        viewBox="0 0 1440 640"
        preserveAspectRatio="xMidYMax slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="mt-glass" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="#dce8f7" />
            <stop offset="1" stopColor="#a9c7ea" />
          </linearGradient>
          <linearGradient id="mt-blade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7ea6df" />
            <stop offset="1" stopColor="#3f6fd0" />
          </linearGradient>
          <linearGradient id="mt-purple" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#cabff2" />
            <stop offset="1" stopColor="#9a86e0" />
          </linearGradient>
          <linearGradient id="mt-coral" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f4ab95" />
            <stop offset="1" stopColor="#e97a63" />
          </linearGradient>
          <linearGradient id="mt-teal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8fdccd" />
            <stop offset="1" stopColor="#57b7a7" />
          </linearGradient>
          <filter id="mt-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* coral wedge, left edge */}
        <rect
          x="-70" y="300" width="180" height="320" rx="60"
          fill="url(#mt-coral)" opacity="0.9"
          transform="rotate(-14 20 460)" filter="url(#mt-soft)"
        />
        {/* teal accent, lower-left */}
        <ellipse cx="250" cy="600" rx="200" ry="170" fill="url(#mt-teal)" opacity="0.55" filter="url(#mt-soft)" />
        {/* big translucent glass disc, center */}
        <ellipse cx="720" cy="560" rx="380" ry="320" fill="url(#mt-glass)" opacity="0.6" filter="url(#mt-soft)" />
        <ellipse cx="640" cy="470" rx="120" ry="60" fill="#ffffff" opacity="0.35" filter="url(#mt-soft)" />
        {/* blue blade, right */}
        <rect
          x="1210" y="150" width="130" height="430" rx="65"
          fill="url(#mt-blade)" opacity="0.92"
          transform="rotate(19 1275 360)" filter="url(#mt-soft)"
        />
        {/* purple slab, lower-right */}
        <rect x="1050" y="470" width="420" height="220" rx="110" fill="url(#mt-purple)" opacity="0.85" filter="url(#mt-soft)" />
      </svg>

      {/* white glow so the heading stays legible over the forms */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(60% 42% at 50% 26%,rgba(255,255,255,.92),rgba(255,255,255,.5) 55%,transparent 78%)",
        }}
      />
    </div>
  );
}

const label: React.CSSProperties = {
  display: "block",
  fontFamily: MONO,
  fontSize: 10.5,
  fontWeight: 500,
  letterSpacing: ".14em",
  color: "#8b8896",
  marginBottom: 7,
};

const input: React.CSSProperties = {
  width: "100%",
  border: "1px solid rgba(14,13,18,.16)",
  borderRadius: 9,
  padding: "13px 14px",
  fontFamily: "var(--font-outfit),sans-serif",
  fontSize: 15,
  color: "var(--ink)",
  outlineColor: "var(--accent)",
  background: "#fff",
};

const legal: React.CSSProperties = { textDecoration: "none", fontSize: 13.5, color: "#44424d" };
