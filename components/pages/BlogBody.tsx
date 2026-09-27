"use client";

import * as React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { useLang } from "@/components/i18n";
import { POSTS, type Post } from "@/lib/blog/posts";

/* Blog index: short header with tag filters, the latest post featured
   (image left / copy right), then a card grid of the rest. Filtering is
   client-side on the English tag key; the active filter is plain state. */

type Lang = "en" | "es";

function Meta({ post, lang }: { post: Post; lang: Lang }) {
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

function Card({ post, lang }: { post: Post; lang: Lang }) {
  return (
    <Link href={`/blog/${post.slug}`} className="blog-card" prefetch={false}>
      <div className="blog-media" style={{ background: post.bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" decoding="async" src={post.coverCard ?? post.cover} width={800} height={500} alt="" />
      </div>
      <span className="blog-tag" style={{ display: "inline-block", marginTop: 18 }}>
        {post.tag[lang]}
      </span>
      <h2 className="blog-card-title">{post.title[lang]}</h2>
      <p className="blog-excerpt blog-clamp-2">{post.excerpt[lang]}</p>
      <Meta post={post} lang={lang} />
    </Link>
  );
}

export function BlogBody() {
  const { lang } = useLang();
  const es = lang === "es";
  const [filter, setFilter] = React.useState<string>("all");

  // unique tags in post order (English key, localized label)
  const tags = React.useMemo(() => {
    const seen = new Map<string, Post["tag"]>();
    for (const p of POSTS) if (!seen.has(p.tag.en)) seen.set(p.tag.en, p.tag);
    return Array.from(seen.entries());
  }, []);

  const visible = filter === "all" ? POSTS : POSTS.filter((p) => p.tag.en === filter);
  const featured = filter === "all" ? visible[0] : null;
  const list = featured ? visible.slice(1) : visible;

  return (
    <div style={{ position: "relative", width: "100%", overflow: "clip", background: "#fff" }}>
      <SiteHeader active="blog" megaMenus />
      <main>
        <section style={{ background: "#fff", padding: "72px 0 0" }}>
          <div className="pad-x" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
            <div className="blog-head">
              <div>
                <h1
                  style={{
                    fontWeight: 500,
                    fontSize: "clamp(44px,5vw,76px)",
                    lineHeight: 1,
                    letterSpacing: "-.03em",
                    margin: 0,
                    color: "var(--ink)",
                  }}
                >
                  Blog
                </h1>
                <p style={{ fontSize: 18, lineHeight: 1.55, color: "#5d5b66", maxWidth: 480, margin: "18px 0 0" }}>
                  {es
                    ? "Notas sobre agentes de IA, ingeniería y cómo construimos software en el que la gente confía."
                    : "Notes on AI agents, engineering, and how we build software people trust."}
                </p>
              </div>
              <div className="blog-filters" role="group" aria-label={es ? "Filtrar por tema" : "Filter by topic"}>
                <button
                  type="button"
                  className="blog-filter"
                  aria-pressed={filter === "all"}
                  onClick={() => setFilter("all")}
                >
                  {es ? "TODO" : "ALL"}
                </button>
                {tags.map(([key, tag]) => (
                  <button
                    key={key}
                    type="button"
                    className="blog-filter"
                    aria-pressed={filter === key}
                    onClick={() => setFilter(key)}
                  >
                    {tag[lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: "#fff", padding: "56px 0 110px" }}>
          <div className="pad-x" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="blog-card blog-featured">
                <div className="blog-media" style={{ background: featured.bg }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img decoding="async" src={featured.cover} width={1600} height={1000} alt="" />
                </div>
                <div>
                  <span className="blog-tag blog-tag--accent">{featured.tag[lang]}</span>
                  <h2 className="blog-card-title">{featured.title[lang]}</h2>
                  <p className="blog-excerpt">{featured.excerpt[lang]}</p>
                  <div className="blog-meta">
                    <span style={{ color: "var(--ink)" }}>{featured.author[lang]}</span>
                    <i aria-hidden />
                    <span>{featured.dateLabel[lang]}</span>
                    <i aria-hidden />
                    <span>
                      {featured.readMins} {es ? "min de lectura" : "min read"}
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {list.length > 0 ? (
              <div
                className="blog-grid"
                style={
                  featured
                    ? { marginTop: 72, paddingTop: 56, borderTop: "1px solid rgba(14,13,18,.1)" }
                    : undefined
                }
              >
                {list.map((p) => (
                  <Card key={p.slug} post={p} lang={lang} />
                ))}
              </div>
            ) : (
              !featured && (
                <div className="blog-empty">{es ? "Todavía no hay notas en este tema." : "No posts in this topic yet."}</div>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
