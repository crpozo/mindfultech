import type { Metadata } from "next";
import { CbService } from "@/components/concepts/CerebriumDetail";

const META: Record<string, { name: string; desc: string }> = {
  ux: { name: "UX Design", desc: "Research-driven product design." },
  apps: { name: "Web & Mobile Apps", desc: "Scalable platforms on modern stacks." },
  custom: { name: "Custom Software", desc: "Software shaped around your workflows." },
  ai: { name: "AI & Automation", desc: "Grounded, human-reviewed AI." },
  security: { name: "Cybersecurity", desc: "Assessments, hardening and monitoring for apps, cloud and AI systems." },
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
