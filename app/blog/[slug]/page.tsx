import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/pages/ArticleBody";
import { POSTS, getPost } from "@/lib/blog/posts";

// static export: only the known slugs exist; anything else is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Blog · MindfulTech" };
  return {
    title: `${post.title.en} · MindfulTech`,
    description: post.excerpt.en,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getPost(slug)) notFound();
  return <ArticleBody slug={slug} />;
}
