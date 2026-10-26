import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CASES } from "@/lib/site/cases";
import { CbCase } from "@/components/concepts/CerebriumDetail";

export const dynamicParams = false;

export function generateStaticParams() {
  return CASES.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = CASES.find((x) => x.id === slug);
  return c ? { title: "MindfulTech", description: c.title.en } : {};
}

export default async function CaseRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!CASES.some((c) => c.id === slug)) notFound();
  return <CbCase slug={slug} />;
}
