"use client";

import * as React from "react";
import Link from "next/link";
import { Logo, MarkDefs } from "./Logo";

type Active = "home" | "services" | "process" | "work" | "blog" | "company";

const MONO = "var(--mono)";
const INK = "#0e0d12";

function openForm(e: React.MouseEvent) {
  e.preventDefault();
  window.dispatchEvent(new CustomEvent("mt:open-form"));
}

/* ---------- mega-menu panels ---------- */

function ServicesPanel() {
  const items = [
    {
      href: "/services#ux",
      title: "UX Design",
      sub: "Research-driven product design",
      icon: (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6" />
        </>
      ),
    },
    {
      href: "/services#apps",
      title: "Web & Mobile Apps",
      sub: "Tailor-made, scalable platforms",
      icon: (
        <>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </>
      ),
    },
    {
      href: "/services#custom",
      title: "Custom Software",
      sub: "Built around your workflows",
      icon: <path d="M14 4l-4 16M18 8l4 4-4 4M6 16l-4-4 4-4" />,
    },
    {
      href: "/services#ai",
      title: "AI & Automation",
      sub: "Assistants, copilots & pipelines",
      icon: (
        <>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
          <circle cx="12" cy="12" r="3.4" />
        </>
      ),
    },
  ];
  const chips: [string, string][] = [
    ["REACT", "#7fd3ee"],
    ["AWS", "#ffb38a"],
    ["NEXT.JS", "#9db4ff"],
    ["NODE", "#6fd3b8"],
    ["SHOPIFY", "var(--accent-light)"],
    ["WORDPRESS", "#c6c3d4"],
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.05fr 0.95fr",
        gap: 18,
        background: "#fff",
        border: "1px solid rgba(14,13,18,.06)",
        borderRadius: 16,
        boxShadow: "0 30px 80px -30px rgba(14,13,18,.35)",
        padding: 20,
        width: "min(780px,calc(100vw - 60px))",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="menu-item"
            style={{
              textDecoration: "none",
              color: INK,
              display: "grid",
              gridTemplateColumns: "46px 1fr",
              gap: 14,
              alignItems: "center",
              padding: "10px 12px",
              borderRadius: 10,
              transition: "background .15s",
            }}
          >
            <span
              style={{
                width: 46,
                height: 46,
                borderRadius: 11,
                background: "var(--accent-tint)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0e0d12"
                strokeWidth="1.7"
                strokeLinecap="round"
              >
                {it.icon}
              </svg>
            </span>
            <span>
              <span
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: 17,
                  letterSpacing: "-.01em",
                }}
              >
                {it.title}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 14.5,
                  color: "#7b7885",
                  marginTop: 2,
                }}
              >
                {it.sub}
              </span>
            </span>
          </Link>
        ))}
      </div>
      <Link
        href="/services"
        className="menu-card"
        style={{
          textDecoration: "none",
          color: INK,
          display: "block",
          background: "#f6f7f9",
          borderRadius: 12,
          padding: 16,
          transition: "background .15s",
        }}
      >
        <span
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignContent: "flex-start",
            background: "#17151f",
            borderRadius: 10,
            padding: "16px 14px",
            minHeight: 150,
          }}
        >
          {chips.map(([label, dot]) => (
            <span
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: ".08em",
                color: "#eceaf4",
                border: "1px solid rgba(255,255,255,.16)",
                borderRadius: 7,
                padding: "8px 12px",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: dot,
                }}
              />
              {label}
            </span>
          ))}
        </span>
        <span
          style={{
            display: "block",
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: "-.01em",
            marginTop: 14,
          }}
        >
          Tech stack
        </span>
        <span
          style={{
            display: "block",
            fontSize: 14.5,
            color: "#7b7885",
            marginTop: 2,
          }}
        >
          Explore the tools we ship with
        </span>
      </Link>
    </div>
  );
}

