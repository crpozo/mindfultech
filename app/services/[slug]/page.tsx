import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Pill, FooterLinks, DarkCTA } from "@/components/internal/Shared";

const MONO = "var(--mono)";

type Service = {
  name: string;
  tag: string;
  title: string;
  subtitle: string;
  specs: [string, string][];
  includes: { title: string; desc: string }[];
};

const SERVICES: Record<string, Service> = {
  ux: {
    name: "UX Design",
    tag: "UX DESIGN",
    title: "Products people understand at first tap",
    subtitle:
      "Research-driven design that turns real user behavior into interfaces people love — before a single line of production code.",
    specs: [
      ["METHOD", "Field research & prototyping"],
      ["BEST FOR", "New products, redesigns"],
      ["TIMELINE", "From 3 weeks"],
    ],
    includes: [
      { title: "Field Research", desc: "Interviews and studies with your real users — decisions built on evidence, not opinions." },
      { title: "Journey Mapping", desc: "Every step your users take, mapped and measured, so we fix the moments that matter." },
      { title: "Rapid Prototyping", desc: "Clickable prototypes tested with users weekly, long before engineering starts." },
      { title: "Design Systems", desc: "Tokens and components that keep every screen consistent — and every future build faster." },
      { title: "Interface Design", desc: "Accessible, WCAG-AA interfaces with the craft your brand deserves." },
      { title: "Usability Testing", desc: "Structured tests that tell you what works, what confuses, and what to change." },
    ],
  },
  apps: {
    name: "Web & Mobile Apps",
    tag: "WEB & MOBILE APPS",
    title: "Scalable platforms, built for the long run",
    subtitle:
      "Tailor-made web and mobile applications on modern stacks — aligned to your processes and maintained well beyond launch.",
    specs: [
      ["STACK", "React, Next.js, React Native"],
      ["BEST FOR", "Platforms, portals, e-commerce"],
      ["TIMELINE", "From 8 weeks"],
    ],
    includes: [
      { title: "Web Applications", desc: "Fast, reliable platforms and portals your team and customers use every day." },
      { title: "Mobile Apps", desc: "iOS and Android from one codebase — native feel, single maintenance path." },
      { title: "E-commerce", desc: "Storefronts and checkout flows built to convert, integrate, and scale." },
      { title: "APIs & Integrations", desc: "Clean connections to the systems you already run — ERPs, CRMs, payments." },
      { title: "Performance", desc: "Core Web Vitals in the green: fast loads that keep users and rankings." },
      { title: "Care & Maintenance", desc: "Monitoring, updates, and a team that stays accountable after launch." },
    ],
  },
  custom: {
    name: "Custom Software",
    tag: "CUSTOM SOFTWARE",
    title: "Software shaped around your workflows",
    subtitle:
      "Internal tools and operational systems built for how your team actually works — not the other way around.",
    specs: [
      ["METHOD", "Built around your workflows"],
      ["BEST FOR", "Operations, internal tools"],
      ["TIMELINE", "From 10 weeks"],
    ],
    includes: [
      { title: "Process Discovery", desc: "We sit with your team first — the tool gets designed around the real workflow." },
      { title: "Internal Tools", desc: "Admin panels and back-office systems that remove the spreadsheet glue." },
      { title: "Operations Dashboards", desc: "Live visibility over the numbers your team checks every morning." },
      { title: "Legacy Integration", desc: "New software that talks to the systems you can't (yet) replace." },
      { title: "Roles & Permissions", desc: "The right access for every team member, auditable from day one." },
      { title: "Training & Handover", desc: "Documentation and onboarding so the tool sticks — with or without us." },
    ],
  },
  ai: {
    name: "AI & Automation",
    tag: "AI & AUTOMATION",
    title: "AI your users can actually trust",
    subtitle:
      "Grounded assistants, copilots, and automated workflows — with human review built in from day one.",
    specs: [
      ["METHOD", "Grounded, human-reviewed AI"],
      ["BEST FOR", "Assistants, workflows, search"],
      ["TIMELINE", "From 4 weeks"],
    ],
    includes: [
      { title: "AI Assistants", desc: "Chat and voice assistants grounded in your own knowledge base — no invented answers." },
      { title: "Workflow Automation", desc: "AI-checked pipelines that clear the repetitive work and escalate exceptions to humans." },
      { title: "Intelligent Search", desc: "Answers from your documents and data, cited and verifiable." },
      { title: "Human-in-the-loop", desc: "Review steps where judgment matters — automation with accountability." },
      { title: "LLM Integration", desc: "Claude and other frontier models wired into your product, safely and observably." },
      { title: "Evaluation & Monitoring", desc: "Quality metrics and guardrails so the AI keeps earning trust in production." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(SERVICES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES[slug];
  return {
    title: `${s?.name ?? "Services"} — MindfulTech`,
    description: s?.subtitle,
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = SERVICES[slug];
  if (!s) return null;

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden", background: "#fff" }}>
      <SiteHeader active="services" megaMenus />

      {/* HERO */}
      <section style={{ background: "linear-gradient(180deg,#ffffff,#f4f7fc)", padding: "90px 0 70px", textAlign: "center" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 40px" }}>
          <Pill>{s.tag}</Pill>
          <h1
            style={{
              fontWeight: 500,
              fontSize: "clamp(38px,4.4vw,68px)",
              lineHeight: 1.04,
              letterSpacing: "-.025em",
              margin: "26px 0 0",
              color: "var(--ink)",
            }}
          >
            {s.title}
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.55, color: "#6b6875", maxWidth: 620, margin: "22px auto 0" }}>
            {s.subtitle}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 34, flexWrap: "wrap" }}>
            <a href="mailto:info@mindfultech.ec" className="btn-dark" style={btnDark}>
              START A PROJECT
            </a>
            <Link href="/services" className="btn-light" style={btnLight}>
              ALL SERVICES
            </Link>
          </div>
        </div>

        {/* specs strip */}
        <div style={{ maxWidth: 980, margin: "56px auto 0", padding: "0 40px" }}>
          <div
            className="stack-3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 18,
            }}
          >
            {s.specs.map(([k, v]) => (
              <div
                key={k}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(14,13,18,.09)",
                  borderRadius: 12,
                  padding: "20px 22px",
                  textAlign: "left",
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: "#8b8896" }}>{k}</div>
                <div style={{ fontWeight: 600, fontSize: 17.5, marginTop: 7 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section style={{ background: "#fff", padding: "100px 0 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <h2 style={{ textAlign: "center", fontWeight: 500, fontSize: "clamp(30px,3.2vw,48px)", letterSpacing: "-.02em", margin: 0 }}>
            What&apos;s included
          </h2>
          <p style={{ textAlign: "center", fontSize: 18, color: "#8b8896", maxWidth: 560, margin: "16px auto 52px" }}>
            Everything ships with research, documentation, and a team that stays accountable.
          </p>
          <div
            className="stack-3"
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}
          >
            {s.includes.map((it) => (
              <div
                key={it.title}
                style={{
                  border: "1px solid rgba(14,13,18,.1)",
                  borderRadius: 12,
                  padding: 22,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "var(--accent-tint)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-deep)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <div style={{ fontWeight: 600, fontSize: 17.5, letterSpacing: "-.01em" }}>{it.title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.55, color: "#6b6875" }}>{it.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + footer */}
      <section style={{ background: "#fff", padding: "70px 0 90px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <DarkCTA
            title={`Start your ${s.name} project`}
            subtitle="Tell us what you’re building — we’ll reply within one business day."
            primary={{ label: "GET STARTED NOW", href: "mailto:info@mindfultech.ec" }}
            secondary={{ label: "WHATSAPP →", href: "https://api.whatsapp.com/send?phone=593958731994" }}
          />
          <FooterLinks
            links={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services" },
              { label: "Work", href: "/work" },
              { label: "Company", href: "/company" },
            ]}
          />
        </div>
      </section>
    </div>
  );
}

const btnDark: React.CSSProperties = {
  textDecoration: "none",
  fontFamily: MONO,
  fontSize: 12.5,
  fontWeight: 500,
  letterSpacing: ".12em",
  background: "#0e0d12",
  color: "#fff",
  padding: "16px 26px",
  borderRadius: 6,
};

const btnLight: React.CSSProperties = {
  textDecoration: "none",
  fontFamily: MONO,
  fontSize: 12.5,
  fontWeight: 500,
  letterSpacing: ".12em",
  background: "#e9eaef",
  color: "var(--ink)",
  padding: "16px 26px",
  borderRadius: 6,
};
