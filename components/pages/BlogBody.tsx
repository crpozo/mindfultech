"use client";

import * as React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Pill } from "@/components/internal/Shared";
import { useLang } from "@/components/i18n";
import { POSTS } from "@/lib/blog/posts";

const MONO = "var(--mono)";

export function BlogBody() {
  const { lang } = useLang();
  const es = lang === "es";
  const featured = POSTS[0];
  const list = POSTS.slice(1);

  return (
    <div style={{ position: "relative", width: "100%", overflow: "clip", background: "#fff" }}>
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
            {es ? "Novedades en MindfulTech" : "What's new at MindfulTech"}
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: "#6b6875", maxWidth: 520, margin: "20px auto 0" }}>
            {es
              ? "Notas sobre investigación, ingeniería y cómo construir IA confiable."
              : "Notes on research, engineering, and building AI people can trust."}
          </p>
        </div>
      </section>

      <section id="featured" style={{ background: "#fff", padding: "50px 0 90px" }}>
        <div className="pad-x" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div
            className="stack-2"
            style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "clamp(30px,4vw,64px)", alignItems: "start" }}
          >
            {/* featured */}
            <Link href={`/blog/${featured.slug}`} className="blog-link" style={{ textDecoration: "none", color: "var(--ink)", display: "block" }}>
              <div
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  aspectRatio: "16/10",
                  position: "relative",
                  background: featured.bg,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured.cover} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
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
                {featured.tag[lang]}
              </span>
              <h2 style={{ fontWeight: 500, fontSize: "clamp(24px,2.4vw,34px)", lineHeight: 1.2, letterSpacing: "-.015em", margin: "14px 0 10px" }}>
                {featured.title[lang]}
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.55, color: "#6b6875", margin: 0, maxWidth: 560 }}>{featured.excerpt[lang]}</p>
            </Link>

            {/* list */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {list.map((p, i) => {
                const style: React.CSSProperties = {
                  textDecoration: "none",
                  color: "var(--ink)",
                  padding: i === 0 ? "0 0 26px" : i === list.length - 1 ? "26px 0 0" : "26px 0",
                  borderBottom: i < list.length - 1 ? "1px solid rgba(14,13,18,.1)" : "none",
                };
                return (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-link news-row" style={style}>
                    <div className="news-thumb" style={{ background: p.bg }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.cover} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
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
                        {p.tag[lang]}
                      </span>
                      <h3 style={{ fontWeight: 500, fontSize: 21, lineHeight: 1.25, letterSpacing: "-.01em", margin: "10px 0 6px" }}>
                        {p.title[lang]}
                      </h3>
                      <p style={{ fontSize: 14, lineHeight: 1.5, color: "#6b6875", margin: 0 }}>{p.excerpt[lang]}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