function CompanyPanel() {
  const col = (
    heading: string,
    rows: { href: string; title: string; sub: string; icon: React.ReactNode }[]
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: ".14em",
          color: "#8b8896",
          padding: "0 12px 8px",
        }}
      >
        {heading}
      </span>
      {rows.map((r) => (
        <Link
          key={r.href + r.title}
          href={r.href}
          className="menu-item"
          style={{
            textDecoration: "none",
            color: INK,
            display: "grid",
            gridTemplateColumns: "44px 1fr",
            gap: 14,
            alignItems: "center",
            padding: "10px 12px",
            borderRadius: 10,
            transition: "background .15s",
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: "#f1f2f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0e0d12"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              {r.icon}
            </svg>
          </span>
          <span>
            <span
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: 16.5,
                letterSpacing: "-.01em",
              }}
            >
              {r.title}
            </span>
            <span
              style={{
                display: "block",
                fontSize: 14,
                color: "#7b7885",
                marginTop: 2,
              }}
            >
              {r.sub}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px 36px",
        background: "#fff",
        border: "1px solid rgba(14,13,18,.06)",
        borderRadius: 16,
        boxShadow: "0 30px 80px -30px rgba(14,13,18,.35)",
        padding: 24,
        width: "min(660px,calc(100vw - 60px))",
      }}
    >
      {col("RESOURCES", [
        {
          href: "/work",
          title: "Case studies",
          sub: "Results from real projects",
          icon: <path d="M4 6h7M4 10h5M4 14h7M4 18h9M15 6h5M17 4v4" />,
        },
        {
          href: "/blog",
          title: "Blog",
          sub: "Our latest news & posts",
          icon: (
            <>
              <rect x="4" y="4" width="13" height="16" rx="2" />
              <path d="M8 8h5M8 12h5M8 16h3M17 8h3v10a2 2 0 01-2 2" />
            </>
          ),
        },
        {
          href: "mailto:info@mindfultech.ec",
          title: "Support",
          sub: "Talk to the team",
          icon: (
            <path d="M21 11.5a8.38 8.38 0 01-9 8.4 8.5 8.5 0 01-3.5-.8L3 20l1-4.5a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 018.5-8.5 8.38 8.38 0 019.4 8.3z" />
          ),
        },
      ])}
      {col("COMPANY", [
        {
          href: "/company#about",
          title: "About",
          sub: "Get to know us",
          icon: (
            <>
              <path d="M21 11.5a8.38 8.38 0 01-9 8.4 8.5 8.5 0 01-3.5-.8L3 20l1-4.5a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 018.5-8.5 8.38 8.38 0 019.4 8.3z" />
              <path d="M9 10h.01M15 10h.01M9.5 13.5c.7.7 1.6 1 2.5 1s1.8-.3 2.5-1" />
            </>
          ),
        },
        {
          href: "/company#careers",
          title: "Careers",
          sub: "Join our mission",
          icon: (
            <>
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
            </>
          ),
        },
        {
          href: "/company#press",
          title: "Press",
          sub: "MindfulTech in the news",
          icon: (
            <>
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0014 0M12 18v3" />
            </>
          ),
        },
      ])}
    </div>
  );
}

/* ---------- header ---------- */

