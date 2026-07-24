"use client";

import * as React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { useLang } from "@/components/i18n";
import { getPost, relatedPosts, type Post, type Block } from "@/lib/blog/posts";

const MONO = "var(--mono)";

function openForm(e: React.MouseEvent) {
  e.preventDefault();
  window.dispatchEvent(new CustomEvent("mt:open-form"));
}

export function ArticleBody({ slug }: { slug: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const post = getPost(slug);

  if (!post) {
    return (
      <div style={{ background: "#fff", minHeight: "100vh" }}>
        <SiteHeader active="blog" megaMenus />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "120px 40px", textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 500 }}>{es ? "Artículo no encontrado" : "Article not found"}</h1>
          <Link href="/blog" style={{ color: "var(--accent-deep)" }}>
            {es ? "← Volver al blog" : "← Back to the blog"}
          </Link>
        </div>
      </div>
    );
  }

  const related = relatedPosts(slug, 2);

  return (
    <div style={{ position: "relative", width: "100%", overflow: "clip", background: "#fff" }}>
      <SiteHeader active="blog" megaMenus />

      <article style={{ background: "#fff" }}>
        {/* header */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "44px 40px 0" }}>
          <Link
            href="/blog"
            className="blog-link"
            style={{
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: ".08em",
              color: "#6b6875",
              textDecoration: "none",
            }}
          >
            {es ? "← Blog" : "← Blog"}
          </Link>

          <div style={{ marginTop: 26 }}>
            <span
              style={{
                display: "inline-block",
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: ".14em",
                color: "#44424d",
                background: "#f1f2f6",
                padding: "6px 11px",
                borderRadius: 4,
              }}
            >
              {post.tag[lang]}
            </span>
          </div>

          <h1
            style={{
              fontWeight: 500,
              fontSize: "clamp(30px,3.6vw,50px)",
              lineHeight: 1.1,
              letterSpacing: "-.02em",
              margin: "18px 0 0",
              color: "var(--ink)",
            }}
          >
            {post.title[lang]}
          </h1>

          <p style={{ fontSize: 19, lineHeight: 1.5, color: "#54525c", margin: "18px 0 0" }}>{post.excerpt[lang]}</p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              margin: "22px 0 0",
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: ".04em",
              color: "#6b6875",
            }}
          >
            <span style={{ color: "var(--ink)", fontWeight: 500 }}>{post.author[lang]}</span>
            <span aria-hidden>·</span>
            <span>{post.dateLabel[lang]}</span>
            <span aria-hidden>·</span>
            <span>
              {post.readMins} {es ? "min de lectura" : "min read"}
            </span>
          </div>
        </div>

        {/* cover */}
        <div style={{ maxWidth: 900, margin: "34px auto 0", padding: "0 40px" }}>
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              aspectRatio: "16/9",
              position: "relative",
              background: post.bg,
              border: "1px solid rgba(14,13,18,.06)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover}
              alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* body */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "44px 40px 20px" }}>
          {post.body.map((b, i) => (
            <BlockView key={i} block={b} lang={lang} />
          ))}
        </div>

        {/* inline CTA */}
        <div style={{ maxWidth: 720, margin: "10px auto 0", padding: "0 40px" }}>
          <div
            style={{
              borderRadius: 14,
              background: "linear-gradient(140deg,#f3f6fb,#eaf0f8)",
              border: "1px solid rgba(14,13,18,.07)",
              padding: "26px 28px",
              display: "flex",
              gap: 18,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 500, color: "var(--ink)" }}>
                {es ? "¿Un proyecto en mente?" : "Have a project in mind?"}
              </div>
              <div style={{ fontSize: 14.5, color: "#6b6875", marginTop: 4 }}>
                {es ? "Cuéntanos qué quieres construir." : "Tell us what you want to build."}
              </div>
            </div>
            <a
              href="#contact"
              onClick={openForm}
              style={{
                textDecoration: "none",
                fontFamily: MONO,
                fontSize: 12.5,
                fontWeight: 600,
                letterSpacing: ".1em",
                background: "#0e0d12",
                color: "#fff",
                padding: "13px 22px",
                borderRadius: 7,
                whiteSpace: "nowrap",
              }}
            >
              {es ? "EMPIEZA A CONSTRUIR" : "START BUILDING"}
            </a>
          </div>
        </div>

        {/* related */}
        {related.length > 0 && (
          <div style={{ maxWidth: 900, margin: "56px auto 0", padding: "0 40px 90px" }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: ".16em",
                color: "#8b8896",
                textTransform: "uppercase",
                borderTop: "1px solid rgba(14,13,18,.1)",
                paddingTop: 26,
                marginBottom: 20,
              }}
            >
              {es ? "Sigue leyendo" : "Keep reading"}
            </div>
            <div className="stack-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {related.map((r) => (
                <RelatedCard key={r.slug} post={r} lang={lang} />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

function BlockView({ block, lang }: { block: Block; lang: "en" | "es" }) {
  if (block.t === "h2")
    return (
      <h2
        style={{
          fontWeight: 500,
          fontSize: 25,
          lineHeight: 1.25,
          letterSpacing: "-.015em",
          color: "var(--ink)",
          margin: "38px 0 0",
        }}
      >
        {block[lang]}
      </h2>
    );
  if (block.t === "quote")
    return (
      <blockquote
        style={{
          margin: "34px 0 0",
          padding: "6px 0 6px 22px",
          borderLeft: "3px solid var(--accent)",
          fontSize: 22,
          lineHeight: 1.4,
          fontWeight: 500,
          letterSpacing: "-.01em",
          color: "var(--ink)",
        }}
      >
        {block[lang]}
      </blockquote>
    );
  if (block.t === "ul")
    return (
      <ul style={{ margin: "18px 0 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
        {block[lang].map((item, i) => (
          <li key={i} style={{ position: "relative", paddingLeft: 26, fontSize: 17.5, lineHeight: 1.55, color: "#3a3843" }}>
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 4,
                top: 10,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
            {item}
          </li>
        ))}
      </ul>
    );
  return (
    <p style={{ fontSize: 18, lineHeight: 1.7, color: "#3a3843", margin: "18px 0 0" }}>{block[lang]}</p>
  );
}

function RelatedCard({ post, lang }: { post: Post; lang: "en" | "es" }) {
  return (
    <Link href={`/blog/${post.slug}`} className="blog-link" style={{ textDecoration: "none", color: "var(--ink)", display: "block" }}>
      <div style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "16/9", position: "relative", background: post.bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.cover} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: ".12em",
          color: "#6b6875",
          margin: "12px 0 6px",
        }}
      >
        {post.tag[lang]}
      </div>
      <div style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.28, letterSpacing: "-.01em" }}>{post.title[lang]}</div>
    </Link>
  );
}
