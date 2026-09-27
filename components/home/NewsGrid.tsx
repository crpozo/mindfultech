"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "../i18n";
import { POSTS, type Post } from "@/lib/blog/posts";

/* Homepage "What's new": one wide featured post, then a 3-up row of the next
   three. Cards use the right-sized `coverCard` copy when a post has one
   (Lighthouse: uses-responsive-images); the featured post uses the full cover. */

function Meta({ post, lang }: { post: Post; lang: "en" | "es" }) {
  return (
    <div className="blog-meta">
      <span>{post.dateLabel[lang]}</span>
      <i aria-hidden />
      <span>
        {post.readMins} {lang === "es" ? "min de lectura" : "min read"}
      </span>
    </div>
  );
}

export function NewsGrid() {
  const { lang } = useLang();
  const es = lang === "es";
  const featured = POSTS[0];
  const rest = POSTS.slice(1, 4);

  return (
    <section id="news" style={{ position: "relative", background: "#fff", padding: "var(--section-y) 0" }}>
      <div className="pad-x" style={{ maxWidth: 1560, margin: "0 auto", padding: "0 48px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            marginBottom: 48,
          }}
        >
          <div>
            <div className="blog-tag blog-tag--accent" style={{ marginBottom: 16 }}>
              {es ? "BLOG" : "BLOG"}
            </div>
            <h2
              style={{
                fontWeight: 500,
                fontSize: "clamp(34px,3.6vw,56px)",
                letterSpacing: "-.02em",
                lineHeight: 1.04,
                margin: 0,
                color: "var(--ink)",
              }}
            >
              {es ? "Novedades" : "What's new"}
            </h2>
          </div>
          <Link
            href="/blog"
            className="btn-soft"
            style={{
              textDecoration: "none",
              fontFamily: "var(--mono)",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: ".12em",
              background: "#eceded",
              color: "var(--ink)",
              padding: "14px 20px",
              borderRadius: 6,
            }}
          >
            {es ? "TODAS LAS NOTAS" : "ALL POSTS"}
          </Link>
        </div>

        {/* featured */}
        <Link href={`/blog/${featured.slug}`} className="news-card news-featured">
          <div className="blog-media" style={{ background: featured.bg }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img loading="lazy" decoding="async" src={featured.cover} width={1600} height={686} alt="" />
          </div>
          <div className="news-featured-copy">
            <div>
              <span className="blog-tag">{featured.tag[lang]}</span>
              <h3 className="blog-card-title">{featured.title[lang]}</h3>
            </div>
            <div>
              <p className="blog-excerpt blog-clamp-2">{featured.excerpt[lang]}</p>
              <div style={{ marginTop: 14 }}>
                <Meta post={featured} lang={lang} />
              </div>
            </div>
          </div>
        </Link>

        {/* next three */}
        <div className="news-grid">
          {rest.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              /* the featured post keeps its prefetch; these fired more payload
                 fetches right as the section scrolled in */
              prefetch={false}
              className="news-card"
            >
              <div className="blog-media" style={{ background: p.bg }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" decoding="async" src={p.coverCard ?? p.cover} width={800} height={500} alt="" />
              </div>
              <span className="blog-tag" style={{ display: "inline-block", marginTop: 18 }}>
                {p.tag[lang]}
              </span>
              <h3 className="blog-card-title">{p.title[lang]}</h3>
              <p className="blog-excerpt blog-clamp-2">{p.excerpt[lang]}</p>
              <Meta post={p} lang={lang} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
