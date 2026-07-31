"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "../i18n";
import { POSTS } from "@/lib/blog/posts";

const MONO = "var(--mono)";

/* Right-sized card variants (Lighthouse: uses-responsive-images). Las tarjetas
   se renderizan mucho más chicas que los originales, así que servimos copias a
   2× el ancho de tarjeta. Los originales en /art y /portfolio quedan intactos —
   las páginas del blog los siguen usando a tamaño completo. */
const CARD_VARIANTS: Record<string, { src: string; width: number; height: number }> = {
  "/art/ailab.webp": { src: "/news/ailab-card.webp", width: 1120, height: 700 },
  "/portfolio/eventflow-banner.webp": { src: "/news/eventflow-card.webp", width: 728, height: 416 },
  "/art/healthcare.webp": { src: "/news/healthcare-card.webp", width: 728, height: 410 },
  "/art/research.webp": { src: "/news/research-card.webp", width: 728, height: 546 },
};

// covers not in the map (a new post) fall back to the original at its usual size
function cardImg(cover: string) {
  return CARD_VARIANTS[cover] ?? { src: cover, width: 1200, height: 750 };
}

export function NewsGrid() {
  const { lang } = useLang();
  const es = lang === "es";
  const featured = POSTS[0];
  const side = POSTS.slice(1);
  const featuredImg = cardImg(featured.cover);

  return (
    <section id="news" style={{ position: "relative", background: "#fff", padding: "110px 0 90px" }}>
      <div className="pad-x" style={{ maxWidth: 1560, margin: "0 auto", padding: "0 48px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            marginBottom: 52,
          }}
        >
          <h2
            style={{
              fontWeight: 500,
              fontSize: "clamp(34px,3.6vw,56px)",
              letterSpacing: "-.02em",
              margin: 0,
              color: "var(--ink)",
            }}
          >
            {es ? "Novedades en MindfulTech" : "What's new at MindfulTech"}
          </h2>
          <Link
            href="/blog"
            className="btn-soft"
            style={{
              textDecoration: "none",
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: ".12em",
              background: "#eceded",
              color: "var(--ink)",
              padding: "14px 20px",
              borderRadius: 6,
            }}
          >
            {es ? "TODO EL BLOG" : "ALL BLOG POSTS"}
          </Link>
        </div>

        <div
          className="stack-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 1fr",
            gap: "clamp(30px,4vw,70px)",
            alignItems: "start",
          }}
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
              {/* below the fold — lazy, con dimensiones intrínsecas para evitar layout shift */}
              <img
                loading="lazy"
                decoding="async"
                src={featuredImg.src}
                width={featuredImg.width}
                height={featuredImg.height}
                alt=""
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
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
            <h3
              style={{
                fontWeight: 500,
                fontSize: "clamp(24px,2.4vw,34px)",
                lineHeight: 1.2,
                letterSpacing: "-.015em",
                margin: "14px 0 10px",
              }}
            >
              {featured.title[lang]}
            </h3>
            <p style={{ fontSize: 16, lineHeight: 1.55, color: "#6b6875", margin: 0, maxWidth: 560 }}>
              {featured.excerpt[lang]}
            </p>
          </Link>

          {/* side list */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {side.map((s, i) => {
              const img = cardImg(s.cover);
              return (
              <Link
                key={s.slug}
                href={`/blog/${s.slug}`}
                /* the featured post keeps its prefetch; these four fired four
                   more payload fetches right as the section scrolled in */
                prefetch={false}
                className="blog-link news-row"
                style={{
                  textDecoration: "none",
                  color: "var(--ink)",
                  padding: i === 0 ? "0 0 26px" : i === side.length - 1 ? "26px 0 0" : "26px 0",
                  borderBottom: i < side.length - 1 ? "1px solid rgba(14,13,18,.1)" : "none",
                }}
              >
                <div className="news-thumb" style={{ background: s.bg }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    loading="lazy"
                    decoding="async"
                    src={img.src}
                    width={img.width}
                    height={img.height}
                    alt=""
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
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
                    {s.tag[lang]}
                  </span>
                  <h4
                    style={{
                      fontWeight: 500,
                      fontSize: 21,
                      lineHeight: 1.25,
                      letterSpacing: "-.01em",
                      margin: "10px 0 6px",
                    }}
                  >
                    {s.title[lang]}
                  </h4>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: "#6b6875", margin: 0 }}>{s.excerpt[lang]}</p>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
