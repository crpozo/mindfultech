import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Pill, FooterLinks } from "@/components/internal/Shared";

export const metadata: Metadata = {
  title: "Blog — MindfulTech",
  description: "Notes on research, engineering, and building AI people can trust.",
};

const MONO = "var(--mono)";

const POSTS = [
  {
    href: "/work#usfq",
    bg: "linear-gradient(140deg,#141126,color-mix(in srgb,var(--accent) 55%,#141126))",
    onDark: true,
    tag: "CASE STUDY",
    title: "USFQ: a campus portal 12,000 students actually use",
    body: "Adoption tripled after we rebuilt onboarding around real course-planning behavior…",
  },
  {
    href: "/work#waku",
    bg: "linear-gradient(140deg,color-mix(in srgb,var(--accent) 40%,#f0e8ee),#f6f1f5)",
    onDark: false,
    tag: "ENGINEERING",
    title: "How we cut Waku’s fulfillment time with automation",
    body: "Order processing dropped from hours to minutes with AI-checked workflows…",
  },
  {
    href: "mailto:info@mindfultech.ec?subject=Playbook",
    bg: "linear-gradient(140deg,#dfe6f2,#c9d4e8)",
    onDark: false,
    tag: "RESEARCH",
    title: "Designing AI features people trust",
    body: "Our playbook for grounding, transparency, and human review in production AI…",
  },
];

export default function BlogPage() {
  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden", background: "#fff" }}>
      <SiteHeader active="blog" megaMenus />

      <section style={{ background: "linear-gradient(180deg,#ffffff,#f4f7fc)", padding: "80px 0 50px", textAlign: "center" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 40px" }}>
          <Pill>BLOG</Pill>
          <h1
            style={{
              fontWeight: 500,
              fontSize: "clamp(38px,4.4vw,68px)",
              lineHeight: 1.04,
              letterSpacing: "-.025em",
              margin: "24px 0 0",
              color: "var(--ink)",
            }}
          >
            What&apos;s new at MindfulTech
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: "#6b6875", maxWidth: 520, margin: "20px auto 0" }}>
            Notes on research, engineering, and building AI people can trust.
          </p>
        </div>
      </section>

      <section id="featured" style={{ background: "#fff", padding: "50px 0 90px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div
            className="stack-2"
            style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "clamp(30px,4vw,64px)", alignItems: "start" }}
          >
            {/* featured */}
            <a href="mailto:info@mindfultech.ec?subject=Blog" style={{ textDecoration: "none", color: "var(--ink)", display: "block" }}>
              <div
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  aspectRatio: "16/10",
                  position: "relative",
                  background:
                    "linear-gradient(140deg,color-mix(in srgb,var(--accent) 18%,#e8e4f4),#efeaf6 55%,color-mix(in srgb,var(--accent) 30%,#fff))",
                }}
              >
                <ImagePlaceholder label="FEATURED IMAGE" />
              </div>
              <span
                style={{
                  display: "inline-block",
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: ".12em",
                  color: "#44424d",
                  background: "#f1f2f6",
                  padding: "7px 12px",
                  borderRadius: 4,
                  marginTop: 22,
                }}
              >
                COMPANY
              </span>
              <h2 style={{ fontWeight: 500, fontSize: "clamp(24px,2.4vw,34px)", lineHeight: 1.2, letterSpacing: "-.015em", margin: "14px 0 10px" }}>
                MindfulTech is now an AI-first software lab
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.55, color: "#6b6875", margin: 0, maxWidth: 560 }}>
                Ten years of human-centered software, now with applied AI in every
                engagement. Here&apos;s what changes — and what never will.
              </p>
            </a>

            {/* list */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {POSTS.map((p, i) => {
                const isExternal = p.href.startsWith("mailto:");
                const content = (
                  <>
                    <div style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "4/3", position: "relative", background: p.bg }}>
                      <ImagePlaceholder label="THUMB" onDark={p.onDark} />
                    </div>
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          fontFamily: MONO,
                          fontSize: 10.5,
                          letterSpacing: ".12em",
                          color: "#44424d",
                          background: "#f1f2f6",
                          padding: "6px 10px",
                          borderRadius: 4,
                        }}
                      >
                        {p.tag}
                      </span>
                      <h3 style={{ fontWeight: 500, fontSize: 21, lineHeight: 1.25, letterSpacing: "-.01em", margin: "10px 0 6px" }}>
                        {p.title}
                      </h3>
                      <p style={{ fontSize: 14, lineHeight: 1.5, color: "#6b6875", margin: 0 }}>{p.body}</p>
                    </div>
                  </>
                );
                const style: React.CSSProperties = {
                  textDecoration: "none",
                  color: "var(--ink)",
                  display: "grid",
                  gridTemplateColumns: "150px 1fr",
                  gap: 20,
                  padding: i === 0 ? "0 0 26px" : i === POSTS.length - 1 ? "26px 0 0" : "26px 0",
                  borderBottom: i < POSTS.length - 1 ? "1px solid rgba(14,13,18,.1)" : "none",
                };
                return isExternal ? (
                  <a key={p.title} href={p.href} className="blog-link" style={style}>
                    {content}
                  </a>
                ) : (
                  <Link key={p.title} href={p.href} className="blog-link" style={style}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>

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
