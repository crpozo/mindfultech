import type { Metadata } from "next";
import { CbService } from "@/components/concepts/CerebriumDetail";

const META: Record<string, { name: string; desc: string }> = {
  security: { name: "Cybersecurity", desc: "Assessments, hardening and monitoring for apps, cloud and AI systems." },
  discovery: { name: "Workshops & Requirements Mapping", desc: "Facilitated workshops that turn a need into mapped processes and buildable requirements." },
  custom: { name: "Custom Software", desc: "Software shaped around your workflows." },
  ai: { name: "AI & Automation", desc: "Grounded, human-reviewed AI." },
};

export function generateStaticParams() {
  return Object.keys(META).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = META[slug];
  return { title: "MindfulTech", description: m?.desc };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CbService slug={slug} />;
}
