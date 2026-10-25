"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { POSTS, type Post } from "@/lib/blog/posts";
import { Shell, CtaBand, PageHero } from "./Shell";
import s from "./site.module.css";

type Lang = "en" | "es";

function Meta({ post, lang, author }: { post: Post; lang: Lang; author?: boolean }) {
  return (
    <div className={s.meta}>
      {author && <span style={{ color: "var(--ink)" }}>{post.author[lang]}</span>}
      <span>{post.dateLabel[lang]}</span>
      <span>{post.readMins} {lang === "es" ? "min de lectura" : "min read"}</span>
    </div>
  );
}

export function PostCard({ post, lang, featured = false }: { post: Post; lang: Lang; featured?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className={`${s.post} ${featured ? s.featured : ""}`} prefetch={false}>
      <div className={s.postMedia} style={{ background: post.bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading={featured ? undefined : "lazy"} decoding="async" src={featured ? post.cover : post.coverCard ?? post.cover} width={800} height={500} alt="" />
      </div>
      <div className={s.postBody}>
        <span className={s.label}>{post.tag[lang]}</span>
        {featured ? <h2>{post.title[lang]}</h2> : <h3>{post.title[lang]}</h3>}
        <p>{post.excerpt[lang]}</p>
        <Meta post={post} lang={lang} author={featured} />
      </div>
    </Link>
  );
}

export function BlogPage() {
  const { lang } = useLang();
  const es = lang === "es";
  const [filter, setFilter] = React.useState<string>("all");
  const tags = React.useMemo(() => {
    const seen = new Map<string, Post["tag"]>();
    for (const p of POSTS) if (!seen.has(p.tag.en)) seen.set(p.tag.en, p.tag);
    return Array.from(seen.entries());
  }, []);
  const visible = filter === "all" ? POSTS : POSTS.filter((p) => p.tag.en === filter);
  const featured = filter === "all" ? visible[0] : null;
  const list = featured ? visible.slice(1) : visible;
  return (
    <Shell active="blog">
      <PageHero label="Blog" tint="#e3f1fb" mark={es ? "laboratorio" : "lab"} title={es ? "Notas desde el laboratorio" : "Notes from the lab"} lead={es ? "Sobre agentes de IA, ingeniería y cómo construimos software en el que la gente confía." : "On AI agents, engineering, and how we build software people trust."}>
        <div className={s.filters} role="group" aria-label={es ? "Filtrar por tema" : "Filter by topic"}>
          <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>{es ? "Todo" : "All"}</button>
          {tags.map(([key, tag]) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>{tag[lang]}</button>
          ))}
        </div>
      </PageHero>
      <section className={s.wrap} style={{ paddingTop: 48 }}>
        <div className={s.postGrid}>
          {featured && <PostCard post={featured} lang={lang} featured />}
          {list.map((p) => <PostCard key={p.slug} post={p} lang={lang} />)}
          {!featured && list.length === 0 && <p className={s.sub}>{es ? "Todavía no hay notas en este tema." : "No posts in this topic yet."}</p>}
        </div>
      </section>
      <div style={{ height: 140 }} />
      <CtaBand />
    </Shell>
  );
}
