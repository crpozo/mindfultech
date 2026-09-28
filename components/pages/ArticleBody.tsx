"use client";

import * as React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { useLang } from "@/components/i18n";
import { getPost, relatedPosts, type Post, type Block } from "@/lib/blog/posts";

/* Article page: meta row, big title, lead, author row, full-width cover,
   700px reading measure (.blog-body in globals.css), related posts, dark CTA
   band linking to the homepage contact section. */

type Lang = "en" | "es";

// "Carlos Pozo · Founder" -> { name: "Carlos Pozo", role: "Founder", initials: "CP" }
function splitAuthor(label: string) {
  const [name, ...roleParts] = label.split(" · ");
  const role = roleParts.join(" · ");
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return { name, role, initials: initials || "MT" };
}

export function ArticleBody({ slug }: { slug: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const post = getPost(slug);

  if (!post) {
    return (
      <div style={{ background: "#fff", minHeight: "100vh" }}>
        <SiteHeader active="blog" megaMenus />
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "120px 40px", textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 500 }}>{es ? "Artículo no encontrado" : "Article not found"}</h1>
          <Link href="/blog" style={{ color: "var(--accent-deep)" }}>
            {es ? "Volver al blog" : "Back to the blog"}
          </Link>
        </main>
      </div>
    );
  }

  const related = relatedPosts(slug, 2);
  const author = splitAuthor(post.author[lang]);

  return (
    <div style={{ position: "relative", width: "100%", overflow: "clip", background: "#fff" }}>
      <SiteHeader active="blog" megaMenus />
      <main>
        <article style={{ background: "#fff" }}>
          {/* header */}
          <header className="blog-article-head">
            <Link href="/blog" className="blog-back">
              <span aria-hidden>&larr;</span> Blog
            </Link>

            <div className="blog-meta" style={{ marginTop: 40 }}>
              <span className="blog-tag blog-tag--accent">{post.tag[lang]}</span>
              <i aria-hidden />
              <span>{post.dateLabel[lang]}</span>
              <i aria-hidden />
              <span>
                {post.readMins} {es ? "min de lectura" : "min read"}
              </span>
            </div>

            <h1 className="blog-article-title">{post.title[lang]}</h1>
            <p className="blog-lead">{post.excerpt[lang]}</p>

            <div className="blog-author">
              <div className="blog-avatar" aria-hidden>
                {author.initials}
              </div>
              <div>
                <div className="blog-author-name">{author.name}</div>
                {author.role && <div className="blog-author-role">{author.role}</div>}
              </div>
            </div>
          </header>

          {/* cover */}
          <div className="blog-cover">
            <div className="blog-media" style={{ background: post.bg }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover} width={1600} height={900} alt="" fetchPriority="high" />
            </div>
          </div>

          {/* body */}
          <div className="blog-body">
            {post.body.map((b, i) => (
              <BlockView key={i} block={b} lang={lang} />
            ))}
          </div>

          {/* related */}
          {related.length > 0 && (
            <div className="blog-related">
              <div className="blog-related-head">
                <h2
                  style={{
                    fontWeight: 500,
                    fontSize: 24,
                    letterSpacing: "-.015em",
                    margin: 0,
                    color: "var(--ink)",
                  }}
                >
                  {es ? "Sigue leyendo" : "Keep reading"}
                </h2>
                <Link href="/blog" className="blog-back">
                  {es ? "Todas las notas" : "All posts"} <span aria-hidden>&rarr;</span>
                </Link>
              </div>
              <div className="blog-related-grid">
                {related.map((r) => (
                  <RelatedCard key={r.slug} post={r} lang={lang} />
                ))}
              </div>
            </div>
          )}
        </article>

        {/* CTA band */}
        <section className="blog-cta">
          <div className="blog-cta-inner">
            <div>
              <div className="blog-tag" style={{ color: "var(--accent)", marginBottom: 18 }}>
                {es ? "TRABAJEMOS JUNTOS" : "WORK WITH US"}
              </div>
              <h2>{es ? "Empieza un proyecto" : "Start a project"}</h2>
              <p>
                {es
                  ? "Cuéntanos qué quieres construir. Respondemos en un día hábil con una primera lectura y los siguientes pasos."
                  : "Tell us what you want to build. We reply within one business day with a first read and next steps."}
              </p>
            </div>
            <Link href="/#contact" className="blog-cta-btn">
              {es ? "EMPEZAR UN PROYECTO" : "START A PROJECT"}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

// Body blocks. Bare site paths such as "/office-demo/" inside a paragraph
// become links so posts can point at site pages without a new block type.
// (No lookbehind: the leading boundary is captured and re-emitted.)
const PATH_RE = /(^|[\s(])(\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\/?)(?=[\s.,;:)]|$)/g;

function linkify(text: string): React.ReactNode {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  PATH_RE.lastIndex = 0;
  while ((m = PATH_RE.exec(text))) {
    const start = m.index + m[1].length;
    out.push(text.slice(last, start));
    out.push(
      <Link key={start} href={m[2]}>
        {m[2]}
      </Link>
    );
    last = start + m[2].length;
  }
  if (last === 0) return text;
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function BlockView({ block, lang }: { block: Block; lang: Lang }) {
  if (block.t === "h2") return <h2>{block[lang]}</h2>;
  if (block.t === "quote") return <blockquote>{block[lang]}</blockquote>;
  if (block.t === "ul")
    return (
      <ul>
        {block[lang].map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  return <p>{linkify(block[lang])}</p>;
}

function RelatedCard({ post, lang }: { post: Post; lang: Lang }) {
  return (
    <Link href={`/blog/${post.slug}`} className="blog-card" prefetch={false}>
      <div className="blog-media" style={{ background: post.bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" decoding="async" src={post.coverCard ?? post.cover} width={800} height={500} alt="" />
      </div>
      <span className="blog-tag" style={{ display: "inline-block", marginTop: 18 }}>
        {post.tag[lang]}
      </span>
      <h3 className="blog-card-title">{post.title[lang]}</h3>
      <div className="blog-meta">
        <span>{post.dateLabel[lang]}</span>
        <i aria-hidden />
        <span>
          {post.readMins} {lang === "es" ? "min de lectura" : "min read"}
        </span>
      </div>
    </Link>
  );
}
