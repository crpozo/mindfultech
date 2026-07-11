import * as React from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Pill, FooterLinks, DarkCTA } from "@/components/internal/Shared";

export const metadata: Metadata = {
  title: "Work — MindfulTech",
  description: "Case studies: real teams, measured outcomes.",
};

const MONO = "var(--mono)";

type Case = {
  id: string;
  brand: string;
  imageFirst: boolean;
  imageBg: string;
  image?: string;
  link?: { label: string; href: string };
  gallery?: { src: string; alt: string }[];
  tag: string;
  title: string;
  body: string;
  stats: [string, string][];
};

const CASES: Case[] = [
  {
    id: "themedmotion",
    brand: "ThemedMotion",
    imageFirst: true,
    imageBg: "#0b0a09",
    image: "/portfolio/tm-joey.webp",
    link: { label: "VISIT LIVE SITE →", href: "https://crpozo.github.io/themed-motion/" },
    gallery: [
      { src: "/portfolio/tm-build.webp", alt: "Finished character next to its mechanical skeleton" },
      { src: "/portfolio/tm-skeleton.webp", alt: "Mechanical engineering figure" },
      { src: "/portfolio/tm-creature.webp", alt: "Creature character design" },
    ],
    tag: "WEB · 3D · ANIMATRONICS",
    title: "An immersive site for a Dutch animatronics studio",
    body: "ThemedMotion (by P&P Projects, Netherlands) designs and builds animatronics for theme parks worldwide. We crafted their web experience: scroll-driven storytelling across their 7-step process, an interactive drag-to-rotate 3D figure, and a 60-second brief flow.",
    stats: [
      ["3D", "interactive figure viewer"],
      ["07", "scroll-driven chapters"],
      ["60s", "project brief flow"],
    ],
  },
  {
    id: "usfq",
    brand: "USFQ",
    imageFirst: false,
    imageBg: "linear-gradient(150deg,#2a2736,#141126)",
    tag: "EDUCATION · PORTAL · AI ASSIST",
    title: "A campus portal 12,000 students actually use",
    body: "Field studies with 200+ students reshaped onboarding around real course-planning behavior. An AI assistant grounded in the university catalog answers 2,400 questions a week — with human review built in.",
    stats: [
      ["3x", "adoption after relaunch"],
      ["2,400", "questions answered weekly"],
      ["4.8/5", "student satisfaction"],
    ],
  },
  {
    id: "waku",
    brand: "Waku Inc.",
    imageFirst: true,
    imageBg: "linear-gradient(150deg,#39323f,#191521)",
    tag: "E-COMMERCE · AUTOMATION",
    title: "Order processing, from hours to minutes",
    body: "AI-checked workflows now route, validate, and confirm orders automatically across Waku’s storefront and fulfillment — with every exception escalated to a human.",
    stats: [
      ["80%", "less manual processing"],
      ["12 min", "average order turnaround"],
    ],
  },
  {
    id: "kruger",
    brand: "KrugerLabs",
    imageFirst: false,
    imageBg: "linear-gradient(150deg,#2c3340,#151a24)",
    tag: "DESIGN SYSTEMS · ENGINEERING",
    title: "One design system, three platforms",
    body: "A shared component library now powers KrugerLabs’ web, mobile, and internal tools — one codebase to maintain, one visual language for every user.",
    stats: [
      ["3×", "platforms, one system"],
      ["-40%", "UI maintenance time"],
    ],
  },
];

