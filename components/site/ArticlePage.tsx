"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { getPost, relatedPosts, type Block } from "@/lib/blog/posts";
import { Shell, CtaBand } from "./Shell";
import { PostCard } from "./BlogPage";
import s from "./site.module.css";

type Lang = "en" | "es";

function splitAuthor(label: string) {
  const [name, ...roleParts] = label.split(" · ");
  const role = roleParts.join(" / ");
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  return { name, role, initials: initials || "MT" };
}

const PATH_RE = /(^|[\s(])(\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\/?)(?=[\s.,;:)]|$)/g;
function linkify(text: string): React.ReactNode {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  PATH_RE.lastIndex = 0;
  while ((m = PATH_RE.exec(text))) {
    const start = m.index + m[1].length;
    out.push(text.slice(last, start));
    out.push(<Link key={start} href={m[2]}>{m[2]}</Link>);
    last = start + m[2].length;
  }
  if (last === 0) return text;
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function BlockView({ block, lang }: { block: Block; lang: Lang }) {
  if (block.t === "h2") return <h2>{block[lang]}</h2>;
  if (block.t === "quote") return <blockquote>{block[lang]}</blockquote>;
  if (block.t === "ul") return <ul>{block[lang].map((item, i) => <li key={i}>{item}</li>)}</ul>;
  return <p>{linkify(block[lang])}</p>;
}

export function ArticlePage({ slug }: { slug: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const post = getPost(slug);
  if (!post) {
    return (
      <Shell active="blog">
        <section className={s.article} style={{ padding: "120px 40px", textAlign: "center" }}>
          <h1 className={s.h2}>{es ? "Artículo no encontrado" : "Article not found"}</h1>
          <p style={{ marginTop: 16 }}><Link href="/blog" className={s.backLink}>← Blog</Link></p>
        </section>
      </Shell>
    );
  }
  const related = relatedPosts(slug, 2);
  const author = splitAuthor(post.author[lang]);
  return (
    <Shell active="blog">
      <article>
        <header className={`${s.article} ${s.articleHead}`}>
          <Link href="/blog" className={s.backLink}>← Blog</Link>
          <div className={s.meta} style={{ marginTop: 0 }}>
            <span style={{ color: "var(--dgreen)" }}>{post.tag[lang]}</span>
            <span>{post.dateLabel[lang]}</span>
            <span>{post.readMins} {es ? "min de lectura" : "min read"}</span>
          </div>
          <h1>{post.title[lang]}</h1>
          <p className={s.lead}>{post.excerpt[lang]}</p>
          <div className={s.author}>
            <i aria-hidden>{author.initials}</i>
            <div><b>{author.name}</b>{author.role && <small>{author.role}</small>}</div>
          </div>
        </header>
        <div className={s.cover}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover} width={1600} height={900} alt="" fetchPriority="high" style={{ background: post.bg }} />
        </div>
        <div className={`${s.article} ${s.prose}`}>
          {post.body.map((b, i) => <BlockView key={i} block={b} lang={lang} />)}
        </div>
      </article>
      {related.length > 0 && (
        <section className={s.wrap} style={{ paddingTop: 40 }}>
          <div className={s.secHead}>
            <h2 className={s.h2} style={{ fontSize: "clamp(32px,4vw,52px)" }}>{es ? "Sigue leyendo" : "Keep reading"}</h2>
            <Link href="/blog" className={s.backLink}>{es ? "Todas las notas →" : "All posts →"}</Link>
          </div>
          <div className={s.postGrid}>{related.map((r) => <PostCard key={r.slug} post={r} lang={lang} />)}</div>
        </section>
      )}
      <div style={{ height: 120 }} />
      <CtaBand title={es ? "Empieza un proyecto" : "Start a project"} sub={es ? "Cuéntanos qué quieres construir. Respondemos en un día hábil con una primera lectura y los siguientes pasos." : "Tell us what you want to build. We reply within one business day with a first read and next steps."} />
    </Shell>
  );
}