export function SiteHeader({
  active = "home",
  megaMenus = false,
  ctaMode = "mailto",
}: {
  active?: Active;
  megaMenus?: boolean;
  ctaMode?: "form" | "mailto";
}) {
  const [open, setOpen] = React.useState<null | "services" | "company">(null);
  const [panelLeft, setPanelLeft] = React.useState(0);
  const rowRef = React.useRef<HTMLDivElement>(null);
  const svcRef = React.useRef<HTMLButtonElement>(null);
  const coRef = React.useRef<HTMLButtonElement>(null);
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const position = (which: "services" | "company") => {
    const row = rowRef.current;
    const trigger = which === "services" ? svcRef.current : coRef.current;
    const panel = panelRef.current;
    if (!row || !trigger) return;
    const rr = row.getBoundingClientRect();
    const tr = trigger.getBoundingClientRect();
    const pw = panel?.offsetWidth || (which === "services" ? 780 : 660);
    let left = tr.left - rr.left + tr.width / 2 - pw / 2;
    left = Math.max(12, Math.min(left, rr.width - pw - 12));
    setPanelLeft(left);
  };

  const doOpen = (which: "services" | "company") => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setOpen(which);
    // measure after paint so panel width is known
    requestAnimationFrame(() => position(which));
  };
  const scheduleClose = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setOpen(null), 160);
  };

  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    textDecoration: "none",
    fontSize: 14,
    fontWeight: isActive ? 500 : 400,
    color: isActive ? "var(--accent)" : "#1a1820",
  });

  const caret = (which: "services" | "company") => (
    <svg
      width="9"
      height="6"
      viewBox="0 0 9 6"
      fill="none"
      style={{
        transition: "transform .2s",
        transform: open === which ? "rotate(180deg)" : "none",
      }}
    >
      <path
        d="M1 1l3.5 3.5L8 1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );

  const triggerBtn = (
    which: "services" | "company",
    label: string,
    ref: React.RefObject<HTMLButtonElement | null>
  ) => (
    <button
      ref={ref}
      onMouseEnter={() => doOpen(which)}
      onMouseLeave={scheduleClose}
      onClick={() => (open === which ? setOpen(null) : doOpen(which))}
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 14,
        fontWeight: 400,
        color: "#1a1820",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "10px 0",
      }}
    >
      {label} {caret(which)}
    </button>
  );

  const ctaSales = ctaMode === "form" ? "#contact" : "mailto:info@mindfultech.ec";
  const ctaStart = ctaMode === "form" ? "#contact" : "mailto:info@mindfultech.ec";
  const ctaProps = (href: string) =>
    ctaMode === "form"
      ? { href, onClick: openForm }
      : { href };

  return (
    <>
      <MarkDefs />
      {/* announce bar */}
      <div
        style={{
          background: "#0a0a0c",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "13px 20px",
        }}
      >
        <Link
          href="/#news"
          className="announce-link"
          style={{
            textDecoration: "none",
            color: "#fff",
            fontFamily: MONO,
            fontSize: 13,
            letterSpacing: ".02em",
          }}
        >
          Announcing our AI practice. Intelligent products, built for humans →
        </Link>
      </div>

      <div style={{ background: megaMenus ? "#edf2fa" : "transparent" }}>
        <div
          ref={rowRef}
          className="navrow"
          style={{
            position: "relative",
            display: "flex",
            gap: 14,
            padding: "16px 18px",
            maxWidth: 1560,
            margin: "0 auto",
          }}
        >
          <nav
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 28,
              background: "#fff",
              border: "1px solid rgba(14,13,18,.07)",
              borderRadius: 14,
              padding: "14px 22px",
              boxShadow: "0 6px 24px -18px rgba(14,13,18,.25)",
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                color: "var(--ink)",
              }}
            >
              <Logo size={28} />
              <span
                style={{
                  fontWeight: 500,
                  fontSize: 20,
                  letterSpacing: "-.02em",
                }}
              >
                mindfultech
              </span>
            </Link>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 32,
              }}
            >
              {megaMenus ? (
                triggerBtn("services", "Services", svcRef)
              ) : (
                <Link href="/services" style={linkStyle(active === "services")}>
                  Services
                </Link>
              )}
              <Link href="/#research" style={linkStyle(active === "process")}>
                Process
              </Link>
              <Link href="/work" style={linkStyle(active === "work")}>
                Work
              </Link>
              <Link href="/blog" style={linkStyle(active === "blog")}>
                Blog
              </Link>
              {megaMenus ? (
                triggerBtn("company", "Company", coRef)
              ) : (
                <Link href="/company" style={linkStyle(active === "company")}>
                  Company
                </Link>
              )}
            </div>
          </nav>

          <div
            className="nav-cta"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#fff",
              border: "1px solid rgba(14,13,18,.07)",
              borderRadius: 14,
              padding: "10px 12px",
              boxShadow: "0 6px 24px -18px rgba(14,13,18,.25)",
            }}
          >
            <span
              style={{
                width: 34,
                height: 4,
                borderRadius: 2,
                background: "color-mix(in srgb,var(--accent) 30%,#e6e4ee)",
              }}
            />
            <a
              {...ctaProps(ctaSales)}
              className="hide-narrow"
              style={{
                textDecoration: "none",
                fontFamily: MONO,
                fontSize: 11.5,
                fontWeight: 500,
                letterSpacing: ".1em",
                color: "var(--ink)",
                padding: "12px 16px",
                whiteSpace: "nowrap",
              }}
            >
              CONTACT SALES
            </a>
            <a
              {...ctaProps(ctaStart)}
              className="btn-dark"
              style={{
                textDecoration: "none",
                fontFamily: MONO,
                fontSize: 11.5,
                fontWeight: 500,
                letterSpacing: ".1em",
                background: "#0e0d12",
                color: "#fff",
                padding: "13px 20px",
                borderRadius: 6,
                whiteSpace: "nowrap",
              }}
            >
              START A PROJECT
            </a>
          </div>

          {/* mega-menu panel */}
          {megaMenus && open && (
            <div
              ref={panelRef}
              onMouseEnter={() => {
                if (hideTimer.current) clearTimeout(hideTimer.current);
              }}
              onMouseLeave={scheduleClose}
              style={{
                position: "absolute",
                top: "calc(100% - 8px)",
                left: panelLeft,
                zIndex: 400,
              }}
            >
              {open === "services" ? <ServicesPanel /> : <CompanyPanel />}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