export default function WorkPage() {
  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden", background: "#fff" }}>
      <SiteHeader active="work" megaMenus />

      <section style={{ background: "linear-gradient(180deg,#ffffff,#f4f7fc)", padding: "90px 0 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 40px" }}>
          <Pill>CASE STUDIES</Pill>
          <h1
            style={{
              fontWeight: 500,
              fontSize: "clamp(40px,4.6vw,72px)",
              lineHeight: 1.04,
              letterSpacing: "-.025em",
              margin: "26px 0 0",
              color: "var(--ink)",
            }}
          >
            Real teams, measured outcomes
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.55, color: "#6b6875", maxWidth: 560, margin: "22px auto 0" }}>
            A decade of products in production — from university portals to
            automated commerce.
          </p>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "60px 0 20px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px", display: "flex", flexDirection: "column", gap: 26 }}>
          {CASES.map((c) => {
            const image = (
              <div style={{ position: "relative", minHeight: 380, background: c.imageBg, overflow: "hidden" }}>
                {c.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={c.image}
                    alt={`${c.brand} project`}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0 }}>
                    <ImagePlaceholder label={`${c.brand.toUpperCase()} PROJECT PHOTO`} onDark />
                  </div>
                )}
                <span
                  style={{
                    position: "absolute",
                    left: 20,
                    top: 18,
                    fontWeight: 600,
                    fontSize: 19,
                    color: "#fff",
                    zIndex: 1,
                    textShadow: "0 2px 12px rgba(0,0,0,.55)",
                  }}
                >
                  {c.brand}
                </span>
              </div>
            );
            const text = (
              <div style={{ padding: "clamp(28px,3vw,48px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: ".12em",
                    color: "#44424d",
                    background: "#f1f2f6",
                    padding: "6px 10px",
                    borderRadius: 4,
                    alignSelf: "flex-start",
                  }}
                >
                  {c.tag}
                </span>
                <h2
                  style={{
                    fontWeight: 500,
                    fontSize: "clamp(24px,2.4vw,34px)",
                    lineHeight: 1.15,
                    letterSpacing: "-.015em",
                    margin: "16px 0 12px",
                  }}
                >
                  {c.title}
                </h2>
                <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#55525e", margin: "0 0 20px" }}>{c.body}</p>
                <div style={{ display: "flex", gap: 26, flexWrap: "wrap" }}>
                  {c.stats.map(([v, l]) => (
                    <div key={l}>
                      <div style={{ fontWeight: 500, fontSize: 26, letterSpacing: "-.02em", color: "var(--accent)" }}>{v}</div>
                      <div style={{ fontSize: 12.5, color: "#8b8896" }}>{l}</div>
                    </div>
                  ))}
                </div>
                {c.link && (
                  <a
                    href={c.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-dark"
                    style={{
                      textDecoration: "none",
                      alignSelf: "flex-start",
                      fontFamily: MONO,
                      fontSize: 11.5,
                      fontWeight: 500,
                      letterSpacing: ".12em",
                      background: "#0e0d12",
                      color: "#fff",
                      padding: "13px 20px",
                      borderRadius: 6,
                      marginTop: 22,
                    }}
                  >
                    {c.link.label}
                  </a>
                )}
              </div>
            );
            return (
              <div
                key={c.id}
                id={c.id}
                style={{
                  border: "1px solid rgba(14,13,18,.09)",
                  borderRadius: 16,
                  overflow: "hidden",
                  scrollMarginTop: 120,
                }}
              >
                <div
                  className="stack-2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: c.imageFirst ? "1.1fr 1fr" : "1fr 1.1fr",
                  }}
                >
                  {c.imageFirst ? (
                    <>
                      {image}
                      {text}
                    </>
                  ) : (
                    <>
                      {text}
                      {image}
                    </>
                  )}
                </div>
                {c.gallery && (
                  <div
                    className="stack-3"
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${c.gallery.length},1fr)`,
                      gap: 3,
                      borderTop: "1px solid rgba(14,13,18,.09)",
                      background: "#f4f4f6",
                    }}
                  >
                    {c.gallery.map((g) => (
                      <div key={g.src} className="story-card" style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "#fff" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={g.src}
                          alt={g.alt}
                          className="story-media"
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ background: "#fff", padding: "70px 0 90px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <DarkCTA
            title="Your product could be next"
            subtitle="Tell us where it hurts — we’ll show you what’s possible."
            primary={{ label: "START A PROJECT", href: "mailto:info@mindfultech.ec" }}
          />
          <FooterLinks
            links={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services" },
              { label: "Blog", href: "/blog" },
              { label: "Company", href: "/company" },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
